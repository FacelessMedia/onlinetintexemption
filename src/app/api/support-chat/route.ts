import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getStateBySlug } from "@/data/states";
import { buildSupportInstructions } from "@/lib/support-knowledge-base";
import {
  containsRestrictedSupportOutput,
  detectPromptManipulation,
  detectSensitiveData,
  promptManipulationRefusal,
  sensitiveDataRefusal,
  SUPPORT_EMAIL,
  SUPPORT_PHONE_DISPLAY,
} from "@/lib/support-chat-guards";
import {
  checkRateLimit,
  clientSafetyIdentifier,
  getClientIp,
  isSameOriginRequest,
  readBoundedJson,
  RequestBodyError,
  securityConfigurationErrors,
  verifyBotChallenge,
} from "@/lib/request-security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const supportChatSchema = z.object({
  message: z.string().trim().min(1).max(500),
  stateSlug: z.string().trim().regex(/^[a-z0-9-]{2,60}$/).optional(),
  botToken: z.string().max(2_048).optional(),
}).strict();

interface OpenAIResponseBody {
  output_text?: string;
  output?: Array<{
    type?: string;
    content?: Array<{ type?: string; text?: string; refusal?: string }>;
  }>;
}

export async function POST(request: NextRequest) {
  if (process.env.NEXT_PUBLIC_SUPPORT_CHAT_ENABLED !== "true") {
    return NextResponse.json({ error: "Automated support is disabled." }, { status: 404 });
  }
  const securityErrors = securityConfigurationErrors("support");
  if (securityErrors.length > 0) {
    console.error("Support chat security configuration is incomplete:", securityErrors);
    return NextResponse.json(
      { error: humanHandoff("Automated support is temporarily unavailable.") },
      { status: 503 }
    );
  }
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const apiKey = process.env.OPENAI_API_KEY || "";
  const model = process.env.OPENAI_SUPPORT_MODEL?.trim() || "gpt-4.1-mini";
  if (!apiKey) {
    console.error("Support chat OpenAI configuration is incomplete");
    return NextResponse.json(
      { error: humanHandoff("Automated support is temporarily unavailable.") },
      { status: 503 }
    );
  }

  let rate: Awaited<ReturnType<typeof checkRateLimit>>;
  try {
    rate = await checkRateLimit(`support-chat:${getClientIp(request)}`, 12, 10 * 60);
  } catch {
    return NextResponse.json(
      { error: humanHandoff("Automated support is temporarily unavailable.") },
      { status: 503 }
    );
  }
  if (!rate.allowed) {
    return NextResponse.json(
      { error: humanHandoff("Chat limit reached. Please wait before trying again.") },
      { status: 429, headers: { "Retry-After": String(rate.retryAfter) } }
    );
  }

  let rawBody: unknown;
  try {
    rawBody = await readBoundedJson(request, 8 * 1024);
  } catch (error) {
    const status = error instanceof RequestBodyError ? error.status : 400;
    const message = status === 413
      ? "Request is too large."
      : status === 415
        ? "Content-Type must be application/json."
        : "Invalid request.";
    return NextResponse.json({ error: message }, { status });
  }
  const parsed = supportChatSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Messages must be between 1 and 500 characters." },
      { status: 400 }
    );
  }

  const { message, stateSlug, botToken } = parsed.data;
  if (!(await verifyBotChallenge(botToken, request))) {
    return NextResponse.json(
      { error: humanHandoff("Please complete the security check and try again.") },
      { status: 403 }
    );
  }
  if (detectSensitiveData(message)) {
    return NextResponse.json({ reply: sensitiveDataRefusal(), refused: true });
  }
  if (detectPromptManipulation(message)) {
    return NextResponse.json({
      reply: promptManipulationRefusal(),
      refused: true,
    });
  }

  try {
    if (await isModerationFlagged(apiKey, message)) {
      return NextResponse.json({
        reply: humanHandoff("I can only help with general tint-exemption support questions."),
        refused: true,
      });
    }

    const stateData = stateSlug ? getStateBySlug(stateSlug) : undefined;
    const state = stateData?.offered && stateData.price > 0
      ? { name: stateData.name, slug: stateData.slug, price: stateData.price }
      : null;
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        store: false,
        tools: [],
        max_output_tokens: 350,
        safety_identifier: clientSafetyIdentifier(request),
        instructions: buildSupportInstructions(state),
        // Client-provided history is deliberately not accepted. A caller must
        // never be able to forge prior assistant/system turns.
        input: [{ role: "user", content: message }],
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(20_000),
    });
    if (!response.ok) {
      console.error(`OpenAI Responses API failed status=${response.status}`);
      return NextResponse.json(
        { error: humanHandoff("Automated support is temporarily unavailable.") },
        { status: 502 }
      );
    }

    const responseBody = (await response.json()) as OpenAIResponseBody;
    const reply = extractOutputText(responseBody).trim().slice(0, 1_500);
    if (
      !reply ||
      containsRestrictedSupportOutput(reply) ||
      (await isModerationFlagged(apiKey, reply))
    ) {
      return NextResponse.json({
        reply: humanHandoff("I do not have an approved answer for that question."),
      });
    }
    return NextResponse.json(
      { reply },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch {
    console.error("Support chat provider request failed");
    return NextResponse.json(
      { error: humanHandoff("Automated support is temporarily unavailable.") },
      { status: 502 }
    );
  }
}

async function isModerationFlagged(apiKey: string, input: string): Promise<boolean> {
  const response = await fetch("https://api.openai.com/v1/moderations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: "omni-moderation-latest", input }),
    cache: "no-store",
    signal: AbortSignal.timeout(8_000),
  });
  if (!response.ok) {
    console.error(`OpenAI Moderation API failed status=${response.status}`);
    throw new Error("Moderation unavailable");
  }
  const body = (await response.json()) as { results?: Array<{ flagged?: boolean }> };
  return body.results?.some((result) => result.flagged === true) === true;
}

function extractOutputText(body: OpenAIResponseBody): string {
  if (typeof body.output_text === "string") return body.output_text;
  return (body.output || [])
    .filter((item) => item.type === "message")
    .flatMap((item) => item.content || [])
    .filter((content) => content.type === "output_text")
    .map((content) => content.text || "")
    .join("\n");
}

function humanHandoff(prefix: string): string {
  return `${prefix} Call ${SUPPORT_PHONE_DISPLAY} and ask for Tory, or email ${SUPPORT_EMAIL}.`;
}

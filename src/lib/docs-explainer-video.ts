const HEYGEN_EMBED_HOST = "app.heygen.com";
const HEYGEN_EMBED_PATH = /^\/embeds\/[A-Za-z0-9_-]{16,120}\/?$/;

export function validatedDocsExplainerVideoUrl(
  configuredUrl: string | undefined
): string | null {
  const value = configuredUrl?.trim();
  if (!value) return null;
  const beforeFragment = value.split("#", 1)[0];
  if (beforeFragment.includes("?")) return null;

  try {
    const url = new URL(value);
    if (
      url.protocol !== "https:" ||
      url.hostname !== HEYGEN_EMBED_HOST ||
      url.username ||
      url.password ||
      url.search ||
      !HEYGEN_EMBED_PATH.test(url.pathname)
    ) {
      return null;
    }
    url.hash = "";
    return url.toString();
  } catch {
    return null;
  }
}

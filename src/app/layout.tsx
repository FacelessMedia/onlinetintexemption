import type { Metadata } from "next";
import { PauseBanner } from "@/components/purchase-pause";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Chatbot } from "@/components/chatbot";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Medical Window Tint Exemption Online | Online Tint Exemption",
    template: "%s | Online Tint Exemption",
  },
  description:
    "State-specific education and secure intake for medical window tint exemption reviews coordinated with MyEyeRx and independent licensed clinicians.",
  metadataBase: new URL("https://www.onlinetintexemption.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.onlinetintexemption.com",
    siteName: "Online Tint Exemption",
    title: "Medical Window Tint Exemption Online | Online Tint Exemption",
    description:
      "State-specific education and secure intake for medical window tint exemption reviews coordinated with MyEyeRx and independent licensed clinicians.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <PauseBanner />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <Chatbot />
        </ThemeProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Chatbot } from "@/components/chatbot";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Medical Window Tint Exemption Online | Online Tint Exemption",
    template: "%s | Online Tint Exemption",
  },
  description:
    "Get your medical window tint exemption online. Licensed physicians, fast approval, all 50 states.",
  metadataBase: new URL("https://www.onlinetintexemption.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.onlinetintexemption.com",
    siteName: "Online Tint Exemption",
    title: "Medical Window Tint Exemption Online | Online Tint Exemption",
    description:
      "Get your medical window tint exemption online. Licensed physicians, fast approval, all 50 states.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <Chatbot />
        </ThemeProvider>
      </body>
    </html>
  );
}

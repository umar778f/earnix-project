import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
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
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://earnix-project.vercel.app"),
  title: "Earnix | Freelancer Income Management & Tax Preparation",
  description:
    "Financial recordkeeping and tax-ready reporting platform designed specifically for freelancers.",
  openGraph: {
    title: "Earnix | Freelancer Income Management & Tax Preparation",
    description:
      "Financial recordkeeping and tax-ready reporting platform designed specifically for freelancers.",
    url: "https://earnix-project.vercel.app",
    siteName: "Earnix",
    type: "website",
  },
  alternates: {
    canonical: "https://earnix-project.vercel.app",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

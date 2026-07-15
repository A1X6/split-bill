import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.splitza.app"),
  applicationName: "Splitza",
  title: {
    default: "Splitza — Split any bill in seconds",
    template: "%s · Splitza",
  },
  description:
    "Snap a photo of the receipt, assign items to friends, and everyone knows exactly what they owe — tax included. Free to use.",
  keywords: [
    "split bill",
    "bill splitting app",
    "receipt scanner",
    "split expenses with friends",
    "group expenses",
    "who owes what",
    "InstaPay",
    "Splitza",
  ],
  authors: [{ name: "Splitza" }],
  creator: "Splitza",
  category: "finance",
  // www is the canonical/primary domain (apex redirects to it).
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Splitza",
    title: "Splitza — Split any bill in seconds",
    description:
      "Snap a photo of the receipt, assign items to friends, and everyone knows exactly what they owe — tax included.",
    url: "https://www.splitza.app",
    locale: "en_US",
    // Image is supplied automatically by app/opengraph-image.tsx.
  },
  twitter: {
    card: "summary_large_image",
    title: "Splitza — Split any bill in seconds",
    description:
      "Snap a photo of the receipt, assign items to friends, and everyone knows exactly what they owe.",
    // Image is supplied automatically by app/twitter-image.tsx.
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  appleWebApp: {
    capable: true,
    title: "Splitza",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf8f2" },
    { media: "(prefers-color-scheme: dark)", color: "#1c1a17" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${bricolage.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}

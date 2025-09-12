import "./globals.css";

import type { Metadata } from "next";
import { Inter, Manrope, Nunito, Open_Sans, Poppins, Roboto_Slab, Space_Grotesk } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { cn } from "@/lib/utils";
import { Header, Footer } from "@/components/layout";

// const fontSans = Inter({
//   variable: "--font-sans",
//   subsets: ["latin"],
// });

const fontSans = Poppins({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const fontHeading = Nunito({
  variable: "--font-heading",
  subsets: ["latin"],
});

const fontGrotesk = Space_Grotesk({
  variable: "--font-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "NewsHub - Latest News & Blog Platform",
    template: "%s | NewsHub"
  },
  description: "Stay informed with breaking news, expert analysis, and thought-provoking articles from around the world. Your trusted source for reliable journalism.",
  keywords: ["news", "blog", "journalism", "breaking news", "analysis", "world news", "politics", "technology", "business"],
  authors: [{ name: "NewsHub Team" }],
  creator: "NewsHub",
  publisher: "NewsHub",
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
    title: "NewsHub - Latest News & Blog Platform",
    description: "Stay informed with breaking news, expert analysis, and thought-provoking articles from around the world.",
    siteName: "NewsHub",
  },
  twitter: {
    card: "summary_large_image",
    title: "NewsHub - Latest News & Blog Platform",
    description: "Stay informed with breaking news, expert analysis, and thought-provoking articles from around the world.",
    creator: "@newshub",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen font-sans antialiased",
          fontSans.variable,
          fontHeading.variable,
          fontGrotesk.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          <main className="flex-1 dark:bg-zinc-900 bg-white">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}

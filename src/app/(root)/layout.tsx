
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "NewsHub - Latest News & Blog Platform",
  description: "Stay informed with breaking news, expert analysis, and thought-provoking articles from around the world. Your trusted source for reliable journalism.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hotemin Meme Bank",
  description: "Upload, grab, and spread $HOTEMIN memes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Featurevisor with Next.js",
  description: "Featurevisor feature evaluation in a Next.js application",
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

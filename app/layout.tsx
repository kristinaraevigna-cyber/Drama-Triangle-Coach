import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Drama Triangle Coach",
  description: "Transform conflict into compassion",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
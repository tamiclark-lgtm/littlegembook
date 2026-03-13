import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Little Gem Books Cart MVP",
  description: "Touchscreen cart experience for creating personalized children's books"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Maweb Solutions – System",
  description: "Internt projektstyringssystem for Maweb Solutions",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="da">
      <body className="min-h-screen bg-gray-50 text-gray-900">{children}</body>
    </html>
  );
}

// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });

export const metadata: Metadata = {
  title: "ezRS Explorer",
  description: "Satellite remote sensing scene search and map viewer",
  icons: {
    icon: [{ url: "/ezrs-mark.png", type: "image/png" }],
    shortcut: ["/ezrs-mark.png"],
    apple: [{ url: "/ezrs-mark.png", type: "image/png" }]
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${inter.variable}`}>{children}</body>
    </html>
  );
}

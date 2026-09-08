import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import DemoBadge from "@/components/DemoBadge";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Armaf Attendance · Demo",
  description: "QR attendance prototype — demo only, nothing is stored.",
};

export const viewport: Viewport = {
  themeColor: "#f6f0e4",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} antialiased`}>
        {children}
        <DemoBadge />
      </body>
    </html>
  );
}

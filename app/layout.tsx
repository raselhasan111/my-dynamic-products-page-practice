import type { Metadata, Viewport } from "next";
import { Noto_Sans_Bengali } from "next/font/google";
import { business } from "@/config/business";
import RegisterSW from "@/components/RegisterSW";
import "./globals.css";

const bengali = Noto_Sans_Bengali({
  variable: "--font-bengali",
  subsets: ["bengali", "latin"],
});

export const metadata: Metadata = {
  title: `${business.name.bn} — আজকের বাজারদর`,
  description: `${business.name.bn} (${business.type.bn}) — আজকের পণ্যের দাম`,
  appleWebApp: { capable: true, title: business.name.bn, statusBarStyle: "default" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#15803d",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="bn" className={`${bengali.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        {children}
        <RegisterSW />
      </body>
    </html>
  );
}

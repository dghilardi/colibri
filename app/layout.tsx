import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { OfflineBanner } from "@/components/OfflineBanner";

const montserrat = Montserrat({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CO-LIBRÌ",
  description: "Comelit Corporate Library",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#1C1F28",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Often good for PWA to feel like native
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${montserrat.className} antialiased min-h-screen flex flex-col`}>
        <Providers>
            {children}
            <OfflineBanner />
        </Providers>
      </body>
    </html>
  );
}

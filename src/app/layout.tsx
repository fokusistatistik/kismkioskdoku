import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://kiosk.fokusistatistik.com"),
  title: "DOKU",
  description: "Tesis Erişim Kontrol Sistemi",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "DOKU",
  },
  openGraph: {
    title: "DOKU",
    description: "Tesis Erişim Kontrol Sistemi",
    url: "https://kiosk.fokusistatistik.com",
    siteName: "DOKU",
    images: [
      {
        url: "https://static.fokusistatistik.com/DOKU/logos/DOKU_FAVICON.png",
        width: 512,
        height: 512,
      },
    ],
    locale: "tr_TR",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

import InstallPrompt from "@/components/InstallPrompt";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-neutral-950 text-white min-h-screen selection:bg-blue-600/30`}
      >
        <InstallPrompt />
        <main className="min-h-screen relative overflow-hidden">
          {/* Background Gradients */}
          <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[100px]" />
          </div>
          {children}
        </main>
      </body>
    </html>
  );
}

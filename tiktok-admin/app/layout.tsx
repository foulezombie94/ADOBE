import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Sidebar from "@/components/Layout/Sidebar";
import TopBar from "@/components/Layout/TopBar";
import { Toaster } from "react-hot-toast";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
  display: 'swap',
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Digital Curator | Cockpit Admin",
  description: "TikTok Clone - Network Operations Center & Moderation Dashboard",
};

export const viewport: Viewport = {
  themeColor: "#0a0a0c",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans bg-background text-on-background antialiased h-screen overflow-hidden`}>
        <div className="flex h-full w-full">
          <Sidebar />
          <div className="flex flex-col flex-1 h-full min-w-0">
            <TopBar />
            <main className="flex-1 overflow-y-auto p-8 lg:p-10 custom-scrollbar">
              {children}
            </main>
          </div>
        </div>
        <Toaster 
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#121214',
              color: '#fff',
              border: '1px solid rgba(199,196,216,0.1)',
              borderRadius: '12px',
              fontSize: '12px'
            },
          }}
        />
      </body>
    </html>
  );
}

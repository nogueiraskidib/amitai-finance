import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Amitai Finance",
  description: "Painel Financeiro Interno da Agência Amitai",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} ${geistMono.variable} dark antialiased h-full`}>
      <body className="flex min-h-screen bg-brand-bg text-brand-text">
        <Sidebar />
        <main className="flex-1 w-full flex flex-col md:ml-0 overflow-x-hidden p-6 md:p-10">
          {children}
        </main>
      </body>
    </html>
  );
}

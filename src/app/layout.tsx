import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import { ToastProvider } from "@/components/toast-provider";
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
  metadataBase: new URL("https://adminpaneling.com"),
  title: "AdminPaneling | DavyG CRM",
  description: "A modern CRM for home-service businesses to manage leads, jobs, follow-ups, scheduling, and team visibility.",
  keywords: ["AdminPaneling", "DavyG CRM", "CRM", "home service CRM", "lead management", "job scheduling"],
  openGraph: {
    title: "AdminPaneling | DavyG CRM",
    description: "Manage leads, jobs, follow-ups, scheduling, and team visibility from one clean workspace.",
    url: "https://adminpaneling.com",
    siteName: "AdminPaneling",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AdminPaneling | DavyG CRM",
    description: "Manage leads, jobs, follow-ups, scheduling, and team visibility from one clean workspace.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
        <body className="min-h-full flex flex-col bg-[#0a0a0f] text-zinc-50">
          <ToastProvider>{children}</ToastProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

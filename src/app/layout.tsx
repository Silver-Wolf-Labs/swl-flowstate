import type { Metadata } from "next";
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
  title: "SW Personal | Mood-Adaptive Productivity Dashboard",
  description: "A mood-adaptive productivity dashboard that helps developers and creators stay in flow while coding. Built by Silver Wolf Labs.",
  keywords: ["productivity", "dashboard", "focus", "pomodoro", "developer tools", "flow state"],
  authors: [{ name: "Silver Wolf Labs" }],
  openGraph: {
    title: "SW Personal | Mood-Adaptive Productivity Dashboard",
    description: "Stay in flow while coding with mood-adaptive productivity tools",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground`}
      >
        {children}
      </body>
    </html>
  );
}

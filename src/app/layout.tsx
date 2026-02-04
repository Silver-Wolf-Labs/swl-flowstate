import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { DemoProvider } from "@/components/demo";
import { FloatingTourButton } from "@/components/ui";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FlowState | Mood-Adaptive Productivity Dashboard",
  description: "Enter your flow state with mood-adaptive productivity tools. Focus timer, lofi music, and real-time analytics to boost your productivity.",
  keywords: ["productivity", "dashboard", "focus", "pomodoro", "flow state", "lofi music", "developer tools"],
  authors: [{ name: "FlowState" }],
  openGraph: {
    title: "FlowState | Focus. Flow. Achieve.",
    description: "Enter your flow state with mood-adaptive productivity tools and lofi beats",
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
        <DemoProvider>
          {children}
          <FloatingTourButton />
        </DemoProvider>
      </body>
    </html>
  );
}

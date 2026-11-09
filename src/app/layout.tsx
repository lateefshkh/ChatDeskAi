// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
// Font import removed; using default system fonts
import "./globals.css";

// const inter = Inter({ subsets: ["latin"], variable: "--font-inter" }); // Font removed

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "ChatDesk AI Automation",
  description: "Website AI assistant and lead automation grounded in your business knowledge.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className="max-w-full">
      <body className="min-h-screen bg-background text-foreground antialiased font-sans max-w-full">
        {/* Skip Link */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-6 focus:py-3 focus:bg-primary focus:text-white focus:rounded-full focus:shadow-lg font-medium"
        >
          Skip to main content
        </a>
        
        <div id="main-content" className="max-w-full">
          {children}
        </div>
      </body>
    </html>
  );
}
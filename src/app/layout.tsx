import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import LayoutWrapper from "@/components/LayoutWrapper";

export const metadata: Metadata = {
  title: "9jaStock - Nigerian Stock Exchange Tracker",
  description: "Track Nigerian Stock Exchange (NGX) stocks, monitor market performance, and manage your watchlist with real-time data.",
  keywords: ["Nigerian stocks", "NGX", "stock tracker", "Nigeria", "investment", "market"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-[var(--background)] text-[var(--foreground)] font-sans transition-colors duration-300">
        <Providers>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </Providers>
      </body>
    </html>
  );
}

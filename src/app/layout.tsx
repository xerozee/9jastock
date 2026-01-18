import type { Metadata, Viewport } from "next";
import "./globals.css";
import "@/styles/premium.css";
import { Providers } from "@/components/Providers";
import LayoutWrapper from "@/components/LayoutWrapper";
import PWARegister from "@/components/PWARegister";
import InstallPrompt from "@/components/InstallPrompt";
import OfflineBanner from "@/components/ui/OfflineBanner";

export const metadata: Metadata = {
  title: "9jaStock - Nigerian Stock Exchange Tracker",
  description: "Track Nigerian Stock Exchange (NGX) stocks, monitor market performance, and manage your watchlist with real-time data.",
  keywords: ["Nigerian stocks", "NGX", "stock tracker", "Nigeria", "investment", "market"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "9jaStock",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#10b981",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme === 'light') {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="antialiased bg-[var(--background)] text-[var(--foreground)] font-sans transition-colors duration-300">
        <PWARegister />
        <Providers>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
          <InstallPrompt />
          <OfflineBanner />
        </Providers>
      </body>
    </html>
  );
}

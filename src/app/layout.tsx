import type { Metadata, Viewport } from "next";
import "./globals.css";
import "@/styles/premium.css";
import { Providers } from "@/components/Providers";
import LayoutWrapper from "@/components/LayoutWrapper";
import PWARegister from "@/components/PWARegister";
import InstallPrompt from "@/components/InstallPrompt";
import OfflineBanner from "@/components/ui/OfflineBanner";

export const metadata: Metadata = {
  title: "9jastock - Nigerian Stock Investment Companion",
  description: "Track Nigerian stocks, get AI-powered analysis, and build your portfolio. The smartest way to invest in Nigeria.",
  keywords: ["Nigerian stocks", "NGX", "stock tracker", "Nigeria", "investment", "market", "portfolio"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "9jastock",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
  openGraph: {
    title: "9jastock - Nigerian Stock Investment Companion",
    description: "Track Nigerian stocks, get AI-powered analysis, and build your portfolio.",
    url: "https://9jastock.com",
    siteName: "9jastock",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "9jastock",
    description: "The smartest way to invest in Nigeria",
  },
};

export const viewport: Viewport = {
  themeColor: "#008751",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
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

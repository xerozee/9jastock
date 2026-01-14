import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import { WatchlistProvider } from "@/lib/watchlistContext";

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
    <html lang="en">
      <body className="antialiased bg-gray-50 font-sans">
        <WatchlistProvider>
          <Header />
          <main className="min-h-screen">
            {children}
          </main>
          <footer className="bg-green-900 text-white py-8 mt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                      <span className="text-green-800 font-bold text-sm">9J</span>
                    </div>
                    <span className="text-lg font-bold">9jaStock</span>
                  </div>
                  <p className="text-green-200 text-sm">
                    Your trusted platform for tracking Nigerian Stock Exchange (NGX) stocks and market performance.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-4">Quick Links</h4>
                  <ul className="space-y-2 text-green-200 text-sm">
                    <li><a href="/" className="hover:text-white transition-colors">Dashboard</a></li>
                    <li><a href="/stocks" className="hover:text-white transition-colors">All Stocks</a></li>
                    <li><a href="/watchlist" className="hover:text-white transition-colors">Watchlist</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-4">Disclaimer</h4>
                  <p className="text-green-200 text-sm">
                    Data provided is for informational purposes only. Always do your own research before making investment decisions.
                  </p>
                </div>
              </div>
              <div className="border-t border-green-800 mt-8 pt-8 text-center text-green-200 text-sm">
                <p>&copy; {new Date().getFullYear()} 9jaStock. All rights reserved.</p>
              </div>
            </div>
          </footer>
        </WatchlistProvider>
      </body>
    </html>
  );
}

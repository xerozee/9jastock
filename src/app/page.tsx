import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import MarketOverview from '@/components/MarketOverview';
import StockCard from '@/components/StockCard';
import {
  getMarketSummary,
  getTopGainers,
  getTopLosers,
  getMostActive,
} from '@/lib/stockData';

export default function Dashboard() {
  const marketSummary = getMarketSummary();
  const topGainers = getTopGainers(4);
  const topLosers = getTopLosers(4);
  const mostActive = getMostActive(4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-700 to-green-600 rounded-2xl p-8 mb-8 text-white">
        <div className="max-w-2xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Welcome to 9jaStock
          </h1>
          <p className="text-green-100 text-lg mb-6">
            Track Nigerian Stock Exchange (NGX) stocks in real-time. Monitor market performance,
            discover opportunities, and build your watchlist.
          </p>
          <SearchBar />
        </div>
      </div>

      {/* Market Overview */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Market Overview</h2>
        <MarketOverview summary={marketSummary} />
      </section>

      {/* Top Gainers */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Top Gainers</h2>
          <Link
            href="/stocks?sort=gainers"
            className="flex items-center text-green-600 hover:text-green-700 font-medium transition-colors"
          >
            View all <ArrowRight size={18} className="ml-1" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {topGainers.map((stock) => (
            <StockCard key={stock.symbol} stock={stock} />
          ))}
        </div>
      </section>

      {/* Top Losers */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Top Losers</h2>
          <Link
            href="/stocks?sort=losers"
            className="flex items-center text-green-600 hover:text-green-700 font-medium transition-colors"
          >
            View all <ArrowRight size={18} className="ml-1" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {topLosers.map((stock) => (
            <StockCard key={stock.symbol} stock={stock} />
          ))}
        </div>
      </section>

      {/* Most Active */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Most Active</h2>
          <Link
            href="/stocks?sort=volume"
            className="flex items-center text-green-600 hover:text-green-700 font-medium transition-colors"
          >
            View all <ArrowRight size={18} className="ml-1" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {mostActive.map((stock) => (
            <StockCard key={stock.symbol} stock={stock} showDetails />
          ))}
        </div>
      </section>
    </div>
  );
}

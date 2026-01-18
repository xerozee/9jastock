'use client';

import Link from 'next/link';
import { 
  TrendingUp, 
  BarChart3, 
  Bookmark, 
  Newspaper, 
  Search,
  Bell,
  Briefcase,
  AlertCircle,
  Wifi,
  WifiOff
} from 'lucide-react';

type EmptyStateType = 
  | 'stocks' 
  | 'portfolio' 
  | 'watchlist' 
  | 'news' 
  | 'search' 
  | 'notifications'
  | 'error'
  | 'offline';

interface EmptyStateProps {
  type: EmptyStateType;
  title?: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

const emptyStateConfig: Record<EmptyStateType, {
  icon: React.ElementType;
  defaultTitle: string;
  defaultDescription: string;
  defaultActionLabel?: string;
  defaultActionHref?: string;
  iconColor: string;
  bgColor: string;
}> = {
  stocks: {
    icon: TrendingUp,
    defaultTitle: 'No stocks found',
    defaultDescription: 'We couldn\'t find any stocks matching your criteria. Try adjusting your filters.',
    defaultActionLabel: 'View All Stocks',
    defaultActionHref: '/stocks',
    iconColor: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
  },
  portfolio: {
    icon: Briefcase,
    defaultTitle: 'Your portfolio is empty',
    defaultDescription: 'Start building your investment portfolio by adding your first stock holdings.',
    defaultActionLabel: 'Add Holding',
    defaultActionHref: '/portfolio',
    iconColor: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
  },
  watchlist: {
    icon: Bookmark,
    defaultTitle: 'No stocks in watchlist',
    defaultDescription: 'Add stocks to your watchlist to track them easily and get price alerts.',
    defaultActionLabel: 'Browse Stocks',
    defaultActionHref: '/stocks',
    iconColor: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  news: {
    icon: Newspaper,
    defaultTitle: 'No news available',
    defaultDescription: 'Market news will appear here once available. Check back soon for the latest updates.',
    iconColor: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
  search: {
    icon: Search,
    defaultTitle: 'No results found',
    defaultDescription: 'Try searching with different keywords or check your spelling.',
    iconColor: 'text-slate-500',
    bgColor: 'bg-slate-500/10',
  },
  notifications: {
    icon: Bell,
    defaultTitle: 'No notifications',
    defaultDescription: 'You\'re all caught up! Price alerts and updates will appear here.',
    iconColor: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
  },
  error: {
    icon: AlertCircle,
    defaultTitle: 'Something went wrong',
    defaultDescription: 'We\'re having trouble loading this content. Please try again.',
    defaultActionLabel: 'Try Again',
    iconColor: 'text-red-500',
    bgColor: 'bg-red-500/10',
  },
  offline: {
    icon: WifiOff,
    defaultTitle: 'You\'re offline',
    defaultDescription: 'Connect to the internet to see the latest market data.',
    defaultActionLabel: 'Retry',
    iconColor: 'text-slate-500',
    bgColor: 'bg-slate-500/10',
  },
};

export default function EmptyState({
  type,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  const config = emptyStateConfig[type];
  const Icon = config.icon;

  const displayTitle = title || config.defaultTitle;
  const displayDescription = description || config.defaultDescription;
  const displayActionLabel = actionLabel || config.defaultActionLabel;
  const displayActionHref = actionHref || config.defaultActionHref;

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className={`w-16 h-16 rounded-full ${config.bgColor} flex items-center justify-center mb-4`}>
        <Icon className={`w-8 h-8 ${config.iconColor}`} />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {displayTitle}
      </h3>
      <p className="text-gray-500 dark:text-slate-400 max-w-sm mb-6">
        {displayDescription}
      </p>
      {(displayActionLabel && displayActionHref) && (
        <Link
          href={displayActionHref}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl transition-colors"
        >
          {displayActionLabel}
        </Link>
      )}
      {(displayActionLabel && onAction && !displayActionHref) && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl transition-colors"
        >
          {displayActionLabel}
        </button>
      )}
    </div>
  );
}

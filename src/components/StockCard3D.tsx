'use client';

import { useState } from 'react';
import { TrendingUp, TrendingDown, Building2, BarChart3, Volume2 } from 'lucide-react';
import { Stock } from '@/types/stock';

interface StockCard3DProps {
  stock: Stock;
  onAddToPortfolio?: () => void;
  onAddToWatchlist?: () => void;
}

export default function StockCard3D({ stock, onAddToPortfolio, onAddToWatchlist }: StockCard3DProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
  
  const isPositive = stock.changePercent >= 0;
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setMousePosition({ x, y });
  };

  const rotateX = isHovered ? (mousePosition.y - 0.5) * -15 : 0;
  const rotateY = isHovered ? (mousePosition.x - 0.5) * 15 : 0;

  const formatNumber = (num: number) => {
    if (num >= 1e12) return `₦${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `₦${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `₦${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `₦${(num / 1e3).toFixed(2)}K`;
    return `₦${num.toFixed(2)}`;
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  };

  const generateLogoColor = (symbol: string) => {
    const colors = [
      'from-emerald-500 to-teal-600',
      'from-blue-500 to-indigo-600',
      'from-purple-500 to-pink-600',
      'from-orange-500 to-red-600',
      'from-cyan-500 to-blue-600',
      'from-green-500 to-emerald-600',
      'from-violet-500 to-purple-600',
      'from-amber-500 to-orange-600',
    ];
    const index = symbol.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const handleTouchStart = () => setIsHovered(true);
  const handleTouchEnd = () => setTimeout(() => setIsHovered(false), 300);

  return (
    <div 
      className="perspective-1000"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="relative group transition-all duration-300 ease-out"
        style={{
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) ${isHovered ? 'translateZ(20px)' : ''}`,
          transformStyle: 'preserve-3d',
        }}
      >
        <div className={`
          relative overflow-hidden rounded-2xl p-4 md:p-5
          bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90
          backdrop-blur-xl border border-slate-700/50
          shadow-xl ${isHovered ? 'shadow-2xl shadow-emerald-500/10' : ''}
          transition-all duration-300 mobile-card
          active:scale-[0.98] touch-manipulation
        `}>
          <div 
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background: `radial-gradient(circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, rgba(16, 185, 129, 0.15) 0%, transparent 50%)`,
            }}
          />
          
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-500/30 to-transparent" />
          
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div 
                  className={`
                    relative w-12 h-12 rounded-xl bg-gradient-to-br ${generateLogoColor(stock.symbol)}
                    flex items-center justify-center shadow-lg
                    transform transition-transform duration-300
                    ${isHovered ? 'scale-110' : ''}
                  `}
                  style={{
                    transform: `translateZ(${isHovered ? '30px' : '0'})`,
                    boxShadow: isHovered ? '0 10px 40px -10px rgba(16, 185, 129, 0.3)' : '',
                  }}
                >
                  <span className="text-white font-bold text-sm">{getInitials(stock.name)}</span>
                  <div className="absolute inset-0 rounded-xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                
                <div>
                  <h3 className="font-bold text-white text-lg tracking-tight">{stock.symbol}</h3>
                  <p className="text-slate-400 text-xs truncate max-w-[120px]">{stock.name}</p>
                </div>
              </div>
              
              <div className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold
                ${isPositive 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }
                transform transition-all duration-300
                ${isHovered ? 'scale-105' : ''}
              `}
              style={{ transform: `translateZ(${isHovered ? '25px' : '0'})` }}
              >
                {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                <span>{isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%</span>
              </div>
            </div>
            
            <div 
              className="mb-4 transform transition-all duration-300"
              style={{ transform: `translateZ(${isHovered ? '20px' : '0'})` }}
            >
              <div className="text-3xl font-black text-white tracking-tight mb-1">
                ₦{stock.price.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className={`text-sm font-semibold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                {isPositive ? '+' : ''}₦{stock.change?.toFixed(2) || (stock.price * stock.changePercent / 100).toFixed(2)}
              </div>
            </div>
            
            <div 
              className="grid grid-cols-3 gap-2"
              style={{ transform: `translateZ(${isHovered ? '15px' : '0'})` }}
            >
              <div className="bg-slate-800/50 backdrop-blur rounded-xl p-2.5 border border-slate-700/50">
                <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
                  <BarChart3 size={10} />
                  <span>Market Cap</span>
                </div>
                <div className="text-white font-semibold text-sm">{formatNumber(stock.marketCap)}</div>
              </div>
              
              <div className="bg-slate-800/50 backdrop-blur rounded-xl p-2.5 border border-slate-700/50">
                <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
                  <Volume2 size={10} />
                  <span>Volume</span>
                </div>
                <div className="text-white font-semibold text-sm">{formatNumber(stock.volume)}</div>
              </div>
              
              <div className="bg-slate-800/50 backdrop-blur rounded-xl p-2.5 border border-slate-700/50">
                <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
                  <Building2 size={10} />
                  <span>Sector</span>
                </div>
                <div className="text-white font-semibold text-xs truncate">{stock.sector?.split(' ')[0] || 'N/A'}</div>
              </div>
            </div>
            
            <div 
              className={`
                flex gap-2 mt-4 transition-all duration-300
                ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
              `}
              style={{ transform: `translateZ(${isHovered ? '25px' : '0'})` }}
            >
              {onAddToPortfolio && (
                <button 
                  onClick={onAddToPortfolio}
                  className="flex-1 py-2 px-3 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/25"
                >
                  Add to Portfolio
                </button>
              )}
              {onAddToWatchlist && (
                <button 
                  onClick={onAddToWatchlist}
                  className="flex-1 py-2 px-3 bg-slate-700/50 hover:bg-slate-600/50 text-white text-xs font-bold rounded-xl border border-slate-600/50 transition-all"
                >
                  Watch
                </button>
              )}
            </div>
          </div>
          
          <div 
            className="absolute -bottom-20 -right-20 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"
            style={{ transform: `translateZ(-20px)` }}
          />
        </div>
      </div>
    </div>
  );
}

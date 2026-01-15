'use client';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon';
  className?: string;
}

export default function Logo({ size = 'md', variant = 'full', className = '' }: LogoProps) {
  const sizes = {
    sm: { icon: 28, text: 'text-lg' },
    md: { icon: 36, text: 'text-xl' },
    lg: { icon: 48, text: 'text-2xl' },
    xl: { icon: 64, text: 'text-4xl' },
  };

  const { icon: iconSize, text: textSize } = sizes[size];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-lg"
        >
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="50%" stopColor="#059669" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>
            <linearGradient id="chartGradient" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#34D399" />
              <stop offset="100%" stopColor="#6EE7B7" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="1" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          
          <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#logoGradient)" />
          
          <rect x="4" y="4" width="40" height="40" rx="10" fill="none" stroke="white" strokeOpacity="0.2" strokeWidth="1" />
          
          <path
            d="M10 32 L16 26 L22 30 L30 18 L38 22"
            stroke="url(#chartGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            filter="url(#glow)"
          />
          
          <circle cx="38" cy="22" r="3" fill="#6EE7B7" />
          
          <path
            d="M10 36 L16 30 L22 34 L30 22 L38 26"
            stroke="white"
            strokeOpacity="0.3"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          
          <text
            x="24"
            y="18"
            textAnchor="middle"
            fill="white"
            fontSize="11"
            fontWeight="800"
            fontFamily="system-ui, sans-serif"
          >
            9ja
          </text>
        </svg>
        
        <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse border-2 border-white dark:border-slate-800" />
      </div>
      
      {variant === 'full' && (
        <div className="flex flex-col leading-none">
          <span className={`${textSize} font-black tracking-tight text-gray-900 dark:text-white`}>
            9ja<span className="text-emerald-600 dark:text-emerald-400">Stock</span>
          </span>
          <span className="text-[10px] font-medium text-gray-500 dark:text-slate-400 tracking-wider uppercase">
            NGX Tracker
          </span>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';

interface Logo3DProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'full' | 'icon';
  animated?: boolean;
  className?: string;
  showDownload?: boolean;
}

export default function Logo3D({ 
  size = 'md', 
  variant = 'full', 
  animated = true,
  className = '',
  showDownload = false
}: Logo3DProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = '/assets/9jastock-logo.png';
    link.download = '9jastock-logo.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const sizes = {
    sm: { icon: 32, text: 'text-lg', subtitle: 'text-[8px]' },
    md: { icon: 40, text: 'text-xl', subtitle: 'text-[10px]' },
    lg: { icon: 52, text: 'text-2xl', subtitle: 'text-xs' },
    xl: { icon: 68, text: 'text-3xl', subtitle: 'text-sm' },
    '2xl': { icon: 88, text: 'text-4xl', subtitle: 'text-base' },
  };

  const { icon: iconSize, text: textSize, subtitle: subtitleSize } = sizes[size];

  return (
    <div 
      className={`flex items-center gap-3 select-none ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        className="relative logo-3d-container"
        style={{ 
          perspective: '1000px',
          perspectiveOrigin: 'center',
        }}
      >
        <div
          className={`logo-3d-cube transition-transform duration-500 ease-out ${
            animated ? 'animate-float' : ''
          }`}
          style={{
            transform: isHovered 
              ? 'rotateY(-15deg) rotateX(10deg) scale(1.1)' 
              : 'rotateY(0deg) rotateX(0deg) scale(1)',
            transformStyle: 'preserve-3d',
          }}
        >
          <svg
            width={iconSize}
            height={iconSize}
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="logo-3d-svg drop-shadow-2xl"
            style={{
              filter: isHovered 
                ? 'drop-shadow(0 8px 16px rgba(16, 185, 129, 0.4))' 
                : 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))',
            }}
          >
            <defs>
              <linearGradient id="logo3dGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10B981">
                  <animate 
                    attributeName="stop-color" 
                    values="#10B981;#34D399;#10B981" 
                    dur="3s" 
                    repeatCount="indefinite" 
                  />
                </stop>
                <stop offset="50%" stopColor="#059669" />
                <stop offset="100%" stopColor="#047857">
                  <animate 
                    attributeName="stop-color" 
                    values="#047857;#065f46;#047857" 
                    dur="3s" 
                    repeatCount="indefinite" 
                  />
                </stop>
              </linearGradient>
              <linearGradient id="logo3dChartGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#34D399" />
                <stop offset="100%" stopColor="#A7F3D0" />
              </linearGradient>
              <linearGradient id="logo3dSide" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#047857" />
                <stop offset="100%" stopColor="#064e3b" />
              </linearGradient>
              <filter id="logo3dGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="logo3dInnerShadow">
                <feOffset dx="0" dy="2" />
                <feGaussianBlur stdDeviation="1" result="offset-blur" />
                <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse" />
                <feFlood floodColor="black" floodOpacity="0.2" result="color" />
                <feComposite operator="in" in="color" in2="inverse" result="shadow" />
                <feComposite operator="over" in="shadow" in2="SourceGraphic" />
              </filter>
            </defs>
            
            <rect 
              x="2" y="2" 
              width="44" height="44" 
              rx="12" 
              fill="url(#logo3dGradient)"
              filter="url(#logo3dInnerShadow)"
            />
            
            <rect 
              x="4" y="4" 
              width="40" height="40" 
              rx="10" 
              fill="none" 
              stroke="white" 
              strokeOpacity="0.25" 
              strokeWidth="1.5" 
            />
            
            <rect 
              x="3" y="3" 
              width="42" height="8" 
              rx="10" 
              fill="white" 
              fillOpacity="0.15" 
            />
            
            <path
              d="M10 32 L16 26 L22 30 L30 18 L38 22"
              stroke="url(#logo3dChartGradient)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              filter="url(#logo3dGlow)"
              className="chart-line-animate"
            >
              <animate
                attributeName="stroke-dashoffset"
                from="100"
                to="0"
                dur="1.5s"
                fill="freeze"
                calcMode="spline"
                keySplines="0.4 0 0.2 1"
              />
              <animate
                attributeName="stroke-dasharray"
                from="0 100"
                to="100 0"
                dur="1.5s"
                fill="freeze"
                calcMode="spline"
                keySplines="0.4 0 0.2 1"
              />
            </path>
            
            <circle 
              cx="38" cy="22" r="4" 
              fill="#A7F3D0"
              className="pulse-dot"
            >
              <animate
                attributeName="r"
                values="4;5;4"
                dur="1.5s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="1;0.7;1"
                dur="1.5s"
                repeatCount="indefinite"
              />
            </circle>
            
            <path
              d="M10 36 L16 30 L22 34 L30 22 L38 26"
              stroke="white"
              strokeOpacity="0.2"
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
              fontSize="12"
              fontWeight="900"
              fontFamily="system-ui, -apple-system, sans-serif"
              style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
            >
              9ja
            </text>
          </svg>
          
          <div 
            className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-pulse shadow-lg"
            style={{
              boxShadow: '0 0 8px rgba(52, 211, 153, 0.8)',
            }}
          />
        </div>
      </div>
      
      {variant === 'full' && (
        <div className="flex flex-col leading-none">
          <span 
            className={`${textSize} font-black tracking-tight transition-all duration-300`}
            style={{
              background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: isHovered ? '0 0 20px rgba(255,255,255,0.3)' : 'none',
            }}
          >
            9ja
            <span 
              style={{
                background: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Stock
            </span>
          </span>
          <span className={`${subtitleSize} font-semibold text-emerald-300/80 tracking-widest uppercase mt-0.5`}>
            NGX Tracker
          </span>
        </div>
      )}
      
      {showDownload && (
        <button
          onClick={handleDownload}
          className="ml-2 p-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 transition-colors"
          title="Download Logo"
        >
          <Download className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

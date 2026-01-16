'use client';

import { useState, useEffect } from 'react';
import { Clock, Sun, Moon, Calendar } from 'lucide-react';

const MARKET_OPEN_HOUR = 10;
const MARKET_OPEN_MINUTE = 0;
const MARKET_CLOSE_HOUR = 14;
const MARKET_CLOSE_MINUTE = 30;

function getWATTime(): Date {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc + 3600000); // UTC+1 for WAT
}

function isWeekday(date: Date): boolean {
  const day = date.getDay();
  return day !== 0 && day !== 6;
}

function isMarketOpen(watTime: Date): boolean {
  if (!isWeekday(watTime)) return false;
  
  const hours = watTime.getHours();
  const minutes = watTime.getMinutes();
  const currentMinutes = hours * 60 + minutes;
  const openMinutes = MARKET_OPEN_HOUR * 60 + MARKET_OPEN_MINUTE;
  const closeMinutes = MARKET_CLOSE_HOUR * 60 + MARKET_CLOSE_MINUTE;
  
  return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
}

function getNextMarketOpen(watTime: Date): Date {
  const next = new Date(watTime);
  next.setHours(MARKET_OPEN_HOUR, MARKET_OPEN_MINUTE, 0, 0);
  
  const currentMinutes = watTime.getHours() * 60 + watTime.getMinutes();
  const openMinutes = MARKET_OPEN_HOUR * 60 + MARKET_OPEN_MINUTE;
  
  if (currentMinutes >= openMinutes || !isWeekday(watTime)) {
    next.setDate(next.getDate() + 1);
  }
  
  while (!isWeekday(next)) {
    next.setDate(next.getDate() + 1);
  }
  
  return next;
}

function getMarketClose(watTime: Date): Date {
  const close = new Date(watTime);
  close.setHours(MARKET_CLOSE_HOUR, MARKET_CLOSE_MINUTE, 0, 0);
  return close;
}

function formatCountdown(ms: number): { hours: string; minutes: string; seconds: string } {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  return {
    hours: hours.toString().padStart(2, '0'),
    minutes: minutes.toString().padStart(2, '0'),
    seconds: seconds.toString().padStart(2, '0'),
  };
}

function formatTime(hour: number, minute: number): string {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour > 12 ? hour - 12 : hour;
  return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
}

export default function MarketHours() {
  const [watTime, setWatTime] = useState(getWATTime());
  const [countdown, setCountdown] = useState({ hours: '00', minutes: '00', seconds: '00' });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = getWATTime();
      setWatTime(now);
      setIsOpen(isMarketOpen(now));
      
      let targetTime: Date;
      if (isMarketOpen(now)) {
        targetTime = getMarketClose(now);
      } else {
        targetTime = getNextMarketOpen(now);
      }
      
      const diff = targetTime.getTime() - now.getTime();
      setCountdown(formatCountdown(diff));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentDay = dayNames[watTime.getDay()];
  const isWeekend = !isWeekday(watTime);

  return (
    <div className="bg-gradient-to-br from-slate-800/50 via-slate-800/30 to-slate-900/50 dark:from-slate-800/80 dark:via-slate-800/60 dark:to-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-4 md:p-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`
            relative p-3 rounded-xl
            ${isOpen 
              ? 'bg-gradient-to-br from-emerald-500/20 to-green-600/20 border border-emerald-500/30' 
              : 'bg-gradient-to-br from-slate-600/20 to-slate-700/20 border border-slate-600/30'
            }
          `}>
            {isOpen ? (
              <Sun className="w-6 h-6 text-emerald-400" />
            ) : (
              <Moon className="w-6 h-6 text-slate-400" />
            )}
            {isOpen && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
            )}
          </div>
          
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`
                text-lg font-bold
                ${isOpen ? 'text-emerald-400' : 'text-slate-300'}
              `}>
                {isOpen ? 'Market Open' : isWeekend ? 'Weekend - Market Closed' : 'Market Closed'}
              </span>
              {isOpen && (
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-full animate-pulse-glow">
                  LIVE
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-400">
              <div className="flex items-center gap-1.5">
                <Calendar size={14} />
                <span>{currentDay}</span>
              </div>
              <span className="hidden md:inline">•</span>
              <div className="flex items-center gap-1.5">
                <Clock size={14} />
                <span>
                  {formatTime(MARKET_OPEN_HOUR, MARKET_OPEN_MINUTE)} - {formatTime(MARKET_CLOSE_HOUR, MARKET_CLOSE_MINUTE)} WAT
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right mr-2">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
              {isOpen ? 'Closes in' : 'Opens in'}
            </p>
            <p className="text-xs text-slate-400">
              {isOpen ? 'Trading session ends' : isWeekend ? 'Next trading day' : 'Next session starts'}
            </p>
          </div>
          
          <div className="flex items-center gap-1">
            <div className={`
              flex flex-col items-center justify-center w-14 h-16 rounded-xl
              ${isOpen 
                ? 'bg-emerald-500/10 border border-emerald-500/30' 
                : 'bg-slate-700/30 border border-slate-600/30'
              }
            `}>
              <span className={`text-2xl font-bold tabular-nums ${isOpen ? 'text-emerald-400' : 'text-white'}`}>
                {countdown.hours}
              </span>
              <span className="text-[10px] text-slate-500 uppercase">hrs</span>
            </div>
            
            <span className={`text-xl font-bold ${isOpen ? 'text-emerald-400' : 'text-slate-500'} animate-pulse`}>:</span>
            
            <div className={`
              flex flex-col items-center justify-center w-14 h-16 rounded-xl
              ${isOpen 
                ? 'bg-emerald-500/10 border border-emerald-500/30' 
                : 'bg-slate-700/30 border border-slate-600/30'
              }
            `}>
              <span className={`text-2xl font-bold tabular-nums ${isOpen ? 'text-emerald-400' : 'text-white'}`}>
                {countdown.minutes}
              </span>
              <span className="text-[10px] text-slate-500 uppercase">min</span>
            </div>
            
            <span className={`text-xl font-bold ${isOpen ? 'text-emerald-400' : 'text-slate-500'} animate-pulse`}>:</span>
            
            <div className={`
              flex flex-col items-center justify-center w-14 h-16 rounded-xl
              ${isOpen 
                ? 'bg-emerald-500/10 border border-emerald-500/30' 
                : 'bg-slate-700/30 border border-slate-600/30'
              }
            `}>
              <span className={`text-2xl font-bold tabular-nums ${isOpen ? 'text-emerald-400' : 'text-white'}`}>
                {countdown.seconds}
              </span>
              <span className="text-[10px] text-slate-500 uppercase">sec</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

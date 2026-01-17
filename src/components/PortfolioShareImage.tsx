'use client';

import { useState, useRef } from 'react';
import { Share2, Download, X, Loader2, Image as ImageIcon } from 'lucide-react';

interface PortfolioData {
  userName: string;
  totalValue: number;
  totalInvested: number;
  totalGain: number;
  totalGainPercent: number;
  holdingsCount: number;
  topPerformers: Array<{ symbol: string; gainPercent: number }>;
  generatedAt: string;
}

export default function PortfolioShareImage() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const generateImage = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/portfolio/share-image');
      if (!response.ok) {
        throw new Error('Failed to fetch portfolio data');
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to generate image');
      }

      const data: PortfolioData = result.data;
      
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = 1200;
      canvas.height = 630;

      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#0f172a');
      gradient.addColorStop(0.5, '#1e293b');
      gradient.addColorStop(1, '#0f172a');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const patternCanvas = document.createElement('canvas');
      patternCanvas.width = 60;
      patternCanvas.height = 60;
      const patternCtx = patternCanvas.getContext('2d');
      if (patternCtx) {
        patternCtx.strokeStyle = 'rgba(16, 185, 129, 0.1)';
        patternCtx.lineWidth = 1;
        patternCtx.beginPath();
        patternCtx.moveTo(0, 0);
        patternCtx.lineTo(60, 60);
        patternCtx.moveTo(60, 0);
        patternCtx.lineTo(0, 60);
        patternCtx.stroke();
      }
      const pattern = ctx.createPattern(patternCanvas, 'repeat');
      if (pattern) {
        ctx.fillStyle = pattern;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.font = 'bold 28px Inter, system-ui, sans-serif';
      ctx.fillStyle = '#10b981';
      ctx.fillText('9jaStock', 60, 60);
      ctx.font = '14px Inter, system-ui, sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('NGX TRACKER', 168, 60);

      ctx.font = 'bold 48px Inter, system-ui, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`${data.userName}'s Portfolio`, 60, 140);

      ctx.font = '20px Inter, system-ui, sans-serif';
      ctx.fillStyle = '#94a3b8';
      const date = new Date(data.generatedAt).toLocaleDateString('en-NG', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      ctx.fillText(date, 60, 180);

      ctx.fillStyle = 'rgba(30, 41, 59, 0.8)';
      ctx.beginPath();
      ctx.roundRect(60, 220, 520, 200, 16);
      ctx.fill();
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.3)';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.font = '18px Inter, system-ui, sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('PORTFOLIO VALUE', 90, 270);

      ctx.font = 'bold 56px Inter, system-ui, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(formatCurrency(data.totalValue), 90, 340);

      const isPositive = data.totalGain >= 0;
      ctx.font = 'bold 28px Inter, system-ui, sans-serif';
      ctx.fillStyle = isPositive ? '#10b981' : '#ef4444';
      const gainText = `${isPositive ? '+' : ''}${formatCurrency(data.totalGain)} (${isPositive ? '+' : ''}${data.totalGainPercent.toFixed(2)}%)`;
      ctx.fillText(gainText, 90, 390);

      ctx.fillStyle = 'rgba(30, 41, 59, 0.8)';
      ctx.beginPath();
      ctx.roundRect(620, 220, 520, 200, 16);
      ctx.fill();
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.font = '18px Inter, system-ui, sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('TOP PERFORMERS', 650, 270);

      if (data.topPerformers.length > 0) {
        data.topPerformers.forEach((stock, i) => {
          const y = 310 + i * 40;
          ctx.font = 'bold 22px Inter, system-ui, sans-serif';
          ctx.fillStyle = '#ffffff';
          ctx.fillText(stock.symbol, 650, y);
          
          ctx.font = 'bold 22px Inter, system-ui, sans-serif';
          ctx.fillStyle = stock.gainPercent >= 0 ? '#10b981' : '#ef4444';
          const percent = `${stock.gainPercent >= 0 ? '+' : ''}${stock.gainPercent.toFixed(1)}%`;
          ctx.fillText(percent, 850, y);
        });
      } else {
        ctx.font = '18px Inter, system-ui, sans-serif';
        ctx.fillStyle = '#64748b';
        ctx.fillText('No holdings yet', 650, 320);
      }

      ctx.fillStyle = 'rgba(30, 41, 59, 0.6)';
      ctx.beginPath();
      ctx.roundRect(60, 460, 250, 100, 12);
      ctx.fill();

      ctx.font = '14px Inter, system-ui, sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('TOTAL INVESTED', 90, 500);
      ctx.font = 'bold 28px Inter, system-ui, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(formatCurrency(data.totalInvested), 90, 535);

      ctx.fillStyle = 'rgba(30, 41, 59, 0.6)';
      ctx.beginPath();
      ctx.roundRect(340, 460, 250, 100, 12);
      ctx.fill();

      ctx.font = '14px Inter, system-ui, sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('HOLDINGS', 370, 500);
      ctx.font = 'bold 28px Inter, system-ui, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`${data.holdingsCount} stocks`, 370, 535);

      ctx.font = '16px Inter, system-ui, sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.fillText('Track your Nigerian stocks at 9jastock.com', 60, 600);

      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      setImageUrl(dataUrl);
      setIsOpen(true);
    } catch (err: any) {
      setError(err.message || 'Failed to generate image');
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = () => {
    if (!imageUrl) return;
    
    const link = document.createElement('a');
    link.download = `9jastock-portfolio-${Date.now()}.jpg`;
    link.href = imageUrl;
    link.click();
  };

  const shareImage = async () => {
    if (!imageUrl || !canvasRef.current) return;

    try {
      const blob = await new Promise<Blob>((resolve) => {
        canvasRef.current!.toBlob((blob) => {
          resolve(blob!);
        }, 'image/jpeg', 0.92);
      });

      const file = new File([blob], 'portfolio.jpg', { type: 'image/jpeg' });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'My 9jaStock Portfolio',
          text: 'Check out my Nigerian stock portfolio performance!',
          files: [file],
        });
      } else {
        downloadImage();
      }
    } catch (err) {
      downloadImage();
    }
  };

  return (
    <>
      <button
        onClick={generateImage}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-medium rounded-xl hover:from-emerald-400 hover:to-green-400 transition-all disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <ImageIcon className="w-5 h-5" />
        )}
        Share Portfolio Image
      </button>

      <canvas ref={canvasRef} className="hidden" />

      {isOpen && imageUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-3xl bg-slate-900 rounded-2xl overflow-hidden border border-slate-700">
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <h3 className="text-lg font-semibold text-white">Your Portfolio Summary</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4">
              <img
                src={imageUrl}
                alt="Portfolio Summary"
                className="w-full rounded-lg"
              />
            </div>

            <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-700">
              <button
                onClick={downloadImage}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-700 text-white font-medium rounded-xl hover:bg-slate-600 transition-colors"
              >
                <Download className="w-5 h-5" />
                Download
              </button>
              <button
                onClick={shareImage}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-medium rounded-xl hover:from-emerald-400 hover:to-green-400 transition-all"
              >
                <Share2 className="w-5 h-5" />
                Share
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed bottom-4 right-4 z-50 p-4 bg-red-500/20 border border-red-500/50 text-red-400 rounded-xl">
          {error}
        </div>
      )}
    </>
  );
}

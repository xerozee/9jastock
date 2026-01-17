'use client';

import { useState, useRef, useEffect } from 'react';
import { Share2, Download, X, Loader2, Gift } from 'lucide-react';

interface ReferralShareImageProps {
  referralCode: string;
  userName?: string;
}

export default function ReferralShareImage({ referralCode, userName }: ReferralShareImageProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logoRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = '/assets/9jastock-logo.png';
    img.onload = () => {
      logoRef.current = img;
    };
  }, []);

  const generateImage = async () => {
    setLoading(true);

    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = 1080;
      canvas.height = 1080;

      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#0f172a');
      gradient.addColorStop(0.3, '#1e3a5f');
      gradient.addColorStop(0.7, '#1e3a5f');
      gradient.addColorStop(1, '#0f172a');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = 'rgba(16, 185, 129, 0.15)';
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }
      for (let i = 0; i < canvas.height; i += 40) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
      }

      ctx.fillStyle = 'rgba(16, 185, 129, 0.1)';
      ctx.beginPath();
      ctx.arc(100, 100, 300, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(980, 980, 400, 0, Math.PI * 2);
      ctx.fill();

      const centerX = canvas.width / 2;

      if (logoRef.current) {
        const logoSize = 120;
        ctx.drawImage(
          logoRef.current,
          centerX - logoSize / 2,
          120,
          logoSize,
          logoSize
        );
      }

      ctx.font = 'bold 52px Inter, system-ui, sans-serif';
      ctx.fillStyle = '#10b981';
      ctx.textAlign = 'center';
      ctx.fillText('9jaStock', centerX, 290);
      
      ctx.font = '24px Inter, system-ui, sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('NGX TRACKER', centerX, 330);

      ctx.font = '32px Inter, system-ui, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText("You're Invited!", centerX, 420);

      if (userName) {
        ctx.font = '24px Inter, system-ui, sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(`${userName} invites you to join 9jaStock`, centerX, 470);
      }

      ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
      ctx.beginPath();
      ctx.roundRect(centerX - 250, 520, 500, 180, 24);
      ctx.fill();
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.font = '18px Inter, system-ui, sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('USE REFERRAL CODE', centerX, 575);

      ctx.font = 'bold 72px Inter, system-ui, sans-serif';
      ctx.fillStyle = '#10b981';
      ctx.fillText(referralCode, centerX, 665);

      const features = [
        'Real-time NGX stock data',
        'Portfolio tracking & alerts',
        'AI-powered insights'
      ];

      ctx.font = '22px Inter, system-ui, sans-serif';
      ctx.fillStyle = '#ffffff';
      
      features.forEach((feature, i) => {
        const y = 780 + i * 45;
        ctx.fillStyle = '#10b981';
        ctx.fillText('✓', centerX - 180, y);
        ctx.fillStyle = '#e2e8f0';
        ctx.textAlign = 'left';
        ctx.fillText(feature, centerX - 150, y);
        ctx.textAlign = 'center';
      });

      ctx.font = '20px Inter, system-ui, sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.fillText('Sign up at 9jastocks.app', centerX, 980);

      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      setImageUrl(dataUrl);
      setIsOpen(true);
    } catch (err) {
      console.error('Failed to generate referral image:', err);
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = () => {
    if (!imageUrl) return;
    
    const link = document.createElement('a');
    link.download = `9jastock-referral-${referralCode}.jpg`;
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

      const file = new File([blob], `referral-${referralCode}.jpg`, { type: 'image/jpeg' });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'Join 9jaStock',
          text: `Use my referral code ${referralCode} to join 9jaStock and track Nigerian stocks!`,
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
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-xl hover:from-purple-400 hover:to-pink-400 transition-all disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Gift className="w-5 h-5" />
        )}
        Share Referral Image
      </button>

      <canvas ref={canvasRef} className="hidden" />

      {isOpen && imageUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-slate-900 rounded-2xl overflow-hidden border border-slate-700">
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <h3 className="text-lg font-semibold text-white">Your Referral Code</h3>
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
                alt="Referral Code"
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
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-xl hover:from-purple-400 hover:to-pink-400 transition-all"
              >
                <Share2 className="w-5 h-5" />
                Share
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Copy, Check, Download, QrCode as QrIcon } from 'lucide-react';

interface QRCodeCardProps {
  tokenCode: string;
  title: string;
  subtitle: string;
  metaInfo: { label: string; value: string }[];
  status: string;
  className?: string;
  compact?: boolean;
}

export const QRCodeCard: React.FC<QRCodeCardProps> = ({
  tokenCode,
  title,
  subtitle,
  metaInfo,
  status,
  className = '',
  compact = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, tokenCode, {
        width: compact ? 130 : 180,
        margin: 1,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'M'
      }).catch((err) => {
        console.error('Failed to generate QR Code:', err);
      });
    }
  }, [tokenCode, compact]);

  const handleCopy = () => {
    navigator.clipboard.writeText(tokenCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `Pass-${tokenCode}.png`;
    a.click();
  };

  return (
    <div className={`bg-white rounded-3xl p-5 border border-slate-200 shadow-sm relative overflow-hidden ${className}`}>
      
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
          {tokenCode}
        </span>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
          {status}
        </span>
      </div>

      {/* QR Canvas */}
      <div className="flex flex-col items-center text-center">
        <div className="p-2 bg-white rounded-2xl border border-slate-100 shadow-inner inline-block">
          <canvas ref={canvasRef} className="rounded-xl block" />
        </div>

        {/* Title */}
        <h4 className="mt-3 font-bold text-slate-900 text-xs leading-tight line-clamp-1">{title}</h4>
        <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>

        {/* Details Grid */}
        <div className="w-full mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-1.5 text-left text-[11px]">
          {metaInfo.map((info, idx) => (
            <div key={idx} className="bg-slate-50 p-2 rounded-xl">
              <span className="text-[9px] font-semibold text-slate-400 uppercase">{info.label}</span>
              <div className="font-semibold text-slate-800 truncate">{info.value}</div>
            </div>
          ))}
        </div>

        {/* Action icons */}
        <div className="w-full mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          <button
            onClick={handleCopy}
            className="text-slate-500 hover:text-slate-900 flex items-center gap-1 font-medium transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Code'}</span>
          </button>
          
          <button
            onClick={handleDownload}
            className="text-slate-500 hover:text-slate-900 flex items-center gap-1 font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Save</span>
          </button>
        </div>
      </div>
    </div>
  );
};

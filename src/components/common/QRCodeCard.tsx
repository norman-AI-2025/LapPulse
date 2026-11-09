import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Copy, Check, Download, ShieldCheck, QrCode as QrIcon } from 'lucide-react';

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
      // Encode structured payload
      const qrPayload = JSON.stringify({
        system: 'UM_FCSIT_LABPULSE',
        token: tokenCode,
        title,
        ts: Date.now()
      });

      QRCode.toCanvas(canvasRef.current, qrPayload, {
        width: compact ? 140 : 200,
        margin: 1.5,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'H'
      }).catch((err) => {
        console.error('Failed to generate QR Code:', err);
      });
    }
  }, [tokenCode, title, compact]);

  const handleCopy = () => {
    navigator.clipboard.writeText(tokenCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `LabPulse-${tokenCode}.png`;
    a.click();
  };

  return (
    <div className={`bento-card rounded-2xl p-5 border border-slate-200/80 bg-white relative overflow-hidden ${className}`}>
      {/* Top Header Badge */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <QrIcon className="w-3.5 h-3.5 text-blue-600" />
          <span>FCSIT Digital Pass</span>
        </div>
        <span
          className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
            status === 'Active'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : status === 'Approved'
              ? 'bg-blue-50 text-blue-700 border-blue-200'
              : status === 'Pending Endorsement' || status === 'Pending Approval'
              ? 'bg-amber-50 text-amber-700 border-amber-200'
              : 'bg-slate-100 text-slate-700 border-slate-200'
          }`}
        >
          {status}
        </span>
      </div>

      <div className={`${compact ? 'flex flex-row items-center gap-4' : 'flex flex-col items-center text-center'}`}>
        {/* QR Canvas Container with Apple rounded styling */}
        <div className="relative p-2.5 bg-slate-50 border border-slate-100 rounded-2xl shadow-inner flex flex-col items-center">
          <canvas ref={canvasRef} className="rounded-xl block" />
          <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400 font-medium">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            <span>FCSIT Cryptographic Token</span>
          </div>
        </div>

        {/* Fallback Token Code & Details */}
        <div className={`mt-3 ${compact ? 'mt-0 flex-1 text-left' : 'w-full'}`}>
          <div className="text-xs text-slate-400 font-medium">Verification Token</div>
          <div className="flex items-center justify-center gap-2 mt-0.5">
            <span className="font-mono text-xl sm:text-2xl font-bold tracking-wider text-slate-900 bg-slate-100/90 px-3 py-1 rounded-xl border border-slate-200">
              {tokenCode}
            </span>
            <button
              onClick={handleCopy}
              title="Copy token code"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors border border-slate-200/80"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <h4 className="mt-3 font-semibold text-slate-800 text-sm leading-tight line-clamp-1">{title}</h4>
          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{subtitle}</p>

          {/* Metadata badges */}
          <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-left">
            {metaInfo.map((info, idx) => (
              <div key={idx} className="bg-slate-50/80 p-2 rounded-xl">
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{info.label}</div>
                <div className="text-xs font-semibold text-slate-800 truncate mt-0.5">{info.value}</div>
              </div>
            ))}
          </div>

          {/* Action Footer */}
          <div className="mt-3.5 flex items-center justify-end gap-2">
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Save Pass
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


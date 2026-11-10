import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { 
  Copy, 
  Check, 
  Download, 
  CheckCircle2, 
  Clock, 
  Calendar,
  ShieldCheck,
  ArrowRight,
  QrCode,
  FileText
} from 'lucide-react';

interface QRCodeCardProps {
  tokenCode: string;
  title: string;
  subtitle: string;
  metaInfo: { label: string; value: string }[];
  status: string;
  type?: 'space' | 'hardware';
  // Scanned verification details
  isScanned?: boolean;
  scannedInfo?: {
    checkInTimeDate: string;
    supposedCheckOutTimeDate: string;
  };
  className?: string;
  compact?: boolean;
}

export const QRCodeCard: React.FC<QRCodeCardProps> = ({
  tokenCode,
  title,
  subtitle,
  metaInfo,
  status,
  type = 'space',
  isScanned = false,
  scannedInfo,
  className = '',
  compact = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const secondaryCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = useState(false);
  const [showSecondaryQr, setShowSecondaryQr] = useState(false);

  // If status is Active or Completed, or if isScanned is true, it is considered scanned
  const hasBeenScanned = isScanned || 
    status === 'Active' || 
    status === 'Active / Issued' || 
    status === 'Completed' || 
    status === 'Returned';

  // Can display secondary checkout/return QR pass
  const canShowSecondaryPass = status === 'Active' || status === 'Active / Issued';

  useEffect(() => {
    // Primary QR code for initial check-in / borrow
    if (!hasBeenScanned && canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, tokenCode, {
        width: compact ? 130 : 170,
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
  }, [tokenCode, hasBeenScanned, compact]);

  useEffect(() => {
    // Secondary QR code for checkout / return
    if (showSecondaryQr && secondaryCanvasRef.current) {
      QRCode.toCanvas(secondaryCanvasRef.current, tokenCode, {
        width: compact ? 130 : 160,
        margin: 1,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'M'
      }).catch((err) => {
        console.error('Failed to generate Secondary QR Code:', err);
      });
    }
  }, [tokenCode, showSecondaryQr, compact]);

  const handleCopy = () => {
    navigator.clipboard.writeText(tokenCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleDownload = () => {
    const activeCanvas = showSecondaryQr ? secondaryCanvasRef.current : canvasRef.current;
    if (!activeCanvas) return;
    const url = activeCanvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `Pass-${tokenCode}.png`;
    a.click();
  };

  // Status Badge Fill Styling according to user instruction:
  const getStatusBadgeClass = (statusStr: string) => {
    const s = statusStr.toLowerCase();
    if (s.includes('active')) {
      return 'bg-emerald-500 text-white font-bold shadow-sm';
    }
    if (s.includes('pending')) {
      return 'bg-[#FFEB3B] text-slate-950 font-bold shadow-sm';
    }
    if (s.includes('approved')) {
      return 'bg-blue-600 text-white font-bold shadow-sm';
    }
    if (s.includes('overdue') || s.includes('forfeit') || s.includes('reject')) {
      return 'bg-rose-500 text-white font-bold shadow-sm';
    }
    return 'bg-slate-100 text-slate-800 font-semibold';
  };

  return (
    <div className={`bg-white rounded-3xl p-5 border border-slate-200 shadow-sm relative overflow-hidden transition-all ${className}`}>
      
      {/* Header: Token Code on left & Filled Status Badge on right */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
          {tokenCode}
        </span>
        
        {/* Filled Status Container */}
        <span className={`text-[11px] px-3 py-0.5 rounded-full ${getStatusBadgeClass(status)}`}>
          {status}
        </span>
      </div>

      <div className="flex flex-col items-center text-center">
        
        {/* 
          WHEN PASSES ARE SCANNED:
          Replace the initial QR code with details, and provide button with small QR logo to show checkout/return QR code!
        */}
        {hasBeenScanned ? (
          showSecondaryQr ? (
            /* SECONDARY QR CODE (CHECKOUT / RETURN PASS) */
            <div className="w-full my-1 p-3.5 rounded-2xl bg-slate-950 text-white text-center space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1">
                  <QrCode className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{type === 'space' ? 'Checkout Pass' : 'Return Pass'}</span>
                </span>
                <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                  {tokenCode}
                </span>
              </div>

              <div className="p-2 bg-white rounded-2xl border border-slate-700 inline-block mx-auto shadow-inner">
                <canvas ref={secondaryCanvasRef} className="rounded-xl block" />
              </div>

              <p className="text-[10px] text-slate-300">
                {type === 'space'
                  ? 'Present at exit turnstile to get scanned for check-out'
                  : 'Present to lab officer to get scanned for return inspection'}
              </p>

              <button
                type="button"
                onClick={() => setShowSecondaryQr(false)}
                className="w-full py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>View Check-In Details</span>
              </button>
            </div>
          ) : (
            /* VERIFIED DETAILS CARD WITH BUTTON (SMALL QR LOGO) TO SHOW CHECKOUT/RETURN PASS */
            <div className="w-full my-1 p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-left space-y-2.5 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Pass Verified & Scanned</span>
                </div>
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.2 rounded-full">
                  {type === 'space' ? 'Session Active' : 'On Loan'}
                </span>
              </div>

              {/* Check-In Details */}
              <div className="bg-white p-2.5 rounded-xl border border-emerald-100">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {type === 'space' ? 'Time & Date Checked In' : 'Date Checked In (Issued)'}
                </div>
                <div className="text-xs font-bold text-slate-900 mt-0.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{scannedInfo?.checkInTimeDate || `${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} at 08:05 AM`}</span>
                </div>
              </div>

              {/* Supposed Check-Out Details */}
              <div className="bg-white p-2.5 rounded-xl border border-emerald-100">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {type === 'space' ? 'Time & Date Supposed to Check Out' : 'Date Supposed to Return (Due)'}
                </div>
                <div className="text-xs font-bold text-slate-900 mt-0.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  <span>{scannedInfo?.supposedCheckOutTimeDate || `${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} at 10:00 AM`}</span>
                </div>
              </div>

              {/* BUTTON WITH SMALL QR LOGO TO SHOW CHECKOUT / RETURN PASS */}
              {canShowSecondaryPass && (
                <button
                  type="button"
                  onClick={() => setShowSecondaryQr(true)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm mt-1"
                >
                  <QrCode className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{type === 'space' ? 'Show Checkout Pass' : 'Show Return Pass'}</span>
                </button>
              )}
            </div>
          )
        ) : (
          /* NOT YET SCANNED: Display Initial Vector QR Pass */
          <div className="p-2 bg-white rounded-2xl border border-slate-100 shadow-inner inline-block my-1">
            <canvas ref={canvasRef} className="rounded-xl block" />
            <div className="text-[9px] font-semibold text-slate-400 mt-1 uppercase">
              {type === 'space' ? 'Present to get scanned at turnstile' : 'Present to get scanned to collect hardware'}
            </div>
          </div>
        )}

        {/* Title & Subtitle */}
        <h4 className="mt-2.5 font-bold text-slate-900 text-xs leading-tight line-clamp-1">{title}</h4>
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
          
          {(!hasBeenScanned || showSecondaryQr) && (
            <button
              onClick={handleDownload}
              className="text-slate-500 hover:text-slate-900 flex items-center gap-1 font-medium transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Save</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

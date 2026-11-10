import React, { useState, useRef, useEffect, useCallback } from 'react';
import jsQR from 'jsqr';
import { useLabPulse } from '../../context/LabPulseContext';
import { sounds } from '../../utils/audio';
import { 
  Camera, 
  CameraOff,
  Scan, 
  CheckCircle2, 
  XCircle,
  AlertCircle,
  Upload,
  RefreshCw,
  CheckSquare, 
  Square,
  Sparkles,
  Volume2,
  Check,
  X,
  FileText,
  Clock,
  ShieldCheck,
  MapPin,
  Calendar
} from 'lucide-react';

interface ScanOutcome {
  status: 'success' | 'failed';
  code: string;
  message: string;
  type?: 'space' | 'hardware';
  action?: 'checkin' | 'checkout' | 'borrow' | 'return' | 'completed' | 'returned';
  timestamp: string;
}

export const OfficerScanStation: React.FC = () => {
  const { 
    bookings, 
    loans, 
    checkInBooking, 
    checkOutBooking, 
    verifyAndIssueLoan, 
    processReturn,
    currentUser 
  } = useLabPulse();

  // Manual token input state
  const [inputToken, setInputToken] = useState('');
  
  // Real camera state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  
  // Result & outcome feedback
  const [scanOutcome, setScanOutcome] = useState<ScanOutcome | null>(null);
  const [selectedScanResult, setSelectedScanResult] = useState<{
    type: 'booking' | 'loan';
    data: any;
  } | null>(null);

  // Video and Canvas refs for real-time QR stream processing
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameId = useRef<number | null>(null);
  const lastScannedTime = useRef<number>(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Condition checklist
  const [checklist, setChecklist] = useState({
    chassisIntact: true,
    accessoriesIncluded: true,
    powersOnWithoutError: true
  });

  const [returnCondition, setReturnCondition] = useState<'Excellent' | 'Good' | 'Minor Scratches' | 'Needs Service'>('Excellent');
  const [notes, setNotes] = useState('');

  const sampleTokens = ['LP-7842', 'LP-3829', 'LP-4190', 'LP-8812'];

  // Process a detected QR code string with AUTOMATIC confirmation on scan
  const processDecodedCode = useCallback((rawCode: string) => {
    const now = Date.now();
    // 2-second debounce between scans
    if (now - lastScannedTime.current < 2000) return;
    lastScannedTime.current = now;

    const trimmed = rawCode.trim();
    // Extract LP-XXXX pattern if embedded in text or URL
    const match = trimmed.match(/LP-[A-Za-z0-9]+/i);
    const code = (match ? match[0] : trimmed).toUpperCase();

    setInputToken(code);

    const booking = bookings.find((b) => b.tokenCode.toUpperCase() === code);
    if (booking) {
      sounds.playSuccessChime();
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      if (booking.status === 'Approved' || booking.status === 'Pending Approval') {
        // AUTOMATIC CHECK-IN CONFIRMED ON SCAN
        checkInBooking(code);
        const updatedBooking = { ...booking, status: 'Active' as const, checkInTime: timeStr };
        setScanOutcome({
          status: 'success',
          code,
          message: `Check-in Confirmed: Physical access granted to ${booking.roomName}. Session is now ACTIVE.`,
          type: 'space',
          action: 'checkin',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        });
        setSelectedScanResult({ type: 'booking', data: updatedBooking });
      } else if (booking.status === 'Active') {
        // AUTOMATIC CHECK-OUT CONFIRMED ON SCAN
        checkOutBooking(code);
        const updatedBooking = { ...booking, status: 'Completed' as const, checkOutTime: timeStr };
        setScanOutcome({
          status: 'success',
          code,
          message: `Check-out Confirmed: Session concluded for ${booking.roomName}. Turnstile exit recorded.`,
          type: 'space',
          action: 'checkout',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        });
        setSelectedScanResult({ type: 'booking', data: updatedBooking });
      } else {
        setScanOutcome({
          status: 'success',
          code,
          message: `Space Pass Verified: Session for ${booking.roomName} has already been concluded.`,
          type: 'space',
          action: 'completed',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        });
        setSelectedScanResult({ type: 'booking', data: booking });
      }
      return;
    }

    const loan = loans.find((l) => l.tokenCode.toUpperCase() === code);
    if (loan) {
      sounds.playSuccessChime();

      if (loan.status === 'Pending Approval') {
        // AUTOMATIC BORROW CONFIRMED ON SCAN
        verifyAndIssueLoan(code, { chassisIntact: true, accessoriesIncluded: true, powersOnWithoutError: true }, 'Automated turnstile scan issue');
        const updatedLoan = { ...loan, status: 'Active / Issued' as const };
        setScanOutcome({
          status: 'success',
          code,
          message: `Borrow Confirmed: ${loan.hardwareName} successfully issued to ${loan.userName}.`,
          type: 'hardware',
          action: 'borrow',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        });
        setSelectedScanResult({ type: 'loan', data: updatedLoan });
      } else if (loan.status === 'Active / Issued' || loan.status === 'Overdue') {
        // AUTOMATIC RETURN CONFIRMED ON SCAN
        processReturn(code, 'Excellent', { chassisIntact: true, accessoriesIncluded: true, powersOnWithoutError: true }, 'Automated turnstile scan return');
        const updatedLoan = { ...loan, status: 'Returned' as const };
        setScanOutcome({
          status: 'success',
          code,
          message: `Return Confirmed: ${loan.hardwareName} successfully returned and restocked in inventory.`,
          type: 'hardware',
          action: 'return',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        });
        setSelectedScanResult({ type: 'loan', data: updatedLoan });
      } else {
        setScanOutcome({
          status: 'success',
          code,
          message: `Hardware Pass Verified: ${loan.hardwareName} has already been returned and restocked.`,
          type: 'hardware',
          action: 'returned',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        });
        setSelectedScanResult({ type: 'loan', data: loan });
      }
      return;
    }

    // Unrecognized or invalid QR Code
    sounds.playErrorBuzzer();
    setScanOutcome({
      status: 'failed',
      code: code || 'UNKNOWN',
      message: `Invalid or unregistered QR Pass ("${code}"). Not found in FCSIT registry.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    });
    setSelectedScanResult(null);
  }, [bookings, loans, checkInBooking, checkOutBooking, verifyAndIssueLoan, processReturn]);

  // Frame processing loop with jsQR
  const tick = useCallback(() => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert'
          });

          if (code && code.data) {
            processDecodedCode(code.data);
          }
        }
      }
    }
    if (isScanning) {
      animFrameId.current = requestAnimationFrame(tick);
    }
  }, [isScanning, processDecodedCode]);

  useEffect(() => {
    if (isScanning) {
      animFrameId.current = requestAnimationFrame(tick);
    } else {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    }
    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [isScanning, tick]);

  // Start real camera stream
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Camera API is not supported in this browser environment.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
      }

      setIsCameraActive(true);
      setIsScanning(true);
    } catch (err: any) {
      console.error('Camera access error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera access was denied. Please allow camera permissions in your browser bar.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No video camera hardware detected on this device.');
      } else {
        setCameraError(`Unable to start camera: ${err.message || 'Check camera permissions.'}`);
      }
      setIsCameraActive(false);
      setIsScanning(false);
    }
  };

  // Stop camera stream
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (animFrameId.current) {
      cancelAnimationFrame(animFrameId.current);
    }
    setIsCameraActive(false);
    setIsScanning(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Handle uploaded QR image file
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = img.width;
        tempCanvas.height = img.height;
        const ctx = tempCanvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code && code.data) {
            processDecodedCode(code.data);
          } else {
            sounds.playErrorBuzzer();
            setScanOutcome({
              status: 'failed',
              code: 'UNREADABLE',
              message: 'Could not detect a valid QR pattern in the uploaded image. Please ensure the image is clear.',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
            });
            setSelectedScanResult(null);
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    // Reset file input value so same file can be selected again
    e.target.value = '';
  };

  const handleLookup = (codeToLookup?: string) => {
    const code = (codeToLookup || inputToken).trim().toUpperCase();
    if (!code) return;
    processDecodedCode(code);
  };

  const handleQuickToken = (code: string) => {
    setInputToken(code);
    processDecodedCode(code);
  };

  const handleCheckIn = () => {
    if (!selectedScanResult) return;
    const res = checkInBooking(selectedScanResult.data.tokenCode);
    if (res.success && res.booking) {
      setSelectedScanResult({ type: 'booking', data: res.booking });
    }
  };

  const handleCheckOut = () => {
    if (!selectedScanResult) return;
    const res = checkOutBooking(selectedScanResult.data.tokenCode);
    if (res.success && res.booking) {
      setSelectedScanResult({ type: 'booking', data: res.booking });
    }
  };

  const handleIssueHardware = () => {
    if (!selectedScanResult) return;
    const res = verifyAndIssueLoan(selectedScanResult.data.tokenCode, checklist, notes);
    if (res.success) {
      const updated = loans.find((l) => l.tokenCode === selectedScanResult.data.tokenCode);
      if (updated) setSelectedScanResult({ type: 'loan', data: updated });
    }
  };

  const handleReturnHardware = () => {
    if (!selectedScanResult) return;
    const res = processReturn(selectedScanResult.data.tokenCode, returnCondition, checklist, notes);
    if (res.success) {
      const updated = loans.find((l) => l.tokenCode === selectedScanResult.data.tokenCode);
      if (updated) setSelectedScanResult({ type: 'loan', data: updated });
    }
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto pb-12 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
              Live Optical Turnstile
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">Camera Verification Scanner</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 mt-1">
            Officer QR Verification Station
          </h1>
        </div>
        <div className="text-right">
          <span className="text-xs font-semibold text-slate-700 block">{currentUser.name}</span>
          <span className="text-[11px] text-slate-400">{currentUser.matricOrStaffId} • Lab Technical Officer</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
        
        {/* Scanner Viewfinder Column (5 cols) */}
        <div className="md:col-span-5 bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
          
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-blue-600" />
              <span>Camera Optical Viewfinder</span>
            </span>

            {isCameraActive && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Live Video Feed
              </span>
            )}
          </div>

          {/* REAL CAMERA FEED / CANVAS VIEWFINDER */}
          <div
            className={`relative aspect-video rounded-2xl bg-slate-950 overflow-hidden flex items-center justify-center border transition-all ${
              scanOutcome?.status === 'success'
                ? 'border-emerald-500 ring-4 ring-emerald-500/20'
                : scanOutcome?.status === 'failed'
                ? 'border-rose-500 ring-4 ring-rose-500/20'
                : 'border-slate-800'
            }`}
          >
            {/* Live Video Element */}
            <video
              ref={videoRef}
              className={`w-full h-full object-cover ${isCameraActive ? 'block' : 'hidden'}`}
              playsInline
              muted
            />

            {/* Hidden canvas for image data processing */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Inactive Camera State Overlay */}
            {!isCameraActive && (
              <div className="text-center p-5 text-slate-400 space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
                  <Scan className="w-6 h-6 opacity-70" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-300">Camera Scanner Off</div>
                  <div className="text-[11px] text-slate-500 max-w-[220px] mx-auto mt-0.5">
                    Click "Start Camera" below to scan QR passes live.
                  </div>
                </div>
              </div>
            )}

            {/* Active Scanning Laser Animation */}
            {isCameraActive && (
              <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4">
                <div className="w-full flex justify-between items-start opacity-70">
                  <div className="w-5 h-5 border-t-2 border-l-2 border-cyan-400" />
                  <div className="w-5 h-5 border-t-2 border-r-2 border-cyan-400" />
                </div>
                <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent scan-laser shadow-[0_0_8px_#22d3ee]" />
                <div className="w-full flex justify-between items-end opacity-70">
                  <div className="w-5 h-5 border-b-2 border-l-2 border-cyan-400" />
                  <div className="w-5 h-5 border-b-2 border-r-2 border-cyan-400" />
                </div>
              </div>
            )}
          </div>

          {/* Camera Error Alert if Permission Denied */}
          {cameraError && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold">Camera Access Warning</strong>
                <span>{cameraError}</span>
              </div>
            </div>
          )}

          {/* Camera Controls & File Upload */}
          <div className="grid grid-cols-2 gap-2">
            {!isCameraActive ? (
              <button
                type="button"
                onClick={startCamera}
                className="py-2.5 px-3 rounded-xl bg-[#002B7F] hover:bg-blue-800 text-white font-semibold text-xs transition-colors shadow-sm flex items-center justify-center gap-1.5"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Start Camera</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={stopCamera}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs transition-colors shadow-sm flex items-center justify-center gap-1.5"
              >
                <CameraOff className="w-3.5 h-3.5" />
                <span>Stop Camera</span>
              </button>
            )}

            {/* Upload QR Image / File Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="py-2.5 px-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors shadow-sm flex items-center justify-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span>Upload QR File</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </div>

          {/* Manual Code Entry */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <label className="text-xs font-semibold text-slate-700 block">
              Manual Token Entry (Fallback)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. LP-7842"
                value={inputToken}
                onChange={(e) => setInputToken(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
                className="flex-1 font-mono font-bold text-xs px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-slate-400 uppercase"
              />
              <button
                type="button"
                onClick={() => handleLookup()}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors"
              >
                Lookup
              </button>
            </div>
          </div>

          {/* Quick Codes for Immediate Testing */}
          <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-slate-400 mr-1">Quick:</span>
            {sampleTokens.map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => handleQuickToken(code)}
                className="font-mono text-[11px] px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 transition-colors"
              >
                {code}
              </button>
            ))}
          </div>
        </div>

        {/* ============================================================== */}
        {/* RIGHT CONTAINER: SCAN SUCCESSFUL / SCAN FAILED & DETAILS/STATUS */}
        {/* ============================================================== */}
        <div className="md:col-span-7 bg-white rounded-3xl p-5 border border-slate-200 shadow-sm min-h-[380px]">
          
          {/* CASE 1: SCAN FAILED IN RIGHT CONTAINER */}
          {scanOutcome?.status === 'failed' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-1">
              {/* Failed Status Card */}
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 flex items-start gap-3">
                <XCircle className="w-6 h-6 text-rose-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-rose-900">Scan Failed</span>
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-white border border-rose-200 text-rose-900">
                      {scanOutcome.code}
                    </span>
                    <span className="text-[10px] text-rose-600">{scanOutcome.timestamp}</span>
                  </div>
                  <p className="text-xs text-rose-800 leading-relaxed">
                    {scanOutcome.message}
                  </p>
                </div>
              </div>

              {/* Security & Verification Warning Box */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2.5 text-xs text-slate-600">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Turnstile Security Diagnostic
                </span>
                <ul className="space-y-1.5 text-[11px]">
                  <li className="flex items-center gap-2 text-rose-700">
                    <X className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                    <span>No active reservation or approved loan found in FCSIT registry.</span>
                  </li>
                  <li className="flex items-center gap-2 text-slate-600">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                    <span>QR pass may be expired, cancelled, or issued by an external system.</span>
                  </li>
                  <li className="flex items-center gap-2 text-slate-600">
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>Access gate locked. Physical equipment release blocked.</span>
                  </li>
                </ul>
              </div>

              {/* Action Buttons to retry or test valid pass */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setScanOutcome(null);
                    setSelectedScanResult(null);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
                >
                  Clear Screen
                </button>
                <button
                  type="button"
                  onClick={() => processDecodedCode('LP-7842')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Test Valid Space Pass</span>
                </button>
              </div>
            </div>
          )}

          {/* CASE 2: SCAN SUCCESSFUL IN RIGHT CONTAINER (DETAILS + STATUS) */}
          {scanOutcome?.status === 'success' && selectedScanResult && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-1">
              
              {/* Scan Successful Header Banner */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-emerald-900">Scan Successful</span>
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-white border border-emerald-200 text-emerald-900">
                        {selectedScanResult.data.tokenCode}
                      </span>
                      <span className="text-[10px] text-emerald-700">{scanOutcome.timestamp}</span>
                    </div>
                    <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed">
                      {scanOutcome.message}
                    </p>
                  </div>
                </div>

                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border flex-shrink-0 ${
                  selectedScanResult.data.status === 'Active' || selectedScanResult.data.status === 'Active / Issued'
                    ? 'bg-emerald-500 text-white border-emerald-600'
                    : selectedScanResult.data.status === 'Approved'
                    ? 'bg-blue-600 text-white border-blue-700'
                    : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}>
                  {selectedScanResult.data.status}
                </span>
              </div>

              {/* DETAILS OF SPACE / HARDWARE */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block">
                      {selectedScanResult.type === 'booking' ? 'Laboratory Space Details' : 'Hardware Asset Details'}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5">
                      {selectedScanResult.type === 'booking'
                        ? selectedScanResult.data.roomName
                        : selectedScanResult.data.hardwareName}
                    </h3>
                    <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                      <span className="font-mono font-semibold text-slate-700">
                        {selectedScanResult.type === 'booking'
                          ? selectedScanResult.data.roomCode
                          : selectedScanResult.data.hardwareTag}
                      </span>
                      {selectedScanResult.type === 'loan' && (
                        <>
                          <span>•</span>
                          <span>SN: {selectedScanResult.data.serialNumber}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Requester Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-200/70">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Requester / Student</span>
                    <span className="font-bold text-slate-900">{selectedScanResult.data.userName}</span>
                    <span className="font-mono text-slate-600 block text-[11px] mt-0.5">
                      Matric: {selectedScanResult.data.userMatric}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">
                      {selectedScanResult.type === 'booking' ? 'Reserved Date & Slot' : 'Loan Period'}
                    </span>
                    <span className="font-semibold text-slate-800">
                      {selectedScanResult.type === 'booking'
                        ? `${selectedScanResult.data.date} (${selectedScanResult.data.slot})`
                        : `${selectedScanResult.data.requestDate} → ${selectedScanResult.data.dueDate}`}
                    </span>
                  </div>
                </div>

                {/* Reason & Purpose */}
                <div className="pt-1 text-xs">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Project Reason</span>
                  <p className="text-slate-800 font-medium leading-relaxed bg-white p-2.5 rounded-xl border border-slate-100">
                    &ldquo;{selectedScanResult.data.purpose}&rdquo;
                  </p>
                </div>
              </div>

              {/* ============================================================== */}
              {/* STATUS & ACTIONS: CHECK-IN / CHECK-OUT (SPACE) OR BORROW/RETURN (HARDWARE) */}
              {/* ============================================================== */}
              
              {/* SPACE PASS: CHECK-IN / CHECK-OUT FLOW */}
              {selectedScanResult.type === 'booking' && (
                <div className="p-4 rounded-2xl border border-blue-100 bg-blue-50/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Space Turnstile Status
                      </span>
                      <span className="text-sm font-bold text-slate-900 mt-0.5 block">
                        {selectedScanResult.data.status === 'Approved'
                          ? 'Status: Ready for Check-In'
                          : selectedScanResult.data.status === 'Active'
                          ? 'Status: Currently In-Session (Ready for Check-Out)'
                          : `Status: Session Completed`}
                      </span>
                    </div>

                    <span className={`text-xs font-bold px-3 py-1 rounded-xl ${
                      selectedScanResult.data.status === 'Approved'
                        ? 'bg-amber-100 text-amber-900 border border-amber-200'
                        : selectedScanResult.data.status === 'Active'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}>
                      {selectedScanResult.data.status === 'Approved' ? 'Pending Check-In' : selectedScanResult.data.status === 'Active' ? 'Check-Out Stage' : 'Completed'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 bg-white rounded-xl border border-slate-100">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Check-In Time</span>
                      <span className="font-semibold text-slate-800">
                        {selectedScanResult.data.checkInTime ? `${selectedScanResult.data.date} at ${selectedScanResult.data.checkInTime}` : 'Awaiting Check-In Confirmation'}
                      </span>
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border border-slate-100">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Supposed Check-Out Time</span>
                      <span className="font-semibold text-slate-800">
                        {selectedScanResult.data.checkOutTime || `${selectedScanResult.data.date} at ${selectedScanResult.data.slot.split(' - ')[1] || selectedScanResult.data.slot}`}
                      </span>
                    </div>
                  </div>

                  {/* Automated Turnstile Confirmation Status (Confirmed on Scan) */}
                  <div className="pt-2">
                    <div className="p-3 bg-white rounded-xl border border-emerald-200/90 shadow-xs flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                        <div>
                          <div className="font-bold text-xs text-slate-900">
                            {selectedScanResult.data.status === 'Active'
                              ? 'Check-In Confirmed & Session Active'
                              : 'Check-Out Confirmed & Session Concluded'}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            QR Pass scanned — verified and confirmed automatically.
                          </div>
                        </div>
                      </div>

                      <span className="text-[10px] font-bold font-mono uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-900">
                        {selectedScanResult.data.status === 'Active' ? '[CHECK-IN CONFIRMED]' : '[CHECK-OUT CONFIRMED]'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* HARDWARE LOAN: BORROW / RETURN FLOW */}
              {selectedScanResult.type === 'loan' && (
                <div className="p-4 rounded-2xl border border-indigo-100 bg-indigo-50/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Hardware Lending Status
                      </span>
                      <span className="text-sm font-bold text-slate-900 mt-0.5 block">
                        {selectedScanResult.data.status === 'Pending Approval' || selectedScanResult.data.status === 'Approved'
                          ? 'Status: Ready for Borrow (Physical Issue)'
                          : selectedScanResult.data.status === 'Active / Issued' || selectedScanResult.data.status === 'Overdue'
                          ? 'Status: On Loan (Ready for Return & Condition Audit)'
                          : `Status: Equipment Returned`}
                      </span>
                    </div>

                    <span className={`text-xs font-bold px-3 py-1 rounded-xl ${
                      selectedScanResult.data.status === 'Pending Approval' || selectedScanResult.data.status === 'Approved'
                        ? 'bg-amber-100 text-amber-900 border border-amber-200'
                        : selectedScanResult.data.status === 'Active / Issued'
                        ? 'bg-emerald-500 text-white'
                        : selectedScanResult.data.status === 'Overdue'
                        ? 'bg-rose-500 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}>
                      {selectedScanResult.data.status === 'Pending Approval' ? 'Borrow Stage' : selectedScanResult.data.status === 'Active / Issued' ? 'Return Stage' : selectedScanResult.data.status}
                    </span>
                  </div>

                  {/* Mandatory Condition Checklist */}
                  <div className="p-3 bg-white rounded-2xl border border-slate-200 space-y-2">
                    <span className="text-xs font-bold text-slate-800 block">
                      Mandatory Condition Audit Checklist
                    </span>

                    <div className="space-y-2 text-xs">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checklist.chassisIntact}
                          onChange={(e) => setChecklist({ ...checklist, chassisIntact: e.target.checked })}
                          className="rounded text-blue-600 w-4 h-4"
                        />
                        <span className="text-slate-700">Chassis & ports intact (no physical damage)</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checklist.accessoriesIncluded}
                          onChange={(e) => setChecklist({ ...checklist, accessoriesIncluded: e.target.checked })}
                          className="rounded text-blue-600 w-4 h-4"
                        />
                        <span className="text-slate-700">Accessories, power supply & cables included</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checklist.powersOnWithoutError}
                          onChange={(e) => setChecklist({ ...checklist, powersOnWithoutError: e.target.checked })}
                          className="rounded text-blue-600 w-4 h-4"
                        />
                        <span className="text-slate-700">Powers on without boot error or hardware alarm</span>
                      </label>
                    </div>
                  </div>

                  {/* Return grading (when returning) */}
                  {(selectedScanResult.data.status === 'Active / Issued' || selectedScanResult.data.status === 'Overdue') && (
                    <div className="p-3 bg-white rounded-2xl border border-slate-200 space-y-1.5">
                      <span className="text-[11px] font-semibold text-slate-600 block">
                        Return Physical Condition Assessment
                      </span>
                      <div className="grid grid-cols-4 gap-1.5">
                        {(['Excellent', 'Good', 'Minor Scratches', 'Needs Service'] as const).map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setReturnCondition(c)}
                            className={`py-1.5 rounded-xl text-[10px] font-semibold border transition-all ${
                              returnCondition === c
                                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Automated Lending Confirmation Status (Confirmed on Scan) */}
                  <div className="pt-2">
                    <div className="p-3 bg-white rounded-xl border border-blue-200/90 shadow-xs flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        <div>
                          <div className="font-bold text-xs text-slate-900">
                            {selectedScanResult.data.status === 'Active / Issued'
                              ? 'Borrow Confirmed & Hardware Issued'
                              : 'Return Confirmed & Restocked in Locker'}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            QR Pass scanned — verified and confirmed automatically.
                          </div>
                        </div>
                      </div>

                      <span className="text-[10px] font-bold font-mono uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-900">
                        {selectedScanResult.data.status === 'Active / Issued' ? '[BORROW CONFIRMED]' : '[RETURN CONFIRMED]'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CASE 3: AWAITING SCAN / IDLE STATE IN RIGHT CONTAINER */}
          {!scanOutcome && !selectedScanResult && (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400 min-h-[340px]">
              <div className="w-14 h-14 rounded-3xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto mb-3 text-slate-400">
                <Scan className="w-7 h-7" />
              </div>
              <div className="text-sm font-bold text-slate-700">Awaiting QR Pass Scan</div>
              <div className="text-xs text-slate-400 max-w-sm mt-1.5 leading-relaxed">
                Point device camera at a physical or digital QR pass, upload a QR code image, or enter a manual token code on the left to verify entry or equipment dispatch.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

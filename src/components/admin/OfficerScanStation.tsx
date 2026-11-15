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
            <span className="text-xs font-mono font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
              Live optical turnstile
            </span>
            <span className="text-xs text-slate-300">•</span>
            <span className="text-xs text-slate-500 font-medium">Camera verification scanner</span>
          </div>
          <h1 className="text-lg font-semibold tracking-tight text-slate-900 mt-1">
            Officer QR verification station
          </h1>
        </div>
        <div className="text-right">
          <span className="text-xs font-medium text-slate-700 block">{currentUser.name}</span>
          <span className="text-xs text-slate-500 font-mono">{currentUser.matricOrStaffId} • Technical officer</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
        
        {/* Scanner Viewfinder Column (5 cols) */}
        <div className="md:col-span-5 bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
          
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-blue-600" />
              <span>Camera optical viewfinder</span>
            </span>

            {isCameraActive && (
              <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Live video feed
              </span>
            )}
          </div>

          {/* REAL CAMERA FEED / CANVAS VIEWFINDER */}
          <div
            className={`relative aspect-video rounded-lg bg-slate-950 overflow-hidden flex items-center justify-center border transition-colors ${
              scanOutcome?.status === 'success'
                ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                : scanOutcome?.status === 'failed'
                ? 'border-rose-500 ring-2 ring-rose-500/20'
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
                <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
                  <Scan className="w-5 h-5 opacity-70" />
                </div>
                <div>
                  <div className="text-xs font-medium text-slate-300">Camera scanner off</div>
                  <div className="text-xs text-slate-500 max-w-[220px] mx-auto mt-0.5">
                    Click "Start camera" below to scan QR passes live.
                  </div>
                </div>
              </div>
            )}

            {/* Active Scanning Laser Animation */}
            {isCameraActive && (
              <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4">
                <div className="w-full flex justify-between items-start opacity-70">
                  <div className="w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
                  <div className="w-4 h-4 border-t-2 border-r-2 border-cyan-400" />
                </div>
                <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent scan-laser" />
                <div className="w-full flex justify-between items-end opacity-70">
                  <div className="w-4 h-4 border-b-2 border-l-2 border-cyan-400" />
                  <div className="w-4 h-4 border-b-2 border-r-2 border-cyan-400" />
                </div>
              </div>
            )}
          </div>

          {/* Camera Error Alert if Permission Denied */}
          {cameraError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold">Camera access warning</strong>
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
                className="py-2 px-3 rounded-lg bg-[#002B7F] hover:bg-blue-800 text-white font-medium text-xs transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Start camera</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={stopCamera}
                className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-medium text-xs transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CameraOff className="w-3.5 h-3.5" />
                <span>Stop camera</span>
              </button>
            )}

            {/* Upload QR Image / File Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="py-2 px-3 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-xs transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span>Upload QR file</span>
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
            <label className="text-xs font-medium text-slate-700 block">
              Manual token entry (fallback)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. LP-7842"
                value={inputToken}
                onChange={(e) => setInputToken(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
                className="flex-1 font-mono font-medium text-xs px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:border-slate-400 uppercase tracking-wide"
              />
              <button
                type="button"
                onClick={() => handleLookup()}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer"
              >
                Lookup
              </button>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* RIGHT CONTAINER: SCAN SUCCESSFUL / SCAN FAILED & DETAILS/STATUS */}
        {/* ============================================================== */}
        <div className="md:col-span-7 bg-white rounded-xl p-5 border border-slate-200 shadow-xs min-h-[380px]">
          
          {/* CASE 1: SCAN FAILED IN RIGHT CONTAINER */}
          {scanOutcome?.status === 'failed' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Failed Status Card */}
              <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-950 flex items-start gap-3">
                <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-xs text-rose-900">Scan failed</span>
                    <span className="font-mono text-xs font-semibold tabular-nums px-2 py-0.5 rounded-md bg-white border border-rose-200 text-rose-900">
                      {scanOutcome.code}
                    </span>
                    <span className="text-xs font-mono text-rose-600">{scanOutcome.timestamp}</span>
                  </div>
                  <p className="text-xs text-rose-800 leading-relaxed">
                    {scanOutcome.message}
                  </p>
                </div>
              </div>

              {/* Security & Verification Warning Box */}
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-100 space-y-2 text-xs text-slate-600">
                <span className="text-xs font-medium text-slate-500 block">
                  Turnstile security diagnostic
                </span>
                <ul className="space-y-1.5 text-xs">
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

              {/* Action Buttons to reset */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setScanOutcome(null);
                    setSelectedScanResult(null);
                  }}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Clear screen
                </button>
              </div>
            </div>
          )}

          {/* CASE 2: SCAN SUCCESSFUL IN RIGHT CONTAINER (DETAILS + STATUS) */}
          {scanOutcome?.status === 'success' && selectedScanResult && (
            <div className="space-y-4 animate-in fade-in duration-150">
              
              {/* Scan Successful Header Banner */}
              <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-xs text-emerald-900">Scan successful</span>
                      <span className="font-mono text-xs font-semibold tabular-nums px-2 py-0.5 rounded-md bg-white border border-emerald-200 text-emerald-900">
                        {selectedScanResult.data.tokenCode}
                      </span>
                      <span className="text-xs font-mono text-emerald-700">{scanOutcome.timestamp}</span>
                    </div>
                    <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed">
                      {scanOutcome.message}
                    </p>
                  </div>
                </div>

                <span className={`text-xs font-medium px-2 py-0.5 rounded-md border flex-shrink-0 ${
                  selectedScanResult.data.status === 'Active' || selectedScanResult.data.status === 'Active / Issued'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : selectedScanResult.data.status === 'Approved'
                    ? 'bg-blue-600 text-white border-blue-700'
                    : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}>
                  {selectedScanResult.data.status}
                </span>
              </div>

              {/* DETAILS OF SPACE / HARDWARE */}
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/70 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-medium text-blue-700 block">
                      {selectedScanResult.type === 'booking' ? 'Laboratory space details' : 'Hardware asset details'}
                    </span>
                    <h3 className="text-sm font-semibold text-slate-900 mt-0.5">
                      {selectedScanResult.type === 'booking'
                        ? selectedScanResult.data.roomName
                        : selectedScanResult.data.hardwareName}
                    </h3>
                    <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                      <span className="font-mono font-medium text-slate-700">
                        {selectedScanResult.type === 'booking'
                          ? selectedScanResult.data.roomCode
                          : selectedScanResult.data.hardwareTag}
                      </span>
                      {selectedScanResult.type === 'loan' && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span className="font-mono">SN: {selectedScanResult.data.serialNumber}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Requester Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-200/70">
                  <div>
                    <span className="text-xs font-medium text-slate-500 block">Requester</span>
                    <span className="font-semibold text-slate-900">{selectedScanResult.data.userName}</span>
                    <span className="font-mono text-slate-600 block text-xs mt-0.5">
                      Matric: {selectedScanResult.data.userMatric}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-slate-500 block">
                      {selectedScanResult.type === 'booking' ? 'Reserved date & slot' : 'Loan period'}
                    </span>
                    <span className="font-medium text-slate-800">
                      {selectedScanResult.type === 'booking'
                        ? `${selectedScanResult.data.date} (${selectedScanResult.data.slot})`
                        : `${selectedScanResult.data.requestDate} → ${selectedScanResult.data.dueDate}`}
                    </span>
                  </div>
                </div>

                {/* Reason & Purpose */}
                <div className="pt-1 text-xs">
                  <span className="text-xs font-medium text-slate-500 block mb-1">Purpose</span>
                  <p className="text-slate-800 font-normal leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200/70">
                    &ldquo;{selectedScanResult.data.purpose}&rdquo;
                  </p>
                </div>
              </div>

              {/* ============================================================== */}
              {/* STATUS & ACTIONS: CHECK-IN / CHECK-OUT (SPACE) OR BORROW/RETURN (HARDWARE) */}
              {/* ============================================================== */}
              
              {/* SPACE PASS: CHECK-IN / CHECK-OUT FLOW */}
              {selectedScanResult.type === 'booking' && (
                <div className="p-4 rounded-lg border border-blue-100 bg-blue-50/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-medium text-slate-500 block">
                        Space turnstile status
                      </span>
                      <span className="text-xs font-semibold text-slate-900 mt-0.5 block">
                        {selectedScanResult.data.status === 'Approved'
                          ? 'Ready for check-in'
                          : selectedScanResult.data.status === 'Active'
                          ? 'Session in progress (ready for check-out)'
                          : `Session completed`}
                      </span>
                    </div>

                    <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${
                      selectedScanResult.data.status === 'Approved'
                        ? 'bg-amber-100 text-amber-900 border border-amber-200'
                        : selectedScanResult.data.status === 'Active'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}>
                      {selectedScanResult.data.status === 'Approved' ? 'Pending check-in' : selectedScanResult.data.status === 'Active' ? 'Active session' : 'Completed'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 bg-white rounded-lg border border-slate-200/70">
                      <span className="text-xs font-medium text-slate-500 block">Check-in time</span>
                      <span className="font-mono text-slate-800">
                        {selectedScanResult.data.checkInTime ? `${selectedScanResult.data.date} at ${selectedScanResult.data.checkInTime}` : 'Awaiting check-in confirmation'}
                      </span>
                    </div>
                    <div className="p-2.5 bg-white rounded-lg border border-slate-200/70">
                      <span className="text-xs font-medium text-slate-500 block">Scheduled check-out</span>
                      <span className="font-mono text-slate-800">
                        {selectedScanResult.data.checkOutTime || `${selectedScanResult.data.date} at ${selectedScanResult.data.slot.split(' - ')[1] || selectedScanResult.data.slot}`}
                      </span>
                    </div>
                  </div>

                  {/* Automated Turnstile Confirmation Status (Confirmed on Scan) */}
                  <div className="pt-1">
                    <div className="p-3 bg-white rounded-lg border border-emerald-200 shadow-xs flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-xs text-slate-900">
                            {selectedScanResult.data.status === 'Active'
                              ? 'Check-in confirmed & session active'
                              : 'Check-out confirmed & session concluded'}
                          </div>
                          <div className="text-xs text-slate-500">
                            QR Pass verified and confirmed automatically.
                          </div>
                        </div>
                      </div>

                      <span className="text-xs font-medium font-mono px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800">
                        {selectedScanResult.data.status === 'Active' ? 'Check-in confirmed' : 'Check-out confirmed'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* HARDWARE LOAN: BORROW / RETURN FLOW */}
              {selectedScanResult.type === 'loan' && (
                <div className="p-4 rounded-lg border border-indigo-100 bg-indigo-50/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-medium text-slate-500 block">
                        Hardware lending status
                      </span>
                      <span className="text-xs font-semibold text-slate-900 mt-0.5 block">
                        {selectedScanResult.data.status === 'Pending Approval' || selectedScanResult.data.status === 'Approved'
                          ? 'Ready for issue'
                          : selectedScanResult.data.status === 'Active / Issued' || selectedScanResult.data.status === 'Overdue'
                          ? 'On loan (ready for return and audit)'
                          : `Equipment returned`}
                      </span>
                    </div>

                    <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${
                      selectedScanResult.data.status === 'Pending Approval' || selectedScanResult.data.status === 'Approved'
                        ? 'bg-amber-100 text-amber-900 border border-amber-200'
                        : selectedScanResult.data.status === 'Active / Issued'
                        ? 'bg-emerald-600 text-white'
                        : selectedScanResult.data.status === 'Overdue'
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}>
                      {selectedScanResult.data.status === 'Pending Approval' ? 'Borrow stage' : selectedScanResult.data.status === 'Active / Issued' ? 'Return stage' : selectedScanResult.data.status}
                    </span>
                  </div>

                  {/* Mandatory Condition Checklist */}
                  <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2">
                    <span className="text-xs font-semibold text-slate-800 block">
                      Condition audit checklist
                    </span>

                    <div className="space-y-1.5 text-xs">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checklist.chassisIntact}
                          onChange={(e) => setChecklist({ ...checklist, chassisIntact: e.target.checked })}
                          className="rounded text-blue-600 w-4 h-4"
                        />
                        <span className="text-slate-700">Chassis and ports intact (no physical damage)</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checklist.accessoriesIncluded}
                          onChange={(e) => setChecklist({ ...checklist, accessoriesIncluded: e.target.checked })}
                          className="rounded text-blue-600 w-4 h-4"
                        />
                        <span className="text-slate-700">Accessories, power supply and cables included</span>
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
                    <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1.5">
                      <span className="text-xs font-medium text-slate-600 block">
                        Return condition assessment
                      </span>
                      <div className="grid grid-cols-4 gap-1.5">
                        {(['Excellent', 'Good', 'Minor Scratches', 'Needs Service'] as const).map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setReturnCondition(c)}
                            className={`py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                              returnCondition === c
                                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
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
                  <div className="pt-1">
                    <div className="p-3 bg-white rounded-lg border border-blue-200 shadow-xs flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-xs text-slate-900">
                            {selectedScanResult.data.status === 'Active / Issued'
                              ? 'Borrow confirmed & hardware issued'
                              : 'Return confirmed & restocked in locker'}
                          </div>
                          <div className="text-xs text-slate-500">
                            QR Pass verified and confirmed automatically.
                          </div>
                        </div>
                      </div>

                      <span className="text-xs font-medium font-mono px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-blue-800">
                        {selectedScanResult.data.status === 'Active / Issued' ? 'Borrow confirmed' : 'Return confirmed'}
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
              <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto mb-3 text-slate-400">
                <Scan className="w-6 h-6" />
              </div>
              <div className="text-xs font-semibold text-slate-700">Awaiting QR pass scan</div>
              <div className="text-xs text-slate-500 max-w-sm mt-1 leading-relaxed">
                Point device camera at a QR pass, upload a QR code image, or enter a manual token code on the left to verify entry or equipment dispatch.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

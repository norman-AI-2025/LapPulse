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

  // Process a detected QR code string
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
      setScanOutcome({
        status: 'success',
        code,
        message: `Valid Space Pass verified for ${booking.roomName}`,
        type: 'space',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      });
      setSelectedScanResult({ type: 'booking', data: booking });
      return;
    }

    const loan = loans.find((l) => l.tokenCode.toUpperCase() === code);
    if (loan) {
      sounds.playSuccessChime();
      setScanOutcome({
        status: 'success',
        code,
        message: `Valid Hardware Loan Pass verified for ${loan.hardwareName}`,
        type: 'hardware',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      });
      setSelectedScanResult({ type: 'loan', data: loan });
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
  }, [bookings, loans]);

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
          <p className="text-xs text-slate-500">
            Scan physical or digital QR passes generated by LabPulse to verify entry & device lending.
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs font-semibold text-slate-700 block">{currentUser.name}</span>
          <span className="text-[11px] text-slate-400">{currentUser.matricOrStaffId} • Lab Technical Officer</span>
        </div>
      </div>

      {/* SCAN STATUS OUTCOME BANNER (SUCCESS / FAILED) */}
      {scanOutcome && (
        <div
          className={`p-4 rounded-3xl border transition-all animate-in fade-in slide-in-from-top-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            scanOutcome.status === 'success'
              ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950 shadow-sm'
              : 'bg-rose-50/90 border-rose-300 text-rose-950 shadow-sm'
          }`}
        >
          <div className="flex items-start gap-3">
            {scanOutcome.status === 'success' ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-6 h-6 text-rose-600 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-sm">
                  {scanOutcome.status === 'success' ? 'Scan Successful' : 'Scan Failed'}
                </span>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-white/80 border border-slate-200">
                  {scanOutcome.code}
                </span>
                <span className="text-[10px] opacity-75">{scanOutcome.timestamp}</span>
              </div>
              <p className="text-xs mt-0.5 leading-relaxed opacity-90">
                {scanOutcome.message}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setScanOutcome(null)}
            className="p-1 rounded-lg hover:bg-black/5 text-slate-500 hover:text-slate-800 self-start sm:self-auto"
            title="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

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
            <span className="text-[11px] text-slate-400 mr-1">Quick Test:</span>
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
            <button
              type="button"
              onClick={() => processDecodedCode('LP-INVALID-999')}
              className="font-mono text-[11px] px-2 py-0.5 bg-rose-50 hover:bg-rose-100 rounded-lg text-rose-700 transition-colors"
              title="Test invalid scan failure"
            >
              Test Invalid
            </button>
          </div>
        </div>

        {/* Verification & Checklist Column (7 cols) */}
        <div className="md:col-span-7 bg-white rounded-3xl p-5 border border-slate-200 shadow-sm min-h-[360px]">
          {selectedScanResult ? (
            <div className="space-y-4 animate-in fade-in">
              
              {/* Scan Info Header */}
              <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                      {selectedScanResult.data.tokenCode}
                    </span>
                    <span className="text-xs font-semibold text-slate-400 uppercase">
                      {selectedScanResult.type === 'booking' ? 'Space Pass' : 'Hardware Loan'}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-1">
                    {selectedScanResult.type === 'booking'
                      ? selectedScanResult.data.roomName
                      : selectedScanResult.data.hardwareName}
                  </h3>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Student: <strong>{selectedScanResult.data.userName}</strong> ({selectedScanResult.data.userMatric})
                  </div>
                </div>

                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                  selectedScanResult.data.status === 'Active' || selectedScanResult.data.status === 'Active / Issued'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : selectedScanResult.data.status === 'Approved'
                    ? 'bg-blue-50 text-blue-800 border-blue-200'
                    : selectedScanResult.data.status === 'Overdue'
                    ? 'bg-rose-50 text-rose-800 border-rose-200'
                    : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}>
                  {selectedScanResult.data.status}
                </span>
              </div>

              {/* Space Booking Flow */}
              {selectedScanResult.type === 'booking' && (
                <div className="space-y-3 pt-1">
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Date & Slot</span>
                      <span className="font-semibold text-slate-800">{selectedScanResult.data.date}</span>
                      <span className="font-mono text-slate-600 block mt-0.5">{selectedScanResult.data.slot}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Physical Check-In</span>
                      <span className="font-semibold text-slate-800">
                        {selectedScanResult.data.checkInTime ? `Checked in at ${selectedScanResult.data.checkInTime}` : 'Pending Turnstile Scan'}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-100 text-xs">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Project Reason</span>
                    <p className="text-slate-800 font-medium">{selectedScanResult.data.purpose}</p>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <div className="text-xs text-slate-500">
                      Officer Action:
                    </div>

                    {selectedScanResult.data.status === 'Approved' ? (
                      <button
                        type="button"
                        onClick={handleCheckIn}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
                      >
                        <Check className="w-4 h-4" />
                        <span>Confirm Physical Check-In</span>
                      </button>
                    ) : selectedScanResult.data.status === 'Active' ? (
                      <button
                        type="button"
                        onClick={handleCheckOut}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
                      >
                        <Clock className="w-4 h-4" />
                        <span>Confirm Check-Out (Complete Session)</span>
                      </button>
                    ) : (
                      <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                        Session Closed / Verified
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Hardware Loan Condition Checklist Flow */}
              {selectedScanResult.type === 'loan' && (
                <div className="space-y-3 pt-1">
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Asset Tag & Serial</span>
                      <span className="font-mono font-bold text-slate-800">{selectedScanResult.data.hardwareTag}</span>
                      <span className="text-slate-500 block text-[11px] mt-0.5">SN: {selectedScanResult.data.serialNumber}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Due Return Date</span>
                      <span className="font-semibold text-slate-800">{selectedScanResult.data.dueDate}</span>
                    </div>
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

                  {/* Return grading */}
                  {selectedScanResult.data.status === 'Active / Issued' && (
                    <div className="pt-1">
                      <span className="text-[11px] font-semibold text-slate-600 block mb-1">
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

                  {/* Action buttons */}
                  <div className="pt-3 border-t border-slate-100 flex justify-end">
                    {selectedScanResult.data.status === 'Pending Approval' ? (
                      <button
                        type="button"
                        onClick={handleIssueHardware}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Verify & Issue Hardware</span>
                      </button>
                    ) : selectedScanResult.data.status === 'Active / Issued' || selectedScanResult.data.status === 'Overdue' ? (
                      <button
                        type="button"
                        onClick={handleReturnHardware}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
                      >
                        <Check className="w-4 h-4" />
                        <span>Confirm Return & Update Passport</span>
                      </button>
                    ) : (
                      <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                        Asset Already Returned
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400 min-h-[300px]">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto mb-3 text-slate-400">
                <Scan className="w-6 h-6" />
              </div>
              <div className="text-xs font-semibold text-slate-700">Awaiting QR Scan</div>
              <div className="text-[11px] text-slate-400 max-w-xs mt-1">
                Point camera at a digital pass generated by LabPulse, upload a QR image, or enter a token code to begin physical verification.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

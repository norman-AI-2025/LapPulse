import React, { useState, useEffect, useRef, useCallback } from 'react';
import jsQR from 'jsqr';
import { useLabPulse } from '../../context/LabPulseContext';
import { QRCodeCard } from '../common/QRCodeCard';
import { sounds } from '../../utils/audio';
import { 
  QrCode, 
  Clock, 
  Building2, 
  Cpu, 
  CheckCircle2, 
  Plus,
  Camera,
  X,
  Scan,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Check
} from 'lucide-react';

export const MyPassesModule: React.FC = () => {
  const { 
    currentUser, 
    bookings, 
    loans, 
    cancelBooking, 
    autoCancelExpiredBooking,
    checkInBooking, 
    checkOutBooking,
    verifyAndIssueLoan,
    processReturn,
    setActiveTab
  } = useLabPulse();

  // Filter state: 'all' | 'spaces' | 'devices'
  const [passFilter, setPassFilter] = useState<'all' | 'spaces' | 'devices'>('all');

  const myBookings = bookings.filter((b) => b.userId === currentUser.id);
  const myLoans = loans.filter((l) => l.userId === currentUser.id);

  // Active space booking (Approved awaiting check-in OR Active)
  const approvedBooking = myBookings.find((b) => b.status === 'Approved');
  const activeBooking = myBookings.find((b) => b.status === 'Active');
  const currentSpacePass = approvedBooking || activeBooking;

  // 15-minute grace period countdown timer (in seconds)
  // Default to 15 minutes (900 seconds) when session time has started / approved
  const [deadlineTime, setDeadlineTime] = useState<number>(() => {
    if (approvedBooking?.checkInDeadline) return approvedBooking.checkInDeadline;
    return Date.now() + 15 * 60 * 1000;
  });

  const [secondsRemaining, setSecondsRemaining] = useState<number>(() => {
    return Math.max(0, Math.floor((deadlineTime - Date.now()) / 1000));
  });

  // When approved booking changes, ensure deadline is initialized
  useEffect(() => {
    if (approvedBooking) {
      if (approvedBooking.checkInDeadline) {
        setDeadlineTime(approvedBooking.checkInDeadline);
      } else {
        const newDeadline = Date.now() + 15 * 60 * 1000;
        setDeadlineTime(newDeadline);
      }
    }
  }, [approvedBooking?.id]);

  // Countdown timer tick every second
  useEffect(() => {
    if (!approvedBooking) return;

    const timer = setInterval(() => {
      const remaining = Math.max(0, Math.floor((deadlineTime - Date.now()) / 1000));
      setSecondsRemaining(remaining);

      // AUTO-CANCEL when 15 minutes exceed without scanning QR code
      if (remaining <= 0) {
        clearInterval(timer);
        autoCancelExpiredBooking(approvedBooking.id);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [approvedBooking?.id, deadlineTime, autoCancelExpiredBooking]);

  const formatCountdown = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Helper to calculate end time of slot for space checkout
  const getSlotEndTime = (slotStr: string) => {
    if (slotStr.includes(' - ')) {
      return slotStr.split(' - ')[1].trim();
    }
    return '12:00 PM';
  };

  // Status Badge Fill Styling helper
  const getStatusFillClass = (statusStr: string) => {
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
    if (s.includes('overdue') || s.includes('forfeit') || s.includes('reject') || s.includes('cancel')) {
      return 'bg-rose-500 text-white font-bold shadow-sm';
    }
    return 'bg-slate-100 text-slate-700 font-semibold';
  };

  // =========================================================================
  // CAMERA QR SCANNER MODAL STATE & LOGIC
  // =========================================================================
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [inputToken, setInputToken] = useState('');
  const [scanResult, setScanResult] = useState<{
    status: 'success' | 'failed';
    title: string;
    message: string;
    action: string;
    item: string;
  } | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const stopCamera = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  const handleOpenScanner = (initialToken?: string) => {
    if (initialToken) {
      setInputToken(initialToken);
    } else {
      setInputToken('');
    }
    setScanResult(null);
    setCameraError(null);
    setIsScannerOpen(true);
  };

  const handleCloseScanner = () => {
    stopCamera();
    setIsScannerOpen(false);
    setScanResult(null);
  };

  // Process decoded token (ONLY WAY TO CHECK IN, CHECK OUT, BORROW, RETURN)
  const processToken = useCallback((rawToken: string) => {
    const clean = rawToken.trim().toUpperCase();
    if (!clean) return;

    // 1. Check Space Bookings
    const booking = bookings.find((b) => b.tokenCode.toUpperCase() === clean || b.id === clean);
    if (booking) {
      sounds.playSuccessChime();

      if (booking.status === 'Approved' || booking.status === 'Pending Approval') {
        checkInBooking(booking.tokenCode);
        setScanResult({
          status: 'success',
          title: 'Check-In Confirmed',
          message: `Access granted to ${booking.roomName}. Entrance turnstile unlocked!`,
          action: 'CHECK-IN CONFIRMED',
          item: `${booking.roomName} (${booking.slot})`
        });
      } else if (booking.status === 'Active') {
        checkOutBooking(booking.tokenCode);
        setScanResult({
          status: 'success',
          title: 'Check-Out Confirmed',
          message: `Session concluded for ${booking.roomName}. Exit turnstile unlocked!`,
          action: 'CHECK-OUT CONCLUDED',
          item: `${booking.roomName} (${booking.slot})`
        });
      } else {
        setScanResult({
          status: 'success',
          title: 'Pass Verified',
          message: `Space pass for ${booking.roomName} has already been completed.`,
          action: 'VERIFIED',
          item: `${booking.roomName}`
        });
      }
      return;
    }

    // 2. Check Hardware Loans
    const loan = loans.find((l) => l.tokenCode.toUpperCase() === clean || l.id === clean);
    if (loan) {
      sounds.playSuccessChime();

      if (loan.status === 'Pending Approval') {
        verifyAndIssueLoan(
          loan.tokenCode,
          { chassisIntact: true, accessoriesIncluded: true, powersOnWithoutError: true },
          'Borrow scanned via client verification'
        );
        setScanResult({
          status: 'success',
          title: 'Borrow Confirmed',
          message: `${loan.hardwareName} successfully issued & borrowed. Locker unlocked!`,
          action: 'BORROW CONFIRMED',
          item: `${loan.hardwareName} (Tag: ${loan.hardwareTag})`
        });
      } else if (loan.status === 'Active / Issued' || loan.status === 'Overdue') {
        processReturn(
          loan.tokenCode,
          'Excellent',
          { chassisIntact: true, accessoriesIncluded: true, powersOnWithoutError: true },
          'Return verified on QR scan'
        );
        setScanResult({
          status: 'success',
          title: 'Return Confirmed',
          message: `${loan.hardwareName} successfully returned & restocked in locker!`,
          action: 'RETURN RESTOCKED',
          item: `${loan.hardwareName} (Tag: ${loan.hardwareTag})`
        });
      } else {
        setScanResult({
          status: 'success',
          title: 'Device Verified',
          message: `${loan.hardwareName} is already marked as returned.`,
          action: 'VERIFIED',
          item: `${loan.hardwareName}`
        });
      }
      return;
    }

    // Unrecognized code
    sounds.playErrorBuzzer();
    setScanResult({
      status: 'failed',
      title: 'Invalid Pass Token',
      message: `No active reservation or loan found matching token "${clean}".`,
      action: 'INVALID TOKEN',
      item: clean
    });
  }, [bookings, loans, checkInBooking, checkOutBooking, verifyAndIssueLoan, processReturn]);

  // Frame processing loop for Camera
  const tickCamera = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert'
      });

      if (code && code.data) {
        processToken(code.data);
        stopCamera();
        return;
      }
    }

    animFrameRef.current = requestAnimationFrame(tickCamera);
  }, [processToken, stopCamera]);

  // Start Camera
  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
        animFrameRef.current = requestAnimationFrame(tickCamera);
      }
    } catch {
      setCameraError('Camera access not available or blocked. Please allow camera permissions or use the quick pass scanner below.');
      setCameraActive(false);
    }
  };

  // Start camera when modal opens
  useEffect(() => {
    if (isScannerOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isScannerOpen]);

  // Fast-forward expire for user testing
  const handleSimulateTimeout = () => {
    if (approvedBooking) {
      autoCancelExpiredBooking(approvedBooking.id);
    }
  };

  // Filtered passes
  const showSpaces = passFilter === 'all' || passFilter === 'spaces';
  const showDevices = passFilter === 'all' || passFilter === 'devices';

  const visibleSpacePasses = showSpaces
    ? myBookings.filter((b) => b.status === 'Approved' || b.status === 'Active' || b.status === 'Pending Approval' || b.status === 'Pending Endorsement')
    : [];

  const visibleDevicePasses = showDevices
    ? myLoans.filter((l) => l.status === 'Active / Issued' || l.status === 'Pending Approval')
    : [];

  const totalVisibleCount = visibleSpacePasses.length + visibleDevicePasses.length;

  return (
    <div className="space-y-5 max-w-6xl mx-auto pb-12 animate-in fade-in duration-200">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            My Passes & Loans
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Digital QR admission tokens. Staff & students present their check-in QR pass at the entrance turnstiles or counter stations to get scanned.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Main Scanner Action Button */}
          <button
            onClick={() => handleOpenScanner()}
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Open QR Scanner</span>
          </button>

          <button
            onClick={() => setActiveTab('labs')}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Book Space</span>
          </button>
          
          <button
            onClick={() => setActiveTab('hardware')}
            className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Cpu className="w-3.5 h-3.5 text-blue-600" />
            <span>Borrow Device</span>
          </button>
        </div>
      </div>

      {/* FILTER TABS (All Passes, Spaces, Devices) */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setPassFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              passFilter === 'all'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            All Passes ({myBookings.length + myLoans.length})
          </button>

          <button
            onClick={() => setPassFilter('spaces')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              passFilter === 'spaces'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-blue-500" />
            <span>Space Passes ({myBookings.length})</span>
          </button>

          <button
            onClick={() => setPassFilter('devices')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              passFilter === 'devices'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-indigo-500" />
            <span>Device Passes ({myLoans.length})</span>
          </button>
        </div>

        <span className="text-xs text-slate-400 hidden sm:inline">
          Showing {totalVisibleCount} active pass(es)
        </span>
      </div>

      {/* 15-MINUTE GRACE WATCHDOG BAR (SPACE CHECK-IN TIMER OR ACTIVE SESSION) */}
      {showSpaces && currentSpacePass && (
        <div className={`rounded-3xl p-4 sm:p-5 border transition-all ${
          currentSpacePass.status === 'Active'
            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
            : secondsRemaining < 180
            ? 'bg-rose-50 border-rose-300 text-rose-950'
            : 'bg-amber-50/80 border-amber-200 text-amber-950'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                currentSpacePass.status === 'Active'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-amber-500 text-white'
              }`}>
                {currentSpacePass.status === 'Active' ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <Clock className="w-5 h-5 animate-pulse" />
                )}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-md ${
                    currentSpacePass.status === 'Active'
                      ? 'bg-emerald-200 text-emerald-900'
                      : 'bg-amber-200 text-amber-900'
                  }`}>
                    {currentSpacePass.status === 'Active'
                      ? '[SESSION ACTIVE • CHECKED IN]'
                      : `[15-MIN CHECK-IN TIMER: ${formatCountdown(secondsRemaining)}]`}
                  </span>
                  <span className="text-xs font-bold text-slate-900">
                    {currentSpacePass.roomName} ({currentSpacePass.slot})
                  </span>
                </div>

                <div className="text-xs mt-1 text-slate-600">
                  {currentSpacePass.status === 'Active' ? (
                    <span>
                      Checked in at <strong>{currentSpacePass.checkInTime || '08:05 AM'}</strong> • Supposed Check-Out: <strong>{getSlotEndTime(currentSpacePass.slot)}</strong>. Present your checkout QR pass at the exit turnstile to get scanned upon departure.
                    </span>
                  ) : (
                    <span>
                      Session has started. <strong>Staff/student must get this Check-In QR scanned at the entrance turnstile within {formatCountdown(secondsRemaining)}</strong>. If your QR code is not scanned before time expires, this booking will automatically cancel.
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* SCANNER ACTIONS ONLY - NO BYPASS BUTTONS */}
            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              {currentSpacePass.status === 'Approved' ? (
                <>
                  <button
                    onClick={() => processToken(currentSpacePass.tokenCode)}
                    className="px-4 py-2 rounded-xl bg-[#002B7F] hover:bg-blue-800 text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
                  >
                    <Scan className="w-3.5 h-3.5 text-cyan-300" />
                    <span>Get Check-In QR Scanned</span>
                  </button>

                  {/* Fast-forward test expiration helper */}
                  <button
                    onClick={handleSimulateTimeout}
                    title="Simulate 15-minute grace period expiration"
                    className="px-2.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-500 border border-slate-200 text-[11px] font-medium transition-colors cursor-pointer"
                  >
                    Simulate Expire
                  </button>
                </>
              ) : (
                <button
                  onClick={() => processToken(currentSpacePass.tokenCode)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
                >
                  <Scan className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Get Checkout QR Scanned</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PASS CARDS GRID */}
      {totalVisibleCount === 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center border border-slate-200">
          <QrCode className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-xs font-bold text-slate-800">No Active Passes Found</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            You don&apos;t have any active space or device passes matching this filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          
          {/* 1. SPACE PASSES */}
          {visibleSpacePasses.map((b) => {
            const isScanned = b.status === 'Active' || b.status === 'Completed';

            return (
              <div key={b.id} className="space-y-2">
                <QRCodeCard
                  tokenCode={b.tokenCode}
                  title={b.roomName}
                  subtitle={`Slot: ${b.slot}`}
                  status={b.status}
                  type="space"
                  isScanned={isScanned}
                  scannedInfo={{
                    checkInTimeDate: `${b.date} at ${b.checkInTime || '08:05 AM'}`,
                    supposedCheckOutTimeDate: `${b.date} at ${getSlotEndTime(b.slot)}`
                  }}
                  metaInfo={[
                    { label: 'Space Code', value: b.roomCode },
                    { label: 'Date', value: b.date },
                    { label: 'Booked By', value: b.userName },
                    { label: 'Matric / Staff ID', value: b.userMatric },
                  ]}
                />

                {/* Scan Action Pill Under Each Pass Card */}
                {b.status === 'Approved' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => processToken(b.tokenCode)}
                      className="flex-1 py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Scan className="w-3.5 h-3.5 text-blue-700" />
                      <span>Get Check-In QR Scanned</span>
                    </button>
                    
                    <button
                      onClick={() => cancelBooking(b.id)}
                      className="py-2 px-3 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-700 border border-slate-200 text-xs font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {b.status === 'Active' && (
                  <button
                    onClick={() => processToken(b.tokenCode)}
                    className="w-full py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Scan className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Get Checkout QR Scanned</span>
                  </button>
                )}
              </div>
            );
          })}

          {/* 2. DEVICE / HARDWARE PASSES */}
          {visibleDevicePasses.map((l) => {
            const isScanned = l.status === 'Active / Issued' || l.status === 'Returned';

            return (
              <div key={l.id} className="space-y-2">
                <QRCodeCard
                  tokenCode={l.tokenCode}
                  title={l.hardwareName}
                  subtitle={`Serial: ${l.serialNumber}`}
                  status={l.status}
                  type="hardware"
                  isScanned={isScanned}
                  scannedInfo={{
                    checkInTimeDate: `${l.requestDate} (Issued)`,
                    supposedCheckOutTimeDate: `${l.dueDate} (Return Due)`
                  }}
                  metaInfo={[
                    { label: 'Asset Tag', value: l.hardwareTag },
                    { label: 'Borrower', value: l.userName },
                    { label: 'Issued Date', value: l.requestDate },
                    { label: 'Due Date', value: l.dueDate },
                  ]}
                />

                {/* Scan Action Pill for Hardware: ONLY WAY TO BORROW & RETURN */}
                {l.status === 'Pending Approval' && (
                  <button
                    onClick={() => processToken(l.tokenCode)}
                    className="w-full py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Scan className="w-3.5 h-3.5 text-blue-700" />
                    <span>Get QR Scanned to Borrow</span>
                  </button>
                )}

                {(l.status === 'Active / Issued' || l.status === 'Overdue') && (
                  <button
                    onClick={() => processToken(l.tokenCode)}
                    className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Scan className="w-3.5 h-3.5 text-cyan-300" />
                    <span>Get Return QR Scanned</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ALL HISTORY RECORDS TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm mt-6">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-slate-900">Passes & Verification Registry</h3>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
              ({passFilter.toUpperCase()})
            </span>
          </div>
          <span className="text-[11px] text-slate-400">
            {myBookings.length + myLoans.length} total entries
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 bg-slate-50/50">
                <th className="p-3">Type & Item</th>
                <th className="p-3">Token Code</th>
                <th className="p-3">Check-In / Start</th>
                <th className="p-3">Supposed Check-Out / Due</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Verification Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* Space Records */}
              {showSpaces &&
                myBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-3">
                      <div className="font-semibold text-slate-800">{b.roomName}</div>
                      <div className="text-[10px] text-slate-400">{b.roomCode}</div>
                    </td>
                    <td className="p-3 font-mono font-bold text-slate-700">{b.tokenCode}</td>
                    <td className="p-3 text-slate-600">
                      {b.status === 'Active' || b.status === 'Completed'
                        ? `${b.date} • ${b.checkInTime || '08:05 AM'}`
                        : `${b.date} (Slot: ${b.slot})`}
                    </td>
                    <td className="p-3 text-slate-600 font-medium">
                      {b.date} • {getSlotEndTime(b.slot)}
                    </td>
                    <td className="p-3">
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full ${getStatusFillClass(b.status)}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {b.status === 'Approved' ? (
                        <button
                          onClick={() => processToken(b.tokenCode)}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Scan className="w-3 h-3" />
                          <span>Get Scanned (Check In)</span>
                        </button>
                      ) : b.status === 'Active' ? (
                        <button
                          onClick={() => processToken(b.tokenCode)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 hover:bg-slate-200 font-semibold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Scan className="w-3 h-3" />
                          <span>Get Scanned (Exit)</span>
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Concluded</span>
                      )}
                    </td>
                  </tr>
                ))}

              {/* Device Records */}
              {showDevices &&
                myLoans.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-3">
                      <div className="font-semibold text-slate-800">{l.hardwareName}</div>
                      <div className="text-[10px] text-slate-400">{l.hardwareTag}</div>
                    </td>
                    <td className="p-3 font-mono font-bold text-slate-700">{l.tokenCode}</td>
                    <td className="p-3 text-slate-600">{l.requestDate}</td>
                    <td className="p-3 text-slate-600 font-medium">{l.dueDate}</td>
                    <td className="p-3">
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full ${getStatusFillClass(l.status)}`}>
                        {l.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {l.status === 'Pending Approval' ? (
                        <button
                          onClick={() => processToken(l.tokenCode)}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Scan className="w-3 h-3" />
                          <span>Get Scanned (Borrow)</span>
                        </button>
                      ) : l.status === 'Active / Issued' || l.status === 'Overdue' ? (
                        <button
                          onClick={() => processToken(l.tokenCode)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 hover:bg-slate-200 font-semibold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Scan className="w-3 h-3" />
                          <span>Get Scanned (Return)</span>
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Restocked</span>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* CAMERA & QR PASS SCANNER MODAL                                        */}
      {/* ===================================================================== */}
      {isScannerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh]">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    FCSIT Turnstile & Scanner Station
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Present your check-in or checkout QR pass to get scanned, or simulate scan below
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCloseScanner}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto">
              
              {/* Scan Feedback Banner (if processed) */}
              {scanResult && (
                <div className={`p-4 rounded-2xl border text-xs animate-in fade-in flex items-start gap-3 ${
                  scanResult.status === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                    : 'bg-rose-50 border-rose-200 text-rose-950'
                }`}>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    scanResult.status === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                  }`}>
                    {scanResult.status === 'success' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm">{scanResult.title}</span>
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-white border">
                        {scanResult.action}
                      </span>
                    </div>
                    <p className="mt-1 text-slate-600">{scanResult.message}</p>
                    <div className="text-[11px] font-semibold text-slate-800 mt-1">
                      Target: {scanResult.item}
                    </div>
                  </div>
                </div>
              )}

              {/* Camera Viewfinder */}
              <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-video flex items-center justify-center border border-slate-800 shadow-inner">
                {/* Live Video */}
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
                />
                
                {/* Hidden canvas for image decoding */}
                <canvas ref={canvasRef} className="hidden" />

                {/* Laser scan line overlay */}
                {cameraActive && (
                  <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6">
                    <div className="w-full h-0.5 bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-bounce" />
                    <div className="text-center">
                      <span className="text-[10px] font-mono tracking-wider font-bold text-white/80 bg-slate-900/80 px-2 py-0.5 rounded-full">
                        ALIGN QR CODE IN FRAME
                      </span>
                    </div>
                  </div>
                )}

                {!cameraActive && (
                  <div className="text-center p-6 space-y-2">
                    <Scan className="w-10 h-10 text-slate-600 mx-auto animate-pulse" />
                    <p className="text-xs text-slate-400 font-medium max-w-xs mx-auto">
                      {cameraError || 'Initializing camera stream...'}
                    </p>
                    {cameraError && (
                      <button
                        type="button"
                        onClick={startCamera}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
                      >
                        Retry Camera
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Direct Scanner Input / Simulation (Instant One-Click Pass Verification) */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Scan or Input Pass Token Code
                  </span>
                  <span className="text-[10px] text-slate-400">Scanner Station Port</span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="e.g. LP-7842"
                    value={inputToken}
                    onChange={(e) => setInputToken(e.target.value.toUpperCase())}
                    className="flex-1 px-3 py-2 text-xs font-mono font-bold rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-blue-600"
                  />
                  <button
                    type="button"
                    onClick={() => processToken(inputToken)}
                    disabled={!inputToken.trim()}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Scan className="w-3.5 h-3.5" />
                    <span>Scan Code</span>
                  </button>
                </div>

                {/* Quick Scan Shortcuts for Current User's Passes */}
                {(myBookings.some(b => b.status === 'Approved' || b.status === 'Active') || myLoans.some(l => l.status === 'Pending Approval' || l.status === 'Active / Issued')) && (
                  <div className="pt-2 border-t border-slate-200/80">
                    <span className="text-[10px] font-semibold text-slate-500 block mb-1.5">
                      Fast-Scan Active Pass Tokens (Click to Verify):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {myBookings
                        .filter(b => b.status === 'Approved' || b.status === 'Active')
                        .map(b => (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() => {
                              setInputToken(b.tokenCode);
                              processToken(b.tokenCode);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-blue-500 text-[11px] font-mono font-bold text-blue-700 flex items-center gap-1 transition-colors"
                          >
                            <span>{b.tokenCode}</span>
                            <span className="text-[9px] font-sans text-slate-400">
                              ({b.status === 'Approved' ? 'Check In' : 'Check Out'})
                            </span>
                          </button>
                        ))}

                      {myLoans
                        .filter(l => l.status === 'Pending Approval' || l.status === 'Active / Issued')
                        .map(l => (
                          <button
                            key={l.id}
                            type="button"
                            onClick={() => {
                              setInputToken(l.tokenCode);
                              processToken(l.tokenCode);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-blue-500 text-[11px] font-mono font-bold text-indigo-700 flex items-center gap-1 transition-colors"
                          >
                            <span>{l.tokenCode}</span>
                            <span className="text-[9px] font-sans text-slate-400">
                              ({l.status === 'Pending Approval' ? 'Borrow' : 'Return'})
                            </span>
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 flex items-center justify-end bg-slate-50/50">
              <button
                type="button"
                onClick={handleCloseScanner}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Close Scanner
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

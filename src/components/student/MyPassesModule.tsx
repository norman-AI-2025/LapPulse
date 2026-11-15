import React, { useState, useEffect, useCallback } from 'react';
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
      } else if (booking.status === 'Active') {
        checkOutBooking(booking.tokenCode);
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
      } else if (loan.status === 'Active / Issued' || loan.status === 'Overdue') {
        processReturn(
          loan.tokenCode,
          'Excellent',
          { chassisIntact: true, accessoriesIncluded: true, powersOnWithoutError: true },
          'Return verified on QR scan'
        );
      }
      return;
    }

    sounds.playErrorBuzzer();
  }, [bookings, loans, checkInBooking, checkOutBooking, verifyAndIssueLoan, processReturn]);

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
          <button
            onClick={() => setActiveTab('labs')}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Book Space</span>
          </button>
          
          <button
            onClick={() => setActiveTab('hardware')}
            className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <Cpu className="w-3.5 h-3.5 text-blue-600" />
            <span>Borrow device</span>
          </button>
        </div>
      </div>

      {/* FILTER TABS (All Passes, Spaces, Devices) */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setPassFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              passFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            All passes ({myBookings.length + myLoans.length})
          </button>

          <button
            onClick={() => setPassFilter('spaces')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              passFilter === 'spaces'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-blue-500" />
            <span>Space passes ({myBookings.length})</span>
          </button>

          <button
            onClick={() => setPassFilter('devices')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              passFilter === 'devices'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-indigo-500" />
            <span>Device passes ({myLoans.length})</span>
          </button>
        </div>

        <span className="text-xs text-slate-400 hidden sm:inline font-mono">
          Showing {totalVisibleCount} active pass(es)
        </span>
      </div>

      {/* 15-MINUTE GRACE WATCHDOG BAR (SPACE CHECK-IN TIMER OR ACTIVE SESSION) */}
      {showSpaces && currentSpacePass && (
        <div className={`rounded-xl p-4 sm:p-5 border transition-colors ${
          currentSpacePass.status === 'Active'
            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
            : secondsRemaining < 180
            ? 'bg-rose-50 border-rose-300 text-rose-950'
            : 'bg-amber-50/80 border-amber-200 text-amber-950'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 shadow-xs ${
                currentSpacePass.status === 'Active'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-amber-500 text-white'
              }`}>
                {currentSpacePass.status === 'Active' ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <Clock className="w-5 h-5" />
                )}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-xs font-mono font-medium px-2 py-0.5 rounded-md ${
                    currentSpacePass.status === 'Active'
                      ? 'bg-emerald-200 text-emerald-900'
                      : 'bg-amber-200 text-amber-900'
                  }`}>
                    {currentSpacePass.status === 'Active'
                      ? 'Session active • Checked in'
                      : `Check-in window: ${formatCountdown(secondsRemaining)}`}
                  </span>
                  <span className="text-xs font-semibold text-slate-900">
                    {currentSpacePass.roomName} ({currentSpacePass.slot})
                  </span>
                </div>

                <div className="text-xs mt-1 text-slate-600">
                  {currentSpacePass.status === 'Active' ? (
                    <span>
                      Checked in at <strong className="font-mono">{currentSpacePass.checkInTime || '08:05 AM'}</strong> • Scheduled check-out: <strong className="font-mono">{getSlotEndTime(currentSpacePass.slot)}</strong>. Present checkout pass at exit turnstile upon departure.
                    </span>
                  ) : (
                    <span>
                      Session has started. <strong>Present check-in QR pass at turnstile within {formatCountdown(secondsRemaining)}</strong>. Unclaimed passes will forfeit automatically.
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* SCANNER ACTIONS */}
            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              {currentSpacePass.status === 'Approved' ? (
                <button
                  onClick={() => processToken(currentSpacePass.tokenCode)}
                  className="px-3.5 py-2 rounded-lg bg-[#002B7F] hover:bg-blue-800 text-white text-xs font-medium flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <Scan className="w-3.5 h-3.5 text-cyan-300" />
                  <span>Get check-in QR scanned</span>
                </button>
              ) : (
                <button
                  onClick={() => processToken(currentSpacePass.tokenCode)}
                  className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <Scan className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Get checkout QR scanned</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PASS CARDS GRID */}
      {totalVisibleCount === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center border border-slate-200">
          <QrCode className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <h3 className="text-xs font-semibold text-slate-800">No active passes found</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            You don&apos;t have any active space or device passes matching this filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
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
                      className="flex-1 py-2 px-3 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Scan className="w-3.5 h-3.5 text-blue-700" />
                      <span>Get check-in QR scanned</span>
                    </button>
                    
                    <button
                      onClick={() => cancelBooking(b.id)}
                      className="py-2 px-3 rounded-lg bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-700 border border-slate-200 text-xs font-medium transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {b.status === 'Active' && (
                  <button
                    onClick={() => processToken(b.tokenCode)}
                    className="w-full py-2 px-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Scan className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Get checkout QR scanned</span>
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

                {/* Scan Action Pill for Hardware */}
                {l.status === 'Pending Approval' && (
                  <button
                    onClick={() => processToken(l.tokenCode)}
                    className="w-full py-2 px-3 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Scan className="w-3.5 h-3.5 text-blue-700" />
                    <span>Get QR scanned to borrow</span>
                  </button>
                )}

                {(l.status === 'Active / Issued' || l.status === 'Overdue') && (
                  <button
                    onClick={() => processToken(l.tokenCode)}
                    className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Scan className="w-3.5 h-3.5 text-cyan-300" />
                    <span>Get return QR scanned</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ALL HISTORY RECORDS TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs mt-6">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-semibold text-slate-900">Passes & verification registry</h3>
            <span className="text-xs text-slate-400 font-mono">
              ({passFilter})
            </span>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {myBookings.length + myLoans.length} total entries
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 bg-slate-50/50">
                <th className="p-3">Type & item</th>
                <th className="p-3">Token code</th>
                <th className="p-3">Check-in / start</th>
                <th className="p-3">Scheduled check-out / due</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Verification action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* Space Records */}
              {showSpaces &&
                myBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-3">
                      <div className="font-semibold text-slate-800">{b.roomName}</div>
                      <div className="text-xs font-mono text-slate-400">{b.roomCode}</div>
                    </td>
                    <td className="p-3 font-mono font-medium tabular-nums text-slate-700">{b.tokenCode}</td>
                    <td className="p-3 text-slate-600 font-mono">
                      {b.status === 'Active' || b.status === 'Completed'
                        ? `${b.date} • ${b.checkInTime || '08:05 AM'}`
                        : `${b.date} (${b.slot})`}
                    </td>
                    <td className="p-3 text-slate-600 font-mono font-medium">
                      {b.date} • {getSlotEndTime(b.slot)}
                    </td>
                    <td className="p-3">
                      <span className={`text-xs font-mono font-medium px-2 py-0.5 rounded-md ${getStatusFillClass(b.status)}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {b.status === 'Approved' ? (
                        <button
                          onClick={() => processToken(b.tokenCode)}
                          className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium text-xs inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Scan className="w-3 h-3" />
                          <span>Check in</span>
                        </button>
                      ) : b.status === 'Active' ? (
                        <button
                          onClick={() => processToken(b.tokenCode)}
                          className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 hover:bg-slate-200 font-medium text-xs inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Scan className="w-3 h-3" />
                          <span>Exit</span>
                        </button>
                      ) : (
                        <span className="text-slate-400 text-xs">Concluded</span>
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
                      <div className="text-xs font-mono text-slate-400">{l.hardwareTag}</div>
                    </td>
                    <td className="p-3 font-mono font-medium tabular-nums text-slate-700">{l.tokenCode}</td>
                    <td className="p-3 text-slate-600 font-mono">{l.requestDate}</td>
                    <td className="p-3 text-slate-600 font-mono font-medium">{l.dueDate}</td>
                    <td className="p-3">
                      <span className={`text-xs font-mono font-medium px-2 py-0.5 rounded-md ${getStatusFillClass(l.status)}`}>
                        {l.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {l.status === 'Pending Approval' ? (
                        <button
                          onClick={() => processToken(l.tokenCode)}
                          className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium text-xs inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Scan className="w-3 h-3" />
                          <span>Borrow</span>
                        </button>
                      ) : l.status === 'Active / Issued' || l.status === 'Overdue' ? (
                        <button
                          onClick={() => processToken(l.tokenCode)}
                          className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 hover:bg-slate-200 font-medium text-xs inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Scan className="w-3 h-3" />
                          <span>Return</span>
                        </button>
                      ) : (
                        <span className="text-slate-400 text-xs">Restocked</span>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

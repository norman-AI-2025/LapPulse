import React, { useState, useEffect } from 'react';
import { useLabPulse } from '../../context/LabPulseContext';
import { QRCodeCard } from '../common/QRCodeCard';
import { 
  QrCode, 
  Clock, 
  Calendar, 
  Building2, 
  Cpu, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ShieldCheck, 
  RotateCcw,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';

export const MyPassesModule: React.FC = () => {
  const { 
    currentUser, 
    bookings, 
    loans, 
    cancelBooking, 
    checkInBooking, 
    checkOutBooking,
    setActiveTab,
    markNoShow
  } = useLabPulse();

  // Student specific records
  const myBookings = bookings.filter((b) => b.userId === currentUser.id);
  const myLoans = loans.filter((l) => l.userId === currentUser.id);

  // Simulated live 15-minute grace period countdown
  const [secondsRemaining, setSecondsRemaining] = useState<number>(742); // ~12m 22s

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const activeBooking = myBookings.find((b) => b.status === 'Approved' || b.status === 'Active');

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bento-card rounded-3xl p-5 sm:p-7 border border-slate-200/90 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-[#002B7F] text-xs font-semibold mb-2">
              <QrCode className="w-3.5 h-3.5" />
              <span>Digital Access & Attendance Passes</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              My Active Laboratory & Hardware Passes
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl">
              Cryptographic QR codes for turnstile scan and technical officer hardware issuance. Present these tokens at FCSIT Lab Check-In desks.
            </p>
          </div>

          <div className="text-right">
            <div className="text-xs font-semibold text-slate-500">Student Profile</div>
            <div className="text-sm font-bold text-slate-900 mt-0.5">{currentUser.name}</div>
            <div className="text-xs font-mono text-blue-600 font-semibold">{currentUser.matricOrStaffId}</div>
          </div>
        </div>
      </div>

      {/* 15-MINUTE GRACE PERIOD WATCHDOG BANNER */}
      {activeBooking && (
        <div className={`bento-card rounded-3xl p-5 sm:p-6 border transition-all ${
          activeBooking.status === 'Active'
            ? 'bg-gradient-to-r from-emerald-50 to-teal-50/40 border-emerald-200'
            : secondsRemaining < 300
            ? 'bg-rose-50/90 border-rose-300'
            : 'bg-gradient-to-r from-blue-50 to-indigo-50/40 border-blue-200'
        }`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className={`p-3 rounded-2xl ${
                activeBooking.status === 'Active'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-blue-100 text-[#002B7F]'
              }`}>
                {activeBooking.status === 'Active' ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-700" />
                ) : (
                  <Clock className="w-6 h-6 text-blue-700" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Live Check-In Watchdog Engine
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    activeBooking.status === 'Active'
                      ? 'bg-emerald-200 text-emerald-900'
                      : 'bg-amber-200 text-amber-900'
                  }`}>
                    {activeBooking.status === 'Active' ? 'SESSION VERIFIED' : 'GRACE PERIOD ACTIVE'}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  {activeBooking.roomName} ({activeBooking.slot})
                </h3>
                
                <p className="text-xs text-slate-600 mt-0.5">
                  {activeBooking.status === 'Active' ? (
                    <>Physically checked in at <span className="font-bold text-emerald-800">{activeBooking.checkInTime || '08:05 AM'}</span>. You have access until session end.</>
                  ) : (
                    <>You must physically scan your QR pass with En. Faizal within 15 minutes of session start or the slot is automatically surrendered to the waitlist.</>
                  )}
                </p>
              </div>
            </div>

            {/* Countdown timer & Quick action */}
            <div className="flex items-center gap-3 self-end md:self-center">
              {activeBooking.status !== 'Active' ? (
                <div className="text-center p-3 rounded-2xl bg-white shadow-sm border border-slate-200/90 min-w-[130px]">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Forfeiture Timer</div>
                  <div className={`font-mono text-xl font-black ${
                    secondsRemaining < 300 ? 'text-rose-600 animate-pulse' : 'text-slate-900'
                  }`}>
                    {secondsRemaining > 0 ? formatCountdown(secondsRemaining) : '00:00'}
                  </div>
                  <div className="text-[9px] text-slate-500">Grace Remaining</div>
                </div>
              ) : (
                <button
                  onClick={() => checkOutBooking(activeBooking.id)}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors shadow-sm"
                >
                  Conclude & Check Out
                </button>
              )}

              {/* Quick simulation buttons for the prototype demonstration */}
              {activeBooking.status === 'Approved' && (
                <div className="flex flex-col gap-1.5">
                  <button
                    onClick={() => checkInBooking(activeBooking.tokenCode)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors"
                  >
                    Simulate Physical Scan
                  </button>
                  <button
                    onClick={() => markNoShow(activeBooking.id)}
                    className="px-4 py-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 text-[11px] font-semibold transition-colors"
                    title="Simulate 15-min lapse and slot release"
                  >
                    Simulate No-Show Forfeit
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SECTION: APPROVED QR PASSES (LABS & HARDWARE) */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <QrCode className="w-4 h-4 text-blue-600" />
            Approved Physical QR Passes Ready for Check-In
          </h2>
          <span className="text-xs text-slate-500">Includes 6-character backup code</span>
        </div>

        {myBookings.filter((b) => b.status === 'Approved' || b.status === 'Active').length === 0 &&
         myLoans.filter((l) => l.status === 'Active / Issued' || l.status === 'Pending Approval').length === 0 ? (
          <div className="bento-card rounded-3xl p-8 text-center border border-slate-200">
            <QrCode className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800 text-base">No Active Passes Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              You don&apos;t have any active space reservations or hardware loan passes currently. Book a lab or request equipment from the catalog!
            </p>
            <div className="mt-4 flex items-center justify-center gap-3">
              <button
                onClick={() => setActiveTab('labs')}
                className="px-4 py-2 rounded-xl bg-[#002B7F] text-white text-xs font-semibold hover:bg-blue-800 transition-colors"
              >
                Book Laboratory Space
              </button>
              <button
                onClick={() => setActiveTab('hardware')}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition-colors"
              >
                Explore Hardware Vault
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Lab Space Passes */}
            {myBookings
              .filter((b) => b.status === 'Approved' || b.status === 'Active')
              .map((b) => (
                <div key={b.id} className="relative">
                  <QRCodeCard
                    tokenCode={b.tokenCode}
                    title={b.roomName}
                    subtitle={`Time Slot: ${b.slot}`}
                    status={b.status}
                    metaInfo={[
                      { label: 'Date', value: b.date },
                      { label: 'Room Code', value: b.roomCode },
                      { label: 'Student', value: b.userName },
                      { label: 'Matric', value: b.userMatric },
                    ]}
                  />

                  {/* Cancel button if Approved but not checked in yet */}
                  {b.status === 'Approved' && (
                    <button
                      onClick={() => cancelBooking(b.id)}
                      className="mt-2 w-full py-1.5 rounded-xl text-[11px] font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
                    >
                      Surrender & Cancel Slot
                    </button>
                  )}
                </div>
              ))}

            {/* Hardware Loan Passes */}
            {myLoans
              .filter((l) => l.status === 'Active / Issued' || l.status === 'Pending Approval')
              .map((l) => (
                <div key={l.id} className="relative">
                  <QRCodeCard
                    tokenCode={l.tokenCode}
                    title={l.hardwareName}
                    subtitle={`Serial: ${l.serialNumber}`}
                    status={l.status}
                    metaInfo={[
                      { label: 'Asset Tag', value: l.hardwareTag },
                      { label: 'Due Date', value: l.dueDate },
                      { label: 'Borrower', value: l.userName },
                      { label: 'Token', value: l.tokenCode },
                    ]}
                  />
                </div>
              ))}
          </div>
        )}
      </div>

      {/* SECTION: ALL RESERVATION HISTORY & STATUS PIPELINE */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-sm font-bold text-slate-900">
            Booking & Loan History Records ({myBookings.length + myLoans.length} total)
          </h2>
          <span className="text-xs text-slate-500">Includes Pending Endorsements & Past Sessions</span>
        </div>

        <div className="bento-card rounded-3xl p-5 border border-slate-200/90 overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse min-w-[650px]">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/60">
                <th className="p-3 rounded-l-xl">Type & Item</th>
                <th className="p-3">Token Code</th>
                <th className="p-3">Scheduled Date / Slot</th>
                <th className="p-3">Purpose & Details</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right rounded-r-xl">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* Bookings */}
              {myBookings.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
                        <Building2 className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{b.roomName}</div>
                        <div className="text-[10px] text-slate-500">{b.roomCode}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 font-mono font-bold text-slate-800">{b.tokenCode}</td>
                  <td className="p-3">
                    <div>{b.date}</div>
                    <div className="text-[10px] text-slate-500">{b.slot}</div>
                  </td>
                  <td className="p-3 max-w-xs">
                    <p className="truncate text-slate-700">{b.purpose}</p>
                    {b.supervisorName && (
                      <span className="text-[10px] text-blue-600 block">Supv: {b.supervisorName}</span>
                    )}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        b.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : b.status === 'Approved'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : b.status === 'Pending Endorsement'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : b.status === 'Completed'
                          ? 'bg-slate-100 text-slate-700 border-slate-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {b.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    {b.status === 'Pending Endorsement' || b.status === 'Pending Approval' ? (
                      <button
                        onClick={() => cancelBooking(b.id)}
                        className="text-xs text-rose-600 font-semibold hover:underline"
                      >
                        Cancel
                      </button>
                    ) : b.status === 'Approved' ? (
                      <button
                        onClick={() => checkInBooking(b.tokenCode)}
                        className="text-xs text-emerald-700 font-bold hover:underline"
                      >
                        Check-In
                      </button>
                    ) : (
                      <span className="text-slate-400 text-[11px]">—</span>
                    )}
                  </td>
                </tr>
              ))}

              {/* Hardware Loans */}
              {myLoans.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700">
                        <Cpu className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{l.hardwareName}</div>
                        <div className="text-[10px] text-slate-500">SN: {l.serialNumber}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 font-mono font-bold text-slate-800">{l.tokenCode}</td>
                  <td className="p-3">
                    <div>Issued: {l.requestDate}</div>
                    <div className="text-[10px] text-rose-600 font-medium">Due: {l.dueDate}</div>
                  </td>
                  <td className="p-3 max-w-xs truncate text-slate-700">{l.purpose}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        l.status === 'Active / Issued'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : l.status === 'Pending Approval'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : l.status === 'Returned'
                          ? 'bg-slate-100 text-slate-700 border-slate-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {l.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <span className="text-slate-400 text-[11px]">—</span>
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


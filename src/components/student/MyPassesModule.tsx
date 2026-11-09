import React, { useState, useEffect } from 'react';
import { useLabPulse } from '../../context/LabPulseContext';
import { QRCodeCard } from '../common/QRCodeCard';
import { 
  QrCode, 
  Clock, 
  Building2, 
  Cpu, 
  CheckCircle2, 
  RotateCcw,
  Plus,
  Filter
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

  // Filter state: 'all' | 'spaces' | 'devices'
  const [passFilter, setPassFilter] = useState<'all' | 'spaces' | 'devices'>('all');

  const myBookings = bookings.filter((b) => b.userId === currentUser.id);
  const myLoans = loans.filter((l) => l.userId === currentUser.id);

  // 15-minute grace countdown
  const [secondsRemaining, setSecondsRemaining] = useState<number>(742);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const activeBooking = myBookings.find((b) => b.status === 'Approved' || b.status === 'Active');

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
    if (s.includes('overdue') || s.includes('forfeit') || s.includes('reject')) {
      return 'bg-rose-500 text-white font-bold shadow-sm';
    }
    return 'bg-slate-100 text-slate-700 font-semibold';
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
            Active digital passes and physical check-in records for {currentUser.name}.
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
            className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Cpu className="w-3.5 h-3.5 text-blue-600" />
            <span>Borrow Device</span>
          </button>
        </div>
      </div>

      {/* FILTER TABS (All Passes, Spaces, Devices) as requested */}
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

      {/* Minimal Grace Period Watchdog Bar if space booking is active */}
      {showSpaces && activeBooking && (
        <div className="bg-white rounded-2xl p-4 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${activeBooking.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">
                {activeBooking.roomName} ({activeBooking.slot})
              </div>
              <div className="text-[11px] text-slate-500">
                {activeBooking.status === 'Active'
                  ? `Checked in at ${activeBooking.checkInTime || '08:05 AM'} • Supposed Check-Out: ${getSlotEndTime(activeBooking.slot)}`
                  : `15-minute physical scan window active (${formatCountdown(secondsRemaining)} remaining)`}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeBooking.status === 'Approved' ? (
              <>
                <button
                  onClick={() => checkInBooking(activeBooking.tokenCode)}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors"
                >
                  Check In Pass
                </button>
                <button
                  onClick={() => markNoShow(activeBooking.id)}
                  className="px-3 py-1.5 rounded-xl text-slate-500 hover:bg-slate-100 text-xs font-medium transition-colors"
                >
                  Forfeit Slot
                </button>
              </>
            ) : (
              <button
                onClick={() => checkOutBooking(activeBooking.id)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors"
              >
                Conclude Session
              </button>
            )}
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
                    { label: 'Student', value: b.userName },
                    { label: 'Matric', value: b.userMatric },
                  ]}
                />

                {b.status === 'Approved' && (
                  <button
                    onClick={() => cancelBooking(b.id)}
                    className="w-full py-1 text-[11px] text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    Cancel Reservation
                  </button>
                )}
              </div>
            );
          })}

          {/* 2. DEVICE / HARDWARE PASSES */}
          {visibleDevicePasses.map((l) => {
            const isScanned = l.status === 'Active / Issued' || l.status === 'Returned';

            return (
              <div key={l.id}>
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
              </div>
            );
          })}
        </div>
      )}

      {/* ALL HISTORY RECORDS TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm mt-6">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-slate-900">All Passes & Records History</h3>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">
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
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* Space Records */}
              {showSpaces &&
                myBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/50">
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
                      {b.status === 'Approved' && (
                        <button
                          onClick={() => checkInBooking(b.tokenCode)}
                          className="text-emerald-700 font-semibold hover:underline"
                        >
                          Check In
                        </button>
                      )}
                    </td>
                  </tr>
                ))}

              {/* Device Records */}
              {showDevices &&
                myLoans.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/50">
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
                    <td className="p-3 text-right text-slate-400">—</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

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
  Plus
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

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">My Passes & Loans</h1>
          <p className="text-xs text-slate-500">Active entry passes and equipment tokens for {currentUser.name}.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('labs')}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Book Space</span>
          </button>
        </div>
      </div>

      {/* Minimal Grace Period Watchdog Bar if booking active */}
      {activeBooking && (
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
                  ? `Checked in at ${activeBooking.checkInTime || '08:05 AM'}`
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
                  Check In
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

      {/* Digital QR Passes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {myBookings
          .filter((b) => b.status === 'Approved' || b.status === 'Active')
          .map((b) => (
            <div key={b.id} className="space-y-2">
              <QRCodeCard
                tokenCode={b.tokenCode}
                title={b.roomName}
                subtitle={`Slot: ${b.slot}`}
                status={b.status}
                metaInfo={[
                  { label: 'Date', value: b.date },
                  { label: 'Code', value: b.roomCode },
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
          ))}

        {myLoans
          .filter((l) => l.status === 'Active / Issued' || l.status === 'Pending Approval')
          .map((l) => (
            <div key={l.id}>
              <QRCodeCard
                tokenCode={l.tokenCode}
                title={l.hardwareName}
                subtitle={`Serial: ${l.serialNumber}`}
                status={l.status}
                metaInfo={[
                  { label: 'Tag', value: l.hardwareTag },
                  { label: 'Due', value: l.dueDate },
                  { label: 'Borrower', value: l.userName },
                  { label: 'Token', value: l.tokenCode },
                ]}
              />
            </div>
          ))}
      </div>

      {/* Clean Records Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900">All History Records</h3>
          <span className="text-[11px] text-slate-400">{myBookings.length + myLoans.length} entries</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 bg-slate-50/50">
                <th className="p-3">Item</th>
                <th className="p-3">Token</th>
                <th className="p-3">Date / Slot</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {myBookings.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/50">
                  <td className="p-3 font-semibold text-slate-800">{b.roomName}</td>
                  <td className="p-3 font-mono font-bold text-slate-700">{b.tokenCode}</td>
                  <td className="p-3 text-slate-500">{b.date} • {b.slot}</td>
                  <td className="p-3">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {b.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    {b.status === 'Approved' && (
                      <button
                        onClick={() => checkInBooking(b.tokenCode)}
                        className="text-emerald-700 font-semibold hover:underline"
                      >
                        Check-in
                      </button>
                    )}
                  </td>
                </tr>
              ))}

              {myLoans.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50/50">
                  <td className="p-3 font-semibold text-slate-800">{l.hardwareName}</td>
                  <td className="p-3 font-mono font-bold text-slate-700">{l.tokenCode}</td>
                  <td className="p-3 text-slate-500">Due: {l.dueDate}</td>
                  <td className="p-3">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
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

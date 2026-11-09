import React from 'react';
import { useLabPulse } from '../../context/LabPulseContext';
import { 
  Clock, 
  Users, 
  Zap, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Trash2, 
  Building2, 
  Cpu,
  Sparkles,
  ShieldAlert
} from 'lucide-react';

export const SmartWaitlistModule: React.FC = () => {
  const { 
    waitlist, 
    bookings, 
    leaveWaitlist, 
    releaseToWaitlist, 
    markNoShow,
    currentUser, 
    currentRole 
  } = useLabPulse();

  const activeWaitingList = waitlist.filter((w) => w.status === 'waiting');
  const promotedList = waitlist.filter((w) => w.status === 'promoted');

  // Bookings eligible for waitlist release (Approved or Active slots where waitlist exists)
  const candidateBookings = bookings.filter(
    (b) => b.status === 'Approved' || b.status === 'No-Show / Forfeited'
  );

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bento-card rounded-3xl p-5 sm:p-7 border border-slate-200/90 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-800 text-xs font-semibold mb-2">
              <Clock className="w-3.5 h-3.5" />
              <span>FIFO Real-time Reallocation Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Smart Waitlist & Instant Forfeiture Reallocation
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl">
              When laboratory occupants fail to physically scan into their reserved space within the 15-minute grace window, slots are instantly released to the #1 waitlisted candidate.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center min-w-[110px]">
              <div className="text-[10px] font-bold text-slate-400 uppercase">In Queue</div>
              <div className="text-xl font-bold text-slate-900 mt-0.5">{activeWaitingList.length} Students</div>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-center min-w-[110px]">
              <div className="text-[10px] font-bold text-emerald-700 uppercase">Promoted</div>
              <div className="text-xl font-bold text-emerald-900 mt-0.5">{promotedList.length} Reallocated</div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION: ACTIVE WAITLIST QUEUE */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            Active Waitlist Standby Queue ({activeWaitingList.length})
          </h2>
          <span className="text-xs text-slate-500">Ordered by arrival timestamp</span>
        </div>

        {activeWaitingList.length === 0 ? (
          <div className="bento-card rounded-3xl p-8 text-center border border-slate-200">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
            <h3 className="font-bold text-slate-800 text-sm">No Active Waitlist Queue</h3>
            <p className="text-xs text-slate-500 mt-1">
              All laboratory slots and hardware items are either fulfilled or currently free for immediate booking.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeWaitingList.map((entry) => {
              const isMe = entry.userId === currentUser.id;

              return (
                <div
                  key={entry.id}
                  className={`bento-card rounded-2xl p-4 border transition-all ${
                    isMe ? 'border-blue-400 bg-blue-50/20' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-900 text-white flex items-center gap-1">
                      <span>Queue Position #{entry.position}</span>
                    </span>

                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      {entry.targetType === 'room' ? 'Laboratory Space' : 'Hardware Asset'}
                    </span>
                  </div>

                  <div className="mt-3">
                    <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{entry.targetName}</h4>
                    <p className="text-xs text-blue-700 font-medium mt-0.5">{entry.slotOrDetails}</p>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-slate-800">{isMe ? 'You (Norman Lee)' : entry.userName}</div>
                      <div className="text-[10px] text-slate-400">{entry.userMatric} • {entry.createdAt}</div>
                    </div>

                    {isMe && (
                      <button
                        onClick={() => leaveWaitlist(entry.id)}
                        className="text-xs font-semibold text-rose-600 hover:text-rose-800 p-1 rounded-lg"
                        title="Leave waitlist"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION: 1-CLICK DYNAMIC REALLOCATION DISPATCHER (FOR TESTING & ADMIN) */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              Dynamic Forfeiture & Reallocation Dispatcher
            </h2>
            <p className="text-xs text-slate-500">
              Simulate 15-minute no-show forfeiture to trigger immediate automated pass generation for candidate #1.
            </p>
          </div>
        </div>

        <div className="bento-card rounded-3xl p-5 border border-slate-200/90 overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse min-w-[650px]">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/60">
                <th className="p-3 rounded-l-xl">Reservation</th>
                <th className="p-3">Current Holder</th>
                <th className="p-3">Slot Time</th>
                <th className="p-3">Current Status</th>
                <th className="p-3 text-right rounded-r-xl">Reallocation Trigger</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {candidateBookings.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/50">
                  <td className="p-3">
                    <div className="font-bold text-slate-900">{b.roomName}</div>
                    <div className="font-mono text-[10px] text-slate-500">{b.tokenCode}</div>
                  </td>
                  <td className="p-3">
                    <div className="font-semibold text-slate-800">{b.userName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{b.userMatric}</div>
                  </td>
                  <td className="p-3">{b.slot}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        b.status === 'Approved'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {b.status}
                    </span>
                  </td>
                  <td className="p-3 text-right space-x-2">
                    {b.status === 'Approved' && (
                      <button
                        onClick={() => markNoShow(b.id)}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors"
                      >
                        Simulate 15-Min No-Show
                      </button>
                    )}
                    <button
                      onClick={() => releaseToWaitlist(b.id)}
                      className="px-3 py-1 rounded-lg text-[11px] font-bold bg-[#002B7F] hover:bg-blue-800 text-white transition-colors shadow-sm inline-flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3 text-amber-300" />
                      Promote Next in Line
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION: PROMOTED HISTORY */}
      {promotedList.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-sm font-bold text-slate-900">
              Successfully Promoted Candidates Archive ({promotedList.length})
            </h2>
          </div>

          <div className="bento-card rounded-3xl p-4 border border-emerald-200/80 bg-emerald-50/20">
            <div className="divide-y divide-emerald-100 text-xs">
              {promotedList.map((entry) => (
                <div key={entry.id} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <div>
                      <span className="font-bold text-slate-900">{entry.userName}</span> (
                      {entry.userMatric}) was awarded slot in{' '}
                      <span className="font-semibold text-emerald-800">{entry.targetName}</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    AUTOMATICALLY PROMOTED
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

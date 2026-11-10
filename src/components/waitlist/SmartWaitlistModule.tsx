import React from 'react';
import { useLabPulse } from '../../context/LabPulseContext';
import { 
  Clock, 
  Users, 
  Zap, 
  CheckCircle2, 
  Trash2, 
  Sparkles
} from 'lucide-react';

export const SmartWaitlistModule: React.FC = () => {
  const { 
    waitlist, 
    bookings, 
    leaveWaitlist, 
    releaseToWaitlist, 
    markNoShow,
    currentUser 
  } = useLabPulse();

  const activeWaitingList = waitlist.filter((w) => w.status === 'waiting');
  const promotedList = waitlist.filter((w) => w.status === 'promoted');

  const candidateBookings = bookings.filter(
    (b) => b.status === 'Approved' || b.status === 'No-Show / Forfeited'
  );

  return (
    <div className="space-y-5 max-w-6xl mx-auto pb-12 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Waitlist & Reallocation
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
            {activeWaitingList.length} in Queue
          </span>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
            {promotedList.length} Promoted
          </span>
        </div>
      </div>

      {/* ACTIVE WAITLIST QUEUE */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Standby Queue ({activeWaitingList.length})
        </h2>

        {activeWaitingList.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-slate-200">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-70" />
            <h3 className="text-xs font-bold text-slate-800">No Waitlist Active</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">All laboratory slots and hardware units are available or fulfilled.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeWaitingList.map((entry) => {
              const isMe = entry.userId === currentUser.id;

              return (
                <div
                  key={entry.id}
                  className={`bg-white rounded-2xl p-4 border transition-all ${
                    isMe ? 'border-blue-500 ring-1 ring-blue-500 shadow-sm' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-slate-900 text-white">
                      Position #{entry.position}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase">
                      {entry.targetType === 'room' ? 'Space' : 'Hardware'}
                    </span>
                  </div>

                  <div className="mt-2.5">
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{entry.targetName}</h4>
                    <p className="text-[11px] text-blue-700 font-medium mt-0.5">{entry.slotOrDetails}</p>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-slate-800">{isMe ? 'You (Norman Lee)' : entry.userName}</div>
                      <div className="text-[10px] text-slate-400">{entry.userMatric}</div>
                    </div>

                    {isMe && (
                      <button
                        onClick={() => leaveWaitlist(entry.id)}
                        className="text-xs text-rose-600 hover:text-rose-800 p-1"
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

      {/* DISPATCHER & NO-SHOW REALLOCATION */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3 mt-6">
        <div>
          <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Reallocation & Standby Queue Dispatcher</span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 bg-slate-50/50">
                <th className="p-3">Reservation</th>
                <th className="p-3">Occupant</th>
                <th className="p-3">Slot Time</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {candidateBookings.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/50">
                  <td className="p-3 font-semibold text-slate-800">{b.roomName}</td>
                  <td className="p-3 text-slate-600">{b.userName} ({b.userMatric})</td>
                  <td className="p-3 text-slate-500">{b.slot}</td>
                  <td className="p-3">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 font-semibold text-slate-700">
                      {b.status}
                    </span>
                  </td>
                  <td className="p-3 text-right space-x-2">
                    {b.status === 'Approved' && (
                      <button
                        onClick={() => markNoShow(b.id)}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                      >
                        15-Min No-Show
                      </button>
                    )}
                    <button
                      onClick={() => releaseToWaitlist(b.id)}
                      className="px-3 py-1 rounded-lg text-[11px] font-semibold bg-slate-900 hover:bg-slate-800 text-white"
                    >
                      Promote Candidate #1
                    </button>
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

import React from 'react';
import { useLabPulse } from '../../context/LabPulseContext';
import { 
  Zap, 
  CheckCircle2, 
  Trash2
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Waitlist & Reallocation
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono tabular-nums font-medium px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
            {activeWaitingList.length} in queue
          </span>
          <span className="text-xs font-mono tabular-nums font-medium px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
            {promotedList.length} promoted
          </span>
        </div>
      </div>

      {/* ACTIVE WAITLIST QUEUE */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold text-slate-500">
          Standby queue ({activeWaitingList.length})
        </h2>

        {activeWaitingList.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center border border-slate-200 shadow-xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-70" />
            <h3 className="text-xs font-bold text-slate-800">No waitlist active</h3>
            <p className="text-xs text-slate-400 mt-0.5">All laboratory slots and hardware units are available or fulfilled.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeWaitingList.map((entry) => {
              const isMe = entry.userId === currentUser.id;

              return (
                <div
                  key={entry.id}
                  className={`bg-white rounded-xl p-4 border transition-colors duration-150 ${
                    isMe ? 'border-blue-500 ring-1 ring-blue-500 shadow-xs' : 'border-slate-200 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className="px-2 py-0.5 rounded-md text-xs font-mono tabular-nums font-medium bg-slate-900 text-white">
                      Position #{entry.position}
                    </span>
                    <span className="text-xs font-mono text-slate-500 font-medium">
                      {entry.targetType === 'room' ? 'Space' : 'Hardware'}
                    </span>
                  </div>

                  <div className="mt-2.5">
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{entry.targetName}</h4>
                    <p className="text-xs text-blue-700 font-medium mt-0.5">{entry.slotOrDetails}</p>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-slate-800">{isMe ? 'You (Norman Lee)' : entry.userName}</div>
                      <div className="text-xs font-mono text-slate-400">{entry.userMatric}</div>
                    </div>

                    {isMe && (
                      <button
                        onClick={() => leaveWaitlist(entry.id)}
                        className="text-xs text-rose-600 hover:text-rose-800 p-1 cursor-pointer transition-colors duration-150"
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
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3 mt-6">
        <div>
          <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Reallocation & standby queue dispatcher</span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500 bg-slate-50/50">
                <th className="p-3 font-semibold">Reservation</th>
                <th className="p-3 font-semibold">Occupant</th>
                <th className="p-3 font-semibold">Slot time</th>
                <th className="p-3 font-semibold">Status</th>
                <th className="p-3 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {candidateBookings.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/50 transition-colors duration-150">
                  <td className="p-3 font-semibold text-slate-800">{b.roomName}</td>
                  <td className="p-3 text-slate-600">{b.userName} ({b.userMatric})</td>
                  <td className="p-3 text-slate-500 font-mono tabular-nums">{b.slot}</td>
                  <td className="p-3">
                    <span className="text-xs font-mono tabular-nums px-2 py-0.5 rounded-md bg-slate-100 font-medium text-slate-700">
                      {b.status}
                    </span>
                  </td>
                  <td className="p-3 text-right space-x-2">
                    {b.status === 'Approved' && (
                      <button
                        onClick={() => markNoShow(b.id)}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 cursor-pointer transition-colors duration-150"
                      >
                        15-min no-show
                      </button>
                    )}
                    <button
                      onClick={() => releaseToWaitlist(b.id)}
                      className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white cursor-pointer transition-colors duration-150 shadow-xs"
                    >
                      Promote candidate #1
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

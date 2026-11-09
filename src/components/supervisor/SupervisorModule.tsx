import React, { useState } from 'react';
import { useLabPulse } from '../../context/LabPulseContext';
import { 
  CheckSquare2, 
  Check, 
  X, 
  Clock, 
  Building2 
} from 'lucide-react';

export const SupervisorModule: React.FC = () => {
  const { bookings, endorseBooking, rejectEndorsement, currentUser } = useLabPulse();

  const [notes, setNotes] = useState<Record<string, string>>({});

  const pendingEndorsements = bookings.filter((b) => b.status === 'Pending Endorsement');
  const pastEndorsed = bookings.filter((b) => b.status === 'Approved' && b.isFYP);

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-2">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Supervisor Endorsements</h1>
          <p className="text-xs text-slate-500">Sign off high-resource FYP allocations ({currentUser.name}).</p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
          {pendingEndorsements.length} Pending
        </span>
      </div>

      {/* Pending Queue */}
      <div className="space-y-3">
        {pendingEndorsements.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
            <CheckSquare2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <h3 className="text-xs font-bold text-slate-800">No Pending Requests</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">All student FYP laboratory slots are signed off.</p>
          </div>
        ) : (
          pendingEndorsements.map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-800">
                    {booking.tokenCode}
                  </span>
                  <span className="text-xs font-bold text-slate-900">{booking.userName}</span>
                  <span className="text-[11px] text-slate-400">({booking.userMatric})</span>
                </div>

                <div className="text-xs text-slate-600">
                  <strong className="text-slate-800">{booking.roomName}</strong> • {booking.date} ({booking.slot})
                </div>

                <p className="text-xs text-slate-500 italic">
                  &ldquo;{booking.purpose}&rdquo;
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  onClick={() => rejectEndorsement(booking.id)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium"
                >
                  Decline
                </button>

                <button
                  onClick={() => endorseBooking(booking.id, notes[booking.id] || 'Endorsed by Supervisor')}
                  className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold"
                >
                  Endorse Pass
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Endorsed History */}
      {pastEndorsed.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm mt-6">
          <div className="px-4 py-3 border-b border-slate-100 text-xs font-bold text-slate-800">
            Endorsed History ({pastEndorsed.length})
          </div>
          <div className="divide-y divide-slate-100 text-xs">
            {pastEndorsed.map((b) => (
              <div key={b.id} className="p-3.5 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-800">{b.userName}</span>
                  <span className="text-slate-400 ml-2">{b.roomName} ({b.slot})</span>
                </div>
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Endorsed
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

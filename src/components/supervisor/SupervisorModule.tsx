import React, { useState } from 'react';
import { useLabPulse } from '../../context/LabPulseContext';
import { 
  CheckSquare2, 
  GraduationCap, 
  Check, 
  X, 
  Building2, 
  Clock, 
  UserCheck, 
  AlertCircle, 
  Cpu, 
  MessageSquare,
  Sparkles
} from 'lucide-react';

export const SupervisorModule: React.FC = () => {
  const { 
    bookings, 
    endorseBooking, 
    rejectEndorsement, 
    currentUser 
  } = useLabPulse();

  const [endorsementNotes, setEndorsementNotes] = useState<Record<string, string>>({});
  const [rejectReason, setRejectReason] = useState<Record<string, string>>({});

  // Bookings awaiting supervisor endorsement
  const pendingEndorsements = bookings.filter((b) => b.status === 'Pending Endorsement');
  const pastEndorsed = bookings.filter((b) => b.status === 'Approved' && b.isFYP);

  const handleEndorse = (bookingId: string) => {
    const note = endorsementNotes[bookingId] || 'Endorsed by Prof. Madya Dr. Amir Rudin for FYP GPU training.';
    endorseBooking(bookingId, note);
  };

  const handleReject = (bookingId: string) => {
    const reason = rejectReason[bookingId] || 'Lab capacity allocated for concurrent scheduled class.';
    rejectEndorsement(bookingId, reason);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bento-card rounded-3xl p-5 sm:p-7 border border-slate-200/90 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-800 text-xs font-semibold mb-2">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Academic Supervisor Endorsement Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Coursework & FYP High-Resource Approvals
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl">
              Logged in as <span className="font-bold text-slate-900">{currentUser.name}</span>. Review and sign off high-compute GPU clusters, network sandboxes, and hardware allocations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3.5 rounded-2xl bg-amber-100/60 border border-amber-200 text-center min-w-[120px]">
              <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Pending Action</div>
              <div className="text-2xl font-black text-amber-950 mt-0.5">{pendingEndorsements.length}</div>
              <div className="text-[9px] text-amber-700">Awaiting Sign-off</div>
            </div>
          </div>
        </div>
      </div>

      {/* PENDING ENDORSEMENTS QUEUE */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <CheckSquare2 className="w-4 h-4 text-amber-600" />
            Pending Supervisor Endorsement Queue ({pendingEndorsements.length})
          </h2>
          <span className="text-xs text-slate-500">1-Click Endorsement activates student pass</span>
        </div>

        {pendingEndorsements.length === 0 ? (
          <div className="bento-card rounded-3xl p-8 text-center border border-slate-200">
            <UserCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800 text-base">All Caught Up!</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              There are no pending student FYP space reservations or hardware requests waiting for your signature.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {pendingEndorsements.map((booking) => (
              <div
                key={booking.id}
                className="bento-card rounded-3xl p-5 border border-amber-200/90 bg-gradient-to-br from-white via-white to-amber-50/30 flex flex-col justify-between shadow-sm"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-lg border border-amber-200">
                      {booking.tokenCode}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">Submitted {booking.createdAt}</span>
                  </div>

                  {/* Student & Room Info */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 mb-3 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-slate-900 text-sm">{booking.userName}</div>
                      <span className="font-mono text-blue-700 font-semibold">{booking.userMatric}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{booking.userEmail}</div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Target Facility & Block</span>
                      <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5 mt-0.5">
                        <Building2 className="w-4 h-4 text-blue-600" />
                        <span>{booking.roomName}</span>
                      </div>
                      <div className="text-xs text-slate-500">{booking.date} • {booking.slot}</div>
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Subject / FYP Project</span>
                      <div className="font-semibold text-slate-800">{booking.courseCode || 'WIF3001 Final Year Project'}</div>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Technical Justification</span>
                      <p className="text-xs text-slate-700 bg-amber-50/70 p-2.5 rounded-xl border border-amber-200/60 mt-0.5 leading-relaxed">
                        &ldquo;{booking.purpose}&rdquo;
                      </p>
                    </div>

                    {/* Supervisor Optional Note Input */}
                    <div className="pt-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1 mb-1">
                        <MessageSquare className="w-3 h-3 text-slate-400" />
                        Supervisor Endorsement Remark
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Endorsed for YOLOv8 edge inference benchmark"
                        value={endorsementNotes[booking.id] || ''}
                        onChange={(e) =>
                          setEndorsementNotes({ ...endorsementNotes, [booking.id]: e.target.value })
                        }
                        className="w-full text-xs px-3 py-1.5 rounded-xl border border-slate-200 bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* 1-Click Action Buttons */}
                <div className="mt-5 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleReject(booking.id)}
                    className="py-2.5 px-3 rounded-2xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <X className="w-4 h-4 text-rose-600" />
                    <span>Decline Slot</span>
                  </button>

                  <button
                    onClick={() => handleEndorse(booking.id)}
                    className="py-2.5 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Check className="w-4 h-4 text-white" />
                    <span>1-Click Endorse</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION: ENDORSED FYP RESERVATIONS ARCHIVE */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-sm font-bold text-slate-900">
            Endorsed FYP Laboratory Sessions ({pastEndorsed.length})
          </h2>
          <span className="text-xs text-slate-500">Currently active or approved under your supervision</span>
        </div>

        <div className="bento-card rounded-3xl p-5 border border-slate-200/90 overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/60">
                <th className="p-3 rounded-l-xl">Student & Matric</th>
                <th className="p-3">Laboratory</th>
                <th className="p-3">Scheduled Slot</th>
                <th className="p-3">Endorsement Note</th>
                <th className="p-3 text-right rounded-r-xl">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pastEndorsed.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/50">
                  <td className="p-3">
                    <div className="font-bold text-slate-900">{b.userName}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{b.userMatric}</div>
                  </td>
                  <td className="p-3">
                    <div className="font-semibold text-slate-800">{b.roomName}</div>
                    <div className="text-[10px] text-slate-500">{b.roomCode}</div>
                  </td>
                  <td className="p-3">
                    <div>{b.date}</div>
                    <div className="text-[10px] text-slate-500">{b.slot}</div>
                  </td>
                  <td className="p-3 text-slate-600 italic">
                    &ldquo;{b.endorsementNote || 'Endorsed by Dr. Amir Rudin'}&rdquo;
                  </td>
                  <td className="p-3 text-right">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {b.status}
                    </span>
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


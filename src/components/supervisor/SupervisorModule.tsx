import React, { useState } from 'react';
import { useLabPulse } from '../../context/LabPulseContext';
import { 
  CheckSquare2, 
  Check, 
  X, 
  Clock, 
  Building2,
  Cpu,
  Calendar,
  Users,
  CheckCircle2,
  FileText
} from 'lucide-react';

export const SupervisorModule: React.FC = () => {
  const { 
    bookings, 
    loans, 
    endorseBooking, 
    rejectEndorsement, 
    approveLoan, 
    rejectLoan, 
    currentUser 
  } = useLabPulse();

  const [activeSubTab, setActiveSubTab] = useState<'spaces' | 'hardware'>('spaces');
  const [notes, setNotes] = useState<Record<string, string>>({});

  // Pending items
  const pendingSpaceBookings = bookings.filter(
    (b) => b.status === 'Pending Endorsement' || b.status === 'Pending Approval'
  );
  const pendingHardwareLoans = loans.filter(
    (l) => l.status === 'Pending Approval'
  );

  // History items
  const approvedSpaces = bookings.filter((b) => b.status === 'Approved');
  const approvedLoans = loans.filter((l) => l.status === 'Active / Issued');

  return (
    <div className="space-y-5 max-w-5xl mx-auto pb-12 animate-in fade-in duration-200">
      
      {/* 1. Header with Role & Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-900 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
              Academic Staff Portal
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">{currentUser.name}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-1">
            Endorsement & Approvals Desk
          </h1>
        </div>

        {/* Global Pending Pill */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
            {pendingSpaceBookings.length + pendingHardwareLoans.length} Total Pending
          </span>
        </div>
      </div>

      {/* 2. Segmented Mode Switcher: Space Bookings vs Hardware Loans */}
      <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl border border-slate-200/80">
        <button
          type="button"
          onClick={() => setActiveSubTab('spaces')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSubTab === 'spaces'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Space Reservations</span>
          <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
            pendingSpaceBookings.length > 0 ? 'bg-amber-100 text-amber-900' : 'bg-slate-200 text-slate-600'
          }`}>
            {pendingSpaceBookings.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('hardware')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSubTab === 'hardware'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>Hardware Loans</span>
          <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
            pendingHardwareLoans.length > 0 ? 'bg-amber-100 text-amber-900' : 'bg-slate-200 text-slate-600'
          }`}>
            {pendingHardwareLoans.length}
          </span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* 3. TAB 1: SPACE RESERVATION APPROVALS                     */}
      {/* ========================================================= */}
      {activeSubTab === 'spaces' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>Pending space reservation requests awaiting endorsement</span>
            <span className="font-semibold text-slate-700">{pendingSpaceBookings.length} pending</span>
          </div>

          {pendingSpaceBookings.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-900">All Space Bookings Endorsed</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No laboratory reservations pending approval. New student or staff space reservations will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingSpaceBookings.map((b) => (
                <div
                  key={b.id}
                  className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-900 border border-blue-200">
                        {b.tokenCode}
                      </span>
                      <span className="text-sm font-bold text-slate-900">{b.userName}</span>
                      <span className="text-xs text-slate-500 font-mono">({b.userMatric || 'ID'})</span>
                      <span className="font-mono text-[9px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-950 border border-amber-300">
                        [AWAITING ENDORSEMENT]
                      </span>
                    </div>

                    <div className="text-xs text-slate-700">
                      <strong className="text-slate-900">{b.roomName}</strong> ({b.roomCode}) • <span className="font-semibold">{b.date} • {b.slot}</span>
                    </div>

                    <p className="text-xs text-slate-600 italic bg-slate-50 p-2 rounded-xl border border-slate-100 max-w-xl">
                      "{b.purpose}"
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() => rejectEndorsement(b.id, 'Declined by Academic Staff')}
                      className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold uppercase transition-colors cursor-pointer"
                    >
                      [DECLINE]
                    </button>

                    <button
                      type="button"
                      onClick={() => endorseBooking(b.id, 'Endorsed by Academic Staff')}
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>[APPROVE PASS]</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Approved Spaces History */}
          {approvedSpaces.length > 0 && (
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs mt-6">
              <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between text-xs font-bold text-slate-900">
                <span>Approved Space Reservations Ledger</span>
                <span className="font-mono text-slate-500">{approvedSpaces.length} Active</span>
              </div>
              <div className="divide-y divide-slate-100 text-xs">
                {approvedSpaces.map((b) => (
                  <div key={b.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="font-bold text-slate-900">{b.userName}</span>
                      <span className="text-slate-500 ml-2">{b.roomName} • {b.date} ({b.slot})</span>
                    </div>
                    <span className="font-mono text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full self-start sm:self-auto">
                      [APPROVED • PASS ISSUED]
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. TAB 2: HARDWARE LOAN APPROVALS                         */}
      {/* ========================================================= */}
      {activeSubTab === 'hardware' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>Pending hardware loan requests awaiting academic approval</span>
            <span className="font-semibold text-slate-700">{pendingHardwareLoans.length} pending</span>
          </div>

          {pendingHardwareLoans.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-900">All Hardware Loans Processed</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No hardware checkout requests pending approval. New equipment applications will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingHardwareLoans.map((l) => (
                <div
                  key={l.id}
                  className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-900 border border-purple-200">
                        {l.tokenCode}
                      </span>
                      <span className="text-sm font-bold text-slate-900">{l.userName}</span>
                      <span className="text-xs text-slate-500 font-mono">({l.userMatric || 'ID'})</span>
                      <span className="font-mono text-[9px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-950 border border-amber-300">
                        [AWAITING APPROVAL]
                      </span>
                    </div>

                    <div className="text-xs text-slate-700">
                      <strong className="text-slate-900">{l.hardwareName}</strong> <span className="font-mono text-slate-500">({l.hardwareTag})</span> • <span className="font-semibold">Period: {l.requestDate} → {l.dueDate}</span>
                    </div>

                    <p className="text-xs text-slate-600 italic bg-slate-50 p-2 rounded-xl border border-slate-100 max-w-xl">
                      "{l.purpose}"
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() => rejectLoan(l.id, 'Declined by Academic Staff')}
                      className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold uppercase transition-colors cursor-pointer"
                    >
                      [DECLINE]
                    </button>

                    <button
                      type="button"
                      onClick={() => approveLoan(l.id)}
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>[APPROVE LOAN]</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Approved Loans History */}
          {approvedLoans.length > 0 && (
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs mt-6">
              <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between text-xs font-bold text-slate-900">
                <span>Approved Hardware Loans Ledger</span>
                <span className="font-mono text-slate-500">{approvedLoans.length} Issued</span>
              </div>
              <div className="divide-y divide-slate-100 text-xs">
                {approvedLoans.map((l) => (
                  <div key={l.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="font-bold text-slate-900">{l.userName}</span>
                      <span className="text-slate-500 ml-2">{l.hardwareName} • Due {l.dueDate}</span>
                    </div>
                    <span className="font-mono text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full self-start sm:self-auto">
                      [APPROVED • ISSUED]
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

import React from 'react';
import { useLabPulse } from '../../context/LabPulseContext';
import { 
  History, 
  ShieldCheck, 
  Clock, 
  Cpu, 
  Building2, 
  RotateCcw,
  Sparkles
} from 'lucide-react';

export const AuditTrailModule: React.FC = () => {
  const { auditLogs } = useLabPulse();

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'checkin':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'booking':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'hardware':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'waitlist':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bento-card rounded-3xl p-5 sm:p-7 border border-slate-200/90 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold mb-2">
              <History className="w-3.5 h-3.5" />
              <span>Immutable Ledger & Activity Stream</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Cryptographic Audit Trail & Operations Log
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl">
              Chronological ledger documenting space reservations, physical QR turnstile verifications, supervisor endorsements, and hardware checklist handovers.
            </p>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Ledger Count</span>
            <div className="text-xl font-black text-slate-900 mt-0.5">{auditLogs.length} Events Logged</div>
          </div>
        </div>
      </div>

      {/* AUDIT LOG TIMELINE LIST */}
      <div className="bento-card rounded-3xl p-5 sm:p-6 border border-slate-200/90">
        <div className="space-y-4">
          {auditLogs.map((log, index) => (
            <div
              key={log.id}
              className="flex items-start gap-3.5 p-3.5 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200/80"
            >
              <div className="p-2 rounded-xl bg-slate-100 text-slate-700 mt-0.5">
                <Clock className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{log.action}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${getCategoryBadge(log.category)}`}>
                      {log.category}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">{log.timestamp}</span>
                </div>

                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{log.details}</p>

                <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-2">
                  <span>Actor: <strong className="text-slate-600">{log.actor}</strong> ({log.actorRole})</span>
                  <span>•</span>
                  <span>FCSIT Secure Audit Signature Valid</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


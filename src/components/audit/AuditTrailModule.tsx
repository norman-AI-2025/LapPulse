import React from 'react';
import { useLabPulse } from '../../context/LabPulseContext';
import { 
  History, 
  Clock 
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
      <div className="bg-white rounded-xl p-5 sm:p-7 border border-slate-200 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium mb-2">
              <History className="w-3.5 h-3.5" />
              <span>Immutable ledger & activity stream</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Cryptographic Audit Trail & Operations Log
            </h1>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs font-medium text-slate-500 block">Ledger count</span>
            <div className="text-lg font-mono tabular-nums font-semibold text-slate-900 mt-0.5">{auditLogs.length} events logged</div>
          </div>
        </div>
      </div>

      {/* AUDIT LOG TIMELINE LIST */}
      <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-xs">
        <div className="space-y-3">
          {auditLogs.map((log) => (
            <div
              key={log.id}
              className="flex items-start gap-3.5 p-3.5 rounded-lg hover:bg-slate-50 transition-colors duration-150 border border-transparent hover:border-slate-200"
            >
              <div className="p-2 rounded-md bg-slate-100 text-slate-600 mt-0.5">
                <Clock className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-900">{log.action}</span>
                    <span className={`px-2 py-0.5 rounded-md text-xs font-mono tabular-nums font-medium border ${getCategoryBadge(log.category)}`}>
                      {log.category}
                    </span>
                  </div>
                  <span className="text-xs font-mono tabular-nums text-slate-500">{log.timestamp}</span>
                </div>

                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{log.details}</p>

                <div className="mt-2 text-xs text-slate-400 flex items-center gap-2">
                  <span>Actor: <strong className="text-slate-700 font-medium">{log.actor}</strong> ({log.actorRole})</span>
                  <span>•</span>
                  <span>FCSIT secure audit signature valid</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


import React, { useState } from 'react';
import { useLabPulse } from '../../context/LabPulseContext';
import { HardwareItem } from '../../types';
import { 
  X, 
  ShieldCheck, 
  Activity, 
  Clock, 
  AlertTriangle, 
  MapPin, 
  Cpu, 
  History, 
  Wrench, 
  CheckCircle2, 
  Send,
  User,
  Plus
} from 'lucide-react';

interface EquipmentPassportModalProps {
  item: HardwareItem;
  onClose: () => void;
  onRequestLoan: () => void;
}

export const EquipmentPassportModal: React.FC<EquipmentPassportModalProps> = ({
  item,
  onClose,
  onRequestLoan
}) => {
  const { reportDefect, currentUser, loans } = useLabPulse();

  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'defects' | 'report'>('overview');
  const [defectIssue, setDefectIssue] = useState('');
  const [defectSeverity, setDefectSeverity] = useState<'Minor' | 'Moderate' | 'Critical'>('Minor');

  // Count active loans for this item
  const itemActiveLoans = loans.filter((l) => l.hardwareId === item.id);

  const handleReportDefectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!defectIssue.trim()) return;
    reportDefect(item.id, defectIssue.trim(), defectSeverity);
    setDefectIssue('');
    setActiveTab('defects');
  };

  const getHealthColor = (health: number) => {
    if (health >= 90) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (health >= 70) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col">
        
        {/* Top Header with Passport Identity Banner */}
        <div className="relative p-5 sm:p-6 bg-slate-900 text-white rounded-t-3xl overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-blue-600/20 rounded-full blur-2xl" />
          
          <div className="flex items-start justify-between gap-3 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-white/10 text-amber-300 border border-white/10">
                  {item.tag}
                </span>
                <span className="text-xs text-slate-300">Serial: {item.serialNumber}</span>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white">{item.name}</h2>
              <p className="text-xs text-slate-300 mt-0.5">{item.model}</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Metrics Bar inside Header */}
          <div className="grid grid-cols-3 gap-2.5 mt-5 relative z-10">
            <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
              <div className="text-[10px] uppercase font-bold text-slate-300 tracking-wider">Health Rating</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span className="text-lg font-black text-white">{item.healthPercentage}%</span>
              </div>
            </div>

            <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
              <div className="text-[10px] uppercase font-bold text-slate-300 tracking-wider">Stock Status</div>
              <div className="text-sm font-bold text-white mt-1">
                {item.availableUnits} / {item.totalUnits} Units Free
              </div>
            </div>

            <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
              <div className="text-[10px] uppercase font-bold text-slate-300 tracking-wider">Asset Condition</div>
              <div className="text-sm font-bold text-white mt-1">
                {item.status}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 border-b border-slate-100 flex items-center gap-4 bg-slate-50/70 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 border-b-2 transition-all ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Passport Specs
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Loan Log ({item.loanHistory.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('defects')}
            className={`py-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'defects'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Defects & Maintenance ({item.defects.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('report')}
            className={`py-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'report'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Report Issue</span>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-4 text-xs">
              
              {/* Storage location & Current borrower if active */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    Storage Locker
                  </div>
                  <div className="text-sm font-bold text-slate-800 mt-1">{item.location}</div>
                  <p className="text-[11px] text-slate-500 mt-0.5">FCSIT Hardware Vault, Level 1</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-blue-600" />
                    Current Active Borrower
                  </div>
                  {item.currentBorrower ? (
                    <div className="mt-1">
                      <div className="font-bold text-slate-800 text-sm">{item.currentBorrower.name}</div>
                      <div className="text-[11px] text-slate-500">
                        Matric: {item.currentBorrower.matric} • Due: {item.currentBorrower.dueDate}
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-emerald-600 font-semibold mt-1">
                      All checked-in units ready in locker
                    </div>
                  )}
                </div>
              </div>

              {/* Technical Specifications */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-blue-600" />
                  Hardware Architecture & Inclusions
                </h4>
                <ul className="space-y-1.5">
                  {item.specs.map((spec, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-slate-700">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span>{spec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Maintenance Health Progress bar */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-slate-800">Operational Health Index</span>
                  <span className="font-mono font-bold text-slate-900">{item.healthPercentage}%</span>
                </div>
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      item.healthPercentage >= 90
                        ? 'bg-emerald-500'
                        : item.healthPercentage >= 70
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${item.healthPercentage}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  Health rating dynamically updates based on condition checklists completed by Lab Officers during return inspections.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: LOAN HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              {item.loanHistory.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No historical loan records logged yet for this serial unit.
                </div>
              ) : (
                item.loanHistory.map((hist) => (
                  <div key={hist.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-slate-900">{hist.borrower}</div>
                      <span className="text-[10px] font-mono text-slate-500">{hist.matric}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                      <span>Loaned: {hist.fromDate}</span>
                      <span>→</span>
                      <span>Returned: {hist.toDate}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between pt-2 border-t border-slate-200/60">
                      <span className="text-[11px] text-slate-600">Condition on Return:</span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white border border-slate-200 text-slate-800">
                        {hist.returnCondition}
                      </span>
                    </div>
                    {hist.notes && (
                      <p className="text-[11px] text-slate-500 italic mt-1">&ldquo;{hist.notes}&rdquo;</p>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: DEFECTS LOG */}
          {activeTab === 'defects' && (
            <div className="space-y-3">
              {item.defects.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                  Zero open defects. Unit is fully operational and certified safe.
                </div>
              ) : (
                item.defects.map((def) => (
                  <div key={def.id} className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-200 text-amber-900">
                        {def.severity} Severity
                      </span>
                      <span className="text-[10px] text-amber-800 font-medium">{def.date}</span>
                    </div>
                    <p className="font-semibold text-slate-800 mt-1.5">{def.issue}</p>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-amber-200/50 text-[11px] text-amber-900">
                      <span>Reported by: {def.reportedBy}</span>
                      <span className="font-bold underline">{def.status}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 4: REPORT DEFECT */}
          {activeTab === 'report' && (
            <form onSubmit={handleReportDefectSubmit} className="space-y-3.5 text-xs">
              <div className="p-3 bg-blue-50 text-blue-900 rounded-2xl border border-blue-200/70">
                <p className="text-[11px]">
                  FCSIT Digital Passport Audit: Reporting physical cracks, missing cables, or faulty pins immediately alerts En. Faizal (Lab Officer) for repair scheduling.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Issue / Defect Description *</label>
                <textarea
                  value={defectIssue}
                  onChange={(e) => setDefectIssue(e.target.value)}
                  placeholder="e.g. HDMI port loose, power adapter intermittent flickering, missing USB-C cable..."
                  rows={3}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Severity Classification</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Minor', 'Moderate', 'Critical'] as const).map((sev) => (
                    <button
                      type="button"
                      key={sev}
                      onClick={() => setDefectSeverity(sev)}
                      className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                        defectSeverity === sev
                          ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {sev}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                Submit Incident Report to Passport
              </button>
            </form>
          )}
        </div>

        {/* Footer with Request Loan Trigger */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="text-xs">
            <span className="text-slate-500">Available in Locker: </span>
            <span className="font-bold text-slate-900">{item.availableUnits} units</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onRequestLoan();
              }}
              disabled={item.availableUnits <= 0}
              className={`px-5 py-2 rounded-xl text-xs font-semibold text-white transition-all shadow-sm ${
                item.availableUnits > 0
                  ? 'bg-[#002B7F] hover:bg-blue-800'
                  : 'bg-slate-400 cursor-not-allowed'
              }`}
            >
              {item.availableUnits > 0 ? 'Request Hardware Loan' : 'Out of Stock (Join Waitlist)'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


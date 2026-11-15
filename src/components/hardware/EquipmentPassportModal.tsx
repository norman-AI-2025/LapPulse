import React, { useState } from 'react';
import { useLabPulse } from '../../context/LabPulseContext';
import { HardwareItem } from '../../types';
import { 
  X, 
  Activity, 
  MapPin, 
  Cpu, 
  History, 
  Wrench, 
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
  const { reportDefect } = useLabPulse();

  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'defects' | 'report'>('overview');
  const [defectIssue, setDefectIssue] = useState('');
  const [defectSeverity, setDefectSeverity] = useState<'Minor' | 'Moderate' | 'Critical'>('Minor');

  const handleReportDefectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!defectIssue.trim()) return;
    reportDefect(item.id, defectIssue.trim(), defectSeverity);
    setDefectIssue('');
    setActiveTab('defects');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs tabular-nums font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-200">
                {item.tag}
              </span>
              <span className="text-xs font-mono tabular-nums text-slate-500">SN: {item.serialNumber}</span>
            </div>
            <h2 className="text-base font-bold text-slate-900">{item.name}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{item.model}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors duration-150 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Minimal Stats */}
        <div className="grid grid-cols-3 gap-2 px-5 py-3 bg-slate-50 border-b border-slate-100 text-xs">
          <div>
            <div className="text-xs font-medium text-slate-500">Health index</div>
            <div className="text-sm font-mono tabular-nums font-semibold text-slate-900 mt-0.5">{item.healthPercentage}%</div>
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500">Availability</div>
            <div className="text-sm font-mono tabular-nums font-semibold text-slate-900 mt-0.5">{item.availableUnits} / {item.totalUnits} units</div>
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500">Status</div>
            <div className="text-sm font-semibold text-slate-900 mt-0.5">{item.status}</div>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="px-5 border-b border-slate-100 flex items-center gap-4 text-xs font-medium">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2.5 border-b-2 transition-colors duration-150 cursor-pointer ${
              activeTab === 'overview' ? 'border-slate-900 text-slate-900 font-semibold' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Specifications
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-2.5 border-b-2 transition-colors duration-150 cursor-pointer ${
              activeTab === 'history' ? 'border-slate-900 text-slate-900 font-semibold' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Loans ({item.loanHistory.length})
          </button>
          <button
            onClick={() => setActiveTab('defects')}
            className={`py-2.5 border-b-2 transition-colors duration-150 cursor-pointer ${
              activeTab === 'defects' ? 'border-slate-900 text-slate-900 font-semibold' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Defects ({item.defects.length})
          </button>
          <button
            onClick={() => setActiveTab('report')}
            className={`py-2.5 border-b-2 transition-colors duration-150 cursor-pointer ${
              activeTab === 'report' ? 'border-slate-900 text-slate-900 font-semibold' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            + Report
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-3 text-xs">
          {activeTab === 'overview' && (
            <div className="space-y-3">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                <span className="text-slate-500">Storage location</span>
                <span className="font-semibold text-slate-800">{item.location}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
                <div className="font-semibold text-slate-800 mb-1">Specifications</div>
                {item.specs.map((s, idx) => (
                  <div key={idx} className="text-slate-600 flex items-center gap-1.5">
                    <span className="text-slate-400">•</span>
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-2">
              {item.loanHistory.length === 0 ? (
                <div className="text-center py-6 text-slate-400">No loan history yet.</div>
              ) : (
                item.loanHistory.map((h) => (
                  <div key={h.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-800">{h.borrower}</div>
                      <div className="text-xs font-mono tabular-nums text-slate-400">{h.fromDate} → {h.toDate}</div>
                    </div>
                    <span className="text-xs font-mono tabular-nums font-medium px-2 py-0.5 rounded-md bg-white border border-slate-200">
                      {h.returnCondition}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'defects' && (
            <div className="space-y-2">
              {item.defects.length === 0 ? (
                <div className="text-center py-6 text-slate-400">No reported defects. Unit in good condition.</div>
              ) : (
                item.defects.map((d) => (
                  <div key={d.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800">{d.issue}</span>
                      <span className="text-xs font-mono font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        {d.severity}
                      </span>
                    </div>
                    <div className="text-xs font-mono tabular-nums text-slate-400">{d.reportedBy} • {d.date}</div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'report' && (
            <form onSubmit={handleReportDefectSubmit} className="space-y-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Issue description</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Describe damage, missing cables, or hardware failure..."
                  value={defectIssue}
                  onChange={(e) => setDefectIssue(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Severity</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Minor', 'Moderate', 'Critical'] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setDefectSeverity(s)}
                      className={`py-1.5 rounded-lg text-xs font-medium border transition-colors duration-150 cursor-pointer ${
                        defectSeverity === s ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 rounded-lg bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition-colors duration-150 shadow-xs cursor-pointer"
              >
                Submit incident report
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg transition-colors duration-150 cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={() => {
              onClose();
              onRequestLoan();
            }}
            disabled={item.availableUnits <= 0}
            className={`px-4 py-2 text-xs font-semibold rounded-lg text-white transition-colors duration-150 shadow-xs ${
              item.availableUnits > 0 ? 'bg-slate-900 hover:bg-slate-800 cursor-pointer' : 'bg-slate-300 cursor-not-allowed'
            }`}
          >
            {item.availableUnits > 0 ? 'Request loan' : 'Out of stock'}
          </button>
        </div>
      </div>
    </div>
  );
};

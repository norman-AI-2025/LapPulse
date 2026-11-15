import React, { useState } from 'react';
import { useLabPulse } from '../../context/LabPulseContext';
import { HardwareItem } from '../../types';
import { X, Calendar } from 'lucide-react';

interface LoanRequestModalProps {
  item: HardwareItem;
  onClose: () => void;
}

export const LoanRequestModal: React.FC<LoanRequestModalProps> = ({ item, onClose }) => {
  const { currentUser, requestLoan, reports } = useLabPulse();
  const isUnderRepair = item.status === 'Under Maintenance' || reports.some(r => r.type === 'HARDWARE' && r.targetId === item.id && r.status === 'IN REPAIR');

  const defaultDueDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  };

  const [dueDate, setDueDate] = useState<string>(defaultDueDate());
  const [purpose, setPurpose] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!purpose.trim()) return;

    requestLoan({
      hardwareId: item.id,
      purpose: purpose.trim(),
      dueDate
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-start justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">{item.name}</h3>
            <p className="text-xs text-slate-500 font-mono tabular-nums mt-0.5">Tag: {item.tag} • Serial: {item.serialNumber}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors duration-150 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          {isUnderRepair && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs">
              <span className="font-semibold block">Asset under repair</span>
              <span>This hardware unit is undergoing maintenance. Loan applications are temporarily closed.</span>
            </div>
          )}
          <div>
            <label className="block font-medium text-slate-700 mb-1">Return due date</label>
            <input
              type="date"
              required
              min={new Date().toISOString().split('T')[0]}
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full text-xs font-mono font-medium px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-slate-400"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Purpose / project</label>
            <textarea
              required
              rows={2}
              placeholder="e.g. FYP edge vision deployment, robotics coursework..."
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-slate-400"
            />
          </div>

          <div className="p-2.5 bg-slate-50 rounded-lg text-slate-500 text-xs border border-slate-100">
            Borrower: <strong className="text-slate-800 font-medium">{currentUser.name}</strong> <span className="font-mono">({currentUser.matricOrStaffId})</span>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium text-xs transition-colors duration-150 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUnderRepair}
              className={`px-4 py-2 font-semibold text-xs rounded-lg transition-colors duration-150 ${
                isUnderRepair
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-slate-900 hover:bg-slate-800 text-white cursor-pointer shadow-xs'
              }`}
            >
              {isUnderRepair ? 'Under repair • disabled' : 'Submit for staff approval'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useLabPulse } from '../../context/LabPulseContext';
import { HardwareItem } from '../../types';
import { X, Calendar } from 'lucide-react';

interface LoanRequestModalProps {
  item: HardwareItem;
  onClose: () => void;
}

export const LoanRequestModal: React.FC<LoanRequestModalProps> = ({ item, onClose }) => {
  const { currentUser, requestLoan } = useLabPulse();

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-start justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">{item.name}</h3>
            <p className="text-xs text-slate-400 mt-0.5">Tag: {item.tag} • Serial: {item.serialNumber}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Return Due Date</label>
            <input
              type="date"
              required
              min={new Date().toISOString().split('T')[0]}
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-slate-400"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Purpose / Project</label>
            <textarea
              required
              rows={2}
              placeholder="e.g. FYP edge vision deployment, robotics coursework..."
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-slate-400"
            />
          </div>

          <div className="p-3 bg-slate-50 rounded-xl text-slate-500 text-[11px]">
            Borrower: <strong className="text-slate-800">{currentUser.name}</strong> ({currentUser.matricOrStaffId})
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-slate-500 hover:bg-slate-100 rounded-xl font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-colors"
            >
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

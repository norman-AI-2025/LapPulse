import React, { useState } from 'react';
import { useLabPulse } from '../../context/LabPulseContext';
import { HardwareItem } from '../../types';
import { 
  X, 
  Calendar, 
  Cpu, 
  ShieldCheck, 
  Sparkles, 
  AlertCircle 
} from 'lucide-react';

interface LoanRequestModalProps {
  item: HardwareItem;
  onClose: () => void;
}

export const LoanRequestModal: React.FC<LoanRequestModalProps> = ({
  item,
  onClose
}) => {
  const { currentUser, requestLoan, joinWaitlist } = useLabPulse();

  // Default return due date is 14 days from today
  const defaultDueDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  };

  const [dueDate, setDueDate] = useState<string>(defaultDueDate());
  const [purpose, setPurpose] = useState<string>('');
  const [agreedToTerms, setAgreedToTerms] = useState<boolean>(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!purpose.trim()) return;

    const result = requestLoan({
      hardwareId: item.id,
      purpose: purpose.trim(),
      dueDate
    });

    if (result.success) {
      onClose();
    }
  };

  const handleWaitlist = () => {
    joinWaitlist('hardware', item.id, item.name, item.tag, new Date().toISOString().split('T')[0]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-blue-700 font-bold uppercase tracking-wider">
              <Cpu className="w-3.5 h-3.5" />
              <span>FCSIT Hardware Lending Request</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-1">{item.name}</h3>
            <p className="text-xs text-slate-500 font-mono">Tag: {item.tag} • Serial: {item.serialNumber}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          
          {item.availableUnits <= 0 ? (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-bold">Currently Out of Stock</div>
                  <p className="text-[11px] text-amber-700 mt-0.5">
                    All units of {item.name} are currently issued or under calibration.
                  </p>
                  <button
                    type="button"
                    onClick={handleWaitlist}
                    className="mt-2.5 px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold transition-colors"
                  >
                    Join Hardware Queue Waitlist
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Due Date Picker */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  Expected Return Date (Max 14 Days) *
                </label>
                <input
                  type="date"
                  value={dueDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  required
                />
              </div>

              {/* Purpose */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Project Objective & Academic Purpose *
                </label>
                <textarea
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="e.g. FYP edge AI inference benchmark, IoT sensor mesh data gathering for thesis, coursework assignment..."
                  rows={3}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 placeholder:text-slate-400"
                  required
                />
              </div>

              {/* Borrower Info */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Borrower Account</div>
                <div className="font-bold text-slate-900 mt-0.5">{currentUser.name}</div>
                <div className="text-[11px] text-slate-500">
                  Matric / Staff: {currentUser.matricOrStaffId} • {currentUser.email}
                </div>
              </div>

              {/* Terms check */}
              <div className="p-3 rounded-2xl bg-blue-50/60 border border-blue-200/60">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                    required
                  />
                  <div className="text-[11px] text-slate-700 leading-relaxed">
                    <span className="font-bold text-slate-900">FCSIT Hardware Custody Agreement:</span> I agree to inspect and verify the physical condition checklist with En. Faizal upon collection, safeguard the unit from static discharge/damage, and return by the scheduled due date.
                  </div>
                </label>
              </div>

              {/* Action buttons */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!agreedToTerms}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#002B7F] hover:bg-blue-800 text-white transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  Submit Loan Request
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

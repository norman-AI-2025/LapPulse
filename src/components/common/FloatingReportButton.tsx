import React, { useState, useRef, useEffect } from 'react';
import { useLabPulse } from '../../context/LabPulseContext';
import { 
  Wrench, 
  LogOut, 
  X, 
  Building2,
  Mail,
  IdCard,
  ShieldCheck
} from 'lucide-react';

export const FloatingReportButton: React.FC = () => {
  const { 
    currentUser, 
    currentRole, 
    logout, 
    openReportModal 
  } = useLabPulse();

  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Close modal when pressing Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setAccountModalOpen(false);
      }
    };
    if (accountModalOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [accountModalOpen]);

  return (
    <>
      {/* ========================================================= */}
      {/* 1. CENTERED ACCOUNT POPUP MODAL WITH BLUR BACKGROUND       */}
      {/* ========================================================= */}
      {accountModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-200">
          {/* Clickable Backdrop Overlay */}
          <div 
            className="absolute inset-0"
            onClick={() => setAccountModalOpen(false)}
          />

          {/* Centered Account Card */}
          <div
            ref={modalRef}
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 z-10 text-slate-800 animate-in zoom-in-95 duration-200"
          >
            {/* Header: User Avatar & Name */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3.5">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-sm"
                />
                <div className="min-w-0">
                  <h3 className="font-bold text-sm sm:text-base text-slate-900 truncate">
                    {currentUser.name}
                  </h3>
                  <div className="mt-1">
                    <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-900 text-white">
                      [{currentUser.role === 'student' ? 'STUDENT' : currentUser.role === 'lecturer' ? 'ACADEMIC STAFF' : 'TECHNICAL OFFICER'}]
                    </span>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setAccountModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close Account Details"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Account Details Ledger */}
            <div className="py-4 space-y-2.5 text-xs border-b border-slate-100">
              <div className="flex items-center gap-2.5 text-slate-600">
                <IdCard className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="font-mono text-xs font-semibold text-slate-800">
                  {currentUser.matricOrStaffId}
                </span>
              </div>

              <div className="flex items-center gap-2.5 text-slate-600">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-xs text-slate-700 truncate">
                  {currentUser.email}
                </span>
              </div>

              <div className="flex items-start gap-2.5 text-slate-600">
                <Building2 className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span className="text-xs text-slate-700 leading-snug">
                  {currentUser.department}
                </span>
              </div>
            </div>

            {/* Account Status & Sign Out */}
            <div className="pt-4 space-y-3">
              <div className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Account Status
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  [ACTIVE • VERIFIED]
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setAccountModalOpen(false);
                  logout();
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
              >
                <LogOut className="w-3.5 h-3.5 text-white" />
                <span>[SIGN OUT OF LABPULSE]</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. FLOATING ACTION STACK (Bottom-Right of Screen)          */}
      {/* ========================================================= */}
      <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 flex flex-col items-center gap-2.5">
        
        {/* Profile / Account Button (Top of the Stack) */}
        <div className="relative group">
          <button
            type="button"
            onClick={() => setAccountModalOpen(true)}
            className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer ${
              accountModalOpen
                ? 'border-slate-900 ring-2 ring-slate-900/20 bg-slate-900'
                : 'border-white bg-white hover:border-slate-300'
            }`}
            aria-label="Account Profile & Settings"
            title={`Account: ${currentUser.name}`}
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-full h-full object-cover"
            />
          </button>

          {/* Hover Tooltip */}
          <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-slate-900 text-white text-[10px] font-mono font-bold tracking-wider whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md border border-slate-700 select-none">
            [ACCOUNT: {currentUser.name.split(' ')[0].toUpperCase()}]
          </span>
        </div>

        {/* Sign Out Button (Middle of the Stack) */}
        <div className="relative group">
          <button
            type="button"
            onClick={logout}
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-200 shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer group"
            aria-label="Sign Out of LabPulse"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 group-hover:text-rose-600 transition-colors" />
          </button>

          {/* Hover Tooltip */}
          <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-slate-900 text-white text-[10px] font-mono font-bold tracking-wider whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md border border-slate-700 select-none">
            [SIGN OUT]
          </span>
        </div>

        {/* Report Defect Button (Bottom of the Stack - Student & Staff Only, Removed for Officer) */}
        {currentRole !== 'admin' && (
          <div className="relative group">
            <button
              type="button"
              onClick={() => openReportModal('SPACE')}
              className="w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-slate-900 hover:bg-slate-800 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer border border-slate-700/80"
              aria-label="Report Defect or Room Repair"
              title="Report Defect / Room Repair"
            >
              <Wrench className="w-5 h-5 text-slate-100 group-hover:rotate-12 transition-transform duration-200" />
            </button>

            {/* Hover Tooltip */}
            <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-slate-900 text-white text-[10px] font-mono font-bold tracking-wider whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md border border-slate-700 select-none">
              [REPORT DEFECT]
            </span>
          </div>
        )}

      </div>
    </>
  );
};
export default FloatingReportButton;

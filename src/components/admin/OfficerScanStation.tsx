import React, { useState } from 'react';
import { useLabPulse } from '../../context/LabPulseContext';
import { 
  Radio, 
  Camera, 
  Scan, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Search, 
  Wrench, 
  FileText, 
  RotateCcw,
  Sparkles,
  Cpu,
  Building2,
  CheckSquare,
  Square
} from 'lucide-react';

export const OfficerScanStation: React.FC = () => {
  const { 
    bookings, 
    loans, 
    checkInBooking, 
    checkOutBooking, 
    verifyAndIssueLoan, 
    processReturn,
    currentUser 
  } = useLabPulse();

  const [inputToken, setInputToken] = useState('');
  const [selectedScanResult, setSelectedScanResult] = useState<{
    type: 'booking' | 'loan';
    data: any;
  } | null>(null);

  // Condition Checklist State
  const [checklist, setChecklist] = useState({
    chassisIntact: true,
    accessoriesIncluded: true,
    powersOnWithoutError: true
  });

  const [returnCondition, setReturnCondition] = useState<'Excellent' | 'Good' | 'Minor Scratches' | 'Needs Service'>('Excellent');
  const [auditNotes, setAuditNotes] = useState('');

  // Sample tokens for quick testing
  const sampleTokens = [
    { label: 'Norman AI Lab (LP-7842)', code: 'LP-7842', type: 'Lab Space Check-In' },
    { label: 'Norman Jetson Orin (LP-3829)', code: 'LP-3829', type: 'Hardware Return' },
    { label: 'Siti SE Lab Active (LP-4190)', code: 'LP-4190', type: 'Lab Space Check-Out' },
    { label: 'Norman RealSense (LP-8812)', code: 'LP-8812', type: 'Hardware Issuance' },
    { label: 'Zhi Hao Overdue Scope (LP-5120)', code: 'LP-5120', type: 'Hardware Return' },
  ];

  const handleLookup = (tokenToLookup?: string) => {
    const code = (tokenToLookup || inputToken).trim().toUpperCase();
    if (!code) return;

    // Check bookings
    const booking = bookings.find((b) => b.tokenCode.toUpperCase() === code);
    if (booking) {
      setSelectedScanResult({ type: 'booking', data: booking });
      return;
    }

    // Check loans
    const loan = loans.find((l) => l.tokenCode.toUpperCase() === code);
    if (loan) {
      setSelectedScanResult({ type: 'loan', data: loan });
      return;
    }

    setSelectedScanResult(null);
  };

  const handleQuickToken = (code: string) => {
    setInputToken(code);
    handleLookup(code);
  };

  const handleConfirmSpaceCheckIn = (tokenCode: string) => {
    const res = checkInBooking(tokenCode);
    if (res.success && res.booking) {
      setSelectedScanResult({ type: 'booking', data: res.booking });
    }
  };

  const handleConfirmSpaceCheckOut = (tokenCode: string) => {
    const res = checkOutBooking(tokenCode);
    if (res.success && res.booking) {
      setSelectedScanResult({ type: 'booking', data: res.booking });
    }
  };

  const handleIssueHardware = (tokenCode: string) => {
    const res = verifyAndIssueLoan(tokenCode, checklist, auditNotes);
    if (res.success) {
      const updatedLoan = loans.find((l) => l.tokenCode === tokenCode);
      if (updatedLoan) setSelectedScanResult({ type: 'loan', data: updatedLoan });
    }
  };

  const handleReceiveHardwareReturn = (tokenCode: string) => {
    const res = processReturn(tokenCode, returnCondition, checklist, auditNotes);
    if (res.success) {
      const updatedLoan = loans.find((l) => l.tokenCode === tokenCode);
      if (updatedLoan) setSelectedScanResult({ type: 'loan', data: updatedLoan });
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bento-card rounded-3xl p-5 sm:p-7 border border-slate-200/90 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-800 text-xs font-semibold mb-2">
              <Radio className="w-3.5 h-3.5" />
              <span>FCSIT Central Laboratory Operations Desk</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Physical Verification & Condition Audit Station
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl">
              Officer: <span className="font-bold text-slate-900">{currentUser.name}</span>. Perform turnstile check-ins, barcode & QR token scans, and mandatory hardware safety inspection checklists.
            </p>
          </div>

          <div className="text-right">
            <div className="text-xs text-slate-500 font-semibold">Active Lab Desk</div>
            <div className="text-sm font-bold text-slate-900">Block B Level 1 Operations</div>
            <div className="text-xs text-emerald-600 font-semibold flex items-center gap-1 justify-end mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Optical Scanner Online
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: SIMULATED CAMERA VIEWFINDER & TOKEN ENTRY (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Viewfinder Card */}
          <div className="bento-card rounded-3xl p-5 border border-slate-200/90 overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Camera className="w-4 h-4 text-blue-600" />
                Optical Camera Viewfinder
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                ACTIVE 60 FPS
              </span>
            </div>

            {/* Viewfinder Box with Laser Scan Line */}
            <div className="relative aspect-[4/3] rounded-2xl bg-slate-950 overflow-hidden flex items-center justify-center border-2 border-slate-800 shadow-inner">
              
              {/* Corner brackets */}
              <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-blue-400 rounded-tl-lg" />
              <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-blue-400 rounded-tr-lg" />
              <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-blue-400 rounded-bl-lg" />
              <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-blue-400 rounded-br-lg" />

              {/* Animated Scan Beam */}
              <div className="absolute left-6 right-6 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#38bdf8] animate-scan z-10" />

              {/* Grid texture inside viewfinder */}
              <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />

              {/* Center icon / status */}
              <div className="text-center z-0 p-4">
                <Scan className="w-12 h-12 text-slate-600 mx-auto mb-2 opacity-50" />
                <p className="text-xs font-mono text-slate-400">Position student QR code within frame</p>
                <p className="text-[10px] text-slate-500 mt-1">Or enter 6-character code below</p>
              </div>
            </div>

            {/* Manual Token Entry Form */}
            <div className="mt-4 space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                Manual Token Code Entry (LP-XXXX)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. LP-7842"
                  value={inputToken}
                  onChange={(e) => setInputToken(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
                  className="flex-1 font-mono font-bold text-sm px-3.5 py-2 rounded-xl border border-slate-200 uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
                <button
                  onClick={() => handleLookup()}
                  className="px-4 py-2 rounded-xl bg-[#002B7F] hover:bg-blue-800 text-white text-xs font-bold transition-colors shadow-sm"
                >
                  Verify Token
                </button>
              </div>
            </div>

            {/* Quick Demo Test Buttons */}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Quick Test Codes (Click to Load):
              </div>
              <div className="flex flex-wrap gap-1.5">
                {sampleTokens.map((item) => (
                  <button
                    key={item.code}
                    onClick={() => handleQuickToken(item.code)}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold bg-slate-100 hover:bg-blue-100 text-slate-800 hover:text-blue-900 border border-slate-200 transition-colors"
                  >
                    {item.code}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SCAN RESULTS & MANDATORY CONDITION AUDIT (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {selectedScanResult ? (
            <div className="bento-card rounded-3xl p-5 sm:p-6 border border-slate-200/90 space-y-5 animate-in fade-in">
              
              {/* Result Header */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold px-2.5 py-0.5 rounded-lg bg-blue-100 text-[#002B7F]">
                      {selectedScanResult.data.tokenCode}
                    </span>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {selectedScanResult.type === 'booking' ? 'Space Reservation Pass' : 'Hardware Loan Pass'}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">
                    {selectedScanResult.type === 'booking'
                      ? selectedScanResult.data.roomName
                      : selectedScanResult.data.hardwareName}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Student: <span className="font-bold text-slate-800">{selectedScanResult.data.userName}</span> (
                    {selectedScanResult.data.userMatric})
                  </p>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    selectedScanResult.data.status === 'Active' || selectedScanResult.data.status === 'Active / Issued'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : selectedScanResult.data.status === 'Approved'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : selectedScanResult.data.status === 'Overdue'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {selectedScanResult.data.status}
                </span>
              </div>

              {/* DETAILS SECTION */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Scheduled Time / Due</span>
                  <div className="font-bold text-slate-800 text-sm mt-0.5">
                    {selectedScanResult.type === 'booking'
                      ? `${selectedScanResult.data.date} (${selectedScanResult.data.slot})`
                      : `Due: ${selectedScanResult.data.dueDate}`}
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Project Purpose</span>
                  <div className="font-semibold text-slate-800 text-xs mt-0.5 truncate">
                    {selectedScanResult.data.purpose}
                  </div>
                </div>
              </div>

              {/* CASE 1: SPACE BOOKING ACTIONS */}
              {selectedScanResult.type === 'booking' && (
                <div className="space-y-4 pt-2">
                  <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 text-xs text-blue-900 leading-relaxed">
                    <span className="font-bold">Turnstile Check-In Protocol:</span> Verify student matric card against token {selectedScanResult.data.tokenCode}. Confirming physical check-in resets the 15-minute forfeiture watchdog.
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    {selectedScanResult.data.status === 'Approved' && (
                      <button
                        onClick={() => handleConfirmSpaceCheckIn(selectedScanResult.data.tokenCode)}
                        className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Confirm Physical QR Check-In
                      </button>
                    )}

                    {selectedScanResult.data.status === 'Active' && (
                      <button
                        onClick={() => handleConfirmSpaceCheckOut(selectedScanResult.data.tokenCode)}
                        className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5"
                      >
                        Conclude Session & Check Out
                      </button>
                    )}

                    {selectedScanResult.data.status === 'Completed' && (
                      <div className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        Session has been concluded and recorded.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* CASE 2: HARDWARE MANDATORY CONDITION AUDIT CHECKLIST */}
              {selectedScanResult.type === 'loan' && (
                <div className="space-y-4 pt-2">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                        <Wrench className="w-4 h-4 text-blue-600" />
                        Mandatory Physical Condition Audit Checklist
                      </h4>
                      <span className="text-[10px] text-amber-700 font-bold bg-amber-100 px-2 py-0.5 rounded-md">
                        Officer Sign-off
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      {/* Check 1 */}
                      <label className="flex items-center gap-2.5 p-2 rounded-xl bg-white border border-slate-200/80 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checklist.chassisIntact}
                          onChange={(e) => setChecklist({ ...checklist, chassisIntact: e.target.checked })}
                          className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                        />
                        <span className="font-semibold text-slate-800">Chassis, Enclosure & Ports Intact (No physical cracks)</span>
                      </label>

                      {/* Check 2 */}
                      <label className="flex items-center gap-2.5 p-2 rounded-xl bg-white border border-slate-200/80 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checklist.accessoriesIncluded}
                          onChange={(e) => setChecklist({ ...checklist, accessoriesIncluded: e.target.checked })}
                          className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                        />
                        <span className="font-semibold text-slate-800">All Accessories & Cables Included (Power brick, probes, SD card)</span>
                      </label>

                      {/* Check 3 */}
                      <label className="flex items-center gap-2.5 p-2 rounded-xl bg-white border border-slate-200/80 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checklist.powersOnWithoutError}
                          onChange={(e) => setChecklist({ ...checklist, powersOnWithoutError: e.target.checked })}
                          className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                        />
                        <span className="font-semibold text-slate-800">Powers on without boot error or LED error codes</span>
                      </label>
                    </div>

                    {/* Return Condition Selector if this is a Return flow */}
                    {(selectedScanResult.data.status === 'Active / Issued' || selectedScanResult.data.status === 'Overdue') && (
                      <div className="pt-2">
                        <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                          Return Grading (Updates Passport Health Index)
                        </span>
                        <div className="grid grid-cols-4 gap-1.5">
                          {(['Excellent', 'Good', 'Minor Scratches', 'Needs Service'] as const).map((cond) => (
                            <button
                              key={cond}
                              type="button"
                              onClick={() => setReturnCondition(cond)}
                              className={`py-1.5 px-2 rounded-xl text-[11px] font-semibold border transition-all ${
                                returnCondition === cond
                                  ? 'bg-[#002B7F] text-white border-[#002B7F] shadow-sm'
                                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {cond}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Notes & Defect Entry */}
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                        Inspection Remark / Penalty / Defect Notes
                      </span>
                      <input
                        type="text"
                        placeholder="e.g. Returned with all cables; no scratches detected."
                        value={auditNotes}
                        onChange={(e) => setAuditNotes(e.target.value)}
                        className="w-full text-xs px-3 py-1.5 rounded-xl border border-slate-200 bg-white"
                      />
                    </div>
                  </div>

                  {/* Hardware Buttons */}
                  <div className="flex items-center justify-end gap-3 pt-2">
                    {selectedScanResult.data.status === 'Pending Approval' && (
                      <button
                        onClick={() => handleIssueHardware(selectedScanResult.data.tokenCode)}
                        className="px-6 py-2.5 rounded-xl bg-[#002B7F] hover:bg-blue-800 text-white text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5"
                      >
                        <ShieldCheck className="w-4 h-4 text-amber-300" />
                        Pass Audit & Issue Hardware
                      </button>
                    )}

                    {(selectedScanResult.data.status === 'Active / Issued' || selectedScanResult.data.status === 'Overdue') && (
                      <button
                        onClick={() => handleReceiveHardwareReturn(selectedScanResult.data.tokenCode)}
                        className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Complete Audit & Restock Hardware
                      </button>
                    )}

                    {selectedScanResult.data.status === 'Returned' && (
                      <div className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        Hardware has been restocked and Digital Passport updated.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Empty State */
            <div className="bento-card rounded-3xl p-10 text-center border border-slate-200 flex flex-col items-center justify-center min-h-[380px]">
              <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-700 flex items-center justify-center mb-4">
                <Scan className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-slate-800 text-base">Ready for Scanner Input</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Enter any 6-character token code on the left or click a sample code to test turnstile check-ins, return inspections, and passport updates.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


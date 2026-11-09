import React, { useState } from 'react';
import { useLabPulse } from '../../context/LabPulseContext';
import { 
  Camera, 
  Scan, 
  CheckCircle2, 
  CheckSquare, 
  Square,
  Sparkles
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

  // Condition checklist
  const [checklist, setChecklist] = useState({
    chassisIntact: true,
    accessoriesIncluded: true,
    powersOnWithoutError: true
  });

  const [returnCondition, setReturnCondition] = useState<'Excellent' | 'Good' | 'Minor Scratches' | 'Needs Service'>('Excellent');
  const [notes, setNotes] = useState('');

  const sampleTokens = ['LP-7842', 'LP-3829', 'LP-4190', 'LP-8812'];

  const handleLookup = (codeToLookup?: string) => {
    const code = (codeToLookup || inputToken).trim().toUpperCase();
    if (!code) return;

    const booking = bookings.find((b) => b.tokenCode.toUpperCase() === code);
    if (booking) {
      setSelectedScanResult({ type: 'booking', data: booking });
      return;
    }

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

  const handleCheckIn = () => {
    if (!selectedScanResult) return;
    const res = checkInBooking(selectedScanResult.data.tokenCode);
    if (res.success && res.booking) {
      setSelectedScanResult({ type: 'booking', data: res.booking });
    }
  };

  const handleCheckOut = () => {
    if (!selectedScanResult) return;
    const res = checkOutBooking(selectedScanResult.data.tokenCode);
    if (res.success && res.booking) {
      setSelectedScanResult({ type: 'booking', data: res.booking });
    }
  };

  const handleIssueHardware = () => {
    if (!selectedScanResult) return;
    const res = verifyAndIssueLoan(selectedScanResult.data.tokenCode, checklist, notes);
    if (res.success) {
      const updated = loans.find((l) => l.tokenCode === selectedScanResult.data.tokenCode);
      if (updated) setSelectedScanResult({ type: 'loan', data: updated });
    }
  };

  const handleReturnHardware = () => {
    if (!selectedScanResult) return;
    const res = processReturn(selectedScanResult.data.tokenCode, returnCondition, checklist, notes);
    if (res.success) {
      const updated = loans.find((l) => l.tokenCode === selectedScanResult.data.tokenCode);
      if (updated) setSelectedScanResult({ type: 'loan', data: updated });
    }
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-2">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Officer Verification Station</h1>
          <p className="text-xs text-slate-500">Scan QR passes or enter 6-character token codes.</p>
        </div>
        <span className="text-xs text-slate-400">Officer: {currentUser.name}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
        
        {/* Scanner Viewfinder Column (5 cols) */}
        <div className="md:col-span-5 bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
          
          {/* Camera Viewfinder */}
          <div className="relative aspect-video rounded-2xl bg-slate-900 overflow-hidden flex items-center justify-center border border-slate-800">
            <div className="absolute left-4 right-4 h-0.5 bg-cyan-400 scan-laser z-10" />
            <div className="text-center text-slate-400 text-xs">
              <Scan className="w-8 h-8 text-slate-500 mx-auto mb-1.5 opacity-60" />
              <span>Camera Optical Viewfinder</span>
            </div>
          </div>

          {/* Code Entry */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">Token Code</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. LP-7842"
                value={inputToken}
                onChange={(e) => setInputToken(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
                className="flex-1 font-mono font-bold text-xs px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-slate-400 uppercase"
              />
              <button
                onClick={() => handleLookup()}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors"
              >
                Scan
              </button>
            </div>
          </div>

          {/* Quick Codes */}
          <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-slate-400 mr-1">Quick:</span>
            {sampleTokens.map((code) => (
              <button
                key={code}
                onClick={() => handleQuickToken(code)}
                className="font-mono text-[11px] px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 transition-colors"
              >
                {code}
              </button>
            ))}
          </div>
        </div>

        {/* Verification & Checklist Column (7 cols) */}
        <div className="md:col-span-7 bg-white rounded-3xl p-5 border border-slate-200 shadow-sm min-h-[300px]">
          {selectedScanResult ? (
            <div className="space-y-4">
              
              {/* Scan Info Header */}
              <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                      {selectedScanResult.data.tokenCode}
                    </span>
                    <span className="text-xs font-semibold text-slate-400 uppercase">
                      {selectedScanResult.type === 'booking' ? 'Space Pass' : 'Hardware Loan'}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mt-1">
                    {selectedScanResult.type === 'booking'
                      ? selectedScanResult.data.roomName
                      : selectedScanResult.data.hardwareName}
                  </h3>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {selectedScanResult.data.userName} ({selectedScanResult.data.userMatric})
                  </div>
                </div>

                <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {selectedScanResult.data.status}
                </span>
              </div>

              {/* Space Booking Flow */}
              {selectedScanResult.type === 'booking' && (
                <div className="pt-2 flex items-center justify-between">
                  <div className="text-xs text-slate-500">
                    Slot: <strong>{selectedScanResult.data.slot}</strong> on {selectedScanResult.data.date}
                  </div>

                  {selectedScanResult.data.status === 'Approved' ? (
                    <button
                      onClick={handleCheckIn}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-colors"
                    >
                      Verify Check-In
                    </button>
                  ) : selectedScanResult.data.status === 'Active' ? (
                    <button
                      onClick={handleCheckOut}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors"
                    >
                      Complete Session
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400">Session closed</span>
                  )}
                </div>
              )}

              {/* Hardware Loan Condition Checklist Flow */}
              {selectedScanResult.type === 'loan' && (
                <div className="space-y-3 pt-1">
                  <div className="text-xs font-bold text-slate-800">Physical Condition Checklist</div>

                  <div className="space-y-1.5 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checklist.chassisIntact}
                        onChange={(e) => setChecklist({ ...checklist, chassisIntact: e.target.checked })}
                        className="rounded text-blue-600 w-4 h-4"
                      />
                      <span className="text-slate-700">Chassis & ports intact</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checklist.accessoriesIncluded}
                        onChange={(e) => setChecklist({ ...checklist, accessoriesIncluded: e.target.checked })}
                        className="rounded text-blue-600 w-4 h-4"
                      />
                      <span className="text-slate-700">Accessories and cables included</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checklist.powersOnWithoutError}
                        onChange={(e) => setChecklist({ ...checklist, powersOnWithoutError: e.target.checked })}
                        className="rounded text-blue-600 w-4 h-4"
                      />
                      <span className="text-slate-700">Powers on without error</span>
                    </label>
                  </div>

                  {/* Return grading */}
                  {selectedScanResult.data.status === 'Active / Issued' && (
                    <div className="pt-2">
                      <span className="text-[11px] font-semibold text-slate-500 block mb-1">Return Condition</span>
                      <div className="grid grid-cols-4 gap-1.5">
                        {(['Excellent', 'Good', 'Minor Scratches', 'Needs Service'] as const).map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setReturnCondition(c)}
                            className={`py-1 rounded-lg text-[10px] font-semibold border ${
                              returnCondition === c
                                ? 'bg-slate-900 text-white border-slate-900'
                                : 'bg-slate-50 text-slate-700 border-slate-200'
                            }`}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="pt-3 border-t border-slate-100 flex justify-end">
                    {selectedScanResult.data.status === 'Pending Approval' ? (
                      <button
                        onClick={handleIssueHardware}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl"
                      >
                        Issue Hardware
                      </button>
                    ) : selectedScanResult.data.status === 'Active / Issued' || selectedScanResult.data.status === 'Overdue' ? (
                      <button
                        onClick={handleReturnHardware}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl"
                      >
                        Confirm Return
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400">Unit Returned</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
              <Scan className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <div className="text-xs font-medium text-slate-600">No Token Loaded</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Enter code or click a quick sample code on the left.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

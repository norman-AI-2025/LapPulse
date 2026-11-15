import React, { useState, useMemo } from 'react';
import { useLabPulse } from '../../context/LabPulseContext';
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Building2, 
  Cpu, 
  Search, 
  Download, 
  FileText, 
  ChevronRight, 
  Users, 
  Calendar,
  Send,
  Check,
  RotateCcw,
  ShieldAlert,
  Inbox
} from 'lucide-react';

export const OfficerOperationsHub: React.FC = () => {
  const {
    bookings,
    rooms,
    loans,
    hardware,
    autoCancelExpiredBooking,
    releaseToWaitlist,
    approveBooking,
    approveLoan,
    addToast,
    addAuditLog,
    setActiveTab,
    navigateToRoomSchedule,
    navigateToHardwareCalendar
  } = useLabPulse();

  // Active view segment: 'ALL' | 'ATTENTION' | 'SPACES' | 'HARDWARE'
  const [activeSegment, setActiveSegment] = useState<'ALL' | 'ATTENTION' | 'SPACES' | 'HARDWARE'>('ALL');

  // Attention Queue Tab: 'OVERDUE' | 'GRACE_EXPIRED' | 'PENDING'
  const [queueTab, setQueueTab] = useState<'OVERDUE' | 'GRACE_EXPIRED' | 'PENDING'>('OVERDUE');

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Local action state
  const [notifiedItems, setNotifiedItems] = useState<Record<string, boolean>>({});
  const [revokedItems, setRevokedItems] = useState<Record<string, boolean>>({});

  // 1. DATA: RESERVED SPACES
  const activeSpaceBookings = useMemo(() => {
    return bookings.filter(
      (b) => b.status === 'Approved' || b.status === 'Active' || b.status === 'Pending Approval' || b.status === 'Pending Endorsement'
    );
  }, [bookings]);

  // 2. DATA: BOOKED & ISSUED HARDWARE
  const activeHardwareLoans = useMemo(() => {
    return loans.filter(
      (l) => l.status === 'Active / Issued' || l.status === 'Overdue' || l.status === 'Pending Approval'
    );
  }, [loans]);

  // 3. DATA: IMMEDIATE ATTENTION QUEUE
  const todayStr = new Date().toISOString().split('T')[0];

  // Overdue Hardware
  const overdueHardwareItems = useMemo(() => {
    return loans
      .filter((l) => l.status === 'Overdue' || (l.status === 'Active / Issued' && l.dueDate < todayStr))
      .map((l) => ({
        id: l.tokenCode,
        name: l.hardwareName,
        tag: l.hardwareTag,
        borrower: l.userName,
        matric: l.userMatric,
        due: l.dueDate,
        violation: 'Overdue Return Deadline',
        raw: l
      }));
  }, [loans, todayStr]);

  // Grace Period Expired Slots (Pending check-in beyond 15-minute grace window)
  const graceExpiredSlots = useMemo(() => {
    const now = Date.now();
    return bookings
      .filter((b) => {
        if (b.status === 'Approved' && b.checkInDeadline && b.checkInDeadline < now && !b.checkInTime) {
          return true;
        }
        return false;
      })
      .map((b) => ({
        id: b.tokenCode,
        bookingId: b.id,
        name: b.roomName,
        code: b.roomCode,
        borrower: b.userName,
        matric: b.userMatric,
        slot: `${b.date} • ${b.slot}`,
        violation: '15-Min Check-In Timer Lapsed',
        raw: b
      }));
  }, [bookings]);

  // Pending Approvals
  const pendingApprovals = useMemo(() => {
    const pendingB = bookings
      .filter((b) => b.status === 'Pending Approval')
      .map((b) => ({
        type: 'space' as const,
        id: b.tokenCode,
        rawId: b.id,
        name: b.roomName,
        identifier: b.roomCode,
        borrower: b.userName,
        matric: b.userMatric,
        detail: `${b.date} • ${b.slot}`,
        raw: b
      }));

    const pendingL = loans
      .filter((l) => l.status === 'Pending Approval')
      .map((l) => ({
        type: 'hardware' as const,
        id: l.tokenCode,
        rawId: l.id,
        name: l.hardwareName,
        identifier: l.hardwareTag,
        borrower: l.userName,
        matric: l.userMatric,
        detail: `Due: ${l.dueDate}`,
        raw: l
      }));

    return [...pendingB, ...pendingL];
  }, [bookings, loans]);

  const totalAttentionCount = overdueHardwareItems.length + graceExpiredSlots.length + pendingApprovals.length;

  // Filtered lists by search
  const filteredOverdue = overdueHardwareItems.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      item.tag.toLowerCase().includes(q) ||
      item.borrower.toLowerCase().includes(q) ||
      item.matric.toLowerCase().includes(q) ||
      item.id.toLowerCase().includes(q)
    );
  });

  const filteredGrace = graceExpiredSlots.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      item.code.toLowerCase().includes(q) ||
      item.borrower.toLowerCase().includes(q) ||
      item.matric.toLowerCase().includes(q) ||
      item.id.toLowerCase().includes(q)
    );
  });

  const filteredPending = pendingApprovals.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      item.identifier.toLowerCase().includes(q) ||
      item.borrower.toLowerCase().includes(q) ||
      item.matric.toLowerCase().includes(q) ||
      item.id.toLowerCase().includes(q)
    );
  });

  const filteredSpaces = activeSpaceBookings.filter((b) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      b.roomName.toLowerCase().includes(q) ||
      b.roomCode.toLowerCase().includes(q) ||
      b.userName.toLowerCase().includes(q) ||
      b.userMatric.toLowerCase().includes(q) ||
      b.tokenCode.toLowerCase().includes(q)
    );
  });

  const filteredHardware = activeHardwareLoans.filter((l) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      l.hardwareName.toLowerCase().includes(q) ||
      l.hardwareTag.toLowerCase().includes(q) ||
      l.userName.toLowerCase().includes(q) ||
      l.userMatric.toLowerCase().includes(q) ||
      l.tokenCode.toLowerCase().includes(q)
    );
  });

  // Action handlers
  const handleSendNotice = (tokenCode: string, name: string) => {
    setNotifiedItems((prev) => ({ ...prev, [tokenCode]: true }));
    addToast('Summons Dispatched', `Formal equipment return notice sent to ${name} (${tokenCode}).`, 'warning');
    addAuditLog('Notice Issued', `Officer issued return summons for loan ${tokenCode} to ${name}.`, 'hardware');
  };

  const handleRevokeGraceSlot = (bookingId: string, venue: string, tokenCode: string) => {
    setRevokedItems((prev) => ({ ...prev, [tokenCode]: true }));
    autoCancelExpiredBooking(bookingId);
    releaseToWaitlist(bookingId);
    addToast('Slot Revoked', `${venue} (${tokenCode}) cancelled and reallocated to waitlist.`, 'error');
  };

  const handleApprove = (item: typeof pendingApprovals[0]) => {
    if (item.type === 'space') {
      approveBooking(item.rawId, 'Approved by Technical Officer from Command Hub.');
    } else {
      approveLoan(item.rawId);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Record Type', 'Token', 'Borrower', 'Matric/Staff ID', 'Asset/Facility', 'Scheduled/Due', 'Status'];
    const rows = [
      ...bookings.map((b) => ['Space Booking', b.tokenCode, b.userName, b.userMatric, b.roomName, `${b.date} ${b.slot}`, b.status]),
      ...loans.map((l) => ['Hardware Loan', l.tokenCode, l.userName, l.userMatric, l.hardwareName, l.dueDate, l.status]),
      ...overdueHardwareItems.map((o) => ['Overdue Asset', o.id, o.borrower, o.matric, o.name, o.due, o.violation])
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FCSIT_Operations_Registry_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('CSV Exported', 'Operational directory exported successfully.', 'success');
  };

  const handlePrint = () => {
    window.print();
    addToast('Print Protocol', 'Operational registry view sent to printer.', 'info');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16 animate-in fade-in duration-200">
      
      {/* INSTITUTIONAL HEADER & QUICK STATS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
            <Inbox className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                Operations Directory & Attention Hub
              </h1>
              <span className="font-mono text-xs font-medium px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                Officer dispatch
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              FCSIT Central Laboratory Operations: reserved spaces directory, hardware circulation, and priority attention queue
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-medium shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-medium shadow-xs transition-colors cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-slate-600" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* FILTER & SEARCH SEGMENT BAR */}
      <div className="bg-white rounded-2xl p-2 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* View Switcher Pills */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveSegment('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
              activeSegment === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            All overviews
          </button>

          <button
            onClick={() => setActiveSegment('ATTENTION')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeSegment === 'ATTENTION'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>Immediate attention</span>
            {totalAttentionCount > 0 && (
              <span className={`px-1.5 py-0.5 rounded font-mono text-xs tabular-nums leading-none ${
                activeSegment === 'ATTENTION' ? 'bg-white text-rose-700 font-semibold' : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}>
                {totalAttentionCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSegment('SPACES')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeSegment === 'SPACES'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>Reserved spaces</span>
            <span className={`px-1.5 py-0.5 rounded font-mono text-xs tabular-nums leading-none ${
              activeSegment === 'SPACES' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-700'
            }`}>
              {activeSpaceBookings.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSegment('HARDWARE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeSegment === 'HARDWARE'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>Booked hardware</span>
            <span className={`px-1.5 py-0.5 rounded font-mono text-xs tabular-nums leading-none ${
              activeSegment === 'HARDWARE' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-700'
            }`}>
              {activeHardwareLoans.length}
            </span>
          </button>
        </div>

        {/* Global Search Bar */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search token, user, space, or asset..."
            className="w-full bg-slate-50 text-slate-900 text-xs rounded-lg pl-9 pr-3 py-2 border border-slate-200 focus:outline-none focus:border-slate-400 focus:bg-white transition-colors font-medium placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 1. IMMEDIATE ATTENTION QUEUE */}
      {/* ===================================================================== */}
      {(activeSegment === 'ALL' || activeSegment === 'ATTENTION') && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          
          {/* Header & Category Switcher */}
          <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold text-slate-900">
                    Immediate attention queue
                  </h2>
                  <span className="font-mono text-xs font-medium px-2 py-0.5 rounded-md bg-rose-50 text-rose-800 border border-rose-200">
                    {totalAttentionCount} actionable
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Critical compliance breaches, elapsed 15-minute check-in windows, and pending authorizations
                </p>
              </div>
            </div>

            {/* Sub-Tabs for Attention Queue */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg self-start md:self-auto">
              <button
                onClick={() => setQueueTab('OVERDUE')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  queueTab === 'OVERDUE'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Overdue hardware ({overdueHardwareItems.length})
              </button>
              <button
                onClick={() => setQueueTab('GRACE_EXPIRED')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  queueTab === 'GRACE_EXPIRED'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Grace expired ({graceExpiredSlots.length})
              </button>
              <button
                onClick={() => setQueueTab('PENDING')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  queueTab === 'PENDING'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Pending approvals ({pendingApprovals.length})
              </button>
            </div>
          </div>

          {/* Attention Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-medium text-xs">
                  <th className="py-2.5 px-4">Target asset / space</th>
                  <th className="py-2.5 px-4">Student / borrower</th>
                  <th className="py-2.5 px-4">Timeline / deadline</th>
                  <th className="py-2.5 px-4">Status reason</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {/* 1. OVERDUE HARDWARE ROWS */}
                {queueTab === 'OVERDUE' && (
                  filteredOverdue.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
                        <span className="font-medium text-slate-600 text-xs">No overdue equipment assets</span>
                        <p className="text-xs text-slate-400 mt-0.5">All hardware in circulation is within valid loan period.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredOverdue.map((row) => {
                      const isNotified = notifiedItems[row.id];
                      return (
                        <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3 px-4">
                            <span className="font-mono text-slate-400 text-xs font-medium block">{row.id} • {row.tag}</span>
                            <span className="font-semibold text-slate-900">{row.name}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-medium text-slate-800 block">{row.borrower}</span>
                            <span className="font-mono text-slate-400 text-xs">{row.matric}</span>
                          </td>
                          <td className="py-3 px-4 font-mono text-rose-700 font-medium">
                            Due: {row.due}
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                              {row.violation}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => handleSendNotice(row.id, row.borrower)}
                              disabled={isNotified}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors inline-flex items-center gap-1.5 cursor-pointer ${
                                isNotified
                                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                  : 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs'
                              }`}
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>{isNotified ? 'Notice sent' : 'Transmit notice'}</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )
                )}

                {/* 2. GRACE PERIOD EXPIRED ROWS */}
                {queueTab === 'GRACE_EXPIRED' && (
                  filteredGrace.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
                        <span className="font-medium text-slate-600 text-xs">No expired check-in reservations</span>
                        <p className="text-xs text-slate-400 mt-0.5">All active reservations have either checked in on time or are not yet expired.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredGrace.map((row) => {
                      const isRevoked = revokedItems[row.id];
                      return (
                        <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3 px-4">
                            <span className="font-mono text-slate-400 text-xs font-medium block">{row.id} • {row.code}</span>
                            <span className="font-semibold text-slate-900">{row.name}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-medium text-slate-800 block">{row.borrower}</span>
                            <span className="font-mono text-slate-400 text-xs">{row.matric}</span>
                          </td>
                          <td className="py-3 px-4 font-mono text-amber-700 font-medium">
                            {row.slot}
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                              {row.violation}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => handleRevokeGraceSlot(row.bookingId, row.name, row.id)}
                              disabled={isRevoked}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors inline-flex items-center gap-1.5 cursor-pointer ${
                                isRevoked
                                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                  : 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs'
                              }`}
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>{isRevoked ? 'Slot reallocated' : 'Revoke & waitlist'}</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )
                )}

                {/* 3. PENDING APPROVALS ROWS */}
                {queueTab === 'PENDING' && (
                  filteredPending.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
                        <span className="font-medium text-slate-600 text-xs">All requests reviewed and authorized</span>
                        <p className="text-xs text-slate-400 mt-0.5">No space reservations or hardware loan authorizations pending officer review.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredPending.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-mono text-slate-400 text-xs font-medium block">
                            {row.type === 'space' ? 'Space' : 'Hardware'} • {row.id} • {row.identifier}
                          </span>
                          <span className="font-semibold text-slate-900">{row.name}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium text-slate-800 block">{row.borrower}</span>
                          <span className="font-mono text-slate-400 text-xs">{row.matric}</span>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-700 font-medium">
                          {row.detail}
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200">
                            Awaiting review
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleApprove(row)}
                            className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Authorize pass</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 2. RESERVED SPACES DIRECTORY (LIGHT THEME BENTO CONTAINER) */}
      {/* ===================================================================== */}
      {(activeSegment === 'ALL' || activeSegment === 'SPACES') && (
        <div className="bg-white text-slate-900 rounded-xl p-5 sm:p-6 border border-slate-200 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Reserved spaces directory
                </h2>
                <p className="text-xs text-slate-500">
                  Live overview of laboratory spaces currently occupied or scheduled by students and staff
                </p>
              </div>
            </div>
            <span className="font-mono text-xs font-medium px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200 self-start sm:self-auto">
              {filteredSpaces.length} {filteredSpaces.length === 1 ? 'reservation' : 'reservations'}
            </span>
          </div>

          {filteredSpaces.length === 0 ? (
            <div className="py-8 px-4 text-center rounded-2xl bg-slate-50 border border-slate-200 mt-4">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-800">
                No laboratory spaces currently reserved
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                All 23 FCSIT laboratory facilities are vacant. New student or staff reservations will appear here in real time.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-4">
              {filteredSpaces.map((b) => {
                const room = rooms.find((r) => r.id === b.roomId);
                const targetRoomId = b.roomId || room?.id;
                return (
                  <div
                    key={b.id}
                    onClick={() => {
                      if (targetRoomId) {
                        navigateToRoomSchedule(targetRoomId);
                      } else {
                        setActiveTab('labs');
                      }
                    }}
                    className="group/card bg-white hover:bg-slate-50/70 border border-slate-200 hover:border-slate-300 rounded-2xl p-4 transition-colors cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="font-mono text-xs font-medium px-2 py-0.5 rounded-md bg-blue-50 text-blue-900 border border-blue-200">
                          {b.roomCode || room?.code || 'Space'}
                        </span>
                        <span
                          className={`font-mono text-xs font-medium px-2 py-0.5 rounded-md border ${
                            b.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : b.status === 'Approved'
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : 'bg-amber-50 text-amber-900 border-amber-200'
                          }`}
                        >
                          {b.status}
                        </span>
                      </div>

                      <h3 className="text-xs font-semibold text-slate-900 group-hover/card:text-blue-900 transition-colors line-clamp-1">
                        {b.roomName || room?.name}
                      </h3>

                      <div className="mt-2.5 space-y-1.5 text-xs text-slate-600">
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="text-slate-800 font-medium">
                            {b.date} • {b.slot}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate text-slate-700">
                            {b.userName} <span className="font-mono text-slate-500">({b.userMatric})</span>
                          </span>
                        </div>

                        {b.purpose && (
                          <p className="text-xs text-slate-500 line-clamp-1 italic pt-0.5">
                            "{b.purpose}"
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-blue-900 group-hover/card:text-blue-700">
                      <span>View space schedule</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover/card:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* 3. BOOKED & ISSUED HARDWARE DIRECTORY (LIGHT THEME) */}
      {/* ===================================================================== */}
      {(activeSegment === 'ALL' || activeSegment === 'HARDWARE') && (
        <div className="bg-white text-slate-900 rounded-xl p-5 sm:p-6 border border-slate-200 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Booked & issued hardware directory
                </h2>
                <p className="text-xs text-slate-500">
                  Live overview of laboratory hardware assets currently checked out or reserved by borrowers
                </p>
              </div>
            </div>
            <span className="font-mono text-xs font-medium px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200 self-start sm:self-auto">
              {filteredHardware.length} {filteredHardware.length === 1 ? 'active loan' : 'active loans'}
            </span>
          </div>

          {filteredHardware.length === 0 ? (
            <div className="py-8 px-4 text-center rounded-2xl bg-slate-50 border border-slate-200 mt-4">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-800">
                No hardware currently checked out or reserved
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                All dev kits, sensors, and oscilloscopes are secured in FCSIT lockers. Pending and active loans will appear here in real time.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-4">
              {filteredHardware.map((loan) => {
                const item = hardware.find((h) => h.id === loan.hardwareId);
                const targetHardwareId = loan.hardwareId || item?.id;
                return (
                  <div
                    key={loan.id}
                    onClick={() => {
                      if (targetHardwareId) {
                        navigateToHardwareCalendar(targetHardwareId);
                      } else {
                        setActiveTab('hardware');
                      }
                    }}
                    className="group/card bg-white hover:bg-slate-50/70 border border-slate-200 hover:border-slate-300 rounded-2xl p-4 transition-colors cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="font-mono text-xs font-medium px-2 py-0.5 rounded-md bg-blue-50 text-blue-900 border border-blue-200">
                          {loan.hardwareTag || item?.tag || 'HW'}
                        </span>
                        <span
                          className={`font-mono text-xs font-medium px-2 py-0.5 rounded-md border ${
                            loan.status === 'Active / Issued'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : loan.status === 'Overdue'
                              ? 'bg-rose-50 text-rose-800 border-rose-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          {loan.status}
                        </span>
                      </div>

                      <h3 className="text-xs font-semibold text-slate-900 group-hover/card:text-blue-900 transition-colors line-clamp-1">
                        {loan.hardwareName || item?.name}
                      </h3>

                      <div className="mt-2.5 space-y-1.5 text-xs text-slate-600">
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="text-slate-800 font-medium">
                            Due: {loan.dueDate}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate text-slate-700 font-medium">
                            {loan.userName} <span className="font-mono text-slate-400">({loan.userMatric})</span>
                          </span>
                        </div>

                        {loan.purpose && (
                          <p className="text-xs text-slate-500 line-clamp-1 italic pt-0.5">
                            "{loan.purpose}"
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-blue-900 group-hover/card:text-blue-700">
                      <span>Open hardware details</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover/card:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
};


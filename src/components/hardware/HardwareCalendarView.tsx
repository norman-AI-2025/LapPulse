import React, { useState } from 'react';
import { useLabPulse } from '../../context/LabPulseContext';
import { HardwareItem } from '../../types';
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  ShieldCheck, 
  Activity, 
  MapPin, 
  Users, 
  Plus, 
  Check, 
  AlertCircle, 
  Sparkles,
  ChevronDown,
  ChevronUp,
  Trash2,
  X,
  Wrench,
  CheckCircle2,
  Send,
  FileText
} from 'lucide-react';

interface HardwareCalendarViewProps {
  item: HardwareItem;
  onBack: () => void;
  onSelectItem: (itemId: string) => void;
}

export const HardwareCalendarView: React.FC<HardwareCalendarViewProps> = ({
  item,
  onBack,
  onSelectItem
}) => {
  const { 
    hardware, 
    loans, 
    waitlist, 
    currentUser, 
    requestLoan, 
    approveLoan,
    rejectLoan,
    reportDefect,
    updateHardwareDefectStatus,
    joinWaitlist, 
    leaveWaitlist 
  } = useLabPulse();

  const isOfficer = currentUser.role === 'admin';
  const currentHardware = hardware.find((h) => h.id === item.id) || item;

  // Officer Subtab State
  const [officerTab, setOfficerTab] = useState<'queue' | 'history' | 'reports'>('queue');
  const [expandedLoanId, setExpandedLoanId] = useState<string | null>(null);
  const [expandedDefectId, setExpandedDefectId] = useState<string | null>(null);

  // Defect Modal State
  const [isDefectModalOpen, setIsDefectModalOpen] = useState(false);
  const [defectIssue, setDefectIssue] = useState('');
  const [defectSeverity, setDefectSeverity] = useState<'Minor' | 'Moderate' | 'Critical'>('Moderate');

  // Current calendar viewing month (Year: 2026, Month: 10 = November, 0-indexed)
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(10); // November (0-indexed: 10)

  // Interactive user date selection
  const [borrowDate, setBorrowDate] = useState<string>('2026-11-10');
  const [returnDate, setReturnDate] = useState<string>('2026-11-17');
  const [hoverDate, setHoverDate] = useState<string | null>(null);
  const [purpose, setPurpose] = useState<string>('');

  // Find all active/pending loans for this hardware item
  const itemLoans = loans.filter(
    (l) => l.hardwareId === currentHardware.id && (l.status === 'Active / Issued' || l.status === 'Pending Approval' || l.status === 'Overdue')
  );

  // Find queue/waitlist for this hardware item
  const itemWaitlist = waitlist.filter(
    (w) => w.targetId === currentHardware.id && w.status === 'waiting'
  );

  // Officer lists
  const itemPendingLoans = loans.filter(
    (l) => l.hardwareId === currentHardware.id && l.status === 'Pending Approval'
  );
  const itemHistoryLoans = loans.filter(
    (l) => l.hardwareId === currentHardware.id && l.status !== 'Pending Approval'
  );
  const itemDefects = currentHardware.defects || [];
  const itemLoanHistory = currentHardware.loanHistory || [];

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  const handleResetToday = () => {
    setCurrentYear(2026);
    setCurrentMonth(10); // November 2026
    setBorrowDate('2026-11-10');
    setReturnDate('2026-11-17');
  };

  // Helper to format date as YYYY-MM-DD
  const formatISO = (y: number, m: number, d: number) => {
    const mm = String(m + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${y}-${mm}-${dd}`;
  };

  // Build the 35 or 42 calendar grid cells for current month
  const getCalendarCells = () => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);

    // Day of week for 1st day (0 = Sun, 1 = Mon... convert so Mon is index 0)
    let startDayOfWeek = firstDay.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const totalDaysInMonth = lastDay.getDate();
    const cells: { dateStr: string; dayNumber: number; isCurrentMonth: boolean; isToday: boolean }[] = [];

    // Prev month padding
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = prevMonthLastDay - i;
      const m = currentMonth === 0 ? 11 : currentMonth - 1;
      const y = currentMonth === 0 ? currentYear - 1 : currentYear;
      cells.push({
        dateStr: formatISO(y, m, d),
        dayNumber: d,
        isCurrentMonth: false,
        isToday: false
      });
    }

    // Current month days
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const dateStr = formatISO(currentYear, currentMonth, d);
      const isToday = currentYear === 2026 && currentMonth === 10 && d === 10;
      cells.push({
        dateStr,
        dayNumber: d,
        isCurrentMonth: true,
        isToday
      });
    }

    // Next month padding to complete weeks
    const remaining = 7 - (cells.length % 7);
    if (remaining < 7) {
      for (let d = 1; d <= remaining; d++) {
        const m = currentMonth === 11 ? 0 : currentMonth + 1;
        const y = currentMonth === 11 ? currentYear + 1 : currentYear;
        cells.push({
          dateStr: formatISO(y, m, d),
          dayNumber: d,
          isCurrentMonth: false,
          isToday: false
        });
      }
    }

    return cells;
  };

  const calendarCells = getCalendarCells();

  // Determine loan status for a date cell: is it borrowed date, return date, or in-between?
  const getCellLoanInfo = (dateStr: string) => {
    // 1. Check existing active loans
    for (const loan of itemLoans) {
      if (dateStr === loan.requestDate && dateStr === loan.dueDate) {
        return { type: 'single' as const, loan };
      }
      if (dateStr === loan.requestDate) {
        return { type: 'start' as const, loan };
      }
      if (dateStr === loan.dueDate) {
        return { type: 'end' as const, loan };
      }
      if (dateStr > loan.requestDate && dateStr < loan.dueDate) {
        return { type: 'between' as const, loan };
      }
    }

    // 2. Check historical loan records if relevant
    for (const hist of item.loanHistory) {
      if (dateStr === hist.fromDate) return { type: 'hist-start' as const, hist };
      if (dateStr === hist.toDate) return { type: 'hist-end' as const, hist };
      if (dateStr > hist.fromDate && dateStr < hist.toDate) return { type: 'hist-between' as const, hist };
    }

    return null;
  };

  // Determine user selection range status
  const getUserSelectionInfo = (dateStr: string) => {
    if (!borrowDate) return null;
    if (borrowDate === dateStr && returnDate === dateStr) return 'single';
    if (borrowDate === dateStr) return 'start';
    if (returnDate === dateStr) return 'end';
    if (returnDate && dateStr > borrowDate && dateStr < returnDate) return 'between';
    if (!returnDate && borrowDate && hoverDate) {
      if (dateStr === hoverDate) return 'hover-end';
      if (dateStr > borrowDate && dateStr < hoverDate) return 'hover-between';
    }
    return null;
  };

  // Handle clicking a calendar cell date to pick or toggle range
  const handleDateClick = (dateStr: string) => {
    // If officer, booking range selection is disabled
    if (isOfficer) {
      return;
    }

    // 0. Do not allow selecting past dates
    const today = '2026-11-10';
    if (dateStr < today) {
      return;
    }

    // 1. If clicking the already selected borrowDate (when no returnDate is chosen yet) -> Unselect!
    if (borrowDate === dateStr && !returnDate) {
      setBorrowDate('');
      setReturnDate('');
      setHoverDate(null);
      return;
    }

    // 2. If clicking on the already selected returnDate -> Unselect returnDate!
    if (returnDate === dateStr) {
      setReturnDate('');
      setHoverDate(null);
      return;
    }

    // 3. If clicking on borrowDate when both are set -> Unselect borrowDate and reset!
    if (borrowDate === dateStr && returnDate) {
      setBorrowDate('');
      setReturnDate('');
      setHoverDate(null);
      return;
    }

    // 4. If nothing is selected, select this date as borrowDate
    if (!borrowDate) {
      setBorrowDate(dateStr);
      setReturnDate('');
      return;
    }

    // 5. If only borrowDate is selected, select returnDate
    if (borrowDate && !returnDate) {
      if (dateStr < borrowDate) {
        setReturnDate(borrowDate);
        setBorrowDate(dateStr);
      } else {
        setReturnDate(dateStr);
      }
      setHoverDate(null);
      return;
    }

    // 6. If both were already set and user clicks a different date, restart selection with this date
    setBorrowDate(dateStr);
    setReturnDate('');
    setHoverDate(null);
  };

  const handleLoanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!borrowDate || !returnDate || !purpose.trim()) return;

    requestLoan({
      hardwareId: currentHardware.id,
      requestDate: borrowDate,
      dueDate: returnDate,
      purpose: purpose.trim()
    });

    setPurpose('');
  };

  const handleDefectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!defectIssue.trim()) return;

    reportDefect(currentHardware.id, defectIssue.trim(), defectSeverity);
    setDefectIssue('');
    setIsDefectModalOpen(false);
  };

  const handleJoinQueue = () => {
    joinWaitlist('hardware', item.id, item.name, `${borrowDate} to ${returnDate || borrowDate}`, borrowDate);
  };

  const isUserInWaitlist = itemWaitlist.some((w) => w.userId === currentUser.id);

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-12 animate-in fade-in duration-200">
      
      {/* Top Header & Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 text-slate-500" />
          <span>Back to Hardware Vault</span>
        </button>

        {/* Quick Hardware Item Switcher */}
        <div className="relative">
          <select
            value={item.id}
            onChange={(e) => onSelectItem(e.target.value)}
            className="text-xs font-semibold bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 pr-8 appearance-none cursor-pointer focus:outline-none"
          >
            {hardware.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name} ({h.tag})
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Hardware Status Hero Card */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-slate-100 flex-shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-800">
                {item.tag}
              </span>
              <span className="text-xs text-slate-400">SN: {item.serialNumber}</span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {item.location}
              </span>
            </div>
            
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">{item.name}</h1>
            
            <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
              <span className="flex items-center gap-1 font-semibold text-slate-700">
                <Activity className="w-3.5 h-3.5 text-emerald-600" />
                Health: {item.healthPercentage}%
              </span>
              <span>•</span>
              <span>{item.category}</span>
            </div>
          </div>
        </div>

        {/* Live Availability Status Pill */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 text-right">
          <span className="text-xs text-slate-400">Current Stock Status</span>
          <span className={`text-xs font-bold px-3 py-1 rounded-full mt-1 border ${
            item.status === 'Under Maintenance'
              ? 'bg-amber-50 text-amber-800 border-amber-200'
              : item.availableUnits > 0
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}>
            {item.status === 'Under Maintenance'
              ? 'Under Maintenance'
              : item.availableUnits > 0
              ? `${item.availableUnits} of ${item.totalUnits} Units Available`
              : 'All Units Currently On Loan'}
          </span>
        </div>
      </div>

      {/* Main 2-Column Layout: Calendar (Left) & Borrow / Queue Panel (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* LEFT COLUMN: INTERACTIVE BORROWING CALENDAR (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
          
          {/* Calendar Header with Month Navigation */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">
                {monthNames[currentMonth]} {currentYear}
              </h2>
              <span className="text-xs text-slate-400">Borrowing Schedule</span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleResetToday}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                Today
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Month Calendar Grid */}
          <div className="select-none">
            
            {/* Days of week header */}
            <div className="grid grid-cols-7 gap-1 text-center font-bold text-[11px] text-slate-400 uppercase py-1 border-b border-slate-100">
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
              <div>Sun</div>
            </div>

            {/* Calendar Cells */}
            <div className="grid grid-cols-7 gap-1 mt-1 text-xs">
              {calendarCells.map((cell) => {
                const loanInfo = getCellLoanInfo(cell.dateStr);
                const userRange = getUserSelectionInfo(cell.dateStr);

                // Determine background & styling
                let cellBg = 'bg-white hover:bg-slate-50 text-slate-800';
                let indicator = null;

                // 1. User Selection Range (Highest priority visual feedback)
                if (userRange === 'start' || userRange === 'end' || userRange === 'single') {
                  cellBg = 'bg-[#002B7F] text-white font-bold shadow-sm';
                  indicator = (
                    <span className="text-[9px] block leading-tight text-amber-300 font-bold">
                      {userRange === 'start' ? 'Borrow' : userRange === 'end' ? 'Return' : 'Selected'}
                    </span>
                  );
                } else if (userRange === 'between') {
                  cellBg = 'bg-[#DBEAFE] text-blue-900 font-semibold';
                } else if (userRange === 'hover-end') {
                  cellBg = 'bg-blue-200 text-blue-900 font-semibold border-blue-400';
                  indicator = <span className="text-[9px] block text-blue-800 font-bold">Return</span>;
                } else if (userRange === 'hover-between') {
                  cellBg = 'bg-blue-50 text-blue-800';
                }
                // 2. Active Loan / Borrowed Range
                else if (loanInfo) {
                  if (loanInfo.type === 'start') {
                    cellBg = 'bg-[#00B4D8] text-white font-bold rounded-l-xl';
                    indicator = <span className="text-[9px] block leading-none opacity-90 truncate">Start</span>;
                  } else if (loanInfo.type === 'end') {
                    cellBg = 'bg-[#0077B6] text-white font-bold rounded-r-xl';
                    indicator = <span className="text-[9px] block leading-none opacity-90 truncate">Due</span>;
                  } else if (loanInfo.type === 'between') {
                    cellBg = 'bg-[#E0F2FE] text-sky-900 font-medium';
                  } else if (loanInfo.type === 'single') {
                    cellBg = 'bg-[#00B4D8] text-white font-bold rounded-xl';
                    indicator = <span className="text-[9px] block leading-none">Loan</span>;
                  } else if (loanInfo.type === 'hist-start' || loanInfo.type === 'hist-end' || loanInfo.type === 'hist-between') {
                    cellBg = 'bg-slate-100 text-slate-500';
                  }
                }

                const isPast = cell.dateStr < '2026-11-10';

                // If past date without active loan, show disabled
                if (isPast && !loanInfo && !userRange) {
                  cellBg = 'bg-slate-50/50 text-slate-300 cursor-not-allowed';
                }
                // If not in current viewing month
                else if (!cell.isCurrentMonth && !userRange && !loanInfo) {
                  cellBg = 'bg-slate-50/50 text-slate-300';
                }

                return (
                  <div
                    key={cell.dateStr}
                    onClick={() => !isPast && handleDateClick(cell.dateStr)}
                    onMouseEnter={() => !isPast && !returnDate && borrowDate && setHoverDate(cell.dateStr)}
                    className={`min-h-[58px] p-1.5 rounded-xl border border-slate-100 transition-all ${
                      isPast ? 'cursor-not-allowed' : 'cursor-pointer'
                    } flex flex-col justify-between ${cellBg}`}
                    title={
                      loanInfo
                        ? `On Loan: ${(loanInfo as any).loan?.userName || (loanInfo as any).hist?.borrower}`
                        : isPast
                        ? 'Past date - loans closed'
                        : `Click to select ${cell.dateStr}`
                    }
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-semibold ${cell.isToday && userRange !== 'start' ? 'px-1.5 py-0.2 rounded-md bg-emerald-500 text-white font-bold' : ''}`}>
                        {cell.dayNumber}
                      </span>
                      {cell.isToday && (
                        <span className="text-[8px] font-bold text-emerald-600">TODAY</span>
                      )}
                    </div>

                    <div className="text-[9px] truncate">
                      {indicator}
                      {loanInfo && (loanInfo.type === 'start' || loanInfo.type === 'between') && (
                        <span className="truncate block opacity-80 text-[8px]">
                          {(loanInfo as any).loan?.userName?.split(' ')[0]}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Color-Coded Legend matching user request */}
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs font-medium text-slate-600">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-[10px] font-bold uppercase text-slate-400">Legend:</span>
              
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-md bg-[#00B4D8] inline-block" />
                <span className="text-[11px]">Borrowed (Start)</span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-md bg-[#E0F2FE] border border-sky-300 inline-block" />
                <span className="text-[11px]">Dates in Between</span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-md bg-[#0077B6] inline-block" />
                <span className="text-[11px]">Return Due (End)</span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-md bg-[#002B7F] inline-block" />
                <span className="text-[11px] font-bold text-blue-900">Your Selection</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-400">
              {isOfficer 
                ? 'Officer Mode: Schedule is read-only. Manage Queue, History & Reports on the right.' 
                : 'Click any 2 dates on calendar to set range'}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: FOR STUDENT -> LOAN FORM, QUEUE & HISTORY; FOR OFFICER -> QUEUE, HISTORY, REPORTS */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* ============================================================== */}
          {/* OFFICER VIEW: QUEUE LIST, HISTORY LIST & REPORTS (NO BOOKING)  */}
          {/* ============================================================== */}
          {isOfficer ? (
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4 animate-in fade-in">
              
              {/* Header & Sub-Navigation Pills */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                    Officer Station
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 mt-1">
                    Asset Operations
                  </h3>
                </div>

                {/* Segmented 3-Tab Control */}
                <div className="flex items-center bg-slate-100 p-1 rounded-2xl self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setOfficerTab('queue')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      officerTab === 'queue'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5 text-amber-500" />
                    <span>Queue</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      itemPendingLoans.length > 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {itemPendingLoans.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOfficerTab('history')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      officerTab === 'history'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5 text-blue-500" />
                    <span>History</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-slate-200 text-slate-600">
                      {itemHistoryLoans.length + itemLoanHistory.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOfficerTab('reports')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      officerTab === 'reports'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Wrench className="w-3.5 h-3.5 text-rose-500" />
                    <span>Reports</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      itemDefects.filter(d => d.status !== 'Resolved').length > 0
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-slate-200 text-slate-600'
                    }`}>
                      {itemDefects.length}
                    </span>
                  </button>
                </div>
              </div>

              {/* TAB 1: QUEUE LIST (Show Reason, Approve and Decline Buttons) */}
              {officerTab === 'queue' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500 pb-0.5">
                    <span>Pending loan applications awaiting officer action</span>
                    <span>{itemPendingLoans.length} pending</span>
                  </div>

                  {itemPendingLoans.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                      <p className="text-xs font-semibold text-slate-700">All Loan Requests Processed</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">No pending loan requests in queue for this equipment.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {itemPendingLoans.map((l) => (
                        <div key={l.id} className="p-4 rounded-2xl border border-amber-200/80 bg-amber-50/30 space-y-3 transition-all hover:shadow-sm">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 text-sm">{l.userName}</span>
                                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                                  {l.userMatric}
                                </span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900">
                                  Pending Approval
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                                <span className="flex items-center gap-1 font-semibold text-slate-700">
                                  <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                                  {l.requestDate} → {l.dueDate}
                                </span>
                              </div>
                            </div>

                            {/* Approve and Decline Buttons */}
                            <div className="flex items-center gap-2 pt-1 sm:pt-0">
                              <button
                                type="button"
                                onClick={() => approveLoan(l.id)}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-sm flex items-center gap-1.5"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Approve</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => rejectLoan(l.id, 'Declined by FCSIT Technical Officer')}
                                className="px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 font-semibold text-xs transition-colors flex items-center gap-1.5"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>Decline</span>
                              </button>
                            </div>
                          </div>

                          {/* Reason & Project Objective Callout */}
                          <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                              Reason & Project Objective
                            </span>
                            <p className="text-xs font-medium text-slate-800 leading-relaxed">
                              &ldquo;{l.purpose}&rdquo;
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: HISTORY LIST (Expand Button to Know More) */}
              {officerTab === 'history' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500 pb-0.5">
                    <span>Recorded loan cycles for this hardware item</span>
                    <span>{itemHistoryLoans.length + itemLoanHistory.length} total records</span>
                  </div>

                  {itemHistoryLoans.length === 0 && itemLoanHistory.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100">
                      <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-60" />
                      <p className="text-xs font-semibold text-slate-700">Zero Previous Loan Cycles</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Completed loans and audit checklists will be logged here.</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                      {/* Active/Completed Loans */}
                      {itemHistoryLoans.map((l) => {
                        const isExpanded = expandedLoanId === l.id;
                        return (
                          <div key={l.id} className="p-3 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-900 text-xs">{l.userName}</span>
                                  <span className="font-mono text-[10px] text-slate-500">({l.userMatric})</span>
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                    l.status === 'Active / Issued'
                                      ? 'bg-emerald-500 text-white'
                                      : l.status === 'Overdue'
                                      ? 'bg-rose-500 text-white'
                                      : 'bg-slate-700 text-white'
                                  }`}>
                                    {l.status}
                                  </span>
                                </div>
                                <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                                  <span>{l.requestDate} → {l.dueDate}</span>
                                </div>
                              </div>

                              {/* Expand Button to Know More */}
                              <button
                                type="button"
                                onClick={() => setExpandedLoanId(isExpanded ? null : l.id)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors shadow-sm self-start sm:self-auto"
                              >
                                <span>{isExpanded ? 'Collapse' : 'Expand Details'}</span>
                                {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-500" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />}
                              </button>
                            </div>

                            {/* Expanded Details Section */}
                            {isExpanded && (
                              <div className="mt-3 pt-3 border-t border-slate-200/80 space-y-2.5 text-xs animate-in fade-in">
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="p-2.5 bg-white rounded-xl border border-slate-100">
                                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Token Pass Code</span>
                                    <span className="font-mono font-bold text-blue-700">{l.tokenCode}</span>
                                  </div>
                                  <div className="p-2.5 bg-white rounded-xl border border-slate-100">
                                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Serial Number</span>
                                    <span className="font-mono font-semibold text-slate-800">{l.serialNumber}</span>
                                  </div>
                                </div>

                                <div className="p-2.5 bg-white rounded-xl border border-slate-100">
                                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Full Project Purpose</span>
                                  <p className="text-slate-800 font-medium">{l.purpose}</p>
                                </div>

                                {l.conditionOut && (
                                  <div className="p-2.5 bg-white rounded-xl border border-slate-100">
                                    <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Condition Upon Issue</span>
                                    <p className="text-slate-700">{l.conditionOut}</p>
                                  </div>
                                )}

                                {/* Mandatory Physical Checklist Results */}
                                <div className="p-2.5 bg-white rounded-xl border border-slate-100 space-y-1">
                                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Physical Audit Checklist</span>
                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 text-[11px] text-slate-700">
                                    <span className="flex items-center gap-1 text-emerald-700">
                                      <Check className="w-3 h-3" /> Chassis Intact
                                    </span>
                                    <span className="flex items-center gap-1 text-emerald-700">
                                      <Check className="w-3 h-3" /> Accessories Included
                                    </span>
                                    <span className="flex items-center gap-1 text-emerald-700">
                                      <Check className="w-3 h-3" /> Powers on OK
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {/* Archived Historical Loans */}
                      {itemLoanHistory.map((hist) => {
                        const isExpanded = expandedLoanId === hist.id;
                        return (
                          <div key={hist.id} className="p-3 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-900 text-xs">{hist.borrower}</span>
                                  <span className="font-mono text-[10px] text-slate-500">({hist.matric})</span>
                                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                    {hist.returnCondition}
                                  </span>
                                </div>
                                <div className="text-[11px] text-slate-500 mt-0.5">
                                  {hist.fromDate} → {hist.toDate}
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => setExpandedLoanId(isExpanded ? null : hist.id)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors shadow-sm self-start sm:self-auto"
                              >
                                <span>{isExpanded ? 'Collapse' : 'Expand Details'}</span>
                                {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-500" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />}
                              </button>
                            </div>

                            {isExpanded && (
                              <div className="mt-3 pt-3 border-t border-slate-200/80 space-y-2 text-xs animate-in fade-in">
                                <div className="p-2.5 bg-white rounded-xl border border-slate-100">
                                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Return Audit Notes</span>
                                  <p className="text-slate-800 font-medium">{hist.notes || 'Clean return verified by technical officer.'}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: REPORTS (Defect & Maintenance Issues, Expand Button to Know More) */}
              {officerTab === 'reports' && (
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-0.5">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        Defect & Diagnostic Reports ({itemDefects.length})
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Operational health issues & physical wear logs.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsDefectModalOpen(true)}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors shadow-sm flex items-center gap-1.5 self-start sm:self-auto"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Report Defect</span>
                    </button>
                  </div>

                  {itemDefects.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-70" />
                      <p className="text-xs font-semibold text-slate-700">Hardware Passport Clean</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">No reported defects or open maintenance tickets.</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                      {itemDefects.map((d) => {
                        const isExpanded = expandedDefectId === d.id;
                        return (
                          <div key={d.id} className="p-3.5 rounded-2xl border border-slate-200 bg-white space-y-2 hover:border-slate-300 transition-colors">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-bold text-slate-900 text-xs">{d.issue}</span>
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                    d.severity === 'Critical'
                                      ? 'bg-rose-100 text-rose-800'
                                      : d.severity === 'Moderate'
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-blue-100 text-blue-800'
                                  }`}>
                                    {d.severity}
                                  </span>
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                                    d.status === 'Resolved'
                                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                      : 'bg-amber-50 text-amber-800 border-amber-200'
                                  }`}>
                                    {d.status}
                                  </span>
                                </div>
                                <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                                  <span>{d.date}</span>
                                  <span>•</span>
                                  <span>By {d.reportedBy}</span>
                                </div>
                              </div>

                              {/* Expand Button to Know More */}
                              <button
                                type="button"
                                onClick={() => setExpandedDefectId(isExpanded ? null : d.id)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors self-start sm:self-auto"
                              >
                                <span>{isExpanded ? 'Collapse' : 'Expand Details'}</span>
                                {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-500" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />}
                              </button>
                            </div>

                            {/* Expanded Defect Details & Officer Status Controls */}
                            {isExpanded && (
                              <div className="mt-3 pt-3 border-t border-slate-100 space-y-2 text-xs animate-in fade-in">
                                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Defect Diagnostic Record</span>
                                  <p className="text-slate-800 font-medium">{d.issue}</p>
                                </div>

                                <div className="flex items-center gap-2 pt-1 flex-wrap">
                                  <span className="text-[11px] font-semibold text-slate-500">Status Update:</span>
                                  {d.status !== 'Investigating' && (
                                    <button
                                      type="button"
                                      onClick={() => updateHardwareDefectStatus(currentHardware.id, d.id, 'Investigating')}
                                      className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-[11px] font-semibold"
                                    >
                                      Investigating
                                    </button>
                                  )}
                                  {d.status !== 'Pending Parts' && (
                                    <button
                                      type="button"
                                      onClick={() => updateHardwareDefectStatus(currentHardware.id, d.id, 'Pending Parts')}
                                      className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 text-[11px] font-semibold"
                                    >
                                      Pending Parts
                                    </button>
                                  )}
                                  {d.status !== 'Resolved' && (
                                    <button
                                      type="button"
                                      onClick={() => updateHardwareDefectStatus(currentHardware.id, d.id, 'Resolved')}
                                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold"
                                    >
                                      Mark Resolved
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* ============================================================== */
            /* STUDENT VIEW: LOAN FORM, QUEUE LIST & BORROWING HISTORY       */
            /* ============================================================== */
            <>
              {/* SECTION 1: INTERACTIVE BORROW REQUEST FORM */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3.5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                      Loan Application
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                      Choose Borrow & Return Dates
                    </h3>
                  </div>

                  {(borrowDate || returnDate) && (
                    <button
                      type="button"
                      onClick={() => {
                        setBorrowDate('');
                        setReturnDate('');
                        setHoverDate(null);
                      }}
                      className="text-[11px] font-semibold text-slate-400 hover:text-rose-600 transition-colors"
                    >
                      Clear Selection
                    </button>
                  )}
                </div>

                <form onSubmit={handleLoanSubmit} className="space-y-3 text-xs">
                  
                  {/* Date pickers (Auto-synced with calendar selection) */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Date to Borrow *
                      </label>
                      <input
                        type="date"
                        required
                        min="2026-11-10"
                        value={borrowDate}
                        onChange={(e) => setBorrowDate(e.target.value)}
                        className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-600"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Date to Return *
                      </label>
                      <input
                        type="date"
                        required
                        min={borrowDate || "2026-11-10"}
                        value={returnDate}
                        onChange={(e) => setReturnDate(e.target.value)}
                        className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>

                  {/* Purpose / Reason input */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Reason & Project Objective *
                    </label>
                    <textarea
                      rows={2}
                      required
                      placeholder="e.g. FYP Edge Deep Learning inference with YOLOv8 on Jetson Nano..."
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div className="text-[11px] text-slate-400">
                    Student Borrower: <strong className="text-slate-700">{currentUser.name}</strong> ({currentUser.matricOrStaffId})
                  </div>

                  {/* Action Button */}
                  {currentHardware.availableUnits > 0 ? (
                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-[#002B7F] hover:bg-blue-800 text-white font-semibold text-xs transition-colors shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>Confirm Hardware Loan Request</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleJoinQueue}
                      disabled={isUserInWaitlist}
                      className={`w-full py-2.5 rounded-xl font-semibold text-xs transition-colors shadow-sm flex items-center justify-center gap-1.5 ${
                        isUserInWaitlist
                          ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                          : 'bg-amber-600 hover:bg-amber-700 text-white'
                      }`}
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>{isUserInWaitlist ? 'Already in Queue (#1)' : 'All Units On Loan: Join Queue'}</span>
                    </button>
                  )}
                </form>
              </div>

              {/* SECTION 2: QUEUE LIST (WAITLIST) */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-amber-600" />
                    <span>Hardware Queue List ({itemWaitlist.length})</span>
                  </h3>
                  <span className="text-[10px] text-slate-400">Standby allocations</span>
                </div>

                {itemWaitlist.length === 0 ? (
                  <div className="text-center py-4 text-slate-400 text-xs">
                    No students currently waiting in queue for this item.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {itemWaitlist.map((q) => {
                      const isMe = q.userId === currentUser.id;
                      return (
                        <div
                          key={q.id}
                          className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                            isMe ? 'bg-amber-50/60 border-amber-200' : 'bg-slate-50 border-slate-100'
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900">
                                #{q.position} {q.userName}
                              </span>
                              {isMe && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 bg-amber-200 text-amber-900 rounded-md">
                                  YOU
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-500">{q.userMatric} • Joined: {q.createdAt}</div>
                          </div>

                          {isMe && (
                            <button
                              onClick={() => leaveWaitlist(q.id)}
                              className="p-1 rounded-lg text-rose-500 hover:bg-rose-50"
                              title="Leave queue"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* SECTION 3: BORROWING HISTORY LOG */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
                <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-600" />
                  <span>Borrowing History</span>
                </h3>

                {currentHardware.loanHistory.length === 0 ? (
                  <div className="text-center py-4 text-slate-400 text-xs">
                    Zero previous loan cycles recorded for this asset.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {currentHardware.loanHistory.map((hist) => (
                      <div key={hist.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800">{hist.borrower}</span>
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                            {hist.returnCondition}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1">
                          {hist.fromDate} → {hist.toDate}
                        </div>
                        {hist.notes && (
                          <p className="text-[11px] text-slate-400 italic mt-0.5">&ldquo;{hist.notes}&rdquo;</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* DEFECT REPORT MODAL (OFFICER / USER FLOW) */}
      {isDefectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">
                  Report Hardware Defect
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">{currentHardware.name}</h3>
                <p className="text-xs text-slate-500">{currentHardware.tag} • SN: {currentHardware.serialNumber}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsDefectModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDefectSubmit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Defect Description / Symptoms *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. HDMI output signal unstable, USB port 2 bent pin, intermittent power cutoff under load..."
                  value={defectIssue}
                  onChange={(e) => setDefectIssue(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Severity Rating</label>
                <select
                  value={defectSeverity}
                  onChange={(e: any) => setDefectSeverity(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                >
                  <option value="Minor">Minor (Usable with warning, -5% Health)</option>
                  <option value="Moderate">Moderate (Restricted usage, -12% Health)</option>
                  <option value="Critical">Critical (Puts unit into Maintenance, -25% Health)</option>
                </select>
              </div>

              <div className="text-[11px] text-slate-400">
                Reported by: <strong className="text-slate-700">{currentUser.name}</strong> ({currentUser.matricOrStaffId})
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsDefectModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-500 hover:bg-slate-100 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Log Defect in Passport</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};


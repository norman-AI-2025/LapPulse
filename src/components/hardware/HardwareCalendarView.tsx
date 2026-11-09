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
  Trash2
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
    joinWaitlist, 
    leaveWaitlist 
  } = useLabPulse();

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
    (l) => l.hardwareId === item.id && (l.status === 'Active / Issued' || l.status === 'Pending Approval' || l.status === 'Overdue')
  );

  // Find queue/waitlist for this hardware item
  const itemWaitlist = waitlist.filter(
    (w) => w.targetId === item.id && w.status === 'waiting'
  );

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
      hardwareId: item.id,
      requestDate: borrowDate,
      dueDate: returnDate,
      purpose: purpose.trim()
    });

    setPurpose('');
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
              Click any 2 dates on calendar to set range
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: BORROW REQUEST FORM, QUEUE LIST, & HISTORY (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
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
              {item.availableUnits > 0 ? (
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

            {item.loanHistory.length === 0 ? (
              <div className="text-center py-4 text-slate-400 text-xs">
                Zero previous loan cycles recorded for this asset.
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {item.loanHistory.map((hist) => (
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
        </div>
      </div>
    </div>
  );
};


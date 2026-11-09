import React, { useState } from 'react';
import { useLabPulse } from '../../context/LabPulseContext';
import { LabRoom } from '../../types';
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  MapPin, 
  Users, 
  Plus, 
  Check, 
  X, 
  AlertCircle,
  Calendar,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Wrench,
  Send
} from 'lucide-react';

interface SpaceTimetableViewProps {
  room: LabRoom;
  onBack: () => void;
  onSelectRoom: (roomId: string) => void;
}

// 30-minute operational time blocks (08:00 am to 05:00 pm) matching university schedule
export const TIME_BLOCKS = [
  '08:00 am - 08:30 am',
  '08:30 am - 09:00 am',
  '09:00 am - 09:30 am',
  '09:30 am - 10:00 am',
  '10:00 am - 10:30 am',
  '10:30 am - 11:00 am',
  '11:00 am - 11:30 am',
  '11:30 am - 12:00 pm',
  '12:00 pm - 12:30 pm',
  '12:30 pm - 01:00 pm',
  '01:00 pm - 01:30 pm',
  '01:30 pm - 02:00 pm',
  '02:00 pm - 02:30 pm',
  '02:30 pm - 03:00 pm',
  '03:00 pm - 03:30 pm',
  '03:30 pm - 04:00 pm',
  '04:00 pm - 04:30 pm',
  '04:30 pm - 05:00 pm',
];

interface DayInfo {
  dateStr: string; // YYYY-MM-DD
  dayName: string; // Monday, Tuesday, ...
  displayDate: string; // 9 Nov, 2026
  isToday: boolean;
  isPast: boolean;
  isHoliday?: boolean;
  holidayName?: string;
  isClosed?: boolean;
}

export const SpaceTimetableView: React.FC<SpaceTimetableViewProps> = ({
  room,
  onBack,
  onSelectRoom
}) => {
  const { 
    rooms, 
    bookings, 
    currentUser, 
    createBooking, 
    approveBooking, 
    rejectBooking, 
    addRoomReport, 
    updateRoomReportStatus, 
    joinWaitlist, 
    setActiveTab 
  } = useLabPulse();

  const isOfficer = currentUser.role === 'admin';
  const currentRoom = rooms.find((r) => r.id === room.id) || room;

  const [weekOffset, setWeekOffset] = useState<number>(0);

  // Officer Subtab State
  const [officerTab, setOfficerTab] = useState<'queue' | 'history' | 'reports'>('queue');
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null);
  const [expandedReportId, setExpandedReportId] = useState<string | null>(null);

  // Space Issue Report Modal State
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportTitle, setReportTitle] = useState('');
  const [reportCategory, setReportCategory] = useState<'Air Conditioning' | 'Projector & AV' | 'Workstations & PCs' | 'Electrical & Power' | 'Cleanliness' | 'Network & Wi-Fi' | 'Other'>('Workstations & PCs');
  const [reportSeverity, setReportSeverity] = useState<'Minor' | 'Moderate' | 'Critical'>('Moderate');
  const [reportDescription, setReportDescription] = useState('');

  // Booking modal/drawer state (for students)
  const [activeBookingSlot, setActiveBookingSlot] = useState<{
    date: string;
    dayName: string;
    timeBlock: string;
  } | null>(null);

  // Slot inspection modal (for booked slot)
  const [inspectSlot, setInspectSlot] = useState<{
    booking: any;
    date: string;
    timeBlock: string;
  } | null>(null);

  const [purpose, setPurpose] = useState('');
  const [isFYP, setIsFYP] = useState(room.highResource);
  const [duration, setDuration] = useState('1 Hour');

  const calculateSlotWithDuration = (startBlock: string, durationStr: string) => {
    try {
      const startTime = startBlock.split(' - ')[0].trim();
      const [timePart, modifier] = startTime.split(' ');
      let [hours, minutes] = timePart.split(':').map(Number);
      if (modifier === 'pm' && hours < 12) hours += 12;
      if (modifier === 'am' && hours === 12) hours = 0;

      let addMinutes = 60;
      if (durationStr === '30 Mins') addMinutes = 30;
      if (durationStr === '1 Hour') addMinutes = 60;
      if (durationStr === '2 Hours') addMinutes = 120;
      if (durationStr === '3 Hours') addMinutes = 180;
      if (durationStr === '4 Hours (Half-Day)') addMinutes = 240;

      const totalMinutes = hours * 60 + minutes + addMinutes;
      let endHours = Math.floor(totalMinutes / 60);
      const endMinutes = totalMinutes % 60;
      const endModifier = endHours >= 12 ? 'pm' : 'am';
      let displayEndHours = endHours > 12 ? endHours - 12 : endHours;
      if (displayEndHours === 0) displayEndHours = 12;

      const endTimeStr = `${String(displayEndHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')} ${endModifier}`;
      return `${startTime} - ${endTimeStr}`;
    } catch {
      return startBlock;
    }
  };

  // Base reference date is 2026-11-10 (Tuesday)
  const getWeekDays = (offset: number): DayInfo[] => {
    // Current date is 2026-11-10
    const today = new Date(2026, 10, 10); // Nov 10, 2026
    const dayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday, 2 is Tuesday
    
    // Calculate Monday of the week
    const monday = new Date(today);
    const diffToMonday = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek;
    monday.setDate(today.getDate() + diffToMonday + offset * 7);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const days: DayInfo[] = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);

      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const date = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${date}`;

      const isToday = offset === 0 && d.getDate() === 10 && d.getMonth() === 10 && d.getFullYear() === 2026;
      const isPast = dateStr < '2026-11-10';
      
      // Monday 9 Nov 2026 is Hari Deepavali
      const isHariDeepavali = d.getDate() === 9 && d.getMonth() === 10 && d.getFullYear() === 2026;
      const isSunday = d.getDay() === 0;

      days.push({
        dateStr,
        dayName: dayNames[i],
        displayDate: `${d.getDate()} ${monthNames[d.getMonth()]}, ${year}`,
        isToday,
        isPast,
        isHoliday: isHariDeepavali,
        holidayName: isHariDeepavali ? 'HARI DEEPAVALI' : undefined,
        isClosed: isHariDeepavali || isSunday,
      });
    }

    return days;
  };

  const weekDays = getWeekDays(weekOffset);

  // Check if a time block is covered by an existing booking
  const getBookingForCell = (dateStr: string, timeBlock: string) => {
    // Match bookings that fall on this date
    const dateBookings = bookings.filter((b) => b.roomId === room.id && b.date === dateStr);

    for (const b of dateBookings) {
      if (b.status === 'Cancelled' || b.status === 'Rejected') continue;

      // Check slot string format: either direct match or overlaps
      if (b.slot.includes(timeBlock)) {
        return b;
      }

      // Check standard 2-hour slots overlap
      // e.g. "10:00 - 12:00" overlaps "10:00 am - 10:30 am", "10:30 am - 11:00 am", "11:00 am - 11:30 am", "11:30 am - 12:00 pm"
      const slotRange = b.slot;
      if (slotRange.includes('08:00') && slotRange.includes('10:00')) {
        if (timeBlock.startsWith('08:') || timeBlock.startsWith('09:')) return b;
      }
      if (slotRange.includes('10:00') && slotRange.includes('12:00')) {
        if (timeBlock.startsWith('10:') || timeBlock.startsWith('11:')) return b;
      }
      if (slotRange.includes('12:00') && slotRange.includes('14:00')) {
        if (timeBlock.startsWith('12:') || timeBlock.startsWith('01:')) return b;
      }
      if (slotRange.includes('14:00') && slotRange.includes('16:00')) {
        if (timeBlock.startsWith('02:') || timeBlock.startsWith('03:')) return b;
      }
      if (slotRange.includes('16:00') && slotRange.includes('18:00')) {
        if (timeBlock.startsWith('04:') || timeBlock.startsWith('05:')) return b;
      }
    }

    // Default seeded schedule items from the uploaded screenshot:
    // Wednesday (11 Nov): 02:00 pm - 04:30 pm has ".: Persedi ..."
    if (dateStr === '2026-11-11' && (timeBlock.startsWith('02:') || timeBlock.startsWith('03:') || timeBlock.startsWith('04:00'))) {
      return {
        id: 'bk-seeded-wed',
        tokenCode: 'LP-3104',
        userName: 'WIX2001 Workshop',
        purpose: 'Persediaan Makmal & Ujian Rangkaian',
        status: 'Approved' as const,
        userId: 'system'
      };
    }

    // Thursday (12 Nov): 08:00 am - 05:00 pm has ".: A Day w ..."
    if (dateStr === '2026-11-12') {
      return {
        id: 'bk-seeded-thu',
        tokenCode: 'LP-5521',
        userName: 'FCSIT AI Workshop',
        purpose: 'A Day with Edge AI & Robotics Workshop',
        status: 'Approved' as const,
        userId: 'system'
      };
    }

    return null;
  };

  const handleCellClick = (day: DayInfo, timeBlock: string) => {
    if (day.isClosed) return;

    const existingBooking = getBookingForCell(day.dateStr, timeBlock);

    // OFFICER USER FLOW: Timetable is read-only for bookings.
    // Clicking an existing booked slot inspects its details. Available slots do not open booking form.
    if (isOfficer) {
      if (existingBooking) {
        if (inspectSlot && inspectSlot.date === day.displayDate && inspectSlot.timeBlock === timeBlock) {
          setInspectSlot(null);
        } else {
          setInspectSlot({
            booking: existingBooking,
            date: day.displayDate,
            timeBlock
          });
        }
      }
      return;
    }

    // STUDENT USER FLOW:
    // Block reservation on past dates
    if (day.isPast) {
      if (existingBooking) {
        setInspectSlot({
          booking: existingBooking,
          date: day.displayDate,
          timeBlock
        });
      }
      return;
    }

    // Toggle unselect if clicking the already open booking slot
    if (activeBookingSlot && activeBookingSlot.date === day.dateStr && activeBookingSlot.timeBlock === timeBlock) {
      setActiveBookingSlot(null);
      return;
    }

    // Toggle unselect if clicking the already open inspect slot
    if (inspectSlot && inspectSlot.date === day.displayDate && inspectSlot.timeBlock === timeBlock) {
      setInspectSlot(null);
      return;
    }

    if (existingBooking) {
      setActiveBookingSlot(null);
      setInspectSlot({
        booking: existingBooking,
        date: day.displayDate,
        timeBlock
      });
    } else {
      setInspectSlot(null);
      setActiveBookingSlot({
        date: day.dateStr,
        dayName: day.dayName,
        timeBlock
      });
      setPurpose('');
      setIsFYP(room.highResource);
    }
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTitle.trim() || !reportDescription.trim()) return;

    addRoomReport({
      roomId: room.id,
      title: reportTitle.trim(),
      description: reportDescription.trim(),
      category: reportCategory,
      severity: reportSeverity
    });

    setReportTitle('');
    setReportDescription('');
    setIsReportModalOpen(false);
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBookingSlot || !purpose.trim()) return;

    const finalSlot = calculateSlotWithDuration(activeBookingSlot.timeBlock, duration);

    createBooking({
      roomId: room.id,
      date: activeBookingSlot.date,
      slot: finalSlot,
      purpose: purpose.trim(),
      isFYP,
      supervisorName: isFYP ? 'Prof. Madya Dr. Amir Rudin' : undefined,
      supervisorEmail: isFYP ? 'amirrudin@um.edu.my' : undefined,
    });

    setActiveBookingSlot(null);
  };

  const roomPendingBookings = bookings.filter(
    (b) => b.roomId === room.id && (b.status === 'Pending Approval' || b.status === 'Pending Endorsement')
  );
  const roomHistoryBookings = bookings.filter(
    (b) => b.roomId === room.id && b.status !== 'Pending Approval' && b.status !== 'Pending Endorsement'
  );
  const roomReports = currentRoom.reports || [];

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-12 animate-in fade-in duration-200">
      
      {/* Top Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 text-slate-500" />
          <span>Back to Spaces</span>
        </button>

        {/* Space Selector Switcher */}
        <div className="relative">
          <select
            value={room.id}
            onChange={(e) => onSelectRoom(e.target.value)}
            className="text-xs font-semibold bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 pr-8 appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-slate-400"
          >
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                Switch Space: {r.name} ({r.code})
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Space Hero Info Header */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <img
            src={room.imageUrl}
            alt={room.name}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-slate-100 flex-shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-800">
                {room.code}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {room.floor}, {room.block}
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">{room.name}</h1>
            <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                Capacity: <strong>{room.capacity} seats</strong>
              </span>
              <span>•</span>
              <span className="text-slate-600">{room.category}</span>
            </div>
          </div>
        </div>

        {/* Action Status */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 text-right">
          <span className="text-xs font-medium text-slate-400">Timetable View</span>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full border mt-1 ${
            isOfficer
              ? 'text-blue-800 bg-blue-50 border-blue-200/80'
              : 'text-emerald-700 bg-emerald-50 border-emerald-200/60'
          }`}>
            {isOfficer ? 'Officer Mode: Schedule Read-Only' : 'Click any cell to book'}
          </span>
        </div>
      </div>

      {/* Week Navigation Header (Clean version of the uploaded screenshot) */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeekOffset((prev) => prev - 1)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Last Week</span>
          </button>

          <button
            onClick={() => setWeekOffset(0)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              weekOffset === 0
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            This Week
          </button>

          <button
            onClick={() => setWeekOffset((prev) => prev + 1)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors"
          >
            <span>Next Week</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="text-xs font-bold text-slate-800">
          Week of {weekDays[0].displayDate} – {weekDays[6].displayDate}
        </div>
      </div>

      {/* THE INTERACTIVE TIMETABLE GRID (UPGRADED VERSION OF SCREENSHOT) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Scrollable Container */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse min-w-[900px] select-none">
            
            {/* Table Header: Days of the Week */}
            <thead>
              <tr className="border-b border-slate-200 bg-[#0F4C5C] text-white">
                {/* Sticky top-left time header */}
                <th className="sticky left-0 z-20 p-3 w-40 text-center font-bold text-[11px] border-r border-teal-800/40 bg-[#0B3A46] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.2)]">
                  Time Slot
                </th>

                {weekDays.map((day) => (
                  <th
                    key={day.dateStr}
                    className={`p-3 text-center border-r border-teal-800/40 transition-colors ${
                      day.isToday ? 'bg-[#009688] text-white font-extrabold' : ''
                    }`}
                  >
                    <div className="font-bold text-xs">{day.dayName}</div>
                    <div className="text-[10px] font-medium opacity-90 mt-0.5">{day.displayDate}</div>
                    {day.isToday && (
                      <span className="inline-block mt-1 text-[9px] uppercase tracking-wider bg-white/20 px-2 py-0.2 rounded-full font-bold">
                        TODAY
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Table Body: Time Blocks */}
            <tbody className="divide-y divide-slate-100">
              {TIME_BLOCKS.map((timeBlock, rowIndex) => (
                <tr key={timeBlock} className="hover:bg-slate-50/40 transition-colors">
                  
                  {/* Sticky Time Block Label Column */}
                  <td className="sticky left-0 z-10 p-2.5 font-mono text-[11px] font-semibold text-slate-700 bg-slate-50 border-r border-slate-200 text-center whitespace-nowrap shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)]">
                    {timeBlock}
                  </td>

                  {/* 7 Days Columns */}
                  {weekDays.map((day) => {
                    const booking = getBookingForCell(day.dateStr, timeBlock);
                    const isMyBooking = booking?.userId === currentUser.id;

                    // CASE 1: PUBLIC HOLIDAY / CLOSED (Dark Red - e.g. Hari Deepavali)
                    if (day.isHoliday) {
                      return (
                        <td
                          key={day.dateStr}
                          className="p-1 border-r border-slate-200/80 bg-[#8B1E22] text-white text-center cursor-not-allowed select-none transition-colors"
                        >
                          {rowIndex === 0 ? (
                            <div className="py-1 font-bold text-[11px] tracking-wide uppercase">
                              {day.holidayName}
                            </div>
                          ) : (
                            <div className="h-4" />
                          )}
                        </td>
                      );
                    }

                    // CASE 2: SUNDAY CLOSED
                    if (day.isClosed) {
                      return (
                        <td
                          key={day.dateStr}
                          className="p-1 border-r border-slate-200/80 bg-slate-100/70 text-slate-400 text-center text-[10px]"
                        >
                          {rowIndex === 0 && <span className="font-medium">Closed</span>}
                        </td>
                      );
                    }

                    // CASE 3: BOOKED CELL (Vibrant Cyan / Blue or Pending Yellow)
                    if (booking) {
                      const isPending = booking.status === 'Pending Endorsement' || booking.status === 'Pending Approval';

                      return (
                        <td
                          key={day.dateStr}
                          onClick={() => handleCellClick(day, timeBlock)}
                          className={`p-1.5 border-r border-slate-200/80 cursor-pointer transition-all ${
                            isPending
                              ? 'bg-[#FFEB3B] text-slate-900 hover:bg-yellow-300 font-semibold'
                              : isMyBooking
                              ? 'bg-[#002B7F] text-white hover:bg-blue-900 font-bold'
                              : 'bg-[#00B4D8] text-white hover:bg-[#0096C7]'
                          }`}
                          title={`Booked: ${booking.purpose || booking.userName} (${booking.status})`}
                        >
                          <div className="px-2 py-1 rounded-lg text-[10px] leading-tight truncate">
                            {isMyBooking ? (
                              <span className="flex items-center gap-1 font-bold">
                                <Check className="w-3 h-3 text-amber-300" />
                                <span>My Pass ({booking.tokenCode})</span>
                              </span>
                            ) : (
                              <span>.: {booking.purpose || booking.userName}</span>
                            )}
                          </div>
                        </td>
                      );
                    }

                    // CASE 4: PAST DATE (No bookings permitted)
                    if (day.isPast) {
                      return (
                        <td
                          key={day.dateStr}
                          className="p-1.5 border-r border-slate-200/60 bg-slate-100/40 text-slate-300 text-center cursor-not-allowed select-none"
                          title="Past date - reservations closed"
                        >
                          <div className="h-5" />
                        </td>
                      );
                    }

                    // CASE 5: AVAILABLE CELL (Light Gray / White, Click to Book)
                    return (
                      <td
                        key={day.dateStr}
                        onClick={() => handleCellClick(day, timeBlock)}
                        className="p-1.5 border-r border-slate-200/70 bg-[#F1F3F5] hover:bg-emerald-100/60 transition-all cursor-pointer group text-center"
                      >
                        <div className="h-5 flex items-center justify-center">
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-emerald-800 flex items-center gap-0.5">
                            <Plus className="w-3 h-3 text-emerald-700" />
                            <span>Book</span>
                          </span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend Bar at Bottom (Exact match to uploaded screenshot layout) */}
        <div className="p-4 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs font-semibold">
          <div className="flex items-center gap-6">
            <span className="text-slate-400 font-bold uppercase text-[10px]">Legend :</span>
            
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-md bg-[#F1F3F5] border border-slate-300 inline-block" />
              <span className="text-slate-700">Available</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-md bg-[#00B4D8] inline-block shadow-sm" />
              <span className="text-slate-700">Booked</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-md bg-[#8B1E22] inline-block shadow-sm" />
              <span className="text-slate-700">Close</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-md bg-[#FFEB3B] border border-amber-300 inline-block shadow-sm" />
              <span className="text-slate-700">Pending</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-md bg-[#002B7F] inline-block shadow-sm" />
              <span className="text-blue-900 font-bold">My Booking</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400">
            {isOfficer 
              ? 'Officer Mode: Schedule is read-only. Manage Queue, History & Reports below.' 
              : 'Click any cell to reserve slot or join waitlist'}
          </div>
        </div>
      </div>

      {/* OFFICER USER FLOW: QUEUE LIST, HISTORY LIST & REPORTS (REPLACING BOOKING FUNCTION) */}
      {isOfficer && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5 animate-in fade-in">
          
          {/* Header & Sub-Navigation Pills */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                  Officer Desk
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-500 font-medium">Laboratory Operations & Audit</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-1">
                Space Management Station: {room.name}
              </h2>
            </div>

            {/* Segmented 3-Tab Control */}
            <div className="flex items-center bg-slate-100 p-1 rounded-2xl">
              <button
                onClick={() => setOfficerTab('queue')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  officerTab === 'queue'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-amber-500" />
                <span>Queue List</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  roomPendingBookings.length > 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-600'
                }`}>
                  {roomPendingBookings.length}
                </span>
              </button>

              <button
                onClick={() => setOfficerTab('history')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  officerTab === 'history'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-blue-500" />
                <span>History List</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-slate-200 text-slate-600">
                  {roomHistoryBookings.length}
                </span>
              </button>

              <button
                onClick={() => setOfficerTab('reports')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  officerTab === 'reports'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Wrench className="w-3.5 h-3.5 text-rose-500" />
                <span>Space Reports</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  roomReports.filter(r => r.status !== 'Resolved').length > 0
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-slate-200 text-slate-600'
                }`}>
                  {roomReports.length}
                </span>
              </button>
            </div>
          </div>

          {/* TAB 1: QUEUE LIST (Show Reason, Approve and Decline Buttons) */}
          {officerTab === 'queue' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 pb-1">
                <span>Pending reservation requests for {room.name}</span>
                <span>{roomPendingBookings.length} awaiting review</span>
              </div>

              {roomPendingBookings.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                  <p className="text-xs font-semibold text-slate-700">All Space Requests Cleared</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">No pending reservation requests in queue for this laboratory.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {roomPendingBookings.map((b) => (
                    <div key={b.id} className="p-4 rounded-2xl border border-amber-200/80 bg-amber-50/30 space-y-3 transition-all hover:shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm">{b.userName}</span>
                            <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                              {b.userMatric}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900">
                              {b.status}
                            </span>
                            {b.isFYP && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-900">
                                FYP
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                            <span className="flex items-center gap-1 font-semibold text-slate-700">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              {b.date}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1 font-mono font-semibold text-slate-700">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              {b.slot}
                            </span>
                            {b.courseCode && (
                              <>
                                <span>•</span>
                                <span>{b.courseCode}</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Approve and Decline Buttons */}
                        <div className="flex items-center gap-2 pt-2 sm:pt-0">
                          <button
                            type="button"
                            onClick={() => approveBooking(b.id)}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-sm flex items-center gap-1.5"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => rejectBooking(b.id, 'Declined by FCSIT Technical Officer')}
                            className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 font-semibold text-xs transition-colors flex items-center gap-1.5"
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
                          &ldquo;{b.purpose}&rdquo;
                        </p>
                      </div>

                      {b.endorsementNote && (
                        <div className="text-[11px] font-medium text-indigo-900 bg-indigo-50/70 p-2.5 rounded-xl border border-indigo-100 flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                          <span>
                            <strong>Supervisor Endorsed:</strong> {b.endorsementNote}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: HISTORY LIST (Expand Button to Know More) */}
          {officerTab === 'history' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 pb-1">
                <span>Recorded bookings & reservations for {room.name}</span>
                <span>{roomHistoryBookings.length} total records</span>
              </div>

              {roomHistoryBookings.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100">
                  <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-60" />
                  <p className="text-xs font-semibold text-slate-700">No Booking History Yet</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Past and completed sessions will be logged here.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {roomHistoryBookings.map((b) => {
                    const isExpanded = expandedHistoryId === b.id;
                    return (
                      <div key={b.id} className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              b.status === 'Active'
                                ? 'bg-emerald-500 text-white'
                                : b.status === 'Approved'
                                ? 'bg-blue-600 text-white'
                                : b.status === 'Completed'
                                ? 'bg-slate-700 text-white'
                                : 'bg-slate-200 text-slate-700'
                            }`}>
                              {b.status}
                            </span>
                            <div>
                              <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                                <span>{b.userName}</span>
                                <span className="font-mono text-[10px] text-slate-500 font-normal">({b.userMatric})</span>
                              </div>
                              <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                                <span>{b.date}</span>
                                <span>•</span>
                                <span className="font-mono">{b.slot}</span>
                              </div>
                            </div>
                          </div>

                          {/* Expand Button to Know More */}
                          <button
                            type="button"
                            onClick={() => setExpandedHistoryId(isExpanded ? null : b.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors shadow-sm self-start sm:self-auto"
                          >
                            <span>{isExpanded ? 'Collapse' : 'Expand Details'}</span>
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-500" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />}
                          </button>
                        </div>

                        {/* Expanded Details Section */}
                        {isExpanded && (
                          <div className="mt-3 pt-3 border-t border-slate-200/80 space-y-2.5 text-xs animate-in fade-in">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div className="p-2.5 bg-white rounded-xl border border-slate-100">
                                <span className="text-[10px] font-bold uppercase text-slate-400 block">Digital Pass Token</span>
                                <span className="font-mono font-bold text-blue-700">{b.tokenCode}</span>
                              </div>
                              <div className="p-2.5 bg-white rounded-xl border border-slate-100">
                                <span className="text-[10px] font-bold uppercase text-slate-400 block">Registered Student Email</span>
                                <span className="font-medium text-slate-800">{b.userEmail}</span>
                              </div>
                            </div>

                            <div className="p-2.5 bg-white rounded-xl border border-slate-100">
                              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Full Reason & Purpose</span>
                              <p className="text-slate-800 font-medium">{b.purpose}</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              <div className="p-2.5 bg-white rounded-xl border border-slate-100">
                                <span className="text-[10px] font-bold uppercase text-slate-400 block">Physical Check-In</span>
                                <span className="font-semibold text-slate-800">{b.checkInTime ? `${b.date} at ${b.checkInTime}` : 'Not checked in'}</span>
                              </div>
                              <div className="p-2.5 bg-white rounded-xl border border-slate-100">
                                <span className="text-[10px] font-bold uppercase text-slate-400 block">Physical Check-Out</span>
                                <span className="font-semibold text-slate-800">{b.checkOutTime || 'Slot end checkout'}</span>
                              </div>
                              <div className="p-2.5 bg-white rounded-xl border border-slate-100">
                                <span className="text-[10px] font-bold uppercase text-slate-400 block">Supervisor Endorsement</span>
                                <span className="font-semibold text-slate-800">{b.supervisorName || 'Not required'}</span>
                              </div>
                            </div>

                            {b.adminNote && (
                              <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-100 text-amber-900">
                                <span className="text-[10px] font-bold uppercase block">Officer Review Note</span>
                                <p className="text-xs">{b.adminNote}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: REPORTS (For User to Report Issue About the Space, Expand Button to Know More) */}
          {officerTab === 'reports' && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
                <div>
                  <h3 className="text-xs font-bold text-slate-900">
                    Defect & Incident Reports ({roomReports.length})
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Reported maintenance issues, hardware glitches, or facility defects for {room.name}.
                  </p>
                </div>

                {/* Report Space Issue Action Button */}
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors shadow-sm flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Report Issue for this Space</span>
                </button>
              </div>

              {roomReports.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-70" />
                  <p className="text-xs font-semibold text-slate-700">No Defects Reported</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">This laboratory space is fully functional with zero open incident reports.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {roomReports.map((rep) => {
                    const isExpanded = expandedReportId === rep.id;
                    return (
                      <div key={rep.id} className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2 hover:border-slate-300 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-slate-900 text-xs sm:text-sm">{rep.title}</span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                                {rep.category}
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                rep.severity === 'Critical'
                                  ? 'bg-rose-100 text-rose-800'
                                  : rep.severity === 'Moderate'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {rep.severity} Severity
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                                rep.status === 'Resolved'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : rep.status === 'In Progress'
                                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                                  : 'bg-rose-50 text-rose-800 border-rose-200'
                              }`}>
                                {rep.status}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-2">
                              <span>Reported by: <strong>{rep.reportedBy}</strong></span>
                              <span>•</span>
                              <span>{rep.date}</span>
                            </div>
                          </div>

                          {/* Expand Button to Know More */}
                          <button
                            type="button"
                            onClick={() => setExpandedReportId(isExpanded ? null : rep.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors self-start sm:self-auto"
                          >
                            <span>{isExpanded ? 'Collapse' : 'Expand Details'}</span>
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-500" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />}
                          </button>
                        </div>

                        {/* Expanded Report Details */}
                        {isExpanded && (
                          <div className="mt-3 pt-3 border-t border-slate-100 space-y-3 text-xs animate-in fade-in">
                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Full Incident Description</span>
                              <p className="text-slate-800 font-medium leading-relaxed">{rep.description}</p>
                            </div>

                            {rep.resolutionNotes && (
                              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-950">
                                <span className="text-[10px] font-bold uppercase text-emerald-700 block mb-0.5">Technician Resolution Log</span>
                                <p className="leading-relaxed">{rep.resolutionNotes}</p>
                              </div>
                            )}

                            {/* Officer Status Update Controls */}
                            <div className="flex items-center gap-2 pt-1">
                              <span className="text-[11px] font-semibold text-slate-500">Update Report Status:</span>
                              {rep.status !== 'In Progress' && rep.status !== 'Resolved' && (
                                <button
                                  type="button"
                                  onClick={() => updateRoomReportStatus(room.id, rep.id, 'In Progress')}
                                  className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-[11px] font-semibold"
                                >
                                  Mark In Progress
                                </button>
                              )}
                              {rep.status !== 'Resolved' && (
                                <button
                                  type="button"
                                  onClick={() => updateRoomReportStatus(room.id, rep.id, 'Resolved', 'Resolved by FCSIT Lab Officer')}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold"
                                >
                                  Mark Resolved
                                </button>
                              )}
                              {rep.status === 'Resolved' && (
                                <button
                                  type="button"
                                  onClick={() => updateRoomReportStatus(room.id, rep.id, 'Open')}
                                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold"
                                >
                                  Re-open Ticket
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
      )}

      {/* MODAL 1: Clean Interactive Booking Drawer when clicking an Available cell (STUDENTS ONLY) */}
      {!isOfficer && activeBookingSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            
            <div className="p-5 border-b border-slate-100 flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">
                  Reserve Laboratory Slot
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">{room.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{room.floor}, {room.block}</p>
              </div>
              <button
                onClick={() => setActiveBookingSlot(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmBooking} className="p-5 space-y-3.5 text-xs">
              
              {/* Selected Slot Metadata Card */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">Selected Date</span>
                  <div className="font-bold text-slate-800 text-xs mt-0.5">
                    {activeBookingSlot.date} ({activeBookingSlot.dayName})
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">Time Slot</span>
                  <div className="font-mono font-bold text-slate-800 text-xs mt-0.5">
                    {activeBookingSlot.timeBlock}
                  </div>
                </div>
              </div>

              {/* Purpose Input */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Purpose / Project Objective *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. FYP deep learning GPU model training, distributed testing..."
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600"
                />
              </div>

              {/* Duration Selector */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Session Duration</span>
                  <span className="text-[10px] text-blue-700 font-mono font-bold">
                    {calculateSlotWithDuration(activeBookingSlot.timeBlock, duration)}
                  </span>
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {['30 Mins', '1 Hour', '2 Hours', '3 Hours'].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDuration(d)}
                      className={`py-1.5 px-2 rounded-xl text-[11px] font-semibold border transition-all ${
                        duration === d
                          ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* FYP Checkbox */}
              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFYP}
                  onChange={(e) => setIsFYP(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <div className="text-xs text-slate-700">
                  <span className="font-semibold text-slate-900 block">FYP / High-Resource Session</span>
                  <span className="text-[11px] text-slate-500">Requires Prof. Madya Dr. Amir Rudin endorsement</span>
                </div>
              </label>

              {/* User info */}
              <div className="text-[11px] text-slate-400">
                Reserving as: <strong className="text-slate-700">{currentUser.name}</strong> ({currentUser.matricOrStaffId})
              </div>

              {/* Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveBookingSlot(null)}
                  className="px-4 py-1.5 text-xs text-slate-500 hover:bg-slate-100 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#002B7F] hover:bg-blue-800 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
                >
                  Confirm Reservation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Submit New Space Incident / Issue Report */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">
                  Report Space Issue
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">{room.name}</h3>
                <p className="text-xs text-slate-500">{room.floor}, {room.block}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsReportModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReportSubmit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Issue Summary / Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Workstation #12 GPU fan failure, Projector HDMI signal lost..."
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={reportCategory}
                    onChange={(e: any) => setReportCategory(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                  >
                    <option value="Workstations & PCs">Workstations & PCs</option>
                    <option value="Air Conditioning">Air Conditioning</option>
                    <option value="Projector & AV">Projector & AV</option>
                    <option value="Electrical & Power">Electrical & Power</option>
                    <option value="Network & Wi-Fi">Network & Wi-Fi</option>
                    <option value="Cleanliness">Cleanliness</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Severity</label>
                  <select
                    value={reportSeverity}
                    onChange={(e: any) => setReportSeverity(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                  >
                    <option value="Minor">Minor (Usable with annoyance)</option>
                    <option value="Moderate">Moderate (Restricted usage)</option>
                    <option value="Critical">Critical (Halts laboratory)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Detailed Description *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe location, symptoms, error messages, and affected hardware..."
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="text-[11px] text-slate-400">
                Reporter: <strong className="text-slate-700">{currentUser.name}</strong> ({currentUser.matricOrStaffId})
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-500 hover:bg-slate-100 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Space Report</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Inspect Booked Slot details + Option to Join Waitlist */}
      {inspectSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Slot Details
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-0.5">{room.name}</h3>
                <p className="text-xs text-slate-400">{inspectSlot.date} • {inspectSlot.timeBlock}</p>
              </div>
              <button
                onClick={() => setInspectSlot(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">{inspectSlot.booking.userName}</span>
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200">
                    {inspectSlot.booking.tokenCode}
                  </span>
                </div>
                <p className="text-slate-600 text-[11px]">{inspectSlot.booking.purpose}</p>
              </div>

              {inspectSlot.booking.userId === currentUser.id ? (
                <button
                  onClick={() => {
                    setInspectSlot(null);
                    setActiveTab('my-passes');
                  }}
                  className="w-full py-2 rounded-xl bg-blue-600 text-white font-semibold text-xs"
                >
                  View My Digital Pass
                </button>
              ) : (
                <button
                  onClick={() => {
                    joinWaitlist('room', room.id, room.name, `${inspectSlot.date} (${inspectSlot.timeBlock})`, inspectSlot.date);
                    setInspectSlot(null);
                  }}
                  className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors"
                >
                  Join Waitlist for this Slot
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


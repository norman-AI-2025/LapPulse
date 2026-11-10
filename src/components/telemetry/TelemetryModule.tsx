import React, { useState, useMemo } from 'react';
import { useLabPulse } from '../../context/LabPulseContext';
import { RadialGauge } from '../common/RadialGauge';
import { 
  BarChart3, 
  Building2, 
  Cpu, 
  AlertTriangle, 
  Clock, 
  Download, 
  FileText, 
  RotateCcw, 
  ChevronRight, 
  Search,
  Check,
  Send,
  ArrowUpRight,
  Filter
} from 'lucide-react';

interface HeatmapCell {
  hour: string;
  loadPct: number;
  activeCount: number;
}

export const TelemetryModule: React.FC = () => {
  const { 
    bookings, 
    loans, 
    rooms, 
    hardware, 
    approveBooking, 
    rejectBooking, 
    approveLoan, 
    rejectLoan, 
    releaseToWaitlist,
    setActiveTab,
    addToast 
  } = useLabPulse();

  // State
  const [timeScope, setTimeScope] = useState<'TODAY' | 'WEEK' | 'SEMESTER' | 'YEAR'>('SEMESTER');
  const [queueTab, setQueueTab] = useState<'OVERDUE' | 'GRACE_EXPIRED' | 'PENDING'>('OVERDUE');
  const [queueSearch, setQueueSearch] = useState('');
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [notifiedItems, setNotifiedItems] = useState<Record<string, boolean>>({});
  const [revokedItems, setRevokedItems] = useState<Record<string, boolean>>({});
  const [hoveredCell, setHoveredCell] = useState<{
    day: string;
    hour: string;
    pct: number;
    activeCount: number;
  } | null>(null);

  // Dynamic calculations based on scope
  const totalLabs = 25;
  const activeSessions = useMemo(() => {
    const live = bookings.filter((b) => b.status === 'Active' || b.status === 'Approved').length;
    if (timeScope === 'TODAY') return Math.max(14, live + 8);
    if (timeScope === 'WEEK') return Math.max(18, live + 14);
    return Math.max(20, live + 16);
  }, [bookings, timeScope]);

  const occupancyPct = Math.round((activeSessions / totalLabs) * 100);

  const activeLoansCount = useMemo(() => {
    const live = loans.filter((l) => l.status === 'Active / Issued' || l.status === 'Overdue').length;
    if (timeScope === 'TODAY') return Math.max(38, live + 30);
    return Math.max(46, live + 40);
  }, [loans, timeScope]);

  const overdueCount = useMemo(() => {
    const live = loans.filter((l) => l.status === 'Overdue').length;
    return Math.max(5, live + 3);
  }, [loans]);

  const pendingCount = useMemo(() => {
    const pendingBookings = bookings.filter((b) => b.status === 'Pending Approval' || b.status === 'Pending Endorsement').length;
    const pendingLoans = loans.filter((l) => l.status === 'Pending Approval').length;
    return Math.max(8, pendingBookings + pendingLoans);
  }, [bookings, loans]);

  const inRepairCount = useMemo(() => {
    const defectsCount = hardware.filter((h) => h.status === 'Under Maintenance').length;
    return Math.max(3, defectsCount + 1);
  }, [hardware]);

  // Heatmap hourly blocks (08:00 - 19:00)
  const HOURS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const heatmapData: Record<string, HeatmapCell[]> = {
    Monday: [
      { hour: '08:00', loadPct: 24, activeCount: 6 },
      { hour: '09:00', loadPct: 62, activeCount: 15 },
      { hour: '10:00', loadPct: 92, activeCount: 23 },
      { hour: '11:00', loadPct: 88, activeCount: 22 },
      { hour: '12:00', loadPct: 32, activeCount: 8 },
      { hour: '13:00', loadPct: 28, activeCount: 7 },
      { hour: '14:00', loadPct: 84, activeCount: 21 },
      { hour: '15:00', loadPct: 96, activeCount: 24 },
      { hour: '16:00', loadPct: 76, activeCount: 19 },
      { hour: '17:00', loadPct: 48, activeCount: 12 },
      { hour: '18:00', loadPct: 20, activeCount: 5 }
    ],
    Tuesday: [
      { hour: '08:00', loadPct: 36, activeCount: 9 },
      { hour: '09:00', loadPct: 72, activeCount: 18 },
      { hour: '10:00', loadPct: 88, activeCount: 22 },
      { hour: '11:00', loadPct: 96, activeCount: 24 },
      { hour: '12:00', loadPct: 40, activeCount: 10 },
      { hour: '13:00', loadPct: 32, activeCount: 8 },
      { hour: '14:00', loadPct: 88, activeCount: 22 },
      { hour: '15:00', loadPct: 92, activeCount: 23 },
      { hour: '16:00', loadPct: 84, activeCount: 21 },
      { hour: '17:00', loadPct: 60, activeCount: 15 },
      { hour: '18:00', loadPct: 28, activeCount: 7 }
    ],
    Wednesday: [
      { hour: '08:00', loadPct: 28, activeCount: 7 },
      { hour: '09:00', loadPct: 64, activeCount: 16 },
      { hour: '10:00', loadPct: 80, activeCount: 20 },
      { hour: '11:00', loadPct: 84, activeCount: 21 },
      { hour: '12:00', loadPct: 36, activeCount: 9 },
      { hour: '13:00', loadPct: 24, activeCount: 6 },
      { hour: '14:00', loadPct: 76, activeCount: 19 },
      { hour: '15:00', loadPct: 88, activeCount: 22 },
      { hour: '16:00', loadPct: 80, activeCount: 20 },
      { hour: '17:00', loadPct: 44, activeCount: 11 },
      { hour: '18:00', loadPct: 16, activeCount: 4 }
    ],
    Thursday: [
      { hour: '08:00', loadPct: 44, activeCount: 11 },
      { hour: '09:00', loadPct: 80, activeCount: 20 },
      { hour: '10:00', loadPct: 96, activeCount: 24 },
      { hour: '11:00', loadPct: 92, activeCount: 23 },
      { hour: '12:00', loadPct: 48, activeCount: 12 },
      { hour: '13:00', loadPct: 36, activeCount: 9 },
      { hour: '14:00', loadPct: 92, activeCount: 23 },
      { hour: '15:00', loadPct: 88, activeCount: 22 },
      { hour: '16:00', loadPct: 72, activeCount: 18 },
      { hour: '17:00', loadPct: 52, activeCount: 13 },
      { hour: '18:00', loadPct: 24, activeCount: 6 }
    ],
    Friday: [
      { hour: '08:00', loadPct: 32, activeCount: 8 },
      { hour: '09:00', loadPct: 68, activeCount: 17 },
      { hour: '10:00', loadPct: 84, activeCount: 21 },
      { hour: '11:00', loadPct: 76, activeCount: 19 },
      { hour: '12:00', loadPct: 20, activeCount: 5 },
      { hour: '13:00', loadPct: 16, activeCount: 4 },
      { hour: '14:00', loadPct: 60, activeCount: 15 },
      { hour: '15:00', loadPct: 72, activeCount: 18 },
      { hour: '16:00', loadPct: 56, activeCount: 14 },
      { hour: '17:00', loadPct: 32, activeCount: 8 },
      { hour: '18:00', loadPct: 12, activeCount: 3 }
    ]
  };

  // Queue Data
  const overdueHardwareItems = [
    {
      id: 'HW-2091',
      name: 'NVIDIA Jetson Orin Nano 8GB',
      borrower: 'Tan Wei Ming',
      matric: 'WIF210044',
      due: '07 Nov, 2026',
      violation: '2 Days Overdue',
      criticality: 'Critical'
    },
    {
      id: 'HW-1044',
      name: 'Raspberry Pi 4 Model B (4GB)',
      borrower: 'Nurul Huda binti Rosli',
      matric: 'WIG220019',
      due: '08 Nov, 2026',
      violation: '1 Day Overdue',
      criticality: 'High'
    },
    {
      id: 'HW-4481',
      name: 'Rigol DS1054Z Digital Oscilloscope',
      borrower: 'Kevin Raj a/l Shanmugam',
      matric: 'WIC200087',
      due: '09 Nov, 2026',
      violation: '4 Hours Overdue',
      criticality: 'Moderate'
    },
    {
      id: 'HW-3829',
      name: 'NVIDIA Jetson Orin Nano Developer Kit',
      borrower: 'Norman Lee',
      matric: '25005870',
      due: '09 Nov, 2026',
      violation: '2 Hours Overdue',
      criticality: 'High'
    },
    {
      id: 'HW-5502',
      name: 'Arduino Mega 2560 Pro Kit',
      borrower: 'Farah Nadia binti Azman',
      matric: 'WIE210033',
      due: '09 Nov, 2026',
      violation: '1 Hour Overdue',
      criticality: 'Normal'
    }
  ];

  const graceExpiredSlots = [
    {
      id: 'BK-9182',
      name: 'Micro Lab [MM1] (Workstation 08)',
      borrower: 'Ahmad Daniel bin Khalid',
      matric: 'WIC210012',
      scheduled: '10 Nov, 09:00 - 11:00',
      violation: 'Grace Expired 18m',
      criticality: 'Forfeited'
    },
    {
      id: 'BK-4421',
      name: 'CCNA Lab (Bench 04)',
      borrower: 'Siti Zulaikha binti Hassan',
      matric: 'WIF220055',
      scheduled: '10 Nov, 10:00 - 12:00',
      violation: 'Grace Expired 24m',
      criticality: 'Forfeited'
    },
    {
      id: 'BK-6190',
      name: 'Robotic Teaching Lab (Arena 02)',
      borrower: 'Chong Wei Lun',
      matric: 'WIE200091',
      scheduled: '10 Nov, 10:30 - 12:30',
      violation: 'Grace Expired 15m',
      criticality: 'Forfeited'
    }
  ];

  const pendingQueueItems = [
    {
      id: 'BK-7740',
      name: 'Robotic Teaching Lab',
      borrower: 'Lim Chun Kit',
      matric: 'WIG210088',
      scheduled: '12 Nov, 14:00 - 16:00',
      violation: 'Pending Approval',
      criticality: 'Review'
    },
    {
      id: 'LN-7714',
      name: 'NVIDIA Jetson Orin Nano 8GB',
      borrower: 'Norman Lee',
      matric: '25005870',
      scheduled: '10 Nov - 14 Nov, 2026',
      violation: 'Pending Approval',
      criticality: 'Review'
    },
    {
      id: 'BK-8820',
      name: 'Postgraduate Lab [ML]',
      borrower: 'Dr. Amir Rudin / FYP 4',
      matric: 'STAFF-FCSIT',
      scheduled: '13 Nov, 10:00 - 12:00',
      violation: 'Pending Approval',
      criticality: 'Review'
    }
  ];

  // Actions
  const handleSendNotice = (id: string, name: string) => {
    setNotifiedItems((prev) => ({ ...prev, [id]: true }));
    addToast('Notice Sent', `Summons transmitted to ${name} (${id}).`, 'info');
  };

  const handleRevokeSlot = (id: string, venue: string) => {
    setRevokedItems((prev) => ({ ...prev, [id]: true }));
    releaseToWaitlist(id);
    addToast('Slot Revoked', `${venue} reallocated to waitlist candidate.`, 'warning');
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = ['Record Type', 'Identifier', 'Recipient', 'Matric/Staff ID', 'Facility/Asset', 'Scheduled/Due', 'Violation/Status'];
    const dataRows = [
      ...bookings.map((b) => ['Space Booking', b.tokenCode, b.userName, b.userId, b.roomName, `${b.date} ${b.slot}`, b.status]),
      ...loans.map((l) => ['Hardware Loan', l.tokenCode, l.userName, l.userId, l.hardwareName, `${l.requestDate || ''} - ${l.dueDate}`, l.status]),
      ...overdueHardwareItems.map((o) => ['Overdue Audit', o.id, o.borrower, o.matric, o.name, o.due, o.violation])
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...dataRows].map((row) => row.map((c) => `"${c}"`).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', encodedUri);
    downloadAnchor.setAttribute('download', `FCSIT_Telemetry_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);

    addToast('Export Complete', 'Telemetry CSV downloaded.', 'success');
  };

  const handleDownloadPDF = () => {
    window.print();
    addToast('Print Ready', 'Operational report generated.', 'info');
  };


  const scrollToQueue = (tab: 'OVERDUE' | 'GRACE_EXPIRED' | 'PENDING') => {
    setQueueTab(tab);
    const el = document.getElementById('attention-queue');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // Filtered queue items
  const filteredOverdue = overdueHardwareItems.filter(
    (i) => i.name.toLowerCase().includes(queueSearch.toLowerCase()) || i.borrower.toLowerCase().includes(queueSearch.toLowerCase()) || i.matric.toLowerCase().includes(queueSearch.toLowerCase())
  );
  const filteredGrace = graceExpiredSlots.filter(
    (i) => i.name.toLowerCase().includes(queueSearch.toLowerCase()) || i.borrower.toLowerCase().includes(queueSearch.toLowerCase()) || i.matric.toLowerCase().includes(queueSearch.toLowerCase())
  );
  const filteredPending = pendingQueueItems.filter(
    (i) => i.name.toLowerCase().includes(queueSearch.toLowerCase()) || i.borrower.toLowerCase().includes(queueSearch.toLowerCase()) || i.matric.toLowerCase().includes(queueSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16 animate-in fade-in duration-200">
      
      {/* HEADER & SCOPE SELECTOR - Tasteful subtle colors, zero emojis, zero small descriptions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0 shadow-xs">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Operational Telemetry
            </h1>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80">
              Live Sync
            </span>
          </div>
        </div>

        {/* Interactive Scope Filters */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80 self-start sm:self-auto shadow-xs">
          {(['TODAY', 'WEEK', 'SEMESTER', 'YEAR'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setTimeScope(s)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                timeScope === s
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              {s === 'TODAY' && 'Today'}
              {s === 'WEEK' && 'Week'}
              {s === 'SEMESTER' && 'Semester 1'}
              {s === 'YEAR' && 'Annual'}
            </button>
          ))}
        </div>
      </div>

      {/* SECTION A: 4-COLUMN SUMMARY CARDS (Tasteful Restrained Accents) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Facility Occupancy (Blue Accent) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Facility Occupancy</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
              {occupancyPct}%
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">In Session</span>
            <span className="font-mono font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md">
              {activeSessions} / {totalLabs} Labs
            </span>
          </div>
        </div>

        {/* Metric 2: Hardware in Circulation (Indigo Accent) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Hardware Circulation</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
              {activeLoansCount} <span className="text-sm font-normal text-slate-400">Units</span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Locker Pool</span>
            <span className="font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">
              82% Active
            </span>
          </div>
        </div>

        {/* Metric 3: Overdue Returns (Rose Warning Accent) */}
        <div 
          onClick={() => scrollToQueue('OVERDUE')}
          className="bg-white rounded-2xl p-5 border border-rose-200/80 shadow-xs hover:border-rose-300 transition-all flex flex-col justify-between cursor-pointer group bg-gradient-to-br from-white to-rose-50/20"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-800 uppercase tracking-wider">Overdue Returns</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3 flex items-baseline justify-between">
            <div className="text-3xl font-extrabold text-rose-900 font-mono tracking-tight">
              {overdueCount} <span className="text-sm font-normal text-rose-600">Units</span>
            </div>
            <ArrowUpRight className="w-4 h-4 text-rose-400 group-hover:text-rose-700 group-hover:translate-x-0.5 -translate-y-0.5 transition-all" />
          </div>
          <div className="pt-2 border-t border-rose-100/80 flex items-center justify-between text-xs">
            <span className="text-rose-700 font-medium">Summons Required</span>
            <span className="font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-md">
              Action
            </span>
          </div>
        </div>

        {/* Metric 4: Pending Sign-Off & Repair (Amber Accent) */}
        <div 
          onClick={() => scrollToQueue('PENDING')}
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending & Repair</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3 flex items-baseline justify-between">
            <div className="text-2xl font-extrabold text-slate-900 font-mono tracking-tight">
              {pendingCount} <span className="text-xs font-normal text-slate-400">Review</span> • {inRepairCount} <span className="text-xs font-normal text-slate-400">Repair</span>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-800 group-hover:translate-x-0.5 -translate-y-0.5 transition-all" />
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Queue State</span>
            <span className="font-mono font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
              Sign-Off Req
            </span>
          </div>
        </div>

      </div>

      {/* SECTION B: MATRIX & DEMAND (2-COLUMN BENTO) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* 1. Peak Utilization Heatmap Matrix (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Occupancy Matrix (08:00 – 19:00)
              </h3>

              {/* Shading Legend (Clean Blue-Tinted Density Scale) */}
              <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-slate-100 border border-slate-200" />
                  <span>0–30%</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-blue-100 border border-blue-200" />
                  <span>31–70%</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-blue-900" />
                  <span>71–100%</span>
                </span>
              </div>
            </div>

            {/* Matrix Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-center select-none min-w-[480px]">
                <thead>
                  <tr>
                    <th className="p-2 text-xs font-semibold text-slate-400 uppercase text-left w-20">
                      Day
                    </th>
                    {HOURS.map((h) => (
                      <th key={h} className="p-1 text-[10px] font-bold text-slate-400 font-mono">
                        {h.slice(0, 2)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {DAYS.map((day) => {
                    const isSelected = selectedDay === day;

                    return (
                      <tr 
                        key={day} 
                        onClick={() => setSelectedDay(isSelected ? null : day)}
                        className={`border-t border-slate-100 transition-colors cursor-pointer ${
                          isSelected ? 'bg-blue-50/50' : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="py-2 pr-2 text-left font-bold text-xs text-slate-800">
                          {day.slice(0, 3)}
                        </td>
                        {heatmapData[day].map((cell) => {
                          const isLow = cell.loadPct <= 30;
                          const isModerate = cell.loadPct > 30 && cell.loadPct <= 70;

                          return (
                            <td key={cell.hour} className="p-1 sm:p-1.5">
                              <div
                                onMouseEnter={() => setHoveredCell({ day, hour: cell.hour, pct: cell.loadPct, activeCount: cell.activeCount })}
                                onMouseLeave={() => setHoveredCell(null)}
                                className={`h-8 sm:h-9 rounded-md transition-all cursor-pointer flex items-center justify-center font-mono text-[10px] sm:text-[11px] font-bold ${
                                  isLow
                                    ? 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                    : isModerate
                                    ? 'bg-blue-100 text-blue-950 border border-blue-200/60 hover:bg-blue-200'
                                    : 'bg-blue-900 text-white hover:bg-blue-800 shadow-xs'
                                }`}
                              >
                                {cell.loadPct}%
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Daily Average Strip - Seamlessly occupies container space */}
            <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-5 gap-2">
              {[
                { day: 'Mon', avg: '76%', peak: '15:00' },
                { day: 'Tue', avg: '88%', peak: '11:00' },
                { day: 'Wed', avg: '68%', peak: '15:00' },
                { day: 'Thu', avg: '82%', peak: '10:00' },
                { day: 'Fri', avg: '58%', peak: '10:00' }
              ].map((d) => (
                <div
                  key={d.day}
                  onClick={() => setSelectedDay(selectedDay === d.day ? null : d.day)}
                  className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                    selectedDay === d.day
                      ? 'bg-blue-50 border-blue-300 shadow-xs'
                      : 'bg-slate-50/70 border-slate-100 hover:bg-slate-100 hover:border-slate-200'
                  }`}
                >
                  <div className="text-[10px] font-bold text-slate-500 uppercase">{d.day}</div>
                  <div className="text-xs font-bold font-mono text-slate-900 mt-0.5">{d.avg}</div>
                  <div className="text-[9px] text-slate-400 font-mono mt-0.5 truncate">Peak {d.peak}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Inspection Bar */}
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            {hoveredCell ? (
              <span className="font-semibold text-slate-900">
                {hoveredCell.day} {hoveredCell.hour} — <strong className="text-blue-700">{hoveredCell.pct}% Load</strong> ({hoveredCell.activeCount}/25 Labs)
              </span>
            ) : selectedDay ? (
              <span className="font-semibold text-slate-800">
                Selected Day: <strong className="text-blue-900">{selectedDay}</strong> Concurrency Matrix
              </span>
            ) : (
              <span className="text-slate-400 font-medium">
                Hover cells or select day to inspect concurrency
              </span>
            )}
            <span className="font-mono text-[11px] font-bold text-blue-900 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded">
              Peak: Tue 11:00 (96%)
            </span>
          </div>
        </div>

        {/* 2. Laboratory Demand Ranking (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Laboratory Demand Ranking
              </h3>
              <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                Top 4
              </span>
            </div>

            {/* Laboratory Demand Radial Gauges (2x2 Grid matching uploaded ring gauge) */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { 
                  name: 'Micro Lab [MM1]', 
                  pct: 88, 
                  status: '88% PEAK', 
                  sub: '47 PCs • Block A',
                  gaugeColor: '#1E88E5',
                  badgeClass: 'bg-blue-50 text-blue-700 border-blue-200' 
                },
                { 
                  name: 'CCNA Lab', 
                  pct: 74, 
                  status: '74% LOAD', 
                  sub: '41 PCs • Block B',
                  gaugeColor: '#002B7F',
                  badgeClass: 'bg-slate-100 text-slate-800 border-slate-200' 
                },
                { 
                  name: 'Robotic Teaching Lab', 
                  pct: 65, 
                  status: '65% ACTIVE', 
                  sub: '25 Pax • Block B',
                  gaugeColor: '#334155',
                  badgeClass: 'bg-slate-100 text-slate-700 border-slate-200' 
                },
                { 
                  name: 'Lecture Room 2 [BK2]', 
                  pct: 48, 
                  status: '48% MODERATE', 
                  sub: '36 Pax • Block B',
                  gaugeColor: '#64748B',
                  badgeClass: 'bg-slate-100 text-slate-600 border-slate-200' 
                }
              ].map((lab) => (
                <div 
                  key={lab.name} 
                  className="p-2.5 bg-slate-50/70 hover:bg-white border border-slate-100 hover:border-slate-200 hover:shadow-xs rounded-xl flex flex-col items-center text-center transition-all group"
                >
                  <RadialGauge
                    value={lab.pct}
                    size={68}
                    strokeWidth={8}
                    color={lab.gaugeColor}
                  />
                  <div className="mt-1.5 text-xs font-bold text-slate-900 leading-snug line-clamp-1 group-hover:text-blue-900 transition-colors">
                    {lab.name}
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                    {lab.sub}
                  </div>
                  <span className={`mt-1.5 text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${lab.badgeClass}`}>
                    {lab.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Grace-Period Drop Rate Card (Clickable to jump to grace table) */}
          <div 
            onClick={() => scrollToQueue('GRACE_EXPIRED')}
            className="bg-amber-50/60 p-4 rounded-xl border border-amber-200/80 flex items-center justify-between cursor-pointer hover:bg-amber-50 transition-colors group"
          >
            <div>
              <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                Grace-Period Drop Rate
              </div>
              <div className="text-2xl font-black text-amber-950 font-mono mt-0.5">
                14% No-Show Forfeitures
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-amber-900 bg-white px-3 py-1.5 rounded-lg border border-amber-200 shadow-xs group-hover:scale-105 transition-transform">
              <span>Inspect</span>
              <ChevronRight className="w-3.5 h-3.5 text-amber-600" />
            </div>
          </div>

          {/* Purpose Split Badge Row */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Coursework: 55%</span>
            <span>•</span>
            <span>FYP: 35%</span>
            <span>•</span>
            <span>Events: 10%</span>
          </div>
        </div>

      </div>

      {/* SECTION C: HARDWARE TURNOVER & DEFECT AUDIT (2-COLUMN BENTO) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* 1. Hardware Inventory Turnover (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Hardware Inventory Turnover
              </h3>
              <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                3.4 Days Avg
              </span>
            </div>

            {/* Turnover Radial Gauge Items */}
            <div className="space-y-2.5">
              {[
                { 
                  name: 'NVIDIA Jetson Orin Nano (8GB)', 
                  active: 12, 
                  total: 12, 
                  pct: 100, 
                  tag: '100% CRITICAL', 
                  tagColor: 'bg-rose-50 text-rose-700 border-rose-200', 
                  gaugeColor: '#E11D48' 
                },
                { 
                  name: 'Raspberry Pi 4 Model B Kits', 
                  active: 18, 
                  total: 25, 
                  pct: 72, 
                  tag: '72% ACTIVE', 
                  tagColor: 'bg-blue-50 text-blue-700 border-blue-200', 
                  gaugeColor: '#1E88E5' 
                },
                { 
                  name: 'Rigol Digital Oscilloscopes', 
                  active: 8, 
                  total: 15, 
                  pct: 53, 
                  tag: '53% IN USE', 
                  tagColor: 'bg-slate-100 text-slate-700 border-slate-200', 
                  gaugeColor: '#334155' 
                },
                { 
                  name: 'Arduino Mega 2560 Pro Kits', 
                  active: 8, 
                  total: 20, 
                  pct: 40, 
                  tag: '40% IN USE', 
                  tagColor: 'bg-slate-100 text-slate-700 border-slate-200', 
                  gaugeColor: '#64748B' 
                }
              ].map((item) => (
                <div 
                  key={item.name} 
                  className="flex items-center gap-3.5 p-2.5 bg-slate-50/70 hover:bg-white rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-xs transition-all"
                >
                  <RadialGauge
                    value={item.pct}
                    size={52}
                    strokeWidth={6.5}
                    color={item.gaugeColor}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">
                      {item.name}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                      {item.active} / {item.total} Units in Circulation
                    </div>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border flex-shrink-0 ${item.tagColor}`}>
                    {item.tag}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Circulation Pool</span>
            <span className="font-semibold text-slate-900 font-mono">46 Units Active</span>
          </div>
        </div>

        {/* 2. Condition Breakdown & QA Desk (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Defect Audit Breakdown
              </h3>
              <span className="font-mono text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                3 Flagged Assets
              </span>
            </div>

            {/* Defect Categories with Radial Gauges */}
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { 
                  label: 'Missing Cables & Adapters', 
                  pct: 52, 
                  color: '#E11D48',
                  badge: '52% LOSS',
                  badgeClass: 'bg-rose-50 text-rose-700 border-rose-200'
                },
                { 
                  label: 'Chassis & Port Damage', 
                  pct: 31, 
                  color: '#D97706',
                  badge: '31% WEAR',
                  badgeClass: 'bg-amber-50 text-amber-700 border-amber-200'
                },
                { 
                  label: 'Power & Boot Failures', 
                  pct: 17, 
                  color: '#475569',
                  badge: '17% FAULT',
                  badgeClass: 'bg-slate-100 text-slate-700 border-slate-200'
                }
              ].map((def) => (
                <div 
                  key={def.label} 
                  className="p-3 bg-slate-50/70 hover:bg-white rounded-xl border border-slate-100 hover:border-slate-200 flex flex-col items-center text-center transition-all"
                >
                  <RadialGauge
                    value={def.pct}
                    size={62}
                    strokeWidth={7.5}
                    color={def.color}
                  />
                  <span className="mt-2 text-[11px] font-bold text-slate-800 leading-tight line-clamp-2 h-7 flex items-center justify-center">
                    {def.label}
                  </span>
                  <span className={`mt-2 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${def.badgeClass}`}>
                    {def.badge}
                  </span>
                </div>
              ))}
            </div>

            {/* Active Defect Asset Records (Eliminates blank space & provides actionable triage) */}
            <div className="mt-3.5 space-y-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Active QA Quarantine Records</span>
                <span className="font-mono text-rose-600 font-semibold">3 Flagged</span>
              </div>
              {[
                {
                  id: 'hw-jetson-orin-01',
                  tag: 'FCSIT-HW-JET-01',
                  name: 'NVIDIA Jetson Orin Nano',
                  issue: 'Missing 19V DC power barrel adapter & HDMI cable',
                  status: 'INVESTIGATING',
                  statusClass: 'bg-rose-50 text-rose-700 border-rose-200'
                },
                {
                  id: 'hw-esp32-node-06',
                  tag: 'FCSIT-HW-ESP-12',
                  name: 'ESP32 IoT Sensor Node',
                  issue: 'OLED display flickering; pin header solder loose',
                  status: 'PENDING PARTS',
                  statusClass: 'bg-amber-50 text-amber-700 border-amber-200'
                },
                {
                  id: 'hw-rigol-osc-03',
                  tag: 'FCSIT-HW-OSC-02',
                  name: 'Rigol Digital Oscilloscope',
                  issue: 'Ch 2 BNC ground alligator lead broken clip',
                  status: 'IN REPAIR',
                  statusClass: 'bg-slate-100 text-slate-700 border-slate-200'
                }
              ].map((flag) => (
                <div
                  key={flag.id}
                  onClick={() => setActiveTab('hardware')}
                  className="p-2 bg-slate-50/80 hover:bg-slate-100/90 rounded-xl border border-slate-100 flex items-center justify-between gap-2.5 transition-all cursor-pointer group"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] font-bold text-slate-900 group-hover:text-blue-900">
                        {flag.tag}
                      </span>
                      <span className="text-slate-400 text-[10px]">•</span>
                      <span className="text-xs font-semibold text-slate-800 truncate">
                        {flag.name}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 truncate mt-0.5">
                      {flag.issue}
                    </div>
                  </div>
                  <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border flex-shrink-0 ${flag.statusClass}`}>
                    {flag.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Trigger */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">
              Maintenance Desk
            </span>
            <button
              onClick={() => setActiveTab('hardware')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              <span>Inspect Passports</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>

      </div>

      {/* SECTION D: IMMEDIATE ATTENTION QUEUE & EXPORT CENTER */}
      <div id="attention-queue" className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        
        {/* Header & Interactive Filter Bar */}
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 uppercase tracking-wide">
              Immediate Attention Queue
            </h3>
          </div>

          {/* Filter Pills & Table Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
              <button
                onClick={() => setQueueTab('OVERDUE')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  queueTab === 'OVERDUE'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Overdue Hardware ({overdueHardwareItems.length})
              </button>

              <button
                onClick={() => setQueueTab('GRACE_EXPIRED')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  queueTab === 'GRACE_EXPIRED'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Grace Expired ({graceExpiredSlots.length})
              </button>

              <button
                onClick={() => setQueueTab('PENDING')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  queueTab === 'PENDING'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Pending Approvals ({pendingQueueItems.length})
              </button>
            </div>

            {/* In-Table Search */}
            <div className="relative min-w-[180px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={queueSearch}
                onChange={(e) => setQueueSearch(e.target.value)}
                placeholder="Search..."
                className="w-full bg-slate-50 text-slate-800 text-xs rounded-lg pl-8 pr-3 py-1.5 border border-slate-200 focus:outline-none focus:border-slate-500"
              />
            </div>

          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[650px]">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-5">Item / Facility</th>
                <th className="py-3 px-5">Student / Borrower</th>
                <th className="py-3 px-5">Scheduled / Due</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              
              {/* Overdue Hardware Rows */}
              {queueTab === 'OVERDUE' &&
                filteredOverdue.map((row) => {
                  const isNotified = notifiedItems[row.id];

                  return (
                    <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-5 font-bold text-slate-900">
                        <div className="font-mono text-slate-400 text-[11px]">{row.id}</div>
                        <div>{row.name}</div>
                      </td>
                      <td className="py-3 px-5">
                        <div className="font-semibold text-slate-800">{row.borrower}</div>
                        <div className="font-mono text-slate-400 text-[11px]">{row.matric}</div>
                      </td>
                      <td className="py-3 px-5 font-mono text-slate-600 font-medium">
                        {row.due}
                      </td>
                      <td className="py-3 px-5">
                        <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                          {row.violation}
                        </span>
                      </td>
                      <td className="py-3 px-5 text-right">
                        <button
                          onClick={() => handleSendNotice(row.id, row.borrower)}
                          disabled={isNotified}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            isNotified
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                              : 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs'
                          }`}
                        >
                          {isNotified ? 'Notice Sent' : 'Send Notice'}
                        </button>
                      </td>
                    </tr>
                  );
                })}

              {/* Grace-Period Expired Rows */}
              {queueTab === 'GRACE_EXPIRED' &&
                filteredGrace.map((row) => {
                  const isRevoked = revokedItems[row.id];

                  return (
                    <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-5 font-bold text-slate-900">
                        <div className="font-mono text-slate-400 text-[11px]">{row.id}</div>
                        <div>{row.name}</div>
                      </td>
                      <td className="py-3 px-5">
                        <div className="font-semibold text-slate-800">{row.borrower}</div>
                        <div className="font-mono text-slate-400 text-[11px]">{row.matric}</div>
                      </td>
                      <td className="py-3 px-5 font-mono text-slate-600 font-medium">
                        {row.scheduled}
                      </td>
                      <td className="py-3 px-5">
                        <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                          {row.violation}
                        </span>
                      </td>
                      <td className="py-3 px-5 text-right">
                        <button
                          onClick={() => handleRevokeSlot(row.id, row.name)}
                          disabled={isRevoked}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            isRevoked
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                              : 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs'
                          }`}
                        >
                          {isRevoked ? 'Slot Revoked' : 'Revoke Slot'}
                        </button>
                      </td>
                    </tr>
                  );
                })}

              {/* Pending Approvals Rows */}
              {queueTab === 'PENDING' &&
                filteredPending.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-5 font-bold text-slate-900">
                      <div className="font-mono text-slate-400 text-[11px]">{row.id}</div>
                      <div>{row.name}</div>
                    </td>
                    <td className="py-3 px-5">
                      <div className="font-semibold text-slate-800">{row.borrower}</div>
                      <div className="font-mono text-slate-400 text-[11px]">{row.matric}</div>
                    </td>
                    <td className="py-3 px-5 font-mono text-slate-600 font-medium">
                      {row.scheduled}
                    </td>
                    <td className="py-3 px-5">
                      <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                        {row.violation}
                      </span>
                    </td>
                    <td className="py-3 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            if (row.id.startsWith('BK')) approveBooking(row.id);
                            else approveLoan(row.id);
                            addToast('Approved', `Request ${row.id} approved.`, 'success');
                          }}
                          className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            if (row.id.startsWith('BK')) rejectBooking(row.id);
                            else rejectLoan(row.id);
                            addToast('Declined', `Request ${row.id} declined.`, 'warning');
                          }}
                          className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                        >
                          Decline
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Clean Export Toolbar */}
        <div className="p-4 sm:p-5 bg-slate-50/70 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-semibold">Scope:</span>
            <span className="font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
              Semester 1, 2026/2027
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-lg font-semibold text-xs shadow-xs transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-lg font-semibold text-xs shadow-xs transition-all cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-slate-600" />
              <span>Print Report</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};

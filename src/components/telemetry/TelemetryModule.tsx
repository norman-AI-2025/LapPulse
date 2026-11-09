import React, { useState } from 'react';
import { useLabPulse } from '../../context/LabPulseContext';
import { 
  BarChart3, 
  TrendingUp, 
  Activity, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Cpu, 
  Building2, 
  ShieldAlert, 
  Filter,
  Check,
  X,
  ArrowUpRight
} from 'lucide-react';

export const TelemetryModule: React.FC = () => {
  const { 
    bookings, 
    loans, 
    rooms, 
    hardware, 
    approveBooking, 
    rejectBooking, 
    approveLoan, 
    rejectLoan 
  } = useLabPulse();

  const [tableFilter, setTableFilter] = useState<'all' | 'pending' | 'active' | 'overdue' | 'maintenance'>('all');

  // Key KPI metrics calculations
  const totalBookingsCount = bookings.length;
  const activeBookingsCount = bookings.filter((b) => b.status === 'Active').length;
  const activeLoansCount = loans.filter((l) => l.status === 'Active / Issued').length;
  const overdueLoansCount = loans.filter((l) => l.status === 'Overdue').length;
  const underMaintenanceHwCount = hardware.filter((h) => h.status === 'Under Maintenance').length;

  // Utilization calculation
  const totalPossibleSlotsToday = rooms.length * 5; // 5 slots per lab
  const occupiedSlotsToday = bookings.filter((b) => b.status === 'Approved' || b.status === 'Active').length;
  const labUtilizationRate = Math.min(100, Math.round((occupiedSlotsToday / totalPossibleSlotsToday) * 100));

  // Traffic by time slot
  const slotTraffic = [
    { slot: '08:00 - 10:00', count: bookings.filter((b) => b.slot === '08:00 - 10:00').length, pct: 60 },
    { slot: '10:00 - 12:00', count: bookings.filter((b) => b.slot === '10:00 - 12:00').length, pct: 95 },
    { slot: '12:00 - 14:00', count: bookings.filter((b) => b.slot === '12:00 - 14:00').length, pct: 40 },
    { slot: '14:00 - 16:00', count: bookings.filter((b) => b.slot === '14:00 - 16:00').length, pct: 85 },
    { slot: '16:00 - 18:00', count: bookings.filter((b) => b.slot === '16:00 - 18:00').length, pct: 70 },
  ];

  // Combined actionable records
  const allActionableItems = [
    ...bookings.map((b) => ({
      id: b.id,
      type: 'Space Booking' as const,
      item: b.roomName,
      code: b.tokenCode,
      user: b.userName,
      matric: b.userMatric,
      time: `${b.date} • ${b.slot}`,
      status: b.status,
      purpose: b.purpose,
      isOverdue: false,
      isPending: b.status === 'Pending Approval',
      isActive: b.status === 'Active',
      isMaintenance: false
    })),
    ...loans.map((l) => ({
      id: l.id,
      type: 'Hardware Loan' as const,
      item: l.hardwareName,
      code: l.tokenCode,
      user: l.userName,
      matric: l.userMatric,
      time: `Due: ${l.dueDate}`,
      status: l.status,
      purpose: l.purpose,
      isOverdue: l.status === 'Overdue',
      isPending: l.status === 'Pending Approval',
      isActive: l.status === 'Active / Issued',
      isMaintenance: false
    })),
    ...hardware
      .filter((h) => h.status === 'Under Maintenance')
      .map((h) => ({
        id: h.id,
        type: 'Asset Alert' as const,
        item: h.name,
        code: h.tag,
        user: 'FCSIT Lab Maintenance',
        matric: h.serialNumber,
        time: `${h.healthPercentage}% Health`,
        status: h.status,
        purpose: h.defects[0]?.issue || 'Calibration needed',
        isOverdue: false,
        isPending: false,
        isActive: false,
        isMaintenance: true
      }))
  ];

  const filteredItems = allActionableItems.filter((item) => {
    if (tableFilter === 'pending') return item.isPending;
    if (tableFilter === 'active') return item.isActive;
    if (tableFilter === 'overdue') return item.isOverdue;
    if (tableFilter === 'maintenance') return item.isMaintenance;
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bento-card rounded-3xl p-5 sm:p-7 border border-slate-200/90 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-[#002B7F] text-xs font-semibold mb-2">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>FCSIT Laboratory Telemetry & Telematics</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Administrative Reporting & Space Analytics
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl">
              Real-time resource utilization, peak traffic heatmaps, hardware degradation indexes, and one-click officer approval actions.
            </p>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Telemetry Engine</span>
            <div className="text-xs font-bold text-emerald-600 flex items-center justify-end gap-1 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Concurrency Synchronized
            </div>
          </div>
        </div>
      </div>

      {/* BENTO KPI SUMMARY METRICS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1 */}
        <div className="bento-card rounded-3xl p-5 border border-slate-200/90">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Weekly Bookings</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{totalBookingsCount}</div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold mt-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+18% vs last week</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bento-card rounded-3xl p-5 border border-slate-200/90">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Space Utilization</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{labUtilizationRate}%</div>
          <div className="text-[11px] text-slate-500 mt-1">
            {occupiedSlotsToday} of {totalPossibleSlotsToday} slots booked today
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bento-card rounded-3xl p-5 border border-slate-200/90">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Hardware Loans</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{activeLoansCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            {overdueLoansCount > 0 ? (
              <span className="text-rose-600 font-bold">{overdueLoansCount} Overdue Alert(s)</span>
            ) : (
              'All returned on schedule'
            )}
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bento-card rounded-3xl p-5 border border-slate-200/90">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Maintenance Alerts</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-950 mt-2">{underMaintenanceHwCount}</div>
          <div className="text-[11px] text-amber-700 font-medium mt-1">
            {underMaintenanceHwCount > 0 ? 'ESP32 node under soldering' : 'Zero hardware down'}
          </div>
        </div>
      </div>

      {/* PEAK TRAFFIC HEATMAP & LAB LOAD BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Peak Hours Visual Heatmap (7 cols) */}
        <div className="lg:col-span-7 bento-card rounded-3xl p-5 sm:p-6 border border-slate-200/90 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Peak Hours Laboratory Traffic (08:00 - 18:00)</h3>
                <p className="text-xs text-slate-500">Hourly student concurrency density at FCSIT blocks</p>
              </div>
              <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                Peak: 10:00 - 12:00
              </span>
            </div>

            {/* Visual Bar Distribution Chart */}
            <div className="space-y-3 mt-4">
              {slotTraffic.map((st) => (
                <div key={st.slot} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">{st.slot}</span>
                    <span className="font-mono text-slate-500 font-bold">{st.count} Active Bookings ({st.pct}% Capacity)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        st.pct >= 90
                          ? 'bg-rose-500'
                          : st.pct >= 70
                          ? 'bg-amber-500'
                          : 'bg-[#002B7F]'
                      }`}
                      style={{ width: `${st.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Peak workload corresponds to FYP AI deep learning allocations.</span>
            <span className="font-semibold text-slate-800">En. Faizal (Officer on Duty)</span>
          </div>
        </div>

        {/* Laboratory Asset Health & Utilization (5 cols) */}
        <div className="lg:col-span-5 bento-card rounded-3xl p-5 sm:p-6 border border-slate-200/90 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm mb-1">Laboratory Space Status</h3>
            <p className="text-xs text-slate-500 mb-4">Occupancy status by FCSIT facility</p>

            <div className="space-y-3 text-xs">
              {rooms.map((room) => {
                const isBooked = bookings.some(
                  (b) => b.roomId === room.id && (b.status === 'Active' || b.status === 'Approved')
                );

                return (
                  <div
                    key={room.id}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-slate-900">{room.name}</div>
                      <div className="text-[10px] text-slate-500">{room.code} • {room.capacity} seats</div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        isBooked
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {isBooked ? 'Occupied' : 'Standby'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 text-right">
            Auto-refreshed with LocalStorage telemetry
          </div>
        </div>
      </div>

      {/* SECTION: ACTIONABLE INCIDENT & APPROVAL TABLE */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 px-1">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Filter className="w-4 h-4 text-blue-600" />
              Actionable Operations Management
            </h2>
            <p className="text-xs text-slate-500">
              Filter records requiring immediate administrative intervention or check-in.
            </p>
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {[
              { id: 'all', label: `All Records (${allActionableItems.length})` },
              { id: 'pending', label: 'Pending Approvals' },
              { id: 'active', label: 'Active In-Session' },
              { id: 'overdue', label: 'Overdue Loans' },
              { id: 'maintenance', label: 'Maintenance Alerts' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setTableFilter(f.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  tableFilter === f.id
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bento-card rounded-3xl p-5 border border-slate-200/90 overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/60">
                <th className="p-3 rounded-l-xl">Type & Item</th>
                <th className="p-3">Reference Code</th>
                <th className="p-3">Requester / Student</th>
                <th className="p-3">Schedule / Status</th>
                <th className="p-3">Purpose & Remark</th>
                <th className="p-3 text-right rounded-r-xl">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((item) => (
                <tr key={`${item.type}-${item.id}`} className="hover:bg-slate-50/50">
                  <td className="p-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      {item.type}
                    </span>
                    <span className="font-bold text-slate-900">{item.item}</span>
                  </td>
                  <td className="p-3 font-mono font-bold text-slate-800">{item.code}</td>
                  <td className="p-3">
                    <div className="font-semibold text-slate-800">{item.user}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{item.matric}</div>
                  </td>
                  <td className="p-3">
                    <div>{item.time}</div>
                    <span
                      className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        item.status === 'Active' || item.status === 'Active / Issued'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : item.status === 'Overdue'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : item.status === 'Pending Approval' || item.status === 'Pending Endorsement'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="p-3 max-w-xs truncate text-slate-600">{item.purpose}</td>
                  <td className="p-3 text-right">
                    {item.isPending ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            if (item.type === 'Space Booking') approveBooking(item.id);
                            else if (item.type === 'Hardware Loan') approveLoan(item.id);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-sm"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            if (item.type === 'Space Booking') rejectBooking(item.id);
                            else if (item.type === 'Hardware Loan') rejectLoan(item.id);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 text-[11px] font-semibold border border-rose-200"
                        >
                          Reject
                        </button>
                      </div>
                    ) : item.isOverdue ? (
                      <span className="text-[11px] font-bold text-rose-600 uppercase">Recall Issued</span>
                    ) : (
                      <span className="text-slate-400 text-[11px]">Synced</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

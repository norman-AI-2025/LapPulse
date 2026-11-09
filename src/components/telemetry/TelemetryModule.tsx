import React, { useState } from 'react';
import { useLabPulse } from '../../context/LabPulseContext';
import { 
  BarChart3, 
  Activity, 
  Clock, 
  Building2, 
  Cpu 
} from 'lucide-react';

export const TelemetryModule: React.FC = () => {
  const { bookings, loans, rooms, hardware, approveBooking, rejectBooking, approveLoan, rejectLoan } = useLabPulse();

  const [filter, setFilter] = useState<'all' | 'pending' | 'active'>('all');

  const totalBookings = bookings.length;
  const activeBookings = bookings.filter((b) => b.status === 'Active').length;
  const activeLoans = loans.filter((l) => l.status === 'Active / Issued').length;
  const pendingApprovals = bookings.filter((b) => b.status === 'Pending Approval').length +
                           loans.filter((l) => l.status === 'Pending Approval').length;

  const slotTraffic = [
    { slot: '08:00 - 10:00', pct: 60 },
    { slot: '10:00 - 12:00', pct: 95 },
    { slot: '12:00 - 14:00', pct: 40 },
    { slot: '14:00 - 16:00', pct: 85 },
    { slot: '16:00 - 18:00', pct: 70 },
  ];

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-2">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Analytics & Utilization</h1>
          <p className="text-xs text-slate-500">Live operational metrics and space occupancy.</p>
        </div>
      </div>

      {/* Minimal KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-slate-200">
          <div className="text-[11px] font-semibold text-slate-400">Total Bookings</div>
          <div className="text-xl font-bold text-slate-900 mt-1">{totalBookings}</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200">
          <div className="text-[11px] font-semibold text-slate-400">Active In Labs</div>
          <div className="text-xl font-bold text-slate-900 mt-1">{activeBookings}</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200">
          <div className="text-[11px] font-semibold text-slate-400">Active Loans</div>
          <div className="text-xl font-bold text-slate-900 mt-1">{activeLoans}</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200">
          <div className="text-[11px] font-semibold text-slate-400">Pending Action</div>
          <div className="text-xl font-bold text-slate-900 mt-1">{pendingApprovals}</div>
        </div>
      </div>

      {/* Hourly Density */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200">
        <h3 className="text-xs font-bold text-slate-900 mb-3">Daily Traffic Distribution (08:00 – 18:00)</h3>
        
        <div className="space-y-2.5">
          {slotTraffic.map((s) => (
            <div key={s.slot} className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-medium text-slate-700">{s.slot}</span>
                <span className="text-slate-400">{s.pct}% load</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-slate-900 h-full rounded-full transition-all"
                  style={{ width: `${s.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Space Status Overview */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 text-xs font-bold text-slate-900">
          FCSIT Laboratory Spaces
        </div>
        <div className="divide-y divide-slate-100 text-xs">
          {rooms.map((room) => {
            const isBooked = bookings.some(
              (b) => b.roomId === room.id && (b.status === 'Active' || b.status === 'Approved')
            );

            return (
              <div key={room.id} className="p-3.5 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-800">{room.name}</span>
                  <span className="text-slate-400 ml-2">{room.code}</span>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  isBooked ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  {isBooked ? 'In-Use' : 'Available'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

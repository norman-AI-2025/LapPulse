import React, { useState } from 'react';
import { useLabPulse } from '../../context/LabPulseContext';
import { HardwareCategory, HardwareItem } from '../../types';
import { HardwareCalendarView } from './HardwareCalendarView';
import { 
  Cpu, 
  Search, 
  Activity, 
  MapPin, 
  Calendar, 
  ChevronRight, 
  Sparkles,
  Users,
  Clock,
  CheckCircle2
} from 'lucide-react';

const CATEGORIES: ('All' | HardwareCategory)[] = [
  'All',
  'Edge AI & Dev Kits',
  'Microcontrollers',
  'Testing & Measurement',
  'Sensors & Bundles',
];

export const HardwareLendingModule: React.FC = () => {
  const { hardware, loans, waitlist, currentRole, reports } = useLabPulse();
  const isOfficer = currentRole === 'admin';

  // Active / pending / overdue hardware loans
  const activeLoans = loans.filter(
    (l) => l.status === 'Active / Issued' || l.status === 'Pending Approval' || l.status === 'Overdue'
  );

  const [selectedHardwareId, setSelectedHardwareId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'All' | HardwareCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const selectedItem = hardware.find((h) => h.id === selectedHardwareId);

  // If a hardware item's status is clicked into, show its dedicated interactive calendar view!
  if (selectedItem) {
    return (
      <HardwareCalendarView
        item={selectedItem}
        onBack={() => setSelectedHardwareId(null)}
        onSelectItem={(id) => setSelectedHardwareId(id)}
      />
    );
  }

  const filteredHardware = hardware.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesQuery =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.serialNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="space-y-4 max-w-6xl mx-auto pb-12 animate-in fade-in duration-200">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            FCSIT Hardware Vault
          </h1>
        </div>

        {/* Search */}
        <div className="relative sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Jetson, ESP32, Scope..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white rounded-xl border border-slate-200 focus:outline-none focus:border-slate-400"
          />
        </div>
      </div>

      {/* OFFICER BOOKED & ISSUED HARDWARE DIRECTORY */}
      {isOfficer && (
        <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-6 border border-slate-800 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold tracking-tight text-white uppercase">
                  Booked & Issued Hardware Directory
                </h2>
                <p className="text-[11px] text-slate-400">
                  Live overview of laboratory hardware assets currently checked out or reserved by borrowers
                </p>
              </div>
            </div>
            <span className="font-mono text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 self-start sm:self-auto">
              [{activeLoans.length} {activeLoans.length === 1 ? 'ACTIVE LOAN' : 'ACTIVE LOANS'}]
            </span>
          </div>

          {activeLoans.length === 0 ? (
            <div className="py-6 px-4 text-center rounded-2xl bg-slate-800/50 border border-slate-800 mt-4">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-200">
                No Hardware Currently Checked Out or Reserved
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                All dev kits, sensors, and oscilloscopes are secured in FCSIT lockers. Pending and active loans will appear here in real time.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-4">
              {activeLoans.map((loan) => {
                const item = hardware.find((h) => h.id === loan.hardwareId);
                return (
                  <div
                    key={loan.id}
                    onClick={() => setSelectedHardwareId(loan.hardwareId)}
                    className="group/card bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 hover:border-blue-500/50 rounded-2xl p-4 transition-all duration-200 cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          {loan.hardwareTag || item?.tag || 'HW'}
                        </span>
                        <span
                          className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded border ${
                            loan.status === 'Active / Issued'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              : loan.status === 'Overdue'
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                              : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          }`}
                        >
                          [{loan.status.toUpperCase()}]
                        </span>
                      </div>

                      <h3 className="text-xs font-bold text-white group-hover/card:text-blue-300 transition-colors line-clamp-1">
                        {loan.hardwareName || item?.name}
                      </h3>

                      <div className="mt-2.5 space-y-1.5 text-[11px] text-slate-300">
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="text-slate-200 font-medium">
                            Due: {loan.dueDate}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">
                            {loan.userName} <span className="font-mono text-slate-400">({loan.userMatric})</span>
                          </span>
                        </div>

                        {loan.purpose && (
                          <p className="text-[10px] text-slate-400 line-clamp-1 italic pt-0.5">
                            "{loan.purpose}"
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-700/60 flex items-center justify-between text-[11px] font-semibold text-blue-400 group-hover/card:text-blue-300">
                      <span>Open Hardware Calendar</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover/card:translate-x-1 transition-transform" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-slate-900 text-white font-semibold shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* HARDWARE CONTAINERS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredHardware.map((item) => {
          const isOutOfStock = item.availableUnits <= 0;
          const isReportRepair = reports.some(r => r.type === 'HARDWARE' && r.targetId === item.id && r.status === 'IN REPAIR');
          const isUnderRepair = item.status === 'Under Maintenance' || isReportRepair;

          // Count waitlist queue
          const queueCount = waitlist.filter((w) => w.targetId === item.id && w.status === 'waiting').length;

          return (
            <div
              key={item.id}
              onClick={() => setSelectedHardwareId(item.id)}
              className="bg-white rounded-3xl overflow-hidden border border-slate-200/90 hover:border-slate-400/80 hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col justify-between"
            >
              <div>
                {/* 1. Hardware Image Container */}
                <div className="relative h-44 bg-slate-100 overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Tag badge */}
                  <div className="absolute top-3 left-3">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/90 text-slate-900 backdrop-blur-md shadow-sm">
                      {item.tag}
                    </span>
                  </div>

                  {/* Top-Right Stock Status Pill */}
                  <div className="absolute top-3 right-3">
                    <span
                      className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full shadow-sm backdrop-blur-md ${
                        isUnderRepair
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : isOutOfStock
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {isUnderRepair
                        ? 'Under Repair'
                        : isOutOfStock
                        ? 'On Loan (0 Free)'
                        : `${item.availableUnits} Available`}
                    </span>
                  </div>
                </div>

                {/* 2. Hardware Name & Metadata */}
                <div className="p-4 sm:p-5">
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-900 transition-colors leading-snug">
                    {item.name}
                  </h3>

                  <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-500 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>{item.location} (SN: {item.serialNumber})</span>
                  </div>

                  {/* Health score & Queue summary */}
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Activity className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Health: <strong>{item.healthPercentage}%</strong></span>
                    </div>

                    {queueCount > 0 ? (
                      <span className="text-amber-700 font-semibold text-[11px] bg-amber-50 px-2 py-0.5 rounded-md">
                        {queueCount} in Queue
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px]">{item.totalUnits} Units Total</span>
                    )}
                  </div>
                </div>
              </div>

              {/* 3. Replaced "Passport" and "Request Loan" with prominent "Status & Calendar" Action */}
              <div className="px-4 pb-4 sm:px-5 sm:pb-5">
                <div className={`w-full py-2.5 px-3.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors shadow-sm ${
                  isUnderRepair
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : 'bg-slate-50 group-hover:bg-slate-900 group-hover:text-white text-slate-800'
                }`}>
                  <span className="flex items-center gap-2">
                    <Calendar className={`w-4 h-4 ${isUnderRepair ? 'text-rose-600' : 'text-blue-600 group-hover:text-white'}`} />
                    <span>{isUnderRepair ? 'Under Repair • View Calendar' : 'Check Status & Calendar'}</span>
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-slate-400 group-hover:text-slate-300">
                    <span>{isUnderRepair ? 'Loans Disabled' : 'Borrow Schedule'}</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

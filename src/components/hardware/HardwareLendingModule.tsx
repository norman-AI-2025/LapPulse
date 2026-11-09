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
  Users
} from 'lucide-react';

const CATEGORIES: ('All' | HardwareCategory)[] = [
  'All',
  'Edge AI & Dev Kits',
  'Microcontrollers',
  'Testing & Measurement',
  'Sensors & Bundles',
];

export const HardwareLendingModule: React.FC = () => {
  const { hardware, loans, waitlist } = useLabPulse();

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
          <p className="text-xs text-slate-500 mt-0.5">
            Click any hardware status to view its borrowing history calendar, queue list, and schedule loans.
          </p>
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
          const isMaintenance = item.status === 'Under Maintenance';

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
                        isMaintenance
                          ? 'bg-amber-100 text-amber-800'
                          : isOutOfStock
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {isMaintenance
                        ? 'Maintenance'
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
                <div className="w-full py-2.5 px-3.5 rounded-xl bg-slate-50 group-hover:bg-slate-900 group-hover:text-white text-slate-800 text-xs font-semibold flex items-center justify-between transition-colors shadow-sm">
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600 group-hover:text-white" />
                    <span>Check Status & Calendar</span>
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-slate-400 group-hover:text-slate-300">
                    <span>Borrow Schedule</span>
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

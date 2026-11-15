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
  const { hardware, loans, waitlist, reports, selectedHardwareId, setSelectedHardwareId } = useLabPulse();

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

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === cat
                ? 'bg-slate-900 text-white shadow-xs'
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
              className="bg-white rounded-xl overflow-hidden border border-slate-200 hover:border-slate-300 shadow-xs transition-colors cursor-pointer group flex flex-col justify-between"
            >
              <div>
                {/* 1. Hardware Image Container */}
                <div className="relative h-44 bg-slate-100 overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Tag badge */}
                  <div className="absolute top-3 left-3">
                    <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-white/95 text-slate-900 shadow-xs">
                      {item.tag}
                    </span>
                  </div>

                  {/* Top-Right Stock Status Pill */}
                  <div className="absolute top-3 right-3">
                    <span
                      className={`text-xs font-mono font-medium px-2 py-0.5 rounded-md shadow-xs ${
                        isUnderRepair
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : isOutOfStock
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {isUnderRepair
                        ? 'Under repair'
                        : isOutOfStock
                        ? 'On loan (0 free)'
                        : `${item.availableUnits} available`}
                    </span>
                  </div>
                </div>

                {/* 2. Hardware Name & Metadata */}
                <div className="p-4 sm:p-5">
                  <h3 className="text-sm font-semibold text-slate-900 group-hover:text-blue-900 transition-colors leading-snug">
                    {item.name}
                  </h3>

                  <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-500 font-normal">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>{item.location} (SN: {item.serialNumber})</span>
                  </div>

                  {/* Health score & Queue summary */}
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Activity className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Health: <strong className="font-medium text-slate-900">{item.healthPercentage}%</strong></span>
                    </div>

                    {queueCount > 0 ? (
                      <span className="text-amber-700 font-medium text-xs bg-amber-50 px-2 py-0.5 rounded-md">
                        {queueCount} in queue
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs">{item.totalUnits} units total</span>
                    )}
                  </div>
                </div>
              </div>

              {/* 3. Action */}
              <div className="px-4 pb-4 sm:px-5 sm:pb-5">
                <div className={`w-full py-2.5 px-3.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors shadow-xs ${
                  isUnderRepair
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : 'bg-slate-50 group-hover:bg-slate-900 group-hover:text-white text-slate-800'
                }`}>
                  <span className="flex items-center gap-2">
                    <Calendar className={`w-4 h-4 ${isUnderRepair ? 'text-rose-600' : 'text-blue-600 group-hover:text-white'}`} />
                    <span>{isUnderRepair ? 'Under repair • view calendar' : 'Check status & calendar'}</span>
                  </span>
                  <span className="flex items-center gap-1 text-xs text-slate-400 group-hover:text-slate-300">
                    <span>{isUnderRepair ? 'Loans disabled' : 'Borrow schedule'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
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

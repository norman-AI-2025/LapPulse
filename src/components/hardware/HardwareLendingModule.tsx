import React, { useState } from 'react';
import { useLabPulse } from '../../context/LabPulseContext';
import { HardwareCategory, HardwareItem } from '../../types';
import { EquipmentPassportModal } from './EquipmentPassportModal';
import { LoanRequestModal } from './LoanRequestModal';
import { 
  Cpu, 
  Search, 
  Activity, 
  ShieldCheck, 
  PackageCheck,
  Plus
} from 'lucide-react';

const CATEGORIES: ('All' | HardwareCategory)[] = [
  'All',
  'Edge AI & Dev Kits',
  'Microcontrollers',
  'Testing & Measurement',
  'Sensors & Bundles',
];

export const HardwareLendingModule: React.FC = () => {
  const { hardware, joinWaitlist } = useLabPulse();

  const [selectedCategory, setSelectedCategory] = useState<'All' | HardwareCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [passportItem, setPassportItem] = useState<HardwareItem | null>(null);
  const [loanItem, setLoanItem] = useState<HardwareItem | null>(null);

  const filteredHardware = hardware.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesQuery =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.serialNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Hardware Vault</h1>
          <p className="text-xs text-slate-500">Available dev kits, measurement tools, and IoT sensors.</p>
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

      {/* Minimal Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-slate-900 text-white font-semibold'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Clean Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredHardware.map((item) => {
          const isOutOfStock = item.availableUnits <= 0;
          const isMaintenance = item.status === 'Under Maintenance';

          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-4 border border-slate-200 hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Image */}
                <div className="relative h-36 bg-slate-100 rounded-xl overflow-hidden mb-3">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/90 text-slate-900 shadow-sm">
                      {item.tag}
                    </span>
                  </div>
                  <div className="absolute top-2.5 right-2.5">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md shadow-sm ${
                      isMaintenance
                        ? 'bg-amber-100 text-amber-800'
                        : isOutOfStock
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {isMaintenance ? 'Maintenance' : isOutOfStock ? '0 Available' : `${item.availableUnits} Available`}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <h3 className="text-xs font-bold text-slate-900 leading-snug">{item.name}</h3>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                  <span>Serial: {item.serialNumber}</span>
                  <span>•</span>
                  <span>{item.location}</span>
                </div>

                {/* Health & Specs */}
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Activity className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Health: <strong>{item.healthPercentage}%</strong></span>
                  </div>
                  <span className="text-slate-400">{item.totalUnits} Units Total</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
                <button
                  onClick={() => setPassportItem(item)}
                  className="py-1.5 px-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium transition-colors text-center"
                >
                  Passport
                </button>

                {isOutOfStock ? (
                  <button
                    onClick={() => {
                      joinWaitlist('hardware', item.id, item.name, item.tag, new Date().toISOString().split('T')[0]);
                    }}
                    className="py-1.5 px-3 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-medium transition-colors text-center"
                  >
                    Join Queue
                  </button>
                ) : (
                  <button
                    onClick={() => setLoanItem(item)}
                    disabled={isMaintenance}
                    className={`py-1.5 px-3 rounded-xl text-white text-xs font-semibold transition-colors text-center ${
                      isMaintenance ? 'bg-slate-300 cursor-not-allowed' : 'bg-slate-900 hover:bg-slate-800'
                    }`}
                  >
                    Request Loan
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Equipment Passport Modal */}
      {passportItem && (
        <EquipmentPassportModal
          item={passportItem}
          onClose={() => setPassportItem(null)}
          onRequestLoan={() => {
            const item = passportItem;
            setPassportItem(null);
            setLoanItem(item);
          }}
        />
      )}

      {/* Loan Request Modal */}
      {loanItem && (
        <LoanRequestModal
          item={loanItem}
          onClose={() => setLoanItem(null)}
        />
      )}
    </div>
  );
};

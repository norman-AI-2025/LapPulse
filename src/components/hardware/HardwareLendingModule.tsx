import React, { useState } from 'react';
import { useLabPulse } from '../../context/LabPulseContext';
import { HardwareCategory, HardwareItem } from '../../types';
import { EquipmentPassportModal } from './EquipmentPassportModal';
import { LoanRequestModal } from './LoanRequestModal';
import { HARDWARE_TEMPLATES } from '../../data/initialData';
import { 
  Cpu, 
  Search, 
  Activity, 
  ShieldCheck, 
  Layers, 
  Sparkles, 
  ChevronRight, 
  CheckCircle2, 
  AlertTriangle, 
  PackageCheck,
  Zap,
  ArrowRight
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

  // Selected item modals
  const [passportItem, setPassportItem] = useState<HardwareItem | null>(null);
  const [loanItem, setLoanItem] = useState<HardwareItem | null>(null);

  const filteredHardware = hardware.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesQuery =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.specs.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesQuery;
  });

  const handleOpenBundle = (itemIds: string[]) => {
    // Find the first available item in bundle
    const firstItem = hardware.find((h) => itemIds.includes(h.id));
    if (firstItem) {
      setPassportItem(firstItem);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bento-card rounded-3xl p-5 sm:p-7 border border-slate-200/90 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-[#002B7F] text-xs font-semibold mb-2">
              <Cpu className="w-3.5 h-3.5" />
              <span>FCSIT Hardware Vault & Digital Passports</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Hardware Lending & Digital Equipment Passports
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
              Borrow laboratory developer kits, oscilloscopes, and sensor nodes with cryptographic QR tokens, real-time health grading, and audit logs.
            </p>
          </div>

          <div className="relative sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Jetson, ESP32, Rigol..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-[#002B7F] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* SECTION: PROJECT-BASED HARDWARE RECOMMENDATION BUNDLES */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Curated FYP & Coursework Hardware Bundles
            </h2>
            <p className="text-xs text-slate-500">
              Pre-vetted hardware stacks for AI Computer Vision, IoT Sensors, and Signal Debugging.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {HARDWARE_TEMPLATES.map((tpl) => (
            <div
              key={tpl.id}
              className="bento-card rounded-2xl p-4 border border-slate-200/80 hover:border-blue-300 transition-all flex flex-col justify-between group bg-gradient-to-b from-white to-blue-50/20"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-md">
                    {tpl.category}
                  </span>
                  <Zap className="w-4 h-4 text-amber-500" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mt-2 group-hover:text-blue-700 transition-colors">
                  {tpl.title}
                </h3>
                <p className="text-xs font-medium text-slate-500 mt-0.5">{tpl.subtitle}</p>
                <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                  {tpl.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-500 truncate max-w-[170px]">
                  {tpl.targetCourse}
                </span>
                <button
                  onClick={() => handleOpenBundle(tpl.hardwareItemIds)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-900 group-hover:translate-x-0.5 transition-transform"
                >
                  <span>Inspect Kit</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* HARDWARE CATALOG BENTO GRID */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-sm font-bold text-slate-900">
            FCSIT Hardware Catalog & Passports ({filteredHardware.length} items)
          </h2>
          <span className="text-xs text-slate-500">Click any card to inspect operational passport</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredHardware.map((item) => {
            const isOutOfStock = item.availableUnits <= 0;
            const isMaintenance = item.status === 'Under Maintenance';

            return (
              <div
                key={item.id}
                className="bento-card rounded-3xl overflow-hidden border border-slate-200/90 flex flex-col justify-between group"
              >
                <div>
                  {/* Photo Banner */}
                  <div className="relative h-44 bg-slate-100 overflow-hidden">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />

                    {/* Tag badge */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-black/60 backdrop-blur-md text-amber-300 border border-white/20">
                        {item.tag}
                      </span>
                      {item.bundleTag && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/80 backdrop-blur-md text-white">
                          {item.bundleTag}
                        </span>
                      )}
                    </div>

                    {/* Stock pill */}
                    <div className="absolute top-3 right-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold backdrop-blur-md border ${
                          isMaintenance
                            ? 'bg-amber-500/90 text-white border-amber-400'
                            : isOutOfStock
                            ? 'bg-rose-500/90 text-white border-rose-400'
                            : 'bg-emerald-500/90 text-white border-emerald-400'
                        }`}
                      >
                        {isMaintenance
                          ? 'Under Maintenance'
                          : isOutOfStock
                          ? 'On Loan (0 Free)'
                          : `${item.availableUnits} Available`}
                      </span>
                    </div>

                    {/* Overlay Title */}
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <h3 className="font-bold text-base leading-tight drop-shadow-sm">{item.name}</h3>
                      <p className="text-xs text-slate-300 mt-0.5 truncate">{item.model}</p>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5">
                    
                    {/* Health & Serial Bar */}
                    <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs mb-3.5">
                      <div className="flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="font-semibold text-slate-700">Health:</span>
                        <span className="font-bold text-slate-900">{item.healthPercentage}%</span>
                      </div>
                      <div className="text-[11px] font-mono text-slate-500 truncate max-w-[130px]">
                        {item.serialNumber}
                      </div>
                    </div>

                    {/* Specs Bullet highlights */}
                    <div className="space-y-1 text-xs text-slate-600 mb-4">
                      {item.specs.slice(0, 3).map((s, idx) => (
                        <div key={idx} className="flex items-start gap-1.5">
                          <span className="text-blue-500 font-bold">•</span>
                          <span className="line-clamp-1">{s}</span>
                        </div>
                      ))}
                    </div>

                    {/* Defects Notice if any */}
                    {item.defects.length > 0 && (
                      <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-center gap-1.5 mb-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                        <span className="truncate">{item.defects.length} defect log(s) in passport</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-5 pt-0 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setPassportItem(item)}
                    className="py-2.5 px-3 rounded-2xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    <span>Passport</span>
                  </button>

                  {isOutOfStock ? (
                    <button
                      onClick={() => {
                        joinWaitlist('hardware', item.id, item.name, item.tag, new Date().toISOString().split('T')[0]);
                      }}
                      className="py-2.5 px-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                    >
                      <span>Join Queue</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setLoanItem(item)}
                      disabled={isMaintenance}
                      className={`py-2.5 px-3 rounded-2xl text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm ${
                        isMaintenance
                          ? 'bg-slate-400 cursor-not-allowed'
                          : 'bg-[#002B7F] hover:bg-blue-800'
                      }`}
                    >
                      <PackageCheck className="w-3.5 h-3.5 text-amber-300" />
                      <span>Request Loan</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
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


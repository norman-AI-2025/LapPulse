import React from 'react';
import { Layers, ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-16 border-t border-slate-200/80 bg-white/60 backdrop-blur-md py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#002B7F] flex items-center justify-center text-amber-300">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-slate-800">LabPulse</span>
          <span>• Universiti Malaya FCSIT Laboratory Space & Hardware Lending System</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            UM Cryptographic Pass Verification
          </span>
          <span>•</span>
          <span className="text-[11px]">Faculty of Computer Science & IT</span>
        </div>
      </div>
    </footer>
  );
};

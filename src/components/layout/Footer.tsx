import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-16 border-t border-slate-200/60 py-6 px-4 text-center text-xs text-slate-400">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <span className="font-semibold text-slate-600">LabPulse • Universiti Malaya FCSIT</span>
        <span>Faculty of Computer Science & Information Technology</span>
      </div>
    </footer>
  );
};

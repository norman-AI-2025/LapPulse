import React, { useState } from 'react';
import { useLabPulse } from '../../context/LabPulseContext';
import { UserRole } from '../../types';
import { 
  Building2, 
  Cpu, 
  QrCode, 
  CheckSquare2, 
  BarChart3, 
  Radio, 
  RotateCcw, 
  Menu, 
  X, 
  ChevronDown
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    currentUser, 
    currentRole, 
    switchRole, 
    activeTab, 
    setActiveTab, 
    bookings, 
    loans, 
    resetToDemoData 
  } = useLabPulse();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const pendingEndorsementsCount = bookings.filter((b) => b.status === 'Pending Endorsement').length;
  const pendingOfficerApprovalCount = bookings.filter((b) => b.status === 'Pending Approval').length + 
                                     loans.filter((l) => l.status === 'Pending Approval').length;

  const handleRoleChange = (role: UserRole) => {
    switchRole(role);
    setRoleDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { id: 'labs', label: 'Spaces', icon: Building2, roles: ['student', 'lecturer', 'admin'] },
    { id: 'hardware', label: 'Hardware', icon: Cpu, roles: ['student', 'lecturer', 'admin'] },
    { id: 'my-passes', label: 'My Passes', icon: QrCode, roles: ['student'] },
    { 
      id: 'supervisor', 
      label: 'Endorsements', 
      icon: CheckSquare2, 
      roles: ['lecturer'],
      badge: pendingEndorsementsCount > 0 ? pendingEndorsementsCount : undefined
    },
    { 
      id: 'officer-station', 
      label: 'Scanner Station', 
      icon: Radio, 
      roles: ['admin'],
      badge: pendingOfficerApprovalCount > 0 ? pendingOfficerApprovalCount : undefined
    },
    { id: 'telemetry', label: 'Analytics', icon: BarChart3, roles: ['admin', 'lecturer'] },
  ];

  const visibleLinks = navLinks.filter((l) => l.roles.includes(currentRole));

  return (
    <header className="sticky top-3 z-40 px-3 sm:px-6 w-full max-w-6xl mx-auto">
      <div className="clean-nav rounded-2xl px-4 py-2.5 flex items-center justify-between gap-3 transition-all">
        
        {/* Brand */}
        <div 
          className="flex items-center gap-2 cursor-pointer select-none" 
          onClick={() => setActiveTab('labs')}
        >
          <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center text-white font-bold text-sm">
            LP
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-base tracking-tight text-slate-900">LabPulse</span>
            <span className="text-[10px] font-semibold text-slate-400">UM FCSIT</span>
          </div>
        </div>

        {/* Minimal Navigation Pills */}
        <nav className="hidden md:flex items-center gap-1">
          {visibleLinks.map((link) => {
            const Icon = link.icon;
            const isActive = activeTab === link.id;

            return (
              <button
                key={link.id}
                onClick={() => setActiveTab(link.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{link.label}</span>
                {link.badge !== undefined && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full leading-tight ${
                    isActive ? 'bg-amber-400 text-slate-900' : 'bg-rose-500 text-white'
                  }`}>
                    {link.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Role & Actions */}
        <div className="flex items-center gap-2">
          
          {/* Quick Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200/70 text-left transition-colors"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-6 h-6 rounded-lg object-cover"
              />
              <span className="text-xs font-semibold text-slate-800 hidden sm:inline">
                {currentRole === 'student' && 'Student (Norman)'}
                {currentRole === 'lecturer' && 'Lecturer (Dr. Amir)'}
                {currentRole === 'admin' && 'Officer (En. Faizal)'}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {/* Dropdown */}
            {roleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-200 p-1.5 z-50">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Switch User Role
                </div>
                
                <div className="space-y-0.5">
                  <button
                    onClick={() => handleRoleChange('student')}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors flex items-center justify-between ${
                      currentRole === 'student' ? 'bg-slate-100 text-slate-900 font-bold' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>Student (Norman Lee)</span>
                    <span className="text-[10px] text-slate-400">25005870</span>
                  </button>

                  <button
                    onClick={() => handleRoleChange('lecturer')}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors flex items-center justify-between ${
                      currentRole === 'lecturer' ? 'bg-slate-100 text-slate-900 font-bold' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>Lecturer (Dr. Amir Rudin)</span>
                    <span className="text-[10px] text-slate-400">Supervisor</span>
                  </button>

                  <button
                    onClick={() => handleRoleChange('admin')}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors flex items-center justify-between ${
                      currentRole === 'admin' ? 'bg-slate-100 text-slate-900 font-bold' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>Lab Officer (En. Faizal)</span>
                    <span className="text-[10px] text-slate-400">Admin</span>
                  </button>
                </div>

                <div className="mt-1.5 pt-1.5 border-t border-slate-100">
                  <button
                    onClick={() => {
                      resetToDemoData();
                      setRoleDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 rounded-xl text-xs text-slate-500 hover:text-rose-600 hover:bg-rose-50 flex items-center gap-1.5 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Data</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-xl text-slate-600 hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 p-2 bg-white rounded-2xl shadow-lg border border-slate-200 flex flex-col gap-1">
          {visibleLinks.map((link) => {
            const Icon = link.icon;
            const isActive = activeTab === link.id;

            return (
              <button
                key={link.id}
                onClick={() => {
                  setActiveTab(link.id);
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium ${
                  isActive ? 'bg-slate-900 text-white font-semibold' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </div>
                {link.badge !== undefined && (
                  <span className="text-[10px] bg-rose-500 text-white px-2 py-0.5 rounded-full font-bold">
                    {link.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};

import React, { useState } from 'react';
import { useLabPulse } from '../../context/LabPulseContext';
import { UserRole } from '../../types';
import { 
  Building2, 
  Cpu, 
  QrCode, 
  CheckSquare2, 
  BarChart3, 
  History, 
  Clock, 
  RotateCcw, 
  Menu, 
  X, 
  Radio, 
  GraduationCap, 
  UserCheck, 
  ShieldAlert,
  ChevronDown,
  Layers
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

  // Calculate live indicators
  const activeStudentBooking = bookings.find(
    (b) => b.userId === currentUser.id && (b.status === 'Active' || b.status === 'Approved')
  );

  const pendingEndorsementsCount = bookings.filter((b) => b.status === 'Pending Endorsement').length;
  const pendingOfficerApprovalCount = bookings.filter((b) => b.status === 'Pending Approval').length + 
                                     loans.filter((l) => l.status === 'Pending Approval').length;

  const handleRoleChange = (role: UserRole) => {
    switchRole(role);
    setRoleDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { id: 'labs', label: 'Labs & Timetable', icon: Building2, roles: ['student', 'lecturer', 'admin'] },
    { id: 'hardware', label: 'Hardware Lending', icon: Cpu, roles: ['student', 'lecturer', 'admin'] },
    { id: 'my-passes', label: 'My Passes & Loans', icon: QrCode, roles: ['student'] },
    { 
      id: 'supervisor', 
      label: 'Supervisor Endorsements', 
      icon: CheckSquare2, 
      roles: ['lecturer'],
      badge: pendingEndorsementsCount > 0 ? pendingEndorsementsCount : undefined
    },
    { 
      id: 'officer-station', 
      label: 'Scan & Verify Station', 
      icon: Radio, 
      roles: ['admin'],
      badge: pendingOfficerApprovalCount > 0 ? pendingOfficerApprovalCount : undefined
    },
    { id: 'waitlist', label: 'Smart Waitlist', icon: Clock, roles: ['student', 'admin'] },
    { id: 'telemetry', label: 'Analytics & Telemetry', icon: BarChart3, roles: ['admin', 'lecturer'] },
    { id: 'audit', label: 'Audit Trail', icon: History, roles: ['admin'] },
  ];

  const visibleLinks = navLinks.filter((l) => l.roles.includes(currentRole));

  return (
    <header className="sticky top-3 z-40 px-3 sm:px-6 w-full max-w-7xl mx-auto">
      {/* Floating Dynamic Island / Apple Bento Navigation Bar */}
      <div className="glass-pill rounded-2xl px-4 sm:px-5 py-2.5 sm:py-3 shadow-island flex items-center justify-between gap-2 border border-slate-200/90 transition-all duration-300">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-2.5 min-w-max cursor-pointer" onClick={() => setActiveTab('labs')}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#002B7F] to-blue-600 flex items-center justify-center text-white shadow-sm ring-2 ring-blue-500/20">
            <Layers className="w-5 h-5 text-amber-300" />
          </div>
          <div className="hidden lg:block text-left">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-slate-900">LabPulse</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-blue-100 text-[#002B7F] tracking-wide">
                FCSIT UM
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium leading-none">Automated Lab & Hardware Engine</p>
          </div>
        </div>

        {/* Live Active Session Indicator (Pill) */}
        {activeStudentBooking && (
          <div 
            onClick={() => setActiveTab('my-passes')}
            className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium cursor-pointer hover:bg-emerald-100 transition-all shadow-sm"
            title="Click to view your active laboratory pass"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="truncate max-w-[140px] font-semibold">{activeStudentBooking.roomCode}</span>
            <span className="text-[10px] text-emerald-600 bg-white/80 px-1.5 py-0.5 rounded-full border border-emerald-100">
              {activeStudentBooking.status}
            </span>
          </div>
        )}

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {visibleLinks.map((link) => {
            const Icon = link.icon;
            const isActive = activeTab === link.id;

            return (
              <button
                key={link.id}
                onClick={() => setActiveTab(link.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 relative ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-300' : 'text-slate-400'}`} />
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

        {/* Right Section: Role Switcher & Utilities */}
        <div className="flex items-center gap-2">
          
          {/* Quick-Switch Role Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-xl bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200/90 text-left transition-all"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-300"
              />
              <div className="hidden sm:block text-left">
                <div className="text-[11px] font-bold text-slate-800 leading-tight truncate max-w-[110px]">
                  {currentUser.name}
                </div>
                <div className="text-[9px] font-semibold text-[#002B7F] uppercase tracking-wider">
                  {currentRole === 'student' && 'Student (25005870)'}
                  {currentRole === 'lecturer' && 'Lecturer / Supv'}
                  {currentRole === 'admin' && 'FCSIT Lab Admin'}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
            </button>

            {/* Dropdown Menu */}
            {roleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50">
                <div className="px-3 py-2 border-b border-slate-100">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Quick Role Switcher (RBAC)
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Select a simulated Universiti Malaya profile:
                  </div>
                </div>

                <div className="py-1.5 space-y-1">
                  {/* Student Profile */}
                  <button
                    onClick={() => handleRoleChange('student')}
                    className={`w-full flex items-start gap-2.5 p-2 rounded-xl text-left transition-colors ${
                      currentRole === 'student' ? 'bg-blue-50 border border-blue-200/70' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700 mt-0.5">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-900">Norman Lee Weng Hong</div>
                      <div className="text-[11px] text-slate-500">Student • Matric: 25005870</div>
                      <div className="text-[10px] text-blue-600">Lab booking, hardware loans, QR passes</div>
                    </div>
                  </button>

                  {/* Lecturer Profile */}
                  <button
                    onClick={() => handleRoleChange('lecturer')}
                    className={`w-full flex items-start gap-2.5 p-2 rounded-xl text-left transition-colors ${
                      currentRole === 'lecturer' ? 'bg-amber-50 border border-amber-200/70' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700 mt-0.5">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-900">Prof. Madya Dr. Amir Rudin</div>
                      <div className="text-[11px] text-slate-500">Lecturer / Academic Supervisor</div>
                      <div className="text-[10px] text-amber-700">1-click FYP endorsements & high-resource signoff</div>
                    </div>
                  </button>

                  {/* Admin Officer Profile */}
                  <button
                    onClick={() => handleRoleChange('admin')}
                    className={`w-full flex items-start gap-2.5 p-2 rounded-xl text-left transition-colors ${
                      currentRole === 'admin' ? 'bg-indigo-50 border border-indigo-200/70' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700 mt-0.5">
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-900">En. Faizal (FCSIT Lab Admin)</div>
                      <div className="text-[11px] text-slate-500">Lab Technical Officer</div>
                      <div className="text-[10px] text-indigo-600">QR scanner, audits, condition checklists, analytics</div>
                    </div>
                  </button>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 px-2 py-1">
                  <span>Universiti Malaya FCSIT</span>
                  <button
                    onClick={resetToDemoData}
                    className="flex items-center gap-1 text-slate-600 hover:text-rose-600 transition-colors font-medium"
                    title="Restore all default seed records"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset Data
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Reset Demo Data quick icon */}
          <button
            onClick={resetToDemoData}
            title="Reset All Demo Data (Labs, Hardware, Bookings)"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100/90 border border-slate-200/80 transition-colors hidden sm:flex items-center"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 border border-slate-200"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 p-3 bg-white/95 backdrop-blur-2xl rounded-2xl shadow-xl border border-slate-200 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between px-2 py-1 mb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Navigation Menu</span>
            <span className="text-xs font-semibold text-[#002B7F] bg-blue-50 px-2 py-0.5 rounded-full">
              {currentRole.toUpperCase()}
            </span>
          </div>

          <div className="flex flex-col gap-1">
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
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </div>
                  {link.badge !== undefined && (
                    <span className="text-xs bg-rose-500 text-white px-2 py-0.5 rounded-full font-bold">
                      {link.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between px-2">
            <span className="text-xs text-slate-500">Reset Initial State</span>
            <button
              onClick={() => {
                resetToDemoData();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-1.5 text-xs text-rose-600 font-semibold px-2.5 py-1.5 rounded-lg bg-rose-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Demo Data
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

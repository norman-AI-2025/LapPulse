import React, { useState } from 'react';
import { useLabPulse } from '../../context/LabPulseContext';
import { 
  Building2, 
  Cpu, 
  QrCode, 
  CheckSquare2, 
  BarChart3, 
  Radio, 
  Menu, 
  X, 
  Inbox, 
  Wrench 
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    currentRole, 
    activeTab, 
    setActiveTab, 
    bookings, 
    loans, 
    unreadNotificationsCount,
    pendingReportsCount 
  } = useLabPulse();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const pendingEndorsementsCount = bookings.filter((b) => b.status === 'Pending Endorsement').length;
  const pendingOfficerApprovalCount = bookings.filter((b) => b.status === 'Pending Approval').length + 
                                     loans.filter((l) => l.status === 'Pending Approval').length;

  const getNavLinks = () => {
    if (currentRole === 'admin') {
      return [
        { 
          id: 'messages', 
          label: 'Messages', 
          icon: Inbox,
          badge: pendingOfficerApprovalCount > 0 ? pendingOfficerApprovalCount : undefined
        },
        { id: 'telemetry', label: 'Analytics', icon: BarChart3 },
        { id: 'labs', label: 'Spaces', icon: Building2 },
        { id: 'hardware', label: 'Hardware', icon: Cpu },
        { 
          id: 'officer-station', 
          label: 'Scanner Station', 
          icon: Radio,
          badge: pendingOfficerApprovalCount > 0 ? pendingOfficerApprovalCount : undefined
        },
        { 
          id: 'reports', 
          label: 'Reports', 
          icon: Wrench,
          badge: pendingReportsCount > 0 ? pendingReportsCount : undefined
        },
      ];
    }
    if (currentRole === 'lecturer') {
      return [
        { id: 'labs', label: 'Spaces', icon: Building2 },
        { id: 'hardware', label: 'Hardware', icon: Cpu },
        { id: 'my-passes', label: 'My Passes', icon: QrCode },
        { 
          id: 'supervisor', 
          label: 'Endorsements', 
          icon: CheckSquare2,
          badge: pendingEndorsementsCount > 0 ? pendingEndorsementsCount : undefined
        },
        { 
          id: 'messages', 
          label: 'Messages', 
          icon: Inbox,
          badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : undefined
        },
      ];
    }
    // student role
    return [
      { id: 'labs', label: 'Spaces', icon: Building2 },
      { id: 'hardware', label: 'Hardware', icon: Cpu },
      { id: 'my-passes', label: 'My Passes', icon: QrCode },
      { 
        id: 'messages', 
        label: 'Messages', 
        icon: Inbox,
        badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : undefined
      },
    ];
  };

  const visibleLinks = getNavLinks();

  return (
    <header className="sticky top-3 z-40 px-3 sm:px-6 w-full max-w-6xl mx-auto">
      <div className="clean-nav rounded-2xl px-4 py-2 flex items-center justify-between gap-3 transition-colors duration-150">
        
        {/* Brand */}
        <div 
          className="flex items-center gap-2.5 cursor-pointer select-none" 
          onClick={() => setActiveTab(currentRole === 'admin' ? 'messages' : 'labs')}
        >
          <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white font-semibold text-xs tracking-tight">
            LP
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-sm tracking-tight text-slate-900">LabPulse</span>
            <span className="text-xs text-slate-400 font-normal">FCSIT UM</span>
          </div>
        </div>

        {/* Minimal Navigation Items */}
        <nav className="hidden md:flex items-center gap-1">
          {visibleLinks.map((link) => {
            const Icon = link.icon;
            const isActive = activeTab === link.id;

            return (
              <button
                key={link.id}
                onClick={() => setActiveTab(link.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors duration-150 ${
                  isActive
                    ? 'bg-slate-900 text-white font-medium shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{link.label}</span>
                {link.badge !== undefined && (
                  <span className={`text-xs font-mono tabular-nums font-medium px-1.5 py-0.5 rounded-md leading-none ${
                    link.id === 'messages'
                      ? isActive
                        ? 'bg-white text-slate-900'
                        : 'bg-slate-100 text-slate-700'
                      : isActive
                      ? 'bg-amber-400 text-slate-950 font-semibold'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}>
                    {link.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Mobile Menu Toggle (Small screens only) */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 p-2 bg-white rounded-2xl shadow-md border border-slate-200 flex flex-col gap-1 animate-in fade-in duration-150">
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
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive ? 'bg-slate-900 text-white font-semibold' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-slate-400" />
                  <span>{link.label}</span>
                </div>
                {link.badge !== undefined && (
                  <span className={`text-xs font-mono tabular-nums font-medium px-1.5 py-0.5 rounded-md ${
                    link.id === 'messages' ? 'bg-slate-100 text-slate-800' : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}>
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

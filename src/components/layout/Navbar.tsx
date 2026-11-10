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
      <div className="clean-nav rounded-2xl px-4 py-2.5 flex items-center justify-between gap-3 transition-all">
        
        {/* Brand */}
        <div 
          className="flex items-center gap-2 cursor-pointer select-none" 
          onClick={() => setActiveTab(currentRole === 'admin' ? 'messages' : 'labs')}
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
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded leading-tight tracking-wider ${
                    link.id === 'messages'
                      ? isActive
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'bg-slate-900 text-white'
                      : isActive
                      ? 'bg-amber-400 text-slate-900'
                      : 'bg-rose-500 text-white'
                  }`}>
                    {link.id === 'messages' ? `[${link.badge}]` : link.badge}
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
            className="p-1.5 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer"
            aria-label="Toggle Navigation Menu"
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
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium cursor-pointer ${
                  isActive ? 'bg-slate-900 text-white font-semibold' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </div>
                {link.badge !== undefined && (
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    link.id === 'messages' ? 'bg-slate-900 text-white' : 'bg-rose-500 text-white'
                  }`}>
                    {link.id === 'messages' ? `[${link.badge}]` : link.badge}
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

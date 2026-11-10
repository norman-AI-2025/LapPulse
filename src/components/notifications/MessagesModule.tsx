import React, { useState, useMemo, useEffect } from 'react';
import { useLabPulse } from '../../context/LabPulseContext';
import { PulseNotification } from '../../types';
import QRCode from 'qrcode';
import { OfficerOperationsHub } from '../admin/OfficerOperationsHub';
import { 
  Bell, 
  Inbox, 
  Clock, 
  Cpu, 
  Building2, 
  QrCode, 
  CheckCircle2, 
  CheckCheck, 
  AlertTriangle, 
  ChevronRight, 
  ChevronDown,
  ChevronUp,
  X, 
  Sparkles, 
  MapPin, 
  ShieldCheck, 
  CheckSquare2,
  Search,
  ExternalLink,
  Eye,
  EyeOff,
  Copy,
  Check,
  User,
  Hash
} from 'lucide-react';

interface PreviewPassData {
  token: string;
  title: string;
  subtitle: string;
  type: 'space' | 'hardware';
  itemName: string;
  itemTag: string;
  serialNumber?: string;
  timeOrDue: string;
  location: string;
  instruction: string;
  borrowerName: string;
  borrowerMatric: string;
  statusBadge: string;
}

export const MessagesModule: React.FC = () => {
  const { currentRole } = useLabPulse();

  if (currentRole === 'admin') {
    return <OfficerOperationsHub />;
  }

  const {
    notifications,
    currentUser,
    bookings,
    loans,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    dismissNotification,
    clearAllNotifications,
    setActiveTab,
    addToast
  } = useLabPulse();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'UNREAD' | 'SPACE' | 'HARDWARE' | 'ENDORSEMENT'>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState(false);

  // Quick Pass Modal State (Instant Pop Up in Middle of Screen with Blurred Background)
  const [previewPass, setPreviewPass] = useState<PreviewPassData | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPreviewPass(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filter for role
  const roleFiltered = useMemo(() => {
    return notifications.filter((n) => {
      if (n.targetRole && n.targetRole !== currentRole) return false;
      return true;
    });
  }, [notifications, currentRole]);

  // Dynamic counts
  const unreadCount = roleFiltered.filter((n) => !n.isRead).length;
  const spaceCount = roleFiltered.filter((n) => n.type === 'space').length;
  const hwCount = roleFiltered.filter((n) => n.type === 'hardware').length;
  const endorseCount = roleFiltered.filter((n) => n.type === 'endorsement').length;

  // Filtered and searched list
  const displayList = useMemo(() => {
    return roleFiltered.filter((n) => {
      // Category filter
      if (filter === 'UNREAD' && n.isRead) return false;
      if (filter === 'SPACE' && n.type !== 'space') return false;
      if (filter === 'HARDWARE' && n.type !== 'hardware') return false;
      if (filter === 'ENDORSEMENT' && n.type !== 'endorsement') return false;

      // Text query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = n.title.toLowerCase().includes(q);
        const matchId = n.identifier.toLowerCase().includes(q);
        const matchLoc = n.locationOrDesk.toLowerCase().includes(q);
        const matchInstr = (n.instruction || '').toLowerCase().includes(q);
        return matchTitle || matchId || matchLoc || matchInstr;
      }
      return true;
    });
  }, [roleFiltered, filter, searchQuery]);

  // Handle Action Click (Open Pass Pop Up / Review / etc.)
  const handleActionClick = (notif: PulseNotification) => {
    markNotificationAsRead(notif.id);
    
    // 1. POP UP QR PASS FOR HARDWARE
    if (notif.type === 'hardware') {
      const userLoan = loans.find(
        (l) => l.userId === currentUser.id && (l.status === 'Active / Issued' || l.status === 'Pending Approval')
      ) || loans.find((l) => l.userId === currentUser.id) || loans[0];

      const qrToken = userLoan?.tokenCode || 'LP-3829';
      QRCode.toDataURL(qrToken, { width: 320, margin: 1, errorCorrectionLevel: 'H' })
        .then((url) => {
          setQrDataUrl(url);
          setPreviewPass({
            token: qrToken,
            title: 'Digital Hardware Passport',
            subtitle: 'Official Equipment Lending & Return Pass',
            type: 'hardware',
            itemName: userLoan?.hardwareName || notif.identifier,
            itemTag: userLoan?.hardwareTag || 'FCSIT-HW-JET-01',
            serialNumber: userLoan?.serialNumber || 'SN-NV-ORIN-9421',
            timeOrDue: notif.dueOrEndTime || userLoan?.dueDate || 'Today, 10 Nov by 05:00 PM',
            location: notif.locationOrDesk || 'FCSIT Technical Admin Counter, Level 2',
            instruction: notif.instruction || 'Please present this digital passport to the Scanner Station or Officer at the counter to verify hardware return.',
            borrowerName: currentUser.name,
            borrowerMatric: currentUser.matricOrStaffId,
            statusBadge: notif.severityTag.replace(/[[\]]/g, '') || 'DUE TODAY'
          });
        })
        .catch(() => {
          setActiveTab('my-passes');
        });
      return;
    }

    // 2. POP UP QR PASS FOR SPACE / ROOM CHECK-OUT
    if (notif.type === 'space') {
      const userBooking = bookings.find(
        (b) => b.userId === currentUser.id && (b.status === 'Active' || b.status === 'Approved')
      ) || bookings.find((b) => b.userId === currentUser.id) || bookings[0];

      const qrToken = userBooking?.tokenCode || 'LP-4190';
      QRCode.toDataURL(qrToken, { width: 320, margin: 1, errorCorrectionLevel: 'H' })
        .then((url) => {
          setQrDataUrl(url);
          setPreviewPass({
            token: qrToken,
            title: 'Laboratory Turnstile Pass',
            subtitle: 'Physical Check-Out & Room Access Token',
            type: 'space',
            itemName: userBooking?.roomName || notif.identifier,
            itemTag: userBooking?.roomCode || 'FCSIT-B2-AI01',
            serialNumber: 'Laboratory Turnstile Gate / Workstation Node',
            timeOrDue: notif.dueOrEndTime || userBooking?.slot || 'Ending at 12:00 PM',
            location: notif.locationOrDesk || 'Laboratory Entrance Turnstile',
            instruction: notif.instruction || 'Please tidy workstations, power off test equipment, and scan checkout QR at the turnstile.',
            borrowerName: currentUser.name,
            borrowerMatric: currentUser.matricOrStaffId,
            statusBadge: notif.severityTag.replace(/[[\]]/g, '') || 'CHECK-OUT IN 10 MINS'
          });
        })
        .catch(() => {
          setActiveTab('my-passes');
        });
      return;
    }

    // 3. SUPERVISOR ENDORSEMENT
    if (notif.type === 'endorsement') {
      setActiveTab('supervisor');
      addToast('Supervisor Queue', 'Navigated to pending student endorsement requests.', 'info');
      return;
    }

    setActiveTab(notif.actionTab);
  };

  const handleCopyIdentifier = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 1800);
    addToast('Copied', `Identifier "${text}" copied to clipboard.`, 'info');
  };

  const handleCopyToken = (token: string) => {
    navigator.clipboard.writeText(token);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 1800);
    addToast('Pass Code Copied', `Token ${token} copied to clipboard.`, 'info');
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 animate-in fade-in duration-200">
      
      {/* TOP HEADER - Matches LabPulse Apple Bento System */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0 shadow-xs">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                Messages & Reminders
              </h1>
              {unreadCount > 0 ? (
                <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white shadow-xs">
                  {unreadCount} new
                </span>
              ) : (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  All caught up
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Global Toolbar Actions */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {unreadCount > 0 && (
            <button
              onClick={() => {
                markAllNotificationsAsRead();
                addToast('All Caught Up', 'All messages marked as read.', 'success');
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Mark all read</span>
            </button>
          )}
        </div>
      </div>

      {/* FILTER & SEARCH BAR - Segmented Apple-Style Container */}
      <div className="bg-white rounded-2xl p-2 sm:p-2.5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              filter === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            All ({roleFiltered.length})
          </button>

          <button
            onClick={() => setFilter('UNREAD')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              filter === 'UNREAD'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            Unread ({unreadCount})
          </button>

          <button
            onClick={() => setFilter('SPACE')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              filter === 'SPACE'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Spaces ({spaceCount})</span>
          </button>

          <button
            onClick={() => setFilter('HARDWARE')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              filter === 'HARDWARE'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Hardware ({hwCount})</span>
          </button>

          {endorseCount > 0 && (
            <button
              onClick={() => setFilter('ENDORSEMENT')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                filter === 'ENDORSEMENT'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <CheckSquare2 className="w-3.5 h-3.5" />
              <span>Endorsements ({endorseCount})</span>
            </button>
          )}
        </div>

        {/* Search Input Box */}
        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search reminders..."
            className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-slate-800 text-xs rounded-xl pl-8 pr-7 py-1.5 border border-slate-200/80 focus:outline-none focus:border-blue-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

      </div>

      {/* NOTIFICATION FEED CARDS */}
      <div className="space-y-3.5">
        {displayList.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border border-slate-200/80 shadow-xs text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Inbox className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              {searchQuery ? 'No matching notifications' : 'No new notifications'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              {searchQuery 
                ? `No messages matched "${searchQuery}". Try clearing search keywords.`
                : 'All lab check-out countdowns, overdue hardware summons, and approval notices are cleared.'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          displayList.map((notif) => {
            const isUnread = !notif.isRead;
            const isSpace = notif.type === 'space';
            const isHardware = notif.type === 'hardware';
            const isExpanded = expandedId === notif.id;

            // Clean badge tag
            const cleanTag = notif.severityTag.replace(/[[\]]/g, '');

            return (
              <div
                key={notif.id}
                onClick={() => toggleExpand(notif.id)}
                className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden cursor-pointer group ${
                  isUnread
                    ? 'border-blue-300 ring-2 ring-blue-500/10 shadow-xs'
                    : 'border-slate-200/80 shadow-xs hover:border-slate-300'
                }`}
              >
                {/* Main Glanceable Row */}
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  
                  {/* Left: Icon Badge & Summary */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    
                    {/* Category Icon */}
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 border shadow-xs ${
                      isSpace
                        ? 'bg-sky-50 border-sky-100 text-sky-700'
                        : isHardware
                        ? 'bg-rose-50 border-rose-100 text-rose-700'
                        : 'bg-purple-50 border-purple-100 text-purple-700'
                    }`}>
                      {isSpace ? (
                        <Clock className="w-4 h-4" />
                      ) : isHardware ? (
                        <Cpu className="w-4 h-4" />
                      ) : (
                        <CheckSquare2 className="w-4 h-4" />
                      )}
                    </div>

                    {/* Headline, Tag & Summary */}
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        
                        {/* Status Tag Pill */}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          notif.severityColor === 'rose'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : notif.severityColor === 'amber'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : notif.severityColor === 'navy'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                          {cleanTag}
                        </span>

                        <span className="text-xs text-slate-400 font-medium">
                          {notif.timestamp}
                        </span>

                        {isUnread && (
                          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                        )}
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                        {notif.title}
                      </h3>

                      <p className="text-xs text-slate-500 truncate">
                        {notif.identifier} • {notif.dueOrEndTime}
                      </p>
                    </div>

                  </div>

                  {/* Right: Quick Action & Toggle */}
                  <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 flex-shrink-0">
                    
                    {/* Primary CTA: Pops up QR and Info Modal for Hardware and Space */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleActionClick(notif);
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer group-hover:scale-[1.02]"
                    >
                      {isSpace ? (
                        <QrCode className="w-3.5 h-3.5 text-amber-300" />
                      ) : isHardware ? (
                        <QrCode className="w-3.5 h-3.5 text-emerald-300" />
                      ) : (
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-300" />
                      )}
                      <span>{notif.actionLabel.replace(/[[\]]/g, '')}</span>
                      <ChevronRight className="w-3 h-3 text-slate-400" />
                    </button>

                    {/* Read Toggle */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markNotificationAsRead(notif.id);
                      }}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      title={isUnread ? 'Mark as read' : 'Read'}
                    >
                      {isUnread ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 opacity-50" />}
                    </button>

                    {/* Dismiss */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        dismissNotification(notif.id);
                        addToast('Dismissed', 'Notification removed from inbox.', 'info');
                      }}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Dismiss notification"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    {/* Expand Chevron */}
                    <div className="text-slate-400 pl-1">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>

                  </div>

                </div>

                {/* EXPANDED INTERACTIVE DETAILS DRAWER */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-1 border-t border-slate-100 bg-slate-50/50 space-y-3.5 animate-in fade-in duration-150">
                    
                    {/* Metadata Bento Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 text-xs">
                      
                      <div className="bg-white p-3 rounded-xl border border-slate-200/80 flex items-center justify-between">
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Item / Venue</span>
                          <div className="font-semibold text-slate-800 truncate max-w-[160px]">{notif.identifier}</div>
                        </div>
                        <button
                          onClick={(e) => handleCopyIdentifier(e, notif.identifier)}
                          className="p-1 text-slate-400 hover:text-slate-700"
                          title="Copy ID"
                        >
                          {copiedId === notif.identifier ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      <div className="bg-white p-3 rounded-xl border border-slate-200/80 space-y-0.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Scheduled Deadline</span>
                        <div className="font-semibold text-slate-800">{notif.dueOrEndTime}</div>
                      </div>

                      <div className="bg-white p-3 rounded-xl border border-slate-200/80 space-y-0.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Operating Location</span>
                        <div className="font-semibold text-slate-800 truncate">{notif.locationOrDesk}</div>
                      </div>

                    </div>

                    {/* Operational Instruction Box */}
                    {notif.instruction && (
                      <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 text-xs text-slate-700 space-y-1">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                          <span>Standard Operating Instruction:</span>
                        </div>
                        <p className="leading-relaxed text-slate-600 pl-5">
                          {notif.instruction}
                        </p>
                      </div>
                    )}

                    {/* Inline Quick Action Toolbar */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-slate-400">
                        Notification ID: <code className="font-mono text-slate-600">{notif.id}</code>
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleActionClick(notif);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
                        >
                          <QrCode className="w-3.5 h-3.5 text-amber-300" />
                          <span>{notif.actionLabel.replace(/[[\]]/g, '')}</span>
                        </button>
                      </div>
                    </div>

                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

      {/* POP UP QR CODE & INFO MODAL IN THE MIDDLE OF SCREEN WITH BLURRED BACKGROUND */}
      {previewPass && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200 select-none"
          onClick={() => setPreviewPass(null)}
        >
          <div 
            className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-slate-200/90 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 relative max-h-[92vh] overflow-y-auto scrollbar-none"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border shadow-xs ${
                  previewPass.type === 'hardware'
                    ? 'bg-rose-50 border-rose-100 text-rose-700'
                    : 'bg-sky-50 border-sky-100 text-sky-700'
                }`}>
                  {previewPass.type === 'hardware' ? (
                    <Cpu className="w-5 h-5" />
                  ) : (
                    <Building2 className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">
                      {previewPass.title}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {previewPass.subtitle}
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setPreviewPass(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                title="Close (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Central Scannable QR Code Card */}
            <div className="bg-slate-50/80 rounded-2xl p-4 sm:p-5 border border-slate-200/80 text-center space-y-3">
              
              {/* QR Image Box */}
              {qrDataUrl && (
                <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 inline-block shadow-xs">
                  <img 
                    src={qrDataUrl} 
                    alt="Digital Pass QR Code" 
                    className="w-44 h-44 sm:w-48 sm:h-48 mx-auto object-contain" 
                  />
                </div>
              )}
              
              {/* Token Code with 1-Click Copy */}
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-2">
                  <span className="font-mono text-lg font-black text-slate-900 tracking-wider">
                    {previewPass.token}
                  </span>
                  <button
                    onClick={() => handleCopyToken(previewPass.token)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 transition-colors"
                    title="Copy token code"
                  >
                    {copiedToken ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-center gap-1.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    previewPass.type === 'hardware'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-blue-50 text-blue-800 border-blue-200'
                  }`}>
                    {previewPass.statusBadge}
                  </span>
                  <span className="text-[11px] text-slate-400">• FCSIT Scanner Verified</span>
                </div>
              </div>

            </div>

            {/* Metadata Info Bento Grid */}
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              
              <div className="col-span-2 bg-slate-50/60 p-3 rounded-xl border border-slate-200/70 space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {previewPass.type === 'hardware' ? 'Equipment Unit' : 'Facility Venue'}
                </span>
                <div className="font-bold text-slate-900 text-xs">
                  {previewPass.itemName}
                </div>
                <div className="font-mono text-[11px] text-slate-500">
                  {previewPass.itemTag}
                </div>
              </div>

              <div className="bg-slate-50/60 p-3 rounded-xl border border-slate-200/70 space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{previewPass.type === 'hardware' ? 'Return Cutoff' : 'Concluding Time'}</span>
                </span>
                <div className="font-semibold text-slate-800 text-xs">
                  {previewPass.timeOrDue}
                </div>
              </div>

              <div className="bg-slate-50/60 p-3 rounded-xl border border-slate-200/70 space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  <span>Counter / Door</span>
                </span>
                <div className="font-semibold text-slate-800 text-xs truncate">
                  {previewPass.location}
                </div>
              </div>

              {previewPass.serialNumber && (
                <div className="bg-slate-50/60 p-3 rounded-xl border border-slate-200/70 space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Hash className="w-3 h-3 text-slate-400" />
                    <span>Serial / Node</span>
                  </span>
                  <div className="font-mono text-slate-700 text-xs truncate">
                    {previewPass.serialNumber}
                  </div>
                </div>
              )}

              <div className="bg-slate-50/60 p-3 rounded-xl border border-slate-200/70 space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <User className="w-3 h-3 text-slate-400" />
                  <span>Cardholder</span>
                </span>
                <div className="font-semibold text-slate-800 text-xs truncate">
                  {previewPass.borrowerName}
                </div>
                <div className="font-mono text-[10px] text-slate-400">
                  {previewPass.borrowerMatric}
                </div>
              </div>

            </div>

            {/* Operating Instruction Box */}
            <div className="bg-blue-50/60 rounded-xl p-3 border border-blue-100 text-xs text-blue-900 leading-relaxed flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <span>
                {previewPass.type === 'hardware'
                  ? 'Present this QR pass to the Technical Counter or Scanner Station camera to complete physical return.'
                  : 'Scan this QR at the entrance turnstile camera to verify departure and automatically release the workstation.'}
              </span>
            </div>

            {/* Modal Action Buttons */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => {
                  setPreviewPass(null);
                  setActiveTab('my-passes');
                }}
                className="flex-1 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-all shadow-xs text-center cursor-pointer"
              >
                Go to My Passes
              </button>
              <button
                onClick={() => setPreviewPass(null)}
                className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

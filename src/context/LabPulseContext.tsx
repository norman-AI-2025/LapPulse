import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/audio';
import { 
  UserProfile, 
  UserRole, 
  LabRoom, 
  LabBooking, 
  HardwareItem, 
  HardwareLoan, 
  WaitlistEntry, 
  AuditLog, 
  TimeSlotString,
  BookingStatus,
  LoanStatus,
  RoomReportRecord,
  PulseNotification,
  MaintenanceReport,
  ReportStatus,
  ReportType,
  SpaceRepairCategory,
  HardwareDefectCategory
} from '../types';
import { 
  USERS, 
  INITIAL_ROOMS, 
  INITIAL_HARDWARE, 
  INITIAL_BOOKINGS, 
  INITIAL_LOANS, 
  INITIAL_WAITLIST, 
  INITIAL_AUDIT_LOGS,
  INITIAL_NOTIFICATIONS,
  INITIAL_MAINTENANCE_REPORTS,
  getTodayDateString 
} from '../data/initialData';
import {
  supabase,
  isSupabaseConfigured,
  mapRoomFromDb,
  mapHardwareFromDb,
  mapBookingFromDb,
  mapLoanFromDb,
  mapReportFromDb,
  mapWaitlistFromDb,
  mapAuditLogFromDb,
  mapProfileFromDb,
  dbUpsertBooking,
  dbDeleteBooking,
  dbUpsertLoan,
  dbUpsertReport,
  dbUpsertWaitlist,
  dbDeleteWaitlist,
  dbInsertAuditLog,
  dbUpsertRoom,
  dbUpsertHardware,
  dbUpsertProfile,
} from '../lib/supabase';

export interface ToastNotification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  timestamp: number;
}

interface LabPulseContextType {
  currentUser: UserProfile;
  currentRole: UserRole;
  switchRole: (role: UserRole) => void;
  users: Record<string, UserProfile>;
  
  // Authentication & Session
  isAuthenticated: boolean;
  login: (credentials: { identifier: string; password?: string; role?: UserRole }) => { success: boolean; message: string };
  signup: (data: { name: string; role: UserRole; matricOrStaffId: string; email: string; department: string; password?: string }) => { success: boolean; message: string };
  logout: () => void;
  quickLogin: (role: UserRole) => void;

  // Navigation
  activeTab: string;
  setActiveTab: (tab: string) => void;
  
  // Data lists
  rooms: LabRoom[];
  hardware: HardwareItem[];
  bookings: LabBooking[];
  loans: HardwareLoan[];
  waitlist: WaitlistEntry[];
  auditLogs: AuditLog[];
  toasts: ToastNotification[];
  
  // Toast helpers
  addToast: (title: string, message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;
  
  // Space Booking Actions
  createBooking: (data: {
    roomId: string;
    date: string;
    slot: TimeSlotString;
    purpose: string;
    courseCode?: string;
    isFYP: boolean;
    supervisorName?: string;
    supervisorEmail?: string;
  }) => { success: boolean; message: string; booking?: LabBooking };
  checkConflict: (roomId: string, date: string, slot: TimeSlotString, excludeBookingId?: string) => { hasConflict: boolean; conflictingBooking?: LabBooking };
  endorseBooking: (bookingId: string, note?: string) => void;
  rejectEndorsement: (bookingId: string, reason?: string) => void;
  approveBooking: (bookingId: string, note?: string) => void;
  rejectBooking: (bookingId: string, reason?: string) => void;
  cancelBooking: (bookingId: string) => void;
  autoCancelExpiredBooking: (bookingId: string) => void;
  checkInBooking: (tokenCodeOrId: string) => { success: boolean; message: string; booking?: LabBooking };
  checkOutBooking: (tokenCodeOrId: string) => { success: boolean; message: string; booking?: LabBooking };
  markNoShow: (bookingId: string) => void;
  releaseToWaitlist: (bookingId: string) => { success: boolean; promotedUser?: string; message: string };
  
  // Hardware Loan Actions
  requestLoan: (data: {
    hardwareId: string;
    purpose: string;
    dueDate: string;
    requestDate?: string;
  }) => { success: boolean; message: string; loan?: HardwareLoan };
  approveLoan: (loanId: string) => void;
  rejectLoan: (loanId: string, reason?: string) => void;
  verifyAndIssueLoan: (tokenCodeOrId: string, checklist: { chassisIntact: boolean; accessoriesIncluded: boolean; powersOnWithoutError: boolean }, notes?: string) => { success: boolean; message: string };
  processReturn: (tokenCodeOrId: string, returnCondition: 'Excellent' | 'Good' | 'Minor Scratches' | 'Needs Service', checklist: { chassisIntact: boolean; accessoriesIncluded: boolean; powersOnWithoutError: boolean }, defectNotes?: string) => { success: boolean; message: string };
  reportDefect: (hardwareId: string, issue: string, severity: 'Minor' | 'Moderate' | 'Critical') => void;
  
  // Waitlist Actions
  joinWaitlist: (targetType: 'room' | 'hardware', targetId: string, targetName: string, slotOrDetails: string, date: string) => { success: boolean; message: string; entry?: WaitlistEntry };
  leaveWaitlist: (waitlistId: string) => void;
  
  // Issue & Incident Reports
  addRoomReport: (data: {
    roomId: string;
    title: string;
    description: string;
    category: 'Air Conditioning' | 'Projector & AV' | 'Workstations & PCs' | 'Electrical & Power' | 'Cleanliness' | 'Network & Wi-Fi' | 'Other';
    severity: 'Minor' | 'Moderate' | 'Critical';
  }) => void;
  updateRoomReportStatus: (roomId: string, reportId: string, status: 'Open' | 'In Progress' | 'Resolved', notes?: string) => void;
  updateHardwareDefectStatus: (hardwareId: string, defectId: string, status: 'Investigating' | 'Pending Parts' | 'Resolved') => void;

  // Notifications
  notifications: PulseNotification[];
  unreadNotificationsCount: number;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  dismissNotification: (id: string) => void;
  simulate10MinWarning: () => void;
  simulateDueHardware: () => void;
  trigger15MinSpaceReminder: (bookingId?: string) => void;
  trigger1DayHardwareReminder: (loanId?: string) => void;
  clearAllNotifications: () => void;

  // Maintenance & Defect Reports Module
  reports: MaintenanceReport[];
  pendingReportsCount: number;
  isReportModalOpen: boolean;
  setIsReportModalOpen: (open: boolean) => void;
  reportModalInitialMode: 'SPACE' | 'HARDWARE';
  reportModalTargetId?: string;
  openReportModal: (mode?: 'SPACE' | 'HARDWARE', targetId?: string) => void;
  closeReportModal: () => void;
  submitMaintenanceReport: (data: {
    type: 'SPACE' | 'HARDWARE';
    targetId: string;
    targetName: string;
    targetCodeOrTag: string;
    specificLocation?: string;
    serialNumber?: string;
    category: SpaceRepairCategory | HardwareDefectCategory;
    description: string;
    photoUrl?: string;
  }) => { success: boolean; reportId: string };
  updateReportStatus: (reportId: string, status: ReportStatus, officerNotes?: string) => void;
  flagHardwareFromReport: (reportId: string) => void;
  flagSpaceFromReport: (reportId: string) => void;

  // Utilities
  resetToDemoData: () => void;
  addAuditLog: (action: string, details: string, category: 'booking' | 'hardware' | 'checkin' | 'waitlist' | 'system') => void;
}

const LabPulseContext = createContext<LabPulseContextType | undefined>(undefined);

// LocalStorage Keys - Brand new clean release v2
const STORAGE_KEYS = {
  ROLE: 'labpulse_current_role_v2',
  AUTH: 'labpulse_auth_status_v2',
  ACTIVE_USER: 'labpulse_active_user_v2',
  USERS_LIST: 'labpulse_registered_users_v2',
  ROOMS: 'labpulse_rooms_v2',
  HARDWARE: 'labpulse_hardware_v2',
  BOOKINGS: 'labpulse_bookings_v2',
  LOANS: 'labpulse_loans_v2',
  WAITLIST: 'labpulse_waitlist_v2',
  AUDIT: 'labpulse_audit_v2',
  NOTIFICATIONS: 'labpulse_notifications_v2',
  SENT_REMINDERS: 'labpulse_sent_reminders_v2',
  REPORTS: 'labpulse_reports_v2',
};

// Automatic purge of outdated demo storage keys on load
try {
  if (typeof window !== 'undefined' && window.localStorage) {
    const validKeySet = new Set(Object.values(STORAGE_KEYS));
    const allKeys = Object.keys(localStorage);
    for (const k of allKeys) {
      if (k.startsWith('labpulse_') && !validKeySet.has(k)) {
        localStorage.removeItem(k);
      }
    }
  }
} catch {
  // Ignore in sandboxed / non-browser environments
}

export const LabPulseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Registered Users Registry
  const [usersRecord, setUsersRecord] = useState<Record<string, UserProfile>>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS_LIST);
    if (saved) {
      try {
        return { ...USERS, ...JSON.parse(saved) };
      } catch {
        return USERS;
      }
    }
    return USERS;
  });

  // Current user role
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ROLE);
    return (saved as UserRole) || 'student';
  });

  // Active User Profile
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const savedUser = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER);
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch {
        // Fallback
      }
    }
    const savedRole = (localStorage.getItem(STORAGE_KEYS.ROLE) as UserRole) || 'student';
    return USERS[savedRole] || USERS.student;
  });

  // Session Authentication State (defaults to false so user sees login/signup page)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUTH);
    return saved !== null ? saved === 'true' : false;
  });

  const [activeTab, setActiveTab] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ROLE);
    if (saved === 'admin') return 'telemetry';
    if (saved === 'lecturer') return 'supervisor';
    return 'labs';
  });
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Persistent States - Guaranteed FCSIT 23 Real Spaces
  const [rooms, setRooms] = useState<LabRoom[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ROOMS);
    if (!saved) return INITIAL_ROOMS;
    try {
      const parsed: LabRoom[] = JSON.parse(saved);
      const hasAllRooms =
        Array.isArray(parsed) &&
        parsed.length === INITIAL_ROOMS.length &&
        INITIAL_ROOMS.every((ir) => parsed.some((p) => p.id === ir.id));

      if (!hasAllRooms) {
        localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(INITIAL_ROOMS));
        return INITIAL_ROOMS;
      }

      return parsed.map((r) => {
        const init = INITIAL_ROOMS.find((ir) => ir.id === r.id);
        return {
          ...r,
          reports: r.reports && r.reports.length > 0 ? r.reports : (init?.reports || [])
        };
      });
    } catch {
      return INITIAL_ROOMS;
    }
  });

  const [hardware, setHardware] = useState<HardwareItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.HARDWARE);
    return saved ? JSON.parse(saved) : INITIAL_HARDWARE;
  });

  const [bookings, setBookings] = useState<LabBooking[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
    if (!saved) return INITIAL_BOOKINGS;
    try {
      const parsed: LabBooking[] = JSON.parse(saved);
      // Validate that all bookings reference legitimate FCSIT spaces
      const hasValidRoomReferences =
        Array.isArray(parsed) &&
        parsed.every((b) => INITIAL_ROOMS.some((r) => r.id === b.roomId));

      if (!hasValidRoomReferences) {
        localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(INITIAL_BOOKINGS));
        return INITIAL_BOOKINGS;
      }

      // Ensure seeded bookings exist
      const missingSeeded = INITIAL_BOOKINGS.filter((ib) => !parsed.some((p) => p.id === ib.id));
      return [...parsed, ...missingSeeded];
    } catch {
      return INITIAL_BOOKINGS;
    }
  });

  const [loans, setLoans] = useState<HardwareLoan[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LOANS);
    if (!saved) return INITIAL_LOANS;
    try {
      const parsed: HardwareLoan[] = JSON.parse(saved);
      const missingSeeded = INITIAL_LOANS.filter((il) => !parsed.some((p) => p.id === il.id));
      return [...parsed, ...missingSeeded];
    } catch {
      return INITIAL_LOANS;
    }
  });

  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.WAITLIST);
    return saved ? JSON.parse(saved) : INITIAL_WAITLIST;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUDIT);
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [notifications, setNotifications] = useState<PulseNotification[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (!saved) return INITIAL_NOTIFICATIONS;
    try {
      return JSON.parse(saved);
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  const [sentReminders, setSentReminders] = useState<Set<string>>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SENT_REMINDERS);
    if (!saved) return new Set();
    try {
      return new Set(JSON.parse(saved));
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SENT_REMINDERS, JSON.stringify(Array.from(sentReminders)));
  }, [sentReminders]);

  const [reports, setReports] = useState<MaintenanceReport[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.REPORTS);
    if (!saved) return INITIAL_MAINTENANCE_REPORTS;
    try {
      const parsed: MaintenanceReport[] = JSON.parse(saved);
      const missingSeeded = INITIAL_MAINTENANCE_REPORTS.filter((ir) => !parsed.some((p) => p.id === ir.id));
      return [...parsed, ...missingSeeded];
    } catch {
      return INITIAL_MAINTENANCE_REPORTS;
    }
  });

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportModalInitialMode, setReportModalInitialMode] = useState<'SPACE' | 'HARDWARE'>('SPACE');
  const [reportModalTargetId, setReportModalTargetId] = useState<string | undefined>(undefined);

  const openReportModal = useCallback((mode: 'SPACE' | 'HARDWARE' = 'SPACE', targetId?: string) => {
    setReportModalInitialMode(mode);
    setReportModalTargetId(targetId);
    setIsReportModalOpen(true);
  }, []);

  const closeReportModal = useCallback(() => {
    setIsReportModalOpen(false);
    setReportModalTargetId(undefined);
  }, []);

  const pendingReportsCount = reports.filter((r) => r.status === 'PENDING').length;

  // Mount-time integrity check: ensure all 23 official FCSIT spaces are loaded
  useEffect(() => {
    if (!rooms || rooms.length !== INITIAL_ROOMS.length || !rooms.some((r) => r.id === 'lab-mm1')) {
      setRooms(INITIAL_ROOMS);
      localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(INITIAL_ROOMS));
    }
    if (!bookings || bookings.some((b) => !INITIAL_ROOMS.some((r) => r.id === b.roomId))) {
      setBookings(INITIAL_BOOKINGS);
      localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(INITIAL_BOOKINGS));
    }
  }, []);

  // Supabase Hydration & Realtime Synchronization Layer
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    // 1. Initial hydration from Supabase
    const hydrateFromSupabase = async () => {
      try {
        const [
          roomsRes,
          hwRes,
          bkRes,
          lnRes,
          repRes,
          wtRes,
          audRes,
          profRes
        ] = await Promise.allSettled([
          supabase.from('rooms').select('*'),
          supabase.from('hardware').select('*'),
          supabase.from('bookings').select('*'),
          supabase.from('loans').select('*'),
          supabase.from('maintenance_reports').select('*'),
          supabase.from('waitlist').select('*'),
          supabase.from('audit_logs').select('*'),
          supabase.from('profiles').select('*')
        ]);

        if (roomsRes.status === 'fulfilled' && roomsRes.value.data && roomsRes.value.data.length > 0) {
          setRooms(roomsRes.value.data.map(mapRoomFromDb));
        }
        if (hwRes.status === 'fulfilled' && hwRes.value.data && hwRes.value.data.length > 0) {
          setHardware(hwRes.value.data.map(mapHardwareFromDb));
        }
        if (bkRes.status === 'fulfilled' && bkRes.value.data) {
          setBookings(bkRes.value.data.map(mapBookingFromDb));
        }
        if (lnRes.status === 'fulfilled' && lnRes.value.data) {
          setLoans(lnRes.value.data.map(mapLoanFromDb));
        }
        if (repRes.status === 'fulfilled' && repRes.value.data) {
          setReports(repRes.value.data.map(mapReportFromDb));
        }
        if (wtRes.status === 'fulfilled' && wtRes.value.data) {
          setWaitlist(wtRes.value.data.map(mapWaitlistFromDb));
        }
        if (audRes.status === 'fulfilled' && audRes.value.data && audRes.value.data.length > 0) {
          setAuditLogs(audRes.value.data.map(mapAuditLogFromDb));
        }
        if (profRes.status === 'fulfilled' && profRes.value.data && profRes.value.data.length > 0) {
          const loadedProfiles: Record<string, UserProfile> = {};
          profRes.value.data.forEach((p: any) => {
            const mapped = mapProfileFromDb(p);
            loadedProfiles[mapped.id] = mapped;
          });
          setUsersRecord((prev) => ({ ...prev, ...loadedProfiles }));
        }
      } catch (err) {
        console.warn('Supabase initial fetch fallback to local cache:', err);
      }
    };

    hydrateFromSupabase();

    // 2. Real-time postgres_changes listeners
    const channel = supabase
      .channel('lappulse-realtime-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, (payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          const updated = mapBookingFromDb(payload.new);
          setBookings((prev) => {
            const idx = prev.findIndex((b) => b.id === updated.id);
            if (idx >= 0) {
              const copy = [...prev];
              copy[idx] = updated;
              return copy;
            }
            return [updated, ...prev];
          });
        } else if (payload.eventType === 'DELETE') {
          const deletedId = (payload.old as any)?.id;
          if (deletedId) setBookings((prev) => prev.filter((b) => b.id !== deletedId));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'loans' }, (payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          const updated = mapLoanFromDb(payload.new);
          setLoans((prev) => {
            const idx = prev.findIndex((l) => l.id === updated.id);
            if (idx >= 0) {
              const copy = [...prev];
              copy[idx] = updated;
              return copy;
            }
            return [updated, ...prev];
          });
        } else if (payload.eventType === 'DELETE') {
          const deletedId = (payload.old as any)?.id;
          if (deletedId) setLoans((prev) => prev.filter((l) => l.id !== deletedId));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'maintenance_reports' }, (payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          const updated = mapReportFromDb(payload.new);
          setReports((prev) => {
            const idx = prev.findIndex((r) => r.id === updated.id);
            if (idx >= 0) {
              const copy = [...prev];
              copy[idx] = updated;
              return copy;
            }
            return [updated, ...prev];
          });
        } else if (payload.eventType === 'DELETE') {
          const deletedId = (payload.old as any)?.id;
          if (deletedId) setReports((prev) => prev.filter((r) => r.id !== deletedId));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' }, (payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          const updated = mapRoomFromDb(payload.new);
          setRooms((prev) => {
            const idx = prev.findIndex((r) => r.id === updated.id);
            if (idx >= 0) {
              const copy = [...prev];
              copy[idx] = updated;
              return copy;
            }
            return [...prev, updated];
          });
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'hardware' }, (payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          const updated = mapHardwareFromDb(payload.new);
          setHardware((prev) => {
            const idx = prev.findIndex((h) => h.id === updated.id);
            if (idx >= 0) {
              const copy = [...prev];
              copy[idx] = updated;
              return copy;
            }
            return [...prev, updated];
          });
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'waitlist' }, (payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          const updated = mapWaitlistFromDb(payload.new);
          setWaitlist((prev) => {
            const idx = prev.findIndex((w) => w.id === updated.id);
            if (idx >= 0) {
              const copy = [...prev];
              copy[idx] = updated;
              return copy;
            }
            return [updated, ...prev];
          });
        } else if (payload.eventType === 'DELETE') {
          const deletedId = (payload.old as any)?.id;
          if (deletedId) setWaitlist((prev) => prev.filter((w) => w.id !== deletedId));
        }
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'audit_logs' }, (payload) => {
        const updated = mapAuditLogFromDb(payload.new);
        setAuditLogs((prev) => [updated, ...prev.filter((a) => a.id !== updated.id)]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ROLE, currentRole);
  }, [currentRole]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(rooms));
  }, [rooms]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HARDWARE, JSON.stringify(hardware));
  }, [hardware]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify(loans));
  }, [loans]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WAITLIST, JSON.stringify(waitlist));
  }, [waitlist]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
  }, [reports]);

  // Toast Management
  const addToast = useCallback((title: string, message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    const newToast: ToastNotification = {
      id: `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title,
      message,
      type,
      timestamp: Date.now()
    };
    setToasts((prev) => [newToast, ...prev.slice(0, 4)]);

    // Auto dismiss after 4.5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Audit Log Management
  const addAuditLog = useCallback((action: string, details: string, category: 'booking' | 'hardware' | 'checkin' | 'waitlist' | 'system') => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }),
      actor: currentUser.name,
      actorRole: currentUser.role,
      action,
      details,
      category
    };
    setAuditLogs((prev) => [newLog, ...prev]);
    dbInsertAuditLog(newLog);
  }, [currentUser]);

  // Switch Role
  const switchRole = (role: UserRole) => {
    setCurrentRole(role);
    const user = USERS[role] || USERS.student;
    setCurrentUser(user);
    localStorage.setItem(STORAGE_KEYS.ROLE, role);
    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(user));
    addToast('Role Switched', `Active Persona: ${user.name} (${role.toUpperCase()})`, 'info');
    
    // Auto switch active tab to match role workflow
    if (role === 'lecturer') {
      setActiveTab('supervisor');
    } else if (role === 'admin') {
      setActiveTab('telemetry');
    } else {
      setActiveTab('labs');
    }
  };

  // Quick One-Click Demo Access
  const quickLogin = (role: UserRole) => {
    const user = USERS[role] || USERS.student;
    setCurrentUser(user);
    setCurrentRole(role);
    setIsAuthenticated(true);
    localStorage.setItem(STORAGE_KEYS.ROLE, role);
    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(user));
    localStorage.setItem(STORAGE_KEYS.AUTH, 'true');

    if (role === 'lecturer') {
      setActiveTab('supervisor');
    } else if (role === 'admin') {
      setActiveTab('telemetry');
    } else {
      setActiveTab('labs');
    }

    try {
      sounds.playApplePaySuccess();
    } catch {}

    addToast('Authenticated', `Signed in as ${user.name} [${role.toUpperCase()}]`, 'success');
    addAuditLog('User Login', `Quick demo login as ${user.name} (${role})`, 'system');
  };

  // Standard Login Authentication
  const login = (credentials: { identifier: string; password?: string; role?: UserRole }) => {
    const idClean = credentials.identifier.trim().toLowerCase();
    
    // Match against usersRecord by email, matric/staff ID, name, id, or direct alias (student, staff, officer)
    let matching = Object.values(usersRecord).find((u) => 
      u.email.toLowerCase() === idClean || 
      u.matricOrStaffId.toLowerCase() === idClean ||
      u.name.toLowerCase() === idClean ||
      u.id.toLowerCase() === idClean ||
      (idClean === 'student' && u.role === 'student') ||
      ((idClean === 'staff' || idClean === 'lecturer') && u.role === 'lecturer') ||
      ((idClean === 'officer' || idClean === 'admin') && u.role === 'admin')
    );

    // If no exact match and role was provided, match against default persona for that role
    if (!matching && credentials.role) {
      matching = USERS[credentials.role];
    }

    if (!matching) {
      return { 
        success: false, 
        message: 'No account found matching this Matric Number or Institutional Email. Please register.' 
      };
    }

    // Role verification
    if (credentials.role && matching.role !== credentials.role) {
      return { 
        success: false, 
        message: `Account is registered as [${matching.role.toUpperCase()}]. Please select the ${matching.role.toUpperCase()} tab above to sign in.` 
      };
    }

    // Password verification
    if (matching.password && credentials.password && matching.password !== credentials.password) {
      return { 
        success: false, 
        message: 'Invalid password. Please check your credentials and try again.' 
      };
    }

    setCurrentUser(matching);
    setCurrentRole(matching.role);
    setIsAuthenticated(true);
    localStorage.setItem(STORAGE_KEYS.ROLE, matching.role);
    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(matching));
    localStorage.setItem(STORAGE_KEYS.AUTH, 'true');

    if (matching.role === 'lecturer') {
      setActiveTab('supervisor');
    } else if (matching.role === 'admin') {
      setActiveTab('telemetry');
    } else {
      setActiveTab('labs');
    }

    try {
      sounds.playApplePaySuccess();
    } catch {}

    addToast('Authenticated Successfully', `Welcome back, ${matching.name}!`, 'success');
    addAuditLog('User Login', `User ${matching.name} (${matching.matricOrStaffId}) authenticated via credentials.`, 'system');
    return { success: true, message: `Welcome back, ${matching.name}` };
  };

  // Sign Up New User Account
  const signup = (data: { 
    name: string; 
    role: UserRole; 
    matricOrStaffId: string; 
    email: string; 
    department: string; 
    password?: string 
  }) => {
    const cleanId = data.matricOrStaffId.trim();
    const cleanEmail = data.email.trim();

    if (!cleanId || !cleanEmail || !data.name.trim()) {
      return {
        success: false,
        message: 'Please complete all required fields.'
      };
    }

    // Check if matric or email already registered
    const exists = Object.values(usersRecord).some(
      (u) => u.matricOrStaffId.toLowerCase() === cleanId.toLowerCase() ||
             u.email.toLowerCase() === cleanEmail.toLowerCase()
    );

    if (exists) {
      return {
        success: false,
        message: 'An account with this Matric Number or Institutional Email already exists. Please log in.'
      };
    }

    const newUserId = `usr_${data.role}_${Date.now()}`;
    const newUser: UserProfile = {
      id: newUserId,
      name: data.name.trim(),
      role: data.role,
      matricOrStaffId: cleanId,
      email: cleanEmail,
      department: data.department || (data.role === 'admin' ? 'FCSIT Central Laboratory Operations Office' : 'Department of Software Engineering, FCSIT'),
      avatar: data.role === 'student'
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'
        : data.role === 'lecturer'
        ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80'
        : 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
      title: data.role === 'student' ? 'FCSIT Undergraduate' : data.role === 'lecturer' ? 'Academic Staff / Supervisor' : 'Laboratory Technical Officer',
      password: data.password
    };

    const updated = { ...usersRecord, [newUserId]: newUser };
    setUsersRecord(updated);
    localStorage.setItem(STORAGE_KEYS.USERS_LIST, JSON.stringify(updated));
    dbUpsertProfile(newUser);

    setCurrentUser(newUser);
    setCurrentRole(newUser.role);
    setIsAuthenticated(true);
    localStorage.setItem(STORAGE_KEYS.ROLE, newUser.role);
    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(newUser));
    localStorage.setItem(STORAGE_KEYS.AUTH, 'true');

    if (newUser.role === 'lecturer') {
      setActiveTab('supervisor');
    } else if (newUser.role === 'admin') {
      setActiveTab('telemetry');
    } else {
      setActiveTab('labs');
    }

    try {
      sounds.playApplePaySuccess();
    } catch {}

    addToast('Account Registered', `Welcome to LabPulse, ${newUser.name}!`, 'success');
    addAuditLog('User Registered', `New ${newUser.role.toUpperCase()} account created: ${newUser.name} (${newUser.matricOrStaffId})`, 'system');
    return { success: true, message: 'Account registered successfully.' };
  };

  // Sign Out / Logout
  const logout = () => {
    setIsAuthenticated(false);
    localStorage.setItem(STORAGE_KEYS.AUTH, 'false');
    addToast('Signed Out', 'You have been safely signed out of LabPulse.', 'info');
    addAuditLog('User Logout', `${currentUser.name} signed out of session.`, 'system');
  };

  // Helper to generate 6-character token e.g. LP-7842
  const generateTokenCode = () => {
    const num = Math.floor(1000 + Math.random() * 9000);
    return `LP-${num}`;
  };

  // Conflict Detection Engine
  const checkConflict = (roomId: string, date: string, slot: TimeSlotString, excludeBookingId?: string) => {
    const conflicting = bookings.find((b) => {
      if (excludeBookingId && b.id === excludeBookingId) return false;
      if (b.roomId !== roomId) return false;
      if (b.date !== date) return false;
      if (b.slot !== slot) return false;
      // Approved or Active slots block concurrency
      return b.status === 'Approved' || b.status === 'Active';
    });

    return {
      hasConflict: !!conflicting,
      conflictingBooking: conflicting
    };
  };

  // Create Space Booking
  const createBooking = (data: {
    roomId: string;
    date: string;
    slot: TimeSlotString;
    purpose: string;
    courseCode?: string;
    isFYP: boolean;
    supervisorName?: string;
    supervisorEmail?: string;
  }) => {
    const room = rooms.find((r) => r.id === data.roomId);
    if (!room) {
      return { success: false, message: 'Laboratory space not found.' };
    }

    // Block booking if space is under repair
    const isUnderRepair = room.status === 'Under Repair' || reports.some(r => r.type === 'SPACE' && r.targetId === room.id && r.status === 'IN REPAIR');
    if (isUnderRepair) {
      addToast('Space Under Repair', `${room.name} is currently flagged as Under Repair. Reservations are disabled.`, 'error');
      return { success: false, message: `${room.name} is currently under repair.` };
    }

    // Block booking on past dates
    const today = getTodayDateString();
    if (data.date < today) {
      addToast('Invalid Date', 'Cannot book space for a past date. Only current and future dates are allowed.', 'warning');
      return { success: false, message: 'Cannot book space for a past date.' };
    }

    // Check concurrency conflict
    const conflict = checkConflict(data.roomId, data.date, data.slot);
    if (conflict.hasConflict) {
      return { 
        success: false, 
        message: `Conflict Detected: ${room.name} is already booked by ${conflict.conflictingBooking?.userName} for ${data.slot} on ${data.date}. Join the waitlist instead!` 
      };
    }

    // Require staff approval - never auto-approved directly
    const initialStatus: BookingStatus = 'Pending Endorsement';

    const tokenCode = generateTokenCode();
    const newBooking: LabBooking = {
      id: `bk-${Date.now().toString(36)}`,
      tokenCode,
      userId: currentUser.id,
      userName: currentUser.name,
      userMatric: currentUser.matricOrStaffId,
      userEmail: currentUser.email,
      roomId: room.id,
      roomName: room.name,
      roomCode: room.code,
      date: data.date,
      slot: data.slot,
      purpose: data.purpose,
      courseCode: data.courseCode || 'General Lab Work',
      isFYP: data.isFYP,
      supervisorName: data.supervisorName || 'Academic Staff Supervisor',
      supervisorEmail: data.supervisorEmail || 'staff@um.edu.my',
      status: initialStatus,
      createdAt: new Date().toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    };

    setBookings((prev) => [newBooking, ...prev]);
    dbUpsertBooking(newBooking);

    addAuditLog(
      'Space Booking Created',
      `Booking ${tokenCode} for ${room.name} (${data.slot}) submitted. Awaiting Staff approval.`,
      'booking'
    );

    addToast('Submitted for Staff Approval', `Space reservation ${tokenCode} submitted! Awaiting Academic Staff endorsement before pass is issued.`, 'warning');

    return { success: true, message: 'Booking submitted for staff approval.', booking: newBooking };
  };

  // Endorse Booking (Lecturer)
  const endorseBooking = (bookingId: string, note?: string) => {
    let updatedBooking: LabBooking | undefined;
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          updatedBooking = {
            ...b,
            status: 'Approved',
            endorsementNote: note || `Endorsed by ${currentUser.name}`
          };
          return updatedBooking;
        }
        return b;
      })
    );
    if (updatedBooking) dbUpsertBooking(updatedBooking);

    const booking = bookings.find((b) => b.id === bookingId);
    if (booking) {
      addAuditLog(
        'Supervisor Endorsement Granted',
        `Prof. Madya Dr. Amir Rudin endorsed booking ${booking.tokenCode} for ${booking.userName}.`,
        'booking'
      );
      addToast('Booking Endorsed', `Reservation ${booking.tokenCode} has been approved and pass generated.`, 'success');
    }
  };

  // Reject Endorsement
  const rejectEndorsement = (bookingId: string, reason?: string) => {
    let updatedBooking: LabBooking | undefined;
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          updatedBooking = {
            ...b,
            status: 'Rejected',
            endorsementNote: reason || 'Decline requested by supervisor.'
          };
          return updatedBooking;
        }
        return b;
      })
    );
    if (updatedBooking) dbUpsertBooking(updatedBooking);
    const booking = bookings.find((b) => b.id === bookingId);
    addAuditLog(
      'Endorsement Declined',
      `Supervisor declined booking ${booking?.tokenCode}. Reason: ${reason || 'Capacity priority constraint'}.`,
      'booking'
    );
    addToast('Booking Declined', `Reservation declined.`, 'warning');
  };

  // Approve Booking (Admin Officer)
  const approveBooking = (bookingId: string, note?: string) => {
    const deadline = Date.now() + 15 * 60 * 1000; // 15-minute QR scan grace period timer
    let updatedBooking: LabBooking | undefined;
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          updatedBooking = {
            ...b,
            status: 'Approved',
            adminNote: note,
            checkInDeadline: deadline
          };
          return updatedBooking;
        }
        return b;
      })
    );
    if (updatedBooking) dbUpsertBooking(updatedBooking);
    const booking = bookings.find((b) => b.id === bookingId);
    addAuditLog('Admin Approval', `Lab Officer approved booking ${booking?.tokenCode}. 15-minute QR scan timer initiated.`, 'booking');
    addToast('Booking Approved', `Pass generated for ${booking?.tokenCode}. 15-min QR scan window started.`, 'success');
  };

  // Auto-cancel booking when 15-minute QR scan grace period expires
  const autoCancelExpiredBooking = (bookingId: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking || (booking.status !== 'Approved' && booking.status !== 'Pending Approval')) return;

    const updatedBooking: LabBooking = {
      ...booking,
      status: 'Cancelled',
      adminNote: 'Auto-cancelled: 15-minute check-in grace period exceeded without QR scan'
    };

    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId ? updatedBooking : b
      )
    );
    dbUpsertBooking(updatedBooking);

    addAuditLog(
      '15-Min QR Grace Period Expired',
      `Booking ${booking.tokenCode} for ${booking.userName} auto-cancelled. Slot forfeited and released to waitlist.`,
      'system'
    );

    addToast(
      'Booking Auto-Cancelled',
      `15-minute QR scan window expired for ${booking.roomName} (${booking.tokenCode}). Booking cancelled and slot released.`,
      'error'
    );

    releaseToWaitlist(bookingId);
  };

  // Reject Booking (Admin Officer)
  const rejectBooking = (bookingId: string, reason?: string) => {
    let updatedBooking: LabBooking | undefined;
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          updatedBooking = {
            ...b,
            status: 'Rejected',
            adminNote: reason || 'Lab space unavailable for scheduled maintenance.'
          };
          return updatedBooking;
        }
        return b;
      })
    );
    if (updatedBooking) dbUpsertBooking(updatedBooking);
    const booking = bookings.find((b) => b.id === bookingId);
    addAuditLog('Admin Rejection', `Lab Officer rejected booking ${booking?.tokenCode}.`, 'booking');
    addToast('Booking Rejected', `Notification sent to student.`, 'warning');
  };

  // Cancel Booking (Student)
  const cancelBooking = (bookingId: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    let updatedBooking: LabBooking | undefined;
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          updatedBooking = { ...b, status: 'Cancelled' };
          return updatedBooking;
        }
        return b;
      })
    );
    if (updatedBooking) dbUpsertBooking(updatedBooking);
    if (booking) {
      addAuditLog('Booking Cancelled', `Booking ${booking.tokenCode} cancelled by user.`, 'booking');
      addToast('Reservation Cancelled', `Slot for ${booking.roomName} released.`, 'info');
      // Check if there is someone in waitlist
      releaseToWaitlist(bookingId);
    }
  };

  // Check In Physical QR
  const checkInBooking = (tokenCodeOrId: string) => {
    const cleanToken = tokenCodeOrId.trim().toUpperCase();
    const booking = bookings.find((b) => b.tokenCode.toUpperCase() === cleanToken || b.id === tokenCodeOrId);
    
    if (!booking) {
      return { success: false, message: `No active reservation found for code ${cleanToken}.` };
    }

    if (booking.status === 'Active') {
      return { success: false, message: `Reservation ${booking.tokenCode} is ALREADY checked in and active.` };
    }

    if (booking.status !== 'Approved') {
      return { success: false, message: `Reservation ${booking.tokenCode} cannot be checked in (Status: ${booking.status}). Must be Approved.` };
    }

    const checkInTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const updated: LabBooking = { ...booking, status: 'Active', checkInTime };
    
    setBookings((prev) =>
      prev.map((b) => (b.id === booking.id ? updated : b))
    );
    dbUpsertBooking(updated);

    addAuditLog(
      'Physical QR Check-In Verified',
      `Student ${booking.userName} (${booking.userMatric}) checked into ${booking.roomName} at ${checkInTime}.`,
      'checkin'
    );

    confetti({ particleCount: 75, spread: 70, origin: { y: 0.6 } });
    addToast('QR Check-in Verified!', `Welcome, ${booking.userName}. Session active in ${booking.roomName}.`, 'success');

    return { success: true, message: `Check-in confirmed for ${booking.userName} (${booking.roomName}).`, booking: updated };
  };

  // Check Out
  const checkOutBooking = (tokenCodeOrId: string) => {
    const cleanToken = tokenCodeOrId.trim().toUpperCase();
    const booking = bookings.find((b) => b.tokenCode.toUpperCase() === cleanToken || b.id === tokenCodeOrId);

    if (!booking) {
      return { success: false, message: `Reservation not found for code ${cleanToken}.` };
    }

    const checkOutTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const updated: LabBooking = { ...booking, status: 'Completed', checkOutTime };

    setBookings((prev) =>
      prev.map((b) => (b.id === booking.id ? updated : b))
    );
    dbUpsertBooking(updated);

    addAuditLog(
      'Space Session Concluded',
      `Student ${booking.userName} checked out of ${booking.roomName} at ${checkOutTime}.`,
      'checkin'
    );

    addToast('Session Completed', `${booking.roomName} slot checked out successfully.`, 'info');
    return { success: true, message: `Check-out recorded at ${checkOutTime}.`, booking: updated };
  };

  // Mark No-Show & Forfeiture
  const markNoShow = (bookingId: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    const updated: LabBooking = { ...booking, status: 'No-Show / Forfeited' };
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? updated : b))
    );
    dbUpsertBooking(updated);

    addAuditLog(
      '15-Min Grace Period Expired',
      `Booking ${booking.tokenCode} for ${booking.userName} marked as No-Show. Slot forfeited.`,
      'system'
    );

    addToast('Slot Forfeited', `15-minute grace period lapsed for ${booking.tokenCode}. Reallocating to waitlist.`, 'warning');
    
    // Automatically trigger reallocation
    releaseToWaitlist(bookingId);
  };

  // Dynamic Reallocation to Waitlist
  const releaseToWaitlist = (bookingId: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return { success: false, message: 'Booking not found.' };

    // Find top waitlist entry for this room and date/slot
    const candidate = waitlist.find(
      (w) => w.targetId === booking.roomId && w.date === booking.date && w.status === 'waiting'
    );

    if (!candidate) {
      return { success: false, message: 'No waitlisted users currently in queue for this slot.' };
    }

    // Promote candidate
    const newTokenCode = generateTokenCode();
    const newBooking: LabBooking = {
      id: `bk-promoted-${Date.now().toString(36)}`,
      tokenCode: newTokenCode,
      userId: candidate.userId,
      userName: candidate.userName,
      userMatric: candidate.userMatric,
      userEmail: candidate.userEmail,
      roomId: booking.roomId,
      roomName: booking.roomName,
      roomCode: booking.roomCode,
      date: booking.date,
      slot: booking.slot,
      purpose: 'Waitlist Instant Reallocation Promotion',
      isFYP: false,
      status: 'Approved',
      createdAt: new Date().toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      adminNote: `Automatically promoted from Waitlist Position #${candidate.position}`
    };

    setBookings((prev) => [newBooking, ...prev]);
    dbUpsertBooking(newBooking);

    // Update waitlist entry
    const updatedCandidate: WaitlistEntry = { ...candidate, status: 'promoted' };
    setWaitlist((prev) =>
      prev.map((w) => (w.id === candidate.id ? updatedCandidate : w))
    );
    dbUpsertWaitlist(updatedCandidate);

    addAuditLog(
      'Waitlist Dynamic Promotion',
      `Promoted student ${candidate.userName} (${candidate.userMatric}) to ${booking.roomName} (${booking.slot}). Issued Pass ${newTokenCode}.`,
      'waitlist'
    );

    addToast(
      'Waitlist Candidate Promoted!',
      `${candidate.userName} awarded slot ${booking.slot}. Pass ${newTokenCode} generated.`,
      'success'
    );

    return {
      success: true,
      promotedUser: candidate.userName,
      message: `Slot instantly transferred to ${candidate.userName} (Pass: ${newTokenCode}).`
    };
  };

  // Join Waitlist
  const joinWaitlist = (targetType: 'room' | 'hardware', targetId: string, targetName: string, slotOrDetails: string, date: string) => {
    // Check if user already waiting
    const existing = waitlist.find(
      (w) => w.targetId === targetId && w.userId === currentUser.id && w.status === 'waiting'
    );

    if (existing) {
      return { success: false, message: `You are already in queue (Position #${existing.position}) for this item.` };
    }

    const currentQueueCount = waitlist.filter((w) => w.targetId === targetId && w.status === 'waiting').length;
    const newEntry: WaitlistEntry = {
      id: `wt-${Date.now().toString(36)}`,
      targetType,
      targetId,
      targetName,
      slotOrDetails,
      date,
      userId: currentUser.id,
      userName: currentUser.name,
      userMatric: currentUser.matricOrStaffId,
      userEmail: currentUser.email,
      position: currentQueueCount + 1,
      status: 'waiting',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })
    };

    setWaitlist((prev) => [...prev, newEntry]);
    dbUpsertWaitlist(newEntry);

    addAuditLog(
      'Waitlist Joined',
      `${currentUser.name} joined waitlist for ${targetName} at Position #${newEntry.position}.`,
      'waitlist'
    );

    addToast('Added to Waitlist', `You are #${newEntry.position} in line. You will be notified when a slot opens!`, 'info');

    return { success: true, message: `Joined waitlist at position #${newEntry.position}`, entry: newEntry };
  };

  // Leave Waitlist
  const leaveWaitlist = (waitlistId: string) => {
    setWaitlist((prev) => prev.filter((w) => w.id !== waitlistId));
    dbDeleteWaitlist(waitlistId);
    addToast('Removed from Waitlist', 'Your queue reservation has been dropped.', 'info');
  };

  // Request Hardware Loan
  const requestLoan = (data: {
    hardwareId: string;
    purpose: string;
    dueDate: string;
    requestDate?: string;
  }) => {
    const item = hardware.find((h) => h.id === data.hardwareId);
    if (!item) return { success: false, message: 'Hardware item not found.' };

    // Block loan if hardware is under repair / maintenance
    const isUnderRepair = item.status === 'Under Maintenance' || reports.some(r => r.type === 'HARDWARE' && r.targetId === item.id && r.status === 'IN REPAIR');
    if (isUnderRepair) {
      addToast('Asset Under Repair', `${item.name} is currently flagged as Under Repair. Loan applications are disabled.`, 'error');
      return { success: false, message: `${item.name} is currently under repair.` };
    }

    // Block loans on past dates
    const today = getTodayDateString();
    const reqDate = data.requestDate || today;
    if (reqDate < today || data.dueDate < today) {
      addToast('Invalid Date', 'Cannot request hardware loans for past dates. Only current and future dates are allowed.', 'warning');
      return { success: false, message: 'Cannot request hardware loans for past dates.' };
    }

    if (item.availableUnits <= 0) {
      return { success: false, message: `${item.name} is currently out of stock. Join waitlist instead!` };
    }

    const tokenCode = generateTokenCode();
    const newLoan: HardwareLoan = {
      id: `loan-${Date.now().toString(36)}`,
      tokenCode,
      userId: currentUser.id,
      userName: currentUser.name,
      userMatric: currentUser.matricOrStaffId,
      hardwareId: item.id,
      hardwareName: item.name,
      hardwareTag: item.tag,
      serialNumber: item.serialNumber,
      requestDate: data.requestDate || getTodayDateString(),
      dueDate: data.dueDate,
      purpose: data.purpose,
      status: 'Pending Approval',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })
    };

    setLoans((prev) => [newLoan, ...prev]);
    dbUpsertLoan(newLoan);

    addAuditLog(
      'Hardware Loan Requested',
      `${currentUser.name} requested loan for ${item.name} (SN: ${item.serialNumber}). Token: ${tokenCode}. Awaiting Staff approval.`,
      'hardware'
    );

    addToast('Submitted for Staff Approval', `Hardware loan token ${tokenCode} submitted. Awaiting Academic Staff approval.`, 'warning');

    return { success: true, message: 'Loan request submitted for staff approval.', loan: newLoan };
  };

  // Approve Hardware Loan (Officer)
  const approveLoan = (loanId: string) => {
    let updatedLoan: HardwareLoan | undefined;
    setLoans((prev) =>
      prev.map((l) => {
        if (l.id === loanId) {
          updatedLoan = { ...l, status: 'Active / Issued' };
          return updatedLoan;
        }
        return l;
      })
    );
    if (updatedLoan) dbUpsertLoan(updatedLoan);

    const loan = loans.find((l) => l.id === loanId);
    if (loan) {
      // Decrement available units
      let updatedHw: HardwareItem | undefined;
      setHardware((prev) =>
        prev.map((h) => {
          if (h.id === loan.hardwareId) {
            updatedHw = { ...h, availableUnits: Math.max(0, h.availableUnits - 1) };
            return updatedHw;
          }
          return h;
        })
      );
      if (updatedHw) dbUpsertHardware(updatedHw);

      addAuditLog('Hardware Loan Approved', `Loan ${loan.tokenCode} approved for ${loan.userName}.`, 'hardware');
      addToast('Loan Approved', `Hardware issued to ${loan.userName}.`, 'success');
    }
  };

  // Reject Hardware Loan
  const rejectLoan = (loanId: string, reason?: string) => {
    let updatedLoan: HardwareLoan | undefined;
    setLoans((prev) =>
      prev.map((l) => {
        if (l.id === loanId) {
          updatedLoan = { ...l, status: 'Rejected', auditNotes: reason };
          return updatedLoan;
        }
        return l;
      })
    );
    if (updatedLoan) dbUpsertLoan(updatedLoan);

    const loan = loans.find((l) => l.id === loanId);
    addAuditLog('Hardware Loan Rejected', `Loan ${loan?.tokenCode} rejected: ${reason || 'Incomplete details'}`, 'hardware');
    addToast('Loan Request Rejected', `Notification dispatched to student.`, 'warning');
  };

  // Physical Verification & Checklist on Issue
  const verifyAndIssueLoan = (
    tokenCodeOrId: string,
    checklist: { chassisIntact: boolean; accessoriesIncluded: boolean; powersOnWithoutError: boolean },
    notes?: string
  ) => {
    const cleanToken = tokenCodeOrId.trim().toUpperCase();
    const loan = loans.find((l) => l.tokenCode.toUpperCase() === cleanToken || l.id === tokenCodeOrId);

    if (!loan) return { success: false, message: `Loan not found for token ${cleanToken}.` };

    if (!checklist.chassisIntact || !checklist.accessoriesIncluded || !checklist.powersOnWithoutError) {
      return {
        success: false,
        message: 'Physical Inspection Incomplete! All mandatory safety checklist items must pass before issuing.'
      };
    }

    let updatedLoan: HardwareLoan | undefined;
    setLoans((prev) =>
      prev.map((l) => {
        if (l.id === loan.id) {
          updatedLoan = {
            ...l,
            status: 'Active / Issued',
            checklist,
            conditionOut: 'Full pre-issue audit passed: Chassis intact, accessories verified, powers on without error.',
            auditNotes: notes
          };
          return updatedLoan;
        }
        return l;
      })
    );
    if (updatedLoan) dbUpsertLoan(updatedLoan);

    // Update Hardware item
    let updatedHw: HardwareItem | undefined;
    setHardware((prev) =>
      prev.map((h) => {
        if (h.id === loan.hardwareId) {
          const newAvailable = Math.max(0, h.availableUnits - 1);
          updatedHw = {
            ...h,
            availableUnits: newAvailable,
            status: newAvailable === 0 ? 'On Loan' : h.status,
            currentBorrower: {
              name: loan.userName,
              matric: loan.userMatric,
              dueDate: loan.dueDate
            }
          };
          return updatedHw;
        }
        return h;
      })
    );
    if (updatedHw) dbUpsertHardware(updatedHw);

    addAuditLog(
      'Hardware Checklist Completed & Issued',
      `Officer En. Faizal verified Token ${loan.tokenCode} and issued ${loan.hardwareName} to ${loan.userName} (${loan.userMatric}).`,
      'hardware'
    );

    confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
    addToast('Hardware Successfully Issued!', `Passport updated for ${loan.hardwareTag}.`, 'success');

    return { success: true, message: `Hardware ${loan.hardwareName} successfully issued to ${loan.userName}!` };
  };

  // Process Hardware Return & Audit Checklist
  const processReturn = (
    tokenCodeOrId: string,
    returnCondition: 'Excellent' | 'Good' | 'Minor Scratches' | 'Needs Service',
    checklist: { chassisIntact: boolean; accessoriesIncluded: boolean; powersOnWithoutError: boolean },
    defectNotes?: string
  ) => {
    const cleanToken = tokenCodeOrId.trim().toUpperCase();
    const loan = loans.find((l) => l.tokenCode.toUpperCase() === cleanToken || l.id === tokenCodeOrId);

    if (!loan) return { success: false, message: `Loan record not found for ${cleanToken}.` };

    let updatedLoan: HardwareLoan | undefined;
    setLoans((prev) =>
      prev.map((l) => {
        if (l.id === loan.id) {
          updatedLoan = {
            ...l,
            status: 'Returned',
            conditionIn: `Return condition: ${returnCondition}. Checklist: ${JSON.stringify(checklist)}`,
            auditNotes: defectNotes
          };
          return updatedLoan;
        }
        return l;
      })
    );
    if (updatedLoan) dbUpsertLoan(updatedLoan);

    // Update Hardware unit health and history
    let updatedHw: HardwareItem | undefined;
    setHardware((prev) =>
      prev.map((h) => {
        if (h.id === loan.hardwareId) {
          const newUnits = Math.min(h.totalUnits, h.availableUnits + 1);
          let newHealth = h.healthPercentage;
          if (returnCondition === 'Minor Scratches') newHealth = Math.max(70, h.healthPercentage - 3);
          if (returnCondition === 'Needs Service') newHealth = Math.max(40, h.healthPercentage - 15);

          const updatedDefects = defectNotes?.trim()
            ? [
                {
                  id: `def-${Date.now()}`,
                  date: getTodayDateString(),
                  issue: defectNotes,
                  reportedBy: `Audit Return (${currentUser.name})`,
                  severity: (returnCondition === 'Needs Service' ? 'Moderate' : 'Minor') as 'Minor' | 'Moderate' | 'Critical',
                  status: 'Investigating' as const
                },
                ...h.defects
              ]
            : h.defects;

          const updatedHistory = [
            {
              id: `hist-${Date.now()}`,
              borrower: loan.userName,
              matric: loan.userMatric,
              fromDate: loan.requestDate,
              toDate: getTodayDateString(),
              returnCondition,
              notes: defectNotes || 'Clean return'
            },
            ...h.loanHistory
          ];

          updatedHw = {
            ...h,
            availableUnits: newUnits,
            healthPercentage: newHealth,
            status: returnCondition === 'Needs Service' ? 'Under Maintenance' : 'Available',
            currentBorrower: undefined,
            defects: updatedDefects,
            loanHistory: updatedHistory
          };
          return updatedHw;
        }
        return h;
      })
    );
    if (updatedHw) dbUpsertHardware(updatedHw);

    addAuditLog(
      'Hardware Return Audit Completed',
      `Item ${loan.hardwareName} (Token: ${loan.tokenCode}) checked in. Condition: ${returnCondition}.`,
      'hardware'
    );

    addToast('Hardware Checked In', `Digital Equipment Passport for ${loan.hardwareTag} updated.`, 'success');

    return { success: true, message: `Item ${loan.hardwareName} returned and restocked.` };
  };

  // Report Defect on Hardware Passport
  const reportDefect = (hardwareId: string, issue: string, severity: 'Minor' | 'Moderate' | 'Critical') => {
    setHardware((prev) =>
      prev.map((h) => {
        if (h.id === hardwareId) {
          const penalty = severity === 'Critical' ? 25 : severity === 'Moderate' ? 12 : 5;
          const newHealth = Math.max(20, h.healthPercentage - penalty);
          return {
            ...h,
            healthPercentage: newHealth,
            status: severity === 'Critical' ? 'Under Maintenance' : h.status,
            defects: [
              {
                id: `def-${Date.now()}`,
                date: getTodayDateString(),
                issue,
                reportedBy: `${currentUser.name} (${currentUser.role})`,
                severity,
                status: 'Investigating'
              },
              ...h.defects
            ]
          };
        }
        return h;
      })
    );

    const item = hardware.find((h) => h.id === hardwareId);
    addAuditLog('Defect Flagged in Passport', `Reported on ${item?.name}: "${issue}" (${severity})`, 'hardware');
    addToast('Defect Logged', `Digital passport updated with incident report.`, 'warning');
  };

  // Update Hardware Defect Status
  const updateHardwareDefectStatus = (hardwareId: string, defectId: string, status: 'Investigating' | 'Pending Parts' | 'Resolved') => {
    setHardware((prev) =>
      prev.map((h) => {
        if (h.id === hardwareId) {
          return {
            ...h,
            defects: h.defects.map((d) => (d.id === defectId ? { ...d, status } : d))
          };
        }
        return h;
      })
    );
    addToast('Defect Status Updated', `Defect report status marked as "${status}".`, 'info');
  };

  // Report Space Issue
  const addRoomReport = (data: {
    roomId: string;
    title: string;
    description: string;
    category: 'Air Conditioning' | 'Projector & AV' | 'Workstations & PCs' | 'Electrical & Power' | 'Cleanliness' | 'Network & Wi-Fi' | 'Other';
    severity: 'Minor' | 'Moderate' | 'Critical';
  }) => {
    const newReport: RoomReportRecord = {
      id: `rep-${Date.now().toString(36)}`,
      roomId: data.roomId,
      date: getTodayDateString(),
      title: data.title,
      description: data.description,
      category: data.category,
      severity: data.severity,
      status: 'Open',
      reportedBy: currentUser.name,
      reporterMatric: currentUser.matricOrStaffId
    };

    setRooms((prev) =>
      prev.map((r) => {
        if (r.id === data.roomId) {
          return {
            ...r,
            reports: [newReport, ...(r.reports || [])]
          };
        }
        return r;
      })
    );

    const room = rooms.find((r) => r.id === data.roomId);
    addAuditLog('Space Issue Reported', `${currentUser.name} reported "${data.title}" for ${room?.name} (${data.severity})`, 'booking');
    addToast('Report Submitted', `Incident logged for ${room?.name}. FCSIT technical team notified.`, 'success');
  };

  // Update Room Report Status (e.g. In Progress, Resolved)
  const updateRoomReportStatus = (roomId: string, reportId: string, status: 'Open' | 'In Progress' | 'Resolved', notes?: string) => {
    setRooms((prev) =>
      prev.map((r) => {
        if (r.id === roomId) {
          return {
            ...r,
            reports: (r.reports || []).map((rep) =>
              rep.id === reportId ? { ...rep, status, resolutionNotes: notes || rep.resolutionNotes } : rep
            )
          };
        }
        return r;
      })
    );
    addToast('Report Updated', `Report status changed to "${status}".`, 'info');
  };

  // Notifications Methods
  const unreadNotificationsCount = notifications.filter((n) => {
    if (n.isRead) return false;
    if (n.targetRole && n.targetRole !== currentRole) return false;
    return true;
  }).length;

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => (n.targetRole && n.targetRole !== currentRole ? n : { ...n, isRead: true }))
    );
    addToast('All Caught Up', 'All notifications marked as read.', 'info');
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Helper to parse a slot's end time (e.g. "08:00 am - 08:30 am" or "10:00 - 12:00") with YYYY-MM-DD
  const parseSlotEndTimeToDate = (dateStr: string, slotStr: string): Date | null => {
    try {
      const parts = slotStr.split('-');
      if (parts.length < 2) return null;
      const endPart = parts[1].trim().toLowerCase();
      const isPM = endPart.includes('pm');
      const isAM = endPart.includes('am');
      const cleanNumbers = endPart.replace(/[a-z]/g, '').trim();
      const [hStr, mStr] = cleanNumbers.split(':');
      let hours = parseInt(hStr, 10);
      const minutes = mStr ? parseInt(mStr, 10) : 0;
      if (isPM && hours < 12) hours += 12;
      if (isAM && hours === 12) hours = 0;

      const [yStr, monStr, dayStr] = dateStr.split('-');
      const y = parseInt(yStr, 10);
      const m = parseInt(monStr, 10) - 1;
      const d = parseInt(dayStr, 10);

      return new Date(y, m, d, hours, minutes, 0);
    } catch {
      return null;
    }
  };

  // Helper to parse a hardware due date (YYYY-MM-DD) assuming standard 5:00 PM return close
  const parseDueDateToDate = (dueDateStr: string): Date | null => {
    try {
      const [yStr, monStr, dayStr] = dueDateStr.split('-');
      const y = parseInt(yStr, 10);
      const m = parseInt(monStr, 10) - 1;
      const d = parseInt(dayStr, 10);
      return new Date(y, m, d, 17, 0, 0); // 5:00 PM
    } catch {
      return null;
    }
  };

  // Automated Real-Time Reminder Engine:
  // 1. Sends reminder message when it is 15 minutes before space check-out time
  // 2. Sends reminder message when it is 1 day before hardware return date
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const newNotifications: PulseNotification[] = [];
      const newSentKeys: string[] = [];

      // 1. CHECK ACTIVE & APPROVED SPACE BOOKINGS (15 mins before checkout)
      bookings.forEach((booking) => {
        if (booking.status !== 'Active' && booking.status !== 'Approved') return;
        const checkoutDate = parseSlotEndTimeToDate(booking.date, booking.slot);
        if (!checkoutDate) return;

        const diffMinutes = (checkoutDate.getTime() - now.getTime()) / (60 * 1000);
        const reminderKey = `space-checkout-15m-${booking.id}`;

        // Triggers when 15 minutes before checkout (15 to -5 mins)
        if (diffMinutes <= 15 && diffMinutes >= -5 && !sentReminders.has(reminderKey)) {
          newSentKeys.push(reminderKey);

          const timeDisplay = checkoutDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const notif: PulseNotification = {
            id: `notif-space-15m-${booking.id}-${Date.now()}`,
            category: 'SPACE CHECK-OUT',
            type: 'space',
            title: 'Approaching Session Check-Out (15 Mins Remaining)',
            severityTag: '[CHECK-OUT IN 15 MINS]',
            severityColor: 'amber',
            identifier: `${booking.roomName} (${booking.roomCode})`,
            dueOrEndTime: `Concludes at ${timeDisplay} (${Math.max(1, Math.round(diffMinutes))} mins remaining)`,
            locationOrDesk: 'Laboratory Turnstile & Exit Scanner',
            instruction: `Your reservation for ${booking.roomName} concludes in 15 minutes. Please begin wrapping up your work, tidy test equipment, and scan your exit QR code at the turnstile.`,
            actionLabel: '[VIEW CHECKOUT QR PASS]',
            actionTab: 'my-passes',
            targetRole: booking.userId === currentUser.id ? currentRole : undefined,
            timestamp: 'JUST NOW',
            isRead: false
          };

          newNotifications.push(notif);
          if (booking.userId === currentUser.id) {
            addToast(
              'Space Check-Out Reminder',
              `Your reservation for ${booking.roomName} concludes in 15 minutes (${timeDisplay}). Please prepare to scan checkout QR.`,
              'warning'
            );
            sounds.playApplePaySuccess();
          }
        }
      });

      // 2. CHECK ACTIVE HARDWARE LOANS (1 day before return date)
      loans.forEach((loan) => {
        if (loan.status !== 'Active / Issued') return;
        const dueDate = parseDueDateToDate(loan.dueDate);
        if (!dueDate) return;

        const diffHours = (dueDate.getTime() - now.getTime()) / (60 * 60 * 1000);
        const reminderKey = `hw-return-1d-${loan.id}`;

        // Triggers when 1 day before due date (within 24 hours of due date)
        if (diffHours <= 24 && diffHours >= -12 && !sentReminders.has(reminderKey)) {
          newSentKeys.push(reminderKey);

          const notif: PulseNotification = {
            id: `notif-hw-1d-${loan.id}-${Date.now()}`,
            category: 'HARDWARE LOAN',
            type: 'hardware',
            title: 'Hardware Return Reminder (Due in 1 Day)',
            severityTag: '[DUE TOMORROW]',
            severityColor: 'rose',
            identifier: `${loan.hardwareName} (Tag: ${loan.hardwareTag}, SN: ${loan.serialNumber})`,
            dueOrEndTime: `Due tomorrow, ${loan.dueDate} by 05:00 PM`,
            locationOrDesk: 'FCSIT Technical Admin Counter & Locker Station',
            instruction: `${loan.hardwareName} is due for return in 1 day (${loan.dueDate}). Please return all components and accessories to the FCSIT counter or scan the locker QR code to avoid overdue demerits.`,
            actionLabel: '[VIEW RETURN QR PASS]',
            actionTab: 'my-passes',
            targetRole: loan.userId === currentUser.id ? currentRole : undefined,
            timestamp: 'JUST NOW',
            isRead: false
          };

          newNotifications.push(notif);
          if (loan.userId === currentUser.id) {
            addToast(
              'Hardware Due Tomorrow',
              `${loan.hardwareName} is due for return in 1 day (${loan.dueDate}).`,
              'error'
            );
            sounds.playApplePaySuccess();
          }
        }
      });

      if (newSentKeys.length > 0) {
        setSentReminders((prev) => {
          const updated = new Set(prev);
          newSentKeys.forEach((k) => updated.add(k));
          return updated;
        });
      }

      if (newNotifications.length > 0) {
        setNotifications((prev) => [...newNotifications, ...prev]);
      }
    };

    checkReminders();
    const interval = setInterval(checkReminders, 10000);
    return () => clearInterval(interval);
  }, [bookings, loans, currentUser, currentRole, sentReminders]);

  // Explicit Trigger: 15-Minute Space Checkout Reminder
  const trigger15MinSpaceReminder = (targetBookingId?: string) => {
    const target = (targetBookingId && bookings.find((b) => b.id === targetBookingId)) ||
      bookings.find((b) => b.userId === currentUser.id && (b.status === 'Active' || b.status === 'Approved')) ||
      bookings[0];

    const roomName = target?.roomName || 'Micro Lab [MM1]';
    const roomCode = target?.roomCode || 'MM1';
    const timeDisplay = new Date(Date.now() + 15 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const notif: PulseNotification = {
      id: `notif-space-15m-manual-${Date.now()}`,
      category: 'SPACE CHECK-OUT',
      type: 'space',
      title: 'Approaching Session Check-Out (15 Mins Remaining)',
      severityTag: '[CHECK-OUT IN 15 MINS]',
      severityColor: 'amber',
      identifier: `${roomName} (${roomCode})`,
      dueOrEndTime: `Concludes at ${timeDisplay} (in 15 mins)`,
      locationOrDesk: 'Laboratory Entrance Turnstile Station',
      instruction: `Your reservation for ${roomName} concludes in 15 minutes. Please begin packing up, tidy test equipment, and scan checkout QR at the turnstile.`,
      actionLabel: '[VIEW CHECKOUT PASS]',
      actionTab: 'my-passes',
      targetRole: currentRole,
      timestamp: 'JUST NOW',
      isRead: false
    };

    setNotifications((prev) => [notif, ...prev]);
    addToast('15-Min Space Reminder Sent', `Check-out reminder dispatched for ${roomName} (Concludes at ${timeDisplay}).`, 'warning');
    sounds.playApplePaySuccess();
  };

  // Explicit Trigger: 1-Day Hardware Return Reminder
  const trigger1DayHardwareReminder = (targetLoanId?: string) => {
    const target = (targetLoanId && loans.find((l) => l.id === targetLoanId)) ||
      loans.find((l) => l.userId === currentUser.id && l.status === 'Active / Issued') ||
      loans[0];

    const hwName = target?.hardwareName || 'NVIDIA Jetson Orin Nano Developer Kit (8GB)';
    const hwTag = target?.hardwareTag || 'FCSIT-HW-JET-01';
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const notif: PulseNotification = {
      id: `notif-hw-1d-manual-${Date.now()}`,
      category: 'HARDWARE LOAN',
      type: 'hardware',
      title: 'Hardware Return Reminder (Due in 1 Day)',
      severityTag: '[DUE TOMORROW]',
      severityColor: 'rose',
      identifier: `${hwName} (Tag: ${hwTag})`,
      dueOrEndTime: `Due tomorrow, ${tomorrowStr} by 05:00 PM`,
      locationOrDesk: 'FCSIT Technical Admin Counter & Locker Station',
      instruction: `${hwName} is due for return in 1 day. Please ensure all accessories and power units are packed, and scan the return QR code before 05:00 PM.`,
      actionLabel: '[VIEW RETURN QR PASS]',
      actionTab: 'my-passes',
      targetRole: currentRole,
      timestamp: 'JUST NOW',
      isRead: false
    };

    setNotifications((prev) => [notif, ...prev]);
    addToast('1-Day Return Reminder Sent', `Hardware return reminder dispatched for ${hwName} (Due tomorrow).`, 'error');
    sounds.playApplePaySuccess();
  };

  const simulate10MinWarning = () => trigger15MinSpaceReminder();
  const simulateDueHardware = () => trigger1DayHardwareReminder();

  const clearAllNotifications = () => {
    setNotifications([]);
    setSentReminders(new Set());
    addToast('Notifications Cleared', 'All notification records have been cleared.', 'info');
  };

  // Maintenance & Defect Reports Management
  const submitMaintenanceReport = useCallback(
    (data: {
      type: 'SPACE' | 'HARDWARE';
      targetId: string;
      targetName: string;
      targetCodeOrTag: string;
      specificLocation?: string;
      serialNumber?: string;
      category: SpaceRepairCategory | HardwareDefectCategory;
      description: string;
      photoUrl?: string;
    }) => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const dateStr = now.toISOString().split('T')[0];
      const timestamp = `${dateStr} ${timeStr}`;
      const reportNum = Math.floor(1000 + Math.random() * 9000);
      const reportId = `REP-${reportNum}`;

      const newReport: MaintenanceReport = {
        id: reportId,
        timestamp,
        type: data.type,
        targetId: data.targetId,
        targetName: data.targetName,
        targetCodeOrTag: data.targetCodeOrTag,
        specificLocation: data.specificLocation,
        serialNumber: data.serialNumber,
        category: data.category,
        description: data.description,
        photoUrl: data.photoUrl,
        reportedBy: currentUser.name,
        reporterMatric: currentUser.matricOrStaffId,
        reporterRole: currentUser.role,
        reporterEmail: currentUser.email,
        status: 'PENDING'
      };

      setReports((prev) => [newReport, ...prev]);
      dbUpsertReport(newReport);

      // If hardware defect, reflect on the hardware profile and append defect entry
      if (data.type === 'HARDWARE') {
        let updatedHw: HardwareItem | undefined;
        setHardware((prev) =>
          prev.map((h) => {
            if (h.id === data.targetId) {
              const newDefect = {
                id: `def-${Date.now()}`,
                date: dateStr,
                issue: data.description,
                reportedBy: `${currentUser.name} (${currentUser.matricOrStaffId})`,
                severity: 'Moderate' as const,
                status: 'Investigating' as const
              };
              updatedHw = {
                ...h,
                healthPercentage: Math.max(50, h.healthPercentage - 10),
                defects: [newDefect, ...(h.defects || [])]
              };
              return updatedHw;
            }
            return h;
          })
        );
        if (updatedHw) dbUpsertHardware(updatedHw);
      }

      addToast(
        'Defect Report Filed',
        `Ticket ${reportId} submitted for ${data.targetName}. Officers notified.`,
        'success'
      );

      addAuditLog(
        `Defect Report Submitted (${data.type})`,
        `Logged ticket ${reportId} for ${data.targetName} (${data.category}) by ${currentUser.name}`,
        'system'
      );

      return { success: true, reportId };
    },
    [currentUser, addToast, addAuditLog]
  );

  const updateReportStatus = useCallback(
    (reportId: string, status: ReportStatus, officerNotes?: string) => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const dateStr = now.toISOString().split('T')[0];
      const timestamp = `${dateStr} ${timeStr}`;

      let updatedReport: MaintenanceReport | undefined;
      setReports((prev) =>
        prev.map((r) => {
          if (r.id === reportId) {
            updatedReport = {
              ...r,
              status,
              officerNotes: officerNotes !== undefined ? officerNotes : r.officerNotes,
              resolvedAt: status === 'RESOLVED' ? timestamp : r.resolvedAt
            };
            return updatedReport;
          }
          return r;
        })
      );
      if (updatedReport) dbUpsertReport(updatedReport);

      // Automatically synchronize physical asset state
      const targetReport = reports.find((r) => r.id === reportId);
      if (targetReport) {
        if (targetReport.type === 'SPACE') {
          let updatedRoom: LabRoom | undefined;
          if (status === 'IN REPAIR') {
            setRooms((prev) =>
              prev.map((rm) => {
                if (rm.id === targetReport.targetId) {
                  updatedRoom = { ...rm, status: 'Under Repair' };
                  return updatedRoom;
                }
                return rm;
              })
            );
          } else if (status === 'RESOLVED' || status === 'DISMISSED') {
            setRooms((prev) =>
              prev.map((rm) => {
                if (rm.id === targetReport.targetId) {
                  updatedRoom = { ...rm, status: 'Available' };
                  return updatedRoom;
                }
                return rm;
              })
            );
          }
          if (updatedRoom) dbUpsertRoom(updatedRoom);
        } else if (targetReport.type === 'HARDWARE') {
          let updatedHw: HardwareItem | undefined;
          if (status === 'IN REPAIR') {
            setHardware((prev) =>
              prev.map((h) => {
                if (h.id === targetReport.targetId) {
                  updatedHw = { ...h, status: 'Under Maintenance' };
                  return updatedHw;
                }
                return h;
              })
            );
          } else if (status === 'RESOLVED' || status === 'DISMISSED') {
            setHardware((prev) =>
              prev.map((h) => {
                if (h.id === targetReport.targetId) {
                  updatedHw = { ...h, status: 'Available' };
                  return updatedHw;
                }
                return h;
              })
            );
          }
          if (updatedHw) dbUpsertHardware(updatedHw);
        }
      }

      addToast('Report Status Updated', `Ticket ${reportId} set to [${status}].`, 'info');
      addAuditLog('Maintenance Report Updated', `Ticket ${reportId} updated to [${status}] by ${currentUser.name}`, 'system');
    },
    [currentUser, reports, addToast, addAuditLog]
  );

  const flagHardwareFromReport = useCallback(
    (reportId: string) => {
      const report = reports.find((r) => r.id === reportId);
      if (!report || report.type !== 'HARDWARE') return;

      let updatedHw: HardwareItem | undefined;
      setHardware((prev) =>
        prev.map((h) => {
          if (h.id === report.targetId) {
            updatedHw = {
              ...h,
              status: 'Under Maintenance',
              healthPercentage: Math.max(40, h.healthPercentage - 20)
            };
            return updatedHw;
          }
          return h;
        })
      );
      if (updatedHw) dbUpsertHardware(updatedHw);

      updateReportStatus(reportId, 'IN REPAIR', 'Device quarantined and marked Under Maintenance in equipment passport.');
      addToast('Passport Flagged', `Asset ${report.targetCodeOrTag} flagged Under Maintenance in hardware database.`, 'warning');
    },
    [reports, updateReportStatus, addToast]
  );

  const flagSpaceFromReport = useCallback(
    (reportId: string) => {
      const report = reports.find((r) => r.id === reportId);
      if (!report || report.type !== 'SPACE') return;

      let updatedRoom: LabRoom | undefined;
      setRooms((prev) =>
        prev.map((rm) => {
          if (rm.id === report.targetId) {
            updatedRoom = { ...rm, status: 'Under Repair' };
            return updatedRoom;
          }
          return rm;
        })
      );
      if (updatedRoom) dbUpsertRoom(updatedRoom);

      updateReportStatus(reportId, 'IN REPAIR', 'Facility marked Under Repair. Space reservations suspended.');
      addToast('Space Flagged Under Repair', `Facility ${report.targetName} flagged Under Repair. Bookings disabled.`, 'warning');
    },
    [reports, updateReportStatus, addToast]
  );

  // Reset to Demo Data
  const resetToDemoData = () => {
    localStorage.removeItem(STORAGE_KEYS.ROOMS);
    localStorage.removeItem(STORAGE_KEYS.HARDWARE);
    localStorage.removeItem(STORAGE_KEYS.BOOKINGS);
    localStorage.removeItem(STORAGE_KEYS.LOANS);
    localStorage.removeItem(STORAGE_KEYS.WAITLIST);
    localStorage.removeItem(STORAGE_KEYS.AUDIT);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    localStorage.removeItem(STORAGE_KEYS.REPORTS);
    localStorage.removeItem(STORAGE_KEYS.ROLE);

    setRooms(INITIAL_ROOMS);
    setHardware(INITIAL_HARDWARE);
    setBookings(INITIAL_BOOKINGS);
    setLoans(INITIAL_LOANS);
    setWaitlist(INITIAL_WAITLIST);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setReports(INITIAL_MAINTENANCE_REPORTS);
    setCurrentRole('student');
    setActiveTab('labs');

    addToast('Demo Data Reset', 'All laboratories, hardware passports, bookings, and logs restored to initial UM seed state.', 'info');
  };

  return (
    <LabPulseContext.Provider
      value={{
        currentUser,
        currentRole,
        switchRole,
        users: usersRecord,
        isAuthenticated,
        login,
        signup,
        logout,
        quickLogin,
        activeTab,
        setActiveTab,
        rooms,
        hardware,
        bookings,
        loans,
        waitlist,
        auditLogs,
        toasts,
        addToast,
        removeToast,
        createBooking,
        checkConflict,
        endorseBooking,
        rejectEndorsement,
        approveBooking,
        rejectBooking,
        cancelBooking,
        autoCancelExpiredBooking,
        checkInBooking,
        checkOutBooking,
        markNoShow,
        releaseToWaitlist,
        requestLoan,
        approveLoan,
        rejectLoan,
        verifyAndIssueLoan,
        processReturn,
        reportDefect,
        updateHardwareDefectStatus,
        addRoomReport,
        updateRoomReportStatus,
        joinWaitlist,
        leaveWaitlist,
        notifications,
        unreadNotificationsCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        dismissNotification,
        simulate10MinWarning,
        simulateDueHardware,
        trigger15MinSpaceReminder,
        trigger1DayHardwareReminder,
        clearAllNotifications,
        reports,
        pendingReportsCount,
        isReportModalOpen,
        setIsReportModalOpen,
        reportModalInitialMode,
        reportModalTargetId,
        openReportModal,
        closeReportModal,
        submitMaintenanceReport,
        updateReportStatus,
        flagHardwareFromReport,
        flagSpaceFromReport,
        resetToDemoData,
        addAuditLog
      }}
    >
      {children}
    </LabPulseContext.Provider>
  );
};

export const useLabPulse = () => {
  const context = useContext(LabPulseContext);
  if (!context) {
    throw new Error('useLabPulse must be used within a LabPulseProvider');
  }
  return context;
};


import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import confetti from 'canvas-confetti';
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
  LoanStatus
} from '../types';
import { 
  USERS, 
  INITIAL_ROOMS, 
  INITIAL_HARDWARE, 
  INITIAL_BOOKINGS, 
  INITIAL_LOANS, 
  INITIAL_WAITLIST, 
  INITIAL_AUDIT_LOGS,
  getTodayDateString 
} from '../data/initialData';

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
  checkInBooking: (tokenCodeOrId: string) => { success: boolean; message: string; booking?: LabBooking };
  checkOutBooking: (tokenCodeOrId: string) => { success: boolean; message: string; booking?: LabBooking };
  markNoShow: (bookingId: string) => void;
  releaseToWaitlist: (bookingId: string) => { success: boolean; promotedUser?: string; message: string };
  
  // Hardware Loan Actions
  requestLoan: (data: {
    hardwareId: string;
    purpose: string;
    dueDate: string;
  }) => { success: boolean; message: string; loan?: HardwareLoan };
  approveLoan: (loanId: string) => void;
  rejectLoan: (loanId: string, reason?: string) => void;
  verifyAndIssueLoan: (tokenCodeOrId: string, checklist: { chassisIntact: boolean; accessoriesIncluded: boolean; powersOnWithoutError: boolean }, notes?: string) => { success: boolean; message: string };
  processReturn: (tokenCodeOrId: string, returnCondition: 'Excellent' | 'Good' | 'Minor Scratches' | 'Needs Service', checklist: { chassisIntact: boolean; accessoriesIncluded: boolean; powersOnWithoutError: boolean }, defectNotes?: string) => { success: boolean; message: string };
  reportDefect: (hardwareId: string, issue: string, severity: 'Minor' | 'Moderate' | 'Critical') => void;
  
  // Waitlist Actions
  joinWaitlist: (targetType: 'room' | 'hardware', targetId: string, targetName: string, slotOrDetails: string, date: string) => { success: boolean; message: string; entry?: WaitlistEntry };
  leaveWaitlist: (waitlistId: string) => void;
  
  // Utilities
  resetToDemoData: () => void;
  addAuditLog: (action: string, details: string, category: 'booking' | 'hardware' | 'checkin' | 'waitlist' | 'system') => void;
}

const LabPulseContext = createContext<LabPulseContextType | undefined>(undefined);

// LocalStorage Keys
const STORAGE_KEYS = {
  ROLE: 'labpulse_current_role',
  ROOMS: 'labpulse_rooms_v1',
  HARDWARE: 'labpulse_hardware_v1',
  BOOKINGS: 'labpulse_bookings_v1',
  LOANS: 'labpulse_loans_v1',
  WAITLIST: 'labpulse_waitlist_v1',
  AUDIT: 'labpulse_audit_v1',
};

export const LabPulseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Current user role
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ROLE);
    return (saved as UserRole) || 'student';
  });

  const [activeTab, setActiveTab] = useState<string>('labs');
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Persistent States
  const [rooms, setRooms] = useState<LabRoom[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ROOMS);
    return saved ? JSON.parse(saved) : INITIAL_ROOMS;
  });

  const [hardware, setHardware] = useState<HardwareItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.HARDWARE);
    return saved ? JSON.parse(saved) : INITIAL_HARDWARE;
  });

  const [bookings, setBookings] = useState<LabBooking[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
    return saved ? JSON.parse(saved) : INITIAL_BOOKINGS;
  });

  const [loans, setLoans] = useState<HardwareLoan[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LOANS);
    return saved ? JSON.parse(saved) : INITIAL_LOANS;
  });

  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.WAITLIST);
    return saved ? JSON.parse(saved) : INITIAL_WAITLIST;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUDIT);
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

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

  // Current User Profile based on Role
  const currentUser = USERS[currentRole] || USERS.student;

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
  }, [currentUser]);

  // Switch Role
  const switchRole = (role: UserRole) => {
    setCurrentRole(role);
    const user = USERS[role];
    addToast('Role Switched', `Logged in as ${user.name} (${user.role.toUpperCase()})`, 'info');
    
    // Auto switch active tab to match role workflow
    if (role === 'lecturer') {
      setActiveTab('supervisor');
    } else if (role === 'admin') {
      setActiveTab('officer-station');
    } else {
      setActiveTab('labs');
    }
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

    // Check concurrency conflict
    const conflict = checkConflict(data.roomId, data.date, data.slot);
    if (conflict.hasConflict) {
      return { 
        success: false, 
        message: `Conflict Detected: ${room.name} is already booked by ${conflict.conflictingBooking?.userName} for ${data.slot} on ${data.date}. Join the waitlist instead!` 
      };
    }

    // Determine initial status based on high-resource / FYP requirement
    let initialStatus: BookingStatus = 'Approved';
    if (room.highResource || data.isFYP) {
      initialStatus = 'Pending Endorsement';
    }

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
      supervisorName: data.supervisorName || (data.isFYP ? 'Prof. Madya Dr. Amir Rudin' : undefined),
      supervisorEmail: data.supervisorEmail || (data.isFYP ? 'amirrudin@um.edu.my' : undefined),
      status: initialStatus,
      createdAt: new Date().toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    };

    setBookings((prev) => [newBooking, ...prev]);

    addAuditLog(
      'Space Booking Created',
      `Booking ${tokenCode} for ${room.name} (${data.slot}) submitted. Status: ${initialStatus}.`,
      'booking'
    );

    if (initialStatus === 'Approved') {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
      addToast('Reservation Confirmed', `Pass ${tokenCode} generated! QR code is ready in 'My Passes'.`, 'success');
    } else {
      addToast('Endorsement Required', `Routed to ${data.supervisorName || 'Academic Supervisor'} for review.`, 'warning');
    }

    return { success: true, message: 'Booking created successfully!', booking: newBooking };
  };

  // Endorse Booking (Lecturer)
  const endorseBooking = (bookingId: string, note?: string) => {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          return {
            ...b,
            status: 'Approved',
            endorsementNote: note || `Endorsed by ${currentUser.name}`
          };
        }
        return b;
      })
    );

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
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          return {
            ...b,
            status: 'Rejected',
            endorsementNote: reason || 'Decline requested by supervisor.'
          };
        }
        return b;
      })
    );
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
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          return {
            ...b,
            status: 'Approved',
            adminNote: note
          };
        }
        return b;
      })
    );
    const booking = bookings.find((b) => b.id === bookingId);
    addAuditLog('Admin Approval', `Lab Officer approved booking ${booking?.tokenCode}.`, 'booking');
    addToast('Booking Approved', `Pass generated for ${booking?.tokenCode}.`, 'success');
  };

  // Reject Booking (Admin Officer)
  const rejectBooking = (bookingId: string, reason?: string) => {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          return {
            ...b,
            status: 'Rejected',
            adminNote: reason || 'Lab space unavailable for scheduled maintenance.'
          };
        }
        return b;
      })
    );
    const booking = bookings.find((b) => b.id === bookingId);
    addAuditLog('Admin Rejection', `Lab Officer rejected booking ${booking?.tokenCode}.`, 'booking');
    addToast('Booking Rejected', `Notification sent to student.`, 'warning');
  };

  // Cancel Booking (Student)
  const cancelBooking = (bookingId: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'Cancelled' } : b))
    );
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
    
    setBookings((prev) =>
      prev.map((b) => (b.id === booking.id ? { ...b, status: 'Active', checkInTime } : b))
    );

    addAuditLog(
      'Physical QR Check-In Verified',
      `Student ${booking.userName} (${booking.userMatric}) checked into ${booking.roomName} at ${checkInTime}.`,
      'checkin'
    );

    confetti({ particleCount: 75, spread: 70, origin: { y: 0.6 } });
    addToast('QR Check-in Verified!', `Welcome, ${booking.userName}. Session active in ${booking.roomName}.`, 'success');

    return { success: true, message: `Check-in confirmed for ${booking.userName} (${booking.roomName}).`, booking };
  };

  // Check Out
  const checkOutBooking = (tokenCodeOrId: string) => {
    const cleanToken = tokenCodeOrId.trim().toUpperCase();
    const booking = bookings.find((b) => b.tokenCode.toUpperCase() === cleanToken || b.id === tokenCodeOrId);

    if (!booking) {
      return { success: false, message: `Reservation not found for code ${cleanToken}.` };
    }

    const checkOutTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setBookings((prev) =>
      prev.map((b) => (b.id === booking.id ? { ...b, status: 'Completed', checkOutTime } : b))
    );

    addAuditLog(
      'Space Session Concluded',
      `Student ${booking.userName} checked out of ${booking.roomName} at ${checkOutTime}.`,
      'checkin'
    );

    addToast('Session Completed', `${booking.roomName} slot checked out successfully.`, 'info');
    return { success: true, message: `Check-out recorded at ${checkOutTime}.`, booking };
  };

  // Mark No-Show & Forfeiture
  const markNoShow = (bookingId: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'No-Show / Forfeited' } : b))
    );

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

    // Update waitlist entry
    setWaitlist((prev) =>
      prev.map((w) => (w.id === candidate.id ? { ...w, status: 'promoted' } : w))
    );

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
    addToast('Removed from Waitlist', 'Your queue reservation has been dropped.', 'info');
  };

  // Request Hardware Loan
  const requestLoan = (data: {
    hardwareId: string;
    purpose: string;
    dueDate: string;
  }) => {
    const item = hardware.find((h) => h.id === data.hardwareId);
    if (!item) return { success: false, message: 'Hardware item not found.' };

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
      requestDate: getTodayDateString(),
      dueDate: data.dueDate,
      purpose: data.purpose,
      status: 'Pending Approval',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })
    };

    setLoans((prev) => [newLoan, ...prev]);

    addAuditLog(
      'Hardware Loan Requested',
      `${currentUser.name} requested loan for ${item.name} (SN: ${item.serialNumber}). Token: ${tokenCode}.`,
      'hardware'
    );

    addToast('Loan Request Submitted', `Token ${tokenCode} sent to FCSIT Lab Officer for physical verification.`, 'success');

    return { success: true, message: 'Loan request submitted successfully.', loan: newLoan };
  };

  // Approve Hardware Loan (Officer)
  const approveLoan = (loanId: string) => {
    setLoans((prev) =>
      prev.map((l) => (l.id === loanId ? { ...l, status: 'Active / Issued' } : l))
    );
    const loan = loans.find((l) => l.id === loanId);
    if (loan) {
      // Decrement available units
      setHardware((prev) =>
        prev.map((h) =>
          h.id === loan.hardwareId ? { ...h, availableUnits: Math.max(0, h.availableUnits - 1) } : h
        )
      );
      addAuditLog('Hardware Loan Approved', `Loan ${loan.tokenCode} approved for ${loan.userName}.`, 'hardware');
      addToast('Loan Approved', `Hardware issued to ${loan.userName}.`, 'success');
    }
  };

  // Reject Hardware Loan
  const rejectLoan = (loanId: string, reason?: string) => {
    setLoans((prev) =>
      prev.map((l) => (l.id === loanId ? { ...l, status: 'Rejected', auditNotes: reason } : l))
    );
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

    setLoans((prev) =>
      prev.map((l) =>
        l.id === loan.id
          ? {
              ...l,
              status: 'Active / Issued',
              checklist,
              conditionOut: 'Full pre-issue audit passed: Chassis intact, accessories verified, powers on without error.',
              auditNotes: notes
            }
          : l
      )
    );

    // Update Hardware item
    setHardware((prev) =>
      prev.map((h) => {
        if (h.id === loan.hardwareId) {
          const newAvailable = Math.max(0, h.availableUnits - 1);
          return {
            ...h,
            availableUnits: newAvailable,
            status: newAvailable === 0 ? 'On Loan' : h.status,
            currentBorrower: {
              name: loan.userName,
              matric: loan.userMatric,
              dueDate: loan.dueDate
            }
          };
        }
        return h;
      })
    );

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

    setLoans((prev) =>
      prev.map((l) =>
        l.id === loan.id
          ? {
              ...l,
              status: 'Returned',
              conditionIn: `Return condition: ${returnCondition}. Checklist: ${JSON.stringify(checklist)}`,
              auditNotes: defectNotes
            }
          : l
      )
    );

    // Update Hardware unit health and history
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

          return {
            ...h,
            availableUnits: newUnits,
            healthPercentage: newHealth,
            status: returnCondition === 'Needs Service' ? 'Under Maintenance' : 'Available',
            currentBorrower: undefined,
            defects: updatedDefects,
            loanHistory: updatedHistory
          };
        }
        return h;
      })
    );

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

  // Reset to Demo Data
  const resetToDemoData = () => {
    localStorage.removeItem(STORAGE_KEYS.ROOMS);
    localStorage.removeItem(STORAGE_KEYS.HARDWARE);
    localStorage.removeItem(STORAGE_KEYS.BOOKINGS);
    localStorage.removeItem(STORAGE_KEYS.LOANS);
    localStorage.removeItem(STORAGE_KEYS.WAITLIST);
    localStorage.removeItem(STORAGE_KEYS.AUDIT);
    localStorage.removeItem(STORAGE_KEYS.ROLE);

    setRooms(INITIAL_ROOMS);
    setHardware(INITIAL_HARDWARE);
    setBookings(INITIAL_BOOKINGS);
    setLoans(INITIAL_LOANS);
    setWaitlist(INITIAL_WAITLIST);
    setAuditLogs(INITIAL_AUDIT_LOGS);
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
        users: USERS,
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
        joinWaitlist,
        leaveWaitlist,
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

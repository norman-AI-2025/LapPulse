export type UserRole = 'student' | 'lecturer' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  matricOrStaffId: string;
  email: string;
  department: string;
  avatar: string;
  title?: string;
}

export type LabCategory = 
  | 'AI & Data Science'
  | 'Software Engineering'
  | 'Networking & Security'
  | 'IoT & Robotics'
  | 'Meeting & Seminar';

export interface RoomReportRecord {
  id: string;
  roomId: string;
  date: string;
  title: string;
  description: string;
  category: 'Air Conditioning' | 'Projector & AV' | 'Workstations & PCs' | 'Electrical & Power' | 'Cleanliness' | 'Network & Wi-Fi' | 'Other';
  reportedBy: string;
  reporterMatric?: string;
  severity: 'Minor' | 'Moderate' | 'Critical';
  status: 'Open' | 'In Progress' | 'Resolved';
  resolutionNotes?: string;
}

export interface LabRoom {
  id: string;
  name: string;
  code: string;
  category: LabCategory;
  capacity: number;
  floor: string;
  block: string;
  description: string;
  amenities: string[];
  specs: {
    workstations: number;
    gpus?: string;
    networkingGear?: string;
    screens: string;
    specialEquipment?: string;
  };
  highResource: boolean; // Requires supervisor endorsement
  imageUrl: string;
  activeNotice?: string;
  reports?: RoomReportRecord[];
}

export type TimeSlotString = string;

export type BookingStatus = 
  | 'Pending Endorsement'
  | 'Pending Approval'
  | 'Approved'
  | 'Active'
  | 'Completed'
  | 'Rejected'
  | 'No-Show / Forfeited'
  | 'Cancelled';

export interface LabBooking {
  id: string;
  tokenCode: string; // e.g. LP-7842
  userId: string;
  userName: string;
  userMatric: string;
  userEmail: string;
  roomId: string;
  roomName: string;
  roomCode: string;
  date: string; // YYYY-MM-DD
  slot: TimeSlotString;
  purpose: string;
  courseCode?: string;
  isFYP: boolean;
  supervisorName?: string;
  supervisorEmail?: string;
  status: BookingStatus;
  checkInTime?: string;
  checkOutTime?: string;
  createdAt: string;
  endorsementNote?: string;
  adminNote?: string;
}

export type HardwareCategory = 
  | 'Edge AI & Dev Kits'
  | 'Microcontrollers'
  | 'Testing & Measurement'
  | 'Sensors & Bundles';

export type HardwareStatus = 'Available' | 'On Loan' | 'Under Maintenance';

export interface DefectRecord {
  id: string;
  date: string;
  issue: string;
  reportedBy: string;
  severity: 'Minor' | 'Moderate' | 'Critical';
  status: 'Investigating' | 'Resolved' | 'Pending Parts';
}

export interface LoanHistoryRecord {
  id: string;
  borrower: string;
  matric: string;
  fromDate: string;
  toDate: string;
  returnCondition: 'Excellent' | 'Good' | 'Minor Scratches' | 'Needs Service';
  notes?: string;
}

export interface HardwareItem {
  id: string;
  name: string;
  model: string;
  tag: string; // e.g. FCSIT-HW-042
  serialNumber: string;
  category: HardwareCategory;
  totalUnits: number;
  availableUnits: number;
  healthPercentage: number;
  status: HardwareStatus;
  currentBorrower?: {
    name: string;
    matric: string;
    dueDate: string;
  };
  specs: string[];
  location: string;
  defects: DefectRecord[];
  loanHistory: LoanHistoryRecord[];
  imageUrl: string;
  bundleTag?: string;
}

export type LoanStatus = 
  | 'Pending Approval'
  | 'Active / Issued'
  | 'Returned'
  | 'Overdue'
  | 'Rejected';

export interface HardwareLoan {
  id: string;
  tokenCode: string; // e.g. LP-3829
  userId: string;
  userName: string;
  userMatric: string;
  hardwareId: string;
  hardwareName: string;
  hardwareTag: string;
  serialNumber: string;
  requestDate: string;
  dueDate: string;
  purpose: string;
  status: LoanStatus;
  conditionOut?: string;
  conditionIn?: string;
  auditNotes?: string;
  createdAt: string;
  checklist?: {
    chassisIntact: boolean;
    accessoriesIncluded: boolean;
    powersOnWithoutError: boolean;
  };
}

export interface WaitlistEntry {
  id: string;
  targetType: 'room' | 'hardware';
  targetId: string;
  targetName: string;
  slotOrDetails: string;
  date: string;
  userId: string;
  userName: string;
  userMatric: string;
  userEmail: string;
  position: number;
  status: 'waiting' | 'promoted' | 'forfeited';
  createdAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  actorRole: string;
  action: string;
  details: string;
  category: 'booking' | 'hardware' | 'checkin' | 'waitlist' | 'system';
}

export interface HardwareBundleTemplate {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  targetCourse: string;
  hardwareItemIds: string[];
  description: string;
  iconName: string;
  recommendedFor: string;
}


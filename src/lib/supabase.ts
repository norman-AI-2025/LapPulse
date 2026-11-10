import { createClient } from '@supabase/supabase-js';
import { 
  LabRoom, 
  HardwareItem, 
  LabBooking, 
  HardwareLoan, 
  MaintenanceReport, 
  WaitlistEntry, 
  AuditLog, 
  UserProfile 
} from '../types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY && !SUPABASE_URL.includes('your-project'));
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

/* =======================================================================
   MAPPERS: Database (snake_case) <-> Application (camelCase)
======================================================================= */

// 1. Rooms
export const mapRoomFromDb = (row: any): LabRoom => ({
  id: row.id,
  name: row.name,
  code: row.code,
  category: row.category,
  capacity: Number(row.capacity) || 30,
  floor: row.floor,
  block: row.block,
  description: row.description || '',
  amenities: Array.isArray(row.amenities) ? row.amenities : [],
  specs: row.specs || { workstations: 30, screens: 'Standard Display' },
  highResource: Boolean(row.high_resource),
  imageUrl: row.image_url || '',
  activeNotice: row.active_notice || undefined,
  reports: Array.isArray(row.reports) ? row.reports : [],
  status: row.status || 'Available',
});

export const mapRoomToDb = (room: LabRoom): any => ({
  id: room.id,
  name: room.name,
  code: room.code,
  category: room.category,
  capacity: room.capacity,
  floor: room.floor,
  block: room.block,
  description: room.description,
  amenities: room.amenities,
  specs: room.specs,
  high_resource: room.highResource,
  image_url: room.imageUrl,
  active_notice: room.activeNotice || null,
  reports: room.reports || [],
  status: room.status || 'Available',
});

// 2. Hardware
export const mapHardwareFromDb = (row: any): HardwareItem => ({
  id: row.id,
  name: row.name,
  model: row.model || '',
  tag: row.tag,
  serialNumber: row.serial_number || '',
  category: row.category,
  totalUnits: Number(row.total_units) || 1,
  availableUnits: Number(row.available_units) || 0,
  healthPercentage: Number(row.health_percentage) || 100,
  status: row.status || 'Available',
  currentBorrower: row.current_borrower || undefined,
  specs: Array.isArray(row.specs) ? row.specs : [],
  location: row.location || '',
  defects: Array.isArray(row.defects) ? row.defects : [],
  loanHistory: Array.isArray(row.loan_history) ? row.loan_history : [],
  imageUrl: row.image_url || '',
  bundleTag: row.bundle_tag || undefined,
});

export const mapHardwareToDb = (hw: HardwareItem): any => ({
  id: hw.id,
  name: hw.name,
  model: hw.model,
  tag: hw.tag,
  serial_number: hw.serialNumber,
  category: hw.category,
  total_units: hw.totalUnits,
  available_units: hw.availableUnits,
  health_percentage: hw.healthPercentage,
  status: hw.status,
  current_borrower: hw.currentBorrower || null,
  specs: hw.specs,
  location: hw.location,
  defects: hw.defects || [],
  loan_history: hw.loanHistory || [],
  image_url: hw.imageUrl,
  bundle_tag: hw.bundleTag || null,
});

// 3. Bookings
export const mapBookingFromDb = (row: any): LabBooking => ({
  id: row.id,
  tokenCode: row.token_code,
  userId: row.user_id,
  userName: row.user_name,
  userMatric: row.user_matric || '',
  userEmail: row.user_email || '',
  roomId: row.room_id,
  roomName: row.room_name,
  roomCode: row.room_code || '',
  date: row.date,
  slot: row.slot,
  purpose: row.purpose || '',
  courseCode: row.course_code || undefined,
  isFYP: Boolean(row.is_fyp),
  supervisorName: row.supervisor_name || undefined,
  supervisorEmail: row.supervisor_email || undefined,
  status: row.status,
  checkInTime: row.check_in_time || undefined,
  checkOutTime: row.check_out_time || undefined,
  checkInDeadline: row.check_in_deadline ? Number(row.check_in_deadline) : undefined,
  createdAt: row.created_at,
  endorsementNote: row.endorsement_note || undefined,
  adminNote: row.admin_note || undefined,
});

export const mapBookingToDb = (b: LabBooking): any => ({
  id: b.id,
  token_code: b.tokenCode,
  user_id: b.userId,
  user_name: b.userName,
  user_matric: b.userMatric,
  user_email: b.userEmail,
  room_id: b.roomId,
  room_name: b.roomName,
  room_code: b.roomCode,
  date: b.date,
  slot: b.slot,
  purpose: b.purpose,
  course_code: b.courseCode || null,
  is_fyp: b.isFYP,
  supervisor_name: b.supervisorName || null,
  supervisor_email: b.supervisorEmail || null,
  status: b.status,
  check_in_time: b.checkInTime || null,
  check_out_time: b.checkOutTime || null,
  check_in_deadline: b.checkInDeadline || null,
  created_at: b.createdAt,
  endorsement_note: b.endorsementNote || null,
  admin_note: b.adminNote || null,
});

// 4. Loans
export const mapLoanFromDb = (row: any): HardwareLoan => ({
  id: row.id,
  tokenCode: row.token_code,
  userId: row.user_id,
  userName: row.user_name,
  userMatric: row.user_matric || '',
  hardwareId: row.hardware_id,
  hardwareName: row.hardware_name,
  hardwareTag: row.hardware_tag || '',
  serialNumber: row.serial_number || '',
  requestDate: row.request_date,
  dueDate: row.due_date,
  purpose: row.purpose || '',
  status: row.status,
  conditionOut: row.condition_out || undefined,
  conditionIn: row.condition_in || undefined,
  auditNotes: row.audit_notes || undefined,
  createdAt: row.created_at,
  checklist: row.checklist || undefined,
});

export const mapLoanToDb = (loan: HardwareLoan): any => ({
  id: loan.id,
  token_code: loan.tokenCode,
  user_id: loan.userId,
  user_name: loan.userName,
  user_matric: loan.userMatric,
  hardware_id: loan.hardwareId,
  hardware_name: loan.hardwareName,
  hardware_tag: loan.hardwareTag,
  serial_number: loan.serialNumber,
  request_date: loan.requestDate,
  due_date: loan.dueDate,
  purpose: loan.purpose,
  status: loan.status,
  condition_out: loan.conditionOut || null,
  condition_in: loan.conditionIn || null,
  audit_notes: loan.auditNotes || null,
  created_at: loan.createdAt,
  checklist: loan.checklist || null,
});

// 5. Maintenance Reports
export const mapReportFromDb = (row: any): MaintenanceReport => ({
  id: row.id,
  timestamp: row.timestamp,
  type: row.type,
  targetId: row.target_id,
  targetName: row.target_name,
  targetCodeOrTag: row.target_code_or_tag || '',
  specificLocation: row.specific_location || undefined,
  serialNumber: row.serial_number || undefined,
  category: row.category,
  description: row.description || '',
  photoUrl: row.photo_url || undefined,
  reportedBy: row.reported_by,
  reporterMatric: row.reporter_matric || '',
  reporterRole: row.reporter_role || 'student',
  reporterEmail: row.reporter_email || undefined,
  status: row.status,
  officerNotes: row.officer_notes || undefined,
  resolvedAt: row.resolved_at || undefined,
});

export const mapReportToDb = (r: MaintenanceReport): any => ({
  id: r.id,
  timestamp: r.timestamp,
  type: r.type,
  target_id: r.targetId,
  target_name: r.targetName,
  target_code_or_tag: r.targetCodeOrTag,
  specific_location: r.specificLocation || null,
  serial_number: r.serialNumber || null,
  category: r.category,
  description: r.description,
  photo_url: r.photoUrl || null,
  reported_by: r.reportedBy,
  reporter_matric: r.reporterMatric,
  reporter_role: r.reporterRole,
  reporter_email: r.reporterEmail || null,
  status: r.status,
  officer_notes: r.officerNotes || null,
  resolved_at: r.resolvedAt || null,
});

// 6. Waitlist
export const mapWaitlistFromDb = (row: any): WaitlistEntry => ({
  id: row.id,
  targetType: row.target_type,
  targetId: row.target_id,
  targetName: row.target_name,
  slotOrDetails: row.slot_or_details || '',
  date: row.date || '',
  userId: row.user_id,
  userName: row.user_name,
  userMatric: row.user_matric || '',
  userEmail: row.user_email || '',
  position: Number(row.position) || 1,
  status: row.status,
  createdAt: row.created_at,
});

export const mapWaitlistToDb = (w: WaitlistEntry): any => ({
  id: w.id,
  target_type: w.targetType,
  target_id: w.targetId,
  target_name: w.targetName,
  slot_or_details: w.slotOrDetails,
  date: w.date,
  user_id: w.userId,
  user_name: w.userName,
  user_matric: w.userMatric,
  user_email: w.userEmail,
  position: w.position,
  status: w.status,
  created_at: w.createdAt,
});

// 7. Audit Logs
export const mapAuditLogFromDb = (row: any): AuditLog => ({
  id: row.id,
  timestamp: row.timestamp,
  actor: row.actor,
  actorRole: row.actor_role,
  action: row.action,
  details: row.details || '',
  category: row.category,
});

export const mapAuditLogToDb = (a: AuditLog): any => ({
  id: a.id,
  timestamp: a.timestamp,
  actor: a.actor,
  actor_role: a.actorRole,
  action: a.action,
  details: a.details,
  category: a.category,
});

// 8. User Profiles
export const mapProfileFromDb = (row: any): UserProfile => ({
  id: row.id,
  name: row.name,
  role: row.role,
  matricOrStaffId: row.matric_or_staff_id || '',
  email: row.email,
  department: row.department || '',
  avatar: row.avatar || '',
  title: row.title || undefined,
  password: row.password || undefined,
});

export const mapProfileToDb = (u: UserProfile): any => ({
  id: u.id,
  name: u.name,
  role: u.role,
  matric_or_staff_id: u.matricOrStaffId,
  email: u.email,
  department: u.department,
  avatar: u.avatar,
  title: u.title || null,
  password: u.password || null,
});

/* =======================================================================
   SUPABASE ASYNC MUTATION HELPERS
   Non-blocking background calls with error-safe wrappers
======================================================================= */

export const dbUpsertBooking = async (booking: LabBooking) => {
  if (!isSupabaseConfigured()) return;
  try {
    const { error } = await supabase.from('bookings').upsert(mapBookingToDb(booking));
    if (error) console.warn('Supabase bookings.upsert error:', error.message);
  } catch (err) {
    console.warn('Supabase bookings.upsert exception:', err);
  }
};

export const dbDeleteBooking = async (id: string) => {
  if (!isSupabaseConfigured()) return;
  try {
    const { error } = await supabase.from('bookings').delete().eq('id', id);
    if (error) console.warn('Supabase bookings.delete error:', error.message);
  } catch (err) {
    console.warn('Supabase bookings.delete exception:', err);
  }
};

export const dbUpsertLoan = async (loan: HardwareLoan) => {
  if (!isSupabaseConfigured()) return;
  try {
    const { error } = await supabase.from('loans').upsert(mapLoanToDb(loan));
    if (error) console.warn('Supabase loans.upsert error:', error.message);
  } catch (err) {
    console.warn('Supabase loans.upsert exception:', err);
  }
};

export const dbUpsertReport = async (report: MaintenanceReport) => {
  if (!isSupabaseConfigured()) return;
  try {
    const { error } = await supabase.from('maintenance_reports').upsert(mapReportToDb(report));
    if (error) console.warn('Supabase maintenance_reports.upsert error:', error.message);
  } catch (err) {
    console.warn('Supabase maintenance_reports.upsert exception:', err);
  }
};

export const dbUpsertWaitlist = async (entry: WaitlistEntry) => {
  if (!isSupabaseConfigured()) return;
  try {
    const { error } = await supabase.from('waitlist').upsert(mapWaitlistToDb(entry));
    if (error) console.warn('Supabase waitlist.upsert error:', error.message);
  } catch (err) {
    console.warn('Supabase waitlist.upsert exception:', err);
  }
};

export const dbDeleteWaitlist = async (id: string) => {
  if (!isSupabaseConfigured()) return;
  try {
    const { error } = await supabase.from('waitlist').delete().eq('id', id);
    if (error) console.warn('Supabase waitlist.delete error:', error.message);
  } catch (err) {
    console.warn('Supabase waitlist.delete exception:', err);
  }
};

export const dbInsertAuditLog = async (log: AuditLog) => {
  if (!isSupabaseConfigured()) return;
  try {
    const { error } = await supabase.from('audit_logs').insert(mapAuditLogToDb(log));
    if (error) console.warn('Supabase audit_logs.insert error:', error.message);
  } catch (err) {
    console.warn('Supabase audit_logs.insert exception:', err);
  }
};

export const dbUpsertRoom = async (room: LabRoom) => {
  if (!isSupabaseConfigured()) return;
  try {
    const { error } = await supabase.from('rooms').upsert(mapRoomToDb(room));
    if (error) console.warn('Supabase rooms.upsert error:', error.message);
  } catch (err) {
    console.warn('Supabase rooms.upsert exception:', err);
  }
};

export const dbUpsertHardware = async (hw: HardwareItem) => {
  if (!isSupabaseConfigured()) return;
  try {
    const { error } = await supabase.from('hardware').upsert(mapHardwareToDb(hw));
    if (error) console.warn('Supabase hardware.upsert error:', error.message);
  } catch (err) {
    console.warn('Supabase hardware.upsert exception:', err);
  }
};

export const dbUpsertProfile = async (user: UserProfile) => {
  if (!isSupabaseConfigured()) return;
  try {
    const { error } = await supabase.from('profiles').upsert(mapProfileToDb(user));
    if (error) console.warn('Supabase profiles.upsert error:', error.message);
  } catch (err) {
    console.warn('Supabase profiles.upsert exception:', err);
  }
};


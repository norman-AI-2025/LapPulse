const fs = require('fs');
const path = require('path');
const data = require('./initialData.cjs');

function escapeSql(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'boolean') return val ? 'true' : 'false';
  if (typeof val === 'number') return val.toString();
  if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'::jsonb`;
  return `'${String(val).replace(/'/g, "''")}'`;
}

let sql = `-- ==============================================================================
-- LapPulse Supabase Complete Database Schema & Initial Seed
-- Generated for Supabase Project: https://yygrlawcxzoqedoibosx.supabase.co
-- ==============================================================================

-- 1. PROFILES / USERS TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student',
  matric_or_staff_id TEXT,
  email TEXT NOT NULL,
  department TEXT,
  avatar TEXT,
  title TEXT,
  password TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ROOMS TABLE (FCSIT 23 Real Spaces)
CREATE TABLE IF NOT EXISTS public.rooms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  category TEXT NOT NULL,
  capacity INT NOT NULL DEFAULT 30,
  floor TEXT NOT NULL,
  block TEXT NOT NULL,
  description TEXT,
  amenities JSONB DEFAULT '[]'::jsonb,
  specs JSONB DEFAULT '{}'::jsonb,
  high_resource BOOLEAN DEFAULT false,
  image_url TEXT,
  active_notice TEXT,
  reports JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'Available',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. HARDWARE INVENTORY TABLE
CREATE TABLE IF NOT EXISTS public.hardware (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  model TEXT,
  tag TEXT NOT NULL,
  serial_number TEXT,
  category TEXT NOT NULL,
  total_units INT DEFAULT 1,
  available_units INT DEFAULT 1,
  health_percentage INT DEFAULT 100,
  status TEXT DEFAULT 'Available',
  current_borrower JSONB,
  specs JSONB DEFAULT '[]'::jsonb,
  location TEXT,
  defects JSONB DEFAULT '[]'::jsonb,
  loan_history JSONB DEFAULT '[]'::jsonb,
  image_url TEXT,
  bundle_tag TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. LAB BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS public.bookings (
  id TEXT PRIMARY KEY,
  token_code TEXT NOT NULL,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_matric TEXT,
  user_email TEXT,
  room_id TEXT NOT NULL,
  room_name TEXT NOT NULL,
  room_code TEXT,
  date TEXT NOT NULL,
  slot TEXT NOT NULL,
  purpose TEXT,
  course_code TEXT,
  is_fyp BOOLEAN DEFAULT false,
  supervisor_name TEXT,
  supervisor_email TEXT,
  status TEXT NOT NULL DEFAULT 'Pending Approval',
  check_in_time TEXT,
  check_out_time TEXT,
  check_in_deadline BIGINT,
  created_at TEXT,
  endorsement_note TEXT,
  admin_note TEXT
);

-- 5. HARDWARE LOANS TABLE
CREATE TABLE IF NOT EXISTS public.loans (
  id TEXT PRIMARY KEY,
  token_code TEXT NOT NULL,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_matric TEXT,
  hardware_id TEXT NOT NULL,
  hardware_name TEXT NOT NULL,
  hardware_tag TEXT,
  serial_number TEXT,
  request_date TEXT,
  due_date TEXT,
  purpose TEXT,
  status TEXT NOT NULL DEFAULT 'Pending Approval',
  condition_out TEXT,
  condition_in TEXT,
  audit_notes TEXT,
  created_at TEXT,
  checklist JSONB
);

-- 6. MAINTENANCE REPORTS TABLE
CREATE TABLE IF NOT EXISTS public.maintenance_reports (
  id TEXT PRIMARY KEY,
  timestamp TEXT NOT NULL,
  type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  target_name TEXT NOT NULL,
  target_code_or_tag TEXT,
  specific_location TEXT,
  serial_number TEXT,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  photo_url TEXT,
  reported_by TEXT NOT NULL,
  reporter_matric TEXT,
  reporter_role TEXT NOT NULL DEFAULT 'student',
  reporter_email TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING',
  officer_notes TEXT,
  resolved_at TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. WAITLIST TABLE
CREATE TABLE IF NOT EXISTS public.waitlist (
  id TEXT PRIMARY KEY,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  target_name TEXT NOT NULL,
  slot_or_details TEXT,
  date TEXT,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_matric TEXT,
  user_email TEXT,
  position INT DEFAULT 1,
  status TEXT DEFAULT 'waiting',
  created_at TEXT
);

-- 8. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id TEXT PRIMARY KEY,
  timestamp TEXT NOT NULL,
  actor TEXT NOT NULL,
  actor_role TEXT NOT NULL,
  action TEXT NOT NULL,
  details TEXT,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Permissive policies for anon & authenticated roles so client can read and write
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hardware ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Public full access profiles" ON public.profiles;
  DROP POLICY IF EXISTS "Public full access rooms" ON public.rooms;
  DROP POLICY IF EXISTS "Public full access hardware" ON public.hardware;
  DROP POLICY IF EXISTS "Public full access bookings" ON public.bookings;
  DROP POLICY IF EXISTS "Public full access loans" ON public.loans;
  DROP POLICY IF EXISTS "Public full access maintenance_reports" ON public.maintenance_reports;
  DROP POLICY IF EXISTS "Public full access waitlist" ON public.waitlist;
  DROP POLICY IF EXISTS "Public full access audit_logs" ON public.audit_logs;
END $$;

CREATE POLICY "Public full access profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access rooms" ON public.rooms FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access hardware" ON public.hardware FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access bookings" ON public.bookings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access loans" ON public.loans FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access maintenance_reports" ON public.maintenance_reports FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access waitlist" ON public.waitlist FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access audit_logs" ON public.audit_logs FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- ENABLE SUPABASE REALTIME REPLICATION
-- ==============================================================================
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE 
      public.profiles,
      public.rooms,
      public.hardware,
      public.bookings,
      public.loans,
      public.maintenance_reports,
      public.waitlist,
      public.audit_logs;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
END $$;

-- ==============================================================================
-- SEED DATA (Idempotent: ON CONFLICT DO UPDATE)
-- ==============================================================================

-- 1. Profiles
`;

for (const key of Object.keys(data.USERS)) {
  const u = data.USERS[key];
  sql += `INSERT INTO public.profiles (id, name, role, matric_or_staff_id, email, department, avatar, title, password)
VALUES (${escapeSql(u.id)}, ${escapeSql(u.name)}, ${escapeSql(u.role)}, ${escapeSql(u.matricOrStaffId)}, ${escapeSql(u.email)}, ${escapeSql(u.department)}, ${escapeSql(u.avatar)}, ${escapeSql(u.title)}, ${escapeSql(u.password)})
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  matric_or_staff_id = EXCLUDED.matric_or_staff_id,
  email = EXCLUDED.email,
  department = EXCLUDED.department,
  avatar = EXCLUDED.avatar,
  title = EXCLUDED.title,
  password = EXCLUDED.password;
`;
}

sql += `\n-- 2. Rooms (FCSIT 23 Spaces)\n`;
for (const r of data.INITIAL_ROOMS) {
  sql += `INSERT INTO public.rooms (id, name, code, category, capacity, floor, block, description, amenities, specs, high_resource, image_url, active_notice, reports, status)
VALUES (${escapeSql(r.id)}, ${escapeSql(r.name)}, ${escapeSql(r.code)}, ${escapeSql(r.category)}, ${escapeSql(r.capacity)}, ${escapeSql(r.floor)}, ${escapeSql(r.block)}, ${escapeSql(r.description)}, ${escapeSql(r.amenities)}, ${escapeSql(r.specs)}, ${escapeSql(r.highResource)}, ${escapeSql(r.imageUrl)}, ${escapeSql(r.activeNotice || null)}, ${escapeSql(r.reports || [])}, ${escapeSql(r.status || 'Available')})
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  code = EXCLUDED.code,
  category = EXCLUDED.category,
  capacity = EXCLUDED.capacity,
  floor = EXCLUDED.floor,
  block = EXCLUDED.block,
  description = EXCLUDED.description,
  amenities = EXCLUDED.amenities,
  specs = EXCLUDED.specs,
  high_resource = EXCLUDED.high_resource,
  image_url = EXCLUDED.image_url,
  active_notice = EXCLUDED.active_notice,
  reports = EXCLUDED.reports,
  status = EXCLUDED.status;
`;
}

sql += `\n-- 3. Hardware Inventory\n`;
for (const hw of data.INITIAL_HARDWARE) {
  sql += `INSERT INTO public.hardware (id, name, model, tag, serial_number, category, total_units, available_units, health_percentage, status, current_borrower, specs, location, defects, loan_history, image_url, bundle_tag)
VALUES (${escapeSql(hw.id)}, ${escapeSql(hw.name)}, ${escapeSql(hw.model)}, ${escapeSql(hw.tag)}, ${escapeSql(hw.serialNumber)}, ${escapeSql(hw.category)}, ${escapeSql(hw.totalUnits)}, ${escapeSql(hw.availableUnits)}, ${escapeSql(hw.healthPercentage)}, ${escapeSql(hw.status)}, ${escapeSql(hw.currentBorrower || null)}, ${escapeSql(hw.specs)}, ${escapeSql(hw.location)}, ${escapeSql(hw.defects || [])}, ${escapeSql(hw.loanHistory || [])}, ${escapeSql(hw.imageUrl)}, ${escapeSql(hw.bundleTag || null)})
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  model = EXCLUDED.model,
  tag = EXCLUDED.tag,
  serial_number = EXCLUDED.serial_number,
  category = EXCLUDED.category,
  total_units = EXCLUDED.total_units,
  available_units = EXCLUDED.available_units,
  health_percentage = EXCLUDED.health_percentage,
  status = EXCLUDED.status,
  current_borrower = EXCLUDED.current_borrower,
  specs = EXCLUDED.specs,
  location = EXCLUDED.location,
  defects = EXCLUDED.defects,
  loan_history = EXCLUDED.loan_history,
  image_url = EXCLUDED.image_url,
  bundle_tag = EXCLUDED.bundle_tag;
`;
}

sql += `\n-- 4. Initial Audit Logs\n`;
for (const a of data.INITIAL_AUDIT_LOGS) {
  sql += `INSERT INTO public.audit_logs (id, timestamp, actor, actor_role, action, details, category)
VALUES (${escapeSql(a.id)}, ${escapeSql(a.timestamp)}, ${escapeSql(a.actor)}, ${escapeSql(a.actorRole)}, ${escapeSql(a.action)}, ${escapeSql(a.details)}, ${escapeSql(a.category)})
ON CONFLICT (id) DO NOTHING;
`;
}

const outputPath = path.resolve(__dirname, '../supabase_schema.sql');
fs.writeFileSync(outputPath, sql);
console.log('Successfully regenerated supabase_schema.sql. Length:', sql.length);

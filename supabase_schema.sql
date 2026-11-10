-- ==============================================================================
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
INSERT INTO public.profiles (id, name, role, matric_or_staff_id, email, department, avatar, title, password)
VALUES ('usr_student', 'Student User', 'student', '25005870', 'student@siswa.um.edu.my', 'Department of Software Engineering, FCSIT', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80', 'FCSIT Undergraduate Student', 'password123')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  matric_or_staff_id = EXCLUDED.matric_or_staff_id,
  email = EXCLUDED.email,
  department = EXCLUDED.department,
  avatar = EXCLUDED.avatar,
  title = EXCLUDED.title,
  password = EXCLUDED.password;
INSERT INTO public.profiles (id, name, role, matric_or_staff_id, email, department, avatar, title, password)
VALUES ('usr_staff', 'Staff User', 'lecturer', 'UM-STAFF-19842', 'staff@um.edu.my', 'Department of Artificial Intelligence, FCSIT', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80', 'Associate Professor & Academic Supervisor', 'password123')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  matric_or_staff_id = EXCLUDED.matric_or_staff_id,
  email = EXCLUDED.email,
  department = EXCLUDED.department,
  avatar = EXCLUDED.avatar,
  title = EXCLUDED.title,
  password = EXCLUDED.password;
INSERT INTO public.profiles (id, name, role, matric_or_staff_id, email, department, avatar, title, password)
VALUES ('usr_officer', 'Officer User', 'admin', 'UM-OFFICER-0419', 'officer@um.edu.my', 'Central Laboratory Operations & Technical Management', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80', 'Senior Laboratory Technical Officer', 'password123')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  matric_or_staff_id = EXCLUDED.matric_or_staff_id,
  email = EXCLUDED.email,
  department = EXCLUDED.department,
  avatar = EXCLUDED.avatar,
  title = EXCLUDED.title,
  password = EXCLUDED.password;

-- 2. Rooms (FCSIT 23 Spaces)
INSERT INTO public.rooms (id, name, code, category, capacity, floor, block, description, amenities, specs, high_resource, image_url, active_notice, reports, status)
VALUES ('lab-mm1', 'Micro Lab [MM1]', 'MM1', 'Computer Laboratories', 47, 'Level 1', 'Block A', 'This lab has 47 units of computer that are connected to Windows Active Directory servers and the Internet. The operating system for these PCs is Windows 10. This lab is opened to all FSKTM undergraduate students.', '["47 Windows 10 Workstations","Windows Active Directory Domain","High-Speed Internet Access","Air-Conditioned"]'::jsonb, '{"workstations":47,"screens":"Dual Ceiling Mounted Projectors","specialEquipment":"Windows 10 Enterprise, Active Directory Server Integration"}'::jsonb, false, 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80', NULL, '[]'::jsonb, 'Available')
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
INSERT INTO public.rooms (id, name, code, category, capacity, floor, block, description, amenities, specs, high_resource, image_url, active_notice, reports, status)
VALUES ('lab-mm2', 'Micro Lab 2 [MM2]', 'MM2', 'Computer Laboratories', 37, 'Level 1', 'Block A', 'This lab has 37 units of computer that are connected to Windows Active Directory servers and the Internet. The operating system for these PCs is Windows 10. This lab is opened to all FSKTM undergraduate students.', '["37 Windows 10 Workstations","Active Directory Domain Network","High-Speed Internet","Air-Conditioned"]'::jsonb, '{"workstations":37,"screens":"High-Lumen Presentation Display","specialEquipment":"Windows 10 Enterprise"}'::jsonb, false, 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80', NULL, '[]'::jsonb, 'Available')
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
INSERT INTO public.rooms (id, name, code, category, capacity, floor, block, description, amenities, specs, high_resource, image_url, active_notice, reports, status)
VALUES ('lab-ml', 'Postgraduate Lab [ML]', 'ML', 'Specialized & AI', 33, 'Level 2', 'Block A', 'This lab has 33 units of computer. All the computers are connected to Windows Active Directory servers and the Internet. The operating system for these PCs is Windows 10. This lab is opened to all FSKTM postgraduate students.', '["33 High-Performance Workstations","Active Directory Domain Servers","Research Software Suite","Air-Conditioned"]'::jsonb, '{"workstations":33,"screens":"Dual Wall Mounted Presentation Displays","specialEquipment":"Dedicated Postgraduate Research Sandbox"}'::jsonb, true, 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80', 'Postgraduate research environment: High-compute reservations require Supervisor Endorsement.', '[]'::jsonb, 'Available')
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
INSERT INTO public.rooms (id, name, code, category, capacity, floor, block, description, amenities, specs, high_resource, image_url, active_notice, reports, status)
VALUES ('lab-ccna', 'CCNA Lab', 'CCNA', 'Networking & Security', 41, 'Level 3', 'Block B', 'This lab has 41 units of computer. The operating system for these workstations is Windows 10. There are also 25 units of Cisco 1700 Series Router, 4 units Cisco 1760 Series Router and 12 units switch Cisco 2950 CATALYST Series. This lab is opened to all FSKTM students.', '["41 Windows 10 Workstations","25x Cisco 1700 Series Routers","4x Cisco 1760 Series Routers","12x Cisco 2950 Catalyst Switches"]'::jsonb, '{"workstations":41,"networkingGear":"25x Cisco 1700, 4x Cisco 1760, 12x Cisco Catalyst 2950 Switches","screens":"Ceiling Mounted High-Lumen Display","specialEquipment":"Cisco IOS & Packet Tracer Hardware Patch Benches"}'::jsonb, true, 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80', 'Hardware router & switch patching lab: Follow laboratory safety protocols.', '[]'::jsonb, 'Available')
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
INSERT INTO public.rooms (id, name, code, category, capacity, floor, block, description, amenities, specs, high_resource, image_url, active_notice, reports, status)
VALUES ('lab-robotic', 'Robotic Teaching Lab', 'ROBOTIC', 'Specialized & AI', 25, 'Level 2', 'Block B', 'The Robotic Teaching Lab @ FCSIT is part of the Department of Artificial Intelligence effort to provide conducive intelligent learning environment to students taking the ''Intelligent Robotics'' course. Equipped with six mobile robots, the lab allows space for hands-on and robotic experiments designed to help students understand the concept of robotic intelligence and acquire the needful skills for the course.', '["6x Mobile Autonomous Robots","Hands-On Robotics Arena","AI & Embedded Workstations","Sensor Interfacing Benches"]'::jsonb, '{"workstations":25,"screens":"Interactive Smart Board Display","specialEquipment":"6 Mobile Robots, ROS2 Navigation Testbed, Sensor Interfacing Equipment"}'::jsonb, true, 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80', 'Robotics hardware space: Department of Artificial Intelligence endorsement required.', '[]'::jsonb, 'Available')
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
INSERT INTO public.rooms (id, name, code, category, capacity, floor, block, description, amenities, specs, high_resource, image_url, active_notice, reports, status)
VALUES ('lab-bk1', 'Lecture Room 1 [BK1]', 'BK1', 'Lecture & Classrooms', 30, 'Level 1', 'Block B', 'The Lecture Room 1 is a classroom that is equipped with the teaching aid facilites. The room capacity is 30 pax.', '["Teaching Aid Facilities","High-Lumen Projector","Whiteboard Pods","Air-Conditioned"]'::jsonb, '{"workstations":30,"screens":"High-Lumen Presentation Projector"}'::jsonb, false, 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80', NULL, '[]'::jsonb, 'Available')
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
INSERT INTO public.rooms (id, name, code, category, capacity, floor, block, description, amenities, specs, high_resource, image_url, active_notice, reports, status)
VALUES ('lab-bk2', 'Lecture Room 2 [BK2] (Erasmus Tech Space)', 'BK2', 'Specialized & AI', 36, 'Level 1', 'Block B', 'The Lecture Room 2 is a classroom with a discussion 6 islands setting that is equipped with teaching facilities such as drones, 3D printer, laser cutter, PCB maker, raspberry pi, arduino and related sensors. This room is also known as Technology Enabled Learning Space where design thinking and active learning takes place. This equipment has been sponsored by the European Union under the Erasmus Grant. This lab is also open to students activities that use the related equipment.', '["6 Discussion Islands","Drones & UAV Test Pod","3D Printer & Laser Cutter","PCB Maker & Microcontroller Sensors","Erasmus Technology Enabled Space"]'::jsonb, '{"workstations":36,"screens":"Interactive Displays on Each Island","specialEquipment":"Erasmus Grant Drones, 3D Printer, Laser Cutter, PCB Maker, Arduino & Raspberry Pi Kits"}'::jsonb, true, 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80', 'Erasmus Technology Space: Rapid prototyping equipment requires officer sign-off.', '[]'::jsonb, 'Available')
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
INSERT INTO public.rooms (id, name, code, category, capacity, floor, block, description, amenities, specs, high_resource, image_url, active_notice, reports, status)
VALUES ('lab-mm3', 'Micro Lab 3 [MM3]', 'MM3', 'Computer Laboratories', 61, 'Level 2', 'Block A', 'This lab has 61 units of computer that are connected to Windows Active Directory servers and the Internet. This lab is opened to undergraduate and postgraduate students.', '["61 Windows 10 Workstations","Active Directory Domain","High-Speed Internet","Air-Conditioned"]'::jsonb, '{"workstations":61,"screens":"Dual Ceiling Projectors"}'::jsonb, false, 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80', NULL, '[]'::jsonb, 'Available')
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
INSERT INTO public.rooms (id, name, code, category, capacity, floor, block, description, amenities, specs, high_resource, image_url, active_notice, reports, status)
VALUES ('lab-mm4', 'Micro Lab 4 [MM4]', 'MM4', 'Computer Laboratories', 61, 'Level 2', 'Block A', 'This lab has 61 units of computer that are connected to Windows Active Directory servers and the Internet. This lab is opened to undergraduate and postgraduate students.', '["61 Windows 10 Workstations","Active Directory Domain","High-Speed Internet","Air-Conditioned"]'::jsonb, '{"workstations":61,"screens":"Dual Ceiling Projectors"}'::jsonb, false, 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80', NULL, '[]'::jsonb, 'Available')
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
INSERT INTO public.rooms (id, name, code, category, capacity, floor, block, description, amenities, specs, high_resource, image_url, active_notice, reports, status)
VALUES ('lab-ios', 'iOS Application Development Lab', 'IOS-LAB', 'Specialized & AI', 20, 'Level 3', 'Block A', 'This lab has 15 units of Apple iMac 21.5" Intel Core i5 (2.96GHz) Processor, 1TB HDD and 8GB RAM and 5 units of Dell OptiPlex 3050. This computer is connected to Windows Active Directory servers and the Internet. The operating system is Mac OS and Windows. This lab is opened only for Multimedia students.', '["15x Apple iMac 21.5\" Core i5","5x Dell OptiPlex 3050","macOS & Windows Dual-OS","Xcode & Swift Development Suite"]'::jsonb, '{"workstations":20,"screens":"Apple Retina Displays","specialEquipment":"Apple iMac 21.5\" i5 Workstations, Dell OptiPlex 3050, macOS & Windows"}'::jsonb, true, 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80', 'Apple iMac development studio: Priority reserved for Multimedia students.', '[]'::jsonb, 'Available')
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
INSERT INTO public.rooms (id, name, code, category, capacity, floor, block, description, amenities, specs, high_resource, image_url, active_notice, reports, status)
VALUES ('lab-mm6', 'Micro Lab 6 [MM6]', 'MM6', 'Computer Laboratories', 45, 'Level 3', 'Block A', 'This lab has 45 units of computer that are connected to Windows Active Directory servers and the Internet. This lab is opened to all FSKTM students but priority is given to multimedia courses. Operating system – Windows 10', '["45 Windows 10 Workstations","Active Directory Domain","Multimedia Software Priority","Air-Conditioned"]'::jsonb, '{"workstations":45,"screens":"Dual Wall Displays","specialEquipment":"Multimedia Software Suite, Windows 10"}'::jsonb, false, 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80', NULL, '[]'::jsonb, 'Available')
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
INSERT INTO public.rooms (id, name, code, category, capacity, floor, block, description, amenities, specs, high_resource, image_url, active_notice, reports, status)
VALUES ('lab-stroustrup1', 'Stroustrup Lab 1', 'STR1', 'Computer Laboratories', 42, 'Level 2', 'Block B', 'This lab has 42 units of computer that are connected to the Internet. This lab is opened to undergraduate students. Operating system – Windows 10.', '["42 Windows 10 Workstations","High-Speed Internet Access","Programming Compilers & IDEs","Air-Conditioned"]'::jsonb, '{"workstations":42,"screens":"High-Lumen Presentation Display"}'::jsonb, false, 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80', NULL, '[]'::jsonb, 'Available')
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
INSERT INTO public.rooms (id, name, code, category, capacity, floor, block, description, amenities, specs, high_resource, image_url, active_notice, reports, status)
VALUES ('lab-tr1-6', 'Tutorial Rooms 1-6', 'TR1-6', 'Lecture & Classrooms', 30, 'Level 1 & 2', 'Block B', 'There are 6 tutorial rooms in Block B. Each room is equipped with the teaching aids and it is being used by all students.', '["6 Dedicated Tutorial Rooms","Teaching Aids & Wall Projectors","Whiteboards","Flexible Classroom Seating"]'::jsonb, '{"workstations":30,"screens":"Wall Projectors"}'::jsonb, false, 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80', NULL, '[]'::jsonb, 'Available')
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
INSERT INTO public.rooms (id, name, code, category, capacity, floor, block, description, amenities, specs, high_resource, image_url, active_notice, reports, status)
VALUES ('lab-dk1', 'Lecture Hall 1 [DK1]', 'DK1', 'Lecture & Classrooms', 300, 'Level 1', 'Block A', 'This lecture hall can accomodate up to 300 pax at one time. It is equipped with the teaching aids and a comfortable space and environment for the users.', '["300 Pax Tiered Auditorium","Dual Cinema Projectors","Professional Sound & Microphone System","Lectern Display"]'::jsonb, '{"workstations":300,"screens":"Dual Cinema Projection Screens"}'::jsonb, true, 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80', 'Faculty Auditorium: Reservation requires administrative approval.', '[]'::jsonb, 'Available')
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
INSERT INTO public.rooms (id, name, code, category, capacity, floor, block, description, amenities, specs, high_resource, image_url, active_notice, reports, status)
VALUES ('lab-dk2', 'Lecture Hall 2 [DK2]', 'DK2', 'Lecture & Classrooms', 300, 'Level 2', 'Block A', 'This lecture hall can accomodate up to 300 pax at one time. It is equipped with the teaching aids and a comfortable space and environment for the users.', '["300 Pax Tiered Auditorium","Dual Cinema Projectors","Professional Sound & Microphone System","Lectern Display"]'::jsonb, '{"workstations":300,"screens":"Dual Cinema Projection Screens"}'::jsonb, true, 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=800&q=80', 'Faculty Auditorium: Reservation requires administrative approval.', '[]'::jsonb, 'Available')
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
INSERT INTO public.rooms (id, name, code, category, capacity, floor, block, description, amenities, specs, high_resource, image_url, active_notice, reports, status)
VALUES ('facility-surau', 'Surau (Block A)', 'SURAU', 'Student Amenities', 50, 'Level 1 (Women) & Level 2 (Men)', 'Block A', 'Air-conditioned prayer rooms (surau) (one for Men, and the other for Women) are provided in Block A for Muslims to pray. The surau for Men is located at the second floor and surau for women is located at the first floor in the building. Users are not allowed to sleep and eat in the surau. Users are also responsible for the cleanliness of the surau.', '["Ablution Facilities (Wudhu)","Air-Conditioned","Prayer Mats & Quran Racks","Separate Men & Women Floors"]'::jsonb, '{"workstations":0,"screens":"Digital Prayer Time Callout"}'::jsonb, false, 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80', NULL, '[]'::jsonb, 'Available')
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
INSERT INTO public.rooms (id, name, code, category, capacity, floor, block, description, amenities, specs, high_resource, image_url, active_notice, reports, status)
VALUES ('facility-cafe', 'Faculty Cafeteria', 'CAFE', 'Student Amenities', 100, 'Ground Floor', 'Block A (Rear)', 'Cafeteria is located at the back of Block A.', '["Food & Beverage Stalls","Spacious Seating","Outdoor Garden Ambience","Handwashing Stations"]'::jsonb, '{"workstations":0,"screens":"Menu & Order Callout Displays"}'::jsonb, false, 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80', NULL, '[]'::jsonb, 'Available')
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
INSERT INTO public.rooms (id, name, code, category, capacity, floor, block, description, amenities, specs, high_resource, image_url, active_notice, reports, status)
VALUES ('lab-pg-lounge', 'Postgraduate Lounge', 'PG-LOUNGE', 'Student Amenities', 25, 'Level 2', 'Block A', 'Space provided for student to relaxing their mind, having informal discussion and make a small gathering. A few facilities such as sofas, computers, discussion rooms and pantry are ready to use.', '["Relaxing Sofas","Discussion Pods","Pantry & Coffee Machine","Dedicated Computer Desks"]'::jsonb, '{"workstations":6,"screens":"Smart TV Screen"}'::jsonb, false, 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80', NULL, '[]'::jsonb, 'Available')
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
INSERT INTO public.rooms (id, name, code, category, capacity, floor, block, description, amenities, specs, high_resource, image_url, active_notice, reports, status)
VALUES ('lab-the-cube', 'The Cube', 'THE-CUBE', 'Lecture & Classrooms', 30, 'Level 1', 'Block A', 'The CUBE is a multipurpose room that is equipped with the teaching aid facilites such as a set of desktop computer,a multimedia projector, foldable table and chairs. The capacity of the room is 30 pax at one time. The room is fully air conditioned.', '["Desktop Computer Set","Multimedia Projector","Foldable Tables & Chairs","Fully Air-Conditioned"]'::jsonb, '{"workstations":1,"screens":"Multimedia Presentation Projector"}'::jsonb, false, 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=800&q=80', NULL, '[]'::jsonb, 'Available')
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
INSERT INTO public.rooms (id, name, code, category, capacity, floor, block, description, amenities, specs, high_resource, image_url, active_notice, reports, status)
VALUES ('lab-discussion-rm', 'Discussion Room', 'DISCUSS-RM', 'Student Amenities', 12, 'Level 1', 'Block A', 'Discussion Room is located at the first Floor of Block A. This room is for students to do a group discussion at any time.', '["Group Discussion Table","Ergonomic Chairs","Glass Whiteboard","Power Sockets"]'::jsonb, '{"workstations":0,"screens":"Wall Mounted Presentation Screen"}'::jsonb, false, 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80', NULL, '[]'::jsonb, 'Available')
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
INSERT INTO public.rooms (id, name, code, category, capacity, floor, block, description, amenities, specs, high_resource, image_url, active_notice, reports, status)
VALUES ('facility-parking', 'Faculty Parking Lots', 'PARKING', 'Student Amenities', 195, 'Ground / Outdoor', 'Block A (Rear)', 'The Faculty also provides parking lots for students to park their car or motorbike. Students can park their car or motorbike at the back of Block A. There are 150 parking lots for the motorbike and 45 for the car. Students are not allowed to park their car in front of both buildings because the parking lots are reserved for the faculty staff and visitors.', '["150 Motorbike Parking Lots","45 Car Parking Lots","CCTV Security Coverage","Illuminated Night Lighting"]'::jsonb, '{"workstations":0,"screens":"Parking Lot Guidance Board"}'::jsonb, false, 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80', NULL, '[]'::jsonb, 'Available')
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
INSERT INTO public.rooms (id, name, code, category, capacity, floor, block, description, amenities, specs, high_resource, image_url, active_notice, reports, status)
VALUES ('facility-wifi', 'Internet Access (WiFi Infrastructure)', 'WIFI-ACCESS', 'Networking & Security', 500, 'All Floors', 'Block A & Block B', 'There are WIFI Internet Access provided to students at every floor in each building. Students must obey the rules and regulations during the usage of these facilities', '["Campus-Wide High-Speed Wi-Fi","Dual-Band 2.4GHz / 5GHz","802.1X Enterprise Authentication","Coverage across Block A & B"]'::jsonb, '{"workstations":0,"screens":"Network Operations Telemetry"}'::jsonb, false, 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80', NULL, '[]'::jsonb, 'Available')
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
INSERT INTO public.rooms (id, name, code, category, capacity, floor, block, description, amenities, specs, high_resource, image_url, active_notice, reports, status)
VALUES ('facility-vending', 'Vending Machine Kiosks', 'VENDING', 'Student Amenities', 10, 'Ground Floor & Lobbies', 'Block A & B', 'Vending machines are provided across faculty lobbies and student rest zones for chilled beverages and refreshments.', '["Cashless QR Payment / Touch ''n Go","Chilled Drinks & Quick Snacks","24/7 Availability"]'::jsonb, '{"workstations":0,"screens":"Digital Pricing Panel"}'::jsonb, false, 'https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?auto=format&fit=crop&w=800&q=80', NULL, '[]'::jsonb, 'Available')
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

-- 3. Hardware Inventory
INSERT INTO public.hardware (id, name, model, tag, serial_number, category, total_units, available_units, health_percentage, status, current_borrower, specs, location, defects, loan_history, image_url, bundle_tag)
VALUES ('hw-jetson-orin-01', 'NVIDIA Jetson Orin Nano Developer Kit (8GB)', 'Orin Nano 8GB Module w/ Carrier Board', 'FCSIT-HW-JET-01', 'SN-NV-ORIN-9421', 'Edge AI & Dev Kits', 5, 5, 100, 'Available', NULL, '["Ampere GPU w/ 1024 CUDA Cores","40 TOPS AI Performance","8GB 128-bit LPDDR5 Memory","JetPack 6.0 SDK flashed on 128GB NVMe"]'::jsonb, 'Locker B2-Cabinet 3', '[]'::jsonb, '[]'::jsonb, 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80', 'AI Vision Edge Kit')
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
INSERT INTO public.hardware (id, name, model, tag, serial_number, category, total_units, available_units, health_percentage, status, current_borrower, specs, location, defects, loan_history, image_url, bundle_tag)
VALUES ('hw-rpi4-kit-02', 'Raspberry Pi 4 Model B (8GB) Complete Lab Kit', 'Pi 4B 8GB + Aluminium Armor Case + 64GB Extreme SD', 'FCSIT-HW-RPI-04', 'SN-RPI4-8G-1049', 'Microcontrollers', 12, 12, 100, 'Available', NULL, '["Broadcom BCM2711 Quad-core Cortex-A72","8GB LPDDR4-3200 SDRAM","Dual micro-HDMI 4K60 ports","Official USB-C 15.3W Power Adapter included"]'::jsonb, 'Locker B1-Rack 1', '[]'::jsonb, '[]'::jsonb, 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?auto=format&fit=crop&w=600&q=80', 'Embedded IoT Kit')
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
INSERT INTO public.hardware (id, name, model, tag, serial_number, category, total_units, available_units, health_percentage, status, current_borrower, specs, location, defects, loan_history, image_url, bundle_tag)
VALUES ('hw-rigol-osc-03', 'Rigol DS1054Z 50MHz Digital Oscilloscope (4 Channels)', 'DS1054Z 4-Ch 1GSa/s UltraVision', 'FCSIT-HW-OSC-02', 'SN-RIGOL-4412-MY', 'Testing & Measurement', 6, 6, 100, 'Available', NULL, '["50 MHz Bandwidth, 4 Analog Channels","1 GSa/s Real-time Sample Rate","24 Mpts Standard Memory Depth","4x 150MHz Passive Probes (PVP2150) included"]'::jsonb, 'Cabinet T-04 (Locked)', '[]'::jsonb, '[]'::jsonb, 'https://images.unsplash.com/photo-1581092162384-8987c1d64718?auto=format&fit=crop&w=600&q=80', NULL)
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
INSERT INTO public.hardware (id, name, model, tag, serial_number, category, total_units, available_units, health_percentage, status, current_borrower, specs, location, defects, loan_history, image_url, bundle_tag)
VALUES ('hw-realsense-04', 'Intel RealSense D435i Depth Camera + Mini Tripod', 'D435i Stereo Depth w/ Built-in IMU', 'FCSIT-HW-CAM-03', 'SN-INTEL-RS-3021', 'Sensors & Bundles', 4, 4, 100, 'Available', NULL, '["Stereo Depth Technology with Active IR Projector","RGB Sensor 1920x1080 @ 30fps","Integrated Bosch BMI055 6-DoF IMU","High-flex USB-C 3.1 1.5m Cable"]'::jsonb, 'Locker B2-Cabinet 2', '[]'::jsonb, '[]'::jsonb, 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80', 'AI Vision Edge Kit')
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
INSERT INTO public.hardware (id, name, model, tag, serial_number, category, total_units, available_units, health_percentage, status, current_borrower, specs, location, defects, loan_history, image_url, bundle_tag)
VALUES ('hw-arduino-mega-05', 'Arduino Mega 2560 R3 Ultimate Sensor Starter Pack', 'ATmega2560 Original Board + 37 Sensor Modules Kit', 'FCSIT-HW-ARD-09', 'SN-ARD-MEGA-0881', 'Microcontrollers', 15, 15, 100, 'Available', NULL, '["54 Digital I/O Pins (15 PWM outputs)","16 Analog Inputs, 4 UART Hardware Serial Ports","37 Sensor Module Pack in Plastic Organizer Box","Breadboard, Jumper Wires & 9V Power Supply"]'::jsonb, 'Locker B1-Bin 4', '[]'::jsonb, '[]'::jsonb, 'https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=600&q=80', NULL)
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
INSERT INTO public.hardware (id, name, model, tag, serial_number, category, total_units, available_units, health_percentage, status, current_borrower, specs, location, defects, loan_history, image_url, bundle_tag)
VALUES ('hw-esp32-node-06', 'ESP32-WROOM Dual Core IoT Environmental Sensor Node', 'ESP32 DevKitC V4 + BME280 + OLED + LoRa Shield', 'FCSIT-HW-ESP-12', 'SN-ESP32-IOT-9943', 'Sensors & Bundles', 10, 10, 100, 'Available', NULL, '["Tensilica Xtensa Dual-Core 32-bit LX6 Microprocessor","Wi-Fi 802.11 b/g/n & BLE 4.2","BME280 Temperature, Humidity & Barometric Pressure","SX1276 915MHz LoRa Transceiver"]'::jsonb, 'Locker B1-Bin 6', '[]'::jsonb, '[]'::jsonb, 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80', 'Embedded IoT Kit')
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

-- 4. Initial Audit Logs
INSERT INTO public.audit_logs (id, timestamp, actor, actor_role, action, details, category)
VALUES ('log-001', 'System Initialization', 'LabPulse Security Engine', 'system', 'System Initialized', 'Production laboratory resource management environment initialized with clean state.', 'system')
ON CONFLICT (id) DO NOTHING;

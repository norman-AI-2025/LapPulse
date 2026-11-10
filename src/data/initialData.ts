import { 
  UserProfile, 
  LabRoom, 
  LabBooking, 
  HardwareItem, 
  HardwareLoan, 
  WaitlistEntry, 
  AuditLog, 
  HardwareBundleTemplate,
  PulseNotification,
  MaintenanceReport 
} from '../types';

export const USERS: Record<string, UserProfile> = {
  student: {
    id: 'usr_student',
    name: 'Student User',
    role: 'student',
    matricOrStaffId: '25005870',
    email: 'student@siswa.um.edu.my',
    department: 'Department of Software Engineering, FCSIT',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    title: 'FCSIT Undergraduate Student',
    password: 'password123'
  },
  lecturer: {
    id: 'usr_staff',
    name: 'Staff User',
    role: 'lecturer',
    matricOrStaffId: 'UM-STAFF-19842',
    email: 'staff@um.edu.my',
    department: 'Department of Artificial Intelligence, FCSIT',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
    title: 'Associate Professor & Academic Supervisor',
    password: 'password123'
  },
  admin: {
    id: 'usr_officer',
    name: 'Officer User',
    role: 'admin',
    matricOrStaffId: 'UM-OFFICER-0419',
    email: 'officer@um.edu.my',
    department: 'Central Laboratory Operations & Technical Management',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
    title: 'Senior Laboratory Technical Officer',
    password: 'password123'
  }
};

export const INITIAL_ROOMS: LabRoom[] = [
  // 1. Micro Lab [MM1]
  {
    id: 'lab-mm1',
    name: 'Micro Lab [MM1]',
    code: 'MM1',
    category: 'Computer Laboratories',
    capacity: 47,
    floor: 'Level 1',
    block: 'Block A',
    description: 'This lab has 47 units of computer that are connected to Windows Active Directory servers and the Internet. The operating system for these PCs is Windows 10. This lab is opened to all FSKTM undergraduate students.',
    amenities: ['47 Windows 10 Workstations', 'Windows Active Directory Domain', 'High-Speed Internet Access', 'Air-Conditioned'],
    specs: {
      workstations: 47,
      screens: 'Dual Ceiling Mounted Projectors',
      specialEquipment: 'Windows 10 Enterprise, Active Directory Server Integration'
    },
    highResource: false,
    imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
    reports: []
  },

  // 2. Micro Lab 2 [MM2]
  {
    id: 'lab-mm2',
    name: 'Micro Lab 2 [MM2]',
    code: 'MM2',
    category: 'Computer Laboratories',
    capacity: 37,
    floor: 'Level 1',
    block: 'Block A',
    description: 'This lab has 37 units of computer that are connected to Windows Active Directory servers and the Internet. The operating system for these PCs is Windows 10. This lab is opened to all FSKTM undergraduate students.',
    amenities: ['37 Windows 10 Workstations', 'Active Directory Domain Network', 'High-Speed Internet', 'Air-Conditioned'],
    specs: {
      workstations: 37,
      screens: 'High-Lumen Presentation Display',
      specialEquipment: 'Windows 10 Enterprise'
    },
    highResource: false,
    imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
    reports: []
  },

  // 3. Postgraduate Lab [ML]
  {
    id: 'lab-ml',
    name: 'Postgraduate Lab [ML]',
    code: 'ML',
    category: 'Specialized & AI',
    capacity: 33,
    floor: 'Level 2',
    block: 'Block A',
    description: 'This lab has 33 units of computer. All the computers are connected to Windows Active Directory servers and the Internet. The operating system for these PCs is Windows 10. This lab is opened to all FSKTM postgraduate students.',
    amenities: ['33 High-Performance Workstations', 'Active Directory Domain Servers', 'Research Software Suite', 'Air-Conditioned'],
    specs: {
      workstations: 33,
      screens: 'Dual Wall Mounted Presentation Displays',
      specialEquipment: 'Dedicated Postgraduate Research Sandbox'
    },
    highResource: true,
    activeNotice: 'Postgraduate research environment: High-compute reservations require Supervisor Endorsement.',
    imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
    reports: []
  },

  // 4. CCNA Lab
  {
    id: 'lab-ccna',
    name: 'CCNA Lab',
    code: 'CCNA',
    category: 'Networking & Security',
    capacity: 41,
    floor: 'Level 3',
    block: 'Block B',
    description: 'This lab has 41 units of computer. The operating system for these workstations is Windows 10. There are also 25 units of Cisco 1700 Series Router, 4 units Cisco 1760 Series Router and 12 units switch Cisco 2950 CATALYST Series. This lab is opened to all FSKTM students.',
    amenities: ['41 Windows 10 Workstations', '25x Cisco 1700 Series Routers', '4x Cisco 1760 Series Routers', '12x Cisco 2950 Catalyst Switches'],
    specs: {
      workstations: 41,
      networkingGear: '25x Cisco 1700, 4x Cisco 1760, 12x Cisco Catalyst 2950 Switches',
      screens: 'Ceiling Mounted High-Lumen Display',
      specialEquipment: 'Cisco IOS & Packet Tracer Hardware Patch Benches'
    },
    highResource: true,
    activeNotice: 'Hardware router & switch patching lab: Follow laboratory safety protocols.',
    imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
    reports: []
  },

  // 5. Robotic Lab
  {
    id: 'lab-robotic',
    name: 'Robotic Teaching Lab',
    code: 'ROBOTIC',
    category: 'Specialized & AI',
    capacity: 25,
    floor: 'Level 2',
    block: 'Block B',
    description: "The Robotic Teaching Lab @ FCSIT is part of the Department of Artificial Intelligence effort to provide conducive intelligent learning environment to students taking the 'Intelligent Robotics' course. Equipped with six mobile robots, the lab allows space for hands-on and robotic experiments designed to help students understand the concept of robotic intelligence and acquire the needful skills for the course.",
    amenities: ['6x Mobile Autonomous Robots', 'Hands-On Robotics Arena', 'AI & Embedded Workstations', 'Sensor Interfacing Benches'],
    specs: {
      workstations: 25,
      screens: 'Interactive Smart Board Display',
      specialEquipment: '6 Mobile Robots, ROS2 Navigation Testbed, Sensor Interfacing Equipment'
    },
    highResource: true,
    activeNotice: 'Robotics hardware space: Department of Artificial Intelligence endorsement required.',
    imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80',
    reports: []
  },

  // 6. Lecture Room 1 [BK1]
  {
    id: 'lab-bk1',
    name: 'Lecture Room 1 [BK1]',
    code: 'BK1',
    category: 'Lecture & Classrooms',
    capacity: 30,
    floor: 'Level 1',
    block: 'Block B',
    description: 'The Lecture Room 1 is a classroom that is equipped with the teaching aid facilites. The room capacity is 30 pax.',
    amenities: ['Teaching Aid Facilities', 'High-Lumen Projector', 'Whiteboard Pods', 'Air-Conditioned'],
    specs: {
      workstations: 30,
      screens: 'High-Lumen Presentation Projector'
    },
    highResource: false,
    imageUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    reports: []
  },

  // 7. Lecture Room 2 [BK2]
  {
    id: 'lab-bk2',
    name: 'Lecture Room 2 [BK2] (Erasmus Tech Space)',
    code: 'BK2',
    category: 'Specialized & AI',
    capacity: 36,
    floor: 'Level 1',
    block: 'Block B',
    description: 'The Lecture Room 2 is a classroom with a discussion 6 islands setting that is equipped with teaching facilities such as drones, 3D printer, laser cutter, PCB maker, raspberry pi, arduino and related sensors. This room is also known as Technology Enabled Learning Space where design thinking and active learning takes place. This equipment has been sponsored by the European Union under the Erasmus Grant. This lab is also open to students activities that use the related equipment.',
    amenities: ['6 Discussion Islands', 'Drones & UAV Test Pod', '3D Printer & Laser Cutter', 'PCB Maker & Microcontroller Sensors', 'Erasmus Technology Enabled Space'],
    specs: {
      workstations: 36,
      screens: 'Interactive Displays on Each Island',
      specialEquipment: 'Erasmus Grant Drones, 3D Printer, Laser Cutter, PCB Maker, Arduino & Raspberry Pi Kits'
    },
    highResource: true,
    activeNotice: 'Erasmus Technology Space: Rapid prototyping equipment requires officer sign-off.',
    imageUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
    reports: []
  },

  // 8. Micro Lab 3 [MM3]
  {
    id: 'lab-mm3',
    name: 'Micro Lab 3 [MM3]',
    code: 'MM3',
    category: 'Computer Laboratories',
    capacity: 61,
    floor: 'Level 2',
    block: 'Block A',
    description: 'This lab has 61 units of computer that are connected to Windows Active Directory servers and the Internet. This lab is opened to undergraduate and postgraduate students.',
    amenities: ['61 Windows 10 Workstations', 'Active Directory Domain', 'High-Speed Internet', 'Air-Conditioned'],
    specs: {
      workstations: 61,
      screens: 'Dual Ceiling Projectors'
    },
    highResource: false,
    imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
    reports: []
  },

  // 9. Micro Lab 4 [MM4]
  {
    id: 'lab-mm4',
    name: 'Micro Lab 4 [MM4]',
    code: 'MM4',
    category: 'Computer Laboratories',
    capacity: 61,
    floor: 'Level 2',
    block: 'Block A',
    description: 'This lab has 61 units of computer that are connected to Windows Active Directory servers and the Internet. This lab is opened to undergraduate and postgraduate students.',
    amenities: ['61 Windows 10 Workstations', 'Active Directory Domain', 'High-Speed Internet', 'Air-Conditioned'],
    specs: {
      workstations: 61,
      screens: 'Dual Ceiling Projectors'
    },
    highResource: false,
    imageUrl: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80',
    reports: []
  },

  // 10. iOS Application Development Lab
  {
    id: 'lab-ios',
    name: 'iOS Application Development Lab',
    code: 'IOS-LAB',
    category: 'Specialized & AI',
    capacity: 20,
    floor: 'Level 3',
    block: 'Block A',
    description: 'This lab has 15 units of Apple iMac 21.5" Intel Core i5 (2.96GHz) Processor, 1TB HDD and 8GB RAM and 5 units of Dell OptiPlex 3050. This computer is connected to Windows Active Directory servers and the Internet. The operating system is Mac OS and Windows. This lab is opened only for Multimedia students.',
    amenities: ['15x Apple iMac 21.5" Core i5', '5x Dell OptiPlex 3050', 'macOS & Windows Dual-OS', 'Xcode & Swift Development Suite'],
    specs: {
      workstations: 20,
      screens: 'Apple Retina Displays',
      specialEquipment: 'Apple iMac 21.5" i5 Workstations, Dell OptiPlex 3050, macOS & Windows'
    },
    highResource: true,
    activeNotice: 'Apple iMac development studio: Priority reserved for Multimedia students.',
    imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
    reports: []
  },

  // 11. Micro Lab 6 [MM6]
  {
    id: 'lab-mm6',
    name: 'Micro Lab 6 [MM6]',
    code: 'MM6',
    category: 'Computer Laboratories',
    capacity: 45,
    floor: 'Level 3',
    block: 'Block A',
    description: 'This lab has 45 units of computer that are connected to Windows Active Directory servers and the Internet. This lab is opened to all FSKTM students but priority is given to multimedia courses. Operating system – Windows 10',
    amenities: ['45 Windows 10 Workstations', 'Active Directory Domain', 'Multimedia Software Priority', 'Air-Conditioned'],
    specs: {
      workstations: 45,
      screens: 'Dual Wall Displays',
      specialEquipment: 'Multimedia Software Suite, Windows 10'
    },
    highResource: false,
    imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
    reports: []
  },

  // 12. Stroustrup Lab 1
  {
    id: 'lab-stroustrup1',
    name: 'Stroustrup Lab 1',
    code: 'STR1',
    category: 'Computer Laboratories',
    capacity: 42,
    floor: 'Level 2',
    block: 'Block B',
    description: 'This lab has 42 units of computer that are connected to the Internet. This lab is opened to undergraduate students. Operating system – Windows 10.',
    amenities: ['42 Windows 10 Workstations', 'High-Speed Internet Access', 'Programming Compilers & IDEs', 'Air-Conditioned'],
    specs: {
      workstations: 42,
      screens: 'High-Lumen Presentation Display'
    },
    highResource: false,
    imageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80',
    reports: []
  },

  // 13. Tutorial Room 1-6
  {
    id: 'lab-tr1-6',
    name: 'Tutorial Rooms 1-6',
    code: 'TR1-6',
    category: 'Lecture & Classrooms',
    capacity: 30,
    floor: 'Level 1 & 2',
    block: 'Block B',
    description: 'There are 6 tutorial rooms in Block B. Each room is equipped with the teaching aids and it is being used by all students.',
    amenities: ['6 Dedicated Tutorial Rooms', 'Teaching Aids & Wall Projectors', 'Whiteboards', 'Flexible Classroom Seating'],
    specs: {
      workstations: 30,
      screens: 'Wall Projectors'
    },
    highResource: false,
    imageUrl: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80',
    reports: []
  },

  // 14. Lecture Hall 1 [DK1]
  {
    id: 'lab-dk1',
    name: 'Lecture Hall 1 [DK1]',
    code: 'DK1',
    category: 'Lecture & Classrooms',
    capacity: 300,
    floor: 'Level 1',
    block: 'Block A',
    description: 'This lecture hall can accomodate up to 300 pax at one time. It is equipped with the teaching aids and a comfortable space and environment for the users.',
    amenities: ['300 Pax Tiered Auditorium', 'Dual Cinema Projectors', 'Professional Sound & Microphone System', 'Lectern Display'],
    specs: {
      workstations: 300,
      screens: 'Dual Cinema Projection Screens'
    },
    highResource: true,
    activeNotice: 'Faculty Auditorium: Reservation requires administrative approval.',
    imageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80',
    reports: []
  },

  // 15. Lecture Hall 2 [DK2]
  {
    id: 'lab-dk2',
    name: 'Lecture Hall 2 [DK2]',
    code: 'DK2',
    category: 'Lecture & Classrooms',
    capacity: 300,
    floor: 'Level 2',
    block: 'Block A',
    description: 'This lecture hall can accomodate up to 300 pax at one time. It is equipped with the teaching aids and a comfortable space and environment for the users.',
    amenities: ['300 Pax Tiered Auditorium', 'Dual Cinema Projectors', 'Professional Sound & Microphone System', 'Lectern Display'],
    specs: {
      workstations: 300,
      screens: 'Dual Cinema Projection Screens'
    },
    highResource: true,
    activeNotice: 'Faculty Auditorium: Reservation requires administrative approval.',
    imageUrl: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=800&q=80',
    reports: []
  },

  // 16. Surau
  {
    id: 'facility-surau',
    name: 'Surau (Block A)',
    code: 'SURAU',
    category: 'Student Amenities',
    capacity: 50,
    floor: 'Level 1 (Women) & Level 2 (Men)',
    block: 'Block A',
    description: 'Air-conditioned prayer rooms (surau) (one for Men, and the other for Women) are provided in Block A for Muslims to pray. The surau for Men is located at the second floor and surau for women is located at the first floor in the building. Users are not allowed to sleep and eat in the surau. Users are also responsible for the cleanliness of the surau.',
    amenities: ['Ablution Facilities (Wudhu)', 'Air-Conditioned', 'Prayer Mats & Quran Racks', 'Separate Men & Women Floors'],
    specs: {
      workstations: 0,
      screens: 'Digital Prayer Time Callout'
    },
    highResource: false,
    imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
    reports: []
  },

  // 17. Cafeteria
  {
    id: 'facility-cafe',
    name: 'Faculty Cafeteria',
    code: 'CAFE',
    category: 'Student Amenities',
    capacity: 100,
    floor: 'Ground Floor',
    block: 'Block A (Rear)',
    description: 'Cafeteria is located at the back of Block A.',
    amenities: ['Food & Beverage Stalls', 'Spacious Seating', 'Outdoor Garden Ambience', 'Handwashing Stations'],
    specs: {
      workstations: 0,
      screens: 'Menu & Order Callout Displays'
    },
    highResource: false,
    imageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80',
    reports: []
  },

  // 18. Postgraduate Lounge
  {
    id: 'lab-pg-lounge',
    name: 'Postgraduate Lounge',
    code: 'PG-LOUNGE',
    category: 'Student Amenities',
    capacity: 25,
    floor: 'Level 2',
    block: 'Block A',
    description: 'Space provided for student to relaxing their mind, having informal discussion and make a small gathering. A few facilities such as sofas, computers, discussion rooms and pantry are ready to use.',
    amenities: ['Relaxing Sofas', 'Discussion Pods', 'Pantry & Coffee Machine', 'Dedicated Computer Desks'],
    specs: {
      workstations: 6,
      screens: 'Smart TV Screen'
    },
    highResource: false,
    imageUrl: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80',
    reports: []
  },

  // 19. The Cube
  {
    id: 'lab-the-cube',
    name: 'The Cube',
    code: 'THE-CUBE',
    category: 'Lecture & Classrooms',
    capacity: 30,
    floor: 'Level 1',
    block: 'Block A',
    description: 'The CUBE is a multipurpose room that is equipped with the teaching aid facilites such as a set of desktop computer,a multimedia projector, foldable table and chairs. The capacity of the room is 30 pax at one time. The room is fully air conditioned.',
    amenities: ['Desktop Computer Set', 'Multimedia Projector', 'Foldable Tables & Chairs', 'Fully Air-Conditioned'],
    specs: {
      workstations: 1,
      screens: 'Multimedia Presentation Projector'
    },
    highResource: false,
    imageUrl: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=800&q=80',
    reports: []
  },

  // 20. Discussion Room
  {
    id: 'lab-discussion-rm',
    name: 'Discussion Room',
    code: 'DISCUSS-RM',
    category: 'Student Amenities',
    capacity: 12,
    floor: 'Level 1',
    block: 'Block A',
    description: 'Discussion Room is located at the first Floor of Block A. This room is for students to do a group discussion at any time.',
    amenities: ['Group Discussion Table', 'Ergonomic Chairs', 'Glass Whiteboard', 'Power Sockets'],
    specs: {
      workstations: 0,
      screens: 'Wall Mounted Presentation Screen'
    },
    highResource: false,
    imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
    reports: []
  },

  // 21. Parking
  {
    id: 'facility-parking',
    name: 'Faculty Parking Lots',
    code: 'PARKING',
    category: 'Student Amenities',
    capacity: 195,
    floor: 'Ground / Outdoor',
    block: 'Block A (Rear)',
    description: 'The Faculty also provides parking lots for students to park their car or motorbike. Students can park their car or motorbike at the back of Block A. There are 150 parking lots for the motorbike and 45 for the car. Students are not allowed to park their car in front of both buildings because the parking lots are reserved for the faculty staff and visitors.',
    amenities: ['150 Motorbike Parking Lots', '45 Car Parking Lots', 'CCTV Security Coverage', 'Illuminated Night Lighting'],
    specs: {
      workstations: 0,
      screens: 'Parking Lot Guidance Board'
    },
    highResource: false,
    imageUrl: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80',
    reports: []
  },

  // 22. Internet Access
  {
    id: 'facility-wifi',
    name: 'Internet Access (WiFi Infrastructure)',
    code: 'WIFI-ACCESS',
    category: 'Networking & Security',
    capacity: 500,
    floor: 'All Floors',
    block: 'Block A & Block B',
    description: 'There are WIFI Internet Access provided to students at every floor in each building. Students must obey the rules and regulations during the usage of these facilities',
    amenities: ['Campus-Wide High-Speed Wi-Fi', 'Dual-Band 2.4GHz / 5GHz', '802.1X Enterprise Authentication', 'Coverage across Block A & B'],
    specs: {
      workstations: 0,
      screens: 'Network Operations Telemetry'
    },
    highResource: false,
    imageUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80',
    reports: []
  },

  // 23. Vending Machine
  {
    id: 'facility-vending',
    name: 'Vending Machine Kiosks',
    code: 'VENDING',
    category: 'Student Amenities',
    capacity: 10,
    floor: 'Ground Floor & Lobbies',
    block: 'Block A & B',
    description: 'Vending machines are provided across faculty lobbies and student rest zones for chilled beverages and refreshments.',
    amenities: ["Cashless QR Payment / Touch 'n Go", 'Chilled Drinks & Quick Snacks', '24/7 Availability'],
    specs: {
      workstations: 0,
      screens: 'Digital Pricing Panel'
    },
    highResource: false,
    imageUrl: 'https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?auto=format&fit=crop&w=800&q=80',
    reports: []
  }
];

export const INITIAL_HARDWARE: HardwareItem[] = [
  {
    id: 'hw-jetson-orin-01',
    name: 'NVIDIA Jetson Orin Nano Developer Kit (8GB)',
    model: 'Orin Nano 8GB Module w/ Carrier Board',
    tag: 'FCSIT-HW-JET-01',
    serialNumber: 'SN-NV-ORIN-9421',
    category: 'Edge AI & Dev Kits',
    totalUnits: 5,
    availableUnits: 5,
    healthPercentage: 100,
    status: 'Available',
    specs: [
      'Ampere GPU w/ 1024 CUDA Cores',
      '40 TOPS AI Performance',
      '8GB 128-bit LPDDR5 Memory',
      'JetPack 6.0 SDK flashed on 128GB NVMe'
    ],
    location: 'Locker B2-Cabinet 3',
    defects: [],
    loanHistory: [],
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
    bundleTag: 'AI Vision Edge Kit'
  },
  {
    id: 'hw-rpi4-kit-02',
    name: 'Raspberry Pi 4 Model B (8GB) Complete Lab Kit',
    model: 'Pi 4B 8GB + Aluminium Armor Case + 64GB Extreme SD',
    tag: 'FCSIT-HW-RPI-04',
    serialNumber: 'SN-RPI4-8G-1049',
    category: 'Microcontrollers',
    totalUnits: 12,
    availableUnits: 12,
    healthPercentage: 100,
    status: 'Available',
    specs: [
      'Broadcom BCM2711 Quad-core Cortex-A72',
      '8GB LPDDR4-3200 SDRAM',
      'Dual micro-HDMI 4K60 ports',
      'Official USB-C 15.3W Power Adapter included'
    ],
    location: 'Locker B1-Rack 1',
    defects: [],
    loanHistory: [],
    imageUrl: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?auto=format&fit=crop&w=600&q=80',
    bundleTag: 'Embedded IoT Kit'
  },
  {
    id: 'hw-rigol-osc-03',
    name: 'Rigol DS1054Z 50MHz Digital Oscilloscope (4 Channels)',
    model: 'DS1054Z 4-Ch 1GSa/s UltraVision',
    tag: 'FCSIT-HW-OSC-02',
    serialNumber: 'SN-RIGOL-4412-MY',
    category: 'Testing & Measurement',
    totalUnits: 6,
    availableUnits: 6,
    healthPercentage: 100,
    status: 'Available',
    specs: [
      '50 MHz Bandwidth, 4 Analog Channels',
      '1 GSa/s Real-time Sample Rate',
      '24 Mpts Standard Memory Depth',
      '4x 150MHz Passive Probes (PVP2150) included'
    ],
    location: 'Cabinet T-04 (Locked)',
    defects: [],
    loanHistory: [],
    imageUrl: 'https://images.unsplash.com/photo-1581092162384-8987c1d64718?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'hw-realsense-04',
    name: 'Intel RealSense D435i Depth Camera + Mini Tripod',
    model: 'D435i Stereo Depth w/ Built-in IMU',
    tag: 'FCSIT-HW-CAM-03',
    serialNumber: 'SN-INTEL-RS-3021',
    category: 'Sensors & Bundles',
    totalUnits: 4,
    availableUnits: 4,
    healthPercentage: 100,
    status: 'Available',
    specs: [
      'Stereo Depth Technology with Active IR Projector',
      'RGB Sensor 1920x1080 @ 30fps',
      'Integrated Bosch BMI055 6-DoF IMU',
      'High-flex USB-C 3.1 1.5m Cable'
    ],
    location: 'Locker B2-Cabinet 2',
    defects: [],
    loanHistory: [],
    imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80',
    bundleTag: 'AI Vision Edge Kit'
  },
  {
    id: 'hw-arduino-mega-05',
    name: 'Arduino Mega 2560 R3 Ultimate Sensor Starter Pack',
    model: 'ATmega2560 Original Board + 37 Sensor Modules Kit',
    tag: 'FCSIT-HW-ARD-09',
    serialNumber: 'SN-ARD-MEGA-0881',
    category: 'Microcontrollers',
    totalUnits: 15,
    availableUnits: 15,
    healthPercentage: 100,
    status: 'Available',
    specs: [
      '54 Digital I/O Pins (15 PWM outputs)',
      '16 Analog Inputs, 4 UART Hardware Serial Ports',
      '37 Sensor Module Pack in Plastic Organizer Box',
      'Breadboard, Jumper Wires & 9V Power Supply'
    ],
    location: 'Locker B1-Bin 4',
    defects: [],
    loanHistory: [],
    imageUrl: 'https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'hw-esp32-node-06',
    name: 'ESP32-WROOM Dual Core IoT Environmental Sensor Node',
    model: 'ESP32 DevKitC V4 + BME280 + OLED + LoRa Shield',
    tag: 'FCSIT-HW-ESP-12',
    serialNumber: 'SN-ESP32-IOT-9943',
    category: 'Sensors & Bundles',
    totalUnits: 10,
    availableUnits: 10,
    healthPercentage: 100,
    status: 'Available',
    currentBorrower: undefined,
    specs: [
      'Tensilica Xtensa Dual-Core 32-bit LX6 Microprocessor',
      'Wi-Fi 802.11 b/g/n & BLE 4.2',
      'BME280 Temperature, Humidity & Barometric Pressure',
      'SX1276 915MHz LoRa Transceiver'
    ],
    location: 'Locker B1-Bin 6',
    defects: [],
    loanHistory: [],
    imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80',
    bundleTag: 'Embedded IoT Kit'
  }
];

// Helper to get today's date formatted as YYYY-MM-DD
export const getTodayDateString = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const INITIAL_BOOKINGS: LabBooking[] = [];

export const INITIAL_LOANS: HardwareLoan[] = [];

export const INITIAL_WAITLIST: WaitlistEntry[] = [];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-001',
    timestamp: 'System Initialization',
    actor: 'LabPulse Security Engine',
    actorRole: 'system',
    action: 'System Initialized',
    details: 'Production laboratory resource management environment initialized with clean state.',
    category: 'system'
  }
];

export const HARDWARE_TEMPLATES: HardwareBundleTemplate[] = [
  {
    id: 'bundle-ai-vision',
    title: 'AI Vision & Autonomous Robotics Kit',
    subtitle: 'NVIDIA Jetson Orin Nano + Intel RealSense D435i Depth Cam',
    category: 'Edge Computing & AI',
    targetCourse: 'WIF3001 Final Year Project / AI Computer Vision',
    hardwareItemIds: ['hw-jetson-orin-01', 'hw-realsense-04'],
    description: 'Turnkey bundle tailored for real-time edge deep learning, point-cloud 3D mapping, SLAM obstacle avoidance, and high-framerate tensor inference.',
    iconName: 'Cpu',
    recommendedFor: 'Students working on Edge AI, ROS2 navigation, or autonomous drone/rover perception'
  },
  {
    id: 'bundle-iot-mesh',
    title: 'Smart Campus IoT & Environmental Telemetry Kit',
    subtitle: 'Raspberry Pi 4B (8GB) + ESP32 LoRa Node + Sensor Pack',
    category: 'Internet of Things',
    targetCourse: 'WIX2001 Embedded Systems / IoT Architectures',
    hardwareItemIds: ['hw-rpi4-kit-02', 'hw-esp32-node-06'],
    description: 'Complete edge gateway configuration: Raspberry Pi acting as local MQTT broker/dashboard paired with low-power ESP32 battery nodes.',
    iconName: 'Wifi',
    recommendedFor: 'Agricultural sensors, campus ambient tracking, and low-latency LoRaWAN networks'
  },
  {
    id: 'bundle-embedded-debug',
    title: 'Hardware Signal Analysis & Debugging Station',
    subtitle: 'Rigol DS1054Z 4-Ch Oscilloscope + Arduino Mega 2560 Pro Kit',
    category: 'Hardware Testing',
    targetCourse: 'WIE3004 Microprocessor Systems',
    hardwareItemIds: ['hw-rigol-osc-03', 'hw-arduino-mega-05'],
    description: 'Comprehensive signal integrity testing suite for SPI, I2C, and UART serial debugging with 4-channel real-time waveforms.',
    iconName: 'Activity',
    recommendedFor: 'Firmware engineers, hardware PCB signal timing verification, and motor controller PWM tuning'
  }
];

export const INITIAL_NOTIFICATIONS: PulseNotification[] = [];

export const INITIAL_MAINTENANCE_REPORTS: MaintenanceReport[] = [];



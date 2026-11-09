import { 
  UserProfile, 
  LabRoom, 
  LabBooking, 
  HardwareItem, 
  HardwareLoan, 
  WaitlistEntry, 
  AuditLog, 
  HardwareBundleTemplate 
} from '../types';

export const USERS: Record<string, UserProfile> = {
  student: {
    id: 'usr_student_01',
    name: 'Norman Lee Weng Hong',
    role: 'student',
    matricOrStaffId: '25005870',
    email: '25005870@siswa.um.edu.my',
    department: 'Department of Software Engineering, FCSIT',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    title: 'Year 3 Software Engineering Undergrad'
  },
  lecturer: {
    id: 'usr_lecturer_01',
    name: 'Prof. Madya Dr. Amir Rudin',
    role: 'lecturer',
    matricOrStaffId: 'UM-STAFF-19842',
    email: 'amirrudin@um.edu.my',
    department: 'Department of Artificial Intelligence, FCSIT',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
    title: 'Associate Professor & FYP Academic Coordinator'
  },
  admin: {
    id: 'usr_admin_01',
    name: 'En. Faizal bin Ahmad',
    role: 'admin',
    matricOrStaffId: 'UM-TECH-0419',
    email: 'faizal.fcsit@um.edu.my',
    department: 'FCSIT Central Laboratory Operations Office',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
    title: 'Senior Laboratory Technical Officer'
  }
};

export const INITIAL_ROOMS: LabRoom[] = [
  {
    id: 'lab-ai-1',
    name: 'Lab AI-1 (High-Performance Compute)',
    code: 'FCSIT-B2-AI01',
    category: 'AI & Data Science',
    capacity: 35,
    floor: 'Level 2',
    block: 'Block B',
    description: 'Specialized deep learning laboratory equipped with multi-GPU workstations, dedicated CUDA clustering, and dual 4K presentation displays for vision experiments.',
    amenities: ['12x NVIDIA RTX 4090 Workstations', 'Dual 85" Smart Touch Panels', 'Gigabit Ethernet', 'Air-Conditioned Climate Chamber'],
    specs: {
      workstations: 35,
      gpus: '12x RTX 4090 (24GB VRAM) nodes',
      screens: 'Dual Sony 85" 4K BRAVIA AirPlay Displays',
      specialEquipment: 'Ubuntu Deep Learning Studio 24.04 LTS pre-installed'
    },
    highResource: true,
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    activeNotice: 'FYP & Master thesis deep learning training reservation requires Supervisor Endorsement.'
  },
  {
    id: 'lab-se-2',
    name: 'Software Engineering Lab 2',
    code: 'FCSIT-A1-SE02',
    category: 'Software Engineering',
    capacity: 45,
    floor: 'Level 1',
    block: 'Block A',
    description: 'Collaborative development studio configured for scrum sprint simulations, UI/UX prototyping, automated CI/CD pipeline sandboxes, and pair programming desks.',
    amenities: ['Ergonomic Dual-Monitor Pods', 'Mobile Glass Whiteboards', 'DevOps Local Mirror Server', 'Focus Booths'],
    specs: {
      workstations: 45,
      screens: '45x Dell 27" USB-C Hub Displays',
      specialEquipment: 'Docker / Kubernetes Local Dev Sandbox'
    },
    highResource: false,
    imageUrl: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'lab-net-sys',
    name: 'Network Systems & Cybersecurity Lab',
    code: 'FCSIT-C3-NET01',
    category: 'Networking & Security',
    capacity: 30,
    floor: 'Level 3',
    block: 'Block C',
    description: 'Isolated testbed environment for penetration testing, VLAN configurations, packet sniffing analysis, and hardware router rack patching.',
    amenities: ['6x Cisco Catalyst 3850 Rack Pods', 'Air-gapped Malware Sandbox', 'Fiber Optic Termination Benches', 'Wireshark Sniffer Nodes'],
    specs: {
      workstations: 30,
      networkingGear: 'Cisco 2900 Series Routers & Fortinet Firewall Rack',
      screens: 'Ceiling Mounted High-Lumen Projector',
      specialEquipment: 'Isolated air-gapped subnet with Kali Linux rigs'
    },
    highResource: true,
    imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
    activeNotice: 'High-resource sandbox: Network penetration and packet flooding strictly regulated.'
  },
  {
    id: 'lab-iot-box',
    name: 'IoT Sandbox & Embedded Makerspace',
    code: 'FCSIT-B1-IOT01',
    category: 'IoT & Robotics',
    capacity: 25,
    floor: 'Level 1',
    block: 'Block B',
    description: 'Rapid prototyping workshop fitted with temperature-controlled Hakko soldering stations, 3D printers, digital multimeters, logic analyzers, and sensor calibration chambers.',
    amenities: ['Hakko FX-888D Soldering Bays', 'Bambu Lab X1-Carbon 3D Printer', 'Fume Extractors', 'ESD-Safe Anti-Static Mats'],
    specs: {
      workstations: 25,
      specialEquipment: 'Rigol Digital Oscilloscopes & DC Programmable Bench Supplies',
      screens: 'Interactive Smart Board'
    },
    highResource: false,
    imageUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'lab-postgrad-sem',
    name: 'Postgraduate Research Suite & Seminar Room',
    code: 'FCSIT-A3-SEM01',
    category: 'Meeting & Seminar',
    capacity: 20,
    floor: 'Level 3',
    block: 'Block A',
    description: 'Executive conference room with Polycom studio video conferencing bar, acoustic panelling, and boardroom conference table for thesis defenses and research meetings.',
    amenities: ['Polycom Studio 4K Bar', 'Acoustic Soundproofing', 'Wireless Barco ClickShare Pod', 'Motorized Blackout Blinds'],
    specs: {
      workstations: 20,
      screens: 'Dual 75" Samsung Flip Interactive Whiteboards'
    },
    highResource: true,
    imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80'
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
    availableUnits: 3,
    healthPercentage: 98,
    status: 'Available',
    specs: [
      'Ampere GPU w/ 1024 CUDA Cores',
      '40 TOPS AI Performance',
      '8GB 128-bit LPDDR5 Memory',
      'JetPack 6.0 SDK flashed on 128GB NVMe'
    ],
    location: 'Locker B2-Cabinet 3',
    defects: [],
    loanHistory: [
      {
        id: 'hist-1',
        borrower: 'Norman Lee Weng Hong',
        matric: '25005870',
        fromDate: '2026-10-15',
        toDate: '2026-10-22',
        returnCondition: 'Excellent',
        notes: 'Used for YOLOv8 edge inference benchmark'
      },
      {
        id: 'hist-2',
        borrower: 'Siti Nur Aisyah',
        matric: '24003211',
        fromDate: '2026-09-10',
        toDate: '2026-09-24',
        returnCondition: 'Good',
        notes: 'Clean return with acrylic casing'
      }
    ],
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
    availableUnits: 7,
    healthPercentage: 94,
    status: 'Available',
    specs: [
      'Broadcom BCM2711 Quad-core Cortex-A72',
      '8GB LPDDR4-3200 SDRAM',
      'Dual micro-HDMI 4K60 ports',
      'Official USB-C 15.3W Power Adapter included'
    ],
    location: 'Locker B1-Rack 1',
    defects: [
      {
        id: 'def-1',
        date: '2026-08-14',
        issue: 'MicroSD slot spring slightly loose, still clicks firmly',
        reportedBy: 'En. Faizal (Officer)',
        severity: 'Minor',
        status: 'Resolved'
      }
    ],
    loanHistory: [
      {
        id: 'hist-3',
        borrower: 'Tan Kai Wen',
        matric: '23004812',
        fromDate: '2026-10-01',
        toDate: '2026-10-14',
        returnCondition: 'Good',
        notes: 'Micro-HDMI adapter returned intact'
      }
    ],
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
    availableUnits: 2,
    healthPercentage: 99,
    status: 'Available',
    specs: [
      '50 MHz Bandwidth, 4 Analog Channels',
      '1 GSa/s Real-time Sample Rate',
      '24 Mpts Standard Memory Depth',
      '4x 150MHz Passive Probes (PVP2150) included'
    ],
    location: 'Cabinet T-04 (Locked)',
    defects: [],
    loanHistory: [
      {
        id: 'hist-4',
        borrower: 'Muhammad Harith',
        matric: '22009411',
        fromDate: '2026-09-01',
        toDate: '2026-09-15',
        returnCondition: 'Excellent',
        notes: 'Calibrated before loan'
      }
    ],
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
    availableUnits: 1,
    healthPercentage: 91,
    status: 'Available',
    specs: [
      'Stereo Depth Technology with Active IR Projector',
      'RGB Sensor 1920x1080 @ 30fps',
      'Integrated Bosch BMI055 6-DoF IMU',
      'High-flex USB-C 3.1 1.5m Cable'
    ],
    location: 'Locker B2-Cabinet 2',
    defects: [
      {
        id: 'def-2',
        date: '2026-10-02',
        issue: 'Tripod leg tightening screw minor threading resistance',
        reportedBy: 'Norman Lee Weng Hong',
        severity: 'Minor',
        status: 'Investigating'
      }
    ],
    loanHistory: [
      {
        id: 'hist-5',
        borrower: 'Chew Mei Ling',
        matric: '24001928',
        fromDate: '2026-10-10',
        toDate: '2026-10-24',
        returnCondition: 'Minor Scratches',
        notes: 'Surface scratch on metal housing; optical lens flawless.'
      }
    ],
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
    availableUnits: 9,
    healthPercentage: 96,
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
    availableUnits: 0,
    healthPercentage: 75,
    status: 'Under Maintenance',
    currentBorrower: undefined,
    specs: [
      'Tensilica Xtensa Dual-Core 32-bit LX6 Microprocessor',
      'Wi-Fi 802.11 b/g/n & BLE 4.2',
      'BME280 Temperature, Humidity & Barometric Pressure',
      'SX1276 915MHz LoRa Transceiver'
    ],
    location: 'Maintenance Bench M-02',
    defects: [
      {
        id: 'def-3',
        date: '2026-11-04',
        issue: 'OLED I2C display intermittent flickering; re-soldering header pin required',
        reportedBy: 'En. Faizal (Officer)',
        severity: 'Moderate',
        status: 'Pending Parts'
      }
    ],
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

export const INITIAL_BOOKINGS: LabBooking[] = [
  {
    id: 'bk-7842',
    tokenCode: 'LP-7842',
    userId: 'usr_student_01',
    userName: 'Norman Lee Weng Hong',
    userMatric: '25005870',
    userEmail: '25005870@siswa.um.edu.my',
    roomId: 'lab-ai-1',
    roomName: 'Lab AI-1 (High-Performance Compute)',
    roomCode: 'FCSIT-B2-AI01',
    date: getTodayDateString(),
    slot: '10:00 - 12:00',
    purpose: 'Final Year Project: Distributed LLM Fine-Tuning & Quantization on Dual RTX 4090 Rigs',
    courseCode: 'WIF3001 Final Year Project',
    isFYP: true,
    supervisorName: 'Prof. Madya Dr. Amir Rudin',
    supervisorEmail: 'amirrudin@um.edu.my',
    status: 'Approved',
    createdAt: '2026-11-08 09:30 AM',
    endorsementNote: 'Endorsed. Norman is conducting approved GPU training sessions for FYP benchmark.'
  },
  {
    id: 'bk-4190',
    tokenCode: 'LP-4190',
    userId: 'usr_student_02',
    userName: 'Siti Nur Aisyah',
    userMatric: '24003211',
    userEmail: '24003211@siswa.um.edu.my',
    roomId: 'lab-se-2',
    roomName: 'Software Engineering Lab 2',
    roomCode: 'FCSIT-A1-SE02',
    date: getTodayDateString(),
    slot: '08:00 - 10:00',
    purpose: 'Agile Team Sprint 3 Review & Flutter Mock Testing',
    courseCode: 'WIE2002 Software Architecture',
    isFYP: false,
    status: 'Active',
    checkInTime: '08:05 AM',
    createdAt: '2026-11-07 02:15 PM'
  },
  {
    id: 'bk-9031',
    tokenCode: 'LP-9031',
    userId: 'usr_student_01',
    userName: 'Norman Lee Weng Hong',
    userMatric: '25005870',
    userEmail: '25005870@siswa.um.edu.my',
    roomId: 'lab-net-sys',
    roomName: 'Network Systems & Cybersecurity Lab',
    roomCode: 'FCSIT-C3-NET01',
    date: getTodayDateString(),
    slot: '14:00 - 16:00',
    purpose: 'Cybersecurity Capstone: Snort IDS Signature Testing and Packet Capturing',
    courseCode: 'WIX3002 Network Security',
    isFYP: true,
    supervisorName: 'Prof. Madya Dr. Amir Rudin',
    supervisorEmail: 'amirrudin@um.edu.my',
    status: 'Pending Endorsement',
    createdAt: '2026-11-09 11:20 AM'
  },
  {
    id: 'bk-6120',
    tokenCode: 'LP-6120',
    userId: 'usr_student_03',
    userName: 'Arun Kumar a/l Rajan',
    userMatric: '23008129',
    userEmail: '23008129@siswa.um.edu.my',
    roomId: 'lab-ai-1',
    roomName: 'Lab AI-1 (High-Performance Compute)',
    roomCode: 'FCSIT-B2-AI01',
    date: getTodayDateString(),
    slot: '14:00 - 16:00',
    purpose: 'Computer Vision Facial Feature Segmentation on PyTorch',
    courseCode: 'WIA3001 Artificial Intelligence',
    isFYP: true,
    supervisorName: 'Prof. Madya Dr. Amir Rudin',
    supervisorEmail: 'amirrudin@um.edu.my',
    status: 'Pending Approval',
    endorsementNote: 'Endorsed. Please grant access.',
    createdAt: '2026-11-08 04:45 PM'
  }
];

export const INITIAL_LOANS: HardwareLoan[] = [
  {
    id: 'loan-3829',
    tokenCode: 'LP-3829',
    userId: 'usr_student_01',
    userName: 'Norman Lee Weng Hong',
    userMatric: '25005870',
    hardwareId: 'hw-jetson-orin-01',
    hardwareName: 'NVIDIA Jetson Orin Nano Developer Kit (8GB)',
    hardwareTag: 'FCSIT-HW-JET-01',
    serialNumber: 'SN-NV-ORIN-9421',
    requestDate: '2026-11-08',
    dueDate: '2026-11-22',
    purpose: 'FYP Real-Time Object Detection Edge Pipeline deployment',
    status: 'Active / Issued',
    conditionOut: 'Mint condition, official power supply + 128GB NVMe attached',
    checklist: {
      chassisIntact: true,
      accessoriesIncluded: true,
      powersOnWithoutError: true
    },
    createdAt: '2026-11-08 10:12 AM'
  },
  {
    id: 'loan-5120',
    tokenCode: 'LP-5120',
    userId: 'usr_student_04',
    userName: 'Lee Zhi Hao',
    userMatric: '24009918',
    hardwareId: 'hw-rigol-osc-03',
    hardwareName: 'Rigol DS1054Z 50MHz Digital Oscilloscope (4 Channels)',
    hardwareTag: 'FCSIT-HW-OSC-02',
    serialNumber: 'SN-RIGOL-4412-MY',
    requestDate: '2026-11-01',
    dueDate: '2026-11-08',
    purpose: 'Robotics sensor PWM signal waveform ripple evaluation',
    status: 'Overdue',
    conditionOut: 'Calibrated, 4x probes and power lead included',
    checklist: {
      chassisIntact: true,
      accessoriesIncluded: true,
      powersOnWithoutError: true
    },
    createdAt: '2026-11-01 11:00 AM'
  },
  {
    id: 'loan-8812',
    tokenCode: 'LP-8812',
    userId: 'usr_student_01',
    userName: 'Norman Lee Weng Hong',
    userMatric: '25005870',
    hardwareId: 'hw-realsense-04',
    hardwareName: 'Intel RealSense D435i Depth Camera + Mini Tripod',
    hardwareTag: 'FCSIT-HW-CAM-03',
    serialNumber: 'SN-INTEL-RS-3021',
    requestDate: '2026-11-09',
    dueDate: '2026-11-23',
    purpose: 'Stereo depth point-cloud registration for indoor SLAM navigation',
    status: 'Pending Approval',
    createdAt: '2026-11-09 03:20 PM'
  }
];

export const INITIAL_WAITLIST: WaitlistEntry[] = [
  {
    id: 'wt-01',
    targetType: 'room',
    targetId: 'lab-ai-1',
    targetName: 'Lab AI-1 (High-Performance Compute)',
    slotOrDetails: '10:00 - 12:00',
    date: getTodayDateString(),
    userId: 'usr_student_05',
    userName: 'Kavitha Devi a/p Mohan',
    userMatric: '25001249',
    userEmail: '25001249@siswa.um.edu.my',
    position: 1,
    status: 'waiting',
    createdAt: '2026-11-09 08:30 AM'
  },
  {
    id: 'wt-02',
    targetType: 'hardware',
    targetId: 'hw-esp32-node-06',
    targetName: 'ESP32-WROOM Dual Core IoT Sensor Node',
    slotOrDetails: 'FCSIT-HW-ESP-12',
    date: getTodayDateString(),
    userId: 'usr_student_06',
    userName: 'Zulhilmi bin Rosli',
    userMatric: '24005510',
    userEmail: '24005510@siswa.um.edu.my',
    position: 1,
    status: 'waiting',
    createdAt: '2026-11-08 03:00 PM'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-101',
    timestamp: '2026-11-09 08:30 AM',
    actor: 'System Engine',
    actorRole: 'System',
    action: 'Grace Period Monitor Activated',
    details: 'Initiated 15-minute physical QR attendance watchdog for morning laboratory blocks.',
    category: 'system'
  },
  {
    id: 'log-102',
    timestamp: '2026-11-08 10:15 AM',
    actor: 'En. Faizal bin Ahmad',
    actorRole: 'admin',
    action: 'Hardware Loan Physical Check-out',
    details: 'Verified token LP-3829 for Norman Lee (25005870). Condition inspection passed: Jetson Orin Nano issued.',
    category: 'hardware'
  },
  {
    id: 'log-103',
    timestamp: '2026-11-08 09:40 AM',
    actor: 'Prof. Madya Dr. Amir Rudin',
    actorRole: 'lecturer',
    action: 'Supervisor Endorsement Granted',
    details: 'Endorsed FYP high-resource booking LP-7842 for Lab AI-1 (10:00 - 12:00).',
    category: 'booking'
  },
  {
    id: 'log-104',
    timestamp: '2026-11-07 02:15 PM',
    actor: 'Siti Nur Aisyah',
    actorRole: 'student',
    action: 'Space Reservation Submitted',
    details: 'Requested Software Engineering Lab 2 for 08:00 - 10:00 session.',
    category: 'booking'
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


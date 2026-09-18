import {
  Booking,
  ClinicRoom,
  MedicalRecord,
  HighTechTip,
  IoTDevice,
  SkinAnalysisReport,
  AutomatedMessage,
  TreatmentCycleAlert,
  AiChatMessage,
  MarketingLead,
  DripCampaign,
  PostTreatmentCareTicket,
  ChurnRiskCustomer,
  LoyaltyMember,
  ReferralRecord
} from './types';
import { loadLocalData, saveLocalData } from './storageService';

export const CLINIC_STORAGE_KEYS = {
  BOOKINGS: 'wellness_clinic_bookings',
  ROOMS: 'wellness_clinic_rooms',
  EMR: 'wellness_clinic_emr',
  HIGH_TECH_TIPS: 'wellness_clinic_tips',
  IOT_DEVICES: 'wellness_clinic_iot',
  SKIN_REPORTS: 'wellness_clinic_skin_reports',
  AUTOMATED_MSGS: 'wellness_clinic_automated_msgs',
  AI_CHAT: 'wellness_clinic_ai_chat',
  MARKETING_LEADS: 'wellness_clinic_leads',
  DRIP_CAMPAIGNS: 'wellness_clinic_drip',
  POST_TREATMENT_TICKETS: 'wellness_clinic_post_treatment',
  CHURN_CUSTOMERS: 'wellness_clinic_churn_risk',
  LOYALTY_MEMBERS: 'wellness_clinic_loyalty',
  REFERRALS: 'wellness_clinic_referrals'
};

// ============================================================
// 1. DEFAULT CLINIC ROOMS
// ============================================================

export const DEFAULT_ROOMS: ClinicRoom[] = [
  {
    id: 'room-laser-01',
    name: 'Phòng Laser Công Nghệ Cao 01',
    type: 'laser',
    bedCount: 2,
    status: 'occupied',
    supportedServices: ['Laser PicoWay', 'Fractional CO2', 'Trị Nám Chuyên Sâu', 'Xóa Xăm']
  },
  {
    id: 'room-hifu-02',
    name: 'Phòng Trẻ Hóa HIFU & RF 02',
    type: 'hifu',
    bedCount: 2,
    status: 'available',
    supportedServices: ['Nâng Cơ HIFU MPT', 'Thermage FLX', 'GeneoX Pro', 'RF Cổ & Mặt']
  },
  {
    id: 'room-hydra-vip',
    name: 'Phòng Hydrafacial VIP 01',
    type: 'vip',
    bedCount: 1,
    status: 'available',
    supportedServices: ['Hydrafacial Platinum', 'Hydrafacial Sysnature', 'Chăm Sóc Da Hoàng Gia']
  },
  {
    id: 'room-diode-04',
    name: 'Phòng Triệt Lông Diode Laser',
    type: 'laser',
    bedCount: 2,
    status: 'available',
    supportedServices: ['Triệt Lông Nách', 'Triệt Lông Toàn Thân', 'Triệt Lông Bikini']
  },
  {
    id: 'room-meso-05',
    name: 'Phòng Tiêm Vi Điểm & Bác Sĩ',
    type: 'injection',
    bedCount: 2,
    status: 'cleaning',
    supportedServices: ['Cấy Tinh Chất Meso', 'Tiêm BAP Trẻ Hóa', 'PRP Huyết Tương']
  }
];

// ============================================================
// 2. DEFAULT SMART BOOKINGS
// ============================================================

export const DEFAULT_BOOKINGS: Booking[] = [
  {
    id: 'bk-1001',
    customerCode: 'KH-0089',
    customerName: 'Vương Thúy Hằng',
    customerPhone: '0918 333 444',
    serviceId: 'pico-nam',
    serviceName: 'Laser PicoWay Trị Nám Chân Sâu',
    channel: 'zalo',
    date: '2026-09-18',
    time: '09:30',
    durationMinutes: 60,
    technicianId: 'staff-01',
    technicianName: 'Nguyễn Thị Mai (KTV Trưởng)',
    roomId: 'room-laser-01',
    roomName: 'Phòng Laser Công Nghệ Cao 01',
    status: 'in_progress',
    notes: 'Khách buổi 3/6. Yêu cầu bôi tê kỹ vùng gò má trước 25 phút.',
    depositAmount: 500000,
    znsReminderSent: true,
    csatSent: false,
    createdDate: '2026-09-15'
  },
  {
    id: 'bk-1002',
    customerCode: 'KH-0124',
    customerName: 'Trần Hoàng Nam',
    customerPhone: '0902 555 666',
    serviceId: 'co2-seo',
    serviceName: 'Fractional CO2 Laser & Cắt Đáy Sẹo',
    channel: 'web',
    date: '2026-09-18',
    time: '11:00',
    durationMinutes: 90,
    technicianId: 'staff-02',
    technicianName: 'Lê Thu Trang',
    roomId: 'room-laser-01',
    roomName: 'Phòng Laser Công Nghệ Cao 01',
    status: 'confirmed',
    notes: 'Khách buổi 2. Da hồi phục rất tốt sau buổi 1.',
    depositAmount: 1000000,
    znsReminderSent: true,
    csatSent: false,
    createdDate: '2026-09-16'
  },
  {
    id: 'bk-1003',
    customerCode: 'KH-0056',
    customerName: 'Đỗ Kim Oanh',
    customerPhone: '0938 777 888',
    serviceId: 'hifu-mpt',
    serviceName: 'Nâng Cơ Xóa Nhăn HIFU Ultraformer MPT',
    channel: 'facebook',
    date: '2026-09-18',
    time: '14:00',
    durationMinutes: 90,
    technicianId: 'staff-01',
    technicianName: 'Nguyễn Thị Mai (KTV Trưởng)',
    roomId: 'room-hifu-02',
    roomName: 'Phòng Trẻ Hóa HIFU & RF 02',
    status: 'confirmed',
    notes: 'Bắn 600 shot vùng má, viền hàm và nọng cằm.',
    depositAmount: 2000000,
    znsReminderSent: true,
    csatSent: false,
    createdDate: '2026-09-17'
  },
  {
    id: 'bk-1004',
    customerCode: 'KH-0178',
    customerName: 'Nguyễn Mai Lan',
    customerPhone: '0988 999 111',
    serviceId: 'hf-platinum',
    serviceName: 'Hydrafacial Platinum Thải Độc & Cấp Ẩm',
    channel: 'app',
    date: '2026-09-18',
    time: '15:30',
    durationMinutes: 90,
    technicianId: 'staff-03',
    technicianName: 'Trần Kim Ngân',
    roomId: 'room-hydra-vip',
    roomName: 'Phòng Hydrafacial VIP 01',
    status: 'pending',
    notes: 'Khách thành viên VIP Diamond. Chuẩn bị trà thảo mộc phòng chờ.',
    znsReminderSent: false,
    csatSent: false,
    createdDate: '2026-09-18'
  },
  {
    id: 'bk-1005',
    customerCode: 'KH-0205',
    customerName: 'Phạm Quỳnh Anh',
    customerPhone: '0977 123 456',
    serviceId: 'diode-trietlong',
    serviceName: 'Triệt Lông Diode Laser Toàn Thân',
    channel: 'walkin',
    date: '2026-09-18',
    time: '16:30',
    durationMinutes: 60,
    technicianId: 'staff-04',
    technicianName: 'Hoàng Bảo Yến',
    roomId: 'room-diode-04',
    roomName: 'Phòng Triệt Lông Diode Laser',
    status: 'confirmed',
    notes: 'Khách chu kỳ buổi thứ 4.',
    znsReminderSent: true,
    csatSent: false,
    createdDate: '2026-09-17'
  }
];

// ============================================================
// 3. DEFAULT HIGH-TECH CONSUMABLES & MACHINE TIPS
// ============================================================

export const DEFAULT_HIGH_TECH_TIPS: HighTechTip[] = [
  {
    id: 'tip-hifu-30',
    code: 'TIP-HIFU-3.0',
    name: 'Đầu Cartridge HIFU 3.0mm (Trung bì sâu)',
    machineModel: 'Ultraformer MPT (Classys)',
    totalMaxShots: 20000,
    remainingShots: 3450,
    alertThreshold: 1500,
    unitPrice: 18500000,
    installedDate: '2026-07-10',
    status: 'optimal',
    batchNumber: 'UF-26-0881'
  },
  {
    id: 'tip-hifu-45',
    code: 'TIP-HIFU-4.5',
    name: 'Đầu Cartridge HIFU 4.5mm (Lớp cân cơ SMAS)',
    machineModel: 'Ultraformer MPT (Classys)',
    totalMaxShots: 20000,
    remainingShots: 820,
    alertThreshold: 1500,
    unitPrice: 19500000,
    installedDate: '2026-06-05',
    status: 'warning',
    batchNumber: 'UF-26-0712'
  },
  {
    id: 'tip-thermage-900',
    code: 'TIP-THERM-900',
    name: 'Đầu Tip Thermage FLX Total Tip 4.0cm² (900 REP)',
    machineModel: 'Thermage FLX (Solta Medical)',
    totalMaxShots: 900,
    remainingShots: 110,
    alertThreshold: 200,
    unitPrice: 42000000,
    installedDate: '2026-08-15',
    status: 'critical',
    batchNumber: 'THX-26-4401'
  },
  {
    id: 'tip-diode-808',
    code: 'TIP-DIODE-CRYSTAL',
    name: 'Đầu Tinh Thể Sapphire Làm Lạnh Máy Triệt Lông',
    machineModel: 'Diode Laser Master 808nm',
    totalMaxShots: 10000000,
    remainingShots: 6850000,
    alertThreshold: 1000000,
    unitPrice: 15000000,
    installedDate: '2025-11-20',
    status: 'optimal',
    batchNumber: 'DIO-25-992'
  },
  {
    id: 'tip-pico-mla',
    code: 'TIP-PICO-MLA',
    name: 'Thấu Kính Hội Tụ Vi Điểm Micro Lens Array (MLA)',
    machineModel: 'PicoWay Laser Picosecond',
    totalMaxShots: 5000000,
    remainingShots: 2410000,
    alertThreshold: 500000,
    unitPrice: 35000000,
    installedDate: '2026-01-12',
    status: 'optimal',
    batchNumber: 'PCW-26-105'
  }
];

// ============================================================
// 4. DEFAULT IOT EQUIPMENT (SMART CLINIC MONITOR)
// ============================================================

export const DEFAULT_IOT_DEVICES: IoTDevice[] = [
  {
    id: 'iot-picoway',
    code: 'EQ-PICO-01',
    name: 'PicoWay Laser Picosecond',
    model: 'Candela PicoWay 2026 System',
    room: 'Phòng Laser Công Nghệ Cao 01',
    status: 'in_treatment',
    temperature: 21.4,
    voltage: 221.5,
    operatingHours: 1240,
    totalShotsFired: 2845000,
    coolingStatus: 'normal',
    lastMaintenance: '2026-08-10',
    nextMaintenance: '2026-11-10',
    serialNumber: 'CW-PICO-VN-88219',
    alerts: []
  },
  {
    id: 'iot-ultraformer',
    code: 'EQ-HIFU-02',
    name: 'HIFU Ultraformer MPT',
    model: 'Classys Ultraformer MPT Dual Engine',
    room: 'Phòng Trẻ Hóa HIFU & RF 02',
    status: 'online_ready',
    temperature: 22.8,
    voltage: 220.0,
    operatingHours: 820,
    totalShotsFired: 324500,
    coolingStatus: 'normal',
    lastMaintenance: '2026-07-25',
    nextMaintenance: '2026-10-25',
    serialNumber: 'CLS-UFMPT-2025-091',
    alerts: ['Đầu Cartridge 4.5mm còn dưới 1,000 shot']
  },
  {
    id: 'iot-diode',
    code: 'EQ-DIODE-04',
    name: 'Diode Laser Master 808nm',
    model: 'LaserPro Cryo Sapphire System',
    room: 'Phòng Triệt Lông Diode Laser',
    status: 'online_ready',
    temperature: -4.2, // Nhiệt độ đầu đá sapphire âm độ C
    voltage: 219.0,
    operatingHours: 2150,
    totalShotsFired: 4120000,
    coolingStatus: 'chiller_active',
    lastMaintenance: '2026-06-15',
    nextMaintenance: '2026-12-15',
    serialNumber: 'DIO-MASTER-808-771',
    alerts: []
  },
  {
    id: 'iot-hydrafacial',
    code: 'EQ-HYDRA-03',
    name: 'Hydrafacial Syndeo Elite',
    model: 'Hydrafacial Syndeo Digital Touch',
    room: 'Phòng Hydrafacial VIP 01',
    status: 'standby',
    temperature: 22.1,
    voltage: 222.0,
    operatingHours: 640,
    totalShotsFired: 950,
    coolingStatus: 'normal',
    lastMaintenance: '2026-08-01',
    nextMaintenance: '2026-11-01',
    serialNumber: 'HYD-SYN-2025-6331',
    alerts: []
  },
  {
    id: 'iot-co2',
    code: 'EQ-CO2-05',
    name: 'Fractional CO2 Laser Edge ONE',
    model: 'Jeisys Edge ONE SuperPulse',
    room: 'Phòng Laser Công Nghệ Cao 01',
    status: 'online_ready',
    temperature: 25.1,
    voltage: 220.5,
    operatingHours: 980,
    totalShotsFired: 1650000,
    coolingStatus: 'normal',
    lastMaintenance: '2026-05-20',
    nextMaintenance: '2026-09-25',
    serialNumber: 'JYS-CO2-99042',
    alerts: ['Lịch bảo trì định kỳ sắp đến hạn (25/09/2026)']
  }
];

// ============================================================
// 5. DEFAULT ELECTRONIC MEDICAL RECORDS (EMR)
// ============================================================

export const DEFAULT_MEDICAL_RECORDS: MedicalRecord[] = [
  {
    id: 'emr-0089',
    customerCode: 'KH-0089',
    customerName: 'Vương Thúy Hằng',
    customerPhone: '0918 333 444',
    gender: 'female',
    birthYear: 1991,
    skinType: 'combination',
    allergies: 'Dị ứng Aspirin & Tinh chất tràm trà nồng độ cao',
    medicalHistory: 'Đã từng bắn Laser Toning ở spa nhỏ bị tăng sắc tố dội ngược (PIH) cách đây 1 năm.',
    diagnosis: 'Nám Melasma mảng kết hợp nám chân sâu (Horis nevus) 2 bên gò má, rối loạn sắc tố sau viêm.',
    treatmentPlan: 'Phác đồ Chuẩn Y Khoa: PicoWay Laser 1064nm bước sóng kép kết hợp Điện di Tinh chất Phục hồi Multi-B5 (6 buổi)',
    totalSessions: 6,
    completedSessions: 3,
    status: 'active',
    createdDate: '2026-07-20',
    updatedDate: '2026-09-18',
    doctorInCharge: 'BS. CKI Da liễu Trần Anh Thư',
    sessions: [
      {
        id: 'ss-1',
        sessionNumber: 1,
        date: '2026-08-01',
        serviceName: 'Laser PicoWay Phá Hạt Sắc Tố',
        doctorOrTechId: 'staff-01',
        doctorOrTechName: 'Nguyễn Thị Mai (KTV Trưởng)',
        machineParams: {
          machineName: 'PicoWay Laser Picosecond',
          wavelength: '1064nm Zoom',
          energyFluence: '2.2 J/cm²',
          frequency: '10 Hz',
          spotSize: '7 mm',
          shotsFired: 1600
        },
        skinReaction: 'Hơi hồng nhẹ 15 phút, không bong tróc, không đỏ rát kéo dài.',
        homeCareInstruction: 'Rửa mặt nước muối sinh lý 24h đầu, bôi kem dưỡng B5 3 lần/ngày, chống nắng vật lý SPF50+.',
        beforeImageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=60',
        afterImageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=60',
        doctorNote: 'Nang lông đáp ứng tốt với bước sóng 1064nm. Khách hợp tác tốt.',
        clientFeedback: 'Da sau bắn không đau rát, đi làm bình thường vào hôm sau.',
        signatureVerified: true
      },
      {
        id: 'ss-2',
        sessionNumber: 2,
        date: '2026-08-25',
        serviceName: 'Laser PicoWay + Thấu Kính Hội Tụ MLA',
        doctorOrTechId: 'staff-01',
        doctorOrTechName: 'Nguyễn Thị Mai (KTV Trưởng)',
        machineParams: {
          machineName: 'PicoWay Laser Picosecond',
          wavelength: '1064nm + MLA Resolve',
          energyFluence: '2.6 J/cm²',
          frequency: '10 Hz',
          spotSize: '6 mm Focus',
          tipCartridge: 'Pico MLA Resolve Handpiece',
          shotsFired: 1850
        },
        skinReaction: 'Điểm chấm đỏ xuất huyết vi điểm dưới da (PET) dự kiến tan sau 48h, đúng phác đồ kích thích collagen.',
        homeCareInstruction: 'Đắp mặt nạ sinh học phục hồi, tránh ánh nắng trực tiếp, xịt khoáng làm dịu.',
        beforeImageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=60',
        afterImageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=60',
        doctorNote: 'Mảng sắc tố mờ đi 30% so với ban đầu. Tiếp tục duy trì năng lượng.',
        clientFeedback: 'Vết nám ở gò má phải sáng lên rõ, nền da căng mọng hơn.',
        signatureVerified: true
      },
      {
        id: 'ss-3',
        sessionNumber: 3,
        date: '2026-09-18',
        serviceName: 'Laser PicoWay Trị Nám Buổi 3',
        doctorOrTechId: 'staff-01',
        doctorOrTechName: 'Nguyễn Thị Mai (KTV Trưởng)',
        machineParams: {
          machineName: 'PicoWay Laser Picosecond',
          wavelength: '1064nm + 532nm Tàn Nhang',
          energyFluence: '2.8 J/cm²',
          frequency: '10 Hz',
          spotSize: '7 mm',
          shotsFired: 1920
        },
        skinReaction: 'Hồng đồng đều, mảng nám sậm màu tạm thời (hiện tượng vi vảy mong muốn), tự bong sau 5 ngày.',
        homeCareInstruction: 'Không cạy gỡ vảy, duy trì thoa serum sáng da Tranexamic Acid 3%.',
        doctorNote: 'Độ sâu nám đã được khống chế, đáp ứng đạt 50% mục tiêu phác đồ.',
        signatureVerified: true
      }
    ]
  },
  {
    id: 'emr-0124',
    customerCode: 'KH-0124',
    customerName: 'Trần Hoàng Nam',
    customerPhone: '0902 555 666',
    gender: 'male',
    birthYear: 1995,
    skinType: 'oily',
    allergies: 'Không có tiền sử dị ứng thuốc hay mỹ phẩm.',
    medicalHistory: 'Mụn trứng cá nặng tuổi dậy thì để lại sẹo rỗ đáy vuông (boxcar) và sẹo lòng chảo (rolling) 2 bên má.',
    diagnosis: 'Sẹo rỗ hỗn hợp độ 3, dày sừng bề mặt, lỗ chân lông to.',
    treatmentPlan: 'Phác đồ 5 Buổi: Cắt đáy sẹo vi điểm Subcision + Bắn Fractional CO2 Laser Edge ONE + Điện di Tế bào gốc EGF.',
    totalSessions: 5,
    completedSessions: 1,
    status: 'active',
    createdDate: '2026-08-15',
    updatedDate: '2026-09-18',
    doctorInCharge: 'BS. CKI Da liễu Trần Anh Thư',
    sessions: [
      {
        id: 'ss-nam-1',
        sessionNumber: 1,
        date: '2026-08-20',
        serviceName: 'Cắt Đáy Sẹo + Fractional CO2 Laser',
        doctorOrTechId: 'staff-02',
        doctorOrTechName: 'Lê Thu Trang',
        machineParams: {
          machineName: 'Fractional CO2 Laser Edge ONE',
          wavelength: '10600nm',
          energyFluence: '45 mJ / dot',
          spotSize: '15x15 mm Pattern',
          shotsFired: 650
        },
        skinReaction: 'Đỏ da dạng lưới vi điểm, bầm nhẹ vùng cắt xơ đáy sẹo.',
        homeCareInstruction: 'Bôi tế bào gốc 4 tiếng/lần trong 3 ngày đầu, rửa bằng nước muối sinh lý.',
        doctorNote: 'Giải phóng xơ sẹo 80% vùng má trái và má phải.',
        signatureVerified: true
      }
    ]
  }
];

// ============================================================
// 6. DEFAULT AI SKIN ANALYSIS REPORTS (MAGIC MIRROR 3D)
// ============================================================

export const DEFAULT_SKIN_REPORTS: SkinAnalysisReport[] = [
  {
    id: 'skin-rep-0089',
    customerCode: 'KH-0089',
    customerName: 'Vương Thúy Hằng',
    date: '2026-09-18',
    skinAge: 29, // Tuổi thật: 35
    overallScore: 78,
    metrics: {
      hydration: 62, // % Độ ẩm
      sebum: 45, // % Bã nhờn
      pigmentation: 58, // % Sắc tố Melanin (Cải thiện từ 82%)
      wrinkles: 35, // % Nếp nhăn
      pores: 42, // % Lỗ chân lông
      acneBacteria: 18, // % Vi khuẩn P.Acnes
      elasticity: 74 // % Độ đàn hồi
    },
    diagnosisSummary: 'Sắc tố melanin đã giảm 24% so với lần quét đầu tiên trước liệu trình. Độ ẩm tầng sâu biểu bì tăng trưởng tích cực.',
    aiRecommendedServices: [
      'Laser PicoWay 1064nm (Duy trì buổi 4)',
      'Điện Di Tinh Chất Phục Hồi Multi-B5',
      'Hydrafacial Cấp Ẩm Tầng Sâu'
    ],
    analystName: 'AI Magic Mirror Pro v4.2 & Bác Sĩ Anh Thư'
  },
  {
    id: 'skin-rep-0124',
    customerCode: 'KH-0124',
    customerName: 'Trần Hoàng Nam',
    date: '2026-08-20',
    skinAge: 32, // Tuổi thật: 31
    overallScore: 61,
    metrics: {
      hydration: 41,
      sebum: 78,
      pigmentation: 40,
      wrinkles: 44,
      pores: 76,
      acneBacteria: 52,
      elasticity: 58
    },
    diagnosisSummary: 'Da tăng tiết bã nhờn mạnh, lỗ chân lông giãn nở và mật độ sẹo lõm xơ chai cao. Cần tái tạo bề mặt kết hợp kiềm dầu.',
    aiRecommendedServices: [
      'Fractional CO2 Laser Tái Tạo Bề Mặt',
      'Cắt Đáy Sẹo Vi Điểm Subcision',
      'GeneoX Pro Thải Độc Thanh Lọc Bã Nhờn'
    ],
    analystName: 'AI Magic Mirror Pro v4.2'
  }
];

// ============================================================
// 7. DEFAULT CRM AUTOMATED MESSAGES & CSAT
// ============================================================

export const DEFAULT_AUTOMATED_MSGS: AutomatedMessage[] = [
  {
    id: 'msg-01',
    type: 'reminder_24h',
    customerName: 'Vương Thúy Hằng',
    customerPhone: '0918 333 444',
    channel: 'Zalo ZNS',
    content: '[WELLNESS CLINIC] Xin chào chị Hằng, chị có lịch hẹn "Laser PicoWay Trị Nám" vào lúc 09:30 ngày 18/09/2026 tại Phòng Laser 01. KTV Trưởng Mai sẽ đón tiếp chị. Vui lòng đến đúng giờ để bôi tê chuẩn thời gian ạ.',
    scheduledTime: '2026-09-17 09:00',
    status: 'delivered',
    sentAt: '2026-09-17 09:01'
  },
  {
    id: 'msg-02',
    type: 'csat_survey',
    customerName: 'Đỗ Kim Oanh',
    customerPhone: '0938 777 888',
    channel: 'Zalo ZNS',
    content: '[WELLNESS CLINIC] Cảm ơn chị Oanh đã trải nghiệm dịch vụ Nâng Cơ HIFU hôm nay! Chị vui lòng đánh giá chất lượng phục vụ và tay nghề KTV Mai qua link khảo sát này nhé: https://wellness.vn/danh-gia/hifu-0056',
    scheduledTime: '2026-09-18 16:00',
    status: 'pending'
  },
  {
    id: 'msg-03',
    type: 'treatment_cycle',
    customerName: 'Nguyễn Mai Lan',
    customerPhone: '0988 999 111',
    channel: 'Zalo ZNS',
    content: '[WELLNESS CLINIC] Chị Lan ơi, đã tròn 21 ngày kể từ buổi triệt lông trước. Đây là "thời điểm vàng" nang lông bước vào chu kỳ mầm mới để đạt hiệu quả triệt sạch vĩnh viễn cao nhất. Mời chị chọn giờ đến qua link: https://wellness.vn/dat-lich/lan',
    scheduledTime: '2026-09-18 08:30',
    status: 'delivered',
    sentAt: '2026-09-18 08:31'
  }
];

// ============================================================
// 8. TREATMENT CYCLE ALERTS (TỰ ĐỘNG THEO DÕI CHU KỲ PHÁC ĐỒ)
// ============================================================

export const DEFAULT_TREATMENT_CYCLE_ALERTS: TreatmentCycleAlert[] = [
  {
    id: 'cyc-01',
    customerCode: 'KH-0178',
    customerName: 'Nguyễn Mai Lan',
    customerPhone: '0988 999 111',
    treatmentName: 'Liệu Trình Triệt Lông Diode Laser',
    lastSessionDate: '2026-08-28',
    cycleIntervalDays: 21,
    nextDueDate: '2026-09-18',
    daysRemaining: 0,
    status: 'due_soon'
  },
  {
    id: 'cyc-02',
    customerCode: 'KH-0089',
    customerName: 'Vương Thúy Hằng',
    customerPhone: '0918 333 444',
    treatmentName: 'Liệu Trình Laser PicoWay Trị Nám',
    lastSessionDate: '2026-08-25',
    cycleIntervalDays: 28,
    nextDueDate: '2026-09-22',
    daysRemaining: 4,
    status: 'due_soon'
  },
  {
    id: 'cyc-03',
    customerCode: 'KH-0220',
    customerName: 'Hoàng Bích Thủy',
    customerPhone: '0903 121 212',
    treatmentName: 'Tiêm Vi Điểm Trẻ Hóa Da Profhilo / Meso',
    lastSessionDate: '2026-08-20',
    cycleIntervalDays: 28,
    nextDueDate: '2026-09-17',
    daysRemaining: -1,
    status: 'overdue'
  },
  {
    id: 'cyc-04',
    customerCode: 'KH-0056',
    customerName: 'Đỗ Kim Oanh',
    customerPhone: '0938 777 888',
    treatmentName: 'Nâng Cơ Xóa Nhăn HIFU Ultraformer MPT',
    lastSessionDate: '2026-03-15',
    cycleIntervalDays: 180, // 6 tháng
    nextDueDate: '2026-09-11',
    daysRemaining: -7,
    status: 'overdue'
  }
];

// ============================================================
// 9. CONVERSATIONAL CONSULTANT (AUTHENTIC CLINIC SPECIALIST)
// ============================================================

export const DEFAULT_AI_CHAT_MESSAGES: AiChatMessage[] = [
  {
    id: 'chat-1',
    sender: 'ai',
    text: 'Dạ em chào chị ạ! Em là Thảo My - Chuyên viên tư vấn da liễu tại Viện Thẩm Mỹ Wellness. Rất vui được hỗ trợ chị hôm nay! Hiện tại làn da của mình đang gặp vấn đề gì hay chị đang quan tâm đến liệu trình nào (trị nám, nâng cơ hay sẹo rỗ) để em gửi phác đồ và ưu đãi riêng cho chị ạ?',
    timestamp: '09:00'
  }
];

// ============================================================
// 10. MARKETING AUTOMATION & LEAD SCORING
// ============================================================

export const DEFAULT_MARKETING_LEADS: MarketingLead[] = [
  {
    id: 'lead-01',
    name: 'Trần Thu Thảo',
    phone: '0933 112 233',
    email: 'thuthao.tran@gmail.com',
    source: 'Facebook Ads',
    interestService: 'Laser PicoWay Trị Nám Chân Sâu',
    score: 85,
    tier: 'Hot',
    status: 'new',
    assignedSales: 'Nguyễn Thùy Dung',
    lastInteraction: '10 phút trước',
    nurturingStage: 1,
    behaviorLogs: [
      { action: 'Bấm xem quảng cáo FB: Xóa Nám Picosecond', points: 15, timestamp: '14:20 18/09' },
      { action: 'Xem video giải thích cơ chế xung siêu ngắn Pico (thời lượng 85%)', points: 25, timestamp: '14:22 18/09' },
      { action: 'Nhắn tin Zalo OA hỏi: "Nám chân sâu làm mấy buổi thì mờ?"', points: 25, timestamp: '14:25 18/09' },
      { action: 'Tải voucher ưu đãi 500.000đ buổi trải nghiệm đầu', points: 20, timestamp: '14:27 18/09' }
    ]
  },
  {
    id: 'lead-02',
    name: 'Hoàng Diễm My',
    phone: '0912 889 900',
    email: 'diemmy.hoang@yahoo.com',
    source: 'Google Ads',
    interestService: 'Nâng Cơ Xóa Nhăn HIFU Ultraformer MPT',
    score: 90,
    tier: 'Hot',
    status: 'new',
    assignedSales: 'Phạm Minh Anh',
    lastInteraction: '25 phút trước',
    nurturingStage: 1,
    behaviorLogs: [
      { action: 'Tìm kiếm Google "hifu nâng cơ mặt giá bao nhiêu"', points: 20, timestamp: '13:50 18/09' },
      { action: 'Vào landing page xem bài viết "So sánh HIFU MPT vs Phẫu thuật căng chỉ"', points: 20, timestamp: '13:53 18/09' },
      { action: 'Chat trực tuyến hỏi Bác sĩ: "Có đau không và cần bắn bao nhiêu shot viền hàm?"', points: 30, timestamp: '13:57 18/09' },
      { action: 'Chọn khung giờ chiều Thứ 7 nhưng chưa thanh toán cọc', points: 20, timestamp: '14:02 18/09' }
    ]
  },
  {
    id: 'lead-03',
    name: 'Vũ Quang Huy',
    phone: '0909 667 788',
    source: 'TikTok',
    interestService: 'Fractional CO2 Laser & Cắt Đáy Sẹo Rỗ',
    score: 65,
    tier: 'Warm',
    status: 'nurturing',
    assignedSales: 'Nguyễn Thùy Dung',
    lastInteraction: '2 giờ trước',
    nurturingStage: 2,
    behaviorLogs: [
      { action: 'Bấm link Bio TikTok từ video bác sĩ giải thích đáy sẹo xơ cứng', points: 15, timestamp: '12:00 18/09' },
      { action: 'Xem bộ ảnh Before/After 5 ca sẹo rỗ lâu năm', points: 25, timestamp: '12:05 18/09' },
      { action: 'Gửi ảnh da cận cảnh hỏi thời gian nghỉ dưỡng kiêng nước', points: 25, timestamp: '12:15 18/09' }
    ]
  },
  {
    id: 'lead-04',
    name: 'Lê Bích Phượng',
    phone: '0977 445 566',
    source: 'Website Landing',
    interestService: 'Cấy Căng Bóng Da Profhilo / Meso Cocktail',
    score: 40,
    tier: 'Cold',
    status: 'nurturing',
    lastInteraction: '1 ngày trước',
    nurturingStage: 1,
    behaviorLogs: [
      { action: 'Đọc bài viết blog "Bí quyết phục hồi hàng rào da sau tuổi 30"', points: 15, timestamp: '10:00 17/09' },
      { action: 'Xem bảng giá liệu trình tiêm vi điểm', points: 25, timestamp: '10:05 17/09' }
    ]
  },
  {
    id: 'lead-05',
    name: 'Nguyễn Hồng Hạnh',
    phone: '0982 334 455',
    source: 'Zalo OA',
    interestService: 'Hydrafacial Platinum Thải Độc & Cấp Ẩm',
    score: 75,
    tier: 'Hot',
    status: 'hot_called',
    assignedSales: 'Phạm Minh Anh',
    lastInteraction: '15 phút trước',
    behaviorLogs: [
      { action: 'Quét mã QR Zalo OA tại quầy lễ tân', points: 20, timestamp: '14:00 18/09' },
      { action: 'Bấm nhận e-voucher trải nghiệm Hydrafacial 499k', points: 30, timestamp: '14:05 18/09' },
      { action: 'Nhắn tin: "Chủ nhật này 15h còn giường VIP không bạn?"', points: 25, timestamp: '14:15 18/09' }
    ]
  }
];

// ============================================================
// 11. NURTURING DRIP CAMPAIGNS (CHUỖI NUÔI DƯỠNG TỰ ĐỘNG)
// ============================================================

export const DEFAULT_DRIP_CAMPAIGNS: DripCampaign[] = [
  {
    id: 'drip-01',
    name: 'Chuỗi Nuôi Dưỡng: Trẻ Hóa & Nâng Cơ HIFU Ultraformer MPT',
    serviceTarget: 'HIFU Ultraformer MPT',
    audienceDescription: 'Khách hàng quan tâm nâng cơ / nọng cằm nhưng chưa đặt cọc hẹn',
    status: 'active',
    enrolledCount: 42,
    openRate: 71.4,
    bookingConversionRate: 33.3,
    steps: [
      {
        day: 1,
        title: 'Cơ Chế Y Khoa & Chứng Nhận FDA Hoa Kỳ',
        channel: 'Zalo ZNS',
        subject: 'Bác sĩ giải thích: Vì sao HIFU MPT làm thon gọn cơ SMAS mà không cần phẫu thuật?',
        content: '[WELLNESS CLINIC] Chào chị, khác với sóng RF bề mặt, công nghệ HIFU Ultraformer MPT tạo điểm nhiệt hội tụ vi điểm chính xác ở tầng cơ SMAS (4.5mm) - tầng cân cơ phẫu thuật. Quá trình này kích thích tăng sinh collagen gấp 3 lần mà bề mặt da hoàn toàn không tổn thương hay cần nghỉ dưỡng.',
        ctaText: 'Xem video cơ chế 3D',
        beforeAfterCase: 'Ca nâng cung mày và thon gọn viền hàm tức thì sau 60 phút'
      },
      {
        day: 3,
        title: 'Case Study & Hình Ảnh Before/After Khách Hàng Thật',
        channel: 'Zalo ZNS',
        subject: 'Kết quả khách hàng 42 tuổi sau 1 liệu trình duy nhất',
        content: '[WELLNESS CLINIC] Chia sẻ từ Chị Oanh (42 tuổi, Giám đốc tài chính): "Sau 60 phút làm HIFU MPT, rãnh cười sâu và nọng cằm mờ đi trông thấy, bạn bè ai cũng khen trẻ ra 5 tuổi mà không hề bầm tím". Xem album ảnh thực tế không qua chỉnh sửa tại đây.',
        ctaText: 'Xem Album Before/After thực tế'
      },
      {
        day: 5,
        title: 'Đặc Quyền Giới Hạn 48 Giờ: Tặng Điện Di Tế Bào Gốc',
        channel: 'Zalo ZNS',
        subject: 'Ưu đãi kích hoạt: Tặng buổi Điện di HA trị giá 1.200.000đ khi đặt lịch hôm nay',
        content: '[WELLNESS CLINIC] Đặc quyền dành riêng cho chị: Tặng kèm 01 buổi Điện Di Tế Bào Gốc Đông Khô Thụy Sĩ (trị giá 1.200.000đ) khi giữ chỗ phác đồ HIFU MPT trong vòng 48 giờ tới. Giữ trọn vẻ thanh xuân với phác đồ chuẩn y khoa.',
        ctaText: 'Nhận Mã Giữ Chỗ 48h',
        voucherOffer: 'HIFU_VIP_GIFT1200K'
      }
    ]
  },
  {
    id: 'drip-02',
    name: 'Chuỗi Nuôi Dưỡng: Laser PicoWay Trị Nám & Tàn Nhang Không Bong Tróc',
    serviceTarget: 'Laser PicoWay Trị Nám',
    audienceDescription: 'Khách hàng bị nám mảng, tàn nhang lo sợ tăng sắc tố hoặc bỏng rát',
    status: 'active',
    enrolledCount: 56,
    openRate: 78.5,
    bookingConversionRate: 39.2,
    steps: [
      {
        day: 1,
        title: 'Tại Sao Picosecond Không Gây Tăng Sắc Tố?',
        channel: 'Zalo ZNS',
        subject: 'Nguyên lý quang âm phá vỡ sắc tố thành hạt siêu bụi',
        content: '[WELLNESS CLINIC] Chào chị, Laser thông thường sử dụng nhiệt quang dễ gây bỏng và dội ngược sắc tố. Ngược lại, PicoWay phát xung cực ngắn (1 phần nghìn tỷ giây) tạo hiệu ứng sóng âm tán vỡ hạt melanin thành bụi siêu vi điểm để đại thực bào đào thải tự nhiên, không làm đỏ rát bề mặt da.',
        ctaText: 'Đọc bài phân tích của Bác sĩ CKI'
      },
      {
        day: 3,
        title: 'Khảo Sát Khách Hàng Sau 3 Buổi PicoWay',
        channel: 'Zalo ZNS',
        subject: '94% khách hàng nám chân sâu cải thiện sắc tố sau 3 buổi',
        content: '[WELLNESS CLINIC] Báo cáo lâm sàng từ 120 khách hàng tại viện: 94% khách hàng mờ nám từ 60-85% sau 3 buổi phác đồ kết hợp serum ức chế Tyrosinase. Da sáng đều màu và thu nhỏ lỗ chân lông rõ rệt.',
        ctaText: 'Xem phác đồ kết hợp phục hồi'
      },
      {
        day: 5,
        title: 'Tặng Gói Soi Da AI 3D 6 Lớp Trị Giá 800k',
        channel: 'SMS Brandname',
        subject: 'Thư mời: Miễn phí soi da AI 3D và tư vấn trực tiếp cùng Bác sĩ',
        content: '[WELLNESS] Tang chi buoi Soi Da 3D da tang tri gia 800k & Voucher giam 40% buoi trai nghiem PicoWay dau tien. Ma uu dai: PICO40. Ap dung den 20/09.',
        ctaText: 'Đặt lịch soi da miễn phí',
        voucherOffer: 'PICO40_EXPERIENCE'
      }
    ]
  }
];

// ============================================================
// 12. POST-TREATMENT CARE TICKETS (CHĂM SÓC HẬU ĐIỀU TRỊ)
// ============================================================

export const DEFAULT_POST_TREATMENT_TICKETS: PostTreatmentCareTicket[] = [
  {
    id: 'post-01',
    customerCode: 'KH-0089',
    customerName: 'Vương Thúy Hằng',
    customerPhone: '0918 333 444',
    serviceName: 'Laser PicoWay Trị Nám (Buổi 3)',
    sessionDate: '2026-09-18',
    stage: '0h_homecare',
    homeCareSent: true,
    skinStatus: 'normal_calm',
    patientFeedback: 'Da êm, chỉ hơi hồng nhẹ vùng gò má. Đã bôi kem B5 và xịt khoáng như KTV dặn.',
    doctorEscalated: false,
    lastUpdated: '10:30 18/09'
  },
  {
    id: 'post-02',
    customerCode: 'KH-0124',
    customerName: 'Trần Hoàng Nam',
    customerPhone: '0902 555 666',
    serviceName: 'Fractional CO2 & Cắt Đáy Sẹo (Buổi 2)',
    sessionDate: '2026-09-17',
    stage: '24h_skin_check',
    homeCareSent: true,
    skinStatus: 'slight_redness',
    patientFeedback: 'Da hơi ửng đỏ hai bên má và có cảm giác căng nhẹ khi cười, không thấy mụn nước.',
    doctorEscalated: false,
    doctorNote: 'Đáp ứng nhiệt vi điểm tốt. Tiếp tục chườm lạnh 10 phút, kiêng nước sinh hoạt 24h đầu, dùng nước muối sinh lý.',
    lastUpdated: '09:15 18/09'
  },
  {
    id: 'post-03',
    customerCode: 'KH-0056',
    customerName: 'Đỗ Kim Oanh',
    customerPhone: '0938 777 888',
    serviceName: 'Nâng Cơ Xóa Nhăn HIFU MPT 600 Shot',
    sessionDate: '2026-09-16',
    stage: '48h_recovery',
    homeCareSent: true,
    skinStatus: 'normal_calm',
    patientFeedback: 'Viền hàm hơi ê nhẹ khi ấn mạnh vào cơ nhai, mặt thon gọn rõ rệt.',
    doctorEscalated: false,
    lastUpdated: '11:00 18/09'
  },
  {
    id: 'post-04',
    customerCode: 'KH-0240',
    customerName: 'Bùi Thu Trang',
    customerPhone: '0904 888 123',
    serviceName: 'Peel Tái Tạo Da Chuyên Sâu TCA 15%',
    sessionDate: '2026-09-17',
    stage: '24h_skin_check',
    homeCareSent: true,
    skinStatus: 'urgent_doctor',
    patientFeedback: 'Vùng quanh mép hơi ngứa rát và xuất hiện 2 nốt rộp nước nhỏ.',
    doctorEscalated: true,
    doctorNote: 'BS. Anh Thư đã gọi điện thoại qua Zalo hướng dẫn bôi mỡ Fucidin mỏng, tạm dừng mọi serum acid, hẹn tái khám 15:30 chiều nay.',
    lastUpdated: '10:00 18/09'
  }
];

// ============================================================
// 13. CHURN PREVENTION (CHỐNG RỜI BỎ >45 NGÀY)
// ============================================================

export const DEFAULT_CHURN_CUSTOMERS: ChurnRiskCustomer[] = [
  {
    id: 'churn-01',
    customerCode: 'KH-0042',
    customerName: 'Phạm Hải Yến',
    customerPhone: '0915 223 344',
    favoriteService: 'Laser PicoWay & Cấp Ẩm Chuyên Sâu',
    lastVisitDate: '2026-07-28',
    daysInactive: 52,
    totalSpent: 24500000,
    riskLevel: 'high',
    winbackVoucherCode: 'COMEBACK_VIP_500K',
    winbackVoucherValue: 'Giảm 500.000đ + Tặng 1 buổi Điện Di Tế Bào Gốc',
    status: 'voucher_sent',
    cskhAssigned: 'Nguyễn Thùy Dung',
    cskhNotes: 'Đã gửi ZNS Win-back hôm qua, khách đã xem tin nhắn.'
  },
  {
    id: 'churn-02',
    customerCode: 'KH-0099',
    customerName: 'Đoàn Thu Hương',
    customerPhone: '0938 445 566',
    favoriteService: 'Triệt Lông Diode & Điều Trị Mụn Chuẩn Y Khoa',
    lastVisitDate: '2026-07-12',
    daysInactive: 68,
    totalSpent: 12800000,
    riskLevel: 'critical',
    winbackVoucherCode: 'WE_MISS_YOU_FREE_MESO',
    winbackVoucherValue: 'Tặng 1 buổi Trẻ Hóa Mắt Chuyên Sâu trị giá 850.000đ',
    status: 'called_reconnected',
    cskhAssigned: 'Phạm Minh Anh',
    cskhNotes: 'Gọi điện lúc 10h: Chị đi công tác Singapore vừa về. Đã đồng ý đặt hẹn vào thứ 7 tuần này.'
  },
  {
    id: 'churn-03',
    customerCode: 'KH-0155',
    customerName: 'Ngô Quốc Bảo',
    customerPhone: '0908 778 899',
    favoriteService: 'Fractional CO2 Laser Trị Sẹo',
    lastVisitDate: '2026-08-03',
    daysInactive: 46,
    totalSpent: 18000000,
    riskLevel: 'medium',
    winbackVoucherCode: 'RESTART_SKIN_300K',
    winbackVoucherValue: 'Giảm 300.000đ cho buổi điều trị sẹo tiếp theo',
    status: 'pending',
    cskhAssigned: 'Lê Thị Hà',
    cskhNotes: 'Hệ thống vừa phát hiện vượt mốc 45 ngày, chờ CSKH gọi điện chăm sóc.'
  }
];

// ============================================================
// 14. LOYALTY & REFERRAL PROGRAM (HẠNG THẺ & GIỚI THIỆU BẠN BÈ)
// ============================================================

export const DEFAULT_LOYALTY_MEMBERS: LoyaltyMember[] = [
  {
    id: 'loyalty-01',
    customerCode: 'KH-0056',
    customerName: 'Đỗ Kim Oanh',
    customerPhone: '0938 777 888',
    tier: 'VVIP Diamond',
    points: 7420,
    totalSpent: 74200000,
    birthday: '1982-11-12',
    birthdayGiftSent: false,
    referralCode: 'OANH_DIAMOND',
    referralCount: 8,
    referralRewardsEarned: 4000000,
    joinedDate: '2025-01-10'
  },
  {
    id: 'loyalty-02',
    customerCode: 'KH-0089',
    customerName: 'Vương Thúy Hằng',
    customerPhone: '0918 333 444',
    tier: 'VIP',
    points: 3850,
    totalSpent: 38500000,
    birthday: '1988-09-25',
    birthdayGiftSent: false,
    referralCode: 'HANGVVIP88',
    referralCount: 4,
    referralRewardsEarned: 2000000,
    joinedDate: '2025-04-15'
  },
  {
    id: 'loyalty-03',
    customerCode: 'KH-0178',
    customerName: 'Nguyễn Mai Lan',
    customerPhone: '0988 999 111',
    tier: 'Gold',
    points: 1860,
    totalSpent: 18600000,
    birthday: '1993-10-05',
    birthdayGiftSent: false,
    referralCode: 'LAN_BEAUTY',
    referralCount: 2,
    referralRewardsEarned: 1000000,
    joinedDate: '2025-08-20'
  },
  {
    id: 'loyalty-04',
    customerCode: 'KH-0124',
    customerName: 'Trần Hoàng Nam',
    customerPhone: '0902 555 666',
    tier: 'Silver',
    points: 920,
    totalSpent: 9200000,
    birthday: '1990-09-18', // Hôm nay sinh nhật!
    birthdayGiftSent: true,
    referralCode: 'NAM_SKIN90',
    referralCount: 1,
    referralRewardsEarned: 500000,
    joinedDate: '2026-02-12'
  }
];

export const DEFAULT_REFERRAL_RECORDS: ReferralRecord[] = [
  {
    id: 'ref-01',
    referrerName: 'Đỗ Kim Oanh',
    referrerCode: 'OANH_DIAMOND',
    refereeName: 'Lê Kim Ngân',
    refereePhone: '0919 223 344',
    serviceUsed: 'Nâng Cơ Xóa Nhăn HIFU MPT',
    date: '2026-09-10',
    rewardValue: 500000,
    refereeDiscount: 300000,
    status: 'completed'
  },
  {
    id: 'ref-02',
    referrerName: 'Vương Thúy Hằng',
    referrerCode: 'HANGVVIP88',
    refereeName: 'Nguyễn Thu Hà',
    refereePhone: '0902 444 555',
    serviceUsed: 'Laser PicoWay Trị Nám',
    date: '2026-09-14',
    rewardValue: 500000,
    refereeDiscount: 300000,
    status: 'completed'
  },
  {
    id: 'ref-03',
    referrerName: 'Nguyễn Mai Lan',
    referrerCode: 'LAN_BEAUTY',
    refereeName: 'Bùi Thu Hương',
    refereePhone: '0988 112 233',
    serviceUsed: 'Hydrafacial Platinum Thải Độc',
    date: '2026-09-17',
    rewardValue: 500000,
    refereeDiscount: 300000,
    status: 'pending'
  }
];

// ============================================================
// STORAGE HELPERS FOR CLINIC DATA
// ============================================================

export function getInitialClinicData() {
  const rooms = loadLocalData<ClinicRoom[]>(CLINIC_STORAGE_KEYS.ROOMS, DEFAULT_ROOMS);
  const bookings = loadLocalData<Booking[]>(CLINIC_STORAGE_KEYS.BOOKINGS, DEFAULT_BOOKINGS);
  const tips = loadLocalData<HighTechTip[]>(CLINIC_STORAGE_KEYS.HIGH_TECH_TIPS, DEFAULT_HIGH_TECH_TIPS);
  const iotDevices = loadLocalData<IoTDevice[]>(CLINIC_STORAGE_KEYS.IOT_DEVICES, DEFAULT_IOT_DEVICES);
  const emrRecords = loadLocalData<MedicalRecord[]>(CLINIC_STORAGE_KEYS.EMR, DEFAULT_MEDICAL_RECORDS);
  const skinReports = loadLocalData<SkinAnalysisReport[]>(CLINIC_STORAGE_KEYS.SKIN_REPORTS, DEFAULT_SKIN_REPORTS);
  const automatedMsgs = loadLocalData<AutomatedMessage[]>(CLINIC_STORAGE_KEYS.AUTOMATED_MSGS, DEFAULT_AUTOMATED_MSGS);
  const cycleAlerts = loadLocalData<TreatmentCycleAlert[]>(CLINIC_STORAGE_KEYS.AUTOMATED_MSGS + '_cycles', DEFAULT_TREATMENT_CYCLE_ALERTS);
  const chatMessages = loadLocalData<AiChatMessage[]>(CLINIC_STORAGE_KEYS.AI_CHAT, DEFAULT_AI_CHAT_MESSAGES);
  const marketingLeads = loadLocalData<MarketingLead[]>(CLINIC_STORAGE_KEYS.MARKETING_LEADS, DEFAULT_MARKETING_LEADS);
  const dripCampaigns = loadLocalData<DripCampaign[]>(CLINIC_STORAGE_KEYS.DRIP_CAMPAIGNS, DEFAULT_DRIP_CAMPAIGNS);
  const postTreatmentTickets = loadLocalData<PostTreatmentCareTicket[]>(CLINIC_STORAGE_KEYS.POST_TREATMENT_TICKETS, DEFAULT_POST_TREATMENT_TICKETS);
  const churnCustomers = loadLocalData<ChurnRiskCustomer[]>(CLINIC_STORAGE_KEYS.CHURN_CUSTOMERS, DEFAULT_CHURN_CUSTOMERS);
  const loyaltyMembers = loadLocalData<LoyaltyMember[]>(CLINIC_STORAGE_KEYS.LOYALTY_MEMBERS, DEFAULT_LOYALTY_MEMBERS);
  const referralRecords = loadLocalData<ReferralRecord[]>(CLINIC_STORAGE_KEYS.REFERRALS, DEFAULT_REFERRAL_RECORDS);

  return {
    rooms,
    bookings,
    tips,
    iotDevices,
    emrRecords,
    skinReports,
    automatedMsgs,
    cycleAlerts,
    chatMessages,
    marketingLeads,
    dripCampaigns,
    postTreatmentTickets,
    churnCustomers,
    loyaltyMembers,
    referralRecords
  };
}

export function persistClinicData(data: {
  rooms?: ClinicRoom[];
  bookings?: Booking[];
  tips?: HighTechTip[];
  iotDevices?: IoTDevice[];
  emrRecords?: MedicalRecord[];
  skinReports?: SkinAnalysisReport[];
  automatedMsgs?: AutomatedMessage[];
  cycleAlerts?: TreatmentCycleAlert[];
  chatMessages?: AiChatMessage[];
  marketingLeads?: MarketingLead[];
  dripCampaigns?: DripCampaign[];
  postTreatmentTickets?: PostTreatmentCareTicket[];
  churnCustomers?: ChurnRiskCustomer[];
  loyaltyMembers?: LoyaltyMember[];
  referralRecords?: ReferralRecord[];
}) {
  if (data.rooms) saveLocalData(CLINIC_STORAGE_KEYS.ROOMS, data.rooms);
  if (data.bookings) saveLocalData(CLINIC_STORAGE_KEYS.BOOKINGS, data.bookings);
  if (data.tips) saveLocalData(CLINIC_STORAGE_KEYS.HIGH_TECH_TIPS, data.tips);
  if (data.iotDevices) saveLocalData(CLINIC_STORAGE_KEYS.IOT_DEVICES, data.iotDevices);
  if (data.emrRecords) saveLocalData(CLINIC_STORAGE_KEYS.EMR, data.emrRecords);
  if (data.skinReports) saveLocalData(CLINIC_STORAGE_KEYS.SKIN_REPORTS, data.skinReports);
  if (data.automatedMsgs) saveLocalData(CLINIC_STORAGE_KEYS.AUTOMATED_MSGS, data.automatedMsgs);
  if (data.cycleAlerts) saveLocalData(CLINIC_STORAGE_KEYS.AUTOMATED_MSGS + '_cycles', data.cycleAlerts);
  if (data.chatMessages) saveLocalData(CLINIC_STORAGE_KEYS.AI_CHAT, data.chatMessages);
  if (data.marketingLeads) saveLocalData(CLINIC_STORAGE_KEYS.MARKETING_LEADS, data.marketingLeads);
  if (data.dripCampaigns) saveLocalData(CLINIC_STORAGE_KEYS.DRIP_CAMPAIGNS, data.dripCampaigns);
  if (data.postTreatmentTickets) saveLocalData(CLINIC_STORAGE_KEYS.POST_TREATMENT_TICKETS, data.postTreatmentTickets);
  if (data.churnCustomers) saveLocalData(CLINIC_STORAGE_KEYS.CHURN_CUSTOMERS, data.churnCustomers);
  if (data.loyaltyMembers) saveLocalData(CLINIC_STORAGE_KEYS.LOYALTY_MEMBERS, data.loyaltyMembers);
  if (data.referralRecords) saveLocalData(CLINIC_STORAGE_KEYS.REFERRALS, data.referralRecords);
}

// Helper to auto-deduct shots from a high-tech tip when a session completes
export function deductShotsFromTip(tips: HighTechTip[], machineModel: string, tipCodeOrName: string, shotsToDeduct: number): HighTechTip[] {
  return tips.map(tip => {
    if (
      tip.machineModel.toLowerCase().includes(machineModel.toLowerCase()) ||
      tip.name.toLowerCase().includes(tipCodeOrName.toLowerCase()) ||
      tip.code.toLowerCase() === tipCodeOrName.toLowerCase()
    ) {
      const remaining = Math.max(0, tip.remainingShots - shotsToDeduct);
      let status: HighTechTip['status'] = 'optimal';
      if (remaining === 0) status = 'depleted';
      else if (remaining <= tip.alertThreshold / 2) status = 'critical';
      else if (remaining <= tip.alertThreshold) status = 'warning';

      return {
        ...tip,
        remainingShots: remaining,
        status
      };
    }
    return tip;
  });
}

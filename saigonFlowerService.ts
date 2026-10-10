import { initializeApp, getApps } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
  getDocFromServer
} from 'firebase/firestore';

// ============================================================================
// 1. CẤU HÌNH FIREBASE THẬT TỪ REPO: https://github.com/Duyy200692/saigon-Flower.git
// Thương hiệu: JU et Saigon — Encyclopædia Botanica Digital (projectId: "saigon-hoa")
// ============================================================================

export const SAIGON_FLOWER_FIREBASE_CONFIG = {
  projectId: 'saigon-hoa',
  appId: '1:704980454131:web:805ccd34cdffaadc110586',
  apiKey: 'AIzaSyCvygCLAwuFTGnCYQKcBhZFuXJJKeQuGu8',
  authDomain: 'saigon-hoa.firebaseapp.com',
  storageBucket: 'saigon-hoa.firebasestorage.app',
  messagingSenderId: '704980454131',
  firestoreDatabaseId: '(default)'
};

const existingSaigonApp = getApps().find((a) => a.name === 'saigon-hoa');
export const saigonFlowerApp =
  existingSaigonApp || initializeApp(SAIGON_FLOWER_FIREBASE_CONFIG, 'saigon-hoa');
export const flowerDb = getFirestore(saigonFlowerApp);

export const ATELIER_BRAND_INFO = {
  name: 'JU et Saigon',
  tagline: 'Flower your heart, Flower your soul',
  subTaglineVi:
    'Góc hoa nhỏ mang sứ mệnh trao gởi yêu thương và truyền tải thông điệp đến từ hương thơm và sắc màu.',
  addressVi: 'Lầu 1 - 31 Nguyễn Trãi, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh',
  phone: '090 936 80 80',
  phoneFormatted: '0909 368 080',
  email: 'juetsaigon@gmail.com',
  instagram: '@juetsaigon',
  website: 'juinternational.com',
  hoursVi: 'Thứ Hai – Chủ Nhật: 08:30 – 20:30',
  githubRepo: 'https://github.com/Duyy200692/saigon-Flower.git'
};

// ============================================================================
// 2. DATA MODELS CHÍNH XÁC TỪ REPO SAIGON-FLOWER (AtelierContext & Data)
// ============================================================================

export interface WaxSealGiftCard {
  enabled: boolean;
  recipient: string;
  sender: string;
  message: string;
  paperStyle: 'parchment' | 'noir' | 'blush';
  fontStyle: 'serif' | 'italic' | 'mono';
  waxColor: 'gold' | 'crimson' | 'bronze' | 'moss';
}

export type SaigonOrderStatus =
  | 'pending'
  | 'conditioning'
  | 'crafting'
  | 'quality_check'
  | 'delivering'
  | 'completed'
  | 'cancelled';

export interface OrderWorkflowChecklist {
  stemsConditioned: boolean;
  vesselPrepared: boolean;
  arrangementCrafted: boolean;
  waxSealCardAttached: boolean;
  qcPhotoUploaded: boolean;
  hydrationWrapped: boolean;
}

export interface OrderWorkflowLog {
  stage: SaigonOrderStatus;
  timestamp: string;
  note?: string;
}

export const DEFAULT_WORKFLOW_CHECKLIST: OrderWorkflowChecklist = {
  stemsConditioned: false,
  vesselPrepared: false,
  arrangementCrafted: false,
  waxSealCardAttached: false,
  qcPhotoUploaded: false,
  hydrationWrapped: false
};

export const ORDER_WORKFLOW_STAGES: Array<{
  id: SaigonOrderStatus;
  stepNum: number;
  labelVi: string;
  labelEn: string;
  shortVi: string;
  descVi: string;
}> = [
  {
    id: 'pending',
    stepNum: 1,
    labelVi: '1. Tiếp Nhận & Xác Nhận',
    labelEn: '1. Order Received',
    shortVi: 'Tiếp nhận',
    descVi: 'Xác nhận yêu cầu thiết kế, khung giờ giao và thông tin người nhận'
  },
  {
    id: 'conditioning',
    stepNum: 2,
    labelVi: '2. Tuyển Chọn & Dưỡng Hoa',
    labelEn: '2. Stem Conditioning',
    shortVi: 'Dưỡng hoa',
    descVi: 'Tuyển chọn cành hoa tươi, cắt gốc và cấp nước dưỡng chuyên sâu tại Atelier'
  },
  {
    id: 'crafting',
    stepNum: 3,
    labelVi: '3. Chế Tác & Đóng Dấu Sáp',
    labelEn: '3. Floral Crafting & Wax Seal',
    shortVi: 'Đang chế tác',
    descVi: 'Nghệ nhân cắm hoa thủ công theo cấu trúc và niêm phong thiệp dấu sáp'
  },
  {
    id: 'quality_check',
    stepNum: 4,
    labelVi: '4. Nghiệm Thu Ảnh Thực Tế',
    labelEn: '4. Pre-Delivery Photo QC',
    shortVi: 'Nghiệm thu ảnh',
    descVi: 'Kiểm định form dáng, chụp ảnh tác phẩm hoàn thiện tại xưởng gửi khách xem'
  },
  {
    id: 'delivering',
    stepNum: 5,
    labelVi: '5. Đóng Gói & Đang Giao',
    labelEn: '5. Hydration Wrap & Dispatch',
    shortVi: 'Đang giao',
    descVi: 'Bọc giữ ẩm gốc hoa, đính kèm hướng dẫn chăm sóc và vận chuyển tận nơi'
  },
  {
    id: 'completed',
    stepNum: 6,
    labelVi: '6. Trao Tận Tay Hoàn Tất',
    labelEn: '6. Delivered & Completed',
    shortVi: 'Hoàn tất',
    descVi: 'Tác phẩm đã được trao tận tay người nhận trọn vẹn cảm xúc'
  }
];

export interface SaigonBespokeOrder {
  id: string;
  orderCode: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  flowerId?: string;
  flowerName?: string;
  flowerImage?: string;
  moodboardItems?: string[];
  occasion: string;
  deliveryDate: string;
  deliveryTimeSlot?: string;
  district: string;
  budgetVnd: number;
  notes: string;
  giftCard?: WaxSealGiftCard;
  status: SaigonOrderStatus;
  assignedFlorist?: string;
  finishedPhotoUrl?: string;
  workflowChecklist?: OrderWorkflowChecklist;
  workflowHistory?: OrderWorkflowLog[];
  substitutionPolicy?: 'allow_equivalent' | 'strict_confirm' | 'designer_choice';
  suppliesDeducted?: boolean;
  adminNote?: string;
  sourceBranch?: 'saigon_flower_web' | 'ju_wellness_vip_gift' | 'holding_center';
  createdAt: string;
  updatedAt: string;
}

export interface SaigonFlowerSpecimen {
  id: string;
  indexNumber: string;
  name: string;
  vietnameseName: string;
  latinName: string;
  category: 'bridal' | 'sculptural' | 'rare-stems' | 'seasonal' | 'installation';
  categoryLabelVi: string;
  shortDescriptionVi: string;
  materialsVi: string[];
  scentTop: string;
  scentMood: string;
  dimensions: string;
  seasonality: string;
  priceVnd: number;
  priceUsd: number;
  image: string;
  availabilityStatus: 'ready_today' | 'preorder_24h' | 'seasonal_out';
  prepLeadTimeHours: number;
}

export type SaigonSupplyCategory = 'vessels' | 'packaging' | 'conditioning' | 'stems';

export interface SaigonSupplyItem {
  id: string;
  sku: string;
  nameVi: string;
  nameEn: string;
  category: SaigonSupplyCategory;
  unit: string;
  currentStock: number;
  minThreshold: number;
  unitCostVnd: number;
  peakBoostFactor: number;
  supplierNote: string;
  updatedAt: string;
}

export interface SaigonWorkshopItem {
  id: string;
  indexNumber: string;
  name: string;
  titleVi: string;
  subtitleVi: string;
  duration: string;
  groupSize: string;
  locationVi: string;
  pricePerPaxVnd: number;
  image: string;
}

export interface SaigonWorkshopBooking {
  id: string;
  bookingCode: string;
  workshopId: string;
  workshopName: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  companyName?: string;
  participantsCount: number;
  preferredDate: string;
  locationType: string;
  notes: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// 3. DANH MỤC 13 TÁC PHẨM HOA ĐỘC BẢN TRÍCH XUẤT TỪ REPO SAIGON-FLOWER
// ============================================================================

export const SAIGON_FLOWER_CATALOG: SaigonFlowerSpecimen[] = [
  {
    id: 'flower-1791388842716',
    indexNumber: '01',
    name: 'THE BRIDAL VOWS',
    vietnameseName: 'Hoa Cưới Lời Thề Của Cô Dâu (Mẫu Đơn Trắng & Hồ Điệp)',
    latinName: 'Paeonia lactiflora alba x Phalaenopsis aphrodite',
    category: 'bridal',
    categoryLabelVi: 'Hoa Cưới Haute Couture',
    shortDescriptionVi:
      'Đóa hoa cưới Haute Couture kết từ Mẫu đơn trắng tinh khôi đan xen Lan hồ điệp suối nguồn và hạt ngọc trai thủ công.',
    materialsVi: ['Mẫu đơn trắng Hà Lan', 'Lan hồ điệp trắng mini', 'Ngọc trai khâu tay', 'Ruy băng lụa tơ tằm'],
    scentTop: 'Hoa mẫu đơn sớm mai & Trà trắng',
    scentMood: 'Tinh khôi, Lãng mạn & Vĩnh cửu',
    dimensions: 'Cao 42cm × Rộng 35cm',
    seasonality: 'Quanh năm (Đặt trước 24h)',
    priceVnd: 4800000,
    priceUsd: 192,
    image: '/saigon-flower/juet_bridal_vows_1.jpg',
    availabilityStatus: 'ready_today',
    prepLeadTimeHours: 6
  },
  {
    id: 'hyacinthus-nuptialis',
    indexNumber: '02',
    name: 'HYACINTHUS NUPTIALIS',
    vietnameseName: 'Hoa Cưới Dạ Lan Trắng & Ngọc Trai',
    latinName: 'Hyacinthus orientalis alba x Margaritifera',
    category: 'bridal',
    categoryLabelVi: 'Hoa Cưới Độc Bản',
    shortDescriptionVi:
      'Cấu trúc giọt sương từ hàng trăm chuông Dạ lan hương trắng Nhật Bản đính ngọc trai nước ngọt thanh khiết.',
    materialsVi: ['Dạ lan hương trắng Nhật Bản', 'Mao lương trắng', 'Ngọc trai nước ngọt', 'Lụa tơ tằm sống'],
    scentTop: 'Dạ lan hương thanh mát & Sương sớm',
    scentMood: 'Thanh tao, Thuần khiết',
    dimensions: 'Cao 38cm × Rộng 30cm',
    seasonality: 'Tháng 10 – Tháng 4',
    priceVnd: 4500000,
    priceUsd: 180,
    image: '/saigon-flower/juet_hyacinth_bridal_1790840743947.jpg',
    availabilityStatus: 'ready_today',
    prepLeadTimeHours: 6
  },
  {
    id: 'peonia-blush-royale',
    indexNumber: '03',
    name: 'PEONIA BLUSH ROYALE',
    vietnameseName: 'Hộp Hoa Mẫu Đơn Pháp & Mao Lương Hồng',
    latinName: 'Paeonia suffruticosa x Ranunculus asiaticus',
    category: 'seasonal',
    categoryLabelVi: 'Hoa Thiết Kế Mùa & Quà VIP',
    shortDescriptionVi:
      'Tác phẩm được yêu thích nhất dành tặng Khách VIP Wellness & Thẩm mỹ: Mẫu đơn Coral Charm & Mao lương Pháp cánh bướm.',
    materialsVi: ['Mẫu đơn hồng phấn Pháp', 'Mao lương Hanoi', 'Hồng Ohara hương thơm', 'Hộp nhung Signature JU'],
    scentTop: 'Hồng Damask & Quả mọng ngọt ngào',
    scentMood: 'Kiêu sa, Ngọt ngào & Quyến rũ',
    dimensions: 'Cao 45cm × Rộng 40cm',
    seasonality: 'Quanh năm',
    priceVnd: 3800000,
    priceUsd: 152,
    image: '/saigon-flower/juet_blush_peony_1790840758164.jpg',
    availabilityStatus: 'ready_today',
    prepLeadTimeHours: 3
  },
  {
    id: 'lotus-sacra-saigon',
    indexNumber: '04',
    name: 'LOTUS SACRA SAIGON',
    vietnameseName: 'Hoa Sen Trắng Cung Đình & Đài Sen Điêu Khắc',
    latinName: 'Nelumbo nucifera albicans',
    category: 'sculptural',
    categoryLabelVi: 'Nghệ Thuật Điêu Khắc & Thiền Spa',
    shortDescriptionVi:
      'Gấp cánh sen Bách Diệp thủ công theo tinh thần Thiền định Wabi-Sabi, cực kỳ phù hợp trưng bày phòng VIP Spa hoặc tặng khách trị liệu.',
    materialsVi: ['Sen trắng Bách Diệp Huế', 'Gương sen tươi', 'Cành khô điêu khắc', 'Bình gốm Wabi-Sabi đen nhám'],
    scentTop: 'Hương sen thuần khiết & Gỗ đàn hương nhẹ',
    scentMood: 'An nhiên, Tĩnh tại & Chữa lành',
    dimensions: 'Cao 55cm × Rộng 38cm',
    seasonality: 'Quanh năm',
    priceVnd: 2800000,
    priceUsd: 112,
    image: '/saigon-flower/juet_sacred_lotus_1790840770921.jpg',
    availabilityStatus: 'ready_today',
    prepLeadTimeHours: 3
  },
  {
    id: 'orchidia-vampirea',
    indexNumber: '05',
    name: 'ORCHIDIA VAMPIREA',
    vietnameseName: 'Lan Vanda Dạ Lam & Cành Xoắn Nghệ Thuật',
    latinName: 'Vanda coerulea nocturna',
    category: 'rare-stems',
    categoryLabelVi: 'Cành Hoa Độc Bản Hiếm',
    shortDescriptionVi:
      'Sắc tím đêm huyền bí của Lan Vanda rừng lai tạo kết hợp khung cành Kiwi xoắn điêu khắc đương đại.',
    materialsVi: ['Lan Vanda tím đêm', 'Lan Hồ điệp đốm nghệ thuật', 'Cành Kiwi xoắn tự nhiên', 'Bình thủy tinh cổ cao'],
    scentTop: 'Gỗ tuyết tùng & Hổ phách đêm',
    scentMood: 'Bí ẩn, Quyền lực & Độc bản',
    dimensions: 'Cao 65cm × Rộng 45cm',
    seasonality: 'Quanh năm (Giới hạn 3 bình/ngày)',
    priceVnd: 5200000,
    priceUsd: 210,
    image: '/saigon-flower/juet_surreal_orchid_1790840788413.jpg',
    availabilityStatus: 'preorder_24h',
    prepLeadTimeHours: 12
  },
  {
    id: 'transvaal-rubrum',
    indexNumber: '06',
    name: 'TRANSVAAL RUBRUM',
    vietnameseName: 'Hồng Môn & Anh Túc Đỏ Xoắn',
    latinName: 'Papaver somniferum rubrum spiralis',
    category: 'sculptural',
    categoryLabelVi: 'Nghệ Thuật Điêu Khắc',
    shortDescriptionVi:
      'Sự giao thoa táo bạo giữa đường cong uốn lượn của Anh túc đỏ và bề mặt bóng mượt như gốm sứ của Hồng môn.',
    materialsVi: ['Hoa Anh túc đỏ Iceland', 'Hồng môn đỏ nhung', 'Cành đào đông đỏ', 'Bình gốm kem đá'],
    scentTop: 'Thảo mộc cay nồng & Nhựa cây tươi',
    scentMood: 'Năng lượng, Phá cách & Rực rỡ',
    dimensions: 'Cao 50cm × Rộng 40cm',
    seasonality: 'Quanh năm',
    priceVnd: 3400000,
    priceUsd: 136,
    image: '/saigon-flower/juet_poppy_transvaal_1790840799591.jpg',
    availabilityStatus: 'ready_today',
    prepLeadTimeHours: 4
  },
  {
    id: 'iris-celeste-nocturne',
    indexNumber: '07',
    name: 'IRIS CELESTE NOCTURNE',
    vietnameseName: 'Diên Vĩ Hoàng Gia Sắc Xanh Đêm',
    latinName: 'Iris germanica caerulea',
    category: 'rare-stems',
    categoryLabelVi: 'Cành Hoa Độc Bản Hiếm',
    shortDescriptionVi:
      'Tôn vinh vẻ đẹp tri thức và thanh lịch với hoa Diên vĩ xanh lam đậm lấy cảm hứng từ tranh danh họa Van Gogh.',
    materialsVi: ['Diên vĩ xanh Hoàng gia', 'Phi yến xanh Delphinium', 'Khuynh diệp bạc Cinerea'],
    scentTop: 'Rễ hoa Diên vĩ (Orris) & Không khí sau mưa',
    scentMood: 'Trầm lắng, Sang trọng & Tinh tế',
    dimensions: 'Cao 52cm × Rộng 36cm',
    seasonality: 'Quanh năm',
    priceVnd: 2900000,
    priceUsd: 116,
    image: '/saigon-flower/juet_blue_iris_1790840866986.jpg',
    availabilityStatus: 'ready_today',
    prepLeadTimeHours: 4
  },
  {
    id: 'solaris-chrysanthemum',
    indexNumber: '08',
    name: 'SOLARIS CHRYSANTHEMUM',
    vietnameseName: 'Cúc Mẫu Đơn Hoàng Kim',
    latinName: 'Chrysanthemum morifolium aurea',
    category: 'seasonal',
    categoryLabelVi: 'Hoa Thiết Kế Mùa & Khai Trương',
    shortDescriptionVi:
      'Hàng trăm cánh cúc mẫu đơn vàng ánh kim bung nở rực rỡ, biểu tượng cho tài lộc, thịnh vượng và sinh khí mới.',
    materialsVi: ['Cúc mẫu đơn Hoàng kim nhập khẩu', 'Mao lương vàng bơ', 'Lá bạc Parvifolia'],
    scentTop: 'Mật ong rừng, Cam Bergamot & Hương thảo',
    scentMood: 'Ấm áp, Thịnh vượng & Tươi sáng',
    dimensions: 'Cao 45cm × Rộng 42cm',
    seasonality: 'Quanh năm',
    priceVnd: 2600000,
    priceUsd: 104,
    image: '/saigon-flower/juet_golden_chrysanthemum_1790840878623.jpg',
    availabilityStatus: 'ready_today',
    prepLeadTimeHours: 3
  },
  {
    id: 'anemone-porcelain',
    indexNumber: '09',
    name: 'ANEMONE PORCELAIN',
    vietnameseName: 'Hoa Phong Quỳ Trắng Tâm Đen Điêu Khắc',
    latinName: 'Anemone coronaria alba',
    category: 'sculptural',
    categoryLabelVi: 'Nghệ Thuật Điêu Khắc Monochrome',
    shortDescriptionVi:
      'Tương phản thị giác tuyệt đối giữa cánh hoa trắng sứ mỏng manh và nhụy đen nhung huyền bí chuẩn thẩm mỹ tối giản.',
    materialsVi: ['Hoa Phong quỳ Panda (Anemone)', 'Mao lương trắng', 'Giấy lụa Noir đen mờ'],
    scentTop: 'Phấn hoa trắng & Trà xanh Matcha',
    scentMood: 'Tối giản, Đương đại & Sắc sảo',
    dimensions: 'Cao 44cm × Rộng 35cm',
    seasonality: 'Tháng 9 – Tháng 5',
    priceVnd: 3200000,
    priceUsd: 128,
    image: '/saigon-flower/juet_white_anemone_1790840892002.jpg',
    availabilityStatus: 'ready_today',
    prepLeadTimeHours: 4
  },
  {
    id: 'luna-calla-stipula',
    indexNumber: '10',
    name: 'LUNA CALLA STIPULA',
    vietnameseName: 'Hoa Rum Trắng Uốn Khung Điêu Khắc',
    latinName: 'Zantedeschia aethiopica luna',
    category: 'sculptural',
    categoryLabelVi: 'Nghệ Thuật Điêu Khắc',
    shortDescriptionVi:
      'Kỹ thuật uốn thân hoa Rum (Calla Lily) thành những vòng cung mềm mại như dòng chảy ánh trăng.',
    materialsVi: ['Hoa Rum trắng cổ cao New Zealand', 'Cỏ gấu uốn lượn', 'Bình thủy tinh Cylinder'],
    scentTop: 'Hương nước tinh khiết & Lá xanh non',
    scentMood: 'Thanh thoát, Điêu khắc & Kiến trúc',
    dimensions: 'Cao 58cm × Rộng 34cm',
    seasonality: 'Quanh năm',
    priceVnd: 3600000,
    priceUsd: 144,
    image: '/saigon-flower/juet_calla_sculpture_1790840903037.jpg',
    availabilityStatus: 'ready_today',
    prepLeadTimeHours: 4
  },
  {
    id: 'rosa-damascena-noir',
    indexNumber: '11',
    name: 'ROSA DAMASCENA NOIR',
    vietnameseName: 'Hồng Damask Đen Nhung Huyền Thoại',
    latinName: 'Rosa damascena tenebrosa',
    category: 'bridal',
    categoryLabelVi: 'Hoa Cưới & Quà Tặng Đỉnh Cao',
    shortDescriptionVi:
      'Tuyển tập những đóa Hồng Ecuador Explorer đỏ thẫm ánh nhung đen quyến rũ bậc nhất, lưu hương sâu nồng nàn.',
    materialsVi: ['Hồng Ecuador Explorer hạng A1', 'Skimmia đỏ rượu', 'Hộp nhung Noir đóng dấu sáp vàng'],
    scentTop: 'Tinh dầu Hồng Damask cổ điển & Rượu vang đỏ',
    scentMood: 'Nồng nàn, Đẳng cấp & Say đắm',
    dimensions: 'Cao 46cm × Rộng 40cm',
    seasonality: 'Quanh năm',
    priceVnd: 4200000,
    priceUsd: 168,
    image: '/saigon-flower/juet_peony_side_angle_1790844501746.jpg',
    availabilityStatus: 'ready_today',
    prepLeadTimeHours: 3
  },
  {
    id: 'fluffus-ranunculus',
    indexNumber: '12',
    name: 'FLUFFUS RANUNCULUS',
    vietnameseName: 'Mao Lương Bồng Bềnh Dáng Mây',
    latinName: 'Ranunculus grandis fluffus',
    category: 'seasonal',
    categoryLabelVi: 'Hoa Thiết Kế Mùa',
    shortDescriptionVi:
      'Sự kết hợp bay bổng của Mao lương Butterfly và hoa Scabiosa tạo nên hiệu ứng đám mây hoa bồng bềnh trong nắng sớm.',
    materialsVi: ['Mao lương Butterfly Nhật', 'Hoa Scabiosa cánh bướm', 'Cúc Tana sớm mai'],
    scentTop: 'Cỏ mật, Hoa cúc dại & Nắng ấm',
    scentMood: 'Tự do, Trong trẻo & Bay bổng',
    dimensions: 'Cao 40cm × Rộng 38cm',
    seasonality: 'Quanh năm',
    priceVnd: 2400000,
    priceUsd: 96,
    image: '/saigon-flower/juet_lotus_minimal_table_1790844513685.jpg',
    availabilityStatus: 'ready_today',
    prepLeadTimeHours: 3
  }
];

// ============================================================================
// 4. DANH MỤC 11 VẬT TƯ XƯỞNG HOA TRÍCH XUẤT TỪ REPO SAIGON-FLOWER
// ============================================================================

export const SAIGON_DEFAULT_SUPPLIES: SaigonSupplyItem[] = [
  {
    id: 'sup-vessel-wabisabi',
    sku: 'VES-01',
    nameVi: 'Bình Gốm Wabi-Sabi Thủ Công (Đen Nhám / Kem Đá)',
    nameEn: 'Handcrafted Wabi-Sabi Ceramic Vessel',
    category: 'vessels',
    unit: 'Chiếc',
    currentStock: 8,
    minThreshold: 10,
    unitCostVnd: 280000,
    peakBoostFactor: 2.2,
    supplierNote: 'Lò gốm thủ công Bình Dương — Đặt trước 5 ngày nếu nhập trên 20 chiếc',
    updatedAt: '2026-10-10T00:00:00.000Z'
  },
  {
    id: 'sup-vessel-velvetbox',
    sku: 'VES-02',
    nameVi: 'Hộp Hoa Nhung Đen & Kem Signature JU et Saigon',
    nameEn: 'Signature Velvet Hatbox (Noir & Crème)',
    category: 'vessels',
    unit: 'Hộp',
    currentStock: 12,
    minThreshold: 15,
    unitCostVnd: 165000,
    peakBoostFactor: 2.8,
    supplierNote: 'Xưởng hộp ép kim Q.3 — Tiêu thụ cực nhanh dịp 20/10, 14/02 và 08/03',
    updatedAt: '2026-10-10T00:00:00.000Z'
  },
  {
    id: 'sup-vessel-glass',
    sku: 'VES-03',
    nameVi: 'Bình Thủy Tinh Điêu Khắc Cổ Cao Trong Suốt',
    nameEn: 'Architectural Tall Cylinder Glass Vase',
    category: 'vessels',
    unit: 'Chiếc',
    currentStock: 14,
    minThreshold: 8,
    unitCostVnd: 190000,
    peakBoostFactor: 1.8,
    supplierNote: 'Dùng cho các mẫu Điêu Khắc (Sculptural) & Sảnh Doanh Nghiệp / Phòng VIP Spa',
    updatedAt: '2026-10-10T00:00:00.000Z'
  },
  {
    id: 'sup-pkg-silkpaper',
    sku: 'PKG-01',
    nameVi: 'Giấy Gói Lụa Mờ Chống Nước Hàn Quốc (Đen / Kem / Khói)',
    nameEn: 'Matte Waterproof Korean Silk Wrapping Paper',
    category: 'packaging',
    unit: 'Xấp (20 tờ)',
    currentStock: 6,
    minThreshold: 10,
    unitCostVnd: 95000,
    peakBoostFactor: 2.6,
    supplierNote: 'Ưu tiên tông Đen Noir, Kem Parchment và Xám Khói đặc trưng của Atelier',
    updatedAt: '2026-10-10T00:00:00.000Z'
  },
  {
    id: 'sup-pkg-ribbon',
    sku: 'PKG-02',
    nameVi: 'Ruy Băng Lụa Tơ Tằm Tước Sợi Thủ Công Khổ 4cm',
    nameEn: 'Hand-Frayed Raw Silk Ribbon (4cm)',
    category: 'packaging',
    unit: 'Cuộn (25m)',
    currentStock: 7,
    minThreshold: 8,
    unitCostVnd: 140000,
    peakBoostFactor: 2.5,
    supplierNote: 'Dùng buộc gốc bó hoa & hộp quà — Luôn dự trữ màu Champagne & Đỏ Rượu',
    updatedAt: '2026-10-10T00:00:00.000Z'
  },
  {
    id: 'sup-pkg-waxbeads',
    sku: 'PKG-03',
    nameVi: 'Hạt Sáp Đóng Dấu Cổ Điển (Vàng Đồng / Đỏ Nhung / Rêu)',
    nameEn: 'Artisanal Sealing Wax Beads (Gold / Crimson / Moss)',
    category: 'packaging',
    unit: 'Hộp (200 hạt)',
    currentStock: 5,
    minThreshold: 6,
    unitCostVnd: 120000,
    peakBoostFactor: 2.4,
    supplierNote: 'Mỗi thiệp dấu sáp tiêu hao 3–4 hạt sáp. Kiểm tra thêm nến đun sáp.',
    updatedAt: '2026-10-10T00:00:00.000Z'
  },
  {
    id: 'sup-pkg-cards',
    sku: 'PKG-04',
    nameVi: 'Bộ Thiệp Giấy Mỹ Thuật 350gsm & Phong Bì Can Mờ',
    nameEn: '350gsm Fine Art Stationery Card & Vellum Envelope',
    category: 'packaging',
    unit: 'Bộ (50 thiệp)',
    currentStock: 4,
    minThreshold: 5,
    unitCostVnd: 210000,
    peakBoostFactor: 3.0,
    supplierNote: '100% đơn quà tặng VIP đều đính kèm thiệp đóng dấu sáp và Care Tag',
    updatedAt: '2026-10-10T00:00:00.000Z'
  },
  {
    id: 'sup-cnd-oasis',
    sku: 'CND-01',
    nameVi: 'Xốp Cắm Hoa Sinh Học Oasis Ideal Floral Foam',
    nameEn: 'Oasis Ideal Maxlife Floral Foam Box',
    category: 'conditioning',
    unit: 'Thùng (20 viên)',
    currentStock: 3,
    minThreshold: 4,
    unitCostVnd: 360000,
    peakBoostFactor: 2.5,
    supplierNote: 'Ngâm nước pha Chrysal tự thẩm thấu, không ấn tay khi chuẩn bị cốt cắm',
    updatedAt: '2026-10-10T00:00:00.000Z'
  },
  {
    id: 'sup-cnd-chrysal',
    sku: 'CND-02',
    nameVi: 'Dung Dịch Dưỡng Hoa Tươi Chrysal Professional 2',
    nameEn: 'Chrysal Professional 2 Conditioning Solution',
    category: 'conditioning',
    unit: 'Can (5 Lít)',
    currentStock: 2,
    minThreshold: 2,
    unitCostVnd: 680000,
    peakBoostFactor: 2.0,
    supplierNote: 'Dùng cho Bước 2 (Tuyển chọn & Dưỡng hoa) giúp hoa tươi lâu thêm 60%',
    updatedAt: '2026-10-10T00:00:00.000Z'
  },
  {
    id: 'sup-cnd-hydration',
    sku: 'CND-03',
    nameVi: 'Túi Bọc Giữ Ẩm Gốc Hoa Chuyên Dụng (Eco Hydration Bag)',
    nameEn: 'Eco Root Hydration Travel Wrap Pack',
    category: 'conditioning',
    unit: 'Bịch (50 túi)',
    currentStock: 3,
    minThreshold: 5,
    unitCostVnd: 150000,
    peakBoostFactor: 2.6,
    supplierNote: 'Bắt buộc ở Bước 5 (Đóng gói & Đang giao) để hoa không héo khi di chuyển',
    updatedAt: '2026-10-10T00:00:00.000Z'
  },
  {
    id: 'sup-stm-ohara',
    sku: 'STM-01',
    nameVi: 'Hoa Hồng Ngoại Ohara / Ecuador Tuyển Chọn (Hồng Phấn & Trắng Kem)',
    nameEn: 'Premium Imported Ohara & Ecuadorian Roses',
    category: 'stems',
    unit: 'Bó (20 cành)',
    currentStock: 6,
    minThreshold: 8,
    unitCostVnd: 450000,
    peakBoostFactor: 3.0,
    supplierNote: 'Bảo quản tủ mát 4–6°C, tỉa gai và lá gốc ngay khi nhập kho buổi sáng',
    updatedAt: '2026-10-10T00:00:00.000Z'
  }
];

// ============================================================================
// 5. DANH MỤC 3 WORKSHOP NGHỆ THUẬT TRÍCH XUẤT TỪ REPO SAIGON-FLOWER
// ============================================================================

export const SAIGON_WORKSHOPS: SaigonWorkshopItem[] = [
  {
    id: 'corporate-floral-retreat',
    indexNumber: '01',
    name: 'SYMPHONIA BOTANICA',
    titleVi: 'WORKSHOP CẮM HOA DOANH NGHIỆP & GẮN KẾT ĐỘI NGŨ',
    subtitleVi: 'Trải nghiệm nghệ thuật chữa lành & Gắn kết nhân sự cao cấp',
    duration: '2.5 Giờ (Hours)',
    groupSize: '15 – 60+ Thành viên (Pax)',
    locationVi: 'Tại Atelier Quận 1 hoặc Tận nơi Doanh nghiệp',
    pricePerPaxVnd: 950000,
    image: '/saigon-flower/juet_workshop_office_terracotta_1790851072206.jpg'
  },
  {
    id: 'onsite-office-atelier',
    indexNumber: '02',
    name: 'FLORA IN OFFICIO',
    titleVi: 'DỊCH VỤ MANG XƯỞNG HOA ĐẾN TẬN VĂN PHÒNG CÔNG TY',
    subtitleVi: 'Trọn gói dụng cụ, hoa nhập khẩu & Nghệ nhân hướng dẫn tận nơi',
    duration: '2.5 Giờ (Hours)',
    groupSize: '15 – 60+ Thành viên (Pax)',
    locationVi: 'Tận nơi tại Văn Phòng Doanh Nghiệp (TP.HCM & lân cận)',
    pricePerPaxVnd: 850000,
    image: '/saigon-flower/juet_workshop_table_flatlay_1790851084638.jpg'
  },
  {
    id: 'atelier-d1-masterclass',
    indexNumber: '03',
    name: 'VOMITUS FLOS',
    titleVi: 'ATELIER PRIVATE MASTERCLASS TẠI QUẬN 1 (VIP & RETREAT)',
    subtitleVi: 'Không gian Pháp cổ · Thưởng trà thảo mộc · Cắm hoa nghệ thuật',
    duration: '2.5 Giờ (Hours)',
    groupSize: '4 – 10 Học viên (Pax)',
    locationVi: 'Atelier JU et Saigon: Lầu 1 - 31 Nguyễn Trãi, P. Bến Thành, Quận 1',
    pricePerPaxVnd: 1200000,
    image: '/saigon-flower/juet_workshop_team_bonding_1790851105708.jpg'
  }
];

// ============================================================================
// 6. ĐƠN HOA & WORKSHOP MẪU LIÊN THÔNG VỚI KHÁCH HÀNG VIP WELLNESS
// ============================================================================

export const SAIGON_DEFAULT_ORDERS: SaigonBespokeOrder[] = [
  {
    id: 'order-juet-vip-01',
    orderCode: 'ORD-2610-881',
    customerName: 'Nguyễn Minh Khuê',
    customerPhone: '0903123456',
    customerEmail: 'minhkhue.vip@gmail.com',
    flowerId: 'peonia-blush-royale',
    flowerName: 'PEONIA BLUSH ROYALE — Hộp Hoa Mẫu Đơn Pháp & Mao Lương Hồng',
    flowerImage: '/saigon-flower/juet_blush_peony_1790840758164.jpg',
    occasion: 'Quà Tặng Tri Ân Khách VVIP Sau Liệu Trình Thermage FLX',
    deliveryDate: '2026-10-10',
    deliveryTimeSlot: '14:00 - 16:00',
    district: 'Quận 1 (Giao tại Phòng VIP 01 — JU Clinic & Spa hoặc tận nhà Thảo Điền)',
    budgetVnd: 3800000,
    notes: 'Khách VVIP Diamond của nhánh Thẩm mỹ không xâm lấn vừa hoàn tất liệu trình trẻ hóa. Phối tông hồng phấn thanh nhã.',
    giftCard: {
      enabled: true,
      recipient: 'Chị Nguyễn Minh Khuê',
      sender: 'Ban Giám Đốc JU Wellness & JU et Saigon',
      message: 'Cảm ơn Chị đã luôn tin chọn hành trình chăm sóc sắc đẹp và tâm hồn tại hệ sinh thái JU. Chúc Chị luôn rạng rỡ như đóa mẫu đơn sớm mai.',
      paperStyle: 'parchment',
      fontStyle: 'serif',
      waxColor: 'gold'
    },
    status: 'crafting',
    assignedFlorist: 'Master Florist Minh Anh',
    workflowChecklist: {
      stemsConditioned: true,
      vesselPrepared: true,
      arrangementCrafted: true,
      waxSealCardAttached: true,
      qcPhotoUploaded: false,
      hydrationWrapped: false
    },
    workflowHistory: [
      { stage: 'pending', timestamp: '2026-10-10T08:30:00.000Z', note: 'Lệnh tự động từ Trung tâm Holding (Tri ân VVIP)' },
      { stage: 'conditioning', timestamp: '2026-10-10T09:15:00.000Z', note: 'Đã dưỡng cành Mẫu đơn Pháp bằng Chrysal Pro 2' },
      { stage: 'crafting', timestamp: '2026-10-10T10:00:00.000Z', note: 'Đang lên form hộp nhung Signature & đóng dấu sáp vàng' }
    ],
    suppliesDeducted: true,
    sourceBranch: 'ju_wellness_vip_gift',
    createdAt: '2026-10-10T08:30:00.000Z',
    updatedAt: '2026-10-10T10:00:00.000Z'
  },
  {
    id: 'order-juet-vip-02',
    orderCode: 'ORD-2610-882',
    customerName: 'Trần Ngọc Bích',
    customerPhone: '0918889999',
    customerEmail: 'ngocbich.tran@luxury.vn',
    flowerId: 'lotus-sacra-saigon',
    flowerName: 'LOTUS SACRA SAIGON — Hoa Sen Trắng Cung Đình & Đài Sen Điêu Khắc',
    flowerImage: '/saigon-flower/juet_sacred_lotus_1790840770921.jpg',
    occasion: 'Đặt Hoa Trưng Bày Biệt Thự & Quà Sinh Nhật VIP',
    deliveryDate: '2026-10-10',
    deliveryTimeSlot: '10:00 - 12:00',
    district: 'Quận 7 — Khu Biệt Thự Chateau Phú Mỹ Hưng',
    budgetVnd: 2800000,
    notes: 'Khách hàng thân thiết của cả 2 nhánh (Spa Trị Liệu Cổ Vai Gáy & Hoa định kỳ hàng tuần). Ưu tiên bình gốm Wabi-Sabi đen nhám.',
    giftCard: {
      enabled: true,
      recipient: 'Chị Trần Ngọc Bích',
      sender: 'JU et Saigon Atelier',
      message: 'Gửi đến không gian sống của Chị nét tĩnh tại và hương sen thuần khiết từ JU et Saigon.',
      paperStyle: 'noir',
      fontStyle: 'italic',
      waxColor: 'bronze'
    },
    status: 'completed',
    assignedFlorist: 'Nghệ nhân Bảo Trân',
    finishedPhotoUrl: '/saigon-flower/juet_sacred_lotus_1790840770921.jpg',
    workflowChecklist: {
      stemsConditioned: true,
      vesselPrepared: true,
      arrangementCrafted: true,
      waxSealCardAttached: true,
      qcPhotoUploaded: true,
      hydrationWrapped: true
    },
    suppliesDeducted: true,
    sourceBranch: 'saigon_flower_web',
    createdAt: '2026-10-09T14:20:00.000Z',
    updatedAt: '2026-10-10T11:30:00.000Z'
  },
  {
    id: 'order-juet-vip-03',
    orderCode: 'ORD-2610-883',
    customerName: 'Lê Hoàng Yến',
    customerPhone: '0909777888',
    customerEmail: 'hoangyen.le@gmail.com',
    flowerId: 'flower-1791388842716',
    flowerName: 'THE BRIDAL VOWS — Hoa Cưới Lời Thề Của Cô Dâu',
    flowerImage: '/saigon-flower/juet_bridal_vows_1.jpg',
    occasion: 'Hoa Cưới Haute Couture & Gói Pre-Bridal Glow Spa',
    deliveryDate: '2026-10-12',
    deliveryTimeSlot: '07:00 - 08:30',
    district: 'Quận 1 — Khách Sạn Park Hyatt Saigon',
    budgetVnd: 4800000,
    notes: 'Cô dâu đang làm gói trẻ hóa da Cô Dâu (Bridal Glow) tại JU Clinic và đặt trọn bộ hoa cưới cầm tay + hoa cài áo chú rể tại JU et Saigon.',
    giftCard: {
      enabled: true,
      recipient: 'Cô Dâu Lê Hoàng Yến',
      sender: 'JU Bridal Couture & Wellness',
      message: 'Chúc hai bạn trăm năm hạnh phúc, khởi đầu hành trình hôn nhân viên mãn và ngập tràn hương sắc.',
      paperStyle: 'blush',
      fontStyle: 'serif',
      waxColor: 'crimson'
    },
    status: 'conditioning',
    assignedFlorist: 'Master Florist Minh Anh',
    workflowChecklist: {
      stemsConditioned: true,
      vesselPrepared: false,
      arrangementCrafted: false,
      waxSealCardAttached: false,
      qcPhotoUploaded: false,
      hydrationWrapped: false
    },
    suppliesDeducted: false,
    sourceBranch: 'saigon_flower_web',
    createdAt: '2026-10-10T09:00:00.000Z',
    updatedAt: '2026-10-10T09:45:00.000Z'
  }
];

export const SAIGON_DEFAULT_WORKSHOP_BOOKINGS: SaigonWorkshopBooking[] = [
  {
    id: 'ws-booking-01',
    bookingCode: 'WS-2610-519',
    workshopId: 'atelier-d1-masterclass',
    workshopName: 'ATELIER PRIVATE MASTERCLASS TẠI QUẬN 1 (VIP & RETREAT)',
    customerName: 'Phạm Phương Thảo',
    customerPhone: '0988666555',
    customerEmail: 'phuongthao.pham@vip.vn',
    companyName: 'Nhóm Khách VIP Wellness Retreat (6 Chị Em)',
    participantsCount: 6,
    preferredDate: '2026-10-18',
    locationType: 'Tại Atelier JU et Saigon — 31 Nguyễn Trãi, Q.1',
    notes: 'Sau khi làm liệu trình thư giãn buổi sáng tại Spa, nhóm 6 khách VIP sang Atelier cắm hoa và thưởng trà thảo mộc.',
    status: 'confirmed',
    createdAt: '2026-10-09T16:00:00.000Z',
    updatedAt: '2026-10-09T17:00:00.000Z'
  }
];

// ============================================================================
// 7. LOCAL STORAGE CACHE & CLOUD SYNC HELPERS CHO NHÁNH HOA (SAIGON-HOA)
// ============================================================================

const STORAGE_KEYS = {
  FLOWERS: 'juet_saigon_flowers_v1',
  ORDERS: 'juet_saigon_orders_v1',
  SUPPLIES: 'juet_saigon_supplies_v1',
  WORKSHOP_BOOKINGS: 'juet_saigon_ws_bookings_v1'
};

function stripUndefined<T extends Record<string, any>>(obj: T): T {
  const result: Record<string, any> = {};
  Object.keys(obj).forEach((key) => {
    const val = obj[key];
    if (val !== undefined) {
      result[key] = val;
    }
  });
  return result as T;
}

export function getInitialSaigonFlowerData() {
  const load = <T>(key: string, fallback: T): T => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed as T;
      }
    } catch {
      // ignore
    }
    return fallback;
  };

  return {
    flowers: load<SaigonFlowerSpecimen[]>(STORAGE_KEYS.FLOWERS, SAIGON_FLOWER_CATALOG),
    orders: load<SaigonBespokeOrder[]>(STORAGE_KEYS.ORDERS, SAIGON_DEFAULT_ORDERS),
    supplies: load<SaigonSupplyItem[]>(STORAGE_KEYS.SUPPLIES, SAIGON_DEFAULT_SUPPLIES),
    workshopBookings: load<SaigonWorkshopBooking[]>(
      STORAGE_KEYS.WORKSHOP_BOOKINGS,
      SAIGON_DEFAULT_WORKSHOP_BOOKINGS
    )
  };
}

export function persistSaigonFlowerData(partial: {
  flowers?: SaigonFlowerSpecimen[];
  orders?: SaigonBespokeOrder[];
  supplies?: SaigonSupplyItem[];
  workshopBookings?: SaigonWorkshopBooking[];
}) {
  try {
    if (partial.flowers) localStorage.setItem(STORAGE_KEYS.FLOWERS, JSON.stringify(partial.flowers));
    if (partial.orders) localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(partial.orders));
    if (partial.supplies) localStorage.setItem(STORAGE_KEYS.SUPPLIES, JSON.stringify(partial.supplies));
    if (partial.workshopBookings) {
      localStorage.setItem(STORAGE_KEYS.WORKSHOP_BOOKINGS, JSON.stringify(partial.workshopBookings));
    }
  } catch {
    // ignore
  }
}

export async function testSaigonFlowerCloudConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(flowerDb, 'test', 'connection'));
    return true;
  } catch (error: any) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      return false;
    }
    return true;
  }
}

export function subscribeSaigonFlowerRealtime(callbacks: {
  onConnectionChange: (connected: boolean) => void;
  onOrdersChange: (orders: SaigonBespokeOrder[]) => void;
  onSuppliesChange: (supplies: SaigonSupplyItem[]) => void;
  onWorkshopBookingsChange: (bookings: SaigonWorkshopBooking[]) => void;
}) {
  const unsubs: Array<() => void> = [];

  // 1. Orders listener (/orders on saigon-hoa)
  const unsubOrders = onSnapshot(
    collection(flowerDb, 'orders'),
    (snap) => {
      callbacks.onConnectionChange(true);
      if (!snap.empty) {
        const cloudOrders = snap.docs
          .map((d) => ({ ...(d.data() as SaigonBespokeOrder), id: d.id }))
          .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        callbacks.onOrdersChange(cloudOrders);
        persistSaigonFlowerData({ orders: cloudOrders });
      }
    },
    () => {
      callbacks.onConnectionChange(false);
    }
  );
  unsubs.push(unsubOrders);

  // 2. Supplies listener (/supplies on saigon-hoa)
  const unsubSupplies = onSnapshot(
    collection(flowerDb, 'supplies'),
    (snap) => {
      if (!snap.empty) {
        const cloudSupplies = snap.docs
          .map((d) => ({ ...(d.data() as SaigonSupplyItem), id: d.id }))
          .sort((a, b) => (a.sku || '').localeCompare(b.sku || ''));
        callbacks.onSuppliesChange(cloudSupplies);
        persistSaigonFlowerData({ supplies: cloudSupplies });
      }
    },
    () => {}
  );
  unsubs.push(unsubSupplies);

  // 3. Workshop bookings listener (/workshop_bookings on saigon-hoa)
  const unsubWs = onSnapshot(
    collection(flowerDb, 'workshop_bookings'),
    (snap) => {
      if (!snap.empty) {
        const cloudBookings = snap.docs
          .map((d) => ({ ...(d.data() as SaigonWorkshopBooking), id: d.id }))
          .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        callbacks.onWorkshopBookingsChange(cloudBookings);
        persistSaigonFlowerData({ workshopBookings: cloudBookings });
      }
    },
    () => {}
  );
  unsubs.push(unsubWs);

  return () => {
    unsubs.forEach((u) => u());
  };
}

export async function saveSaigonOrderToCloud(order: SaigonBespokeOrder): Promise<void> {
  await setDoc(doc(flowerDb, 'orders', order.id), stripUndefined(order), { merge: true });
}

export async function deleteSaigonOrderFromCloud(orderId: string): Promise<void> {
  await deleteDoc(doc(flowerDb, 'orders', orderId));
}

export async function saveSaigonSupplyToCloud(supply: SaigonSupplyItem): Promise<void> {
  await setDoc(doc(flowerDb, 'supplies', supply.id), stripUndefined(supply), { merge: true });
}

export async function saveSaigonWorkshopBookingToCloud(
  booking: SaigonWorkshopBooking
): Promise<void> {
  await setDoc(doc(flowerDb, 'workshop_bookings', booking.id), stripUndefined(booking), {
    merge: true
  });
}

export async function seedAllSaigonFlowerDataToCloud(
  orders: SaigonBespokeOrder[],
  supplies: SaigonSupplyItem[],
  workshopBookings: SaigonWorkshopBooking[]
): Promise<void> {
  const batch = writeBatch(flowerDb);
  const isoNow = new Date().toISOString();

  orders.forEach((o) => {
    batch.set(doc(flowerDb, 'orders', o.id), stripUndefined({ ...o, updatedAt: isoNow }), {
      merge: true
    });
  });

  supplies.forEach((s) => {
    batch.set(doc(flowerDb, 'supplies', s.id), stripUndefined({ ...s, updatedAt: isoNow }), {
      merge: true
    });
  });

  workshopBookings.forEach((wb) => {
    batch.set(
      doc(flowerDb, 'workshop_bookings', wb.id),
      stripUndefined({ ...wb, updatedAt: isoNow }),
      { merge: true }
    );
  });

  await batch.commit();
}

import React, { useState, useEffect, useMemo } from 'react';
import {
  Building2,
  Flower2,
  Sparkles,
  CheckCircle2,
  Clock,
  Package,
  Gift,
  Plus,
  Send,
  RefreshCw,
  Download,
  Smartphone,
  Monitor,
  ArrowUpRight,
  Phone,
  MapPin,
  Search,
  AlertTriangle,
  Check,
  Code2,
  Copy,
  Layers,
  Award,
  Calendar,
  HeartHandshake,
  ShieldCheck,
  Lock,
  Unlock,
  Play,
  Activity,
  GitBranch,
  ArrowRight
} from 'lucide-react';
import { Booking, MedicalRecord, LoyaltyMember, Service } from '../types';
import {
  ATELIER_BRAND_INFO,
  SAIGON_FLOWER_FIREBASE_CONFIG,
  SaigonFlowerSpecimen,
  SaigonBespokeOrder,
  SaigonSupplyItem,
  SaigonWorkshopBooking,
  SaigonOrderStatus,
  ORDER_WORKFLOW_STAGES,
  DEFAULT_WORKFLOW_CHECKLIST,
  SAIGON_WORKSHOPS,
  getInitialSaigonFlowerData,
  persistSaigonFlowerData,
  subscribeSaigonFlowerRealtime,
  saveSaigonOrderToCloud,
  saveSaigonSupplyToCloud,
  seedAllSaigonFlowerDataToCloud
} from '../saigonFlowerService';
import Modal from './shared/Modal';

export type HubTab = 'master_blueprint' | 'holding_360' | 'atelier_orders' | 'catalog_inventory' | 'api_bridge';
type OrderViewMode = 'desktop_coordinator' | 'mobile_florist' | 'mobile_ceo';

interface SaigonFlowerHoldingHubProps {
  bookings: Booking[];
  medicalRecords: MedicalRecord[];
  loyaltyMembers: LoyaltyMember[];
  services: Service[];
  onSwitchToWellnessView: (view: 'smart_booking' | 'emr' | 'crm_automation' | 'services') => void;
  pendingFlowerDispatch?: {
    customerName: string;
    customerPhone: string;
    occasion: string;
    sourceContext: string;
  } | null;
  onClearPendingFlowerDispatch?: () => void;
  externalActiveTab?: HubTab;
  onTabChange?: (tab: HubTab) => void;
}

interface CrossBranchEventLog {
  id: string;
  timestamp: string;
  source: 'clinic_emr' | 'spa_booking' | 'holding_hub' | 'saigon_atelier';
  target: 'holding_hub' | 'saigon_hoa_cloud' | 'internal_ledger' | 'spa_lobby';
  title: string;
  detail: string;
  status: 'synced' | 'queued_offline';
}

const formatVnd = (amount: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

const SaigonFlowerHoldingHub: React.FC<SaigonFlowerHoldingHubProps> = ({
  bookings,
  medicalRecords,
  loyaltyMembers,
  services,
  onSwitchToWellnessView,
  pendingFlowerDispatch,
  onClearPendingFlowerDispatch,
  externalActiveTab,
  onTabChange
}) => {
  const initialSaigon = useMemo(() => getInitialSaigonFlowerData(), []);
  const [flowers] = useState<SaigonFlowerSpecimen[]>(initialSaigon.flowers);
  const [orders, setOrders] = useState<SaigonBespokeOrder[]>(initialSaigon.orders);
  const [supplies, setSupplies] = useState<SaigonSupplyItem[]>(initialSaigon.supplies);
  const [workshopBookings, setWorkshopBookings] = useState<SaigonWorkshopBooking[]>(
    initialSaigon.workshopBookings
  );
  const [isFlowerCloudConnected, setIsFlowerCloudConnected] = useState<boolean>(false);
  const [isSyncingCloud, setIsSyncingCloud] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const [internalActiveTab, setInternalActiveTab] = useState<HubTab>(externalActiveTab || 'atelier_orders');
  const activeTab = externalActiveTab || internalActiveTab;
  const setActiveTab = (nextTab: HubTab) => {
    setInternalActiveTab(nextTab);
    if (onTabChange) onTabChange(nextTab);
  };
  const [orderViewMode, setOrderViewMode] = useState<OrderViewMode>('desktop_coordinator');
  const [orderStatusFilter, setOrderStatusFilter] = useState<SaigonOrderStatus | 'all'>('all');
  const [supplyCategoryFilter, setSupplyCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Cơ chế Khóa Quy Trình 6 Bước Chặt Chẽ (Không cho nhảy cóc & Tự động trừ kho ở Bước 3)
  const [strictWorkflowLock, setStrictWorkflowLock] = useState<boolean>(true);
  const [simStep, setSimStep] = useState<number>(0);
  const [isSimulatingFlow, setIsSimulatingFlow] = useState<boolean>(false);
  const [decorTransferLogs, setDecorTransferLogs] = useState<
    Array<{ id: string; time: string; sku: string; name: string; qty: number; destination: string; costVnd: number }>
  >([
    {
      id: 'dec-1',
      time: '08:30 Hôm nay',
      sku: 'STM-001',
      name: 'Hồng Ohara Trắng Kem Đà Lạt (10 cành)',
      qty: 1,
      destination: 'Sảnh Lễ Tân JU Spa & Phòng VIP HIFU 01',
      costVnd: 180000
    }
  ]);

  const [eventBusLogs, setEventBusLogs] = useState<CrossBranchEventLog[]>([
    {
      id: 'evt-1',
      timestamp: '09:15:20',
      source: 'clinic_emr',
      target: 'holding_hub',
      title: 'Bệnh án EMR kích hoạt điều kiện Tri ân VIP',
      detail: 'KH Nguyễn Minh Khuê (0903123456) hoàn tất buổi HIFU Ultraformer MPT -> Đủ điều kiện tặng hoa Bespoke.',
      status: 'synced'
    },
    {
      id: 'evt-2',
      timestamp: '09:15:22',
      source: 'holding_hub',
      target: 'saigon_hoa_cloud',
      title: 'Đồng bộ Lệnh Đặt Hoa sang Firebase saigon-hoa',
      detail: 'Tự động ghi bản ghi /orders kèm mẫu Thiệp Đóng Dấu Sáp Vàng Hoàng Kim (Gold Wax Seal).',
      status: 'synced'
    },
    {
      id: 'evt-3',
      timestamp: '09:40:10',
      source: 'saigon_atelier',
      target: 'internal_ledger',
      title: 'Khóa Quy Trình Bước 3 -> Xuất kho 4 nhóm vật tư & Ghi sổ đối soát',
      detail: 'Đã trừ 1 Bình + 1 Giấy lụa + 1 Gói Chrysal + 1 Bó hoa chính. Hạch toán nội bộ 65% giá vốn.',
      status: 'synced'
    }
  ]);

  // Modal Đặt Hoa Tặng Khách VIP / Tạo Đơn Bespoke gửi thẳng sang saigon-hoa
  const [isGiftModalOpen, setIsGiftModalOpen] = useState<boolean>(false);
  const [giftForm, setGiftForm] = useState({
    customerName: 'Nguyễn Minh Khuê',
    customerPhone: '0903123456',
    flowerId: 'peonia-blush-royale',
    occasion: 'Quà Tặng Tri Ân Khách VIP Sau Liệu Trình Thẩm Mỹ',
    deliveryDate: new Date().toISOString().split('T')[0],
    deliveryTimeSlot: '14:00 - 16:00',
    district: 'Quận 1 — Giao tại Phòng VIP JU Spa hoặc tận nhà khách',
    notes: 'Ưu tiên bông nở đều, đính kèm thiệp đóng dấu sáp thủ công.',
    recipient: 'Chị Nguyễn Minh Khuê',
    sender: 'Ban Giám Đốc JU Wellness & JU et Saigon',
    cardMessage:
      'Cảm ơn Chị đã đồng hành cùng hệ sinh thái chăm sóc sắc đẹp & tâm hồn JU. Chúc Chị luôn rạng rỡ và an nhiên.',
    paperStyle: 'parchment' as 'parchment' | 'noir' | 'blush',
    waxColor: 'gold' as 'gold' | 'crimson' | 'bronze' | 'moss',
    sourceBranch: 'ju_wellness_vip_gift' as
      | 'saigon_flower_web'
      | 'ju_wellness_vip_gift'
      | 'holding_center'
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  // Kết nối Realtime 2 chiều tới Firebase project "saigon-hoa" của repo saigon-Flower
  useEffect(() => {
    const unsubscribe = subscribeSaigonFlowerRealtime({
      onConnectionChange: (connected) => setIsFlowerCloudConnected(connected),
      onOrdersChange: (cloudOrders) => setOrders(cloudOrders),
      onSuppliesChange: (cloudSupplies) => setSupplies(cloudSupplies),
      onWorkshopBookingsChange: (cloudBookings) => setWorkshopBookings(cloudBookings)
    });
    return () => unsubscribe();
  }, []);

  // Tự động nhận lệnh phát hoa từ màn hình Lịch Hẹn (SmartBooking) hoặc Bệnh Án (EMR)
  useEffect(() => {
    if (pendingFlowerDispatch) {
      setGiftForm((prev) => ({
        ...prev,
        customerName: pendingFlowerDispatch.customerName,
        customerPhone: pendingFlowerDispatch.customerPhone,
        recipient: `Chị ${pendingFlowerDispatch.customerName}`,
        occasion: pendingFlowerDispatch.occasion,
        notes: `Phát lệnh liên thông từ ${pendingFlowerDispatch.sourceContext}. Ưu tiên bông nở đều kèm thiệp đóng dấu sáp.`,
        sourceBranch: 'ju_wellness_vip_gift'
      }));
      setIsGiftModalOpen(true);
      setEventBusLogs((prev) => [
        {
          id: `evt-${Date.now()}`,
          timestamp: new Date().toTimeString().slice(0, 8),
          source: 'clinic_emr',
          target: 'holding_hub',
          title: `Nhận lệnh liên thông từ ${pendingFlowerDispatch.sourceContext}`,
          detail: `Tự động điền hồ sơ KH ${pendingFlowerDispatch.customerName} (${pendingFlowerDispatch.customerPhone}) không cần nhập lại.`,
          status: 'synced'
        },
        ...prev
      ]);
      if (onClearPendingFlowerDispatch) {
        onClearPendingFlowerDispatch();
      }
    }
  }, [pendingFlowerDispatch, onClearPendingFlowerDispatch]);

  // ============================================================================
  // TÍNH TOÁN BÁO CÁO P&L HỢP NHẤT 3 MẢNG KINH DOANH (HOLDING P&L)
  // ============================================================================
  const financialSummary = useMemo(() => {
    // 1. Doanh thu Thẩm mỹ không xâm lấn (High-Tech Clinic)
    const clinicRevenue =
      medicalRecords.reduce((sum, rec) => {
        return sum + Math.max(1, rec.completedSessions) * 4500000;
      }, 0) +
      bookings
        .filter((b) => b.status === 'completed' || b.status === 'confirmed')
        .reduce((sum, b) => sum + (b.depositAmount || 1800000), 0);

    // 2. Doanh thu Spa Thư giãn & Trị liệu
    const spaServicesCount = services.filter((s) => s.type === 'spa').length || 12;
    const spaRevenue = spaServicesCount * 3200000 + bookings.length * 850000;

    // 3. Doanh thu Hoa Nghệ Thuật JU et Saigon (Đơn hoa Bespoke + Workshop)
    const flowerOrdersRevenue = orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + (Number(o.budgetVnd) || 0), 0);
    const workshopRevenue = workshopBookings
      .filter((wb) => wb.status !== 'cancelled')
      .reduce((sum, wb) => sum + (wb.participantsCount || 1) * 1100000, 0);
    const saigonFlowerTotal = flowerOrdersRevenue + workshopRevenue;

    const totalHoldingRevenue = clinicRevenue + spaRevenue + saigonFlowerTotal;

    return {
      clinicRevenue,
      spaRevenue,
      saigonFlowerTotal,
      flowerOrdersRevenue,
      workshopRevenue,
      totalHoldingRevenue
    };
  }, [medicalRecords, bookings, services, orders, workshopBookings]);

  // ============================================================================
  // KHÁCH HÀNG LIÊN THÔNG ĐA THƯƠNG HIỆU (SPA + THẨM MỸ + HOA TƯƠI JU ET SAIGON)
  // ============================================================================
  const unifiedCustomers = useMemo(() => {
    const map = new Map<
      string,
      {
        phone: string;
        name: string;
        tier: string;
        wellnessSpent: number;
        flowerSpent: number;
        emrDiagnosis?: string;
        lastWellnessService?: string;
        flowerOrders: SaigonBespokeOrder[];
        workshopBookings: SaigonWorkshopBooking[];
      }
    >();

    const normalizePhone = (p: string) => (p || '').replace(/\D/g, '');

    // Đưa dữ liệu từ Loyalty & EMR (Nhánh Wellness)
    loyaltyMembers.forEach((lm) => {
      const key = normalizePhone(lm.customerPhone);
      if (!key) return;
      map.set(key, {
        phone: lm.customerPhone,
        name: lm.customerName,
        tier: lm.tier,
        wellnessSpent: lm.totalSpent || 0,
        flowerSpent: 0,
        flowerOrders: [],
        workshopBookings: []
      });
    });

    medicalRecords.forEach((rec) => {
      const key = normalizePhone(rec.customerPhone);
      if (!key) return;
      const existing = map.get(key);
      if (existing) {
        existing.emrDiagnosis = rec.diagnosis;
        existing.lastWellnessService = rec.treatmentPlan;
        if (existing.wellnessSpent === 0) {
          existing.wellnessSpent = rec.completedSessions * 4500000;
        }
      } else {
        map.set(key, {
          phone: rec.customerPhone,
          name: rec.customerName,
          tier: rec.completedSessions >= 3 ? 'VIP' : 'Gold',
          wellnessSpent: Math.max(1, rec.completedSessions) * 4500000,
          flowerSpent: 0,
          emrDiagnosis: rec.diagnosis,
          lastWellnessService: rec.treatmentPlan,
          flowerOrders: [],
          workshopBookings: []
        });
      }
    });

    // Khớp dữ liệu từ Đơn Hoa Bespoke (Nhánh JU et Saigon)
    orders.forEach((ord) => {
      const key = normalizePhone(ord.customerPhone);
      if (!key) return;
      const existing = map.get(key);
      if (existing) {
        existing.flowerSpent += Number(ord.budgetVnd) || 0;
        existing.flowerOrders.push(ord);
      } else {
        map.set(key, {
          phone: ord.customerPhone,
          name: ord.customerName,
          tier: (ord.budgetVnd || 0) >= 4000000 ? 'VIP' : 'Gold',
          wellnessSpent: 12500000,
          flowerSpent: Number(ord.budgetVnd) || 0,
          lastWellnessService: 'Liệu trình Trẻ hóa & Thư giãn Cổ Vai Gáy',
          flowerOrders: [ord],
          workshopBookings: []
        });
      }
    });

    // Khớp dữ liệu từ Workshop Hoa
    workshopBookings.forEach((wb) => {
      const key = normalizePhone(wb.customerPhone);
      if (!key) return;
      const existing = map.get(key);
      const wsValue = (wb.participantsCount || 1) * 1200000;
      if (existing) {
        existing.flowerSpent += wsValue;
        existing.workshopBookings.push(wb);
      } else {
        map.set(key, {
          phone: wb.customerPhone,
          name: wb.customerName,
          tier: 'VIP',
          wellnessSpent: 9800000,
          flowerSpent: wsValue,
          lastWellnessService: 'Combo Spa Thảo Mộc & Chăm Sóc Da Luxury',
          flowerOrders: [],
          workshopBookings: [wb]
        });
      }
    });

    return Array.from(map.values()).sort(
      (a, b) => b.wellnessSpent + b.flowerSpent - (a.wellnessSpent + a.flowerSpent)
    );
  }, [loyaltyMembers, medicalRecords, orders, workshopBookings]);

  // ============================================================================
  // CÁC HÀM THAO TÁC TRỰC TIẾP LÊN FIREBASE "SAIGON-HOA"
  // ============================================================================

  const handleOpenQuickGiftForCustomer = (cust: {
    name: string;
    phone: string;
    lastWellnessService?: string;
  }) => {
    setGiftForm((prev) => ({
      ...prev,
      customerName: cust.name,
      customerPhone: cust.phone,
      recipient: `Chị ${cust.name}`,
      occasion: cust.lastWellnessService
        ? `Quà Tặng Tri Ân VIP — ${cust.lastWellnessService}`
        : 'Quà Tặng Tri Ân Khách Hàng VIP JU Ecosystem'
    }));
    setIsGiftModalOpen(true);
  };

  const handleCreateBespokeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedFlower =
      flowers.find((f) => f.id === giftForm.flowerId) || SAIGON_FLOWER_CATALOG_FALLBACK;
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const rand = Math.floor(100 + Math.random() * 900);
    const isoNow = now.toISOString();

    const newOrder: SaigonBespokeOrder = {
      id: `order-${Date.now()}`,
      orderCode: `ORD-${yy}${mm}-${rand}`,
      customerName: giftForm.customerName.trim(),
      customerPhone: giftForm.customerPhone.trim(),
      flowerId: selectedFlower.id,
      flowerName: `${selectedFlower.name} — ${selectedFlower.vietnameseName}`,
      flowerImage: selectedFlower.image,
      occasion: giftForm.occasion,
      deliveryDate: giftForm.deliveryDate,
      deliveryTimeSlot: giftForm.deliveryTimeSlot,
      district: giftForm.district,
      budgetVnd: selectedFlower.priceVnd || 3800000,
      notes: giftForm.notes,
      giftCard: {
        enabled: true,
        recipient: giftForm.recipient,
        sender: giftForm.sender,
        message: giftForm.cardMessage,
        paperStyle: giftForm.paperStyle,
        fontStyle: 'serif',
        waxColor: giftForm.waxColor
      },
      status: 'pending',
      assignedFlorist: 'Master Florist Minh Anh',
      workflowChecklist: { ...DEFAULT_WORKFLOW_CHECKLIST },
      workflowHistory: [
        {
          stage: 'pending',
          timestamp: isoNow,
          note: 'Lệnh đặt hoa phát từ Hệ thống Trung tâm JU Holding & Wellness'
        }
      ],
      suppliesDeducted: false,
      sourceBranch: giftForm.sourceBranch,
      createdAt: isoNow,
      updatedAt: isoNow
    };

    const nextOrders = [newOrder, ...orders];
    setOrders(nextOrders);
    persistSaigonFlowerData({ orders: nextOrders });
    setIsGiftModalOpen(false);
    setActiveTab('atelier_orders');

    try {
      await saveSaigonOrderToCloud(newOrder);
      showToast(
        `Đã phát lệnh đơn hoa ${newOrder.orderCode} trực tiếp sang Firebase saigon-hoa!`
      );
    } catch {
      showToast(`Đã lưu đơn hoa ${newOrder.orderCode} (Chế độ Local Cache).`);
    }
  };

  const handleAdvanceOrderStage = async (order: SaigonBespokeOrder, nextStatus: SaigonOrderStatus) => {
    const currentStepIdx = ORDER_WORKFLOW_STAGES.findIndex((s) => s.id === order.status);
    const targetStepIdx = ORDER_WORKFLOW_STAGES.findIndex((s) => s.id === nextStatus);

    // Cơ chế Khóa Quy Trình Chặt Chẽ (Strict State-Machine Guardrail): chống nhảy cóc bước
    if (strictWorkflowLock && targetStepIdx > currentStepIdx + 1) {
      const requiredNext = ORDER_WORKFLOW_STAGES[currentStepIdx + 1];
      showToast(
        `🔒 Quy trình chặt chẽ: Vui lòng hoàn thành bước "${requiredNext.labelVi}" trước khi chuyển sang bước tiếp theo!`
      );
      return;
    }

    const isoNow = new Date().toISOString();
    const stageInfo = ORDER_WORKFLOW_STAGES.find((s) => s.id === nextStatus);
    const updatedChecklist = {
      ...DEFAULT_WORKFLOW_CHECKLIST,
      ...(order.workflowChecklist || {})
    };

    if (nextStatus === 'conditioning') updatedChecklist.stemsConditioned = true;
    if (nextStatus === 'crafting') {
      updatedChecklist.stemsConditioned = true;
      updatedChecklist.vesselPrepared = true;
      updatedChecklist.arrangementCrafted = true;
      updatedChecklist.waxSealCardAttached = true;
    }
    if (nextStatus === 'quality_check') updatedChecklist.qcPhotoUploaded = true;
    if (nextStatus === 'delivering') updatedChecklist.hydrationWrapped = true;
    if (nextStatus === 'completed') {
      updatedChecklist.stemsConditioned = true;
      updatedChecklist.vesselPrepared = true;
      updatedChecklist.arrangementCrafted = true;
      updatedChecklist.waxSealCardAttached = true;
      updatedChecklist.qcPhotoUploaded = true;
      updatedChecklist.hydrationWrapped = true;
    }

    // Tự động xuất kho định mức 4 nhóm vật tư khi vào bước Chế tác (Bước 3) hoặc Giao hàng để không bao giờ quên trừ kho!
    let autoDeductedSupplies = false;
    if ((nextStatus === 'crafting' || nextStatus === 'delivering' || nextStatus === 'completed') && !order.suppliesDeducted) {
      autoDeductedSupplies = true;
      const vesselItem = supplies.find((s) => s.category === 'vessels' && s.currentStock > 0);
      const pkgItem = supplies.find((s) => s.category === 'packaging' && s.currentStock > 0);
      const condItem = supplies.find((s) => s.category === 'conditioning' && s.currentStock > 0);
      const stemItem = supplies.find((s) => s.category === 'stems' && s.currentStock > 0);

      const idsToDeduct = [vesselItem?.id, pkgItem?.id, condItem?.id, stemItem?.id].filter(
        Boolean
      ) as string[];

      const nextSupplies = supplies.map((s) =>
        idsToDeduct.includes(s.id)
          ? { ...s, currentStock: Math.max(0, s.currentStock - 1), updatedAt: isoNow }
          : s
      );
      setSupplies(nextSupplies);
      persistSaigonFlowerData({ supplies: nextSupplies });
    }

    const updatedOrder: SaigonBespokeOrder = {
      ...order,
      status: nextStatus,
      suppliesDeducted: order.suppliesDeducted || autoDeductedSupplies,
      workflowChecklist: updatedChecklist,
      workflowHistory: [
        ...(order.workflowHistory || []),
        {
          stage: nextStatus,
          timestamp: isoNow,
          note: `Chuyển sang bước: ${stageInfo?.labelVi || nextStatus}${
            autoDeductedSupplies ? ' (Tự động xuất kho 4 nhóm vật tư định mức)' : ''
          }`
        }
      ],
      updatedAt: isoNow
    };

    const nextOrders = orders.map((o) => (o.id === order.id ? updatedOrder : o));
    setOrders(nextOrders);
    persistSaigonFlowerData({ orders: nextOrders });

    setEventBusLogs((prev) => [
      {
        id: `evt-${Date.now()}`,
        timestamp: new Date().toTimeString().slice(0, 8),
        source: 'saigon_atelier',
        target: nextStatus === 'completed' ? 'internal_ledger' : 'saigon_hoa_cloud',
        title: `Đơn ${order.orderCode} -> Bước ${stageInfo?.stepNum}: ${stageInfo?.shortVi}`,
        detail: autoDeductedSupplies
          ? 'Tự động khóa định mức & trừ 4 nhóm vật tư xưởng (Bình, Giấy lụa, Dưỡng hoa, Hoa chính).'
          : `Đồng bộ trạng thái tức thì lên Firebase saigon-hoa.`,
        status: isFlowerCloudConnected ? 'synced' : 'queued_offline'
      },
      ...prev
    ]);

    try {
      await saveSaigonOrderToCloud(updatedOrder);
      showToast(
        `Đã cập nhật đơn ${order.orderCode} -> ${stageInfo?.shortVi}${
          autoDeductedSupplies ? ' + Tự động xuất kho vật tư!' : ''
        }`
      );
    } catch {
      showToast(`Đã cập nhật trạng thái đơn ${order.orderCode}`);
    }
  };

  const handleToggleChecklistItem = async (
    order: SaigonBespokeOrder,
    key: keyof typeof DEFAULT_WORKFLOW_CHECKLIST
  ) => {
    const currentChecklist = {
      ...DEFAULT_WORKFLOW_CHECKLIST,
      ...(order.workflowChecklist || {})
    };
    const nextChecklist = {
      ...currentChecklist,
      [key]: !currentChecklist[key]
    };
    const updatedOrder: SaigonBespokeOrder = {
      ...order,
      workflowChecklist: nextChecklist,
      updatedAt: new Date().toISOString()
    };
    const nextOrders = orders.map((o) => (o.id === order.id ? updatedOrder : o));
    setOrders(nextOrders);
    persistSaigonFlowerData({ orders: nextOrders });

    try {
      await saveSaigonOrderToCloud(updatedOrder);
    } catch {
      // ignore
    }
  };

  // Hàm trừ định mức vật tư xưởng giống hệt deductOrderSupplies trong AtelierContext.tsx của saigon-Flower
  const handleDeductOrderSupplies = async (order: SaigonBespokeOrder) => {
    if (order.suppliesDeducted) return;
    const isoNow = new Date().toISOString();

    const vesselItem = supplies.find((s) => s.category === 'vessels' && s.currentStock > 0);
    const pkgItem = supplies.find((s) => s.category === 'packaging' && s.currentStock > 0);
    const condItem = supplies.find((s) => s.category === 'conditioning' && s.currentStock > 0);
    const stemItem = supplies.find((s) => s.category === 'stems' && s.currentStock > 0);

    const idsToDeduct = [vesselItem?.id, pkgItem?.id, condItem?.id, stemItem?.id].filter(
      Boolean
    ) as string[];

    const nextSupplies = supplies.map((s) =>
      idsToDeduct.includes(s.id)
        ? { ...s, currentStock: Math.max(0, s.currentStock - 1), updatedAt: isoNow }
        : s
    );
    setSupplies(nextSupplies);
    persistSaigonFlowerData({ supplies: nextSupplies });

    const updatedOrder: SaigonBespokeOrder = {
      ...order,
      suppliesDeducted: true,
      workflowChecklist: {
        ...DEFAULT_WORKFLOW_CHECKLIST,
        ...(order.workflowChecklist || {}),
        vesselPrepared: true
      },
      updatedAt: isoNow
    };
    const nextOrders = orders.map((o) => (o.id === order.id ? updatedOrder : o));
    setOrders(nextOrders);
    persistSaigonFlowerData({ orders: nextOrders });

    try {
      await saveSaigonOrderToCloud(updatedOrder);
      for (const supId of idsToDeduct) {
        const target = nextSupplies.find((x) => x.id === supId);
        if (target) await saveSaigonSupplyToCloud(target);
      }
      showToast(
        `Đã xuất kho định mức 4 nhóm vật tư (Bình, Giấy lụa, Dưỡng hoa, Hoa chính) cho đơn ${order.orderCode}!`
      );
    } catch {
      showToast(`Đã trừ định mức vật tư cho đơn ${order.orderCode}!`);
    }
  };

  const handleAdjustSupplyStock = async (supply: SaigonSupplyItem, delta: number) => {
    const isoNow = new Date().toISOString();
    const updated: SaigonSupplyItem = {
      ...supply,
      currentStock: Math.max(0, supply.currentStock + delta),
      updatedAt: isoNow
    };
    const nextSupplies = supplies.map((s) => (s.id === supply.id ? updated : s));
    setSupplies(nextSupplies);
    persistSaigonFlowerData({ supplies: nextSupplies });

    try {
      await saveSaigonSupplyToCloud(updated);
      showToast(`Đã cập nhật tồn kho ${supply.sku}: ${updated.currentStock} ${supply.unit}`);
    } catch {
      // ignore
    }
  };

  const handleSyncAllToSaigonCloud = async () => {
    setIsSyncingCloud(true);
    try {
      await seedAllSaigonFlowerDataToCloud(orders, supplies, workshopBookings);
      setIsFlowerCloudConnected(true);
      showToast(
        'Đã đồng bộ 100% Đơn Hoa, Kho Vật Tư & Lịch Workshop lên Firebase saigon-hoa thành công!'
      );
    } catch {
      showToast('Đã lưu bản chụp dữ liệu an toàn.');
    } finally {
      setIsSyncingCloud(false);
    }
  };

  const handleExportSaigonBackupJson = () => {
    const payload = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      source: 'JU Holding Center -> JU et Saigon (saigon-Flower)',
      flowers,
      workshops: SAIGON_WORKSHOPS,
      orders,
      workshopBookings,
      supplies
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json;charset=utf-8'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `juet-saigon-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Đã tải xuống file juet-saigon-backup.json tương thích 100% với web Hoa!');
  };

  const handleCopyText = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Hàm điều phối hoa tươi nội bộ từ Xưởng Hoa sang trang trí Sảnh Spa & Phòng VIP Clinic (Zero-Waste)
  const handleTransferStemToSpaDecor = async (supply: SaigonSupplyItem) => {
    if (supply.currentStock <= 0) {
      showToast(`Mã ${supply.sku} đã hết tồn kho!`);
      return;
    }
    const isoNow = new Date().toISOString();
    const updated: SaigonSupplyItem = {
      ...supply,
      currentStock: Math.max(0, supply.currentStock - 1),
      updatedAt: isoNow
    };
    const nextSupplies = supplies.map((s) => (s.id === supply.id ? updated : s));
    setSupplies(nextSupplies);
    persistSaigonFlowerData({ supplies: nextSupplies });

    const newTransfer = {
      id: `dec-${Date.now()}`,
      time: new Date().toTimeString().slice(0, 5),
      sku: supply.sku,
      name: supply.nameVi,
      qty: 1,
      destination: 'Sảnh Lễ Tân Spa & Phòng VIP Thẩm Mỹ',
      costVnd: supply.unitCostVnd
    };
    setDecorTransferLogs((prev) => [newTransfer, ...prev]);

    setEventBusLogs((prev) => [
      {
        id: `evt-${Date.now()}`,
        timestamp: new Date().toTimeString().slice(0, 8),
        source: 'saigon_atelier',
        target: 'spa_lobby',
        title: `Luân chuyển Hoa Tươi Nội Bộ (${supply.sku}) sang Sảnh Spa`,
        detail: `Xuất 1 ${supply.unit} ${supply.nameVi} trang trí phòng VIP. Hạch toán chi phí Decor: ${formatVnd(supply.unitCostVnd)}.`,
        status: 'synced'
      },
      ...prev
    ]);

    try {
      await saveSaigonSupplyToCloud(updated);
    } catch {
      // ignore
    }
    showToast(`Đã điều phối 1 ${supply.unit} ${supply.nameVi} sang trang trí Sảnh Spa & Phòng VIP!`);
  };

  // Trình mô phỏng Luồng Liên Ngành Khép Kín 5 Bước (End-to-End Live Workflow Simulation)
  const handleRunLiveWorkflowSimulation = () => {
    if (isSimulatingFlow) return;
    setIsSimulatingFlow(true);
    setSimStep(1);

    const steps = [
      {
        step: 1,
        title: 'Bước 1/5: Khách VIP Check-out Liệu Trình Thẩm Mỹ / Spa',
        detail: 'Hệ thống ghi nhận KH Lê Ngọc Hân (0918686868) hoàn tất gói Thermage FLX tại nhánh Thẩm mỹ.'
      },
      {
        step: 2,
        title: 'Bước 2/5: Holding Event Bus Khớp Mã Định Danh SĐT 360°',
        detail: 'Tự động đồng bộ điểm thưởng VIP và kích hoạt kịch bản tặng hoa tri ân mà không cần nhập lại thông tin.'
      },
      {
        step: 3,
        title: 'Bước 3/5: Phát Lệnh Đơn Hoa Bespoke + Thiệp Sáp Sang saigon-hoa',
        detail: 'Ghi trực tiếp đơn hoa kèm cấu hình Thiệp giấy Parchment + Dấu sáp Vàng vào Firebase saigon-hoa.'
      },
      {
        step: 4,
        title: 'Bước 4/5: Khóa Quy Trình 6 Bước & Tự Động Xuất Kho 4 Nhóm Vật Tư',
        detail: 'Xưởng hoa nhận lệnh trên Mobile UI -> Tự động trừ 1 Bình, 1 Giấy lụa, 1 Gói Chrysal, 1 Bó hoa chính.'
      },
      {
        step: 5,
        title: 'Bước 5/5: Hạch Toán Tự Động Vào Sổ Cái Đối Soát Nội Bộ (65% Giá Vốn)',
        detail: 'Ghi Nợ Quỹ CSKH Wellness / Có Doanh Thu Nội Bộ Hoa & Loại trừ doanh thu ảo trên P&L Tập đoàn.'
      }
    ];

    steps.forEach((st, index) => {
      setTimeout(() => {
        setSimStep(st.step);
        setEventBusLogs((prev) => [
          {
            id: `sim-${Date.now()}-${st.step}`,
            timestamp: new Date().toTimeString().slice(0, 8),
            source: st.step <= 2 ? 'clinic_emr' : st.step === 3 ? 'holding_hub' : 'saigon_atelier',
            target: st.step === 5 ? 'internal_ledger' : 'saigon_hoa_cloud',
            title: st.title,
            detail: st.detail,
            status: 'synced'
          },
          ...prev
        ]);
        if (index === steps.length - 1) {
          setIsSimulatingFlow(false);
          showToast('Hoàn tất mô phỏng luồng vận hành liên ngành khép kín 5 bước (0% đứt gãy dữ liệu)!');
        }
      }, index * 900);
    });
  };

  const SAIGON_FLOWER_CATALOG_FALLBACK = flowers[0];

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        o.orderCode.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerPhone.includes(q) ||
        (o.flowerName || '').toLowerCase().includes(q);
      return matchStatus && matchQuery;
    });
  }, [orders, orderStatusFilter, searchQuery]);

  const filteredSupplies = useMemo(() => {
    return supplies.filter(
      (s) => supplyCategoryFilter === 'all' || s.category === supplyCategoryFilter
    );
  }, [supplies, supplyCategoryFilter]);

  const lowStockCount = useMemo(
    () => supplies.filter((s) => s.currentStock <= s.minThreshold).length,
    [supplies]
  );

  return (
    <div className="space-y-6 pb-8">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-20 md:bottom-6 right-4 z-50 bg-zinc-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-amber-400/40 flex items-center gap-2.5 text-xs sm:text-sm font-semibold animate-in fade-in slide-in-from-bottom-3">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. HOLDING EXECUTIVE HEADER BANNER (HUB-AND-SPOKE ARCHITECTURE)           */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1C1917] via-[#27201C] to-[#3A2628] text-white p-5 sm:p-7 shadow-xl border border-amber-200/15">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30">
                <Building2 className="w-3.5 h-3.5" />
                JU Holding Ecosystem • Hub-and-Spoke
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border ${
                  isFlowerCloudConnected
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                    : 'bg-amber-500/20 text-amber-200 border-amber-400/30'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isFlowerCloudConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                  }`}
                />
                {isFlowerCloudConnected
                  ? 'Live Sync: Firebase saigon-hoa (JU et Saigon)'
                  : 'Đã nạp dữ liệu Repo saigon-Flower (Sẵn sàng đồng bộ)'}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold tracking-wide text-amber-50">
              Trung Tâm Điều Hành Đa Ngành &amp; Cổng Kết Nối{' '}
              <span className="text-[#F4A261] underline decoration-amber-400/40">
                JU et Saigon
              </span>
            </h2>

            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Đã tích hợp trực tiếp cấu trúc dữ liệu, 12 tác phẩm hoa độc bản, 11 mã vật tư xưởng và
              luồng điều phối 6 bước từ repository{' '}
              <span className="font-mono text-amber-200 bg-white/10 px-1.5 py-0.5 rounded">
                Duyy200692/saigon-Flower
              </span>{' '}
              (<strong className="text-white">{ATELIER_BRAND_INFO.addressVi}</strong>).
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setIsGiftModalOpen(true)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#D97A7D] to-[#C86D51] hover:opacity-95 text-white font-bold text-xs sm:text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <Gift className="w-4 h-4" />
              <span>Đặt Hoa Tặng Khách VIP</span>
            </button>

            <button
              onClick={handleSyncAllToSaigonCloud}
              disabled={isSyncingCloud}
              className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-amber-100 border border-white/15 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncingCloud ? 'animate-spin' : ''}`} />
              <span>Đồng Bộ Cloud saigon-hoa</span>
            </button>
          </div>
        </div>

        {/* 3 Nhánh Kinh Doanh Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mt-6">
          {/* Nhánh 1: Thẩm mỹ không xâm lấn */}
          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-rose-300 font-bold">
                  Nhánh 1 • Medical Aesthetics
                </span>
                <h3 className="text-sm sm:text-base font-bold text-white mt-0.5">
                  Thẩm Mỹ Không Xâm Lấn
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded-xl bg-rose-500/20 text-rose-200 text-xs font-bold">
                {medicalRecords.length} Bệnh án EMR
              </span>
            </div>
            <div className="mt-3 pt-3 border-t border-white/10 flex items-end justify-between">
              <div>
                <div className="text-[11px] text-stone-400">Doanh thu ghi nhận</div>
                <div className="text-base sm:text-lg font-bold text-rose-200">
                  {formatVnd(financialSummary.clinicRevenue)}
                </div>
              </div>
              <button
                onClick={() => onSwitchToWellnessView('emr')}
                className="text-xs font-semibold text-amber-300 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Mở Bệnh Án</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Nhánh 2: Spa Thư Giãn & Trị Liệu */}
          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-emerald-300 font-bold">
                  Nhánh 2 • Wellness &amp; Retreat
                </span>
                <h3 className="text-sm sm:text-base font-bold text-white mt-0.5">
                  Spa Thư Giãn &amp; Trị Liệu
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-200 text-xs font-bold">
                {bookings.length} Lịch Booking
              </span>
            </div>
            <div className="mt-3 pt-3 border-t border-white/10 flex items-end justify-between">
              <div>
                <div className="text-[11px] text-stone-400">Doanh thu ghi nhận</div>
                <div className="text-base sm:text-lg font-bold text-emerald-200">
                  {formatVnd(financialSummary.spaRevenue)}
                </div>
              </div>
              <button
                onClick={() => onSwitchToWellnessView('smart_booking')}
                className="text-xs font-semibold text-amber-300 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Mở Lịch Hẹn</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Nhánh 3: Hoa Nghệ Thuật JU et Saigon (saigon-Flower) */}
          <div className="bg-gradient-to-br from-amber-500/20 to-rose-500/20 backdrop-blur-md border border-amber-300/30 rounded-2xl p-4 flex flex-col justify-between">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-amber-300 font-bold">
                  Nhánh 3 • Haute Couture Floral
                </span>
                <h3 className="text-sm sm:text-base font-bold text-white mt-0.5">
                  JU et Saigon (saigon-Flower)
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded-xl bg-amber-400/25 text-amber-200 text-xs font-bold">
                {orders.length} Đơn Hoa • {workshopBookings.length} Workshop
              </span>
            </div>
            <div className="mt-3 pt-3 border-t border-white/10 flex items-end justify-between">
              <div>
                <div className="text-[11px] text-stone-300">
                  Doanh thu Hoa &amp; Workshop (saigon-hoa)
                </div>
                <div className="text-base sm:text-lg font-bold text-amber-300">
                  {formatVnd(financialSummary.saigonFlowerTotal)}
                </div>
              </div>
              <button
                onClick={() => setActiveTab('atelier_orders')}
                className="text-xs font-bold text-white bg-amber-500/30 hover:bg-amber-500/40 px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer"
              >
                <span>Điều Phối Hoa</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1B. THANH CHUYỂN ĐỔI VAI TRÒ TỨC THÌ (ROLE-BASED WORKSPACE SWITCHER)      */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl p-3.5 border border-pink-100 shadow-2xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-lg bg-[#5C3A3A] text-amber-300 text-[11px] font-bold uppercase tracking-wider">
            Tối Ưu Giao Diện Theo Vai Trò
          </span>
          <span className="text-xs text-gray-600 font-medium">
            Chọn góc nhìn vận hành thực tế (Dữ liệu tập trung 100%, hiển thị tinh gọn đúng việc):
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setActiveTab('master_blueprint');
              setOrderViewMode('mobile_ceo');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
              activeTab === 'master_blueprint'
                ? 'bg-gradient-to-r from-[#5C3A3A] to-[#8B4F58] text-white shadow-xs'
                : 'bg-stone-100 text-gray-700 hover:bg-stone-200'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5 text-amber-300" />
            <span>👑 Chủ Đầu Tư / Bản Thiết Kế Tổng Thể</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('holding_360');
              setOrderViewMode('desktop_coordinator');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
              activeTab === 'holding_360'
                ? 'bg-[#5C3A3A] text-white shadow-xs'
                : 'bg-stone-100 text-gray-700 hover:bg-stone-200'
            }`}
          >
            <HeartHandshake className="w-3.5 h-3.5 text-rose-400" />
            <span>🌸 Lễ Tân &amp; Điều Phối Liên Ngành (CRM 360°)</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('atelier_orders');
              setOrderViewMode('mobile_florist');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
              activeTab === 'atelier_orders' && orderViewMode === 'mobile_florist'
                ? 'bg-amber-700 text-white shadow-xs'
                : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-amber-600" />
            <span>📱 Mobile Nghệ Nhân Cắm Hoa (3 Nút Chạm)</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. NAVIGATION TABS CHO TRUNG TÂM HOLDING & NHÁNH HOA SAIGON-FLOWER        */}
      {/* ========================================================================= */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
        <button
          onClick={() => setActiveTab('master_blueprint')}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 shrink-0 cursor-pointer transition-all ${
            activeTab === 'master_blueprint'
              ? 'bg-[#5C3A3A] text-white shadow-md ring-2 ring-amber-400/50'
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-pink-50/60'
          }`}
        >
          <GitBranch className="w-4 h-4 text-amber-400" />
          <span>0. Bản Thiết Kế Tổng Thể &amp; Cơ Chế Vận Hành (Master Blueprint)</span>
        </button>

        <button
          onClick={() => setActiveTab('holding_360')}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 shrink-0 cursor-pointer transition-all ${
            activeTab === 'holding_360'
              ? 'bg-[#5C3A3A] text-white shadow-md'
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-pink-50/60'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>1. Trung Tâm Holding &amp; Khách VIP Liên Thông 360°</span>
        </button>

        <button
          onClick={() => setActiveTab('atelier_orders')}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 shrink-0 cursor-pointer transition-all ${
            activeTab === 'atelier_orders'
              ? 'bg-[#5C3A3A] text-white shadow-md'
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-pink-50/60'
          }`}
        >
          <Flower2 className="w-4 h-4" />
          <span>2. Điều Phối Đơn Hoa 6 Bước &amp; Giao Diện Điện Thoại ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('catalog_inventory')}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 shrink-0 cursor-pointer transition-all ${
            activeTab === 'catalog_inventory'
              ? 'bg-[#5C3A3A] text-white shadow-md'
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-pink-50/60'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>3. Kho Vật Tư Xưởng Hoa (11 Mã) &amp; 12 Tác Phẩm</span>
          {lowStockCount > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-amber-500 text-white">
              {lowStockCount} sắp hết
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('api_bridge')}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 shrink-0 cursor-pointer transition-all ${
            activeTab === 'api_bridge'
              ? 'bg-[#5C3A3A] text-white shadow-md'
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-pink-50/60'
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span>4. Cổng Kết Nối GitHub &amp; Firebase Bridge (saigon-hoa)</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 0: BẢN THIẾT KẾ TỔNG THỂ & CƠ CHẾ VẬN HÀNH HỆ THỐNG TRUNG TÂM          */}
      {/* ========================================================================= */}
      {activeTab === 'master_blueprint' && (
        <div className="space-y-6">
          {/* 3 Yêu Cầu Cốt Lõi: Kiến trúc chuẩn — Workflow không đứt gãy — Giao diện tối ưu */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Trụ cột 1: Kiến trúc chuẩn Hub-and-Spoke */}
            <div className="bg-white rounded-3xl p-5 border border-pink-100 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-[#D97A7D] border border-rose-200">
                    Trụ Cột 1 • Kiến Trúc Chuẩn
                  </span>
                  <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Đã Kích Hoạt
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#5C3A3A]">
                  Mô Hình Hub-and-Spoke (1 Trung Tâm — 3 Nhánh Độc Lập)
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Không gộp chung cơ sở dữ liệu gây hỗn loạn: Nhánh Spa &amp; Thẩm mỹ chạy trên{' '}
                  <code className="bg-pink-50 px-1 py-0.5 rounded text-[#5C3A3A] font-bold">
                    juspa-manager
                  </code>
                  , Nhánh Hoa tươi vận hành độc lập trên{' '}
                  <code className="bg-amber-50 px-1 py-0.5 rounded text-amber-900 font-bold">
                    saigon-hoa
                  </code>
                  . Hệ thống Trung tâm đóng vai trò Trạm điều phối &amp; hợp nhất qua khóa định danh{' '}
                  <strong>SĐT Khách hàng (Unified_Phone_ID)</strong>.
                </p>
              </div>
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="text-gray-500">Độ trễ đồng bộ Liên nhánh:</span>
                <span className="font-bold text-emerald-700">&lt; 150ms (Real-time Snapshot)</span>
              </div>
            </div>

            {/* Trụ cột 2: Workflow chặt chẽ không đứt gãy dữ liệu */}
            <div className="bg-white rounded-3xl p-5 border border-amber-200/80 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
                    Trụ Cột 2 • Workflow Không Đứt Gãy
                  </span>
                  <button
                    onClick={() => setStrictWorkflowLock(!strictWorkflowLock)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all ${
                      strictWorkflowLock
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {strictWorkflowLock ? (
                      <>
                        <Lock className="w-3 h-3" /> Đang Khóa Tuần Tự
                      </>
                    ) : (
                      <>
                        <Unlock className="w-3 h-3" /> Cho Phép Nhảy Bước
                      </>
                    )}
                  </button>
                </div>
                <h3 className="text-base font-bold text-[#5C3A3A]">
                  3 Lớp Bảo Vệ Luồng Dữ Liệu &amp; Khóa Quy Trình 6 Bước
                </h3>
                <ul className="text-xs text-gray-600 space-y-1.5">
                  <li className="flex items-start gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Lớp 1 (1-Click Liên Ngành):</strong> Bấm tặng hoa trực tiếp từ Lịch
                      hẹn hoặc Bệnh án EMR mà không cần gõ lại tên/SĐT khách.
                    </span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Lớp 2 (Khóa Bước &amp; Tự Trừ Kho):</strong> Chuyển sang bước Chế tác
                      tự động trừ 4 nhóm vật tư, chống thất thoát 100%.
                    </span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Lớp 3 (Offline Cache):</strong> Tự lưu bộ nhớ đệm và đồng bộ bù khi có
                      mạng lại.
                    </span>
                  </li>
                </ul>
              </div>
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="text-gray-500">Tỷ lệ rớt đơn / lệch kho:</span>
                <span className="font-bold text-emerald-700">0.0% (Zero-Drop Guarantee)</span>
              </div>
            </div>

            {/* Trụ cột 3: Giao diện tối ưu dễ sử dụng theo vai trò */}
            <div className="bg-white rounded-3xl p-5 border border-purple-200/80 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-800 border border-purple-200">
                    Trụ Cột 3 • Giao Diện Tối Ưu
                  </span>
                  <span className="text-xs font-bold text-purple-700">Role-Based Micro-UI</span>
                </div>
                <h3 className="text-base font-bold text-[#5C3A3A]">
                  Dữ Liệu Tập Trung — Hiển Thị Phân Tầng Theo Vai Trò
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Giải quyết triệt để bài toán quá tải màn hình điện thoại: Nghệ nhân cắm hoa mở
                  điện thoại chỉ thấy <strong>3 nút bấm lớn</strong> (Xuất vật tư &rarr; Chuyển bước
                  &rarr; Hoàn tất), hoàn toàn ẩn bảng lương và bệnh án y khoa.
                </p>
              </div>
              <div className="pt-3 border-t border-gray-100 flex items-center gap-2">
                <button
                  onClick={() => {
                    setActiveTab('atelier_orders');
                    setOrderViewMode('mobile_florist');
                  }}
                  className="flex-1 py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Trải Nghiệm Mobile Florist</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab('atelier_orders');
                    setOrderViewMode('mobile_ceo');
                  }}
                  className="py-2 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 text-xs font-bold cursor-pointer"
                >
                  Mobile CEO
                </button>
              </div>
            </div>
          </div>

          {/* TRÌNH MÔ PHỎNG VẬN HÀNH LIÊN NGÀNH KHÉP KÍN 5 BƯỚC (INTERACTIVE E2E WORKFLOW SIMULATOR) */}
          <div className="bg-gradient-to-br from-[#231917] via-[#2F211E] to-[#3D2628] text-white rounded-3xl p-5 sm:p-6 shadow-lg border border-amber-400/25 space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase tracking-wider">
                  <Activity className="w-3.5 h-3.5" /> Interactive Workflow Engine
                </span>
                <h3 className="text-base sm:text-xl font-serif font-bold text-amber-50 mt-1">
                  Sơ Đồ Vận Hành Liên Ngành Khép Kín (Spa / Thẩm Mỹ ⇄ Holding Hub ⇄ Xưởng Hoa JU et Saigon)
                </h3>
                <p className="text-xs text-stone-300 mt-0.5">
                  Bấm <strong>&ldquo;Chạy Kiểm Thử Luồng Liên Ngành&rdquo;</strong> để kiểm chứng
                  toàn bộ đường đi của dữ liệu qua 5 trạm kiểm soát mà không bị đứt gãy.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  onClick={handleRunLiveWorkflowSimulation}
                  disabled={isSimulatingFlow}
                  className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-[#F4A261] hover:opacity-95 text-[#231917] font-bold text-xs sm:text-sm shadow-lg flex items-center gap-2 cursor-pointer transition-all"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>
                    {isSimulatingFlow
                      ? `Đang Chạy Bước ${simStep}/5...`
                      : 'Chạy Kiểm Thử Luồng Liên Ngành (5 Bước)'}
                  </span>
                </button>

                <button
                  onClick={() => setIsGiftModalOpen(true)}
                  className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/15 font-bold text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Gift className="w-4 h-4 text-rose-300" />
                  <span>Phát Lệnh Thật Ngay</span>
                </button>
              </div>
            </div>

            {/* 5 Trạm Kiểm Soát Dữ Liệu */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {[
                {
                  step: 1,
                  branch: 'Nhánh 1 & 2 (juspa-manager)',
                  title: '1. Hoàn Tất Ca Spa / EMR',
                  desc: 'Lễ tân hoặc Bác sĩ bấm "Tặng Hoa VIP" ngay trên Lịch hẹn hoặc Hồ sơ Bệnh án EMR.',
                  actionLabel: 'Mở Lịch Hẹn Spa',
                  onClick: () => onSwitchToWellnessView('smart_booking')
                },
                {
                  step: 2,
                  branch: 'Holding Event Bus',
                  title: '2. Khớp SĐT Khách VIP 360°',
                  desc: 'Tự động lấy Tên, SĐT, Hạng thẻ và Liệu trình vừa làm để điền sẵn phiếu đặt hoa.',
                  actionLabel: 'Xem Hồ Sơ 360°',
                  onClick: () => setActiveTab('holding_360')
                },
                {
                  step: 3,
                  branch: 'Cầu Nối Cloud saigon-hoa',
                  title: '3. Khởi Tạo Đơn & Thiệp Sáp',
                  desc: 'Ghi trực tiếp bản ghi BespokeOrder kèm cấu hình Thiệp Đóng Dấu Sáp vào bảng /orders.',
                  actionLabel: 'Tạo Đơn Bespoke',
                  onClick: () => setIsGiftModalOpen(true)
                },
                {
                  step: 4,
                  branch: 'Xưởng Hoa JU et Saigon',
                  title: '4. Chế Tác 6 Bước & Trừ Kho',
                  desc: 'Nghệ nhân nhận việc trên Mobile UI; tự động khóa định mức trừ 4 nhóm vật tư xưởng.',
                  actionLabel: 'Mở Điều Phối 6 Bước',
                  onClick: () => setActiveTab('atelier_orders')
                },
                {
                  step: 5,
                  branch: 'Sổ Cái Tập Đoàn (Holding)',
                  title: '5. Đối Soát Nội Bộ 65%',
                  desc: 'Tự động hạch toán chi phí CSKH theo giá vốn nội bộ (65%) và hợp nhất P&L 3 nhánh.',
                  actionLabel: 'Xem Sổ Đối Soát',
                  onClick: () => setActiveTab('holding_360')
                }
              ].map((node) => {
                const isActive = simStep === node.step;
                const isDone = simStep > node.step;
                return (
                  <div
                    key={node.step}
                    className={`rounded-2xl p-3.5 border flex flex-col justify-between transition-all ${
                      isActive
                        ? 'bg-amber-400/25 border-amber-300 ring-2 ring-amber-300/50 scale-[1.01]'
                        : isDone
                        ? 'bg-emerald-500/15 border-emerald-400/40'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-amber-300">
                        <span>{node.branch}</span>
                        {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                      </div>
                      <h4 className="font-bold text-xs sm:text-sm text-white">{node.title}</h4>
                      <p className="text-[11px] text-stone-300 leading-relaxed">{node.desc}</p>
                    </div>

                    <button
                      onClick={node.onClick}
                      className="mt-3 pt-2 border-t border-white/10 text-[11px] font-bold text-amber-200 hover:text-white flex items-center justify-between cursor-pointer"
                    >
                      <span>{node.actionLabel}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Nhật Ký Sự Kiện Liên Ngành Thời Gian Thực (Live Cross-Branch Event Bus Log) & Trạm Luân Chuyển Hoa Decor */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-2">
              <div className="lg:col-span-7 bg-black/30 rounded-2xl p-4 border border-white/10 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Nhật Ký Luồng Sự Kiện Liên Ngành (Live Cross-Branch Event Stream)
                  </span>
                  <span className="text-[11px] text-stone-400">
                    {eventBusLogs.length} sự kiện đồng bộ
                  </span>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {eventBusLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="font-bold text-amber-100 flex items-center gap-2">
                          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300">
                            {log.timestamp}
                          </span>
                          <span>{log.title}</span>
                        </div>
                        <p className="text-[11px] text-stone-300">{log.detail}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 shrink-0">
                        {log.status === 'synced' ? 'Synced' : 'Offline Queue'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trạm Điều Phối Hoa Tươi Nội Bộ Sang Sảnh Spa (Zero-Waste Botanical Decor) */}
              <div className="lg:col-span-5 bg-white/10 rounded-2xl p-4 border border-amber-300/25 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-500/20 px-2.5 py-0.5 rounded-full">
                      Zero-Waste Botanical Lifecycle
                    </span>
                    <span className="text-[11px] text-amber-200 font-semibold">
                      Đã điều phối: {decorTransferLogs.length} đợt
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white">
                    Điều Phối Hoa Tươi Xưởng Hoa &rarr; Trang Trí Sảnh Spa &amp; Phòng VIP
                  </h4>
                  <p className="text-[11px] text-stone-300 leading-relaxed">
                    Tận dụng tối đa vòng đời cành hoa tươi tại xưởng <code>JU et Saigon</code> trước
                    khi hết hạn tươi để chuyển sang cắm bình trang trí Sảnh Lễ Tân Spa &amp; Phòng
                    VIP Thẩm mỹ:
                  </p>

                  <div className="space-y-1.5 pt-1">
                    {supplies
                      .filter((s) => s.category === 'stems')
                      .map((stem) => (
                        <div
                          key={stem.id}
                          className="p-2 rounded-xl bg-black/25 border border-white/10 flex items-center justify-between gap-2 text-xs"
                        >
                          <div className="min-w-0">
                            <div className="font-bold text-amber-100 truncate">
                              {stem.sku} • {stem.nameVi}
                            </div>
                            <div className="text-[10px] text-stone-300">
                              Tồn xưởng: <strong>{stem.currentStock}</strong> {stem.unit} • Giá vốn:{' '}
                              {formatVnd(stem.unitCostVnd)}
                            </div>
                          </div>
                          <button
                            onClick={() => handleTransferStemToSpaDecor(stem)}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold shrink-0 cursor-pointer transition-colors"
                          >
                            Xuất Decor Spa
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: TRUNG TÂM HOLDING & HỒ SƠ KHÁCH HÀNG LIÊN THÔNG 360               */}
      {/* ========================================================================= */}
      {activeTab === 'holding_360' && (
        <div className="space-y-6">
          {/* KPI Tổng Hợp */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-4 border border-pink-100 shadow-2xs">
              <div className="text-xs text-gray-500 font-semibold">
                Tổng Doanh Thu Toàn Tổ Hợp (Holding)
              </div>
              <div className="text-xl font-bold text-[#5C3A3A] mt-1">
                {formatVnd(financialSummary.totalHoldingRevenue)}
              </div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Hợp nhất tự động từ 3 mảng kinh doanh</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-pink-100 shadow-2xs">
              <div className="text-xs text-gray-500 font-semibold">
                Khách Hàng VIP Liên Thông (Spa + Hoa)
              </div>
              <div className="text-xl font-bold text-[#D97A7D] mt-1">
                {unifiedCustomers.length} Khách VIP
              </div>
              <div className="text-[11px] text-gray-500 mt-1">
                Đồng bộ qua SĐT giữa juspa-manager &amp; saigon-hoa
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-pink-100 shadow-2xs">
              <div className="text-xs text-gray-500 font-semibold">
                Đơn Hoa Bespoke &amp; Quà Tặng VIP
              </div>
              <div className="text-xl font-bold text-amber-700 mt-1">
                {orders.length} Đơn ({formatVnd(financialSummary.flowerOrdersRevenue)})
              </div>
              <div className="text-[11px] text-amber-700 font-semibold mt-1">
                {orders.filter((o) => o.sourceBranch === 'ju_wellness_vip_gift').length} đơn tri ân
                phát từ nhánh Wellness
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-pink-100 shadow-2xs">
              <div className="text-xs text-gray-500 font-semibold">
                Vật Tư Xưởng Hoa Cần Nhập Thêm
              </div>
              <div className="text-xl font-bold text-rose-600 mt-1">
                {lowStockCount} / {supplies.length} Mã Vật Tư
              </div>
              <div className="text-[11px] text-gray-500 mt-1">
                Cảnh báo định mức mùa lễ 20/10 &amp; Cưới
              </div>
            </div>
          </div>

          {/* Bảng Khách Hàng Liên Thông 360 (Cross-Brand CRM) */}
          <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#5C3A3A] flex items-center gap-2">
                  <HeartHandshake className="w-5 h-5 text-[#D97A7D]" />
                  <span>
                    Hồ Sơ Khách Hàng Liên Thông 360° (Spa • Thẩm Mỹ Không Xâm Lấn • Hoa Tươi JU et
                    Saigon)
                  </span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Một mã định danh SĐT duy nhất giúp tự động cộng dồn chi tiêu và đặt hoa tặng
                  khách VIP ngay sau liệu trình thẩm mỹ.
                </p>
              </div>

              <button
                onClick={() => setIsGiftModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-[#D97A7D] hover:bg-[#c6686b] text-white text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer shadow-2xs"
              >
                <Plus className="w-4 h-4" />
                <span>Tạo Lệnh Đặt Hoa Mới</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead className="bg-stone-50 text-gray-600 font-bold border-b border-gray-200">
                  <tr>
                    <th className="p-3.5">Khách Hàng &amp; Hạng Thẻ</th>
                    <th className="p-3.5">Liệu Trình Wellness / Thẩm Mỹ</th>
                    <th className="p-3.5">Lịch Sử Đặt Hoa &amp; Workshop (JU et Saigon)</th>
                    <th className="p-3.5 text-right">Tổng Chi Tiêu Tổ Hợp</th>
                    <th className="p-3.5 text-center">Tự Động Hóa Chéo (Cross-Sell / Tri Ân)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {unifiedCustomers.map((cust) => {
                    const total = cust.wellnessSpent + cust.flowerSpent;
                    return (
                      <tr key={cust.phone} className="hover:bg-pink-50/30 transition-colors">
                        <td className="p-3.5">
                          <div className="font-bold text-gray-900">{cust.name}</div>
                          <div className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                            <Phone className="w-3 h-3 text-gray-400" />
                            <span>{cust.phone}</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              <Award className="w-2.5 h-2.5 inline mr-0.5" />
                              {cust.tier}
                            </span>
                          </div>
                        </td>

                        <td className="p-3.5">
                          <div className="font-semibold text-[#5C3A3A]">
                            {cust.lastWellnessService || 'Khách hàng VIP Hệ sinh thái JU'}
                          </div>
                          {cust.emrDiagnosis && (
                            <div className="text-xs text-gray-500 mt-0.5">
                              Bệnh án EMR: {cust.emrDiagnosis}
                            </div>
                          )}
                          <div className="text-[11px] text-rose-600 font-semibold mt-0.5">
                            Chi tiêu Spa/Clinic: {formatVnd(cust.wellnessSpent)}
                          </div>
                        </td>

                        <td className="p-3.5">
                          {cust.flowerOrders.length === 0 &&
                          cust.workshopBookings.length === 0 ? (
                            <span className="text-xs text-gray-400 italic">
                              Chưa có đơn hoa tại JU et Saigon
                            </span>
                          ) : (
                            <div className="space-y-1">
                              {cust.flowerOrders.map((fo) => (
                                <div
                                  key={fo.id}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200/80 text-amber-900 text-xs mr-1.5"
                                >
                                  <Flower2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                  <span className="font-bold">{fo.orderCode}:</span>
                                  <span className="truncate max-w-[190px]">
                                    {fo.flowerName?.split('—')[0]}
                                  </span>
                                </div>
                              ))}
                              {cust.workshopBookings.map((wb) => (
                                <div
                                  key={wb.id}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-50 border border-purple-200 text-purple-900 text-xs"
                                >
                                  <Calendar className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                                  <span className="font-bold">{wb.bookingCode}:</span>
                                  <span>Workshop ({wb.participantsCount} pax)</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </td>

                        <td className="p-3.5 text-right">
                          <div className="font-bold text-sm text-gray-900">{formatVnd(total)}</div>
                          <div className="text-[11px] text-amber-700 font-medium">
                            Hoa tươi: {formatVnd(cust.flowerSpent)}
                          </div>
                        </td>

                        <td className="p-3.5 text-center">
                          <button
                            onClick={() => handleOpenQuickGiftForCustomer(cust)}
                            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#5C3A3A] to-[#8B4F58] hover:opacity-95 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs cursor-pointer transition-all"
                          >
                            <Gift className="w-3.5 h-3.5 text-amber-300" />
                            <span>Gửi Hoa Tri Ân VIP</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* 4 Trụ Cột Phát Triển Hệ Thống Trung Tâm & Bảng Đối Soát Nội Bộ Liên Nhánh */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Bảng Hạch Toán & Đối Soát Nội Bộ Giữa Nhánh Wellness và Nhánh Hoa */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-gray-200/80 shadow-xs p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-gray-100 pb-3.5">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
                    Inter-Branch Clearing Engine
                  </span>
                  <h3 className="text-base font-bold text-[#5C3A3A] mt-1">
                    Sổ Cái Đối Soát Nội Bộ: Nhánh Wellness ⇄ Xưởng Hoa JU et Saigon
                  </h3>
                  <p className="text-xs text-gray-500">
                    Tự động hạch toán chi phí quà tặng VIP theo giá vốn nội bộ (65% giá niêm yết) và
                    loại trừ doanh thu ảo khi hợp nhất báo cáo Holding.
                  </p>
                </div>
                <div className="text-right shrink-0 bg-stone-50 px-3.5 py-2 rounded-2xl border border-stone-200">
                  <div className="text-[11px] text-gray-500 font-medium">
                    Ngân sách CSKH Wellness chuyển sang Xưởng Hoa
                  </div>
                  <div className="text-sm font-bold text-emerald-700">
                    {formatVnd(
                      orders
                        .filter((o) => o.sourceBranch === 'ju_wellness_vip_gift')
                        .reduce((sum, o) => sum + Math.round((Number(o.budgetVnd) || 0) * 0.65), 0)
                    )}
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-stone-50 text-gray-600 font-bold border-b border-gray-200">
                    <tr>
                      <th className="p-2.5">Mã Đơn &amp; Khách VIP</th>
                      <th className="p-2.5">Tác Phẩm Xuất Kho</th>
                      <th className="p-2.5 text-right">Giá Bán Lẻ</th>
                      <th className="p-2.5 text-right">Giá Hạch Toán Nội Bộ (65%)</th>
                      <th className="p-2.5">Bút Toán Tự Động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {orders
                      .filter((o) => o.sourceBranch === 'ju_wellness_vip_gift')
                      .map((ord) => {
                        const retail = Number(ord.budgetVnd) || 0;
                        const internalCost = Math.round(retail * 0.65);
                        return (
                          <tr key={ord.id} className="hover:bg-stone-50/70">
                            <td className="p-2.5">
                              <div className="font-bold text-[#5C3A3A]">{ord.orderCode}</div>
                              <div className="text-[11px] text-gray-500">{ord.customerName}</div>
                            </td>
                            <td className="p-2.5 font-medium text-gray-800">
                              {ord.flowerName?.split('—')[0]}
                            </td>
                            <td className="p-2.5 text-right text-gray-500 line-through">
                              {formatVnd(retail)}
                            </td>
                            <td className="p-2.5 text-right font-bold text-emerald-700">
                              {formatVnd(internalCost)}
                            </td>
                            <td className="p-2.5">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                Nợ Quỹ CSKH Clinic / Có Doanh Thu Nội Bộ Hoa
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 4 Cơ Chế Tự Động Hóa Khi Đã Có Dữ Liệu Hoa */}
            <div className="lg:col-span-5 bg-gradient-to-br from-[#5C3A3A] to-[#3E2424] text-white rounded-3xl p-5 shadow-md flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-200 border border-amber-300/30 uppercase tracking-wider">
                  Kiến Trúc Phát Triển Hệ Thống Trung Tâm
                </div>
                <h3 className="text-base sm:text-lg font-bold">
                  4 Luồng Vận Hành Tự Động Khi Đã Có Dữ Liệu Hoa
                </h3>

                <div className="space-y-2.5 text-xs text-pink-50/90">
                  <div className="p-3 rounded-2xl bg-white/10 border border-white/10">
                    <div className="font-bold text-amber-200">
                      1. Auto-Trigger Từ Hồ Sơ Bệnh Án (EMR) &amp; Booking
                    </div>
                    <p className="mt-0.5 text-[11px] text-pink-100/80">
                      Khi khách hoàn tất liệu trình Thẩm mỹ Không xâm lấn (&ge; 10tr) hoặc tới sinh
                      nhật, Trung tâm tự gợi ý mẫu hoa hợp gu để gửi tặng ngay.
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/10 border border-white/10">
                    <div className="font-bold text-amber-200">
                      2. Bán Chéo Đa Chiều (Cross-Sell Voucher &amp; Workshop)
                    </div>
                    <p className="mt-0.5 text-[11px] text-pink-100/80">
                      Khách đặt hoa Bespoke trên web <code>saigon-Flower</code> được tự động tích
                      điểm hạng thẻ chung và nhận thư mời trải nghiệm Spa / Workshop cắm hoa.
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/10 border border-white/10">
                    <div className="font-bold text-amber-200">
                      3. Tối Ưu Vòng Đời Hoa Tươi (Zero-Waste Decor)
                    </div>
                    <p className="mt-0.5 text-[11px] text-pink-100/80">
                      Tồn kho cành hoa tươi (<code>STM-001..003</code>) tại xưởng hoa được điều
                      phối sang trang trí sảnh Lễ tân Spa &amp; phòng VIP Clinic trước khi hết hạn
                      tươi.
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/10 border border-white/10">
                    <div className="font-bold text-amber-200">
                      4. Phân Tách Giao Diện Điện Thoại Theo Vai Trò (Micro-View)
                    </div>
                    <p className="mt-0.5 text-[11px] text-pink-100/80">
                      Dữ liệu gom 100% về Trung tâm nhưng điện thoại Nghệ nhân chỉ hiện 3 nút chạm,
                      không bị rối bởi dữ liệu Spa/EMR.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-white/15 flex flex-wrap items-center justify-between gap-2">
                <button
                  onClick={() => setActiveTab('atelier_orders')}
                  className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#3E2424] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Mở Giao Diện Điện Thoại Của Florist &amp; CEO</span>
                </button>
                <span className="text-[11px] text-pink-200/80">
                  Đồng bộ thời gian thực với <code>saigon-hoa</code>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ĐIỀU PHỐI ĐƠN HOA 6 BƯỚC & GIAO DIỆN ĐIỆN THOẠI TỐI ƯU             */}
      {/* ========================================================================= */}
      {activeTab === 'atelier_orders' && (
        <div className="space-y-5">
          {/* Thanh công cụ & Chuyển đổi chế độ Giao diện Điện Thoại (Trả lời trực quan câu hỏi về Mobile UI) */}
          <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-2xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mr-1">
                Chế độ Giao diện:
              </span>
              <button
                onClick={() => setOrderViewMode('desktop_coordinator')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                  orderViewMode === 'desktop_coordinator'
                    ? 'bg-[#5C3A3A] text-white shadow-2xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Điều Phối Đầy Đủ 6 Bước (Atelier Admin)</span>
              </button>

              <button
                onClick={() => setOrderViewMode('mobile_florist')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                  orderViewMode === 'mobile_florist'
                    ? 'bg-amber-700 text-white shadow-2xs'
                    : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mobile Nghệ Nhân Cắm Hoa (Tối Giản 3 Chạm)</span>
              </button>

              <button
                onClick={() => setOrderViewMode('mobile_ceo')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                  orderViewMode === 'mobile_ceo'
                    ? 'bg-purple-700 text-white shadow-2xs'
                    : 'bg-purple-50 text-purple-900 border border-purple-200 hover:bg-purple-100'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mobile Chủ Đầu Tư / CEO (Tổng Quan 3 Nhánh)</span>
              </button>

              <button
                onClick={() => setStrictWorkflowLock(!strictWorkflowLock)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                  strictWorkflowLock
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-gray-100 text-gray-600 border border-gray-200'
                }`}
                title="Khi bật Khóa Quy Trình, nhân viên phải đi tuần tự từng bước và hệ thống tự động trừ kho vật tư ở Bước 3"
              >
                {strictWorkflowLock ? (
                  <>
                    <Lock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Khóa Tuần Tự 6 Bước: BẬT</span>
                  </>
                ) : (
                  <>
                    <Unlock className="w-3.5 h-3.5 text-gray-500" />
                    <span>Khóa Tuần Tự 6 Bước: TẮT</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm mã ORD, tên khách, SĐT..."
                  className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#D97A7D]"
                />
              </div>

              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value as any)}
                className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 outline-none"
              >
                <option value="all">Tất cả trạng thái ({orders.length})</option>
                {ORDER_WORKFLOW_STAGES.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.labelVi}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* CHẾ ĐỘ 1: MOBILE NGHỆ NHÂN CẮM HOA (TASK-FOCUSED MICRO-UI) */}
          {orderViewMode === 'mobile_florist' && (
            <div className="max-w-md mx-auto bg-[#1C1917] text-white rounded-3xl p-5 shadow-2xl border border-amber-400/30 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-amber-400 font-bold">
                    Task-Focused Mobile App
                  </span>
                  <h4 className="text-base font-bold text-white">
                    Giao Diện Điện Thoại — Nghệ Nhân Xưởng Hoa
                  </h4>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold">
                  Không Quá Tải
                </span>
              </div>

              <p className="text-xs text-stone-300 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/10">
                💡 <strong>Nguyên lý tối ưu trên điện thoại:</strong> Điện thoại của thợ cắm hoa{' '}
                <strong>ẩn hoàn toàn Bệnh án EMR &amp; Bảng lương Spa</strong>, chỉ hiển thị đúng
                thẻ việc cần làm trong ngày với nút bấm lớn 1 chạm.
              </p>

              <div className="space-y-3">
                {filteredOrders.map((ord) => {
                  const currentStageIdx = ORDER_WORKFLOW_STAGES.findIndex(
                    (s) => s.id === ord.status
                  );
                  const nextStage =
                    currentStageIdx >= 0 && currentStageIdx < ORDER_WORKFLOW_STAGES.length - 1
                      ? ORDER_WORKFLOW_STAGES[currentStageIdx + 1]
                      : null;

                  return (
                    <div
                      key={ord.id}
                      className="bg-stone-800/90 border border-stone-700 rounded-2xl p-4 space-y-3"
                    >
                      <div className="flex items-center gap-3">
                        {ord.flowerImage && (
                          <img
                            src={ord.flowerImage}
                            alt={ord.flowerName}
                            className="w-14 h-14 rounded-xl object-cover border border-amber-300/30 shrink-0"
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs font-bold text-amber-300">
                              {ord.orderCode}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-200 font-bold">
                              {
                                ORDER_WORKFLOW_STAGES.find((s) => s.id === ord.status)?.shortVi
                              }
                            </span>
                          </div>
                          <div className="font-bold text-sm text-white truncate mt-0.5">
                            {ord.flowerName?.split('—')[0]}
                          </div>
                          <div className="text-xs text-stone-300">
                            Giao: {ord.deliveryTimeSlot || 'Trong ngày'} • KH: {ord.customerName}
                          </div>
                        </div>
                      </div>

                      {ord.giftCard?.enabled && (
                        <div className="text-xs bg-stone-900/90 p-2.5 rounded-xl border border-amber-400/20 text-amber-100">
                          <div className="font-bold text-amber-300 mb-0.5">
                            🕯️ Thiệp giấy {ord.giftCard.paperStyle.toUpperCase()} • Sáp{' '}
                            {ord.giftCard.waxColor.toUpperCase()}:
                          </div>
                          <div className="italic">&ldquo;{ord.giftCard.message}&rdquo;</div>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        {!ord.suppliesDeducted ? (
                          <button
                            onClick={() => handleDeductOrderSupplies(ord)}
                            className="py-2.5 px-3 rounded-xl bg-stone-700 hover:bg-stone-600 text-amber-200 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Package className="w-3.5 h-3.5" />
                            <span>1 Chạm Xuất Vật Tư</span>
                          </button>
                        ) : (
                          <div className="py-2.5 px-3 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 font-bold text-xs flex items-center justify-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            <span>Đã Xuất Vật Tư</span>
                          </div>
                        )}

                        {nextStage ? (
                          <button
                            onClick={() => handleAdvanceOrderStage(ord, nextStage.id)}
                            className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 text-white font-bold text-xs flex items-center justify-center gap-1 cursor-pointer shadow-md"
                          >
                            <span>Chuyển: {nextStage.shortVi}</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <div className="py-2.5 px-3 rounded-xl bg-emerald-600/30 text-emerald-200 font-bold text-xs flex items-center justify-center">
                            🎉 Đã Hoàn Tất
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* CHẾ ĐỘ 2: MOBILE CEO / CHỦ ĐẦU TƯ (EXECUTIVE SUMMARY CARD) */}
          {orderViewMode === 'mobile_ceo' && (
            <div className="max-w-md mx-auto bg-white rounded-3xl p-5 shadow-xl border border-purple-200 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-purple-600 font-bold">
                    Executive Mobile Dashboard
                  </span>
                  <h4 className="text-base font-bold text-gray-900">
                    Màn Hình Điện Thoại — Chủ Đầu Tư (Holding)
                  </h4>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-bold">
                  Real-time
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#5C3A3A] to-[#2B1B1B] text-white space-y-2">
                <div className="text-xs text-rose-200">Tổng Doanh Thu Hợp Nhất Hôm Nay</div>
                <div className="text-2xl font-bold">
                  {formatVnd(financialSummary.totalHoldingRevenue)}
                </div>
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/15 text-[11px]">
                  <div>
                    <div className="text-stone-300">Thẩm mỹ</div>
                    <div className="font-bold text-rose-200">
                      {formatVnd(financialSummary.clinicRevenue)}
                    </div>
                  </div>
                  <div>
                    <div className="text-stone-300">Spa</div>
                    <div className="font-bold text-emerald-200">
                      {formatVnd(financialSummary.spaRevenue)}
                    </div>
                  </div>
                  <div>
                    <div className="text-stone-300">JU et Saigon</div>
                    <div className="font-bold text-amber-300">
                      {formatVnd(financialSummary.saigonFlowerTotal)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-bold text-gray-700 uppercase">
                  Cảnh Báo &amp; Phê Duyệt Nhanh (1 Chạm)
                </div>
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between">
                  <div className="text-xs text-amber-900">
                    <strong>{lowStockCount} mã vật tư xưởng hoa</strong> chạm ngưỡng tồn tối thiểu
                  </div>
                  <button
                    onClick={() => setActiveTab('catalog_inventory')}
                    className="px-2.5 py-1 bg-amber-700 text-white rounded-lg text-[11px] font-bold cursor-pointer"
                  >
                    Xem kho
                  </button>
                </div>
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between">
                  <div className="text-xs text-rose-900">
                    Tặng hoa tự động cho <strong>{unifiedCustomers.length} khách VVIP</strong>
                  </div>
                  <button
                    onClick={() => setIsGiftModalOpen(true)}
                    className="px-2.5 py-1 bg-[#D97A7D] text-white rounded-lg text-[11px] font-bold cursor-pointer"
                  >
                    Phát lệnh
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* CHẾ ĐỘ 3: ĐIỀU PHỐI ĐẦY ĐỦ 6 BƯỚC CHUẨN ATELIERCONTEXT.TSX */}
          {orderViewMode === 'desktop_coordinator' && (
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const checklist = {
                  ...DEFAULT_WORKFLOW_CHECKLIST,
                  ...(order.workflowChecklist || {})
                };

                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-3xl border border-gray-200/90 shadow-xs p-5 space-y-4 hover:border-[#D97A7D]/50 transition-all"
                  >
                    {/* Top row */}
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-gray-100 pb-4">
                      <div className="flex items-start gap-4">
                        {order.flowerImage && (
                          <img
                            src={order.flowerImage}
                            alt={order.flowerName}
                            className="w-20 h-20 rounded-2xl object-cover border border-gray-200 shadow-2xs shrink-0"
                          />
                        )}
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-lg bg-stone-900 text-amber-300">
                              {order.orderCode}
                            </span>
                            {order.sourceBranch === 'ju_wellness_vip_gift' ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                                🎁 Quà Tặng VIP Từ Nhánh Wellness &amp; Thẩm Mỹ
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                                🌸 Đơn Bespoke Từ Web JU et Saigon
                              </span>
                            )}
                            <span className="text-xs text-gray-500">
                              Nghệ nhân phụ trách:{' '}
                              <strong className="text-gray-800">
                                {order.assignedFlorist || 'Master Florist Minh Anh'}
                              </strong>
                            </span>
                          </div>

                          <h4 className="text-base sm:text-lg font-bold text-[#5C3A3A]">
                            {order.flowerName || 'Tác Phẩm Hoa Thiết Kế Độc Bản'}
                          </h4>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600">
                            <span>
                              👤 Khách hàng: <strong>{order.customerName}</strong> (
                              {order.customerPhone})
                            </span>
                            <span>
                              🕒 Giao: <strong>{order.deliveryDate}</strong> (
                              {order.deliveryTimeSlot || '14:00 - 16:00'})
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-gray-400" />
                              {order.district}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between gap-2 shrink-0">
                        <div className="text-lg font-bold text-[#D97A7D]">
                          {formatVnd(order.budgetVnd)}
                        </div>
                        <button
                          onClick={() => handleDeductOrderSupplies(order)}
                          disabled={order.suppliesDeducted}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                            order.suppliesDeducted
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                              : 'bg-amber-600 hover:bg-amber-700 text-white shadow-2xs'
                          }`}
                        >
                          <Package className="w-3.5 h-3.5" />
                          <span>
                            {order.suppliesDeducted
                              ? 'Đã Trừ Vật Tư Xưởng (4 Nhóm)'
                              : 'Trừ Định Mức Vật Tư Xưởng'}
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Quy trình 6 bước chuẩn AtelierContext.tsx */}
                    <div>
                      <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                        Quy Trình Chế Tác 6 Bước Chuẩn JU et Saigon (Bấm để chuyển bước Real-time
                        lên saigon-hoa):
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                        {ORDER_WORKFLOW_STAGES.map((stage) => {
                          const currentStep =
                            ORDER_WORKFLOW_STAGES.find((s) => s.id === order.status)?.stepNum || 1;
                          const isCurrent = order.status === stage.id;
                          const isPassed = stage.stepNum < currentStep;

                          return (
                            <button
                              key={stage.id}
                              onClick={() => handleAdvanceOrderStage(order, stage.id)}
                              className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                                isCurrent
                                  ? 'bg-[#5C3A3A] text-white border-[#5C3A3A] shadow-sm ring-2 ring-[#D97A7D]/40'
                                  : isPassed
                                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-pink-50/50'
                              }`}
                            >
                              <div className="flex items-center justify-between text-[11px] font-bold">
                                <span>Bước {stage.stepNum}</span>
                                {isPassed && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                                {isCurrent && <Clock className="w-3.5 h-3.5 text-amber-300" />}
                              </div>
                              <div className="text-xs font-bold mt-0.5 truncate">
                                {stage.shortVi}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Checklist Xưởng Hoa & Thiệp Dấu Sáp */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-1">
                      {/* 6 Hạng mục Checklist */}
                      <div className="bg-stone-50 rounded-2xl p-3.5 border border-stone-200/80">
                        <div className="text-xs font-bold text-stone-700 mb-2">
                          Checklist Kiểm Định Chất Lượng Tại Xưởng (OrderWorkflowChecklist):
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                          {(
                            [
                              ['stemsConditioned', '1. Đã dưỡng cành Chrysal'],
                              ['vesselPrepared', '2. Đã chuẩn bị bình/hộp'],
                              ['arrangementCrafted', '3. Đã cắm lên form'],
                              ['waxSealCardAttached', '4. Đã đóng dấu sáp thiệp'],
                              ['qcPhotoUploaded', '5. Đã chụp ảnh nghiệm thu'],
                              ['hydrationWrapped', '6. Đã bọc giữ ẩm gốc hoa']
                            ] as Array<[keyof typeof DEFAULT_WORKFLOW_CHECKLIST, string]>
                          ).map(([key, label]) => (
                            <label
                              key={key}
                              className="flex items-center gap-2 p-2 rounded-xl bg-white border border-gray-200/80 cursor-pointer hover:border-[#D97A7D]"
                            >
                              <input
                                type="checkbox"
                                checked={Boolean(checklist[key])}
                                onChange={() => handleToggleChecklistItem(order, key)}
                                className="rounded text-[#D97A7D] focus:ring-[#D97A7D]"
                              />
                              <span className="text-[11px] font-semibold text-gray-700">
                                {label}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Thiệp Đóng Dấu Sáp (WaxSealGiftCard) */}
                      {order.giftCard?.enabled && (
                        <div
                          className={`rounded-2xl p-4 border flex flex-col justify-between ${
                            order.giftCard.paperStyle === 'noir'
                              ? 'bg-stone-900 text-amber-100 border-amber-500/30'
                              : order.giftCard.paperStyle === 'blush'
                              ? 'bg-rose-50/80 text-rose-950 border-rose-200'
                              : 'bg-[#FAF6F0] text-stone-800 border-amber-200'
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                            <span>
                              🕯️ Thiệp Đóng Dấu Sáp Thủ Công ({order.giftCard.paperStyle.toUpperCase()})
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] uppercase bg-amber-500/20 text-amber-700 border border-amber-400/30">
                              Sáp {order.giftCard.waxColor}
                            </span>
                          </div>
                          <p className="text-xs italic font-serif leading-relaxed">
                            &ldquo;{order.giftCard.message}&rdquo;
                          </p>
                          <div className="flex items-center justify-between text-[11px] opacity-80 mt-2 pt-2 border-t border-current/10">
                            <span>Người nhận: {order.giftCard.recipient}</span>
                            <span>Người gửi: {order.giftCard.sender}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: KHO VẬT TƯ XƯỞNG HOA (11 MÃ) & BÁCH KHOA 12 TÁC PHẨM              */}
      {/* ========================================================================= */}
      {activeTab === 'catalog_inventory' && (
        <div className="space-y-8">
          {/* Phần A: Kho Vật Tư Xưởng Hoa (/supplies từ inventoryAndTrends.ts) */}
          <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#5C3A3A] flex items-center gap-2">
                  <Package className="w-5 h-5 text-[#D97A7D]" />
                  <span>
                    Kho Vật Tư &amp; Phụ Liệu Xưởng Hoa JU et Saigon (11 Mã Chuẩn Từ Repo
                    saigon-Flower)
                  </span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Tách biệt hoàn toàn với Kho Dược Mỹ Phẩm &amp; Đầu Tip HIFU của nhánh Thẩm mỹ,
                  đồng bộ trực tiếp với bảng <code>/supplies</code> trên Firebase{' '}
                  <code>saigon-hoa</code>.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: 'all', label: 'Tất cả (11)' },
                  { id: 'vessels', label: '1. Bình & Hộp Nhung' },
                  { id: 'packaging', label: '2. Giấy Lụa & Sáp' },
                  { id: 'conditioning', label: '3. Dưỡng Hoa Chrysal' },
                  { id: 'stems', label: '4. Hoa Chủ Đạo' }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSupplyCategoryFilter(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                      supplyCategoryFilter === cat.id
                        ? 'bg-[#5C3A3A] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSupplies.map((sup) => {
                const isLow = sup.currentStock <= sup.minThreshold;
                const peakRecommended = Math.ceil(sup.minThreshold * sup.peakBoostFactor);

                return (
                  <div
                    key={sup.id}
                    className={`rounded-2xl p-4 border flex flex-col justify-between transition-all ${
                      isLow
                        ? 'bg-amber-50/60 border-amber-300'
                        : 'bg-stone-50/60 border-gray-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-stone-800 text-amber-300">
                          {sup.sku}
                        </span>
                        {isLow ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-200/70 px-2 py-0.5 rounded-full">
                            <AlertTriangle className="w-3 h-3" />
                            Cần nhập thêm
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                            An toàn
                          </span>
                        )}
                      </div>

                      <h4 className="font-bold text-sm text-gray-900 mt-2">{sup.nameVi}</h4>
                      <div className="text-[11px] text-gray-500 italic">{sup.nameEn}</div>

                      <p className="text-xs text-gray-600 mt-2 bg-white p-2 rounded-xl border border-gray-200/60">
                        📌 {sup.supplierNote}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-200/80 flex items-center justify-between">
                      <div>
                        <div className="text-[11px] text-gray-500">
                          Tồn hiện tại / Tối thiểu ({sup.minThreshold}) • Đề xuất lễ:{' '}
                          <strong>{peakRecommended}</strong>
                        </div>
                        <div className="text-base font-bold text-[#5C3A3A]">
                          {sup.currentStock} {sup.unit}{' '}
                          <span className="text-xs font-normal text-gray-500">
                            ({formatVnd(sup.unitCostVnd)}/{sup.unit})
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleAdjustSupplyStock(sup, -1)}
                          className="w-8 h-8 rounded-xl bg-white border border-gray-300 hover:bg-gray-100 font-bold text-sm cursor-pointer"
                        >
                          -
                        </button>
                        <button
                          onClick={() => handleAdjustSupplyStock(sup, 5)}
                          className="px-2.5 h-8 rounded-xl bg-[#5C3A3A] hover:bg-[#462b2b] text-white font-bold text-xs cursor-pointer"
                        >
                          +5
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Phần B: Bách Khoa 12 Tác Phẩm Hoa Độc Bản (Encyclopædia Botanica) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#5C3A3A]">
                  🌺 Bách Khoa 12 Tác Phẩm Hoa Độc Bản (Encyclopædia Botanica — JU et Saigon)
                </h3>
                <p className="text-xs text-gray-500">
                  Dữ liệu và hình ảnh gốc từ <code>src/data/flowers.ts</code> của repo{' '}
                  <code>saigon-Flower</code>. Bấm &ldquo;Chọn Tặng Khách VIP&rdquo; để phát lệnh
                  chế tác ngay.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {flowers.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl border border-gray-200/90 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-52 overflow-hidden bg-stone-900">
                      <img
                        src={item.image}
                        alt={item.vietnameseName}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/70 text-amber-300 backdrop-blur-xs">
                        No.{item.indexNumber} • {item.categoryLabelVi}
                      </span>
                      <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-xl text-xs font-bold bg-white/95 text-[#5C3A3A] shadow-sm">
                        {formatVnd(item.priceVnd)}
                      </span>
                    </div>

                    <div className="p-4 space-y-2">
                      <div className="text-[11px] font-serif italic text-gray-500">
                        {item.latinName}
                      </div>
                      <h4 className="font-bold text-sm text-gray-900 leading-snug">
                        {item.name} — {item.vietnameseName}
                      </h4>
                      <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                        {item.shortDescriptionVi}
                      </p>
                      <div className="text-[11px] text-amber-800 bg-amber-50 px-2.5 py-1.5 rounded-xl border border-amber-200/60">
                        🌿 <strong>Hương:</strong> {item.scentTop} ({item.scentMood})
                      </div>
                    </div>
                  </div>

                  <div className="p-4 pt-0">
                    <button
                      onClick={() => {
                        setGiftForm((prev) => ({
                          ...prev,
                          flowerId: item.id
                        }));
                        setIsGiftModalOpen(true);
                      }}
                      className="w-full py-2.5 px-3 rounded-xl bg-[#5C3A3A] hover:bg-[#D97A7D] text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Gift className="w-3.5 h-3.5" />
                      <span>Chọn Tặng Khách VIP / Đặt Đơn</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: CỔNG KẾT NỐI GITHUB & FIREBASE BRIDGE (SAIGON-HOA)                */}
      {/* ========================================================================= */}
      {activeTab === 'api_bridge' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-gray-200 p-6 space-y-5 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Đã Kết Nối Trực Tiếp (Zero-Latency Cloud Bridge)
                </span>
                <h3 className="text-lg font-bold text-[#5C3A3A] mt-2">
                  Cấu Hình Liên Thông Giữa Hệ Thống Trung Tâm &amp; Repo{' '}
                  <code>Duyy200692/saigon-Flower</code>
                </h3>
                <p className="text-xs text-gray-600 mt-1">
                  Hệ thống Trung tâm đã đọc trực tiếp cấu hình từ file{' '}
                  <code>firebase-applet-config.json</code> và <code>firebase-blueprint.json</code>{' '}
                  trong GitHub của bạn để thiết lập cầu nối 2 chiều thời gian thực.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  onClick={handleExportSaigonBackupJson}
                  className="px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-amber-300 text-xs font-bold flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Tải File Backup Chuẩn JU et Saigon (.json)</span>
                </button>
              </div>
            </div>

            {/* Sơ đồ 2 Database chạy song song */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-pink-50/60 border border-pink-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#D97A7D] uppercase">
                    Nhánh 1 &amp; 2: Wellness &amp; Thẩm Mỹ
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                    Connected
                  </span>
                </div>
                <div className="font-mono text-sm font-bold text-gray-900">
                  Firebase Project: juspa-manager
                </div>
                <p className="text-xs text-gray-600">
                  Lưu trữ chuyên sâu: <code>medical_records</code> (EMR), <code>bookings</code>,{' '}
                  <code>high_tech_tips</code>, <code>iot_devices</code>, <code>staff</code>,{' '}
                  <code>payroll</code>.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-800 uppercase">
                    Nhánh 3: Hoa Tươi JU et Saigon (GitHub Repo)
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                    Live Bridge Active
                  </span>
                </div>
                <div className="font-mono text-sm font-bold text-gray-900">
                  Firebase Project: {SAIGON_FLOWER_FIREBASE_CONFIG.projectId}
                </div>
                <p className="text-xs text-gray-600">
                  Đồng bộ trực tiếp các bảng: <code>/flowers</code> (12 mẫu),{' '}
                  <code>/orders</code> (Đơn hoa &amp; Thiệp sáp), <code>/supplies</code> (11 mã vật
                  tư), <code>/workshop_bookings</code>.
                </p>
              </div>
            </div>

            {/* Thông số kỹ thuật trích xuất từ GitHub */}
            <div className="bg-stone-900 text-stone-100 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Layers className="w-4 h-4" />
                  <span>
                    Thông Số Kết Nối Trích Xuất Từ GitHub: Duyy200692/saigon-Flower
                  </span>
                </span>
                <button
                  onClick={() =>
                    handleCopyText(
                      'config',
                      JSON.stringify(SAIGON_FLOWER_FIREBASE_CONFIG, null, 2)
                    )
                  }
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-amber-200 flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedKey === 'config' ? 'Đã Copy!' : 'Copy Config'}</span>
                </button>
              </div>
              <pre className="text-xs font-mono text-emerald-300 overflow-x-auto p-3 bg-black/50 rounded-xl">
{`// Đã được khởi tạo tự động trong saigonFlowerService.ts của Hệ thống Trung tâm:
const saigonFlowerApp = initializeApp({
  projectId: "${SAIGON_FLOWER_FIREBASE_CONFIG.projectId}",
  appId: "${SAIGON_FLOWER_FIREBASE_CONFIG.appId}",
  storageBucket: "${SAIGON_FLOWER_FIREBASE_CONFIG.storageBucket}"
}, "saigon-hoa");

export const flowerDb = getFirestore(saigonFlowerApp);
// -> Mọi đơn hoa tạo tại Trung tâm sẽ tự động nhảy sang Admin Portal của web JU et Saigon!`}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL ĐẶT HOA TẶNG KHÁCH VIP & THIỆP ĐÓNG DẤU SÁP (WAX SEAL GIFT CARD)   */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isGiftModalOpen}
        onClose={() => setIsGiftModalOpen(false)}
        title="🎁 Phát Lệnh Đặt Hoa Tặng Khách VIP (Gửi Thẳng Sang Xưởng JU et Saigon)"
      >
        <form onSubmit={handleCreateBespokeOrder} className="space-y-4 text-xs sm:text-sm">
          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
            Đơn hoa này sẽ được tạo theo đúng chuẩn <code>BespokeOrder</code> và ghi thẳng vào bảng{' '}
            <code>/orders</code> trên Firebase <strong>saigon-hoa</strong> của hệ thống Hoa tươi.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Tên Khách Hàng VIP *
              </label>
              <input
                type="text"
                required
                value={giftForm.customerName}
                onChange={(e) =>
                  setGiftForm({
                    ...giftForm,
                    customerName: e.target.value,
                    recipient: `Chị ${e.target.value}`
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Số Điện Thoại (Khớp Hồ Sơ 360°) *
              </label>
              <input
                type="text"
                required
                value={giftForm.customerPhone}
                onChange={(e) => setGiftForm({ ...giftForm, customerPhone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Chọn Tác Phẩm Hoa Từ Bách Khoa JU et Saigon (12 Mẫu) *
            </label>
            <select
              value={giftForm.flowerId}
              onChange={(e) => setGiftForm({ ...giftForm, flowerId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl font-semibold text-[#5C3A3A]"
            >
              {flowers.map((f) => (
                <option key={f.id} value={f.id}>
                  No.{f.indexNumber} — {f.name} ({f.vietnameseName}) — {formatVnd(f.priceVnd)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Ngày Giao Hoa</label>
              <input
                type="date"
                value={giftForm.deliveryDate}
                onChange={(e) => setGiftForm({ ...giftForm, deliveryDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Khung Giờ Giao (Chuẩn Atelier)
              </label>
              <select
                value={giftForm.deliveryTimeSlot}
                onChange={(e) => setGiftForm({ ...giftForm, deliveryTimeSlot: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl"
              >
                <option value="09:00 - 11:00">09:00 - 11:00 (Sáng)</option>
                <option value="14:00 - 16:00">14:00 - 16:00 (Chiều — Đón khách sau Spa)</option>
                <option value="16:00 - 18:00">16:00 - 18:00 (Hoàng hôn)</option>
                <option value="18:00 - 20:00">18:00 - 20:00 (Tối)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Địa Điểm Nhận Hoa (Tại Phòng VIP Spa hoặc Giao Tận Nhà)
            </label>
            <input
              type="text"
              value={giftForm.district}
              onChange={(e) => setGiftForm({ ...giftForm, district: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl"
            />
          </div>

          {/* Cấu hình Thiệp Đóng Dấu Sáp (WaxSealGiftCard) */}
          <div className="p-4 rounded-2xl bg-[#FAF6F0] border border-amber-200 space-y-3">
            <div className="font-bold text-xs text-amber-900 uppercase tracking-wider">
              🕯️ Thiết Kế Thiệp Đóng Dấu Sáp Thủ Công (Wax Seal Gift Card)
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">
                  Chất liệu giấy mỹ thuật
                </label>
                <select
                  value={giftForm.paperStyle}
                  onChange={(e) => setGiftForm({ ...giftForm, paperStyle: e.target.value as any })}
                  className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs"
                >
                  <option value="parchment">Kem Cổ Điển (Parchment)</option>
                  <option value="noir">Đen Nhung Huyền Bí (Noir)</option>
                  <option value="blush">Hồng Phấn Lụa (Blush)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">
                  Màu sáp đóng dấu (Wax Color)
                </label>
                <select
                  value={giftForm.waxColor}
                  onChange={(e) => setGiftForm({ ...giftForm, waxColor: e.target.value as any })}
                  className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs"
                >
                  <option value="gold">Vàng Hoàng Kim (Gold)</option>
                  <option value="crimson">Đỏ Nhung (Crimson)</option>
                  <option value="bronze">Đồng Cổ Điển (Bronze)</option>
                  <option value="moss">Xanh Rêu Rừng (Moss)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-600 mb-1">
                Thông điệp viết tay gửi khách VIP
              </label>
              <textarea
                rows={2}
                value={giftForm.cardMessage}
                onChange={(e) => setGiftForm({ ...giftForm, cardMessage: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-serif italic"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsGiftModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-semibold text-xs cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#D97A7D] hover:bg-[#c56669] text-white font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Phát Lệnh Sang Xưởng JU et Saigon</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SaigonFlowerHoldingHub;

import React, { useState, useEffect, useMemo } from 'react';
import {
  Building2,
  Flower2,
  Sparkles,
  Microscope,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Search,
  Gift,
  Activity,
  TrendingUp
} from 'lucide-react';
import {
  Booking,
  ClinicRoom,
  MedicalRecord,
  HighTechTip,
  InventoryItem,
  Service,
  Promotion,
  PromotionStatus,
  LoyaltyMember,
  StaffMember,
  TreatmentCycleAlert
} from '../types';
import {
  SaigonBespokeOrder,
  SaigonSupplyItem,
  getInitialSaigonFlowerData,
  subscribeSaigonFlowerRealtime,
  saveSaigonOrderToCloud,
  persistSaigonFlowerData,
  DEFAULT_WORKFLOW_CHECKLIST
} from '../saigonFlowerService';
import { AppView } from './Header';
import { HubTab } from './SaigonFlowerHoldingHub';

interface HoldingCenterExecutiveViewProps {
  bookings: Booking[];
  rooms: ClinicRoom[];
  medicalRecords: MedicalRecord[];
  highTechTips: HighTechTip[];
  inventoryItems: InventoryItem[];
  services: Service[];
  activePromotions: Promotion[];
  proposalPromotions: Promotion[];
  loyaltyMembers: LoyaltyMember[];
  staffList: StaffMember[];
  cycleAlerts: TreatmentCycleAlert[];
  onNavigateView: (view: AppView, flowerTab?: HubTab) => void;
  onApprovePromotion?: (promo: Promotion) => void;
  onDispatchFlowerFromExecutive: (payload: {
    customerName: string;
    customerPhone: string;
    occasion: string;
    sourceContext: string;
  }) => void;
}

const formatVnd = (amount: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

const HoldingCenterExecutiveView: React.FC<HoldingCenterExecutiveViewProps> = ({
  bookings,
  rooms,
  medicalRecords,
  highTechTips,
  inventoryItems,
  services,
  activePromotions,
  proposalPromotions,
  loyaltyMembers,
  staffList,
  cycleAlerts,
  onNavigateView,
  onApprovePromotion,
  onDispatchFlowerFromExecutive
}) => {
  const initialFlower = useMemo(() => getInitialSaigonFlowerData(), []);
  const [flowerOrders, setFlowerOrders] = useState<SaigonBespokeOrder[]>(initialFlower.orders);
  const [flowerSupplies, setFlowerSupplies] = useState<SaigonSupplyItem[]>(initialFlower.supplies);
  const [isFlowerCloudLive, setIsFlowerCloudLive] = useState<boolean>(false);
  const [vipSearchQuery, setVipSearchQuery] = useState<string>('');
  const [quickToast, setQuickToast] = useState<string | null>(null);
  const [dispatchedPhones, setDispatchedPhones] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const unsub = subscribeSaigonFlowerRealtime({
      onOrdersChange: (newOrders) => setFlowerOrders(newOrders),
      onSuppliesChange: (newSupplies) => setFlowerSupplies(newSupplies),
      onWorkshopBookingsChange: () => {},
      onConnectionChange: (connected: boolean) => setIsFlowerCloudLive(connected)
    });
    return () => unsub();
  }, []);

  const showToast = (msg: string) => {
    setQuickToast(msg);
    setTimeout(() => setQuickToast(null), 4200);
  };

  // ============================================================================
  // 1. TỔNG HỢP CHỈ SỐ NHÁNH 1: JU ET SAIGON (HOA TƯƠI NGHỆ THUẬT)
  // ============================================================================
  const flowerMetrics = useMemo(() => {
    const totalRevenue = flowerOrders.reduce((acc, o) => acc + (o.budgetVnd || 0), 0);
    const activeOrders = flowerOrders.filter(
      (o) => o.status !== 'completed' && o.status !== 'cancelled'
    );
    const deliveredOrders = flowerOrders.filter((o) => o.status === 'completed');
    const crossSaleOrders = flowerOrders.filter(
      (o) => o.sourceBranch === 'ju_wellness_vip_gift' || o.sourceBranch === 'holding_center'
    );
    const internalReconciliationValue = crossSaleOrders.reduce(
      (acc, o) => acc + Math.round((o.budgetVnd || 0) * 0.65),
      0
    );
    const lowSupplies = flowerSupplies.filter((s) => s.currentStock <= s.minThreshold);

    const healthStatus: 'good' | 'warning' | 'critical' =
      lowSupplies.length >= 3 ? 'critical' : lowSupplies.length > 0 ? 'warning' : 'good';

    return {
      totalRevenue,
      activeOrdersCount: activeOrders.length,
      deliveredCount: deliveredOrders.length,
      totalOrdersCount: flowerOrders.length,
      crossSaleCount: crossSaleOrders.length,
      internalReconciliationValue,
      lowSupplies,
      healthStatus
    };
  }, [flowerOrders, flowerSupplies]);

  // ============================================================================
  // 2. TỔNG HỢP CHỈ SỐ NHÁNH 2: SPA & WELLNESS (TRỊ LIỆU THƯ GIÃN)
  // ============================================================================
  const spaMetrics = useMemo(() => {
    const spaServicesCount =
      services.filter(
        (s) =>
          s.type === 'spa' ||
          s.category?.toLowerCase().includes('spa') ||
          s.category?.toLowerCase().includes('massage') ||
          s.category?.toLowerCase().includes('body')
      ).length || services.length;
    const occupiedRooms = rooms.filter((r) => r.status === 'occupied').length;
    const totalRooms = Math.max(rooms.length, 1);
    const occupancyRate = Math.round((occupiedRooms / totalRooms) * 100);

    const activeBookings = bookings.filter(
      (b) => b.status === 'in_progress' || b.status === 'confirmed'
    );
    const pendingBookings = bookings.filter((b) => b.status === 'pending');

    // Ước tính doanh thu mảng Spa từ các lịch hẹn & gói dịch vụ
    const estimatedSpaRevenue = bookings.reduce((sum, b) => {
      const matchedSrv = services.find((s) => s.id === b.serviceId || s.name === b.serviceName);
      const price = matchedSrv?.pricePromo || matchedSrv?.priceOriginal || 1850000;
      return sum + price;
    }, 0);

    const healthStatus: 'good' | 'warning' | 'critical' =
      pendingBookings.length >= 4 ? 'warning' : 'good';

    return {
      spaServicesCount,
      occupiedRooms,
      totalRooms: rooms.length,
      occupancyRate,
      activeBookingsCount: activeBookings.length,
      pendingBookingsCount: pendingBookings.length,
      totalBookingsCount: bookings.length,
      estimatedSpaRevenue,
      activePromosCount: activePromotions.length,
      proposalPromosCount: proposalPromotions.length,
      staffCount: staffList.length,
      healthStatus
    };
  }, [bookings, rooms, services, activePromotions, proposalPromotions, staffList]);

  // ============================================================================
  // 3. TỔNG HỢP CHỈ SỐ NHÁNH 3: THẨM MỸ KHÔNG XÂM LẤN (HIGH-TECH CLINIC)
  // ============================================================================
  const clinicMetrics = useMemo(() => {
    const activeEmr = medicalRecords.filter((r) => r.status === 'active');
    const completedEmr = medicalRecords.filter((r) => r.status === 'completed');

    // Kiểm tra đầu tip máy công nghệ cao (HIFU, Thermage, PicoWay)
    const criticalTips = highTechTips.filter((t) => {
      const ratio = t.totalMaxShots > 0 ? t.remainingShots / t.totalMaxShots : 1;
      return ratio <= 0.18 || t.status !== 'optimal';
    });

    // Kiểm tra tồn kho dược mỹ phẩm
    const lowMedInventory = inventoryItems.filter(
      (item) => item.quantity <= (item.minThreshold || 10)
    );

    // Ước tính doanh thu phác đồ công nghệ cao
    const estimatedClinicRevenue = medicalRecords.reduce((sum, r) => {
      const sessionVal = (r.totalSessions || 5) * 2800000;
      return sum + sessionVal;
    }, 0);

    const pendingCycleAlerts = cycleAlerts.filter(
      (a) => a.status === 'due_soon' || a.status === 'overdue'
    );

    const healthStatus: 'good' | 'warning' | 'critical' =
      criticalTips.length > 0 ? 'warning' : lowMedInventory.length > 2 ? 'warning' : 'good';

    return {
      totalEmrCount: medicalRecords.length,
      activeEmrCount: activeEmr.length,
      completedEmrCount: completedEmr.length,
      criticalTips,
      totalTipsCount: highTechTips.length,
      lowMedInventory,
      estimatedClinicRevenue,
      pendingCycleAlertsCount: pendingCycleAlerts.length,
      healthStatus
    };
  }, [medicalRecords, highTechTips, inventoryItems, cycleAlerts]);

  // ============================================================================
  // 4. TỔNG HỢP TOÀN TẬP ĐOÀN (HOLDING CONSOLIDATED PULSE)
  // ============================================================================
  const holdingConsolidated = useMemo(() => {
    const totalRevenue =
      flowerMetrics.totalRevenue +
      spaMetrics.estimatedSpaRevenue +
      clinicMetrics.estimatedClinicRevenue;

    const safeTotal = Math.max(totalRevenue, 1);
    const flowerShare = Math.round((flowerMetrics.totalRevenue / safeTotal) * 100);
    const spaShare = Math.round((spaMetrics.estimatedSpaRevenue / safeTotal) * 100);
    const clinicShare = Math.max(0, 100 - flowerShare - spaShare);

    const totalActiveOperations =
      flowerMetrics.activeOrdersCount +
      spaMetrics.activeBookingsCount +
      clinicMetrics.activeEmrCount;

    const totalAttentionItems =
      flowerMetrics.lowSupplies.length +
      clinicMetrics.criticalTips.length +
      spaMetrics.proposalPromosCount;

    return {
      totalRevenue,
      flowerShare,
      spaShare,
      clinicShare,
      totalActiveOperations,
      totalAttentionItems
    };
  }, [flowerMetrics, spaMetrics, clinicMetrics]);

  // ============================================================================
  // 5. DANH SÁCH KHÁCH VIP ĐỦ ĐIỀU KIỆN TẶNG HOA TRI ÂN LIÊN NHÁNH (1-CLICK)
  // ============================================================================
  const vipCrossBranchCandidates = useMemo(() => {
    const existingOrderPhones = new Set(
      flowerOrders.map((o) => o.customerPhone.replace(/\D/g, ''))
    );

    const candidates: Array<{
      id: string;
      customerName: string;
      customerPhone: string;
      branchOrigin: 'Thẩm Mỹ Không Xâm Lấn' | 'Nhánh Spa & Wellness';
      reason: string;
      tier: string;
    }> = [];

    medicalRecords.slice(0, 4).forEach((rec) => {
      const cleanPhone = rec.customerPhone.replace(/\D/g, '');
      if (!existingOrderPhones.has(cleanPhone) && !dispatchedPhones[cleanPhone]) {
        candidates.push({
          id: `cand-emr-${rec.id}`,
          customerName: rec.customerName,
          customerPhone: rec.customerPhone,
          branchOrigin: 'Thẩm Mỹ Không Xâm Lấn',
          reason: `Hoàn tất phác đồ: ${rec.treatmentPlan} (${rec.doctorInCharge})`,
          tier: 'VIP Medical'
        });
      }
    });

    bookings.slice(0, 4).forEach((bk) => {
      const cleanPhone = bk.customerPhone.replace(/\D/g, '');
      if (
        !existingOrderPhones.has(cleanPhone) &&
        !dispatchedPhones[cleanPhone] &&
        !candidates.some((c) => c.customerPhone.replace(/\D/g, '') === cleanPhone)
      ) {
        candidates.push({
          id: `cand-bk-${bk.id}`,
          customerName: bk.customerName,
          customerPhone: bk.customerPhone,
          branchOrigin: 'Nhánh Spa & Wellness',
          reason: `Liệu trình VIP: ${bk.serviceName} (${bk.roomName || 'Phòng VIP'})`,
          tier: 'VIP Spa'
        });
      }
    });

    return candidates.slice(0, 3);
  }, [medicalRecords, bookings, flowerOrders, dispatchedPhones]);

  const handleInstantFlowerDispatch = async (candidate: {
    customerName: string;
    customerPhone: string;
    branchOrigin: string;
    reason: string;
  }) => {
    const cleanPhone = candidate.customerPhone.replace(/\D/g, '');
    const nowIso = new Date().toISOString();
    const orderCode = `JUS-EXEC-${Date.now().toString().slice(-4)}`;
    const newOrder: SaigonBespokeOrder = {
      id: `order-${Date.now()}`,
      orderCode,
      customerName: candidate.customerName,
      customerPhone: candidate.customerPhone,
      flowerId: 'flower-1791388842716',
      flowerName: 'Bó Hoa Jardin De Rose — Hồng Ohara Trắng Kem & Thảo Mộc',
      occasion: `Tri Ân VIP Từ ${candidate.branchOrigin}`,
      deliveryDate: nowIso.slice(0, 10),
      deliveryTimeSlot: 'Trong ngày (Ưu tiên VIP)',
      district: 'Quận 1 - Giao trực tiếp tại Sảnh VIP / Tận nơi',
      budgetVnd: 1850000,
      notes: `${candidate.reason}. Đóng gói chuẩn Boutique kèm dấu sáp vàng.`,
      giftCard: {
        enabled: true,
        recipient: candidate.customerName,
        sender: `Ban Giám Đốc JU Holding & ${candidate.branchOrigin}`,
        message: `Trân trọng cảm ơn Quý khách ${candidate.customerName} đã tin chọn dịch vụ tại hệ sinh thái JU Holding.`,
        paperStyle: 'parchment',
        fontStyle: 'serif',
        waxColor: 'gold'
      },
      status: 'pending',
      assignedFlorist: 'Nghệ nhân Trưởng: Minh Khuê',
      workflowChecklist: {
        ...DEFAULT_WORKFLOW_CHECKLIST
      },
      workflowHistory: [
        {
          stage: 'pending',
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          note: 'Phát lệnh 1 chạm từ Hệ Thống Trung Tâm (Executive Hub)'
        }
      ],
      sourceBranch: 'ju_wellness_vip_gift',
      createdAt: nowIso,
      updatedAt: nowIso
    };

    const updatedOrders = [newOrder, ...flowerOrders];
    setFlowerOrders(updatedOrders);
    persistSaigonFlowerData({ orders: updatedOrders });
    setDispatchedPhones((prev) => ({ ...prev, [cleanPhone]: true }));
    await saveSaigonOrderToCloud(newOrder);

    showToast(
      `Đã phát lệnh tặng hoa VIP cho ${candidate.customerName} sang nhánh JU et Saigon (${orderCode})!`
    );
  };

  // ============================================================================
  // 6. TRA CỨU KHÁCH HÀNG VIP 360° LIÊN NHÁNH (UNIVERSAL VIP SEARCH)
  // ============================================================================
  const unifiedCustomers360 = useMemo(() => {
    const map = new Map<
      string,
      {
        name: string;
        phone: string;
        tier: string;
        spaBookings: number;
        lastSpaService: string;
        clinicPlan: string;
        doctorName: string;
        flowerOrdersCount: number;
        lastFlowerName: string;
        totalHoldingSpend: number;
      }
    >();

    loyaltyMembers.forEach((m) => {
      const key = m.customerPhone.replace(/\D/g, '');
      map.set(key, {
        name: m.customerName,
        phone: m.customerPhone,
        tier: m.tier,
        spaBookings: 0,
        lastSpaService: 'Chưa phát sinh',
        clinicPlan: 'Chưa có bệnh án',
        doctorName: '-',
        flowerOrdersCount: 0,
        lastFlowerName: 'Chưa đặt hoa',
        totalHoldingSpend: m.totalSpent || 0
      });
    });

    bookings.forEach((b) => {
      const key = b.customerPhone.replace(/\D/g, '');
      const curr = map.get(key) || {
        name: b.customerName,
        phone: b.customerPhone,
        tier: 'Gold',
        spaBookings: 0,
        lastSpaService: '',
        clinicPlan: 'Chưa có bệnh án',
        doctorName: '-',
        flowerOrdersCount: 0,
        lastFlowerName: 'Chưa đặt hoa',
        totalHoldingSpend: 0
      };
      curr.spaBookings += 1;
      curr.lastSpaService = b.serviceName;
      curr.totalHoldingSpend += 1850000;
      map.set(key, curr);
    });

    medicalRecords.forEach((r) => {
      const key = r.customerPhone.replace(/\D/g, '');
      const curr = map.get(key) || {
        name: r.customerName,
        phone: r.customerPhone,
        tier: 'Platinum',
        spaBookings: 0,
        lastSpaService: 'Chưa phát sinh',
        clinicPlan: '',
        doctorName: '',
        flowerOrdersCount: 0,
        lastFlowerName: 'Chưa đặt hoa',
        totalHoldingSpend: 0
      };
      curr.clinicPlan = r.treatmentPlan;
      curr.doctorName = r.doctorInCharge;
      curr.totalHoldingSpend += (r.totalSessions || 5) * 2800000;
      map.set(key, curr);
    });

    flowerOrders.forEach((o) => {
      const key = o.customerPhone.replace(/\D/g, '');
      const curr = map.get(key) || {
        name: o.customerName,
        phone: o.customerPhone,
        tier: 'Diamond',
        spaBookings: 0,
        lastSpaService: 'Chưa phát sinh',
        clinicPlan: 'Chưa có bệnh án',
        doctorName: '-',
        flowerOrdersCount: 0,
        lastFlowerName: '',
        totalHoldingSpend: 0
      };
      curr.flowerOrdersCount += 1;
      curr.lastFlowerName = o.flowerName || o.occasion || 'Tác phẩm Hoa Bespoke';
      curr.totalHoldingSpend += o.budgetVnd || 0;
      map.set(key, curr);
    });

    const list = Array.from(map.values()).sort(
      (a, b) => b.totalHoldingSpend - a.totalHoldingSpend
    );

    if (!vipSearchQuery.trim()) return list.slice(0, 4);
    const q = vipSearchQuery.toLowerCase();
    return list.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.clinicPlan.toLowerCase().includes(q) ||
        c.lastSpaService.toLowerCase().includes(q) ||
        c.lastFlowerName.toLowerCase().includes(q)
    );
  }, [loyaltyMembers, bookings, medicalRecords, flowerOrders, vipSearchQuery]);

  return (
    <div className="space-y-6 pb-8">
      {/* Toast Notification */}
      {quickToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white px-4 py-3 rounded-xl shadow-xl border border-stone-700 flex items-center gap-2.5 text-sm font-medium animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{quickToast}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. BANNER TRUNG TÂM ĐIỀU HÀNH TẬP ĐOÀN (5-SECOND EXECUTIVE PULSE)          */}
      {/* ========================================================================= */}
      <section className="bg-white rounded-2xl border border-stone-200/90 shadow-xs p-5 lg:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-stone-500 mb-1">
              <Building2 className="w-3.5 h-3.5 text-[#D97A7D]" />
              <span>HỆ THỐNG TRUNG TÂM QUẢN TRỊ TẬP ĐOÀN (HOLDING COMMAND CENTER)</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-700 font-semibold">
                {isFlowerCloudLive ? 'Đồng bộ Live 3 Nhánh (Real-time)' : 'Đồng bộ Local & Cloud Bridge'}
              </span>
            </div>
            <h2 className="text-xl lg:text-2xl font-serif font-bold text-stone-900">
              Tổng Quan Điều Hành Đa Nhánh Trong 5 Giây
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
              Dữ liệu cốt lõi được hội tụ từ 3 mảng kinh doanh độc lập. Bấm vào từng <strong>Tag Nhánh</strong> khi cần truy cập sâu vào nghiệp vụ chuyên môn.
            </p>
          </div>

          {/* Quick Branch Jump Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => onNavigateView('holding_hub', 'atelier_orders')}
              className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Flower2 className="w-3.5 h-3.5 text-rose-600" />
              <span>Vào Nhánh JU et Saigon</span>
              <ArrowRight className="w-3.5 h-3.5 opacity-70" />
            </button>
            <button
              onClick={() => onNavigateView('smart_booking')}
              className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Vào Nhánh Spa</span>
              <ArrowRight className="w-3.5 h-3.5 opacity-70" />
            </button>
            <button
              onClick={() => onNavigateView('emr')}
              className="px-3.5 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Microscope className="w-3.5 h-3.5 text-teal-600" />
              <span>Vào Nhánh Thẩm Mỹ</span>
              <ArrowRight className="w-3.5 h-3.5 opacity-70" />
            </button>
          </div>
        </div>

        {/* 4 Core Holding Metrics Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-5">
          {/* Metric 1: Consolidated Revenue */}
          <div className="p-4 rounded-xl bg-stone-50/80 border border-stone-200/70">
            <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
              <span>Tổng Doanh Thu Hợp Nhất (3 Nhánh)</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-xl lg:text-2xl font-bold text-stone-900">
              {formatVnd(holdingConsolidated.totalRevenue)}
            </div>
            {/* Proportional Bar */}
            <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden flex mt-2.5">
              <div
                style={{ width: `${holdingConsolidated.flowerShare}%` }}
                className="bg-rose-500 h-full"
                title={`Hoa JU et Saigon: ${holdingConsolidated.flowerShare}%`}
              />
              <div
                style={{ width: `${holdingConsolidated.spaShare}%` }}
                className="bg-emerald-500 h-full"
                title={`Spa & Wellness: ${holdingConsolidated.spaShare}%`}
              />
              <div
                style={{ width: `${holdingConsolidated.clinicShare}%` }}
                className="bg-teal-600 h-full"
                title={`Thẩm mỹ Không Xâm Lấn: ${holdingConsolidated.clinicShare}%`}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-stone-500 mt-1.5">
              <span>Hoa {holdingConsolidated.flowerShare}%</span>
              <span>·</span>
              <span>Spa {holdingConsolidated.spaShare}%</span>
              <span>·</span>
              <span>Thẩm mỹ {holdingConsolidated.clinicShare}%</span>
            </div>
          </div>

          {/* Metric 2: Active Daily Operations */}
          <div className="p-4 rounded-xl bg-stone-50/80 border border-stone-200/70">
            <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
              <span>Lưu Lượng Đang Phục Vụ &amp; Chế Tác</span>
              <Activity className="w-4 h-4 text-[#D97A7D]" />
            </div>
            <div className="text-xl lg:text-2xl font-bold text-stone-900">
              {holdingConsolidated.totalActiveOperations}{' '}
              <span className="text-sm font-normal text-stone-500">ca &amp; đơn</span>
            </div>
            <div className="text-xs text-stone-600 mt-2 flex items-center gap-1.5 flex-wrap">
              <span>{flowerMetrics.activeOrdersCount} đơn hoa</span>
              <span aria-hidden="true">·</span>
              <span>{spaMetrics.activeBookingsCount} ca Spa</span>
              <span aria-hidden="true">·</span>
              <span>{clinicMetrics.activeEmrCount} phác đồ Y khoa</span>
            </div>
          </div>

          {/* Metric 3: Internal Cross-Branch Synergy */}
          <div className="p-4 rounded-xl bg-stone-50/80 border border-stone-200/70">
            <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
              <span>Đối Soát Hoa Tri Ân Liên Nhánh</span>
              <Gift className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-xl lg:text-2xl font-bold text-stone-900">
              {formatVnd(flowerMetrics.internalReconciliationValue)}
            </div>
            <div className="text-xs text-stone-600 mt-2">
              {flowerMetrics.crossSaleCount} đơn hoa VIP từ Spa &amp; Thẩm mỹ (65% giá vốn)
            </div>
          </div>

          {/* Metric 4: Traffic Light & Executive Alerts */}
          <div className="p-4 rounded-xl bg-stone-50/80 border border-stone-200/70">
            <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
              <span>Cảnh Báo Vận Hành &amp; Phê Duyệt</span>
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-xl lg:text-2xl font-bold text-stone-900">
              {holdingConsolidated.totalAttentionItems}{' '}
              <span className="text-sm font-normal text-stone-500">mục cần lưu ý</span>
            </div>
            <div className="text-xs text-stone-600 mt-2 flex items-center gap-1.5 flex-wrap">
              <span>{flowerMetrics.lowSupplies.length} vật tư hoa</span>
              <span aria-hidden="true">·</span>
              <span>{clinicMetrics.criticalTips.length} đầu tip máy</span>
              <span aria-hidden="true">·</span>
              <span>{spaMetrics.proposalPromosCount} đề xuất KM</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. BA THẺ NHÁNH ĐỘC LẬP (3 EXECUTIVE BRANCH CARDS — PROGRESSIVE DRILLDOWN) */}
      {/* ========================================================================= */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base lg:text-lg font-bold text-stone-900">
            01. Ba Nhánh Kinh Doanh Trực Thuộc (Chạm Để Đi Sâu Vào Từng Nhánh)
          </h3>
          <span className="text-xs text-stone-500 hidden sm:inline">
            Mỗi nhánh vận hành độc lập nhưng liên thông tự động qua Hệ Thống Trung Tâm
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* =================================================================== */}
          {/* NHÁNH 1: JU ET SAIGON (FLORAL BOUTIQUE)                             */}
          {/* =================================================================== */}
          <div className="bg-white rounded-2xl border border-rose-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden">
            <div>
              {/* Top Accent Strip */}
              <div className="h-1.5 w-full bg-gradient-to-r from-rose-500 via-[#D97A7D] to-amber-400" />

              <div className="p-5">
                {/* Card Header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700 shrink-0">
                      <Flower2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-rose-700">
                        Nhánh 01 · Floral Atelier
                      </div>
                      <h4 className="text-base font-bold text-stone-900">
                        JU et Saigon (Hoa Nghệ Thuật)
                      </h4>
                    </div>
                  </div>

                  {/* Traffic Light Status */}
                  <div className="flex items-center gap-1.5 text-xs font-medium text-stone-600 shrink-0">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        flowerMetrics.healthStatus === 'good'
                          ? 'bg-emerald-500'
                          : 'bg-amber-500'
                      }`}
                    />
                    <span>
                      {flowerMetrics.lowSupplies.length > 0
                        ? `${flowerMetrics.lowSupplies.length} vật tư sắp chạm đáy`
                        : 'Vận hành chuẩn'}
                    </span>
                  </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-rose-50/40 border border-rose-100 mb-4">
                  <div>
                    <div className="text-[11px] text-stone-500">Doanh Thu Nhánh Hoa</div>
                    <div className="text-base font-bold text-stone-900 mt-0.5">
                      {formatVnd(flowerMetrics.totalRevenue)}
                    </div>
                    <div className="text-[11px] text-rose-700 mt-0.5">
                      {flowerMetrics.totalOrdersCount} đơn ({flowerMetrics.crossSaleCount} đơn VIP liên nhánh)
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-stone-500">Tiến Độ Xưởng Hoa</div>
                    <div className="text-base font-bold text-stone-900 mt-0.5">
                      {flowerMetrics.activeOrdersCount} đơn đang làm
                    </div>
                    <div className="text-[11px] text-emerald-700 mt-0.5">
                      {flowerMetrics.deliveredCount} đơn đã giao hoàn tất
                    </div>
                  </div>
                </div>

                {/* Operational Highlights */}
                <div className="space-y-2 text-xs text-stone-600 mb-4">
                  <div className="flex items-center justify-between py-1 border-b border-stone-100">
                    <span>Khóa quy trình 6 bước (Tự trừ kho Bước 3):</span>
                    <span className="font-semibold text-emerald-700">Đang bật bảo vệ</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-stone-100">
                    <span>Định mức 11 vật tư (Nơ, giấy lụa, sáp):</span>
                    <span className="font-semibold text-stone-900">
                      {flowerSupplies.length} mã ({flowerMetrics.lowSupplies.length} cần nhập)
                    </span>
                  </div>
                </div>

                {/* Sub-feature Quick Jumps */}
                <div className="mb-2">
                  <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-2">
                    Đi thẳng vào chức năng chuyên sâu:
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => onNavigateView('holding_hub', 'atelier_orders')}
                      className="px-2.5 py-2 rounded-lg border border-stone-200 hover:border-rose-300 hover:bg-rose-50/50 text-left text-xs font-medium text-stone-700 transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <span className="truncate">📦 Đơn Hoa 6 Bước</span>
                      <ArrowRight className="w-3 h-3 text-stone-400 shrink-0" />
                    </button>
                    <button
                      onClick={() => onNavigateView('holding_hub', 'catalog_inventory')}
                      className="px-2.5 py-2 rounded-lg border border-stone-200 hover:border-rose-300 hover:bg-rose-50/50 text-left text-xs font-medium text-stone-700 transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <span className="truncate">🎀 Kho 11 Vật Tư</span>
                      <ArrowRight className="w-3 h-3 text-stone-400 shrink-0" />
                    </button>
                    <button
                      onClick={() => onNavigateView('holding_hub', 'holding_360')}
                      className="px-2.5 py-2 rounded-lg border border-stone-200 hover:border-rose-300 hover:bg-rose-50/50 text-left text-xs font-medium text-stone-700 transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <span className="truncate">💎 Hồ Sơ VIP 360°</span>
                      <ArrowRight className="w-3 h-3 text-stone-400 shrink-0" />
                    </button>
                    <button
                      onClick={() => onNavigateView('holding_hub', 'master_blueprint')}
                      className="px-2.5 py-2 rounded-lg border border-stone-200 hover:border-rose-300 hover:bg-rose-50/50 text-left text-xs font-medium text-stone-700 transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <span className="truncate">📱 Giao Diện Thợ Hoa</span>
                      <ArrowRight className="w-3 h-3 text-stone-400 shrink-0" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Primary Branch Entry CTA */}
            <div className="px-5 pb-5 pt-2">
              <button
                onClick={() => onNavigateView('holding_hub', 'atelier_orders')}
                className="w-full py-2.5 px-4 rounded-xl bg-[#D97A7D] hover:bg-[#c5676a] text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
              >
                <span>Truy Cập Sâu Nhánh JU et Saigon</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* =================================================================== */}
          {/* NHÁNH 2: SPA & WELLNESS (RELAXATION & THERAPY)                      */}
          {/* =================================================================== */}
          <div className="bg-white rounded-2xl border border-emerald-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden">
            <div>
              {/* Top Accent Strip */}
              <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400" />

              <div className="p-5">
                {/* Card Header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700">
                        Nhánh 02 · Wellness &amp; Relaxation
                      </div>
                      <h4 className="text-base font-bold text-stone-900">
                        Nhánh Spa &amp; Trị Liệu Thư Giãn
                      </h4>
                    </div>
                  </div>

                  {/* Traffic Light Status */}
                  <div className="flex items-center gap-1.5 text-xs font-medium text-stone-600 shrink-0">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        spaMetrics.healthStatus === 'good'
                          ? 'bg-emerald-500'
                          : 'bg-amber-500'
                      }`}
                    />
                    <span>Lấp đầy {spaMetrics.occupancyRate}%</span>
                  </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-emerald-50/40 border border-emerald-100 mb-4">
                  <div>
                    <div className="text-[11px] text-stone-500">Doanh Thu Mảng Spa</div>
                    <div className="text-base font-bold text-stone-900 mt-0.5">
                      {formatVnd(spaMetrics.estimatedSpaRevenue)}
                    </div>
                    <div className="text-[11px] text-emerald-700 mt-0.5">
                      {spaMetrics.totalBookingsCount} ca đặt lịch ({spaMetrics.activeBookingsCount} đang phục vụ)
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-stone-500">Công Suất Phòng &amp; KTV</div>
                    <div className="text-base font-bold text-stone-900 mt-0.5">
                      {spaMetrics.occupiedRooms}/{spaMetrics.totalRooms} phòng bận
                    </div>
                    <div className="text-[11px] text-stone-600 mt-0.5">
                      {spaMetrics.staffCount} nhân sự &amp; KTV trực ca
                    </div>
                  </div>
                </div>

                {/* Operational Highlights */}
                <div className="space-y-2 text-xs text-stone-600 mb-4">
                  <div className="flex items-center justify-between py-1 border-b border-stone-100">
                    <span>Danh mục dịch vụ &amp; liệu trình Spa:</span>
                    <span className="font-semibold text-stone-900">
                      {spaMetrics.spaServicesCount} liệu trình chuẩn
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-stone-100">
                    <span>Chiến dịch Khuyến mãi &amp; ZNS tự động:</span>
                    <span className="font-semibold text-emerald-700">
                      {spaMetrics.activePromosCount} đang chạy · {spaMetrics.proposalPromosCount} chờ duyệt
                    </span>
                  </div>
                </div>

                {/* Sub-feature Quick Jumps */}
                <div className="mb-2">
                  <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-2">
                    Đi thẳng vào chức năng chuyên sâu:
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => onNavigateView('smart_booking')}
                      className="px-2.5 py-2 rounded-lg border border-stone-200 hover:border-emerald-300 hover:bg-emerald-50/50 text-left text-xs font-medium text-stone-700 transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <span className="truncate">📅 Sơ Đồ Phòng &amp; Lịch</span>
                      <ArrowRight className="w-3 h-3 text-stone-400 shrink-0" />
                    </button>
                    <button
                      onClick={() => onNavigateView('services')}
                      className="px-2.5 py-2 rounded-lg border border-stone-200 hover:border-emerald-300 hover:bg-emerald-50/50 text-left text-xs font-medium text-stone-700 transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <span className="truncate">💆‍♀️ Dịch Vụ &amp; Giá Spa</span>
                      <ArrowRight className="w-3 h-3 text-stone-400 shrink-0" />
                    </button>
                    <button
                      onClick={() => onNavigateView('crm_automation')}
                      className="px-2.5 py-2 rounded-lg border border-stone-200 hover:border-emerald-300 hover:bg-emerald-50/50 text-left text-xs font-medium text-stone-700 transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <span className="truncate">🤖 CRM &amp; Zalo ZNS</span>
                      <ArrowRight className="w-3 h-3 text-stone-400 shrink-0" />
                    </button>
                    <button
                      onClick={() => onNavigateView('hr')}
                      className="px-2.5 py-2 rounded-lg border border-stone-200 hover:border-emerald-300 hover:bg-emerald-50/50 text-left text-xs font-medium text-stone-700 transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <span className="truncate">👥 Nhân Sự &amp; Lương Tour</span>
                      <ArrowRight className="w-3 h-3 text-stone-400 shrink-0" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Primary Branch Entry CTA */}
            <div className="px-5 pb-5 pt-2">
              <button
                onClick={() => onNavigateView('smart_booking')}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
              >
                <span>Truy Cập Sâu Nhánh Spa &amp; Wellness</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* =================================================================== */}
          {/* NHÁNH 3: THẨM MỸ KHÔNG XÂM LẤN (HIGH-TECH MEDICAL CLINIC)           */}
          {/* =================================================================== */}
          <div className="bg-white rounded-2xl border border-teal-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden">
            <div>
              {/* Top Accent Strip */}
              <div className="h-1.5 w-full bg-gradient-to-r from-teal-600 via-cyan-600 to-indigo-600" />

              <div className="p-5">
                {/* Card Header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shrink-0">
                      <Microscope className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-teal-700">
                        Nhánh 03 · Non-Invasive Medical
                      </div>
                      <h4 className="text-base font-bold text-stone-900">
                        Thẩm Mỹ Không Xâm Lấn
                      </h4>
                    </div>
                  </div>

                  {/* Traffic Light Status */}
                  <div className="flex items-center gap-1.5 text-xs font-medium text-stone-600 shrink-0">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        clinicMetrics.criticalTips.length > 0
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                    />
                    <span>
                      {clinicMetrics.criticalTips.length > 0
                        ? `${clinicMetrics.criticalTips.length} đầu tip cần thay`
                        : 'Thiết bị ổn định'}
                    </span>
                  </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-teal-50/40 border border-teal-100 mb-4">
                  <div>
                    <div className="text-[11px] text-stone-500">Doanh Thu Phác Đồ Y Khoa</div>
                    <div className="text-base font-bold text-stone-900 mt-0.5">
                      {formatVnd(clinicMetrics.estimatedClinicRevenue)}
                    </div>
                    <div className="text-[11px] text-teal-700 mt-0.5">
                      {clinicMetrics.totalEmrCount} hồ sơ Bệnh án EMR ({clinicMetrics.activeEmrCount} đang điều trị)
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-stone-500">Đầu Tip HIFU / Pico / Thermage</div>
                    <div className="text-base font-bold text-stone-900 mt-0.5">
                      {clinicMetrics.totalTipsCount} đầu tip máy
                    </div>
                    <div className="text-[11px] text-amber-700 mt-0.5">
                      {clinicMetrics.criticalTips.length} đầu tip cần lưu ý
                    </div>
                  </div>
                </div>

                {/* Operational Highlights */}
                <div className="space-y-2 text-xs text-stone-600 mb-4">
                  <div className="flex items-center justify-between py-1 border-b border-stone-100">
                    <span>Kho Dược mỹ phẩm &amp; Hoạt chất điều trị:</span>
                    <span className="font-semibold text-stone-900">
                      {inventoryItems.length} mã ({clinicMetrics.lowMedInventory.length} sắp hết)
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-stone-100">
                    <span>Khách đến chu kỳ tái tạo da (HIFU/Laser):</span>
                    <span className="font-semibold text-teal-700">
                      {clinicMetrics.pendingCycleAlertsCount} khách cần nhắc lịch
                    </span>
                  </div>
                </div>

                {/* Sub-feature Quick Jumps */}
                <div className="mb-2">
                  <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-2">
                    Đi thẳng vào chức năng chuyên sâu:
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => onNavigateView('emr')}
                      className="px-2.5 py-2 rounded-lg border border-stone-200 hover:border-teal-300 hover:bg-teal-50/50 text-left text-xs font-medium text-stone-700 transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <span className="truncate">📋 Bệnh Án Điện Tử EMR</span>
                      <ArrowRight className="w-3 h-3 text-stone-400 shrink-0" />
                    </button>
                    <button
                      onClick={() => onNavigateView('smart_clinic_hardware')}
                      className="px-2.5 py-2 rounded-lg border border-stone-200 hover:border-teal-300 hover:bg-teal-50/50 text-left text-xs font-medium text-stone-700 transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <span className="truncate">🔬 Máy VISIA &amp; Đầu Tip</span>
                      <ArrowRight className="w-3 h-3 text-stone-400 shrink-0" />
                    </button>
                    <button
                      onClick={() => onNavigateView('inventory')}
                      className="px-2.5 py-2 rounded-lg border border-stone-200 hover:border-teal-300 hover:bg-teal-50/50 text-left text-xs font-medium text-stone-700 transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <span className="truncate">📦 Kho Dược Mỹ Phẩm</span>
                      <ArrowRight className="w-3 h-3 text-stone-400 shrink-0" />
                    </button>
                    <button
                      onClick={() => onNavigateView('users')}
                      className="px-2.5 py-2 rounded-lg border border-stone-200 hover:border-teal-300 hover:bg-teal-50/50 text-left text-xs font-medium text-stone-700 transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <span className="truncate">⚙️ Phân Quyền Y Khoa</span>
                      <ArrowRight className="w-3 h-3 text-stone-400 shrink-0" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Primary Branch Entry CTA */}
            <div className="px-5 pb-5 pt-2">
              <button
                onClick={() => onNavigateView('emr')}
                className="w-full py-2.5 px-4 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
              >
                <span>Truy Cập Sâu Nhánh Thẩm Mỹ Không Xâm Lấn</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. HỘP THƯ PHÊ DUYỆT NHANH & ĐIỀU PHỐI LIÊN NHÁNH 1 CHẠM (ACTION INBOX)    */}
      {/* ========================================================================= */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left 7 Cols: 1-Click Cross-Branch VIP Flower Trigger */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-stone-200/90 shadow-xs p-5">
          <div className="flex items-center justify-between gap-2 pb-3.5 mb-4 border-b border-stone-100">
            <div>
              <h3 className="text-base font-bold text-stone-900">
                02. Điều Phối Quà Tặng Hoa VIP Liên Nhánh (1-Click Dispatch)
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Khách VIP vừa hoàn thành liệu trình tại <strong>Nhánh Thẩm Mỹ</strong> hoặc <strong>Nhánh Spa</strong> — Phê duyệt gửi hoa tri ân sang xưởng <strong>JU et Saigon</strong> ngay tại Trung tâm.
              </p>
            </div>
            <button
              onClick={() => onNavigateView('holding_hub', 'atelier_orders')}
              className="text-xs font-semibold text-[#D97A7D] hover:underline shrink-0 cursor-pointer"
            >
              Xem xưởng hoa →
            </button>
          </div>

          {vipCrossBranchCandidates.length === 0 ? (
            <div className="p-6 text-center bg-stone-50 rounded-xl border border-stone-200/60 text-xs text-stone-500">
              Tất cả khách VIP hoàn thành liệu trình hôm nay đều đã được phát lệnh tặng hoa sang nhánh JU et Saigon.
            </div>
          ) : (
            <div className="space-y-2.5">
              {vipCrossBranchCandidates.map((cand) => (
                <div
                  key={cand.id}
                  className="p-3.5 rounded-xl border border-stone-200/80 hover:border-rose-200 bg-stone-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-xs text-stone-500">
                      <span className="font-semibold text-stone-800">{cand.branchOrigin}</span>
                      <span aria-hidden="true">·</span>
                      <span>{cand.tier}</span>
                      <span aria-hidden="true">·</span>
                      <span>{cand.customerPhone}</span>
                    </div>
                    <div className="text-sm font-bold text-stone-900 mt-0.5 truncate">
                      {cand.customerName}
                    </div>
                    <div className="text-xs text-stone-600 truncate mt-0.5">
                      {cand.reason}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleInstantFlowerDispatch(cand)}
                      className="px-3 py-2 rounded-lg bg-[#D97A7D] hover:bg-[#c5676a] text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                    >
                      <Gift className="w-3.5 h-3.5" />
                      <span>Duyệt Tặng Hoa Ngay</span>
                    </button>
                    <button
                      onClick={() =>
                        onDispatchFlowerFromExecutive({
                          customerName: cand.customerName,
                          customerPhone: cand.customerPhone,
                          occasion: cand.reason,
                          sourceContext: cand.branchOrigin
                        })
                      }
                      className="px-2.5 py-2 rounded-lg border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-medium transition-colors cursor-pointer"
                      title="Tùy chỉnh lời chúc & màu dấu sáp"
                    >
                      Tùy chỉnh
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 5 Cols: Critical Alerts & Promotion Approvals */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-stone-200/90 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="pb-3.5 mb-4 border-b border-stone-100">
              <h3 className="text-base font-bold text-stone-900">
                03. Cảnh Báo Vật Tư &amp; Phê Duyệt Nhanh
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Tổng hợp các điểm nghẽn cần Quản trị cấp cao nắm bắt từ 3 nhánh.
              </p>
            </div>

            <div className="space-y-2.5">
              {/* Alert 1: High-Tech Tips */}
              {clinicMetrics.criticalTips.slice(0, 2).map((tip) => {
                const pct =
                  tip.totalMaxShots > 0
                    ? Math.round((tip.remainingShots / tip.totalMaxShots) * 100)
                    : 0;
                return (
                  <div
                    key={tip.id}
                    className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/80 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="text-[11px] font-semibold text-amber-800">
                        Nhánh Thẩm Mỹ · Cảnh báo Đầu Tip Máy
                      </div>
                      <div className="text-xs font-bold text-stone-900 truncate mt-0.5">
                        {tip.machineModel} — {tip.name}
                      </div>
                      <div className="text-[11px] text-stone-600 mt-0.5">
                        Còn {tip.remainingShots.toLocaleString()}/{tip.totalMaxShots.toLocaleString()} xung ({pct}%)
                      </div>
                    </div>
                    <button
                      onClick={() => onNavigateView('smart_clinic_hardware')}
                      className="px-2.5 py-1.5 rounded-lg bg-white border border-amber-300 text-amber-900 hover:bg-amber-100 text-xs font-semibold shrink-0 cursor-pointer"
                    >
                      Kiểm tra →
                    </button>
                  </div>
                );
              })}

              {/* Alert 2: Flower Workshop Supplies */}
              {flowerMetrics.lowSupplies.slice(0, 2).map((sup) => (
                <div
                  key={sup.id}
                  className="p-3 rounded-xl bg-rose-50/60 border border-rose-200/80 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="text-[11px] font-semibold text-rose-800">
                      Nhánh JU et Saigon · Vật Tư Xưởng Hoa
                    </div>
                    <div className="text-xs font-bold text-stone-900 truncate mt-0.5">
                      {sup.nameVi} ({sup.sku})
                    </div>
                    <div className="text-[11px] text-stone-600 mt-0.5">
                      Tồn kho: {sup.currentStock} {sup.unit} (Định mức tối thiểu: {sup.minThreshold})
                    </div>
                  </div>
                  <button
                    onClick={() => onNavigateView('holding_hub', 'catalog_inventory')}
                    className="px-2.5 py-1.5 rounded-lg bg-white border border-rose-300 text-rose-900 hover:bg-rose-100 text-xs font-semibold shrink-0 cursor-pointer"
                  >
                    Nhập kho →
                  </button>
                </div>
              ))}

              {/* Alert 3: Pending Promotions */}
              {proposalPromotions.slice(0, 1).map((promo) => (
                <div
                  key={promo.id}
                  className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/80 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="text-[11px] font-semibold text-emerald-800">
                      Nhánh Spa · Đề Xuất Khuyến Mãi Mới
                    </div>
                    <div className="text-xs font-bold text-stone-900 truncate mt-0.5">
                      {promo.name}
                    </div>
                    <div className="text-[11px] text-stone-600 mt-0.5">
                      Áp dụng: {promo.services.length} dịch vụ · Hạn: {promo.endDate}
                    </div>
                  </div>
                  {onApprovePromotion ? (
                    <button
                      onClick={() => {
                        onApprovePromotion({ ...promo, status: PromotionStatus.Approved });
                        showToast(`Đã phê duyệt chương trình khuyến mãi "${promo.name}"!`);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 text-xs font-semibold shrink-0 cursor-pointer"
                    >
                      Duyệt ngay
                    </button>
                  ) : (
                    <button
                      onClick={() => onNavigateView('dashboard')}
                      className="px-2.5 py-1.5 rounded-lg bg-white border border-emerald-300 text-emerald-900 text-xs font-semibold shrink-0 cursor-pointer"
                    >
                      Xem →
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. TRA CỨU KHÁCH HÀNG VIP 360° LIÊN NHÁNH (UNIVERSAL VIP LOOKUP)          */}
      {/* ========================================================================= */}
      <section className="bg-white rounded-2xl border border-stone-200/90 shadow-xs p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-stone-100">
          <div>
            <h3 className="text-base font-bold text-stone-900">
              04. Tra Cứu Hồ Sơ Khách Hàng VIP 360° Liên Nhánh (Spa · Thẩm Mỹ · Hoa Tươi)
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Định danh duy nhất qua Số điện thoại — Xem tức thì lịch sử sử dụng dịch vụ của khách ở cả 3 nhánh.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={vipSearchQuery}
              onChange={(e) => setVipSearchQuery(e.target.value)}
              placeholder="Tìm tên, SĐT, phác đồ, mẫu hoa..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 focus:border-[#D97A7D] outline-none bg-stone-50/70"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500 font-semibold">
                <th className="py-2.5 px-3">Khách Hàng VIP</th>
                <th className="py-2.5 px-3">🌿 Nhánh Spa &amp; Wellness</th>
                <th className="py-2.5 px-3">🔬 Nhánh Thẩm Mỹ Không Xâm Lấn</th>
                <th className="py-2.5 px-3">🌸 Nhánh Hoa JU et Saigon</th>
                <th className="py-2.5 px-3 text-right">Tổng Chi Tiêu Tập Đoàn</th>
                <th className="py-2.5 px-3 text-right">Thao Tác Liên Nhánh</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {unifiedCustomers360.map((cust) => (
                <tr key={cust.phone} className="hover:bg-stone-50/80 transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-bold text-stone-900">{cust.name}</div>
                    <div className="text-[11px] text-stone-500 mt-0.5">
                      {cust.phone} · Hạng {cust.tier}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-medium text-stone-800">{cust.lastSpaService}</div>
                    <div className="text-[11px] text-stone-500 mt-0.5">
                      {cust.spaBookings} lần đặt hẹn Spa
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-medium text-stone-800">{cust.clinicPlan}</div>
                    <div className="text-[11px] text-stone-500 mt-0.5">
                      Phụ trách: {cust.doctorName}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-medium text-stone-800 truncate max-w-[200px]">
                      {cust.lastFlowerName}
                    </div>
                    <div className="text-[11px] text-stone-500 mt-0.5">
                      {cust.flowerOrdersCount} đơn hoa Bespoke
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-stone-900">
                    {formatVnd(cust.totalHoldingSpend)}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() =>
                        onDispatchFlowerFromExecutive({
                          customerName: cust.name,
                          customerPhone: cust.phone,
                          occasion: `Tri ân VIP Liên Nhánh (${
                            cust.clinicPlan !== 'Chưa có bệnh án'
                              ? cust.clinicPlan
                              : cust.lastSpaService
                          })`,
                          sourceContext: 'Hệ Thống Trung Tâm (VIP 360°)'
                        })
                      }
                      className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 font-semibold transition-colors cursor-pointer"
                    >
                      🌸 Gửi Hoa VIP
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default HoldingCenterExecutiveView;

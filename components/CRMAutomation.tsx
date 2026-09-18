import React, { useState, useMemo } from 'react';
import {
  AutomatedMessage,
  TreatmentCycleAlert,
  AiChatMessage,
  Booking,
  MarketingLead,
  DripCampaign,
  PostTreatmentCareTicket,
  ChurnRiskCustomer,
  LoyaltyMember,
  ReferralRecord
} from '../types';
import {
  Bot,
  Send,
  Star,
  CheckCircle2,
  Clock,
  Calendar,
  Flame,
  Zap,
  TrendingUp,
  Target,
  ShieldAlert,
  Award,
  Gift,
  Share2,
  PhoneCall,
  Sparkles,
  UserPlus,
  Filter,
  Search,
  AlertTriangle,
  Stethoscope,
  HeartPulse,
  Check,
  UserCheck
} from 'lucide-react';
import Modal from './shared/Modal';

interface CRMAutomationProps {
  automatedMsgs: AutomatedMessage[];
  cycleAlerts: TreatmentCycleAlert[];
  chatMessages: AiChatMessage[];
  bookings?: Booking[];
  marketingLeads?: MarketingLead[];
  dripCampaigns?: DripCampaign[];
  postTreatmentTickets?: PostTreatmentCareTicket[];
  churnCustomers?: ChurnRiskCustomer[];
  loyaltyMembers?: LoyaltyMember[];
  referralRecords?: ReferralRecord[];
  onSendMessage: (msg: AutomatedMessage) => void;
  onSendChatReply: (userText: string) => void;
  onTriggerCycleReminder: (alert: TreatmentCycleAlert) => void;
  onUpdateLead?: (lead: MarketingLead) => void;
  onAddLead?: (lead: MarketingLead) => void;
  onUpdateDripCampaign?: (campaign: DripCampaign) => void;
  onUpdatePostTreatmentTicket?: (ticket: PostTreatmentCareTicket) => void;
  onUpdateChurnCustomer?: (customer: ChurnRiskCustomer) => void;
  onUpdateLoyaltyMember?: (member: LoyaltyMember) => void;
  onAddReferral?: (referral: ReferralRecord) => void;
  onCreateBookingFromLanding?: (booking: Partial<Booking>) => void;
}

type MainTab = 'marketing_leads' | 'drip_campaigns' | 'treatment_care' | 'churn_prevention' | 'loyalty_referral' | 'ai_advisor';

const CRMAutomation: React.FC<CRMAutomationProps> = ({
  automatedMsgs,
  cycleAlerts,
  chatMessages,
  bookings = [],
  marketingLeads = [],
  dripCampaigns = [],
  postTreatmentTickets = [],
  churnCustomers = [],
  loyaltyMembers = [],
  referralRecords = [],
  onSendMessage,
  onSendChatReply,
  onTriggerCycleReminder,
  onUpdateLead,
  onAddLead,
  onUpdatePostTreatmentTicket,
  onUpdateChurnCustomer,
  onUpdateLoyaltyMember,
  onAddReferral,
  onCreateBookingFromLanding
}) => {
  const [activeTab, setActiveTab] = useState<MainTab>('marketing_leads');
  const [leadFilter, setLeadFilter] = useState<'all' | 'Hot' | 'Warm' | 'Cold'>('all');
  const [leadSearch, setLeadSearch] = useState('');
  const [selectedLead, setSelectedLead] = useState<MarketingLead | null>(null);

  // New manual message modal state
  const [isNewCampaignModalOpen, setIsNewCampaignModalOpen] = useState(false);
  const [campType, setCampType] = useState<AutomatedMessage['type']>('reminder_24h');
  const [campCustName, setCampCustName] = useState('');
  const [campCustPhone, setCampCustPhone] = useState('');
  const [campChannel, setCampChannel] = useState<'Zalo ZNS' | 'SMS Brandname'>('Zalo ZNS');
  const [campContent, setCampContent] = useState('');

  // Landing Page Instant Booking Form State
  const [landingName, setLandingName] = useState('');
  const [landingPhone, setLandingPhone] = useState('');
  const [landingService, setLandingService] = useState('Laser PicoWay Trị Nám Chân Sâu');
  const [landingDate, setLandingDate] = useState('2026-09-20');
  const [landingTime, setLandingTime] = useState('14:00');
  const [landingSubmitted, setLandingSubmitted] = useState(false);

  // Drip Campaign simulation modal
  const [selectedDripStep, setSelectedDripStep] = useState<{
    campaign: DripCampaign;
    stepIndex: number;
  } | null>(null);

  // Referral creation modal state
  const [isNewReferralModalOpen, setIsNewReferralModalOpen] = useState(false);
  const [refReferrerCode, setRefReferrerCode] = useState('');
  const [refRefereeName, setRefRefereeName] = useState('');
  const [refRefereePhone, setRefRefereePhone] = useState('');
  const [refService, setRefService] = useState('Nâng Cơ Xóa Nhăn HIFU MPT');

  // Chat input & typing simulation state
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return marketingLeads.filter(l => {
      const matchTier = leadFilter === 'all' || l.tier === leadFilter;
      const matchSearch =
        l.name.toLowerCase().includes(leadSearch.toLowerCase()) ||
        l.phone.includes(leadSearch) ||
        l.interestService.toLowerCase().includes(leadSearch.toLowerCase());
      return matchTier && matchSearch;
    });
  }, [marketingLeads, leadFilter, leadSearch]);

  // Lead metrics
  const hotLeadsCount = useMemo(() => marketingLeads.filter(l => l.tier === 'Hot').length, [marketingLeads]);
  const warmLeadsCount = useMemo(() => marketingLeads.filter(l => l.tier === 'Warm').length, [marketingLeads]);
  const coldLeadsCount = useMemo(() => marketingLeads.filter(l => l.tier === 'Cold').length, [marketingLeads]);

  // Handle Telesales Call simulation
  const handleCallHotLead = (lead: MarketingLead) => {
    if (!onUpdateLead) return;
    const updated: MarketingLead = {
      ...lead,
      status: 'hot_called',
      lastInteraction: 'Vừa gọi tư vấn nóng'
    };
    onUpdateLead(updated);
    alert(`Đang kết nối Hotline tư vấn đến ${lead.name} (${lead.phone}). Đã cập nhật trạng thái "Đã Gọi Nóng"!`);
  };

  // Handle Instant Booking from Lead
  const handleConvertLeadToBooking = (lead: MarketingLead) => {
    if (!onCreateBookingFromLanding || !onUpdateLead) return;
    onCreateBookingFromLanding({
      customerName: lead.name,
      customerPhone: lead.phone,
      serviceName: lead.interestService,
      notes: `Chốt lịch từ Lead Scoring (${lead.tier} - ${lead.score} điểm, nguồn ${lead.source})`
    });
    const updated: MarketingLead = {
      ...lead,
      status: 'booked'
    };
    onUpdateLead(updated);
    alert(`Đã chốt lịch hẹn thành công cho ${lead.name} vào hệ thống Smart Booking & EMR!`);
  };

  // Submit Landing Page Booking Form
  const handleLandingBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!landingName.trim() || !landingPhone.trim()) {
      alert('Vui lòng điền đầy đủ họ tên và số điện thoại!');
      return;
    }
    if (onCreateBookingFromLanding) {
      onCreateBookingFromLanding({
        customerName: landingName.trim(),
        customerPhone: landingPhone.trim(),
        serviceName: landingService,
        date: landingDate,
        time: landingTime,
        channel: 'web',
        notes: 'Khách hàng đăng ký qua Landing Page Khuyến Mãi (Tặng Voucher 500k)'
      });
    }

    if (onAddLead) {
      const newLead: MarketingLead = {
        id: `lead-${Date.now()}`,
        name: landingName.trim(),
        phone: landingPhone.trim(),
        source: 'Website Landing',
        interestService: landingService,
        score: 85,
        tier: 'Hot',
        status: 'new',
        assignedSales: 'Phạm Minh Anh',
        lastInteraction: 'Vừa đăng ký qua Landing Page',
        behaviorLogs: [
          { action: 'Điền form đặt hẹn trên Landing Page Khuyến Mãi', points: 40, timestamp: 'Vừa xong' },
          { action: 'Đã nhận E-Voucher 500.000đ ưu đãi buổi đầu', points: 45, timestamp: 'Vừa xong' }
        ]
      };
      onAddLead(newLead);
    }

    setLandingSubmitted(true);
    setTimeout(() => {
      setLandingSubmitted(false);
      setLandingName('');
      setLandingPhone('');
    }, 3500);
  };

  // Quick preset templates for Zalo ZNS
  const handleSelectTemplate = (type: AutomatedMessage['type']) => {
    setCampType(type);
    if (type === 'reminder_24h') {
      setCampContent('[WELLNESS CLINIC] Xin chào quý khách, nhắc lịch hẹn chăm sóc da công nghệ cao vào ngày mai lúc 10:00 tại Wellness Clinic. KTV Trưởng sẽ đón tiếp quý khách. Vui lòng phản hồi tin nhắn này nếu cần đổi lịch ạ.');
    } else if (type === 'csat_survey') {
      setCampContent('[WELLNESS CLINIC] Cảm ơn quý khách đã trải nghiệm dịch vụ hôm nay! Để nâng cao chất lượng dịch vụ, quý khách vui lòng dành 30 giây đánh giá độ hài lòng qua link: https://wellness.vn/csat-khao-sat');
    } else if (type === 'treatment_cycle') {
      setCampContent('[WELLNESS CLINIC] Đã đến chu kỳ tái khám phác đồ theo chỉ định của Bác sĩ Da liễu (đủ 4 tuần sau buổi Laser). Kính mời quý khách đặt lịch buổi tiếp theo để duy trì hiệu quả tối ưu.');
    }
  };

  const handleSendManualMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!campCustName.trim() || !campCustPhone.trim() || !campContent.trim()) {
      alert('Vui lòng điền đủ tên, số điện thoại và nội dung tin nhắn!');
      return;
    }

    const newMsg: AutomatedMessage = {
      id: `msg-${Date.now()}`,
      type: campType,
      customerName: campCustName.trim(),
      customerPhone: campCustPhone.trim(),
      channel: campChannel,
      content: campContent.trim(),
      scheduledTime: new Date().toISOString().replace('T', ' ').slice(0, 16),
      status: 'delivered',
      sentAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };

    onSendMessage(newMsg);
    setIsNewCampaignModalOpen(false);
    alert(`Đã gửi tin nhắn ${campChannel} đến khách hàng ${campCustName} thành công!`);
  };

  const handleSendChat = (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const text = customText || chatInput;
    if (!text.trim()) return;
    setIsTyping(true);
    onSendChatReply(text.trim());
    setChatInput('');
    setTimeout(() => {
      setIsTyping(false);
    }, 600);
  };

  // Handle Churn Winback Action
  const handleTriggerChurnWinback = (customer: ChurnRiskCustomer) => {
    if (!onUpdateChurnCustomer) return;
    const znsMsg: AutomatedMessage = {
      id: `winback-${Date.now()}`,
      type: 'reminder_24h',
      customerName: customer.customerName,
      customerPhone: customer.customerPhone,
      channel: 'Zalo ZNS',
      content: `[WELLNESS CLINIC] Chúng tôi nhớ bạn! Đã hơn ${customer.daysInactive} ngày bạn chưa ghé thăm lại. Wellness tặng riêng bạn mã ${customer.winbackVoucherCode}: ${customer.winbackVoucherValue}. Đặt lịch tuần này để nhận đặc quyền nhé!`,
      scheduledTime: new Date().toISOString().replace('T', ' ').slice(0, 16),
      status: 'delivered',
      sentAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };
    onSendMessage(znsMsg);

    const updated: ChurnRiskCustomer = {
      ...customer,
      status: 'voucher_sent',
      cskhNotes: 'Đã gửi mã Win-back ưu đãi qua Zalo ZNS tự động.'
    };
    onUpdateChurnCustomer(updated);
    alert(`Đã gửi voucher Win-back ZNS thành công đến ${customer.customerName}!`);
  };

  // Handle Doctor note or skin status mark
  const handleResolveSkinReaction = (ticket: PostTreatmentCareTicket) => {
    if (!onUpdatePostTreatmentTicket) return;
    const updated: PostTreatmentCareTicket = {
      ...ticket,
      skinStatus: 'normal_calm',
      doctorNote: 'Bác sĩ đã kê serum phục hồi B5 + Kẽm, bệnh nhân báo da hết ửng đỏ sau 4 giờ.'
    };
    onUpdatePostTreatmentTicket(updated);
    alert(`Đã cập nhật tình trạng phục hồi cho bệnh nhân ${ticket.customerName}!`);
  };

  // Handle Birthday gift trigger
  const handleSendBirthdayGift = (member: LoyaltyMember) => {
    if (!onUpdateLoyaltyMember) return;
    const updated: LoyaltyMember = {
      ...member,
      points: member.points + 500
    };
    onUpdateLoyaltyMember(updated);
    const znsMsg: AutomatedMessage = {
      id: `bday-${Date.now()}`,
      type: 'reminder_24h',
      customerName: member.customerName,
      customerPhone: member.customerPhone,
      channel: 'Zalo ZNS',
      content: `[WELLNESS CLINIC] Chúc mừng sinh nhật quý khách ${member.customerName}! Wellness thân gửi tặng 500 điểm tích lũy và voucher VIP giảm 30% dịch vụ trẻ hóa da trong tháng sinh nhật!`,
      scheduledTime: new Date().toISOString().replace('T', ' ').slice(0, 16),
      status: 'delivered',
      sentAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };
    onSendMessage(znsMsg);
    alert(`Đã cộng 500 điểm và gửi thiệp chúc mừng sinh nhật ZNS đến ${member.customerName}!`);
  };

  // Create new Referral
  const handleCreateReferral = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refReferrerCode || !refRefereeName || !refRefereePhone) {
      alert('Vui lòng điền đủ thông tin người giới thiệu và bạn mới!');
      return;
    }
    const referrer = loyaltyMembers.find(m => m.referralCode === refReferrerCode);
    if (!referrer) {
      alert('Mã giới thiệu không tồn tại trong hệ thống!');
      return;
    }

    const newRecord: ReferralRecord = {
      id: `ref-${Date.now()}`,
      referrerName: referrer.customerName,
      referrerCode: referrer.referralCode,
      refereeName: refRefereeName.trim(),
      refereePhone: refRefereePhone.trim(),
      serviceUsed: refService,
      date: new Date().toISOString().slice(0, 10),
      rewardValue: 500000,
      refereeDiscount: 300000,
      status: 'pending'
    };

    if (onAddReferral) {
      onAddReferral(newRecord);
    }
    setIsNewReferralModalOpen(false);
    setRefRefereeName('');
    setRefRefereePhone('');
    alert(`Ghi nhận giới thiệu thành công! Người giới thiệu ${referrer.customerName} sẽ nhận 500.000đ khi bạn mới trải nghiệm.`);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#693B4E] via-[#8B4F58] to-[#D97A7D] text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 tracking-wide uppercase">
              Clinic CRM &amp; Marketing Automation
            </span>
            <span className="text-xs bg-emerald-400/20 text-emerald-200 px-2 py-0.5 rounded border border-emerald-400/30 flex items-center gap-1">
              <Bot className="w-3.5 h-3.5" /> Customer Lifecycle &amp; AI Lead Scoring
            </span>
          </div>
          <h2 className="text-2xl font-bold mt-1 tracking-tight">Hệ Thống Tự Động Hóa Vận Hành Vòng Đời Khách Hàng</h2>
          <p className="text-white/80 text-sm mt-1 max-w-3xl">
            Tối ưu CPA và tăng giá trị trọn đời (LTV) cho thẩm mỹ viện công nghệ cao: Chấm điểm Lead, chuỗi nuôi dưỡng Drip Campaigns, cẩm nang Home-care hậu điều trị, chống rời bỏ và chương trình Khách hàng thân thiết.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right hidden sm:block text-xs text-white/80">
            <div>Đã đồng bộ <strong>{bookings.length}</strong> lịch hẹn</div>
            <div><strong>{automatedMsgs.length}</strong> tin ZNS trong hàng đợi</div>
          </div>
          <button
            onClick={() => {
              setCampCustName('');
              setCampCustPhone('');
              handleSelectTemplate('reminder_24h');
              setIsNewCampaignModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-white text-[#693B4E] hover:bg-rose-50 font-bold rounded-xl shadow text-xs transition-all duration-200 cursor-pointer whitespace-nowrap"
          >
            <Send className="w-4 h-4 text-[#D97A7D]" />
            Gửi Tin ZNS / SMS
          </button>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
        <button
          onClick={() => setActiveTab('marketing_leads')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'marketing_leads'
              ? 'bg-[#D97A7D] text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Target className="w-4 h-4" />
          Phễu Chuyển Đổi &amp; Lead Scoring ({marketingLeads.length})
        </button>

        <button
          onClick={() => setActiveTab('drip_campaigns')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'drip_campaigns'
              ? 'bg-[#D97A7D] text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Chuỗi Nuôi Dưỡng Drip Campaigns ({dripCampaigns.length})
        </button>

        <button
          onClick={() => setActiveTab('treatment_care')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'treatment_care'
              ? 'bg-[#D97A7D] text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <HeartPulse className="w-4 h-4" />
          Hậu Điều Trị &amp; Chu Kỳ Phác Đồ ({postTreatmentTickets.length})
        </button>

        <button
          onClick={() => setActiveTab('churn_prevention')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'churn_prevention'
              ? 'bg-[#D97A7D] text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          Chống Rời Bỏ &gt;45 Ngày ({churnCustomers.length})
        </button>

        <button
          onClick={() => setActiveTab('loyalty_referral')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'loyalty_referral'
              ? 'bg-[#D97A7D] text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Award className="w-4 h-4" />
          Hạng Thẻ &amp; Giới Thiệu Bạn Bè ({loyaltyMembers.length})
        </button>

        <button
          onClick={() => setActiveTab('ai_advisor')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'ai_advisor'
              ? 'bg-[#D97A7D] text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          Tư Vấn Khách Hàng 1-1 (Trực Tuyến) &amp; CSAT
        </button>
      </div>

      {/* ============================================================ */}
      {/* TAB 1: PHỄU CHUYỂN ĐỔI & LEAD SCORING                        */}
      {/* ============================================================ */}
      {activeTab === 'marketing_leads' && (
        <div className="space-y-6">
          {/* Top Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-sm flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-rose-50 text-[#D97A7D] flex items-center justify-center font-bold">
                <Flame className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-gray-500 font-semibold block">Hot Leads (Cần gọi &le;5p)</span>
                <div className="text-2xl font-extrabold text-gray-900">{hotLeadsCount} khách</div>
                <span className="text-[11px] text-rose-600 font-medium">Điểm &gt; 70 • Nhu cầu làm ngay</span>
              </div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-sm flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-gray-500 font-semibold block">Warm &amp; Cold Leads</span>
                <div className="text-2xl font-extrabold text-gray-900">{warmLeadsCount + coldLeadsCount} khách</div>
                <span className="text-[11px] text-amber-600 font-medium">{warmLeadsCount} ấm, {coldLeadsCount} lạnh đang nuôi dưỡng</span>
              </div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-sm flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-gray-500 font-semibold block">Tỷ Lệ Chốt Hẹn</span>
                <div className="text-2xl font-extrabold text-gray-900">34.8%</div>
                <span className="text-[11px] text-emerald-600 font-medium">+8.2% sau áp dụng Lead Scoring</span>
              </div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-sm flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-gray-500 font-semibold block">CPA Trung Bình (Ads)</span>
                <div className="text-2xl font-extrabold text-gray-900">185.000đ</div>
                <span className="text-[11px] text-purple-600 font-medium">Tiết kiệm 40% chi phí quảng cáo</span>
              </div>
            </div>
          </div>

          {/* Search, Filter & Leads Table */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 bg-gray-50/50">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-[#D97A7D]" />
                <h3 className="text-sm font-bold text-gray-900">Danh Sách Khách Hàng Tiềm Năng Chấm Điểm Hành Vi</h3>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Tìm theo tên, SĐT, dịch vụ..."
                    value={leadSearch}
                    onChange={e => setLeadSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D97A7D]"
                  />
                </div>

                <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-gray-200 text-xs">
                  <Filter className="w-3.5 h-3.5 text-gray-400 ml-1" />
                  <button
                    onClick={() => setLeadFilter('all')}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold cursor-pointer ${
                      leadFilter === 'all' ? 'bg-[#5C3A3A] text-white' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Tất cả ({marketingLeads.length})
                  </button>
                  <button
                    onClick={() => setLeadFilter('Hot')}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold cursor-pointer ${
                      leadFilter === 'Hot' ? 'bg-rose-100 text-rose-800' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    🔥 Hot ({hotLeadsCount})
                  </button>
                  <button
                    onClick={() => setLeadFilter('Warm')}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold cursor-pointer ${
                      leadFilter === 'Warm' ? 'bg-amber-100 text-amber-800' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    ⚡ Warm ({warmLeadsCount})
                  </button>
                  <button
                    onClick={() => setLeadFilter('Cold')}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold cursor-pointer ${
                      leadFilter === 'Cold' ? 'bg-blue-100 text-blue-800' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    ❄️ Cold ({coldLeadsCount})
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-600 font-semibold uppercase text-[11px] border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3">Khách Hàng &amp; Nguồn</th>
                    <th className="px-4 py-3">Dịch Vụ Quan Tâm</th>
                    <th className="px-4 py-3 text-center">Điểm Hành Vi (Score)</th>
                    <th className="px-4 py-3">Tương Tác Cuối</th>
                    <th className="px-4 py-3">Sales Phụ Trách</th>
                    <th className="px-4 py-3 text-center">Trạng Thái</th>
                    <th className="px-4 py-3 text-right">Thao Tác Nhanh</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredLeads.map(lead => {
                    const isHot = lead.tier === 'Hot';
                    const isWarm = lead.tier === 'Warm';

                    return (
                      <tr key={lead.id} className="hover:bg-rose-50/20 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-bold text-gray-900">{lead.name}</div>
                          <div className="text-gray-500 font-mono text-[11px]">{lead.phone}</div>
                          <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] bg-gray-100 text-gray-700 font-medium">
                            {lead.source}
                          </span>
                        </td>

                        <td className="px-4 py-3">
                          <div className="font-semibold text-gray-800">{lead.interestService}</div>
                          {lead.behaviorLogs && lead.behaviorLogs.length > 0 && (
                            <button
                              onClick={() => setSelectedLead(lead)}
                              className="text-[#D97A7D] hover:underline text-[11px] mt-0.5 flex items-center gap-1 cursor-pointer"
                            >
                              Xem {lead.behaviorLogs.length} tương tác chi tiết &rarr;
                            </button>
                          )}
                        </td>

                        <td className="px-4 py-3 text-center">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-xs shadow-xs"
                            style={{
                              backgroundColor: isHot ? '#FFE4E6' : isWarm ? '#FEF3C7' : '#EFF6FF',
                              color: isHot ? '#BE123C' : isWarm ? '#B45309' : '#1D4ED8',
                              border: isHot ? '1px solid #FDA4AF' : isWarm ? '1px solid #FCD34D' : '1px solid #BFDBFE'
                            }}
                          >
                            {isHot ? <Flame className="w-3.5 h-3.5" /> : isWarm ? <Zap className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                            <span>{lead.score} điểm • {lead.tier}</span>
                          </div>
                        </td>

                        <td className="px-4 py-3 text-gray-600">
                          {lead.lastInteraction}
                        </td>

                        <td className="px-4 py-3 text-gray-700 font-medium">
                          {lead.assignedSales || 'Chưa phân bổ'}
                        </td>

                        <td className="px-4 py-3 text-center">
                          {lead.status === 'booked' ? (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                              ✓ Đã Chốt Hẹn
                            </span>
                          ) : lead.status === 'hot_called' ? (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">
                              📞 Đã Gọi Nóng
                            </span>
                          ) : isHot ? (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 animate-pulse">
                              🔥 Cần gọi ngay
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-700">
                              Đang nuôi dưỡng
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleCallHotLead(lead)}
                              title="Telesales gọi tư vấn ngay"
                              className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold flex items-center gap-1 border border-rose-200 cursor-pointer"
                            >
                              <PhoneCall className="w-3 h-3" />
                              Gọi Nóng
                            </button>

                            <button
                              onClick={() => handleConvertLeadToBooking(lead)}
                              title="Chuyển đổi thành lịch hẹn"
                              className="px-2.5 py-1 bg-[#D97A7D] hover:bg-[#c76b6e] text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                            >
                              <Calendar className="w-3 h-3" />
                              Chốt Hẹn
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Landing Page Instant Booking Integration Demo Box */}
          <div className="bg-gradient-to-br from-rose-50/70 via-white to-amber-50/40 rounded-2xl border border-rose-200 p-5 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-rose-100 pb-4">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 uppercase tracking-wide">
                  Landing Page Phễu Thu Hút (Lead Catcher)
                </span>
                <h4 className="text-base font-bold text-gray-900 mt-1">
                  Đồng Bộ Lịch Hẹn Trực Tuyến Từ Landing Page &amp; Quảng Cáo
                </h4>
                <p className="text-xs text-gray-600 mt-0.5">
                  Khi khách điền form nhận Voucher 500k hoặc tư vấn, hệ thống tự động chấm điểm Hot Lead (+85 điểm), phân bổ Telesales và đưa vào Smart Booking.
                </p>
              </div>
              <span className="text-xs text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Kênh Web &amp; Zalo OA Đang Hoạt Động
              </span>
            </div>

            <form onSubmit={handleLandingBookingSubmit} className="mt-4 grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Tên Khách Hàng</label>
                <input
                  type="text"
                  required
                  placeholder="Vd: Nguyễn Thảo Vy"
                  value={landingName}
                  onChange={e => setLandingName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D97A7D] bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Số Điện Thoại</label>
                <input
                  type="tel"
                  required
                  placeholder="09xx xxx xxx"
                  value={landingPhone}
                  onChange={e => setLandingPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D97A7D] bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Dịch Vụ Công Nghệ Cao</label>
                <select
                  value={landingService}
                  onChange={e => setLandingService(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D97A7D] bg-white"
                >
                  <option value="Laser PicoWay Trị Nám Chân Sâu">Laser PicoWay Trị Nám Chân Sâu</option>
                  <option value="Nâng Cơ Xóa Nhăn HIFU Ultraformer MPT">Nâng Cơ Xóa Nhăn HIFU Ultraformer MPT</option>
                  <option value="Fractional CO2 Laser Trị Sẹo Rỗ">Fractional CO2 Laser Trị Sẹo Rỗ</option>
                  <option value="Hydrafacial Platinum Thải Độc">Hydrafacial Platinum Thải Độc</option>
                  <option value="Cấy Căng Bóng Da Profhilo / Meso">Cấy Căng Bóng Da Profhilo / Meso</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Ngày Hẹn</label>
                  <input
                    type="date"
                    value={landingDate}
                    onChange={e => setLandingDate(e.target.value)}
                    className="w-full px-2 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Giờ</label>
                  <input
                    type="time"
                    value={landingTime}
                    onChange={e => setLandingTime(e.target.value)}
                    className="w-full px-2 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none bg-white"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full py-2 px-3 bg-[#D97A7D] hover:bg-[#c76b6e] text-white font-bold rounded-lg text-xs shadow transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  Gửi Form &amp; Nhận Voucher
                </button>
              </div>
            </form>

            {landingSubmitted && (
              <div className="mt-3 p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Đăng ký thành công! Hệ thống đã tạo Lead Hot (+85 điểm), tự động chuyển vào Smart Booking và gửi mã Voucher 500.000đ qua Zalo ZNS.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: CHUỖI NUÔI DƯỠNG TỰ ĐỘNG (DRIP CAMPAIGNS)              */}
      {/* ============================================================ */}
      {activeTab === 'drip_campaigns' && (
        <div className="space-y-6">
          <div className="p-4 bg-rose-50/70 rounded-2xl border border-rose-200 text-xs text-rose-900 leading-relaxed">
            💡 <strong>Nguyên lý Chuỗi Nuôi Dưỡng (Nurturing Drip Campaigns):</strong> Thẩm mỹ công nghệ cao có giá trị đơn hàng lớn (từ 5 - 30 triệu). Khách hàng cần thời gian cân nhắc về hiệu quả và mức độ an toàn. Hệ thống tự động gửi chuỗi tin nhắn theo kịch bản chuẩn y khoa qua <strong>Zalo ZNS / SMS Brandname</strong> để chuyển hóa khách hàng từ e ngại sang đặt cọc.
          </div>

          <div className="space-y-6">
            {dripCampaigns.map(campaign => (
              <div key={campaign.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
                {/* Campaign Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-gray-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                        Đang Chạy Tự Động
                      </span>
                      <span className="text-xs text-gray-500 font-medium">
                        Mục tiêu: {campaign.serviceTarget}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mt-1">{campaign.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{campaign.audienceDescription}</p>
                  </div>

                  {/* Campaign Stats */}
                  <div className="flex items-center gap-4 bg-gray-50 p-2.5 rounded-xl border border-gray-100 text-xs">
                    <div>
                      <span className="text-gray-400 block text-[10px]">Đang nuôi dưỡng</span>
                      <span className="font-extrabold text-gray-800 text-sm">{campaign.enrolledCount} khách</span>
                    </div>
                    <div className="h-6 w-px bg-gray-200" />
                    <div>
                      <span className="text-gray-400 block text-[10px]">Tỷ lệ mở tin (Open)</span>
                      <span className="font-extrabold text-blue-600 text-sm">{campaign.openRate}%</span>
                    </div>
                    <div className="h-6 w-px bg-gray-200" />
                    <div>
                      <span className="text-gray-400 block text-[10px]">Chốt hẹn (Booking)</span>
                      <span className="font-extrabold text-emerald-600 text-sm">{campaign.bookingConversionRate}%</span>
                    </div>
                  </div>
                </div>

                {/* Drip Steps Timeline */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {campaign.steps.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border border-gray-200 bg-gradient-to-b from-gray-50/70 to-white hover:border-[#D97A7D] transition-all space-y-3 relative"
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#5C3A3A] text-white">
                          Ngày {step.day}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-blue-100 text-blue-800">
                          {step.channel}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-bold text-xs text-gray-900 line-clamp-1">{step.title}</h4>
                        <p className="text-[11px] text-[#D97A7D] font-medium mt-0.5 line-clamp-1">
                          {step.subject}
                        </p>
                      </div>

                      <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-100 text-[11px] text-gray-600 font-mono line-clamp-3">
                        {step.content}
                      </div>

                      {step.voucherOffer && (
                        <div className="p-2 bg-amber-50 rounded border border-amber-200 text-[11px] text-amber-900 font-semibold flex items-center gap-1">
                          <Gift className="w-3.5 h-3.5 text-amber-600" />
                          Ưu đãi đính kèm: {step.voucherOffer}
                        </div>
                      )}

                      <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-[10px] text-gray-400">Nút kêu gọi: "{step.ctaText}"</span>
                        <button
                          onClick={() => setSelectedDripStep({ campaign, stepIndex: idx })}
                          className="px-2 py-1 bg-white hover:bg-rose-50 text-[#D97A7D] border border-rose-200 rounded text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                        >
                          Gửi Test &rarr;
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: HẬU ĐIỀU TRỊ & CHU KỲ PHÁC ĐỒ                         */}
      {/* ============================================================ */}
      {activeTab === 'treatment_care' && (
        <div className="space-y-6">
          {/* Post-treatment Care Section */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-gray-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
                    Post-Treatment Protocol
                  </span>
                  <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-medium flex items-center gap-1">
                    <Stethoscope className="w-3.5 h-3.5" /> Giám Sát Bởi Bác Sĩ CKI
                  </span>
                </div>
                <h3 className="text-base font-bold text-gray-900 mt-1">
                  Quy Trình Chăm Sóc Hậu Điều Trị (Mốc 0h, 24h &amp; 48h)
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Tự động gửi cẩm nang Home-care ngay sau làm, thu thập phản hồi tình trạng da qua ZNS. Bác sĩ can thiệp ngay nếu phát hiện phản ứng rộp hoặc ngứa rát.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {postTreatmentTickets.map(ticket => {
                const isUrgent = ticket.skinStatus === 'urgent_doctor' || ticket.doctorEscalated;
                const isSlight = ticket.skinStatus === 'slight_redness';

                return (
                  <div
                    key={ticket.id}
                    className={`p-4 rounded-xl border transition-all space-y-3 ${
                      isUrgent
                        ? 'bg-rose-50/70 border-rose-300 ring-1 ring-rose-400'
                        : isSlight
                        ? 'bg-amber-50/50 border-amber-200'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-sm text-gray-900">{ticket.customerName}</div>
                        <div className="text-[11px] text-gray-500">{ticket.customerCode} • {ticket.customerPhone}</div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        ticket.stage === '0h_homecare'
                          ? 'bg-blue-100 text-blue-800'
                          : ticket.stage === '24h_skin_check'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {ticket.stage === '0h_homecare' ? 'Mốc 0h (Homecare)' : ticket.stage === '24h_skin_check' ? 'Mốc 24h (Check da)' : 'Mốc 48h (Phục hồi)'}
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-gray-800 bg-white/80 p-2 rounded border border-gray-100">
                      {ticket.serviceName}
                    </div>

                    <div className="text-xs text-gray-600">
                      <span className="font-semibold block text-[11px] text-gray-500">Phản hồi khách hàng:</span>
                      <p className="italic mt-0.5">"{ticket.patientFeedback}"</p>
                    </div>

                    {ticket.doctorNote && (
                      <div className="p-2.5 bg-blue-50/80 rounded border border-blue-200 text-xs text-blue-900 space-y-1">
                        <span className="font-bold flex items-center gap-1 text-[11px]">
                          <Stethoscope className="w-3.5 h-3.5" /> Y Lệnh Bác Sĩ:
                        </span>
                        <p className="text-[11px] leading-relaxed">{ticket.doctorNote}</p>
                      </div>
                    )}

                    {isUrgent ? (
                      <div className="pt-2 border-t border-rose-200 flex items-center justify-between">
                        <span className="text-[11px] font-bold text-rose-700 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> Cần Bác Sĩ
                        </span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleResolveSkinReaction(ticket)}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold cursor-pointer"
                          >
                            Xong Ca
                          </button>
                          <button
                            onClick={() => alert(`Kết nối thoại trực tiếp giữa BS. Anh Thư và bệnh nhân ${ticket.customerName} (${ticket.customerPhone})`)}
                            className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[11px] font-bold cursor-pointer"
                          >
                            Gọi Ngay
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                        <span>Đã gửi cẩm nang B5/HA</span>
                        <span className="text-emerald-600 font-semibold flex items-center gap-1">
                          <Check className="w-3 h-3" /> Da ổn định
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Treatment Cycle Reminders Table */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#D97A7D]" />
                  Cảnh Báo Chu Kỳ Phác Đồ Sinh Học (Laser 4 tuần, Triệt lông 3 tuần, HIFU 6 tháng)
                </h3>
                <span className="text-xs text-gray-500">Tự động nhận diện khách hàng đến hạn hoặc quá hạn</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-600 font-semibold uppercase text-[11px] border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3">Khách Hàng</th>
                    <th className="px-4 py-3">Liệu Trình</th>
                    <th className="px-4 py-3">Buổi Trước</th>
                    <th className="px-4 py-3">Chu Kỳ</th>
                    <th className="px-4 py-3">Ngày Hạn Đến</th>
                    <th className="px-4 py-3 text-center">Trạng Thái</th>
                    <th className="px-4 py-3 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {cycleAlerts.map(alert => {
                    const isOverdue = alert.status === 'overdue';
                    const isDueSoon = alert.status === 'due_soon';

                    return (
                      <tr key={alert.id} className="hover:bg-rose-50/20 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-bold text-gray-900">{alert.customerName}</div>
                          <div className="text-[11px] text-gray-500">{alert.customerPhone} ({alert.customerCode})</div>
                        </td>

                        <td className="px-4 py-3 font-semibold text-gray-800">
                          {alert.treatmentName}
                        </td>

                        <td className="px-4 py-3 text-gray-600">
                          {alert.lastSessionDate}
                        </td>

                        <td className="px-4 py-3 text-gray-600">
                          {alert.cycleIntervalDays} ngày ({alert.cycleIntervalDays / 7} tuần)
                        </td>

                        <td className="px-4 py-3 font-semibold text-gray-900">
                          {alert.nextDueDate}
                        </td>

                        <td className="px-4 py-3 text-center">
                          {isOverdue ? (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
                              ⚠️ Quá hạn {Math.abs(alert.daysRemaining)} ngày
                            </span>
                          ) : isDueSoon ? (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                              🔔 Đến hạn ({alert.daysRemaining === 0 ? 'Hôm nay' : `Còn ${alert.daysRemaining} ngày`})
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                              Đã gửi ZNS nhắc
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => onTriggerCycleReminder(alert)}
                            className="px-3 py-1 bg-[#D97A7D] hover:bg-[#c76b6e] text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1 ml-auto cursor-pointer"
                          >
                            <Send className="w-3 h-3" />
                            Gửi ZNS Nhắc Lịch
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 4: KỊCH BẢN CHỐNG RỜI BỎ (CHURN PREVENTION >45 NGÀY)     */}
      {/* ============================================================ */}
      {activeTab === 'churn_prevention' && (
        <div className="space-y-6">
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 leading-relaxed flex items-start gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Chiến lược chống rời bỏ khách hàng (Retention &amp; Win-back):</strong> Hệ thống tự động quét khách hàng thân thiết có lịch sử chi tiêu nhưng đã quá <strong>45 ngày</strong> chưa quay lại viện. Tự động đề xuất kịch bản phát hành voucher kích cầu "We Miss You" (tặng điện di / giảm 500k) và phân công nhân viên CSKH gọi chăm sóc.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {churnCustomers.map(cust => {
              const isCritical = cust.riskLevel === 'critical';
              const isHigh = cust.riskLevel === 'high';

              return (
                <div
                  key={cust.id}
                  className={`p-5 rounded-2xl border shadow-sm space-y-4 ${
                    isCritical
                      ? 'bg-rose-50/50 border-rose-200'
                      : isHigh
                      ? 'bg-amber-50/50 border-amber-200'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-base text-gray-900">{cust.customerName}</div>
                      <div className="text-xs text-gray-500 font-mono">{cust.customerPhone} • {cust.customerCode}</div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      isCritical
                        ? 'bg-rose-100 text-rose-800'
                        : isHigh
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {cust.daysInactive} ngày chưa ghé
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-gray-600 bg-white/80 p-3 rounded-xl border border-gray-100">
                    <div>
                      <span className="text-gray-400">Dịch vụ quen thuộc:</span>{' '}
                      <span className="font-semibold text-gray-800">{cust.favoriteService}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Tổng chi tiêu:</span>{' '}
                      <span className="font-extrabold text-[#D97A7D]">
                        {(cust.totalSpent).toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Lần cuối đến:</span>{' '}
                      <span className="font-medium text-gray-700">{cust.lastVisitDate}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-gradient-to-r from-amber-50 to-rose-50 rounded-xl border border-amber-200 text-xs space-y-1">
                    <span className="font-bold text-amber-900 flex items-center gap-1 text-[11px]">
                      <Gift className="w-3.5 h-3.5 text-amber-600" />
                      Voucher Win-back: {cust.winbackVoucherCode}
                    </span>
                    <p className="text-[11px] text-gray-700">{cust.winbackVoucherValue}</p>
                  </div>

                  {cust.cskhNotes && (
                    <div className="text-[11px] text-gray-500 italic bg-gray-50 p-2 rounded">
                      Ghi chú CSKH ({cust.cskhAssigned}): {cust.cskhNotes}
                    </div>
                  )}

                  <div className="pt-2 border-t border-gray-200 flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-600">
                      {cust.status === 'called_reconnected' ? '✓ Đã kết nối lại' : cust.status === 'voucher_sent' ? 'Đã gửi voucher' : 'Chờ CSKH gọi'}
                    </span>
                    <button
                      onClick={() => handleTriggerChurnWinback(cust)}
                      className="px-3 py-1.5 bg-[#D97A7D] hover:bg-[#c76b6e] text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Send className="w-3 h-3" />
                      Gửi ZNS Win-back
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 5: HẠNG THẺ THÀNH VIÊN & GIỚI THIỆU BẠN BÈ                */}
      {/* ============================================================ */}
      {activeTab === 'loyalty_referral' && (
        <div className="space-y-6">
          {/* Top Loyalty Tiers Overview */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-gray-100 pb-3">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                  Tiered Membership &amp; Gamification
                </span>
                <h3 className="text-base font-bold text-gray-900 mt-1">
                  Chính Sách Hạng Thẻ Tích Lũy &amp; Tự Động Thăng Hạng
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Tự động tích lũy 1 điểm cho mỗi 10.000đ chi tiêu. Tự động thăng hạng thẻ và gửi thiệp chúc mừng sinh nhật kèm voucher độc quyền.
                </p>
              </div>

              <button
                onClick={() => setIsNewReferralModalOpen(true)}
                className="px-4 py-2 bg-[#5C3A3A] hover:bg-[#4a2e2e] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                Ghi Nhận Bạn Mới Giới Thiệu
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {loyaltyMembers.map(member => {
                const isDiamond = member.tier.includes('Diamond');
                const isVIP = member.tier === 'VIP';

                return (
                  <div
                    key={member.id}
                    className={`p-4 rounded-xl border shadow-sm space-y-3 relative overflow-hidden ${
                      isDiamond
                        ? 'bg-gradient-to-br from-purple-50 via-white to-pink-50 border-purple-300'
                        : isVIP
                        ? 'bg-gradient-to-br from-amber-50 via-white to-rose-50 border-amber-300'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-sm text-gray-900">{member.customerName}</div>
                        <div className="text-[11px] text-gray-500 font-mono">{member.customerPhone}</div>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                        isDiamond ? 'bg-purple-600 text-white' : isVIP ? 'bg-amber-500 text-white' : 'bg-gray-200 text-gray-800'
                      }`}>
                        {member.tier}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs text-gray-600">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Điểm thưởng:</span>
                        <span className="font-bold text-gray-900">{member.points.toLocaleString()} điểm</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Tổng chi tiêu:</span>
                        <span className="font-extrabold text-[#D97A7D]">
                          {member.totalSpent.toLocaleString('vi-VN')}đ
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Mã giới thiệu:</span>
                        <span className="font-mono font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">
                          {member.referralCode}
                        </span>
                      </div>
                    </div>

                    <div className="p-2.5 bg-gray-50/80 rounded-lg text-[11px] space-y-1">
                      <div className="flex justify-between text-gray-600">
                        <span>Đã giới thiệu:</span>
                        <span className="font-bold text-gray-900">{member.referralCount} bạn bè</span>
                      </div>
                      <div className="flex justify-between text-emerald-700 font-semibold">
                        <span>Thưởng tích lũy:</span>
                        <span>+{member.referralRewardsEarned.toLocaleString('vi-VN')}đ</span>
                      </div>
                    </div>

                    {member.birthday.includes('09-18') ? (
                      <div className="p-2 bg-rose-100 text-rose-800 rounded text-[11px] font-bold flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <Gift className="w-3.5 h-3.5" />
                          🎂 Sinh nhật hôm nay!
                        </span>
                        <button
                          onClick={() => handleSendBirthdayGift(member)}
                          className="px-2 py-0.5 bg-rose-600 text-white rounded text-[10px] font-bold cursor-pointer"
                        >
                          Tặng Quà
                        </button>
                      </div>
                    ) : (
                      <div className="text-[10px] text-gray-400 text-right">
                        Sinh nhật: {member.birthday}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Referral Program Records */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-purple-600" />
                  Chương Trình Giới Thiệu Bạn Bè (Marketing Truyền Miệng - Win-Win)
                </h3>
                <span className="text-xs text-gray-500">
                  Bạn mới giảm 300.000đ • Người giới thiệu nhận ngay 500.000đ hoặc 500 điểm tích lũy
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-600 font-semibold uppercase text-[11px] border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3">Người Giới Thiệu</th>
                    <th className="px-4 py-3">Mã Thẻ Giới Thiệu</th>
                    <th className="px-4 py-3">Bạn Mới Đến Làm</th>
                    <th className="px-4 py-3">Dịch Vụ Trải Nghiệm</th>
                    <th className="px-4 py-3">Ưu Đãi Bạn Mới</th>
                    <th className="px-4 py-3">Thưởng Người Mời</th>
                    <th className="px-4 py-3 text-center">Trạng Thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {referralRecords.map(ref => (
                    <tr key={ref.id} className="hover:bg-purple-50/20 transition-colors">
                      <td className="px-4 py-3 font-bold text-gray-900">
                        {ref.referrerName}
                      </td>

                      <td className="px-4 py-3 font-mono text-purple-700 font-bold">
                        {ref.referrerCode}
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-semibold text-gray-800">{ref.refereeName}</div>
                        <div className="text-[11px] text-gray-500">{ref.refereePhone}</div>
                      </td>

                      <td className="px-4 py-3 text-gray-700">
                        {ref.serviceUsed}
                      </td>

                      <td className="px-4 py-3 text-blue-600 font-semibold">
                        -{ref.refereeDiscount.toLocaleString('vi-VN')}đ
                      </td>

                      <td className="px-4 py-3 text-emerald-600 font-bold">
                        +{ref.rewardValue.toLocaleString('vi-VN')}đ
                      </td>

                      <td className="px-4 py-3 text-center">
                        {ref.status === 'completed' ? (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                            ✓ Đã Giải Ngân Thưởng
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800">
                            Chờ bạn mới hoàn tất buổi
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 6: AI ADVISOR & KHẢO SÁT CSAT                             */}
      {/* ============================================================ */}
      {activeTab === 'ai_advisor' && (
        <div className="space-y-6">
          {/* Top CSAT Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-sm text-center">
              <span className="text-xs text-gray-400 font-semibold block uppercase">Điểm CSAT Trung Bình</span>
              <span className="text-3xl font-extrabold text-[#D97A7D] mt-1 block">4.92 / 5.0</span>
              <div className="flex justify-center text-amber-400 mt-1">
                {[1, 2, 3, 4, 5].map(s => <Star key={s} className="w-4 h-4 fill-amber-400" />)}
              </div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-sm text-center">
              <span className="text-xs text-gray-400 font-semibold block uppercase">Tỷ Lệ Hài Lòng</span>
              <span className="text-3xl font-extrabold text-emerald-600 mt-1 block">98.5%</span>
              <span className="text-xs text-gray-500">Khách hàng sẵn sàng giới thiệu</span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-sm text-center">
              <span className="text-xs text-gray-400 font-semibold block uppercase">Tay Nghề KTV</span>
              <span className="text-3xl font-extrabold text-blue-600 mt-1 block">4.95 / 5.0</span>
              <span className="text-xs text-gray-500">Thao tác êm ái, bôi tê chuẩn</span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-sm text-center">
              <span className="text-xs text-gray-400 font-semibold block uppercase">Cơ Sở &amp; Máy Móc</span>
              <span className="text-3xl font-extrabold text-purple-600 mt-1 block">4.90 / 5.0</span>
              <span className="text-xs text-gray-500">Phòng Laser &amp; HIFU vô khuẩn</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Conversational Consultant (Human-Like 1-1 Chat) */}
            <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col h-[590px]">
              {/* Specialist Profile Header */}
              <div className="p-3.5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#693B4E] via-[#8B4F58] to-[#D97A7D] text-white flex items-center justify-center font-extrabold text-sm shadow">
                      TM
                    </div>
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-gray-900">Thảo My - Chuyên Viên Tư Vấn Da Liễu</h4>
                      <span className="px-2 py-0.5 text-[10px] font-semibold bg-rose-100 text-rose-800 rounded-full">
                        Chuyên khoa Laser &amp; HIFU
                      </span>
                    </div>
                    <span className="text-[11px] text-emerald-600 flex items-center gap-1 font-medium mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Đang trực tuyến • Phản hồi ngay (Đồng bộ Fanpage &amp; Zalo OA)
                    </span>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 bg-rose-50 text-rose-800 border border-rose-200/80 px-2.5 py-1 rounded-lg text-[11px] font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-[#D97A7D]" />
                  <span>Trực Tiếp 1-1 Với Khách Hàng</span>
                </div>
              </div>

              {/* Discreet Manager Mode Explanation */}
              <div className="p-2 bg-gradient-to-r from-amber-50/80 to-rose-50/60 border-b border-rose-100/70 text-[11px] text-amber-900 flex items-center justify-between px-4">
                <span>
                  💡 <strong>Cơ chế Silent AI:</strong> Khách hàng trò chuyện hoàn toàn tự nhiên như đang nhắn tin với Chuyên viên Thảo My. Hệ thống AI âm thầm chấm điểm Lead (Hot/Warm) để Telesales tiếp nhận.
                </span>
                <span className="text-gray-400 font-mono text-[10px] hidden md:inline">Mode: Natural Human Touch</span>
              </div>

              {/* Quick Suggestion Prompts for Testing */}
              <div className="px-4 py-2 bg-gray-50/70 border-b border-gray-100 flex items-center gap-1.5 overflow-x-auto text-[11px]">
                <span className="text-gray-400 font-medium whitespace-nowrap text-[10px]">Câu hỏi mẫu:</span>
                <button
                  type="button"
                  onClick={() => handleSendChat(undefined, 'Nám gò má dùng laser gì, giá bao nhiêu?')}
                  className="px-2.5 py-1 bg-white hover:bg-rose-50 text-gray-700 hover:text-rose-700 border border-gray-200 hover:border-rose-200 rounded-full font-medium whitespace-nowrap transition cursor-pointer shadow-2xs"
                >
                  💬 Nám gò má dùng laser gì?
                </button>
                <button
                  type="button"
                  onClick={() => handleSendChat(undefined, 'Bắn HIFU nâng cơ có đau không và giữ được bao lâu?')}
                  className="px-2.5 py-1 bg-white hover:bg-rose-50 text-gray-700 hover:text-rose-700 border border-gray-200 hover:border-rose-200 rounded-full font-medium whitespace-nowrap transition cursor-pointer shadow-2xs"
                >
                  💬 Bắn HIFU có đau không?
                </button>
                <button
                  type="button"
                  onClick={() => handleSendChat(undefined, 'Em muốn đặt lịch soi da ngày mai sđt 0918 333 444')}
                  className="px-2.5 py-1 bg-white hover:bg-rose-50 text-gray-700 hover:text-rose-700 border border-gray-200 hover:border-rose-200 rounded-full font-medium whitespace-nowrap transition cursor-pointer shadow-2xs"
                >
                  💬 Đặt lịch mai (0918 333 444)
                </button>
                <button
                  type="button"
                  onClick={() => handleSendChat(undefined, 'Tư vấn giúp em chi phí bóc tách sẹo rỗ')}
                  className="px-2.5 py-1 bg-white hover:bg-rose-50 text-gray-700 hover:text-rose-700 border border-gray-200 hover:border-rose-200 rounded-full font-medium whitespace-nowrap transition cursor-pointer shadow-2xs"
                >
                  💬 Chi phí bóc tách sẹo rỗ?
                </button>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3.5">
                {chatMessages.map(m => (
                  <div
                    key={m.id}
                    className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className="flex gap-2.5 max-w-lg">
                      {m.sender === 'ai' && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#693B4E] to-[#D97A7D] text-white flex-shrink-0 flex items-center justify-center font-extrabold text-xs mt-1 shadow-xs">
                          TM
                        </div>
                      )}
                      <div>
                        <div className={`text-[10px] text-gray-400 mb-1 ${m.sender === 'user' ? 'text-right' : 'text-left'}`}>
                          {m.sender === 'user' ? 'Khách hàng' : 'Thảo My (Chuyên viên tư vấn)'} • {m.timestamp}
                        </div>
                        <div
                          className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                            m.sender === 'user'
                              ? 'bg-[#5C3A3A] text-white rounded-tr-none shadow-xs'
                              : 'bg-gradient-to-b from-white to-rose-50/30 text-gray-800 rounded-tl-none border border-gray-200/80 shadow-xs'
                          }`}
                        >
                          <div className="whitespace-pre-line">{m.text}</div>
                          {m.leadScore && (
                            <div className="mt-2.5 pt-2 border-t border-gray-200/60 flex items-center justify-between text-[10px]">
                              <span className="text-gray-400 font-medium">Ghi nhận nội bộ:</span>
                              <span className={`px-2 py-0.5 rounded font-bold flex items-center gap-1 ${
                                m.leadScore === 'Hot' ? 'bg-rose-100 text-rose-700 border border-rose-200' : m.leadScore === 'Warm' ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-blue-100 text-blue-700 border border-blue-200'
                              }`}>
                                {m.leadScore === 'Hot' ? <Flame className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
                                Lead {m.leadScore} ({m.suggestedService || 'Cần gọi tư vấn'})
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex items-center gap-2 text-xs text-gray-500 italic pl-10">
                    <div className="flex gap-1 items-center">
                      <span className="w-1.5 h-1.5 bg-[#D97A7D] rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-[#D97A7D] rounded-full animate-bounce [animation-delay:0.2s]"></span>
                      <span className="w-1.5 h-1.5 bg-[#D97A7D] rounded-full animate-bounce [animation-delay:0.4s]"></span>
                    </div>
                    <span>Thảo My đang soạn câu trả lời...</span>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendChat} className="p-3 border-t border-gray-200 flex items-center gap-2 bg-white rounded-b-2xl">
                <input
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  placeholder="Nhắn tin cho Chuyên viên Thảo My (Hỏi về nám, nâng cơ, giá dịch vụ, đặt hẹn...)"
                  className="flex-1 px-3.5 py-2 text-xs border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#D97A7D]"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#D97A7D] hover:bg-[#c76b6e] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  Gửi Tin
                </button>
              </form>
            </div>

            {/* Right: Actual Customer Testimonials & Reviews */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-3">
                <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500" />
                  Khảo Sát Thực Tế Sau Buổi Điều Trị
                </h4>

                <div className="space-y-3">
                  <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-xs text-gray-900">Chị Vương Thúy Hằng</span>
                      <div className="flex text-amber-400">
                        {[1, 2, 3, 4, 5].map(s => <Star key={s} className="w-3 h-3 fill-amber-400" />)}
                      </div>
                    </div>
                    <div className="text-[11px] text-gray-500">Dịch vụ: Laser PicoWay Trị Nám</div>
                    <p className="text-[11px] text-gray-700 italic">
                      "KTV Mai bắn rất kỹ vùng nám gò má, tư vấn phục hồi bằng B5 rất chi tiết. Sau 3 buổi thấy nám mờ hẳn và da căng hơn!"
                    </p>
                  </div>

                  <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-xs text-gray-900">Anh Trần Hoàng Nam</span>
                      <div className="flex text-amber-400">
                        {[1, 2, 3, 4, 5].map(s => <Star key={s} className="w-3 h-3 fill-amber-400" />)}
                      </div>
                    </div>
                    <div className="text-[11px] text-gray-500">Dịch vụ: Fractional CO2 Cắt Đáy Sẹo</div>
                    <p className="text-[11px] text-gray-700 italic">
                      "Bác sĩ làm rất có tâm, bôi tê kỹ nên không đau như mình tưởng. Phòng ốc máy móc hiện đại và rất sạch sẽ."
                    </p>
                  </div>

                  <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-xs text-gray-900">Chị Đỗ Kim Oanh</span>
                      <div className="flex text-amber-400">
                        {[1, 2, 3, 4, 5].map(s => <Star key={s} className="w-3 h-3 fill-amber-400" />)}
                      </div>
                    </div>
                    <div className="text-[11px] text-gray-500">Dịch vụ: Nâng Cơ HIFU MPT</div>
                    <p className="text-[11px] text-gray-700 italic">
                      "Sau 60 phút viền hàm thon gọn hẳn, nọng cằm biến mất. Rất ưng ý với dịch vụ chăm sóc hậu phẫu chu đáo."
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: VIEW LEAD BEHAVIOR LOGS                               */}
      {/* ============================================================ */}
      {selectedLead && (
        <Modal
          isOpen={!!selectedLead}
          onClose={() => setSelectedLead(null)}
          title={`Chi Tiết Hành Vi Lead: ${selectedLead.name} (${selectedLead.score} điểm)`}
          maxWidth="max-w-xl"
        >
          <div className="space-y-4 text-xs">
            <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-200">
              <div>
                <span className="text-gray-500">Số điện thoại:</span>{' '}
                <span className="font-bold text-gray-900">{selectedLead.phone}</span>
              </div>
              <div>
                <span className="text-gray-500">Nguồn:</span>{' '}
                <span className="font-semibold text-[#D97A7D]">{selectedLead.source}</span>
              </div>
              <div>
                <span className="text-gray-500">Cấp độ:</span>{' '}
                <span className="font-bold text-rose-700">{selectedLead.tier}</span>
              </div>
            </div>

            <div>
              <h5 className="font-bold text-gray-800 mb-2">Lịch Sử Hành Vi &amp; Tích Lũy Điểm Số:</h5>
              <div className="space-y-2">
                {selectedLead.behaviorLogs?.map((log, i) => (
                  <div key={i} className="p-2.5 bg-rose-50/50 rounded-lg border border-rose-100 flex justify-between items-center">
                    <div>
                      <span className="font-medium text-gray-800">{log.action}</span>
                      <div className="text-[10px] text-gray-400">{log.timestamp}</div>
                    </div>
                    <span className="font-bold text-rose-700 text-xs">+{log.points} điểm</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setSelectedLead(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={() => {
                  handleCallHotLead(selectedLead);
                  setSelectedLead(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg flex items-center gap-1.5"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                Gọi Nóng Ngay
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ============================================================ */}
      {/* MODAL: TEST DRIP CAMPAIGN STEP                               */}
      {/* ============================================================ */}
      {selectedDripStep && (
        <Modal
          isOpen={!!selectedDripStep}
          onClose={() => setSelectedDripStep(null)}
          title={`Gửi Thử Nghiệm ZNS: ${selectedDripStep.campaign.steps[selectedDripStep.stepIndex].title}`}
          maxWidth="max-w-lg"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-blue-50 text-blue-900 rounded-xl border border-blue-200 leading-relaxed">
              Mô phỏng gửi tin nhắn Zalo ZNS tự động theo bước ngày {selectedDripStep.campaign.steps[selectedDripStep.stepIndex].day} trong chuỗi nuôi dưỡng.
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Nội Dung Bản Mẫu ZNS:</label>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 font-mono text-[11px] text-gray-800 leading-relaxed whitespace-pre-wrap">
                {selectedDripStep.campaign.steps[selectedDripStep.stepIndex].content}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setSelectedDripStep(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  const step = selectedDripStep.campaign.steps[selectedDripStep.stepIndex];
                  const testMsg: AutomatedMessage = {
                    id: `drip-test-${Date.now()}`,
                    type: 'treatment_cycle',
                    customerName: 'Khách Thử Nghiệm (Lead)',
                    customerPhone: '0933 112 233',
                    channel: step.channel === 'Zalo ZNS' ? 'Zalo ZNS' : 'SMS Brandname',
                    content: step.content,
                    scheduledTime: new Date().toISOString().replace('T', ' ').slice(0, 16),
                    status: 'delivered',
                    sentAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
                  };
                  onSendMessage(testMsg);
                  setSelectedDripStep(null);
                  alert(`Đã kích hoạt gửi thử nghiệm tin nhắn ${step.channel} thành công!`);
                }}
                className="px-4 py-2 bg-[#D97A7D] hover:bg-[#c76b6e] text-white font-bold rounded-lg shadow-sm flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                Kích Hoạt Gửi Thử
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ============================================================ */}
      {/* MODAL: ADD REFERRAL                                          */}
      {/* ============================================================ */}
      {isNewReferralModalOpen && (
        <Modal
          isOpen={isNewReferralModalOpen}
          onClose={() => setIsNewReferralModalOpen(false)}
          title="Ghi Nhận Bạn Mới Qua Mã Giới Thiệu"
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleCreateReferral} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Mã Giới Thiệu Của Khách Cũ *</label>
              <select
                required
                value={refReferrerCode}
                onChange={e => setRefReferrerCode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
              >
                <option value="">-- Chọn khách hàng giới thiệu --</option>
                {loyaltyMembers.map(m => (
                  <option key={m.id} value={m.referralCode}>
                    {m.customerName} ({m.tier}) - Mã: {m.referralCode}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Tên Bạn Mới *</label>
                <input
                  type="text"
                  required
                  placeholder="Vd: Nguyễn Lan Anh"
                  value={refRefereeName}
                  onChange={e => setRefRefereeName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">SĐT Bạn Mới *</label>
                <input
                  type="tel"
                  required
                  placeholder="09xx xxx xxx"
                  value={refRefereePhone}
                  onChange={e => setRefRefereePhone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Dịch Vụ Trải Nghiệm *</label>
              <select
                value={refService}
                onChange={e => setRefService(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
              >
                <option value="Nâng Cơ Xóa Nhăn HIFU MPT">Nâng Cơ Xóa Nhăn HIFU MPT</option>
                <option value="Laser PicoWay Trị Nám">Laser PicoWay Trị Nám</option>
                <option value="Hydrafacial Platinum Thải Độc">Hydrafacial Platinum Thải Độc</option>
                <option value="Fractional CO2 Cắt Đáy Sẹo">Fractional CO2 Cắt Đáy Sẹo</option>
              </select>
            </div>

            <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-purple-900 space-y-1">
              <div className="font-bold flex items-center gap-1">
                <Gift className="w-3.5 h-3.5" /> Quyền lợi áp dụng:
              </div>
              <p>• Bạn mới: Giảm ngay 300.000đ khi thanh toán hóa đơn</p>
              <p>• Người giới thiệu: Nhận ngay 500.000đ vào ví tích lũy</p>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setIsNewReferralModalOpen(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#5C3A3A] hover:bg-[#4a2e2e] text-white font-bold rounded-lg shadow-sm"
              >
                Xác Nhận Giới Thiệu
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ============================================================ */}
      {/* MODAL: SEND MANUAL ZNS CAMPAIGN                              */}
      {/* ============================================================ */}
      {isNewCampaignModalOpen && (
        <Modal
          isOpen={isNewCampaignModalOpen}
          onClose={() => setIsNewCampaignModalOpen(false)}
          title="Tạo &amp; Gửi Tin Nhắn Zalo ZNS / SMS"
          maxWidth="max-w-xl"
        >
          <form onSubmit={handleSendManualMessage} className="space-y-4">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleSelectTemplate('reminder_24h')}
                className="px-3 py-1 text-[11px] bg-gray-100 hover:bg-gray-200 rounded font-medium"
              >
                Mẫu Nhắc 24h
              </button>
              <button
                type="button"
                onClick={() => handleSelectTemplate('csat_survey')}
                className="px-3 py-1 text-[11px] bg-gray-100 hover:bg-gray-200 rounded font-medium"
              >
                Mẫu Khảo Sát CSAT
              </button>
              <button
                type="button"
                onClick={() => handleSelectTemplate('treatment_cycle')}
                className="px-3 py-1 text-[11px] bg-gray-100 hover:bg-gray-200 rounded font-medium"
              >
                Mẫu Chu Kỳ Tái Khám
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Tên Khách Hàng *</label>
                <input
                  type="text"
                  required
                  placeholder="Vd: Vương Thúy Hằng"
                  value={campCustName}
                  onChange={e => setCampCustName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Số Điện Thoại *</label>
                <input
                  type="tel"
                  required
                  placeholder="09xx xxx xxx"
                  value={campCustPhone}
                  onChange={e => setCampCustPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Kênh Gửi</label>
              <select
                value={campChannel}
                onChange={e => setCampChannel(e.target.value as 'Zalo ZNS' | 'SMS Brandname')}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none"
              >
                <option value="Zalo ZNS">Zalo ZNS (Official Account Template)</option>
                <option value="SMS Brandname">SMS Brandname WELLNESS</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Nội Dung Tin Nhắn *</label>
              <textarea
                rows={4}
                required
                value={campContent}
                onChange={e => setCampContent(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none font-mono"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setIsNewCampaignModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-[#D97A7D] hover:bg-[#c76b6e] rounded-lg shadow-sm"
              >
                Xác Nhận &amp; Gửi Tức Thì
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default CRMAutomation;

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  MedicalRecord,
  Booking,
  LoyaltyMember,
  SkinAnalysisReport,
  PostTreatmentCareTicket,
  BookingStatus
} from '../types';
import {
  Search,
  X,
  Phone,
  FileText,
  Calendar,
  Award,
  Camera,
  HeartPulse,
  ArrowRight,
  CheckCircle2,
  Clock,
  Activity,
  Sparkles,
  UserCheck
} from 'lucide-react';

interface Patient360ModalProps {
  isOpen: boolean;
  onClose: () => void;
  medicalRecords: MedicalRecord[];
  bookings: Booking[];
  loyaltyMembers: LoyaltyMember[];
  skinReports: SkinAnalysisReport[];
  postTreatmentTickets: PostTreatmentCareTicket[];
  onOpenPatientEMR: (customerCode: string, customerName: string, customerPhone: string) => void;
  onUpdateBookingStatus: (bookingId: string, status: BookingStatus) => void;
  onNavigateToView: (view: 'smart_booking' | 'emr' | 'crm_automation' | 'smart_clinic_hardware') => void;
}

interface UnifiedPatientProfile {
  customerCode: string;
  customerName: string;
  customerPhone: string;
  emr?: MedicalRecord;
  bookings: Booking[];
  loyalty?: LoyaltyMember;
  skinReports: SkinAnalysisReport[];
  careTickets: PostTreatmentCareTicket[];
}

const Patient360Modal: React.FC<Patient360ModalProps> = ({
  isOpen,
  onClose,
  medicalRecords,
  bookings,
  loyaltyMembers,
  skinReports,
  postTreatmentTickets,
  onOpenPatientEMR,
  onUpdateBookingStatus,
  onNavigateToView
}) => {
  const [queryText, setQueryText] = useState('');
  const [selectedCode, setSelectedCode] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Build unified patient directory from EMR, Bookings, and Loyalty
  const unifiedPatients = useMemo(() => {
    const map = new Map<string, UnifiedPatientProfile>();

    const normalizePhone = (p: string) => p.replace(/\s+/g, '');

    medicalRecords.forEach(emr => {
      const key = emr.customerCode || normalizePhone(emr.customerPhone);
      map.set(key, {
        customerCode: emr.customerCode,
        customerName: emr.customerName,
        customerPhone: emr.customerPhone,
        emr,
        bookings: [],
        skinReports: [],
        careTickets: []
      });
    });

    bookings.forEach(bk => {
      // Find by code or phone
      let existing = map.get(bk.customerCode);
      if (!existing) {
        for (const prof of map.values()) {
          if (normalizePhone(prof.customerPhone) === normalizePhone(bk.customerPhone)) {
            existing = prof;
            break;
          }
        }
      }
      if (existing) {
        existing.bookings.push(bk);
      } else {
        map.set(bk.customerCode, {
          customerCode: bk.customerCode,
          customerName: bk.customerName,
          customerPhone: bk.customerPhone,
          bookings: [bk],
          skinReports: [],
          careTickets: []
        });
      }
    });

    loyaltyMembers.forEach(lm => {
      let existing = map.get(lm.customerCode);
      if (!existing) {
        for (const prof of map.values()) {
          if (normalizePhone(prof.customerPhone) === normalizePhone(lm.customerPhone)) {
            existing = prof;
            break;
          }
        }
      }
      if (existing) {
        existing.loyalty = lm;
      } else {
        map.set(lm.customerCode, {
          customerCode: lm.customerCode,
          customerName: lm.customerName,
          customerPhone: lm.customerPhone,
          loyalty: lm,
          bookings: [],
          skinReports: [],
          careTickets: []
        });
      }
    });

    skinReports.forEach(sr => {
      const existing = map.get(sr.customerCode);
      if (existing) {
        existing.skinReports.push(sr);
      }
    });

    postTreatmentTickets.forEach(tk => {
      const existing = map.get(tk.customerCode);
      if (existing) {
        existing.careTickets.push(tk);
      }
    });

    return Array.from(map.values());
  }, [medicalRecords, bookings, loyaltyMembers, skinReports, postTreatmentTickets]);

  const filteredPatients = useMemo(() => {
    if (!queryText.trim()) return unifiedPatients;
    const q = queryText.toLowerCase().trim();
    return unifiedPatients.filter(p =>
      p.customerName.toLowerCase().includes(q) ||
      p.customerPhone.replace(/\s+/g, '').includes(q.replace(/\s+/g, '')) ||
      p.customerCode.toLowerCase().includes(q) ||
      (p.emr?.diagnosis || '').toLowerCase().includes(q)
    );
  }, [unifiedPatients, queryText]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 60);
      if (!selectedCode && unifiedPatients.length > 0) {
        setSelectedCode(unifiedPatients[0].customerCode);
      }
    }
  }, [isOpen, unifiedPatients, selectedCode]);

  const activeProfile = useMemo(() => {
    return (
      filteredPatients.find(p => p.customerCode === selectedCode) ||
      filteredPatients[0] ||
      null
    );
  }, [filteredPatients, selectedCode]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-6 sm:pt-14 px-3 pb-6 overflow-y-auto">
      <div
        className="fixed inset-0"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-5xl overflow-hidden z-10 flex flex-col max-h-[88vh]">
        {/* Top Command Search Bar */}
        <div className="p-4 bg-[#FDF7F8] border-b border-gray-200 flex items-center gap-3">
          <Search className="w-5 h-5 text-[#D97A7D] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={queryText}
            onChange={e => setQueryText(e.target.value)}
            placeholder="Tra cứu nhanh Khách hàng 360° theo Họ tên, Số điện thoại, Mã KH hoặc Chẩn đoán..."
            className="w-full bg-transparent text-sm text-gray-900 placeholder-gray-400 focus:outline-none font-medium"
          />
          {queryText && (
            <button
              onClick={() => setQueryText('')}
              className="text-xs text-gray-400 hover:text-gray-600 px-2 py-0.5 rounded bg-gray-100"
            >
              Xóa
            </button>
          )}
          <span className="hidden sm:inline-block text-[11px] font-mono text-gray-400 border border-gray-200 rounded px-1.5 py-0.5 bg-white shrink-0">
            ESC
          </span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Split: Left Directory + Right 360 Profile */}
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden">
          {/* Left Column: Customer List */}
          <div className="md:col-span-4 border-r border-gray-100 bg-gray-50/60 overflow-y-auto max-h-[32vh] md:max-h-[72vh] divide-y divide-gray-100">
            <div className="px-3.5 py-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider flex justify-between items-center bg-gray-50 sticky top-0 z-10">
              <span>Khách hàng ({filteredPatients.length})</span>
              <span className="font-mono tabular-nums">360° View</span>
            </div>

            {filteredPatients.length === 0 ? (
              <div className="p-6 text-center text-xs text-gray-400">
                Không tìm thấy khách hàng khớp từ khóa "{queryText}".
              </div>
            ) : (
              filteredPatients.map(item => {
                const isSelected = activeProfile?.customerCode === item.customerCode;
                return (
                  <button
                    key={item.customerCode}
                    onClick={() => setSelectedCode(item.customerCode)}
                    className={`w-full text-left p-3.5 transition-colors flex items-start justify-between gap-2 ${
                      isSelected
                        ? 'bg-rose-50/90 border-l-2 border-[#D97A7D]'
                        : 'hover:bg-white'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-gray-900 truncate flex items-center gap-1.5">
                        <span>{item.customerName}</span>
                      </div>
                      <div className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-1.5 font-mono tabular-nums">
                        <span>{item.customerPhone}</span>
                        <span>·</span>
                        <span>{item.customerCode}</span>
                      </div>
                      {item.emr && (
                        <div className="text-[11px] text-gray-600 truncate mt-1">
                          {item.emr.diagnosis}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end shrink-0 gap-1">
                      {item.loyalty && (
                        <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                          {item.loyalty.tier}
                        </span>
                      )}
                      {item.emr && (
                        <span className="text-[10px] font-mono tabular-nums text-gray-500">
                          {item.emr.completedSessions}/{item.emr.totalSessions} buổi
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Right Column: Full 360 Patient Overview */}
          <div className="md:col-span-8 p-5 overflow-y-auto max-h-[54vh] md:max-h-[72vh] space-y-5 bg-white">
            {activeProfile ? (
              <>
                {/* 1. Patient Header & Primary Action */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-bold text-gray-900">
                        {activeProfile.customerName}
                      </h3>
                      <span className="text-xs font-mono text-gray-500">
                        {activeProfile.customerCode}
                      </span>
                      {activeProfile.loyalty && (
                        <span className="text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                          Hạng {activeProfile.loyalty.tier} · {activeProfile.loyalty.points.toLocaleString('vi-VN')} điểm
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 flex flex-wrap items-center gap-2 font-mono tabular-nums">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-gray-400" />
                        {activeProfile.customerPhone}
                      </span>
                      {activeProfile.loyalty && (
                        <>
                          <span>·</span>
                          <span>
                            Tổng chi tiêu: <strong className="text-gray-800">{activeProfile.loyalty.totalSpent.toLocaleString('vi-VN')} đ</strong>
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        onOpenPatientEMR(
                          activeProfile.customerCode,
                          activeProfile.customerName,
                          activeProfile.customerPhone
                        );
                        onClose();
                      }}
                      className="px-3.5 py-2 bg-[#D97A7D] hover:bg-[#c76b6e] text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <FileText className="w-4 h-4" />
                      {activeProfile.emr ? 'Mở Hồ Sơ Bệnh Án (EMR)' : 'Khởi Tạo Bệnh Án EMR'}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* 2. Clinical EMR Summary */}
                <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#5C3A3A]">
                      <HeartPulse className="w-4 h-4 text-[#D97A7D]" />
                      <span>Hồ Sơ Bệnh Án & Phác Đồ Điều Trị (EMR)</span>
                    </div>
                    {activeProfile.emr && (
                      <span className="text-xs font-mono tabular-nums font-bold text-[#5C3A3A]">
                        Tiến độ: {activeProfile.emr.completedSessions}/{activeProfile.emr.totalSessions} buổi
                      </span>
                    )}
                  </div>

                  {activeProfile.emr ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-2.5 bg-white rounded-lg border border-gray-100">
                        <span className="text-gray-400 block text-[11px]">Chẩn đoán da liễu</span>
                        <span className="font-semibold text-gray-800 mt-0.5 block">
                          {activeProfile.emr.diagnosis}
                        </span>
                      </div>
                      <div className="p-2.5 bg-white rounded-lg border border-gray-100">
                        <span className="text-gray-400 block text-[11px]">Phác đồ chỉ định ({activeProfile.emr.doctorInCharge})</span>
                        <span className="font-semibold text-gray-800 mt-0.5 block">
                          {activeProfile.emr.treatmentPlan}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500">
                      Khách hàng chưa có hồ sơ bệnh án điện tử EMR. Bấm nút <strong>"Khởi Tạo Bệnh Án EMR"</strong> phía trên để tạo tự động.
                    </p>
                  )}
                </div>

                {/* 3. Bookings & Quick Status Transition */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-[#D97A7D]" />
                      Lịch Hẹn Dịch Vụ ({activeProfile.bookings.length})
                    </h4>
                    <button
                      onClick={() => {
                        onNavigateToView('smart_booking');
                        onClose();
                      }}
                      className="text-xs text-[#D97A7D] hover:underline font-semibold"
                    >
                      Mở Smart Booking →
                    </button>
                  </div>

                  {activeProfile.bookings.length === 0 ? (
                    <div className="p-3.5 rounded-xl border border-gray-100 text-xs text-gray-400 bg-gray-50/40">
                      Chưa có lịch hẹn nào được ghi nhận.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {activeProfile.bookings.map(bk => (
                        <div
                          key={bk.id}
                          className="p-3 rounded-xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white"
                        >
                          <div>
                            <div className="font-bold text-xs text-gray-900 flex items-center gap-2">
                              <span>{bk.serviceName}</span>
                              <span className="text-[11px] font-mono tabular-nums text-gray-500">
                                {bk.date} · {bk.time}
                              </span>
                            </div>
                            <div className="text-[11px] text-gray-500 mt-0.5">
                              Phòng: {bk.roomName || 'Chưa gán'} · KTV: {bk.technicianName || 'Chưa gán'}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {bk.status === 'confirmed' && (
                              <button
                                onClick={() => onUpdateBookingStatus(bk.id, 'in_progress')}
                                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold rounded-lg transition-colors cursor-pointer"
                              >
                                Check-in Bắt đầu
                              </button>
                            )}
                            {bk.status === 'in_progress' && (
                              <button
                                onClick={() => onUpdateBookingStatus(bk.id, 'completed')}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold rounded-lg transition-colors cursor-pointer"
                              >
                                Hoàn thành & Tính Tour
                              </button>
                            )}
                            <span className="text-[11px] font-semibold text-gray-600 px-2 py-0.5 bg-gray-100 rounded">
                              {bk.status === 'confirmed' ? 'Đã xác nhận' :
                               bk.status === 'in_progress' ? 'Đang thực hiện' :
                               bk.status === 'completed' ? 'Hoàn thành' :
                               bk.status === 'pending' ? 'Chờ xác nhận' : 'Đã hủy'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 4. VISIA Skin Analysis & Post-Treatment Care */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-xl border border-gray-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                        <Camera className="w-4 h-4 text-[#D97A7D]" />
                        Chỉ Số Soi Da VISIA ({activeProfile.skinReports.length})
                      </span>
                      <button
                        onClick={() => {
                          onNavigateToView('smart_clinic_hardware');
                          onClose();
                        }}
                        className="text-[11px] text-[#D97A7D] hover:underline font-semibold"
                      >
                        Trạm VISIA →
                      </button>
                    </div>
                    {activeProfile.skinReports.length > 0 ? (
                      <div className="text-xs space-y-1">
                        <div className="flex justify-between font-mono tabular-nums">
                          <span className="text-gray-500">Điểm sức khỏe da:</span>
                          <strong className="text-[#D97A7D]">{activeProfile.skinReports[0].overallScore}/100</strong>
                        </div>
                        <div className="flex justify-between font-mono tabular-nums">
                          <span className="text-gray-500">Tuổi da sinh học:</span>
                          <strong className="text-gray-800">{activeProfile.skinReports[0].skinAge} tuổi</strong>
                        </div>
                        <p className="text-[11px] text-gray-600 line-clamp-2 pt-1">
                          {activeProfile.skinReports[0].diagnosisSummary}
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400">Chưa có dữ liệu soi da VISIA.</p>
                    )}
                  </div>

                  <div className="p-3.5 rounded-xl border border-gray-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                        <UserCheck className="w-4 h-4 text-emerald-600" />
                        Chăm Sóc Hậu Phẫu CRM ({activeProfile.careTickets.length})
                      </span>
                      <button
                        onClick={() => {
                          onNavigateToView('crm_automation');
                          onClose();
                        }}
                        className="text-[11px] text-[#D97A7D] hover:underline font-semibold"
                      >
                        Mở CRM →
                      </button>
                    </div>
                    {activeProfile.careTickets.length > 0 ? (
                      <div className="text-xs space-y-1">
                        <div className="font-semibold text-gray-800">
                          {activeProfile.careTickets[0].serviceName}
                        </div>
                        <div className="text-[11px] text-gray-500">
                          Giai đoạn: <strong className="text-gray-700">{activeProfile.careTickets[0].stage}</strong>
                        </div>
                        <div className="text-[11px] text-gray-600">
                          {activeProfile.careTickets[0].patientFeedback || 'Đang theo dõi phản ứng da sau điều trị'}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400">Không có ticket hậu phẫu đang mở.</p>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="p-12 text-center text-gray-400 text-sm">
                Chọn một khách hàng bên trái để xem Hồ sơ 360°
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Patient360Modal;

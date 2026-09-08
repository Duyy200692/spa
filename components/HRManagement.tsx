import React, { useState, useMemo } from 'react';
import { 
  StaffMember, 
  AttendanceRecord, 
  TechnicianTour, 
  PayrollRecord, 
  DayAttendanceStatus, 
  User, 
  Service, 
  Role 
} from '../types';
import { 
  calculateSeniority, 
  formatVND, 
  computePayroll 
} from '../hrService';
import StaffModal from './StaffModal';
import TourModal from './TourModal';
import PayslipModal from './PayslipModal';
import StaffDailyDetailModal from './StaffDailyDetailModal';

interface HRManagementProps {
  currentUser: User;
  staffList: StaffMember[];
  attendanceList: AttendanceRecord[];
  toursList: TechnicianTour[];
  payrollList: PayrollRecord[];
  services: Service[];
  onAddStaff: (staff: StaffMember) => void;
  onUpdateStaff: (staff: StaffMember) => void;
  onDeleteStaff: (staffId: string) => void;
  onSaveAttendance: (record: AttendanceRecord) => void;
  onSaveTour: (tour: TechnicianTour) => void;
  onDeleteTour: (tourId: string) => void;
  onSavePayroll: (record: PayrollRecord) => void;
  onBatchUpdatePayroll: (records: PayrollRecord[]) => void;
}

const HRManagement: React.FC<HRManagementProps> = ({
  currentUser,
  staffList,
  attendanceList,
  toursList,
  payrollList,
  services,
  onAddStaff,
  onUpdateStaff,
  onDeleteStaff,
  onSaveAttendance,
  onSaveTour,
  onDeleteTour,
  onSavePayroll,
  onBatchUpdatePayroll
}) => {
  // Current active sub-tab
  const [activeTab, setActiveTab] = useState<'staff' | 'attendance' | 'tours' | 'payroll'>('staff');

  // Month & Year selection for Attendance & Payroll & Tours
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());

  // Staff Sub-tab filters
  const [staffStatusFilter, setStaffStatusFilter] = useState<'all' | 'active' | 'resigned' | 'technician'>('active');
  const [staffSearch, setStaffSearch] = useState<string>('');

  // Modals state
  const [isStaffModalOpen, setIsStaffModalOpen] = useState<boolean>(false);
  const [staffToEdit, setStaffToEdit] = useState<StaffMember | null>(null);
  const [staffModalMode, setStaffModalMode] = useState<'create' | 'edit' | 'resign'>('create');

  const [isTourModalOpen, setIsTourModalOpen] = useState<boolean>(false);
  const [tourToEdit, setTourToEdit] = useState<TechnicianTour | null>(null);

  const [isPayslipModalOpen, setIsPayslipModalOpen] = useState<boolean>(false);
  const [selectedPayslip, setSelectedPayslip] = useState<PayrollRecord | null>(null);

  // Daily Detail Modal state
  const [isDailyDetailOpen, setIsDailyDetailOpen] = useState<boolean>(false);
  const [dailyDetailStaff, setDailyDetailStaff] = useState<StaffMember | null>(null);

  const handleOpenDailyDetail = (staff: StaffMember) => {
    setDailyDetailStaff(staff);
    setIsDailyDetailOpen(true);
  };

  // Edit bonus/deduction inline modal or prompt
  const [editingPayroll, setEditingPayroll] = useState<PayrollRecord | null>(null);
  const [editBonusVal, setEditBonusVal] = useState<number>(0);
  const [editBonusReason, setEditBonusReason] = useState<string>('');
  const [editDeductionVal, setEditDeductionVal] = useState<number>(0);
  const [editDeductionReason, setEditDeductionReason] = useState<string>('');

  // Filtered staff
  const filteredStaff = useMemo(() => {
    return staffList.filter(staff => {
      // Filter status
      if (staffStatusFilter === 'active' && staff.status !== 'active') return false;
      if (staffStatusFilter === 'resigned' && staff.status !== 'resigned') return false;
      if (staffStatusFilter === 'technician' && (!staff.isTechnician || staff.status !== 'active')) return false;

      // Filter search
      if (staffSearch.trim()) {
        const query = staffSearch.toLowerCase();
        const matchName = staff.name.toLowerCase().includes(query);
        const matchCode = staff.code.toLowerCase().includes(query);
        const matchPhone = (staff.phone || '').includes(query);
        const matchPos = (staff.position || '').toLowerCase().includes(query);
        const matchDept = (staff.department || '').toLowerCase().includes(query);
        return matchName || matchCode || matchPhone || matchPos || matchDept;
      }
      return true;
    });
  }, [staffList, staffStatusFilter, staffSearch]);

  // Statistics
  const totalStaffCount = staffList.length;
  const activeStaffCount = staffList.filter(s => s.status === 'active').length;
  const resignedStaffCount = staffList.filter(s => s.status === 'resigned').length;
  const technicianCount = staffList.filter(s => s.status === 'active' && s.isTechnician).length;

  // Days in selected month
  const daysInMonth = useMemo(() => {
    return new Date(selectedYear, selectedMonth, 0).getDate();
  }, [selectedMonth, selectedYear]);

  const daysArray = useMemo(() => {
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  }, [daysInMonth]);

  // Tours filtered by selected month and year
  const filteredTours = useMemo(() => {
    return toursList.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() + 1 === selectedMonth && d.getFullYear() === selectedYear;
    }).sort((a, b) => new Date(b.date + ' ' + (b.time || '00:00')).getTime() - new Date(a.date + ' ' + (a.time || '00:00')).getTime());
  }, [toursList, selectedMonth, selectedYear]);

  // Tours statistics
  const totalTourCount = filteredTours.length;
  const totalTourCommission = filteredTours.reduce((sum, t) => sum + (t.commissionAmount || 0), 0);
  const totalTourTips = filteredTours.reduce((sum, t) => sum + (t.tipAmount || 0), 0);

  // Top technician in month
  const topTech = useMemo(() => {
    const counts: Record<string, { name: string; count: number; commission: number }> = {};
    filteredTours.forEach(t => {
      if (!counts[t.technicianId]) {
        counts[t.technicianId] = { name: t.technicianName, count: 0, commission: 0 };
      }
      counts[t.technicianId].count += 1;
      counts[t.technicianId].commission += (t.commissionAmount || 0);
    });
    const sorted = Object.values(counts).sort((a, b) => b.count - a.count);
    return sorted[0] || null;
  }, [filteredTours]);

  // Payroll list for selected month and year
  const currentPayrolls = useMemo(() => {
    return payrollList.filter(p => p.month === selectedMonth && p.year === selectedYear);
  }, [payrollList, selectedMonth, selectedYear]);

  // Total payroll fund
  const totalPayrollFund = currentPayrolls.reduce((sum, p) => sum + p.netSalary, 0);

  // Handlers for Staff
  const handleOpenCreateStaff = () => {
    setStaffToEdit(null);
    setStaffModalMode('create');
    setIsStaffModalOpen(true);
  };

  const handleOpenEditStaff = (staff: StaffMember) => {
    setStaffToEdit(staff);
    setStaffModalMode('edit');
    setIsStaffModalOpen(true);
  };

  const handleOpenResignStaff = (staff: StaffMember) => {
    setStaffToEdit(staff);
    setStaffModalMode('resign');
    setIsStaffModalOpen(true);
  };

  const handleReactivateStaff = (staff: StaffMember) => {
    if (confirm(`Bạn có chắc chắn muốn khôi phục nhân viên "${staff.name}" trở lại làm việc (Trạng thái: Đang làm việc)?`)) {
      const updated: StaffMember = {
        ...staff,
        status: 'active',
        resignedDate: undefined,
        resignedReason: undefined
      };
      onUpdateStaff(updated);
    }
  };

  // Handlers for Attendance
  const handleToggleAttendanceDay = (staffId: string, day: number, month = selectedMonth, year = selectedYear) => {
    let rec = attendanceList.find(a => a.staffId === staffId && a.month === month && a.year === year);
    const statuses: DayAttendanceStatus[] = ['P', 'N', 'CP', 'KP', 'OFF', 'OT'];
    
    const currentDays = rec ? { ...rec.days } : {};
    const currentStatus = currentDays[day] || 'OFF';
    const nextIdx = (statuses.indexOf(currentStatus) + 1) % statuses.length;
    const nextStatus = statuses[nextIdx];
    currentDays[day] = nextStatus;

    // Recalculate work days
    let workDays = 0;
    let leave = 0;
    let unauthLeave = 0;
    let ot = 0;
    Object.values(currentDays).forEach(st => {
      if (st === 'P') workDays += 1;
      else if (st === 'N') workDays += 0.5;
      else if (st === 'CP') leave += 1;
      else if (st === 'KP') unauthLeave += 1;
      else if (st === 'OT') {
        workDays += 1;
        ot += 2;
      }
    });

    const updatedRecord: AttendanceRecord = {
      id: rec?.id || `att-${staffId}-${year}-${month}`,
      staffId,
      month,
      year,
      days: currentDays,
      totalWorkDays: workDays,
      leaveDays: leave,
      unauthorizedLeaveDays: unauthLeave,
      otHours: ot
    };

    onSaveAttendance(updatedRecord);
  };

  const handleQuickFillAttendance = () => {
    if (!confirm(`Tự động chấm công chuẩn cho tất cả nhân sự đang làm việc trong Tháng ${selectedMonth}/${selectedYear}? (Đi làm đầy đủ từ Thứ 2 đến Thứ 7, Chủ nhật nghỉ)`)) {
      return;
    }

    const activeStaff = staffList.filter(s => s.status === 'active');
    activeStaff.forEach(staff => {
      const days: Record<number, DayAttendanceStatus> = {};
      let workDays = 0;
      for (let d = 1; d <= daysInMonth; d++) {
        const dateObj = new Date(selectedYear, selectedMonth - 1, d);
        const dayOfWeek = dateObj.getDay(); // 0 is Sunday
        if (dayOfWeek === 0) {
          days[d] = 'OFF';
        } else {
          days[d] = 'P';
          workDays += 1;
        }
      }

      const rec: AttendanceRecord = {
        id: `att-${staff.id}-${selectedYear}-${selectedMonth}`,
        staffId: staff.id,
        month: selectedMonth,
        year: selectedYear,
        days,
        totalWorkDays: workDays,
        leaveDays: 0,
        unauthorizedLeaveDays: 0,
        otHours: 0,
        note: 'Chấm công chuẩn tự động'
      };
      onSaveAttendance(rec);
    });

    alert(`Đã hoàn tất chấm công nhanh cho ${activeStaff.length} nhân sự!`);
  };

  // Handlers for Auto-Calculate Payroll
  const handleAutoCalculatePayroll = () => {
    const activeStaff = staffList.filter(s => s.status === 'active');
    const newPayrolls: PayrollRecord[] = activeStaff.map(staff => {
      const att = attendanceList.find(a => a.staffId === staff.id && a.month === selectedMonth && a.year === selectedYear);
      const existing = currentPayrolls.find(p => p.staffId === staff.id);
      return computePayroll(staff, att, toursList, selectedMonth, selectedYear, existing);
    });

    onBatchUpdatePayroll(newPayrolls);
    alert(`Đã tính toán bảng lương tự động cho ${newPayrolls.length} nhân viên trong Tháng ${selectedMonth}/${selectedYear}!`);
  };

  const handleOpenEditBonus = (payroll: PayrollRecord) => {
    setEditingPayroll(payroll);
    setEditBonusVal(payroll.bonus);
    setEditBonusReason(payroll.bonusReason || '');
    setEditDeductionVal(payroll.deduction);
    setEditDeductionReason(payroll.deductionReason || '');
  };

  const handleSaveBonusEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPayroll) return;

    const baseAndAllowances = editingPayroll.salaryByWorkDays + editingPayroll.seniorityAllowance + editingPayroll.otherAllowance + editingPayroll.tourCommission;
    const net = Math.max(0, baseAndAllowances + editBonusVal - editDeductionVal);

    const updated: PayrollRecord = {
      ...editingPayroll,
      bonus: editBonusVal,
      bonusReason: editBonusReason,
      deduction: editDeductionVal,
      deductionReason: editDeductionReason,
      netSalary: net
    };

    onSavePayroll(updated);
    setEditingPayroll(null);
  };

  return (
    <div className="space-y-6 text-[#5C3A3A]">
      {/* Top Header & Sub-Navigation */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-pink-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-serif font-bold text-[#5C3A3A]">Quản lý Nhân sự & Tiền lương</h2>
            <span className="bg-[#D97A7D]/10 text-[#D97A7D] text-xs px-2.5 py-0.5 rounded-full font-semibold">
              Wellness HR System
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Hồ sơ nhân sự, tính thâm niên, phân ca tour KTV, bảng chấm công và tự động tính lương thưởng hàng tháng.
          </p>
        </div>

        {/* Month / Year Selector */}
        <div className="flex items-center gap-2 bg-[#FEFBFB] p-2 rounded-xl border border-pink-100">
          <span className="text-xs font-semibold text-gray-600">Kỳ làm việc:</span>
          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(Number(e.target.value))}
            className="border border-gray-300 rounded-lg px-2.5 py-1 text-xs outline-none bg-white font-medium text-gray-800"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
              <option key={m} value={m}>Tháng {m}</option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(Number(e.target.value))}
            className="border border-gray-300 rounded-lg px-2.5 py-1 text-xs outline-none bg-white font-medium text-gray-800"
          >
            {[2024, 2025, 2026, 2027].map(y => (
              <option key={y} value={y}>Năm {y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Sub Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveTab('staff')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'staff'
              ? 'bg-[#D97A7D] text-white shadow-sm'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <span>👤 Hồ sơ & Thâm niên</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[11px] ${activeTab === 'staff' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}`}>
            {totalStaffCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('tours')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'tours'
              ? 'bg-[#D97A7D] text-white shadow-sm'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <span>✨ Tour Kỹ thuật viên</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[11px] ${activeTab === 'tours' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}`}>
            {filteredTours.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('attendance')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'attendance'
              ? 'bg-[#D97A7D] text-white shadow-sm'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <span>📅 Bảng Chấm công</span>
        </button>

        <button
          onClick={() => setActiveTab('payroll')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'payroll'
              ? 'bg-[#D97A7D] text-white shadow-sm'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <span>💰 Bảng Lương & Thưởng</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[11px] ${activeTab === 'payroll' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}`}>
            {currentPayrolls.length}
          </span>
        </button>
      </div>

      {/* ==================== TAB 1: STAFF DIRECTORY & SENIORITY ==================== */}
      {activeTab === 'staff' && (
        <div className="space-y-4">
          {/* Quick Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-xl border border-pink-100 shadow-sm">
              <span className="text-xs text-gray-500 font-medium">Tổng số nhân sự</span>
              <p className="text-2xl font-bold font-serif text-[#5C3A3A] mt-1">{totalStaffCount}</p>
              <span className="text-[11px] text-gray-400">Toàn bộ hồ sơ</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-pink-100 shadow-sm">
              <span className="text-xs text-emerald-600 font-medium">Đang làm việc</span>
              <p className="text-2xl font-bold font-serif text-emerald-700 mt-1">{activeStaffCount}</p>
              <span className="text-[11px] text-gray-400">Nhân sự hiện hữu</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-pink-100 shadow-sm">
              <span className="text-xs text-[#D97A7D] font-medium">Kỹ thuật viên Spa</span>
              <p className="text-2xl font-bold font-serif text-[#D97A7D] mt-1">{technicianCount}</p>
              <span className="text-[11px] text-gray-400">Có tính Tour ca làm</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-pink-100 shadow-sm">
              <span className="text-xs text-red-600 font-medium">Đã nghỉ việc</span>
              <p className="text-2xl font-bold font-serif text-red-700 mt-1">{resignedStaffCount}</p>
              <span className="text-[11px] text-gray-400">Đã lưu trữ hồ sơ</span>
            </div>
          </div>

          {/* Action Bar: Filters, Search, Add */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
            {/* Status Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setStaffStatusFilter('active')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  staffStatusFilter === 'active'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Đang làm việc ({activeStaffCount})
              </button>

              <button
                onClick={() => setStaffStatusFilter('resigned')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
                  staffStatusFilter === 'resigned'
                    ? 'bg-red-600 text-white'
                    : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                }`}
              >
                <span>Nhân sự đã nghỉ việc ({resignedStaffCount})</span>
              </button>

              <button
                onClick={() => setStaffStatusFilter('technician')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  staffStatusFilter === 'technician'
                    ? 'bg-[#D97A7D] text-white'
                    : 'bg-pink-50 text-[#D97A7D] hover:bg-pink-100 border border-pink-200'
                }`}
              >
                Kỹ thuật viên ({technicianCount})
              </button>

              <button
                onClick={() => setStaffStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  staffStatusFilter === 'all'
                    ? 'bg-gray-800 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Tất cả ({totalStaffCount})
              </button>
            </div>

            {/* Search & Add Button */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1 md:w-64">
                <input
                  type="text"
                  placeholder="Tìm theo tên, mã NV, số ĐT..."
                  value={staffSearch}
                  onChange={e => setStaffSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg outline-none focus:border-[#D97A7D]"
                />
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 absolute left-2.5 top-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              <button
                onClick={handleOpenCreateStaff}
                className="bg-[#D97A7D] hover:bg-[#c96a6d] text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5 shrink-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Thêm Nhân sự
              </button>
            </div>
          </div>

          {/* Staff Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
                <tr>
                  <th className="p-3">Mã & Nhân sự</th>
                  <th className="p-3">Bộ phận / Chức vụ</th>
                  <th className="p-3">Trạng thái</th>
                  <th className="p-3">Ngày vào làm</th>
                  <th className="p-3">Thâm niên làm việc</th>
                  <th className="p-3 text-right">Lương cơ bản</th>
                  <th className="p-3 text-center">Tour KTV</th>
                  <th className="p-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredStaff.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-gray-400">
                      Không tìm thấy nhân sự phù hợp với điều kiện tìm kiếm.
                    </td>
                  </tr>
                ) : (
                  filteredStaff.map(staff => {
                    const seniority = calculateSeniority(staff.joinDate, staff.resignedDate);
                    const isResigned = staff.status === 'resigned';

                    return (
                      <tr key={staff.id} className={`hover:bg-gray-50/70 transition-colors ${isResigned ? 'bg-red-50/20' : ''}`}>
                        <td className="p-3">
                          <div 
                            onClick={() => handleOpenDailyDetail(staff)}
                            className="flex items-center gap-2 cursor-pointer group"
                            title="Bấm để xem chi tiết tiền công, tour KTV và hoa hồng từng ngày cập nhật thời gian thực"
                          >
                            <span className="font-mono font-bold text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded text-[11px] group-hover:bg-[#D97A7D] group-hover:text-white transition-colors">
                              {staff.code}
                            </span>
                            <div>
                              <p className="font-bold text-gray-900 group-hover:text-[#D97A7D] transition-colors flex items-center gap-1">
                                <span>{staff.name}</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-gray-300 group-hover:text-[#D97A7D] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </p>
                              <span className="text-gray-400 text-[11px]">{staff.phone || 'Chưa có SĐT'}</span>
                            </div>
                          </div>
                        </td>

                        <td className="p-3">
                          <p className="font-medium text-gray-800">{staff.position}</p>
                          <span className="text-gray-400 text-[11px]">{staff.department}</span>
                        </td>

                        <td className="p-3">
                          {isResigned ? (
                            <div>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
                                Đã nghỉ việc
                              </span>
                              {staff.resignedDate && (
                                <p className="text-[10px] text-red-600 mt-0.5">Nghỉ: {staff.resignedDate}</p>
                              )}
                              {staff.resignedReason && (
                                <p className="text-[10px] text-gray-500 italic max-w-[150px] truncate" title={staff.resignedReason}>
                                  Lý do: {staff.resignedReason}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              Đang làm việc
                            </span>
                          )}
                        </td>

                        <td className="p-3 font-medium text-gray-600">
                          {staff.joinDate}
                        </td>

                        <td className="p-3">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-[#D97A7D]">
                                {seniority.displayText}
                              </span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-pink-100 text-[#D97A7D] font-medium">
                                {seniority.levelBadge}
                              </span>
                            </div>
                            <span className="text-[10px] text-gray-400">
                              Cống hiến {seniority.totalDays} ngày {isResigned && '(đến ngày nghỉ)'}
                            </span>
                            {seniority.suggestedAllowance > 0 && !isResigned && (
                              <span className="text-[10px] text-emerald-700 font-medium">
                                Phụ cấp: +{formatVND(seniority.suggestedAllowance)}/th
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="p-3 text-right">
                          <span className="font-bold text-gray-800">{formatVND(staff.baseSalary)}</span>
                          {staff.allowance > 0 && (
                            <p className="text-[10px] text-gray-400">+{formatVND(staff.allowance)} PC</p>
                          )}
                        </td>

                        <td className="p-3 text-center">
                          {staff.isTechnician ? (
                            <div>
                              <span className="px-2 py-0.5 rounded bg-pink-50 text-[#D97A7D] border border-pink-200 font-semibold text-[11px]">
                                {formatVND(staff.tourRateDefault)}/tour
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-300">-</span>
                          )}
                        </td>

                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenDailyDetail(staff)}
                              className="px-2.5 py-1 text-[11px] rounded bg-pink-50 hover:bg-pink-100 text-[#D97A7D] border border-pink-200 font-semibold transition-colors flex items-center gap-1 shadow-2xs"
                              title="Bảng thông tin chi tiết tất cả các ngày: tiền lương ngày, hoa hồng tour KTV và số tour (cập nhật thời gian thực)"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                              </svg>
                              <span>Chi tiết ngày</span>
                            </button>

                            <button
                              onClick={() => handleOpenEditStaff(staff)}
                              className="px-2.5 py-1 text-[11px] rounded bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors"
                              title="Chỉnh sửa hồ sơ"
                            >
                              Sửa
                            </button>

                            {isResigned ? (
                              <button
                                onClick={() => handleReactivateStaff(staff)}
                                className="px-2.5 py-1 text-[11px] rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-medium transition-colors"
                                title="Khôi phục nhân viên trở lại làm việc"
                              >
                                Khôi phục
                              </button>
                            ) : (
                              <button
                                onClick={() => handleOpenResignStaff(staff)}
                                className="px-2.5 py-1 text-[11px] rounded bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-medium transition-colors"
                                title="Chuyển nhân sự sang danh sách Đã nghỉ việc"
                              >
                                Cho nghỉ
                              </button>
                            )}

                            {currentUser.role === Role.Management && (
                              <button
                                onClick={() => {
                                  if (confirm(`Xóa hoàn toàn hồ sơ của ${staff.name}?`)) {
                                    onDeleteStaff(staff.id);
                                  }
                                }}
                                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                title="Xóa vĩnh viễn"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================== TAB 2: TECHNICIAN TOURS ==================== */}
      {activeTab === 'tours' && (
        <div className="space-y-4">
          {/* Tours Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-xl border border-pink-100 shadow-sm">
              <span className="text-xs text-gray-500 font-medium">Tổng Tour trong tháng</span>
              <p className="text-2xl font-bold font-serif text-[#D97A7D] mt-1">{totalTourCount} tour</p>
              <span className="text-[11px] text-gray-400">Tháng {selectedMonth}/{selectedYear}</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-pink-100 shadow-sm">
              <span className="text-xs text-emerald-600 font-medium">Tổng hoa hồng Tour KTV</span>
              <p className="text-2xl font-bold font-serif text-emerald-700 mt-1">{formatVND(totalTourCommission)}</p>
              <span className="text-[11px] text-gray-400">Được cộng vào lương</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-pink-100 shadow-sm">
              <span className="text-xs text-purple-600 font-medium">Tổng tiền Tip của khách</span>
              <p className="text-2xl font-bold font-serif text-purple-700 mt-1">{formatVND(totalTourTips)}</p>
              <span className="text-[11px] text-gray-400">KTV nhận trực tiếp</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-pink-100 shadow-sm">
              <span className="text-xs text-amber-600 font-medium">KTV dẫn đầu Tour</span>
              <p className="text-lg font-bold text-gray-800 mt-1 truncate">
                {topTech ? topTech.name : 'Chưa có dữ liệu'}
              </p>
              <span className="text-[11px] text-[#D97A7D] font-semibold">
                {topTech ? `${topTech.count} tour (${formatVND(topTech.commission)})` : '-'}
              </span>
            </div>
          </div>

          {/* Action Header */}
          <div className="flex justify-between items-center bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-xs text-gray-700">Lịch sử Tour Kỹ thuật viên</span>
              <span className="text-xs text-gray-400">|</span>
              <span className="text-xs text-gray-500">
                Tháng {selectedMonth}/{selectedYear}
              </span>
            </div>

            <button
              onClick={() => {
                setTourToEdit(null);
                setIsTourModalOpen(true);
              }}
              className="bg-[#D97A7D] hover:bg-[#c96a6d] text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Ghi nhận Tour Mới
            </button>
          </div>

          {/* Tours Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
                <tr>
                  <th className="p-3">Thời gian</th>
                  <th className="p-3">Kỹ thuật viên</th>
                  <th className="p-3">Dịch vụ Spa & Phòng</th>
                  <th className="p-3">Khách hàng</th>
                  <th className="p-3 text-center">Thời lượng</th>
                  <th className="p-3 text-right">Hoa hồng Tour</th>
                  <th className="p-3 text-right">Tiền Tip</th>
                  <th className="p-3 text-center">Đánh giá</th>
                  <th className="p-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTours.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-gray-400">
                      Chưa có tour dịch vụ nào được ghi nhận trong Tháng {selectedMonth}/{selectedYear}.
                    </td>
                  </tr>
                ) : (
                  filteredTours.map(tour => (
                    <tr key={tour.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="p-3 whitespace-nowrap">
                        <span className="font-medium text-gray-900">{tour.date}</span>
                        {tour.time && (
                          <span className="text-gray-400 text-[11px] block">{tour.time}</span>
                        )}
                      </td>

                      <td className="p-3">
                        <button
                          onClick={() => {
                            const st = staffList.find(s => s.id === tour.technicianId);
                            if (st) handleOpenDailyDetail(st);
                          }}
                          className="font-bold text-gray-900 hover:text-[#D97A7D] transition-colors text-left flex items-center gap-1"
                          title="Bấm để xem bảng chi tiết tất cả các ngày của KTV này"
                        >
                          <span>{tour.technicianName}</span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-gray-300 hover:text-[#D97A7D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </button>
                      </td>

                      <td className="p-3">
                        <p className="font-medium text-gray-800">{tour.serviceName}</p>
                        <span className="text-[11px] text-gray-400">{tour.room || 'Phòng Spa'}</span>
                      </td>

                      <td className="p-3">
                        <span className="text-gray-700">{tour.customerName || 'Khách vãng lai'}</span>
                      </td>

                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-medium">
                          {tour.durationMinutes} phút
                        </span>
                      </td>

                      <td className="p-3 text-right font-bold text-emerald-700">
                        +{formatVND(tour.commissionAmount)}
                      </td>

                      <td className="p-3 text-right text-purple-700 font-medium">
                        {tour.tipAmount ? `+${formatVND(tour.tipAmount)}` : '-'}
                      </td>

                      <td className="p-3 text-center">
                        <span className="text-amber-500 font-medium">
                          {'★'.repeat(tour.rating || 5)}
                        </span>
                      </td>

                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setTourToEdit(tour);
                              setIsTourModalOpen(true);
                            }}
                            className="p-1 text-gray-500 hover:text-gray-800"
                            title="Sửa tour"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Xóa tour này khỏi hệ thống?')) {
                                onDeleteTour(tour.id);
                              }
                            }}
                            className="p-1 text-gray-400 hover:text-red-600"
                            title="Xóa tour"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================== TAB 3: ATTENDANCE & TIMESHEET ==================== */}
      {activeTab === 'attendance' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div>
              <h3 className="font-serif font-bold text-base text-[#5C3A3A]">
                Bảng Chấm Công Tháng {selectedMonth}/{selectedYear}
              </h3>
              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-1">
                <span>Ký hiệu:</span>
                <span className="flex items-center gap-1"><strong className="text-emerald-700 bg-emerald-50 px-1 rounded border">P</strong>: Đủ công (1.0)</span>
                <span className="flex items-center gap-1"><strong className="text-amber-700 bg-amber-50 px-1 rounded border">N</strong>: Nửa công (0.5)</span>
                <span className="flex items-center gap-1"><strong className="text-blue-700 bg-blue-50 px-1 rounded border">CP</strong>: Phép (1.0)</span>
                <span className="flex items-center gap-1"><strong className="text-red-700 bg-red-50 px-1 rounded border">KP</strong>: Không phép</span>
                <span className="flex items-center gap-1"><strong className="text-gray-600 bg-gray-100 px-1 rounded border">OFF</strong>: Nghỉ tuần</span>
                <span className="flex items-center gap-1"><strong className="text-purple-700 bg-purple-50 px-1 rounded border">OT</strong>: Tăng ca</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleQuickFillAttendance}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
                title="Chấm công chuẩn nhanh cho cả tháng"
              >
                ⚡ Chấm công nhanh cả tháng
              </button>
            </div>
          </div>

          {/* Attendance Grid */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
            <table className="w-full text-[11px] text-left border-collapse">
              <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
                <tr>
                  <th className="p-2.5 sticky left-0 bg-gray-50 z-10 w-44 min-w-[160px] border-r">
                    Nhân viên
                  </th>
                  {daysArray.map(d => {
                    const isSunday = new Date(selectedYear, selectedMonth - 1, d).getDay() === 0;
                    return (
                      <th
                        key={d}
                        className={`p-1 text-center min-w-[28px] border-r ${
                          isSunday ? 'bg-pink-100 text-[#D97A7D] font-bold' : ''
                        }`}
                      >
                        {d}
                      </th>
                    );
                  })}
                  <th className="p-2 text-center bg-pink-50 text-[#D97A7D] font-bold min-w-[45px]">
                    Công
                  </th>
                  <th className="p-2 text-center text-blue-700 min-w-[40px]">
                    Phép
                  </th>
                  <th className="p-2 text-center text-red-700 min-w-[40px]">
                    KP
                  </th>
                  <th className="p-2 text-center text-purple-700 min-w-[40px]">
                    OT (h)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {staffList.filter(s => s.status === 'active').map(staff => {
                  const record = attendanceList.find(a => a.staffId === staff.id && a.month === selectedMonth && a.year === selectedYear);
                  const days = record?.days || {};

                  return (
                    <tr key={staff.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="p-2.5 sticky left-0 bg-white z-10 border-r shadow-[1px_0_3px_rgba(0,0,0,0.05)]">
                        <div 
                          onClick={() => handleOpenDailyDetail(staff)}
                          className="flex items-center gap-1.5 cursor-pointer group"
                          title="Nhấp để xem chi tiết tiền công, tour KTV theo từng ngày"
                        >
                          <span className="font-mono text-[10px] text-gray-500 font-bold group-hover:text-[#D97A7D]">{staff.code}</span>
                          <div>
                            <p className="font-bold text-gray-900 truncate max-w-[110px] group-hover:text-[#D97A7D] transition-colors">{staff.name}</p>
                            <span className="text-[10px] text-gray-400 block truncate max-w-[110px]">{staff.position}</span>
                          </div>
                        </div>
                      </td>

                      {daysArray.map(d => {
                        const status = days[d] || 'OFF';
                        const isSunday = new Date(selectedYear, selectedMonth - 1, d).getDay() === 0;
                        let colorClass = 'text-gray-400 bg-gray-50';
                        if (status === 'P') colorClass = 'text-emerald-700 bg-emerald-50 font-bold';
                        else if (status === 'N') colorClass = 'text-amber-700 bg-amber-50 font-bold';
                        else if (status === 'CP') colorClass = 'text-blue-700 bg-blue-50 font-bold';
                        else if (status === 'KP') colorClass = 'text-red-700 bg-red-100 font-bold';
                        else if (status === 'OT') colorClass = 'text-purple-700 bg-purple-50 font-bold';

                        return (
                          <td
                            key={d}
                            onClick={() => handleToggleAttendanceDay(staff.id, d)}
                            className={`p-1 text-center cursor-pointer select-none border-r hover:opacity-80 transition-all ${colorClass} ${
                              isSunday && status === 'OFF' ? 'bg-pink-50/40 text-pink-400' : ''
                            }`}
                            title={`Ngày ${d}/${selectedMonth} - Bấm để chuyển đổi`}
                          >
                            {status}
                          </td>
                        );
                      })}

                      <td className="p-2 text-center font-bold text-gray-900 bg-pink-50/50">
                        {record ? record.totalWorkDays : 0}
                      </td>

                      <td className="p-2 text-center text-blue-700 font-semibold">
                        {record?.leaveDays || 0}
                      </td>

                      <td className="p-2 text-center text-red-700 font-semibold">
                        {record?.unauthorizedLeaveDays || 0}
                      </td>

                      <td className="p-2 text-center text-purple-700 font-semibold">
                        {record?.otHours || 0}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-gray-400 italic">
            * Mẹo: Nhấp vào từng ô ngày bất kỳ để thay đổi trạng thái chấm công (P: Đủ công &rarr; N: Nửa công &rarr; CP: Có phép &rarr; KP: Không phép &rarr; OFF: Nghỉ &rarr; OT: Tăng ca).
          </p>
        </div>
      )}

      {/* ==================== TAB 4: PAYROLL & BONUSES ==================== */}
      {activeTab === 'payroll' && (
        <div className="space-y-4">
          {/* Payroll Summary Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-xl border border-pink-100 shadow-sm">
              <span className="text-xs text-gray-500 font-medium">Tổng quỹ lương thực lĩnh</span>
              <p className="text-2xl font-bold font-serif text-[#D97A7D] mt-1">{formatVND(totalPayrollFund)}</p>
              <span className="text-[11px] text-gray-400">Tháng {selectedMonth}/{selectedYear}</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-pink-100 shadow-sm">
              <span className="text-xs text-emerald-600 font-medium">Tổng tiền Tour KTV chi trả</span>
              <p className="text-2xl font-bold font-serif text-emerald-700 mt-1">
                {formatVND(currentPayrolls.reduce((s, p) => s + p.tourCommission, 0))}
              </p>
              <span className="text-[11px] text-gray-400">
                {currentPayrolls.reduce((s, p) => s + p.tourCount, 0)} lượt tour
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-pink-100 shadow-sm">
              <span className="text-xs text-blue-600 font-medium">Tổng phụ cấp thâm niên</span>
              <p className="text-2xl font-bold font-serif text-blue-700 mt-1">
                {formatVND(currentPayrolls.reduce((s, p) => s + p.seniorityAllowance, 0))}
              </p>
              <span className="text-[11px] text-gray-400">Đãi ngộ gắn bó cống hiến</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-pink-100 shadow-sm">
              <span className="text-xs text-purple-600 font-medium">Tổng thưởng hiệu suất</span>
              <p className="text-2xl font-bold font-serif text-purple-700 mt-1">
                {formatVND(currentPayrolls.reduce((s, p) => s + p.bonus, 0))}
              </p>
              <span className="text-[11px] text-gray-400">Thưởng lễ & doanh số</span>
            </div>
          </div>

          {/* Action Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm">
            <div>
              <h3 className="font-serif font-bold text-sm text-[#5C3A3A]">
                Bảng Lương Tháng {selectedMonth} Năm {selectedYear}
              </h3>
              <p className="text-xs text-gray-500">
                Lương tự động liên kết với ngày công thực tế, hoa hồng tour KTV và phụ cấp thâm niên.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleAutoCalculatePayroll}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
                title="Tính lại toàn bộ lương dựa trên chấm công và tour mới nhất"
              >
                ⚡ Tự động tính lương tháng
              </button>

              <button
                onClick={() => {
                  if (confirm(`Xác nhận đánh dấu "ĐÃ THANH TOÁN" cho tất cả phiếu lương Tháng ${selectedMonth}/${selectedYear}?`)) {
                    const paidAll = currentPayrolls.map(p => ({ ...p, status: 'paid' as const, paidDate: new Date().toISOString().split('T')[0] }));
                    onBatchUpdatePayroll(paidAll);
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-colors"
              >
                Duyệt chi toàn bộ
              </button>
            </div>
          </div>

          {/* Payroll Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
                <tr>
                  <th className="p-3">Mã & Nhân sự</th>
                  <th className="p-3">Chức vụ</th>
                  <th className="p-3 text-center">Ngày công</th>
                  <th className="p-3 text-right">Lương theo công</th>
                  <th className="p-3 text-right">Phụ cấp Thâm niên</th>
                  <th className="p-3 text-right">Hoa hồng Tour</th>
                  <th className="p-3 text-right">Thưởng / Phạt</th>
                  <th className="p-3 text-right">THỰC LĨNH</th>
                  <th className="p-3 text-center">Trạng thái</th>
                  <th className="p-3 text-right">Phiếu lương</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentPayrolls.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-gray-400">
                      Chưa có bảng tính lương cho Tháng {selectedMonth}/{selectedYear}. Hãy nhấn <strong>"Tự động tính lương tháng"</strong> để khởi tạo.
                    </td>
                  </tr>
                ) : (
                  currentPayrolls.map(payroll => {
                    return (
                      <tr key={payroll.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="p-3">
                          <div
                            onClick={() => {
                              const st = staffList.find(s => s.id === payroll.staffId);
                              if (st) handleOpenDailyDetail(st);
                            }}
                            className="cursor-pointer group"
                            title="Bấm để xem chi tiết tiền công, tour KTV theo từng ngày"
                          >
                            <span className="font-mono font-bold text-gray-600 bg-gray-100 px-1 py-0.5 rounded text-[10px] group-hover:bg-[#D97A7D] group-hover:text-white transition-colors">
                              {payroll.staffCode}
                            </span>
                            <p className="font-bold text-gray-900 mt-0.5 group-hover:text-[#D97A7D] transition-colors">{payroll.staffName}</p>
                          </div>
                        </td>

                        <td className="p-3 text-gray-700">
                          {payroll.position}
                        </td>

                        <td className="p-3 text-center">
                          <span className="font-bold text-gray-800">{payroll.actualWorkDays}</span>
                          <span className="text-gray-400 text-[10px]">/{payroll.standardWorkDays}</span>
                        </td>

                        <td className="p-3 text-right font-medium text-gray-800">
                          {formatVND(payroll.salaryByWorkDays)}
                        </td>

                        <td className="p-3 text-right text-emerald-700 font-medium">
                          +{formatVND(payroll.seniorityAllowance)}
                        </td>

                        <td className="p-3 text-right text-[#D97A7D] font-medium">
                          {payroll.tourCommission > 0 ? `+${formatVND(payroll.tourCommission)} (${payroll.tourCount} tour)` : '-'}
                        </td>

                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleOpenEditBonus(payroll)}
                            className="hover:underline text-left inline-block"
                            title="Bấm để chỉnh sửa Thưởng và Giảm trừ"
                          >
                            {payroll.bonus > 0 && (
                              <span className="text-emerald-700 block font-medium">+{formatVND(payroll.bonus)}</span>
                            )}
                            {payroll.deduction > 0 && (
                              <span className="text-red-600 block font-medium">-{formatVND(payroll.deduction)}</span>
                            )}
                            {payroll.bonus === 0 && payroll.deduction === 0 && (
                              <span className="text-gray-400 text-[11px] hover:text-gray-600">Thêm thưởng/phạt</span>
                            )}
                          </button>
                        </td>

                        <td className="p-3 text-right font-bold font-serif text-sm text-[#D97A7D]">
                          {formatVND(payroll.netSalary)}
                        </td>

                        <td className="p-3 text-center">
                          {payroll.status === 'paid' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              Đã trả
                            </span>
                          ) : payroll.status === 'confirmed' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                              Đã duyệt
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              Bản nháp
                            </span>
                          )}
                        </td>

                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                const st = staffList.find(s => s.id === payroll.staffId);
                                if (st) handleOpenDailyDetail(st);
                              }}
                              className="px-2 py-1 text-[11px] rounded bg-pink-50 hover:bg-pink-100 text-[#D97A7D] border border-pink-200 font-medium transition-colors"
                              title="Bảng chi tiết tất cả các ngày: tiền lương ngày, hoa hồng tour KTV và số tour"
                            >
                              Chi tiết ngày
                            </button>
                            <button
                              onClick={() => {
                                setSelectedPayslip(payroll);
                                setIsPayslipModalOpen(true);
                              }}
                              className="px-2.5 py-1 text-[11px] rounded bg-[#D97A7D]/10 hover:bg-[#D97A7D]/20 text-[#D97A7D] font-medium transition-colors"
                            >
                              Xem phiếu
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: Staff Modal (Create / Edit / Resign) */}
      <StaffModal
        isOpen={isStaffModalOpen}
        onClose={() => setIsStaffModalOpen(false)}
        staffToEdit={staffToEdit}
        mode={staffModalMode}
        onSave={(staff) => {
          if (staffModalMode === 'create') {
            onAddStaff(staff);
          } else {
            onUpdateStaff(staff);
          }
        }}
      />

      {/* MODAL 2: Tour Modal (Create / Edit) */}
      <TourModal
        isOpen={isTourModalOpen}
        onClose={() => setIsTourModalOpen(false)}
        tourToEdit={tourToEdit}
        technicians={staffList}
        services={services}
        currentUser={currentUser}
        onSave={(tour) => {
          onSaveTour(tour);
        }}
      />

      {/* MODAL 3: Detailed Payslip Modal */}
      <PayslipModal
        isOpen={isPayslipModalOpen}
        onClose={() => setIsPayslipModalOpen(false)}
        payroll={selectedPayslip}
        staff={staffList.find(s => s.id === selectedPayslip?.staffId)}
        onUpdateStatus={(newStatus) => {
          if (selectedPayslip) {
            const updated = {
              ...selectedPayslip,
              status: newStatus,
              paidDate: newStatus === 'paid' ? new Date().toISOString().split('T')[0] : selectedPayslip.paidDate
            };
            onSavePayroll(updated);
            setSelectedPayslip(updated);
          }
        }}
      />

      {/* MODAL 4: Quick Edit Bonus & Deduction Modal */}
      {editingPayroll && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-5 m-4">
            <h3 className="text-base font-bold font-serif text-[#5C3A3A] mb-3">
              Chỉnh sửa Thưởng & Giảm trừ: {editingPayroll.staffName}
            </h3>
            <form onSubmit={handleSaveBonusEdit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-emerald-800 mb-1">Tiền thưởng (VND)</label>
                <input
                  type="number"
                  step={50000}
                  value={editBonusVal}
                  onChange={e => setEditBonusVal(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-emerald-600 font-bold text-emerald-700"
                />
                <span className="text-[10px] text-gray-500">{formatVND(editBonusVal)}</span>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Lý do thưởng</label>
                <input
                  type="text"
                  value={editBonusReason}
                  onChange={e => setEditBonusReason(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#D97A7D]"
                  placeholder="Thưởng hiệu suất, thưởng chuyên cần, lễ 2/9..."
                />
              </div>

              <div className="border-t border-gray-100 pt-2">
                <label className="block font-semibold text-red-800 mb-1">Giảm trừ / Phạt / Tạm ứng (VND)</label>
                <input
                  type="number"
                  step={50000}
                  value={editDeductionVal}
                  onChange={e => setEditDeductionVal(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-red-600 font-bold text-red-600"
                />
                <span className="text-[10px] text-gray-500">{formatVND(editDeductionVal)}</span>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Lý do giảm trừ</label>
                <input
                  type="text"
                  value={editDeductionReason}
                  onChange={e => setEditDeductionReason(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#D97A7D]"
                  placeholder="Đi trễ, vi phạm quy định, tạm ứng lương..."
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setEditingPayroll(null)}
                  className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs text-white bg-[#D97A7D] hover:bg-[#c96a6d] font-semibold rounded-lg"
                >
                  Cập nhật lương
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* MODAL 4: Staff Daily Detail Modal (Real-time day-by-day earnings, tours, commissions) */}
      {isDailyDetailOpen && dailyDetailStaff && (
        <StaffDailyDetailModal
          isOpen={isDailyDetailOpen}
          onClose={() => {
            setIsDailyDetailOpen(false);
            setDailyDetailStaff(null);
          }}
          staff={dailyDetailStaff}
          initialMonth={selectedMonth}
          initialYear={selectedYear}
          attendanceList={attendanceList}
          allTours={toursList || []}
          onToggleDayAttendance={handleToggleAttendanceDay}
        />
      )}
    </div>
  );
};

export default HRManagement;

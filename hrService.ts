import { StaffMember, AttendanceRecord, TechnicianTour, PayrollRecord, DayAttendanceStatus } from './types';
import { loadLocalData, saveLocalData } from './storageService';

export const HR_STORAGE_KEYS = {
  STAFF: 'wellness_staff_data',
  ATTENDANCE: 'wellness_attendance_data',
  TOURS: 'wellness_technician_tours_data',
  PAYROLL: 'wellness_payroll_data',
};

// --- DEFAULT INITIAL DATA ---

export const DEFAULT_STAFF: StaffMember[] = [
  {
    id: 'staff-01',
    code: 'KTV01',
    name: 'Nguyễn Thị Mai',
    phone: '0901 234 567',
    email: 'mai.nguyen@wellness.vn',
    position: 'Kỹ thuật viên Trưởng',
    department: 'Kỹ thuật Spa',
    isTechnician: true,
    status: 'active',
    joinDate: '2022-03-10',
    baseSalary: 9000000,
    allowance: 1500000,
    tourRateDefault: 100000,
    bankAccount: '1903456789001',
    bankName: 'Techcombank',
    citizenId: '001198003456',
    note: 'Kỹ thuật viên tay nghề cao, chuyên massage trị liệu và đào tạo nhân viên mới.'
  },
  {
    id: 'staff-02',
    code: 'KTV02',
    name: 'Lê Thu Trang',
    phone: '0912 345 678',
    email: 'trang.le@wellness.vn',
    position: 'Kỹ thuật viên Body & Facial',
    department: 'Kỹ thuật Spa',
    isTechnician: true,
    status: 'active',
    joinDate: '2023-06-15',
    baseSalary: 8000000,
    allowance: 1000000,
    tourRateDefault: 80000,
    bankAccount: '0071001234567',
    bankName: 'Vietcombank',
    citizenId: '001199004567',
    note: 'Chuyên về chăm sóc da mặt chuyên sâu và nâng cơ trẻ hóa.'
  },
  {
    id: 'staff-03',
    code: 'KTV03',
    name: 'Trần Kim Ngân',
    phone: '0983 456 789',
    email: 'ngan.tran@wellness.vn',
    position: 'Kỹ thuật viên Dưỡng sinh',
    department: 'Kỹ thuật Spa',
    isTechnician: true,
    status: 'active',
    joinDate: '2024-01-20',
    baseSalary: 7500000,
    allowance: 800000,
    tourRateDefault: 80000,
    bankAccount: '102874659201',
    bankName: 'MBBank',
    citizenId: '001200005678',
    note: 'Chuyên gội đầu dưỡng sinh thảo dược và massage vai gáy.'
  },
  {
    id: 'staff-04',
    code: 'KTV04',
    name: 'Hoàng Bảo Yến',
    phone: '0978 123 456',
    email: 'yen.hoang@wellness.vn',
    position: 'Kỹ thuật viên Spa',
    department: 'Kỹ thuật Spa',
    isTechnician: true,
    status: 'active',
    joinDate: '2025-08-01',
    baseSalary: 7000000,
    allowance: 600000,
    tourRateDefault: 70000,
    bankAccount: '0451000345678',
    bankName: 'Vietcombank',
    citizenId: '001202006789',
    note: 'Nhân viên trẻ nhiệt tình, phản hồi khách hàng rất tốt.'
  },
  {
    id: 'staff-05',
    code: 'LT01',
    name: 'Phạm Mỹ Duyên',
    phone: '0934 567 890',
    email: 'duyen.pham@wellness.vn',
    position: 'Trưởng nhóm Lễ tân & Thu ngân',
    department: 'Lễ tân',
    isTechnician: false,
    status: 'active',
    joinDate: '2023-11-05',
    baseSalary: 8500000,
    allowance: 1000000,
    tourRateDefault: 0,
    bankAccount: '1903567890123',
    bankName: 'Techcombank',
    citizenId: '001197007890',
    note: 'Quản lý lịch hẹn, đón tiếp và tư vấn dịch vụ.'
  },
  {
    id: 'staff-06',
    code: 'KT01',
    name: 'Vũ Hải Đăng',
    phone: '0945 678 901',
    email: 'dang.vu@wellness.vn',
    position: 'Kế toán tổng hợp',
    department: 'Kế toán',
    isTechnician: false,
    status: 'active',
    joinDate: '2023-04-12',
    baseSalary: 10000000,
    allowance: 1200000,
    tourRateDefault: 0,
    bankAccount: '0011000987654',
    bankName: 'Vietcombank',
    citizenId: '001195008901',
    note: 'Phụ trách thu chi, tính lương và báo cáo tài chính.'
  },
  {
    id: 'staff-07',
    code: 'QL01',
    name: 'Đặng Minh Hùng',
    phone: '0918 765 432',
    email: 'hung.dang@wellness.vn',
    position: 'Quản lý vận hành cơ sở',
    department: 'Ban Quản lý',
    isTechnician: false,
    status: 'active',
    joinDate: '2021-10-01',
    baseSalary: 15000000,
    allowance: 3000000,
    tourRateDefault: 0,
    bankAccount: '1902876543210',
    bankName: 'Techcombank',
    citizenId: '001190009012',
    note: 'Điều hành hoạt động toàn cơ sở Wellness.'
  },
  // --- NHÂN SỰ ĐÃ NGHỈ VIỆC ---
  {
    id: 'staff-08',
    code: 'KTV05',
    name: 'Phan Hoài An',
    phone: '0922 333 444',
    email: 'an.phan@gmail.com',
    position: 'Kỹ thuật viên Spa',
    department: 'Kỹ thuật Spa',
    isTechnician: true,
    status: 'resigned',
    joinDate: '2023-02-15',
    resignedDate: '2026-03-10',
    resignedReason: 'Chuyển nơi sinh sống về quê Đà Nẵng cùng gia đình',
    baseSalary: 7500000,
    allowance: 600000,
    tourRateDefault: 70000,
    bankAccount: '1903444555666',
    bankName: 'Techcombank',
    citizenId: '001199009876',
    note: 'Đã hoàn tất bàn giao dụng cụ, thanh toán đầy đủ lương và các khoản bảo hiểm.'
  },
  {
    id: 'staff-09',
    code: 'LT02',
    name: 'Bùi Lan Hương',
    phone: '0933 444 555',
    email: 'huong.bui@gmail.com',
    position: 'Nhân viên Lễ tân',
    department: 'Lễ tân',
    isTechnician: false,
    status: 'resigned',
    joinDate: '2024-05-10',
    resignedDate: '2026-01-15',
    resignedReason: 'Nhận được học bổng du học Thạc sĩ tại Nhật Bản',
    baseSalary: 7000000,
    allowance: 500000,
    tourRateDefault: 0,
    bankAccount: '0071004445556',
    bankName: 'Vietcombank',
    citizenId: '001201008765',
    note: 'Đã bàn giao sổ sách lịch hẹn và thu ngân ca.'
  }
];

// Sample Initial Tours for current month (Sep 2026)
export const DEFAULT_TOURS: TechnicianTour[] = [
  {
    id: 'tour-01',
    technicianId: 'staff-01',
    technicianName: 'Nguyễn Thị Mai',
    date: '2026-09-07',
    time: '09:30',
    serviceName: 'Massage Body Đá Nóng Trị Liệu',
    customerName: 'Chị Hoàng Lan',
    room: 'Phòng VIP 01',
    durationMinutes: 90,
    commissionAmount: 120000,
    tipAmount: 50000,
    rating: 5,
    note: 'Khách yêu cầu lực mạnh vùng vai gáy, khen rất hài lòng'
  },
  {
    id: 'tour-02',
    technicianId: 'staff-02',
    technicianName: 'Lê Thu Trang',
    date: '2026-09-07',
    time: '10:00',
    serviceName: 'Chăm Sóc Da Mặt Chuyên Sâu & Nâng Cơ',
    customerName: 'Chị Minh Thư',
    room: 'Phòng Facial 02',
    durationMinutes: 60,
    commissionAmount: 90000,
    tipAmount: 30000,
    rating: 5,
    note: 'Khách làm dịch vụ theo gói 10 buổi'
  },
  {
    id: 'tour-03',
    technicianId: 'staff-03',
    technicianName: 'Trần Kim Ngân',
    date: '2026-09-07',
    time: '11:15',
    serviceName: 'Gội Đầu Dưỡng Sinh Thảo Dược Thượng Hạng',
    customerName: 'Anh Quốc Bảo',
    room: 'Phòng Gội 01',
    durationMinutes: 60,
    commissionAmount: 80000,
    tipAmount: 20000,
    rating: 5,
    note: 'Kèm massage cổ vai gáy thảo dược'
  },
  {
    id: 'tour-04',
    technicianId: 'staff-01',
    technicianName: 'Nguyễn Thị Mai',
    date: '2026-09-06',
    time: '14:00',
    serviceName: 'Massage Tinh Dầu Thụy Điển Thư Giãn',
    customerName: 'Chị Thảo Vy',
    room: 'Phòng Body 03',
    durationMinutes: 60,
    commissionAmount: 100000,
    tipAmount: 50000,
    rating: 5,
  },
  {
    id: 'tour-05',
    technicianId: 'staff-04',
    technicianName: 'Hoàng Bảo Yến',
    date: '2026-09-06',
    time: '15:30',
    serviceName: 'Tẩy Tế Bào Chết & Ủ Dưỡng Toàn Thân',
    customerName: 'Chị Ngọc Trâm',
    room: 'Phòng Body 01',
    durationMinutes: 60,
    commissionAmount: 80000,
    tipAmount: 30000,
    rating: 4,
  },
  {
    id: 'tour-06',
    technicianId: 'staff-02',
    technicianName: 'Lê Thu Trang',
    date: '2026-09-05',
    time: '16:00',
    serviceName: 'Trẻ Hóa Da Công Nghệ Ánh Sáng Sinh Học',
    customerName: 'Chị Thu Hà',
    room: 'Phòng Facial 01',
    durationMinutes: 90,
    commissionAmount: 110000,
    tipAmount: 100000,
    rating: 5,
  },
  {
    id: 'tour-07',
    technicianId: 'staff-03',
    technicianName: 'Trần Kim Ngân',
    date: '2026-09-05',
    time: '17:30',
    serviceName: 'Massage Cổ Vai Gáy Chuyên Sâu',
    customerName: 'Anh Tuấn Anh',
    room: 'Phòng VIP 02',
    durationMinutes: 45,
    commissionAmount: 70000,
    rating: 5,
  },
  {
    id: 'tour-08',
    technicianId: 'staff-04',
    technicianName: 'Hoàng Bảo Yến',
    date: '2026-09-04',
    time: '13:00',
    serviceName: 'Chăm Sóc Da Căn Bản',
    customerName: 'Chị Phương Anh',
    room: 'Phòng Facial 02',
    durationMinutes: 45,
    commissionAmount: 60000,
    rating: 4,
  }
];

// Sample Initial Attendance for current month
export function generateInitialAttendance(staffList: StaffMember[], month = 9, year = 2026): AttendanceRecord[] {
  return staffList.filter(s => s.status === 'active').map(s => {
    const days: Record<number, DayAttendanceStatus> = {};
    let workDays = 0;
    let leave = 0;
    
    // Fill sample for days 1 to 7
    for (let d = 1; d <= 7; d++) {
      if (d === 6) {
        // weekend Sunday
        days[d] = 'OFF';
      } else if (d === 3 && s.code === 'KTV04') {
        days[d] = 'CP'; // 1 day leave
        leave += 1;
      } else {
        days[d] = 'P';
        workDays += 1;
      }
    }

    return {
      id: `att-${s.id}-${year}-${month}`,
      staffId: s.id,
      month,
      year,
      days,
      totalWorkDays: workDays,
      leaveDays: leave,
      unauthorizedLeaveDays: 0,
      otHours: s.isTechnician ? 2 : 0,
      note: 'Dữ liệu chấm công tuần đầu tháng'
    };
  });
}

// --- UTILITY: Seniority Calculation ---

export interface SeniorityInfo {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  displayText: string;
  levelBadge: string;
  suggestedAllowance: number;
  isMilestone: boolean;
}

export function calculateSeniority(joinDateStr: string, resignedDateStr?: string): SeniorityInfo {
  if (!joinDateStr) {
    return {
      years: 0,
      months: 0,
      days: 0,
      totalDays: 0,
      displayText: 'Chưa xác định',
      levelBadge: 'Chưa xác định',
      suggestedAllowance: 0,
      isMilestone: false
    };
  }

  const start = new Date(joinDateStr);
  const end = resignedDateStr ? new Date(resignedDateStr) : new Date();

  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  let days = end.getDate() - start.getDate();

  if (days < 0) {
    months -= 1;
    const prevMonthLastDay = new Date(end.getFullYear(), end.getMonth(), 0).getDate();
    days += prevMonthLastDay;
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const diffMs = Math.max(0, end.getTime() - start.getTime());
  const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  let textParts: string[] = [];
  if (years > 0) textParts.push(`${years} năm`);
  if (months > 0) textParts.push(`${months} tháng`);
  if (years === 0 && months === 0) textParts.push(`${days} ngày`);
  const displayText = textParts.join(' ') || 'Dưới 1 tháng';

  let levelBadge = 'Mới vào nghề';
  let suggestedAllowance = 0;
  let isMilestone = false;

  if (years >= 5) {
    levelBadge = 'Thâm niên 5+ năm';
    suggestedAllowance = 1500000;
    isMilestone = true;
  } else if (years >= 3) {
    levelBadge = 'Thâm niên 3+ năm';
    suggestedAllowance = 1000000;
    isMilestone = true;
  } else if (years >= 2) {
    levelBadge = 'Thâm niên 2 năm';
    suggestedAllowance = 600000;
    isMilestone = true;
  } else if (years >= 1) {
    levelBadge = 'Thâm niên 1 năm';
    suggestedAllowance = 300000;
    isMilestone = true;
  } else if (months >= 6) {
    levelBadge = 'Chính thức (6T+)';
    suggestedAllowance = 100000;
  } else {
    levelBadge = 'Thử việc / Mới';
    suggestedAllowance = 0;
  }

  return {
    years,
    months,
    days,
    totalDays,
    displayText,
    levelBadge,
    suggestedAllowance,
    isMilestone
  };
}

// Format Currency
export function formatVND(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '0 đ';
  return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
}

// Calculate Auto Payroll for a staff member
export function computePayroll(
  staff: StaffMember,
  attendance: AttendanceRecord | undefined,
  tours: TechnicianTour[],
  month: number,
  year: number,
  existingRecord?: Partial<PayrollRecord>
): PayrollRecord {
  const standardDays = existingRecord?.standardWorkDays || 26;
  const actualDays = attendance ? attendance.totalWorkDays : (existingRecord?.actualWorkDays || 26);
  
  // Base pro-rated salary
  const baseSalary = staff.baseSalary || 0;
  const salaryByWorkDays = Math.round((baseSalary / standardDays) * actualDays);

  // Seniority allowance
  const seniority = calculateSeniority(staff.joinDate, staff.resignedDate);
  const seniorityAllowance = existingRecord?.seniorityAllowance !== undefined 
    ? existingRecord.seniorityAllowance 
    : seniority.suggestedAllowance;

  // Other fixed allowances
  const otherAllowance = existingRecord?.otherAllowance !== undefined
    ? existingRecord.otherAllowance
    : (staff.allowance || 0);

  // Tours commission in this month
  const staffTours = tours.filter(t => {
    if (t.technicianId !== staff.id) return false;
    const tourDate = new Date(t.date);
    return tourDate.getMonth() + 1 === month && tourDate.getFullYear() === year;
  });

  const tourCount = staffTours.length;
  const tourCommission = staffTours.reduce((sum, t) => sum + (t.commissionAmount || 0), 0);

  // Bonus & Deductions
  const bonus = existingRecord?.bonus || 0;
  const deduction = existingRecord?.deduction || 0;

  // Net Salary
  const netSalary = Math.max(0, salaryByWorkDays + seniorityAllowance + otherAllowance + tourCommission + bonus - deduction);

  return {
    id: existingRecord?.id || `payroll-${staff.id}-${year}-${month}`,
    staffId: staff.id,
    staffName: staff.name,
    staffCode: staff.code,
    position: staff.position,
    month,
    year,
    standardWorkDays: standardDays,
    actualWorkDays: actualDays,
    baseSalary,
    salaryByWorkDays,
    seniorityAllowance,
    otherAllowance,
    tourCount,
    tourCommission,
    bonus,
    bonusReason: existingRecord?.bonusReason || '',
    deduction,
    deductionReason: existingRecord?.deductionReason || '',
    netSalary,
    status: existingRecord?.status || 'draft',
    paidDate: existingRecord?.paidDate,
    notes: existingRecord?.notes || ''
  };
}

// Initial HR data loader
export function getInitialHRData() {
  const staff = loadLocalData<StaffMember[]>(HR_STORAGE_KEYS.STAFF, DEFAULT_STAFF);
  const tours = loadLocalData<TechnicianTour[]>(HR_STORAGE_KEYS.TOURS, DEFAULT_TOURS);
  const attendance = loadLocalData<AttendanceRecord[]>(HR_STORAGE_KEYS.ATTENDANCE, generateInitialAttendance(staff));
  
  // Generate payroll for current active staff for month 9 / 2026
  const defaultPayrolls = staff.filter(s => s.status === 'active').map(s => {
    const att = attendance.find(a => a.staffId === s.id && a.month === 9 && a.year === 2026);
    return computePayroll(s, att, tours, 9, 2026);
  });

  const payroll = loadLocalData<PayrollRecord[]>(HR_STORAGE_KEYS.PAYROLL, defaultPayrolls);

  return { staff, tours, attendance, payroll };
}

export function persistHRData(data: {
  staff?: StaffMember[];
  tours?: TechnicianTour[];
  attendance?: AttendanceRecord[];
  payroll?: PayrollRecord[];
}) {
  if (data.staff) saveLocalData(HR_STORAGE_KEYS.STAFF, data.staff);
  if (data.tours) saveLocalData(HR_STORAGE_KEYS.TOURS, data.tours);
  if (data.attendance) saveLocalData(HR_STORAGE_KEYS.ATTENDANCE, data.attendance);
  if (data.payroll) saveLocalData(HR_STORAGE_KEYS.PAYROLL, data.payroll);
}

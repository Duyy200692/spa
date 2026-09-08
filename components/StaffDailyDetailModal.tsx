import React, { useState, useMemo } from 'react';
import Modal from './shared/Modal';
import { StaffMember, AttendanceRecord, TechnicianTour, DayAttendanceStatus } from '../types';
import { calculateSeniority, formatVND } from '../hrService';

interface StaffDailyDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: StaffMember | null;
  initialMonth: number;
  initialYear: number;
  attendanceList?: AttendanceRecord[];
  allTours: TechnicianTour[];
  onToggleDayAttendance?: (staffId: string, day: number, month?: number, year?: number) => void;
}

const StaffDailyDetailModal: React.FC<StaffDailyDetailModalProps> = ({
  isOpen,
  onClose,
  staff,
  initialMonth,
  initialYear,
  attendanceList = [],
  allTours = [],
  onToggleDayAttendance
}) => {
  // Always invoke hooks at the top level unconditionally
  const [selectedMonth, setSelectedMonth] = useState<number>(initialMonth || new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(initialYear || new Date().getFullYear());
  const [filterMode, setFilterMode] = useState<'all' | 'worked' | 'has_tour'>('all');
  const [expandedDay, setExpandedDay] = useState<number | null>(null);

  // Safely find attendance record for this staff and selected month/year
  const currentAttendance = useMemo(() => {
    if (!staff) return null;
    return attendanceList.find(
      a => a.staffId === staff.id && a.month === selectedMonth && a.year === selectedYear
    ) || null;
  }, [attendanceList, staff?.id, selectedMonth, selectedYear]);

  // Seniority calculation
  const seniority = useMemo(() => {
    if (!staff) return null;
    return calculateSeniority(staff.joinDate || '2024-01-01', staff.resignedDate);
  }, [staff?.joinDate, staff?.resignedDate]);

  // Days in selected month
  const daysInMonth = useMemo(() => {
    return new Date(selectedYear, selectedMonth, 0).getDate();
  }, [selectedYear, selectedMonth]);

  const standardWorkDays = 26;
  const baseSalary = staff?.baseSalary || 0;
  const standardDailySalary = Math.round(baseSalary / standardWorkDays);

  // Filter tours for this staff in selected month and year
  const staffMonthTours = useMemo(() => {
    if (!staff || !Array.isArray(allTours)) return [];
    return allTours.filter(t => {
      if (!t || t.technicianId !== staff.id || !t.date) return false;
      const tDate = new Date(t.date);
      if (isNaN(tDate.getTime())) return false;
      return tDate.getMonth() + 1 === selectedMonth && tDate.getFullYear() === selectedYear;
    });
  }, [allTours, staff?.id, selectedMonth, selectedYear]);

  // Compute day by day breakdown
  const dailyBreakdown = useMemo(() => {
    if (!staff) return [];

    const list = [];
    const daysAttendance = currentAttendance?.days || {};

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dateObj = new Date(selectedYear, selectedMonth - 1, day);
      const dayOfWeekNum = dateObj.getDay(); // 0 = Chủ nhật
      const dayNames = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
      const dayName = dayNames[dayOfWeekNum];
      const isSunday = dayOfWeekNum === 0;

      // Attendance status
      const status: DayAttendanceStatus = daysAttendance[day] || (isSunday ? 'OFF' : 'OFF');

      // Work factor
      let workFactor = 0;
      if (status === 'P') workFactor = 1.0;
      else if (status === 'N') workFactor = 0.5;
      else if (status === 'CP') workFactor = 1.0; // Nghỉ có phép tính nguyên lương ngày công
      else if (status === 'OT') workFactor = 1.0; // Đủ công + có tăng ca
      else workFactor = 0;

      const earnedSalary = Math.round(standardDailySalary * workFactor);

      // Tours on this day
      const dayTours = staffMonthTours.filter(t => {
        if (!t.date) return false;
        if (t.date === dateStr) return true;
        const d = new Date(t.date);
        return !isNaN(d.getTime()) && 
               d.getFullYear() === selectedYear && 
               d.getMonth() + 1 === selectedMonth && 
               d.getDate() === day;
      });

      const tourCount = dayTours.length;
      const tourCommission = dayTours.reduce((sum, t) => sum + (Number(t.commissionAmount) || 0), 0);
      const tipAmount = dayTours.reduce((sum, t) => sum + (Number(t.tipAmount) || 0), 0);
      const totalDayIncome = earnedSalary + tourCommission + tipAmount;

      list.push({
        day,
        dateStr,
        dayName,
        isSunday,
        status,
        workFactor,
        earnedSalary,
        dayTours,
        tourCount,
        tourCommission,
        tipAmount,
        totalDayIncome
      });
    }

    return list;
  }, [staff, daysInMonth, selectedMonth, selectedYear, currentAttendance, staffMonthTours, standardDailySalary]);

  // Totals for the month
  const totalWorkDays = useMemo(() => dailyBreakdown.reduce((sum, d) => sum + d.workFactor, 0), [dailyBreakdown]);
  const totalEarnedSalary = useMemo(() => dailyBreakdown.reduce((sum, d) => sum + d.earnedSalary, 0), [dailyBreakdown]);
  const totalTourCount = useMemo(() => dailyBreakdown.reduce((sum, d) => sum + d.tourCount, 0), [dailyBreakdown]);
  const totalTourCommission = useMemo(() => dailyBreakdown.reduce((sum, d) => sum + d.tourCommission, 0), [dailyBreakdown]);
  const totalTip = useMemo(() => dailyBreakdown.reduce((sum, d) => sum + d.tipAmount, 0), [dailyBreakdown]);
  const totalIncome = totalEarnedSalary + totalTourCommission + totalTip;

  // Filtered rows
  const visibleRows = useMemo(() => {
    return dailyBreakdown.filter(row => {
      if (filterMode === 'worked') return row.workFactor > 0 || row.tourCount > 0;
      if (filterMode === 'has_tour') return row.tourCount > 0;
      return true;
    });
  }, [dailyBreakdown, filterMode]);

  // Guard only AFTER all hooks are called
  if (!isOpen || !staff) {
    return null;
  }

  const getStatusBadge = (status: DayAttendanceStatus) => {
    switch (status) {
      case 'P':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">P (Đủ công)</span>;
      case 'N':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">N (Nửa ngày)</span>;
      case 'CP':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-300">CP (Có phép)</span>;
      case 'KP':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-800 border border-red-300">KP (Không phép)</span>;
      case 'OT':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-300">OT (Tăng ca)</span>;
      case 'OFF':
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-600 border border-gray-200">OFF (Nghỉ)</span>;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Chi Tiết Ngày Công, Tour & Thu Nhập: ${staff.name} (${staff.code})`}
      maxWidth="max-w-6xl"
    >
      <div className="space-y-4 text-[#5C3A3A]">
        {/* Top Profile Banner */}
        <div className="bg-gradient-to-r from-pink-50/90 to-[#FDF7F8] p-4 rounded-xl border border-pink-200/70 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 shadow-2xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold bg-[#D97A7D] text-white px-2 py-0.5 rounded">
                {staff.code}
              </span>
              <h3 className="font-serif font-bold text-lg text-[#5C3A3A]">{staff.name}</h3>
              {staff.status === 'resigned' ? (
                <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">Đã nghỉ việc</span>
              ) : (
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium">Đang làm việc</span>
              )}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Chức vụ: <strong>{staff.position}</strong> &bull; Bộ phận: <strong>{staff.department}</strong>
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs">
              <span className="text-gray-500">Ngày vào làm: <strong>{staff.joinDate || 'Chưa cập nhật'}</strong></span>
              <span className="text-gray-400">|</span>
              {seniority && (
                <span className="text-[#D97A7D] font-semibold">
                  Thâm niên: {seniority.displayText} ({seniority.levelBadge})
                </span>
              )}
              <span className="text-gray-400">|</span>
              <span className="text-gray-700">Lương cơ bản: <strong>{formatVND(staff.baseSalary || 0)}</strong>/tháng</span>
              {staff.isTechnician && (
                <>
                  <span className="text-gray-400">|</span>
                  <span className="text-purple-700 font-medium">Định mức tour: <strong>{formatVND(staff.tourRateDefault || 0)}</strong>/tour</span>
                </>
              )}
            </div>
          </div>

          {/* Month / Year Selector */}
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-pink-200 shadow-2xs self-stretch md:self-auto justify-between md:justify-start">
            <span className="text-xs font-semibold text-gray-600">Kỳ làm việc:</span>
            <select
              value={selectedMonth}
              onChange={e => setSelectedMonth(Number(e.target.value))}
              className="border border-gray-300 rounded px-2 py-1 text-xs outline-none bg-white font-semibold text-gray-800 focus:border-[#D97A7D]"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                <option key={m} value={m}>Tháng {m}</option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(Number(e.target.value))}
              className="border border-gray-300 rounded px-2 py-1 text-xs outline-none bg-white font-semibold text-gray-800 focus:border-[#D97A7D]"
            >
              {[2024, 2025, 2026, 2027].map(y => (
                <option key={y} value={y}>Năm {y}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Real-time KPI Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
          <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-2xs">
            <span className="text-gray-500 block font-medium">Ngày công chuẩn</span>
            <p className="text-lg font-bold text-gray-800 mt-0.5">{totalWorkDays} <span className="text-xs text-gray-400 font-normal">/26</span></p>
            <span className="text-[10px] text-emerald-700">Công thực tế</span>
          </div>

          <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-2xs">
            <span className="text-gray-500 block font-medium">Lương ngày công</span>
            <p className="text-lg font-bold text-gray-800 mt-0.5">{formatVND(totalEarnedSalary)}</p>
            <span className="text-[10px] text-gray-400">Định mức/ngày: {formatVND(standardDailySalary)}</span>
          </div>

          <div className="bg-white p-3 rounded-lg border border-pink-100 shadow-2xs">
            <span className="text-[#D97A7D] block font-medium">Tổng số Tour KTV</span>
            <p className="text-lg font-bold text-[#D97A7D] mt-0.5">{totalTourCount} <span className="text-xs font-normal">tour</span></p>
            <span className="text-[10px] text-gray-400">Đã phục vụ</span>
          </div>

          <div className="bg-white p-3 rounded-lg border border-pink-100 shadow-2xs">
            <span className="text-[#D97A7D] block font-medium">Hoa hồng Tour</span>
            <p className="text-lg font-bold text-[#D97A7D] mt-0.5">{formatVND(totalTourCommission)}</p>
            <span className="text-[10px] text-emerald-700">Cộng trực tiếp</span>
          </div>

          <div className="bg-white p-3 rounded-lg border border-purple-100 shadow-2xs">
            <span className="text-purple-700 block font-medium">Tiền Tip khách</span>
            <p className="text-lg font-bold text-purple-800 mt-0.5">{formatVND(totalTip)}</p>
            <span className="text-[10px] text-purple-600">Thưởng ngoài</span>
          </div>

          <div className="bg-gradient-to-br from-pink-50 to-white p-3 rounded-lg border border-[#D97A7D]/30 shadow-2xs">
            <span className="text-[#5C3A3A] block font-bold">Tổng thu nhập</span>
            <p className="text-lg font-bold text-[#D97A7D] mt-0.5 font-serif">{formatVND(totalIncome)}</p>
            <span className="text-[10px] text-gray-500">Lương + Tour + Tip</span>
          </div>
        </div>

        {/* Action Controls & Filter Pills */}
        <div className="flex flex-wrap justify-between items-center gap-2 bg-gray-50 p-2.5 rounded-lg border border-gray-200">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-gray-500 font-semibold mr-1">Hiển thị:</span>
            <button
              onClick={() => setFilterMode('all')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                filterMode === 'all'
                  ? 'bg-[#D97A7D] text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              Tất cả các ngày ({daysInMonth})
            </button>
            <button
              onClick={() => setFilterMode('worked')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                filterMode === 'worked'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              Ngày có đi làm / có tour ({dailyBreakdown.filter(d => d.workFactor > 0 || d.tourCount > 0).length})
            </button>
            <button
              onClick={() => setFilterMode('has_tour')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                filterMode === 'has_tour'
                  ? 'bg-purple-700 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              Chỉ ngày có Tour KTV ({dailyBreakdown.filter(d => d.tourCount > 0).length})
            </button>
          </div>

          <div className="text-[11px] text-gray-500 flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Cập nhật trực tiếp theo thời gian thực</span>
          </div>
        </div>

        {/* Day-by-Day Real-Time Detailed Table */}
        <div className="border border-gray-200 rounded-xl overflow-x-auto max-h-[55vh] overflow-y-auto shadow-2xs">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-[#FDF7F8] text-[#5C3A3A] font-semibold border-b border-gray-200 sticky top-0 z-10 shadow-xs">
              <tr>
                <th className="p-2.5 min-w-[120px]">Ngày & Thứ</th>
                <th className="p-2.5 text-center min-w-[110px]">Chấm công</th>
                <th className="p-2.5 text-right min-w-[110px]">Tiền lương công</th>
                <th className="p-2.5 text-center min-w-[90px]">Số Tour KTV</th>
                <th className="p-2.5 min-w-[220px]">Chi tiết Tour thực hiện</th>
                <th className="p-2.5 text-right min-w-[110px]">Hoa hồng Tour</th>
                <th className="p-2.5 text-right min-w-[90px]">Tiền Tip</th>
                <th className="p-2.5 text-right min-w-[120px] bg-pink-50/60 font-bold">Tổng thu nhập</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {visibleRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-gray-400">
                    Không có ngày nào phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                visibleRows.map(row => {
                  const isExpanded = expandedDay === row.day;
                  const hasTours = row.tourCount > 0;

                  return (
                    <React.Fragment key={row.day}>
                      <tr className={`hover:bg-pink-50/30 transition-colors ${row.isSunday ? 'bg-pink-50/20' : ''}`}>
                        {/* Date and Day of Week */}
                        <td className="p-2.5 font-medium whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                              row.isSunday ? 'bg-pink-100 text-[#D97A7D]' : 'bg-gray-100 text-gray-700'
                            }`}>
                              {row.day}
                            </span>
                            <div>
                              <span className="font-semibold text-gray-900 block">{row.dateStr}</span>
                              <span className={`text-[10px] block ${row.isSunday ? 'text-[#D97A7D] font-bold' : 'text-gray-400'}`}>
                                {row.dayName}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Attendance status with click toggle */}
                        <td className="p-2.5 text-center whitespace-nowrap">
                          <div
                            onClick={() => onToggleDayAttendance && onToggleDayAttendance(staff.id, row.day, selectedMonth, selectedYear)}
                            className="cursor-pointer inline-block hover:scale-105 transition-transform"
                            title="Bấm để chuyển đổi trạng thái công ngày này"
                          >
                            {getStatusBadge(row.status)}
                          </div>
                        </td>

                        {/* Daily Salary */}
                        <td className="p-2.5 text-right font-medium">
                          {row.earnedSalary > 0 ? (
                            <div>
                              <span className="text-gray-900 font-bold">{formatVND(row.earnedSalary)}</span>
                              <span className="text-[10px] text-gray-400 block">({row.workFactor} công)</span>
                            </div>
                          ) : (
                            <span className="text-gray-400">0 đ</span>
                          )}
                        </td>

                        {/* Tour Count */}
                        <td className="p-2.5 text-center">
                          {hasTours ? (
                            <button
                              onClick={() => setExpandedDay(isExpanded ? null : row.day)}
                              className="px-2 py-0.5 rounded-full text-xs font-bold bg-pink-100 text-[#D97A7D] hover:bg-pink-200 transition-colors inline-flex items-center gap-1"
                              title="Bấm để xem/thu gọn chi tiết tour"
                            >
                              <span>✨ {row.tourCount} tour</span>
                              <span className="text-[10px]">{isExpanded ? '▲' : '▼'}</span>
                            </button>
                          ) : (
                            <span className="text-gray-300">-</span>
                          )}
                        </td>

                        {/* Tour Summary preview */}
                        <td className="p-2.5 text-[11px]">
                          {hasTours ? (
                            <div className="space-y-1">
                              {row.dayTours.map((t, idx) => (
                                <div key={t.id || idx} className="flex items-center justify-between gap-1 text-gray-700 bg-white/70 px-1.5 py-0.5 rounded border border-gray-100">
                                  <span className="truncate max-w-[140px] font-medium text-gray-800" title={t.serviceName}>
                                    {t.serviceName}
                                  </span>
                                  <span className="text-[10px] text-[#D97A7D] font-bold shrink-0">
                                    +{formatVND(Number(t.commissionAmount) || 0)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400 italic text-[11px]">Không có tour</span>
                          )}
                        </td>

                        {/* Tour Commission */}
                        <td className="p-2.5 text-right font-bold text-emerald-700 whitespace-nowrap">
                          {row.tourCommission > 0 ? `+${formatVND(row.tourCommission)}` : '-'}
                        </td>

                        {/* Tip Amount */}
                        <td className="p-2.5 text-right font-medium text-purple-700 whitespace-nowrap">
                          {row.tipAmount > 0 ? `+${formatVND(row.tipAmount)}` : '-'}
                        </td>

                        {/* Total Day Income */}
                        <td className="p-2.5 text-right font-bold text-[#D97A7D] bg-pink-50/40 whitespace-nowrap font-serif">
                          {formatVND(row.totalDayIncome)}
                        </td>
                      </tr>

                      {/* Expandable row for full tour details */}
                      {isExpanded && hasTours && (
                        <tr className="bg-pink-50/60 border-l-4 border-l-[#D97A7D]">
                          <td colSpan={8} className="p-3 text-xs">
                            <div className="bg-white p-3 rounded-lg border border-pink-200 shadow-2xs space-y-2">
                              <h5 className="font-bold text-xs text-[#5C3A3A] flex items-center justify-between">
                                <span>Danh sách các Tour dịch vụ KTV đã làm ngày {row.dateStr}:</span>
                                <span className="text-[#D97A7D]">Tổng: {row.tourCount} tour &bull; Hoa hồng: {formatVND(row.tourCommission)}</span>
                              </h5>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {row.dayTours.map((t, idx) => (
                                  <div key={t.id || idx} className="p-2.5 rounded-lg border border-gray-100 bg-gray-50/60 text-[11px] space-y-1">
                                    <div className="flex justify-between items-start">
                                      <span className="font-bold text-gray-900">{t.serviceName}</span>
                                      <span className="font-bold text-[#D97A7D] bg-pink-50 px-1.5 py-0.5 rounded border border-pink-100">
                                        +{formatVND(Number(t.commissionAmount) || 0)}
                                      </span>
                                    </div>
                                    <div className="grid grid-cols-2 text-gray-600">
                                      <span>Thời gian: <strong>{t.time || 'N/A'} ({t.durationMinutes}p)</strong></span>
                                      <span>Phòng: <strong>{t.room || 'Phòng Spa'}</strong></span>
                                      <span>Khách: <strong>{t.customerName || 'Khách vãng lai'}</strong></span>
                                      <span>Tip: <strong className="text-purple-700">{t.tipAmount ? formatVND(Number(t.tipAmount)) : '0 đ'}</strong></span>
                                    </div>
                                    {t.note && (
                                      <p className="text-[10px] text-gray-500 italic mt-0.5">Ghi chú: {t.note}</p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>

            {/* Total Footer */}
            <tfoot className="bg-[#FDF7F8] font-bold text-xs border-t-2 border-[#D97A7D]/40 sticky bottom-0 z-10">
              <tr>
                <td className="p-3 text-[#5C3A3A]">TỔNG CỘNG THÁNG {selectedMonth}/{selectedYear}</td>
                <td className="p-3 text-center text-emerald-800">{totalWorkDays} ngày công</td>
                <td className="p-3 text-right text-gray-900">{formatVND(totalEarnedSalary)}</td>
                <td className="p-3 text-center text-[#D97A7D]">{totalTourCount} tour</td>
                <td className="p-3 text-gray-500 text-[11px]">{staffMonthTours.length} lượt phục vụ</td>
                <td className="p-3 text-right text-emerald-700">+{formatVND(totalTourCommission)}</td>
                <td className="p-3 text-right text-purple-700">+{formatVND(totalTip)}</td>
                <td className="p-3 text-right text-base text-[#D97A7D] bg-pink-100/50 font-serif">
                  {formatVND(totalIncome)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Modal Footer Controls */}
        <div className="flex justify-between items-center pt-3 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            * Nhấp vào ký hiệu <strong>P/N/CP/KP/OFF/OT</strong> của bất kỳ ngày nào để đổi nhanh trạng thái chấm công.
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-1 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              In bảng chi tiết
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-[#D97A7D] hover:bg-[#c96a6d] rounded-lg transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default StaffDailyDetailModal;

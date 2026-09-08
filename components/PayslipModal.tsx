import React from 'react';
import Modal from './shared/Modal';
import { PayrollRecord, StaffMember } from '../types';
import { calculateSeniority, formatVND } from '../hrService';

interface PayslipModalProps {
  isOpen: boolean;
  onClose: () => void;
  payroll: PayrollRecord | null;
  staff: StaffMember | undefined;
  onUpdateStatus?: (status: 'draft' | 'confirmed' | 'paid') => void;
}

const PayslipModal: React.FC<PayslipModalProps> = ({
  isOpen,
  onClose,
  payroll,
  staff,
  onUpdateStatus
}) => {
  if (!payroll) return null;

  const seniority = staff ? calculateSeniority(staff.joinDate, staff.resignedDate) : null;

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = (status: 'draft' | 'confirmed' | 'paid') => {
    switch (status) {
      case 'paid':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">ĐÃ THANH TOÁN</span>;
      case 'confirmed':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">ĐÃ DUYỆT CHI</span>;
      case 'draft':
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">BẢN NHÁP</span>;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Phiếu Lương Chi Tiết: ${payroll.staffName} (Tháng ${payroll.month}/${payroll.year})`}
    >
      <div className="text-[#5C3A3A] space-y-4">
        {/* Printable Card */}
        <div id="payslip-print-area" className="bg-white p-5 border border-pink-100 rounded-xl shadow-sm">
          {/* Header */}
          <div className="flex justify-between items-start border-b border-pink-200 pb-3 mb-4">
            <div>
              <span className="font-serif font-bold text-xl tracking-wide text-[#D97A7D]">WELLNESS SYSTEM</span>
              <p className="text-xs text-gray-500">Hệ thống Quản lý Spa & Chăm sóc Sức khỏe</p>
            </div>
            <div className="text-right">
              <h3 className="font-serif font-bold text-lg text-[#5C3A3A]">PHIẾU LƯƠNG & THU NHẬP</h3>
              <p className="text-xs font-semibold text-[#D97A7D]">Tháng {payroll.month} / Năm {payroll.year}</p>
              <div className="mt-1">{getStatusBadge(payroll.status)}</div>
            </div>
          </div>

          {/* Staff Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs bg-[#FEFBFB] p-3 rounded-lg border border-pink-50 mb-4">
            <div>
              <span className="text-gray-500">Mã nhân viên:</span>
              <p className="font-bold text-gray-800">{payroll.staffCode}</p>
            </div>
            <div>
              <span className="text-gray-500">Họ và tên:</span>
              <p className="font-bold text-gray-800">{payroll.staffName}</p>
            </div>
            <div>
              <span className="text-gray-500">Chức vụ:</span>
              <p className="font-medium text-gray-800">{payroll.position}</p>
            </div>
            <div>
              <span className="text-gray-500">Bộ phận:</span>
              <p className="font-medium text-gray-800">{staff?.department || 'Nội bộ'}</p>
            </div>
            <div>
              <span className="text-gray-500">Ngày vào làm:</span>
              <p className="font-medium text-gray-800">{staff?.joinDate || 'N/A'}</p>
            </div>
            <div>
              <span className="text-gray-500">Thâm niên làm việc:</span>
              <p className="font-bold text-[#D97A7D]">{seniority ? seniority.displayText : 'N/A'}</p>
            </div>
          </div>

          {/* Detailed Breakdown Table */}
          <div className="border border-gray-200 rounded-lg overflow-hidden mb-4">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#FDF7F8] text-[#5C3A3A] font-semibold border-b border-gray-200">
                <tr>
                  <th className="p-2.5">Khoản mục thu nhập & giảm trừ</th>
                  <th className="p-2.5 text-center">Định mức / Chỉ số</th>
                  <th className="p-2.5 text-right">Số tiền (VND)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="p-2.5 font-medium">1. Lương cơ bản hàng tháng</td>
                  <td className="p-2.5 text-center text-gray-500">Thỏa thuận HĐ</td>
                  <td className="p-2.5 text-right font-medium">{formatVND(payroll.baseSalary)}</td>
                </tr>
                <tr>
                  <td className="p-2.5">
                    <p className="font-medium">2. Lương tính theo ngày công thực tế</p>
                    <span className="text-[10px] text-gray-400">
                      = (Lương cơ bản / {payroll.standardWorkDays} ngày chuẩn) × {payroll.actualWorkDays} ngày làm
                    </span>
                  </td>
                  <td className="p-2.5 text-center text-gray-700 font-semibold">
                    {payroll.actualWorkDays} / {payroll.standardWorkDays} ngày
                  </td>
                  <td className="p-2.5 text-right font-bold text-gray-800">{formatVND(payroll.salaryByWorkDays)}</td>
                </tr>
                <tr>
                  <td className="p-2.5">
                    <p className="font-medium">3. Phụ cấp thâm niên làm việc</p>
                    <span className="text-[10px] text-gray-400">
                      Cống hiến {seniority?.displayText} ({seniority?.levelBadge})
                    </span>
                  </td>
                  <td className="p-2.5 text-center text-emerald-700 font-medium">Thâm niên</td>
                  <td className="p-2.5 text-right font-medium text-emerald-700">+{formatVND(payroll.seniorityAllowance)}</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-medium">4. Phụ cấp cố định (Ăn trưa, trách nhiệm...)</td>
                  <td className="p-2.5 text-center text-gray-500">Định mức tháng</td>
                  <td className="p-2.5 text-right font-medium text-emerald-700">+{formatVND(payroll.otherAllowance)}</td>
                </tr>
                {payroll.tourCount > 0 && (
                  <tr className="bg-pink-50/40">
                    <td className="p-2.5">
                      <p className="font-semibold text-pink-900">5. Hoa hồng Tour Kỹ thuật viên Spa</p>
                      <span className="text-[10px] text-pink-700">
                        Tổng cộng {payroll.tourCount} tour dịch vụ hoàn tất trong tháng
                      </span>
                    </td>
                    <td className="p-2.5 text-center font-bold text-pink-800">{payroll.tourCount} tour</td>
                    <td className="p-2.5 text-right font-bold text-[#D97A7D]">+{formatVND(payroll.tourCommission)}</td>
                  </tr>
                )}
                {payroll.bonus > 0 && (
                  <tr className="bg-emerald-50/40">
                    <td className="p-2.5">
                      <p className="font-medium text-emerald-900">6. Thưởng hiệu suất / Lễ tết / Doanh số</p>
                      {payroll.bonusReason && (
                        <span className="text-[10px] text-emerald-700">Lý do: {payroll.bonusReason}</span>
                      )}
                    </td>
                    <td className="p-2.5 text-center text-emerald-700">Thưởng</td>
                    <td className="p-2.5 text-right font-bold text-emerald-700">+{formatVND(payroll.bonus)}</td>
                  </tr>
                )}
                {payroll.deduction > 0 && (
                  <tr className="bg-red-50/40">
                    <td className="p-2.5">
                      <p className="font-medium text-red-900">7. Giảm trừ / Phạt vi phạm / Tạm ứng</p>
                      {payroll.deductionReason && (
                        <span className="text-[10px] text-red-700">Lý do: {payroll.deductionReason}</span>
                      )}
                    </td>
                    <td className="p-2.5 text-center text-red-700">Giảm trừ</td>
                    <td className="p-2.5 text-right font-bold text-red-600">-{formatVND(payroll.deduction)}</td>
                  </tr>
                )}
              </tbody>
              <tfoot className="bg-[#FDF7F8] border-t-2 border-[#D97A7D]/30 font-bold text-sm">
                <tr>
                  <td className="p-3 text-[#5C3A3A]">TỔNG THỰC LĨNH (NET SALARY)</td>
                  <td className="p-3 text-center text-xs text-gray-500">Chuyển khoản</td>
                  <td className="p-3 text-right text-base text-[#D97A7D] font-serif">{formatVND(payroll.netSalary)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Payment Info */}
          {staff?.bankAccount && (
            <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-200 text-xs flex justify-between items-center mb-4">
              <div>
                <span className="text-gray-500">Thông tin chuyển khoản: </span>
                <strong className="text-gray-800">{staff.bankAccount}</strong> ({staff.bankName || 'Ngân hàng'})
              </div>
              <span className="text-gray-500">Chủ TK: <strong>{staff.name}</strong></span>
            </div>
          )}

          {/* Signatures */}
          <div className="grid grid-cols-3 text-center text-xs pt-4 border-t border-gray-100">
            <div>
              <p className="font-bold text-gray-700">Người lập phiếu</p>
              <span className="text-[10px] text-gray-400">(Ký, họ tên)</span>
              <div className="h-12"></div>
            </div>
            <div>
              <p className="font-bold text-gray-700">Kế toán trưởng</p>
              <span className="text-[10px] text-gray-400">(Ký, họ tên)</span>
              <div className="h-12"></div>
            </div>
            <div>
              <p className="font-bold text-gray-700">Người nhận tiền</p>
              <span className="text-[10px] text-gray-400">(Ký, họ tên)</span>
              <div className="h-12"></div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap justify-between items-center gap-2 pt-2 border-t border-gray-200">
          <div className="flex items-center gap-2">
            {onUpdateStatus && (
              <>
                <span className="text-xs text-gray-600 font-semibold">Cập nhật trạng thái:</span>
                <button
                  type="button"
                  onClick={() => onUpdateStatus('confirmed')}
                  className={`px-3 py-1 text-xs rounded-lg font-medium border transition-colors ${
                    payroll.status === 'confirmed'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                  }`}
                >
                  Duyệt chi
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateStatus('paid')}
                  className={`px-3 py-1 text-xs rounded-lg font-medium border transition-colors ${
                    payroll.status === 'paid'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  Đã thanh toán
                </button>
              </>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              In Phiếu Lương
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#D97A7D] hover:bg-[#c96a6d] rounded-lg transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default PayslipModal;

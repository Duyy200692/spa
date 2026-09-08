import React, { useState, useEffect } from 'react';
import Modal from './shared/Modal';
import { StaffMember } from '../types';
import { calculateSeniority, formatVND } from '../hrService';

interface StaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (staff: StaffMember) => void;
  staffToEdit?: StaffMember | null;
  mode?: 'create' | 'edit' | 'resign';
}

const DEPARTMENTS = [
  'Kỹ thuật Spa',
  'Lễ tân',
  'Kế toán',
  'Ban Quản lý',
  'Marketing',
  'Hậu cần / Tạp vụ',
];

const POSITIONS = [
  'Kỹ thuật viên Trưởng',
  'Kỹ thuật viên Body & Facial',
  'Kỹ thuật viên Dưỡng sinh',
  'Kỹ thuật viên Spa',
  'Học viên / Thử việc',
  'Trưởng nhóm Lễ tân & Thu ngân',
  'Nhân viên Lễ tân',
  'Kế toán tổng hợp',
  'Quản lý vận hành cơ sở',
  'Nhân viên Marketing',
  'Tạp vụ / Vệ sinh',
];

const StaffModal: React.FC<StaffModalProps> = ({
  isOpen,
  onClose,
  onSave,
  staffToEdit,
  mode = 'create'
}) => {
  const isResignMode = mode === 'resign';
  const isEditMode = mode === 'edit';

  const [formData, setFormData] = useState<Partial<StaffMember>>({
    code: '',
    name: '',
    phone: '',
    email: '',
    position: 'Kỹ thuật viên Spa',
    department: 'Kỹ thuật Spa',
    isTechnician: true,
    status: 'active',
    joinDate: new Date().toISOString().split('T')[0],
    resignedDate: '',
    resignedReason: '',
    baseSalary: 7500000,
    allowance: 800000,
    tourRateDefault: 80000,
    bankAccount: '',
    bankName: 'Techcombank',
    citizenId: '',
    note: ''
  });

  useEffect(() => {
    if (staffToEdit) {
      setFormData({
        ...staffToEdit,
        resignedDate: staffToEdit.resignedDate || (isResignMode ? new Date().toISOString().split('T')[0] : '')
      });
    } else {
      setFormData({
        code: `NV${Math.floor(10 + Math.random() * 90)}`,
        name: '',
        phone: '',
        email: '',
        position: 'Kỹ thuật viên Spa',
        department: 'Kỹ thuật Spa',
        isTechnician: true,
        status: 'active',
        joinDate: new Date().toISOString().split('T')[0],
        resignedDate: '',
        resignedReason: '',
        baseSalary: 7500000,
        allowance: 800000,
        tourRateDefault: 80000,
        bankAccount: '',
        bankName: 'Techcombank',
        citizenId: '',
        note: ''
      });
    }
  }, [staffToEdit, isOpen, isResignMode]);

  const seniority = calculateSeniority(
    formData.joinDate || '',
    formData.status === 'resigned' || isResignMode ? formData.resignedDate : undefined
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      alert('Vui lòng nhập họ và tên nhân sự!');
      return;
    }
    if (!formData.code?.trim()) {
      alert('Vui lòng nhập mã nhân sự!');
      return;
    }

    if (isResignMode) {
      if (!formData.resignedDate) {
        alert('Vui lòng chọn ngày nghỉ việc!');
        return;
      }
      if (!formData.resignedReason?.trim()) {
        alert('Vui lòng nhập lý do nghỉ việc!');
        return;
      }
    }

    const finalStaff: StaffMember = {
      id: staffToEdit?.id || `staff-${Date.now()}`,
      code: formData.code!.trim(),
      name: formData.name!.trim(),
      phone: formData.phone || '',
      email: formData.email || '',
      position: formData.position || 'Nhân viên',
      department: formData.department || 'Kỹ thuật Spa',
      isTechnician: !!formData.isTechnician,
      status: isResignMode ? 'resigned' : (formData.status || 'active'),
      joinDate: formData.joinDate || new Date().toISOString().split('T')[0],
      resignedDate: isResignMode ? formData.resignedDate : formData.resignedDate || undefined,
      resignedReason: isResignMode ? formData.resignedReason : formData.resignedReason || undefined,
      baseSalary: Number(formData.baseSalary) || 0,
      allowance: Number(formData.allowance) || 0,
      tourRateDefault: Number(formData.tourRateDefault) || 0,
      bankAccount: formData.bankAccount || '',
      bankName: formData.bankName || '',
      citizenId: formData.citizenId || '',
      note: formData.note || ''
    };

    onSave(finalStaff);
    onClose();
  };

  const title = isResignMode
    ? `Xác nhận nhân sự nghỉ việc: ${staffToEdit?.name}`
    : isEditMode
    ? `Chỉnh sửa hồ sơ nhân sự: ${staffToEdit?.name}`
    : 'Thêm nhân sự mới vào hệ thống';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4 text-[#5C3A3A]">
        {/* If in resign mode */}
        {isResignMode && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5 mb-2 text-sm text-amber-900">
            <p className="font-semibold mb-1">Cập nhật trạng thái nghỉ việc cho nhân sự:</p>
            <p className="text-xs text-amber-800">
              Nhân viên sẽ được chuyển sang mục <strong>"Nhân sự đã nghỉ việc"</strong>, hồ sơ và lịch sử làm việc vẫn được lưu trữ đầy đủ và có thể phục hồi bất cứ lúc nào.
            </p>
          </div>
        )}

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold mb-1 text-gray-700">Mã nhân sự <span className="text-red-500">*</span></label>
            <input
              type="text"
              required
              disabled={isResignMode}
              value={formData.code || ''}
              onChange={e => setFormData({ ...formData, code: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-[#D97A7D]"
              placeholder="VD: KTV05, LT03..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-gray-700">Họ và tên <span className="text-red-500">*</span></label>
            <input
              type="text"
              required
              disabled={isResignMode}
              value={formData.name || ''}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-[#D97A7D]"
              placeholder="Nguyễn Văn A"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-gray-700">Số điện thoại</label>
            <input
              type="text"
              disabled={isResignMode}
              value={formData.phone || ''}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-[#D97A7D]"
              placeholder="0901 234 567"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-gray-700">Email</label>
            <input
              type="email"
              disabled={isResignMode}
              value={formData.email || ''}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-[#D97A7D]"
              placeholder="nhansu@wellness.vn"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-gray-700">Bộ phận</label>
            <select
              disabled={isResignMode}
              value={formData.department}
              onChange={e => {
                const dept = e.target.value;
                setFormData({
                  ...formData,
                  department: dept,
                  isTechnician: dept === 'Kỹ thuật Spa'
                });
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-[#D97A7D] bg-white"
            >
              {DEPARTMENTS.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-gray-700">Chức danh / Vị trí</label>
            <input
              type="text"
              disabled={isResignMode}
              list="positions-list"
              value={formData.position || ''}
              onChange={e => setFormData({ ...formData, position: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-[#D97A7D]"
              placeholder="Chọn hoặc nhập chức danh"
            />
            <datalist id="positions-list">
              {POSITIONS.map(p => (
                <option key={p} value={p} />
              ))}
            </datalist>
          </div>
        </div>

        {/* Dates & Seniority Preview */}
        <div className="bg-pink-50/50 border border-pink-100 rounded-lg p-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1 text-gray-700">
                Ngày vào làm việc (Bắt đầu tính thâm niên) <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                disabled={isResignMode}
                value={formData.joinDate || ''}
                onChange={e => setFormData({ ...formData, joinDate: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-[#D97A7D] bg-white"
              />
            </div>

            {/* Seniority Box */}
            <div className="flex flex-col justify-center">
              <span className="text-xs text-gray-600 font-semibold mb-1">Thâm niên làm việc tính toán:</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[#D97A7D] bg-white px-2 py-0.5 rounded border border-pink-200">
                  {seniority.displayText} ({seniority.totalDays} ngày)
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#D97A7D]/15 text-[#D97A7D] font-medium">
                  {seniority.levelBadge}
                </span>
              </div>
              <span className="text-[11px] text-gray-500 mt-1">
                Gợi ý phụ cấp thâm niên: <strong className="text-emerald-700">{formatVND(seniority.suggestedAllowance)}/tháng</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Resign details section */}
        {(isResignMode || formData.status === 'resigned') && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-red-800 flex items-center gap-1.5">
              <span>Thông tin nghỉ việc</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1 text-red-800">
                  Ngày chính thức nghỉ việc <span className="text-red-600">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.resignedDate || ''}
                  onChange={e => setFormData({ ...formData, resignedDate: e.target.value })}
                  className="w-full border border-red-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-red-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-red-800">
                  Lý do nghỉ việc <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.resignedReason || ''}
                  onChange={e => setFormData({ ...formData, resignedReason: e.target.value })}
                  className="w-full border border-red-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-red-500 bg-white"
                  placeholder="Lý do cá nhân, chuyển nơi ở..."
                />
              </div>
            </div>
          </div>
        )}

        {/* Salary & Tour Commission Config */}
        {!isResignMode && (
          <div className="border border-gray-200 rounded-lg p-3 space-y-3 bg-gray-50/50">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Cấu hình Lương & Tour Dịch vụ</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-700">Lương cơ bản (VND)</label>
                <input
                  type="number"
                  step={500000}
                  value={formData.baseSalary || 0}
                  onChange={e => setFormData({ ...formData, baseSalary: Number(e.target.value) })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-[#D97A7D] bg-white"
                />
                <span className="text-[10px] text-gray-500">{formatVND(formData.baseSalary)}</span>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-700">Phụ cấp cố định (VND)</label>
                <input
                  type="number"
                  step={100000}
                  value={formData.allowance || 0}
                  onChange={e => setFormData({ ...formData, allowance: Number(e.target.value) })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-[#D97A7D] bg-white"
                />
                <span className="text-[10px] text-gray-500">{formatVND(formData.allowance)}</span>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-700">Hoa hồng / Tour KTV (VND)</label>
                <input
                  type="number"
                  step={10000}
                  disabled={!formData.isTechnician}
                  value={formData.tourRateDefault || 0}
                  onChange={e => setFormData({ ...formData, tourRateDefault: Number(e.target.value) })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-[#D97A7D] bg-white disabled:bg-gray-100"
                />
                <span className="text-[10px] text-gray-500">
                  {formData.isTechnician ? formatVND(formData.tourRateDefault) : 'Không tính tour'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="isTechCheckbox"
                checked={formData.isTechnician}
                onChange={e => setFormData({ ...formData, isTechnician: e.target.checked })}
                className="rounded text-[#D97A7D] focus:ring-[#D97A7D] h-4 w-4 cursor-pointer"
              />
              <label htmlFor="isTechCheckbox" className="text-xs font-medium text-gray-700 cursor-pointer">
                Là Kỹ thuật viên (Cho phép xếp Tour & nhận hoa hồng theo từng lượt làm dịch vụ)
              </label>
            </div>
          </div>
        )}

        {/* Banking & Identity */}
        {!isResignMode && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1 text-gray-700">Số tài khoản Ngân hàng</label>
              <input
                type="text"
                value={formData.bankAccount || ''}
                onChange={e => setFormData({ ...formData, bankAccount: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-[#D97A7D]"
                placeholder="190345678..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-gray-700">Ngân hàng</label>
              <input
                type="text"
                value={formData.bankName || ''}
                onChange={e => setFormData({ ...formData, bankName: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-[#D97A7D]"
                placeholder="Techcombank, Vietcombank..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-gray-700">Số CCCD / CMND</label>
              <input
                type="text"
                value={formData.citizenId || ''}
                onChange={e => setFormData({ ...formData, citizenId: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-[#D97A7D]"
                placeholder="001198..."
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold mb-1 text-gray-700">Ghi chú thêm</label>
          <textarea
            rows={2}
            value={formData.note || ''}
            onChange={e => setFormData({ ...formData, note: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-[#D97A7D]"
            placeholder="Kinh nghiệm, chứng chỉ, bàn giao tài sản..."
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-3 pt-3 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            className={`px-5 py-2 text-sm text-white font-medium rounded-lg shadow-sm transition-colors ${
              isResignMode
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-[#D97A7D] hover:bg-[#c96a6d]'
            }`}
          >
            {isResignMode ? 'Xác nhận Cho Nghỉ Việc' : isEditMode ? 'Lưu thay đổi' : 'Thêm nhân sự'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default StaffModal;

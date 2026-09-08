import React, { useState, useEffect } from 'react';
import Modal from './shared/Modal';
import { TechnicianTour, StaffMember, Service } from '../types';
import { formatVND } from '../hrService';

interface TourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tour: TechnicianTour) => void;
  tourToEdit?: TechnicianTour | null;
  technicians: StaffMember[];
  services: Service[];
  currentUser?: StaffMember | any;
}

const COMMON_ROOMS = [
  'Phòng VIP 01',
  'Phòng VIP 02',
  'Phòng Body 01',
  'Phòng Body 02',
  'Phòng Body 03',
  'Phòng Facial 01',
  'Phòng Facial 02',
  'Phòng Gội Dưỡng Sinh 01',
  'Phòng Gội Dưỡng Sinh 02',
];

const TourModal: React.FC<TourModalProps> = ({
  isOpen,
  onClose,
  onSave,
  tourToEdit,
  technicians,
  services,
  currentUser
}) => {
  const activeTechnicians = technicians.filter(t => t.status === 'active' && t.isTechnician);

  const [formData, setFormData] = useState<Partial<TechnicianTour>>({
    technicianId: '',
    technicianName: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    serviceName: '',
    customerName: '',
    room: 'Phòng VIP 01',
    durationMinutes: 60,
    commissionAmount: 80000,
    tipAmount: 0,
    rating: 5,
    note: ''
  });

  useEffect(() => {
    if (tourToEdit) {
      setFormData(tourToEdit);
    } else {
      const defaultTech = activeTechnicians[0];
      setFormData({
        technicianId: defaultTech?.id || '',
        technicianName: defaultTech?.name || '',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        serviceName: services[0]?.name || 'Massage Body Trị Liệu 60p',
        customerName: '',
        room: 'Phòng VIP 01',
        durationMinutes: 60,
        commissionAmount: defaultTech?.tourRateDefault || 80000,
        tipAmount: 0,
        rating: 5,
        note: ''
      });
    }
  }, [tourToEdit, isOpen]);

  // When technician changes, update commission rate if not editing
  const handleTechnicianChange = (techId: string) => {
    const selectedTech = activeTechnicians.find(t => t.id === techId);
    if (selectedTech) {
      setFormData(prev => ({
        ...prev,
        technicianId: techId,
        technicianName: selectedTech.name,
        commissionAmount: selectedTech.tourRateDefault || prev.commissionAmount || 80000
      }));
    }
  };

  const handleServiceSelect = (serviceName: string) => {
    const matchedService = services.find(s => s.name === serviceName);
    let duration = 60;
    if (matchedService) {
      if (matchedService.price90) duration = 90;
      else if (matchedService.price120) duration = 120;
      else if (matchedService.price30) duration = 30;
    }
    setFormData(prev => ({
      ...prev,
      serviceName,
      durationMinutes: duration
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.technicianId) {
      alert('Vui lòng chọn Kỹ thuật viên!');
      return;
    }
    if (!formData.serviceName?.trim()) {
      alert('Vui lòng nhập tên dịch vụ thực hiện!');
      return;
    }

    const finalTour: TechnicianTour = {
      id: tourToEdit?.id || `tour-${Date.now()}`,
      technicianId: formData.technicianId,
      technicianName: formData.technicianName || 'Kỹ thuật viên',
      date: formData.date || new Date().toISOString().split('T')[0],
      time: formData.time || '10:00',
      serviceName: formData.serviceName.trim(),
      customerName: formData.customerName?.trim() || 'Khách vãng lai',
      room: formData.room || 'Phòng Spa',
      durationMinutes: Number(formData.durationMinutes) || 60,
      commissionAmount: Number(formData.commissionAmount) || 0,
      tipAmount: Number(formData.tipAmount) || 0,
      rating: Number(formData.rating) || 5,
      note: formData.note || '',
      createdById: currentUser?.id,
      createdByName: currentUser?.name
    };

    onSave(finalTour);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={tourToEdit ? 'Chỉnh sửa Tour Kỹ thuật viên' : 'Ghi nhận Tour mới cho Kỹ thuật viên'}
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-[#5C3A3A]">
        <div className="bg-pink-50/50 border border-pink-100 rounded-lg p-3 text-xs text-pink-900">
          Mỗi tour dịch vụ hoàn tất sẽ được tự động thống kê vào ca làm của Kỹ thuật viên và tính vào tổng thu nhập hoa hồng trong bảng lương tháng.
        </div>

        {/* Technician selector */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold mb-1 text-gray-700">
              Kỹ thuật viên thực hiện <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.technicianId}
              onChange={e => handleTechnicianChange(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#D97A7D] bg-white font-medium"
            >
              <option value="">-- Chọn Kỹ thuật viên --</option>
              {activeTechnicians.map(tech => (
                <option key={tech.id} value={tech.id}>
                  {tech.code} - {tech.name} ({tech.position})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-gray-700">
              Hoa hồng Tour KTV được nhận (VND) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                step={10000}
                required
                value={formData.commissionAmount || 0}
                onChange={e => setFormData({ ...formData, commissionAmount: Number(e.target.value) })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#D97A7D] font-bold text-emerald-700"
              />
            </div>
            <span className="text-[11px] text-gray-500">{formatVND(formData.commissionAmount)}</span>
          </div>
        </div>

        {/* Date, Time & Duration */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold mb-1 text-gray-700">Ngày làm Tour <span className="text-red-500">*</span></label>
            <input
              type="date"
              required
              value={formData.date || ''}
              onChange={e => setFormData({ ...formData, date: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-[#D97A7D] bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-gray-700">Giờ vào tour</label>
            <input
              type="time"
              value={formData.time || ''}
              onChange={e => setFormData({ ...formData, time: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-[#D97A7D] bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-gray-700">Thời lượng tour</label>
            <select
              value={formData.durationMinutes}
              onChange={e => setFormData({ ...formData, durationMinutes: Number(e.target.value) })}
              className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-[#D97A7D] bg-white"
            >
              <option value={30}>30 phút</option>
              <option value={45}>45 phút</option>
              <option value={60}>60 phút</option>
              <option value={90}>90 phút</option>
              <option value={120}>120 phút (2 giờ)</option>
            </select>
          </div>
        </div>

        {/* Service and Room */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold mb-1 text-gray-700">
              Dịch vụ Spa thực hiện <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              list="wellness-services-list"
              value={formData.serviceName || ''}
              onChange={e => handleServiceSelect(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-[#D97A7D]"
              placeholder="Chọn hoặc nhập tên dịch vụ..."
            />
            <datalist id="wellness-services-list">
              {services.map(s => (
                <option key={s.id} value={s.name} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-gray-700">Phòng / Giường</label>
            <input
              type="text"
              list="rooms-list"
              value={formData.room || ''}
              onChange={e => setFormData({ ...formData, room: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-[#D97A7D]"
              placeholder="Chọn hoặc nhập phòng..."
            />
            <datalist id="rooms-list">
              {COMMON_ROOMS.map(r => (
                <option key={r} value={r} />
              ))}
            </datalist>
          </div>
        </div>

        {/* Customer, Tip & Rating */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold mb-1 text-gray-700">Tên Khách hàng</label>
            <input
              type="text"
              value={formData.customerName || ''}
              onChange={e => setFormData({ ...formData, customerName: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-[#D97A7D]"
              placeholder="VD: Chị Minh Thư"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-gray-700">Tiền Tip khách tặng KTV (VND)</label>
            <input
              type="number"
              step={10000}
              value={formData.tipAmount || 0}
              onChange={e => setFormData({ ...formData, tipAmount: Number(e.target.value) })}
              className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-[#D97A7D]"
            />
            <span className="text-[10px] text-gray-500">{formatVND(formData.tipAmount)}</span>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-gray-700">Đánh giá của khách</label>
            <select
              value={formData.rating || 5}
              onChange={e => setFormData({ ...formData, rating: Number(e.target.value) })}
              className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-[#D97A7D] bg-white"
            >
              <option value={5}>⭐⭐⭐⭐⭐ Xuất sắc (5 sao)</option>
              <option value={4}>⭐⭐⭐⭐ Rất tốt (4 sao)</option>
              <option value={3}>⭐⭐⭐ Bình thường (3 sao)</option>
              <option value={2}>⭐⭐ Chưa hài lòng (2 sao)</option>
              <option value={1}>⭐ Kém (1 sao)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1 text-gray-700">Ghi chú tour</label>
          <textarea
            rows={2}
            value={formData.note || ''}
            onChange={e => setFormData({ ...formData, note: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-[#D97A7D]"
            placeholder="Yêu cầu lực, gói liệu trình, phản hồi của khách..."
          />
        </div>

        <div className="flex justify-end space-x-3 pt-3 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-sm text-white font-medium bg-[#D97A7D] hover:bg-[#c96a6d] rounded-lg shadow-sm transition-colors"
          >
            {tourToEdit ? 'Lưu thay đổi' : 'Ghi nhận Tour'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default TourModal;

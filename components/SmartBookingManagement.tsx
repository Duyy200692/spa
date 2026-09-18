import React, { useState, useMemo } from 'react';
import {
  Booking,
  ClinicRoom,
  BookingStatus,
  BookingChannel,
  StaffMember,
  Service
} from '../types';
import {
  Calendar,
  Clock,
  User,
  Phone,
  DoorOpen,
  Sparkles,
  Search,
  Plus,
  CheckCircle2,
  Activity,
  Send,
  Award
} from 'lucide-react';
import Modal from './shared/Modal';

interface SmartBookingManagementProps {
  bookings: Booking[];
  rooms: ClinicRoom[];
  staffList: StaffMember[];
  services: Service[];
  onSaveBooking: (booking: Booking) => void;
  onUpdateStatus: (bookingId: string, status: BookingStatus) => void;
  onSendZnsReminder: (booking: Booking) => void;
}

const SmartBookingManagement: React.FC<SmartBookingManagementProps> = ({
  bookings,
  rooms,
  staffList,
  services,
  onSaveBooking,
  onUpdateStatus,
  onSendZnsReminder
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'today' | 'rooms' | 'channels'>('today');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Modal State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);

  // Form State
  const [formCustomerName, setFormCustomerName] = useState('');
  const [formCustomerCode, setFormCustomerCode] = useState('');
  const [formCustomerPhone, setFormCustomerPhone] = useState('');
  const [formServiceId, setFormServiceId] = useState('');
  const [formChannel, setFormChannel] = useState<BookingChannel>('zalo');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formTime, setFormTime] = useState('09:30');
  const [formDuration, setFormDuration] = useState(60);
  const [formTechnicianId, setFormTechnicianId] = useState('');
  const [formRoomId, setFormRoomId] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formDeposit, setFormDeposit] = useState<number>(0);

  // Technicians (Staff with isTechnician === true)
  const technicians = useMemo(() => {
    return staffList.filter(s => s.status === 'active' && s.isTechnician);
  }, [staffList]);

  // Smart Auto-Allocation Logic
  const handleAutoAllocate = () => {
    if (!formServiceId) {
      alert('Vui lòng chọn dịch vụ trước để hệ thống phân tích kỹ năng KTV và phòng phù hợp!');
      return;
    }

    const selectedService = services.find(s => s.id === formServiceId);
    const serviceName = selectedService?.name || '';

    // 1. Determine best room based on service category / name
    let recommendedRoom = rooms.find(r => r.status === 'available');
    if (serviceName.toLowerCase().includes('laser') || serviceName.toLowerCase().includes('pico') || serviceName.toLowerCase().includes('co2')) {
      const laserRoom = rooms.find(r => r.type === 'laser' && r.status === 'available');
      if (laserRoom) recommendedRoom = laserRoom;
    } else if (serviceName.toLowerCase().includes('hifu') || serviceName.toLowerCase().includes('rf') || serviceName.toLowerCase().includes('nâng cơ')) {
      const hifuRoom = rooms.find(r => r.type === 'hifu' && r.status === 'available');
      if (hifuRoom) recommendedRoom = hifuRoom;
    } else if (serviceName.toLowerCase().includes('hydra') || serviceName.toLowerCase().includes('vip')) {
      const vipRoom = rooms.find(r => r.type === 'vip' && r.status === 'available');
      if (vipRoom) recommendedRoom = vipRoom;
    }

    if (recommendedRoom) {
      setFormRoomId(recommendedRoom.id);
    }

    // 2. Recommend best technician who has the least bookings on that day
    const techBookingCounts: Record<string, number> = {};
    technicians.forEach(t => { techBookingCounts[t.id] = 0; });
    bookings.filter(b => b.date === formDate && b.status !== 'cancelled').forEach(b => {
      if (b.technicianId && techBookingCounts[b.technicianId] !== undefined) {
        techBookingCounts[b.technicianId] += 1;
      }
    });

    const sortedTechs = [...technicians].sort((a, b) => (techBookingCounts[a.id] || 0) - (techBookingCounts[b.id] || 0));
    if (sortedTechs.length > 0) {
      setFormTechnicianId(sortedTechs[0].id);
      alert(`[AI Smart Allocate] Đã phân bổ tối ưu:\n• Kỹ thuật viên: ${sortedTechs[0].name} (Đang có ít lịch nhất ca: ${techBookingCounts[sortedTechs[0].id] || 0} lịch)\n• Phòng: ${recommendedRoom?.name || 'Phòng Laser/Facial'}`);
    }
  };

  const handleOpenAddModal = () => {
    setEditingBooking(null);
    setFormCustomerName('');
    setFormCustomerCode(`KH-${Math.floor(1000 + Math.random() * 9000)}`);
    setFormCustomerPhone('');
    setFormServiceId(services[0]?.id || '');
    setFormChannel('zalo');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormTime('10:00');
    setFormDuration(60);
    setFormTechnicianId(technicians[0]?.id || '');
    setFormRoomId(rooms[0]?.id || '');
    setFormNotes('');
    setFormDeposit(0);
    setIsBookingModalOpen(true);
  };

  const handleOpenEditModal = (bk: Booking) => {
    setEditingBooking(bk);
    setFormCustomerName(bk.customerName);
    setFormCustomerCode(bk.customerCode);
    setFormCustomerPhone(bk.customerPhone);
    setFormServiceId(bk.serviceId);
    setFormChannel(bk.channel);
    setFormDate(bk.date);
    setFormTime(bk.time);
    setFormDuration(bk.durationMinutes);
    setFormTechnicianId(bk.technicianId || '');
    setFormRoomId(bk.roomId || '');
    setFormNotes(bk.notes || '');
    setFormDeposit(bk.depositAmount || 0);
    setIsBookingModalOpen(true);
  };

  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCustomerName.trim() || !formCustomerPhone.trim()) {
      alert('Vui lòng nhập họ tên và số điện thoại khách hàng!');
      return;
    }

    const selectedService = services.find(s => s.id === formServiceId);
    const selectedTech = staffList.find(s => s.id === formTechnicianId);
    const selectedRoom = rooms.find(r => r.id === formRoomId);

    const newBooking: Booking = {
      id: editingBooking?.id || `bk-${Date.now()}`,
      customerCode: formCustomerCode || `KH-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: formCustomerName.trim(),
      customerPhone: formCustomerPhone.trim(),
      serviceId: formServiceId,
      serviceName: selectedService?.name || 'Dịch vụ thẩm mỹ',
      channel: formChannel,
      date: formDate,
      time: formTime,
      durationMinutes: Number(formDuration),
      technicianId: formTechnicianId || undefined,
      technicianName: selectedTech?.name || undefined,
      roomId: formRoomId || undefined,
      roomName: selectedRoom?.name || undefined,
      status: editingBooking?.status || 'confirmed',
      notes: formNotes.trim(),
      depositAmount: Number(formDeposit),
      znsReminderSent: editingBooking?.znsReminderSent || false,
      csatSent: editingBooking?.csatSent || false,
      createdDate: editingBooking?.createdDate || new Date().toISOString().split('T')[0]
    };

    onSaveBooking(newBooking);
    setIsBookingModalOpen(false);
  };

  // Filtered Bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      // Date filter
      if (activeTab === 'today' && b.date !== selectedDate) return false;

      // Status filter
      if (selectedStatus !== 'all' && b.status !== selectedStatus) return false;

      // Channel filter
      if (selectedChannel !== 'all' && b.channel !== selectedChannel) return false;

      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = b.customerName.toLowerCase().includes(q);
        const matchPhone = b.customerPhone.includes(q);
        const matchCode = b.customerCode.toLowerCase().includes(q);
        const matchService = b.serviceName.toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchCode && !matchService) return false;
      }

      return true;
    }).sort((a, b) => a.time.localeCompare(b.time));
  }, [bookings, activeTab, selectedDate, selectedStatus, selectedChannel, searchQuery]);

  // Status Badge Helper
  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'confirmed':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"><CheckCircle2 className="w-3.5 h-3.5" /> Đã xác nhận</span>;
      case 'in_progress':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 animate-pulse"><Activity className="w-3.5 h-3.5" /> Đang thực hiện</span>;
      case 'completed':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200"><Award className="w-3.5 h-3.5" /> Hoàn thành</span>;
      case 'pending':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200"><Clock className="w-3.5 h-3.5" /> Chờ xác nhận</span>;
      case 'cancelled':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">Đã hủy</span>;
      default:
        return null;
    }
  };

  const getChannelBadge = (ch: BookingChannel) => {
    switch (ch) {
      case 'zalo':
        return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-blue-100 text-blue-800">Zalo OA</span>;
      case 'facebook':
        return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-indigo-100 text-indigo-800">Fanpage</span>;
      case 'web':
        return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-100 text-emerald-800">Website</span>;
      case 'app':
        return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-pink-100 text-pink-800">Mobile App</span>;
      case 'hotline':
        return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-100 text-amber-800">Hotline</span>;
      case 'walkin':
        return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-gray-200 text-gray-800">Vãng lai</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-[#5C3A3A] via-[#8B4F58] to-[#D97A7D] text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 tracking-wide uppercase">
              Smart Clinic Module
            </span>
            <span className="text-xs bg-emerald-400/20 text-emerald-200 px-2 py-0.5 rounded border border-emerald-400/30">
              Đồng bộ đa kênh Real-time
            </span>
          </div>
          <h2 className="text-2xl font-bold mt-1 tracking-tight">Quản Lý Đặt Lịch Hẹn Thông Minh</h2>
          <p className="text-white/80 text-sm mt-1 max-w-2xl">
            Tự động phân bổ kỹ thuật viên theo tay nghề, điều phối phòng chuyên khoa tránh chồng chéo, và tích hợp gửi thông báo Zalo ZNS trước 24h.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-white text-[#5C3A3A] hover:bg-rose-50 font-bold rounded-xl shadow transition-all duration-200 transform hover:-translate-y-0.5 cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-5 h-5 text-[#D97A7D]" />
          Tạo Lịch Hẹn Mới
        </button>
      </div>

      {/* Facilities Quick Glance: Real-time Rooms Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {rooms.map(room => {
          const isOccupied = room.status === 'occupied';
          const isCleaning = room.status === 'cleaning';
          const currentBooking = bookings.find(b => b.roomId === room.id && b.status === 'in_progress');

          return (
            <div
              key={room.id}
              className={`p-3.5 rounded-xl border transition-all ${
                isOccupied
                  ? 'bg-rose-50/70 border-rose-200 text-rose-900'
                  : isCleaning
                  ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                  : 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-xs uppercase tracking-wider">{room.name}</span>
                <span className={`w-2 h-2 rounded-full ${isOccupied ? 'bg-rose-500 animate-ping' : isCleaning ? 'bg-amber-500' : 'bg-emerald-500'}`} />
              </div>
              <div className="text-xs flex items-center justify-between">
                <span>{isOccupied ? 'Đang thực hiện' : isCleaning ? 'Đang vệ sinh / Khử khuẩn' : 'Sẵn sàng đón khách'}</span>
                <span className="font-semibold">{room.bedCount} giường</span>
              </div>
              {currentBooking && (
                <div className="mt-2 pt-2 border-t border-rose-200 text-[11px] font-medium text-rose-800 truncate">
                  👤 {currentBooking.customerName} ({currentBooking.serviceName})
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Toolbar & Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setActiveTab('today')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${
              activeTab === 'today' ? 'bg-[#D97A7D] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Lịch Hôm Nay ({bookings.filter(b => b.date === selectedDate).length})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${
              activeTab === 'all' ? 'bg-[#D97A7D] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Tất Cả Lịch Hẹn ({bookings.length})
          </button>
        </div>

        {/* Date Picker & Search */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {activeTab === 'today' && (
            <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
              <span className="text-xs text-gray-500 font-medium">Chọn ngày:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="text-xs font-semibold bg-transparent focus:outline-none text-gray-700"
              />
            </div>
          )}

          {/* Status filter */}
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="text-xs px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="confirmed">Đã xác nhận</option>
            <option value="in_progress">Đang thực hiện</option>
            <option value="completed">Hoàn thành</option>
            <option value="pending">Chờ xác nhận</option>
            <option value="cancelled">Đã hủy</option>
          </select>

          {/* Channel filter */}
          <select
            value={selectedChannel}
            onChange={e => setSelectedChannel(e.target.value)}
            className="text-xs px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none"
          >
            <option value="all">Đa kênh</option>
            <option value="zalo">Zalo OA</option>
            <option value="facebook">Fanpage</option>
            <option value="web">Website</option>
            <option value="app">Mobile App</option>
            <option value="hotline">Hotline</option>
            <option value="walkin">Vãng lai</option>
          </select>

          {/* Search Input */}
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm tên, SĐT, mã KH..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D97A7D]"
            />
          </div>
        </div>
      </div>

      {/* Bookings Table View */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/80 text-gray-600 text-xs uppercase font-semibold border-b border-gray-200">
              <tr>
                <th className="px-4 py-3">Khung Giờ</th>
                <th className="px-4 py-3">Khách Hàng</th>
                <th className="px-4 py-3">Dịch Vụ & Thời Lượng</th>
                <th className="px-4 py-3">Kênh Đặt</th>
                <th className="px-4 py-3">Phòng & Kỹ Thuật Viên</th>
                <th className="px-4 py-3 text-center">Trạng Thái</th>
                <th className="px-4 py-3 text-center">Nhắc Zalo</th>
                <th className="px-4 py-3 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                    <Calendar className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    Không tìm thấy lịch hẹn nào theo điều kiện lọc
                  </td>
                </tr>
              ) : (
                filteredBookings.map(bk => (
                  <tr key={bk.id} className="hover:bg-rose-50/30 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-bold text-gray-800">
                        <Clock className="w-4 h-4 text-[#D97A7D]" />
                        <span>{bk.time}</span>
                      </div>
                      <div className="text-[11px] text-gray-400">{bk.date}</div>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-semibold text-gray-900 flex items-center gap-1.5">
                        {bk.customerName}
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-mono">
                          {bk.customerCode}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-gray-400" />
                        {bk.customerPhone}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-800">{bk.serviceName}</div>
                      <div className="text-xs text-gray-500">
                        ⏱️ {bk.durationMinutes} phút
                        {bk.depositAmount && bk.depositAmount > 0 ? (
                          <span className="ml-2 text-emerald-600 font-semibold">
                            (Cọc: {bk.depositAmount.toLocaleString()} đ)
                          </span>
                        ) : null}
                      </div>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      {getChannelBadge(bk.channel)}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-xs font-semibold text-gray-700">
                        <DoorOpen className="w-3.5 h-3.5 text-[#5C3A3A]" />
                        {bk.roomName || <span className="text-amber-600 font-normal">Chưa gán phòng</span>}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                        <User className="w-3.5 h-3.5 text-gray-400" />
                        {bk.technicianName || <span className="text-amber-600 font-normal">Chưa chọn KTV</span>}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      {getStatusBadge(bk.status)}
                    </td>

                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      {bk.znsReminderSent ? (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Đã gửi ZNS
                        </span>
                      ) : (
                        <button
                          onClick={() => onSendZnsReminder(bk)}
                          className="px-2 py-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium rounded-lg border border-blue-200 transition-colors flex items-center gap-1 mx-auto"
                          title="Gửi tin nhắn Zalo ZNS nhắc lịch"
                        >
                          <Send className="w-3 h-3" /> Gửi nhắc 24h
                        </button>
                      )}
                    </td>

                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {bk.status === 'confirmed' && (
                          <button
                            onClick={() => onUpdateStatus(bk.id, 'in_progress')}
                            className="px-2.5 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-xs"
                          >
                            Bắt đầu
                          </button>
                        )}
                        {bk.status === 'in_progress' && (
                          <button
                            onClick={() => onUpdateStatus(bk.id, 'completed')}
                            className="px-2.5 py-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shadow-xs"
                          >
                            Xong
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenEditModal(bk)}
                          className="px-2.5 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg"
                        >
                          Sửa
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

      {/* MODAL: ADD / EDIT SMART BOOKING */}
      {isBookingModalOpen && (
        <Modal
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          title={editingBooking ? 'Cập Nhật Lịch Hẹn' : 'Đặt Lịch Hẹn Thông Minh'}
          maxWidth="max-w-2xl"
        >
          <form onSubmit={handleSubmitBooking} className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-rose-50/50 rounded-xl border border-rose-100">
              <span className="text-xs text-gray-600 font-medium">
                Tự động đồng bộ lịch và điều phối phòng & KTV tay nghề cao
              </span>
              <button
                type="button"
                onClick={handleAutoAllocate}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#D97A7D] hover:bg-[#c66c6f] text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                AI Tự Phân Bổ KTV & Phòng
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Mã Khách Hàng</label>
                <input
                  type="text"
                  value={formCustomerCode}
                  onChange={e => setFormCustomerCode(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg bg-gray-50 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Tên Khách Hàng *</label>
                <input
                  type="text"
                  required
                  placeholder="Vd: Nguyễn Thị Lan"
                  value={formCustomerName}
                  onChange={e => setFormCustomerName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#D97A7D] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Số Điện Thoại *</label>
                <input
                  type="tel"
                  required
                  placeholder="09xx xxx xxx"
                  value={formCustomerPhone}
                  onChange={e => setFormCustomerPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#D97A7D] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Dịch Vụ Đặt Hẹn *</label>
                <select
                  value={formServiceId}
                  onChange={e => setFormServiceId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none"
                >
                  {services.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.category || 'Dịch vụ'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Kênh Đặt Hẹn</label>
                <select
                  value={formChannel}
                  onChange={e => setFormChannel(e.target.value as BookingChannel)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none"
                >
                  <option value="zalo">Zalo OA</option>
                  <option value="facebook">Facebook Fanpage</option>
                  <option value="web">Website Đặt Lịch</option>
                  <option value="app">Mobile App Khách Hàng</option>
                  <option value="hotline">Tổng Đài Hotline</option>
                  <option value="walkin">Khách Vãng Lai</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Ngày Hẹn</label>
                <input
                  type="date"
                  value={formDate}
                  onChange={e => setFormDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Giờ Hẹn</label>
                <input
                  type="time"
                  value={formTime}
                  onChange={e => setFormTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Thời Lượng (Phút)</label>
                <select
                  value={formDuration}
                  onChange={e => setFormDuration(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none"
                >
                  <option value={30}>30 phút</option>
                  <option value={45}>45 phút</option>
                  <option value={60}>60 phút</option>
                  <option value={90}>90 phút</option>
                  <option value={120}>120 phút</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Phòng Dịch Vụ</label>
                <select
                  value={formRoomId}
                  onChange={e => setFormRoomId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none"
                >
                  <option value="">-- Chọn phòng thẩm mỹ --</option>
                  {rooms.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.status === 'occupied' ? 'Đang có khách' : 'Trống'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Kỹ Thuật Viên Phụ Trách</label>
                <select
                  value={formTechnicianId}
                  onChange={e => setFormTechnicianId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none"
                >
                  <option value="">-- Chọn KTV phụ trách --</option>
                  {technicians.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.position})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Tiền Đặt Cọc (VND)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={formDeposit}
                  onChange={e => setFormDeposit(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Ghi Chú Đặt Lịch</label>
                <input
                  type="text"
                  placeholder="Vd: Da nhạy cảm, cần bôi tê trước 20 phút..."
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setIsBookingModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Đóng
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-[#D97A7D] hover:bg-[#c76b6e] rounded-lg shadow-sm"
              >
                {editingBooking ? 'Lưu Thay Đổi' : 'Xác Nhận Đặt Hẹn'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default SmartBookingManagement;

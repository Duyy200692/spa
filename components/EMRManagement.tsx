import React, { useState } from 'react';
import {
  MedicalRecord,
  TreatmentSession,
  StaffMember,
  SkinAnalysisReport
} from '../types';
import {
  FileText,
  Zap,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  HeartPulse,
  Printer,
  ShieldCheck,
  Camera,
  Layers,
  Sparkles,
  FolderCheck,
  ArrowUpRight
} from 'lucide-react';
import Modal from './shared/Modal';

interface EMRManagementProps {
  medicalRecords: MedicalRecord[];
  staffList: StaffMember[];
  tips?: unknown;
  skinReports?: SkinAnalysisReport[];
  onSaveRecord: (record: MedicalRecord) => void;
  onDeductTipShots?: (machineModel: string, tipName: string, shots: number) => void;
  onNavigateToHardware?: () => void;
}

const EMRManagement: React.FC<EMRManagementProps> = ({
  medicalRecords,
  staffList,
  skinReports = [],
  onSaveRecord,
  onDeductTipShots,
  onNavigateToHardware
}) => {
  const [selectedRecordId, setSelectedRecordId] = useState<string>(medicalRecords[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkinType, setSelectedSkinType] = useState<string>('all');
  const [selectedSkinReportIndex, setSelectedSkinReportIndex] = useState(0);

  // Modals
  const [isAddSessionModalOpen, setIsAddSessionModalOpen] = useState(false);
  const [isNewPatientModalOpen, setIsNewPatientModalOpen] = useState(false);

  // New Patient Form
  const [newCustCode, setNewCustCode] = useState(`KH-${Math.floor(1000 + Math.random() * 9000)}`);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustGender, setNewCustGender] = useState<'female' | 'male' | 'other'>('female');
  const [newCustBirthYear, setNewCustBirthYear] = useState<number>(1993);
  const [newCustSkinType, setNewCustSkinType] = useState<MedicalRecord['skinType']>('combination');
  const [newCustAllergies, setNewCustAllergies] = useState('');
  const [newCustDiagnosis, setNewCustDiagnosis] = useState('');
  const [newCustPlan, setNewCustPlan] = useState('');
  const [newCustTotalSessions, setNewCustTotalSessions] = useState(6);
  const [newCustDoctor, setNewCustDoctor] = useState('BS. CKI Da liễu Trần Anh Thư');

  // New Treatment Session Form
  const [sessionServiceName, setSessionServiceName] = useState('');
  const [sessionDoctorOrTech, setSessionDoctorOrTech] = useState(staffList[0]?.name || 'Nguyễn Thị Mai (KTV Trưởng)');
  const [sessionMachineName, setSessionMachineName] = useState('PicoWay Laser Picosecond');
  const [sessionWavelength, setSessionWavelength] = useState('1064nm Zoom');
  const [sessionEnergy, setSessionEnergy] = useState('2.5 J/cm²');
  const [sessionFrequency, setSessionFrequency] = useState('10 Hz');
  const [sessionSpotSize, setSessionSpotSize] = useState('7 mm');
  const [sessionTipCartridge, setSessionTipCartridge] = useState('Tiêu Chuẩn');
  const [sessionShotsFired, setSessionShotsFired] = useState<number>(1800);
  const [sessionSkinReaction, setSessionSkinReaction] = useState('Hồng nhẹ, châm chích thoáng qua, đáp ứng lâm sàng tốt');
  const [sessionHomeCare, setSessionHomeCare] = useState('Rửa nước muối sinh lý 24h đầu, bôi serum B5 phục hồi, tránh nắng kỹ.');
  const [sessionDoctorNote, setSessionDoctorNote] = useState('Hạt sắc tố đáp ứng tốt, mật độ phân rã sắc tố cao.');

  // Current active record
  const currentRecord = medicalRecords.find(r => r.id === selectedRecordId) || medicalRecords[0];

  // Filtered list
  const filteredRecords = medicalRecords.filter(r => {
    if (selectedSkinType !== 'all' && r.skinType !== selectedSkinType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = r.customerName.toLowerCase().includes(q);
      const matchPhone = r.customerPhone.includes(q);
      const matchCode = r.customerCode.toLowerCase().includes(q);
      const matchDiagnosis = r.diagnosis.toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchCode && !matchDiagnosis) return false;
    }
    return true;
  });

  const handleOpenAddSession = () => {
    if (!currentRecord) return;
    setSessionServiceName(currentRecord.treatmentPlan.split(':')[0] || 'Laser Điều Trị Chuyên Sâu');
    setIsAddSessionModalOpen(true);
  };

  const handleSubmitNewSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRecord) return;

    const nextSessionNum = (currentRecord.sessions?.length || 0) + 1;
    const newSession: TreatmentSession = {
      id: `ss-${Date.now()}`,
      sessionNumber: nextSessionNum,
      date: new Date().toISOString().split('T')[0],
      serviceName: sessionServiceName || 'Liệu trình thẩm mỹ chuyên sâu',
      doctorOrTechId: 'staff-auto',
      doctorOrTechName: sessionDoctorOrTech,
      machineParams: {
        machineName: sessionMachineName,
        wavelength: sessionWavelength,
        energyFluence: sessionEnergy,
        frequency: sessionFrequency,
        spotSize: sessionSpotSize,
        tipCartridge: sessionTipCartridge,
        shotsFired: Number(sessionShotsFired)
      },
      skinReaction: sessionSkinReaction,
      homeCareInstruction: sessionHomeCare,
      doctorNote: sessionDoctorNote,
      signatureVerified: true
    };

    const updatedSessions = [...(currentRecord.sessions || []), newSession];
    const updatedRecord: MedicalRecord = {
      ...currentRecord,
      completedSessions: updatedSessions.length,
      sessions: updatedSessions,
      updatedDate: new Date().toISOString().split('T')[0],
      status: updatedSessions.length >= currentRecord.totalSessions ? 'completed' : 'active'
    };

    onSaveRecord(updatedRecord);

    // Auto-deduct shots from high-tech tip if applicable
    if (onDeductTipShots && sessionShotsFired > 0) {
      onDeductTipShots(sessionMachineName, sessionTipCartridge, Number(sessionShotsFired));
    }

    alert(`✅ Đã lưu Buổi điều trị thứ ${nextSessionNum} thành công!\n• Đã ghi nhận thông số máy móc vào hồ sơ điện tử EMR.\n• Đã trừ ${sessionShotsFired} shot/xung tương ứng trong quản lý đầu tip công nghệ cao.`);
    setIsAddSessionModalOpen(false);
  };

  const handleCreatePatientRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim() || !newCustPhone.trim()) {
      alert('Vui lòng nhập tên và số điện thoại khách hàng!');
      return;
    }

    const newRec: MedicalRecord = {
      id: `emr-${Date.now()}`,
      customerCode: newCustCode,
      customerName: newCustName.trim(),
      customerPhone: newCustPhone.trim(),
      gender: newCustGender,
      birthYear: Number(newCustBirthYear),
      skinType: newCustSkinType,
      allergies: newCustAllergies.trim() || 'Không ghi nhận dị ứng',
      diagnosis: newCustDiagnosis.trim() || 'Chăm sóc và trẻ hóa da liễu',
      treatmentPlan: newCustPlan.trim() || 'Phác đồ điều trị chuẩn y khoa',
      totalSessions: Number(newCustTotalSessions),
      completedSessions: 0,
      sessions: [],
      status: 'active',
      createdDate: new Date().toISOString().split('T')[0],
      updatedDate: new Date().toISOString().split('T')[0],
      doctorInCharge: newCustDoctor
    };

    onSaveRecord(newRec);
    setSelectedRecordId(newRec.id);
    setIsNewPatientModalOpen(false);
  };

  const getSkinTypeBadge = (st: MedicalRecord['skinType']) => {
    switch (st) {
      case 'oily': return <span className="px-2 py-0.5 rounded text-xs bg-amber-100 text-amber-800 font-medium">Da Dầu Nhờn</span>;
      case 'dry': return <span className="px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-800 font-medium">Da Khô Mất Nước</span>;
      case 'combination': return <span className="px-2 py-0.5 rounded text-xs bg-emerald-100 text-emerald-800 font-medium">Da Hỗn Hợp</span>;
      case 'sensitive': return <span className="px-2 py-0.5 rounded text-xs bg-rose-100 text-rose-800 font-medium">Da Nhạy Cảm / Dễ Đỏ</span>;
      default: return <span className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-800 font-medium">Da Thường</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#3B2C35] via-[#5C3A3A] to-[#8B4F58] text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 tracking-wide uppercase">
              Medical EMR System
            </span>
            <span className="text-xs bg-cyan-400/20 text-cyan-200 px-2 py-0.5 rounded border border-cyan-400/30 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Chuẩn Y Khoa Quốc Tế
            </span>
          </div>
          <h2 className="text-2xl font-bold mt-1 tracking-tight">Hồ Sơ Bệnh Án Điện Tử & Theo Dõi Phác Đồ (EMR)</h2>
          <p className="text-white/80 text-sm mt-1 max-w-2xl">
            Lưu trữ lịch sử điều trị từng buổi, thông số máy công nghệ cao (Bước sóng, Năng lượng, Tần số, Số shot), hình ảnh Before/After và tự động đồng bộ kết quả soi da.
          </p>
        </div>

        <button
          onClick={() => {
            setNewCustCode(`KH-${Math.floor(1000 + Math.random() * 9000)}`);
            setNewCustName('');
            setNewCustPhone('');
            setNewCustDiagnosis('');
            setNewCustPlan('');
            setIsNewPatientModalOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-white text-[#5C3A3A] hover:bg-rose-50 font-bold rounded-xl shadow transition-all duration-200 cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-5 h-5 text-[#D97A7D]" />
          Mở Hồ Sơ Bệnh Án Mới
        </button>
      </div>

      {/* Main EMR Layout: Left List + Right Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Patients List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm mã KH, họ tên, SĐT..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D97A7D]"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500 px-1 font-medium">
              <span>Danh sách bệnh án ({filteredRecords.length})</span>
              <select
                value={selectedSkinType}
                onChange={e => setSelectedSkinType(e.target.value)}
                className="text-[11px] bg-transparent border-0 text-gray-600 focus:outline-none cursor-pointer"
              >
                <option value="all">Tất cả loại da</option>
                <option value="oily">Da dầu</option>
                <option value="dry">Da khô</option>
                <option value="combination">Da hỗn hợp</option>
                <option value="sensitive">Da nhạy cảm</option>
              </select>
            </div>
          </div>

          <div className="space-y-2 max-h-[700px] overflow-y-auto pr-1">
            {filteredRecords.map(rec => {
              const isSelected = rec.id === selectedRecordId;
              const percent = Math.round((rec.completedSessions / rec.totalSessions) * 100);

              return (
                <div
                  key={rec.id}
                  onClick={() => setSelectedRecordId(rec.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-rose-50/90 border-[#D97A7D] shadow-sm'
                      : 'bg-white border-gray-200 hover:border-rose-200 hover:bg-gray-50/50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                        {rec.customerName}
                        <span className="text-[11px] font-mono font-medium text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                          {rec.customerCode}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">📞 {rec.customerPhone}</div>
                    </div>
                    {getSkinTypeBadge(rec.skinType)}
                  </div>

                  <div className="text-xs text-gray-700 font-medium mt-2 line-clamp-1">
                    📋 {rec.diagnosis}
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="flex justify-between text-[11px] text-gray-500 mb-1">
                      <span>Tiến độ phác đồ</span>
                      <span className="font-bold text-[#5C3A3A]">{rec.completedSessions}/{rec.totalSessions} buổi ({percent}%)</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#D97A7D] to-[#8B4F58] rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, percent)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Medical Record & Sessions */}
        <div className="lg:col-span-8 space-y-6">
          {currentRecord ? (
            <>
              {/* Patient Profile Card */}
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-gray-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold text-gray-900">{currentRecord.customerName}</h3>
                      <span className="px-2 py-0.5 rounded font-mono text-xs bg-gray-100 text-gray-700 font-semibold">
                        {currentRecord.customerCode}
                      </span>
                      {getSkinTypeBadge(currentRecord.skinType)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                      <span>📞 {currentRecord.customerPhone}</span>
                      <span>🎂 Năm sinh: {currentRecord.birthYear || '---'}</span>
                      <span>👩 Giới tính: {currentRecord.gender === 'female' ? 'Nữ' : 'Nam'}</span>
                      <span>🩺 Bác sĩ phụ trách: {currentRecord.doctorInCharge}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => window.print()}
                      className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg border border-gray-200 flex items-center gap-1.5"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      In Hồ Sơ
                    </button>
                    <button
                      onClick={handleOpenAddSession}
                      className="px-4 py-1.5 text-xs font-bold text-white bg-[#D97A7D] hover:bg-[#c76b6e] rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      Thêm Buổi Điều Trị
                    </button>
                  </div>
                </div>

                {/* Medical Diagnosis & Protocol Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/80">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 mb-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      Chẩn Đoán & Dị Ứng
                    </div>
                    <div className="text-xs text-gray-800 font-semibold">{currentRecord.diagnosis}</div>
                    <div className="text-[11px] text-amber-800 mt-1">
                      <span className="font-semibold">Tiền sử dị ứng:</span> {currentRecord.allergies || 'Không ghi nhận'}
                    </div>
                  </div>

                  <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200/80">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 mb-1">
                      <HeartPulse className="w-3.5 h-3.5 text-blue-600" />
                      Phác Đồ Điều Trị Y Khoa
                    </div>
                    <div className="text-xs text-gray-800 font-semibold">{currentRecord.treatmentPlan}</div>
                    <div className="text-[11px] text-blue-800 mt-1">
                      Đã thực hiện: <span className="font-bold">{currentRecord.completedSessions}</span> / {currentRecord.totalSessions} buổi theo phác đồ
                    </div>
                  </div>
                </div>
              </div>

              {/* Linked VISIA Multi-spectral Skin Reports Card */}
              {(() => {
                const patientSkinReports = skinReports.filter(r => r.customerCode === currentRecord?.customerCode);
                const activeSkinReport = patientSkinReports[selectedSkinReportIndex] || patientSkinReports[0];

                if (patientSkinReports.length === 0 || !activeSkinReport) return null;

                return (
                  <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center text-[#D97A7D]">
                          <Camera className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-gray-900 text-sm">
                              Hồ Sơ Soi Da Đa Phổ Canfield VISIA
                            </h4>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                              <FolderCheck className="w-3 h-3" /> Hot-Folder Auto-Synced
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">
                            Phiên khám ngày: {activeSkinReport.date} • Thiết bị: {activeSkinReport.deviceModel || activeSkinReport.analystName}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {patientSkinReports.length > 1 && (
                          <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg text-xs">
                            {patientSkinReports.map((rep, idx) => (
                              <button
                                key={rep.id}
                                onClick={() => setSelectedSkinReportIndex(idx)}
                                className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                                  (selectedSkinReportIndex === idx || (!selectedSkinReportIndex && idx === 0))
                                    ? 'bg-white text-gray-900 shadow-xs'
                                    : 'text-gray-500 hover:text-gray-900'
                                }`}
                              >
                                Lần {patientSkinReports.length - idx} ({rep.date})
                              </button>
                            ))}
                          </div>
                        )}
                        {onNavigateToHardware && (
                          <button
                            onClick={onNavigateToHardware}
                            className="text-xs text-[#D97A7D] hover:underline font-semibold flex items-center gap-1"
                          >
                            Trạm VISIA <ArrowUpRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Biological Age & Percentile */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-100 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-gray-500 block font-semibold">TUỔI SINH HỌC TRUSKIN AGE®</span>
                          <span className="text-lg font-bold text-blue-700">{activeSkinReport.skinAge} tuổi</span>
                        </div>
                        <div className="text-[11px] text-blue-600 font-medium text-right">
                          Tuổi thật: {currentRecord.birthYear ? new Date().getFullYear() - currentRecord.birthYear : '28'}
                        </div>
                      </div>

                      <div className="p-3 bg-rose-50/70 rounded-xl border border-rose-100 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-gray-500 block font-semibold">ĐIỂM SỨC KHỎE TỔNG THỂ</span>
                          <span className="text-lg font-bold text-[#D97A7D]">{activeSkinReport.overallScore}/100</span>
                        </div>
                        <span className="text-[11px] text-rose-700 font-medium">Thang Canfield</span>
                      </div>

                      <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-100 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-gray-500 block font-semibold">PHÂN VỊ DỮ LIỆU MẪU</span>
                          <span className="text-lg font-bold text-emerald-700">
                            Top {activeSkinReport.visiaMetrics ? (100 - activeSkinReport.visiaMetrics.percentileRank) : 25}%
                          </span>
                        </div>
                        <span className="text-[10px] text-emerald-600 font-medium">So với nhóm tuổi</span>
                      </div>
                    </div>

                    {/* 8 VISIA Multi-spectral Bars */}
                    {activeSkinReport.visiaMetrics && (
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[11px] font-bold text-gray-700 block uppercase tracking-wider">
                          8 Thông Số Đa Phổ Lâm Sàng
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                          <div className="p-2 bg-gray-50 rounded-lg border border-gray-100">
                            <div className="flex justify-between font-semibold text-gray-700 text-[11px] mb-1">
                              <span>Đốm nâu</span>
                              <span className="text-amber-700">{activeSkinReport.visiaMetrics.spots}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full bg-amber-500 rounded-full" style={{ width: `${activeSkinReport.visiaMetrics.spots}%` }} />
                            </div>
                          </div>

                          <div className="p-2 bg-gray-50 rounded-lg border border-gray-100">
                            <div className="flex justify-between font-semibold text-gray-700 text-[11px] mb-1">
                              <span>Nếp nhăn</span>
                              <span className="text-purple-700">{activeSkinReport.visiaMetrics.wrinkles}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full bg-purple-500 rounded-full" style={{ width: `${activeSkinReport.visiaMetrics.wrinkles}%` }} />
                            </div>
                          </div>

                          <div className="p-2 bg-gray-50 rounded-lg border border-gray-100">
                            <div className="flex justify-between font-semibold text-gray-700 text-[11px] mb-1">
                              <span>Đốm UV</span>
                              <span className="text-rose-700">{activeSkinReport.visiaMetrics.uvSpots}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full bg-rose-500 rounded-full" style={{ width: `${activeSkinReport.visiaMetrics.uvSpots}%` }} />
                            </div>
                          </div>

                          <div className="p-2 bg-gray-50 rounded-lg border border-gray-100">
                            <div className="flex justify-between font-semibold text-gray-700 text-[11px] mb-1">
                              <span>Nám Melanin</span>
                              <span className="text-orange-700">{activeSkinReport.visiaMetrics.brownSpots}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full bg-orange-600 rounded-full" style={{ width: `${activeSkinReport.visiaMetrics.brownSpots}%` }} />
                            </div>
                          </div>

                          <div className="p-2 bg-gray-50 rounded-lg border border-gray-100">
                            <div className="flex justify-between font-semibold text-gray-700 text-[11px] mb-1">
                              <span>Lỗ chân lông</span>
                              <span className="text-indigo-700">{activeSkinReport.visiaMetrics.pores}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${activeSkinReport.visiaMetrics.pores}%` }} />
                            </div>
                          </div>

                          <div className="p-2 bg-gray-50 rounded-lg border border-gray-100">
                            <div className="flex justify-between font-semibold text-gray-700 text-[11px] mb-1">
                              <span>Mao mạch đỏ</span>
                              <span className="text-red-700">{activeSkinReport.visiaMetrics.redAreas}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full bg-red-500 rounded-full" style={{ width: `${activeSkinReport.visiaMetrics.redAreas}%` }} />
                            </div>
                          </div>

                          <div className="p-2 bg-gray-50 rounded-lg border border-gray-100">
                            <div className="flex justify-between font-semibold text-gray-700 text-[11px] mb-1">
                              <span>P.Acnes</span>
                              <span className="text-pink-700">{activeSkinReport.visiaMetrics.porphyrins}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full bg-pink-500 rounded-full" style={{ width: `${activeSkinReport.visiaMetrics.porphyrins}%` }} />
                            </div>
                          </div>

                          <div className="p-2 bg-gray-50 rounded-lg border border-gray-100">
                            <div className="flex justify-between font-semibold text-gray-700 text-[11px] mb-1">
                              <span>Kết cấu da</span>
                              <span className="text-blue-700">{activeSkinReport.visiaMetrics.texture}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${activeSkinReport.visiaMetrics.texture}%` }} />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Diagnosis & Recommendations */}
                    <div className="p-3 bg-gray-50 rounded-xl text-xs text-gray-700 border border-gray-100 space-y-1">
                      <div className="font-semibold text-gray-900 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#D97A7D]" />
                        Gợi Ý Phác Đồ Dựa Trên Kết Quả Soi Da:
                      </div>
                      <p className="text-[11px] text-gray-600 leading-relaxed">{activeSkinReport.diagnosisSummary}</p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {activeSkinReport.aiRecommendedServices.map((srv, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded bg-white border border-gray-200 font-semibold text-[10px] text-[#5C3A3A]">
                            ✨ {srv}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Sessions Timeline View */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-gray-800 text-base flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#D97A7D]" />
                    Nhật Ký Từng Buổi Điều Trị & Thông Số Máy Móc ({currentRecord.sessions?.length || 0})
                  </h4>
                  <span className="text-xs text-gray-500 font-medium">
                    Cập nhật mới nhất: {currentRecord.updatedDate}
                  </span>
                </div>

                {(!currentRecord.sessions || currentRecord.sessions.length === 0) ? (
                  <div className="p-8 text-center bg-white rounded-2xl border border-gray-200 text-gray-400">
                    <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    Chưa có buổi điều trị nào được ghi nhận. Bấm nút "Thêm Buổi Điều Trị" để bắt đầu ghi nhật ký lâm sàng!
                  </div>
                ) : (
                  currentRecord.sessions.map((ss) => (
                    <div
                      key={ss.id}
                      className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
                    >
                      {/* Session Header */}
                      <div className="p-4 bg-gray-50 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-full bg-[#5C3A3A] text-white flex items-center justify-center font-bold text-xs">
                            #{ss.sessionNumber}
                          </span>
                          <div>
                            <div className="font-bold text-gray-900 text-sm">{ss.serviceName}</div>
                            <div className="text-xs text-gray-500 flex items-center gap-3">
                              <span>📅 Ngày: {ss.date}</span>
                              <span>👤 KTV / Bác sĩ: <strong className="text-gray-700">{ss.doctorOrTechName}</strong></span>
                            </div>
                          </div>
                        </div>

                        {ss.signatureVerified && (
                          <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Đã Ký Xác Nhận
                          </span>
                        )}
                      </div>

                      {/* Session Content */}
                      <div className="p-5 space-y-4">
                        {/* Machine Parameters Panel (VITAL HIGH-TECH CLINIC COMPONENT) */}
                        {ss.machineParams && (
                          <div className="p-3.5 bg-gradient-to-r from-rose-50/60 to-orange-50/60 rounded-xl border border-rose-200/70">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-[#5C3A3A] uppercase tracking-wider mb-2">
                              <Zap className="w-3.5 h-3.5 text-rose-500" />
                              Thông Số Kỹ Thuật Máy Móc & Đầu Tip Sử Dụng
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
                              <div className="bg-white p-2 rounded-lg border border-gray-100">
                                <span className="text-[10px] text-gray-400 block">Thiết bị</span>
                                <span className="font-bold text-gray-800 truncate block" title={ss.machineParams.machineName}>
                                  {ss.machineParams.machineName}
                                </span>
                              </div>
                              <div className="bg-white p-2 rounded-lg border border-gray-100">
                                <span className="text-[10px] text-gray-400 block">Bước sóng</span>
                                <span className="font-bold text-gray-800">{ss.machineParams.wavelength || '---'}</span>
                              </div>
                              <div className="bg-white p-2 rounded-lg border border-gray-100">
                                <span className="text-[10px] text-gray-400 block">Năng lượng</span>
                                <span className="font-bold text-emerald-700">{ss.machineParams.energyFluence || '---'}</span>
                              </div>
                              <div className="bg-white p-2 rounded-lg border border-gray-100">
                                <span className="text-[10px] text-gray-400 block">Tần số</span>
                                <span className="font-bold text-gray-800">{ss.machineParams.frequency || '---'}</span>
                              </div>
                              <div className="bg-white p-2 rounded-lg border border-gray-100">
                                <span className="text-[10px] text-gray-400 block">Spot size / Tip</span>
                                <span className="font-bold text-gray-800">{ss.machineParams.spotSize || ss.machineParams.tipCartridge || '---'}</span>
                              </div>
                              <div className="bg-white p-2 rounded-lg border border-gray-100">
                                <span className="text-[10px] text-gray-400 block">Số shot / xung</span>
                                <span className="font-bold text-[#D97A7D]">
                                  {ss.machineParams.shotsFired ? `${ss.machineParams.shotsFired.toLocaleString()} shots` : '---'}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Clinical notes & reactions */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                            <span className="font-bold text-gray-700 block mb-1">🔍 Phản ứng lâm sàng trên da:</span>
                            <p className="text-gray-600 leading-relaxed">{ss.skinReaction}</p>
                          </div>
                          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                            <span className="font-bold text-gray-700 block mb-1">🏠 Hướng dẫn chăm sóc tại nhà:</span>
                            <p className="text-gray-600 leading-relaxed">{ss.homeCareInstruction}</p>
                          </div>
                        </div>

                        {/* Before / After Images (Visual Inspection) */}
                        {ss.beforeImageUrl && ss.afterImageUrl && (
                          <div className="pt-2 border-t border-gray-100">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 mb-2">
                              <Camera className="w-3.5 h-3.5 text-[#D97A7D]" />
                              Hình Ảnh Đối Sánh Trước & Sau Buổi Điều Trị (Before / After)
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="relative rounded-xl overflow-hidden border border-gray-200 group aspect-video">
                                <img
                                  src={ss.beforeImageUrl}
                                  alt="Before"
                                  className="w-full h-full object-cover"
                                />
                                <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/70 text-white text-[10px] font-bold rounded">
                                  TRƯỚC ĐIỀU TRỊ
                                </span>
                              </div>
                              <div className="relative rounded-xl overflow-hidden border border-gray-200 group aspect-video">
                                <img
                                  src={ss.afterImageUrl}
                                  alt="After"
                                  className="w-full h-full object-cover"
                                />
                                <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-emerald-700/80 text-white text-[10px] font-bold rounded">
                                  KẾT QUẢ ĐÁP ỨNG
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <div className="p-12 text-center bg-white rounded-2xl border border-gray-200 text-gray-400">
              Vui lòng chọn một bệnh án để xem chi tiết phác đồ
            </div>
          )}
        </div>
      </div>

      {/* MODAL: ADD NEW TREATMENT SESSION */}
      {isAddSessionModalOpen && currentRecord && (
        <Modal
          isOpen={isAddSessionModalOpen}
          onClose={() => setIsAddSessionModalOpen(false)}
          title={`Ghi Nhận Buổi Điều Trị Thứ ${(currentRecord.sessions?.length || 0) + 1} - ${currentRecord.customerName}`}
          maxWidth="max-w-3xl"
        >
          <form onSubmit={handleSubmitNewSession} className="space-y-4">
            <div className="p-3 bg-rose-50/70 rounded-xl border border-rose-100 text-xs text-gray-700">
              📌 Thông số máy móc khi lưu sẽ được đồng bộ vào phác đồ y khoa và tự động khấu trừ số shoot tương ứng trong kho đầu tip công nghệ cao.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Dịch Vụ Thực Hiện *</label>
                <input
                  type="text"
                  required
                  value={sessionServiceName}
                  onChange={e => setSessionServiceName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Bác Sĩ / KTV Thực Hiện *</label>
                <select
                  value={sessionDoctorOrTech}
                  onChange={e => setSessionDoctorOrTech(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none"
                >
                  <option value="BS. CKI Da liễu Trần Anh Thư">BS. CKI Da liễu Trần Anh Thư</option>
                  {staffList.filter(s => s.status === 'active').map(s => (
                    <option key={s.id} value={s.name}>
                      {s.name} ({s.position})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* High-Tech Machine Parameters Box */}
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800">
                <Zap className="w-4 h-4 text-[#D97A7D]" />
                Cấu Hình Thông Số Thiết Bị & Đầu Tip
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">Tên Máy Sử Dụng</label>
                  <select
                    value={sessionMachineName}
                    onChange={e => setSessionMachineName(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg bg-white"
                  >
                    <option value="PicoWay Laser Picosecond">PicoWay Laser Picosecond</option>
                    <option value="HIFU Ultraformer MPT">HIFU Ultraformer MPT</option>
                    <option value="Thermage FLX">Thermage FLX</option>
                    <option value="Diode Laser Master 808nm">Diode Laser Master 808nm</option>
                    <option value="Fractional CO2 Laser Edge ONE">Fractional CO2 Laser Edge ONE</option>
                    <option value="Hydrafacial Syndeo Elite">Hydrafacial Syndeo Elite</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">Bước Sóng (nm)</label>
                  <input
                    type="text"
                    value={sessionWavelength}
                    onChange={e => setSessionWavelength(e.target.value)}
                    placeholder="Vd: 1064nm Zoom / 532nm"
                    className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">Mức Năng Lượng / Fluence</label>
                  <input
                    type="text"
                    value={sessionEnergy}
                    onChange={e => setSessionEnergy(e.target.value)}
                    placeholder="Vd: 2.6 J/cm2 hoặc 45 mJ"
                    className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">Tần Số (Hz)</label>
                  <input
                    type="text"
                    value={sessionFrequency}
                    onChange={e => setSessionFrequency(e.target.value)}
                    placeholder="Vd: 10 Hz"
                    className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">Spot Size (mm)</label>
                  <input
                    type="text"
                    value={sessionSpotSize}
                    onChange={e => setSessionSpotSize(e.target.value)}
                    placeholder="Vd: 7 mm Zoom"
                    className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">Đầu Cartridge / Tip</label>
                  <input
                    type="text"
                    value={sessionTipCartridge}
                    onChange={e => setSessionTipCartridge(e.target.value)}
                    placeholder="Vd: HIFU 3.0mm hoặc Zoom 7mm"
                    className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">Số Shot / Xung Đã Bắn</label>
                  <input
                    type="number"
                    value={sessionShotsFired}
                    onChange={e => setSessionShotsFired(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg bg-white text-[#D97A7D] font-bold"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Ghi Chú Chuyên Môn Của Bác Sĩ / KTV Trưởng</label>
              <input
                type="text"
                value={sessionDoctorNote}
                onChange={e => setSessionDoctorNote(e.target.value)}
                placeholder="Vd: Hạt sắc tố đáp ứng tốt, mật độ phân rã sắc tố cao..."
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Phản Ứng Trên Da</label>
                <textarea
                  rows={2}
                  value={sessionSkinReaction}
                  onChange={e => setSessionSkinReaction(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Hướng Dẫn Chăm Sóc Tại Nhà</label>
                <textarea
                  rows={2}
                  value={sessionHomeCare}
                  onChange={e => setSessionHomeCare(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setIsAddSessionModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Hủy Bỏ
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-[#D97A7D] hover:bg-[#c76b6e] rounded-lg shadow-sm"
              >
                Lưu Buổi Điều Trị & Cập Nhật Số Shoot
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL: CREATE NEW PATIENT MEDICAL RECORD */}
      {isNewPatientModalOpen && (
        <Modal
          isOpen={isNewPatientModalOpen}
          onClose={() => setIsNewPatientModalOpen(false)}
          title="Mở Hồ Sơ Bệnh Án Điện Tử Mới"
          maxWidth="max-w-2xl"
        >
          <form onSubmit={handleCreatePatientRecord} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Mã Khách Hàng</label>
                <input
                  type="text"
                  value={newCustCode}
                  onChange={e => setNewCustCode(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Họ & Tên Bệnh Nhân *</label>
                <input
                  type="text"
                  required
                  placeholder="Vd: Nguyễn Thị Lan"
                  value={newCustName}
                  onChange={e => setNewCustName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Số Điện Thoại *</label>
                <input
                  type="tel"
                  required
                  placeholder="09xx xxx xxx"
                  value={newCustPhone}
                  onChange={e => setNewCustPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Giới Tính</label>
                <select
                  value={newCustGender}
                  onChange={e => setNewCustGender(e.target.value as 'female' | 'male' | 'other')}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg"
                >
                  <option value="female">Nữ</option>
                  <option value="male">Nam</option>
                  <option value="other">Khác</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Loại Da</label>
                <select
                  value={newCustSkinType}
                  onChange={e => setNewCustSkinType(e.target.value as MedicalRecord['skinType'])}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg"
                >
                  <option value="combination">Da Hỗn Hợp</option>
                  <option value="oily">Da Dầu Nhờn</option>
                  <option value="dry">Da Khô</option>
                  <option value="sensitive">Da Nhạy Cảm</option>
                  <option value="normal">Da Thường</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Năm Sinh</label>
                <input
                  type="number"
                  value={newCustBirthYear}
                  onChange={e => setNewCustBirthYear(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Tổng Số Buổi Phác Đồ</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={newCustTotalSessions}
                  onChange={e => setNewCustTotalSessions(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Bác Sĩ Điều Trị Phụ Trách</label>
                <input
                  type="text"
                  value={newCustDoctor}
                  onChange={e => setNewCustDoctor(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Chẩn Đoán Da Liễu *</label>
              <input
                type="text"
                required
                placeholder="Vd: Nám mảng Melasma kết hợp tàn nhang sâu, da nhạy cảm nhẹ"
                value={newCustDiagnosis}
                onChange={e => setNewCustDiagnosis(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Phác Đồ Điều Trị Đề Xuất *</label>
              <textarea
                rows={2}
                required
                placeholder="Vd: Phác đồ Laser PicoWay 1064nm (6 buổi) + Điện di Tinh chất Phục hồi Multi-B5"
                value={newCustPlan}
                onChange={e => setNewCustPlan(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Tiền Sử Dị Ứng / Bệnh Lý</label>
              <input
                type="text"
                placeholder="Vd: Dị ứng Aspirin, da dễ bị tăng sắc tố sau viêm..."
                value={newCustAllergies}
                onChange={e => setNewCustAllergies(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setIsNewPatientModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Đóng
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-[#D97A7D] hover:bg-[#c76b6e] rounded-lg shadow-sm"
              >
                Tạo Bệnh Án Điện Tử
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default EMRManagement;

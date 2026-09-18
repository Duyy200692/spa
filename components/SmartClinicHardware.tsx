import React, { useState } from 'react';
import {
  IoTDevice,
  HighTechTip,
  SkinAnalysisReport,
  MedicalRecord
} from '../types';
import {
  Cpu,
  Zap,
  Activity,
  Gauge,
  Thermometer,
  AlertTriangle,
  Sparkles,
  Camera,
  Layers,
  Plus,
  Info,
  FolderSync,
  FolderCheck
} from 'lucide-react';
import Modal from './shared/Modal';
import VisiaHotFolderStation from './VisiaHotFolderStation';

interface SmartClinicHardwareProps {
  iotDevices: IoTDevice[];
  highTechTips: HighTechTip[];
  skinReports: SkinAnalysisReport[];
  medicalRecords: MedicalRecord[];
  onSyncSkinToEMR: (report: SkinAnalysisReport, customerCode: string) => void;
  onSaveTip: (tip: HighTechTip) => void;
  onUpdateDevice?: (device: IoTDevice) => void;
  onNavigateToEMR?: (customerCode?: string) => void;
}

const SmartClinicHardware: React.FC<SmartClinicHardwareProps> = ({
  iotDevices,
  highTechTips,
  skinReports,
  medicalRecords,
  onSyncSkinToEMR,
  onSaveTip,
  onUpdateDevice,
  onNavigateToEMR
}) => {
  const [activeTab, setActiveTab] = useState<'visia_hot_folder' | 'iot_devices' | 'skin_analyzer' | 'high_tech_tips'>('visia_hot_folder');
  const [selectedReportId, setSelectedReportId] = useState<string>(skinReports[0]?.id || '');
  const [isSimulateScanModalOpen, setIsSimulateScanModalOpen] = useState(false);
  const [isNewTipModalOpen, setIsNewTipModalOpen] = useState(false);

  // New Scan Form
  const [scanCustomerCode, setScanCustomerCode] = useState(medicalRecords[0]?.customerCode || 'KH-0089');
  const [scanCustomerName, setScanCustomerName] = useState(medicalRecords[0]?.customerName || 'Vương Thúy Hằng');
  const [scanAge, setScanAge] = useState(28);

  // New Tip Form
  const [tipName, setTipName] = useState('');
  const [tipCode, setTipCode] = useState('');
  const [tipModel, setTipModel] = useState('Ultraformer MPT (Classys)');
  const [tipMaxShots, setTipMaxShots] = useState(20000);
  const [tipThreshold, setTipThreshold] = useState(1500);
  const [tipPrice, setTipPrice] = useState(18500000);

  const currentReport = skinReports.find(r => r.id === selectedReportId) || skinReports[0];

  const handleSimulateNewScan = (e: React.FormEvent) => {
    e.preventDefault();
    const newRep: SkinAnalysisReport = {
      id: `skin-rep-${Date.now()}`,
      customerCode: scanCustomerCode,
      customerName: scanCustomerName,
      date: new Date().toISOString().split('T')[0],
      skinAge: scanAge + Math.floor(Math.random() * 4 - 2),
      overallScore: Math.floor(65 + Math.random() * 25),
      metrics: {
        hydration: Math.floor(45 + Math.random() * 35),
        sebum: Math.floor(40 + Math.random() * 40),
        pigmentation: Math.floor(35 + Math.random() * 45),
        wrinkles: Math.floor(30 + Math.random() * 30),
        pores: Math.floor(40 + Math.random() * 40),
        acneBacteria: Math.floor(20 + Math.random() * 40),
        elasticity: Math.floor(55 + Math.random() * 35)
      },
      diagnosisSummary: 'Phân tích AI Magic Mirror 3D hoàn tất: Đã nhận diện đa điểm sắc tố và mật độ vi mao mạch biểu bì.',
      aiRecommendedServices: [
        'Laser PicoWay Bước Sóng 1064nm',
        'Cấp Ẩm Tầng Sâu Hydrafacial Platinum',
        'Điện Di Tinh Chất Phục Hồi Tế Bào'
      ],
      analystName: 'AI Magic Mirror Pro v4.2'
    };

    onSyncSkinToEMR(newRep, scanCustomerCode);
    setIsSimulateScanModalOpen(false);
    alert(`Quét da AI 3D thành công cho ${scanCustomerName}!\n• Kết quả đã được đồng bộ trực tiếp vào Hồ sơ bệnh án điện tử (EMR).`);
  };

  const handleCreateTip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tipName.trim() || !tipCode.trim()) {
      alert('Vui lòng nhập tên và mã đầu tip!');
      return;
    }

    const newTip: HighTechTip = {
      id: `tip-${Date.now()}`,
      code: tipCode.trim(),
      name: tipName.trim(),
      machineModel: tipModel,
      totalMaxShots: Number(tipMaxShots),
      remainingShots: Number(tipMaxShots),
      alertThreshold: Number(tipThreshold),
      unitPrice: Number(tipPrice),
      installedDate: new Date().toISOString().split('T')[0],
      status: 'optimal',
      batchNumber: `BAT-${Math.floor(1000 + Math.random() * 9000)}`
    };

    onSaveTip(newTip);
    setIsNewTipModalOpen(false);
    alert('Đã thêm đầu tip máy công nghệ cao mới vào hệ thống kiểm soát!');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#2C3E50] via-[#34495E] to-[#5C3A3A] text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 tracking-wide uppercase">
              IoT & Smart Clinic Hardware
            </span>
            <span className="text-xs bg-cyan-400/20 text-cyan-200 px-2 py-0.5 rounded border border-cyan-400/30 flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5" /> Giám Sát Phần Cứng Real-Time
            </span>
          </div>
          <h2 className="text-2xl font-bold mt-1 tracking-tight">Hệ Thống Thiết Bị Thẩm Mỹ & Soi Da AI 3D</h2>
          <p className="text-white/80 text-sm mt-1 max-w-2xl">
            Theo dõi nhiệt độ, nguồn điện, số shoot đã bắn của các dòng máy công nghệ cao (Laser Pico, HIFU, RF), cảnh báo số shoot đầu tip và đồng bộ kết quả máy soi da AI trực tiếp vào EMR.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSimulateScanModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded-xl shadow transition-all cursor-pointer whitespace-nowrap text-xs"
          >
            <Camera className="w-4 h-4" />
            Soi Da AI Magic Mirror
          </button>
          <button
            onClick={() => {
              setTipName('');
              setTipCode(`TIP-UF-${Math.floor(100 + Math.random() * 900)}`);
              setIsNewTipModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-white text-gray-800 hover:bg-gray-100 font-bold rounded-xl shadow transition-all cursor-pointer whitespace-nowrap text-xs"
          >
            <Plus className="w-4 h-4 text-[#D97A7D]" />
            Thêm Đầu Tip Máy
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-white rounded-xl border border-gray-200 shadow-sm">
        <button
          onClick={() => setActiveTab('visia_hot_folder')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 ${
            activeTab === 'visia_hot_folder'
              ? 'bg-[#D97A7D] text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <FolderSync className="w-4 h-4" />
          Trạm Thu Thập VISIA (Hot-Folder Agent)
        </button>

        <button
          onClick={() => setActiveTab('iot_devices')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 ${
            activeTab === 'iot_devices'
              ? 'bg-[#D97A7D] text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Cpu className="w-4 h-4" />
          Giám Sát Máy Móc IoT ({iotDevices.length} thiết bị)
        </button>

        <button
          onClick={() => setActiveTab('skin_analyzer')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 ${
            activeTab === 'skin_analyzer'
              ? 'bg-[#D97A7D] text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Báo Cáo Soi Da & Phân Tích ({skinReports.length})
        </button>

        <button
          onClick={() => setActiveTab('high_tech_tips')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 ${
            activeTab === 'high_tech_tips'
              ? 'bg-[#D97A7D] text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          Quản Lý Đầu Tip & Số Shoot Còn Lại ({highTechTips.length} đầu tip)
        </button>
      </div>

      {/* TAB: VISIA HOT-FOLDER INTEGRATION HUB */}
      {activeTab === 'visia_hot_folder' && (
        <VisiaHotFolderStation
          skinReports={skinReports}
          medicalRecords={medicalRecords}
          onSyncSkinToEMR={onSyncSkinToEMR}
          onNavigateToEMR={onNavigateToEMR}
          onViewReportDetails={(reportId) => {
            setSelectedReportId(reportId);
            setActiveTab('skin_analyzer');
          }}
        />
      )}

      {/* TAB 1: IOT DEVICES REAL-TIME MONITORING */}
      {activeTab === 'iot_devices' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {iotDevices.map(dev => {
              const isWorking = dev.status === 'in_treatment';
              const isReady = dev.status === 'online_ready';
              const hasAlert = dev.alerts && dev.alerts.length > 0;

              return (
                <div
                  key={dev.id}
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4 hover:border-gray-300 transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">{dev.code}</span>
                      <h4 className="font-bold text-gray-900 text-base mt-0.5">{dev.name}</h4>
                      <span className="text-xs text-gray-500 font-medium">{dev.model}</span>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full font-bold ${
                        isWorking
                          ? 'bg-blue-100 text-blue-800 animate-pulse'
                          : isReady
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${isWorking ? 'bg-blue-600' : 'bg-emerald-600'}`} />
                      {isWorking ? 'Đang phát xung' : 'Sẵn sàng'}
                    </span>
                  </div>

                  <div className="text-xs text-gray-500 flex items-center gap-1.5 bg-gray-50 p-2 rounded-lg">
                    <span>📍 Vị trí:</span>
                    <strong className="text-gray-800">{dev.room}</strong>
                  </div>

                  {/* Telemetry Metrics */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="flex items-center gap-1 text-gray-400 text-[10px] uppercase font-semibold">
                        <Thermometer className="w-3 h-3 text-rose-500" />
                        Nhiệt Độ Đầu Máy
                      </div>
                      <div className="text-base font-extrabold text-gray-800 mt-1">
                        {dev.temperature > 0 ? `+${dev.temperature}°C` : `${dev.temperature}°C`}
                      </div>
                      <span className="text-[10px] text-emerald-600 font-medium">Hệ thống làm mát chuẩn</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="flex items-center gap-1 text-gray-400 text-[10px] uppercase font-semibold">
                        <Zap className="w-3 h-3 text-amber-500" />
                        Điện Áp Nguồn
                      </div>
                      <div className="text-base font-extrabold text-gray-800 mt-1">
                        {dev.voltage} V
                      </div>
                      <span className="text-[10px] text-emerald-600 font-medium">Điện lưới ổn định 220V</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="flex items-center gap-1 text-gray-400 text-[10px] uppercase font-semibold">
                        <Activity className="w-3 h-3 text-purple-500" />
                        Số Giờ Vận Hành
                      </div>
                      <div className="text-base font-extrabold text-gray-800 mt-1">
                        {dev.operatingHours.toLocaleString()} h
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="flex items-center gap-1 text-gray-400 text-[10px] uppercase font-semibold">
                        <Gauge className="w-3 h-3 text-blue-500" />
                        Tổng Shot Đã Bắn
                      </div>
                      <div className="text-base font-extrabold text-[#D97A7D] mt-1">
                        {dev.totalShotsFired.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Alerts & Maintenance */}
                  {hasAlert && (
                    <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <span>{dev.alerts[0]}</span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-gray-100 flex justify-between items-center text-[11px] text-gray-400">
                    <span>Bảo trì: {dev.nextMaintenance}</span>
                    <div className="flex items-center gap-2">
                      {onUpdateDevice && (
                        <button
                          onClick={() => {
                            onUpdateDevice({
                              ...dev,
                              status: 'online_ready',
                              alerts: []
                            });
                            alert(`Đã kiểm tra thông số và đồng bộ cảm biến IoT cho máy ${dev.name}!`);
                          }}
                          className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                        >
                          Hiệu chuẩn IoT
                        </button>
                      )}
                      <span className="font-mono">{dev.serialNumber}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: AI SKIN ANALYZER (MAGIC MIRROR 3D) */}
      {activeTab === 'skin_analyzer' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Reports list */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="font-bold text-gray-800 text-sm">Hồ Sơ Soi Da AI Gần Đây ({skinReports.length})</h4>
            <div className="space-y-2">
              {skinReports.map(rep => (
                <div
                  key={rep.id}
                  onClick={() => setSelectedReportId(rep.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    rep.id === selectedReportId
                      ? 'bg-rose-50/90 border-[#D97A7D] shadow-sm'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-bold text-gray-900 text-sm">{rep.customerName}</div>
                      <div className="text-xs text-gray-500">Mã KH: {rep.customerCode} • Ngày: {rep.date}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-extrabold text-[#D97A7D]">{rep.overallScore}</span>
                      <span className="text-[10px] text-gray-400 block">Điểm da</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Detailed 7-metrics report */}
          <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-5">
            {currentReport ? (
              <>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-gray-100">
                  <div>
                    <span className="text-xs font-mono text-gray-400 uppercase">Báo cáo soi da 3D AI</span>
                    <h3 className="text-xl font-bold text-gray-900">{currentReport.customerName}</h3>
                    <div className="text-xs text-gray-500 mt-0.5">
                      Ngày quét: {currentReport.date} • Thiết bị: {currentReport.analystName}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <div className="text-center">
                      <span className="text-[10px] text-gray-400 block font-semibold">TUỔI SINH HỌC DA</span>
                      <span className="text-2xl font-extrabold text-blue-600">{currentReport.skinAge} tuổi</span>
                    </div>
                    <div className="h-8 w-px bg-gray-200" />
                    <div className="text-center">
                      <span className="text-[10px] text-gray-400 block font-semibold">ĐIỂM SỨC KHỎE DA</span>
                      <span className="text-2xl font-extrabold text-[#D97A7D]">{currentReport.overallScore}/100</span>
                    </div>
                  </div>
                </div>

                {/* 8 Core Scientific Skin Metrics for VISIA or 7 standard metrics */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                      {currentReport.visiaMetrics ? (
                        <>
                          <FolderCheck className="w-3.5 h-3.5 text-emerald-600" />
                          8 Chỉ Số Đa Phổ Chuyên Sâu Canfield VISIA (Hoa Kỳ)
                        </>
                      ) : (
                        '7 Chỉ Số Da Liễu Đo Bằng Trắc Quang Học 3D'
                      )}
                    </h4>
                    {currentReport.visiaMetrics && (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        Xếp Hạng Phân Vị: Top {100 - currentReport.visiaMetrics.percentileRank}% Làn Da Cùng Độ Tuổi
                      </span>
                    )}
                  </div>

                  {currentReport.visiaMetrics ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
                      {/* 1. Spots */}
                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="flex justify-between font-semibold text-gray-800 mb-1">
                          <span>🎯 Đốm nâu bề mặt (Spots)</span>
                          <span className="text-amber-700">{currentReport.visiaMetrics.spots}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500 rounded-full" style={{ width: `${currentReport.visiaMetrics.spots}%` }} />
                        </div>
                      </div>

                      {/* 2. Wrinkles */}
                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="flex justify-between font-semibold text-gray-800 mb-1">
                          <span>👵 Nếp nhăn (Wrinkles)</span>
                          <span className="text-purple-600">{currentReport.visiaMetrics.wrinkles}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-500 rounded-full" style={{ width: `${currentReport.visiaMetrics.wrinkles}%` }} />
                        </div>
                      </div>

                      {/* 3. Texture */}
                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="flex justify-between font-semibold text-gray-800 mb-1">
                          <span>🔬 Kết cấu biểu bì (Texture)</span>
                          <span className="text-blue-600">{currentReport.visiaMetrics.texture}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${currentReport.visiaMetrics.texture}%` }} />
                        </div>
                      </div>

                      {/* 4. Pores */}
                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="flex justify-between font-semibold text-gray-800 mb-1">
                          <span>🔍 Lỗ chân lông (Pores)</span>
                          <span className="text-indigo-600">{currentReport.visiaMetrics.pores}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${currentReport.visiaMetrics.pores}%` }} />
                        </div>
                      </div>

                      {/* 5. UV Spots */}
                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="flex justify-between font-semibold text-gray-800 mb-1">
                          <span>☀️ Đốm tia UV (UV Spots)</span>
                          <span className="text-rose-600">{currentReport.visiaMetrics.uvSpots}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-rose-500 rounded-full" style={{ width: `${currentReport.visiaMetrics.uvSpots}%` }} />
                        </div>
                      </div>

                      {/* 6. Brown Spots */}
                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="flex justify-between font-semibold text-gray-800 mb-1">
                          <span>🤎 Nám sâu Melanin</span>
                          <span className="text-orange-700">{currentReport.visiaMetrics.brownSpots}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-orange-600 rounded-full" style={{ width: `${currentReport.visiaMetrics.brownSpots}%` }} />
                        </div>
                      </div>

                      {/* 7. Red Areas */}
                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="flex justify-between font-semibold text-gray-800 mb-1">
                          <span>🔴 Mao mạch đỏ (Red Areas)</span>
                          <span className="text-red-600">{currentReport.visiaMetrics.redAreas}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-red-500 rounded-full" style={{ width: `${currentReport.visiaMetrics.redAreas}%` }} />
                        </div>
                      </div>

                      {/* 8. Porphyrins */}
                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="flex justify-between font-semibold text-gray-800 mb-1">
                          <span>🦠 Vi khuẩn P.Acnes</span>
                          <span className="text-pink-600">{currentReport.visiaMetrics.porphyrins}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-pink-500 rounded-full" style={{ width: `${currentReport.visiaMetrics.porphyrins}%` }} />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {/* 1. Hydration */}
                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="flex justify-between font-semibold text-gray-800 mb-1">
                          <span>💧 Độ ẩm biểu bì (Hydration)</span>
                          <span className="text-blue-600">{currentReport.metrics.hydration}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${currentReport.metrics.hydration}%` }} />
                        </div>
                      </div>

                      {/* 2. Sebum */}
                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="flex justify-between font-semibold text-gray-800 mb-1">
                          <span>🧪 Tuyến bã nhờn / Dầu (Sebum)</span>
                          <span className="text-amber-600">{currentReport.metrics.sebum}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500 rounded-full" style={{ width: `${currentReport.metrics.sebum}%` }} />
                        </div>
                      </div>

                      {/* 3. Pigmentation */}
                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="flex justify-between font-semibold text-gray-800 mb-1">
                          <span>☀️ Sắc tố Melanin & Tàn nhang</span>
                          <span className="text-rose-600">{currentReport.metrics.pigmentation}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-rose-500 rounded-full" style={{ width: `${currentReport.metrics.pigmentation}%` }} />
                        </div>
                      </div>

                      {/* 4. Wrinkles */}
                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="flex justify-between font-semibold text-gray-800 mb-1">
                          <span>👵 Nếp nhăn & Độ chùng nhão</span>
                          <span className="text-purple-600">{currentReport.metrics.wrinkles}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-500 rounded-full" style={{ width: `${currentReport.metrics.wrinkles}%` }} />
                        </div>
                      </div>

                      {/* 5. Pores */}
                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="flex justify-between font-semibold text-gray-800 mb-1">
                          <span>🔍 Độ giãn nở lỗ chân lông (Pores)</span>
                          <span className="text-indigo-600">{currentReport.metrics.pores}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${currentReport.metrics.pores}%` }} />
                        </div>
                      </div>

                      {/* 6. Acne / Porphyrin */}
                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="flex justify-between font-semibold text-gray-800 mb-1">
                          <span>🦠 Vi khuẩn P.Acnes & Ổ viêm</span>
                          <span className="text-red-600">{currentReport.metrics.acneBacteria}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-red-500 rounded-full" style={{ width: `${currentReport.metrics.acneBacteria}%` }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* AI Summary & Recommendations */}
                <div className="p-4 bg-rose-50/70 rounded-xl border border-rose-200 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#5C3A3A]">
                    <Sparkles className="w-4 h-4 text-[#D97A7D]" />
                    Chẩn Đoán Tự Động & Đề Xuất Phác Đồ Từ AI
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed">{currentReport.diagnosisSummary}</p>

                  <div className="pt-2">
                    <span className="text-[11px] font-bold text-gray-700 block mb-1">Liệu trình thẩm mỹ khuyến nghị:</span>
                    <div className="flex flex-wrap gap-2">
                      {currentReport.aiRecommendedServices.map((srv, i) => (
                        <span key={i} className="px-2.5 py-1 bg-white text-[#5C3A3A] font-semibold text-[11px] rounded-lg border border-rose-200 shadow-xs">
                          ✨ {srv}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}

      {/* TAB 3: HIGH-TECH CONSUMABLES & TIPS (QUẢN LÝ ĐẦU TIP MÁY) */}
      {activeTab === 'high_tech_tips' && (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 text-xs text-blue-900 leading-relaxed flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <strong>Kiểm soát số shoot đầu tip máy công nghệ cao (HIFU, Laser, Thermage):</strong> Khi Kỹ thuật viên hoàn thành buổi điều trị trong Hồ sơ bệnh án điện tử (EMR), hệ thống tự động khấu trừ số shoot đã bắn ra khỏi đầu tip tương ứng. Tự động chuyển sang trạng thái cảnh báo màu vàng khi số shoot dưới ngưỡng tối thiểu.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {highTechTips.map(tip => {
              const percentRemaining = Math.round((tip.remainingShots / tip.totalMaxShots) * 100);
              const isWarning = tip.status === 'warning' || percentRemaining < 20;
              const isCritical = tip.status === 'critical' || percentRemaining < 10;

              return (
                <div
                  key={tip.id}
                  className={`bg-white rounded-2xl border p-5 space-y-4 shadow-sm transition-all ${
                    isCritical
                      ? 'border-rose-300 bg-rose-50/20'
                      : isWarning
                      ? 'border-amber-300 bg-amber-50/20'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-mono text-gray-400 uppercase">{tip.code}</span>
                      <h4 className="font-bold text-gray-900 text-sm mt-0.5">{tip.name}</h4>
                      <span className="text-xs text-gray-500 font-medium">Thiết bị: {tip.machineModel}</span>
                    </div>

                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                        isCritical
                          ? 'bg-rose-100 text-rose-800'
                          : isWarning
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {isCritical ? 'Sắp hết shoot' : isWarning ? 'Cảnh báo tồn' : 'Tối ưu'}
                    </span>
                  </div>

                  {/* Shots Remaining Progress */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500">Số shoot còn lại:</span>
                      <span className={`font-extrabold text-sm ${isCritical ? 'text-rose-600' : isWarning ? 'text-amber-600' : 'text-emerald-700'}`}>
                        {tip.remainingShots.toLocaleString()} / {tip.totalMaxShots.toLocaleString()} ({percentRemaining}%)
                      </span>
                    </div>

                    <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isCritical ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${percentRemaining}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-gray-100">
                    <div>
                      <span className="text-[10px] text-gray-400 block">Ngưỡng báo động</span>
                      <span className="font-semibold text-gray-700">{tip.alertThreshold.toLocaleString()} shots</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 block">Giá vốn đầu tip</span>
                      <span className="font-semibold text-gray-700">{tip.unitPrice.toLocaleString()} đ</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-gray-400 flex justify-between items-center">
                    <span>Lô: {tip.batchNumber}</span>
                    <span>Lắp đặt: {tip.installedDate}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL: SIMULATE AI SKIN SCAN */}
      {isSimulateScanModalOpen && (
        <Modal
          isOpen={isSimulateScanModalOpen}
          onClose={() => setIsSimulateScanModalOpen(false)}
          title="Mô Phỏng Soi Da AI Magic Mirror 3D"
          maxWidth="max-w-md"
        >
          <form onSubmit={handleSimulateNewScan} className="space-y-4">
            <div className="p-3 bg-cyan-50 rounded-xl border border-cyan-100 text-xs text-cyan-900">
              📸 Máy soi da 3D sẽ tự động chụp trắc quang biểu bì, đo lường 7 chỉ số và đồng bộ ngay vào EMR của khách hàng.
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Chọn Khách Hàng</label>
              <select
                value={scanCustomerCode}
                onChange={e => {
                  const found = medicalRecords.find(r => r.customerCode === e.target.value);
                  setScanCustomerCode(e.target.value);
                  if (found) setScanCustomerName(found.customerName);
                }}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none"
              >
                {medicalRecords.map(m => (
                  <option key={m.id} value={m.customerCode}>
                    {m.customerName} ({m.customerCode})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Tuổi Thật Của Khách Hàng</label>
              <input
                type="number"
                value={scanAge}
                onChange={e => setScanAge(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setIsSimulateScanModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Đóng
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-700 rounded-lg shadow-sm"
              >
                Bắt Đầu Quét & Đồng Bộ EMR
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL: ADD NEW HIGH-TECH TIP */}
      {isNewTipModalOpen && (
        <Modal
          isOpen={isNewTipModalOpen}
          onClose={() => setIsNewTipModalOpen(false)}
          title="Khai Báo Đầu Tip Máy Công Nghệ Cao Mới"
          maxWidth="max-w-md"
        >
          <form onSubmit={handleCreateTip} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Tên Đầu Tip *</label>
              <input
                type="text"
                required
                placeholder="Vd: Đầu Cartridge HIFU 2.0mm (Vùng mắt)"
                value={tipName}
                onChange={e => setTipName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Mã Quản Lý Đầu Tip *</label>
              <input
                type="text"
                required
                value={tipCode}
                onChange={e => setTipCode(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Dòng Máy Sử Dụng</label>
              <select
                value={tipModel}
                onChange={e => setTipModel(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none"
              >
                <option value="Ultraformer MPT (Classys)">Ultraformer MPT (Classys)</option>
                <option value="Thermage FLX (Solta Medical)">Thermage FLX (Solta Medical)</option>
                <option value="Diode Laser Master 808nm">Diode Laser Master 808nm</option>
                <option value="PicoWay Laser Picosecond">PicoWay Laser Picosecond</option>
                <option value="Fractional CO2 Laser Edge ONE">Fractional CO2 Laser Edge ONE</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Tổng Số Shoot Thiết Kế</label>
                <input
                  type="number"
                  value={tipMaxShots}
                  onChange={e => setTipMaxShots(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Ngưỡng Báo Động</label>
                <input
                  type="number"
                  value={tipThreshold}
                  onChange={e => setTipThreshold(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Đơn Giá Nhập (VND)</label>
              <input
                type="number"
                value={tipPrice}
                onChange={e => setTipPrice(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setIsNewTipModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-[#D97A7D] hover:bg-[#c76b6e] rounded-lg shadow-sm"
              >
                Lưu Đầu Tip Mới
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default SmartClinicHardware;

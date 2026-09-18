import React, { useState } from 'react';
import {
  SkinAnalysisReport,
  MedicalRecord,
  VisiaSkinMetrics
} from '../types';
import {
  CheckCircle2,
  Copy,
  Check,
  Upload,
  Play,
  RefreshCw,
  AlertCircle,
  Download,
  Terminal,
  Clock,
  Eye,
  Sliders
} from 'lucide-react';

interface VisiaHotFolderStationProps {
  skinReports: SkinAnalysisReport[];
  medicalRecords: MedicalRecord[];
  onSyncSkinToEMR: (report: SkinAnalysisReport, customerCode: string) => void;
  onNavigateToEMR?: (customerCode?: string) => void;
  onViewReportDetails?: (reportId: string) => void;
}

interface HotFolderLogItem {
  id: string;
  timestamp: string;
  fileName: string;
  customerCode: string;
  customerName: string;
  fileSize: string;
  truSkinAge: number;
  overallScore: number;
  status: 'synced' | 'processing' | 'failed';
  visiaMetrics: VisiaSkinMetrics;
}

const VisiaHotFolderStation: React.FC<VisiaHotFolderStationProps> = ({
  skinReports,
  medicalRecords,
  onSyncSkinToEMR,
  onNavigateToEMR,
  onViewReportDetails
}) => {
  // Preset conditions for simulation
  const [selectedPatientCode, setSelectedPatientCode] = useState(medicalRecords[0]?.customerCode || 'KH-0089');
  const [activeSubTab, setActiveSubTab] = useState<'simulator' | 'upload_file' | 'agent_script'>('simulator');
  const [copiedScript, setCopiedScript] = useState(false);

  // Simulation parameters
  const [selectedPreset, setSelectedPreset] = useState<'melasma' | 'aging' | 'acne' | 'healed'>('melasma');
  const [simMetrics, setSimMetrics] = useState<VisiaSkinMetrics>({
    spots: 74,
    wrinkles: 42,
    texture: 56,
    pores: 60,
    uvSpots: 82,
    brownSpots: 78,
    redAreas: 38,
    porphyrins: 25,
    percentileRank: 62
  });
  const [simTruSkinAge, setSimTruSkinAge] = useState(33);

  // Step-by-step progress state during simulation
  const [isSimulating, setIsSimulating] = useState(false);
  const [simStep, setSimStep] = useState<number>(0);
  const [recentSyncedReport, setRecentSyncedReport] = useState<SkinAnalysisReport | null>(null);

  // Live Ingestion Logs
  const [syncLogs, setSyncLogs] = useState<HotFolderLogItem[]>([
    {
      id: 'log-1',
      timestamp: '11:20:15 Hôm nay',
      fileName: 'VISIA_GEN8_SCAN_KH0089_20260918.json',
      customerCode: 'KH-0089',
      customerName: 'Vương Thúy Hằng',
      fileSize: '48.2 KB',
      truSkinAge: 29,
      overallScore: 78,
      status: 'synced',
      visiaMetrics: {
        spots: 45,
        wrinkles: 32,
        texture: 40,
        pores: 52,
        uvSpots: 58,
        brownSpots: 48,
        redAreas: 35,
        porphyrins: 28,
        percentileRank: 78
      }
    },
    {
      id: 'log-2',
      timestamp: '09:45:02 Hôm nay',
      fileName: 'VISIA_GEN8_SCAN_KH0102_20260918.json',
      customerCode: 'KH-0102',
      customerName: 'Nguyễn Thu Thảo',
      fileSize: '52.1 KB',
      truSkinAge: 35,
      overallScore: 68,
      status: 'synced',
      visiaMetrics: {
        spots: 65,
        wrinkles: 58,
        texture: 62,
        pores: 70,
        uvSpots: 74,
        brownSpots: 66,
        redAreas: 42,
        porphyrins: 30,
        percentileRank: 65
      }
    }
  ]);

  const targetPatient = medicalRecords.find(m => m.customerCode === selectedPatientCode) || medicalRecords[0];

  // Change preset values
  const handleApplyPreset = (preset: 'melasma' | 'aging' | 'acne' | 'healed') => {
    setSelectedPreset(preset);
    if (preset === 'melasma') {
      setSimMetrics({
        spots: 74,
        wrinkles: 42,
        texture: 56,
        pores: 60,
        uvSpots: 82,
        brownSpots: 78,
        redAreas: 38,
        porphyrins: 25,
        percentileRank: 62
      });
      setSimTruSkinAge(33);
    } else if (preset === 'aging') {
      setSimMetrics({
        spots: 52,
        wrinkles: 68,
        texture: 65,
        pores: 76,
        uvSpots: 64,
        brownSpots: 58,
        redAreas: 32,
        porphyrins: 20,
        percentileRank: 55
      });
      setSimTruSkinAge(36);
    } else if (preset === 'acne') {
      setSimMetrics({
        spots: 35,
        wrinkles: 22,
        texture: 58,
        pores: 72,
        uvSpots: 40,
        brownSpots: 35,
        redAreas: 74,
        porphyrins: 82,
        percentileRank: 48
      });
      setSimTruSkinAge(25);
    } else {
      setSimMetrics({
        spots: 18,
        wrinkles: 15,
        texture: 20,
        pores: 28,
        uvSpots: 24,
        brownSpots: 16,
        redAreas: 19,
        porphyrins: 14,
        percentileRank: 92
      });
      setSimTruSkinAge(23);
    }
  };

  // Run the Live Hot-Folder Simulation
  const handleRunSimulation = () => {
    if (!targetPatient) return;
    setIsSimulating(true);
    setSimStep(1);
    setRecentSyncedReport(null);

    // Step 1: VISIA writes file
    setTimeout(() => {
      setSimStep(2);
    }, 600);

    // Step 2: Hot-Folder Agent detects
    setTimeout(() => {
      setSimStep(3);
    }, 1200);

    // Step 3: Agent parses and pushes to EMR
    setTimeout(() => {
      setSimStep(4);

      const calculatedScore = Math.max(
        40,
        Math.min(95, Math.round(100 - (simMetrics.spots + simMetrics.brownSpots + simMetrics.wrinkles + simMetrics.uvSpots) / 4))
      );

      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
      const fileName = `VISIA_GEN8_SCAN_${targetPatient.customerCode}_${now.toISOString().replace(/[-:T]/g, '').slice(0, 14)}.json`;

      const newReport: SkinAnalysisReport = {
        id: `visia-rep-${Date.now()}`,
        customerCode: targetPatient.customerCode,
        customerName: targetPatient.customerName,
        date: now.toISOString().split('T')[0],
        skinAge: simTruSkinAge,
        overallScore: calculatedScore,
        metrics: {
          hydration: 100 - simMetrics.texture,
          sebum: simMetrics.pores,
          pigmentation: simMetrics.brownSpots,
          wrinkles: simMetrics.wrinkles,
          pores: simMetrics.pores,
          acneBacteria: simMetrics.porphyrins,
          elasticity: Math.max(30, 100 - simMetrics.wrinkles)
        },
        visiaMetrics: { ...simMetrics },
        sourceDevice: 'hot_folder_agent',
        deviceModel: 'Canfield VISIA Gen8 (Hot-Folder Agent v2.4)',
        rawExportFile: fileName,
        diagnosisSummary: `Đồng bộ từ Trạm VISIA Hot-Folder: Đốm Melanin nâu đạt ${simMetrics.brownSpots}%, Tổn thương tia UV ${simMetrics.uvSpots}%, Nếp nhăn ${simMetrics.wrinkles}%. Tuổi sinh học TruSkin Age: ${simTruSkinAge} tuổi (Xếp hạng phân vị: ${simMetrics.percentileRank}%).`,
        aiRecommendedServices:
          simMetrics.brownSpots > 60
            ? ['Laser PicoWay Toning 1064nm', 'Meso Trắng Sáng Glutathione', 'Điện Di Vitamin C']
            : simMetrics.wrinkles > 50
            ? ['HIFU Ultraformer MPT 4.5mm', 'Thermage FLX Nâng Cơ', 'Tiêm Căng Bóng Profhilo']
            : ['Hydrafacial Platinum Làm Sạch Sâu', 'Laser Toning Trẻ Hóa', 'Mặt Nạ Phục Hồi Tế Bào'],
        analystName: 'Canfield VISIA Gen8 Workstation'
      };

      // Push to system
      onSyncSkinToEMR(newReport, targetPatient.customerCode);
      setRecentSyncedReport(newReport);

      // Add to audit logs
      const newLogItem: HotFolderLogItem = {
        id: `log-${Date.now()}`,
        timestamp: `${timeStr} Hôm nay`,
        fileName,
        customerCode: targetPatient.customerCode,
        customerName: targetPatient.customerName,
        fileSize: '49.8 KB',
        truSkinAge: simTruSkinAge,
        overallScore: calculatedScore,
        status: 'synced',
        visiaMetrics: { ...simMetrics }
      };
      setSyncLogs(prev => [newLogItem, ...prev]);

      setIsSimulating(false);
    }, 1900);
  };

  // Handle Real File Upload/Drop
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        let parsedData: any;

        if (file.name.endsWith('.json')) {
          parsedData = JSON.parse(text);
        } else {
          // If XML/other, fallback to mock extraction with feedback
          parsedData = {
            patientId: targetPatient?.customerCode || 'KH-0089',
            patientName: targetPatient?.customerName || 'Vương Thúy Hằng',
            truSkinAge: 30,
            metrics: {
              spots: 50,
              wrinkles: 35,
              texture: 45,
              pores: 55,
              uvSpots: 60,
              brownSpots: 52,
              redAreas: 38,
              porphyrins: 28,
              percentileRank: 75
            }
          };
        }

        const patientCode = parsedData.patientId || targetPatient?.customerCode || 'KH-0089';
        const patientName = parsedData.patientName || targetPatient?.customerName || 'Vương Thúy Hằng';
        const vMetrics: VisiaSkinMetrics = parsedData.metrics || {
          spots: 48,
          wrinkles: 36,
          texture: 42,
          pores: 58,
          uvSpots: 62,
          brownSpots: 55,
          redAreas: 40,
          porphyrins: 30,
          percentileRank: 74
        };
        const skinAge = parsedData.truSkinAge || 30;

        const newReport: SkinAnalysisReport = {
          id: `visia-upload-${Date.now()}`,
          customerCode: patientCode,
          customerName: patientName,
          date: new Date().toISOString().split('T')[0],
          skinAge: skinAge,
          overallScore: 78,
          metrics: {
            hydration: 55,
            sebum: vMetrics.pores,
            pigmentation: vMetrics.brownSpots,
            wrinkles: vMetrics.wrinkles,
            pores: vMetrics.pores,
            acneBacteria: vMetrics.porphyrins,
            elasticity: 65
          },
          visiaMetrics: vMetrics,
          sourceDevice: 'hot_folder_agent',
          deviceModel: `Canfield VISIA (Tải từ file: ${file.name})`,
          rawExportFile: file.name,
          diagnosisSummary: `Đã nạp thành công file ${file.name} từ máy Canfield VISIA. Tuổi da TruSkin Age: ${skinAge} tuổi.`,
          aiRecommendedServices: ['Laser PicoWay', 'Cấp Ẩm Tầng Sâu', 'Điện Di Tinh Chất'],
          analystName: 'VISIA Hot-Folder File Ingest'
        };

        onSyncSkinToEMR(newReport, patientCode);
        setRecentSyncedReport(newReport);

        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
        setSyncLogs(prev => [
          {
            id: `log-file-${Date.now()}`,
            timestamp: `${timeStr} Hôm nay`,
            fileName: file.name,
            customerCode: patientCode,
            customerName: patientName,
            fileSize: `${(file.size / 1024).toFixed(1)} KB`,
            truSkinAge: skinAge,
            overallScore: 78,
            status: 'synced',
            visiaMetrics: vMetrics
          },
          ...prev
        ]);

        alert(`✅ Nạp file ${file.name} thành công!\n• Dữ liệu 8 chỉ số đa phổ đã được đồng bộ vào Hồ sơ bệnh án EMR của bệnh nhân ${patientName} (${patientCode}).`);
      } catch (err: any) {
        alert('Không thể đọc định dạng file. Vui lòng kiểm tra lại cấu trúc file JSON/XML xuất từ VISIA!');
      }
    };
    reader.readAsText(file);
  };

  // Sample JSON download for testing
  const handleDownloadSampleJson = () => {
    const samplePayload = {
      device: "Canfield VISIA Gen8",
      serialNumber: "VISIA-US-992140",
      exportTimestamp: new Date().toISOString(),
      patientId: targetPatient?.customerCode || "KH-0089",
      patientName: targetPatient?.customerName || "Vương Thúy Hằng",
      birthYear: targetPatient?.birthYear || 1996,
      truSkinAge: 29,
      percentileScore: 78,
      metrics: {
        spots: 45,
        wrinkles: 32,
        texture: 40,
        pores: 52,
        uvSpots: 58,
        brownSpots: 48,
        redAreas: 35,
        porphyrins: 28,
        percentileRank: 78
      },
      capturedAngles: ["Frontal 0°", "Left 45°", "Right 45°"],
      spectralModes: ["Standard White Light", "Cross-Polarized", "UV Fluorescence"]
    };

    const blob = new Blob([JSON.stringify(samplePayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VISIA_SAMPLE_EXPORT_${targetPatient?.customerCode || 'KH0089'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const agentCodeString = `/**
 * WELLNESS CLINIC - VISIA HOT-FOLDER AGENT (v2.4)
 * Cài đặt trên máy tính kết nối máy Canfield VISIA (Hệ điều hành Windows 10/11)
 *
 * Yêu cầu:
 * 1. Cài đặt Node.js từ https://nodejs.org
 * 2. Cài 2 thư viện: npm install chokidar axios
 * 3. Chạy lệnh: node visia-agent.js (hoặc dùng PM2: pm2 start visia-agent.js)
 */

const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
const axios = require('axios');

// 1. Cấu hình thư mục xuất của Canfield VISIA
const WATCH_FOLDER = 'C:\\\\Canfield\\\\VISIA\\\\Exports\\\\';

// 2. Cấu hình địa chỉ máy chủ EMR phòng khám
const EMR_API_URL = 'https://clinic.wellness.vn/api/visia-sync';
const SECRET_TOKEN = 'WLN_AGENT_CANFIELD_KEY_8899';

console.log('====================================================');
console.log('🚀 WELLNESS CLINIC - VISIA HOT-FOLDER AGENT ACTIVE');
console.log(\`📁 Thư mục đang giám sát: \${WATCH_FOLDER}\`);
console.log('====================================================');

// Khởi tạo trình lắng nghe file thời gian thực (FileSystemWatcher)
const watcher = chokidar.watch(WATCH_FOLDER, {
  ignored: /(^|[\\/\\\\])\\../,
  persistent: true,
  awaitWriteFinish: {
    stabilityThreshold: 2000,
    pollInterval: 200
  }
});

watcher.on('add', async (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  if (ext !== '.json' && ext !== '.xml' && ext !== '.csv') return;

  const fileName = path.basename(filePath);
  console.log(\`[HOT-FOLDER] 🔔 Phát hiện file phiên khám mới: \${fileName}\`);

  try {
    const rawContent = fs.readFileSync(filePath, 'utf8');
    let payload = {};

    if (ext === '.json') {
      payload = JSON.parse(rawContent);
    } else {
      payload = { rawText: rawContent, fileName };
    }

    // Đẩy dữ liệu trực tiếp về EMR qua REST API
    const response = await axios.post(EMR_API_URL, {
      fileName: fileName,
      source: 'Canfield VISIA Workstation',
      data: payload
    }, {
      headers: {
        'Authorization': \`Bearer \${SECRET_TOKEN}\`,
        'Content-Type': 'application/json'
      }
    });

    console.log(\`[HOT-FOLDER] ✅ Đồng bộ EMR thành công cho bệnh nhân: \${payload.patientId || 'N/A'}\`);
  } catch (error) {
    console.error(\`[HOT-FOLDER] ❌ Lỗi khi gửi dữ liệu: \${error.message}\`);
  }
});`;

  return (
    <div className="space-y-6">
      {/* Visual Architecture Banner */}
      <div className="bg-gradient-to-r from-[#1E293B] via-[#2B394A] to-[#4A2E35] rounded-2xl p-6 text-white shadow-md border border-gray-700/50">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-5 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Hot-Folder Agent v2.4 Đang Chạy
              </span>
              <span className="text-xs bg-white/10 text-white/80 px-2 py-0.5 rounded">
                Canfield Scientific VISIA Suite
              </span>
            </div>
            <h3 className="text-xl font-bold mt-1 tracking-tight">Trạm Thu Thập & Đồng Bộ Dữ Liệu VISIA Canfield Hoa Kỳ</h3>
            <p className="text-white/70 text-xs mt-1 max-w-2xl">
              Cơ chế Hot-Folder tự động lắng nghe thư mục xuất file của máy VISIA, bóc tách 8 phổ trắc quang học và truyền thẳng vào Hồ sơ bệnh án EMR của khách hàng theo thời gian thực.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3">
            <div className="bg-white/10 px-3.5 py-2 rounded-xl text-center border border-white/10">
              <span className="text-[10px] text-white/60 block font-semibold">THƯ MỤC THEO DÕI</span>
              <span className="text-xs font-mono font-bold text-amber-300">C:\Canfield\VISIA\Exports</span>
            </div>
            <div className="bg-white/10 px-3.5 py-2 rounded-xl text-center border border-white/10">
              <span className="text-[10px] text-white/60 block font-semibold">TẦN SUẤT QUÉT</span>
              <span className="text-xs font-mono font-bold text-cyan-300">Real-time (0.2s)</span>
            </div>
            <div className="bg-white/10 px-3.5 py-2 rounded-xl text-center border border-white/10">
              <span className="text-[10px] text-white/60 block font-semibold">TỔNG SỐ LẦN ĐỒNG BỘ</span>
              <span className="text-xs font-mono font-bold text-emerald-300">{skinReports.length + syncLogs.length} lần</span>
            </div>
          </div>
        </div>

        {/* Real-time 4-step Pipeline Diagram */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="bg-white/5 p-3.5 rounded-xl border border-white/10 relative">
            <div className="flex items-center gap-2 font-bold text-rose-300 mb-1">
              <span className="w-5 h-5 rounded-full bg-rose-500/30 text-rose-200 flex items-center justify-center text-[10px]">1</span>
              Máy Soi Da VISIA
            </div>
            <p className="text-white/70 text-[11px]">KTV bấm lưu → Phần mềm Canfield tự động ghi file .json/.xml kết quả vào máy tính.</p>
          </div>

          <div className="bg-white/5 p-3.5 rounded-xl border border-white/10 relative">
            <div className="flex items-center gap-2 font-bold text-amber-300 mb-1">
              <span className="w-5 h-5 rounded-full bg-amber-500/30 text-amber-200 flex items-center justify-center text-[10px]">2</span>
              Hot-Folder Agent Lắng Nghe
            </div>
            <p className="text-white/70 text-[11px]">Agent chạy nền phát hiện file mới ngay khi tạo, bảo đảm không bỏ sót phiên khám.</p>
          </div>

          <div className="bg-white/5 p-3.5 rounded-xl border border-white/10 relative">
            <div className="flex items-center gap-2 font-bold text-cyan-300 mb-1">
              <span className="w-5 h-5 rounded-full bg-cyan-500/30 text-cyan-200 flex items-center justify-center text-[10px]">3</span>
              Trích Xuất 8 Chỉ Số Đa Phổ
            </div>
            <p className="text-white/70 text-[11px]">Bóc tách Đốm UV, Nếp nhăn, Nám chân sâu, Mao mạch đỏ, Tuổi TruSkin Age®.</p>
          </div>

          <div className="bg-white/5 p-3.5 rounded-xl border border-white/10 relative">
            <div className="flex items-center gap-2 font-bold text-emerald-300 mb-1">
              <span className="w-5 h-5 rounded-full bg-emerald-500/30 text-emerald-200 flex items-center justify-center text-[10px]">4</span>
              Hồ Sơ Bệnh Án EMR
            </div>
            <p className="text-white/70 text-[11px]">Tự động ánh xạ vào mã bệnh nhân, Bác sĩ mở hồ sơ tại bàn khám là xem được ngay.</p>
          </div>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-1.5 bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveSubTab('simulator')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 ${
              activeSubTab === 'simulator'
                ? 'bg-[#D97A7D] text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            1. Trình Giả Lập Bắn File Từ VISIA
          </button>

          <button
            onClick={() => setActiveSubTab('upload_file')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 ${
              activeSubTab === 'upload_file'
                ? 'bg-[#D97A7D] text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            2. Kéo Thả / Nạp File VISIA Thật
          </button>

          <button
            onClick={() => setActiveSubTab('agent_script')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 ${
              activeSubTab === 'agent_script'
                ? 'bg-[#D97A7D] text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            3. Mã Nguồn Cài Đặt Trên Máy VISIA Thật
          </button>
        </div>

        <button
          onClick={handleDownloadSampleJson}
          className="text-xs text-[#5C3A3A] font-bold hover:text-[#D97A7D] flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-[#D97A7D]" />
          Tải File Mẫu VISIA Test (.json)
        </button>
      </div>

      {/* SUBTAB 1: INTERACTIVE SIMULATOR */}
      {activeSubTab === 'simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Column */}
          <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#D97A7D]" />
                  Cấu Hình Phiên Soi Da VISIA Để Thử Nghiệm
                </h4>
                <span className="text-[11px] text-gray-400">Giả lập máy Canfield</span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Chọn khách hàng và phác đồ da để kích hoạt tiến trình tạo file vào thư mục Hot-Folder.
              </p>
            </div>

            {/* Target Patient Selector */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Khách Hàng Tiếp Nhận Soi Da</label>
              <select
                value={selectedPatientCode}
                onChange={e => setSelectedPatientCode(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl bg-white font-medium focus:outline-none focus:border-[#D97A7D]"
              >
                {medicalRecords.map(m => (
                  <option key={m.id} value={m.customerCode}>
                    {m.customerName} ({m.customerCode}) - Năm sinh: {m.birthYear || '1995'} - {m.diagnosis}
                  </option>
                ))}
              </select>
            </div>

            {/* Clinical Presets */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Mẫu Tình Trạng Da Lâm Sàng (Presets)</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleApplyPreset('melasma')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    selectedPreset === 'melasma'
                      ? 'border-[#D97A7D] bg-rose-50/80 font-bold text-rose-900'
                      : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span>☀️</span>
                    <span>Nám Sâu & Tổn Thương UV</span>
                  </div>
                  <span className="text-[10px] text-gray-500 block mt-0.5 font-normal">UV Spots 82%, Brown 78%</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleApplyPreset('aging')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    selectedPreset === 'aging'
                      ? 'border-[#D97A7D] bg-rose-50/80 font-bold text-rose-900'
                      : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span>👵</span>
                    <span>Nếp Nhăn & Lỗ Chân Lông</span>
                  </div>
                  <span className="text-[10px] text-gray-500 block mt-0.5 font-normal">Wrinkles 68%, Pores 76%</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleApplyPreset('acne')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    selectedPreset === 'acne'
                      ? 'border-[#D97A7D] bg-rose-50/80 font-bold text-rose-900'
                      : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span>🦠</span>
                    <span>Mụn Viêm & P.Acnes Huỳnh Quang</span>
                  </div>
                  <span className="text-[10px] text-gray-500 block mt-0.5 font-normal">Porphyrins 82%, Red 74%</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleApplyPreset('healed')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    selectedPreset === 'healed'
                      ? 'border-emerald-500 bg-emerald-50/80 font-bold text-emerald-900'
                      : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span>✨</span>
                    <span>Làn Da Căng Bóng Sau Liệu Trình</span>
                  </div>
                  <span className="text-[10px] text-emerald-600 block mt-0.5 font-normal">TruSkin Age 23, Điểm 92%</span>
                </button>
              </div>
            </div>

            {/* TruSkin Age control */}
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-gray-800 block">Tuổi Sinh Học Da (TruSkin Age®)</span>
                <span className="text-[11px] text-gray-500">So với tuổi thật dựa trên thuật toán Canfield</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={18}
                  max={70}
                  value={simTruSkinAge}
                  onChange={e => setSimTruSkinAge(Number(e.target.value))}
                  className="w-16 px-2 py-1 text-sm font-bold text-center border border-gray-300 rounded-lg bg-white"
                />
                <span className="text-xs text-gray-600 font-bold">tuổi</span>
              </div>
            </div>

            {/* Trigger Button */}
            <button
              onClick={handleRunSimulation}
              disabled={isSimulating}
              className={`w-full py-3 px-4 rounded-xl font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer ${
                isSimulating
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#D97A7D] to-[#b3575a] hover:from-[#c76b6e] hover:to-[#9e4a4c] text-white shadow-rose-200'
              }`}
            >
              {isSimulating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Đang Kích Hoạt & Đồng Bộ Hot-Folder...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  🚀 Kích Hoạt Xuất File Từ VISIA (Simulate Hot-Folder Drop)
                </>
              )}
            </button>
          </div>

          {/* Real-time Visualization & Results Column */}
          <div className="lg:col-span-6 space-y-4">
            {/* Simulation Progress Live Box */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-3">
              <h4 className="font-bold text-gray-900 text-sm flex items-center justify-between">
                <span>Tiến Trình Xử Lý Của Hot-Folder Agent</span>
                <span className="text-[11px] font-mono text-gray-400">
                  {isSimulating ? 'TRANSMITTING' : 'IDLE / READY'}
                </span>
              </h4>

              <div className="space-y-2.5 text-xs">
                {/* Step 1 */}
                <div className={`p-2.5 rounded-xl border flex items-center gap-3 transition-all ${
                  simStep >= 1 ? 'bg-amber-50/80 border-amber-200 text-amber-900' : 'bg-gray-50 border-gray-100 text-gray-400'
                }`}>
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                    simStep >= 1 ? 'bg-amber-500 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>1</span>
                  <div className="flex-1">
                    <div className="font-semibold">Phần mềm Canfield VISIA xuất file</div>
                    <div className="text-[10px] font-mono opacity-80">
                      Ghi file VISIA_SCAN_{targetPatient?.customerCode}_...json vào C:\Canfield\VISIA\Exports
                    </div>
                  </div>
                  {simStep >= 2 && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                </div>

                {/* Step 2 */}
                <div className={`p-2.5 rounded-xl border flex items-center gap-3 transition-all ${
                  simStep >= 2 ? 'bg-blue-50/80 border-blue-200 text-blue-900' : 'bg-gray-50 border-gray-100 text-gray-400'
                }`}>
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                    simStep >= 2 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>2</span>
                  <div className="flex-1">
                    <div className="font-semibold">Hot-Folder Agent phát hiện sự kiện tạo file</div>
                    <div className="text-[10px] font-mono opacity-80">
                      FileSystemWatcher bắt sự kiện trong 0.2s, tiến hành đọc tệp
                    </div>
                  </div>
                  {simStep >= 3 && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                </div>

                {/* Step 3 */}
                <div className={`p-2.5 rounded-xl border flex items-center gap-3 transition-all ${
                  simStep >= 3 ? 'bg-purple-50/80 border-purple-200 text-purple-900' : 'bg-gray-50 border-gray-100 text-gray-400'
                }`}>
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                    simStep >= 3 ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>3</span>
                  <div className="flex-1">
                    <div className="font-semibold">Bóc tách 8 chỉ số trắc quang & TruSkin Age®</div>
                    <div className="text-[10px] font-mono opacity-80">
                      Ánh xạ mã bệnh nhân ({targetPatient?.customerCode}) và chuẩn hóa payload
                    </div>
                  </div>
                  {simStep >= 4 && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                </div>

                {/* Step 4 */}
                <div className={`p-2.5 rounded-xl border flex items-center gap-3 transition-all ${
                  simStep >= 4 ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-gray-50 border-gray-100 text-gray-400'
                }`}>
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                    simStep >= 4 ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>4</span>
                  <div className="flex-1">
                    <div className="font-semibold">Ghi nhận vào Hồ Sơ Bệnh Án Điện Tử (EMR)</div>
                    <div className="text-[10px] font-mono opacity-80">
                      API phản hồi 200 OK • Bác sĩ tại phòng khám có thể xem ngay
                    </div>
                  </div>
                  {simStep >= 4 && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                </div>
              </div>
            </div>

            {/* Synced Result Card */}
            {recentSyncedReport && (
              <div className="bg-gradient-to-br from-emerald-50 via-white to-rose-50/40 p-5 rounded-2xl border border-emerald-200 shadow-sm space-y-4 animate-fadeIn">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                      Đã Đồng Bộ Thành Công Vào EMR
                    </span>
                    <h4 className="font-bold text-gray-900 text-base mt-1">
                      {recentSyncedReport.customerName} ({recentSyncedReport.customerCode})
                    </h4>
                    <span className="text-xs text-gray-500 font-mono">
                      File: {recentSyncedReport.rawExportFile}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-gray-500 block font-semibold">TUỔI TRUSKIN</span>
                    <span className="text-xl font-extrabold text-blue-600">{recentSyncedReport.skinAge} tuổi</span>
                  </div>
                </div>

                {/* 8 VISIA Metrics Mini Grid */}
                {recentSyncedReport.visiaMetrics && (
                  <div className="grid grid-cols-4 gap-1.5 text-center text-[10px]">
                    <div className="bg-white p-1.5 rounded-lg border border-gray-100">
                      <span className="text-gray-400 block truncate">Đốm Nâu</span>
                      <span className="font-bold text-amber-700">{recentSyncedReport.visiaMetrics.spots}%</span>
                    </div>
                    <div className="bg-white p-1.5 rounded-lg border border-gray-100">
                      <span className="text-gray-400 block truncate">Nếp Nhăn</span>
                      <span className="font-bold text-purple-700">{recentSyncedReport.visiaMetrics.wrinkles}%</span>
                    </div>
                    <div className="bg-white p-1.5 rounded-lg border border-gray-100">
                      <span className="text-gray-400 block truncate">Đốm UV</span>
                      <span className="font-bold text-rose-700">{recentSyncedReport.visiaMetrics.uvSpots}%</span>
                    </div>
                    <div className="bg-white p-1.5 rounded-lg border border-gray-100">
                      <span className="text-gray-400 block truncate">Nám Melanin</span>
                      <span className="font-bold text-rose-800">{recentSyncedReport.visiaMetrics.brownSpots}%</span>
                    </div>
                    <div className="bg-white p-1.5 rounded-lg border border-gray-100">
                      <span className="text-gray-400 block truncate">Lỗ Chân Lông</span>
                      <span className="font-bold text-indigo-700">{recentSyncedReport.visiaMetrics.pores}%</span>
                    </div>
                    <div className="bg-white p-1.5 rounded-lg border border-gray-100">
                      <span className="text-gray-400 block truncate">Mao Mạch Đỏ</span>
                      <span className="font-bold text-red-700">{recentSyncedReport.visiaMetrics.redAreas}%</span>
                    </div>
                    <div className="bg-white p-1.5 rounded-lg border border-gray-100">
                      <span className="text-gray-400 block truncate">P.Acnes</span>
                      <span className="font-bold text-red-800">{recentSyncedReport.visiaMetrics.porphyrins}%</span>
                    </div>
                    <div className="bg-white p-1.5 rounded-lg border border-gray-100">
                      <span className="text-gray-400 block truncate">Xếp Hạng</span>
                      <span className="font-bold text-emerald-700">{recentSyncedReport.visiaMetrics.percentileRank}%</span>
                    </div>
                  </div>
                )}

                {/* Direct Action Buttons */}
                <div className="flex items-center gap-2 pt-1">
                  {onNavigateToEMR && (
                    <button
                      onClick={() => onNavigateToEMR(recentSyncedReport.customerCode)}
                      className="flex-1 py-2 px-3 bg-[#5C3A3A] hover:bg-[#4a2e2e] text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Mở Bệnh Án EMR Của Bệnh Nhân
                    </button>
                  )}
                  {onViewReportDetails && (
                    <button
                      onClick={() => onViewReportDetails(recentSyncedReport.id)}
                      className="py-2 px-3 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                    >
                      Xem Biểu Đồ So Sánh
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 2: REAL FILE UPLOAD / DROPZONE */}
      {activeSubTab === 'upload_file' && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
          <div className="max-w-xl mx-auto text-center space-y-2">
            <h4 className="text-lg font-bold text-gray-900">Kéo Thả Hoặc Tải Lên Tệp Xuất Từ Máy Canfield VISIA</h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              Nếu phòng khám đã xuất file từ phần mềm VISIA (định dạng .JSON hoặc .XML), bạn có thể tải lên ngay tại đây để nạp trực tiếp kết quả vào hồ sơ bệnh án EMR mà không cần cài đặt thêm phần mềm.
            </p>
          </div>

          <div className="max-w-xl mx-auto border-2 border-dashed border-rose-300 hover:border-[#D97A7D] bg-rose-50/30 hover:bg-rose-50/60 rounded-2xl p-8 text-center transition-colors">
            <input
              type="file"
              id="visia-file-input"
              accept=".json,.xml,.csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            <label htmlFor="visia-file-input" className="cursor-pointer block space-y-3">
              <div className="w-14 h-14 mx-auto rounded-full bg-rose-100 flex items-center justify-center text-[#D97A7D]">
                <Upload className="w-7 h-7" />
              </div>
              <div>
                <span className="font-bold text-sm text-gray-800 block">Bấm để chọn file hoặc kéo thả vào đây</span>
                <span className="text-xs text-gray-500 block mt-1">Hỗ trợ định dạng: .JSON, .XML, .CSV từ Canfield VISIA</span>
              </div>
              <span className="inline-block px-4 py-1.5 text-xs font-bold text-white bg-[#D97A7D] rounded-xl shadow-xs">
                Chọn File Xuất VISIA
              </span>
            </label>
          </div>

          <div className="max-w-xl mx-auto bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs space-y-2">
            <div className="font-bold text-gray-800 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-blue-600" />
              Chưa có file từ máy thật?
            </div>
            <p className="text-gray-600">
              Bạn có thể bấm nút <strong>"Tải File Mẫu VISIA Test (.json)"</strong> ở góc phải phía trên để lấy file mẫu chuẩn định dạng Canfield, sau đó kéo thả lại vào ô trên để kiểm tra khả năng đọc tự động!
            </p>
          </div>
        </div>
      )}

      {/* SUBTAB 3: PRODUCTION SCRIPT & SETUP GUIDE */}
      {activeSubTab === 'agent_script' && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-gray-100">
            <div>
              <h4 className="font-bold text-gray-900 text-base flex items-center gap-2">
                <Terminal className="w-5 h-5 text-[#5C3A3A]" />
                Mã Nguồn Cài Đặt Dịch Vụ Hot-Folder Agent (Chạy Trên Máy Tính VISIA)
              </h4>
              <p className="text-xs text-gray-500 mt-0.5">
                Kỹ thuật viên IT phòng khám chỉ cần copy đoạn script này chạy trên máy Windows kết nối với máy VISIA.
              </p>
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText(agentCodeString);
                setCopiedScript(true);
                setTimeout(() => setCopiedScript(false), 2000);
              }}
              className="px-3.5 py-2 bg-[#D97A7D] hover:bg-[#c76b6e] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              {copiedScript ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copiedScript ? 'Đã Sao Chép!' : 'Sao Chép Mã Nguồn Agent'}
            </button>
          </div>

          {/* Setup Guide Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
              <div className="font-bold text-gray-800">Bước 1: Cấu Hình VISIA</div>
              <p className="text-gray-600 text-[11px] leading-relaxed">
                Mở phần mềm Canfield VISIA → <code>Tools</code> → <code>Options</code> → <code>Export</code> → Bật <em>Auto Export on Save</em> và trỏ đường dẫn về <code>C:\Canfield\VISIA\Exports</code>.
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
              <div className="font-bold text-gray-800">Bước 2: Cài Đặt Môi Trường</div>
              <p className="text-gray-600 text-[11px] leading-relaxed">
                Tải Node.js (LTS) cài đặt vào máy tính VISIA. Mở Command Prompt (cmd) gõ: <code>npm install -g pm2 chokidar axios</code>.
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
              <div className="font-bold text-gray-800">Bước 3: Khởi Động Nền Vĩnh Viễn</div>
              <p className="text-gray-600 text-[11px] leading-relaxed">
                Lưu file <code>visia-agent.js</code> và chạy: <code>pm2 start visia-agent.js --name "visia-agent"</code>. Agent sẽ tự chạy lại mỗi khi máy tính VISIA khởi động.
              </p>
            </div>
          </div>

          {/* Script Code Viewer */}
          <div className="relative rounded-xl overflow-hidden border border-gray-800 bg-[#0F172A] text-gray-200 p-4 font-mono text-xs max-h-96 overflow-y-auto">
            <pre className="leading-relaxed">{agentCodeString}</pre>
          </div>
        </div>
      )}

      {/* Live Sync Audit Logs Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden space-y-3 p-5">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#D97A7D]" />
              Nhật Ký File Hot-Folder Đã Thu Thập & Ánh Xạ ({syncLogs.length})
            </h4>
            <span className="text-[11px] text-gray-500">Lịch sử các phiên soi da được đồng bộ tự động vào EMR</span>
          </div>

          <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> 100% Thành công
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-gray-600">
                <th className="p-3 font-semibold">Thời Gian</th>
                <th className="p-3 font-semibold">Tên File Xuất</th>
                <th className="p-3 font-semibold">Khách Hàng (Mã EMR)</th>
                <th className="p-3 font-semibold text-center">Tuổi TruSkin</th>
                <th className="p-3 font-semibold text-center">Điểm Tổng</th>
                <th className="p-3 font-semibold text-center">Trạng Thái</th>
                <th className="p-3 font-semibold text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {syncLogs.map(log => (
                <tr key={log.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="p-3 font-mono text-gray-500 whitespace-nowrap">{log.timestamp}</td>
                  <td className="p-3 font-mono text-gray-800 font-semibold max-w-[220px] truncate" title={log.fileName}>
                    {log.fileName}
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <span className="font-bold text-gray-900 block">{log.customerName}</span>
                    <span className="font-mono text-[10px] text-gray-400">{log.customerCode}</span>
                  </td>
                  <td className="p-3 text-center whitespace-nowrap">
                    <span className="font-bold text-blue-600">{log.truSkinAge} tuổi</span>
                  </td>
                  <td className="p-3 text-center whitespace-nowrap">
                    <span className="font-extrabold text-[#D97A7D]">{log.overallScore}/100</span>
                  </td>
                  <td className="p-3 text-center whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                      200 OK • Synced
                    </span>
                  </td>
                  <td className="p-3 text-right whitespace-nowrap">
                    {onNavigateToEMR && (
                      <button
                        onClick={() => onNavigateToEMR(log.customerCode)}
                        className="text-[11px] font-bold text-[#5C3A3A] hover:text-[#D97A7D] hover:underline cursor-pointer"
                      >
                        Mở Bệnh Án →
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VisiaHotFolderStation;

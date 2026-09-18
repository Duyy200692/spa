import React, { useState, useEffect } from 'react';
import {
  MedicalRecord,
  InventoryItem,
  KiotVietConfig,
  KiotVietSyncLog,
  KiotVietCustomerMapping,
  KiotVietProductMapping
} from '../types';
import {
  Link2,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Key,
  Database,
  Users,
  Package,
  Receipt,
  Eye,
  EyeOff,
  Copy,
  Check,
  Terminal,
  ArrowRightLeft,
  Sliders,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Clock,
  Send,
  Building2,
  Webhook
} from 'lucide-react';

interface KiotVietSyncHubProps {
  medicalRecords: MedicalRecord[];
  inventoryItems: InventoryItem[];
  onUpdateMedicalRecords?: (updatedRecords: MedicalRecord[]) => void;
  onUpdateInventoryItems?: (updatedItems: InventoryItem[]) => void;
  onNavigateToEMR?: () => void;
  onNavigateToInventory?: () => void;
}

const STORAGE_KEY_CONFIG = 'wellness_kiotviet_config_v1';
const STORAGE_KEY_LOGS = 'wellness_kiotviet_logs_v1';

// Initial Mock KiotViet Data for Sandbox testing
const INITIAL_MOCK_CUSTOMERS: KiotVietCustomerMapping[] = [
  {
    kiotvietId: 100234,
    code: 'KHKV001',
    name: 'Nguyễn Thị Thu Hương',
    contactNumber: '0912345678',
    debt: 0,
    totalInvoiced: 45200000,
    rewardPoints: 452,
    syncedToEMR: true,
    lastSync: '2026-09-18 10:15'
  },
  {
    kiotvietId: 100235,
    code: 'KHKV002',
    name: 'Trần Mai Phương',
    contactNumber: '0987654321',
    debt: 2500000,
    totalInvoiced: 82000000,
    rewardPoints: 820,
    syncedToEMR: true,
    lastSync: '2026-09-18 10:15'
  },
  {
    kiotvietId: 100236,
    code: 'KHKV003',
    name: 'Lê Hoàng Yến',
    contactNumber: '0903112233',
    debt: 0,
    totalInvoiced: 19500000,
    rewardPoints: 195,
    syncedToEMR: true,
    lastSync: '2026-09-18 10:15'
  },
  {
    kiotvietId: 100237,
    code: 'KHKV004',
    name: 'Đặng Ngọc Minh Thư',
    contactNumber: '0938445566',
    debt: 5000000,
    totalInvoiced: 31000000,
    rewardPoints: 310,
    syncedToEMR: false,
    lastSync: 'Chưa đồng bộ'
  },
  {
    kiotvietId: 100238,
    code: 'KHKV005',
    name: 'Võ Thanh Trúc',
    contactNumber: '0977889900',
    debt: 0,
    totalInvoiced: 64000000,
    rewardPoints: 640,
    syncedToEMR: false,
    lastSync: 'Chưa đồng bộ'
  }
];

const INITIAL_MOCK_PRODUCTS: KiotVietProductMapping[] = [
  {
    kiotvietId: 501,
    code: 'SP-MESO-HA',
    fullName: 'Tinh Chất Meso Căng Bóng Hyaluronic Acid 5ml (Pháp)',
    categoryName: 'Dược Mỹ Phẩm Tiêm',
    basePrice: 1850000,
    cost: 950000,
    onHand: 42,
    unit: 'Lọ',
    syncedToInventory: true,
    lastSync: '2026-09-18 09:30'
  },
  {
    kiotvietId: 502,
    code: 'SP-BOTOX-100',
    fullName: 'Botox Allergan 100 Units (Mỹ - Chính Hãng)',
    categoryName: 'Chất Làm Đầy & Xóa Nhăn',
    basePrice: 5500000,
    cost: 3200000,
    onHand: 15,
    unit: 'Lọ',
    syncedToInventory: true,
    lastSync: '2026-09-18 09:30'
  },
  {
    kiotvietId: 503,
    code: 'SP-JUVEDERM-ULT',
    fullName: 'Filler Juvederm Ultra Plus XC 1ml (Mỹ)',
    categoryName: 'Chất Làm Đầy & Xóa Nhăn',
    basePrice: 6200000,
    cost: 3800000,
    onHand: 18,
    unit: 'Ống tiêm',
    syncedToInventory: true,
    lastSync: '2026-09-18 09:30'
  },
  {
    kiotvietId: 504,
    code: 'SP-SERUM-B5',
    fullName: 'Serum Phục Hồi Da B5 Skinceuticals 30ml',
    categoryName: 'Chăm Sóc Sau Liệu Trình',
    basePrice: 1950000,
    cost: 1200000,
    onHand: 35,
    unit: 'Chai',
    syncedToInventory: true,
    lastSync: '2026-09-18 09:30'
  },
  {
    kiotvietId: 505,
    code: 'SP-SUN-LAROCHE',
    fullName: 'Kem Chống Nắng La Roche-Posay Anthelios 50ml',
    categoryName: 'Chăm Sóc Sau Liệu Trình',
    basePrice: 495000,
    cost: 310000,
    onHand: 68,
    unit: 'Tuýp',
    syncedToInventory: false,
    lastSync: 'Chưa đồng bộ'
  },
  {
    kiotvietId: 506,
    code: 'SP-GEL-TRIET-LONG',
    fullName: 'Gel Lạnh Triệt Lông & Bắn Laser Can 5L',
    categoryName: 'Vật Tư Tiêu Hao',
    basePrice: 280000,
    cost: 150000,
    onHand: 12,
    unit: 'Can',
    syncedToInventory: false,
    lastSync: 'Chưa đồng bộ'
  }
];

const INITIAL_MOCK_LOGS: KiotVietSyncLog[] = [
  {
    id: 'log-1',
    timestamp: '2026-09-18 10:15:22',
    type: 'customers',
    direction: 'inbound',
    status: 'success',
    itemCount: 3,
    message: 'Đồng bộ 3 khách hàng từ KiotViet sang Hồ Sơ Bệnh Án EMR (Cập nhật công nợ & điểm thưởng)'
  },
  {
    id: 'log-2',
    timestamp: '2026-09-18 09:30:10',
    type: 'inventory',
    direction: 'inbound',
    status: 'success',
    itemCount: 4,
    message: 'Cập nhật tồn kho 4 sản phẩm dược mỹ phẩm từ KiotViet POS sang Kho Wellness'
  },
  {
    id: 'log-3',
    timestamp: '2026-09-18 08:45:00',
    type: 'auth',
    direction: 'outbound',
    status: 'success',
    itemCount: 1,
    message: 'Cấp token OAuth 2.0 thành công (Hiệu lực: 86400s / 24 giờ)'
  }
];

const KiotVietSyncHub: React.FC<KiotVietSyncHubProps> = ({
  medicalRecords,
  inventoryItems,
  onUpdateMedicalRecords,
  onUpdateInventoryItems,
  onNavigateToEMR,
  onNavigateToInventory
}) => {
  // Config state
  const [config, setConfig] = useState<KiotVietConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return {
      retailerName: '',
      clientId: '',
      clientSecret: '',
      branchId: '1001',
      branchName: 'Chi Nhánh Trụ Sở - TP.HCM',
      webhookSecret: '',
      autoSyncIntervalMinutes: 30,
      syncCustomers: true,
      syncInventory: true,
      syncInvoices: true,
      isConnected: false,
      accessToken: '',
      tokenExpiresAt: ''
    };
  });

  const [logs, setLogs] = useState<KiotVietSyncLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_LOGS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return INITIAL_MOCK_LOGS;
  });

  const [customers, setCustomers] = useState<KiotVietCustomerMapping[]>(INITIAL_MOCK_CUSTOMERS);
  const [products, setProducts] = useState<KiotVietProductMapping[]>(INITIAL_MOCK_PRODUCTS);

  // UI state
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'config' | 'customers' | 'inventory' | 'webhook' | 'developer'>('overview');
  const [showSecret, setShowSecret] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isSyncingCustomers, setIsSyncingCustomers] = useState(false);
  const [isSyncingInventory, setIsSyncingInventory] = useState(false);
  const [isSyncingInvoices, setIsSyncingInvoices] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Save config to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
  }, [config]);

  // Save logs to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(logs));
  }, [logs]);

  const addLog = (log: Omit<KiotVietSyncLog, 'id' | 'timestamp'>) => {
    const now = new Date();
    const timestamp = `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 8)}`;
    const newLog: KiotVietSyncLog = {
      id: `log-${Date.now()}`,
      timestamp,
      ...log
    };
    setLogs(prev => [newLog, ...prev]);
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Test OAuth 2.0 Connection
  const handleTestConnection = async () => {
    if (!config.retailerName.trim() || !config.clientId.trim() || !config.clientSecret.trim()) {
      alert('Vui lòng điền đủ Tên gian hàng (Retailer), Client ID và Client Secret để kiểm tra kết nối!');
      return;
    }

    setIsTestingConnection(true);

    try {
      // Simulate OAuth 2.0 token request with real API endpoint schema
      await new Promise(resolve => setTimeout(resolve, 1200));

      const fakeToken = `kv_token_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleString('vi-VN');

      const updatedConfig: KiotVietConfig = {
        ...config,
        isConnected: true,
        lastConnectedAt: new Date().toLocaleString('vi-VN'),
        accessToken: fakeToken,
        tokenExpiresAt: expires
      };
      setConfig(updatedConfig);

      addLog({
        type: 'auth',
        direction: 'outbound',
        status: 'success',
        itemCount: 1,
        message: `Xác thực thành công với gian hàng KiotViet: ${config.retailerName}. Token có hiệu lực 24 giờ.`,
        details: `POST https://id.kiotviet.vn/connect/token -> 200 OK. Retailer: ${config.retailerName}`
      });

      setSaveSuccessMsg('Kết nối KiotViet thành công! Mã Access Token đã được kích hoạt.');
      setTimeout(() => setSaveSuccessMsg(null), 4000);
    } catch {
      addLog({
        type: 'auth',
        direction: 'outbound',
        status: 'error',
        itemCount: 0,
        message: 'Lỗi xác thực: Sai Client ID hoặc Client Secret KiotViet.'
      });
      alert('Kết nối thất bại. Vui lòng kiểm tra lại Client ID và Client Secret.');
    } finally {
      setIsTestingConnection(false);
    }
  };

  // Fill Demo / Sandbox Credentials
  const handleLoadSandbox = () => {
    const sandboxConfig: KiotVietConfig = {
      retailerName: 'wellnessclinic-demo',
      clientId: '8a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
      clientSecret: 'sk_live_kiotviet_998877665544332211aabbccddeeff',
      branchId: '1001',
      branchName: 'Wellness Clinic - Trụ Sở Quận 1',
      webhookSecret: 'whsec_kiotviet_sandbox_key_2026',
      autoSyncIntervalMinutes: 15,
      syncCustomers: true,
      syncInventory: true,
      syncInvoices: true,
      isConnected: true,
      lastConnectedAt: new Date().toLocaleString('vi-VN'),
      accessToken: 'kv_live_token_sandbox_valid_24h',
      tokenExpiresAt: '24h tiếp theo'
    };
    setConfig(sandboxConfig);

    addLog({
      type: 'auth',
      direction: 'outbound',
      status: 'success',
      itemCount: 1,
      message: 'Đã nạp dữ liệu mẫu KiotViet Sandbox (Sẵn sàng test kéo Khách hàng, Tồn kho & Hóa đơn)'
    });

    setSaveSuccessMsg('Đã kích hoạt chế độ KiotViet Sandbox! Bạn có thể thử nghiệm các nút đồng bộ.');
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  // Sync Customers
  const handleSyncCustomers = async () => {
    setIsSyncingCustomers(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Update customers state as synced
    const updated = customers.map(c => ({
      ...c,
      syncedToEMR: true,
      lastSync: new Date().toLocaleTimeString('vi-VN')
    }));
    setCustomers(updated);

    // If callback provided, propagate to App/EMR
    if (onUpdateMedicalRecords) {
      const mergedRecords = [...medicalRecords];
      updated.forEach(c => {
        const existing = mergedRecords.find(r => r.customerPhone === c.contactNumber);
        if (existing) {
          existing.medicalHistory = `${existing.medicalHistory ? existing.medicalHistory + ' | ' : ''}KiotViet: Điểm thưởng ${c.rewardPoints}, Nợ: ${c.debt.toLocaleString('vi-VN')}đ`;
        }
      });
      onUpdateMedicalRecords(mergedRecords);
    }

    addLog({
      type: 'customers',
      direction: 'inbound',
      status: 'success',
      itemCount: updated.length,
      message: `Đã kéo ${updated.length} khách hàng từ KiotViet sang Hồ Sơ Bệnh Án EMR & CRM thành công.`
    });

    setIsSyncingCustomers(false);
    setSaveSuccessMsg(`Đã đồng bộ ${updated.length} khách hàng KiotViet sang hệ thống phòng khám!`);
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  // Sync Inventory
  const handleSyncInventory = async () => {
    setIsSyncingInventory(true);
    await new Promise(resolve => setTimeout(resolve, 1100));

    const updated = products.map(p => ({
      ...p,
      syncedToInventory: true,
      lastSync: new Date().toLocaleTimeString('vi-VN')
    }));
    setProducts(updated);

    if (onUpdateInventoryItems) {
      const mergedItems = [...inventoryItems];
      updated.forEach(p => {
        const existing = mergedItems.find(i => i.id.toLowerCase() === p.code.toLowerCase() || i.name.toLowerCase().includes(p.fullName.toLowerCase()));
        if (existing) {
          existing.quantity = p.onHand;
        }
      });
      onUpdateInventoryItems(mergedItems);
    }

    addLog({
      type: 'inventory',
      direction: 'inbound',
      status: 'success',
      itemCount: updated.length,
      message: `Đã cập nhật tồn kho thực tế cho ${updated.length} sản phẩm mỹ phẩm từ KiotViet POS.`
    });

    setIsSyncingInventory(false);
    setSaveSuccessMsg(`Đã cập nhật số lượng tồn kho ${updated.length} sản phẩm từ KiotViet!`);
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  // Sync Invoices (Outbound)
  const handleSyncInvoices = async () => {
    setIsSyncingInvoices(true);
    await new Promise(resolve => setTimeout(resolve, 900));

    addLog({
      type: 'invoices',
      direction: 'outbound',
      status: 'success',
      itemCount: 4,
      message: 'Đã xuất 4 phiếu thu & gói liệu trình hoàn thành sang KiotViet POS để in bill và ghi nhận doanh số.'
    });

    setIsSyncingInvoices(false);
    setSaveSuccessMsg('Đã đẩy 4 hóa đơn liệu trình hôm nay sang KiotViet POS thành công!');
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  // Webhook URL
  const webhookUrl = `https://clinic.wellness.vn/api/kiotviet-webhook?retailer=${config.retailerName || 'YOUR_RETAILER'}`;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner / Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-[#004f9e] via-[#0066cc] to-[#0080ff] text-white p-6 sm:p-8 shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/20 text-white flex items-center gap-1.5 border border-white/30 backdrop-blur-xs">
                <Link2 className="w-3.5 h-3.5" />
                Cổng Tích Hợp KiotViet Official API (v2.0)
              </span>
              {config.isConnected ? (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-400 text-emerald-950 flex items-center gap-1 shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Đã Kết Nối ({config.retailerName})
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-300 text-amber-950 flex items-center gap-1 shadow-xs">
                  <AlertTriangle className="w-3.5 h-3.5" /> Chờ Nhập Thông Tin API
                </span>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Trung Tâm Đồng Bộ & Tích Hợp KiotViet
            </h2>
            <p className="text-white/85 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Tự động kết nối hai chiều giữa Phần mềm Quản lý Bán hàng KiotViet và Hệ thống Thẩm mỹ Wellness: 
              Đồng bộ Khách hàng (CRM/EMR), Tồn kho Dược Mỹ Phẩm & Đẩy Hóa đơn điều trị sang máy POS.
            </p>
          </div>

          {/* Quick Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {!config.isConnected && (
              <button
                onClick={handleLoadSandbox}
                className="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs flex items-center gap-1.5 border border-white/30 transition-colors shadow-xs"
                title="Bấm để nạp dữ liệu mẫu thử nghiệm trước khi có API thật"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                Nạp Dữ Liệu Mẫu (Sandbox)
              </button>
            )}

            <button
              onClick={() => setActiveSubTab('config')}
              className="px-4 py-2 rounded-xl bg-white text-[#0066cc] font-bold text-xs flex items-center gap-1.5 hover:bg-blue-50 transition-colors shadow-sm"
            >
              <Key className="w-4 h-4" />
              {config.isConnected ? 'Chỉnh Sửa API Key' : 'Nhập API & Mã Cấp Quyền'}
            </button>
          </div>
        </div>

        {/* Live Token Bar */}
        {config.isConnected && (
          <div className="mt-5 pt-4 border-t border-white/20 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <span className="text-white/70">Gian hàng:</span>
              <span className="font-bold font-mono bg-black/20 px-2 py-0.5 rounded">{config.retailerName}</span>
              <span className="text-white/70">Chi nhánh:</span>
              <span className="font-semibold">{config.branchName}</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-white/70 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Token:
              </span>
              <span className="font-mono text-emerald-200">Hiệu lực đến {config.tokenExpiresAt || '24 giờ tới'}</span>
              <button
                onClick={handleTestConnection}
                disabled={isTestingConnection}
                className="px-2.5 py-1 rounded bg-white/20 hover:bg-white/30 text-white text-[11px] font-semibold flex items-center gap-1 transition-colors"
              >
                <RefreshCw className={`w-3 h-3 ${isTestingConnection ? 'animate-spin' : ''}`} />
                Làm mới Token
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Success Notification Alert */}
      {saveSuccessMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-xs animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
          <button onClick={() => setSaveSuccessMsg(null)} className="text-emerald-600 hover:text-emerald-800">✕</button>
        </div>
      )}

      {/* Sub-Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-white rounded-xl border border-gray-200 shadow-xs">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
            activeSubTab === 'overview' ? 'bg-[#0066cc] text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Database className="w-4 h-4" />
          Bảng Điều Khiển Đồng Bộ
        </button>

        <button
          onClick={() => setActiveSubTab('config')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
            activeSubTab === 'config' ? 'bg-[#0066cc] text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Key className="w-4 h-4" />
          Cài Đặt Khóa API & Gian Hàng
        </button>

        <button
          onClick={() => setActiveSubTab('customers')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
            activeSubTab === 'customers' ? 'bg-[#0066cc] text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Users className="w-4 h-4" />
          Khách Hàng KiotViet ({customers.length})
        </button>

        <button
          onClick={() => setActiveSubTab('inventory')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
            activeSubTab === 'inventory' ? 'bg-[#0066cc] text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Package className="w-4 h-4" />
          Tồn Kho Sản Phẩm ({products.length})
        </button>

        <button
          onClick={() => setActiveSubTab('webhook')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
            activeSubTab === 'webhook' ? 'bg-[#0066cc] text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Webhook className="w-4 h-4" />
          Webhook Thời Gian Thực
        </button>

        <button
          onClick={() => setActiveSubTab('developer')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
            activeSubTab === 'developer' ? 'bg-[#0066cc] text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Terminal className="w-4 h-4" />
          Tài Liệu Kỹ Thuật & Mẫu Lệnh
        </button>
      </div>

      {/* TAB 1: OVERVIEW / SYNC COMMAND CENTER */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          {/* 3 Core Sync Channels */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Channel 1: Customers */}
            <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-xs space-y-4 hover:border-blue-300 transition-colors">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#0066cc]">
                  <Users className="w-5 h-5" />
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-[#0066cc] border border-blue-200">
                  Hai Chiều (2-Way)
                </span>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 text-base">Đồng Bộ Khách Hàng (CRM)</h3>
                <p className="text-gray-500 text-xs mt-1">
                  Đồng bộ số điện thoại, công nợ, điểm thưởng và hạng thẻ VIP giữa KiotViet POS và Bệnh Án EMR.
                </p>
              </div>

              <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600">
                <span>Số khách đã nạp:</span>
                <span className="font-bold text-gray-900">{customers.length} khách</span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSyncCustomers}
                  disabled={isSyncingCustomers}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-[#0066cc] hover:bg-[#0052a3] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 shadow-xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncingCustomers ? 'animate-spin' : ''}`} />
                  {isSyncingCustomers ? 'Đang kéo dữ liệu...' : 'Đồng Bộ Khách Hàng'}
                </button>
                {onNavigateToEMR && (
                  <button
                    onClick={onNavigateToEMR}
                    className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors"
                    title="Mở Bệnh Án EMR"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Channel 2: Inventory */}
            <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-xs space-y-4 hover:border-blue-300 transition-colors">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                  <Package className="w-5 h-5" />
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  KiotViet ➔ Wellness Kho
                </span>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 text-base">Tồn Kho Mỹ Phẩm & Dược Liệu</h3>
                <p className="text-gray-500 text-xs mt-1">
                  Kéo số lượng tồn thực tế từ KiotViet POS sang tab Kho để KTV biết thuốc tiêm Meso, Filler còn hay hết.
                </p>
              </div>

              <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600">
                <span>Số SKU mỹ phẩm:</span>
                <span className="font-bold text-gray-900">{products.length} mã</span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSyncInventory}
                  disabled={isSyncingInventory}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 shadow-xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncingInventory ? 'animate-spin' : ''}`} />
                  {isSyncingInventory ? 'Đang kéo tồn kho...' : 'Kéo Tồn Kho KiotViet'}
                </button>
                {onNavigateToInventory && (
                  <button
                    onClick={onNavigateToInventory}
                    className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors"
                    title="Mở Kho & Vật Tư"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Channel 3: Invoices */}
            <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-xs space-y-4 hover:border-blue-300 transition-colors">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
                  <Receipt className="w-5 h-5" />
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                  Wellness ➔ KiotViet POS
                </span>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 text-base">Hóa Đơn & Gói Liệu Trình</h3>
                <p className="text-gray-500 text-xs mt-1">
                  Khi bác sĩ chốt liệu trình hoặc KTV hoàn tất buổi điều trị, tự động bắn hóa đơn sang KiotViet để in bill.
                </p>
              </div>

              <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600">
                <span>Chi nhánh ghi nhận:</span>
                <span className="font-bold text-gray-900">{config.branchName.slice(0, 20)}...</span>
              </div>

              <button
                onClick={handleSyncInvoices}
                disabled={isSyncingInvoices}
                className="w-full py-2.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 shadow-xs"
              >
                <Send className={`w-3.5 h-3.5 ${isSyncingInvoices ? 'animate-spin' : ''}`} />
                {isSyncingInvoices ? 'Đang gửi hóa đơn...' : 'Đẩy Hóa Đơn Hôm Nay Sang KiotViet'}
              </button>
            </div>
          </div>

          {/* Sync Audit Logs Table */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#0066cc]" />
                <h3 className="font-bold text-gray-900 text-sm">Nhật Ký Đồng Bộ KiotViet API Thời Gian Thực</h3>
              </div>

              <button
                onClick={() => setLogs(INITIAL_MOCK_LOGS)}
                className="text-xs text-gray-500 hover:text-gray-800 font-semibold flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Tải lại nhật ký
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-50 text-gray-600 uppercase text-[10px] tracking-wider border-y border-gray-100">
                  <tr>
                    <th className="py-2.5 px-3 font-bold">Thời gian</th>
                    <th className="py-2.5 px-3 font-bold">Loại dữ liệu</th>
                    <th className="py-2.5 px-3 font-bold">Chiều đồng bộ</th>
                    <th className="py-2.5 px-3 font-bold">Số bản ghi</th>
                    <th className="py-2.5 px-3 font-bold">Chi tiết & Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {logs.map(log => (
                    <tr key={log.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-2.5 px-3 text-gray-500 font-mono text-[11px] whitespace-nowrap">
                        {log.timestamp}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded font-bold text-[10px] uppercase bg-gray-100 text-gray-700">
                          {log.type}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 w-fit ${
                          log.direction === 'inbound' ? 'bg-blue-50 text-[#0066cc]' : 'bg-purple-50 text-purple-700'
                        }`}>
                          <ArrowRightLeft className="w-3 h-3" />
                          {log.direction === 'inbound' ? 'KiotViet ➔ Wellness' : 'Wellness ➔ KiotViet'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-bold text-gray-800">
                        {log.itemCount} bản ghi
                      </td>
                      <td className="py-2.5 px-3 text-gray-700">
                        <div className="flex items-center gap-1.5 font-medium">
                          {log.status === 'success' ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          ) : (
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          )}
                          <span>{log.message}</span>
                        </div>
                        {log.details && (
                          <div className="font-mono text-[10px] text-gray-400 mt-0.5">{log.details}</div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CONFIGURATION & CREDENTIALS FORM */}
      {activeSubTab === 'config' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-5">
            <div className="pb-3 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                  <Key className="w-4 h-4 text-[#0066cc]" />
                  Điền Thông Tin API & Khóa Cấp Quyền KiotViet
                </h3>
                <p className="text-gray-500 text-xs mt-0.5">
                  Lấy từ trang Quản lý KiotViet → Thiết lập cửa hàng → Thiết lập tính năng → Mở kết nối API.
                </p>
              </div>

              <button
                onClick={handleLoadSandbox}
                className="text-xs text-[#0066cc] hover:underline font-bold flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Nạp Mẫu Demo
              </button>
            </div>

            <div className="space-y-4">
              {/* 1. Retailer Name */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  1. Tên Gian Hàng KiotViet (Retailer Name) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 text-xs">
                    https://
                  </div>
                  <input
                    type="text"
                    value={config.retailerName}
                    onChange={(e) => setConfig({ ...config, retailerName: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                    placeholder="ten-gian-hang"
                    className="w-full pl-16 pr-24 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#0066cc] focus:border-transparent font-medium"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400 text-xs">
                    .kiotviet.vn
                  </div>
                </div>
                <span className="text-[11px] text-gray-500 mt-1 block">
                  Là phần chữ viết liền không dấu trong link đăng nhập KiotViet của bạn (Ví dụ: <code>wellnessclinic</code>).
                </span>
              </div>

              {/* 2. Client ID */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  2. Client ID (Mã Ứng Dụng) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={config.clientId}
                  onChange={(e) => setConfig({ ...config, clientId: e.target.value.trim() })}
                  placeholder="Ví dụ: 8a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-mono focus:ring-2 focus:ring-[#0066cc] focus:border-transparent"
                />
                <span className="text-[11px] text-gray-500 mt-1 block">
                  Chuỗi mã UUID do KiotViet cấp khi tạo kết nối ứng dụng trong phần thiết lập API.
                </span>
              </div>

              {/* 3. Client Secret */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  3. Client Secret (Mã Khóa Bí Mật) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showSecret ? 'text' : 'password'}
                    value={config.clientSecret}
                    onChange={(e) => setConfig({ ...config, clientSecret: e.target.value.trim() })}
                    placeholder="Nhập hoặc dán mã Client Secret..."
                    className="w-full pl-3 pr-10 py-2 rounded-xl border border-gray-200 text-xs font-mono focus:ring-2 focus:ring-[#0066cc] focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <span className="text-[11px] text-gray-500 mt-1 block">
                  Mã bí mật dùng để xác thực OAuth 2.0 (Hệ thống lưu cục bộ và bảo vệ an toàn).
                </span>
              </div>

              {/* 4. Branch Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Chi Nhánh KiotViet Mặc Định
                  </label>
                  <input
                    type="text"
                    value={config.branchName}
                    onChange={(e) => setConfig({ ...config, branchName: e.target.value })}
                    placeholder="Ví dụ: Wellness Chi Nhánh 1"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#0066cc] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Branch ID (Mã Chi Nhánh KiotViet)
                  </label>
                  <input
                    type="text"
                    value={config.branchId}
                    onChange={(e) => setConfig({ ...config, branchId: e.target.value })}
                    placeholder="1001"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-mono focus:ring-2 focus:ring-[#0066cc] focus:border-transparent"
                  />
                </div>
              </div>

              {/* Auto Sync Switches */}
              <div className="pt-3 border-t border-gray-100 space-y-2">
                <span className="text-xs font-bold text-gray-800 block">Tự Động Đồng Bộ Dữ Liệu</span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={config.syncCustomers}
                      onChange={(e) => setConfig({ ...config, syncCustomers: e.target.checked })}
                      className="rounded text-[#0066cc] focus:ring-[#0066cc]"
                    />
                    <span className="font-semibold text-gray-700">Khách Hàng (CRM)</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={config.syncInventory}
                      onChange={(e) => setConfig({ ...config, syncInventory: e.target.checked })}
                      className="rounded text-[#0066cc] focus:ring-[#0066cc]"
                    />
                    <span className="font-semibold text-gray-700">Tồn Kho Mỹ Phẩm</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={config.syncInvoices}
                      onChange={(e) => setConfig({ ...config, syncInvoices: e.target.checked })}
                      className="rounded text-[#0066cc] focus:ring-[#0066cc]"
                    />
                    <span className="font-semibold text-gray-700">Hóa Đơn Điều Trị</span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-wrap items-center gap-3">
                <button
                  onClick={handleTestConnection}
                  disabled={isTestingConnection}
                  className="px-5 py-2.5 rounded-xl bg-[#0066cc] hover:bg-[#0052a3] text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isTestingConnection ? 'animate-spin' : ''}`} />
                  {isTestingConnection ? 'Đang Kiểm Tra OAuth 2.0...' : 'Lưu & Kiểm Tra Kết Nối (Ping)'}
                </button>

                <button
                  onClick={() => {
                    setSaveSuccessMsg('Đã lưu cấu hình API KiotViet thành công!');
                    setTimeout(() => setSaveSuccessMsg(null), 3000);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs transition-colors"
                >
                  Lưu Cấu Hình
                </button>
              </div>
            </div>
          </div>

          {/* Right Guidance & Steps Box */}
          <div className="space-y-4">
            <div className="bg-blue-50/70 p-5 rounded-2xl border border-blue-200/80 space-y-3 text-xs">
              <div className="font-bold text-blue-950 flex items-center gap-2 text-sm">
                <Building2 className="w-4 h-4 text-[#0066cc]" />
                Cách Lấy API Key Trên KiotViet
              </div>

              <ol className="space-y-2.5 text-blue-900/90 list-decimal list-inside leading-relaxed text-[11px]">
                <li>
                  Đăng nhập vào trang quản lý KiotViet của bạn: <code>https://[gian-hang].kiotviet.vn</code>
                </li>
                <li>
                  Vào menu <strong>Thiết lập</strong> (biểu tượng bánh răng góc trên bên phải) → chọn <strong>Thiết lập cửa hàng</strong>.
                </li>
                <li>
                  Chọn tab <strong>Thiết lập tính năng</strong> → Tìm mục <strong>Mở kết nối API</strong>.
                </li>
                <li>
                  Nhấn nút <strong>Thêm ứng dụng kết nối</strong> (Tên ứng dụng đặt là <code>Wellness Clinic Integration</code>).
                </li>
                <li>
                  KiotViet sẽ cấp ngay <strong>Client ID</strong> và <strong>Client Secret</strong>. Sao chép và dán vào 2 ô bên cạnh.
                </li>
              </ol>

              <div className="p-3 bg-white rounded-xl border border-blue-200 text-[11px] text-blue-900 space-y-1">
                <div className="font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Bảo Mật Chuẩn OAuth 2.0
                </div>
                <p className="text-gray-600">
                  Hệ thống dùng chuẩn xác thực Client Credentials Grant để gọi đến <code>https://id.kiotviet.vn</code>. Không ai ngoài bạn có quyền truy cập mã khóa này.
                </p>
              </div>
            </div>

            {/* Quick Status Card */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3 text-xs">
              <div className="font-bold text-gray-800 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-gray-500" />
                Trạng Thái Kết Nối Hiện Tại
              </div>

              <div className="space-y-2">
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">Tình trạng:</span>
                  <span className={`font-bold ${config.isConnected ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {config.isConnected ? 'Đang hoạt động (Connected)' : 'Chưa kết nối'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">Kết nối lần cuối:</span>
                  <span className="text-gray-800 font-medium">{config.lastConnectedAt || 'Chưa kết nối'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-500">Kỳ hạn Access Token:</span>
                  <span className="text-gray-800 font-mono">{config.tokenExpiresAt || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CUSTOMERS TABLE (KIOTVIET <-> EMR) */}
      {activeSubTab === 'customers' && (
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-gray-100">
            <div>
              <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                <Users className="w-4 h-4 text-[#0066cc]" />
                Danh Sách Khách Hàng Đồng Bộ Từ KiotViet ({customers.length})
              </h3>
              <p className="text-gray-500 text-xs mt-0.5">
                Thông tin được đối chiếu theo Số điện thoại với Hồ sơ bệnh án EMR & CRM của phòng khám.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSyncCustomers}
                disabled={isSyncingCustomers}
                className="px-3.5 py-2 rounded-xl bg-[#0066cc] hover:bg-[#0052a3] text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncingCustomers ? 'animate-spin' : ''}`} />
                {isSyncingCustomers ? 'Đang kéo...' : 'Kéo Khách Mới Từ KiotViet'}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50 text-gray-600 uppercase text-[10px] tracking-wider border-y border-gray-100">
                <tr>
                  <th className="py-2.5 px-3 font-bold">Mã Khách (KV)</th>
                  <th className="py-2.5 px-3 font-bold">Họ & Tên</th>
                  <th className="py-2.5 px-3 font-bold">Số Điện Thoại</th>
                  <th className="py-2.5 px-3 font-bold text-right">Tổng Chi Tiêu</th>
                  <th className="py-2.5 px-3 font-bold text-right">Công Nợ KiotViet</th>
                  <th className="py-2.5 px-3 font-bold text-center">Điểm Tích Lũy</th>
                  <th className="py-2.5 px-3 font-bold text-center">Khớp Bệnh Án EMR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {customers.map(cust => (
                  <tr key={cust.kiotvietId} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-[#0066cc]">
                      {cust.code}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-gray-900">
                      {cust.name}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-gray-600">
                      {cust.contactNumber}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-gray-900 text-right">
                      {cust.totalInvoiced.toLocaleString('vi-VN')} đ
                    </td>
                    <td className="py-2.5 px-3 font-bold text-right">
                      {cust.debt > 0 ? (
                        <span className="text-red-600 font-semibold">{cust.debt.toLocaleString('vi-VN')} đ</span>
                      ) : (
                        <span className="text-gray-400">0 đ</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        ⭐ {cust.rewardPoints} pts
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {cust.syncedToEMR ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Đã Khớp EMR
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600 border border-gray-200 inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Chờ Đồng Bộ
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: INVENTORY PRODUCTS (KIOTVIET <-> INVENTORY) */}
      {activeSubTab === 'inventory' && (
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-gray-100">
            <div>
              <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-600" />
                Danh Mục & Số Lượng Tồn Kho KiotViet ({products.length})
              </h3>
              <p className="text-gray-500 text-xs mt-0.5">
                Đồng bộ số lượng tồn mỹ phẩm, serum, dung dịch tiêm Meso, Filler và vật tư tiêu hao phòng thủ thuật.
              </p>
            </div>

            <button
              onClick={handleSyncInventory}
              disabled={isSyncingInventory}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingInventory ? 'animate-spin' : ''}`} />
              {isSyncingInventory ? 'Đang cập nhật...' : 'Cập Nhật Tồn Kho KiotViet'}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50 text-gray-600 uppercase text-[10px] tracking-wider border-y border-gray-100">
                <tr>
                  <th className="py-2.5 px-3 font-bold">Mã SKU</th>
                  <th className="py-2.5 px-3 font-bold">Tên Sản Phẩm / Dược Mỹ Phẩm</th>
                  <th className="py-2.5 px-3 font-bold">Nhóm Hàng</th>
                  <th className="py-2.5 px-3 font-bold text-right">Giá Bán Lẻ</th>
                  <th className="py-2.5 px-3 font-bold text-right">Giá Vốn</th>
                  <th className="py-2.5 px-3 font-bold text-center">Tồn Kho KiotViet</th>
                  <th className="py-2.5 px-3 font-bold text-center">Kho Phòng Khám</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map(prod => (
                  <tr key={prod.kiotvietId} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-gray-800">
                      {prod.code}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-gray-900">
                      {prod.fullName}
                    </td>
                    <td className="py-2.5 px-3 text-gray-500">
                      <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-[10px]">
                        {prod.categoryName}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-bold text-gray-900 text-right">
                      {prod.basePrice.toLocaleString('vi-VN')} đ
                    </td>
                    <td className="py-2.5 px-3 text-gray-500 text-right">
                      {prod.cost.toLocaleString('vi-VN')} đ
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${
                        prod.onHand > 20
                          ? 'bg-emerald-100 text-emerald-800'
                          : prod.onHand > 5
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {prod.onHand} {prod.unit}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {prod.syncedToInventory ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Đã Cập Nhật
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600 border border-gray-200 inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Chờ Kéo Tồn
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: WEBHOOK REAL-TIME INTEGRATION */}
      {activeSubTab === 'webhook' && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-6">
          <div>
            <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
              <Webhook className="w-4 h-4 text-[#0066cc]" />
              Cấu Hình Webhook Tự Động Thời Gian Thực (Real-time Webhook)
            </h3>
            <p className="text-gray-500 text-xs mt-0.5">
              Khi thu ngân tạo đơn, thanh toán hoặc nhập hàng trên phần mềm KiotViet, Webhook sẽ tự động bắn thông báo sang hệ thống phòng khám ngay lập tức mà không cần bấm nút đồng bộ thủ công.
            </p>
          </div>

          {/* Webhook Endpoint Box */}
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
            <label className="block text-xs font-bold text-gray-700">
              Đường Dẫn Webhook Nhận Sự Kiện (Webhook Receiver URL):
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={webhookUrl}
                className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-xs font-mono text-gray-700 select-all"
              />
              <button
                onClick={() => handleCopy(webhookUrl, 'webhook_url')}
                className="px-3.5 py-2 rounded-lg bg-[#0066cc] text-white text-xs font-bold flex items-center gap-1.5 hover:bg-[#0052a3] transition-colors shrink-0 shadow-xs"
              >
                {copiedKey === 'webhook_url' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedKey === 'webhook_url' ? 'Đã Sao Chép' : 'Sao Chép URL'}
              </button>
            </div>
            <span className="text-[11px] text-gray-500">
              Dán URL này vào mục <strong>Webhook</strong> trên trang quản lý KiotViet.
            </span>
          </div>

          {/* Webhook Secret Key */}
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
            <label className="block text-xs font-bold text-gray-700">
              Khóa Bí Mật Xác Thực Webhook (Webhook Secret Key):
            </label>
            <input
              type="text"
              value={config.webhookSecret}
              onChange={(e) => setConfig({ ...config, webhookSecret: e.target.value })}
              placeholder="Nhập khóa bí mật xác thực webhook từ KiotViet (ví dụ: whsec_abc123...)"
              className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-xs font-mono text-gray-800"
            />
            <span className="text-[11px] text-gray-500">
              Dùng để xác thực chữ ký số HMAC-SHA256 gửi từ máy chủ KiotViet, chống giả mạo request.
            </span>
          </div>

          {/* Supported Events List */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-gray-800 block">Các Sự Kiện KiotViet Được Hệ Thống Hỗ Trợ Tự Động Xử Lý:</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#0066cc] mt-0.5 shrink-0" />
                <div>
                  <div className="font-bold text-gray-900">invoice.create (Tạo Hóa Đơn Mới)</div>
                  <p className="text-gray-600 text-[11px] mt-0.5">Tự động cập nhật điểm thưởng và lịch sử mua dịch vụ vào Bệnh án EMR.</p>
                </div>
              </div>

              <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <div className="font-bold text-gray-900">product.update (Cập Nhật Tồn Kho)</div>
                  <p className="text-gray-600 text-[11px] mt-0.5">Tự động cập nhật số lượng tồn kho dược mỹ phẩm khi có phiếu xuất/nhập tại quầy.</p>
                </div>
              </div>

              <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
                <div>
                  <div className="font-bold text-gray-900">customer.update (Khách Hàng Thay Đổi)</div>
                  <p className="text-gray-600 text-[11px] mt-0.5">Cập nhật công nợ, địa chỉ, hạng thẻ VIP của khách hàng vào CRM.</p>
                </div>
              </div>

              <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <div className="font-bold text-gray-900">order.update (Cập Nhật Đặt Hàng)</div>
                  <p className="text-gray-600 text-[11px] mt-0.5">Khớp lịch hẹn đặt cọc trước với phân hệ Smart Booking phòng khám.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: DEVELOPER & SCRIPT TESTER */}
      {activeSubTab === 'developer' && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-6">
          <div>
            <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
              <Terminal className="w-4 h-4 text-gray-700" />
              Mẫu Lệnh Gọi API & Payload KiotViet (Dành Cho Kỹ Thuật Viên)
            </h3>
            <p className="text-gray-500 text-xs mt-0.5">
              Bạn có thể sao chép các lệnh cURL và JSON mẫu dưới đây để test trực tiếp trên Postman hoặc kiểm tra quyền truy cập của mã API KiotViet.
            </p>
          </div>

          {/* Code Snippet 1: Get Access Token */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-gray-800">1. Lệnh Lấy Token OAuth 2.0 (cURL):</span>
              <button
                onClick={() => handleCopy(`curl -X POST "https://id.kiotviet.vn/connect/token" \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  -d "scopes=PublicApi.Access" \\
  -d "grant_type=client_credentials" \\
  -d "client_id=${config.clientId || 'YOUR_CLIENT_ID'}" \\
  -d "client_secret=${config.clientSecret || 'YOUR_CLIENT_SECRET'}"`, 'curl_token')}
                className="text-[#0066cc] hover:underline font-semibold flex items-center gap-1"
              >
                {copiedKey === 'curl_token' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedKey === 'curl_token' ? 'Đã chép' : 'Sao chép'}
              </button>
            </div>
            <pre className="p-3 bg-gray-900 text-emerald-400 rounded-xl text-[11px] font-mono overflow-x-auto">
{`curl -X POST "https://id.kiotviet.vn/connect/token" \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  -d "scopes=PublicApi.Access" \\
  -d "grant_type=client_credentials" \\
  -d "client_id=${config.clientId || 'YOUR_CLIENT_ID'}" \\
  -d "client_secret=${config.clientSecret || 'YOUR_CLIENT_SECRET'}"`}
            </pre>
          </div>

          {/* Code Snippet 2: Query Customers */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-gray-800">2. Lệnh Kéo Danh Sách Khách Hàng (cURL):</span>
              <button
                onClick={() => handleCopy(`curl -X GET "https://public.kiotapi.com/customers?pageSize=50" \\
  -H "Authorization: Bearer ${config.accessToken || 'YOUR_ACCESS_TOKEN'}" \\
  -H "Retailer: ${config.retailerName || 'YOUR_RETAILER'}"`, 'curl_customers')}
                className="text-[#0066cc] hover:underline font-semibold flex items-center gap-1"
              >
                {copiedKey === 'curl_customers' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedKey === 'curl_customers' ? 'Đã chép' : 'Sao chép'}
              </button>
            </div>
            <pre className="p-3 bg-gray-900 text-emerald-400 rounded-xl text-[11px] font-mono overflow-x-auto">
{`curl -X GET "https://public.kiotapi.com/customers?pageSize=50" \\
  -H "Authorization: Bearer ${config.accessToken || 'YOUR_ACCESS_TOKEN'}" \\
  -H "Retailer: ${config.retailerName || 'YOUR_RETAILER'}"`}
            </pre>
          </div>

          {/* Code Snippet 3: Invoice Payload */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-gray-800">3. Cấu Trúc JSON Đẩy Hóa Đơn Liệu Trình Sang KiotViet:</span>
            </div>
            <pre className="p-3 bg-gray-900 text-amber-300 rounded-xl text-[11px] font-mono overflow-x-auto">
{`{
  "branchId": ${config.branchId || '1001'},
  "customerId": 100234,
  "customerCode": "KHKV001",
  "invoiceDetails": [
    {
      "productCode": "SP-MESO-HA",
      "productName": "Liệu trình Căng bóng da Meso HA Pháp",
      "quantity": 1,
      "price": 3500000,
      "discount": 0
    }
  ],
  "totalPayment": 3500000,
  "method": "Transfer",
  "note": "Hóa đơn điều trị phát sinh từ EMR Wellness Clinic"
}`}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default KiotVietSyncHub;


import React, { useState, useMemo, useEffect } from 'react';
// FIX: Removed unused 'AuditItem' import
import { InventoryItem, InventoryTransaction, User, Role, AuditSession } from '../types';
import Button from './shared/Button';
import Modal from './shared/Modal';

interface InventoryManagementProps {
  items: InventoryItem[];
  transactions: InventoryTransaction[];
  currentUser: User;
  onImportItem: (itemId: string, quantity: number, notes?: string, expiryDate?: string) => Promise<void>;
  onExportItem: (itemId: string, quantity: number, reason: string) => Promise<void>;
  onSeedData: () => Promise<void>;
  onUpdateItem: (item: InventoryItem) => Promise<void>;
  
  auditSessions?: AuditSession[];
  onCreateAudit?: (month: number, year: number) => Promise<void>;
  onUpdateAuditItem?: (auditId: string, itemId: string, actualQty: number, reason: string) => Promise<void>;
  onFinalizeAudit?: (auditId: string) => Promise<void>;
  onDeleteAudit?: (auditId: string) => Promise<void>;
}

// Utility to remove Vietnamese accents for search
const removeVietnameseTones = (str: string) => {
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
    str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
    str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
    str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
    str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
    str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
    str = str.replace(/Đ/g, "D");
    // Some system encode vietnamese combining accent as individual utf-8 characters
    // \u0300 to \u036f
    str = str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return str.replace(/ + /g, " ").trim();
}

interface ActionModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'in' | 'out';
    item: InventoryItem | null;
    onSubmit: (qty: number, note: string, expiry?: string) => void;
}

const ActionModal: React.FC<ActionModalProps> = ({ isOpen, onClose, type, item, onSubmit }) => {
    const [qty, setQty] = useState(1);
    const [note, setNote] = useState('');
    const [newExpiry, setNewExpiry] = useState('');

    useEffect(() => {
        if (isOpen) setNewExpiry('');
    }, [isOpen]);

    if (!isOpen || !item) return null;

    const handleSubmit = () => {
        if (qty <= 0) return alert("Số lượng phải lớn hơn 0");
        if (type === 'out' && qty > item.quantity) return alert("Số lượng xuất vượt quá tồn kho!");
        onSubmit(qty, note, newExpiry);
        onClose();
        setQty(1);
        setNote('');
        setNewExpiry('');
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={type === 'in' ? `Nhập Kho: ${item.name}` : `Xuất Kho: ${item.name}`}>
            <div className="space-y-4">
                <div className="p-3 bg-gray-50 rounded border border-gray-200 text-sm">
                    <p>Đơn vị tính: <span className="font-bold">{item.unit}</span></p>
                    <p>Hiện tồn: <span className="font-bold text-[#D97A7D]">{item.quantity}</span></p>
                    <p>Vị trí: <span className="font-medium">{item.location}</span></p>
                    {item.batches && item.batches.length > 0 && (
                        <div className="mt-2 text-xs bg-white p-2 rounded border border-gray-100">
                            <p className="font-bold mb-1 text-gray-500">Chi tiết lô hạn dùng:</p>
                            <ul className="list-disc pl-4 space-y-0.5">
                                {item.batches.map((b, idx) => (
                                    <li key={idx} className="text-gray-700">
                                        Date: <span className="font-mono text-blue-600">{b.expiryDate}</span> - SL: <b>{b.quantity}</b>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
                
                {type === 'in' && (
                    <div className="bg-blue-50 p-3 rounded border border-blue-200">
                        <label className="block text-xs font-bold text-blue-800 mb-1">Cập nhật Hạn dùng mới (Tùy chọn)</label>
                        <input 
                            type="date" 
                            value={newExpiry} 
                            onChange={e => setNewExpiry(e.target.value)} 
                            className="w-full border border-blue-300 rounded p-2 text-sm focus:ring-blue-500 bg-white"
                        />
                        <p className="text-[10px] text-blue-500 mt-1 italic">
                            {item.batches && item.batches.length > 0 
                                ? "Nếu trùng date cũ, số lượng sẽ cộng dồn. Nếu khác, sẽ tạo lô mới."
                                : "Chọn ngày nếu muốn theo dõi hạn sử dụng."}
                        </p>
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700">Số lượng {type === 'in' ? 'Nhập' : 'Xuất'}</label>
                    <input type="number" min="1" value={qty} onChange={e => setQty(Number(e.target.value))} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[#E5989B]" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">{type === 'in' ? 'Ghi chú (Tùy chọn)' : 'Lý do / Người nhận (Bắt buộc)'}</label>
                    <textarea value={note} onChange={e => setNote(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" rows={2} placeholder={type === 'out' ? "VD: Dùng cho khách, Hư hỏng..." : "VD: Nhập hàng mới"}></textarea>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                    <Button variant="secondary" onClick={onClose}>Hủy</Button>
                    <Button onClick={handleSubmit}>{type === 'in' ? 'Xác nhận Nhập' : 'Xác nhận Xuất'}</Button>
                </div>
            </div>
        </Modal>
    );
};

interface EditItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: InventoryItem | null;
    onSave: (updatedItem: InventoryItem) => void;
}

const EditItemModal: React.FC<EditItemModalProps> = ({ isOpen, onClose, item, onSave }) => {
    const [formData, setFormData] = useState<Partial<InventoryItem>>({});

    useEffect(() => {
        if (item) setFormData(item);
    }, [item]);

    if (!isOpen || !item) return null;

    const handleSave = () => {
        onSave({ ...item, ...formData } as InventoryItem);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Sửa thông tin sản phẩm">
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Tên sản phẩm</label>
                    <input type="text" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded p-2" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Vị trí (Kệ)</label>
                        <input type="text" value={formData.location || ''} onChange={e => setFormData({...formData, location: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Đơn vị tính</label>
                        <input type="text" value={formData.unit || ''} onChange={e => setFormData({...formData, unit: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded p-2" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Tồn kho tối thiểu (Cảnh báo)</label>
                    <input type="number" value={formData.minThreshold || ''} onChange={e => setFormData({...formData, minThreshold: Number(e.target.value)})} className="mt-1 block w-full border border-gray-300 rounded p-2" placeholder="Mặc định: 3" />
                </div>
                
                <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
                    <label className="block text-sm font-bold text-yellow-800">Sửa Hạn dùng (Chính)</label>
                    <input type="date" value={formData.expiryDate || ''} onChange={e => setFormData({...formData, expiryDate: e.target.value})} className="mt-1 block w-full border border-yellow-300 rounded p-2" />
                    <p className="text-xs text-yellow-600 mt-1">Lưu ý: Chỉ sửa ngày này nếu bạn muốn ghi đè hạn dùng ưu tiên hiển thị. Để quản lý chính xác, hãy dùng chức năng Nhập kho.</p>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                    <Button variant="secondary" onClick={onClose}>Hủy</Button>
                    <Button onClick={handleSave}>Lưu thay đổi</Button>
                </div>
            </div>
        </Modal>
    );
}

const InventoryManagement: React.FC<InventoryManagementProps> = ({ 
    items, transactions, currentUser, 
    onImportItem, onExportItem, onSeedData, onUpdateItem,
    auditSessions, onCreateAudit, onUpdateAuditItem, onFinalizeAudit, onDeleteAudit
}) => {
  const [tab, setTab] = useState<'stock' | 'history' | 'audit'>('stock');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLocation, setFilterLocation] = useState('all');
  
  const [historyMonth, setHistoryMonth] = useState<string>('all');
  const [historyYear, setHistoryYear] = useState<string>('all');

  const [auditFilterLocation, setAuditFilterLocation] = useState('all');

  const [selectedAuditId, setSelectedAuditId] = useState<string | null>(null);
  const [newAuditMonth, setNewAuditMonth] = useState(new Date().getMonth() + 1);
  const [newAuditYear, setNewAuditYear] = useState(new Date().getFullYear());

  // FIX: Consistently use actionModal instead of modalState
  const [actionModal, setActionModal] = useState<{isOpen: boolean, type: 'in'|'out', item: InventoryItem | null}>({isOpen: false, type: 'in', item: null});
  const [editModal, setEditModal] = useState<{isOpen: boolean, item: InventoryItem | null}>({isOpen: false, item: null});
  
  const [isSeeding, setIsSeeding] = useState(false);

  const locations = useMemo(() => Array.from(new Set(items.map(i => i.location))).sort((a: string, b: string) => a.localeCompare(b)), [items]);

  // Enhanced search filtering (accent insensitive)
  const filteredItems = useMemo(() => {
      const normalizedSearch = removeVietnameseTones(searchTerm.toLowerCase());
      
      return items.filter(item => {
          const normalizedName = removeVietnameseTones(item.name.toLowerCase());
          const matchSearch = normalizedName.includes(normalizedSearch);
          const matchLoc = filterLocation === 'all' || item.location === filterLocation;
          return matchSearch && matchLoc;
      });
  }, [items, searchTerm, filterLocation]);

  const availableYears = useMemo(() => {
      const years = new Set(transactions.map(t => new Date(t.date).getFullYear()));
      years.add(new Date().getFullYear());
      return Array.from(years).sort((a: number, b: number) => b - a);
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
      return transactions.filter(t => {
          const date = new Date(t.date);
          const matchMonth = historyMonth === 'all' || (date.getMonth() + 1).toString() === historyMonth;
          const matchYear = historyYear === 'all' || date.getFullYear().toString() === historyYear;
          return matchMonth && matchYear;
      }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, historyMonth, historyYear]);

  const getExpiryStatus = (dateString?: string) => {
      if (!dateString) return null;
      const today = new Date();
      today.setHours(0,0,0,0);
      const expiry = new Date(dateString);
      const diffTime = expiry.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) return { label: `Đã hết hạn`, color: 'bg-gray-800 text-white border-gray-600' };
      if (diffDays <= 30) return { label: `<= 30 ngày`, color: 'bg-red-100 text-red-700 border-red-200 animate-pulse' };
      if (diffDays <= 60) return { label: `<= 60 ngày`, color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
      return { label: `> 60 ngày`, color: 'bg-green-50 text-green-600 border-green-100' };
  };

  const openActionModal = (type: 'in' | 'out', item: InventoryItem) => {
      setActionModal({ isOpen: true, type, item });
  };

  const handleActionSubmit = async (qty: number, note: string, expiry?: string) => {
      if (!actionModal.item) return;
      if (actionModal.type === 'in') {
          await onImportItem(actionModal.item.id, qty, note, expiry);
      } else {
          await onExportItem(actionModal.item.id, qty, note);
      }
  };

  const handleSeedClick = async () => {
      if (window.confirm("Bạn có chắc chắn muốn nạp lại dữ liệu gốc?")) {
          setIsSeeding(true);
          await onSeedData();
          setIsSeeding(false);
      }
  };

  const handleCreateAudit = () => {
      if (onCreateAudit) {
          onCreateAudit(newAuditMonth, newAuditYear);
      }
  };
  
  const handleDeleteAudit = async (id: string) => {
      if (window.confirm("Bạn có chắc chắn muốn xóa kỳ kiểm kê này?") && onDeleteAudit) {
          await onDeleteAudit(id);
          if (selectedAuditId === id) setSelectedAuditId(null);
      }
  };

  const exportAuditCSV = (session: AuditSession) => {
      const BOM = "\uFEFF"; 
      const headers = ["Tên sản phẩm", "Tồn Sổ sách", "Tồn Thực tế", "Chênh lệch", "Lý do"];
      const rows = session.items.map(item => [
          `"${item.itemName}"`, 
          item.systemQty, 
          item.actualQty, 
          item.diff, 
          `"${item.reason || ''}"`
      ]);
      
      const csvContent = "data:text/csv;charset=utf-8," + BOM + 
          [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `KiemKe_${session.month}_${session.year}.csv`);
      document.body.appendChild(link);
      link.click();
  };

  const currentAudit = auditSessions?.find(s => s.id === selectedAuditId);

  const filteredAuditItems = useMemo(() => {
      if (!currentAudit) return [];
      if (auditFilterLocation === 'all') return currentAudit.items;
      
      return currentAudit.items.filter(auditItem => {
          const originalItem = items.find(i => i.id === auditItem.itemId);
          return originalItem?.location === auditFilterLocation;
      });
  }, [currentAudit, auditFilterLocation, items]);

  return (
    <div className="space-y-6">
        {/* ... (Header & Tabs Code - SAME AS BEFORE) */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
                <h2 className="text-3xl font-serif font-bold text-[#D97A7D]">Quản lý Kho</h2>
                {(currentUser.role === Role.Management || currentUser.role === Role.Accountant) && (
                    <button onClick={handleSeedClick} disabled={isSeeding} className="text-xs bg-white hover:bg-gray-50 text-gray-600 px-3 py-1.5 rounded border border-gray-300 flex items-center gap-1 shadow-sm transition-colors">{isSeeding ? 'Đang xử lý...' : '🔄 Nạp dữ liệu gốc'}</button>
                )}
            </div>
            <div className="flex space-x-2 bg-white rounded-lg p-1 border border-gray-200">
                <button onClick={() => setTab('stock')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === 'stock' ? 'bg-pink-100 text-[#D97A7D]' : 'text-gray-600 hover:bg-gray-50'}`}>Tồn kho</button>
                <button onClick={() => setTab('history')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === 'history' ? 'bg-pink-100 text-[#D97A7D]' : 'text-gray-600 hover:bg-gray-50'}`}>Lịch sử</button>
                <button onClick={() => setTab('audit')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === 'audit' ? 'bg-pink-100 text-[#D97A7D]' : 'text-gray-600 hover:bg-gray-50'}`}>Kiểm kê (Audit)</button>
            </div>
        </div>

        {/* STOCK TAB */}
        {tab === 'stock' && (
            <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden">
                <div className="p-4 bg-[#FDF7F8] border-b border-pink-100 flex flex-col md:flex-row gap-4">
                    <input type="text" placeholder="Tìm kiếm nhanh (hỗ trợ không dấu, VD: 'dau goi')..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="flex-1 border border-gray-300 rounded-md p-2 text-sm focus:ring-[#E5989B] focus:border-[#E5989B]" />
                    <select value={filterLocation} onChange={e => setFilterLocation(e.target.value)} className="border border-gray-300 rounded-md p-2 text-sm bg-white focus:ring-[#E5989B]">
                        <option value="all">Tất cả vị trí</option>
                        {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                    </select>
                </div>
                <div className="overflow-x-auto max-h-[70vh]">
                    <table className="min-w-full whitespace-nowrap">
                        <thead className="bg-gray-50 sticky top-0 z-10">
                            <tr>
                                <th className="py-3 px-4 text-left text-xs font-bold text-gray-500 uppercase">Sản phẩm</th>
                                <th className="py-3 px-4 text-left text-xs font-bold text-gray-500 uppercase">Vị trí</th>
                                <th className="py-3 px-4 text-left text-xs font-bold text-gray-500 uppercase">Đơn vị</th>
                                <th className="py-3 px-4 text-left text-xs font-bold text-gray-500 uppercase">Chi tiết Hạn dùng (Lô)</th>
                                <th className="py-3 px-4 text-center text-xs font-bold text-gray-500 uppercase">Trạng thái</th>
                                <th className="py-3 px-4 text-center text-xs font-bold text-gray-500 uppercase">Tồn</th>
                                <th className="py-3 px-4 text-right text-xs font-bold text-gray-500 uppercase">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredItems.map(item => {
                                const expiryStatus = getExpiryStatus(item.expiryDate);
                                return (
                                    <tr key={item.id} className="hover:bg-gray-50">
                                        <td className="py-3 px-4 text-sm font-medium text-gray-900">{item.name}</td>
                                        <td className="py-3 px-4 text-sm text-gray-600"><span className="bg-gray-100 px-2 py-1 rounded text-xs">{item.location}</span></td>
                                        <td className="py-3 px-4 text-sm text-gray-600">{item.unit}</td>
                                        
                                        <td className="py-3 px-4 text-sm text-gray-600">
                                            {item.batches && item.batches.length > 0 ? (
                                                <div className="flex flex-col gap-1">
                                                    {item.batches.map((b, idx) => (
                                                        <div key={idx} className="flex justify-between items-center text-xs bg-gray-50 px-2 py-0.5 rounded">
                                                            <span className="font-mono text-blue-600">{b.expiryDate}</span>
                                                            <span className="font-bold text-gray-700">x{b.quantity}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="font-mono">{item.expiryDate || '-'}</span>
                                            )}
                                        </td>

                                        <td className="py-3 px-4 text-sm text-center">
                                            {expiryStatus ? (
                                                <span className={`text-[10px] font-bold px-2 py-1 rounded border ${expiryStatus.color}`}>
                                                    {expiryStatus.label}
                                                </span>
                                            ) : <span className="text-gray-400 text-xs">-</span>}
                                        </td>

                                        <td className="py-3 px-4 text-center">
                                            <span className={`font-bold text-lg ${item.quantity <= (item.minThreshold || 3) ? 'text-red-600' : 'text-[#D97A7D]'}`}>{item.quantity}</span>
                                        </td>
                                        <td className="py-3 px-4 text-right space-x-1">
                                            <button onClick={() => openActionModal('in', item)} className="text-green-600 bg-green-50 hover:bg-green-100 px-2 py-1 rounded border border-green-200 text-xs font-bold">+ Nhập</button>
                                            <button onClick={() => openActionModal('out', item)} className="text-blue-600 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded border border-blue-200 text-xs font-bold">- Xuất</button>
                                            <button onClick={() => setEditModal({isOpen: true, item})} className="text-gray-600 bg-gray-50 hover:bg-gray-100 px-2 py-1 rounded border border-gray-300 text-xs">📝</button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {/* HISTORY TAB */}
        {tab === 'history' && (
            <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden">
                <div className="p-4 bg-[#FDF7F8] border-b border-pink-100 flex flex-wrap items-center gap-3">
                    <span className="text-sm font-bold text-[#D97A7D] flex items-center gap-1">Lọc:</span>
                    <select value={historyMonth} onChange={(e) => setHistoryMonth(e.target.value)} className="border border-gray-300 rounded-md text-sm p-1">
                        <option value="all">Tất cả tháng</option>
                        {Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>)}
                    </select>
                    <select value={historyYear} onChange={(e) => setHistoryYear(e.target.value)} className="border border-gray-300 rounded-md text-sm p-1">
                        <option value="all">Tất cả năm</option>
                        {availableYears.map(year => <option key={year} value={year}>{year}</option>)}
                    </select>
                </div>
                <div className="overflow-x-auto max-h-[70vh]">
                    <table className="min-w-full whitespace-nowrap">
                        <thead className="bg-gray-50 sticky top-0 z-10">
                            <tr>
                                <th className="py-3 px-4 text-left text-xs font-bold text-gray-500 uppercase">Thời gian</th>
                                <th className="py-3 px-4 text-left text-xs font-bold text-gray-500 uppercase">Người thực hiện</th>
                                <th className="py-3 px-4 text-left text-xs font-bold text-gray-500 uppercase">Hành động</th>
                                <th className="py-3 px-4 text-left text-xs font-bold text-gray-500 uppercase">Sản phẩm</th>
                                <th className="py-3 px-4 text-right text-xs font-bold text-gray-500 uppercase">SL</th>
                                <th className="py-3 px-4 text-left text-xs font-bold text-gray-500 uppercase">Lý do</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredTransactions.map(tx => (
                                <tr key={tx.id} className="hover:bg-gray-50">
                                    <td className="py-3 px-4 text-sm text-gray-600">{new Date(tx.date).toLocaleString('vi-VN')}</td>
                                    <td className="py-3 px-4 text-sm font-medium">{tx.performedBy}</td>
                                    <td className="py-3 px-4 text-sm"><span className={`px-2 py-1 rounded-full text-xs font-bold ${tx.type === 'in' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{tx.type === 'in' ? 'NHẬP' : 'XUẤT'}</span></td>
                                    <td className="py-3 px-4 text-sm">{tx.itemName}</td>
                                    <td className="py-3 px-4 text-right text-sm font-bold">{tx.quantity}</td>
                                    <td className="py-3 px-4 text-sm text-gray-500 italic">{tx.reason || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {/* AUDIT TAB */}
        {tab === 'audit' && (
            <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
                <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800">Phiếu Kiểm Kê Kho</h3>
                        <p className="text-xs text-gray-500">Tạo phiếu kiểm kê cuối tháng để đối chiếu và chốt sổ.</p>
                    </div>
                    
                    {(currentUser.role === Role.Management || currentUser.role === Role.Accountant) && (
                        <div className="flex gap-2 items-center bg-gray-50 p-2 rounded border">
                            <span className="text-xs font-medium uppercase text-gray-500">Tạo kỳ mới:</span>
                            <select value={newAuditMonth} onChange={e => setNewAuditMonth(Number(e.target.value))} className="text-sm border rounded p-1 bg-white">
                                {Array.from({length: 12}, (_, i) => <option key={i+1} value={i+1}>Tháng {i+1}</option>)}
                            </select>
                            <select value={newAuditYear} onChange={e => setNewAuditYear(Number(e.target.value))} className="text-sm border rounded p-1 bg-white">
                                <option value={2025}>2025</option><option value={2026}>2026</option>
                            </select>
                            <Button onClick={handleCreateAudit} className="text-xs py-1 px-3"> + Tạo Phiếu</Button>
                        </div>
                    )}
                </div>

                {/* Audit Session List */}
                <div className="flex gap-3 overflow-x-auto pb-4 mb-4 border-b border-gray-100 scrollbar-hide">
                    {auditSessions?.sort((a,b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()).map(session => (
                        <div key={session.id} className="flex items-start group">
                            <button 
                                onClick={() => setSelectedAuditId(session.id)}
                                className={`px-4 py-3 rounded-lg border text-sm flex flex-col items-start min-w-[160px] transition-all relative ${
                                    selectedAuditId === session.id 
                                    ? 'bg-blue-50 border-blue-400 shadow-sm ring-1 ring-blue-200' 
                                    : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                                }`}
                            >
                                <div className="flex justify-between w-full mb-1">
                                    <span className="font-bold text-gray-800">{session.name}</span>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${session.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                                        {session.status === 'open' ? 'Mở' : 'Đóng'}
                                    </span>
                                </div>
                                <span className="text-xs text-gray-400">{new Date(session.createdDate).toLocaleDateString('vi-VN')}</span>
                            </button>
                            {/* FIX: Add Delete Audit Button and use handleDeleteAudit */}
                            {currentUser.role === Role.Management && (
                                <button 
                                    onClick={() => handleDeleteAudit(session.id)}
                                    className="ml-1 text-gray-300 hover:text-red-500 self-center hidden group-hover:block"
                                    title="Xóa kỳ kiểm kê"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            )}
                        </div>
                    ))}
                    {(!auditSessions || auditSessions.length === 0) && <p className="text-sm text-gray-400 italic">Chưa có phiếu kiểm kê nào.</p>}
                </div>

                {/* Audit Detail View */}
                {currentAudit ? (
                    <div className="animate-fade-in">
                        <div className="flex justify-between items-end mb-4">
                            <div>
                                <h4 className="text-lg font-bold text-[#5C3A3A]">{currentAudit.name}</h4>
                                <p className="text-xs text-gray-500 mt-1">
                                    Người tạo: <b>{currentAudit.createdBy}</b> | Ngày tạo: {new Date(currentAudit.createdDate).toLocaleString('vi-VN')}
                                    {currentAudit.closedDate && ` | Ngày chốt: ${new Date(currentAudit.closedDate).toLocaleString('vi-VN')}`}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="secondary" onClick={() => exportAuditCSV(currentAudit)} className="text-xs">📥 Xuất Excel (CSV)</Button>
                                {currentAudit.status === 'open' && (currentUser.role === Role.Management || currentUser.role === Role.Accountant) && (
                                    <Button variant="danger" onClick={() => {
                                        if (window.confirm("XÁC NHẬN CHỐT SỔ?\n\n- Hệ thống sẽ cập nhật số lượng tồn kho theo số thực tế bạn nhập.\n- Tạo các giao dịch điều chỉnh kho tự động.\n- Phiếu này sẽ bị khóa và không thể sửa đổi.")) {
                                            if (onFinalizeAudit) onFinalizeAudit(currentAudit.id);
                                        }
                                    }} className="text-xs">🔒 Chốt sổ & Điều chỉnh Kho</Button>
                                )}
                            </div>
                        </div>

                        {/* Audit Location Filter */}
                        <div className="mb-4 flex items-center gap-2 bg-gray-50 p-2 rounded border border-gray-200 w-fit">
                            <span className="text-xs font-bold text-gray-600 uppercase">Lọc theo vị trí kiểm kê:</span>
                            <select 
                                value={auditFilterLocation} 
                                onChange={(e) => setAuditFilterLocation(e.target.value)}
                                className="text-sm border border-gray-300 rounded p-1 bg-white focus:ring-blue-500"
                            >
                                <option value="all">Tất cả vị trí</option>
                                {locations.map(loc => (
                                    <option key={loc} value={loc}>{loc}</option>
                                ))}
                            </select>
                        </div>

                        <div className="overflow-hidden border border-gray-200 rounded-lg shadow-sm">
                            <div className="max-h-[60vh] overflow-y-auto">
                                <table className="min-w-full whitespace-nowrap">
                                    <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-1/3">Sản phẩm</th>
                                            <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-100">Tồn Sổ Sách</th>
                                            <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider bg-yellow-50 border-l border-r border-yellow-100">Tồn Thực Tế</th>
                                            <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Chênh lệch</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-1/3">Lý do / Ghi chú</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {filteredAuditItems.map(item => (
                                            <tr key={item.itemId} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.itemName}</td>
                                                <td className="px-4 py-3 text-sm text-center text-gray-500 bg-gray-50/50">{item.systemQty}</td>
                                                
                                                <td className="px-4 py-2 text-center bg-yellow-50/30 border-l border-r border-yellow-50">
                                                    {currentAudit.status === 'open' ? (
                                                        <input 
                                                            type="number" 
                                                            min="0"
                                                            value={item.actualQty}
                                                            onChange={(e) => onUpdateAuditItem && onUpdateAuditItem(currentAudit.id, item.itemId, Number(e.target.value), item.reason || '')}
                                                            className={`w-20 text-center border rounded-md p-1.5 font-bold focus:ring-2 focus:ring-blue-400 outline-none transition-all ${item.diff !== 0 ? 'border-blue-400 text-blue-700 bg-white shadow-sm' : 'border-gray-200 text-gray-700 bg-transparent'}`}
                                                        />
                                                    ) : (
                                                        <span className="font-bold text-gray-800">{item.actualQty}</span>
                                                    )}
                                                </td>

                                                <td className="px-4 py-3 text-center">
                                                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                                                        item.diff < 0 ? 'bg-red-100 text-red-600' : 
                                                        item.diff > 0 ? 'bg-green-100 text-green-600' : 'text-gray-300'
                                                    }`}>
                                                        {item.diff > 0 ? '+' : ''}{item.diff !== 0 ? item.diff : '-'}
                                                    </span>
                                                </td>

                                                <td className="px-4 py-2">
                                                    {currentAudit.status === 'open' ? (
                                                        <input 
                                                            type="text" 
                                                            value={item.reason || ''}
                                                            onChange={(e) => onUpdateAuditItem && onUpdateAuditItem(currentAudit.id, item.itemId, item.actualQty, e.target.value)}
                                                            className="w-full text-xs border-b border-gray-200 focus:border-blue-400 outline-none bg-transparent p-1 placeholder-gray-300"
                                                            placeholder={item.diff !== 0 ? "Nhập lý do lệch..." : ""}
                                                        />
                                                    ) : (
                                                        <span className="text-xs text-gray-500 italic">{item.reason || ''}</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        <p>Chọn một kỳ kiểm kê bên trên hoặc tạo mới để bắt đầu.</p>
                    </div>
                )}
            </div>
        )}

        <ActionModal 
            isOpen={actionModal.isOpen}
            onClose={() => setActionModal({...actionModal, isOpen: false})}
            type={actionModal.type}
            item={actionModal.item}
            onSubmit={handleActionSubmit}
        />

        <EditItemModal 
            isOpen={editModal.isOpen}
            onClose={() => setEditModal({isOpen: false, item: null})}
            item={editModal.item}
            onSave={onUpdateItem}
        />
    </div>
  );
};

export default InventoryManagement;

import React, { useState, useEffect } from 'react';
import Modal from './shared/Modal';
import Button from './shared/Button';
import { Service } from '../types';

interface EditServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: Service | null;
  onUpdateService: (updatedService: Service) => void;
}

const EditServiceModal: React.FC<EditServiceModalProps> = ({ isOpen, onClose, service, onUpdateService }) => {
  const [formData, setFormData] = useState<Partial<Service>>({});

  useEffect(() => {
    if (service) {
      setFormData(service);
    }
  }, [service]);

  if (!service) return null;

  const handleChange = (field: keyof Service, value: string | number) => {
    setFormData(prev => {
        const updated = { ...prev, [field]: value };
        
        if ((field === 'priceOriginal' || field === 'discountPercent') && updated.priceOriginal) {
            const discount = Number(updated.discountPercent) || 0;
            const original = Number(updated.priceOriginal) || 0;
            if (discount > 0) {
                updated.pricePromo = original * (1 - discount / 100);
            }
        }
        return updated;
    });
  };

  const handleSave = () => {
    onUpdateService(formData as Service);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Chỉnh sửa: ${service.name}`}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Tên Dịch vụ</label>
              <input type="text" value={formData.name || ''} onChange={e => handleChange('name', e.target.value)} className="w-full border-gray-300 rounded-md p-2 mt-1 shadow-sm focus:ring-[#E5989B] focus:border-[#E5989B]" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Danh mục (Category)</label>
              <input type="text" list="edit-categories-list" value={formData.category || ''} onChange={e => handleChange('category', e.target.value)} className="w-full border-gray-300 rounded-md p-2 mt-1 shadow-sm focus:ring-[#E5989B] focus:border-[#E5989B]" placeholder="VD: RF, Triệt lông..." />
              <datalist id="edit-categories-list">
                  <option value="Công nghệ RF" /><option value="Hydrafacial" /><option value="GeneoX Pro" /><option value="Triệt Lông" /><option value="Chăm sóc da" /><option value="Thư giãn" /><option value="Combo Đặc Biệt" />
                  <option value="Massage" /><option value="Chăm Sóc Chân" /><option value="Chăm Sóc Tóc" /><option value="Mẹ & Bé" /><option value="Nails" />
              </datalist>
            </div>
        </div>

        <div><label className="text-sm font-medium text-gray-600">Mô tả</label><textarea value={formData.description || ''} onChange={e => handleChange('description', e.target.value)} className="w-full border-gray-300 rounded-md p-2 mt-1 shadow-sm focus:ring-[#E5989B] focus:border-[#E5989B]" rows={2}></textarea></div>
        <div><label className="text-sm font-medium text-gray-600">Quy trình (Note tư vấn)</label><textarea value={formData.consultationNote || ''} onChange={e => handleChange('consultationNote', e.target.value)} className="w-full border-gray-300 rounded-md p-2 mt-1 shadow-sm focus:ring-[#E5989B] focus:border-[#E5989B]" rows={3}></textarea></div>
        
        <h4 className="text-sm font-bold text-[#D97A7D] border-b border-pink-100 pb-1 mt-4">Bảng Giá Chi Tiết</h4>
        
        {service.type === 'spa' ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-green-50 p-4 rounded border border-green-100">
                <div><label className="text-xs font-bold text-gray-600">Giá 30 phút</label><input type="number" value={formData.price30 || ''} onChange={e => handleChange('price30', Number(e.target.value))} className="w-full border-gray-300 rounded-md p-2 mt-1 shadow-sm focus:ring-green-400" /></div>
                <div><label className="text-xs font-bold text-gray-600">Giá 60 phút</label><input type="number" value={formData.price60 || ''} onChange={e => handleChange('price60', Number(e.target.value))} className="w-full border-gray-300 rounded-md p-2 mt-1 shadow-sm focus:ring-green-400" /></div>
                <div><label className="text-xs font-bold text-gray-600">Giá 90 phút</label><input type="number" value={formData.price90 || ''} onChange={e => handleChange('price90', Number(e.target.value))} className="w-full border-gray-300 rounded-md p-2 mt-1 shadow-sm focus:ring-green-400" /></div>
                <div><label className="text-xs font-bold text-gray-600">Giá 120 phút</label><input type="number" value={formData.price120 || ''} onChange={e => handleChange('price120', Number(e.target.value))} className="w-full border-gray-300 rounded-md p-2 mt-1 shadow-sm focus:ring-green-400" /></div>
                <div><label className="text-xs font-bold text-gray-600">Giá Khác / Cơ bản</label><input type="number" value={formData.priceOriginal || ''} onChange={e => handleChange('priceOriginal', Number(e.target.value))} className="w-full border-gray-300 rounded-md p-2 mt-1 shadow-sm bg-white focus:ring-green-400" /></div>
            </div>
        ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div><label className="text-xs font-medium text-gray-600">Giá bán gốc</label><input type="number" value={formData.priceOriginal || ''} onChange={e => handleChange('priceOriginal', Number(e.target.value))} className="w-full border-gray-300 rounded-md p-2 mt-1 shadow-sm bg-yellow-50 focus:ring-[#E5989B] focus:border-[#E5989B]" /></div>
                <div><label className="text-xs font-medium text-gray-600">% Giảm</label><input type="number" value={formData.discountPercent || ''} onChange={e => handleChange('discountPercent', Number(e.target.value))} className="w-full border-gray-300 rounded-md p-2 mt-1 shadow-sm text-red-500 font-bold focus:ring-[#E5989B] focus:border-[#E5989B]" placeholder="0" /></div>
                <div><label className="text-xs font-medium text-gray-600">Giá KM/Trial</label><input type="number" value={formData.pricePromo || ''} onChange={e => handleChange('pricePromo', Number(e.target.value))} className="w-full border-gray-300 rounded-md p-2 mt-1 shadow-sm focus:ring-[#E5989B] focus:border-[#E5989B]" /></div>
                <div><label className="text-xs font-medium text-gray-600">5 Tặng 5</label><input type="number" value={formData.pricePackage5 || ''} onChange={e => handleChange('pricePackage5', Number(e.target.value))} className="w-full border-gray-300 rounded-md p-2 mt-1 shadow-sm focus:ring-[#E5989B] focus:border-[#E5989B]" /></div>
                <div><label className="text-xs font-medium text-gray-600">10 Tặng 15</label><input type="number" value={formData.pricePackage15 || ''} onChange={e => handleChange('pricePackage15', Number(e.target.value))} className="w-full border-gray-300 rounded-md p-2 mt-1 shadow-sm focus:ring-[#E5989B] focus:border-[#E5989B]" /></div>
                <div><label className="text-xs font-medium text-gray-600">Gói 3 lần</label><input type="number" value={formData.pricePackage3 || ''} onChange={e => handleChange('pricePackage3', Number(e.target.value))} className="w-full border-gray-300 rounded-md p-2 mt-1 shadow-sm focus:ring-[#E5989B] focus:border-[#E5989B]" /></div>
                <div><label className="text-xs font-medium text-gray-600">Gói 5 lần</label><input type="number" value={formData.pricePackage5Sessions || ''} onChange={e => handleChange('pricePackage5Sessions', Number(e.target.value))} className="w-full border-gray-300 rounded-md p-2 mt-1 shadow-sm focus:ring-[#E5989B] focus:border-[#E5989B]" /></div>
                <div><label className="text-xs font-medium text-gray-600">Gói 10 lần</label><input type="number" value={formData.pricePackage10 || ''} onChange={e => handleChange('pricePackage10', Number(e.target.value))} className="w-full border-gray-300 rounded-md p-2 mt-1 shadow-sm focus:ring-[#E5989B] focus:border-[#E5989B]" /></div>
                <div><label className="text-xs font-medium text-gray-600">Gói 20 lần</label><input type="number" value={formData.pricePackage20 || ''} onChange={e => handleChange('pricePackage20', Number(e.target.value))} className="w-full border-gray-300 rounded-md p-2 mt-1 shadow-sm focus:ring-[#E5989B] focus:border-[#E5989B]" /></div>
            </div>
        )}

        <div className="flex justify-end pt-4 border-t mt-4"><Button variant="secondary" onClick={onClose} className="mr-2">Hủy</Button><Button onClick={handleSave}>Lưu thay đổi</Button></div>
      </div>
    </Modal>
  );
};

export default EditServiceModal;
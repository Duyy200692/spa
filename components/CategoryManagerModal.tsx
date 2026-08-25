import React, { useState } from 'react';
import Modal from './shared/Modal';
import Button from './shared/Button';

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: string[];
  onUpdateCategory: (oldName: string, newName: string) => void;
  onAddCategory?: (newCategory: string) => void;
}

const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({ isOpen, onClose, categories, onUpdateCategory, onAddCategory }) => {
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [tempName, setTempName] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');

  const startEditing = (category: string) => {
    setEditingCategory(category);
    setTempName(category);
  };

  const handleSave = () => {
    if (editingCategory && tempName.trim() && tempName !== editingCategory) {
      onUpdateCategory(editingCategory, tempName.trim());
    }
    setEditingCategory(null);
    setTempName('');
  };

  const handleCancel = () => {
    setEditingCategory(null);
    setTempName('');
  };

  const handleAdd = () => {
      if (newCategoryName.trim() && onAddCategory) {
          onAddCategory(newCategoryName.trim());
          setNewCategoryName('');
      }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Quản lý Danh mục Dịch vụ">
      <div className="space-y-4">
        
        {onAddCategory && (
            <div className="mb-6 p-4 bg-pink-50 rounded-lg border border-pink-100">
               <label className="block text-xs font-bold text-[#D97A7D] uppercase mb-2">Thêm danh mục mới</label>
               <div className="flex gap-2">
                  <input type="text" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="Nhập tên danh mục..." className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-[#D97A7D] focus:border-[#D97A7D]" />
                  <Button onClick={handleAdd} disabled={!newCategoryName.trim()}>Thêm</Button>
               </div>
               <p className="text-[10px] text-gray-500 mt-2 italic">Danh mục mới sẽ xuất hiện trong danh sách gợi ý khi bạn tạo dịch vụ.</p>
            </div>
        )}

        <div className="border-t border-gray-100 pt-2">
            <p className="text-sm text-gray-500 italic mb-2">Danh sách hiện có (Sửa tên):</p>
            <div className="border rounded-md divide-y divide-gray-100 max-h-[50vh] overflow-y-auto bg-white">
            {categories.map((category, index) => (
                <div key={index} className="p-3 flex justify-between items-center hover:bg-gray-50">
                {editingCategory === category ? (
                    <div className="flex w-full gap-2 items-center">
                    <input type="text" value={tempName} onChange={(e) => setTempName(e.target.value)} className="flex-1 border border-[#E5989B] rounded px-2 py-1 text-sm focus:outline-none" autoFocus />
                    <button onClick={handleSave} className="text-green-600 hover:text-green-700 p-1"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg></button>
                    <button onClick={handleCancel} className="text-red-500 hover:text-red-600 p-1"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg></button>
                    </div>
                ) : (
                    <>
                    <span className="text-gray-700 font-medium">{category}</span>
                    <button onClick={() => startEditing(category)} className="text-gray-400 hover:text-[#D97A7D] p-1 text-sm flex items-center gap-1 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg> Sửa</button>
                    </>
                )}
                </div>
            ))}
            {categories.length === 0 && <div className="p-4 text-center text-gray-400 text-sm">Chưa có danh mục nào.</div>}
            </div>
        </div>
        <div className="flex justify-end pt-2"><Button variant="secondary" onClick={onClose}>Đóng</Button></div>
      </div>
    </Modal>
  );
};

export default CategoryManagerModal;

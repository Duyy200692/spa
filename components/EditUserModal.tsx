import React, { useState, useEffect } from 'react';
import Modal from './shared/Modal';
import Button from './shared/Button';
import { User } from '../types';

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onUpdateName: (newName: string) => void;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ isOpen, onClose, currentUser, onUpdateName }) => {
  const [name, setName] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName(currentUser.name);
    }
  }, [isOpen, currentUser]);

  const handleSubmit = () => {
    if (name.trim()) {
      onUpdateName(name);
      onClose();
    } else {
      alert("Tên không được để trống!");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Đổi tên hiển thị">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Tên hiển thị mới</label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[#E5989B] focus:border-[#E5989B]" 
            placeholder="Nhập tên của bạn..."
            autoFocus
          />
          <p className="mt-1 text-xs text-gray-500">Tên này sẽ hiển thị trên góc phải và trong các đề xuất bạn tạo.</p>
        </div>
        <div className="flex justify-end pt-2">
          <Button variant="secondary" onClick={onClose} className="mr-2">Hủy</Button>
          <Button onClick={handleSubmit}>Lưu thay đổi</Button>
        </div>
      </div>
    </Modal>
  );
};

export default EditUserModal;

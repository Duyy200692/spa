
import React from 'react';
import { PromotionService } from '../types';
import Button from './shared/Button';

interface PromotionCardProps {
  title: string;
  subtitle: string;
  startDate: string;
  endDate: string;
  services: PromotionService[];
  onEdit?: () => void;
  onView?: () => void;
  onDelete?: () => void;
  canEdit?: boolean;
}

const formatCurrency = (value: number | undefined) => {
    if (value === undefined || value === null) return '0';
    return new Intl.NumberFormat('vi-VN').format(value);
};

// Helper to parse combo description into list items
const parseComboItems = (description: string): string[] => {
    if (!description) return [];
    // Remove "Bao gồm: " prefix if present
    let cleanDesc = description.replace(/^Bao gồm:\s*/i, '');
    if (cleanDesc.endsWith('.')) cleanDesc = cleanDesc.slice(0, -1);
    
    // Split by comma
    return cleanDesc.split(',').map(item => item.trim()).filter(Boolean);
};

const PromotionCard: React.FC<PromotionCardProps> = ({ title, subtitle, startDate, endDate, services, onEdit, onView, onDelete, canEdit }) => {
  
  const getTimeStatus = () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(0, 0, 0, 0);
      
      if (start > today) {
          const diffTime = start.getTime() - today.getTime();
          const daysToStart = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return { label: `📅 Sắp chạy (còn ${daysToStart} ngày)`, colorClass: 'bg-blue-100 text-blue-700 border-blue-200', borderColor: 'border-blue-200 ring-1 ring-blue-100' };
      }
      const diffTime = end.getTime() - today.getTime();
      const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (daysLeft >= 0 && daysLeft <= 3) {
          return { label: `⚠️ Sắp hết hạn: Còn ${daysLeft === 0 ? 'hôm nay' : `${daysLeft} ngày`}`, colorClass: 'bg-orange-100 text-orange-700 border-orange-200 animate-pulse', borderColor: 'border-orange-300 ring-1 ring-orange-200' };
      }
      return { label: '🔥 Đang chạy', colorClass: 'bg-green-100 text-green-700 border-green-200', borderColor: 'border-pink-100 hover:scale-[1.01]' };
  };

  const statusInfo = getTimeStatus();

  return (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden border transition-transform duration-300 relative group flex flex-col h-full ${statusInfo.borderColor}`}>
      <div className="p-5 md:p-6 bg-gradient-to-br from-[#FDF7F8] to-white flex justify-between items-start">
        <div className="flex-1 pr-2">
            <div className="flex flex-col gap-2 items-start">
                <h3 className="font-serif text-2xl md:text-3xl font-bold text-[#D97A7D] leading-tight">{title}</h3>
                <span className={`text-[10px] md:text-xs font-bold px-2 py-1 rounded-full border ${statusInfo.colorClass}`}>
                    {statusInfo.label}
                </span>
            </div>
            <p className="text-sm text-gray-500 mt-2">{subtitle}</p>
        </div>
        <div className="flex gap-2 flex-col sm:flex-row items-end sm:items-start mt-1 md:mt-0">
            {onView && (
                <Button variant="secondary" onClick={onView} className="text-xs px-3 py-1.5 whitespace-nowrap">
                    Xem chi tiết
                </Button>
            )}
            <div className="flex gap-1">
                {canEdit && (
                    <Button variant="secondary" onClick={onEdit} className="text-xs px-2 py-1.5">
                        Edit
                    </Button>
                )}
                {onDelete && (
                    <Button variant="danger" onClick={onDelete} className="text-xs px-2 py-1.5">
                        Xóa
                    </Button>
                )}
            </div>
        </div>
      </div>
      
      <div className="px-4 md:px-6 py-4 flex-grow">
        {/* Only show table header on large screens (Desktop) */}
        <div className="hidden lg:flex justify-between items-center text-xs font-bold text-gray-500 mb-3 px-4">
          <span className="w-5/12">SERVICE</span>
          <div className="w-7/12 flex justify-end gap-8 pr-4">
              <span className="w-24 text-right">FULL PRICE</span>
              <span className="w-32 text-right">DISCOUNT PRICE</span>
          </div>
        </div>
        
        <ul className="space-y-4 lg:space-y-2">
          {services.map(service => {
            const discountPercentage = (service.fullPrice || 0) > 0 ? Math.round((((service.fullPrice || 0) - (service.discountPrice || 0)) / (service.fullPrice || 0)) * 100) : 0;
            const comboItems = service.isCombo ? parseComboItems(service.description) : [];

            return (
              <li key={service.id} className="border-t border-dashed border-pink-200 py-3 flex flex-col lg:flex-row lg:items-start px-2 sm:px-4 hover:bg-pink-50/30 rounded-lg transition-colors">
                
                {/* Service Name Section - Bigger on Tablet */}
                <div className="w-full lg:w-5/12 mb-2 lg:mb-0 pr-2">
                  <p className="font-bold text-lg md:text-xl lg:text-sm text-[#5C3A3A] flex items-center flex-wrap gap-2">
                      {service.name} {service.selectedDuration ? `(${service.selectedDuration}')` : ''}
                      {service.isCombo && <span className="text-[10px] bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded border border-purple-200 shrink-0">COMBO</span>}
                  </p>
                  
                  {service.isCombo && comboItems.length > 0 ? (
                      <div className="mt-1 pl-2 border-l-2 border-purple-200">
                          <p className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">Bao gồm:</p>
                          <ul className="list-disc list-inside">
                              {comboItems.map((item, idx) => (
                                  <li key={idx} className="text-xs text-gray-600 leading-snug">{item}</li>
                              ))}
                          </ul>
                      </div>
                  ) : (
                      <p className="text-sm text-gray-500 line-clamp-2 mt-0.5">{service.description}</p>
                  )}
                </div>
                
                {/* Prices Section - Flexible on Tablet */}
                {/* On Tablet (md), we use flex-row with justify-between to ensure separation. */}
                <div className="w-full lg:w-7/12 mt-2 lg:mt-0 flex items-center lg:h-full">
                    <div className="w-full flex items-center justify-between lg:justify-end gap-4 lg:gap-8">
                        {/* Original Price */}
                        <div className="flex flex-col items-start lg:items-end">
                            <span className="lg:hidden text-[10px] text-gray-400 font-medium uppercase mb-0.5">Giá gốc</span>
                            <span className="text-gray-400 line-through text-sm md:text-lg lg:text-sm whitespace-nowrap">{formatCurrency(service.fullPrice)}</span>
                        </div>
                        
                        {/* Discount Price */}
                        <div className="flex flex-col items-end relative">
                           <span className="lg:hidden text-[10px] text-[#E5989B] font-medium uppercase mb-0.5">Giá KM</span>
                           <div className="flex items-center gap-2">
                               <span className="text-[#E5989B] font-bold text-2xl md:text-3xl lg:text-lg whitespace-nowrap">{formatCurrency(service.discountPrice)}</span>
                               {discountPercentage > 0 && (
                                 <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm shrink-0">
                                     -{discountPercentage}%
                                 </span>
                               )}
                           </div>
                        </div>
                    </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default PromotionCard;

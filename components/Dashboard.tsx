import React, { useState, useMemo } from 'react';
import { User, Service, Promotion, PromotionStatus, Role } from '../types';
import Button from './shared/Button';
import PromotionCard from './PromotionCard';
import ProposalForm from './ProposalForm';
import ProposalDetailView from './ProposalDetailView';

interface DashboardProps {
  loggedInUser: User;
  services: Service[];
  activePromotions: Promotion[];
  proposalPromotions: Promotion[];
  onAddPromotion: (promotion: Omit<Promotion, 'id'>) => void;
  onUpdatePromotion: (promotion: Promotion) => void;
  onDeletePromotion: (promotionId: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
    loggedInUser, 
    services, 
    activePromotions, 
    proposalPromotions, 
    onAddPromotion, 
    onUpdatePromotion,
    onDeletePromotion
}) => {
  const [isProposalFormOpen, setIsProposalFormOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<Promotion | null>(null);
  const [promotionToEdit, setPromotionToEdit] = useState<Promotion | null>(null);
  
  const [filterMonth, setFilterMonth] = useState<string>('all');
  const [filterYear, setFilterYear] = useState<string>('all');

  const availableYears = useMemo(() => {
      const years = new Set(proposalPromotions.map(p => new Date(p.startDate).getFullYear()));
      years.add(new Date().getFullYear());
      return Array.from(years).sort((a: number, b: number) => b - a);
  }, [proposalPromotions]);

  const filteredProposals = useMemo(() => {
      let filteredData = proposalPromotions;

      // RULE: Reception only sees Approved (past/history) items, NOT pending ones.
      if (loggedInUser.role === Role.Reception) {
          filteredData = filteredData.filter(p => p.status === PromotionStatus.Approved);
      }

      return filteredData.filter(p => {
          const date = new Date(p.startDate);
          const matchMonth = filterMonth === 'all' || (date.getMonth() + 1).toString() === filterMonth;
          const matchYear = filterYear === 'all' || date.getFullYear().toString() === filterYear;
          return matchMonth && matchYear;
      }).sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  }, [proposalPromotions, filterMonth, filterYear, loggedInUser.role]);

  const handleCreateProposal = (promotionData: Omit<Promotion, 'id'> | Promotion) => {
    if ('id' in promotionData) {
        onUpdatePromotion(promotionData as Promotion);
    } else {
        onAddPromotion(promotionData);
    }
    setIsProposalFormOpen(false);
    setPromotionToEdit(null);
  };

  const handleOpenEditForm = (promo: Promotion) => {
      setPromotionToEdit(promo);
      setIsProposalFormOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
      if (confirm(`Bạn có chắc chắn muốn xóa chương trình "${name}" không? Hành động này không thể hoàn tác.`)) {
          onDeletePromotion(id);
      }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case PromotionStatus.Approved: return <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-200">Approved</span>;
      case PromotionStatus.PendingApproval: return <span className="px-2 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 border border-yellow-200">Pending Approval</span>;
      case PromotionStatus.PendingDesign: return <span className="px-2 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">Pending Design</span>;
      case PromotionStatus.Rejected: return <span className="px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">Rejected</span>;
      default: return <span className="px-2 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-800">{status}</span>;
    }
  };
  
  const getTimeStatusBadge = (startDate: string, endDate: string) => {
      const now = new Date();
      const start = new Date(startDate);
      const end = new Date(endDate);
      now.setHours(0,0,0,0);
      start.setHours(0,0,0,0);
      end.setHours(0,0,0,0);

      if (start > now) {
          const diff = Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          return <span className="ml-2 text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100">📅 Sắp chạy (còn {diff} ngày)</span>;
      }
      if (end >= now) {
          const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          if (diff <= 3) {
              return <span className="ml-2 text-[10px] bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded border border-orange-100 animate-pulse">⚠️ Sắp hết hạn</span>;
          }
          return <span className="ml-2 text-[10px] bg-green-50 text-green-600 px-1.5 py-0.5 rounded border border-green-100">🔥 Đang chạy</span>;
      }
      return <span className="ml-2 text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">Đã kết thúc</span>;
  };

  return (
    <div className="space-y-8">
      {/* Active Promotions Section */}
      <section>
        <h2 className="text-3xl font-serif font-bold text-[#D97A7D] mb-6 border-b border-pink-100 pb-2">Active Promotions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {activePromotions.map(promo => (
            <PromotionCard
              key={promo.id}
              title={promo.name}
              subtitle={`Valid from ${promo.startDate} to ${promo.endDate}`}
              startDate={promo.startDate}
              endDate={promo.endDate}
              services={promo.services}
              canEdit={loggedInUser.role === Role.Management}
              onEdit={() => handleOpenEditForm(promo)}
              onView={() => setSelectedProposal(promo)}
              onDelete={loggedInUser.role === Role.Management ? () => handleDelete(promo.id, promo.name) : undefined}
            />
          ))}
          {activePromotions.length === 0 && (
            <div className="col-span-full text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
              <p className="text-gray-400 font-light">Chưa có chương trình khuyến mãi nào đang chạy.</p>
            </div>
          )}
        </div>
      </section>

      {/* Proposals Section */}
      <section>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
            <div className="w-full lg:w-auto">
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#D97A7D] mb-1">Promotion Proposals History</h2>
                <p className="text-xs text-gray-500">Danh sách tất cả các đề xuất khuyến mãi</p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
               <div className="flex items-center gap-2 bg-white p-1.5 rounded border border-gray-200 shadow-sm overflow-x-auto min-w-0">
                    <span className="text-xs text-[#D97A7D] font-bold pl-1 flex gap-1 whitespace-nowrap items-center shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg> 
                        <span className="hidden sm:inline">Lọc theo thời gian:</span>
                        <span className="sm:hidden">Lọc:</span>
                    </span>
                    <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="text-xs border-none focus:ring-0 text-gray-600 bg-transparent cursor-pointer hover:text-[#D97A7D] pr-6">
                        <option value="all">Tất cả tháng</option>
                        {Array.from({length: 12}, (_, i) => <option key={i+1} value={i+1}>Tháng {i+1}</option>)}
                    </select>
                    <div className="w-px h-4 bg-gray-300 shrink-0"></div>
                    <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} className="text-xs border-none focus:ring-0 text-gray-600 bg-transparent cursor-pointer hover:text-[#D97A7D] pr-6">
                         <option value="all">Tất cả năm</option>
                         {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
               </div>

               {(loggedInUser.role === Role.Product || loggedInUser.role === Role.Management) && (
                <Button onClick={() => { setIsProposalFormOpen(true); setPromotionToEdit(null); }} className="whitespace-nowrap flex-shrink-0">
                    + <span className="hidden sm:inline">Propose </span>New Promotion
                </Button>
               )}
            </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full whitespace-nowrap">
              <thead className="bg-[#FDF7F8]">
                <tr>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tháng</th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                  <th className="py-3 px-6 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="py-3 px-6 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProposals.map(promo => {
                    const isOwner = promo.proposerId === loggedInUser.id;
                    const isManagement = loggedInUser.role === Role.Management;
                    
                    const canEdit = isManagement || (loggedInUser.role === Role.Product && isOwner && promo.status === PromotionStatus.PendingDesign);
                    const canDelete = isManagement || (loggedInUser.role === Role.Product && isOwner && promo.status === PromotionStatus.PendingDesign);
                    
                    const startDate = new Date(promo.startDate);
                    const monthYear = `Tháng ${startDate.getMonth() + 1} ${startDate.getFullYear()}`;

                    return (
                      <tr key={promo.id} className="hover:bg-gray-50">
                        <td className="py-4 px-6 text-sm font-medium text-gray-900">
                            {promo.name}
                            {getTimeStatusBadge(promo.startDate, promo.endDate)}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-500">{monthYear}</td>
                        <td className="py-4 px-6 text-sm text-gray-500">{promo.startDate} - {promo.endDate}</td>
                        <td className="py-4 px-6 text-center">{getStatusBadge(promo.status)}</td>
                        <td className="py-4 px-6 text-right space-x-2">
                          {canEdit && (
                            <Button variant="secondary" onClick={() => handleOpenEditForm(promo)}>Edit</Button>
                          )}
                          <Button variant="secondary" onClick={() => setSelectedProposal(promo)}>View</Button>
                          {canDelete && (
                            <Button variant="danger" onClick={() => handleDelete(promo.id, promo.name)}>Xóa</Button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                  {filteredProposals.length === 0 && (
                      <tr><td colSpan={5} className="text-center py-8 text-gray-400">Không tìm thấy đề xuất nào phù hợp.</td></tr>
                  )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {isProposalFormOpen && (
        <ProposalForm
          isOpen={isProposalFormOpen}
          onClose={() => { setIsProposalFormOpen(false); setPromotionToEdit(null); }}
          services={services}
          currentUser={loggedInUser}
          onSubmit={handleCreateProposal}
          promotionToEdit={promotionToEdit}
        />
      )}

      {selectedProposal && (
        <ProposalDetailView
          isOpen={!!selectedProposal}
          onClose={() => setSelectedProposal(null)}
          proposal={selectedProposal}
          currentUser={loggedInUser}
          onUpdate={onUpdatePromotion}
        />
      )}
    </div>
  );
};

export default Dashboard;
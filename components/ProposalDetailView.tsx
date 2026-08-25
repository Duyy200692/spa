
import React, { useState } from 'react';
import Modal from './shared/Modal';
import Button from './shared/Button';
import { Promotion, User, Role, PromotionStatus } from '../types';

interface ProposalDetailViewProps {
  isOpen: boolean;
  onClose: () => void;
  proposal: Promotion;
  currentUser: User;
  onUpdate: (promotion: Promotion) => void;
}

const DetailSection: React.FC<{title: string; children: React.ReactNode}> = ({ title, children }) => (
    <div className="py-3 border-b border-gray-200">
        <h4 className="text-sm font-semibold text-gray-500 mb-1">{title}</h4>
        <div className="text-md text-gray-800">{children}</div>
    </div>
);

// Helper to parse combo description into list items (duplicated for standalone usage in modal)
const parseComboItems = (description: string): string[] => {
    if (!description) return [];
    let cleanDesc = description.replace(/^Bao gồm:\s*/i, '');
    if (cleanDesc.endsWith('.')) cleanDesc = cleanDesc.slice(0, -1);
    return cleanDesc.split(',').map(item => item.trim()).filter(Boolean);
};

const ProposalDetailView: React.FC<ProposalDetailViewProps> = ({ isOpen, onClose, proposal, currentUser, onUpdate }) => {
  const [marketingNotes, setMarketingNotes] = useState(proposal.marketingNotes || '');
  const [designUrl, setDesignUrl] = useState(proposal.designUrl || '');
  const [managementNotes, setManagementNotes] = useState(proposal.managementNotes || '');

  const handleMarketingSubmit = () => {
    const updatedProposal = { ...proposal, marketingNotes, designUrl, status: PromotionStatus.PendingApproval };
    onUpdate(updatedProposal);
    onClose();
  };
  
  const handleApproval = (isApproved: boolean) => {
    const newStatus = isApproved ? PromotionStatus.Approved : PromotionStatus.Rejected;
    const updatedProposal = { ...proposal, managementNotes, status: newStatus };
    onUpdate(updatedProposal);
    onClose();
  };

  const isMarketing = currentUser.role === Role.Marketing;
  const isManagement = currentUser.role === Role.Management;
  const canMarketingAct = isMarketing && proposal.status === PromotionStatus.PendingDesign;
  const canManagementAct = isManagement && proposal.status === PromotionStatus.PendingApproval;
  
  const consultationSteps = proposal.consultationNote || proposal.services
    .filter(s => s.consultationNote)
    .map(s => `• ${s.name}${s.selectedDuration ? ` (${s.selectedDuration}')` : ''}:\n${s.consultationNote}`)
    .join('\n\n');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Proposal: ${proposal.name}`}>
      <div className="space-y-4">
        <DetailSection title="Status"><span className="font-bold">{proposal.status}</span></DetailSection>
        <DetailSection title="Promotion Dates">{proposal.startDate} to {proposal.endDate}</DetailSection>
        
        <DetailSection title="Services & Pricing">
            <ul className="list-disc pl-5 space-y-2">
                {proposal.services.map(s => (
                    <li key={s.id}>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                            <span className="font-medium">
                                {s.name} {s.selectedDuration ? `(${s.selectedDuration}')` : ''}
                                {s.isCombo && <span className="ml-1 text-[10px] bg-purple-100 text-purple-600 px-1 rounded">COMBO</span>}
                            </span>
                            <span className="hidden sm:inline text-gray-400 mx-2">-</span>
                            <div>
                                <span className="line-through text-gray-400 text-sm">{s.fullPrice.toLocaleString()}</span> 
                                <span className="mx-1">&rarr;</span> 
                                <span className="font-bold text-[#E5989B] text-lg">{s.discountPrice.toLocaleString()}</span>
                            </div>
                        </div>
                        {s.isCombo && (
                            <div className="mt-1 ml-2 text-xs bg-gray-50 p-2 rounded border border-gray-100 text-gray-600">
                                <strong>Chi tiết Combo:</strong>
                                <ul className="list-circle list-inside ml-2 mt-1">
                                    {parseComboItems(s.description).map((item, idx) => (
                                        <li key={idx}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        </DetailSection>

        {consultationSteps && (
            <div className="py-3 border-b border-gray-200">
                <h4 className="text-sm font-semibold text-blue-600 mb-1">Quy trình & Các bước thực hiện (Consultation Steps)</h4>
                <div className="text-sm text-gray-700 whitespace-pre-wrap bg-blue-50 p-3 rounded-md border border-blue-100">
                    {consultationSteps}
                </div>
            </div>
        )}

        {proposal.salesNotes && <DetailSection title="Notes from Sales">{proposal.salesNotes}</DetailSection>}
        
        {/* Marketing Section */}
        { (proposal.marketingNotes || canMarketingAct) && (
            <div className="py-3 border-b border-gray-200">
                <h4 className="text-sm font-semibold text-gray-500 mb-1">Marketing Notes</h4>
                {canMarketingAct ? (
                    <textarea value={marketingNotes} onChange={e => setMarketingNotes(e.target.value)} rows={2} className="w-full border border-gray-300 rounded-md shadow-sm p-2"></textarea>
                ) : ( <p>{proposal.marketingNotes}</p> )}
            </div>
        )}
        { (proposal.designUrl || canMarketingAct) && (
            <div className="py-3 border-b border-gray-200">
                 <h4 className="text-sm font-semibold text-gray-500 mb-1">Design Preview</h4>
                {canMarketingAct ? (
                    <>
                        <label className="text-xs">Image URL:</label>
                        <input type="text" placeholder="https://picsum.photos/1080/1920" value={designUrl} onChange={e => setDesignUrl(e.target.value)} className="w-full border border-gray-300 rounded-md shadow-sm p-2 mt-1"/>
                    </>
                ) : (
                    proposal.designUrl ? <img src={proposal.designUrl} alt="Design" className="mt-2 rounded-lg max-h-60 w-auto" /> : <p>No design uploaded.</p>
                )}
            </div>
        )}
        
        {/* Management Section */}
        { (proposal.managementNotes || canManagementAct) && (
            <div className="py-3 border-b border-gray-200">
                <h4 className="text-sm font-semibold text-gray-500 mb-1">Notes for Approval/Rejection</h4>
                {canManagementAct ? (
                    <textarea value={managementNotes} onChange={e => setManagementNotes(e.target.value)} rows={2} className="w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="Provide feedback if rejecting..."></textarea>
                ) : ( <p>{proposal.managementNotes}</p> )}
            </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end pt-4 space-x-2">
            <Button variant="secondary" onClick={onClose}>Close</Button>
            {canMarketingAct && <Button onClick={handleMarketingSubmit}>Submit for Approval</Button>}
            {canManagementAct && (
                <>
                    <Button variant="danger" onClick={() => handleApproval(false)}>Reject</Button>
                    <Button onClick={() => handleApproval(true)}>Approve</Button>
                </>
            )}
        </div>
      </div>
    </Modal>
  );
};

export default ProposalDetailView;

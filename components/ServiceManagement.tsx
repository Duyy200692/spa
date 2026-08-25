import React, { useState, useMemo, useEffect } from 'react';
import { Service, ServiceType, User, Role } from '../types';
import Button from './shared/Button';
import EditServiceModal from './EditServiceModal';
import CategoryManagerModal from './CategoryManagerModal';

interface ServiceManagementProps {
    services: Service[];
    onAddService: (service: Omit<Service, 'id'>) => void;
    onUpdateService: (service: Service) => void;
    onDeleteService: (serviceId: string) => void;
    onSeedSpaServices?: () => Promise<void>;
    currentUser: User;
}

const formatCurrency = (value: number | undefined) => {
    if (!value) return '-';
    return new Intl.NumberFormat('vi-VN').format(value);
};

const ServiceManagement: React.FC<ServiceManagementProps> = ({ services, onAddService, onUpdateService, onDeleteService, onSeedSpaServices, currentUser }) => {
    const [activeTab, setActiveTab] = useState<ServiceType>('single');
    const [serviceToEdit, setServiceToEdit] = useState<Service | null>(null);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    
    // Permission Check: Only Management and Product teams can edit services
    const canEdit = currentUser.role === Role.Management || currentUser.role === Role.Product;

    const [extraCategories, setExtraCategories] = useState<string[]>(() => {
        try {
            const saved = localStorage.getItem('extraCategories');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem('extraCategories', JSON.stringify(extraCategories));
    }, [extraCategories]);
    
    const [newService, setNewService] = useState<Omit<Service, 'id'>>({
        name: '',
        category: '',
        description: '',
        type: 'single',
        consultationNote: '',
        priceOriginal: 0,
        discountPercent: 0,
        pricePromo: 0,
        pricePackage5: 0,
        pricePackage15: 0,
        pricePackage3: 0,
        pricePackage5Sessions: 0,
        pricePackage10: 0,
        pricePackage20: 0,
        price30: 0,
        price60: 0,
        price90: 0,
        price120: 0,
    });

    const existingCategories = useMemo(() => {
        const serviceCats = services.map(s => s.category).filter(Boolean) as string[];
        const allCats = new Set([...serviceCats, ...extraCategories]);
        return Array.from(allCats).sort();
    }, [services, extraCategories]);

    const groupedServices = useMemo(() => {
        const filtered = services.filter(s => s.type === activeTab);
        const groups: Record<string, Service[]> = {};
        
        filtered.forEach(service => {
            const cat = service.category || 'Khác';
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push(service);
        });
        
        return groups;
    }, [services, activeTab]);
    
    const handleNewServiceChange = (field: keyof Omit<Service, 'id'>, value: string | number) => {
        setNewService(prev => {
            const updated = { ...prev, [field]: value };
            if ((field === 'priceOriginal' || field === 'discountPercent') && updated.priceOriginal > 0) {
                const discount = Number(updated.discountPercent) || 0;
                if (discount > 0) {
                    updated.pricePromo = updated.priceOriginal * (1 - discount / 100);
                }
            }
            return updated;
        });
    };

    const handleAddNewService = (e: React.FormEvent) => {
        e.preventDefault();
        // Allow adding if either priceOriginal > 0 OR it's a Spa service with any time price > 0
        const hasPrice = newService.priceOriginal > 0 || (activeTab === 'spa' && (
            (newService.price30 || 0) > 0 || (newService.price60 || 0) > 0 || 
            (newService.price90 || 0) > 0 || (newService.price120 || 0) > 0
        ));

        if (newService.name && hasPrice) {
            onAddService({ ...newService, type: activeTab });
            setNewService({ 
                name: '', category: '', description: '', type: activeTab, consultationNote: '',
                priceOriginal: 0, discountPercent: 0, pricePromo: 0, pricePackage5: 0, pricePackage15: 0,
                pricePackage3: 0, pricePackage5Sessions: 0, pricePackage10: 0, pricePackage20: 0,
                price30: 0, price60: 0, price90: 0, price120: 0,
            });
        } else {
            alert("Vui lòng nhập tên và ít nhất một mức giá hợp lệ.");
        }
    };
    
    const handleModalSave = (updatedService: Service) => {
        onUpdateService(updatedService);
        setServiceToEdit(null);
    };

    const handleUpdateCategoryName = (oldName: string, newName: string) => {
        services.filter(s => s.category === oldName).forEach(service => {
            onUpdateService({ ...service, category: newName });
        });
        if (extraCategories.includes(oldName)) {
            setExtraCategories(prev => prev.map(c => c === oldName ? newName : c));
        }
    };

    const handleAddCategory = (newCategory: string) => {
        if (!existingCategories.includes(newCategory)) {
            setExtraCategories(prev => [...prev, newCategory]);
        }
    };

    const handleSeedClick = async () => {
        if (!onSeedSpaServices) return;
        if (window.confirm("Bạn có chắc muốn nạp dữ liệu menu Spa mẫu vào hệ thống không? Dữ liệu trùng tên sẽ được bỏ qua.")) {
            await onSeedSpaServices();
        }
    };

    const TabButton = ({ type, label }: { type: ServiceType; label: string }) => (
        <button
            onClick={() => { setActiveTab(type); setNewService(prev => ({...prev, type: type})); }}
            className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
                activeTab === type ? 'border-[#E5989B] text-[#D97A7D]' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
        >
            {label}
        </button>
    );

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-serif font-bold text-[#D97A7D] mb-4">Service & Pricelist Management</h2>
                
                <div className="flex border-b border-gray-200 mb-6 flex-wrap gap-2">
                    <TabButton type="single" label="Gói Lẻ (Single)" />
                    <TabButton type="combo" label="Gói Combo" />
                    <TabButton type="spa" label="Spa & Massage" />
                </div>

                {activeTab === 'spa' && onSeedSpaServices && canEdit && (
                    <div className="mb-4 flex justify-end">
                        <Button onClick={handleSeedClick} className="text-xs bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 shadow-sm">
                            ⚡ Nạp Menu Spa Mẫu
                        </Button>
                    </div>
                )}

                {/* FIX: Added max-height and sticky header logic */}
                <div className="bg-white rounded-lg shadow-md border border-gray-100 flex flex-col max-h-[75vh]">
                    <div className="overflow-auto flex-grow">
                        <table className="min-w-full whitespace-nowrap border-collapse">
                            <thead className="bg-[#FDF7F8] sticky top-0 z-20 shadow-sm">
                                <tr>
                                    {/* Sticky Left Column Header: Reduced width for tablet visibility */}
                                    <th className="py-3 px-2 md:px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 top-0 z-30 bg-[#FDF7F8] min-w-[100px] max-w-[100px] md:min-w-[130px] md:max-w-[130px] lg:min-w-[250px] lg:max-w-[250px] border-r border-gray-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Tên Dịch vụ</th>
                                    
                                    {activeTab === 'spa' ? (
                                        <>
                                            <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-green-50/80 backdrop-blur-sm">30 Phút</th>
                                            <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-green-50/80 backdrop-blur-sm">60 Phút</th>
                                            <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-green-50/80 backdrop-blur-sm">90 Phút</th>
                                            <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-green-50/80 backdrop-blur-sm">120 Phút</th>
                                            <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-yellow-50/80 backdrop-blur-sm">Giá Khác / Cơ bản</th>
                                        </>
                                    ) : (
                                        <>
                                            <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider bg-yellow-50/80 backdrop-blur-sm">Giá bán gốc</th>
                                            <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-red-50/80 backdrop-blur-sm">Giảm</th>
                                            <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Giá KM/Trial</th>
                                            <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider bg-pink-50/80 backdrop-blur-sm">5 Tặng 5</th>
                                            <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider bg-pink-50/80 backdrop-blur-sm">10 Tặng 15</th>
                                            <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider bg-blue-50/80 backdrop-blur-sm">Gói 3 lần</th>
                                            <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider bg-blue-50/80 backdrop-blur-sm">Gói 5 lần</th>
                                            <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider bg-blue-50/80 backdrop-blur-sm">Gói 10 lần</th>
                                            <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider bg-blue-50/80 backdrop-blur-sm">Gói 20 lần</th>
                                        </>
                                    )}
                                    
                                    {/* Sticky Right Column Header */}
                                    <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider sticky right-0 top-0 z-30 bg-[#FDF7F8] border-l border-gray-200 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)]">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {Object.entries(groupedServices).length > 0 ? (
                                    Object.entries(groupedServices).map(([category, items]: [string, Service[]]) => (
                                        <React.Fragment key={category}>
                                            <tr className="bg-pink-50/50">
                                                <td colSpan={activeTab === 'spa' ? 7 : 11} className="py-2 px-2 md:px-4 font-bold text-[#D97A7D] text-sm uppercase tracking-wide sticky left-0 z-10 bg-pink-50">
                                                    {category}
                                                </td>
                                            </tr>
                                            {items.map(service => (
                                                <tr key={service.id} className="hover:bg-gray-50 transition-colors group">
                                                    {/* Sticky Left Column Cell: Reduced width and padding */}
                                                    <td className="py-3 px-2 md:px-4 sticky left-0 bg-white group-hover:bg-gray-50 z-10 border-r border-gray-100 min-w-[100px] max-w-[100px] md:min-w-[130px] md:max-w-[130px] lg:min-w-[250px] lg:max-w-[250px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                                                        <p className="font-medium text-gray-900 whitespace-normal text-xs md:text-sm leading-snug break-words">{service.name}</p>
                                                        {/* Description hidden on screens smaller than lg to save width */}
                                                        <p className="text-[10px] text-gray-500 whitespace-normal line-clamp-2 mt-1 hidden lg:block">{service.description}</p>
                                                        {service.consultationNote && <p className="text-[10px] text-blue-500 mt-1 truncate hidden lg:block">📝 {service.consultationNote}</p>}
                                                    </td>
                                                    
                                                    {activeTab === 'spa' ? (
                                                        <>
                                                            <td className="py-4 px-4 text-sm text-gray-700 text-center">{formatCurrency(service.price30)}</td>
                                                            <td className="py-4 px-4 text-sm text-gray-700 text-center">{formatCurrency(service.price60)}</td>
                                                            <td className="py-4 px-4 text-sm text-gray-700 text-center">{formatCurrency(service.price90)}</td>
                                                            <td className="py-4 px-4 text-sm text-gray-700 text-center">{formatCurrency(service.price120)}</td>
                                                            <td className="py-4 px-4 text-sm text-gray-500 text-center bg-yellow-50/20">{service.priceOriginal > 0 ? formatCurrency(service.priceOriginal) : '-'}</td>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <td className="py-4 px-4 text-sm text-gray-700 text-right bg-yellow-50/20 font-medium">{formatCurrency(service.priceOriginal || 0)}</td>
                                                            <td className="py-4 px-4 text-sm text-red-500 font-bold text-center bg-red-50/10">{service.discountPercent ? `${service.discountPercent}%` : '-'}</td>
                                                            <td className="py-4 px-4 text-sm text-gray-700 text-right">{formatCurrency(service.pricePromo || 0)}</td>
                                                            <td className="py-4 px-4 text-sm text-gray-700 text-right bg-pink-50/10">{formatCurrency(service.pricePackage5 || 0)}</td>
                                                            <td className="py-4 px-4 text-sm text-gray-700 text-right bg-pink-50/10">{formatCurrency(service.pricePackage15 || 0)}</td>
                                                            
                                                            <td className="py-4 px-4 text-sm text-gray-700 text-right bg-blue-50/10">{formatCurrency(service.pricePackage3 || 0)}</td>
                                                            <td className="py-4 px-4 text-sm text-gray-700 text-right bg-blue-50/10">{formatCurrency(service.pricePackage5Sessions || 0)}</td>
                                                            <td className="py-4 px-4 text-sm text-gray-700 text-right bg-blue-50/10">{formatCurrency(service.pricePackage10 || 0)}</td>
                                                            <td className="py-4 px-4 text-sm text-gray-700 text-right bg-blue-50/10">{formatCurrency(service.pricePackage20 || 0)}</td>
                                                        </>
                                                    )}
                                                    
                                                    {/* Sticky Right Column Cell */}
                                                    <td className="py-4 px-4 text-center sticky right-0 bg-white group-hover:bg-gray-50 z-10 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.05)] border-l border-gray-100">
                                                        {canEdit && (
                                                            <div className="flex flex-col gap-1 items-center">
                                                                <Button variant="secondary" onClick={() => setServiceToEdit(service)} className="text-[10px] py-1 px-2 w-full">Sửa</Button>
                                                                <Button variant="danger" onClick={() => window.confirm(`Xóa dịch vụ ${service.name}?`) && onDeleteService(service.id)} className="text-[10px] py-1 px-2 w-full">Xóa</Button>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </React.Fragment>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={activeTab === 'spa' ? 7 : 11} className="text-center py-8 text-gray-400">Chưa có dữ liệu cho mục này.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            {/* Form Thêm Mới */}
            {canEdit && (
                <div className="bg-white p-6 rounded-lg shadow-md border border-pink-100 relative">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-serif font-bold text-[#D97A7D]">
                            Thêm Mới ({activeTab === 'single' ? 'Gói Lẻ' : activeTab === 'combo' ? 'Gói Combo' : 'Spa & Massage'})
                        </h3>
                        
                        <button 
                            onClick={() => setIsCategoryModalOpen(true)}
                            className="text-xs flex items-center gap-1 text-gray-500 hover:text-[#D97A7D] bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200 transition-colors"
                            type="button"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Quản lý Danh mục
                        </button>
                    </div>

                    <form onSubmit={handleAddNewService} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
                        <div className="lg:col-span-2">
                            <label className="block text-xs font-medium text-gray-700">Tên Dịch vụ</label>
                            <input type="text" value={newService.name} onChange={e => handleNewServiceChange('name', e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm" required placeholder="Nhập tên..."/>
                        </div>
                        
                        <div className="lg:col-span-2">
                            <label className="block text-xs font-medium text-gray-700">Danh mục (Category)</label>
                            <input 
                                type="text" 
                                list="categories-list"
                                value={newService.category || ''} 
                                onChange={e => handleNewServiceChange('category', e.target.value)} 
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm" 
                                placeholder="VD: RF, Hydrafacial..."
                            />
                            <datalist id="categories-list">
                                {existingCategories.map((cat, idx) => (
                                    <option key={idx} value={cat} />
                                ))}
                            </datalist>
                        </div>
                        
                        {activeTab !== 'spa' && (
                            <>
                                <div className="lg:col-span-2">
                                    <label className="block text-xs font-medium text-gray-700 bg-yellow-50 w-fit px-1 rounded">Giá bán gốc</label>
                                    <input type="number" value={newService.priceOriginal || ''} onChange={e => handleNewServiceChange('priceOriginal', Number(e.target.value))} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm bg-yellow-50/30"/>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700">% Giảm</label>
                                    <input type="number" value={newService.discountPercent || ''} onChange={e => handleNewServiceChange('discountPercent', Number(e.target.value))} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm text-red-500 font-bold" placeholder="0"/>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700">Giá KM/Trial</label>
                                    <input type="number" value={newService.pricePromo || ''} onChange={e => handleNewServiceChange('pricePromo', Number(e.target.value))} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"/>
                                </div>
                                
                                <div>
                                    <label className="block text-xs font-medium text-gray-700">5 Tặng 5</label>
                                    <input type="number" value={newService.pricePackage5 || ''} onChange={e => handleNewServiceChange('pricePackage5', Number(e.target.value))} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"/>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700">10 Tặng 15</label>
                                    <input type="number" value={newService.pricePackage15 || ''} onChange={e => handleNewServiceChange('pricePackage15', Number(e.target.value))} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"/>
                                </div>
                                
                                {/* New Package Inputs */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-700">Gói 3 lần</label>
                                    <input type="number" value={newService.pricePackage3 || ''} onChange={e => handleNewServiceChange('pricePackage3', Number(e.target.value))} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"/>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700">Gói 5 lần</label>
                                    <input type="number" value={newService.pricePackage5Sessions || ''} onChange={e => handleNewServiceChange('pricePackage5Sessions', Number(e.target.value))} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"/>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700">Gói 10 lần</label>
                                    <input type="number" value={newService.pricePackage10 || ''} onChange={e => handleNewServiceChange('pricePackage10', Number(e.target.value))} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"/>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700">Gói 20 lần</label>
                                    <input type="number" value={newService.pricePackage20 || ''} onChange={e => handleNewServiceChange('pricePackage20', Number(e.target.value))} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"/>
                                </div>
                            </>
                        )}

                        {activeTab === 'spa' && (
                            <>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700">Giá 30 phút</label>
                                    <input type="number" value={newService.price30 || ''} onChange={e => handleNewServiceChange('price30', Number(e.target.value))} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"/>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700">Giá 60 phút</label>
                                    <input type="number" value={newService.price60 || ''} onChange={e => handleNewServiceChange('price60', Number(e.target.value))} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"/>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700">Giá 90 phút</label>
                                    <input type="number" value={newService.price90 || ''} onChange={e => handleNewServiceChange('price90', Number(e.target.value))} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"/>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700">Giá 120 phút</label>
                                    <input type="number" value={newService.price120 || ''} onChange={e => handleNewServiceChange('price120', Number(e.target.value))} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"/>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700">Giá Khác / Cơ bản</label>
                                    <input type="number" value={newService.priceOriginal || ''} onChange={e => handleNewServiceChange('priceOriginal', Number(e.target.value))} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm bg-yellow-50/30"/>
                                </div>
                            </>
                        )}

                        <div className="md:col-span-2 lg:col-span-4">
                            <label className="block text-xs font-medium text-gray-700">Mô tả</label>
                            <textarea value={newService.description} onChange={e => handleNewServiceChange('description', e.target.value)} rows={2} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm" placeholder="Mô tả ngắn..."></textarea>
                        </div>
                        <div className="md:col-span-2 lg:col-span-2">
                            <label className="block text-xs font-medium text-gray-700">Quy trình (Dành cho Lễ tân/MKT)</label>
                            <textarea value={newService.consultationNote || ''} onChange={e => handleNewServiceChange('consultationNote', e.target.value)} rows={2} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm" placeholder="VD: Bước 1 tẩy trang..."></textarea>
                        </div>
                        <div className="lg:col-span-6 flex justify-end">
                            <Button type="submit" className="w-full sm:w-auto px-8 py-3 text-sm">Thêm Mới Dịch Vụ</Button>
                        </div>
                    </form>
                </div>
            )}
            
            <EditServiceModal
                isOpen={!!serviceToEdit}
                onClose={() => setServiceToEdit(null)}
                service={serviceToEdit}
                onUpdateService={handleModalSave}
            />

            <CategoryManagerModal 
                isOpen={isCategoryModalOpen}
                onClose={() => setIsCategoryModalOpen(false)}
                categories={existingCategories}
                onUpdateCategory={handleUpdateCategoryName}
                onAddCategory={handleAddCategory}
            />
        </div>
    );
};

export default ServiceManagement;
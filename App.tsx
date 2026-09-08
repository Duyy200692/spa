import React, { useState, useMemo, useEffect } from 'react';
import { collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc, getDocs, writeBatch, query, addDoc, where } from 'firebase/firestore';
import { db } from './firebaseConfig';

import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ServiceManagement from './components/ServiceManagement';
import LoginScreen from './components/LoginScreen';
import UserManagement from './components/UserManagement';
import LandingPage from './components/LandingPage';
import InventoryManagement from './components/InventoryManagement';
import HRManagement from './components/HRManagement';
import { User, Promotion, Service, Role, InventoryItem, InventoryTransaction, AuditSession, AuditItem, StaffMember, AttendanceRecord, TechnicianTour, PayrollRecord } from './types';
import { 
  USERS as DEFAULT_USERS, 
  SERVICES as DEFAULT_SERVICES, 
  PROMOTIONS as DEFAULT_PROMOTIONS, 
  INVENTORY_ITEMS as DEFAULT_INVENTORY, 
  SPA_SERVICES_DATA 
} from './constants';
import { 
  getInitialAppData, 
  persistAppData, 
  testFirestoreConnection, 
  handleFirestoreError, 
  OperationType 
} from './storageService';
import { getInitialHRData, persistHRData } from './hrService';

type View = 'dashboard' | 'services' | 'users' | 'inventory' | 'hr';

const App: React.FC = () => {
  const [showLanding, setShowLanding] = useState(true);

  // Initialize with local cache or fallback constants
  const initialData = useMemo(() => getInitialAppData(), []);
  const [users, setUsers] = useState<User[]>(initialData.users);
  const [services, setServices] = useState<Service[]>(initialData.services);
  const [promotions, setPromotions] = useState<Promotion[]>(initialData.promotions);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(initialData.inventory);
  const [inventoryTransactions, setInventoryTransactions] = useState<InventoryTransaction[]>(initialData.transactions);
  const [auditSessions, setAuditSessions] = useState<AuditSession[]>(initialData.audits);
  
  // HR & Payroll Data States
  const initialHR = useMemo(() => getInitialHRData(), []);
  const [staffList, setStaffList] = useState<StaffMember[]>(initialHR.staff);
  const [attendanceList, setAttendanceList] = useState<AttendanceRecord[]>(initialHR.attendance);
  const [toursList, setToursList] = useState<TechnicianTour[]>(initialHR.tours);
  const [payrollList, setPayrollList] = useState<PayrollRecord[]>(initialHR.payroll);

  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [view, setView] = useState<View>('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [loginError, setLoginError] = useState<string>('');
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(false);

  // Helper for batch seeding Spa Services
  const seedSpaServicesBatch = async () => {
    try {
      if (!isCloudConnected) {
        // Local mode batch seed
        const existingNames = new Set(services.map(s => s.name));
        const newServices: Service[] = [];
        SPA_SERVICES_DATA.forEach(service => {
          if (service.name && !existingNames.has(service.name)) {
            const newId = `service-spa-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
            newServices.push({
              id: newId,
              name: service.name || 'Unnamed',
              description: service.description || '',
              category: service.category || 'Spa',
              type: 'spa',
              consultationNote: service.consultationNote || '',
              priceOriginal: service.priceOriginal || 0,
              discountPercent: 0,
              pricePromo: 0,
              pricePackage5: 0,
              pricePackage15: 0,
              pricePackage3: 0,
              pricePackage5Sessions: 0,
              pricePackage10: 0,
              pricePackage20: 0,
              price30: service.price30 || 0,
              price60: service.price60 || 0,
              price90: service.price90 || 0,
              price120: service.price120 || 0,
            });
          }
        });
        if (newServices.length > 0) {
          const updated = [...services, ...newServices].sort((a, b) => (a.category || '').localeCompare(b.category || ''));
          setServices(updated);
          persistAppData({ services: updated });
        }
        return newServices.length;
      }

      // Cloud mode batch seed
      const servicesSnap = await getDocs(collection(db, 'services'));
      const existingNames = new Set(servicesSnap.docs.map(doc => doc.data().name));
      const batch = writeBatch(db);
      let count = 0;

      SPA_SERVICES_DATA.forEach(service => {
        if (service.name && !existingNames.has(service.name)) {
          const newId = `service-spa-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
          const docRef = doc(db, 'services', newId);
          const fullService = {
            id: newId,
            name: service.name || 'Unnamed',
            description: service.description || '',
            category: service.category || 'Spa',
            type: 'spa',
            consultationNote: service.consultationNote || '',
            priceOriginal: service.priceOriginal || 0,
            discountPercent: 0,
            pricePromo: 0,
            pricePackage5: 0,
            pricePackage15: 0,
            pricePackage3: 0,
            pricePackage5Sessions: 0,
            pricePackage10: 0,
            pricePackage20: 0,
            price30: service.price30 || 0,
            price60: service.price60 || 0,
            price90: service.price90 || 0,
            price120: service.price120 || 0,
          };
          batch.set(docRef, fullService);
          count++;
        }
      });

      if (count > 0) {
        await batch.commit();
      }
      return count;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'services');
      return 0;
    }
  };

  // --- Real-time Listeners and Startup Initialization ---
  useEffect(() => {
    let isMounted = true;
    let unsubscribes: (() => void)[] = [];

    const seedCloudData = async () => {
      try {
        // 1. Check & Seed Users
        const usersSnap = await getDocs(collection(db, 'users'));
        if (usersSnap.empty) {
          const batch = writeBatch(db);
          DEFAULT_USERS.forEach(user => {
            const docRef = doc(db, 'users', user.id);
            batch.set(docRef, user);
          });
          await batch.commit();
        }

        // 2. Check & Seed Services
        const servicesSnap = await getDocs(collection(db, 'services'));
        if (servicesSnap.empty) {
          const batch = writeBatch(db);
          DEFAULT_SERVICES.forEach(service => {
            const docRef = doc(db, 'services', service.id);
            batch.set(docRef, service);
          });
          await batch.commit();
        }

        // 2b. Check & Seed Spa Services
        const spaQuery = query(collection(db, 'services'), where('type', '==', 'spa'));
        const spaSnap = await getDocs(spaQuery);
        if (spaSnap.size < 10) {
          await seedSpaServicesBatch();
        }

        // 3. Check & Seed Promotions
        const promotionsSnap = await getDocs(collection(db, 'promotions'));
        if (promotionsSnap.empty) {
          const batch = writeBatch(db);
          DEFAULT_PROMOTIONS.forEach(promo => {
            const docRef = doc(db, 'promotions', promo.id);
            batch.set(docRef, promo);
          });
          await batch.commit();
        }

        // 4. Check & Seed Inventory
        const inventorySnap = await getDocs(collection(db, 'inventory'));
        if (inventorySnap.empty) {
          const batch = writeBatch(db);
          DEFAULT_INVENTORY.forEach(item => {
            const docRef = doc(db, 'inventory', item.id);
            const copy = { ...item };
            if (copy.expiryDate) {
              copy.batches = [{ expiryDate: copy.expiryDate, quantity: copy.quantity }];
            }
            batch.set(docRef, copy);
          });
          await batch.commit();
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, 'seed');
      }
    };

    const setupListeners = (): (() => void)[] => {
      const cleanups: (() => void)[] = [];

      try {
        const unsubUsers = onSnapshot(
          query(collection(db, 'users')),
          (snapshot) => {
            const loadedUsers = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as User));
            if (loadedUsers.length > 0) {
              setUsers(loadedUsers);
              persistAppData({ users: loadedUsers });
            }
          },
          (error) => handleFirestoreError(error, OperationType.GET, 'users')
        );
        cleanups.push(unsubUsers);

        const unsubServices = onSnapshot(
          query(collection(db, 'services')),
          (snapshot) => {
            const loadedServices = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Service));
            if (loadedServices.length > 0) {
              const sorted = loadedServices.sort((a, b) => (a.category || '').localeCompare(b.category || ''));
              setServices(sorted);
              persistAppData({ services: sorted });
            }
          },
          (error) => handleFirestoreError(error, OperationType.GET, 'services')
        );
        cleanups.push(unsubServices);

        const unsubPromotions = onSnapshot(
          query(collection(db, 'promotions')),
          (snapshot) => {
            const loadedPromotions = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Promotion));
            setPromotions(loadedPromotions);
            persistAppData({ promotions: loadedPromotions });
          },
          (error) => handleFirestoreError(error, OperationType.GET, 'promotions')
        );
        cleanups.push(unsubPromotions);

        const unsubInventory = onSnapshot(
          query(collection(db, 'inventory')),
          (snapshot) => {
            const loadedItems = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as InventoryItem));
            setInventoryItems(loadedItems);
            persistAppData({ inventory: loadedItems });
          },
          (error) => handleFirestoreError(error, OperationType.GET, 'inventory')
        );
        cleanups.push(unsubInventory);

        const unsubTransactions = onSnapshot(
          query(collection(db, 'inventory_transactions')),
          (snapshot) => {
            const loadedTrans = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as InventoryTransaction));
            setInventoryTransactions(loadedTrans);
            persistAppData({ transactions: loadedTrans });
          },
          (error) => handleFirestoreError(error, OperationType.GET, 'inventory_transactions')
        );
        cleanups.push(unsubTransactions);

        const unsubAudits = onSnapshot(
          query(collection(db, 'audit_sessions')),
          (snapshot) => {
            const loadedAudits = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as AuditSession));
            setAuditSessions(loadedAudits);
            persistAppData({ audits: loadedAudits });
          },
          (error) => handleFirestoreError(error, OperationType.GET, 'audit_sessions')
        );
        cleanups.push(unsubAudits);
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, 'listeners');
      }

      return cleanups;
    };

    const initialize = async () => {
      const connection = await testFirestoreConnection();
      if (!isMounted) return;

      if (!connection.accessible) {
        // Permissions not granted on remote project; run gracefully in local persistence mode
        setIsCloudConnected(false);
        setIsLoading(false);
        return;
      }

      setIsCloudConnected(true);
      await seedCloudData();
      if (!isMounted) return;

      unsubscribes = setupListeners();
      setIsLoading(false);
    };

    initialize();

    return () => {
      isMounted = false;
      unsubscribes.forEach(unsub => unsub && unsub());
    };
  }, []);

  const activePromotions = useMemo(() => {
    const now = new Date();
    return promotions.filter(p => 
      p.status === 'Approved' && 
      new Date(p.endDate) >= now
    ).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }, [promotions]);

  const proposalPromotions = useMemo(() => {
    const now = new Date();
    return promotions.filter(p => 
      p.status !== 'Approved' || 
      new Date(p.endDate) < now
    );
  }, [promotions]);

  const handleLogin = (username: string, password: string) => {
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
    if (user) {
      setLoggedInUser(user);
      setLoginError('');
      if (user.role === Role.Accountant) {
        setView('inventory');
      } else {
        setView('dashboard');
      }
    } else {
      setLoginError('Tên đăng nhập hoặc mật khẩu không đúng.');
    }
  };

  const handleLogout = () => {
    setLoggedInUser(null);
    setView('dashboard');
    setShowLanding(true);
  };
  
  const handleEnterSystem = () => {
    setShowLanding(false);
  };

  const handleSwitchRole = (newRole: Role) => {
    const targetUser = users.find(u => u.role === newRole);
    if (targetUser) {
      setLoggedInUser(targetUser);
      if (newRole === Role.Accountant) {
        setView('inventory');
      } else if (newRole !== Role.Management && view === 'users') {
        setView('dashboard');
      }
    } else {
      alert(`Không tìm thấy tài khoản cho vai trò ${newRole}`);
    }
  };

  const handleUpdateUserName = async (newName: string) => {
    if (loggedInUser) {
      const updatedUser = { ...loggedInUser, name: newName };
      setLoggedInUser(updatedUser);
      const updatedUsers = users.map(u => u.id === loggedInUser.id ? updatedUser : u);
      setUsers(updatedUsers);
      persistAppData({ users: updatedUsers });

      if (isCloudConnected) {
        try {
          const userRef = doc(db, 'users', loggedInUser.id);
          await updateDoc(userRef, { name: newName });
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, `users/${loggedInUser.id}`);
        }
      }
    }
  };

  // --- Actions ---
  const addUser = async (newUserData: Omit<User, 'id'>) => {
    const newId = `user-${Date.now()}`;
    const newUser: User = { ...newUserData, id: newId };
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    persistAppData({ users: updatedUsers });

    if (isCloudConnected) {
      try {
        const userRef = doc(db, 'users', newId);
        await setDoc(userRef, newUser);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `users/${newId}`);
      }
    }
  };
  
  const deleteUser = async (userId: string) => {
    const updatedUsers = users.filter(u => u.id !== userId);
    setUsers(updatedUsers);
    persistAppData({ users: updatedUsers });

    if (isCloudConnected) {
      try {
        await deleteDoc(doc(db, 'users', userId));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `users/${userId}`);
      }
    }
  };

  const addPromotion = async (newPromotionData: Omit<Promotion, 'id'>) => {
    const newId = `promo-${Date.now()}`;
    const newPromo: Promotion = { ...newPromotionData, id: newId };
    const updatedPromos = [newPromo, ...promotions];
    setPromotions(updatedPromos);
    persistAppData({ promotions: updatedPromos });

    if (isCloudConnected) {
      try {
        const promoRef = doc(db, 'promotions', newId);
        await setDoc(promoRef, newPromo);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `promotions/${newId}`);
      }
    }
  };
  
  const updatePromotion = async (updatedPromotion: Promotion) => {
    const updatedPromos = promotions.map(p => p.id === updatedPromotion.id ? updatedPromotion : p);
    setPromotions(updatedPromos);
    persistAppData({ promotions: updatedPromos });

    if (isCloudConnected) {
      try {
        const promoRef = doc(db, 'promotions', updatedPromotion.id);
        await updateDoc(promoRef, { ...updatedPromotion } as any);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `promotions/${updatedPromotion.id}`);
      }
    }
  };

  const deletePromotion = async (promotionId: string) => {
    const updatedPromos = promotions.filter(p => p.id !== promotionId);
    setPromotions(updatedPromos);
    persistAppData({ promotions: updatedPromos });

    if (isCloudConnected) {
      try {
        await deleteDoc(doc(db, 'promotions', promotionId));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `promotions/${promotionId}`);
      }
    }
  };

  const addService = async (newServiceData: Omit<Service, 'id'>) => {
    const newId = `service-${Date.now()}`;
    const newService: Service = { ...newServiceData, id: newId };
    const updatedServices = [...services, newService].sort((a, b) => (a.category || '').localeCompare(b.category || ''));
    setServices(updatedServices);
    persistAppData({ services: updatedServices });

    if (isCloudConnected) {
      try {
        const serviceRef = doc(db, 'services', newId);
        await setDoc(serviceRef, newService);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `services/${newId}`);
      }
    }
  };
  
  const updateService = async (updatedService: Service) => {
    const updatedServices = services.map(s => s.id === updatedService.id ? updatedService : s);
    setServices(updatedServices);
    persistAppData({ services: updatedServices });

    if (isCloudConnected) {
      try {
        const serviceRef = doc(db, 'services', updatedService.id);
        await updateDoc(serviceRef, { ...updatedService } as any);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `services/${updatedService.id}`);
      }
    }
  };
  
  const deleteService = async (serviceId: string) => {
    const updatedServices = services.filter(s => s.id !== serviceId);
    setServices(updatedServices);
    persistAppData({ services: updatedServices });

    if (isCloudConnected) {
      try {
        await deleteDoc(doc(db, 'services', serviceId));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `services/${serviceId}`);
      }
    }
  };
  
  const handleForceSeedSpa = async () => {
    try {
      const count = await seedSpaServicesBatch();
      alert(`Đã nạp thành công ${count} dịch vụ Spa mới!`);
    } catch (e) {
      alert('Lỗi khi nạp dữ liệu Spa: ' + e);
    }
  };

  // --- Inventory Actions ---
  const importInventoryItem = async (itemId: string, quantity: number, notes?: string, expiryDate?: string) => {
    if (!loggedInUser) return;
    const item = inventoryItems.find(i => i.id === itemId);
    if (!item) return;

    const newQty = item.quantity + quantity;
    let updatedBatches = item.batches ? [...item.batches] : [];
    
    if (item.expiryDate && updatedBatches.length === 0) {
      updatedBatches.push({ expiryDate: item.expiryDate, quantity: item.quantity });
    }

    let nextExpiry = item.expiryDate;
    if (expiryDate) {
      const existingBatchIndex = updatedBatches.findIndex(b => b.expiryDate === expiryDate);
      if (existingBatchIndex >= 0) {
        updatedBatches[existingBatchIndex].quantity += quantity;
      } else {
        updatedBatches.push({ expiryDate, quantity });
      }
      updatedBatches.sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
      if (updatedBatches.length > 0) {
        nextExpiry = updatedBatches[0].expiryDate;
      }
    }

    const updatedItem: InventoryItem = {
      ...item,
      quantity: newQty,
      batches: updatedBatches,
      expiryDate: nextExpiry
    };

    const newTx: InventoryTransaction = {
      id: `tx-${Date.now()}`,
      itemId,
      itemName: item.name,
      type: 'in',
      quantity,
      date: new Date().toISOString(),
      performedBy: loggedInUser.name,
      performedById: loggedInUser.id,
      reason: notes || 'Nhập hàng',
      remainingStock: newQty
    };

    const updatedInventory = inventoryItems.map(i => i.id === itemId ? updatedItem : i);
    const updatedTransactions = [newTx, ...inventoryTransactions];
    
    setInventoryItems(updatedInventory);
    setInventoryTransactions(updatedTransactions);
    persistAppData({ inventory: updatedInventory, transactions: updatedTransactions });

    if (isCloudConnected) {
      try {
        const itemRef = doc(db, 'inventory', itemId);
        await updateDoc(itemRef, {
          quantity: newQty,
          batches: updatedBatches,
          expiryDate: nextExpiry || null
        });
        await addDoc(collection(db, 'inventory_transactions'), newTx);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `inventory/${itemId}`);
      }
    }
  };

  const exportInventoryItem = async (itemId: string, quantity: number, reason: string) => {
    if (!loggedInUser) return;
    const item = inventoryItems.find(i => i.id === itemId);
    if (!item) return;

    const newQty = Math.max(0, item.quantity - quantity);
    let finalBatches = item.batches ? [...item.batches] : [];
    let nextExpiry = item.expiryDate;

    // FIFO Logic
    if (finalBatches.length > 0) {
      let remainingToDeduct = quantity;
      const sortedBatches = finalBatches.map(b => ({ ...b }))
        .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());

      for (let i = 0; i < sortedBatches.length; i++) {
        if (remainingToDeduct <= 0) break;
        if (sortedBatches[i].quantity >= remainingToDeduct) {
          sortedBatches[i].quantity -= remainingToDeduct;
          remainingToDeduct = 0;
        } else {
          remainingToDeduct -= sortedBatches[i].quantity;
          sortedBatches[i].quantity = 0;
        }
      }
      finalBatches = sortedBatches.filter(b => b.quantity > 0);
      nextExpiry = finalBatches.length > 0 ? finalBatches[0].expiryDate : undefined;
    }

    const updatedItem: InventoryItem = {
      ...item,
      quantity: newQty,
      batches: finalBatches,
      expiryDate: nextExpiry
    };

    const newTx: InventoryTransaction = {
      id: `tx-${Date.now()}`,
      itemId,
      itemName: item.name,
      type: 'out',
      quantity,
      date: new Date().toISOString(),
      performedBy: loggedInUser.name,
      performedById: loggedInUser.id,
      reason,
      remainingStock: newQty
    };

    const updatedInventory = inventoryItems.map(i => i.id === itemId ? updatedItem : i);
    const updatedTransactions = [newTx, ...inventoryTransactions];

    setInventoryItems(updatedInventory);
    setInventoryTransactions(updatedTransactions);
    persistAppData({ inventory: updatedInventory, transactions: updatedTransactions });

    if (isCloudConnected) {
      try {
        const itemRef = doc(db, 'inventory', itemId);
        await updateDoc(itemRef, {
          quantity: newQty,
          batches: finalBatches,
          expiryDate: nextExpiry || null
        });
        await addDoc(collection(db, 'inventory_transactions'), newTx);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `inventory/${itemId}`);
      }
    }
  };

  const updateInventoryItem = async (item: InventoryItem) => {
    const updatedInventory = inventoryItems.map(i => i.id === item.id ? item : i);
    setInventoryItems(updatedInventory);
    persistAppData({ inventory: updatedInventory });

    if (isCloudConnected) {
      try {
        const itemRef = doc(db, 'inventory', item.id);
        await updateDoc(itemRef, { ...item } as any);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `inventory/${item.id}`);
      }
    }
  };

  const handleForceSeedInventory = async () => {
    try {
      const updated = [...DEFAULT_INVENTORY];
      setInventoryItems(updated);
      persistAppData({ inventory: updated });

      if (isCloudConnected) {
        const batch = writeBatch(db);
        DEFAULT_INVENTORY.forEach(item => {
          const docRef = doc(db, 'inventory', item.id);
          const copy = { ...item };
          if (copy.expiryDate) {
            copy.batches = [{ expiryDate: copy.expiryDate, quantity: copy.quantity }];
          }
          batch.set(docRef, copy);
        });
        await batch.commit();
      }
      alert(`Đã nạp thành công ${DEFAULT_INVENTORY.length} mặt hàng vào kho!`);
    } catch (e) {
      alert('Lỗi khi nạp dữ liệu: ' + e);
    }
  };

  // --- Audit Logic ---
  const createAuditSession = async (month: number, year: number) => {
    if (!loggedInUser) return;
    const newId = `audit-${year}-${month}-${Date.now()}`;
    
    const items: AuditItem[] = inventoryItems.map(inv => ({
      itemId: inv.id,
      itemName: inv.name,
      systemQty: inv.quantity,
      actualQty: inv.quantity,
      diff: 0
    }));

    const newAudit: AuditSession = {
      id: newId,
      name: `Kiểm kê Tháng ${month}/${year}`,
      month,
      year,
      status: 'open',
      createdBy: loggedInUser.name,
      createdDate: new Date().toISOString(),
      items
    };

    const updatedAudits = [newAudit, ...auditSessions];
    setAuditSessions(updatedAudits);
    persistAppData({ audits: updatedAudits });

    if (isCloudConnected) {
      try {
        await setDoc(doc(db, 'audit_sessions', newId), newAudit);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `audit_sessions/${newId}`);
      }
    }
  };

  const updateAuditItem = async (auditId: string, itemId: string, actualQty: number, reason: string) => {
    const session = auditSessions.find(s => s.id === auditId);
    if (!session) return;

    const updatedItems = session.items.map(item => {
      if (item.itemId === itemId) {
        return { 
          ...item, 
          actualQty, 
          diff: actualQty - item.systemQty,
          reason 
        };
      }
      return item;
    });

    const updatedSession = { ...session, items: updatedItems };
    const updatedAudits = auditSessions.map(s => s.id === auditId ? updatedSession : s);
    setAuditSessions(updatedAudits);
    persistAppData({ audits: updatedAudits });

    if (isCloudConnected) {
      try {
        await updateDoc(doc(db, 'audit_sessions', auditId), { items: updatedItems } as any);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `audit_sessions/${auditId}`);
      }
    }
  };

  const finalizeAuditSession = async (auditId: string) => {
    const session = auditSessions.find(s => s.id === auditId);
    if (!session) return;

    const today = new Date().toISOString();
    const updatedSession: AuditSession = {
      ...session,
      status: 'closed',
      closedDate: today
    };

    // Update inventory counts from audit items
    let updatedInventory = [...inventoryItems];
    const newTransactions: InventoryTransaction[] = [];

    for (const item of session.items) {
      if (item.diff !== 0) {
        updatedInventory = updatedInventory.map(inv => 
          inv.id === item.itemId ? { ...inv, quantity: item.actualQty } : inv
        );

        const reasonStr = `Điều chỉnh kiểm kê (${session.name}): ${item.diff > 0 ? '+' : ''}${item.diff}. ${item.reason || ''}`;
        newTransactions.push({
          id: `tx-audit-${Date.now()}-${item.itemId}`,
          itemId: item.itemId,
          itemName: item.itemName,
          type: 'audit_adjustment',
          quantity: Math.abs(item.diff),
          date: today,
          performedBy: loggedInUser?.name || 'System',
          performedById: loggedInUser?.id || 'system',
          reason: reasonStr,
          remainingStock: item.actualQty
        });
      }
    }

    const updatedAudits = auditSessions.map(s => s.id === auditId ? updatedSession : s);
    const updatedTransactions = [...newTransactions, ...inventoryTransactions];

    setAuditSessions(updatedAudits);
    setInventoryItems(updatedInventory);
    setInventoryTransactions(updatedTransactions);
    persistAppData({
      audits: updatedAudits,
      inventory: updatedInventory,
      transactions: updatedTransactions
    });

    if (isCloudConnected) {
      try {
        const batch = writeBatch(db);
        const auditRef = doc(db, 'audit_sessions', auditId);
        batch.update(auditRef, { status: 'closed', closedDate: today });

        for (const item of session.items) {
          if (item.diff !== 0) {
            const invRef = doc(db, 'inventory', item.itemId);
            batch.update(invRef, { quantity: item.actualQty });

            const transRef = doc(collection(db, 'inventory_transactions'));
            const reasonStr = `Điều chỉnh kiểm kê (${session.name}): ${item.diff > 0 ? '+' : ''}${item.diff}. ${item.reason || ''}`;
            batch.set(transRef, {
              itemId: item.itemId,
              itemName: item.itemName,
              type: 'audit_adjustment',
              quantity: Math.abs(item.diff),
              date: today,
              performedBy: loggedInUser?.name || 'System',
              performedById: loggedInUser?.id || 'system',
              reason: reasonStr,
              remainingStock: item.actualQty
            });
          }
        }
        await batch.commit();
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `audit_sessions/${auditId}`);
      }
    }

    alert('Đã chốt sổ thành công! Tồn kho đã được cập nhật theo số liệu thực tế.');
  };

  const deleteAuditSession = async (auditId: string) => {
    const updatedAudits = auditSessions.filter(s => s.id !== auditId);
    setAuditSessions(updatedAudits);
    persistAppData({ audits: updatedAudits });

    if (isCloudConnected) {
      try {
        await deleteDoc(doc(db, 'audit_sessions', auditId));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `audit_sessions/${auditId}`);
      }
    }
  };

  // --- HR & Payroll Handlers ---
  const handleAddStaff = (staff: StaffMember) => {
    const updated = [staff, ...staffList];
    setStaffList(updated);
    persistHRData({ staff: updated });
  };

  const handleUpdateStaff = (staff: StaffMember) => {
    const updated = staffList.map(s => s.id === staff.id ? staff : s);
    setStaffList(updated);
    persistHRData({ staff: updated });
  };

  const handleDeleteStaff = (staffId: string) => {
    const updated = staffList.filter(s => s.id !== staffId);
    setStaffList(updated);
    persistHRData({ staff: updated });
  };

  const handleSaveAttendance = (record: AttendanceRecord) => {
    const existingIdx = attendanceList.findIndex(a => a.id === record.id || (a.staffId === record.staffId && a.month === record.month && a.year === record.year));
    let updated: AttendanceRecord[];
    if (existingIdx >= 0) {
      updated = [...attendanceList];
      updated[existingIdx] = record;
    } else {
      updated = [...attendanceList, record];
    }
    setAttendanceList(updated);
    persistHRData({ attendance: updated });
  };

  const handleSaveTour = (tour: TechnicianTour) => {
    const existingIdx = toursList.findIndex(t => t.id === tour.id);
    let updated: TechnicianTour[];
    if (existingIdx >= 0) {
      updated = [...toursList];
      updated[existingIdx] = tour;
    } else {
      updated = [tour, ...toursList];
    }
    setToursList(updated);
    persistHRData({ tours: updated });
  };

  const handleDeleteTour = (tourId: string) => {
    const updated = toursList.filter(t => t.id !== tourId);
    setToursList(updated);
    persistHRData({ tours: updated });
  };

  const handleSavePayroll = (record: PayrollRecord) => {
    const existingIdx = payrollList.findIndex(p => p.id === record.id);
    let updated: PayrollRecord[];
    if (existingIdx >= 0) {
      updated = [...payrollList];
      updated[existingIdx] = record;
    } else {
      updated = [...payrollList, record];
    }
    setPayrollList(updated);
    persistHRData({ payroll: updated });
  };

  const handleBatchUpdatePayroll = (records: PayrollRecord[]) => {
    const map = new Map(payrollList.map(p => [p.id, p]));
    records.forEach(r => map.set(r.id, r));
    const updated = Array.from(map.values());
    setPayrollList(updated);
    persistHRData({ payroll: updated });
  };

  // --- Render ---
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FEFBFB] text-[#5C3A3A]">
        <div className="text-center">
          <p className="font-serif text-2xl mb-2 text-[#D97A7D]">Wellness Promotion Manager</p>
          <p className="text-sm text-gray-500 animate-pulse">Đang tải dữ liệu hệ thống...</p>
        </div>
      </div>
    );
  }

  if (showLanding) {
    return <LandingPage onEnter={handleEnterSystem} />;
  }

  if (!loggedInUser) {
    return <LoginScreen onLogin={handleLogin} error={loginError} />;
  }

  return (
    <div className="min-h-screen bg-[#FDF7F8] text-[#5C3A3A]">
      <Header
        currentUser={loggedInUser}
        onSwitchRole={handleSwitchRole} 
        onUpdateUserName={handleUpdateUserName}
        currentView={view}
        onViewChange={setView}
        onLogout={handleLogout}
        isCloudConnected={isCloudConnected}
      />
      <main className="p-4 sm:p-6 lg:p-8">
        {view === 'dashboard' && loggedInUser.role !== Role.Accountant && (
          <Dashboard
            loggedInUser={loggedInUser}
            services={services}
            activePromotions={activePromotions}
            proposalPromotions={proposalPromotions}
            onAddPromotion={addPromotion}
            onUpdatePromotion={updatePromotion}
            onDeletePromotion={deletePromotion}
          />
        )}
        
        {view === 'services' && loggedInUser.role !== Role.Accountant && (
          <ServiceManagement
            services={services}
            onAddService={addService}
            onUpdateService={updateService}
            onDeleteService={deleteService}
            onSeedSpaServices={handleForceSeedSpa}
            currentUser={loggedInUser}
          />
        )}

        {view === 'inventory' && (
          <InventoryManagement 
            items={inventoryItems}
            transactions={inventoryTransactions}
            currentUser={loggedInUser}
            onImportItem={importInventoryItem}
            onExportItem={exportInventoryItem}
            onSeedData={handleForceSeedInventory}
            onUpdateItem={updateInventoryItem}
            auditSessions={auditSessions}
            onCreateAudit={createAuditSession}
            onUpdateAuditItem={updateAuditItem}
            onFinalizeAudit={finalizeAuditSession}
            onDeleteAudit={deleteAuditSession}
          />
        )}

        {view === 'users' && loggedInUser.role === Role.Management && (
          <UserManagement 
            users={users}
            onAddUser={addUser}
            onDeleteUser={deleteUser}
          />
        )}

        {view === 'hr' && (
          <HRManagement
            currentUser={loggedInUser}
            staffList={staffList}
            attendanceList={attendanceList}
            toursList={toursList}
            payrollList={payrollList}
            services={services}
            onAddStaff={handleAddStaff}
            onUpdateStaff={handleUpdateStaff}
            onDeleteStaff={handleDeleteStaff}
            onSaveAttendance={handleSaveAttendance}
            onSaveTour={handleSaveTour}
            onDeleteTour={handleDeleteTour}
            onSavePayroll={handleSavePayroll}
            onBatchUpdatePayroll={handleBatchUpdatePayroll}
          />
        )}
      </main>
    </div>
  );
};

export default App;

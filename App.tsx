import React, { useState, useMemo, useEffect } from 'react';
// FIX: Import directly from firebase SDK for real connection
import { collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc, getDocs, writeBatch, query, addDoc, where } from 'firebase/firestore';
import { db } from './firebaseConfig';

import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ServiceManagement from './components/ServiceManagement';
import LoginScreen from './components/LoginScreen';
import UserManagement from './components/UserManagement';
import LandingPage from './components/LandingPage';
import InventoryManagement from './components/InventoryManagement';
import { User, Promotion, Service, Role, InventoryItem, InventoryTransaction, AuditSession, AuditItem } from './types';
// FIX: Ensure DEFAULT_PROMOTIONS is used
import { USERS as DEFAULT_USERS, SERVICES as DEFAULT_SERVICES, PROMOTIONS as DEFAULT_PROMOTIONS, INVENTORY_ITEMS as DEFAULT_INVENTORY, SPA_SERVICES_DATA } from './constants';

type View = 'dashboard' | 'services' | 'users' | 'inventory';

const App: React.FC = () => {
  const [showLanding, setShowLanding] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [inventoryTransactions, setInventoryTransactions] = useState<InventoryTransaction[]>([]);
  
  // Audit State
  const [auditSessions, setAuditSessions] = useState<AuditSession[]>([]);
  
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [view, setView] = useState<View>('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [loginError, setLoginError] = useState<string>('');
  
  // Helper for batch seeding Spa Services
  const seedSpaServicesBatch = async () => {
      console.log("Starting Spa Services Seed...");
      try {
          // 1. Get existing services to avoid duplicates
          const servicesSnap = await getDocs(collection(db, 'services'));
          const existingNames = new Set(servicesSnap.docs.map(doc => doc.data().name));
          
          const batch = writeBatch(db);
          let count = 0;

          SPA_SERVICES_DATA.forEach(service => {
             if (!existingNames.has(service.name)) {
                 const newId = `service-spa-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
                 const docRef = doc(db, 'services', newId);
                 
                 // Construct full Service object with defaults
                 const fullService = {
                    id: newId,
                    name: service.name || 'Unnamed',
                    description: service.description || '',
                    category: service.category || 'Spa',
                    type: 'spa', // Force type
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
                    
                    // Spa Pricing
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
              console.log(`Successfully seeded ${count} new Spa services.`);
          } else {
              console.log("All Spa services already exist. Skipping seed.");
          }
          return count;
      } catch (error) {
          console.error("Error seeding Spa services:", error);
          throw error;
      }
  };

  // --- Firebase Real-time Listener ---
  useEffect(() => {
    const seedInitialData = async () => {
        console.log("Checking for initial data...");
        try {
            // 1. Check & Seed Users
            const usersSnap = await getDocs(collection(db, 'users'));
            if (usersSnap.empty) {
                console.log("Seeding users...");
                const batch = writeBatch(db);
                DEFAULT_USERS.forEach(user => {
                    const docRef = doc(db, 'users', user.id);
                    batch.set(docRef, user);
                });
                await batch.commit();
            }

            // 2. Check & Seed Services (Generic)
            const servicesSnap = await getDocs(collection(db, 'services'));
            if (servicesSnap.empty) {
                console.log("Seeding services...");
                const batch = writeBatch(db);
                DEFAULT_SERVICES.forEach(service => {
                    const docRef = doc(db, 'services', service.id);
                    batch.set(docRef, service);
                });
                await batch.commit();
            }

            // 2b. Check & Seed Spa Services (Specific Check)
            // Modified Logic: If we have fewer than 10 spa services, we attempt to seed the rest.
            // This handles cases where user might have created 1 manual service, preventing the previous .empty check from running.
            const spaQuery = query(collection(db, 'services'), where('type', '==', 'spa'));
            const spaSnap = await getDocs(spaQuery);
            if (spaSnap.size < 10) {
                console.log("Spa services seem incomplete (count < 10). Attempting to seed defaults...");
                const count = await seedSpaServicesBatch();
                if (count > 0) {
                    // Alert user so they know data has been added
                    alert(`Đã tự động cập nhật ${count} dịch vụ Spa mới vào hệ thống! Vui lòng kiểm tra tab "Spa & Massage".`);
                }
            }

             // 3. Check & Seed Promotions (FIX: Using DEFAULT_PROMOTIONS here to avoid TS6133)
            const promotionsSnap = await getDocs(collection(db, 'promotions'));
            if (promotionsSnap.empty) {
                console.log("Seeding promotions...");
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
                console.log("Seeding inventory...");
                const batch = writeBatch(db);
                DEFAULT_INVENTORY.forEach(item => {
                    const docRef = doc(db, 'inventory', item.id);
                    // Init batch for seeded items if expiry exists
                    if (item.expiryDate) {
                        item.batches = [{ expiryDate: item.expiryDate, quantity: item.quantity }];
                    }
                    batch.set(docRef, item);
                });
                await batch.commit();
            }

        } catch (err) {
            console.error("Error seeding data:", err);
        }
    };

    const setupListeners = () => {
        // Listeners for all collections
        const unsubUsers = onSnapshot(query(collection(db, "users")), (snapshot) => {
            const loadedUsers = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as User));
            setUsers(loadedUsers);
        });

        const unsubServices = onSnapshot(query(collection(db, "services")), (snapshot) => {
            const loadedServices = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Service));
            setServices(loadedServices.sort((a, b) => (a.category || '').localeCompare(b.category || '')));
        });

        const unsubPromotions = onSnapshot(query(collection(db, "promotions")), (snapshot) => {
            const loadedPromotions = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Promotion));
            setPromotions(loadedPromotions);
        });

        const unsubInventory = onSnapshot(query(collection(db, "inventory")), (snapshot) => {
            const loadedItems = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as InventoryItem));
            setInventoryItems(loadedItems);
        });

        const unsubTransactions = onSnapshot(query(collection(db, "inventory_transactions")), (snapshot) => {
            const loadedTrans = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as InventoryTransaction));
            setInventoryTransactions(loadedTrans);
        });

        // Audit Listener
        const unsubAudits = onSnapshot(query(collection(db, "audit_sessions")), (snapshot) => {
            const loadedAudits = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as AuditSession));
            setAuditSessions(loadedAudits);
        });
        
        return () => {
            unsubUsers();
            unsubServices();
            unsubPromotions();
            unsubInventory();
            unsubTransactions();
            unsubAudits();
        };
    };

    seedInitialData().then(() => {
        const unsubscribe = setupListeners();
        setIsLoading(false);
        return unsubscribe;
    }).catch(error => {
        console.error("Firebase initialization error:", error);
        alert("Không thể kết nối đến cơ sở dữ liệu. Vui lòng kiểm tra lại cấu hình Firebase và kết nối mạng.");
        setIsLoading(false);
    });

  }, []);

  // ... (Keep existing computed values and auth handlers) ...
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
      const user = users.find(u => u.username === username && u.password === password);
      if (user) {
          setLoggedInUser(user);
          setLoginError('');
          // Force Accountant to Inventory view
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
          // Role-based redirect
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
        const userRef = doc(db, 'users', loggedInUser.id);
        await updateDoc(userRef, { name: newName } as { [key: string]: any });
    }
  };

  // --- Actions ---
  const addUser = async (newUserData: Omit<User, 'id'>) => {
    const newId = `user-${Date.now()}`;
    const userRef = doc(db, 'users', newId);
    await setDoc(userRef, { ...newUserData, id: newId });
  };
  
  const deleteUser = async (userId: string) => {
      await deleteDoc(doc(db, 'users', userId));
  };

  const addPromotion = async (newPromotionData: Omit<Promotion, 'id'>) => {
    const newId = `promo-${Date.now()}`;
    const promoRef = doc(db, 'promotions', newId);
    await setDoc(promoRef, { ...newPromotionData, id: newId });
  };
  
  const updatePromotion = async (updatedPromotion: Promotion) => {
    const promoRef = doc(db, 'promotions', updatedPromotion.id);
    await updateDoc(promoRef, { ...updatedPromotion } as { [key: string]: any });
  };

  const deletePromotion = async (promotionId: string) => {
    await deleteDoc(doc(db, 'promotions', promotionId));
  };

  const addService = async (newServiceData: Omit<Service, 'id'>) => {
    const newId = `service-${Date.now()}`;
    const serviceRef = doc(db, 'services', newId);
    await setDoc(serviceRef, { ...newServiceData, id: newId });
  };
  
  const updateService = async (updatedService: Service) => {
    const serviceRef = doc(db, 'services', updatedService.id);
    await updateDoc(serviceRef, { ...updatedService } as { [key: string]: any });
  };
  
  const deleteService = async (serviceId: string) => {
    await deleteDoc(doc(db, 'services', serviceId));
  }
  
  const handleForceSeedSpa = async () => {
      try {
          const count = await seedSpaServicesBatch();
          alert(`Đã nạp thành công ${count} dịch vụ Spa mới!`);
      } catch (e) {
          alert("Lỗi khi nạp dữ liệu Spa: " + e);
      }
  };

  // --- Inventory Actions ---
  const importInventoryItem = async (itemId: string, quantity: number, notes?: string, expiryDate?: string) => {
      if (!loggedInUser) return;
      const item = inventoryItems.find(i => i.id === itemId);
      if (!item) return;

      const newQty = item.quantity + quantity;
      const itemRef = doc(db, 'inventory', itemId);
      
      const updateData: any = { quantity: newQty };
      
      // Batch Logic
      let updatedBatches = item.batches ? [...item.batches] : [];
      
      if (item.expiryDate && updatedBatches.length === 0) {
          updatedBatches.push({ expiryDate: item.expiryDate, quantity: item.quantity });
      }

      // FIX: Use expiryDate if provided (This fixes TS6133)
      if (expiryDate) {
          const existingBatchIndex = updatedBatches.findIndex(b => b.expiryDate === expiryDate);
          if (existingBatchIndex >= 0) {
              updatedBatches[existingBatchIndex].quantity += quantity;
          } else {
              updatedBatches.push({ expiryDate, quantity });
          }
          updatedBatches.sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
          
          updateData.batches = updatedBatches;
          if (updatedBatches.length > 0) {
              updateData.expiryDate = updatedBatches[0].expiryDate;
          }
      } else {
          // Logic for no expiry provided
      }
      
      await updateDoc(itemRef, updateData);

      await addDoc(collection(db, 'inventory_transactions'), {
          itemId,
          itemName: item.name,
          type: 'in',
          quantity,
          date: new Date().toISOString(),
          performedBy: loggedInUser.name,
          performedById: loggedInUser.id,
          reason: notes || 'Nhập hàng',
          remainingStock: newQty
      });
  };

  const exportInventoryItem = async (itemId: string, quantity: number, reason: string) => {
      if (!loggedInUser) return;
      const item = inventoryItems.find(i => i.id === itemId);
      if (!item) return;

      const newQty = Math.max(0, item.quantity - quantity);
      const itemRef = doc(db, 'inventory', itemId);
      
      const updateData: any = { quantity: newQty };

      // FIFO Logic
      if (item.batches && item.batches.length > 0) {
          let remainingToDeduct = quantity;
          const updatedBatches = item.batches.map(b => ({...b}));
          updatedBatches.sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());

          for (let i = 0; i < updatedBatches.length; i++) {
              if (remainingToDeduct <= 0) break;
              if (updatedBatches[i].quantity >= remainingToDeduct) {
                  updatedBatches[i].quantity -= remainingToDeduct;
                  remainingToDeduct = 0;
              } else {
                  remainingToDeduct -= updatedBatches[i].quantity;
                  updatedBatches[i].quantity = 0;
              }
          }
          const finalBatches = updatedBatches.filter(b => b.quantity > 0);
          updateData.batches = finalBatches;
          
          if (finalBatches.length > 0) {
              updateData.expiryDate = finalBatches[0].expiryDate;
          } else {
              updateData.expiryDate = null;
          }
      }

      await updateDoc(itemRef, updateData);

      await addDoc(collection(db, 'inventory_transactions'), {
          itemId,
          itemName: item.name,
          type: 'out',
          quantity,
          date: new Date().toISOString(),
          performedBy: loggedInUser.name,
          performedById: loggedInUser.id,
          reason: reason,
          remainingStock: newQty
      });
  };

  const updateInventoryItem = async (item: InventoryItem) => {
      const itemRef = doc(db, 'inventory', item.id);
      await updateDoc(itemRef, { ...item } as { [key: string]: any });
  };

  const handleForceSeedInventory = async () => {
      try {
          const batch = writeBatch(db);
          DEFAULT_INVENTORY.forEach(item => {
              const docRef = doc(db, 'inventory', item.id);
              if (item.expiryDate) {
                  item.batches = [{ expiryDate: item.expiryDate, quantity: item.quantity }];
              }
              batch.set(docRef, item);
          });
          await batch.commit();
          alert(`Đã nạp thành công ${DEFAULT_INVENTORY.length} mặt hàng vào kho!`);
      } catch (e) {
          console.error(e);
          alert("Lỗi khi nạp dữ liệu: " + e);
      }
  };

  // --- NEW: AUDIT LOGIC (CORE) ---
  
  const createAuditSession = async (month: number, year: number) => {
      if (!loggedInUser) return;
      const newId = `audit-${year}-${month}-${Date.now()}`;
      
      // 1. Snapshot current stock state
      const items: AuditItem[] = inventoryItems.map(inv => ({
          itemId: inv.id,
          itemName: inv.name,
          systemQty: inv.quantity, // Current system stock
          actualQty: inv.quantity, // Default actual to system (user will edit this)
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

      await setDoc(doc(db, 'audit_sessions', newId), newAudit);
  };

  const updateAuditItem = async (auditId: string, itemId: string, actualQty: number, reason: string) => {
      const session = auditSessions.find(s => s.id === auditId);
      if (!session) return;

      const updatedItems = session.items.map(item => {
          if (item.itemId === itemId) {
              return { 
                  ...item, 
                  actualQty, 
                  diff: actualQty - item.systemQty, // Recalculate diff
                  reason 
              };
          }
          return item;
      });

      await updateDoc(doc(db, 'audit_sessions', auditId), { items: updatedItems } as any);
  };

  const finalizeAuditSession = async (auditId: string) => {
      const session = auditSessions.find(s => s.id === auditId);
      if (!session) return;

      const batch = writeBatch(db);
      const today = new Date().toISOString();

      // 1. Close the audit session
      const auditRef = doc(db, 'audit_sessions', auditId);
      batch.update(auditRef, { status: 'closed', closedDate: today });

      // 2. Create Adjustments
      for (const item of session.items) {
          if (item.diff !== 0) {
              // A. Update Inventory Qty
              const invRef = doc(db, 'inventory', item.itemId);
              batch.update(invRef, { quantity: item.actualQty }); // Set to actual count

              // B. Create Transaction Record
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
      alert("Đã chốt sổ thành công! Tồn kho đã được cập nhật theo số liệu thực tế.");
  };

  // FIX: Add deleteAuditSession
  const deleteAuditSession = async (auditId: string) => {
      await deleteDoc(doc(db, 'audit_sessions', auditId));
  };

  // ... (Render Logic) ...
  if (isLoading) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-[#FEFBFB] text-[#5C3A3A]">
              <p className="font-serif text-xl animate-pulse">Đang kết nối tới cơ sở dữ liệu...</p>
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
                // Pass Audit props
                auditSessions={auditSessions}
                onCreateAudit={createAuditSession}
                onUpdateAuditItem={updateAuditItem}
                onFinalizeAudit={finalizeAuditSession}
                // FIX: Pass delete handler
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
      </main>
    </div>
  );
};

export default App;
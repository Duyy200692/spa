import { collection, getDocs, limit, query } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { User, Service, Promotion, InventoryItem, InventoryTransaction, AuditSession } from './types';
import { 
  USERS as DEFAULT_USERS, 
  SERVICES as DEFAULT_SERVICES, 
  PROMOTIONS as DEFAULT_PROMOTIONS, 
  INVENTORY_ITEMS as DEFAULT_INVENTORY 
} from './constants';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): FirestoreErrorInfo {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
      emailVerified: null,
      isAnonymous: null,
      tenantId: null,
      providerInfo: []
    },
    operationType,
    path
  };
  console.warn('Firestore Operation Notice: ' + JSON.stringify(errInfo));
  return errInfo;
}

const STORAGE_KEYS = {
  USERS: 'wellness_users_data',
  SERVICES: 'wellness_services_data',
  PROMOTIONS: 'wellness_promotions_data',
  INVENTORY: 'wellness_inventory_data',
  TRANSACTIONS: 'wellness_transactions_data',
  AUDITS: 'wellness_audits_data',
};

const LEGACY_KEYS = {
  USERS: 'juspa_users_data',
  SERVICES: 'juspa_services_data',
  PROMOTIONS: 'juspa_promotions_data',
  INVENTORY: 'juspa_inventory_data',
  TRANSACTIONS: 'juspa_transactions_data',
  AUDITS: 'juspa_audits_data',
};

// Safe Local Storage Helpers
export function loadLocalData<T>(key: string, defaultValue: T, legacyKey?: string): T {
  try {
    let raw = localStorage.getItem(key);
    if (!raw && legacyKey) {
      raw = localStorage.getItem(legacyKey);
    }
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`Error reading ${key} from localStorage:`, err);
    return defaultValue;
  }
}

export function saveLocalData<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`Error saving ${key} to localStorage:`, err);
  }
}

export function getInitialAppData() {
  const users = loadLocalData<User[]>(STORAGE_KEYS.USERS, DEFAULT_USERS, LEGACY_KEYS.USERS);
  const services = loadLocalData<Service[]>(STORAGE_KEYS.SERVICES, DEFAULT_SERVICES, LEGACY_KEYS.SERVICES);
  const promotions = loadLocalData<Promotion[]>(STORAGE_KEYS.PROMOTIONS, DEFAULT_PROMOTIONS, LEGACY_KEYS.PROMOTIONS);
  const inventory = loadLocalData<InventoryItem[]>(STORAGE_KEYS.INVENTORY, DEFAULT_INVENTORY, LEGACY_KEYS.INVENTORY);
  const transactions = loadLocalData<InventoryTransaction[]>(STORAGE_KEYS.TRANSACTIONS, [], LEGACY_KEYS.TRANSACTIONS);
  const audits = loadLocalData<AuditSession[]>(STORAGE_KEYS.AUDITS, [], LEGACY_KEYS.AUDITS);

  return { users, services, promotions, inventory, transactions, audits };
}

export function persistAppData(data: {
  users?: User[];
  services?: Service[];
  promotions?: Promotion[];
  inventory?: InventoryItem[];
  transactions?: InventoryTransaction[];
  audits?: AuditSession[];
}) {
  if (data.users) saveLocalData(STORAGE_KEYS.USERS, data.users);
  if (data.services) saveLocalData(STORAGE_KEYS.SERVICES, data.services);
  if (data.promotions) saveLocalData(STORAGE_KEYS.PROMOTIONS, data.promotions);
  if (data.inventory) saveLocalData(STORAGE_KEYS.INVENTORY, data.inventory);
  if (data.transactions) saveLocalData(STORAGE_KEYS.TRANSACTIONS, data.transactions);
  if (data.audits) saveLocalData(STORAGE_KEYS.AUDITS, data.audits);
}

/**
 * Checks whether the current Firestore instance is accessible with current permissions.
 */
export async function testFirestoreConnection(): Promise<{ accessible: boolean; errorInfo?: FirestoreErrorInfo }> {
  try {
    // Attempt a light read on 'users' collection to check permissions
    const q = query(collection(db, 'users'), limit(1));
    await getDocs(q);
    return { accessible: true };
  } catch (error: any) {
    const errorInfo = handleFirestoreError(error, OperationType.GET, 'users');
    return { accessible: false, errorInfo };
  }
}

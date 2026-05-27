import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface PendingAction {
  id: string;
  type: string;
  data: Record<string, unknown>;
  createdAt: string;
  retryCount: number;
}

const DB_NAME = 'cybersafe-offline';
const STORE_NAME = 'pending-actions';
const MODULE_STORE = 'offline-modules';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 2);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(MODULE_STORE)) {
        db.createObjectStore(MODULE_STORE, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getAllFromStore<T>(storeName: string): Promise<T[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function putInStore(storeName: string, item: unknown): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    store.put(item);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function deleteFromStore(storeName: string, key: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    store.delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export function useOfflineSync() {
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const syncIntervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const refreshPendingCount = useCallback(async () => {
    try {
      const actions = await getAllFromStore<PendingAction>(STORE_NAME);
      setPendingCount(actions.length);
    } catch {
      // IndexedDB may not be available
    }
  }, []);

  const queueAction = useCallback(async (type: string, data: Record<string, unknown>) => {
    const action: PendingAction = {
      id: crypto.randomUUID(),
      type,
      data,
      createdAt: new Date().toISOString(),
      retryCount: 0,
    };
    await putInStore(STORE_NAME, action);
    await refreshPendingCount();
  }, [refreshPendingCount]);

  const processAction = useCallback(async (action: PendingAction): Promise<boolean> => {
    if (!user) return false;
    try {
      switch (action.type) {
        case 'module_progress': {
          const { module_id, status } = action.data as { module_id: string; status: string };
          await supabase.from('user_module_progress').upsert({
            user_id: user.id,
            module_id,
            status,
            last_accessed: new Date().toISOString(),
          }, { onConflict: 'user_id,module_id' });
          break;
        }
        case 'activity_log': {
          const { activity_type, module_id, metadata } = action.data as {
            activity_type: string; module_id?: string; metadata?: Record<string, unknown>;
          };
          await supabase.from('user_activity_log').insert([{
            user_id: user.id,
            activity_type,
            module_id: module_id || null,
            metadata: (metadata || {}) as any,
          }]);
          break;
        }
        default:
          console.warn('Unknown offline action type:', action.type);
      }
      return true;
    } catch {
      return false;
    }
  }, [user]);

  const syncPendingActions = useCallback(async () => {
    if (!isOnline || isSyncing || !user) return;
    setIsSyncing(true);
    try {
      const actions = await getAllFromStore<PendingAction>(STORE_NAME);
      for (const action of actions) {
        const success = await processAction(action);
        if (success) {
          await deleteFromStore(STORE_NAME, action.id);
        } else {
          await putInStore(STORE_NAME, { ...action, retryCount: action.retryCount + 1 });
        }
      }
      await refreshPendingCount();
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isSyncing, user, processAction, refreshPendingCount]);

  // Auto-sync when coming online
  useEffect(() => {
    if (isOnline && user) {
      syncPendingActions();
    }
  }, [isOnline, user, syncPendingActions]);

  // Periodic sync every 30s when online
  useEffect(() => {
    if (isOnline && user) {
      syncIntervalRef.current = setInterval(syncPendingActions, 30000);
    }
    return () => {
      if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
    };
  }, [isOnline, user, syncPendingActions]);

  useEffect(() => {
    refreshPendingCount();
  }, [refreshPendingCount]);

  const saveModuleOffline = useCallback(async (moduleId: string, content: unknown) => {
    await putInStore(MODULE_STORE, {
      id: moduleId,
      content,
      downloadedAt: new Date().toISOString(),
    });
  }, []);

  const getOfflineModule = useCallback(async (moduleId: string) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(MODULE_STORE, 'readonly');
      const req = tx.objectStore(MODULE_STORE).get(moduleId);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }, []);

  return {
    isOnline,
    pendingCount,
    isSyncing,
    queueAction,
    syncPendingActions,
    saveModuleOffline,
    getOfflineModule,
  };
}

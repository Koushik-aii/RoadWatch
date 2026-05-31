import { useState, useEffect, useCallback, useRef } from 'react';
import { getComplaints, clearComplaints } from '../services/db';
import {
  buildCreatePayload,
  createComplaint,
  createComplaintWithImage,
  parseGpsString,
} from '../services/complaintsApi';

/**
 * Sync offline complaint queue to POST /api/complaints/ when back online.
 */
export function useSyncQueue() {
  const [syncMessage, setSyncMessage] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const clearTimerRef = useRef(null);

  const refreshCount = useCallback(async () => {
    try {
      const queued = await getComplaints();
      setPendingCount(queued?.length ?? 0);
    } catch {
      setPendingCount(0);
    }
  }, []);

  const syncNow = useCallback(async () => {
    if (isSyncing) return;

    const queued = await getComplaints();
    if (!queued || queued.length === 0) return;

    setIsSyncing(true);
    setSyncMessage(`Syncing ${queued.length} offline complaint${queued.length > 1 ? 's' : ''}…`);

    let successCount = 0;
    let failCount = 0;

    for (const complaint of queued) {
      try {
        const coords = parseGpsString(complaint.formState?.gpsValue);
        const payload = buildCreatePayload({
          formState: complaint.formState,
          data: complaint.data,
          roadType: complaint.roadType,
          coords,
        });

        if (complaint.formState?.photo && typeof complaint.formState.photo === 'string') {
          const blob = await fetch(complaint.formState.photo).then(r => r.blob());
          const fd = new FormData();
          Object.entries(payload).forEach(([k, v]) => {
            if (v != null) fd.append(k, String(v));
          });
          fd.append('image', blob, 'offline-photo.jpg');
          await createComplaintWithImage(fd);
        } else {
          await createComplaint(payload);
        }
        successCount++;
      } catch (err) {
        failCount++;
        console.warn(`[SyncQueue] Failed to sync ${complaint.id}:`, err);
      }
    }

    if (failCount === 0) {
      await clearComplaints();
    }

    setPendingCount(failCount);
    setIsSyncing(false);

    if (failCount === 0) {
      setSyncMessage(`✅ ${successCount} complaint${successCount > 1 ? 's' : ''} synced successfully!`);
    } else {
      setSyncMessage(`⚠️ ${successCount} synced, ${failCount} failed — will retry next time.`);
    }

    clearTimerRef.current = setTimeout(() => setSyncMessage(null), 4000);
  }, [isSyncing]);

  useEffect(() => {
    refreshCount();

    const handleOnline = () => {
      syncNow();
    };

    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('online', handleOnline);
      if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
    };
  }, [syncNow, refreshCount]);

  return { syncMessage, pendingCount, isSyncing, syncNow };
}

import { useState, useEffect, useCallback, useRef } from 'react';
import { getComplaints, clearComplaints } from '../services/db';

/**
 * React hook that watches for the browser to come back online, reads any
 * pending complaints from IndexedDB (`complaints_queue` store), and POSTs
 * each one to `/api/complaints/`.
 *
 * After a successful sync it clears the queue and returns a summary message
 * via `syncMessage`. The message auto-clears after 4 seconds.
 *
 * @returns {{
 *   syncMessage: string | null,
 *   pendingCount: number,
 *   isSyncing: boolean,
 *   syncNow: () => Promise<void>,
 * }}
 */
export function useSyncQueue() {
  const [syncMessage, setSyncMessage] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const clearTimerRef = useRef(null);

  // ── Refresh the pending count from IDB ────────────────────
  const refreshCount = useCallback(async () => {
    try {
      const queued = await getComplaints();
      setPendingCount(queued?.length ?? 0);
    } catch {
      setPendingCount(0);
    }
  }, []);

  // ── Core sync logic ───────────────────────────────────────
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
        // Build the payload expected by POST /api/complaints/
        const payload = {
          lat: complaint.formState?.gpsValue
            ? parseFloat(complaint.formState.gpsValue)
            : 16.5062, // Vijayawada default
          lng: complaint.formState?.gpsValue
            ? parseFloat(complaint.formState.gpsValue.split(',')[1])
            : 80.6480,
          issue_type: complaint.formState?.defectType || 'Pothole',
          district: complaint.data?.district || complaint.data?._resolvedDistrict || 'Krishna',
          state: complaint.data?.state || complaint.data?._resolvedState || 'Andhra Pradesh',
          country: 'India',
          road_type: complaint.roadType || 'SH',
        };

        // If the complaint was associated with a specific road UUID
        if (complaint.data?.road_id) {
          payload.road_id = complaint.data.road_id;
        }

        const response = await fetch('/api/complaints/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          successCount++;
        } else {
          failCount++;
          console.warn(
            `[SyncQueue] Failed to sync complaint ${complaint.id}:`,
            response.status,
            await response.text().catch(() => ''),
          );
        }
      } catch (err) {
        failCount++;
        console.warn(`[SyncQueue] Network error syncing complaint ${complaint.id}:`, err);
      }
    }

    // Only clear the IDB queue if all items were synced successfully
    if (failCount === 0) {
      await clearComplaints();
    }

    setPendingCount(failCount);
    setIsSyncing(false);

    // Build summary message
    if (failCount === 0) {
      setSyncMessage(`✅ ${successCount} complaint${successCount > 1 ? 's' : ''} synced successfully!`);
    } else {
      setSyncMessage(
        `⚠️ ${successCount} synced, ${failCount} failed — will retry next time.`,
      );
    }

    // Auto-clear the message after 4 seconds
    clearTimerRef.current = setTimeout(() => setSyncMessage(null), 4000);
  }, [isSyncing]);

  // ── Listen for the browser coming back online ─────────────
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

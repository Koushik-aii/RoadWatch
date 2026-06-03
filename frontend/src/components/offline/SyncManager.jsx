import { useEffect, useState } from 'react';
import { getQueuedMutations, removeMutation, deserializeFormData } from '../../services/offlineStorage';
import { apiFetch } from '../../services/apiClient';

export default function SyncManager() {
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const handleOnline = async () => {
      console.log('Online! Triggering sync...');
      setIsSyncing(true);
      try {
        const queue = await getQueuedMutations();
        if (queue.length === 0) {
          setIsSyncing(false);
          return;
        }
        
        console.log(`Syncing ${queue.length} pending mutations...`);
        for (const item of queue) {
          try {
            // Restore formData if needed
            let body = item.body;
            if (body && typeof body === 'object' && !Array.isArray(body)) {
              // Quick heuristic: If it looks like a serialized FormData object with 'type' keys
              const isFormData = Object.values(body).some(v => v && (v.type === 'file' || v.type === 'text'));
              if (isFormData) {
                body = deserializeFormData(body);
              }
            }

            // Retry the API fetch bypassing the offline check inside apiClient
            // We just construct a raw fetch to ensure we don't requeue if something goes wrong
            await apiFetch(item.path, {
              method: item.method,
              headers: item.headers,
              body: body
            });

            // Remove from queue on success
            await removeMutation(item.id);
            console.log(`Successfully synced mutation ${item.id}`);
          } catch (err) {
            console.error(`Failed to sync mutation ${item.id}`, err);
          }
        }
      } catch (err) {
        console.error('Error reading queue', err);
      } finally {
        setIsSyncing(false);
      }
    };

    window.addEventListener('online', handleOnline);

    // Initial check in case we load the app online but with pending queue
    if (navigator.onLine) {
      handleOnline();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  if (isSyncing) {
    return (
      <div className="fixed bottom-4 right-4 bg-emerald-500/90 text-white text-xs px-3 py-1.5 rounded-full shadow-lg z-50 flex items-center gap-2 backdrop-blur-sm animate-pulse border border-emerald-400">
        <span className="w-2 h-2 rounded-full bg-white block animate-ping" />
        Syncing offline data...
      </div>
    );
  }

  return null;
}

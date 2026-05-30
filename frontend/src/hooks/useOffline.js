import { useState, useEffect } from 'react';

/**
 * React hook that tracks the browser's online/offline status.
 *
 * Uses `navigator.onLine` for the initial value and listens for the
 * `online` / `offline` window events to keep the value reactive.
 *
 * @returns {{ isOffline: boolean }}
 *
 * @example
 *   const { isOffline } = useOffline();
 *   if (isOffline) return <OfflineBanner />;
 */
export function useOffline() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const goOffline = () => setIsOffline(true);
    const goOnline = () => setIsOffline(false);

    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);

    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online', goOnline);
    };
  }, []);

  return { isOffline };
}

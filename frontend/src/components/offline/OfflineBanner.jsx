import { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="bg-amber-500/90 text-amber-50 px-4 py-2 flex items-center justify-center gap-2 text-xs font-semibold backdrop-blur-md z-[100] sticky top-0 border-b border-amber-600 shadow-sm animate-in slide-in-from-top-full">
      <WifiOff size={14} className="animate-pulse" />
      <span>You are offline. RoadWatch is operating in local cache mode.</span>
    </div>
  );
}

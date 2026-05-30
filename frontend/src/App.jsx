import { useState, useEffect } from 'react';
import { Map, MessageSquare, WifiOff, CheckCircle, ClipboardList } from 'lucide-react';
import ChatWindow from './components/ChatWindow';
import MapView from './features/MapView';
import MyComplaints from './features/MyComplaints';
import { getComplaints, clearComplaints } from './services/db';
import { useLanguage } from '../context/LanguageContext';

export default function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [chatTrigger, setChatTrigger] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncMessage, setSyncMessage] = useState(null);
  const { t } = useLanguage();

  useEffect(() => {
    const handleOffline = () => setIsOnline(false);
    const handleOnline = async () => {
      setIsOnline(true);
      const queued = await getComplaints();
      if (queued && queued.length > 0) {
        setSyncMessage(`✅ Back online — syncing ${queued.length} complaints...`);
        // Simulate sync delay
        setTimeout(async () => {
          await clearComplaints();
          setSyncMessage(null);
        }, 3000);
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  function handleSwitchToChat(message) {
    setChatTrigger(message);
    setActiveTab('chat');
  }

  return (
    // Mobile-first shell: max 430px centered, full height
    <div className="flex items-center justify-center w-full h-full bg-slate-950">
      {/* Phone shell */}
      <div
        className="relative w-full h-full flex flex-col overflow-hidden shadow-2xl shadow-black/60"
        style={{ maxWidth: '430px', maxHeight: '100dvh' }}
      >
        {/* Status bar (cosmetic, mobile feel) */}
        <div className="shrink-0 flex items-center justify-between px-5 pt-2 pb-1 bg-slate-800/90 relative z-[2000]">
          <span className="text-slate-400 text-[10px] font-semibold">9:41</span>
          <div className="flex items-center gap-1">
            <div className="w-3.5 h-2 bg-slate-400 rounded-[2px]" />
            <div className="w-0.5 h-1 bg-slate-400 rounded-r-sm" />
          </div>
        </div>

        {/* Offline Banner */}
        {(!isOnline || syncMessage) && (
          <div className={`shrink-0 flex items-center justify-center py-2 px-4 text-xs font-semibold text-white z-[2000] shadow-md transition-colors ${!isOnline ? 'bg-amber-600' : 'bg-emerald-600'}`}>
            {!isOnline ? (
              <><WifiOff size={14} className="mr-2" /> ⚡ You're offline — using cached data. Complaints will sync automatically.</>
            ) : (
              <><CheckCircle size={14} className="mr-2" /> {syncMessage}</>
            )}
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden relative">
          {activeTab === 'chat' ? (
            <ChatWindow initialTrigger={chatTrigger} onClearTrigger={() => setChatTrigger(null)} />
          ) : activeTab === 'map' ? (
            <MapView onSwitchToChat={handleSwitchToChat} />
          ) : (
            <MyComplaints />
          )}
        </div>

        {/* Bottom Navigation */}
        <div className="shrink-0 bg-slate-900 border-t border-slate-800 flex items-center justify-around pb-6 pt-3 px-4">
          <button 
            onClick={() => setActiveTab('chat')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'chat' ? 'text-indigo-400' : 'text-slate-500'}`}
          >
            <MessageSquare size={20} className={activeTab === 'chat' ? 'fill-indigo-900/40' : ''} />
            <span className="text-[10px] font-medium">{t('tabAssistant')}</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('map')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'map' ? 'text-indigo-400' : 'text-slate-500'}`}
          >
            <Map size={20} className={activeTab === 'map' ? 'fill-indigo-900/40' : ''} />
            <span className="text-[10px] font-medium">{t('tabMap')}</span>
          </button>

          <button 
            onClick={() => setActiveTab('complaints')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'complaints' ? 'text-indigo-400' : 'text-slate-500'}`}
          >
            <ClipboardList size={20} className={activeTab === 'complaints' ? 'fill-indigo-900/40' : ''} />
            <span className="text-[10px] font-medium">{t('tabComplaints')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

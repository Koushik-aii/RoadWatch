import { useState, useEffect } from 'react';
import { Map, MessageSquare, WifiOff, CheckCircle, ClipboardList, RefreshCw } from 'lucide-react';
import ChatWindow from './components/ChatWindow';
import MapView from './features/MapView';
import MyComplaints from './features/MyComplaints';
import { useOffline } from './hooks/useOffline';
import { useSyncQueue } from './hooks/useSyncQueue';
import { useLanguage } from './context/LanguageContext';

// ── Offline Banner Component ─────────────────────────────────
function OfflineBanner({ isOffline, syncMessage, pendingCount, isSyncing }) {
  if (!isOffline && !syncMessage) return null;

  return (
    <div
      className={`shrink-0 flex items-center justify-center py-2 px-4 text-xs font-semibold text-white z-[2000] shadow-md transition-colors ${
        isOffline ? 'bg-amber-600' : 'bg-emerald-600'
      }`}
    >
      {isOffline ? (
        <>
          <WifiOff size={14} className="mr-2" />
          ⚡ You're offline — using cached data.
          {pendingCount > 0 && ` ${pendingCount} complaint${pendingCount > 1 ? 's' : ''} queued.`}
          {pendingCount === 0 && ' Complaints will sync automatically.'}
        </>
      ) : (
        <>
          {isSyncing ? (
            <RefreshCw size={14} className="mr-2 animate-spin" />
          ) : (
            <CheckCircle size={14} className="mr-2" />
          )}
          {syncMessage}
        </>
      )}
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [chatTrigger, setChatTrigger] = useState(null);
  const { t } = useLanguage();

  // ── PWA hooks ──────────────────────────────────────────────
  const { isOffline } = useOffline();
  const { syncMessage, pendingCount, isSyncing } = useSyncQueue();

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

        {/* Offline / Sync Banner */}
        <OfflineBanner
          isOffline={isOffline}
          syncMessage={syncMessage}
          pendingCount={pendingCount}
          isSyncing={isSyncing}
        />

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

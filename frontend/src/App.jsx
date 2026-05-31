import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, Map, MessageSquare, WifiOff, CheckCircle, ClipboardList, RefreshCw, ScanLine, LogOut, User } from 'lucide-react';
import { useAuth } from './context/AuthContext';
import ChatWindow from './components/ChatWindow';
import MapView from './features/MapView';
import MyComplaints from './features/MyComplaints';
import RoadDamageDetector from './features/RoadDamageDetector';
import AnalyticsDashboard from './features/AnalyticsDashboard';
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
  const { user, logout, isAdmin, isOfficer } = useAuth();

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
        <div className="shrink-0 flex items-center justify-between px-4 pt-2 pb-1 bg-slate-800/90 relative z-[2000]">
          <div className="flex items-center gap-1.5 min-w-0">
            <User size={12} className="text-indigo-400 shrink-0" />
            <span className="text-slate-400 text-[10px] truncate max-w-[120px]">{user?.full_name}</span>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Link to="/admin" className="text-[10px] text-indigo-400 font-medium">Admin</Link>
            )}
            {isOfficer && (
              <Link to="/officer" className="text-[10px] text-amber-400 font-medium">Officer</Link>
            )}
            <button type="button" onClick={logout} className="text-slate-500 hover:text-red-400" aria-label="Logout">
              <LogOut size={14} />
            </button>
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
          ) : activeTab === 'scan' ? (
            <RoadDamageDetector />
          ) : activeTab === 'analytics' ? (
            <AnalyticsDashboard />
          ) : (
            <MyComplaints />
          )}
        </div>

        {/* Bottom Navigation — 4 tabs */}
        <div className="shrink-0 bg-slate-900 border-t border-slate-800 flex items-center justify-around pb-6 pt-3 px-4">
          <button 
            onClick={() => setActiveTab('chat')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'chat' ? 'text-indigo-400' : 'text-slate-500'}`}
          >
            <MessageSquare size={20} className={activeTab === 'chat' ? 'fill-indigo-900/40' : ''} />
            <span className="text-[10px] font-medium">{t('tabAssistant')}</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('scan')}
            className={`flex flex-col items-center gap-1 relative ${activeTab === 'scan' ? 'text-indigo-400' : 'text-slate-500'}`}
          >
            <ScanLine size={20} className={activeTab === 'scan' ? 'fill-indigo-900/40' : ''} />
            <span className="text-[10px] font-medium">AI Scan</span>
            {/* "AI" badge */}
            <span className="absolute -top-1 -right-2 text-[7px] font-bold bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-1.5 py-0.5 rounded-full shadow-sm shadow-indigo-500/30">
              AI
            </span>
          </button>

          <button 
            onClick={() => setActiveTab('map')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'map' ? 'text-indigo-400' : 'text-slate-500'}`}
          >
            <Map size={20} className={activeTab === 'map' ? 'fill-indigo-900/40' : ''} />
            <span className="text-[10px] font-medium">{t('tabMap')}</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'analytics' ? 'text-indigo-400' : 'text-slate-500'}`}
          >
            <BarChart3 size={20} className={activeTab === 'analytics' ? 'fill-indigo-900/40' : ''} />
            <span className="text-[10px] font-medium">Intel</span>
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

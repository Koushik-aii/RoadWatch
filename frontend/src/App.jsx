import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, Map, MessageSquare, WifiOff, CheckCircle, ClipboardList, RefreshCw, ScanLine, LogOut, User, Shield } from 'lucide-react';
import { useAuth } from './context/AuthContext';
import ChatWindow from './components/ChatWindow';
import MapView from './features/MapView';
import MyComplaints from './features/MyComplaints';
import RoadDamageDetector from './features/RoadDamageDetector';
import AnalyticsDashboard from './features/AnalyticsDashboard';
import SyncManager from './components/offline/SyncManager';
import OfflineBanner from './components/offline/OfflineBanner';
import { useLanguage } from './context/LanguageContext';

// ── Tab Configuration ─────────────────────────────────────────
const TABS = [
  { id: 'chat', label: 'Assistant', labelKey: 'tabAssistant', icon: MessageSquare },
  { id: 'scan', label: 'AI Scan', icon: ScanLine, hasBadge: true },
  { id: 'map', label: 'Map', labelKey: 'tabMap', icon: Map },
  { id: 'analytics', label: 'Intel', icon: BarChart3 },
  { id: 'complaints', label: 'Complaints', labelKey: 'tabComplaints', icon: ClipboardList },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [chatTrigger, setChatTrigger] = useState(null);
  const { t } = useLanguage();
  const { user, logout, isAdmin, isOfficer } = useAuth();



  function handleSwitchToChat(message) {
    setChatTrigger(message);
    setActiveTab('chat');
  }

  return (
    <div className="flex items-center justify-center w-full h-full bg-slate-950">
      {/* Responsive shell — mobile-first with breakpoints */}
      <div
        className="relative w-full h-full flex flex-col overflow-hidden shadow-2xl shadow-black/60 lg:rounded-2xl lg:border lg:border-slate-800"
        style={{ maxWidth: '100%', maxHeight: '100dvh' }}
      >
        {/* Header bar */}
        <div className="shrink-0 flex items-center justify-between px-4 pt-2 pb-1 bg-slate-800/90 relative z-[2000]">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm shadow-indigo-500/20">
              <Shield size={11} className="text-white" />
            </div>
            <div className="min-w-0">
              <span className="text-white text-[11px] font-bold font-display block leading-tight">RoadWatch</span>
              <span className="text-slate-500 text-[9px] truncate block max-w-[120px]">{user?.full_name}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {(isAdmin || isOfficer) && (
              <Link to="/authority" className="text-[10px] text-amber-400 font-medium px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-colors">
                Authority
              </Link>
            )}
            {isAdmin && (
              <Link to="/admin" className="text-[10px] text-indigo-400 font-medium">Admin</Link>
            )}
            <button type="button" onClick={logout} className="text-slate-500 hover:text-red-400 transition-colors" aria-label="Logout">
              <LogOut size={14} />
            </button>
          </div>
        </div>

        {/* Offline / Sync Banner */}
        <OfflineBanner />
        <SyncManager />

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

        {/* Bottom Navigation */}
        <div className="shrink-0 bg-slate-900 border-t border-slate-800 flex items-center justify-around pb-6 pt-3 px-4 sm:pb-3">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const label = tab.labelKey ? t(tab.labelKey) : tab.label;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-1 relative transition-colors ${
                  isActive ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-400'
                }`}
              >
                <Icon size={20} className={isActive ? 'fill-indigo-900/40' : ''} />
                <span className="text-[10px] font-medium">{label}</span>
                {tab.hasBadge && (
                  <span className="absolute -top-1 -right-2 text-[7px] font-bold bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-1.5 py-0.5 rounded-full shadow-sm shadow-indigo-500/30">
                    AI
                  </span>
                )}
                {isActive && (
                  <span className="absolute -bottom-3 w-1 h-1 bg-indigo-400 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

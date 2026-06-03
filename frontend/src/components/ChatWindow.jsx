import { useState, useRef, useEffect } from 'react';
import { MapPin, Send, Mic, Activity, Camera, AlertTriangle, Info, Globe, ChevronRight, Bot, User } from 'lucide-react';
import { detectIntent } from '../services/intentEngine';
import { getComplaint, listComplaints } from '../services/complaintsApi';
import { apiFetch } from '../services/apiClient';
import { resolveAuthority } from '../services/jurisdictionService';
import { useCountry } from '../context/CountryContext';
import { CardSkeleton } from './SkeletonLoaders';
import OnboardingTour from './OnboardingTour';
import RoadInfoCard from './cards/RoadInfoCard';
import BudgetCard from './cards/BudgetCard';
import ReportIssueCard from './cards/ReportIssueCard';
import TrackComplaintCard from './cards/TrackComplaintCard';
import RoadListCard from './cards/RoadListCard';
import { useLanguage } from '../context/LanguageContext';
import { getQrLabel, getQrCmd } from '../data/translations';

// ── Welcome message ──────────────────────────────────────────
const WELCOME = (t) => ({
  id: 'welcome',
  role: 'bot',
  intent: 'welcome',
  text: t('welcomeText'),
  quickReplies: t('qrDefault'),
});

// ── Default fallback ─────────────────────────────────────────
const DEFAULT_MSG = (text, t) => ({
  role: 'bot',
  intent: 'default',
  text: `I'm not quite sure how to help with that. Try asking about a specific road (e.g. "roads in Vijayawada"), reporting an issue, or checking a budget.`,
  quickReplies: t('qrDefault'),
});

// ── Render card by intent ────────────────────────────────────
function BotCard({ message, onComplaintFiled, onSelectRoad }) {
  const { intent, data, roadType, rawId } = message;
  
  if (intent === 'roadInfo') return <RoadInfoCard data={data} />;
  if (intent === 'roadDiscovery') return <RoadListCard data={data} onSelectRoad={onSelectRoad} />;
  if (intent === 'budget') return <BudgetCard data={data} />;
  if (intent === 'report') return <ReportIssueCard data={data} roadType={roadType} onComplaintFiled={onComplaintFiled} />;
  if (intent === 'track') return <TrackComplaintCard data={data} />;
  
  return null;
}

// ── Typing indicator ─────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 px-3">
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shrink-0">
        <Bot size={13} className="text-white" />
      </div>
      <div className="bg-slate-700/80 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1 items-center">
        {[0, 1, 2].map(i => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}

// ── Main Chatbot ─────────────────────────────────────────────
export default function ChatWindow({ initialTrigger, onClearTrigger }) {
  const { country, setCountry, config } = useCountry();
  const { lang, setLang, t, languages } = useLanguage();
  const [messages, setMessages] = useState([WELCOME(t)]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Conversation Memory State
  const [sessionMemory, setSessionMemory] = useState({
    lastRoadResults: null,
    lastComplaintResults: null,
    lastBudgetResults: null
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (initialTrigger) {
      (async () => {
        await handleSend(initialTrigger);
        onClearTrigger?.();
      })();
    }
  }, [initialTrigger]);

  async function searchRoadsApi(query) {
    try {
      const res = await apiFetch(`api/roads/search?q=${encodeURIComponent(query)}`);
      return res;
    } catch (err) {
      console.error("Road search failed:", err);
      if (err.message.includes('offline')) {
        return { error: 'offline' };
      }
      return { results: [], exact_match: false };
    }
  }

  async function fetchRoadDetails(roadId) {
    try {
      const res = await apiFetch(`api/roads/${encodeURIComponent(roadId)}`);
      return res;
    } catch (err) {
      console.error("Failed to fetch road details:", err);
      if (err.message.includes('offline')) {
        return { error: 'offline' };
      }
      return null;
    }
  }

  async function handleSend(text = input) {
    const trimmed = text.trim();
    if (!trimmed) return;
    setInput('');

    const userMsg = { id: Date.now(), role: 'user', text: trimmed };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const result = await detectIntent(trimmed);
      let botMsg = { id: Date.now() + 1, role: 'bot' };

      if (result.intent === 'greeting') {
        botMsg = {
          ...botMsg,
          intent: 'greeting',
          text: t('welcomeText') || "Hello! I am your RoadWatch assistant. How can I help you today?",
          quickReplies: t('qrDefault'),
        };
      } 
      else if (result.intent === 'roadDiscovery') {
        const searchRes = await searchRoadsApi(result.query);
        
        if (searchRes.error === 'offline') {
           botMsg = {
             ...botMsg,
             intent: 'default',
             text: `You are currently offline, and I don't have "${result.query}" saved in your local cache. Please connect to the internet to search for new roads.`,
             quickReplies: t('qrDefault')
           };
        } else if (searchRes.results.length === 0) {
           botMsg = {
             ...botMsg,
             intent: 'default',
             text: `I couldn't find any roads matching "${result.query}". Try searching with a broader term or different district.`,
             quickReplies: t('qrDefault')
           };
        } else if (searchRes.exact_match) {
           // We have an exact match -> show RoadInfoCard
           const topRoad = searchRes.results[0].road;
           setSessionMemory(prev => ({ ...prev, lastRoadResults: searchRes.results }));
           botMsg = {
             ...botMsg,
             intent: 'roadInfo',
             text: t('botRoadInfo', { name: topRoad.name }) || `Here is the info for ${topRoad.name}:`,
             data: topRoad,
             quickReplies: t('qrRoadInfo')
           };
        } else {
           // Multiple fuzzy matches -> show RoadListCard
           setSessionMemory(prev => ({ ...prev, lastRoadResults: searchRes.results }));
           const topMatch = searchRes.results[0]?.road;
           const loc = topMatch?.district || topMatch?.state || "your region";
           botMsg = {
             ...botMsg,
             intent: 'roadDiscovery',
             text: `I couldn't find an exact match for that specific road. However, here are some roads in ${loc} that might help:`,
             data: searchRes.results, // Pass the search results array
             quickReplies: t('qrDefault')
           };
        }
      else if (result.intent === 'budget' || result.intent === 'analytics') {
        let targetRoad = null;
        let searchRes = null;
        
        // 1. Try searching the query directly
        if (result.query) {
           searchRes = await searchRoadsApi(result.query);
           if (searchRes.results.length > 0 && searchRes.exact_match) {
              targetRoad = searchRes.results[0].road;
           }
        }
        
        // 2. Fallback to memory
        if (!targetRoad && sessionMemory.lastRoadResults && sessionMemory.lastRoadResults.length > 0) {
           targetRoad = sessionMemory.lastRoadResults[0].road;
        }

        if (targetRoad) {
           botMsg = {
             ...botMsg,
             intent: result.intent,
             text: result.intent === 'budget' ? `Budget details for ${targetRoad.name}:` : `Analytics for ${targetRoad.name}:`,
             data: targetRoad,
             quickReplies: t('qrBudget')
           };
        } else if (searchRes && searchRes.results.length > 0) {
           // Show regional list
           setSessionMemory(prev => ({ ...prev, lastRoadResults: searchRes.results }));
           const topMatch = searchRes.results[0]?.road;
           const loc = topMatch?.district || topMatch?.state || "your region";
           botMsg = {
             ...botMsg,
             intent: 'roadDiscovery',
             text: `I found multiple roads in ${loc}. Which road would you like ${result.intent} details for?`,
             data: searchRes.results,
             quickReplies: t('qrDefault')
           };
        } else {
           botMsg = {
             ...botMsg,
             intent: 'default',
             text: `Which road's ${result.intent} would you like to see? You can specify a city or road name.`,
             quickReplies: t('qrDefault')
           };
        }
      } 
      else if (result.intent === 'report') {
        botMsg = {
          ...botMsg,
          intent: 'report',
          text: t('botReport'),
          data: result.data,
          roadType: result.roadType,
          quickReplies: t('qrReport'),
        };
      } 
      else if (result.intent === 'track') {
        let trackData = null;
        const rawId = result.rawId;

        if (rawId) {
          try {
            trackData = await getComplaint(rawId);
          } catch { /* ignore */ }
        }

        if (!trackData) {
          try {
            const list = await listComplaints({ page: 1, page_size: 5 });
            if (list.items && list.items.length > 0) {
              // If user asks "my complaints", show the most recent one for now
              // (In the future, we could add a ComplaintListCard)
              trackData = list.items[0];
            }
          } catch { /* ignore */ }
        }

        if (trackData) {
          botMsg = {
            ...botMsg,
            intent: 'track',
            text: t('botTrack', { id: trackData.complaint_id || trackData.uuid }),
            data: trackData,
            quickReplies: t('qrTrack'),
          };
        } else {
          botMsg = {
            ...botMsg,
            intent: 'default',
            text: rawId
              ? `Complaint ${rawId} was not found. Check the ID or file a new report.`
              : 'You have no active complaints. Please provide a complaint ID (e.g. RW-2044) to track status.',
            quickReplies: t('qrTrack'),
          };
        }
      } 
      else {
        botMsg = { ...botMsg, ...DEFAULT_MSG(trimmed, t) };
      }

      setMessages(prev => [...prev, botMsg]);
    } finally {
      setIsTyping(false);
    }
  }

  // Handle selection from RoadListCard
  async function handleSelectRoad(roadId) {
    const road = await fetchRoadDetails(roadId);
    if (road) {
      const botMsg = {
        id: Date.now(),
        role: 'bot',
        intent: 'roadInfo',
        text: t('botRoadInfo', { name: road.name }) || `Here is the info for ${road.name}:`,
        data: road,
        quickReplies: t('qrRoadInfo')
      };
      setMessages(prev => [...prev, botMsg]);
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex flex-col h-full bg-slate-900 font-sans w-full max-w-[430px] mx-auto relative">
      <OnboardingTour />
      
      {/* ── Top Badge ── */}
      <div className="absolute top-14 left-0 w-full z-10 flex justify-center pointer-events-none mt-2">
        <div className="bg-indigo-600 text-[10px] font-bold px-3 py-1 rounded-full text-white shadow-lg pointer-events-auto flex items-center gap-1.5 border border-indigo-400/30">
          <Globe size={10} /> {t('countryBadge')}
        </div>
      </div>

      {/* ── Header ── */}
      <div className="shrink-0 px-4 py-3 bg-slate-800/90 border-b border-slate-700/60 flex items-center gap-3 backdrop-blur-md">
        <div className="relative">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-900/40">
            <Activity size={18} className="text-white" />
          </div>
          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-slate-800 rounded-full"></div>
        </div>
        <div className="flex-1">
          <h1 className="text-white font-bold text-sm tracking-wide">{t('chatHeaderTitle')}</h1>
          <p className="text-emerald-400 text-[10px] font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
            {t('chatHeaderSubtitle')}
          </p>
        </div>
        
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value)}
          className="bg-slate-700/80 border border-slate-600 text-white text-xs font-bold rounded-full px-2 py-1 outline-none appearance-none cursor-pointer"
        >
          {languages.map(l => (
            <option key={l.code} value={l.code}>{l.label}</option>
          ))}
        </select>

        <button 
          onClick={() => setCountry(country === 'IN' ? 'GB' : 'IN')}
          className="ml-auto w-8 h-8 rounded-full bg-slate-700/80 flex items-center justify-center text-lg border border-slate-600 shadow-inner hover:bg-slate-600 transition-colors"
          title={`Switch to ${country === 'IN' ? 'UK' : 'India'}`}
        >
          {config.flag} {config.code}
        </button>
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 px-0" id="chat-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col gap-1.5 ${msg.role === 'user' ? 'items-end px-3' : 'items-start'}`}>
            <div className={`flex items-end gap-2 max-w-full ${msg.role === 'user' ? 'flex-row-reverse' : 'px-3'}`}>
              {msg.role === 'bot' && (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shrink-0 mb-0.5">
                  <Bot size={13} className="text-white" />
                </div>
              )}
              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center shrink-0 mb-0.5">
                  <User size={13} className="text-slate-300" />
                </div>
              )}
              <div className={`px-3.5 py-2.5 rounded-2xl text-xs max-w-[78%] leading-relaxed whitespace-pre-line ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-sm'
                  : 'bg-slate-700/80 text-slate-200 rounded-bl-sm'
              }`}>
                {msg.text}
              </div>
            </div>

            {msg.role === 'bot' && (msg.data || msg.intent === 'roadDiscovery') && (
              <div className="px-3 w-full max-w-[calc(100%-2.25rem)] self-start ml-9">
                <BotCard message={msg} onSelectRoad={handleSelectRoad} />
              </div>
            )}

            {msg.role === 'bot' && msg.quickReplies && (
              <div className="flex flex-wrap gap-1.5 px-3 ml-9">
                {msg.quickReplies.map((qr, idx) => {
                  const label = getQrLabel(qr);
                  const cmd = getQrCmd(qr);
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSend(cmd.replace(' →', ''))}
                      className="flex items-center gap-1 text-[10px] px-3 py-1.5 rounded-full border border-slate-600 text-slate-300 bg-slate-800/80 hover:border-indigo-500 hover:text-indigo-300 transition-all active:scale-95"
                    >
                      {label} <ChevronRight size={9} />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex flex-col gap-2">
            <TypingIndicator />
            <div className="px-3 ml-9 w-full max-w-[calc(100%-2.25rem)]">
              <CardSkeleton />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Input Bar ── */}
      <div className="shrink-0 px-3 py-3 bg-slate-800/90 border-t border-slate-700/60 backdrop-blur-md">
        <div className="flex items-center gap-2 bg-slate-700/60 rounded-2xl px-3 py-2 border border-slate-600/60 focus-within:border-indigo-500/60 transition-colors">
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder={t('inputPlaceholder')}
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 outline-none"
          />
          <button className="text-slate-500 hover:text-slate-300 transition-colors p-0.5" title="Voice input">
            <Mic size={17} />
          </button>
          <button
            onClick={() => handleSend()}
            disabled={!input.trim()}
            className="w-8 h-8 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all active:scale-95"
          >
            <Send size={14} className="text-white" />
          </button>
        </div>
        <p className="text-slate-600 text-[9px] text-center mt-1.5">
          {t('inputHint')}
        </p>
      </div>
    </div>
  );
}

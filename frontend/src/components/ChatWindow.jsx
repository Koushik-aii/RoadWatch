import { useState, useRef, useEffect } from 'react';
import { MapPin, Send, Mic, Activity, Camera, AlertTriangle, Info, Globe, ChevronRight, Bot, User } from 'lucide-react';
import { detectIntent } from '../services/intentEngine';
import { getComplaint, listComplaints } from '../services/complaintsApi';
import { MOCK_COMPLAINTS } from '../data/mockData';
import { QUICK_REPLIES } from '../data/mockData';
import { resolveAuthority } from '../services/jurisdictionService';
import { useCountry } from '../context/CountryContext';
import { CardSkeleton } from './SkeletonLoaders';
import OnboardingTour from './OnboardingTour';
import RoadInfoCard from './cards/RoadInfoCard';
import BudgetCard from './cards/BudgetCard';
import ReportIssueCard from './cards/ReportIssueCard';
import TrackComplaintCard from './cards/TrackComplaintCard';
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

// ── Not found error card ──────────────────────────────────────
const NOT_FOUND_MSG = (roadKey, t) => ({
  role: 'bot',
  intent: 'notFound',
  text: t('botNotFound'),
  data: { road: roadKey, jurisdiction: resolveAuthority('Andhra Pradesh', 'Krishna', 'SH') },
  quickReplies: t('qrNotFound'),
});

// ── Default fallback ─────────────────────────────────────────
const DEFAULT_MSG = (text, t) => ({
  role: 'bot',
  intent: 'default',
  text: t('botDefault', { text }),
  quickReplies: t('qrDefault'),
});

// ── Render card by intent ────────────────────────────────────
function BotCard({ message, onComplaintFiled }) {
  const { intent, data, roadType } = message;
  if (intent === 'roadInfo') return <RoadInfoCard data={data} />;
  if (intent === 'budget') return <BudgetCard data={data} />;
  if (intent === 'report') return <ReportIssueCard data={data} roadType={roadType} onComplaintFiled={onComplaintFiled} />;
  if (intent === 'track') return <TrackComplaintCard data={data} />;
  if (intent === 'notFound') return (
    <div className="rounded-2xl bg-slate-800/80 border-l-4 border-amber-500 overflow-hidden w-full">
      <div className="px-4 py-3 flex items-start gap-3">
        <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-amber-300 text-xs font-semibold">{message.t ? message.t('notFoundTitle') : 'Road not in database'}</p>
          <p className="text-slate-400 text-[10px] mt-1">{message.t ? message.t('notFoundDesc') : 'Generic Executive Engineer assigned for manual review:'}</p>
          <p className="text-white text-xs font-medium mt-1">{data.jurisdiction.authority_name}</p>
          <a href={`mailto:${data.jurisdiction.email}`} className="text-indigo-400 text-[10px] hover:underline">{data.jurisdiction.email}</a>
        </div>
      </div>
    </div>
  );
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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (initialTrigger) {
      // Wrap in an async IIFE — React effects must not return Promises
      (async () => {
        await handleSend(initialTrigger);
        onClearTrigger?.();
      })();
    }
  }, [initialTrigger]);

  async function handleSend(text = input) {
    const trimmed = text.trim();
    if (!trimmed) return;
    setInput('');

    // Add user message immediately
    const userMsg = { id: Date.now(), role: 'user', text: trimmed };
    setMessages(prev => [...prev, userMsg]);

    // Show typing indicator while Gemini classifies (or fallback runs)
    setIsTyping(true);

    try {
      // detectIntent is now async — awaits Gemini with a 2 s timeout fallback
      const result = await detectIntent(trimmed);
      let botMsg;

      if (result.intent === 'roadInfo') {
        botMsg = {
          id: Date.now() + 1,
          role: 'bot',
          intent: 'roadInfo',
          text: t('botRoadInfo', { name: result.data.name }),
          data: result.data,
          quickReplies: t('qrRoadInfo'),
        };
      } else if (result.intent === 'budget') {
        botMsg = {
          id: Date.now() + 1,
          role: 'bot',
          intent: 'budget',
          text: t('botBudget', { name: result.data.roadName }),
          data: result.data,
          quickReplies: t('qrBudget'),
        };
      } else if (result.intent === 'report') {
        botMsg = {
          id: Date.now() + 1,
          role: 'bot',
          intent: 'report',
          text: t('botReport'),
          data: result.data,
          roadType: result.roadType,
          quickReplies: t('qrReport'),
        };
      } else if (result.intent === 'track') {
        let trackData = null;
        const rawId = result.rawId;

        if (rawId && navigator.onLine) {
          try {
            trackData = await getComplaint(rawId);
          } catch {
            trackData = MOCK_COMPLAINTS[rawId] || null;
          }
        } else if (rawId) {
          trackData = MOCK_COMPLAINTS[rawId] || null;
        }

        if (!trackData && navigator.onLine) {
          try {
            const list = await listComplaints({ page: 1, page_size: 1 });
            trackData = list.items?.[0] || null;
          } catch { /* ignore */ }
        }

        const id = rawId || trackData?.id || 'a complaint';
        botMsg = trackData
          ? {
              id: Date.now() + 1,
              role: 'bot',
              intent: 'track',
              text: t('botTrack', { id }),
              data: trackData,
              quickReplies: t('qrTrack'),
            }
          : {
              id: Date.now() + 1,
              role: 'bot',
              intent: 'default',
              text: rawId
                ? `Complaint ${rawId} was not found. Check the ID or file a new report.`
                : 'Please provide a complaint ID (e.g. RW-2044) to track status.',
              quickReplies: t('qrTrack'),
            };
      } else if (result.intent === 'notFound') {
        botMsg = { id: Date.now() + 1, ...NOT_FOUND_MSG(result.roadKey, t) };
      } else {
        botMsg = { id: Date.now() + 1, ...DEFAULT_MSG(trimmed, t) };
      }

      setMessages(prev => [...prev, botMsg]);
    } finally {
      // Always hide the typing indicator, even if something throws unexpectedly
      setIsTyping(false);
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
        
        {/* Language Switcher */}
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
            {/* Bubble row */}
            <div className={`flex items-end gap-2 max-w-full ${msg.role === 'user' ? 'flex-row-reverse' : 'px-3'}`}>
              {/* Avatar */}
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

              {/* Text bubble */}
              <div className={`px-3.5 py-2.5 rounded-2xl text-xs max-w-[78%] leading-relaxed whitespace-pre-line ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-sm'
                  : 'bg-slate-700/80 text-slate-200 rounded-bl-sm'
              }`}>
                {msg.text}
              </div>
            </div>

            {/* Card (bot only) */}
            {msg.role === 'bot' && msg.data && (
              <div className="px-3 w-full max-w-[calc(100%-2.25rem)] self-start ml-9">
                <BotCard message={msg} />
              </div>
            )}

            {/* Quick Replies */}
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

        {/* Typing indicator with skeleton */}
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

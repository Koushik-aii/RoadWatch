import { useState, useEffect } from 'react';
import { X, MessageSquare, ShieldCheck, AlertCircle } from 'lucide-react';

const getSteps = (t) => [
  {
    id: 1,
    icon: <MessageSquare size={22} className="text-indigo-400" />,
    title: t('tour1Title'),
    body: t('tour1Body'),
    highlight: 'input',
    arrowDirection: 'down',
    arrowLabel: t('tourArrowChatInput'),
  },
  {
    id: 2,
    icon: <ShieldCheck size={22} className="text-emerald-400" />,
    title: t('tour2Title'),
    body: t('tour2Body'),
    highlight: 'authority',
    arrowDirection: 'up',
    arrowLabel: t('tourArrowChat'),
  },
  {
    id: 3,
    icon: <AlertCircle size={22} className="text-rose-400" />,
    title: t('tour3Title'),
    body: t('tour3Body'),
    highlight: 'report',
    arrowDirection: 'up',
    arrowLabel: t('tourArrowChat'),
  },
];

const STORAGE_KEY = 'roadwatch_onboarding_done';

// Animated arrow component
function Arrow({ direction, label }) {
  const isDown = direction === 'down';
  return (
    <div className={`flex flex-col items-center gap-1 ${isDown ? 'order-last mt-2' : 'order-first mb-2'}`}>
      <span className="text-[9px] font-semibold text-indigo-400 uppercase tracking-widest opacity-80">{label}</span>
      <div
        className={`flex flex-col items-center gap-0.5 ${isDown ? '' : 'flex-col-reverse'}`}
        style={{ animation: 'arrowBounce 1s ease-in-out infinite' }}
      >
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="w-0 h-0"
            style={{
              borderLeft: '5px solid transparent',
              borderRight: '5px solid transparent',
              ...(isDown
                ? { borderTop: '6px solid #6366f1', opacity: 1 - i * 0.25 }
                : { borderBottom: '6px solid #6366f1', opacity: 1 - i * 0.25 }),
            }}
          />
        ))}
      </div>
    </div>
  );
}

import { useLanguage } from '../context/LanguageContext';

export default function OnboardingTour() {
  const { t } = useLanguage();
  const STEPS = getSteps(t);
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const done = localStorage.getItem(STORAGE_KEY);
    if (!done) {
      // Small delay so app renders first
      const t = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  function handleNext() {
    if (step < STEPS.length - 1) {
      setStep(s => s + 1);
    } else {
      dismiss();
    }
  }

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, '1');
    setVisible(false);
  }

  if (!visible) return null;

  const current = STEPS[step];
  const isDownArrow = current.arrowDirection === 'down';

  return (
    <>
      {/* Keyframe for arrow bounce animation */}
      <style>{`
        @keyframes arrowBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(${isDownArrow ? '4px' : '-4px'}); }
        }
      `}</style>

      <div className="absolute inset-0 z-[9999] flex items-end justify-center pb-24 px-4 pointer-events-none">
        {/* Backdrop blur */}
        <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm pointer-events-auto" onClick={dismiss} />

        {/* Highlight ring on step 1 — glows around the chat input area */}
        {step === 0 && (
          <div
            className="absolute bottom-[72px] inset-x-3 h-12 rounded-2xl pointer-events-none"
            style={{
              boxShadow: '0 0 0 2px #6366f1, 0 0 20px 4px rgba(99,102,241,0.35)',
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          />
        )}

        {/* Tooltip card */}
        <div className={`relative pointer-events-auto w-full max-w-[360px] flex flex-col ${isDownArrow ? 'flex-col' : 'flex-col-reverse'}`}>
          {/* Animated Arrow */}
          <Arrow direction={current.arrowDirection} label={current.arrowLabel} />

          {/* Main card */}
          <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden"
            style={{ animation: 'fadeSlideIn 0.3s ease-out' }}>
            <style>{`
              @keyframes fadeSlideIn {
                from { opacity: 0; transform: translateY(12px); }
                to { opacity: 1; transform: translateY(0); }
              }
            `}</style>

            {/* Progress dots */}
            <div className="flex gap-1.5 items-center justify-center pt-4 pb-2">
              {STEPS.map((s, i) => (
                <div
                  key={s.id}
                  className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-6 bg-indigo-500' : 'w-1.5 bg-slate-600'}`}
                />
              ))}
            </div>

            {/* Content */}
            <div className="px-5 pb-3 pt-2 flex gap-4 items-start">
              <div className="shrink-0 w-10 h-10 rounded-xl bg-slate-700/80 flex items-center justify-center mt-0.5">
                {current.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-bold text-sm leading-snug">{current.title}</h3>
                <p className="text-slate-400 text-xs mt-1 leading-relaxed">{current.body}</p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-5 pb-4 pt-1">
              <button
                onClick={dismiss}
                className="text-xs text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1"
              >
                <X size={11} /> {t('tourBtnSkip')}
              </button>
              <button
                onClick={handleNext}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors active:scale-95"
              >
                {step < STEPS.length - 1 ? t('tourBtnNext', { n: step + 2, total: STEPS.length }) : t('tourBtnDone')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

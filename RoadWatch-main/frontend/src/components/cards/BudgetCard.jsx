import { ExternalLink, AlertTriangle, TrendingUp, Zap } from 'lucide-react';
import { useCountry } from '../../context/CountryContext';
import { useLanguage } from '../../context/LanguageContext';

export default function BudgetCard({ data }) {
  const { config } = useCountry();
  const { t } = useLanguage();
  const pct = data.utilisedPct;
  const isOverdue = !!data.flag;

  return (
    <div className="rounded-2xl bg-slate-800/80 border-l-4 border-emerald-500 overflow-hidden w-full">
      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-white text-sm">{t('budgetTitle', { name: data.roadName })}</h3>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white bg-emerald-600">
            {data.phase}
          </span>
        </div>
        <a
          href={data.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-emerald-400 text-[10px] hover:underline mt-1"
        >
          <ExternalLink size={9} /> {t('budgetSource')} {data.source} — {data.sourceUrl.replace('https://', '')}
        </a>
      </div>

      {/* Budget Numbers */}
      <div className="px-4 pb-3 grid grid-cols-2 gap-3">
        <div className="bg-slate-700/50 rounded-xl p-3 text-center">
          <div className="text-slate-400 text-[10px] uppercase tracking-wide">{t('budgetSanctioned')}</div>
          <div className="text-white font-bold text-lg mt-0.5">{config.currency}{data.sanctioned} {config.code === 'GB' ? 'M' : 'Cr'}</div>
        </div>
        <div className="bg-slate-700/50 rounded-xl p-3 text-center">
          <div className="text-slate-400 text-[10px] uppercase tracking-wide">{t('budgetDisbursed')}</div>
          <div className="text-emerald-400 font-bold text-lg mt-0.5">{config.currency}{data.disbursed} {config.code === 'GB' ? 'M' : 'Cr'}</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-4 pb-3">
        <div className="flex justify-between text-[10px] text-slate-400 mb-1.5">
          <span className="flex items-center gap-1"><TrendingUp size={10} /> {t('budgetUtilisation')}</span>
          <span className="font-semibold text-emerald-400">{t('budgetUsed', { pct })}</span>
        </div>
        <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Overdue Warning */}
      {data.flag && (
        <div className="mx-4 mb-3 flex items-start gap-2 bg-red-900/40 border border-red-700/60 rounded-xl px-3 py-2.5">
          <AlertTriangle size={14} className="text-red-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-semibold text-red-400">{t('budgetOverdueAlert')}</span>
            <span className="text-red-300/80 ml-1">
              {data.flag}
            </span>
          </div>
        </div>
      )}

      {/* Accident Data */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-700/40 text-[10px]">
        <div className="flex items-center gap-1.5 text-slate-300">
          <Zap size={11} className="text-yellow-400" />
          <span className="text-yellow-400 font-bold">{t('budgetAccidents', { count: data.accidentCount })}</span>
          <span className="text-slate-500">{t('budgetAccidentsSub')}</span>
        </div>
        <a
          href={data.accidentSourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-slate-400 hover:text-slate-200 hover:underline"
        >
          {data.accidentSource} <ExternalLink size={9} />
        </a>
      </div>
    </div>
  );
}

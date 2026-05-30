import { useState } from 'react';
import { Camera, MapPin, ChevronDown, CheckCircle2, Phone, Mail, ExternalLink, AlertCircle, ShieldAlert, WifiOff } from 'lucide-react';
import { ROAD_TYPE_COLORS } from '../../data/mockData';
import { useCountry } from '../../context/CountryContext';
import { saveComplaint } from '../../services/db';
import { useLanguage } from '../../context/LanguageContext';

export default function ReportIssueCard({ data, roadType, onComplaintFiled }) {
  const { config } = useCountry();
  const { t } = useLanguage();
  const DEFECT_TYPES = t('defects');
  const [step, setStep] = useState(1);
  const [formState, setFormState] = useState({
    defectType: '',
    hasPhoto: false,
    gpsDetected: false,
    gpsValue: '',
  });
  const [complaintId, setComplaintId] = useState('');
  const [wasOffline, setWasOffline] = useState(false);
  const colors = ROAD_TYPE_COLORS[roadType] || ROAD_TYPE_COLORS['SH'];

  function handleGPS() {
    // Simulate GPS detection
    setTimeout(() => {
      setFormState(s => ({ ...s, gpsDetected: true, gpsValue: '16.5062° N, 80.6480° E (Vijayawada)' }));
    }, 900);
    setFormState(s => ({ ...s, gpsDetected: false, gpsValue: t('reportGpsDetecting') }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const id = 'RW-' + Math.floor(1000 + Math.random() * 9000);
    setComplaintId(id);

    // Save to localStorage so MyComplaints page shows it
    const newComplaint = {
      id,
      issue: `${formState.defectType || 'Issue'} on ${data?.authority_name || roadType}`,
      road: roadType,
      stage: 0,
      filedDate: new Date().toISOString().slice(0, 10),
      overdue: false,
    };
    const existing = JSON.parse(localStorage.getItem('roadwatch_complaints') || '[]');
    localStorage.setItem('roadwatch_complaints', JSON.stringify([newComplaint, ...existing]));

    if (!navigator.onLine) {
      setWasOffline(true);
      await saveComplaint({ id, data, roadType, formState });
    }
    
    setStep(2);
    if (onComplaintFiled) onComplaintFiled(id);
  }

  return (
    <div className={`rounded-2xl bg-slate-800/80 border-l-4 ${colors.border} overflow-hidden w-full`}>
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-white text-sm">{t('reportTitle')}</h3>
          <p className="text-slate-400 text-[10px] mt-0.5">
            {step === 1 ? t('reportStep1Sub') : (wasOffline ? t('reportStep2SubOffline') : t('reportStep2Sub'))}
          </p>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${colors.bg}`}>
          {t('reportStepBadge', { n: step })}
        </span>
      </div>

      {step === 1 ? (
        <form onSubmit={handleSubmit} className="px-4 pb-4 space-y-3">
          {/* Photo Upload */}
          <div>
            <label className="text-slate-400 text-[10px] uppercase tracking-wide block mb-1">{t('reportPhotoLabel')}</label>
            <button
              type="button"
              onClick={() => setFormState(s => ({ ...s, hasPhoto: !s.hasPhoto }))}
              className={`w-full flex items-center justify-center gap-2 border-2 border-dashed rounded-xl py-4 text-xs transition-all ${
                formState.hasPhoto
                  ? `border-${colors.border.replace('border-','')} bg-slate-700/30 text-white`
                  : 'border-slate-600 text-slate-500 hover:border-slate-400'
              }`}
            >
              {formState.hasPhoto ? (
                <><CheckCircle2 size={14} className={colors.text} /> {t('reportPhotoAttached')}</>
              ) : (
                <><Camera size={14} /> {t('reportPhotoBtn')}</>
              )}
            </button>
          </div>

          {/* GPS */}
          <div>
            <label className="text-slate-400 text-[10px] uppercase tracking-wide block mb-1">{t('reportGpsLabel')}</label>
            <button
              type="button"
              onClick={handleGPS}
              className={`w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-medium transition-all ${
                formState.gpsDetected
                  ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-700/50'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              <MapPin size={13} />
              {formState.gpsValue || t('reportGpsBtn')}
            </button>
          </div>

          {/* Defect Type */}
          <div>
            <label className="text-slate-400 text-[10px] uppercase tracking-wide block mb-1">{t('reportDefectLabel')}</label>
            <div className="relative">
              <select
                required
                value={formState.defectType}
                onChange={e => setFormState(s => ({ ...s, defectType: e.target.value }))}
                className="w-full bg-slate-700 text-white text-xs rounded-xl px-3 py-2.5 pr-8 appearance-none border border-slate-600 focus:outline-none focus:border-slate-400"
              >
                <option value="">{t('reportDefectPlaceholder')}</option>
                {(Array.isArray(DEFECT_TYPES) ? DEFECT_TYPES : []).map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <button
            type="submit"
            className={`w-full py-3 rounded-xl text-xs font-bold text-white ${colors.bg} hover:opacity-90 transition-opacity`}
          >
            {t('reportSubmitBtn')}
          </button>
        </form>
      ) : (
        <div className="px-4 pb-4 space-y-3">
          {/* Success / Offline Banner */}
          <div className={`flex items-center gap-3 border rounded-xl px-3 py-3 ${wasOffline ? 'bg-amber-900/40 border-amber-700/50' : 'bg-emerald-900/40 border-emerald-700/50'}`}>
            {wasOffline ? (
              <WifiOff size={20} className="text-amber-400 shrink-0" />
            ) : (
              <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
            )}
            <div>
              <div className={`font-bold text-sm ${wasOffline ? 'text-amber-400' : 'text-emerald-400'}`}>
                {wasOffline ? t('reportOfflineId', { id: complaintId }) : t('reportSuccessId', { id: complaintId })}
              </div>
              <div className={`text-[10px] ${wasOffline ? 'text-amber-300/70' : 'text-emerald-300/70'}`}>
                {wasOffline ? t('reportOfflineDesc') : t('reportSuccessDesc')}
              </div>
            </div>
          </div>

          {/* Jurisdiction Card */}
          <div className="bg-slate-700/30 rounded-xl p-3 border border-slate-700">
            <div className="text-[10px] text-slate-400 mb-1 flex items-center gap-1">
              <ShieldAlert size={10} /> {t('reportRoutingLabel')}
            </div>
            <div className="font-semibold text-white text-sm">{config?.code === 'GB' ? config.authority_levels[0] : data.authority_name}</div>
            <div className="text-xs text-indigo-400 mt-0.5">{config?.code === 'GB' ? config.complaint_endpoint : data.designation}</div>
            <div className="mt-2.5 space-y-1.5">
              <a href={`mailto:${data.email}`} className={`flex items-center gap-1.5 text-[10px] ${colors.text} hover:underline`}>
                <Mail size={10} /> {data.email}
              </a>
              <div className="flex items-center gap-1.5 text-slate-400 text-[10px]">
                <Phone size={10} /> {data.phone}
              </div>
              <a href={data.complaint_portal} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-1 text-[10px] ${colors.text} hover:underline`}>
                <ExternalLink size={9} /> {t('reportOfficialPortal')}
              </a>
            </div>
          </div>

          <div className="flex items-start gap-2 text-[10px] text-slate-500">
            <AlertCircle size={11} className="shrink-0 mt-0.5" />
            <span>{t('reportEscalation', { name: data.escalation })}</span>
          </div>
        </div>
      )}
    </div>
  );
}

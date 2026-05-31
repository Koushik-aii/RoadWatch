import { useState } from 'react';
import { Camera, MapPin, ChevronDown, CheckCircle2, Phone, Mail, ExternalLink, AlertCircle, ShieldAlert, WifiOff, Loader } from 'lucide-react';
import { ROAD_TYPE_COLORS } from '../../data/mockData';
import { useCountry } from '../../context/CountryContext';
import { saveComplaint, saveToHistory } from '../../services/db';
import { useLanguage } from '../../context/LanguageContext';
import { resolveAuthorityByCoords } from '../../services/jurisdictionService';
import {
  buildCreatePayload,
  createComplaint,
  createComplaintWithImage,
  parseGpsString,
} from '../../services/complaintsApi';

export default function ReportIssueCard({ data: initialData, roadType, onComplaintFiled }) {
  const { config } = useCountry();
  const { t } = useLanguage();
  const DEFECT_TYPES = t('defects');
  const [step, setStep] = useState(1);
  const [formState, setFormState] = useState({
    defectType: '',
    hasPhoto: false,
    gpsDetected: false,
    gpsValue: '',
    latitude: null,
    longitude: null,
  });
  const [data, setData] = useState(initialData);
  const [complaintId, setComplaintId] = useState('');
  const [wasOffline, setWasOffline] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const colors = ROAD_TYPE_COLORS[roadType] || ROAD_TYPE_COLORS['SH'];

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState('');
  const [gpsLoading, setGpsLoading] = useState(false);

  function handlePhotoChange(e) {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setFormState(s => ({ ...s, hasPhoto: true }));
      const url = URL.createObjectURL(file);
      setPhotoPreviewUrl(url);
    }
  }

  function formatCoords(lat, lng) {
    const latDir = lat >= 0 ? 'N' : 'S';
    const lngDir = lng >= 0 ? 'E' : 'W';
    return `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lng).toFixed(4)}° ${lngDir}`;
  }

  function handleGPS() {
    setGpsLoading(true);
    setFormState(s => ({ ...s, gpsDetected: false, gpsValue: t('reportGpsDetecting') }));

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const formatted = formatCoords(latitude, longitude);

          setFormState(s => ({
            ...s,
            gpsDetected: true,
            gpsValue: formatted,
            latitude,
            longitude,
          }));
          setGpsLoading(false);

          const resolved = resolveAuthorityByCoords(latitude, longitude, roadType);
          if (resolved) {
            setData(resolved);
          }
        },
        (error) => {
          console.warn('[GPS] Geolocation failed:', error);
          let errMsg = 'Location access denied';
          if (error.code === 1) errMsg = 'Location permission denied';
          else if (error.code === 2) errMsg = 'Location unavailable';
          else if (error.code === 3) errMsg = 'Location request timed out';
          setFormState(s => ({
            ...s,
            gpsDetected: false,
            gpsValue: errMsg,
          }));
          setGpsLoading(false);
        },
        { timeout: 8000, enableHighAccuracy: true }
      );
    } else {
      setFormState(s => ({
        ...s,
        gpsDetected: false,
        gpsValue: 'Geolocation not supported',
      }));
      setGpsLoading(false);
    }
  }

  async function queueOffline(complaintId, photoBase64) {
    setWasOffline(true);
    await saveComplaint({
      id: complaintId,
      data,
      roadType,
      formState: { ...formState, photo: photoBase64 },
    });
    const newComplaint = {
      id: complaintId,
      issue: `${formState.defectType || 'Issue'} on ${data?.authority_name || roadType}`,
      road: roadType,
      roadType,
      district: data?.district || 'Krishna',
      state: data?.state || 'Andhra Pradesh',
      stage: 0,
      filedDate: new Date().toISOString().slice(0, 10),
      authority_name: data?.authority_name || 'R&B Division',
      authority_email: data?.email || '',
      overdue: false,
      photo: photoBase64,
    };
    await saveToHistory(newComplaint);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');

    const coords =
      formState.latitude != null
        ? { lat: formState.latitude, lng: formState.longitude }
        : parseGpsString(formState.gpsValue);

    if (!navigator.onLine) {
      const offlineId = 'RW-' + Math.floor(1000 + Math.random() * 9000);
      setComplaintId(offlineId);
      let photoBase64 = null;
      if (photoFile) {
        try {
          photoBase64 = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(photoFile);
          });
        } catch (err) {
          console.error('Failed to convert photo', err);
        }
      }
      await queueOffline(offlineId, photoBase64);
      setStep(2);
      setIsSubmitting(false);
      if (onComplaintFiled) onComplaintFiled(offlineId);
      return;
    }

    try {
      let result;
      const payload = buildCreatePayload({ formState, data, roadType, coords });

      if (photoFile) {
        const fd = new FormData();
        fd.append('lat', String(payload.lat));
        fd.append('lng', String(payload.lng));
        fd.append('district', payload.district);
        fd.append('state', payload.state);
        fd.append('title', payload.title);
        fd.append('description', payload.description);
        fd.append('issue_type', payload.issue_type);
        fd.append('road_type', payload.road_type);
        fd.append('country', payload.country);
        fd.append('image', photoFile);
        result = await createComplaintWithImage(fd);
      } else {
        result = await createComplaint(payload);
      }

      const id = result.complaint_id;
      const complaint = result.complaint;
      setComplaintId(id);
      setWasOffline(false);

      if (complaint) {
        await saveToHistory({
          ...complaint,
          id,
          photo: complaint.image_url || complaint.photo,
        });
      }

      setStep(2);
      if (onComplaintFiled) onComplaintFiled(id);
    } catch (err) {
      console.error('[Report] API submit failed:', err);
      setSubmitError(err.message || 'Failed to submit complaint');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={`rounded-2xl bg-slate-800/80 border-l-4 ${colors.border} overflow-hidden w-full`}>
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
          <div>
            <label className="text-slate-400 text-[10px] uppercase tracking-wide block mb-1">{t('reportPhotoLabel')}</label>
            <label
              className={`w-full flex items-center justify-center gap-2 border-2 border-dashed rounded-xl py-4 text-xs transition-all cursor-pointer ${
                formState.hasPhoto
                  ? `border-${colors.border.replace('border-','')} bg-slate-700/30 text-white`
                  : 'border-slate-600 text-slate-500 hover:border-slate-400'
              }`}
            >
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoChange}
                className="hidden"
              />
              {formState.hasPhoto ? (
                <><CheckCircle2 size={14} className={colors.text} /> {t('reportPhotoAttached')}</>
              ) : (
                <><Camera size={14} /> {t('reportPhotoBtn')}</>
              )}
            </label>
            {photoPreviewUrl && (
              <div className="mt-2 flex justify-center">
                <img
                  src={photoPreviewUrl}
                  alt="Preview"
                  className="w-16 h-16 object-cover rounded-lg border border-slate-600 shadow-md"
                />
              </div>
            )}
          </div>

          <div>
            <label className="text-slate-400 text-[10px] uppercase tracking-wide block mb-1">{t('reportGpsLabel')}</label>
            <button
              type="button"
              disabled={gpsLoading}
              onClick={handleGPS}
              className={`w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-medium transition-all ${
                formState.gpsDetected
                  ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-700/50'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {gpsLoading ? (
                <Loader className="animate-spin text-slate-400 mr-2" size={13} />
              ) : (
                <MapPin size={13} />
              )}
              {formState.gpsValue || t('reportGpsBtn')}
            </button>
          </div>

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

          {submitError && (
            <p className="text-red-400 text-[10px]">{submitError}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 rounded-xl text-xs font-bold text-white ${colors.bg} hover:opacity-90 transition-opacity disabled:opacity-60`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader className="animate-spin" size={14} /> Submitting…
              </span>
            ) : (
              t('reportSubmitBtn')
            )}
          </button>
        </form>
      ) : (
        <div className="px-4 pb-4 space-y-3">
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

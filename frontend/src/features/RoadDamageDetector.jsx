import { useState, useRef, useCallback } from 'react';
<<<<<<< Updated upstream
import { Upload, Camera, ScanLine, AlertTriangle, CheckCircle2, Shield, RotateCcw, Send, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import RiskScoreGauge from '../components/cards/RiskScoreGauge';
import DetectionResultCard from '../components/cards/DetectionResultCard';
import { detectRoadDamage, createComplaintFromDetection } from '../services/detectionApi';
=======
import { Upload, Camera, ScanLine, AlertTriangle, CheckCircle2, Shield, RotateCcw, Send, ChevronDown, ChevronUp, Sparkles, Play } from 'lucide-react';
import RiskScoreGauge from '../components/cards/RiskScoreGauge';
import DetectionResultCard from '../components/cards/DetectionResultCard';
import AIStatusLabel from '../components/ui/AIStatusLabel';
import ConfidenceMeter from '../components/ui/ConfidenceMeter';
import { detectRoadDamage, createComplaintFromDetection } from '../services/detectionApi';
import { useDemoMode } from '../hooks/useDemoMode';
>>>>>>> Stashed changes

const API_HOST = 'http://localhost:8000';

// ── Upload State Component ──────────────────────────────────
<<<<<<< Updated upstream
function UploadZone({ onFileSelect, isLoading }) {
=======
function UploadZone({ onFileSelect, onTryDemo, isLoading }) {
>>>>>>> Stashed changes
  const fileRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer?.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => setIsDragging(false), []);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-5 space-y-5">
      {/* Hero section */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <ScanLine size={28} className="text-white" />
        </div>
<<<<<<< Updated upstream
        <h2 className="text-white text-lg font-bold">AI Road Scanner</h2>
        <p className="text-slate-400 text-xs max-w-[280px] leading-relaxed">
          Upload a road photo to detect potholes using real YOLOv8 AI. Get instant severity analysis, risk scores, and repair priority estimates.
=======
        <h2 className="text-white text-lg font-bold font-display">AI Road Scanner</h2>
        <p className="text-slate-400 text-xs max-w-[280px] leading-relaxed">
          Upload a road photo to detect road defects using real YOLOv8 AI. Get instant severity analysis, risk scores, and repair priority estimates.
>>>>>>> Stashed changes
        </p>
      </div>

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileRef.current?.click()}
        className={`upload-dropzone w-full max-w-[340px] rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-300 ${
          isDragging
            ? 'border-indigo-400 bg-indigo-500/10 scale-[1.02]'
            : 'border-slate-600 bg-slate-800/40 hover:border-indigo-500/50 hover:bg-slate-800/60'
        }`}
      >
        <Upload size={32} className={`mx-auto mb-3 ${isDragging ? 'text-indigo-400' : 'text-slate-500'}`} />
        <p className="text-sm font-medium text-slate-300 mb-1">
          {isDragging ? 'Drop image here' : 'Drag & drop road photo'}
        </p>
        <p className="text-[10px] text-slate-500">or click to browse • JPG, PNG, WebP (max 10 MB)</p>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFileSelect(file);
          }}
        />
      </div>

<<<<<<< Updated upstream
      {/* Camera button (mobile-friendly) */}
      <button
        onClick={() => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'image/*';
          input.capture = 'environment';
          input.onchange = (e) => {
            const file = e.target.files?.[0];
            if (file) onFileSelect(file);
          };
          input.click();
        }}
        className="flex items-center gap-2 text-xs text-indigo-400 font-medium px-4 py-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors"
      >
        <Camera size={14} />
        Take Photo with Camera
      </button>

      {/* Future scope — honest and impressive */}
=======
      {/* Action buttons row */}
      <div className="flex gap-3 w-full max-w-[340px]">
        {/* Camera button */}
        <button
          onClick={() => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.capture = 'environment';
            input.onchange = (e) => {
              const file = e.target.files?.[0];
              if (file) onFileSelect(file);
            };
            input.click();
          }}
          className="flex-1 flex items-center justify-center gap-2 text-xs text-indigo-400 font-medium px-4 py-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors"
        >
          <Camera size={14} />
          Camera
        </button>

        {/* Demo button */}
        <button
          onClick={onTryDemo}
          className="flex-1 flex items-center justify-center gap-2 text-xs text-purple-400 font-medium px-4 py-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 transition-colors glow-ring"
        >
          <Play size={14} />
          Try Demo
        </button>
      </div>

      {/* Capabilities */}
>>>>>>> Stashed changes
      <div className="w-full max-w-[340px] bg-slate-800/30 rounded-xl border border-slate-700/30 p-3 mt-2">
        <p className="text-[10px] text-slate-500 font-semibold mb-2 flex items-center gap-1">
          <Sparkles size={10} /> DETECTION CAPABILITIES
        </p>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
<<<<<<< Updated upstream
            <span className="text-[11px] text-slate-300">Pothole Detection — <span className="text-emerald-400 font-semibold">Active (YOLOv8 AI)</span></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
            <span className="text-[11px] text-slate-500">Crack Detection — <span className="text-slate-600">Coming Soon</span></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
            <span className="text-[11px] text-slate-500">Waterlogging — <span className="text-slate-600">Coming Soon</span></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
            <span className="text-[11px] text-slate-500">Broken Road — <span className="text-slate-600">Coming Soon</span></span>
=======
            <span className="text-[11px] text-slate-300">Pothole Detection — <span className="text-emerald-400 font-semibold">Active</span></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
            <span className="text-[11px] text-slate-300">Crack Detection — <span className="text-emerald-400 font-semibold">Active</span></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
            <span className="text-[11px] text-slate-300">Waterlogging — <span className="text-emerald-400 font-semibold">Active</span></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
            <span className="text-[11px] text-slate-300">Missing Signage — <span className="text-emerald-400 font-semibold">Active</span></span>
>>>>>>> Stashed changes
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Scanning Animation ──────────────────────────────────────
<<<<<<< Updated upstream
function ScanningView({ previewUrl }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-5 space-y-5">
      <div className="relative w-full max-w-[340px] aspect-[4/3] rounded-2xl overflow-hidden border border-slate-700 bg-slate-800">
        {previewUrl && (
          <img src={previewUrl} alt="Scanning" className="w-full h-full object-cover opacity-60" />
        )}
        {/* Scan line animation */}
        <div className="absolute inset-0 scan-overlay" />
        <div className="scan-line" />
=======
function ScanningView({ previewUrl, isDemoMode }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-5 space-y-5">
      <div className="relative w-full max-w-[340px] aspect-[4/3] rounded-2xl overflow-hidden border border-slate-700 bg-slate-800">
        {previewUrl ? (
          <img src={previewUrl} alt="Scanning" className="w-full h-full object-cover opacity-60" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
            <ScanLine size={48} className="text-slate-700" />
          </div>
        )}
        {/* Scan line animation */}
        <div className="absolute inset-0 scan-overlay" />
        <div className="scan-line-anim" />
        {/* Demo badge */}
        {isDemoMode && (
          <div className="absolute top-3 left-3">
            <AIStatusLabel variant="assisted" size="sm" />
          </div>
        )}
>>>>>>> Stashed changes
      </div>

      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
          <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse animation-delay-150" />
          <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse animation-delay-300" />
        </div>
<<<<<<< Updated upstream
        <p className="text-indigo-400 text-sm font-semibold">AI is analyzing road surface...</p>
        <p className="text-slate-500 text-[10px]">Running YOLOv8 neural network inference</p>
=======
        <p className="text-indigo-400 text-sm font-semibold">
          {isDemoMode ? 'Running demo analysis...' : 'AI is analyzing road surface...'}
        </p>
        <p className="text-slate-500 text-[10px]">
          {isDemoMode ? 'Loading pre-computed AI result' : 'Running YOLOv8 neural network inference'}
        </p>
>>>>>>> Stashed changes
      </div>
    </div>
  );
}

// ── Results View ────────────────────────────────────────────
<<<<<<< Updated upstream
function ResultsView({ result, onCreateComplaint, onReset, complaintStatus }) {
=======
function ResultsView({ result, onCreateComplaint, onReset, complaintStatus, isDemoMode }) {
>>>>>>> Stashed changes
  const [showComplaintForm, setShowComplaintForm] = useState(false);
  const [complaintData, setComplaintData] = useState({
    latitude: '', longitude: '', district: '', state: '', road_type: ''
  });
  const [showAllDetections, setShowAllDetections] = useState(false);

  const hasDetections = result.detection_count > 0;
  const detections = result.detections || [];
  const visibleDetections = showAllDetections ? detections : detections.slice(0, 3);

  const handleSubmitComplaint = () => {
    if (!complaintData.latitude || !complaintData.longitude || !complaintData.district || !complaintData.state) {
      return;
    }
    onCreateComplaint({
      latitude: parseFloat(complaintData.latitude),
      longitude: parseFloat(complaintData.longitude),
      district: complaintData.district,
      state: complaintData.state,
      road_type: complaintData.road_type || 'Urban',
    });
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
<<<<<<< Updated upstream
      {/* Result image */}
      <div className="relative w-full rounded-2xl overflow-hidden border border-slate-700 bg-slate-800 shadow-xl">
        <img
          src={`${API_HOST}${result.result_image_url}`}
          alt="Detection result"
          className="w-full object-contain"
          onError={(e) => { e.target.src = `${API_HOST}${result.image_url}`; }}
        />
=======
      {/* AI Labels bar */}
      <div className="flex flex-wrap gap-2">
        {hasDetections && <AIStatusLabel variant="verified" />}
        <AIStatusLabel variant="analysis" />
        {hasDetections && result.overall_severity === 'Critical' && <AIStatusLabel variant="high-risk" />}
        {isDemoMode && <AIStatusLabel variant="assisted" />}
      </div>

      {/* Result image */}
      <div className="relative w-full rounded-2xl overflow-hidden border border-slate-700 bg-slate-800 shadow-xl">
        {isDemoMode ? (
          <div className="w-full aspect-[4/3] bg-gradient-to-br from-slate-800 to-slate-700 flex items-center justify-center">
            <div className="text-center space-y-2">
              <ScanLine size={40} className="mx-auto text-indigo-400/50" />
              <p className="text-slate-500 text-xs">Demo Detection Result</p>
            </div>
          </div>
        ) : (
          <img
            src={`${API_HOST}${result.result_image_url}`}
            alt="Detection result"
            className="w-full object-contain"
            onError={(e) => { e.target.src = `${API_HOST}${result.image_url}`; }}
          />
        )}
>>>>>>> Stashed changes
        {/* Detection count badge */}
        <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1.5">
          {hasDetections ? (
            <AlertTriangle size={12} className="text-amber-400" />
          ) : (
            <CheckCircle2 size={12} className="text-emerald-400" />
          )}
          <span className="text-xs font-bold text-white">
<<<<<<< Updated upstream
            {hasDetections ? `${result.detection_count} pothole${result.detection_count > 1 ? 's' : ''} found` : 'No damage detected'}
=======
            {hasDetections ? `${result.detection_count} issue${result.detection_count > 1 ? 's' : ''} found` : 'No damage detected'}
>>>>>>> Stashed changes
          </span>
        </div>
      </div>

<<<<<<< Updated upstream
      {/* Risk Score Gauge */}
      {hasDetections && (
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-4 flex flex-col items-center">
          <p className="text-[10px] text-slate-500 font-semibold mb-2 flex items-center gap-1">
            <Shield size={10} /> OVERALL ROAD RISK ASSESSMENT
          </p>
          <RiskScoreGauge score={result.overall_risk_score} severity={result.overall_severity} />
=======
      {/* Risk Score Gauge + Confidence Meter */}
      {hasDetections && (
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-4">
          <p className="text-[10px] text-slate-500 font-semibold mb-3 flex items-center gap-1">
            <Shield size={10} /> OVERALL ROAD RISK ASSESSMENT
          </p>
          <div className="flex items-center justify-around gap-4">
            <RiskScoreGauge score={result.overall_risk_score} severity={result.overall_severity} size={140} />
            <ConfidenceMeter
              value={Math.round((detections[0]?.confidence || 0) * 100)}
              label="Top Detection"
              size={90}
            />
          </div>
>>>>>>> Stashed changes
        </div>
      )}

      {/* No damage message */}
      {!hasDetections && (
        <div className="bg-emerald-500/10 rounded-2xl border border-emerald-500/20 p-5 text-center space-y-2">
          <CheckCircle2 size={32} className="mx-auto text-emerald-400" />
<<<<<<< Updated upstream
          <h3 className="text-emerald-400 font-bold text-sm">Road Appears Safe</h3>
          <p className="text-slate-400 text-xs">
            No potholes were detected in this image. The road surface appears to be in acceptable condition.
          </p>
=======
          <h3 className="text-emerald-400 font-bold text-sm">No Significant Road Damage Detected</h3>
          <p className="text-slate-400 text-xs">
            The AI analysis found no defects or significant road damage in this image. The road surface appears to be in acceptable condition.
          </p>
          <AIStatusLabel variant="verified" />
>>>>>>> Stashed changes
        </div>
      )}

      {/* Detection cards */}
      {hasDetections && (
        <div className="space-y-3">
          <p className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
            🔍 DETAILED DETECTIONS ({result.detection_count})
          </p>
          {visibleDetections.map((det, idx) => (
            <DetectionResultCard key={idx} detection={det} index={idx} />
          ))}
          {detections.length > 3 && (
            <button
              onClick={() => setShowAllDetections(!showAllDetections)}
              className="w-full flex items-center justify-center gap-1 text-[11px] text-indigo-400 font-medium py-2 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 transition-colors"
            >
              {showAllDetections ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              {showAllDetections ? 'Show Less' : `Show ${detections.length - 3} More`}
            </button>
          )}
        </div>
      )}

      {/* Status message */}
      <div className="bg-slate-800/30 rounded-xl p-3 border border-slate-700/30">
        <p className="text-[11px] text-slate-300 leading-relaxed">{result.message}</p>
<<<<<<< Updated upstream
=======
        <p className="text-[9px] text-slate-600 mt-1.5">
          Detection timestamp: {new Date().toLocaleString()}
        </p>
>>>>>>> Stashed changes
      </div>

      {/* Complaint section */}
      {hasDetections && (
        <div className="space-y-3">
          {complaintStatus === 'success' ? (
            <div className="bg-emerald-500/10 rounded-xl border border-emerald-500/20 p-4 text-center space-y-1">
              <CheckCircle2 size={20} className="mx-auto text-emerald-400" />
              <p className="text-emerald-400 text-xs font-bold">Complaint Created Successfully!</p>
              <p className="text-slate-400 text-[10px]">The complaint has been filed and will appear on the map.</p>
            </div>
          ) : complaintStatus === 'error' ? (
            <div className="bg-red-500/10 rounded-xl border border-red-500/20 p-3 text-center">
              <p className="text-red-400 text-xs">Failed to create complaint. Please try again.</p>
            </div>
          ) : showComplaintForm ? (
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-4 space-y-3">
              <p className="text-xs text-white font-semibold">📍 Location Details for Complaint</p>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  step="any"
                  placeholder="Latitude"
                  value={complaintData.latitude}
                  onChange={e => setComplaintData(d => ({ ...d, latitude: e.target.value }))}
                  className="bg-slate-700 text-white text-xs rounded-lg px-3 py-2 border border-slate-600 focus:border-indigo-500 focus:outline-none placeholder-slate-500"
                />
                <input
                  type="number"
                  step="any"
                  placeholder="Longitude"
                  value={complaintData.longitude}
                  onChange={e => setComplaintData(d => ({ ...d, longitude: e.target.value }))}
                  className="bg-slate-700 text-white text-xs rounded-lg px-3 py-2 border border-slate-600 focus:border-indigo-500 focus:outline-none placeholder-slate-500"
                />
                <input
                  type="text"
                  placeholder="District"
                  value={complaintData.district}
                  onChange={e => setComplaintData(d => ({ ...d, district: e.target.value }))}
                  className="bg-slate-700 text-white text-xs rounded-lg px-3 py-2 border border-slate-600 focus:border-indigo-500 focus:outline-none placeholder-slate-500"
                />
                <input
                  type="text"
                  placeholder="State"
                  value={complaintData.state}
                  onChange={e => setComplaintData(d => ({ ...d, state: e.target.value }))}
                  className="bg-slate-700 text-white text-xs rounded-lg px-3 py-2 border border-slate-600 focus:border-indigo-500 focus:outline-none placeholder-slate-500"
                />
              </div>
              <select
                value={complaintData.road_type}
                onChange={e => setComplaintData(d => ({ ...d, road_type: e.target.value }))}
                className="w-full bg-slate-700 text-white text-xs rounded-lg px-3 py-2 border border-slate-600 focus:border-indigo-500 focus:outline-none"
              >
                <option value="">Road Type (Optional)</option>
                <option value="NH">National Highway (NH)</option>
                <option value="SH">State Highway (SH)</option>
                <option value="MDR">Major District Road (MDR)</option>
                <option value="ODR">Other District Road (ODR)</option>
                <option value="VR">Village Road (VR)</option>
                <option value="Urban">Urban Road</option>
              </select>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowComplaintForm(false)}
                  className="flex-1 text-xs text-slate-400 font-medium py-2.5 rounded-xl border border-slate-600 hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitComplaint}
                  disabled={complaintStatus === 'loading'}
                  className="flex-1 flex items-center justify-center gap-1.5 text-xs text-white font-semibold py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 transition-all shadow-lg shadow-indigo-500/20"
                >
                  {complaintStatus === 'loading' ? (
                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Send size={12} />
                  )}
                  {complaintStatus === 'loading' ? 'Filing...' : 'File Complaint'}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowComplaintForm(true)}
              className="w-full flex items-center justify-center gap-2 text-xs text-white font-semibold py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg shadow-indigo-500/20"
            >
              <Send size={14} />
              Create Complaint from This Detection
            </button>
          )}
        </div>
      )}

      {/* Scan another */}
      <button
        onClick={onReset}
        className="w-full flex items-center justify-center gap-2 text-xs text-slate-300 font-medium py-3 rounded-xl border border-slate-600 hover:bg-slate-800 transition-colors"
      >
        <RotateCcw size={14} />
        Scan Another Road
      </button>
    </div>
  );
}


// ── Main Component ──────────────────────────────────────────
export default function RoadDamageDetector() {
  const [state, setState] = useState('upload');  // upload | scanning | results | error
  const [previewUrl, setPreviewUrl] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [complaintStatus, setComplaintStatus] = useState('idle'); // idle | loading | success | error
<<<<<<< Updated upstream
=======
  const { isDemoMode, triggerDemo, resetDemo } = useDemoMode();
>>>>>>> Stashed changes

  const handleFileSelect = async (file) => {
    // Show preview + scanning state
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setState('scanning');
    setError('');

    try {
      const data = await detectRoadDamage(file);
      setResult(data);
      setState('results');
    } catch (err) {
      console.error('Detection failed:', err);
      setError(err.message || 'Detection failed. Is the backend running?');
      setState('error');
    }
  };

<<<<<<< Updated upstream
  const handleCreateComplaint = async (complaintData) => {
=======
  const handleTryDemo = async () => {
    setPreviewUrl(null);
    setState('scanning');
    setError('');

    try {
      const data = await triggerDemo();
      setResult(data);
      setState('results');
    } catch (err) {
      setError('Demo failed unexpectedly');
      setState('error');
    }
  };

  const handleCreateComplaint = async (complaintData) => {
    if (isDemoMode) {
      // Simulate complaint creation in demo mode
      setComplaintStatus('loading');
      setTimeout(() => setComplaintStatus('success'), 1500);
      return;
    }
>>>>>>> Stashed changes
    if (!result?.detection_id) return;
    setComplaintStatus('loading');
    try {
      await createComplaintFromDetection(result.detection_id, complaintData);
      setComplaintStatus('success');
    } catch (err) {
      console.error('Complaint creation failed:', err);
      setComplaintStatus('error');
    }
  };

  const handleReset = () => {
    setState('upload');
    setPreviewUrl(null);
    setResult(null);
    setError('');
    setComplaintStatus('idle');
<<<<<<< Updated upstream
=======
    resetDemo();
>>>>>>> Stashed changes
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-900 overflow-hidden">
      {/* Header */}
      <div className="shrink-0 bg-slate-800/80 backdrop-blur-md border-b border-slate-700/50 px-4 py-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
          <ScanLine size={16} className="text-white" />
        </div>
<<<<<<< Updated upstream
        <div>
          <h1 className="text-white text-sm font-bold">AI Road Damage Scanner</h1>
          <p className="text-slate-500 text-[10px]">Powered by YOLOv8 Neural Network</p>
        </div>
=======
        <div className="flex-1">
          <h1 className="text-white text-sm font-bold font-display">AI Road Damage Scanner</h1>
          <p className="text-slate-500 text-[10px]">Powered by YOLOv8 Neural Network</p>
        </div>
        {isDemoMode && <AIStatusLabel variant="assisted" size="sm" />}
>>>>>>> Stashed changes
      </div>

      {/* Content */}
      {state === 'upload' && (
<<<<<<< Updated upstream
        <UploadZone onFileSelect={handleFileSelect} />
      )}

      {state === 'scanning' && (
        <ScanningView previewUrl={previewUrl} />
=======
        <UploadZone onFileSelect={handleFileSelect} onTryDemo={handleTryDemo} />
      )}

      {state === 'scanning' && (
        <ScanningView previewUrl={previewUrl} isDemoMode={isDemoMode} />
>>>>>>> Stashed changes
      )}

      {state === 'results' && result && (
        <ResultsView
          result={result}
          onCreateComplaint={handleCreateComplaint}
          onReset={handleReset}
          complaintStatus={complaintStatus}
<<<<<<< Updated upstream
=======
          isDemoMode={isDemoMode}
>>>>>>> Stashed changes
        />
      )}

      {state === 'error' && (
        <div className="flex-1 flex flex-col items-center justify-center p-5 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
            <AlertTriangle size={28} className="text-red-400" />
          </div>
          <div className="text-center space-y-1">
            <h3 className="text-red-400 font-bold text-sm">Detection Failed</h3>
            <p className="text-slate-400 text-xs max-w-[280px]">{error}</p>
          </div>
<<<<<<< Updated upstream
          <button
            onClick={handleReset}
            className="flex items-center gap-2 text-xs text-indigo-400 font-medium px-4 py-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors"
          >
            <RotateCcw size={14} />
            Try Again
          </button>
=======
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 text-xs text-indigo-400 font-medium px-4 py-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors"
            >
              <RotateCcw size={14} />
              Try Again
            </button>
            <button
              onClick={handleTryDemo}
              className="flex items-center gap-2 text-xs text-purple-400 font-medium px-4 py-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 transition-colors"
            >
              <Play size={14} />
              Try Demo
            </button>
          </div>
>>>>>>> Stashed changes
        </div>
      )}
    </div>
  );
}

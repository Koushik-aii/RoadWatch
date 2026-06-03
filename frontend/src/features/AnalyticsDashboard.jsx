import { useMemo, useState } from 'react';
import { Activity, AlertTriangle, CheckCircle2, Clock3, Gauge, MapPin, RefreshCw } from 'lucide-react';
import MetricCard from '../components/analytics/MetricCard';
import { BarListChart, DonutChart, TrendChart } from '../components/analytics/SimpleCharts';
import StatsGrid from '../components/analytics/StatsGrid';
import DangerousRoadsWidget from '../components/analytics/DangerousRoadsWidget';
import AccidentHotspotsWidget from '../components/analytics/AccidentHotspotsWidget';
import { useAnalytics } from '../hooks/useAnalytics';

const SEVERITIES = ['All', 'Low', 'Medium', 'High', 'Critical'];

export default function AnalyticsDashboard() {
  const [filters, setFilters] = useState({
    district: 'All',
    severity: 'All',
    startDate: '',
    endDate: '',
    maxPoints: 8000,
  });
  const { data, loading, error } = useAnalytics(filters, { pollMs: 30000 });
  const summary = data?.summary || {};
  const districts = data?.filters?.districts || [];
  const criticalRegions = data?.critical_regions || [];
  const dangerousZones = data?.map?.dangerous_zones || [];

  const regionRows = useMemo(
    () =>
      criticalRegions.map((region) => ({
        ...region,
        label: `${region.district}, ${region.state}`,
      })),
    [criticalRegions],
  );

  function updateFilter(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="h-full overflow-y-auto bg-[#07130f] text-white">
      <div className="sticky top-0 z-20 border-b border-emerald-900/50 bg-[#07130f]/95 px-4 py-3 backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-base font-bold font-display">GIS Intelligence</h1>
            <p className="text-[11px] text-emerald-200/60">Live complaint density, risk, and resolution analytics</p>
          </div>
          <span className="flex items-center gap-1 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-[10px] text-emerald-200">
            <RefreshCw size={11} className={loading ? 'animate-spin' : ''} />
            Live
          </span>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <select
            className="rounded-md border border-slate-700 bg-slate-950 px-2 py-2 text-xs text-slate-200"
            value={filters.district}
            onChange={(event) => updateFilter('district', event.target.value)}
          >
            <option value="All">All districts</option>
            {districts.map((district) => (
              <option key={district} value={district}>{district}</option>
            ))}
          </select>
          <select
            className="rounded-md border border-slate-700 bg-slate-950 px-2 py-2 text-xs text-slate-200"
            value={filters.severity}
            onChange={(event) => updateFilter('severity', event.target.value)}
          >
            {SEVERITIES.map((severity) => (
              <option key={severity} value={severity}>{severity === 'All' ? 'All severities' : severity}</option>
            ))}
          </select>
          <input
            type="date"
            className="rounded-md border border-slate-700 bg-slate-950 px-2 py-2 text-xs text-slate-200"
            value={filters.startDate}
            onChange={(event) => updateFilter('startDate', event.target.value)}
          />
          <input
            type="date"
            className="rounded-md border border-slate-700 bg-slate-950 px-2 py-2 text-xs text-slate-200"
            value={filters.endDate}
            onChange={(event) => updateFilter('endDate', event.target.value)}
          />
        </div>
      </div>

      <main className="space-y-4 p-4">
        {error && <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-200">{error}</div>}

        {/* Platform-wide stats */}
        <StatsGrid />

        {/* Quick metrics */}
        <section className="grid grid-cols-2 gap-3">
          <MetricCard icon={Activity} label="Total" value={summary.total ?? 0} detail="filtered complaints" tone="cyan" />
          <MetricCard icon={AlertTriangle} label="Critical" value={summary.critical ?? 0} detail="highest severity" tone="red" />
          <MetricCard icon={CheckCircle2} label="Resolved" value={`${summary.resolution_rate ?? 0}%`} detail={`${summary.resolved ?? 0} closed`} tone="emerald" />
          <MetricCard icon={Clock3} label="Avg time" value={`${summary.avg_resolution_days ?? 0}d`} detail="resolution duration" tone="amber" />
        </section>

        <TrendChart data={data?.complaint_trends || []} />
        <DonutChart data={data?.severity_distribution || []} />

        {/* Most Dangerous Roads */}
        <DangerousRoadsWidget />
        
        {/* Accident Risk Analytics */}
        <AccidentHotspotsWidget />

        <BarListChart title="Department performance" data={data?.department_performance || []} labelKey="department" valueKey="resolution_rate" />
        <BarListChart title="Most reported roads" data={data?.most_reported_roads || []} labelKey="name" valueKey="complaints" />
        <BarListChart title="Critical regions" data={regionRows} labelKey="label" valueKey="risk_score" />

        <section className="rounded-lg border border-slate-800 bg-slate-900/70 p-3">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-xs font-semibold text-white">
              <Gauge size={14} className="text-red-300" />
              Dangerous road zones
            </h3>
            <span className="text-[10px] text-slate-500">{dangerousZones.length} predicted</span>
          </div>
          <div className="space-y-2">
            {dangerousZones.length === 0 && <div className="text-xs text-slate-500">No dangerous zones detected for this filter.</div>}
            {dangerousZones.slice(0, 6).map((zone) => (
              <div key={zone.id} className="rounded-md border border-red-500/10 bg-red-500/5 p-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex min-w-0 items-center gap-1.5 text-xs font-semibold text-white">
                    <MapPin size={12} className="text-red-300" />
                    {zone.lat}, {zone.lng}
                  </span>
                  <span className="rounded bg-red-500/20 px-1.5 py-0.5 text-[10px] text-red-100">{zone.prediction}</span>
                </div>
                <div className="mt-1 text-[11px] text-slate-400">{zone.reason} &middot; risk {zone.risk_score}</div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

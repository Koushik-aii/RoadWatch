import { MapPin, TrendingDown, TrendingUp } from 'lucide-react';

export default function DistrictAnalyticsWidget() {
  const districts = [
    { name: 'Visakhapatnam', volume: 145, resolvedRate: 45, trend: 'up' },
    { name: 'Guntur', volume: 89, resolvedRate: 72, trend: 'down' },
    { name: 'Krishna', volume: 64, resolvedRate: 88, trend: 'down' },
    { name: 'East Godavari', volume: 112, resolvedRate: 51, trend: 'up' },
  ];

  return (
    <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-4 lg:p-5 h-full">
      <div className="flex items-center gap-2 mb-4">
        <MapPin size={16} className="text-cyan-500" />
        <div>
          <h2 className="font-display font-bold text-sm text-slate-100">District Performance</h2>
          <p className="text-slate-500 text-[10px] mt-0.5">Complaint volume vs resolution rate</p>
        </div>
      </div>

      <div className="space-y-4 mt-2">
        {districts.map((d, i) => (
          <div key={i} className="group">
            <div className="flex justify-between text-[10px] mb-1">
              <span className="font-semibold text-slate-300">{d.name}</span>
              <div className="flex items-center gap-2 text-slate-500">
                <span>{d.volume} cases</span>
                {d.trend === 'up' ? <TrendingUp size={10} className="text-red-400" /> : <TrendingDown size={10} className="text-emerald-400" />}
              </div>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 flex overflow-hidden">
              <div 
                className={`h-1.5 ${d.resolvedRate < 50 ? 'bg-red-500' : d.resolvedRate < 75 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                style={{ width: `${d.resolvedRate}%` }} 
              />
            </div>
            <div className="text-[9px] mt-0.5 text-right text-slate-500">{d.resolvedRate}% SLA Compliance</div>
          </div>
        ))}
      </div>
    </div>
  );
}

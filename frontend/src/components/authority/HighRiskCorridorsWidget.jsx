import { AlertOctagon, ArrowRight } from 'lucide-react';

export default function HighRiskCorridorsWidget() {
  const highRiskRoads = [
    { name: 'NH-16 (Visakhapatnam - Vijayawada)', incidents: 42, severity: 85, recommendation: 'Immediate Safety Audit Required' },
    { name: 'SH-4 (Hyderabad Highway)', incidents: 28, severity: 72, recommendation: 'Deploy mobile repair unit' },
  ];

  return (
    <div className="bg-red-950/20 border border-red-900/50 rounded-2xl p-4 lg:p-5">
      <div className="flex items-center gap-2 mb-4">
        <AlertOctagon size={18} className="text-red-500" />
        <div>
          <h2 className="font-display font-bold text-base text-red-100">High-Risk Corridors Alert</h2>
          <p className="text-red-400/80 text-[10px] mt-0.5">Accident hotspots requiring immediate authority intervention (Data: MoRTH/iRAD)</p>
        </div>
      </div>

      <div className="space-y-3">
        {highRiskRoads.map((road, i) => (
          <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-red-950/40 border border-red-900/30 rounded-xl p-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-red-500/20 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded-sm">CRITICAL</span>
                <span className="text-xs font-semibold text-white">{road.name}</span>
              </div>
              <div className="flex items-center gap-3 mt-1.5 text-[10px] text-red-300/70">
                <span>{road.incidents} Accidents Logged</span>
                <span>•</span>
                <span>Severity Score: {road.severity}/100</span>
              </div>
            </div>
            
            <button className="flex items-center justify-center gap-1.5 text-[10px] font-bold bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg transition-colors shrink-0">
              {road.recommendation} <ArrowRight size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

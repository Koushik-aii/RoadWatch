import { Link } from 'react-router-dom';
import { ArrowLeft, BarChart3, AlertTriangle, CheckCircle, Activity, Map, PieChart as PieChartIcon } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';

import {
  dashboardMetrics,
  resolutionTrend,
  complaintsByDistrict,
  complaintsByRoadType,
  budgetVsMaintenance
} from '../data/analyticsMock';

export default function AdminAnalyticsDashboard() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center shadow-md shadow-indigo-500/20">
            <BarChart3 size={18} className="text-white" />
          </div>
          <div>
            <h1 className="font-display font-bold text-sm">Platform Analytics</h1>
            <p className="text-slate-500 text-[10px]">System-wide metrics and trends</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/admin" className="text-slate-400 hover:text-white text-xs flex items-center gap-1 transition-colors bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700">
            <ArrowLeft size={14} /> Back to Admin
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
        
        {/* Top Metric Cards */}
        <section className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <MetricCard
            title="Total Roads"
            value={dashboardMetrics.totalRoads.toLocaleString()}
            icon={<Map size={20} />}
            color="text-blue-400"
            bg="bg-blue-500/10"
          />
          <MetricCard
            title="Total Complaints"
            value={dashboardMetrics.totalComplaints.toLocaleString()}
            icon={<AlertTriangle size={20} />}
            color="text-amber-400"
            bg="bg-amber-500/10"
          />
          <MetricCard
            title="Resolution Rate"
            value={`${dashboardMetrics.resolutionRate}%`}
            icon={<CheckCircle size={20} />}
            color="text-emerald-400"
            bg="bg-emerald-500/10"
          />
          <MetricCard
            title="Budget Utilization"
            value={`${dashboardMetrics.budgetUtilized}%`}
            icon={<PieChartIcon size={20} />}
            color="text-purple-400"
            bg="bg-purple-500/10"
          />
          <MetricCard
            title="High-Risk Roads"
            value={dashboardMetrics.highRiskRoads.toLocaleString()}
            icon={<Activity size={20} />}
            color="text-red-400"
            bg="bg-red-500/10"
          />
        </section>

        {/* Charts Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Resolution Trend (Line Chart) */}
          <ChartCard title="Complaint Resolution Trend (Last 7 Months)">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={resolutionTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  itemStyle={{ fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line type="monotone" dataKey="filed" name="Filed" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="resolved" name="Resolved" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Complaints by Road Type (Pie Chart) */}
          <ChartCard title="Complaints by Road Type">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={complaintsByRoadType}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {complaintsByRoadType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  itemStyle={{ fontSize: '12px', color: '#fff' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Complaints by District (Bar Chart) */}
          <ChartCard title="Complaints by District">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={complaintsByDistrict} layout="vertical" margin={{ top: 10, right: 30, left: 30, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={true} vertical={false} />
                <XAxis type="number" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis dataKey="district" type="category" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  cursor={{ fill: '#1e293b' }}
                />
                <Bar dataKey="count" name="Complaints" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Budget vs Maintenance (Bar Chart) */}
          <ChartCard title="Budget Allocated vs. Spent (in Crores)">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={budgetVsMaintenance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="district" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  cursor={{ fill: '#1e293b' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="allocated" name="Allocated (Cr)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="spent" name="Spent (Cr)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

        </section>
      </main>
    </div>
  );
}

function MetricCard({ title, value, icon, color, bg }) {
  return (
    <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between hover:bg-slate-800/50 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2.5 rounded-xl ${bg} ${color}`}>
          {icon}
        </div>
      </div>
      <div>
        <div className="text-slate-400 text-xs mb-1 font-medium">{title}</div>
        <div className="text-2xl font-bold font-display">{value}</div>
      </div>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4 lg:p-6">
      <h3 className="font-display font-bold text-sm text-slate-200 mb-6">{title}</h3>
      {children}
    </div>
  );
}

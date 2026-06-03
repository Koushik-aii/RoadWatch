import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield, ScanLine, MapPin, BarChart3, ChevronRight, ArrowRight,
  Cpu, Database, Globe, Lock, Brain, Layers, Zap, Satellite,
  Building2, Radio, CreditCard, LineChart, Server, Users,
  Bot, CheckCircle2, AlertTriangle, TrendingUp
} from 'lucide-react';
import AnimatedCounter from '../components/ui/AnimatedCounter';

// ── Hero Section ────────────────────────────────────────────
function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4">
      {/* Animated gradient background */}
      <div
        className="absolute inset-0 animated-gradient opacity-30"
        style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 25%, #0c1220 50%, #1a0b2e 75%, #0f172a 100%)',
        }}
      />
      {/* Radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-600/8 rounded-full blur-[100px]" />

      {/* Floating decorative elements */}
      <div className="absolute top-20 left-10 w-2 h-2 bg-indigo-400 rounded-full float-anim opacity-40" />
      <div className="absolute top-40 right-20 w-3 h-3 bg-purple-400 rounded-full float-anim-delay opacity-30" />
      <div className="absolute bottom-32 left-1/4 w-2 h-2 bg-emerald-400 rounded-full float-anim-slow opacity-35" />

      <div className="relative z-10 text-center max-w-4xl mx-auto">
        {/* Badge */}
        <div className="fade-in-up inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-8">
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-xs text-indigo-300 font-medium">AI-Powered Civic Intelligence</span>
        </div>

        {/* Headline */}
        <h1 className="fade-in-up-delay-1 font-display text-4xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight tracking-tight">
          AI-Powered Civic
          <br />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Road Intelligence
          </span>
          <br />
          Platform
        </h1>

        {/* Subtitle */}
        <p className="fade-in-up-delay-2 mt-6 text-lg md:text-xl text-slate-400 font-medium tracking-wide">
          Detect. Report. Analyze. Resolve.
        </p>

        <p className="fade-in-up-delay-3 mt-4 text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
          RoadWatch uses YOLOv8 AI to detect potholes, GIS heatmaps to visualize danger zones,
          and automated authority routing to ensure every complaint reaches the right department.
        </p>

        {/* CTA Buttons */}
        <div className="fade-in-up-delay-4 mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/register"
            className="group flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm rounded-xl shadow-xl shadow-indigo-500/25 transition-all hover:shadow-indigo-500/40 hover:scale-[1.02]"
          >
            Get Started
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/login"
            className="flex items-center gap-2 px-8 py-3.5 bg-slate-800/60 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white font-semibold text-sm rounded-xl transition-all hover:bg-slate-800"
          >
            Sign In
          </Link>
        </div>

        {/* Trust indicators */}
        <div className="fade-in-up-delay-5 mt-12 flex items-center justify-center gap-6 text-[11px] text-slate-600">
          <span className="flex items-center gap-1.5"><Lock size={11} /> End-to-end Secure</span>
          <span className="flex items-center gap-1.5"><Cpu size={11} /> YOLOv8 AI</span>
          <span className="flex items-center gap-1.5"><Globe size={11} /> GIS Intelligence</span>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
        <span className="text-[10px] text-slate-600 uppercase tracking-widest">Scroll</span>
        <div className="w-0.5 h-6 bg-gradient-to-b from-slate-600 to-transparent rounded" />
      </div>
    </section>
  );
}

// ── Stats Section ───────────────────────────────────────────
function StatsSection() {
  const stats = [
    { value: 15000, suffix: '+', label: 'Potholes Detected', icon: ScanLine },
    { value: 8400, suffix: '+', label: 'Complaints Resolved', icon: CheckCircle2 },
    { value: 98.7, suffix: '%', label: 'AI Accuracy', icon: Brain, decimals: 1 },
    { value: 340, suffix: '+', label: 'Dangerous Roads Flagged', icon: AlertTriangle },
  ];

  return (
    <section className="py-20 px-4 relative">
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="text-center p-6 rounded-2xl bg-slate-800/30 border border-slate-700/40 hover:border-indigo-500/30 transition-all group"
          >
            <stat.icon size={24} className="mx-auto mb-3 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
            <div className="text-2xl md:text-3xl font-bold text-white font-display">
              <AnimatedCounter value={stat.value} suffix={stat.suffix} decimals={stat.decimals || 0} />
            </div>
            <div className="text-xs text-slate-500 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Features Section ────────────────────────────────────────
function FeaturesSection() {
  const features = [
    {
      icon: ScanLine,
      title: 'AI Pothole Detection',
      desc: 'Upload a road photo and get instant AI analysis with YOLOv8. Severity scoring, risk assessment, and repair priority in seconds.',
      color: 'from-indigo-500 to-purple-500',
      glow: 'shadow-indigo-500/20',
    },
    {
      icon: MapPin,
      title: 'GIS Heatmap Intelligence',
      desc: 'Visualize complaint density, dangerous road corridors, and risk zones on interactive maps with real-time clustering.',
      color: 'from-emerald-500 to-cyan-500',
      glow: 'shadow-emerald-500/20',
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      desc: 'Track resolution rates, severity trends, department performance, and identify the most dangerous roads at a glance.',
      color: 'from-amber-500 to-orange-500',
      glow: 'shadow-amber-500/20',
    },
    {
      icon: Users,
      title: 'Authority Routing',
      desc: 'Complaints are automatically routed to the right government department based on road type, jurisdiction, and severity.',
      color: 'from-rose-500 to-pink-500',
      glow: 'shadow-rose-500/20',
    },
  ];

  return (
    <section className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white">
            How It Works
          </h2>
          <p className="mt-3 text-slate-500 text-sm max-w-md mx-auto">
            End-to-end road damage intelligence — from AI detection to complaint resolution
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {features.map((f, i) => (
            <div
              key={f.title}
              className={`group relative p-6 rounded-2xl bg-slate-800/30 border border-slate-700/40 hover:border-slate-600/60 transition-all duration-300 hover:-translate-y-1 fade-in-up-delay-${i + 1}`}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 shadow-lg ${f.glow} group-hover:scale-110 transition-transform`}>
                <f.icon size={22} className="text-white" />
              </div>
              <h3 className="text-white text-lg font-bold mb-2">{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Demo Flow Section ───────────────────────────────────────
function DemoFlowSection() {
  const steps = [
    { num: '01', title: 'Upload Photo', desc: 'Take a photo of road damage or upload from gallery', icon: ScanLine },
    { num: '02', title: 'AI Analysis', desc: 'YOLOv8 neural network detects and classifies damage', icon: Brain },
    { num: '03', title: 'Severity Score', desc: 'Automated severity, risk score, and repair priority', icon: AlertTriangle },
    { num: '04', title: 'File Complaint', desc: 'One-click complaint with AI-extracted evidence', icon: MapPin },
    { num: '05', title: 'Authority Routing', desc: 'Auto-routed to the correct government department', icon: Building2 },
    { num: '06', title: 'Track & Resolve', desc: 'Real-time tracking from filing to resolution', icon: CheckCircle2 },
  ];

  return (
    <section className="py-20 px-4 bg-slate-800/20">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white">
            Complete Demo Flow
          </h2>
          <p className="mt-3 text-slate-500 text-sm">From detection to resolution in one seamless workflow</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {steps.map((step) => (
            <div key={step.num} className="relative p-5 rounded-2xl bg-slate-800/40 border border-slate-700/30 group hover:border-indigo-500/30 transition-all">
              <span className="text-[10px] font-bold text-indigo-400/50 uppercase tracking-widest">{step.num}</span>
              <step.icon size={20} className="text-indigo-400 mt-2 mb-2 group-hover:text-indigo-300 transition-colors" />
              <h4 className="text-white text-sm font-bold">{step.title}</h4>
              <p className="text-slate-500 text-[11px] mt-1 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Architecture Section ────────────────────────────────────
function ArchitectureSection() {
  const layers = [
    {
      title: 'Frontend',
      items: ['React 19', 'TailwindCSS v4', 'Leaflet Maps', 'PWA'],
      color: 'border-indigo-500/30 bg-indigo-500/5',
      textColor: 'text-indigo-400',
      icon: Globe,
    },
    {
      title: 'Backend API',
      items: ['FastAPI', 'JWT Auth', 'RBAC', 'REST API'],
      color: 'border-emerald-500/30 bg-emerald-500/5',
      textColor: 'text-emerald-400',
      icon: Server,
    },
    {
      title: 'AI Engine',
      items: ['YOLOv8', 'Roboflow', 'Severity AI', 'Risk Scoring'],
      color: 'border-purple-500/30 bg-purple-500/5',
      textColor: 'text-purple-400',
      icon: Brain,
    },
    {
      title: 'Data Layer',
      items: ['PostgreSQL', 'GeoAlchemy2', 'Alembic', 'PostGIS'],
      color: 'border-amber-500/30 bg-amber-500/5',
      textColor: 'text-amber-400',
      icon: Database,
    },
    {
      title: 'Analytics',
      items: ['Heatmaps', 'Clustering', 'Trend Analysis', 'Risk Zones'],
      color: 'border-cyan-500/30 bg-cyan-500/5',
      textColor: 'text-cyan-400',
      icon: LineChart,
    },
    {
      title: 'Workflows',
      items: ['Complaint Routing', 'Authority Dashboard', 'Citizen Portal', 'Officer Console'],
      color: 'border-rose-500/30 bg-rose-500/5',
      textColor: 'text-rose-400',
      icon: Layers,
    },
  ];

  return (
    <section className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white">
            System Architecture
          </h2>
          <p className="mt-3 text-slate-500 text-sm">Modern SaaS-grade civic intelligence stack</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {layers.map((layer) => (
            <div
              key={layer.title}
              className={`p-5 rounded-2xl border ${layer.color} transition-all hover:scale-[1.02]`}
            >
              <div className="flex items-center gap-2 mb-3">
                <layer.icon size={18} className={layer.textColor} />
                <h4 className={`text-sm font-bold ${layer.textColor}`}>{layer.title}</h4>
              </div>
              <div className="space-y-1.5">
                {layer.items.map((item) => (
                  <div key={item} className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span className={`w-1 h-1 rounded-full ${layer.textColor.replace('text-', 'bg-')}`} />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Connection lines (visual) */}
        <div className="flex items-center justify-center mt-8 gap-3 text-slate-600">
          <div className="w-8 h-0.5 bg-slate-700 rounded" />
          <Zap size={14} className="text-indigo-400" />
          <span className="text-[10px] text-slate-500 uppercase tracking-wider">Interconnected microservice layers</span>
          <Zap size={14} className="text-indigo-400" />
          <div className="w-8 h-0.5 bg-slate-700 rounded" />
        </div>
      </div>
    </section>
  );
}

// ── Future Scope Section ────────────────────────────────────
function FutureScopeSection() {
  const items = [
    { icon: Satellite, title: 'Drone Road Inspection', desc: 'Autonomous drone surveys for large-scale road monitoring', status: 'Research' },
    { icon: Building2, title: 'Smart City Integration', desc: 'Connect to smart city platforms and traffic systems', status: 'Planned' },
    { icon: Globe, title: 'Government Grievance APIs', desc: 'Direct integration with CPGRAMS, PG Portal, State APIs', status: 'Planned' },
    { icon: Brain, title: 'Predictive Maintenance AI', desc: 'ML models to predict road deterioration before it happens', status: 'Research' },
    { icon: Radio, title: 'IoT Road Sensors', desc: 'Connected sensors for real-time road condition monitoring', status: 'Concept' },
    { icon: CreditCard, title: 'Automated Budget Planning', desc: 'AI-driven budget allocation based on road priority scores', status: 'Concept' },
    { icon: TrendingUp, title: 'Nationwide Civic Analytics', desc: 'Country-wide road health dashboards and policy insights', status: 'Vision' },
  ];

  return (
    <section className="py-20 px-4 bg-slate-800/20">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white">
            Future Scope
          </h2>
          <p className="mt-3 text-slate-500 text-sm">Where we're taking civic road intelligence next</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <div key={item.title} className="p-5 rounded-2xl bg-slate-800/30 border border-slate-700/30 hover:border-slate-600/50 transition-all group">
              <div className="flex items-start justify-between mb-3">
                <item.icon size={20} className="text-slate-500 group-hover:text-indigo-400 transition-colors" />
                <span className="text-[9px] uppercase tracking-wider text-slate-600 font-bold px-2 py-0.5 rounded-full border border-slate-700/50">{item.status}</span>
              </div>
              <h4 className="text-white text-sm font-bold mb-1">{item.title}</h4>
              <p className="text-slate-500 text-[11px] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Footer / CTA Section ────────────────────────────────────
function FooterCTA() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
          Ready to Transform Road Safety?
        </h2>
        <p className="text-slate-400 text-sm mb-8 max-w-md mx-auto">
          Join RoadWatch and help build safer roads through AI-powered civic intelligence.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/register"
            className="group flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm rounded-xl shadow-xl shadow-indigo-500/25 transition-all hover:shadow-indigo-500/40"
          >
            Register as Citizen
            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/authority-login"
            className="flex items-center gap-2 px-8 py-3.5 text-slate-400 hover:text-white font-semibold text-sm transition-colors"
          >
            <Shield size={16} />
            Authority Portal
          </Link>
        </div>

        {/* Footer links */}
        <div className="mt-16 pt-8 border-t border-slate-800 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-600">
          <span className="flex items-center gap-1.5"><Shield size={12} className="text-indigo-400" /> RoadWatch v2.0</span>
          <span>Built for Hackathon 2026</span>
          <span>React + FastAPI + YOLOv8</span>
        </div>
      </div>
    </section>
  );
}

// ── Main Landing Page ───────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-y-auto">
      {/* Navigation */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Shield size={16} className="text-white" />
            </div>
            <span className="font-display font-bold text-white text-lg">RoadWatch</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/authority-login" className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors px-3 py-2">
              <Shield size={13} /> Authority Portal
            </Link>
            <Link
              to="/login"
              className="text-xs text-slate-300 font-medium px-4 py-2 rounded-lg border border-slate-700 hover:border-slate-600 hover:text-white transition-all"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="text-xs text-white font-bold px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-md shadow-indigo-500/20 transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <DemoFlowSection />
      <ArchitectureSection />
      <FutureScopeSection />
      <FooterCTA />
    </div>
  );
}

import { Bot, ShieldCheck, BrainCircuit } from 'lucide-react';

/**
 * Reusable AI status labels with glow effects and animations.
 *
 * Props:
 *  - variant: 'verified' | 'assisted' | 'analysis' (default: 'verified')
 *  - size: 'sm' | 'md' (default: 'md')
 *  - animated: boolean (default: true)
 */

const VARIANTS = {
  verified: {
    label: 'AI Verified',
    Icon: ShieldCheck,
    colors: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/25',
    glow: '0 0 14px rgba(52,211,153,0.25)',
    dot: 'bg-emerald-400',
  },
  assisted: {
    label: 'AI Assisted',
    Icon: Bot,
    colors: 'text-indigo-300 bg-indigo-500/10 border-indigo-500/25',
    glow: '0 0 14px rgba(129,140,248,0.25)',
    dot: 'bg-indigo-400',
  },
  analysis: {
    label: 'AI Severity Analysis',
    Icon: BrainCircuit,
    colors: 'text-purple-300 bg-purple-500/10 border-purple-500/25',
    glow: '0 0 14px rgba(192,132,252,0.25)',
    dot: 'bg-purple-400',
  },
  'high-risk': {
    label: 'High Risk',
    Icon: ShieldCheck,
    colors: 'text-red-300 bg-red-500/10 border-red-500/25',
    glow: '0 0 14px rgba(239,68,68,0.25)',
    dot: 'bg-red-400',
  },
};

export default function AIStatusLabel({
  variant = 'verified',
  size = 'md',
  animated = true,
}) {
  const config = VARIANTS[variant] || VARIANTS.verified;
  const { Icon } = config;

  const sizeClasses = {
    sm: 'text-[9px] px-2 py-0.5 gap-1',
    md: 'text-[10px] px-2.5 py-1 gap-1.5',
  };

  return (
    <span
      className={`
        inline-flex items-center rounded-full font-bold border
        ${config.colors}
        ${sizeClasses[size] || sizeClasses.md}
        ${animated ? 'ai-label-glow' : ''}
      `}
      style={{ boxShadow: config.glow }}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${config.dot} ${animated ? 'animate-pulse' : ''}`}
      />
      <Icon size={size === 'sm' ? 10 : 12} />
      {config.label}
    </span>
  );
}

import { ShieldCheck, ExternalLink } from 'lucide-react';

export default function SourceCitation({ verification }) {
  if (!verification) return null;

  const { source_name, source_url, retrieval_date, confidence_level } = verification;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-2.5 bg-slate-700/30 text-[10px] border-t border-slate-700/50 gap-2">
      <div className="flex items-center gap-2 text-slate-400">
        <ShieldCheck size={12} className={
          confidence_level === 'High' || confidence_level === 'Verified' ? 'text-emerald-400' :
          confidence_level === 'Medium' ? 'text-amber-400' : 'text-slate-400'
        } />
        <span>
          Source: <span className="font-medium text-slate-300">{source_name}</span>
        </span>
        <span className="hidden sm:inline text-slate-600">•</span>
        <span className="hidden sm:inline">
          Confidence: <span className="font-medium text-slate-300">{confidence_level}</span>
        </span>
        {retrieval_date && (
          <>
            <span className="hidden sm:inline text-slate-600">•</span>
            <span className="hidden sm:inline">Retrieved: {retrieval_date}</span>
          </>
        )}
      </div>

      {source_url && (
        <a
          href={source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 font-medium text-indigo-400 hover:text-indigo-300 hover:underline transition-colors shrink-0"
          title="Inspect Original Source"
        >
          Verify Source <ExternalLink size={10} />
        </a>
      )}
    </div>
  );
}

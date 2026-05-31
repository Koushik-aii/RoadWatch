// ── Skeleton Loader Components ─────────────────────────────────
// Used as placeholders during bot response loading

// Generic card skeleton (chatbot responses)
export function CardSkeleton() {
  return (
    <div className="rounded-2xl bg-slate-800/80 border-l-4 border-slate-700 overflow-hidden w-full animate-pulse">
      <div className="px-4 pt-4 pb-3">
        <div className="flex justify-between items-start">
          <div className="h-4 bg-slate-700 rounded w-2/3" />
          <div className="h-4 bg-slate-700 rounded-full w-10" />
        </div>
        <div className="h-3 bg-slate-700/60 rounded w-1/2 mt-2" />
      </div>
      <div className="px-4 pb-4 space-y-3">
        <div className="h-3 bg-slate-700/60 rounded w-full" />
        <div className="h-3 bg-slate-700/60 rounded w-4/5" />
        <div className="h-3 bg-slate-700/60 rounded w-3/5" />
        <div className="grid grid-cols-2 gap-3 mt-2">
          <div className="h-14 bg-slate-700/60 rounded-xl" />
          <div className="h-14 bg-slate-700/60 rounded-xl" />
        </div>
        <div className="h-2 bg-slate-700/60 rounded-full w-full mt-1" />
      </div>
    </div>
  );
}

// Budget card skeleton
export function BudgetCardSkeleton() {
  return (
    <div className="rounded-2xl bg-slate-800/80 border-l-4 border-slate-700 overflow-hidden w-full animate-pulse">
      <div className="px-4 pt-4 pb-3">
        <div className="flex justify-between items-center">
          <div className="h-4 bg-slate-700 rounded w-1/2" />
          <div className="h-5 bg-slate-700 rounded-full w-16" />
        </div>
        <div className="h-3 bg-slate-700/50 rounded w-3/5 mt-2" />
      </div>
      <div className="px-4 pb-3 grid grid-cols-2 gap-3">
        <div className="bg-slate-700/50 rounded-xl p-3 text-center space-y-2">
          <div className="h-2 bg-slate-700 rounded w-2/3 mx-auto" />
          <div className="h-6 bg-slate-700 rounded w-3/4 mx-auto" />
        </div>
        <div className="bg-slate-700/50 rounded-xl p-3 text-center space-y-2">
          <div className="h-2 bg-slate-700 rounded w-2/3 mx-auto" />
          <div className="h-6 bg-slate-700 rounded w-3/4 mx-auto" />
        </div>
      </div>
      <div className="px-4 pb-4">
        <div className="h-2 bg-slate-700 rounded-full w-full" />
      </div>
    </div>
  );
}

// Map pin info skeleton (popup loading)
export function MapPinSkeleton() {
  return (
    <div className="flex flex-col gap-2 p-3 animate-pulse">
      <div className="h-4 bg-slate-700 rounded w-1/3" />
      <div className="h-3 bg-slate-700/60 rounded w-1/2" />
    </div>
  );
}

// Full-screen map loading overlay
export function MapLoadingSkeleton() {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-sm gap-4">
      <div className="relative">
        <div className="w-14 h-14 rounded-full border-4 border-slate-700 border-t-indigo-500 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-5 h-5 rounded-full bg-indigo-500/20 animate-pulse" />
        </div>
      </div>
      <div className="space-y-2 text-center animate-pulse">
        <div className="h-3 bg-slate-700 rounded w-32 mx-auto" />
        <div className="h-2 bg-slate-700/60 rounded w-24 mx-auto" />
      </div>
      <p className="text-slate-500 text-xs mt-1">Loading road data…</p>
    </div>
  );
}

// My Complaints page skeleton row
export function ComplaintRowSkeleton() {
  return (
    <div className="rounded-xl border border-slate-700/60 bg-slate-800/60 p-3 animate-pulse space-y-2">
      <div className="flex justify-between">
        <div className="h-3 bg-slate-700 rounded w-20" />
        <div className="h-5 bg-slate-700 rounded-full w-16" />
      </div>
      <div className="h-2 bg-slate-700/60 rounded w-2/3" />
      <div className="flex gap-0.5">
        <div className="flex-1 h-1 bg-slate-700 rounded-full" />
        <div className="flex-1 h-1 bg-slate-700/60 rounded-full" />
        <div className="flex-1 h-1 bg-slate-700/40 rounded-full" />
      </div>
      <div className="h-2 bg-slate-700/40 rounded w-1/3" />
    </div>
  );
}

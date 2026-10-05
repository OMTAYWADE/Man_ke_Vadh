export default function Header() {
  return (
    <header className="relative z-20 border-b border-white/30 bg-white/15 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-5xl items-center justify-between px-5">
        
        <div className="flex items-center gap-3">
          
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-white/25 shadow-lg backdrop-blur-md">
            <span className="text-lg">🌿</span>
          </div>

          <div>
            <h1 className="text-lg font-semibold tracking-tight text-slate-900">
              ManoTrack
            </h1>

            <p className="text-xs text-slate-700/70">
              A quiet space to share
            </p>
          </div>

        </div>

        <div className="flex items-center gap-2 rounded-full border border-white/40 bg-white/25 px-3 py-2 backdrop-blur-md">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />

          <span className="text-xs font-medium text-slate-800">
            Private
          </span>
        </div>

      </div>
    </header>
  );
}
export function BrowserMockup() {
  return (
    <div className="relative w-full max-w-[360px] mx-auto">
      <div className="absolute inset-0 bg-violet-500/15 blur-[80px] rounded-full animate-glow" />

      <div className="relative" style={{ animation: "float-browser 5.5s ease-in-out infinite", transformStyle: "preserve-3d" }}>
        <style>{`@keyframes float-browser { 0%,100%{transform:translateY(0) rotateY(-2deg) rotateX(2deg)} 50%{transform:translateY(-12px) rotateY(-2deg) rotateX(2deg)} }`}</style>

        <div
          className="rounded-xl border border-slate-700/60 bg-slate-900 shadow-2xl overflow-hidden"
          style={{ boxShadow: "0 0 60px rgba(139,92,246,0.12), inset 0 0 1px rgba(255,255,255,0.08)" }}
        >
          <div className="flex items-center gap-1.5 px-3 h-8 bg-slate-800/80 border-b border-slate-700/50">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
            <div className="ml-3 flex-1 h-4 rounded bg-slate-700/50 flex items-center px-2">
              <span className="text-[7px] text-slate-400 font-mono">clik.ar</span>
            </div>
          </div>

          <div className="p-3 bg-gradient-to-b from-slate-900 to-slate-900/95">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded bg-violet-600 flex items-center justify-center">
                  <span className="text-[6px] font-black text-white">C</span>
                </div>
                <div className="flex gap-4">
                  <div className="h-1.5 w-6 rounded bg-violet-500/30" />
                  <div className="h-1.5 w-8 rounded bg-slate-700" />
                  <div className="h-1.5 w-5 rounded bg-slate-700" />
                </div>
              </div>
              <div className="h-3 w-12 rounded bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
                <span className="text-[5px] font-bold text-violet-400">CTA</span>
              </div>
            </div>

            <div className="rounded-lg bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/40 p-3 mb-2">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-5 w-16 rounded bg-violet-600/30" />
                <div className="h-5 w-20 rounded bg-slate-700/50" />
              </div>
              <div className="h-2 w-3/4 rounded bg-slate-700/30 mb-1.5" />
              <div className="h-2 w-1/2 rounded bg-slate-700/30 mb-2" />
              <div className="h-6 w-full rounded bg-gradient-to-r from-violet-600/40 to-indigo-600/30 flex items-center justify-center">
                <span className="text-[6px] font-bold text-violet-300">Empezá tu proyecto</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-1.5 mb-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-lg bg-slate-800/50 border border-slate-700/30 p-2">
                  <div className="h-2 w-2 rounded bg-violet-500/40 mb-1.5" />
                  <div className="h-1.5 w-full rounded bg-slate-700/30 mb-1" />
                  <div className="h-1 w-2/3 rounded bg-slate-700/20" />
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between rounded-lg bg-slate-800/30 border border-slate-700/30 p-2">
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-4 w-8 rounded bg-slate-700/30" />
                ))}
              </div>
              <div className="h-3 w-10 rounded bg-violet-500/30" />
            </div>
          </div>
        </div>

        <div className="absolute -bottom-6 left-[10%] right-[10%] h-6 blur-3xl rounded-full bg-violet-500/20" />
      </div>
    </div>
  );
}

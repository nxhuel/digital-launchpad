export function DashboardMockup() {
  const bars = [
    { h: "60%", c: "bg-violet-500" },
    { h: "80%", c: "bg-violet-400" },
    { h: "45%", c: "bg-violet-500/60" },
    { h: "90%", c: "bg-violet-500" },
    { h: "55%", c: "bg-violet-400/70" },
    { h: "70%", c: "bg-violet-500" },
    { h: "85%", c: "bg-violet-400" },
    { h: "50%", c: "bg-violet-500/60" },
  ];

  const rows = [
    { n: "Proyecto Alpha", s: "Activo", v: "$12.400" },
    { n: "Proyecto Beta", s: "Pendiente", v: "$8.200" },
    { n: "Proyecto Gamma", s: "Completado", v: "$23.100" },
    { n: "Proyecto Delta", s: "Activo", v: "$5.600" },
  ];

  return (
    <div className="relative w-full max-w-[360px] mx-auto">
      <div className="absolute inset-0 bg-violet-500/15 blur-[80px] rounded-full animate-glow" />

      <div className="relative" style={{ animation: "float-dash 6s ease-in-out infinite", transformStyle: "preserve-3d" }}>
        <style>{`@keyframes float-dash { 0%,100%{transform:translateY(0) rotateY(-1deg) rotateX(1deg)} 50%{transform:translateY(-14px) rotateY(-1deg) rotateX(1deg)} }`}</style>

        <div
          className="rounded-xl border border-slate-700/60 bg-slate-900 shadow-2xl overflow-hidden"
          style={{ boxShadow: "0 0 60px rgba(139,92,246,0.12), inset 0 0 1px rgba(255,255,255,0.08)" }}
        >
          <div className="flex h-[280px]">
            <div className="w-12 bg-slate-800/80 border-r border-slate-700/30 p-1.5 flex flex-col items-center gap-2 pt-2">
              {["D", "M", "A", "C"].map((l, i) => (
                <div key={i} className={`h-6 w-6 rounded-lg flex items-center justify-center ${i === 0 ? "bg-violet-600" : "bg-slate-800"}`}>
                  <span className={`text-[8px] font-black ${i === 0 ? "text-white" : "text-slate-500"}`}>{l}</span>
                </div>
              ))}
              <div className="mt-auto h-6 w-6 rounded-lg bg-slate-800 flex items-center justify-center">
                <div className="w-2 h-2 rounded bg-slate-600" />
              </div>
            </div>

            <div className="flex-1 p-2.5 overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-bold text-white tracking-wide">Dashboard</span>
                <div className="flex gap-1">
                  <div className="w-1 h-1 rounded-full bg-emerald-400" />
                  <div className="w-1 h-1 rounded-full bg-slate-600" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-1.5 mb-2">
                {[
                  { l: "Ingresos", v: "$49.3K", c: "text-emerald-400" },
                  { l: "Usuarios", v: "2,847", c: "text-violet-400" },
                  { l: "Conversión", v: "12.5%", c: "text-blue-400" },
                ].map((k, i) => (
                  <div key={i} className="rounded-lg bg-slate-800/50 border border-slate-700/30 p-1.5">
                    <span className="text-[6px] text-slate-500 font-semibold uppercase tracking-wider">{k.l}</span>
                    <div className={`text-[11px] font-bold ${k.c}`}>{k.v}</div>
                  </div>
                ))}
              </div>

              <div className="rounded-lg bg-slate-800/30 border border-slate-700/30 p-2 mb-2">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[7px] font-bold text-slate-400 uppercase tracking-wider">Ventas</span>
                  <div className="flex gap-0.5">
                    {["7d", "30d"].map((p, i) => (
                      <span key={i} className={`text-[6px] px-1 py-0.5 rounded ${i === 0 ? "bg-violet-600/30 text-violet-300" : "text-slate-500"}`}>{p}</span>
                    ))}
                  </div>
                </div>
                <div className="flex items-end gap-0.5 h-16">
                  {bars.map((b, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                      <div
                        className={`w-full rounded-t-sm ${b.c} transition-all`}
                        style={{ height: b.h, animation: `barPulse${i} 2s ease-in-out infinite` }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg bg-slate-800/30 border border-slate-700/30 overflow-hidden">
                <div className="flex items-center justify-between px-2 py-1 border-b border-slate-700/30">
                  <span className="text-[7px] font-bold text-slate-400 uppercase tracking-wider">Proyectos</span>
                  <span className="text-[6px] text-violet-400">Ver todo</span>
                </div>
                {rows.map((r, i) => (
                  <div key={i} className="flex items-center justify-between px-2 py-1 border-b border-slate-700/20 last:border-0">
                    <span className="text-[7px] font-medium text-slate-300">{r.n}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-[6px] font-semibold ${r.s === "Activo" ? "text-emerald-400" : r.s === "Completado" ? "text-blue-400" : "text-amber-400"}`}>{r.s}</span>
                      <span className="text-[7px] font-bold text-slate-200">{r.v}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="absolute -bottom-6 left-[10%] right-[10%] h-6 blur-3xl rounded-full bg-violet-500/20" />
      </div>
    </div>
  );
}

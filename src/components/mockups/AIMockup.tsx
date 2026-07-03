export function AIMockup() {
  return (
    <div className="relative w-full max-w-[340px] mx-auto">
      <div className="absolute inset-0 bg-violet-500/15 blur-[80px] rounded-full animate-glow" />

      <div className="relative" style={{ animation: "float-ai 4.5s ease-in-out infinite", transformStyle: "preserve-3d" }}>
        <style>{`@keyframes float-ai { 0%,100%{transform:translateY(0) rotateY(3deg) rotateX(-2deg)} 50%{transform:translateY(-16px) rotateY(3deg) rotateX(-2deg)} }`}</style>

        <div
          className="rounded-xl border border-slate-700/60 bg-slate-900 shadow-2xl overflow-hidden"
          style={{ boxShadow: "0 0 60px rgba(139,92,246,0.12), inset 0 0 1px rgba(255,255,255,0.08)" }}
        >
          <div className="flex items-center justify-between px-3 h-8 bg-slate-800/80 border-b border-slate-700/50">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-violet-600 flex items-center justify-center">
                <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              </div>
              <span className="text-[9px] font-bold text-white">Clik AI</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-glow" />
              <span className="text-[6px] text-emerald-400 font-semibold">Activo</span>
            </div>
          </div>

          <div className="p-3">
            <div className="grid grid-cols-3 gap-1.5 mb-3">
              {["Automatizar", "Generar", "Analizar"].map((l, i) => (
                <div key={i} className="rounded-lg bg-slate-800/50 border border-slate-700/30 p-1.5 flex items-center gap-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${i === 0 ? "bg-violet-400" : i === 1 ? "bg-blue-400" : "bg-emerald-400"}`} />
                  <span className="text-[7px] font-semibold text-slate-300">{l}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2 mb-3">
              {[
                { r: "Asistente", m: "¿Qué necesitás desarrollar?", t: "ai" },
                { r: "Tú", m: "Un sistema de gestión", t: "user" },
                { r: "Asistente", m: "Perfecto. Te propongo:\n• Dashboard admin\n• Módulo clientes\n• Reportes automáticos", t: "ai" },
              ].map((msg, i) => (
                <div key={i} className={`flex ${msg.t === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-lg p-2 ${msg.t === "user" ? "bg-violet-600/30 border border-violet-500/30" : "bg-slate-800/50 border border-slate-700/30"}`}>
                    <span className="text-[6px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">{msg.r}</span>
                    <span className="text-[8px] text-slate-300 leading-relaxed whitespace-pre-line">{msg.m}</span>
                    {i === 2 && (
                      <div className="flex gap-1 mt-1.5">
                        {["Dashboard", "Clientes", "Reportes"].map((chip) => (
                          <span key={chip} className="text-[6px] px-1 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/20 font-semibold">
                            {chip}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-lg bg-slate-800/30 border border-slate-700/30 p-2">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="h-4 w-4 rounded bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center">
                  <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 16.875h3.375m0 0h3.375m-3.375 0V13.5m0 3.375v3.375M6 10.5h2.25a2.25 2.25 0 002.25-2.25V6a2.25 2.25 0 00-2.25-2.25H6A2.25 2.25 0 003.75 6v2.25A2.25 2.25 0 006 10.5zm0 9.75h2.25A2.25 2.25 0 0010.5 18v-2.25a2.25 2.25 0 00-2.25-2.25H6a2.25 2.25 0 00-2.25 2.25V18A2.25 2.25 0 006 20.25zm9.75-9.75H18a2.25 2.25 0 002.25-2.25V6A2.25 2.25 0 0018 3.75h-2.25A2.25 2.25 0 0013.5 6v2.25a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                </div>
                <span className="text-[8px] font-bold text-white">Workflow activo</span>
                <div className="ml-auto flex items-center gap-0.5">
                  <div className="w-1 h-1 rounded-full bg-emerald-400" />
                  <div className="w-1 h-1 rounded-full bg-emerald-400 animate-glow" style={{ animationDelay: "0.3s" }} />
                  <div className="w-1 h-1 rounded-full bg-emerald-400" style={{ animationDelay: "0.6s" }} />
                </div>
              </div>
              <div className="flex items-center gap-1">
                {["Análisis", "Diseño", "Desarrollo", "QA", "Deploy"].map((step, i) => (
                  <div key={i} className="flex items-center gap-0.5">
                    <div className={`h-3 px-1 rounded flex items-center justify-center ${i < 3 ? "bg-violet-600/30 border border-violet-500/30" : "bg-slate-800 border border-slate-700/40"}`}>
                      <span className={`text-[5px] font-bold ${i < 3 ? "text-violet-300" : "text-slate-500"}`}>{step}</span>
                    </div>
                    {i < 4 && <div className="w-1 h-px bg-slate-700" />}
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

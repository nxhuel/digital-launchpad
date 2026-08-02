export function PhoneMockup() {
  return (
    <div className="relative w-full max-w-[260px] mx-auto">
      <div className="absolute inset-0 bg-violet-500/20 blur-[80px] rounded-full animate-glow" />

      <div className="relative animate-float" style={{ transformStyle: "preserve-3d" }}>
        <div className="relative mx-auto w-[200px] h-[400px] rounded-[32px] border-2 border-slate-700/60 bg-slate-900 shadow-2xl overflow-hidden"
          style={{ boxShadow: "0 0 60px rgba(139,92,246,0.15), inset 0 0 1px rgba(255,255,255,0.1)" }}
        >
          <div className="absolute top-0 inset-x-0 h-6 bg-slate-900 flex items-center justify-center z-10">
            <div className="w-16 h-1.5 rounded-full bg-slate-800" />
          </div>

          <div className="h-full pt-6 px-3 pb-3 bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-900">
            <div className="h-full rounded-xl border border-slate-800/80 bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-3 flex flex-col overflow-hidden backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-5 w-5 rounded-md bg-violet-600 flex items-center justify-center">
                  <span className="text-[8px] font-black text-white">C</span>
                </div>
                <span className="text-[9px] font-bold text-white tracking-wide">Clik</span>
                <div className="ml-auto flex gap-1">
                  <div className="w-1 h-1 rounded-full bg-emerald-400 animate-glow" />
                  <div className="w-1 h-1 rounded-full bg-slate-600" />
                </div>
              </div>

              <div className="flex-1 rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 p-3 flex flex-col items-center justify-center gap-1.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center shadow-lg shadow-violet-500/30">
                  <span className="text-xs font-black text-white">C</span>
                </div>
                <span className="text-[10px] font-bold text-white mt-0.5">Mis XV</span>
                <span className="text-[7px] text-slate-400 font-medium">Sede en Palermo</span>

                <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent my-1.5" />

                <div className="grid grid-cols-2 gap-1 w-full">
                  <div className="flex items-center gap-1 bg-slate-800/50 rounded py-1 px-1.5 border border-slate-700/30">
                    <div className="w-3 h-3 rounded bg-violet-600/20 flex items-center justify-center">
                      <svg className="w-1.5 h-1.5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.5h16.5M3.75 4.5l8.25 8.25m-8.25-8.25L3.75 19.5H12" />
                      </svg>
                    </div>
                    <span className="text-[6px] text-slate-300 font-semibold">QR</span>
                  </div>
                  <div className="flex items-center gap-1 bg-slate-800/50 rounded py-1 px-1.5 border border-slate-700/30">
                    <svg className="w-1.5 h-1.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                      </svg>
                    <span className="text-[6px] text-slate-300 font-semibold">WA</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 mt-0.5">
                  <div className="flex items-center gap-1 bg-slate-800/50 rounded py-0.5 px-1.5 border border-slate-700/30">
                    <svg className="w-1.5 h-1.5 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 3.75V16.5L12 14.25 7.5 16.5V3.75m9 0H18A2.25 2.25 0 0120.25 6v12A2.25 2.25 0 0118 20.25H6A2.25 2.25 0 013.75 18V6A2.25 2.25 0 016 3.75h1.5m9 0h-9" />
                    </svg>
                    <span className="text-[6px] text-slate-300 font-semibold">clik.ar</span>
                  </div>
                </div>
              </div>

              <div className="mt-2 flex items-center justify-center gap-0.5">
                <div className="w-1 h-1 rounded-full bg-violet-500/50" />
                <div className="w-4 h-1 rounded-full bg-slate-700" />
                <div className="w-1 h-1 rounded-full bg-violet-500/50" />
              </div>
            </div>
          </div>
        </div>

        <div className="absolute -bottom-6 left-[20%] right-[20%] h-6 blur-3xl rounded-full bg-violet-500/30" />
      </div>

      <div className="absolute -bottom-2 inset-x-0 h-px bg-gradient-to-r from-transparent via-violet-500/20 to-transparent" />
    </div>
  );
}

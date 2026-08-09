// Pantalla 16:10 ancha y baja: la invitación se ve completa sin alargar el hero
export function InviteLaptop({ children }: { children?: React.ReactNode }) {
  return (
    <div className="relative w-[520px] max-w-[92vw]">
      {/* Halo detrás de la notebook */}
      <div className="absolute -inset-8 bg-primary/20 blur-[90px] rounded-full -z-10" />

      <div className="relative">
        {/* Pantalla con bisel */}
        <div className="relative rounded-[1.05rem] bg-gradient-to-b from-zinc-700 via-zinc-900 to-black p-[7px] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.75)] ring-1 ring-white/15">
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[0.5rem] bg-zinc-950">
            {children ? (
              children
            ) : (
              <>
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 via-zinc-900 to-black" />
                <div className="relative h-full w-full flex flex-col items-center justify-center gap-3 px-8 text-center">
                  <span className="text-[10px] uppercase tracking-[0.3em] text-white/40 border border-white/10 rounded-full px-3 py-1">
                    Preview
                  </span>
                  <p className="text-white/30 text-xs">Próximamente</p>
                </div>
              </>
            )}
            {/* Reflejo del vidrio */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-white/0 via-white/[0.05] to-white/0" />
          </div>
          {/* Cámara */}
          <div className="absolute top-[5px] left-1/2 -translate-x-1/2 h-[4px] w-[4px] rounded-full bg-zinc-950 ring-1 ring-white/10" />
        </div>

        {/* Base (teclado) */}
        <div className="relative mx-[-9px] -mt-px">
          <div className="h-[15px] rounded-b-[12px] bg-gradient-to-b from-zinc-700 via-zinc-900 to-black ring-1 ring-white/10" />
          {/* Bisagra central */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[5px] w-28 rounded-b-md bg-zinc-950 ring-1 ring-white/5" />
        </div>
      </div>

      {/* Resplandor bajo la notebook */}
      <div className="absolute -bottom-10 left-[15%] right-[15%] h-10 bg-primary/25 blur-3xl rounded-full" />
    </div>
  );
}

import type { CardDesign } from "@/data/cards";

type Size = "sm" | "md" | "lg";

const sizeMap: Record<Size, string> = {
  sm: "w-[180px]",
  md: "w-[240px]",
  lg: "w-[320px]",
};

export function InvitePhone({
  design,
  size = "md",
  interactive = false,
  children,
}: {
  design: CardDesign;
  size?: Size;
  interactive?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={`relative ${sizeMap[size]} aspect-[9/19] rounded-[2.2rem] bg-gradient-to-b from-zinc-800 to-black p-[5px] shadow-[0_25px_60px_-20px_rgba(0,0,0,0.7)] ring-1 ring-white/10 ${
        interactive ? "transition-transform duration-500 ease-out" : ""
      }`}
    >
      {/* Screen */}
      <div className="relative h-full w-full rounded-[1.85rem] overflow-hidden overflow-x-hidden bg-zinc-950">
        {/* Notch */}
        <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-16 h-4 bg-black rounded-full z-30" />

        {children ? (
          children
        ) : (
          <>
            {/* Background Placeholder */}
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 via-zinc-900 to-black" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.08),transparent_60%)]" />

            {/* Decorative orbits */}
            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full border border-white/10" />
            <div className="absolute -bottom-12 -left-8 w-40 h-40 rounded-full border border-white/5" />

            {/* Content Placeholder */}
            <div className="relative h-full w-full flex flex-col items-center justify-between px-5 pt-10 pb-5 text-center">
              <span className="inline-block text-[9px] uppercase tracking-[0.25em] text-white/40 border border-white/10 rounded-full px-2 py-0.5">
                Preview
              </span>

              <div className="flex flex-col items-center gap-1">
                <div className="w-8 h-px bg-white/20 my-1.5" />
                <p className="text-white/30 text-[9px]">Próximamente</p>
              </div>

              <div className="w-full">
                <div className="w-full bg-white/5 text-white/40 text-[9px] font-semibold py-2 rounded-full border border-white/10">
                  Ver demo
                </div>
              </div>
            </div>
          </>
        )}

        {/* Reflection */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0" />
      </div>
    </div>
  );
}

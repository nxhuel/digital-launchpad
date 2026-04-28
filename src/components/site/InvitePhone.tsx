import type { CardDesign } from "@/data/cards";

type Size = "sm" | "md" | "lg";

const sizeMap: Record<Size, string> = {
  sm: "w-[180px]",
  md: "w-[210px]",
  lg: "w-[260px]",
};

export function InvitePhone({
  design,
  size = "md",
  interactive = false,
}: {
  design: CardDesign;
  size?: Size;
  interactive?: boolean;
}) {
  return (
    <div
      className={`relative ${sizeMap[size]} aspect-[9/19] rounded-[2.2rem] bg-gradient-to-b from-zinc-800 to-black p-[5px] shadow-[0_25px_60px_-20px_rgba(0,0,0,0.7)] ring-1 ${design.ring} ${
        interactive ? "transition-transform duration-500 ease-out" : ""
      }`}
    >
      {/* Screen */}
      <div className="relative h-full w-full rounded-[1.85rem] overflow-hidden bg-zinc-950">
        {/* Notch */}
        <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-16 h-4 bg-black rounded-full z-30" />

        {/* Background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${design.accent}`} />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.08),transparent_60%)]" />

        {/* Decorative orbits */}
        <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full border border-white/10" />
        <div className="absolute -bottom-12 -left-8 w-40 h-40 rounded-full border border-white/5" />

        {/* Content */}
        <div className="relative h-full w-full flex flex-col items-center justify-between px-5 pt-10 pb-5 text-center">
          <span className="inline-block text-[9px] uppercase tracking-[0.25em] text-white/60 border border-white/15 rounded-full px-2 py-0.5">
            {design.badge}
          </span>

          <div className="flex flex-col items-center gap-1">
            <p className="text-white/60 text-[10px] tracking-widest uppercase">
              {design.subtitle}
            </p>
            <h3 className={`text-white text-2xl leading-tight ${design.font}`}>
              {design.name.split(" ")[0]}
            </h3>
            <div className="w-8 h-px bg-white/30 my-1.5" />
            <p className="text-white/80 text-[10px] font-medium">{design.date}</p>
            <p className="text-white/50 text-[9px]">{design.location}</p>
          </div>

          <div className="w-full">
            <div className="w-full bg-white text-black text-[10px] font-semibold py-2 rounded-full shadow-lg">
              {design.cta}
            </div>
          </div>
        </div>

        {/* Reflection */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0" />
      </div>
    </div>
  );
}

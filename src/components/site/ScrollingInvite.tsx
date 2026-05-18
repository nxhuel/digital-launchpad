import { useEffect, useState } from "react";

export function ScrollingInvite() {
  return (
    <div className="relative h-full w-full bg-white overflow-hidden">
      <div className="absolute inset-0 animate-scroll-vertical flex flex-col">
        {/* Slide 1: Cover */}
        <div className="min-h-full w-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-fuchsia-50 to-rose-50">
          <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-6">
            <span className="text-2xl">✨</span>
          </div>
          <h2 className="font-serif italic text-3xl text-zinc-800 mb-2">Mis 15 Años</h2>
          <h1 className="font-serif text-4xl font-bold text-zinc-900 mb-4">Valentina</h1>
          <div className="w-12 h-px bg-zinc-300 mb-4" />
          <p className="text-zinc-500 tracking-widest text-xs uppercase">14 · Septiembre · 2026</p>
        </div>

        {/* Slide 2: Details */}
        <div className="min-h-full w-full flex flex-col items-center justify-center p-8 text-center bg-white">
          <h3 className="text-zinc-400 uppercase tracking-widest text-[10px] mb-6">Estás invitado</h3>
          <p className="text-zinc-700 text-sm leading-relaxed mb-8">
            Quiero compartir con vos esta noche tan especial. Una noche llena de magia, amigos y familia.
          </p>
          <div className="grid grid-cols-2 gap-4 w-full">
            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
              <div className="text-xl mb-1">📅</div>
              <div className="text-[10px] font-bold text-zinc-900 uppercase">Fecha</div>
              <div className="text-[9px] text-zinc-500">14/09/2026</div>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
              <div className="text-xl mb-1">⏰</div>
              <div className="text-[10px] font-bold text-zinc-900 uppercase">Hora</div>
              <div className="text-[9px] text-zinc-500">21:00 hs</div>
            </div>
          </div>
        </div>

        {/* Slide 3: Location */}
        <div className="min-h-full w-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-tr from-rose-50 to-orange-50">
          <div className="text-3xl mb-4">📍</div>
          <h3 className="text-lg font-bold text-zinc-800 mb-2">Salón Aurora</h3>
          <p className="text-xs text-zinc-500 mb-6">Av. de los Incas 1234, CABA</p>
          <button className="px-6 py-2 rounded-full bg-white text-zinc-800 text-[10px] font-bold shadow-sm border border-zinc-100">
            CÓMO LLEGAR
          </button>
        </div>

        {/* Slide 4: RSVP */}
        <div className="min-h-full w-full flex flex-col items-center justify-center p-8 text-center bg-zinc-900 text-white">
          <div className="text-3xl mb-4">💌</div>
          <h3 className="text-xl font-bold mb-2">Confirmar Asistencia</h3>
          <p className="text-[10px] text-zinc-400 mb-8 px-4">
            Por favor, confirmá antes del 1 de Septiembre para una mejor organización.
          </p>
          <button className="w-full py-3 rounded-full bg-white text-black text-xs font-bold shadow-glow">
            CONFIRMAR POR WHATSAPP
          </button>
        </div>

        {/* Repeat Slide 1 for seamless loop */}
        <div className="min-h-full w-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-fuchsia-50 to-rose-50">
          <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-6">
            <span className="text-2xl">✨</span>
          </div>
          <h2 className="font-serif italic text-3xl text-zinc-800 mb-2">Mis 15 Años</h2>
          <h1 className="font-serif text-4xl font-bold text-zinc-900 mb-4">Valentina</h1>
          <div className="w-12 h-px bg-zinc-300 mb-4" />
          <p className="text-zinc-500 tracking-widest text-xs uppercase">14 · Septiembre · 2026</p>
        </div>
      </div>
      
      {/* Scroll indicator overlay */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-40">
        <div className="w-1 h-3 rounded-full bg-zinc-400 animate-bounce" />
        <span className="text-[8px] font-bold text-zinc-400">SCROLL</span>
      </div>
    </div>
  );
}

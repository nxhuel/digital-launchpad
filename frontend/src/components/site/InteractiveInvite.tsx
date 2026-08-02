import { useState, useEffect } from "react";
import { Music2, MapPin, Calendar, Clock, Gift, Heart, Send } from "lucide-react";

export function InteractiveInvite() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="relative h-full w-full bg-white overflow-y-auto scrollbar-hide select-none">
      {/* Floating Music Toggle */}
      <button 
        onClick={() => setIsPlaying(!isPlaying)}
        className="fixed top-20 right-4 z-50 h-10 w-10 rounded-full bg-white/80 backdrop-blur-md shadow-lg flex items-center justify-center border border-zinc-100 text-zinc-800"
      >
        <Music2 className={`h-5 w-5 ${isPlaying ? "animate-spin" : ""}`} />
      </button>

      {/* 1. COVER */}
      <section className="relative h-[110%] w-full flex flex-col items-center justify-center text-center p-6 bg-gradient-to-b from-[#fdfcfb] to-[#e2d1c3]">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />
        
        <div className="relative z-10 animate-fade-in">
          <span className="text-[10px] uppercase tracking-[0.4em] text-zinc-500 mb-6 block">Nos Casamos</span>
          <h1 className="font-serif text-5xl md:text-6xl text-zinc-900 mb-2">Sofía</h1>
          <span className="font-serif text-3xl text-zinc-400 italic my-2 block">&</span>
          <h1 className="font-serif text-5xl md:text-6xl text-zinc-900 mb-8">Mateo</h1>
          <div className="h-px w-20 bg-zinc-300 mx-auto mb-8" />
          <p className="font-serif italic text-xl text-zinc-600">Sábado 12 de Octubre</p>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50">
          <div className="w-px h-12 bg-gradient-to-b from-zinc-400 to-transparent animate-bounce" />
          <span className="text-[8px] uppercase tracking-widest text-zinc-400">Scroll</span>
        </div>
      </section>

      {/* 2. INTRO */}
      <section className="py-20 px-8 text-center bg-white">
        <Heart className="h-8 w-8 text-rose-200 mx-auto mb-8" />
        <p className="font-serif italic text-lg text-zinc-700 leading-relaxed">
          "Hay momentos que duran segundos, pero ocupan toda una vida. Queremos que seas parte del día en que decidimos decir SI para siempre."
        </p>
      </section>

      {/* 3. COUNTDOWN */}
      <section className="py-20 px-6 bg-zinc-50 text-center">
        <h3 className="text-xs uppercase tracking-[0.3em] text-zinc-400 mb-10">Cuenta Regresiva</h3>
        <div className="grid grid-cols-4 gap-2">
          {[
            { v: "142", l: "Días" },
            { v: "12", l: "Horas" },
            { v: "45", l: "Min" },
            { v: "08", l: "Seg" },
          ].map((t) => (
            <div key={t.l} className="bg-white rounded-xl p-3 border border-zinc-100 shadow-sm">
              <div className="text-xl font-bold text-zinc-800">{t.v}</div>
              <div className="text-[8px] uppercase text-zinc-400 font-bold">{t.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. CEREMONY & PARTY */}
      <section className="py-20 px-8 space-y-12 bg-white">
        {/* Ceremony */}
        <div className="text-center">
          <div className="h-14 w-14 rounded-full bg-zinc-50 flex items-center justify-center mx-auto mb-6">
            <Calendar className="h-6 w-6 text-zinc-800" />
          </div>
          <h3 className="text-xl font-bold text-zinc-900 mb-2">Ceremonia</h3>
          <p className="text-sm text-zinc-500 mb-1">19:30 Horas</p>
          <p className="text-sm text-zinc-600 font-medium mb-6">Parroquia San Benito</p>
          <button className="px-6 py-2.5 rounded-full border border-zinc-200 text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-50 transition-colors">
            CÓMO LLEGAR
          </button>
        </div>

        <div className="h-px w-20 bg-zinc-100 mx-auto" />

        {/* Party */}
        <div className="text-center">
          <div className="h-14 w-14 rounded-full bg-zinc-50 flex items-center justify-center mx-auto mb-6">
            <Clock className="h-6 w-6 text-zinc-800" />
          </div>
          <h3 className="text-xl font-bold text-zinc-900 mb-2">Fiesta</h3>
          <p className="text-sm text-zinc-500 mb-1">21:00 Horas</p>
          <p className="text-sm text-zinc-600 font-medium mb-6">Estancia La Reserva</p>
          <button className="px-6 py-2.5 rounded-full border border-zinc-200 text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-50 transition-colors">
            CÓMO LLEGAR
          </button>
        </div>
      </section>

      {/* 5. DRESS CODE */}
      <section className="py-20 px-8 bg-zinc-900 text-white text-center">
        <h3 className="text-2xl font-serif italic mb-4">Dress Code</h3>
        <p className="text-zinc-400 text-sm mb-6 uppercase tracking-widest">Elegante Sport</p>
        <div className="text-4xl">👔👗</div>
      </section>

      {/* 6. GIFT REGISTRY */}
      <section className="py-20 px-8 text-center bg-zinc-50">
        <Gift className="h-10 w-10 text-zinc-300 mx-auto mb-6" />
        <h3 className="text-xl font-bold text-zinc-900 mb-4">Regalos</h3>
        <p className="text-sm text-zinc-500 leading-relaxed mb-8">
          Tu presencia es nuestro mejor regalo. Pero si deseas hacernos un presente, podés hacerlo a través de transferencia bancaria.
        </p>
        <button className="px-8 py-3 rounded-full bg-zinc-900 text-white text-[10px] font-bold uppercase tracking-widest">
          VER DATOS BANCARIOS
        </button>
      </section>

      {/* 7. RSVP */}
      <section className="py-20 px-8 text-center bg-white mb-20">
        <Send className="h-8 w-8 text-rose-200 mx-auto mb-6" />
        <h3 className="text-2xl font-serif italic mb-6">RSVP</h3>
        <p className="text-sm text-zinc-500 mb-10">
          Por favor, confirmá tu asistencia antes del 15 de Septiembre.
        </p>
        <button className="w-full py-4 rounded-xl bg-[#25D366] text-white font-bold flex items-center justify-center gap-2 shadow-lg">
          CONFIRMAR ASISTENCIA
        </button>
      </section>

      {/* Sticky Bottom Bar */}
      <div className="sticky bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-zinc-100 flex items-center justify-center z-50">
        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Sofía & Mateo · 12.10.26</p>
      </div>
    </div>
  );
}

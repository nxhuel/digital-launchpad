import { useState } from "react";
import { Plus, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FaqItem {
  question: string;
  answer: string;
}

/** Convierte *texto* en <strong> (negrita) para los contenidos de las respuestas. */
function renderInline(text: string) {
  const parts = text.split(/\*([^*]+)\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-bold text-foreground">
        {part}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

function FaqAnswer({ answer }: { answer: string }) {
  const lines = answer
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  // Si hay varias líneas y todas arrancan con "*", se renderiza como lista.
  const isBulletList = lines.length > 1 && lines.every((l) => l.startsWith("*"));

  if (isBulletList) {
    return (
      <ul className="space-y-3">
        {lines.map((line, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
            <span className="leading-relaxed">
              {renderInline(line.replace(/^\*\s*/, ""))}
            </span>
          </li>
        ))}
      </ul>
    );
  }

  return <p className="leading-relaxed">{renderInline(answer)}</p>;
}

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="mt-24">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-5">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-xs font-bold tracking-widest uppercase text-primary">
              Preguntas frecuentes
            </span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Resolvemos tus <span className="text-gradient">dudas</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Todo lo que necesitás saber antes de crear tu invitación digital.
          </p>
        </div>

        <div className="space-y-4">
          {items.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className={cn(
                  "glass rounded-2xl overflow-hidden transition-all duration-300",
                  isOpen && "border-primary/40 shadow-glow",
                )}
              >
                <button
                  id={`faq-button-${index}`}
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${index}`}
                  className="group flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                >
                  <span className="font-bold text-foreground text-base md:text-lg pr-2">
                    {item.question}
                  </span>
                  <span
                    className={cn(
                      "grid h-9 w-9 shrink-0 place-items-center rounded-full border transition-all duration-300",
                      isOpen
                        ? "bg-primary border-primary text-white rotate-45"
                        : "bg-white/70 border-slate-200 text-primary group-hover:border-primary/40 group-hover:bg-primary/10",
                    )}
                  >
                    <Plus className="h-4 w-4" />
                  </span>
                </button>

                <div
                  id={`faq-panel-${index}`}
                  role="region"
                  aria-labelledby={`faq-button-${index}`}
                  className={cn(
                    "grid transition-all duration-300 ease-out",
                    isOpen
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0",
                  )}
                >
                  <div className="overflow-hidden">
                    <div className="px-6 pb-6 pt-0">
                      <div className="border-t border-slate-200/70 pt-4 text-muted-foreground">
                        <FaqAnswer answer={item.answer} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

import { BrainCircuit } from "lucide-react";

function MetricCard({ label, value, detail }) {
  return (
    <article className="soft-panel py-3 px-4 flex-1">
      <p className="text-[10px] uppercase tracking-[0.22em] text-slate-400 font-semibold mb-1">
        {label}
      </p>
      <p className="text-xl font-bold text-white mb-0.5">{value}</p>
      <p className="text-[11px] leading-relaxed text-slate-400">{detail}</p>
    </article>
  );
}

export default function HeroSection({ activeTechnology }) {
  return (
    <section className="flex flex-col gap-6" data-reveal="hero">
      <div className="space-y-6 pt-3">
        <div className="eyebrow-chip">
          <BrainCircuit className="h-4 w-4" />
          Bem-vindo de volta
        </div>

        <div className="space-y-4">
          <h1 className="font-['Space_Grotesk'] text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-white max-w-2xl">
            Pronto para focar no seu <span className="text-sky-400">crescimento hoje?</span>
          </h1>

          <p className="max-w-xl text-sm leading-relaxed text-slate-300">
            Acesse suas bibliotecas de tecnologia abaixo para navegar pelos conteúdos e abrir a Sala de Estudos com anotações conectadas.
          </p>
        </div>

        <div className="flex gap-4 sm:flex-row flex-col w-full max-w-2xl pt-2">
          <MetricCard
            label="Tecnologia Alvo Atual"
            value={activeTechnology.name}
            detail={`${activeTechnology.lessons} Aulas registradas`}
          />
          <MetricCard
            label="Desempenho Semanal"
            value="Firme"
            detail="9 dias de progresso consistente"
          />
        </div>
      </div>
    </section>
  );
}

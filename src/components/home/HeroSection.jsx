import { BrainCircuit } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="flex flex-col gap-6" data-reveal="hero">
      <div className="space-y-6 pt-3">
        <div className="eyebrow-chip">
          <BrainCircuit className="h-4 w-4" />
          Bem-vindo de volta
        </div>

        <div className="space-y-4">
          <h1 className="max-w-2xl font-['Space_Grotesk'] text-4xl font-bold leading-tight tracking-tight text-white lg:text-5xl">
            Pronto para focar no seu <span className="text-sky-400">crescimento hoje?</span>
          </h1>

          <p className="max-w-xl text-sm leading-relaxed text-slate-300">
            Organize suas tecnologias, ajuste a capa de cada biblioteca e abra os conteudos sem sair da dashboard.
          </p>
        </div>
      </div>
    </section>
  );
}

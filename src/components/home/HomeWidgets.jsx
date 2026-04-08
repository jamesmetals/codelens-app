import { ChevronRight, Pencil, Plus } from "lucide-react";

import TechnologyArtwork from "./TechnologyArtwork";

function getContentLabel(count) {
  return `${count} ${count === 1 ? "conteudo" : "conteudos"}`;
}

export function TechnologySpotlight({
  activeTechnology,
  technologies,
  setActiveTechnology,
  onCreateTechnology,
  onEditTechnology,
  onSelectTechnology,
}) {
  return (
    <article
      className="premium-panel technology-spotlight h-full"
      data-reveal="panel"
      data-tech-detail="true"
    >
      <div className="flex flex-col gap-4 border-b border-white/8 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-sky-200/70">
            Biblioteca de tecnologias
          </p>
          <h2 className="mt-2 font-['Space_Grotesk'] text-3xl font-bold tracking-tight text-white">
            Suas tecnologias em um unico painel
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
            Abra os conteudos, ajuste a capa de cada card e mantenha a dashboard focada apenas no que importa.
          </p>
        </div>

        <button
          type="button"
          onClick={onCreateTechnology}
          className="inline-flex min-h-[3.35rem] items-center justify-center gap-2 rounded-2xl border border-sky-400/25 bg-sky-500/12 px-5 text-sm font-semibold text-sky-100 transition-all hover:border-sky-300/40 hover:bg-sky-500/18"
        >
          <Plus className="h-4 w-4" />
          Adicionar tecnologia
        </button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {technologies.map((technology) => {
          const contentCount = technology.contents?.length || 0;
          const isActive = technology.id === activeTechnology?.id;

          return (
            <article
              key={technology.id}
              className={`tech-card tech-library-card group relative overflow-hidden ${
                isActive ? "tech-card-active scale-[1.01] shadow-lg shadow-sky-500/10" : ""
              }`}
            >
              <button
                type="button"
                onClick={() => onEditTechnology(technology)}
                className="absolute right-3 top-3 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-[#07111d]/85 text-slate-300 transition-all hover:border-sky-300/30 hover:bg-sky-500/10 hover:text-sky-100"
                aria-label={`Editar ${technology.name}`}
              >
                <Pencil className="h-4 w-4" />
              </button>

              <button
                type="button"
                onMouseEnter={() => setActiveTechnology(technology)}
                onFocus={() => setActiveTechnology(technology)}
                onClick={() => onSelectTechnology(technology)}
                className="flex w-full items-start gap-4 text-left"
              >
                <TechnologyArtwork technology={technology} className="h-24 w-24 shrink-0" />

                <div className="min-w-0 flex-1 pr-10">
                  <p className="truncate text-xl font-semibold text-white">{technology.name}</p>
                  <p className="mt-2 text-sm text-slate-400">{getContentLabel(contentCount)}</p>

                  <div className="mt-8 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-200/70">
                    <span>Abrir biblioteca</span>
                    <ChevronRight className={`h-4 w-4 transition-transform duration-300 ${isActive ? "translate-x-1 text-sky-300" : "text-sky-200/60"}`} />
                  </div>
                </div>
              </button>
            </article>
          );
        })}
      </div>
    </article>
  );
}

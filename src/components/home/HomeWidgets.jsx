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
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-['Space_Grotesk'] text-xl font-semibold tracking-tight text-white">
          Tecnologias
        </h2>

        <button
          type="button"
          onClick={onCreateTechnology}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-sky-400/25 bg-sky-500/12 px-4 text-sm font-semibold text-sky-100 transition-colors hover:border-sky-300/40 hover:bg-sky-500/18"
        >
          <Plus className="h-4 w-4" />
          Adicionar tecnologia
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {technologies.map((technology) => {
          const contentCount = technology.contents?.length || 0;
          const isActive = technology.id === activeTechnology?.id;

          return (
            <article
              key={technology.id}
              className={`tech-card tech-library-card group ${isActive ? "tech-card-active" : ""}`}
            >
              <button
                type="button"
                onClick={() => onEditTechnology(technology)}
                className="absolute right-3 top-3 z-20 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/8 bg-[#081423]/85 text-slate-400 transition-colors hover:border-sky-300/30 hover:text-sky-100"
                aria-label={`Editar ${technology.name}`}
              >
                <Pencil className="h-4 w-4" />
              </button>

              <button
                type="button"
                onMouseEnter={() => setActiveTechnology(technology)}
                onFocus={() => setActiveTechnology(technology)}
                onClick={() => onSelectTechnology(technology)}
                className="flex w-full items-center gap-3 text-left"
              >
                <TechnologyArtwork technology={technology} className="h-16 w-16 shrink-0 rounded-xl" />

                <div className="min-w-0 flex-1 pr-8">
                  <p className="truncate text-lg font-semibold text-white">{technology.name}</p>
                  <p className="mt-1 text-sm text-slate-400">{getContentLabel(contentCount)}</p>
                </div>

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/[0.04] text-slate-400 transition-colors group-hover:text-sky-200">
                  <ChevronRight className={`h-4 w-4 transition-transform duration-200 ${isActive ? "translate-x-0.5" : ""}`} />
                </div>
              </button>
            </article>
          );
        })}
      </div>
    </article>
  );
}

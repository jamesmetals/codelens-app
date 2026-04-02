import { useEffect, useRef } from "react";
import anime from "animejs";
import { ChevronRight, PlayCircle, FileText, LayoutList, Lock, CheckCircle2 } from "lucide-react";

export function TechnologySpotlight({ activeTechnology, technologies, setActiveTechnology, onSelectTechnology }) {
  return (
    <article
      className="premium-panel technology-spotlight h-full"
      data-reveal="panel"
      data-tech-detail="true"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {technologies.map((technology) => (
          <button
            key={technology.name}
            className={`tech-card transition-all duration-300 ${
              technology.name === activeTechnology.name ? "tech-card-active scale-[1.02] shadow-lg shadow-sky-500/10" : "hover:scale-[1.01]"
            }`}
            onMouseEnter={() => setActiveTechnology(technology)}
            onFocus={() => setActiveTechnology(technology)}
            onClick={() => onSelectTechnology(technology)}
            type="button"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-lg font-semibold text-white">
                  {technology.name}
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  {technology.lessons} aulas • {technology.aiSessions} análises
                </p>
              </div>
              <ChevronRight className={`h-5 w-5 transition-transform duration-300 ${technology.name === activeTechnology.name ? "text-sky-400 translate-x-1" : "text-sky-200/70"}`} />
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-slate-400">
                <span>progresso</span>
                <span>{technology.progress}%</span>
              </div>
              <div className="progress-track">
                <div
                  className="progress-fill transition-all duration-1000 ease-out"
                  data-progress={technology.progress}
                  style={{ width: `${technology.progress}%` }}
                />
              </div>
            </div>
          </button>
        ))}
      </div>
    </article>
  );
}

export function ContentPreviewAsider({ activeTechnology }) {
  const contents = activeTechnology.contents || [];
  const listRef = useRef(null);
  
  // Efeito AnimeJS para a troca de tecnologia (Fade e Stagger List)
  useEffect(() => {
    if (!listRef.current) return;
    
    // Reseta opacidade para animação suave
    const elements = listRef.current.querySelectorAll('.preview-item');
    if (elements.length > 0) {
      anime({
        targets: elements,
        opacity: [0, 1],
        translateX: [-15, 0],
        delay: anime.stagger(50),
        duration: 400,
        easing: 'easeOutQuad'
      });
    }
  }, [activeTechnology.name]);
  
  const renderIcon = (type) => {
    if (type === "video") return <PlayCircle className="h-4 w-4" />;
    if (type === "article") return <FileText className="h-4 w-4" />;
    return <LayoutList className="h-4 w-4" />;
  };

  return (
    <aside className="premium-panel p-6 shadow-[-10px_0_30px_rgba(0,0,0,0.1)] flex flex-col h-[400px] overflow-hidden" data-reveal="panel">
      
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div className="animate-fade-in">
          <p className="text-xs uppercase tracking-[0.2em] text-sky-200/70 font-semibold mb-1">
            Prévia da Biblioteca
          </p>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
             Módulos de {activeTechnology.name}
          </h3>
        </div>
      </div>

      <div ref={listRef} className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-2 pb-2 h-full">
        {contents.map((content, idx) => {
           const isLocked = content.status === "locked";
           const isCompleted = content.status === "completed";
           const isInProgress = content.status === "in-progress";

           return (
             <div 
               key={content.id}
               className={`preview-item flex items-start gap-3 p-3 rounded-xl border transition-all ${
                 isLocked 
                   ? "bg-white/[0.02] border-white/5 opacity-60" 
                   : "bg-[#0B1D35]/30 border-white/10 hover:border-sky-500/30 hover:bg-[#0B1D35]/70 shadow-md transform hover:-translate-y-0.5"
               }`}
             >
                <div className={`mt-0.5 h-7 w-7 rounded-full flex items-center justify-center shrink-0 ${
                    isCompleted ? "bg-emerald-500/10 text-emerald-400" :
                    isInProgress ? "bg-sky-500/20 text-sky-400 ring-1 ring-sky-500/30" :
                    "bg-white/5 text-slate-500"
                  }`}>
                    {isLocked ? <Lock className="h-3 w-3" /> : 
                     isCompleted ? <CheckCircle2 className="h-4 w-4" /> :
                     renderIcon(content.type)}
                </div>
                  
                <div className="flex-1">
                  <h4 className={`text-sm font-semibold leading-tight mb-1 ${isLocked ? "text-slate-500" : "text-slate-200"} transition-colors`}>
                    {idx + 1}. {content.title}
                  </h4>
                  <div className="flex items-center gap-2 text-[10px]">
                    <span className="text-slate-500 uppercase tracking-widest font-semibold">{content.type}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-700" />
                    <span className="text-slate-400">{content.duration}</span>
                  </div>
                </div>
             </div>
           );
        })}
        {contents.length === 0 && (
           <p className="text-sm text-slate-400 text-center py-6">Nenhum conteúdo listado para esta área ainda.</p>
        )}
      </div>

    </aside>
  );
}

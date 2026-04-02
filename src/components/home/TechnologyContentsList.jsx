import { useState } from "react";
import {
  ArrowLeft, Plus, Search, LayoutList, LayoutGrid, AlignJustify,
  GripVertical, Tag, MessageSquare, BookOpen, Pencil, CheckCircle2, Clock
} from "lucide-react";

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    "em-andamento": { label: "Em andamento", classes: "bg-amber-500/15 text-amber-400 border-amber-500/20" },
    "concluido":    { label: "Concluído",     classes: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" },
  };
  const cfg = map[status] || map["em-andamento"];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-semibold uppercase tracking-wider ${cfg.classes}`}>
      {status === "concluido" ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
      {cfg.label}
    </span>
  );
}

// ─── Content Card — LISTA ──────────────────────────────────────────────────────
function CardList({ content, onOpen, showSummary }) {
  return (
    <div
      className="group flex items-start gap-3 p-5 rounded-2xl border border-white/8 bg-[#0B1D35]/20 hover:border-sky-500/30 hover:bg-[#0B1D35]/50 transition-all duration-200 cursor-pointer"
      onClick={() => onOpen(content)}
    >
      {/* drag handle */}
      <div className="mt-0.5 text-slate-600 group-hover:text-slate-400 transition-colors shrink-0 cursor-grab">
        <GripVertical className="h-4 w-4" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-[15px] font-semibold text-white group-hover:text-sky-300 transition-colors leading-snug">
            {content.title}
          </h3>
          <div className="flex items-center gap-2 shrink-0">
            {content.highlights.length > 0 && (
              <span className="flex items-center gap-1 text-[10px] text-slate-400">
                <MessageSquare className="h-3 w-3" />
                {content.highlights.length}
              </span>
            )}
            <StatusBadge status={content.status} />
          </div>
        </div>

        {showSummary && content.summary && (
          <p className="mt-2 text-sm text-slate-400 leading-relaxed line-clamp-2">
            {content.summary}
          </p>
        )}

        {content.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {content.tags.map(tag => (
              <span key={tag} className="inline-flex items-center gap-1 bg-white/5 border border-white/8 text-slate-400 text-[10px] px-2 py-0.5 rounded-md">
                <Tag className="h-2.5 w-2.5" /> {tag}
              </span>
            ))}
          </div>
        )}

        {content.highlights.length > 0 && showSummary && (
          <div className="mt-4 bg-black/30 border border-white/5 rounded-xl p-3 space-y-1.5">
            <p className="text-[9px] uppercase tracking-widest text-slate-500 font-semibold mb-2">Trechos destacados</p>
            {content.highlights.map((h, i) => (
              <p key={i} className="text-xs text-slate-300 font-mono border-l-2 border-sky-500/40 pl-2 py-0.5">
                "{h}"
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Content Card — BLOCOS ─────────────────────────────────────────────────────
function CardBlock({ content, onOpen }) {
  return (
    <div
      className="group flex flex-col gap-3 p-5 rounded-2xl border border-white/8 bg-[#0B1D35]/20 hover:border-sky-500/30 hover:bg-[#0B1D35]/50 transition-all duration-200 cursor-pointer"
      onClick={() => onOpen(content)}
    >
      <div className="flex justify-between items-start">
        <StatusBadge status={content.status} />
        {content.highlights.length > 0 && (
          <span className="flex items-center gap-1 text-[10px] text-slate-500">
            <MessageSquare className="h-3 w-3" /> {content.highlights.length}
          </span>
        )}
      </div>
      <h3 className="text-[14px] font-semibold text-white group-hover:text-sky-300 transition-colors leading-snug">
        {content.title}
      </h3>
      {content.summary ? (
        <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">{content.summary}</p>
      ) : (
        <p className="text-xs text-slate-600 italic">Sem resumo</p>
      )}
      <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
        {content.tags.length > 0
          ? content.tags.map(tag => (
              <span key={tag} className="text-[10px] bg-white/5 border border-white/8 text-slate-400 px-2 py-0.5 rounded-md">
                {tag}
              </span>
            ))
          : <span className="text-[10px] text-slate-600">Sem tags</span>
        }
        <button className="ml-auto text-xs text-sky-400 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
          Abrir →
        </button>
      </div>
    </div>
  );
}

// ─── Content Card — COMPACTO ───────────────────────────────────────────────────
function CardCompact({ content, onOpen }) {
  return (
    <div
      className="group flex items-center justify-between px-4 py-3 rounded-xl border border-white/5 bg-white/[0.02] hover:border-sky-500/20 hover:bg-[#0B1D35]/40 transition-all duration-150 cursor-pointer"
      onClick={() => onOpen(content)}
    >
      <div className="flex items-center gap-3 min-w-0">
        <GripVertical className="h-3.5 w-3.5 text-slate-600 shrink-0" />
        <span className="text-sm text-white group-hover:text-sky-300 transition-colors truncate">
          {content.title}
        </span>
        {content.tags.slice(0, 2).map(tag => (
          <span key={tag} className="hidden sm:inline text-[10px] bg-white/5 text-slate-500 px-1.5 py-0.5 rounded">
            {tag}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {content.highlights.length > 0 && (
          <span className="text-[10px] text-slate-500 flex items-center gap-1">
            <MessageSquare className="h-3 w-3" />{content.highlights.length}
          </span>
        )}
        <StatusBadge status={content.status} />
      </div>
    </div>
  );
}



export default function TechnologyContentsList({ activeTechnology, onBack, onOpenStudyRoom }) {
  const [view, setView] = useState("lista"); // "lista" | "blocos" | "compacto"
  const [showSummary, setShowSummary] = useState(true);
  const [search, setSearch] = useState("");
  const [contents] = useState(activeTechnology?.contents || []);

  if (!activeTechnology) return null;

  const filtered = contents.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.tags.some(t => t.toLowerCase().includes(search.toLowerCase())) ||
    (c.summary || "").toLowerCase().includes(search.toLowerCase())
  );

  // Abrir o StudyRoom editor para conteúdo existente
  const openEditor = (content) => onOpenStudyRoom(content);

  // Criar novo bloco em branco e abrir diretamente no editor
  const openCreator = () => onOpenStudyRoom({
    id: Date.now(),
    title: "Novo conteúdo",
    summary: "",
    tags: [],
    status: "em-andamento",
    highlights: [],
    createdAt: new Date().toISOString().slice(0, 10),
  });

  const modeLabel = { lista: "MODO EM LISTA", blocos: "MODO EM BLOCOS", compacto: "MODO COMPACTO" };

  return (
    <div className="flex h-screen overflow-hidden bg-[#06111f] animate-fade-in relative z-10 w-full">

        {/* ── Sidebar ── */}
        <aside className="w-64 shrink-0 flex flex-col border-r border-white/8 bg-[#040D17]/60 p-5 gap-6">
          {/* Back */}
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium w-fit"
          >
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </button>

          {/* Tecnologia ativa */}
          <div>
            <p className="text-[9px] uppercase tracking-widest text-slate-500 font-semibold mb-3">Tecnologia ativa</p>
            <div className="flex items-center gap-3 bg-white/5 border border-white/8 rounded-xl p-3">
              <div className="w-9 h-9 rounded-lg bg-sky-500/20 border border-sky-500/30 flex items-center justify-center shrink-0">
                <BookOpen className="h-4 w-4 text-sky-400" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">{activeTechnology.name}</p>
                <p className="text-[10px] text-slate-400">{contents.length} conteúdos</p>
              </div>
              <Pencil className="h-3.5 w-3.5 text-slate-500 shrink-0" />
            </div>
          </div>

          {/* CTA Criar */}
          <button
            onClick={openCreator}
            className="flex items-center justify-center gap-2 w-full bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-300 font-semibold text-sm py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(14,165,233,0.1)] hover:shadow-[0_0_25px_rgba(14,165,233,0.2)]"
          >
            <Plus className="h-4 w-4" /> Criar novo conteúdo
          </button>

          {/* Search */}
          <div>
            <p className="text-[9px] uppercase tracking-widest text-slate-500 font-semibold mb-2">Buscar conteúdos</p>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Títulos, tags ou trechos..."
                className="w-full bg-black/30 border border-white/8 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-sky-500/40 transition-all"
              />
            </div>
          </div>

          <p className="text-[10px] text-slate-600 mt-auto">Arraste os conteúdos para reordenar.</p>
        </aside>

        {/* ── Main Area ── */}
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-4xl mx-auto px-6 py-8">

            {/* Header */}
            <div className="flex items-start justify-between mb-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-1 h-7 bg-sky-500 rounded-full inline-block" />
                  <h1 className="text-3xl font-bold text-white font-['Space_Grotesk'] tracking-tight">
                    {activeTechnology.name}
                  </h1>
                </div>
                <p className="text-slate-400 text-sm ml-4">
                  Seus blocos de estudo — criados e organizados por você.
                </p>
              </div>
              <span className="text-sm text-slate-500 pt-2">{filtered.length} conteúdos</span>
            </div>

            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center bg-black/30 border border-white/8 rounded-xl p-1 gap-0.5">
                {[
                  { id: "lista",    icon: LayoutList,   label: "Lista" },
                  { id: "blocos",   icon: LayoutGrid,   label: "Blocos" },
                  { id: "compacto", icon: AlignJustify, label: "Compacta" },
                ].map(({ id, icon: Icon, label }) => (
                  <button
                    key={id}
                    onClick={() => setView(id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      view === id
                        ? "bg-white/10 text-white"
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" /> {label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <div
                    onClick={() => setShowSummary(v => !v)}
                    className={`w-8 h-4 rounded-full transition-colors relative ${showSummary ? "bg-sky-500" : "bg-white/10"}`}
                  >
                    <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${showSummary ? "translate-x-4" : "translate-x-0.5"}`} />
                  </div>
                  <span className="text-xs text-slate-400">Exibir resumo</span>
                </label>
                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">{modeLabel[view]}</span>
              </div>
            </div>

            {/* Content List */}
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
                <BookOpen className="h-10 w-10 text-slate-500 mb-4" />
                <p className="text-white font-medium mb-1">
                  {search ? "Nenhum conteúdo encontrado" : "Sem conteúdos ainda"}
                </p>
                <p className="text-sm text-slate-500">
                  {search ? "Tente outra busca." : "Clique em \"Criar novo conteúdo\" para começar."}
                </p>
              </div>
            ) : (
              <div className={view === "blocos" ? "grid grid-cols-2 gap-4" : "space-y-3"}>
                {filtered.map(content => {
                  if (view === "blocos")   return <CardBlock   key={content.id} content={content} onOpen={openEditor} />;
                  if (view === "compacto") return <CardCompact key={content.id} content={content} onOpen={openEditor} />;
                  return (
                    <CardList
                      key={content.id}
                      content={content}
                      onOpen={openEditor}
                      showSummary={showSummary}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
  );
}

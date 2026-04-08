import { useState } from "react";
import {
  ArrowLeft, Plus, Search, LayoutList, LayoutGrid, AlignJustify,
  GripVertical, BookOpen, Pencil, CheckCircle2, Clock,
  Trash2, AlertTriangle
} from "lucide-react";
import TechnologyArtwork from "./TechnologyArtwork";

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
function CardList({ content, onOpen, onDelete }) {
  return (
    <div
      className="group flex items-start gap-4 p-5 rounded-2xl border border-white/8 bg-[#0B1D35]/20 hover:border-sky-500/30 hover:bg-[#0B1D35]/50 transition-all duration-200 cursor-pointer relative"
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
          <div className="flex items-center gap-3 shrink-0">
            <StatusBadge status={content.status} />
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(content);
              }}
              className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {content.summary && (
          <p className="mt-2 text-sm text-slate-400 leading-relaxed line-clamp-2">
            {content.summary}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Content Card — BLOCOS ─────────────────────────────────────────────────────
function CardBlock({ content, onOpen, onDelete }) {
  return (
    <div
      className="group flex flex-col gap-3 p-5 rounded-2xl border border-white/8 bg-[#0B1D35]/20 hover:border-sky-500/30 hover:bg-[#0B1D35]/50 transition-all duration-200 cursor-pointer relative"
      onClick={() => onOpen(content)}
    >
      <div className="flex justify-between items-start">
        <StatusBadge status={content.status} />
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(content);
          }}
          className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
      <h3 className="text-[14px] font-semibold text-white group-hover:text-sky-300 transition-colors leading-snug">
        {content.title}
      </h3>
      {content.summary ? (
        <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">{content.summary}</p>
      ) : (
        <p className="text-xs text-slate-600 italic">Sem resumo</p>
      )}
      <div className="mt-auto pt-2 flex items-center justify-between">
        <div className="flex flex-wrap gap-1.5 ">
          {content.tags.slice(0, 2).map(tag => (
            <span key={tag} className="text-[9px] bg-white/5 border border-white/8 text-slate-500 px-1.5 py-0.5 rounded-md">
              {tag}
            </span>
          ))}
        </div>
        <button className="text-[10px] text-sky-400 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
          ABRIR →
        </button>
      </div>
    </div>
  );
}

// ─── Content Card — COMPACTO ───────────────────────────────────────────────────
function CardCompact({ content, onOpen, onDelete }) {
  return (
    <div
      className="group flex items-center justify-between px-4 py-2.5 rounded-xl border border-white/5 bg-white/[0.02] hover:border-sky-500/20 hover:bg-[#0B1D35]/40 transition-all duration-150 cursor-pointer"
      onClick={() => onOpen(content)}
    >
      <div className="flex items-center gap-3 min-w-0">
        <GripVertical className="h-3.5 w-3.5 text-slate-600 shrink-0" />
        <span className="text-sm text-white group-hover:text-sky-300 transition-colors truncate">
          {content.title}
        </span>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <StatusBadge status={content.status} />
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(content);
          }}
          className="p-1 rounded-md text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

// ─── Modal de Confirmação de Exclusão ──────────────────────────────────────────
function ConfirmDeleteModal({ isOpen, onClose, onConfirm, title }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#0D1F35] border border-white/10 rounded-2xl p-6 shadow-2xl animate-scale-in">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
            <AlertTriangle className="h-6 w-6 text-red-500" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white leading-tight">Excluir conteúdo?</h2>
            <p className="text-sm text-slate-400 mt-0.5">Esta ação não pode ser desfeita.</p>
          </div>
        </div>

        <div className="bg-black/20 rounded-xl p-4 mb-6 border border-white/5">
          <p className="text-sm text-slate-300 font-medium line-clamp-2">
            "{title}"
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-semibold transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors shadow-lg shadow-red-900/20"
          >
            Confirmar Exclusão
          </button>
        </div>
      </div>
    </div>
  );
}



export default function TechnologyContentsList({ activeTechnology, onBack, onOpenStudyRoom }) {
  const [view, setView] = useState("lista"); // "lista" | "blocos" | "compacto"
  const [search, setSearch] = useState("");
  const [contents, setContents] = useState(activeTechnology?.contents || []);
  const [deleteModal, setDeleteModal] = useState({ open: false, item: null });

  if (!activeTechnology) return null;

  const filtered = contents.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.tags.some(t => t.toLowerCase().includes(search.toLowerCase())) ||
    (c.summary || "").toLowerCase().includes(search.toLowerCase())
  );

  // Abrir o StudyRoom editor para conteúdo existente
  const openEditor = (content) => onOpenStudyRoom(content);

  // Exclusão
  const confirmDelete = (content) => setDeleteModal({ open: true, item: content });
  const handleDelete = () => {
    if (deleteModal.item) {
      setContents(prev => prev.filter(c => c.id !== deleteModal.item.id));
      setDeleteModal({ open: false, item: null });
    }
  };

  // Criar novo bloco em branco...
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
              <TechnologyArtwork technology={activeTechnology} className="h-11 w-11 shrink-0 rounded-xl" />
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
                ].map((viewOption) => (
                  <button
                    key={viewOption.id}
                    onClick={() => setView(viewOption.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      view === viewOption.id
                        ? "bg-white/10 text-white"
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    {viewOption.icon({ className: "h-3.5 w-3.5" })} {viewOption.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-4">
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
                  if (view === "blocos")   return <CardBlock   key={content.id} content={content} onOpen={openEditor} onDelete={confirmDelete} />;
                  if (view === "compacto") return <CardCompact key={content.id} content={content} onOpen={openEditor} onDelete={confirmDelete} />;
                  return (
                    <CardList
                      key={content.id}
                      content={content}
                      onOpen={openEditor}
                      onDelete={confirmDelete}
                    />
                  );
                })}
              </div>
            )}
          </div>

          <ConfirmDeleteModal
            isOpen={deleteModal.open}
            onClose={() => setDeleteModal({ open: false, item: null })}
            onConfirm={handleDelete}
            title={deleteModal.item?.title}
          />
        </main>
      </div>
  );
}

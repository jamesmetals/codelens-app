import { createElement, useMemo, useState } from "react";
import {
  Bell,
  BookMarked,
  FileText,
  GripVertical,
  HelpCircle,
  LayoutDashboard,
  LayoutGrid,
  LayoutList,
  Pencil,
  Plus,
  Search,
  Settings,
  Shield,
  Trash2,
  UserCircle2,
  X,
} from "lucide-react";

import GoogleMark from "../shared/GoogleMark";
import TechnologyArtwork from "./TechnologyArtwork";
import { getAvatarFallback, getAvatarUrl } from "../../utils/authUi";

function SidebarItem({ active = false, icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex w-full items-center px-8 py-3 text-left transition-all ${
        active
          ? "border-r-2 border-[#69daff] bg-gradient-to-r from-[#69daff]/10 to-transparent text-[#69daff]"
          : "text-[#a3aac4] hover:bg-[#141f38] hover:text-[#dee5ff]"
      }`}
    >
      {createElement(icon, { className: "mr-3 h-[18px] w-[18px]" })}
      <span className="font-['Manrope'] text-[10px] font-bold uppercase tracking-[0.24em]">
        {label}
      </span>
    </button>
  );
}

function SupportLink({ icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex items-center py-2 text-[#a3aac4] transition-colors hover:text-[#dee5ff]"
    >
      {createElement(icon, { className: "mr-2 h-4 w-4" })}
      <span className="font-['Manrope'] text-[10px] uppercase tracking-[0.24em]">
        {label}
      </span>
    </button>
  );
}

function ListCard({ content, onDelete, onOpen }) {
  return (
    <article
      className="group rounded-xl border border-[#40485d]/20 bg-[#0f1930] transition-colors hover:bg-[#141f38]"
    >
      <button
        type="button"
        onClick={() => onOpen(content)}
        className="flex w-full items-start gap-3 px-4 py-4 text-left sm:px-5"
      >
        <div className="pt-0.5 text-[#6d758c]">
          <GripVertical className="h-4 w-4" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h3 className="line-clamp-2 font-['Manrope'] text-[15px] font-bold leading-5 text-[#dee5ff]">
              {content.title}
            </h3>

            <div className="flex shrink-0 items-center">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete(content);
                }}
                className="opacity-0 transition-all hover:text-rose-300 group-hover:opacity-100"
                aria-label={`Excluir ${content.title}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {content.summary ? (
            <p className="mt-2 line-clamp-2 max-w-3xl text-sm leading-6 text-[#a3aac4]">
              {content.summary}
            </p>
          ) : null}
        </div>
      </button>
    </article>
  );
}

function BlockCard({ content, onDelete, onOpen }) {
  return (
    <article className="group overflow-hidden rounded-xl border border-[#40485d]/20 bg-[#0f1930] transition-colors hover:bg-[#141f38]">
      <button
        type="button"
        onClick={() => onOpen(content)}
        className="flex h-full w-full flex-col gap-3 p-4 text-left"
      >
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 pr-2 font-['Manrope'] text-[15px] font-bold leading-5 text-[#dee5ff]">
            {content.title}
          </h3>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onDelete(content);
            }}
            className="opacity-0 transition-all hover:text-rose-300 group-hover:opacity-100"
            aria-label={`Excluir ${content.title}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div>
          <p className="text-sm leading-6 text-[#a3aac4] line-clamp-3">
            {content.summary || "Sem resumo ainda."}
          </p>
        </div>
      </button>
    </article>
  );
}

function CompactCard({ content, onDelete, onOpen }) {
  return (
    <article className="rounded-lg border border-[#40485d]/20 bg-[#0f1930] transition-colors hover:bg-[#141f38]">
      <button
        type="button"
        onClick={() => onOpen(content)}
        className="flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left"
      >
        <div className="flex min-w-0 items-center gap-3">
          <GripVertical className="h-4 w-4 shrink-0 text-[#6d758c]" />
          <span className="truncate font-['Manrope'] text-sm font-semibold text-[#dee5ff]">
            {content.title}
          </span>
        </div>

        <div className="flex shrink-0 items-center">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onDelete(content);
            }}
            className="opacity-0 transition-all hover:text-rose-300 group-hover:opacity-100"
            aria-label={`Excluir ${content.title}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </button>
    </article>
  );
}

function ConfirmDeleteModal({
  error,
  isDeleting,
  isOpen,
  onClose,
  onConfirm,
  title,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => !isDeleting && onClose()}
      />

      <div className="relative z-10 w-full max-w-md rounded-xl border border-[#40485d]/30 bg-[#0f1930] p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-['Manrope'] text-lg font-bold text-[#dee5ff]">
              Excluir conteudo
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#a3aac4]">
              Essa acao remove o bloco da visualizacao atual.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="text-[#a3aac4] hover:text-[#dee5ff] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 rounded-lg border border-[#40485d]/20 bg-black/20 px-4 py-3 text-sm text-[#dee5ff]">
          {title}
        </div>

        {error ? (
          <div className="mt-4 rounded-lg border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            {error}
          </div>
        ) : null}

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-md border border-[#40485d]/30 px-4 py-2 text-sm font-semibold text-[#a3aac4] transition-colors hover:border-[#69daff]/30 hover:text-[#dee5ff] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="rounded-md bg-[#9f0519] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#d7383b] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDeleting ? "Excluindo..." : "Excluir"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TechnologyContentsList({
  activeTechnology,
  authUser,
  onBack,
  onDeleteContent,
  onEditTechnology,
  onOpenAccount,
  onOpenStudyRoom,
  onSignInWithGoogle,
  supabaseConfigured,
}) {
  const [view, setView] = useState("lista");
  const [search, setSearch] = useState("");
  const [deleteModal, setDeleteModal] = useState({ open: false, item: null });
  const [deleteError, setDeleteError] = useState("");
  const [isDeletingContent, setIsDeletingContent] = useState(false);

  const isLogged = Boolean(authUser);
  const avatarUrl = getAvatarUrl(authUser);
  const contents = useMemo(() => activeTechnology?.contents || [], [activeTechnology]);

  const filtered = useMemo(
    () => {
      const query = search.toLowerCase();

      return contents.filter((content) => {
        const tags = Array.isArray(content.tags) ? content.tags : [];
        return content.title.toLowerCase().includes(query)
          || tags.some((tag) => tag.toLowerCase().includes(query))
          || (content.summary || "").toLowerCase().includes(query);
      });
    },
    [contents, search],
  );

  if (!activeTechnology) return null;

  const openEditor = (content) => onOpenStudyRoom(content);

  const closeDeleteModal = () => {
    setDeleteModal({ open: false, item: null });
    setDeleteError("");
  };

  const confirmDelete = (content) => {
    setDeleteError("");
    setDeleteModal({ open: true, item: content });
  };

  const handleDelete = async () => {
    if (!deleteModal.item) return;

    setIsDeletingContent(true);
    setDeleteError("");

    try {
      const result = await onDeleteContent(activeTechnology.id, deleteModal.item.id);

      if (!result?.ok) {
        setDeleteError(result?.error || "Nao foi possivel excluir o conteudo.");
        return;
      }

      closeDeleteModal();
    } finally {
      setIsDeletingContent(false);
    }
  };

  const openCreator = () => onOpenStudyRoom({
    id: Date.now(),
    title: "Novo conteudo",
    summary: "",
    fullCode: "",
    tags: [],
    status: "em-andamento",
    highlights: [],
    studyNotes: [],
    createdAt: new Date().toISOString().slice(0, 10),
  });

  return (
    <div className="relative min-h-screen bg-[#060e20] text-[#dee5ff]">
      <div className="fixed inset-0 bg-[#060e20]" />

      <aside className="fixed left-0 top-0 z-[60] hidden h-full w-64 flex-col gap-y-6 bg-[#091328] py-8 lg:flex">
        <div className="mb-4 px-8">
          <button type="button" onClick={onBack} className="text-left">
            <h1 className="font-['Manrope'] text-2xl font-black italic tracking-tighter text-[#69daff]">
              CodenLens
            </h1>
            <p className="mt-1 font-['Manrope'] text-[10px] uppercase tracking-widest text-[#a3aac4]">
              Biblioteca ativa
            </p>
          </button>
        </div>

        <nav className="flex-1 space-y-1">
          <SidebarItem icon={LayoutDashboard} label="Painel" onClick={onBack} />
          <SidebarItem active icon={BookMarked} label="Conteudos" onClick={() => {}} />
          <SidebarItem
            icon={UserCircle2}
            label={isLogged ? "Conta" : "Entrar"}
            onClick={isLogged ? onOpenAccount : onSignInWithGoogle}
          />
          <SidebarItem icon={Shield} label="Acompanhamento" onClick={() => {}} />
        </nav>

        <div className="px-8">
          <p className="font-['Manrope'] text-[10px] uppercase tracking-widest text-[#6d758c]">
            Tecnologia ativa
          </p>

          <div className="mt-3 rounded-xl border border-[#40485d]/20 bg-[#0f1930] p-4">
            <div className="flex items-center gap-3">
              <TechnologyArtwork
                technology={activeTechnology}
                className="h-12 w-12 shrink-0 rounded-lg border-white/10"
              />

              <div className="min-w-0 flex-1">
                <p className="truncate font-['Manrope'] text-sm font-bold text-[#dee5ff]">
                  {activeTechnology.name}
                </p>
                <p className="mt-1 text-xs text-[#a3aac4]">
                  {filtered.length} conteudos
                </p>
              </div>

              <button
                type="button"
                onClick={() => onEditTechnology(activeTechnology)}
                className="text-[#a3aac4] transition-colors hover:text-[#69daff]"
                aria-label={`Editar ${activeTechnology.name}`}
              >
                <Pencil className="h-4 w-4" />
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={openCreator}
            className="mt-4 w-full rounded-md bg-gradient-to-br from-[#69daff] to-[#00c0ea] py-2 font-['Manrope'] text-xs font-bold text-[#002a35] shadow-lg shadow-[#69daff]/20"
          >
            Criar novo conteudo
          </button>
        </div>

        <div className="mt-auto px-8">
          <div className="space-y-1 border-t border-[#40485d]/10 pt-4">
            <SupportLink icon={FileText} label="Documentacao" onClick={() => {}} />
            <SupportLink icon={HelpCircle} label="Ajuda" onClick={() => {}} />
          </div>
        </div>
      </aside>

      <header className="fixed top-0 z-50 flex h-16 w-full items-center justify-between bg-[#060e20]/80 px-4 backdrop-blur-md sm:px-6 lg:ml-64 lg:max-w-[calc(100%-16rem)] lg:px-8">
        <div className="flex flex-1 items-center gap-x-6">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#a3aac4]" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar conteudos..."
              className="w-full rounded-lg border-none bg-black py-2 pl-10 pr-4 text-sm text-[#dee5ff] placeholder:text-[#6d758c] focus:ring-2 focus:ring-[#69daff]/50"
            />
          </div>
        </div>

        <div className="flex items-center gap-x-4 sm:gap-x-6">
          <button
            type="button"
            onClick={openCreator}
            className="hidden rounded-md bg-gradient-to-r from-[#69daff] to-[#00c0ea] px-4 py-2 font-['Manrope'] text-sm font-bold tracking-tight text-[#002a35] transition-all hover:shadow-lg sm:block"
          >
            Novo conteudo
          </button>

          <div className="hidden items-center gap-x-3 text-[#a3aac4] sm:flex">
            <button className="transition-colors hover:text-[#69daff]">
              <Bell className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={isLogged ? onOpenAccount : onSignInWithGoogle}
              className="transition-colors hover:text-[#69daff]"
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>

          {isLogged ? (
            <button
              type="button"
              onClick={onOpenAccount}
              className="h-8 w-8 overflow-hidden rounded-full border border-[#40485d]/30"
              aria-label="Abrir conta"
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Avatar da conta"
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center bg-[#141f38] text-xs font-semibold text-[#dee5ff]">
                  {getAvatarFallback(authUser)}
                </span>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={onSignInWithGoogle}
              disabled={!supabaseConfigured}
              className="inline-flex items-center gap-2 rounded-md border border-[#40485d]/30 bg-[#141f38] px-3 py-2 font-['Manrope'] text-xs font-bold text-[#dee5ff] transition-colors hover:border-[#69daff]/40 hover:text-[#69daff] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <GoogleMark className="h-4 w-4" />
              Entrar com Google
            </button>
          )}
        </div>
      </header>

      <main className="relative z-10 min-h-screen bg-[#060e20] px-4 pb-12 pt-20 sm:px-6 lg:ml-64 lg:px-10">
        <header className="mb-8">
          <div className="flex items-start justify-between gap-6">
            <div>
              <div className="flex items-center gap-3">
                <span className="inline-block h-8 w-1 rounded-full bg-[#69daff]" />
                <h2 className="font-['Manrope'] text-4xl font-extrabold tracking-tighter text-[#dee5ff]">
                  {activeTechnology.name}
                </h2>
              </div>
              <p className="ml-4 mt-3 max-w-2xl text-sm leading-6 text-[#a3aac4]">
                Seus blocos de estudo, criados e organizados por voce.
              </p>
            </div>

            <span className="pt-2 font-['Manrope'] text-sm text-[#a3aac4]">
              {filtered.length} conteudos
            </span>
          </div>
        </header>

        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center rounded-lg border border-[#40485d]/30 bg-black/30 p-1">
            {[
              { id: "lista", icon: LayoutList, label: "Lista" },
              { id: "blocos", icon: LayoutGrid, label: "Blocos" },
            ].map((viewOption) => (
              <button
                key={viewOption.id}
                type="button"
                onClick={() => setView(viewOption.id)}
                className={`flex items-center gap-2 rounded-md px-3 py-1.5 font-['Manrope'] text-xs font-semibold transition-colors ${
                  view === viewOption.id
                    ? "bg-[#192540] text-[#dee5ff]"
                    : "text-[#6d758c] hover:text-[#dee5ff]"
                }`}
              >
                {createElement(viewOption.icon, { className: "h-3.5 w-3.5" })}
                {viewOption.label}
              </button>
            ))}
          </div>

          <span className="font-['Manrope'] text-[10px] font-bold uppercase tracking-[0.24em] text-[#6d758c]">
            {view === "lista" ? "Modo em lista" : "Modo em blocos"}
          </span>
        </div>

        {filtered.length === 0 ? (
          <section className="rounded-xl border border-[#40485d]/10 bg-[#0f1930] px-6 py-16 text-center">
            <p className="font-['Manrope'] text-lg font-bold text-[#dee5ff]">
              {search ? "Nenhum conteudo encontrado" : "Sem conteudos ainda"}
            </p>
            <p className="mt-2 text-sm text-[#a3aac4]">
              {search ? "Tente outro termo na busca." : "Crie o primeiro bloco dessa tecnologia."}
            </p>
          </section>
        ) : (
          <div className={view === "blocos" ? "grid gap-4 md:grid-cols-2 xl:grid-cols-3" : "space-y-3"}>
            {filtered.map((content) => {
              if (view === "blocos") {
                return (
                  <BlockCard
                    key={content.id}
                    content={content}
                    onDelete={confirmDelete}
                    onOpen={openEditor}
                  />
                );
              }

              return (
                <ListCard
                  key={content.id}
                  content={content}
                  onDelete={confirmDelete}
                  onOpen={openEditor}
                />
              );
            })}
          </div>
        )}

        <ConfirmDeleteModal
          isOpen={deleteModal.open}
          error={deleteError}
          isDeleting={isDeletingContent}
          onClose={closeDeleteModal}
          onConfirm={handleDelete}
          title={deleteModal.item?.title}
        />
      </main>
    </div>
  );
}

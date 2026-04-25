import { createElement, useEffect, useMemo, useState } from "react";
import {
  Bell,
  BookMarked,
  FileText,
  GripVertical,
  HelpCircle,
  LayoutDashboard,
  LayoutGrid,
  LayoutList,
  Menu,
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
import CodenLensLogo from "../shared/CodenLensLogo";
import AppSidebar from "../shared/AppSidebar";
import TechnologyArtwork from "./TechnologyArtwork";
import { getAvatarFallback, getAvatarUrl } from "../../utils/authUi";

function ListCard({ content, onDelete, onOpen, flagsList }) {
  const contentFlags = (content.flags || []).map(id => flagsList.find(f => f.id === id)).filter(Boolean);

  return (
    <article
      className="relative group surface-lift rounded-xl border border-[#40485d]/20 bg-[#0f1930] hover:border-[#69daff]/20 hover:bg-[#141f38]"
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
            <h3 className="line-clamp-2 font-sans text-[15px] font-bold leading-5 text-[#dee5ff] mr-8">
              {content.title}
            </h3>

            <div className="absolute top-4 right-14 flex items-center gap-1.5">
              {contentFlags.map(flag => (
                <div
                  key={flag.id}
                  className="flag-neon-pill flex items-center rounded-md px-2.5 py-1"
                  style={{ "--flag": flag.color }}
                >
                  <span className="font-sans text-[10px] font-bold uppercase tracking-widest" style={{ color: flag.color }}>
                    {flag.name}
                  </span>
                </div>
              ))}
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

function BlockCard({ content, onDelete, onOpen, flagsList }) {
  return (
    <article className="group surface-lift overflow-hidden rounded-xl border border-[#40485d]/20 bg-[#0f1930] hover:border-[#69daff]/20 hover:bg-[#141f38]">
      <button
        type="button"
        onClick={() => onOpen(content)}
        className="flex h-full w-full flex-col gap-3 p-4 text-left"
      >
        <div className="relative flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 pr-12 font-sans text-[15px] font-bold leading-5 text-[#dee5ff]">
            {content.title}
          </h3>
          
          {content.flags && content.flags.length > 0 && flagsList && (
            <div className="absolute top-0 right-8 flex gap-1 items-center">
              {content.flags.map(id => {
                const flag = flagsList.find(f => f.id === id);
                return flag ? (
                  <span
                    key={id}
                    title={flag.name}
                    className="flag-neon-dot h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: flag.color, "--flag": flag.color }}
                  />
                ) : null;
              })}
            </div>
          )}

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

function CompactCard({ content, onDelete, onOpen, flagsList }) {
  return (
    <article className="group relative surface-lift rounded-lg border border-[#40485d]/20 bg-[#0f1930] hover:border-[#69daff]/20 hover:bg-[#141f38]">
      <button
        type="button"
        onClick={() => onOpen(content)}
        className="flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left"
      >
        <div className="flex min-w-0 items-center gap-3">
          <GripVertical className="h-4 w-4 shrink-0 text-[#6d758c]" />
          <span className="truncate pr-8 font-sans text-sm font-semibold text-[#dee5ff]">
            {content.title}
          </span>
          {content.flags && content.flags.length > 0 && flagsList && (
            <div className="absolute right-12 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {content.flags.map(id => {
                const flag = flagsList.find(f => f.id === id);
                return flag ? (
                  <span
                    key={id}
                    title={flag.name}
                    className="flag-neon-dot h-2 w-2 rounded-full"
                    style={{ backgroundColor: flag.color, "--flag": flag.color }}
                  />
                ) : null;
              })}
            </div>
          )}
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
        className="modal-enter-backdrop absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => !isDeleting && onClose()}
      />

      <div className="modal-enter-panel relative z-10 w-full max-w-md rounded-xl border border-[#40485d]/30 bg-[#0f1930] p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-sans text-lg font-bold text-[#dee5ff]">
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
  flags,
  onBack,
  onCreateContent,
  onDeleteContent,
  onEditTechnology,
  onOpenAccount,
  onOpenStudyRoom,
  onSignInWithGoogle,
  supabaseConfigured,
}) {
  const [view, setView] = useState("lista");
  const [search, setSearch] = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
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

  useEffect(() => {
    if (!mobileNavOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileNavOpen]);

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

  const openCreator = () => onCreateContent?.();

  const sidebarNavItems = [
    { id: "panel", icon: LayoutDashboard, label: "Painel", onClick: onBack },
    { id: "content", icon: BookMarked, label: "Conteudos", active: true, onClick: () => {} },
    {
      id: "account",
      icon: UserCircle2,
      label: isLogged ? "Conta" : "Entrar",
      onClick: isLogged ? onOpenAccount : onSignInWithGoogle,
    },
    { id: "tracking", icon: Shield, label: "Acompanhamento", onClick: () => {} },
  ];

  const sidebarSupportItems = [
    { id: "docs", icon: FileText, label: "Documentacao", onClick: () => {} },
    { id: "help", icon: HelpCircle, label: "Ajuda", onClick: () => {} },
  ];

  const sidebarFooter = (
    <>
      <p className="font-sans text-[10px] uppercase tracking-widest text-dashboard-muted">
        Tecnologia ativa
      </p>

      <div className="mt-3 rounded-xl border border-dashboard-border/20 bg-dashboard-surface p-4">
        <div className="flex items-center gap-3">
          <TechnologyArtwork
            technology={activeTechnology}
            className="h-12 w-12 shrink-0 rounded-lg border border-dashboard-border/25"
          />

          <div className="min-w-0 flex-1">
            <p className="truncate font-sans text-sm font-bold text-dashboard-text">
              {activeTechnology.name}
            </p>
            <p className="mt-1 text-xs text-dashboard-muted">
              {filtered.length} conteudos
            </p>
          </div>

          <button
            type="button"
            onClick={() => onEditTechnology(activeTechnology)}
            className="dashboard-focusring text-dashboard-muted transition-colors hover:text-dashboard-accent"
            aria-label={`Editar ${activeTechnology.name}`}
          >
            <Pencil className="h-4 w-4" />
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={openCreator}
        className="dashboard-focusring mt-4 w-full rounded-md bg-[#9ed0ff] py-2 font-sans text-xs font-bold text-[#06111f] shadow-sm transition-colors hover:bg-[#b3e0ff]"
      >
        Criar novo conteudo
      </button>
    </>
  );

  return (
    <div className="dashboard-ui-root relative min-h-screen bg-dashboard-bg text-dashboard-text">
      <div className="fixed inset-0 bg-dashboard-bg" />

      <AppSidebar
        titleNode={(
          <div className="mb-2 flex items-center gap-3">
            <CodenLensLogo size={36} />
            <h1 className="font-sans text-xl font-black tracking-tight">
              <span className="text-dashboard-text">Coden</span>
              <span className="text-dashboard-accent-warm">Lens</span>
            </h1>
          </div>
        )}
        subtitle="Biblioteca ativa"
        onTitleClick={onBack}
        navItems={sidebarNavItems}
        supportItems={sidebarSupportItems}
        footerNode={sidebarFooter}
        mobileOpen={mobileNavOpen}
        onMobileOpenChange={setMobileNavOpen}
      />

      <div data-reveal="view-main" className="min-h-screen">
      <header className="fixed top-0 z-50 flex h-16 w-full items-center justify-between bg-dashboard-bg/80 px-4 backdrop-blur-md sm:px-6 lg:ml-64 lg:max-w-[calc(100%-16rem)] lg:px-8">
        <div className="flex flex-1 items-center gap-x-6">
          <button
            type="button"
            className="dashboard-focusring mr-2 flex h-10 w-10 items-center justify-center rounded-md border border-dashboard-border/30 text-dashboard-muted lg:hidden"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Abrir menu de navegação"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-dashboard-muted" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar conteudos..."
              className="w-full rounded-lg border-none bg-black py-2 pl-10 pr-4 text-sm text-dashboard-text placeholder:text-[#6d758c] focus:ring-2 focus:ring-dashboard-accent/50"
            />
          </div>
        </div>

        <div className="flex items-center gap-x-4 sm:gap-x-6">
          <button
            type="button"
            onClick={openCreator}
            className="dashboard-focusring hidden rounded-md bg-[#9ed0ff] px-4 py-2 font-sans text-sm font-bold tracking-tight text-[#06111f] shadow-sm transition-colors hover:bg-[#b3e0ff] sm:block"
          >
            Novo conteudo
          </button>

          <div className="hidden items-center gap-x-3 text-dashboard-muted sm:flex">
            <button className="dashboard-focusring transition-colors hover:text-dashboard-accent">
              <Bell className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={isLogged ? onOpenAccount : onSignInWithGoogle}
              className="dashboard-focusring transition-colors hover:text-dashboard-accent"
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>

          {isLogged ? (
            <button
              type="button"
              onClick={onOpenAccount}
              className="dashboard-focusring h-8 w-8 overflow-hidden rounded-full border border-dashboard-border/30"
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
                <span className="flex h-full w-full items-center justify-center bg-dashboard-elevated text-xs font-semibold text-dashboard-text">
                  {getAvatarFallback(authUser)}
                </span>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={onSignInWithGoogle}
              disabled={!supabaseConfigured}
              className="inline-flex items-center gap-2 rounded-md border border-dashboard-border/30 bg-dashboard-elevated px-3 py-2 font-sans text-xs font-bold text-dashboard-text transition-colors hover:border-dashboard-accent/40 hover:text-dashboard-accent disabled:cursor-not-allowed disabled:opacity-60"
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
                <h2 className="font-sans text-4xl font-extrabold tracking-tighter text-[#dee5ff]">
                  {activeTechnology.name}
                </h2>
              </div>
              <p className="ml-4 mt-3 max-w-2xl text-sm leading-6 text-[#a3aac4]">
                Seus blocos de estudo, criados e organizados por voce.
              </p>
            </div>

            <span className="pt-2 font-sans text-sm text-[#a3aac4]">
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
                className={`flex items-center gap-2 rounded-md px-3 py-1.5 font-sans text-xs font-semibold transition-colors ${
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

          <span className="font-sans text-[10px] font-bold uppercase tracking-[0.24em] text-[#6d758c]">
            {view === "lista" ? "Modo em lista" : "Modo em blocos"}
          </span>
        </div>

        {filtered.length === 0 ? (
          <section className="rounded-xl border border-[#40485d]/10 bg-[#0f1930] px-6 py-16 text-center">
            <p className="font-sans text-lg font-bold text-[#dee5ff]">
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
                    flagsList={flags || []}
                    onDelete={confirmDelete}
                    onOpen={openEditor}
                  />
                );
              }

              return (
                <ListCard
                  key={content.id}
                  content={content}
                  flagsList={flags || []}
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
    </div>
  );
}

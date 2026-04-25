import { createElement, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlignJustify,
  Bell,
  BookMarked,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  HelpCircle,
  LayoutDashboard,
  LayoutGrid,
  Layers,
  List,
  Menu,
  Pencil,
  Search,
  Shield,
  Tag,
  UserCircle2,
  X,
} from "lucide-react";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import GoogleMark from "../shared/GoogleMark";
import CodenLensLogo from "../shared/CodenLensLogo";
import { getAvatarFallback, getAvatarUrl } from "../../utils/authUi";
import TechnologyArtwork from "./TechnologyArtwork";
import FlagManagerModal from "./FlagManagerModal";

const INFO_COPY = {
  docs: {
    title: "Documentação",
    body:
      "O CodenLens organiza bibliotecas de estudo por tecnologia. Seus dados podem ficar só neste navegador ou sincronizar com a nuvem quando você entra com Google.",
  },
  help: {
    title: "Ajuda",
    body:
      "Use o painel de conta para ver o status de sincronização. Nos estudos, o DevBrief ajuda a analisar trechos de código em contexto.",
  },
  tracking: {
    title: "Acompanhamento",
    body:
      "Relatórios e acompanhamento de progresso mais detalhados estarão disponíveis em uma próxima versão.",
  },
  notifications: {
    title: "Notificações",
    body:
      "Alertas e lembretes de estudo ainda não estão ativados. Esta função será adicionada em uma atualização futura.",
  },
};

function getBadgeClasses(tone) {
  const map = {
    sky: "text-dashboard-accent",
    cyan: "text-[#48e5d0]",
    teal: "text-[#7bd1fa]",
    red: "text-[#ff716c]",
    slate: "text-dashboard-muted",
  };

  return map[tone] || map.sky;
}

function getTechnologyGroups(technologies, searchTerm, categoryList = []) {
  const query = String(searchTerm || "").trim().toLowerCase();

  const filtered = !query
    ? technologies
    : technologies.filter((technology) => {
        const haystack = [
          technology.name,
          technology.category,
          technology.categoryAccent,
          technology.cardLabel,
          ...(technology.contents || []).flatMap((content) => [
            content.title,
            content.summary,
            ...(content.tags || []),
          ]),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return haystack.includes(query);
      });

  const groupedMap = new Map();

  filtered.forEach((technology) => {
    const category = technology.category || "Minhas tecnologias";

    if (!groupedMap.has(category)) {
      groupedMap.set(category, {
        category,
        items: [],
      });
    }

    groupedMap.get(category).items.push(technology);
  });

  const fallbackOrder = ["Minhas tecnologias", "Fundamentos", "Frameworks", "Infraestrutura"];
  const finalOrder = categoryList?.length ? categoryList.map((c) => c.name) : fallbackOrder;

  return Array.from(groupedMap.values()).sort((left, right) => {
    const leftIndex = finalOrder.indexOf(left.category);
    const rightIndex = finalOrder.indexOf(right.category);

    if (leftIndex === -1 && rightIndex === -1) return left.category.localeCompare(right.category);
    if (leftIndex === -1) return 1;
    if (rightIndex === -1) return -1;
    return leftIndex - rightIndex;
  });
}

function SidebarItem({ active = false, icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`dashboard-focusring group relative flex w-full items-center overflow-hidden rounded-r-lg px-8 py-3 text-left transition-all duration-200 ease-out active:scale-[0.99] ${
        active
          ? "bg-gradient-to-r from-dashboard-accent/10 to-transparent text-dashboard-accent"
          : "text-dashboard-muted before:absolute before:left-0 before:top-1/2 before:h-0 before:w-[3px] before:-translate-y-1/2 before:rounded-full before:bg-dashboard-accent before:opacity-0 before:transition-all before:duration-300 before:ease-out hover:before:h-8 hover:before:opacity-90 hover:bg-gradient-to-r hover:from-dashboard-accent/10 hover:to-transparent hover:text-dashboard-text"
      }`}
    >
      <span
        className={`mr-3 inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center transition-transform duration-200 ease-out ${
          active ? "scale-100 group-hover:scale-105" : "group-hover:scale-110 group-hover:-translate-y-px"
        }`}
      >
        {createElement(icon, { className: "h-[18px] w-[18px]" })}
      </span>
      <span className="text-[10px] font-bold uppercase tracking-[0.24em]">{label}</span>
    </button>
  );
}

function SupportLink({ icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="dashboard-focusring group flex w-full items-center rounded-md py-2 text-dashboard-muted transition-all duration-200 ease-out hover:translate-x-1 hover:bg-white/[0.04] hover:text-dashboard-text active:scale-[0.99]"
    >
      <span className="mr-2 inline-flex h-4 w-4 shrink-0 items-center justify-center transition-transform duration-200 ease-out group-hover:scale-110 group-hover:text-dashboard-accent/90">
        {createElement(icon, { className: "h-4 w-4" })}
      </span>
      <span className="text-[10px] uppercase tracking-[0.24em]">{label}</span>
    </button>
  );
}

function DashboardNavContent({
  isLogged,
  onCreateTechnology,
  onManageCategories,
  onOpenAccount,
  onSignInWithGoogle,
  onOpenFlagManager,
  onInfo,
  afterNavigate,
  openFirstLibrary,
}) {
  const handlePainel = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    afterNavigate();
  };

  return (
    <>
      <div className="mb-4 px-8">
        <div className="mb-2 flex items-center gap-3">
          <CodenLensLogo size={38} />
          <h1 className="text-xl font-black tracking-tight">
            <span className="text-dashboard-text">Coden</span>
            <span className="text-dashboard-accent-warm">Lens</span>
          </h1>
        </div>
        <p className="mt-1 text-[10px] uppercase tracking-widest text-dashboard-muted">Bibliotecas de estudo vivas</p>
      </div>

      <nav className="flex-1 space-y-1" aria-label="Navegação principal">
        <SidebarItem active icon={LayoutDashboard} label="Painel" onClick={handlePainel} />
        <SidebarItem icon={BookMarked} label="Bibliotecas" onClick={openFirstLibrary} />
        <SidebarItem
          icon={Layers}
          label="Categorias"
          onClick={() => {
            onManageCategories();
            afterNavigate();
          }}
        />
        <SidebarItem
          icon={Tag}
          label="Filtrar por Flags"
          onClick={() => {
            onOpenFlagManager();
            afterNavigate();
          }}
        />
        <SidebarItem
          icon={UserCircle2}
          label={isLogged ? "Conta" : "Entrar"}
          onClick={() => {
            if (isLogged) onOpenAccount();
            else onSignInWithGoogle();
            afterNavigate();
          }}
        />
        <SidebarItem
          icon={Shield}
          label="Acompanhamento"
          onClick={() => {
            onInfo("tracking");
            afterNavigate();
          }}
        />
      </nav>

      <div className="mt-auto flex flex-col gap-y-4 px-8">
        <button
          type="button"
          onClick={() => {
            onCreateTechnology();
            afterNavigate();
          }}
          className="dashboard-focusring rounded-md bg-[#9ed0ff] py-2 text-xs font-bold text-[#06111f] shadow-sm transition-colors hover:bg-[#b3e0ff]"
        >
          Adicionar tecnologia
        </button>

        <div className="space-y-1 border-t border-dashboard-border/10 pt-4">
          <SupportLink icon={FileText} label="Documentacao" onClick={() => onInfo("docs")} />
          <SupportLink icon={HelpCircle} label="Ajuda" onClick={() => onInfo("help")} />
        </div>
      </div>
    </>
  );
}

function InfoDialog({ kind, onClose }) {
  const copy = INFO_COPY[kind];
  if (!copy) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dashboard-info-title"
    >
      <div className="modal-enter-backdrop absolute inset-0 bg-black/60" aria-hidden />
      <div className="modal-enter-panel relative z-10 max-w-md rounded-xl border border-dashboard-border/30 bg-dashboard-surface p-6 shadow-xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 id="dashboard-info-title" className="text-lg font-bold text-dashboard-text">
            {copy.title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="dashboard-focusring rounded-md p-1 text-dashboard-muted hover:text-dashboard-text"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="text-sm leading-relaxed text-dashboard-muted">{copy.body}</p>
        <button
          type="button"
          onClick={onClose}
          className="dashboard-focusring mt-6 w-full rounded-md bg-gradient-to-r from-dashboard-accent to-dashboard-accent-mid py-2 text-sm font-bold text-dashboard-accent-cta"
        >
          Entendi
        </button>
      </div>
    </div>
  );
}

function TechnologyCard({ onEdit, onOpen, technology }) {
  const contentCount = technology.contents?.length || 0;
  const badgeToneClass = getBadgeClasses(technology.cardTone);

  return (
    <article className="group min-w-[320px] overflow-hidden rounded-xl border-0 bg-dashboard-surface shadow-[0_2px_6px_rgba(0,0,0,0.04),0_12px_36px_-8px_rgba(0,0,0,0.14)] transition-[transform,box-shadow,background-color] duration-300 ease-out hover:-translate-y-0.5 hover:bg-dashboard-elevated hover:shadow-[0_4px_14px_rgba(0,0,0,0.06),0_18px_44px_-6px_rgba(0,0,0,0.16)]">
      <div className="relative h-44 overflow-hidden rounded-t-xl">
        <button
          type="button"
          onClick={() => onEdit(technology)}
          className="dashboard-focusring absolute left-4 top-4 z-20 inline-flex h-8 w-8 items-center justify-center rounded-md border-0 bg-black/45 text-dashboard-text shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-sm transition-colors hover:bg-black/55 hover:text-dashboard-accent"
          aria-label={`Editar ${technology.name}`}
        >
          <Pencil className="h-4 w-4" />
        </button>

        <button type="button" onClick={() => onOpen(technology)} className="block h-full w-full text-left">
          <TechnologyArtwork technology={technology} className="h-full w-full rounded-none border-0" />
          <div className="pointer-events-none absolute inset-0 z-[1]" aria-hidden>
            <div className="technology-card-image-fade-base absolute inset-0 transition-opacity duration-300 ease-out group-hover:opacity-0" />
            <div className="technology-card-image-fade-hover absolute inset-0 opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100" />
          </div>
          <span
            className={`absolute right-4 top-4 rounded bg-dashboard-chip/80 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] backdrop-blur-md ${badgeToneClass}`}
          >
            {technology.cardLabel || "Biblioteca"}
          </span>
        </button>
      </div>

      <button
        type="button"
        onClick={() => onOpen(technology)}
        className="dashboard-focusring block w-full p-6 text-left"
      >
        <h4 className="text-lg font-bold text-dashboard-text">{technology.name}</h4>
        <p className="mb-4 mt-1 text-xs text-dashboard-muted">
          {contentCount} conteudos • {technology.categoryAccent || "Biblioteca personalizada"}
        </p>
      </button>
    </article>
  );
}

function TechnologyListItem({ technology, onOpen }) {
  const contentCount = technology.contents?.length || 0;
  const meta = `${contentCount} conteudos`;

  return (
    <li>
      <button
        type="button"
        onClick={() => onOpen(technology)}
        className="group/dashboard-list-item dashboard-focusring flex w-full min-w-0 items-baseline justify-start rounded-sm py-2 pl-1 pr-1 text-left transition-colors hover:bg-white/5"
        aria-label={`Abrir biblioteca ${technology.name} - ${meta}`}
      >
        <span className="min-w-0 max-w-[calc(100%-12rem)] truncate text-sm text-dashboard-text transition-colors group-hover/dashboard-list-item:text-dashboard-accent">
          {technology.name}
        </span>
        <span
          className="shrink-0 px-[10px] text-sm text-dashboard-muted transition-colors group-hover/dashboard-list-item:text-dashboard-accent/55"
          aria-hidden
        >
          -
        </span>
        <span className="shrink-0 text-[10px] text-dashboard-muted transition-colors group-hover/dashboard-list-item:text-dashboard-accent/55 sm:text-xs">
          {meta}
        </span>
      </button>
    </li>
  );
}

function TechnologyDetailItem({ technology, maxContentCount, onEdit, onOpen }) {
  const contentCount = technology.contents?.length || 0;
  const trackWidth = maxContentCount ? Math.max(8, Math.round((contentCount / maxContentCount) * 100)) : 8;

  return (
    <div className="group surface-lift flex w-full items-center gap-4 rounded-lg border border-dashboard-border/10 bg-dashboard-surface p-4 hover:border-dashboard-accent/20 hover:bg-dashboard-elevated">
      <button
        type="button"
        onClick={() => onOpen(technology)}
        className="dashboard-focusring flex min-w-0 flex-1 items-center gap-4 text-left"
      >
        <TechnologyArtwork technology={technology} className="h-10 w-10 flex-shrink-0 rounded-md border-0 bg-black sm:h-12 sm:w-12" />
        <div className="flex min-w-0 flex-1 flex-col truncate">
          <h4 className="truncate text-sm font-bold text-dashboard-text sm:text-base">{technology.name}</h4>
          <span className="truncate text-[10px] text-dashboard-muted sm:text-xs">
            {contentCount} conteudos • {technology.categoryAccent || "Personalizado"}
          </span>
        </div>
      </button>

      <div className="mr-4 hidden w-32 shrink-0 flex-col gap-1.5 md:flex xl:w-64">
        <div className="flex justify-between text-[9px] font-bold uppercase tracking-[0.15em] text-dashboard-muted">
          <span>Volume de conteúdos</span>
          <span>{contentCount}</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-dashboard-chip">
          <div
            className={`h-full rounded-full ${technology.cardBarClass || "bg-dashboard-accent"}`}
            style={{ width: `${trackWidth}%` }}
          />
        </div>
      </div>

      <button
        type="button"
        onClick={() => onEdit(technology)}
        className="dashboard-focusring ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-dashboard-border/30 bg-dashboard-elevated text-dashboard-muted transition-colors hover:border-dashboard-accent/40 hover:text-dashboard-accent"
        aria-label={`Editar ${technology.name}`}
      >
        <Pencil className="h-4 w-4" />
      </button>
    </div>
  );
}

function SectionRail({
  group,
  maxContentCount,
  onEditTechnology,
  onCreateContentForTechnology,
  onOpenTechnology,
  displayMode = "cards",
}) {
  const trackRef = useRef(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const scrollTrackForward = useCallback(() => {
    trackRef.current?.scrollBy({ left: 348, behavior: "smooth" });
  }, []);
  const primaryTechnology = group.items?.[0] || null;

  return (
    <section className="group/section relative mb-14 last:mb-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="group/collapse -ml-1 flex items-center gap-2 rounded-lg p-1 outline-none transition-colors hover:bg-white/5"
            aria-expanded={!isCollapsed}
          >
            <h3 className="text-xl font-bold text-dashboard-text transition-colors group-hover/collapse:text-dashboard-accent">
              {group.category}
            </h3>
            <div
              className={`flex h-5 w-5 items-center justify-center rounded-full border border-white/10 text-slate-400 transition-transform duration-300 group-hover/collapse:border-dashboard-accent/30 group-hover/collapse:text-dashboard-accent ${
                isCollapsed ? "-rotate-90" : "rotate-0"
              }`}
            >
              <ChevronDown className="h-3 w-3" />
            </div>
          </button>
        </div>
        {displayMode === "cards" ? (
          <button
            type="button"
            onClick={() => {
              if (primaryTechnology) onCreateContentForTechnology(primaryTechnology);
            }}
            disabled={!primaryTechnology}
            className="dashboard-focusring text-xs font-bold uppercase tracking-[0.18em] text-dashboard-muted transition-colors hover:text-dashboard-accent"
          >
            Adicionar conteudo
          </button>
        ) : (
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-dashboard-border/50" aria-hidden>
            &nbsp;
          </span>
        )}
      </div>

      {!isCollapsed && (
        <div className="relative">
          {displayMode === "cards" && (
            <div className="relative">
              <button
                type="button"
                onClick={() => trackRef.current?.scrollBy({ left: -348, behavior: "smooth" })}
                className="dashboard-nav-arrow dashboard-focusring absolute left-0 top-1/2 z-20 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-dashboard-border/30 text-dashboard-muted opacity-0 shadow-xl group-hover/section:opacity-100"
                aria-label={`Voltar em ${group.category}`}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={scrollTrackForward}
                className="dashboard-nav-arrow dashboard-focusring absolute right-0 top-1/2 z-20 flex h-10 w-10 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-dashboard-border/30 text-dashboard-muted opacity-0 shadow-xl group-hover/section:opacity-100"
                aria-label={`Avançar em ${group.category}`}
              >
                <ChevronRight className="h-5 w-5" />
              </button>

              <div
                ref={(node) => {
                  trackRef.current = node;
                }}
                className="dashboard-track flex gap-x-6 overflow-x-auto pb-4 pl-2 pr-2"
              >
                {group.items.map((technology) => (
                  <TechnologyCard
                    key={technology.id}
                    onEdit={onEditTechnology}
                    onOpen={onOpenTechnology}
                    technology={technology}
                  />
                ))}
              </div>
            </div>
          )}

          {displayMode === "list" && (
            <ul className="list-none pb-4 pl-2 pr-2">
              {group.items.map((technology) => (
                <TechnologyListItem key={technology.id} onOpen={onOpenTechnology} technology={technology} />
              ))}
            </ul>
          )}

          {displayMode === "details" && (
            <div className="flex flex-col gap-3 pb-4 pl-2 pr-2">
              {group.items.map((technology) => (
                <TechnologyDetailItem
                  key={technology.id}
                  maxContentCount={maxContentCount}
                  onEdit={onEditTechnology}
                  onOpen={onOpenTechnology}
                  technology={technology}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function SortableSectionRail({ id, group, ...props }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="group/sortable-rail relative">
      <div
        {...attributes}
        {...listeners}
        className="absolute -left-10 top-2 z-[30] hidden h-8 w-8 cursor-grab items-center justify-center rounded text-dashboard-border opacity-0 transition-opacity hover:bg-dashboard-elevated hover:text-dashboard-accent active:cursor-grabbing group-hover/sortable-rail:opacity-100 xl:flex"
        title="Arraste para reordenar esta categoria"
      >
        <LayoutDashboard className="h-4 w-4" />
      </div>
      <SectionRail key={`${id}-${props.displayMode}`} group={group} displayMode={props.displayMode} {...props} />
    </div>
  );
}

export default function DashboardHome({
  authUser,
  onCreateTechnology,
  onEditTechnology,
  onManageCategories,
  onOpenAccount,
  onSelectTechnology,
  onSignInWithGoogle,
  onCreateContentForTechnology,
  setActiveTechnology,
  supabaseConfigured,
  technologies,
  categories,
  flags,
  onSyncStructure,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [displayMode, setDisplayMode] = useState("cards");
  const [isFlagManagerOpen, setIsFlagManagerOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [infoDialog, setInfoDialog] = useState(null);

  const groupedTechnologies = useMemo(
    () => getTechnologyGroups(technologies, searchTerm, categories),
    [technologies, searchTerm, categories],
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = categories.findIndex((item) => `rail-${item.name}` === active.id);
      const newIndex = categories.findIndex((item) => `rail-${item.name}` === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        onSyncStructure(null, arrayMove(categories, oldIndex, newIndex));
      }
    }
  };

  const maxContentCount = useMemo(
    () => Math.max(...technologies.map((technology) => technology.contents?.length || 0), 1),
    [technologies],
  );

  const avatarUrl = getAvatarUrl(authUser);
  const isLogged = Boolean(authUser);
  const searchTrimmed = searchTerm.trim();
  const hasActiveSearch = Boolean(searchTrimmed);
  const hasTechnologies = technologies.length > 0;
  const showSearchEmpty = hasTechnologies && !groupedTechnologies.length && hasActiveSearch;
  const showNoTechnologies = !hasTechnologies;

  const openTechnology = (technology) => {
    setActiveTechnology(technology);
    onSelectTechnology(technology);
  };

  const afterMobileNav = useCallback(() => setMobileNavOpen(false), []);

  useEffect(() => {
    if (!mobileNavOpen) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") setMobileNavOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileNavOpen]);

  useEffect(() => {
    if (!mobileNavOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileNavOpen]);

  const openFirstLibrary = () => {
    if (technologies[0]) openTechnology(technologies[0]);
    afterMobileNav();
  };

  const navProps = {
    isLogged,
    onCreateTechnology,
    onManageCategories,
    onOpenAccount,
    onSignInWithGoogle,
    onOpenFlagManager: () => setIsFlagManagerOpen(true),
    onInfo: setInfoDialog,
    afterNavigate: afterMobileNav,
    openFirstLibrary,
  };

  return (
    <div className="dashboard-ui-root relative min-h-screen bg-dashboard-bg text-dashboard-text">
      <div className="fixed inset-0 bg-dashboard-bg" />

      <aside
        data-reveal="nav"
        className="fixed left-0 top-0 z-[60] hidden h-full w-64 flex-col gap-y-6 bg-dashboard-sidebar py-8 lg:flex"
        aria-label="Menu lateral"
      >
        <DashboardNavContent {...navProps} />
      </aside>

      {mobileNavOpen ? (
        <div className="fixed inset-0 z-[70] lg:hidden" role="presentation">
          <button
            type="button"
            className="absolute inset-0 bg-black/55"
            aria-label="Fechar menu"
            onClick={() => setMobileNavOpen(false)}
          />
          <div
            id="mobile-dashboard-drawer"
            className="absolute left-0 top-0 flex h-full w-[min(20rem,92vw)] flex-col gap-y-6 overflow-y-auto bg-dashboard-sidebar py-8 shadow-2xl"
          >
            <div className="flex justify-end px-6">
              <button
                type="button"
                onClick={() => setMobileNavOpen(false)}
                className="dashboard-focusring rounded-md p-2 text-dashboard-muted hover:text-dashboard-text"
                aria-label="Fechar navegação"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <DashboardNavContent {...navProps} />
          </div>
        </div>
      ) : null}

      <header className="fixed top-0 z-50 flex h-16 w-full items-center justify-between bg-dashboard-bg/80 px-4 backdrop-blur-md sm:px-6 lg:ml-64 lg:max-w-[calc(100%-16rem)] lg:px-8">
        <div className="flex flex-1 items-center gap-3 sm:gap-x-6">
          <button
            type="button"
            className="dashboard-focusring flex h-10 w-10 items-center justify-center rounded-md border border-dashboard-border/30 text-dashboard-muted lg:hidden"
            onClick={() => setMobileNavOpen(true)}
            aria-expanded={mobileNavOpen}
            aria-controls="mobile-dashboard-drawer"
            aria-label="Abrir menu de navegação"
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="relative w-full max-w-md">
            <label htmlFor="dashboard-tech-search" className="sr-only">
              Buscar tecnologias no painel
            </label>
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-dashboard-muted"
              aria-hidden
            />
            <input
              id="dashboard-tech-search"
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar tecnologias..."
              autoComplete="off"
              className="w-full rounded-lg border-none bg-black py-2 pl-10 pr-4 text-sm text-dashboard-text placeholder:text-[#6d758c] focus:ring-2 focus:ring-dashboard-accent/50"
            />
          </div>
        </div>

        <div className="flex items-center gap-x-4 sm:gap-x-6">
          <button
            type="button"
            onClick={onCreateTechnology}
            className="dashboard-focusring hidden rounded-md bg-[#9ed0ff] px-4 py-2 text-sm font-bold tracking-tight text-[#06111f] shadow-sm transition-colors hover:bg-[#b3e0ff] sm:block"
          >
            Adicionar tecnologia
          </button>

          <div className="hidden items-center gap-x-3 text-dashboard-muted sm:flex">
            <button
              type="button"
              onClick={() => setInfoDialog("notifications")}
              className="dashboard-focusring transition-colors hover:text-dashboard-accent"
              aria-label="Notificações"
            >
              <Bell className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => {
                if (isLogged) onOpenAccount();
                else onSignInWithGoogle();
              }}
              className="dashboard-focusring transition-colors hover:text-dashboard-accent"
              aria-label={isLogged ? "Abrir conta" : "Entrar com Google"}
            >
              <UserCircle2 className="h-5 w-5" />
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
              className="inline-flex items-center gap-2 rounded-md border border-dashboard-border/30 bg-dashboard-elevated px-3 py-2 text-xs font-bold text-dashboard-text transition-colors hover:border-dashboard-accent/40 hover:text-dashboard-accent disabled:cursor-not-allowed disabled:opacity-60"
            >
              <GoogleMark className="h-4 w-4" />
              Entrar com Google
            </button>
          )}
        </div>
      </header>

      <main className="relative z-10 min-h-screen bg-dashboard-bg px-4 pb-12 pt-20 sm:px-6 lg:ml-64 lg:px-10">
        <header
          data-reveal="hero"
          className="mb-12 flex flex-col items-start justify-between gap-y-4 sm:flex-row sm:items-end"
        >
          <div>
            <h2 className="text-4xl font-extrabold tracking-tighter text-dashboard-text">Radar de tecnologias</h2>
            <p className="mt-2 text-sm text-dashboard-muted">
              Organize suas bibliotecas de estudo e acompanhe a evolucao do que voce esta dominando.
            </p>
          </div>

          <div
            role="toolbar"
            aria-label="Modo de exibição das tecnologias"
            className="flex shrink-0 items-center gap-1 rounded-lg border border-dashboard-border/30 bg-dashboard-surface p-1"
          >
            <button
              type="button"
              onClick={() => setDisplayMode("cards")}
              className={`dashboard-focusring flex h-8 w-10 items-center justify-center rounded-md transition-all ${
                displayMode === "cards"
                  ? "bg-[#1d2b4b] text-dashboard-accent shadow-sm"
                  : "text-[#6d758c] hover:bg-white/5 hover:text-dashboard-muted"
              }`}
              title="Visão com cartões grandes"
              aria-pressed={displayMode === "cards"}
              aria-label="Visão em cartões grandes"
            >
              <LayoutGrid className="h-4 w-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => setDisplayMode("list")}
              className={`dashboard-focusring flex h-8 w-10 items-center justify-center rounded-md transition-all ${
                displayMode === "list"
                  ? "bg-[#1d2b4b] text-dashboard-accent shadow-sm"
                  : "text-[#6d758c] hover:bg-white/5 hover:text-dashboard-muted"
              }`}
              title="Lista minimalista"
              aria-pressed={displayMode === "list"}
              aria-label="Lista minimalista"
            >
              <List className="h-4 w-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => setDisplayMode("details")}
              className={`dashboard-focusring flex h-8 w-10 items-center justify-center rounded-md transition-all ${
                displayMode === "details"
                  ? "bg-[#1d2b4b] text-dashboard-accent shadow-sm"
                  : "text-[#6d758c] hover:bg-white/5 hover:text-dashboard-muted"
              }`}
              title="Detalhes e edição rápida"
              aria-pressed={displayMode === "details"}
              aria-label="Detalhes e edição rápida"
            >
              <AlignJustify className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </header>

        {groupedTechnologies.length ? (
          <div data-reveal="panel">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext
                items={groupedTechnologies.map((g) => `rail-${g.category}`)}
                strategy={verticalListSortingStrategy}
              >
                {groupedTechnologies.map((group) => (
                  <SortableSectionRail
                    id={`rail-${group.category}`}
                    key={`rail-${group.category}`}
                    group={group}
                    displayMode={displayMode}
                    maxContentCount={maxContentCount}
                    onCreateContentForTechnology={onCreateContentForTechnology}
                    onEditTechnology={onEditTechnology}
                    onOpenTechnology={openTechnology}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </div>
        ) : (
          <section
            data-reveal="panel"
            className="rounded-xl border border-dashboard-border/10 bg-dashboard-surface px-6 py-16 text-center"
          >
            {showNoTechnologies ? (
              <>
                <p className="text-lg font-bold text-dashboard-text">Nenhuma tecnologia ainda</p>
                <p className="mt-2 text-sm text-dashboard-muted">Comece criando sua primeira biblioteca de estudo.</p>
                <button
                  type="button"
                  onClick={onCreateTechnology}
                  className="dashboard-focusring mt-6 inline-flex rounded-md bg-[#9ed0ff] px-6 py-2 text-sm font-bold text-[#06111f] shadow-sm transition-colors hover:bg-[#b3e0ff]"
                >
                  Adicionar tecnologia
                </button>
              </>
            ) : showSearchEmpty ? (
              <>
                <p className="text-lg font-bold text-dashboard-text">Nenhuma tecnologia encontrada</p>
                <p className="mt-2 text-sm text-dashboard-muted">Tente outro termo na busca.</p>
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="dashboard-focusring mt-6 text-sm font-bold text-dashboard-accent underline-offset-4 hover:underline"
                >
                  Limpar busca
                </button>
              </>
            ) : (
              <>
                <p className="text-lg font-bold text-dashboard-text">Nenhuma tecnologia encontrada</p>
                <p className="mt-2 text-sm text-dashboard-muted">Tente outro termo na busca.</p>
              </>
            )}
          </section>
        )}
      </main>

      {infoDialog ? <InfoDialog kind={infoDialog} onClose={() => setInfoDialog(null)} /> : null}

      <FlagManagerModal
        isOpen={isFlagManagerOpen}
        onClose={() => setIsFlagManagerOpen(false)}
        flags={flags || []}
        technologies={technologies}
        onSyncStructure={onSyncStructure}
      />
    </div>
  );
}

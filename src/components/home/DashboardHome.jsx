import { createElement, useMemo, useRef, useState } from "react";
import {
  Bell,
  BookMarked,
  ChevronLeft,
  ChevronRight,
  FileText,
  HelpCircle,
  LayoutDashboard,
  ChevronDown,
  LayoutGrid,
  List,
  AlignJustify,
  Pencil,
  Plus,
  Search,
  Settings,
  Shield,
  UserCircle2,
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
  useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import GoogleMark from "../shared/GoogleMark";
import { getAvatarFallback, getAvatarUrl } from "../../utils/authUi";
import TechnologyArtwork from "./TechnologyArtwork";


function getSectionAccent(category, fallback) {
  const map = {
    Fundamentos: "Habilidades essenciais",
    Frameworks: "UI e logica",
    Infraestrutura: "Sistemas e fluxo",
    "Minhas tecnologias": "Bibliotecas personalizadas",
  };

  return map[category] || fallback || "Bibliotecas organizadas";
}

function getBadgeClasses(tone) {
  const map = {
    sky: "text-[#69daff]",
    cyan: "text-[#48e5d0]",
    teal: "text-[#7bd1fa]",
    red: "text-[#ff716c]",
    slate: "text-[#a3aac4]",
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
        accent: getSectionAccent(category, technology.categoryAccent),
        items: [],
      });
    }

    groupedMap.get(category).items.push(technology);
  });

  const fallbackOrder = ["Minhas tecnologias", "Fundamentos", "Frameworks", "Infraestrutura"];
  const finalOrder = categoryList?.length ? categoryList.map(c => c.name) : fallbackOrder;

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

function TechnologyCard({
  maxContentCount,
  onEdit,
  onOpen,
  technology,
}) {
  const contentCount = technology.contents?.length || 0;
  const trackWidth = maxContentCount
    ? Math.max(18, Math.round((contentCount / maxContentCount) * 100))
    : 18;
  const badgeToneClass = getBadgeClasses(technology.cardTone);

  return (
    <article className="group min-w-[320px] overflow-hidden rounded-xl border border-[#40485d]/10 bg-[#0f1930] transition-all duration-300 hover:bg-[#141f38]">
      <div className="relative h-44 overflow-hidden">
        <button
          type="button"
          onClick={() => onEdit(technology)}
          className="absolute left-4 top-4 z-20 inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#40485d]/40 bg-[#141f38]/85 text-[#dee5ff] transition-colors hover:border-[#69daff]/40 hover:text-[#69daff]"
          aria-label={`Editar ${technology.name}`}
        >
          <Pencil className="h-4 w-4" />
        </button>

        <button type="button" onClick={() => onOpen(technology)} className="block h-full w-full text-left">
          <TechnologyArtwork
            technology={technology}
            className="h-full w-full rounded-none border-0"
          />
          <div className="technology-card-image-fade absolute inset-0" />
          <span className={`absolute right-4 top-4 rounded bg-[#192540]/80 px-2 py-1 font-['Manrope'] text-[10px] font-bold uppercase tracking-[0.12em] backdrop-blur-md ${badgeToneClass}`}>
            {technology.cardLabel || "Biblioteca"}
          </span>
        </button>
      </div>

      <button type="button" onClick={() => onOpen(technology)} className="block w-full p-6 text-left">
        <h4 className="font-['Manrope'] text-lg font-bold text-[#dee5ff]">
          {technology.name}
        </h4>
        <p className="mb-4 mt-1 text-xs text-[#a3aac4]">
          {contentCount} conteudos • {technology.categoryAccent || "Biblioteca personalizada"}
        </p>

        <div className="space-y-2">
          <div className="flex justify-between font-['Manrope'] text-[10px] font-bold uppercase tracking-[0.18em] text-[#a3aac4]">
            <span>Biblioteca</span>
            <span>{contentCount}</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#192540]">
            <div
              className={`h-full rounded-full ${technology.cardBarClass || "bg-[#69daff]"}`}
              style={{ width: `${trackWidth}%` }}
            />
          </div>
        </div>
      </button>
    </article>
  );
}

function TechnologyListItem({ technology, onOpen }) {
  return (
    <button onClick={() => onOpen(technology)} className="flex w-full items-center gap-3 xl:w-64 rounded-lg border border-[#40485d]/20 bg-[#0f1930] px-4 py-3 transition-colors hover:bg-[#141f38] hover:border-[#69daff]/30 text-left">
      <TechnologyArtwork technology={technology} className="h-8 w-8 rounded bg-black flex-shrink-0 border-0" />
      <span className="font-['Manrope'] text-sm font-bold text-[#dee5ff] truncate">{technology.name}</span>
    </button>
  );
}

function TechnologyDetailItem({ technology, maxContentCount, onEdit, onOpen }) {
  const contentCount = technology.contents?.length || 0;
  const trackWidth = maxContentCount ? Math.max(8, Math.round((contentCount / maxContentCount) * 100)) : 8;

  return (
    <div className="flex w-full items-center gap-4 rounded-lg border border-[#40485d]/10 bg-[#0f1930] p-4 transition-colors hover:bg-[#141f38] group">
      <button type="button" onClick={() => onOpen(technology)} className="flex flex-1 items-center gap-4 text-left min-w-0">
        <TechnologyArtwork technology={technology} className="h-10 w-10 sm:h-12 sm:w-12 rounded-md bg-black flex-shrink-0 border-0" />
        <div className="flex flex-1 flex-col truncate">
          <h4 className="font-['Manrope'] text-sm sm:text-base font-bold text-[#dee5ff] truncate">{technology.name}</h4>
          <span className="text-[10px] sm:text-xs text-[#a3aac4] truncate">{contentCount} conteudos • {technology.categoryAccent || "Personalizado"}</span>
        </div>
      </button>

      <div className="hidden w-32 xl:w-64 shrink-0 flex-col gap-1.5 md:flex mr-4">
         <div className="flex justify-between font-['Manrope'] text-[9px] font-bold uppercase tracking-[0.15em] text-[#a3aac4]">
            <span>Progresso</span>
            <span>{contentCount}</span>
         </div>
         <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#192540]">
           <div className={`h-full rounded-full ${technology.cardBarClass || "bg-[#69daff]"}`} style={{ width: `${trackWidth}%` }} />
         </div>
      </div>

      <button type="button" onClick={() => onEdit(technology)} className="ml-auto flex shrink-0 h-8 w-8 items-center justify-center rounded-md border border-[#40485d]/30 bg-[#141f38] text-[#a3aac4] transition-colors hover:border-[#69daff]/40 hover:text-[#69daff]" aria-label="Editar">
        <Pencil className="h-4 w-4" />
      </button>
    </div>
  );
}

function SectionRail({
  group,
  maxContentCount,
  onEditTechnology,
  onOpenTechnology,
  displayMode = "cards",
}) {
  const trackRef = useRef(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <section className="group/section relative mb-14 last:mb-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <button 
            type="button" 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="group/collapse flex items-center gap-2 outline-none p-1 -ml-1 rounded-lg transition-colors hover:bg-white/5"
          >
            <h3 className="font-['Manrope'] text-xl font-bold text-[#dee5ff] transition-colors group-hover/collapse:text-[#69daff]">
              {group.category}
            </h3>
            <div className={`flex h-5 w-5 items-center justify-center rounded-full border border-white/10 transition-transform duration-300 ${isCollapsed ? "-rotate-90" : "rotate-0"} text-slate-400 group-hover/collapse:border-[#69daff]/30 group-hover/collapse:text-[#69daff]`}>
              <ChevronDown className="h-3 w-3" />
            </div>
          </button>
          <span className="mb-1 hidden font-['Manrope'] text-[10px] uppercase tracking-[0.2em] text-[#00c0ea] sm:inline-block">
            {group.accent}
          </span>
        </div>
        <button className="font-['Manrope'] text-xs font-bold uppercase tracking-[0.18em] text-[#a3aac4] transition-colors hover:text-[#69daff]">
          Ver mais
        </button>
      </div>



        {displayMode === "cards" && (
          <div className="relative">
            <button
              type="button"
              onClick={() => trackRef.current?.scrollBy({ left: -348, behavior: "smooth" })}
              className="dashboard-nav-arrow absolute left-0 top-1/2 z-20 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#40485d]/30 text-[#a3aac4] opacity-0 shadow-xl group-hover/section:opacity-100"
              aria-label={`Voltar em ${group.category}`}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
    
            <button
              type="button"
              onClick={() => trackRef.current?.scrollBy({ left: 348, behavior: "smooth" })}
              className="dashboard-nav-arrow absolute right-0 top-1/2 z-20 flex h-10 w-10 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#40485d]/30 text-[#a3aac4] opacity-0 shadow-xl group-hover/section:opacity-100"
              aria-label={`Avancar em ${group.category}`}
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
                maxContentCount={maxContentCount}
                onEdit={onEditTechnology}
                onOpen={onOpenTechnology}
                technology={technology}
              />
            ))}
          </div>
          </div>
        )}

        {displayMode === "list" && (
          <div className="flex flex-row flex-wrap gap-4 pl-2 pr-2 pb-4">
            {group.items.map((technology) => (
              <TechnologyListItem
                key={technology.id}
                onOpen={onOpenTechnology}
                technology={technology}
              />
            ))}
          </div>
        )}

        {displayMode === "details" && (
          <div className="flex flex-col gap-3 pl-2 pr-2 pb-4">
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
    <div ref={setNodeRef} style={style} className="relative group/sortable-rail">
      <div
        {...attributes}
        {...listeners}
        className="absolute -left-10 top-2 z-[30] flex h-8 w-8 cursor-grab items-center justify-center rounded text-[#40485d] opacity-0 transition-opacity hover:bg-[#141f38] hover:text-[#69daff] active:cursor-grabbing group-hover/sortable-rail:opacity-100 xl:flex hidden"
        title="Arraste para reordenar esta categoria"
      >
        <LayoutDashboard className="h-4 w-4" />
      </div>
        <SectionRail group={group} displayMode={props.displayMode} {...props} />
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
  setActiveTechnology,
  supabaseConfigured,
  technologies,
  categories,
  onSyncStructure,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [displayMode, setDisplayMode] = useState("cards");

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

  const openTechnology = (technology) => {
    setActiveTechnology(technology);
    onSelectTechnology(technology);
  };

  return (
    <div className="relative min-h-screen bg-[#060e20] text-[#dee5ff]">
      <div className="fixed inset-0 bg-[#060e20]" />

      <aside className="fixed left-0 top-0 z-[60] hidden h-full w-64 flex-col gap-y-6 bg-[#091328] py-8 lg:flex">
        <div className="mb-4 px-8">
          <h1 className="font-['Manrope'] text-2xl font-black italic tracking-tighter text-[#69daff]">
            CodenLens
          </h1>
          <p className="mt-1 font-['Manrope'] text-[10px] uppercase tracking-widest text-[#a3aac4]">
            Bibliotecas de estudo vivas
          </p>
        </div>

        <nav className="flex-1 space-y-1">
          <SidebarItem active icon={LayoutDashboard} label="Painel" onClick={() => {}} />
          <SidebarItem
            icon={BookMarked}
            label="Bibliotecas"
            onClick={() => {
              if (technologies[0]) {
                openTechnology(technologies[0]);
              }
            }}
          />
          <SidebarItem
            icon={LayoutDashboard}
            label="Categorias"
            onClick={onManageCategories}
          />
          <SidebarItem
            icon={UserCircle2}
            label={isLogged ? "Conta" : "Entrar"}
            onClick={isLogged ? onOpenAccount : onSignInWithGoogle}
          />
          <SidebarItem icon={Shield} label="Acompanhamento" onClick={() => {}} />
        </nav>

        <div className="mt-auto flex flex-col gap-y-4 px-8">
          <button
            type="button"
            onClick={onCreateTechnology}
            className="rounded-md bg-gradient-to-br from-[#69daff] to-[#00c0ea] py-2 font-['Manrope'] text-xs font-bold text-[#002a35] shadow-lg shadow-[#69daff]/20"
          >
            Adicionar tecnologia
          </button>

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
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar tecnologias..."
              className="w-full rounded-lg border-none bg-black py-2 pl-10 pr-4 text-sm text-[#dee5ff] placeholder:text-[#6d758c] focus:ring-2 focus:ring-[#69daff]/50"
            />
          </div>
        </div>

        <div className="flex items-center gap-x-4 sm:gap-x-6">
          <button
            type="button"
            onClick={onCreateTechnology}
            className="hidden rounded-md bg-gradient-to-r from-[#69daff] to-[#00c0ea] px-4 py-2 font-['Manrope'] text-sm font-bold tracking-tight text-[#002a35] transition-all hover:shadow-lg sm:block"
          >
            Adicionar tecnologia
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
        <header className="mb-12 flex flex-col items-start justify-between gap-y-4 sm:flex-row sm:items-end">
          <div>
            <h2 className="font-['Manrope'] text-4xl font-extrabold tracking-tighter text-[#dee5ff]">
              Radar de tecnologias
            </h2>
            <p className="mt-2 text-sm text-[#a3aac4]">
              Organize suas bibliotecas de estudo e acompanhe a evolucao do que voce esta dominando.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-1 rounded-lg border border-[#40485d]/30 bg-[#0f1930] p-1">
            <button
              onClick={() => setDisplayMode("cards")}
              className={`flex h-8 w-10 items-center justify-center rounded-md transition-all ${
                displayMode === "cards" 
                  ? "bg-[#1d2b4b] text-[#69daff] shadow-sm" 
                  : "text-[#6d758c] hover:text-[#a3aac4] hover:bg-white/5"
              }`}
              title="Visão com Cartões Grandes"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setDisplayMode("list")}
              className={`flex h-8 w-10 items-center justify-center rounded-md transition-all ${
                displayMode === "list" 
                  ? "bg-[#1d2b4b] text-[#69daff] shadow-sm" 
                  : "text-[#6d758c] hover:text-[#a3aac4] hover:bg-white/5"
              }`}
              title="Lista Minimalista"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setDisplayMode("details")}
              className={`flex h-8 w-10 items-center justify-center rounded-md transition-all ${
                displayMode === "details" 
                  ? "bg-[#1d2b4b] text-[#69daff] shadow-sm" 
                  : "text-[#6d758c] hover:text-[#a3aac4] hover:bg-white/5"
              }`}
              title="Detalhes e Edição Rápida"
            >
              <AlignJustify className="h-4 w-4" />
            </button>
          </div>
        </header>

        {groupedTechnologies.length ? (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={groupedTechnologies.map(g => `rail-${g.category}`)} strategy={verticalListSortingStrategy}>
              {groupedTechnologies.map((group) => (
                <SortableSectionRail
                  id={`rail-${group.category}`}
                  key={`rail-${group.category}`}
                  group={group}
                  displayMode={displayMode}
                  maxContentCount={maxContentCount}
                  onEditTechnology={onEditTechnology}
                  onOpenTechnology={openTechnology}
                />
              ))}
            </SortableContext>
          </DndContext>
        ) : (
          <section className="rounded-xl border border-[#40485d]/10 bg-[#0f1930] px-6 py-16 text-center">
            <p className="font-['Manrope'] text-lg font-bold text-[#dee5ff]">
              Nenhuma tecnologia encontrada
            </p>
            <p className="mt-2 text-sm text-[#a3aac4]">
              Tente outro termo na busca.
            </p>
          </section>
        )}
      </main>
    </div>
  );
}

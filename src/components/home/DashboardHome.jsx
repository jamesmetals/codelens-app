import { createElement, useMemo, useRef, useState } from "react";
import {
  Bell,
  BookMarked,
  ChevronLeft,
  ChevronRight,
  FileText,
  HelpCircle,
  LayoutDashboard,
  Pencil,
  Plus,
  Search,
  Settings,
  Shield,
  UserCircle2,
} from "lucide-react";

import TechnologyArtwork from "./TechnologyArtwork";

const SECTION_ORDER = ["Fundamentos", "Frameworks", "Infraestrutura", "Minhas tecnologias"];

function GoogleMark({ className = "" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M21.805 10.023H12.24v3.955h5.478c-.236 1.274-.955 2.353-2.032 3.079v2.56h3.294c1.929-1.776 3.04-4.395 3.04-7.305 0-.691-.06-1.363-.215-2.289Z"
        fill="#4285F4"
      />
      <path
        d="M12.24 22c2.743 0 5.045-.907 6.727-2.383l-3.294-2.56c-.907.611-2.068.974-3.433.974-2.652 0-4.903-1.79-5.711-4.2H3.131v2.64A10.16 10.16 0 0 0 12.24 22Z"
        fill="#34A853"
      />
      <path
        d="M6.529 13.83a6.107 6.107 0 0 1 0-3.858V7.332H3.131a10.16 10.16 0 0 0 0 9.139l3.398-2.64Z"
        fill="#FBBC04"
      />
      <path
        d="M12.24 5.79c1.494 0 2.82.514 3.865 1.523l2.897-2.897C17.28 2.81 14.979 2 12.24 2A10.16 10.16 0 0 0 3.131 7.332l3.398 2.64c.808-2.41 3.06-4.182 5.711-4.182Z"
        fill="#EA4335"
      />
    </svg>
  );
}

function getAvatarUrl(authUser) {
  return String(
    authUser?.user_metadata?.avatar_url
      || authUser?.user_metadata?.picture
      || authUser?.user_metadata?.photo_url
      || "",
  ).trim();
}

function getAvatarFallback(authUser) {
  const source = String(
    authUser?.user_metadata?.full_name
      || authUser?.user_metadata?.name
      || authUser?.email
      || "C",
  ).trim();

  return source.charAt(0).toUpperCase() || "C";
}

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

function getTechnologyGroups(technologies, searchTerm) {
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

  return Array.from(groupedMap.values()).sort((left, right) => {
    const leftIndex = SECTION_ORDER.indexOf(left.category);
    const rightIndex = SECTION_ORDER.indexOf(right.category);

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

function SectionRail({
  group,
  maxContentCount,
  onEditTechnology,
  onOpenTechnology,
}) {
  const trackRef = useRef(null);

  return (
    <section className="group/section relative mb-14 last:mb-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-end gap-x-3">
          <h3 className="font-['Manrope'] text-xl font-bold text-[#dee5ff]">{group.category}</h3>
          <span className="mb-1 font-['Manrope'] text-[10px] uppercase tracking-[0.2em] text-[#00c0ea]">
            {group.accent}
          </span>
        </div>
        <button className="font-['Manrope'] text-xs font-bold uppercase tracking-[0.18em] text-[#a3aac4] transition-colors hover:text-[#69daff]">
          Ver mais
        </button>
      </div>

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
    </section>
  );
}

export default function DashboardHome({
  authUser,
  onCreateTechnology,
  onEditTechnology,
  onOpenAccount,
  onSelectTechnology,
  onSignInWithGoogle,
  setActiveTechnology,
  supabaseConfigured,
  technologies,
}) {
  const [searchTerm, setSearchTerm] = useState("");

  const groupedTechnologies = useMemo(
    () => getTechnologyGroups(technologies, searchTerm),
    [technologies, searchTerm],
  );

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
        <header className="mb-12">
          <h2 className="font-['Manrope'] text-4xl font-extrabold tracking-tighter text-[#dee5ff]">
            Radar de tecnologias
          </h2>
          <p className="mt-2 max-w-2xl text-[#a3aac4]">
            Organize suas bibliotecas de estudo e acompanhe a evolucao do que voce esta dominando.
          </p>
        </header>

        {groupedTechnologies.length ? (
          groupedTechnologies.map((group) => (
            <SectionRail
              key={group.category}
              group={group}
              maxContentCount={maxContentCount}
              onEditTechnology={onEditTechnology}
              onOpenTechnology={openTechnology}
            />
          ))
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

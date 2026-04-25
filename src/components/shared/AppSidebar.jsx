import { createElement, useEffect } from "react";
import { X } from "lucide-react";

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
      <span className="font-sans text-[10px] font-bold uppercase tracking-[0.24em]">{label}</span>
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
      <span className="font-sans text-[10px] uppercase tracking-[0.24em]">{label}</span>
    </button>
  );
}

function SidebarContent({
  titleNode,
  subtitle,
  onTitleClick,
  navItems,
  supportItems,
  footerNode,
  onNavigate,
}) {
  return (
    <>
      <div className="mb-4 px-8">
        <button type="button" onClick={onTitleClick} className="text-left">
          {titleNode}
          <p className="mt-1 font-sans text-[10px] uppercase tracking-widest text-dashboard-muted">{subtitle}</p>
        </button>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <SidebarItem
            key={item.id}
            active={Boolean(item.active)}
            icon={item.icon}
            label={item.label}
            onClick={() => {
              item.onClick?.();
              onNavigate?.();
            }}
          />
        ))}
      </nav>

      {footerNode ? <div className="px-8">{footerNode}</div> : null}

      {supportItems?.length ? (
        <div className="mt-auto px-8">
          <div className="space-y-1 border-t border-dashboard-border/10 pt-4">
            {supportItems.map((item) => (
              <SupportLink
                key={item.id}
                icon={item.icon}
                label={item.label}
                onClick={() => {
                  item.onClick?.();
                  onNavigate?.();
                }}
              />
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}

export default function AppSidebar({
  titleNode,
  subtitle,
  onTitleClick,
  navItems,
  supportItems = [],
  footerNode = null,
  mobileOpen = false,
  onMobileOpenChange,
}) {
  useEffect(() => {
    if (!mobileOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") onMobileOpenChange?.(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen, onMobileOpenChange]);

  return (
    <>
      <aside
        data-reveal="view-nav"
        className="fixed left-0 top-0 z-[60] hidden h-full w-64 flex-col gap-y-6 bg-dashboard-sidebar py-8 lg:flex"
        aria-label="Menu lateral"
      >
        <SidebarContent
          titleNode={titleNode}
          subtitle={subtitle}
          onTitleClick={onTitleClick}
          navItems={navItems}
          supportItems={supportItems}
          footerNode={footerNode}
        />
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-[70] lg:hidden" role="presentation">
          <button
            type="button"
            className="absolute inset-0 bg-black/55"
            aria-label="Fechar menu"
            onClick={() => onMobileOpenChange?.(false)}
          />
          <div className="absolute left-0 top-0 flex h-full w-[min(20rem,92vw)] flex-col gap-y-6 overflow-y-auto bg-dashboard-sidebar py-8 shadow-2xl">
            <div className="flex justify-end px-6">
              <button
                type="button"
                onClick={() => onMobileOpenChange?.(false)}
                className="dashboard-focusring rounded-md p-2 text-dashboard-muted hover:text-dashboard-text"
                aria-label="Fechar navegação"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <SidebarContent
              titleNode={titleNode}
              subtitle={subtitle}
              onTitleClick={onTitleClick}
              navItems={navItems}
              supportItems={supportItems}
              footerNode={footerNode}
              onNavigate={() => onMobileOpenChange?.(false)}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}

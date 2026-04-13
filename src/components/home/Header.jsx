import { Bell, Cloud, Menu, Search, User } from "lucide-react";
import { getDisplayName } from "../../studySync";
import CodenLensLogo from "../shared/CodenLensLogo";

export default function Header({
  authUser,
  onOpenAccount,
  onSignInWithGoogle,
  supabaseConfigured,
  syncNotice,
}) {
  const isLogged = Boolean(authUser);
  const displayName = getDisplayName(authUser);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#040D17]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <div className="flex cursor-pointer items-center gap-3">
            <CodenLensLogo size={36} />
            <div>
              <p className="font-['Manrope'] text-base font-black tracking-tight">
                <span className="text-white">Coden</span><span className="text-[#00e5ff]">Lens</span>
              </p>
            </div>
          </div>

          <nav className="hidden items-center gap-6 md:flex">
            <a href="#" className="text-sm font-medium text-white">Painel</a>
            <a href="#" className="text-sm font-medium text-slate-400 transition-colors hover:text-white">Catalogo</a>
            <a href="#" className="text-sm font-medium text-slate-400 transition-colors hover:text-white">Comunidade</a>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <button className="hidden items-center gap-2 text-slate-400 transition-colors hover:text-white sm:flex">
            <Search className="h-4 w-4" />
          </button>

          {isLogged ? (
            <div className="flex items-center gap-4 border-l border-white/10 pl-4">
              <button className="relative text-slate-400 transition-colors hover:text-sky-300">
                <Bell className="h-5 w-5" />
                <span className="absolute right-0 top-0 h-2 w-2 rounded-full border border-[#040D17] bg-rose-500" />
              </button>

              <button type="button" className="group flex cursor-pointer items-center gap-3" onClick={onOpenAccount}>
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-semibold text-white transition-colors group-hover:text-sky-300">{displayName}</p>
                  <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400">
                    <Cloud className="h-3 w-3" />
                    <span className="max-w-[180px] truncate">{syncNotice || "Conta conectada"}</span>
                  </div>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-gradient-to-tr from-sky-500 to-indigo-500 shadow-lg transition-all group-hover:ring-2 group-hover:ring-sky-500/50">
                  <User className="h-5 w-5 text-white" />
                </div>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onSignInWithGoogle}
                disabled={!supabaseConfigured}
                className="rounded-full bg-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_0_15px_rgba(93,169,255,0.3)] transition-colors hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Entrar com Google
              </button>
            </div>
          )}

          <button className="ml-2 text-slate-300 md:hidden">
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>
    </header>
  );
}

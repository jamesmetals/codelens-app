import { BookOpen, User, Bell, Search, Menu } from "lucide-react";

export default function Header() {
  const isLogged = true; // Simulating logged-in state as requested

  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#040D17]/80 backdrop-blur-md"
      data-reveal="nav"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Left Side: Logo */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3 cursor-pointer">
            <div className="brand-lockup">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-200/90">
                CodenLens
              </p>
            </div>
          </div>
          
          {/* Main Navigation (Hidden on small screens) */}
          <nav className="hidden md:flex items-center gap-6">
            <a href="#" className="text-sm font-medium text-white">Dashboard</a>
            <a href="#" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Catálogo</a>
            <a href="#" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Comunidade</a>
          </nav>
        </div>

        {/* Right Side: Actions & Profile */}
        <div className="flex items-center gap-4">
          <button className="hidden sm:flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <Search className="h-4 w-4" />
          </button>
          
          {isLogged ? (
            <div className="flex items-center gap-4 border-l border-white/10 pl-4">
              <button className="text-slate-400 hover:text-sky-300 transition-colors relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-rose-500 border border-[#040D17]" />
              </button>
              
              <div className="flex items-center gap-3 cursor-pointer group">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-white group-hover:text-sky-300 transition-colors">James Batista</p>
                  <p className="text-[10px] text-slate-400">Plano Pro</p>
                </div>
                <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center border border-white/10 shadow-lg group-hover:ring-2 group-hover:ring-sky-500/50 transition-all">
                  <User className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button className="text-sm font-medium text-slate-300 hover:text-white transition-colors px-3 py-2">
                Entrar
              </button>
              <button className="text-sm font-semibold text-white bg-sky-500 hover:bg-sky-400 transition-colors px-4 py-2 rounded-full shadow-[0_0_15px_rgba(93,169,255,0.3)]">
                Cadastrar
              </button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button className="md:hidden text-slate-300 ml-2">
             <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>
    </header>
  );
}

import { SearchCheck, GraduationCap, Bug, Wand2, Code2 } from "lucide-react";

export default function ModeSelector({ selected, onSelect }) {
  const modes = [
    { id: "review", label: "Revisar", icon: SearchCheck, desc: "Análise completa" },
    { id: "explain", label: "Explicar", icon: GraduationCap, desc: "Para iniciantes" },
    { id: "bugs", label: "Bugs", icon: Bug, desc: "Identificar falhas" },
    { id: "refactor", label: "Refatorar", icon: Wand2, desc: "Boas práticas" },
    { id: "compare", label: "Comparar", icon: Code2, desc: "Original vs Novo" },
  ];

  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-semibold text-slate-300">Modo de Análise</label>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
        {modes.map((mode) => {
          const Icon = mode.icon;
          const isSelected = selected === mode.id;
          
          return (
            <button
              key={mode.id}
              onClick={() => onSelect(mode.id)}
              className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                isSelected 
                  ? "bg-sky-500/10 border-sky-400/40 text-sky-100 shadow-[0_0_15px_rgba(93,169,255,0.15)]" 
                  : "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:border-white/10"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`h-4 w-4 ${isSelected ? "text-sky-400" : "text-slate-500"}`} />
                <span className="text-sm font-medium">{mode.label}</span>
              </div>
              <span className="text-[10px] text-slate-500 tracking-wide">{mode.desc}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

import { GitCompare } from "lucide-react";

export default function CodeComparison({ original, refactored }) {
  if (!original || !refactored) return null;

  return (
    <div className="space-y-4 pt-4 border-t border-white/10 mt-4 animate-fade-in">
      <h3 className="text-sm font-semibold text-sky-400 flex items-center gap-2">
        <GitCompare className="h-4 w-4" /> Comparação de Código
      </h3>
      
      <div className="flex flex-col xl:flex-row gap-4">
        {/* Original */}
        <div className="flex-1 rounded-xl border border-rose-500/20 bg-rose-950/10 overflow-hidden flex flex-col">
          <div className="bg-rose-950/40 px-3 py-1.5 border-b border-rose-500/20 flex gap-2 items-center">
            <span className="w-2 h-2 rounded-full bg-rose-500/80" />
            <span className="text-xs uppercase tracking-widest font-semibold text-rose-300/80">Antes</span>
          </div>
          <pre className="p-3 text-xs font-mono text-rose-100/80 overflow-x-auto flex-1">
            {original || "// Sem código original"}
          </pre>
        </div>

        {/* Refatorado */}
        <div className="flex-1 rounded-xl border border-emerald-500/20 bg-emerald-950/10 overflow-hidden flex flex-col">
          <div className="bg-emerald-950/40 px-3 py-1.5 border-b border-emerald-500/20 flex gap-2 items-center">
             <span className="w-2 h-2 rounded-full bg-emerald-500/80" />
             <span className="text-xs uppercase tracking-widest font-semibold text-emerald-300/80">Depois</span>
          </div>
          <pre className="p-3 text-xs font-mono text-emerald-100 overflow-x-auto flex-1">
            {refactored || "// Sem código refatorado"}
          </pre>
        </div>
      </div>
    </div>
  );
}

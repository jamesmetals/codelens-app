import { CheckCircle2, AlertTriangle, Lightbulb } from "lucide-react";

export default function AnalysisResult({ result }) {
  if (!result) return null;

  return (
    <div className="space-y-6 pt-4 border-t border-white/10 mt-4 animate-fade-in">
      <div className="soft-panel border-sky-500/20 bg-sky-900/10">
        <h3 className="text-sm font-semibold text-sky-300 mb-2 flex items-center gap-2">
           <span className="text-xl">📝</span> Resumo
        </h3>
        <p className="text-sm text-slate-300 leading-relaxed">{result.summary}</p>
      </div>

      {result.positives?.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" /> Pontos Positivos
          </h3>
          <ul className="space-y-2">
            {result.positives.map((item, idx) => (
              <li key={idx} className="text-sm text-slate-300 bg-emerald-950/20 border border-emerald-900/30 rounded-lg p-3 flex gap-2 items-start">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {result.problems?.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-rose-400 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" /> Problemas Encontrados
          </h3>
          <ul className="space-y-2">
            {result.problems.map((prob, idx) => (
              <li key={idx} className="text-sm text-slate-300 bg-rose-950/20 border border-rose-900/30 rounded-lg p-3 flex flex-col gap-1 items-start">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-300/80 bg-rose-900/40 px-1.5 py-0.5 rounded-sm">
                  {prob.severity}
                </span>
                {prob.text}
              </li>
            ))}
          </ul>
        </div>
      )}

      {result.suggestions?.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-amber-400 flex items-center gap-2">
            <Lightbulb className="h-4 w-4" /> Sugestões Práticas
          </h3>
          <ul className="space-y-2">
            {result.suggestions.map((sug, idx) => (
              <li key={idx} className="text-sm text-slate-300 bg-amber-950/20 border border-amber-900/30 rounded-lg p-3 flex gap-2 items-start">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                {sug}
              </li>
            ))}
          </ul>
        </div>
      )}

      {result.refactored && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-sky-400 flex items-center gap-2">
            <span className="text-xl">🔄</span> Código Refatorado
          </h3>
          <div className="rounded-xl border border-sky-500/20 bg-[#040D17] overflow-hidden">
            <div className="bg-sky-950/30 px-4 py-2 flex items-center justify-between border-b border-sky-500/20">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              </div>
            </div>
            <pre className="p-4 text-xs font-mono text-sky-100 overflow-x-auto whitespace-pre-wrap">
              {result.refactored}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState } from "react";
import CodeInput from "./CodeInput";
import ModeSelector from "./ModeSelector";
import AnalysisResult from "./AnalysisResult";
import CodeComparison from "./CodeComparison";
import { X, Sparkles, Loader2 } from "lucide-react";

export default function DevBriefPanel({ isOpen, onClose, initialCode }) {
  const [code, setCode] = useState(initialCode || "");
  const [language, setLanguage] = useState("javascript");
  const [mode, setMode] = useState("review");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  // Mock function to simulate API call
  const handleAnalyze = () => {
    if (code.length < 5) return;
    setIsAnalyzing(true);
    setResult(null);

    setTimeout(() => {
      // Mock result
      if (mode === "compare") {
        setResult({
          type: "compare",
          original: code,
          refactored: "// Código refatorado\n" + code.replace(/var/g, "const").replace(/==/g, "==="),
        });
      } else {
        setResult({
          type: "analysis",
          summary: "Este código parece ser uma função básica. Pode ser otimizada usando métodos mais modernos.",
          positives: ["Nomenclatura clara", "Uso de funções"],
          problems: [{ severity: "Médio", text: "Uso de 'var' ou '=='." }],
          suggestions: ["Utilize const/let", "Avalie a performance do loop"],
          refactored: "// Código refatorado sugerido\n" + code,
        });
      }
      setIsAnalyzing(false);
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div className="fixed top-0 right-0 z-50 h-full w-full max-w-2xl transform border-l border-white/10 bg-gradient-to-b from-[#0B1D35] to-[#06111F] p-6 shadow-2xl transition-transform duration-300 ease-in-out flex flex-col pt-8">
        
        <header className="flex items-center justify-between border-b border-white/10 pb-5 mb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 border border-sky-400/20 text-sky-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Análise Assistida</h2>
              <p className="text-sm text-sky-200/60">DevBrief AI integrado</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto pr-2 space-y-6 custom-scrollbar">
          
          <CodeInput 
            code={code} 
            onChange={setCode} 
            language={language}
            onLanguageChange={setLanguage}
          />
          
          <ModeSelector selected={mode} onSelect={setMode} />

          <button 
            onClick={handleAnalyze}
            disabled={isAnalyzing || code.length < 5}
            className="primary-cta w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAnalyzing ? (
              <>
               <Loader2 className="h-4 w-4 animate-spin" /> Analisando...
              </>
            ) : (
              <>
               <Sparkles className="h-4 w-4" /> Realizar Análise
              </>
            )}
          </button>

          {result && result.type === "compare" && (
            <CodeComparison original={result.original} refactored={result.refactored} />
          )}

          {result && result.type === "analysis" && (
            <AnalysisResult result={result} />
          )}

        </div>

      </div>
    </>
  );
}

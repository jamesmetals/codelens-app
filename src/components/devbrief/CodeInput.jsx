import { Copy, FileCode } from "lucide-react";

export default function CodeInput({ code, onChange, language, onLanguageChange }) {
  const languages = ["javascript", "typescript", "python", "css", "rust", "sql"];
  
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-300">Cole seu trecho de código</label>
        <select 
          value={language}
          onChange={(e) => onLanguageChange(e.target.value)}
          className="bg-black/30 border border-white/10 rounded-lg px-2 py-1 text-xs text-slate-300 focus:outline-none focus:border-sky-500/50"
        >
          {languages.map(lang => (
            <option key={lang} value={lang}>{lang.toUpperCase()}</option>
          ))}
        </select>
      </div>
      
      <div className="relative group">
        <textarea
          value={code}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Ex: function calculateTotal(items) { ... }"
          className="w-full h-48 bg-[#040D17] border border-white/5 rounded-xl p-4 text-sm font-mono text-sky-100 placeholder:text-slate-600 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 transition-all resize-y custom-scrollbar"
        />
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
           <button 
             onClick={() => navigator.clipboard.readText().then(text => onChange(text))}
             className="bg-white/10 hover:bg-white/20 text-xs px-2 py-1 rounded-md text-slate-300 flex items-center gap-1 backdrop-blur-md"
             title="Colar"
            >
             <FileCode className="h-3 w-3" /> Colar
           </button>
           <button 
             onClick={() => navigator.clipboard.writeText(code)}
             className="bg-white/10 hover:bg-white/20 text-xs px-2 py-1 rounded-md text-slate-300 flex items-center gap-1 backdrop-blur-md"
             title="Copiar"
            >
             <Copy className="h-3 w-3" /> Copiar
           </button>
        </div>
        <div className="absolute bottom-3 right-3 text-[10px] text-slate-500 font-mono bg-[#040D17] px-1">
          {code.length}/8000
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { ArrowLeft, BookOpen, MessageSquareText, Save, Sparkles, Wand2, TerminalSquare } from "lucide-react";
import DynamicEditor from "./DynamicEditor";

export default function StudyRoom({ activeTechnology, activeLesson, onBack, onOpenDevBrief }) {
  const initialCode = `import { useEffect, useState } from 'react';

export function Sincronizador() {
  const [data, setData] = useState(null);

  useEffect(() => {
    // TODO: Falta fechar o ciclo de requisicao
    fetchData().then(setData);
  }, []);

  return <div>{data ? data.name : 'Loading...'}</div>;
}`;

  const [notes, setNotes] = useState([
    {
      id: 1,
      time: "Há 2 horas",
      content: "As dependências do useEffect sempre confundem os ciclos de renderização do componente.",
      codeSnippet: "useEffect(() => {\n  fetchData();\n}, []);",
      led: { name: 'rose', bg: 'bg-rose-500', text: 'text-rose-400', border: 'border-rose-500/50', bgSoft: 'bg-rose-500/20' }
    }
  ]);

  const handleAddAnnotation = (textSnippet, ledColor) => {
    const newNote = {
      id: Date.now(),
      time: "Agora mesmo",
      content: "", // Usuario preencherá a nota ao lado
      codeSnippet: textSnippet,
      led: ledColor,
      isNew: true
    };
    
    // Insere sempre no topo
    setNotes(prev => [newNote, ...prev]);
  };

  const updateNoteText = (id, newText) => {
    setNotes(prev => prev.map(note => note.id === id ? { ...note, content: newText } : note));
  };

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden bg-[#06111f] animate-fade-in relative z-10 w-full">
      {/* Navbar Minimalista da Sala */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0B1D35]/50 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button 
             onClick={onBack}
             className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
          >
             <ArrowLeft className="h-4 w-4" />
          </button>
          
          <div className="flex items-center gap-3 border-l border-white/10 pl-4">
             <BookOpen className="h-5 w-5 text-sky-400" />
             <div>
               <p className="text-sm font-semibold text-white">{activeLesson?.title || activeTechnology.currentLesson}</p>
               <p className="text-[10px] uppercase tracking-wider text-slate-400">{activeTechnology.name} Bootcamp</p>
             </div>
          </div>
        </div>

        <button 
           onClick={onOpenDevBrief}
           className="flex items-center gap-2 bg-gradient-to-r from-sky-500/20 to-sky-400/10 border border-sky-400/30 text-sky-300 px-4 py-2 rounded-full font-medium text-sm hover:bg-sky-500/30 transition-colors shadow-[0_0_20px_rgba(93,169,255,0.15)]"
        >
           <Wand2 className="h-4 w-4" />
           Análise Assistida
        </button>
      </header>

      {/* Area Central de Estudos */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* Painel Esquerdo: Editor Rico Interativo */}
        <div className="flex-1 flex flex-col border-r border-white/10 bg-[#040D17]">
           <div className="flex items-center justify-between px-4 py-3 bg-black/40 border-b border-white/5">
             <div className="flex items-center gap-2">
               <TerminalSquare className="h-4 w-4 text-slate-400" />
               <span className="text-xs font-mono text-slate-300">workspace.jsx (Editável)</span>
             </div>
             <p className="text-[10px] text-slate-500">
               Selecione qualquer trecho para criar uma anotação vinculada
             </p>
           </div>
           
           <div className="flex-1 overflow-hidden relative">
             {/* Componente que envelopa os Highlights ("LEDs") */}
             <DynamicEditor 
               initialContent={initialCode} 
               onAddSelection={handleAddAnnotation} 
             />
             
             {/* Efeito visual de blur fundo esquerdo */}
             <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-sky-500/5 blur-[120px] pointer-events-none rounded-full" />
           </div>
        </div>

        {/* Painel Direito: Anotações Pessoais */}
        <aside className="w-96 bg-[#0B1D35]/30 flex flex-col shadow-[-10px_0_30px_rgba(0,0,0,0.2)]">
           <div className="p-4 border-b border-white/5 bg-black/20 flex items-center gap-2">
             <MessageSquareText className="h-4 w-4 text-slate-400" />
             <h3 className="text-sm font-semibold text-slate-200">Anotações Conectadas</h3>
           </div>
           
           <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
             {notes.map(note => (
               <div key={note.id} className={`bg-white/5 border border-white/10 rounded-xl overflow-hidden transition-all duration-300 ${note.isNew ? 'ring-2 ring-white/20' : ''}`}>
                 {/* Topo do Card com a Cor (O bendito "Led") */}
                 <div className={`h-1 w-full ${note.led?.bg || 'bg-slate-500'}`} />
                 
                 <div className="p-4">
                   <div className="flex justify-between items-center mb-3">
                     <p className="text-[9px] uppercase tracking-wider text-slate-500 bg-black/40 px-2 py-0.5 rounded-sm">{note.time}</p>
                     {/* Bolinha LED piscante quando é novo */}
                     <div className={`w-2 h-2 rounded-full ${note.led?.bg} shadow-[0_0_8px_${note.led?.bg}] ${note.isNew ? 'animate-pulse' : ''}`} />
                   </div>
                   
                   {/* Trecho selecionado no Editor original */}
                   {note.codeSnippet && (
                     <div className="bg-[#030912] border border-white/5 rounded-lg p-3 mb-3 relative group">
                       <button className="absolute top-2 right-2 text-slate-500 hover:text-sky-400 opacity-0 group-hover:opacity-100 transition-opacity">
                         <Sparkles className="h-3 w-3" />
                       </button>
                       <pre className={`text-xs font-mono whitespace-pre-wrap ${note.led?.text}`}>
                         {note.codeSnippet}
                       </pre>
                     </div>
                   )}

                   {/* Texto da anotação do usuario editável */}
                   <textarea
                     value={note.content}
                     onChange={(e) => updateNoteText(note.id, e.target.value)}
                     placeholder="Suas conclusões sobre esse código..."
                     className="w-full text-sm text-slate-200 bg-transparent border-none resize-none focus:ring-0 focus:outline-none p-0 custom-scrollbar"
                     rows={note.content ? undefined : 2}
                   />
                 </div>
               </div>
             ))}

             {notes.length === 0 && (
               <div className="text-center p-8 opacity-50 flex flex-col items-center">
                 <TerminalSquare className="h-8 w-8 mb-3 text-slate-400" />
                 <p className="text-xs text-slate-400">Selecione no código ao lado para começar anotar.</p>
               </div>
             )}
           </div>
        </aside>

      </main>

    </div>
  );
}

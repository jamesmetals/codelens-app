import { useState, useRef, useEffect } from 'react';
import { Bold, Italic, Underline, Highlighter, List, Quote, Code, Type, AlignLeft, AlignCenter, AlignRight, Plus } from 'lucide-react';

const COLORS = [
  { name: 'rose', bg: 'bg-rose-500', text: 'text-rose-400', border: 'border-rose-500/50', bgSoft: 'bg-rose-500/20' },
  { name: 'emerald', bg: 'bg-emerald-500', text: 'text-emerald-400', border: 'border-emerald-500/50', bgSoft: 'bg-emerald-500/20' },
  { name: 'sky', bg: 'bg-sky-500', text: 'text-sky-400', border: 'border-sky-500/50', bgSoft: 'bg-sky-500/20' },
  { name: 'amber', bg: 'bg-amber-500', text: 'text-amber-400', border: 'border-amber-500/50', bgSoft: 'bg-amber-500/20' },
  { name: 'violet', bg: 'bg-violet-500', text: 'text-violet-400', border: 'border-violet-500/50', bgSoft: 'bg-violet-500/20' }
];

export default function DynamicEditor({ initialContent, onAddSelection }) {
  const editorRef = useRef(null);
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0 });

  // Controla o HTML inicial
  useEffect(() => {
    if (editorRef.current && initialContent && !editorRef.current.innerHTML) {
      // Substitui as quebras de linha por blocos de tag pra caber no contentEditable
      const htmlContent = initialContent
        .split('\n')
        .map(line => `<div>${line || '<br>'}</div>`)
        .join('');
      editorRef.current.innerHTML = htmlContent;
    }
  }, [initialContent]);

  const execCmd = (cmd, value = null) => {
    document.execCommand(cmd, false, value);
    editorRef.current?.focus();
  };

  const handleSelection = () => {
    const selection = window.getSelection();
    const text = selection.toString().trim();

    if (text.length > 0 && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const parentRect = editorRef.current.getBoundingClientRect();
      
      setTooltip({
        visible: true,
        x: rect.left - parentRect.left + (rect.width / 2) - 16,
        y: rect.top - parentRect.top - 40,
        range: range
      });
    } else {
      setTooltip({ visible: false, x: 0, y: 0 });
    }
  };

  const handleAddAnnotation = () => {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    
    // Pega uma cor aleatoria
    const ledColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    const text = selection.toString();

    // Cria o span mágico customizado que envelopará o trecho selecionado no código
    const spanHtml = `<span class="${ledColor.bgSoft} ${ledColor.text} ${ledColor.border} border-b-2 px-1 rounded-sm">${text}</span>`;
    
    document.execCommand('insertHTML', false, spanHtml);
    
    // Manda a criacao da anotação para o StudyRoom (Pai)
    if (onAddSelection) {
      onAddSelection(text, ledColor);
    }
    
    setTooltip({ visible: false, x: 0, y: 0 });
    window.getSelection().removeAllRanges();
  };

  return (
    <div className="flex flex-col h-full w-full relative group">
      
      {/* Editor Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-[#0A192F] border-b border-white/5 shadow-md z-10 transition-opacity">
        <ToolButton icon={<Bold size={14} />} onClick={() => execCmd('bold')} title="Negrito" />
        <ToolButton icon={<Italic size={14} />} onClick={() => execCmd('italic')} title="Itálico" />
        <ToolButton icon={<Underline size={14} />} onClick={() => execCmd('underline')} title="Sublinhado" />
        
        <div className="w-px h-5 bg-white/10 mx-1"></div>
        
        <ToolButton icon={<AlignLeft size={14} />} onClick={() => execCmd('justifyLeft')} title="Alinhar à Esquerda" />
        <ToolButton icon={<AlignCenter size={14} />} onClick={() => execCmd('justifyCenter')} title="Centralizar" />
        <ToolButton icon={<AlignRight size={14} />} onClick={() => execCmd('justifyRight')} title="Alinhar à Direita" />
        
        <div className="w-px h-5 bg-white/10 mx-1"></div>
        
        <ToolButton icon={<List size={14} />} onClick={() => execCmd('insertUnorderedList')} title="Lista" />
        <ToolButton icon={<Code size={14} />} onClick={() => execCmd('formatBlock', 'PRE')} title="Bloco de Código" />
        
        <div className="w-px h-5 bg-white/10 mx-1"></div>
        
        {/* Simulação de cores */}
        <div className="flex gap-1 items-center px-2">
           <Type size={14} className="text-slate-400 mr-1" />
           {['#FFFFFF', '#5DA9FF', '#3FB950', '#F85149', '#D29922'].map(c => (
              <button 
                key={c} 
                onClick={() => execCmd('foreColor', c)}
                className="w-4 h-4 rounded-full border border-white/20 hover:scale-110 transition-transform"
                style={{ backgroundColor: c }}
                title={`Mudar cor para ${c}`}
              />
           ))}
        </div>
      </div>

      {/* Editor Area */}
      <div className="relative flex-1 overflow-y-auto custom-scrollbar p-6 bg-[#040D17]">
         <div 
           ref={editorRef}
           className="min-h-full outline-none font-mono text-sm leading-relaxed text-sky-100/90 whitespace-pre-wrap"
           contentEditable={true}
           suppressContentEditableWarning={true}
           onMouseUp={handleSelection}
           onKeyUp={handleSelection}
         >
         </div>

         {/* Tooltip Botão Flutuante (LED Anotation Linker) */}
         {tooltip.visible && (
            <button
               onClick={handleAddAnnotation}
               className="absolute z-50 flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-tr from-sky-600 to-indigo-500 shadow-[0_4px_12px_rgba(93,169,255,0.4)] hover:scale-110 hover:rotate-90 transition-all border border-indigo-400/50 outline-none group/btn animate-in fade-in zoom-in duration-200"
               style={{ top: tooltip.y, left: tooltip.x }}
               title="Criar anotação inteligente"
            >
               <Plus className="w-4 h-4 text-white" />
            </button>
         )}
      </div>

    </div>
  );
}

function ToolButton({ icon, onClick, title }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="p-1.5 rounded hover:bg-white/10 text-slate-300 transition-colors"
    >
      {icon}
    </button>
  );
}

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Bold, Italic, Underline, Code, AlignLeft, AlignCenter, AlignRight,
  List, Plus, Strikethrough, Pencil, Trash2, Check, X, PaintBucket
} from 'lucide-react';

// Paleta de cores LED (para anotações - não editável pelo usuário)
const LED_COLORS = [
  { name: 'rose',    bg: 'bg-rose-500',    text: 'text-rose-300',    border: 'border-rose-500/60',    bgSoft: 'bg-rose-500/20',    hex: '#fb7185' },
  { name: 'emerald', bg: 'bg-emerald-500', text: 'text-emerald-300', border: 'border-emerald-500/60', bgSoft: 'bg-emerald-500/20', hex: '#34d399' },
  { name: 'sky',     bg: 'bg-sky-500',     text: 'text-sky-300',     border: 'border-sky-500/60',     bgSoft: 'bg-sky-500/20',     hex: '#38bdf8' },
  { name: 'amber',   bg: 'bg-amber-500',   text: 'text-amber-300',   border: 'border-amber-500/60',   bgSoft: 'bg-amber-500/20',   hex: '#fbbf24' },
  { name: 'violet',  bg: 'bg-violet-500',  text: 'text-violet-300',  border: 'border-violet-500/60',  bgSoft: 'bg-violet-500/20',  hex: '#a78bfa' },
];

// Paleta de cores de texto (editável pelo usuário)
const DEFAULT_TEXT_PALETTE = [
  { id: 'padrao',  name: 'Padrão',  hex: '#f1f5f9' },
  { id: 'perigo',  name: 'Perigo',  hex: '#ef4444' },
  { id: 'sucesso', name: 'Sucesso', hex: '#22c55e' },
  { id: 'info',    name: 'Info',    hex: '#3b82f6' },
];

const FONT_FAMILIES = [
  { label: 'Fira Code',    value: '"Fira Code", monospace' },
  { label: 'JetBrains',    value: '"JetBrains Mono", monospace' },
  { label: 'Monospace',    value: 'monospace' },
  { label: 'Inter',        value: '"Inter", sans-serif' },
];

const MIN_SIZE = 11;
const MAX_SIZE = 28;

function loadPalette() {
  try {
    const saved = localStorage.getItem('codenlens_text_palette');
    return saved ? JSON.parse(saved) : DEFAULT_TEXT_PALETTE;
  } catch { return DEFAULT_TEXT_PALETTE; }
}

function savePalette(p) {
  localStorage.setItem('codenlens_text_palette', JSON.stringify(p));
}

// ─── Sub-componentes ─────────────────────────────────────────────────────────

function ToolBtn({ icon, onClick, title, active }) {
  return (
    <button
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      title={title}
      className={`p-1.5 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors ${active ? 'bg-white/10 text-white' : ''}`}
    >
      {icon}
    </button>
  );
}

function Sep() { return <div className="w-px h-4 bg-white/10 mx-1 shrink-0" />; }

// Popup de edição da paleta de cores
function ColorPaletteEditor({ palette, onChange, onClose }) {
  const [local, setLocal] = useState(palette);
  const [newName, setNewName] = useState('');
  const [newHex, setNewHex] = useState('#ffffff');

  const handleAdd = () => {
    if (!newName.trim() || local.length >= 10) return;
    const updated = [...local, { id: Date.now().toString(), name: newName.trim().slice(0, 14), hex: newHex }];
    setLocal(updated);
    setNewName('');
    setNewHex('#ffffff');
  };

  const handleRemove = (id) => setLocal(prev => prev.filter(c => c.id !== id));

  const handleNameChange = (id, name) =>
    setLocal(prev => prev.map(c => c.id === id ? { ...c, name: name.slice(0, 14) } : c));

  const handleHexChange = (id, hex) =>
    setLocal(prev => prev.map(c => c.id === id ? { ...c, hex } : c));

  const handleSave = () => {
    savePalette(local);
    onChange(local);
    onClose();
  };

  return (
    <div className="absolute right-0 top-full mt-2 z-[100] w-72 rounded-xl bg-[#0B1D35] border border-white/10 shadow-2xl shadow-black/60 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Paleta Rápida</p>
          <p className="text-[10px] text-slate-500">MAX 14 CARACTERES — {local.length}/10 cores</p>
        </div>
        <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
          <X size={14} />
        </button>
      </div>

      {/* Color list */}
      <div className="max-h-56 overflow-y-auto custom-scrollbar divide-y divide-white/5">
        {local.map(color => (
          <div key={color.id} className="flex items-center gap-2 px-3 py-2">
            <input
              type="color"
              value={color.hex}
              onChange={e => handleHexChange(color.id, e.target.value)}
              className="w-6 h-6 rounded cursor-pointer bg-transparent border-0 p-0 shrink-0"
              title="Clique para alterar a cor"
            />
            <input
              type="text"
              value={color.name}
              onChange={e => handleNameChange(color.id, e.target.value)}
              maxLength={14}
              className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-0.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500/50"
            />
            <button
              onClick={() => handleRemove(color.id)}
              className="text-slate-600 hover:text-rose-400 transition-colors shrink-0"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>

      {/* Add new */}
      {local.length < 10 && (
        <div className="flex items-center gap-2 px-3 py-2 border-t border-white/10 bg-white/3">
          <input
            type="color"
            value={newHex}
            onChange={e => setNewHex(e.target.value)}
            className="w-6 h-6 rounded cursor-pointer bg-transparent border-0 p-0 shrink-0"
          />
          <input
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value.slice(0, 14))}
            placeholder="Nome da cor..."
            maxLength={14}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-0.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-sky-500/50"
          />
          <button
            onClick={handleAdd}
            disabled={!newName.trim()}
            className="text-[10px] text-sky-400 hover:text-sky-300 disabled:opacity-30 disabled:cursor-not-allowed font-semibold whitespace-nowrap"
          >
            + Adicionar
          </button>
        </div>
      )}

      {/* Save */}
      <div className="px-3 py-2 border-t border-white/10 flex justify-end">
        <button
          onClick={handleSave}
          className="flex items-center gap-1 text-xs bg-sky-500/20 border border-sky-500/40 text-sky-300 px-3 py-1 rounded-lg hover:bg-sky-500/30 transition-colors"
        >
          <Check size={11} /> Salvar paleta
        </button>
      </div>
    </div>
  );
}

// ─── Componente Principal ─────────────────────────────────────────────────────

export default function DynamicEditor({ initialContent, onAddSelection, onChange, highlightSpanId }) {
  const editorRef = useRef(null);
  const savedRangeRef = useRef(null);
  const [tooltip, setTooltip] = useState(null);
  const [fontSize, setFontSize] = useState(14);
  const [fontFamily, setFontFamily] = useState(FONT_FAMILIES[0]);
  const [showFontMenu, setShowFontMenu] = useState(false);
  const [showPaletteEditor, setShowPaletteEditor] = useState(false);
  const [textPalette, setTextPalette] = useState(loadPalette);

  // Popula o editor com o conteúdo inicial (só uma vez)
  useEffect(() => {
    if (editorRef.current && !editorRef.current.dataset.initialized) {
      editorRef.current.dataset.initialized = 'true';
      if (initialContent) {
        const html = initialContent
          .split('\n')
          .map(line => `<div>${line || '<br>'}</div>`)
          .join('');
        editorRef.current.innerHTML = html;
      }
    }
  }, [initialContent]);

  // Efeito: destacar span quando nota é clicada (vem do StudyRoom via prop)
  useEffect(() => {
    if (!highlightSpanId) return;
    const el = document.getElementById(highlightSpanId);
    if (!el) return;

    el.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Animação de "pulso" via manipulação inline de style
    const originalOutline = el.style.outline;
    const originalBoxShadow = el.style.boxShadow;
    const originalTransition = el.style.transition;

    el.style.transition = 'outline 0.15s, box-shadow 0.15s';
    el.style.outline = '2px solid rgba(255,255,255,0.8)';
    el.style.boxShadow = '0 0 16px rgba(255,255,255,0.4)';

    // Pulsa 3 vezes
    let count = 0;
    const pulse = setInterval(() => {
      count++;
      if (count % 2 === 0) {
        el.style.outline = '2px solid rgba(255,255,255,0.8)';
        el.style.boxShadow = '0 0 16px rgba(255,255,255,0.4)';
      } else {
        el.style.outline = '2px solid rgba(255,255,255,0.2)';
        el.style.boxShadow = '0 0 4px rgba(255,255,255,0.1)';
      }
      if (count >= 6) {
        clearInterval(pulse);
        el.style.outline = originalOutline;
        el.style.boxShadow = originalBoxShadow;
        el.style.transition = originalTransition;
      }
    }, 300);

    return () => clearInterval(pulse);
  }, [highlightSpanId]);

  const execCmd = (cmd, value = null) => {
    document.execCommand(cmd, false, value);
    editorRef.current?.focus();
  };

  const changeFontSize = (delta) => {
    const next = Math.min(MAX_SIZE, Math.max(MIN_SIZE, fontSize + delta));
    setFontSize(next);
    if (editorRef.current) editorRef.current.style.fontSize = `${next}px`;
  };

  const handleMouseUp = useCallback(() => {
    requestAnimationFrame(() => {
      const selection = window.getSelection();
      const text = selection?.toString().trim();
      if (!text || !selection?.rangeCount) { setTooltip(null); return; }

      const range = selection.getRangeAt(0);
      savedRangeRef.current = range.cloneRange();

      const rangeRect = range.getBoundingClientRect();
      const containerRect = editorRef.current.closest('.editor-scroll-area').getBoundingClientRect();

      setTooltip({
        x: rangeRect.right - containerRect.left + 8,
        y: rangeRect.top - containerRect.top + rangeRect.height / 2 - 16,
      });
    });
  }, []);

  const handleAddAnnotation = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();

    const range = savedRangeRef.current;
    if (!range) return;
    const text = range.toString().trim();
    if (!text) return;

    const ledColor = LED_COLORS[Math.floor(Math.random() * LED_COLORS.length)];
    const spanId = `led-${Date.now()}`;

    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);

    const spanHtml = `<span
      id="${spanId}"
      style="background-color:${ledColor.hex}22; color:${ledColor.hex}; border-bottom:2px solid ${ledColor.hex}; border-radius:3px; padding:0 3px; cursor:pointer; transition:box-shadow 0.2s;"
    >${text}</span>`;

    document.execCommand('insertHTML', false, spanHtml);

    if (onAddSelection) onAddSelection(text, ledColor, spanId);
    if (onChange) onChange(editorRef.current.innerText);

    savedRangeRef.current = null;
    selection.removeAllRanges();
    setTooltip(null);
  }, [onAddSelection, onChange]);

  // Fecha menus ao clicar fora
  useEffect(() => {
    const close = (e) => {
      if (!e.target.closest('[data-menu]')) {
        setShowFontMenu(false);
        setShowPaletteEditor(false);
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  return (
    <div className="flex flex-col h-full w-full relative">

      {/* ── Toolbar ──────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 bg-[#081525] border-b border-white/5 shrink-0">

        {/* Tamanho da fonte */}
        <button
          onMouseDown={(e) => { e.preventDefault(); changeFontSize(-1); }}
          className="px-1.5 py-1 text-xs text-slate-400 hover:text-white hover:bg-white/10 rounded transition-colors font-bold"
          title="Diminuir fonte"
        >A-</button>
        <span className="text-[10px] text-slate-500 min-w-[30px] text-center">{fontSize}px</span>
        <button
          onMouseDown={(e) => { e.preventDefault(); changeFontSize(1); }}
          className="px-1.5 py-1 text-xs text-slate-400 hover:text-white hover:bg-white/10 rounded transition-colors font-bold"
          title="Aumentar fonte"
        >A+</button>

        <Sep />

        {/* Fonte */}
        <div className="relative" data-menu>
          <button
            onMouseDown={(e) => { e.preventDefault(); setShowFontMenu(p => !p); setShowPaletteEditor(false); }}
            className="flex items-center gap-1 px-2 py-1 text-[11px] text-slate-300 hover:bg-white/10 rounded transition-colors"
          >
            {fontFamily.label}
            <svg className="w-3 h-3 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>
          {showFontMenu && (
            <div className="absolute top-full left-0 mt-1 z-50 bg-[#0B1D35] border border-white/10 rounded-lg shadow-xl overflow-hidden min-w-[140px] animate-in fade-in slide-in-from-top-1 duration-150">
              {FONT_FAMILIES.map(f => (
                <button
                  key={f.value}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setFontFamily(f);
                    if (editorRef.current) editorRef.current.style.fontFamily = f.value;
                    setShowFontMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-white/10 transition-colors ${fontFamily.value === f.value ? 'text-sky-400' : 'text-slate-300'}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <Sep />

        {/* Formatação */}
        <ToolBtn icon={<Bold size={13} />}          onClick={() => execCmd('bold')}          title="Negrito" />
        <ToolBtn icon={<Italic size={13} />}        onClick={() => execCmd('italic')}        title="Itálico" />
        <ToolBtn icon={<Underline size={13} />}     onClick={() => execCmd('underline')}     title="Sublinhado" />
        <ToolBtn icon={<Strikethrough size={13} />} onClick={() => execCmd('strikeThrough')} title="Tachado" />
        <ToolBtn
          icon={<span className="text-[11px] font-bold leading-none">N</span>}
          onClick={() => execCmd('removeFormat')}
          title="Limpar formatação"
        />

        <Sep />

        {/* Listas */}
        <ToolBtn icon={<List size={13} />} onClick={() => execCmd('insertUnorderedList')} title="Lista" />
        <ToolBtn icon={<Code size={13} />} onClick={() => execCmd('formatBlock', 'PRE')} title="Bloco de código" />

        <Sep />

        {/* Paleta de cores de texto */}
        {textPalette.map(color => (
          <button
            key={color.id}
            onMouseDown={(e) => { e.preventDefault(); execCmd('foreColor', color.hex); }}
            title={`Cor: ${color.name}`}
            className="flex flex-col items-center gap-0.5 px-1.5 py-0.5 rounded hover:bg-white/10 transition-colors group"
          >
            <span className="text-[9px] text-slate-500 group-hover:text-slate-400 leading-none">{color.name}</span>
            <span className="w-5 h-2.5 rounded-sm border border-white/10" style={{ backgroundColor: color.hex }} />
          </button>
        ))}

        {/* Editar Cores */}
        <div className="relative ml-1" data-menu>
          <button
            onMouseDown={(e) => { e.preventDefault(); setShowPaletteEditor(p => !p); setShowFontMenu(false); }}
            className={`flex items-center gap-1.5 px-2 py-1 text-[11px] rounded-lg border transition-all ${showPaletteEditor ? 'bg-sky-500/20 border-sky-500/40 text-sky-300' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'}`}
          >
            <PaintBucket size={11} />
            Editar cores
          </button>
          {showPaletteEditor && (
            <ColorPaletteEditor
              palette={textPalette}
              onChange={setTextPalette}
              onClose={() => setShowPaletteEditor(false)}
            />
          )}
        </div>

        {/* Hint */}
        <span className="ml-auto text-[10px] text-slate-600 hidden lg:block pr-1 shrink-0">
          Selecione → <span className="text-sky-500">+</span> para anotar
        </span>
      </div>

      {/* ── Editor Area ──────────────────────────────────────────────────── */}
      <div className="editor-scroll-area relative flex-1 overflow-y-auto custom-scrollbar bg-[#040D17]">
        <div
          ref={editorRef}
          className="min-h-full outline-none font-mono leading-7 text-slate-200 p-6 whitespace-pre-wrap"
          style={{ fontSize: `${fontSize}px`, fontFamily: fontFamily.value }}
          contentEditable
          suppressContentEditableWarning
          spellCheck={false}
          onMouseUp={handleMouseUp}
          onKeyUp={() => setTooltip(null)}
          onInput={(e) => { if (onChange) onChange(e.currentTarget.innerText); }}
        />

        {/* Botão Flutuante LED "+" */}
        {tooltip && (
          <button
            onMouseDown={handleAddAnnotation}
            className="absolute z-50 flex items-center justify-center w-8 h-8 rounded-full
              bg-gradient-to-br from-sky-500 to-indigo-600
              shadow-[0_0_16px_rgba(99,102,241,0.5)]
              hover:scale-110 hover:shadow-[0_0_24px_rgba(99,102,241,0.8)]
              active:scale-95
              border border-indigo-300/30
              transition-all duration-150
              animate-in fade-in zoom-in duration-150"
            style={{ left: tooltip.x, top: tooltip.y }}
            title="Criar anotação para este trecho"
          >
            <Plus className="w-4 h-4 text-white" strokeWidth={2.5} />
          </button>
        )}
      </div>
    </div>
  );
}

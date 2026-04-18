import { useCallback, useEffect, useRef, useState } from "react";
import {
  Bold,
  Check,
  Code,
  Italic,
  List,
  PaintBucket,
  Plus,
  Strikethrough,
  Tag,
  Trash2,
  Underline,
  X,
} from "lucide-react";

const LED_COLORS = [
  { name: "rose", bg: "bg-rose-500", text: "text-rose-300", border: "border-rose-500/60", hex: "#fb7185" },
  { name: "emerald", bg: "bg-emerald-500", text: "text-emerald-300", border: "border-emerald-500/60", hex: "#34d399" },
  { name: "sky", bg: "bg-sky-500", text: "text-sky-300", border: "border-sky-500/60", hex: "#38bdf8" },
  { name: "amber", bg: "bg-amber-500", text: "text-amber-300", border: "border-amber-500/60", hex: "#fbbf24" },
  { name: "violet", bg: "bg-violet-500", text: "text-violet-300", border: "border-violet-500/60", hex: "#a78bfa" },
];

const DEFAULT_TEXT_PALETTE = [
  { id: "padrao", name: "Padrao", hex: "#f1f5f9" },
  { id: "perigo", name: "Perigo", hex: "#ef4444" },
  { id: "sucesso", name: "Sucesso", hex: "#22c55e" },
  { id: "info", name: "Info", hex: "#3b82f6" },
];

const FONT_FAMILIES = [
  { label: "Fira Code", value: "\"Fira Code\", monospace" },
  { label: "JetBrains", value: "\"JetBrains Mono\", monospace" },
  { label: "Monospace", value: "monospace" },
  { label: "Inter", value: "\"Inter\", sans-serif" },
];

const MIN_SIZE = 11;
const MAX_SIZE = 28;
const STORAGE_KEY = "codenlens_text_palette";

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function loadPalette() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_TEXT_PALETTE;
  } catch {
    return DEFAULT_TEXT_PALETTE;
  }
}

function savePalette(palette) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(palette));
}

function ToolBtn({ active = false, icon, onClick, title }) {
  return (
    <button
      type="button"
      onMouseDown={(event) => {
        event.preventDefault();
        onClick();
      }}
      title={title}
      className={`rounded-md border border-transparent px-2 py-2 text-[#a3aac4] transition-all hover:border-[#40485d]/30 hover:bg-[#141f38] hover:text-white ${
        active ? "border-[#69daff]/30 bg-[#141f38] text-white" : ""
      }`}
    >
      {icon}
    </button>
  );
}

function Sep() {
  return <div className="mx-1 h-5 w-px shrink-0 bg-[#40485d]/20" />;
}

function ColorPaletteEditor({ onChange, onClose, palette }) {
  const [localPalette, setLocalPalette] = useState(palette);
  const [newName, setNewName] = useState("");
  const [newHex, setNewHex] = useState("#ffffff");

  const handleAdd = () => {
    if (!newName.trim() || localPalette.length >= 10) return;

    setLocalPalette((current) => [
      ...current,
      { id: String(Date.now()), name: newName.trim().slice(0, 14), hex: newHex },
    ]);
    setNewName("");
    setNewHex("#ffffff");
  };

  const handleSave = () => {
    savePalette(localPalette);
    onChange(localPalette);
    onClose();
  };

  return (
    <div className="absolute right-0 top-full z-[100] mt-2 w-72 overflow-hidden rounded-xl border border-[#40485d]/20 bg-[#0f1930] shadow-2xl shadow-black/60">
      <div className="flex items-center justify-between border-b border-[#40485d]/20 px-4 py-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#a3aac4]">
            Paleta rapida
          </p>
          <p className="text-[10px] text-[#6d758c]">
            MAX 14 CARACTERES - {localPalette.length}/10 cores
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-[#6d758c] transition-colors hover:text-[#dee5ff]"
        >
          <X size={14} />
        </button>
      </div>

      <div className="custom-scrollbar max-h-56 divide-y divide-[#40485d]/10 overflow-y-auto">
        {localPalette.map((color) => (
          <div key={color.id} className="flex items-center gap-2 px-3 py-2">
            <input
              type="color"
              value={color.hex}
              onChange={(event) => {
                const nextHex = event.target.value;
                setLocalPalette((current) => current.map((item) => (
                  item.id === color.id ? { ...item, hex: nextHex } : item
                )));
              }}
              className="h-6 w-6 shrink-0 cursor-pointer rounded border-0 bg-transparent p-0"
              title="Escolher cor"
            />
            <input
              type="text"
              value={color.name}
              maxLength={14}
              onChange={(event) => {
                const nextName = event.target.value.slice(0, 14);
                setLocalPalette((current) => current.map((item) => (
                  item.id === color.id ? { ...item, name: nextName } : item
                )));
              }}
              className="flex-1 rounded border border-[#40485d]/20 bg-[#091328] px-2 py-1 text-xs text-[#dee5ff] focus:border-[#69daff]/40 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => {
                setLocalPalette((current) => current.filter((item) => item.id !== color.id));
              }}
              className="shrink-0 text-[#6d758c] transition-colors hover:text-rose-300"
              title="Remover cor"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>

      {localPalette.length < 10 ? (
        <div className="flex items-center gap-2 border-t border-[#40485d]/20 bg-[#091328] px-3 py-2">
          <input
            type="color"
            value={newHex}
            onChange={(event) => setNewHex(event.target.value)}
            className="h-6 w-6 shrink-0 cursor-pointer rounded border-0 bg-transparent p-0"
            title="Escolher cor"
          />
          <input
            type="text"
            value={newName}
            maxLength={14}
            placeholder="Nome da cor"
            onChange={(event) => setNewName(event.target.value.slice(0, 14))}
            onKeyDown={(event) => {
              if (event.key === "Enter") handleAdd();
            }}
            className="flex-1 rounded border border-[#40485d]/20 bg-[#060e20] px-2 py-1 text-xs text-[#dee5ff] placeholder:text-[#6d758c] focus:border-[#69daff]/40 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={!newName.trim()}
            className="whitespace-nowrap text-[10px] font-semibold text-[#69daff] disabled:cursor-not-allowed disabled:opacity-30"
          >
            + Adicionar
          </button>
        </div>
      ) : null}

      <div className="flex justify-end border-t border-[#40485d]/20 px-3 py-2">
        <button
          type="button"
          onClick={handleSave}
          className="flex items-center gap-1 rounded-lg border border-[#69daff]/30 bg-[#69daff]/10 px-3 py-1 text-xs text-[#69daff] transition-colors hover:bg-[#69daff]/20"
        >
          <Check size={11} />
          Salvar paleta
        </button>
      </div>
    </div>
  );
}

function toEditorHtml(text) {
  if (!text) {
    return "<div><br></div>";
  }

  return text
    .split("\n")
    .map((line) => `<div>${line ? escapeHtml(line) : "<br>"}</div>`)
    .join("");
}

export default function DynamicEditor({
  highlightSpanId,
  initialContent,
  onAddSelection,
  onChange,
  flagsList = [],
  lessonFlags = [],
  onToggleFlag,
  onManageFlags,
}) {
  const editorRef = useRef(null);
  const savedRangeRef = useRef(null);
  // Tracks the last content value that was written to the DOM by an external change
  // (e.g. switching lessons). This prevents the effect from re-rendering when the
  // user is simply typing (which would reset the cursor position).
  const externalContentRef = useRef(null);
  const [tooltip, setTooltip] = useState(null);
  const [fontSize, setFontSize] = useState(14);
  const [fontFamily, setFontFamily] = useState(FONT_FAMILIES[0]);
  const [showFontMenu, setShowFontMenu] = useState(false);
  const [showPaletteEditor, setShowPaletteEditor] = useState(false);
  const [showFlagsMenu, setShowFlagsMenu] = useState(false);
  const [textPalette, setTextPalette] = useState(loadPalette);

  useEffect(() => {
    if (!editorRef.current) return;

    // Only rewrite the DOM when the content truly changed externally
    // (e.g. the user opened a different lesson). If the change came from
    // the user typing, `initialContent` will equal what `onInput` already
    // put in the DOM, so we skip the update to preserve the cursor.
    const guardEqual = initialContent === externalContentRef.current;
    // #region agent log
    fetch("http://127.0.0.1:7248/ingest/ebf8239d-0d53-473f-89d0-8079f8a65d8e", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "836bc4" },
      body: JSON.stringify({
        sessionId: "836bc4",
        runId: "pre-fix",
        hypothesisId: "B",
        location: "DynamicEditor.jsx:initialContent-effect",
        message: guardEqual ? "SKIP innerHTML (guard match)" : "APPLY innerHTML (guard mismatch)",
        data: {
          guardEqual,
          initialLen: (initialContent ?? "").length,
          refLen: (externalContentRef.current ?? "").length,
          initialEndsNewline:
            typeof initialContent === "string" && /\n$/.test(initialContent),
          refEndsNewline:
            typeof externalContentRef.current === "string" &&
            /\n$/.test(externalContentRef.current),
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    if (guardEqual) return;

    externalContentRef.current = initialContent;
    editorRef.current.innerHTML = toEditorHtml(initialContent);
  }, [initialContent]);

  useEffect(() => {
    if (!highlightSpanId) return;

    const target = document.getElementById(highlightSpanId);
    if (!target) return;

    target.scrollIntoView({ behavior: "smooth", block: "center" });

    const originalOutline = target.style.outline;
    const originalBoxShadow = target.style.boxShadow;
    const originalTransition = target.style.transition;

    target.style.transition = "outline 0.15s, box-shadow 0.15s";
    target.style.outline = "2px solid rgba(255,255,255,0.8)";
    target.style.boxShadow = "0 0 16px rgba(255,255,255,0.4)";

    let count = 0;
    const pulse = window.setInterval(() => {
      count += 1;

      if (count % 2 === 0) {
        target.style.outline = "2px solid rgba(255,255,255,0.8)";
        target.style.boxShadow = "0 0 16px rgba(255,255,255,0.4)";
      } else {
        target.style.outline = "2px solid rgba(255,255,255,0.2)";
        target.style.boxShadow = "0 0 4px rgba(255,255,255,0.1)";
      }

      if (count >= 6) {
        clearInterval(pulse);
        target.style.outline = originalOutline;
        target.style.boxShadow = originalBoxShadow;
        target.style.transition = originalTransition;
      }
    }, 300);

    return () => clearInterval(pulse);
  }, [highlightSpanId]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!event.target.closest("[data-editor-menu]")) {
        setShowFontMenu(false);
        setShowPaletteEditor(false);
        setShowFlagsMenu(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const execCmd = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const changeFontSize = (delta) => {
    const next = Math.min(MAX_SIZE, Math.max(MIN_SIZE, fontSize + delta));
    setFontSize(next);
    if (editorRef.current) {
      editorRef.current.style.fontSize = `${next}px`;
    }
  };

  const handleMouseUp = useCallback(() => {
    requestAnimationFrame(() => {
      const selection = window.getSelection();
      const text = selection?.toString().trim();

      if (!text || !selection?.rangeCount || !editorRef.current) {
        setTooltip(null);
        return;
      }

      const range = selection.getRangeAt(0);
      savedRangeRef.current = range.cloneRange();

      const rangeRect = range.getBoundingClientRect();
      const containerRect = editorRef.current
        .closest(".editor-scroll-area")
        ?.getBoundingClientRect();

      if (!containerRect) {
        setTooltip(null);
        return;
      }

      setTooltip({
        x: rangeRect.right - containerRect.left + 8,
        y: rangeRect.top - containerRect.top + rangeRect.height / 2 - 16,
      });
    });
  }, []);

  const handleAddAnnotation = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();

    const range = savedRangeRef.current;
    if (!range) return;

    const text = range.toString().trim();
    if (!text || !editorRef.current) return;

    const ledColor = LED_COLORS[Math.floor(Math.random() * LED_COLORS.length)];
    const spanId = `led-${Date.now()}`;
    const selection = window.getSelection();

    selection.removeAllRanges();
    selection.addRange(range);

    const spanHtml = `<span id="${spanId}" style="background-color:${ledColor.hex}22;color:${ledColor.hex};border-bottom:2px solid ${ledColor.hex};border-radius:3px;padding:0 3px;cursor:pointer;transition:box-shadow 0.2s;">${escapeHtml(text)}</span>`;

    document.execCommand("insertHTML", false, spanHtml);

    if (onAddSelection) {
      onAddSelection(text, ledColor, spanId);
    }

    if (onChange) {
      onChange(editorRef.current.innerText);
    }

    savedRangeRef.current = null;
    selection.removeAllRanges();
    setTooltip(null);
  }, [onAddSelection, onChange]);

  return (
    <div className="relative flex h-full w-full flex-col">
      <div className="flex shrink-0 flex-wrap items-center gap-1 border-b border-[#40485d]/10 bg-[#0f1930] px-3 py-3">
        <button
          type="button"
          onMouseDown={(event) => {
            event.preventDefault();
            changeFontSize(-1);
          }}
          className="rounded-md px-2 py-1.5 text-xs font-bold text-[#a3aac4] transition-colors hover:bg-[#141f38] hover:text-white"
          title="Diminuir fonte"
        >
          A-
        </button>

        <span className="min-w-[34px] text-center text-[10px] text-[#6d758c]">
          {fontSize}px
        </span>

        <button
          type="button"
          onMouseDown={(event) => {
            event.preventDefault();
            changeFontSize(1);
          }}
          className="rounded-md px-2 py-1.5 text-xs font-bold text-[#a3aac4] transition-colors hover:bg-[#141f38] hover:text-white"
          title="Aumentar fonte"
        >
          A+
        </button>

        <Sep />

        <div className="relative" data-editor-menu>
          <button
            type="button"
            onMouseDown={(event) => {
              event.preventDefault();
              setShowFontMenu((current) => !current);
              setShowPaletteEditor(false);
            }}
            className="flex items-center gap-1 rounded-md px-2 py-1.5 text-[11px] text-[#dee5ff] transition-colors hover:bg-[#141f38]"
          >
            {fontFamily.label}
            <svg className="h-3 w-3 text-[#6d758c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showFontMenu ? (
            <div className="absolute left-0 top-full z-50 mt-2 min-w-[140px] overflow-hidden rounded-lg border border-[#40485d]/20 bg-[#0f1930] shadow-xl">
              {FONT_FAMILIES.map((family) => (
                <button
                  key={family.value}
                  type="button"
                  onMouseDown={(event) => {
                    event.preventDefault();
                    setFontFamily(family);
                    if (editorRef.current) {
                      editorRef.current.style.fontFamily = family.value;
                    }
                    setShowFontMenu(false);
                  }}
                  className={`w-full px-3 py-2 text-left text-xs transition-colors hover:bg-[#141f38] ${
                    fontFamily.value === family.value ? "text-[#69daff]" : "text-[#dee5ff]"
                  }`}
                >
                  {family.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <Sep />

        <ToolBtn icon={<Bold size={13} />} onClick={() => execCmd("bold")} title="Negrito" />
        <ToolBtn icon={<Italic size={13} />} onClick={() => execCmd("italic")} title="Italico" />
        <ToolBtn icon={<Underline size={13} />} onClick={() => execCmd("underline")} title="Sublinhado" />
        <ToolBtn icon={<Strikethrough size={13} />} onClick={() => execCmd("strikeThrough")} title="Tachado" />
        <ToolBtn
          icon={<span className="text-[11px] font-bold leading-none">N</span>}
          onClick={() => execCmd("removeFormat")}
          title="Limpar formatacao"
        />

        <Sep />

        <ToolBtn icon={<List size={13} />} onClick={() => execCmd("insertUnorderedList")} title="Lista" />
        <ToolBtn icon={<Code size={13} />} onClick={() => execCmd("formatBlock", "PRE")} title="Bloco de codigo" />

        <Sep />

        {textPalette.map((color) => (
          <button
            key={color.id}
            type="button"
            onMouseDown={(event) => {
              event.preventDefault();
              execCmd("foreColor", color.hex);
            }}
            title={`Cor: ${color.name}`}
            className="group flex flex-col items-center gap-0.5 rounded-md px-1.5 py-1 transition-colors hover:bg-[#141f38]"
          >
            <span className="leading-none text-[9px] text-[#6d758c] group-hover:text-[#a3aac4]">
              {color.name}
            </span>
            <span className="h-2.5 w-5 rounded-sm border border-white/10" style={{ backgroundColor: color.hex }} />
          </button>
        ))}

        <div className="relative ml-1" data-editor-menu>
          <button
            type="button"
            onMouseDown={(event) => {
              event.preventDefault();
              setShowPaletteEditor((current) => !current);
              setShowFontMenu(false);
            }}
            className={`flex items-center gap-1.5 rounded-lg border px-2 py-1.5 text-[11px] transition-all ${
              showPaletteEditor
                ? "border-[#69daff]/30 bg-[#69daff]/10 text-[#69daff]"
                : "border-[#40485d]/20 bg-[#141f38] text-[#a3aac4] hover:text-white"
            }`}
          >
            <PaintBucket size={11} />
            Editar cores
          </button>

          {showPaletteEditor ? (
            <ColorPaletteEditor
              palette={textPalette}
              onChange={setTextPalette}
              onClose={() => setShowPaletteEditor(false)}
            />
          ) : null}
        </div>

        <Sep />

        <div className="relative ml-1" data-editor-menu>
          <button
            type="button"
            onMouseDown={(event) => {
              event.preventDefault();
              setShowFlagsMenu((current) => !current);
              setShowFontMenu(false);
              setShowPaletteEditor(false);
            }}
            className={`flex items-center gap-1.5 rounded-lg border px-2 py-1.5 text-[11px] transition-all ${
              showFlagsMenu
                ? "border-[#69daff]/30 bg-[#69daff]/10 text-[#69daff]"
                : "border-[#40485d]/20 bg-[#141f38] text-[#a3aac4] hover:text-white"
            }`}
          >
            <Tag size={11} />
            {lessonFlags.length > 0 ? `${lessonFlags.length} Flags` : "Flags"}
          </button>

          {showFlagsMenu ? (
            <div className="absolute right-0 top-full z-[100] mt-2 w-56 overflow-hidden rounded-xl border border-[#40485d]/20 bg-[#0f1930] shadow-2xl shadow-black/60 flex flex-col max-h-72">
              <div className="flex items-center justify-between border-b border-[#40485d]/20 px-4 py-3 bg-[#091328]">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#a3aac4]">
                  Vincular Flags
                </p>
                <button type="button" onClick={() => setShowFlagsMenu(false)} className="text-[#6d758c] hover:text-[#dee5ff] transition-colors"><X size={14} /></button>
              </div>

              <div className="custom-scrollbar overflow-y-auto flex-1 p-2 space-y-1">
                {flagsList.map(flag => {
                  const isActive = lessonFlags.includes(flag.id);
                  return (
                    <button
                      key={flag.id}
                      type="button"
                      onMouseDown={(event) => {
                        event.preventDefault();
                        if (onToggleFlag) onToggleFlag(flag.id);
                      }}
                      className={`flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-xs transition-colors hover:bg-[#141f38] ${isActive ? "bg-[#141f38]/60" : ""}`}
                    >
                      <div className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: flag.color, opacity: isActive ? 1 : 0.4 }} />
                      <span className={`truncate flex-1 font-['Manrope'] ${isActive ? "text-[#dee5ff] font-bold" : "text-[#a3aac4]"}`}>
                        {flag.name}
                      </span>
                      {isActive && <Check size={12} className="text-[#69daff]" />}
                    </button>
                  );
                })}

                {flagsList.length === 0 && (
                  <p className="text-xs text-[#6d758c] text-center py-4">Nenhuma flag criada.</p>
                )}
              </div>

              <div className="bg-[#091328] p-2 border-t border-[#40485d]/20">
                <button
                  type="button"
                  onMouseDown={(event) => {
                    event.preventDefault();
                    setShowFlagsMenu(false);
                    if (onManageFlags) onManageFlags();
                  }}
                  className="flex w-full items-center justify-center gap-1 rounded-md bg-[#69daff]/10 py-1.5 text-xs font-bold text-[#69daff] transition-colors hover:bg-[#69daff]/20"
                >
                  <Plus size={12} />
                  Nova Flag
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="editor-scroll-area custom-scrollbar relative flex-1 overflow-y-auto bg-[#091328]">
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          spellCheck={false}
          onMouseUp={handleMouseUp}
          onKeyUp={() => setTooltip(null)}
          onInput={(event) => {
            const text = event.currentTarget.innerText;
            // Keep the ref in sync so the effect guard doesn't trigger a
            // DOM re-render (which would reset the cursor) when the parent
            // propagates this same value back through `initialContent`.
            externalContentRef.current = text;
            // #region agent log
            fetch("http://127.0.0.1:7248/ingest/ebf8239d-0d53-473f-89d0-8079f8a65d8e", {
              method: "POST",
              headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "836bc4" },
              body: JSON.stringify({
                sessionId: "836bc4",
                runId: "pre-fix",
                hypothesisId: "C",
                location: "DynamicEditor.jsx:onInput",
                message: "input: innerText length + tail sample",
                data: {
                  len: text.length,
                  tail: text.slice(-24),
                  endsNewline: /\n$/.test(text),
                },
                timestamp: Date.now(),
              }),
            }).catch(() => {});
            // #endregion
            if (onChange) {
              onChange(text);
            }
          }}
          onKeyDown={(event) => {
            // Ctrl+T or Cmd+T to select all text
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 't') {
              event.preventDefault();
              const range = document.createRange();
              range.selectNodeContents(editorRef.current);
              const selection = window.getSelection();
              selection.removeAllRanges();
              selection.addRange(range);
            }
          }}
          className="min-h-full whitespace-pre-wrap p-6 font-mono leading-7 text-[#dee5ff] outline-none"
          style={{ fontFamily: fontFamily.value, fontSize: `${fontSize}px` }}
        />

        {tooltip ? (
          <button
            type="button"
            onMouseDown={handleAddAnnotation}
            title="Criar anotacao para este trecho"
            style={{ left: tooltip.x, top: tooltip.y }}
            className="absolute z-50 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-[#69daff] text-white shadow-[0_0_18px_rgba(105,218,255,0.35)] transition-all duration-150 hover:scale-110 hover:shadow-[0_0_24px_rgba(105,218,255,0.55)] active:scale-95"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
          </button>
        ) : null}
      </div>
    </div>
  );
}

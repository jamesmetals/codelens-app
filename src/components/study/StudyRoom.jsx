import { useState, useCallback } from "react";
import {
  ArrowLeft, BookOpen, MessageSquareText, Save, Wand2,
  TerminalSquare, Sparkles, Loader2, X
} from "lucide-react";
import DynamicEditor from "./DynamicEditor";

// ─── Geração de Resumo ────────────────────────────────────────────────────────
// Em produção: chama a Vercel Serverless Function `/api/generate-summary`.
// Em dev local: usa VITE_GROQ_API_KEY do .env (key só no servidor de dev, não vai ao bundle).
async function fetchSummary(title, code) {
  // Fallback para desenvolvimento local com Vite
  if (import.meta.env.DEV && import.meta.env.VITE_GROQ_API_KEY) {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'Você é um assistente técnico de estudos. Responda SEMPRE em português brasileiro. Seja objetivo e técnico.' },
          { role: 'user', content: `Escreva um resumo técnico e objetivo de 1 a 2 frases.\nTítulo: "${title}"\nConteúdo:\n${code.slice(0, 3000)}\n\nResponda APENAS com o texto do resumo, sem prefixos.` },
        ],
        max_tokens: 200,
        temperature: 0.4,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `Erro ${res.status}`);
    }
    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() ?? '';
  }

  // Produção: chama a Vercel Serverless Function (key segura no servidor)
  const res = await fetch('/api/generate-summary', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, code }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || `Erro ${res.status}`);
  }

  const data = await res.json();
  return data.summary ?? '';
}

// ─── StudyRoom ────────────────────────────────────────────────────────────────
export default function StudyRoom({ activeTechnology, activeLesson, onBack, onOpenDevBrief, onUpdateContent }) {
  const [localTitle, setLocalTitle] = useState(activeLesson?.title || "");
  const [localSummary, setLocalSummary] = useState(activeLesson?.summary || "");
  const [currentCode, setCurrentCode] = useState(activeLesson?.fullCode || "");
  const [notes, setNotes] = useState(activeLesson?.studyNotes || []);
  const [activeSpanId, setActiveSpanId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState("");

  // IA state
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState("");

  const handleSave = async () => {
    setIsSaving(true);
    setSaveFeedback("");
    try {
      const result = await onUpdateContent({
        ...activeLesson,
        title: localTitle,
        summary: localSummary,
        fullCode: currentCode,
        studyNotes: notes,
        highlights: notes.map((n) => n.codeSnippet).filter(Boolean).slice(0, 3),
      });
      setSaveFeedback(result?.location === "cloud" ? "Salvo na sua conta Google." : "Salvo localmente neste dispositivo.");
    } catch (error) {
      setSaveFeedback(error.message || "Falha ao salvar o conteudo.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateSummary = async () => {
    if (!currentCode.trim() && !localTitle.trim()) {
      setAiError("Adicione algum conteúdo ou título antes de gerar.");
      return;
    }
    setIsGenerating(true);
    setAiError("");
    try {
      const summary = await fetchSummary(localTitle, currentCode || localTitle);
      setLocalSummary(summary);
    } catch (e) {
      setAiError(e.message || "Erro ao gerar resumo.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddAnnotation = useCallback((textSnippet, ledColor, spanId) => {
    setNotes((prev) => [
      {
        id: Date.now(),
        spanId,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        content: "",
        codeSnippet: textSnippet,
        led: ledColor,
        isNew: true,
      },
      ...prev,
    ]);
  }, []);

  const updateNoteText = (id, newText) =>
    setNotes((prev) =>
      prev.map((note) => (note.id === id ? { ...note, content: newText, isNew: false } : note))
    );

  const handleNoteClick = (spanId) => {
    setActiveSpanId(null);
    requestAnimationFrame(() => setActiveSpanId(spanId));
  };

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden bg-[#06111f] animate-fade-in relative z-10 w-full">

      {/* ── Navbar ── */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-white/10 bg-[#0B1D35]/50 backdrop-blur-md shrink-0">
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
              <p className="text-sm font-semibold text-white truncate max-w-[320px]">
                {localTitle || "Sem título"}
              </p>
              <p className="text-[10px] uppercase tracking-wider text-slate-400">
                {activeTechnology.name} Bootcamp
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {saveFeedback ? (
            <p className="hidden text-[11px] text-slate-400 sm:block">{saveFeedback}</p>
          ) : null}

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 px-3 py-1.5 rounded-lg font-medium text-xs hover:bg-emerald-500/20 transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            {isSaving ? "Salvando..." : "Salvar"}
          </button>

          <button
            onClick={() => onOpenDevBrief(currentCode)}
            className="flex items-center gap-2 bg-gradient-to-r from-sky-500/20 to-sky-400/10 border border-sky-400/30 text-sky-300 px-4 py-1.5 rounded-full font-medium text-sm hover:bg-sky-500/30 transition-colors"
          >
            <Wand2 className="h-4 w-4" />
            Análise Assistida
          </button>
        </div>
      </header>

      {/* ── Área Principal ── */}
      <main className="flex-1 flex overflow-hidden">

        {/* Painel Esquerdo: Metadados + Editor */}
        <div className="flex-1 flex flex-col border-r border-white/10 bg-[#040D17] overflow-hidden min-w-0">

          {/* ── Seção de Metadados ─────────────────────────────────────── */}
          <div className="shrink-0 px-6 pt-5 pb-4 border-b border-white/5 bg-[#05101e] space-y-4">

            {/* Título */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">
                  Título do Conteúdo
                </label>
                <span className="text-[10px] text-sky-500 font-medium">Essencial</span>
              </div>
              <input
                type="text"
                value={localTitle}
                onChange={(e) => setLocalTitle(e.target.value)}
                placeholder="Ex: useEffect e o ciclo de sincronização"
                className="w-full bg-black/30 border border-white/8 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-sky-500/40 focus:bg-black/50 transition-all"
              />
            </div>

            {/* Resumo */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">
                  Resumo
                </label>
                <button
                  onClick={handleGenerateSummary}
                  disabled={isGenerating}
                  className="flex items-center gap-1.5 text-[11px] text-sky-400 hover:text-sky-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors group"
                >
                  {isGenerating ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Sparkles className="h-3 w-3 group-hover:scale-110 transition-transform" />
                  )}
                  {isGenerating ? "Gerando..." : "Gerar resumo com IA"}
                </button>
              </div>

              <textarea
                value={localSummary}
                onChange={(e) => setLocalSummary(e.target.value)}
                placeholder="Uma síntese do que você aprendeu neste bloco..."
                rows={3}
                className="w-full bg-black/30 border border-white/8 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 resize-none focus:outline-none focus:border-sky-500/40 focus:bg-black/50 transition-all custom-scrollbar"
              />

              {aiError && (
                <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                  <X className="h-3 w-3" /> {aiError}
                </p>
              )}
            </div>
          </div>

          {/* ── Editor ─────────────────────────────────────────────────── */}
          <div className="flex items-center justify-between px-4 py-2 bg-black/40 border-b border-white/5 shrink-0">
            <div className="flex items-center gap-2">
              <TerminalSquare className="h-3.5 w-3.5 text-slate-500" />
              <span className="text-[11px] font-mono text-slate-400">editor</span>
            </div>
            <span className="text-[10px] text-slate-600 italic">
              Selecione qualquer trecho para criar uma anotação vinculada
            </span>
          </div>

          <div className="flex-1 overflow-hidden relative min-h-0">
            <DynamicEditor
              initialContent={currentCode}
              onAddSelection={handleAddAnnotation}
              onChange={setCurrentCode}
              highlightSpanId={activeSpanId}
            />
            <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-sky-500/5 blur-[120px] pointer-events-none rounded-full" />
          </div>
        </div>

        {/* ── Painel de Anotações ──────────────────────────────────────── */}
        <aside className="w-[330px] shrink-0 bg-[#0B1D35]/30 flex flex-col shadow-[-10px_0_30px_rgba(0,0,0,0.2)]">
          <div className="p-4 border-b border-white/5 bg-black/20 flex items-center gap-2 shrink-0">
            <MessageSquareText className="h-4 w-4 text-slate-400" />
            <h3 className="text-sm font-semibold text-slate-200">Anotações Conectadas</h3>
            {notes.length > 0 && (
              <span className="ml-auto text-[10px] text-slate-500 bg-white/5 px-1.5 py-0.5 rounded">
                {notes.length}
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
            {notes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onTextChange={updateNoteText}
                onHighlight={() => note.spanId && handleNoteClick(note.spanId)}
              />
            ))}

            {notes.length === 0 && (
              <div className="text-center p-8 opacity-40 flex flex-col items-center gap-3">
                <TerminalSquare className="h-8 w-8 text-slate-400" />
                <p className="text-xs text-slate-400">
                  Selecione no código ao lado para começar anotar.
                </p>
              </div>
            )}
          </div>
        </aside>
      </main>
    </div>
  );
}

// ─── NoteCard ─────────────────────────────────────────────────────────────────
function NoteCard({ note, onTextChange, onHighlight }) {
  const hasSpan = Boolean(note.spanId);

  return (
    <div
      className={`bg-white/5 border rounded-xl overflow-hidden transition-all duration-300 group/card ${
        note.isNew ? "ring-1 ring-white/20 border-white/20" : "border-white/10"
      }`}
    >
      <div className={`h-1 w-full ${note.led?.bg || "bg-slate-500"}`} />

      <div className="p-3">
        <div className="flex justify-between items-center mb-2">
          <p className="text-[9px] uppercase tracking-wider text-slate-500 bg-black/40 px-2 py-0.5 rounded-sm">
            {note.time}
          </p>
          <div className="flex items-center gap-1.5">
            {hasSpan && (
              <button
                onClick={onHighlight}
                title="Destacar trecho no editor"
                className="opacity-0 group-hover/card:opacity-100 flex items-center gap-1 text-[9px] text-slate-400 hover:text-sky-300 transition-all px-1.5 py-0.5 rounded bg-white/5 hover:bg-sky-500/10 border border-transparent hover:border-sky-500/30"
              >
                <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                ver no código
              </button>
            )}
            <div className={`w-2 h-2 rounded-full ${note.led?.bg} ${note.isNew ? "animate-pulse" : ""}`} />
          </div>
        </div>

        {note.codeSnippet && (
          <div
            onClick={onHighlight}
            className={`bg-[#030912] border rounded-lg p-2.5 mb-2.5 ${note.led?.border || "border-white/5"} ${
              hasSpan ? "cursor-pointer hover:border-opacity-80 transition-colors" : ""
            }`}
            title={hasSpan ? "Clique para destacar no editor" : ""}
          >
            <pre
              className={`font-mono whitespace-pre-wrap text-[11px] leading-relaxed ${
                note.led?.text || "text-slate-300"
              }`}
            >
              {note.codeSnippet}
            </pre>
          </div>
        )}

        <textarea
          value={note.content}
          onChange={(e) => onTextChange(note.id, e.target.value)}
          placeholder="Suas conclusões sobre esse código..."
          className="w-full text-xs text-slate-200 bg-transparent border-none resize-none focus:ring-0 focus:outline-none p-0 custom-scrollbar placeholder:text-slate-600"
          rows={note.content ? undefined : 2}
          style={{ minHeight: "2.5rem" }}
        />
      </div>
    </div>
  );
}

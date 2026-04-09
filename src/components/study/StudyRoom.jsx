import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  BookMarked,
  ChevronLeft,
  ChevronRight,
  Code2,
  Loader2,
  MessageSquareText,
  Save,
  Sparkles,
  Wand2,
  X,
} from "lucide-react";

import DynamicEditor from "./DynamicEditor";

async function fetchSummary(title, code) {
  if (import.meta.env.DEV && import.meta.env.VITE_GROQ_API_KEY) {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: "Voce e um assistente tecnico de estudos. Responda sempre em portugues brasileiro. Seja objetivo e tecnico.",
          },
          {
            role: "user",
            content: `Escreva um resumo tecnico e objetivo de 1 a 2 frases.\nTitulo: "${title}"\nConteudo:\n${code.slice(0, 3000)}\n\nResponda apenas com o texto do resumo, sem prefixos.`,
          },
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
    return data.choices?.[0]?.message?.content?.trim() ?? "";
  }

  const res = await fetch("/api/generate-summary", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, code }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || `Erro ${res.status}`);
  }

  const data = await res.json();
  return data.summary ?? "";
}

function GoogleMark({ className = "" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M21.805 10.023H12.24v3.955h5.478c-.236 1.274-.955 2.353-2.032 3.079v2.56h3.294c1.929-1.776 3.04-4.395 3.04-7.305 0-.691-.06-1.363-.215-2.289Z"
        fill="#4285F4"
      />
      <path
        d="M12.24 22c2.743 0 5.045-.907 6.727-2.383l-3.294-2.56c-.907.611-2.068.974-3.433.974-2.652 0-4.903-1.79-5.711-4.2H3.131v2.64A10.16 10.16 0 0 0 12.24 22Z"
        fill="#34A853"
      />
      <path
        d="M6.529 13.83a6.107 6.107 0 0 1 0-3.858V7.332H3.131a10.16 10.16 0 0 0 0 9.139l3.398-2.64Z"
        fill="#FBBC04"
      />
      <path
        d="M12.24 5.79c1.494 0 2.82.514 3.865 1.523l2.897-2.897C17.28 2.81 14.979 2 12.24 2A10.16 10.16 0 0 0 3.131 7.332l3.398 2.64c.808-2.41 3.06-4.182 5.711-4.182Z"
        fill="#EA4335"
      />
    </svg>
  );
}

function getAvatarUrl(authUser) {
  return String(
    authUser?.user_metadata?.avatar_url
      || authUser?.user_metadata?.picture
      || authUser?.user_metadata?.photo_url
      || "",
  ).trim();
}

function getAvatarFallback(authUser) {
  const source = String(
    authUser?.user_metadata?.full_name
      || authUser?.user_metadata?.name
      || authUser?.email
      || "C",
  ).trim();

  return source.charAt(0).toUpperCase() || "C";
}

function NoteCard({ note, onHighlight, onTextChange }) {
  const hasSpan = Boolean(note.spanId);

  return (
    <article
      className={`overflow-hidden rounded-xl border bg-[#141f38] transition-colors ${
        note.isNew ? "border-white/20" : "border-[#40485d]/20"
      }`}
    >
      <div className={`h-1 w-full ${note.led?.bg || "bg-slate-500"}`} />

      <div className="p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="rounded bg-black/20 px-2 py-1 font-['Manrope'] text-[10px] uppercase tracking-[0.18em] text-[#6d758c]">
            {note.time}
          </span>

          {hasSpan ? (
            <button
              type="button"
              onClick={onHighlight}
              className="font-['Manrope'] text-[10px] font-bold uppercase tracking-[0.16em] text-[#69daff] transition-colors hover:text-white"
            >
              Ver no codigo
            </button>
          ) : null}
        </div>

        {note.codeSnippet ? (
          <button
            type="button"
            onClick={onHighlight}
            className={`mb-3 block w-full rounded-lg border bg-[#060e20] p-3 text-left ${note.led?.border || "border-white/10"}`}
          >
            <pre className={`whitespace-pre-wrap font-mono text-[11px] leading-6 ${note.led?.text || "text-slate-200"}`}>
              {note.codeSnippet}
            </pre>
          </button>
        ) : null}

        <textarea
          value={note.content}
          onChange={(event) => onTextChange(note.id, event.target.value)}
          placeholder="Suas conclusoes sobre esse trecho..."
          className="min-h-[72px] w-full resize-none rounded-lg border border-[#40485d]/20 bg-[#060e20] p-3 text-sm text-[#dee5ff] placeholder:text-[#6d758c] focus:border-[#69daff]/40 focus:outline-none"
        />
      </div>
    </article>
  );
}

export default function StudyRoom({
  activeTechnology,
  activeLesson,
  authUser,
  onBack,
  onOpenAccount,
  onOpenDevBrief,
  onSignInWithGoogle,
  onUpdateContent,
  supabaseConfigured,
}) {
  const [localTitle, setLocalTitle] = useState(activeLesson?.title || "");
  const [localSummary, setLocalSummary] = useState(activeLesson?.summary || "");
  const [currentCode, setCurrentCode] = useState(activeLesson?.fullCode || "");
  const [notes, setNotes] = useState(activeLesson?.studyNotes || []);
  const [activeSpanId, setActiveSpanId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState("");
  const [notesCollapsed, setNotesCollapsed] = useState(false);

  const isLogged = Boolean(authUser);
  const avatarUrl = getAvatarUrl(authUser);

  useEffect(() => {
    setLocalTitle(activeLesson?.title || "");
    setLocalSummary(activeLesson?.summary || "");
    setCurrentCode(activeLesson?.fullCode || "");
    setNotes(activeLesson?.studyNotes || []);
    setActiveSpanId(null);
    setSaveFeedback("");
    setAiError("");
  }, [activeLesson]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveFeedback("");

    try {
      const result = await onUpdateContent({
        ...(activeLesson || {}),
        title: localTitle,
        summary: localSummary,
        fullCode: currentCode,
        studyNotes: notes,
        highlights: notes.map((note) => note.codeSnippet).filter(Boolean).slice(0, 3),
      });

      setSaveFeedback(
        result?.location === "cloud"
          ? "Salvo na sua conta Google."
          : "Salvo localmente neste dispositivo.",
      );
    } catch (error) {
      setSaveFeedback(error.message || "Falha ao salvar o conteudo.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateSummary = async () => {
    if (!currentCode.trim() && !localTitle.trim()) {
      setAiError("Adicione algum conteudo ou titulo antes de gerar.");
      return;
    }

    setIsGenerating(true);
    setAiError("");

    try {
      const summary = await fetchSummary(localTitle, currentCode || localTitle);
      setLocalSummary(summary);
    } catch (error) {
      setAiError(error.message || "Erro ao gerar resumo.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddAnnotation = useCallback((textSnippet, ledColor, spanId) => {
    setNotes((current) => [
      {
        id: Date.now(),
        spanId,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        content: "",
        codeSnippet: textSnippet,
        led: ledColor,
        isNew: true,
      },
      ...current,
    ]);
  }, []);

  const updateNoteText = (id, newText) => {
    setNotes((current) => current.map((note) => (
      note.id === id ? { ...note, content: newText, isNew: false } : note
    )));
  };

  const handleNoteClick = (spanId) => {
    setActiveSpanId(null);
    requestAnimationFrame(() => setActiveSpanId(spanId));
  };

  return (
    <div className="relative min-h-screen bg-[#060e20] text-[#dee5ff]">
      <div className="fixed inset-0 bg-[#060e20]" />

      <header className="fixed top-0 z-50 flex h-16 w-full items-center justify-between border-b border-[#40485d]/10 bg-[#060e20]/85 px-4 backdrop-blur-md sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#40485d]/20 bg-[#141f38] text-[#a3aac4] transition-colors hover:text-white"
            aria-label="Voltar"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <div className="hidden h-10 w-px bg-[#40485d]/20 sm:block" />

          <BookMarked className="hidden h-5 w-5 text-[#69daff] sm:block" />

          <div className="min-w-0">
            <p className="truncate font-['Manrope'] text-lg font-bold text-[#dee5ff]">
              {localTitle || "Sem titulo"}
            </p>
            <p className="mt-1 font-['Manrope'] text-[10px] uppercase tracking-[0.24em] text-[#a3aac4]">
              Biblioteca {activeTechnology?.name || "Tecnologia"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-x-3 sm:gap-x-4">
          {saveFeedback ? (
            <p className="hidden max-w-[220px] truncate text-xs text-[#a3aac4] xl:block">
              {saveFeedback}
            </p>
          ) : null}

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-md border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 font-['Manrope'] text-sm font-bold text-emerald-300 transition-colors hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isSaving ? "Salvando..." : "Salvar"}
          </button>

          <button
            type="button"
            onClick={() => onOpenDevBrief(currentCode)}
            className="hidden items-center gap-2 rounded-full border border-[#69daff]/30 bg-[#69daff]/10 px-4 py-2 font-['Manrope'] text-sm font-bold text-[#69daff] transition-colors hover:bg-[#69daff]/20 sm:inline-flex"
          >
            <Wand2 className="h-4 w-4" />
            Analise Assistida
          </button>

          {isLogged ? (
            <button
              type="button"
              onClick={onOpenAccount}
              className="h-8 w-8 overflow-hidden rounded-full border border-[#40485d]/30"
              aria-label="Abrir conta"
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Avatar da conta"
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center bg-[#141f38] text-xs font-semibold text-[#dee5ff]">
                  {getAvatarFallback(authUser)}
                </span>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={onSignInWithGoogle}
              disabled={!supabaseConfigured}
              className="inline-flex items-center gap-2 rounded-md border border-[#40485d]/30 bg-[#141f38] px-3 py-2 font-['Manrope'] text-xs font-bold text-[#dee5ff] transition-colors hover:border-[#69daff]/40 hover:text-[#69daff] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <GoogleMark className="h-4 w-4" />
              Entrar com Google
            </button>
          )}
        </div>
      </header>

      <main className="relative z-10 min-h-screen bg-[#060e20] px-4 pb-10 pt-20 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start">
          <div className="min-w-0 flex-1 space-y-6">
            <section className="rounded-xl border border-[#40485d]/10 bg-[#0f1930] p-6">
              <div className="space-y-5">
                <div>
                  <div className="mb-2 flex items-center justify-between gap-4">
                    <label className="font-['Manrope'] text-[10px] font-bold uppercase tracking-[0.24em] text-[#6d758c]">
                      Titulo do conteudo
                    </label>
                    <span className="font-['Manrope'] text-[10px] font-bold uppercase tracking-[0.18em] text-[#69daff]">
                      Essencial
                    </span>
                  </div>
                  <input
                    type="text"
                    value={localTitle}
                    onChange={(event) => setLocalTitle(event.target.value)}
                    className="w-full rounded-lg border border-[#40485d]/20 bg-black/20 px-4 py-3 text-sm text-[#dee5ff] placeholder:text-[#6d758c] focus:border-[#69daff]/40 focus:outline-none"
                  />
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between gap-4">
                    <label className="font-['Manrope'] text-[10px] font-bold uppercase tracking-[0.24em] text-[#6d758c]">
                      Resumo
                    </label>
                    <button
                      type="button"
                      onClick={handleGenerateSummary}
                      disabled={isGenerating}
                      className="inline-flex items-center gap-2 font-['Manrope'] text-[11px] font-bold text-[#69daff] transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isGenerating ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="h-3.5 w-3.5" />
                      )}
                      {isGenerating ? "Gerando..." : "Gerar resumo com IA"}
                    </button>
                  </div>

                  <textarea
                    value={localSummary}
                    onChange={(event) => setLocalSummary(event.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-[#40485d]/20 bg-black/20 px-4 py-3 text-sm leading-7 text-[#dee5ff] placeholder:text-[#6d758c] focus:border-[#69daff]/40 focus:outline-none"
                  />

                  {aiError ? (
                    <p className="mt-2 inline-flex items-center gap-2 text-xs text-rose-300">
                      <X className="h-3.5 w-3.5" />
                      {aiError}
                    </p>
                  ) : null}
                </div>
              </div>
            </section>

            <section className="overflow-hidden rounded-xl border border-[#40485d]/10 bg-[#0f1930]">
              <div className="flex items-center justify-between border-b border-[#40485d]/10 bg-[#091328] px-4 py-3">
                <div className="flex items-center gap-2">
                  <Code2 className="h-4 w-4 text-[#a3aac4]" />
                  <span className="font-mono text-[11px] text-[#a3aac4]">editor</span>
                </div>

                <span className="hidden text-[10px] italic text-[#6d758c] lg:block">
                  Selecione qualquer trecho para criar uma anotacao vinculada
                </span>
              </div>

              <div className="h-[calc(100vh-23rem)] min-h-[420px]">
                <DynamicEditor
                  initialContent={currentCode}
                  onAddSelection={handleAddAnnotation}
                  onChange={setCurrentCode}
                  highlightSpanId={activeSpanId}
                />
              </div>
            </section>
          </div>

          <aside className={`order-last shrink-0 xl:sticky xl:top-20 xl:h-[calc(100vh-6.5rem)] ${notesCollapsed ? "xl:w-20" : "xl:w-[340px]"}`}>
            <section className="flex h-full overflow-hidden rounded-xl border border-[#40485d]/10 bg-[#0f1930]">
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-center gap-3 border-b border-[#40485d]/10 bg-[#091328] px-5 py-4">
                  <MessageSquareText className="h-4 w-4 text-[#a3aac4]" />
                  {!notesCollapsed ? (
                    <h3 className="font-['Manrope'] text-lg font-bold text-[#dee5ff]">
                      Anotacoes conectadas
                    </h3>
                  ) : null}
                  {notes.length ? (
                    <span className={`${notesCollapsed ? "" : "ml-auto"} rounded bg-black/20 px-2 py-1 font-['Manrope'] text-[10px] font-bold uppercase tracking-[0.16em] text-[#a3aac4]`}>
                      {notes.length}
                    </span>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => setNotesCollapsed((current) => !current)}
                    className={`${notesCollapsed ? "ml-auto" : ""} inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#40485d]/20 bg-[#141f38] text-[#a3aac4] transition-colors hover:text-white`}
                    aria-label={notesCollapsed ? "Expandir anotacoes" : "Recolher anotacoes"}
                  >
                    {notesCollapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </button>
                </div>

                {!notesCollapsed ? (
                  <div className="custom-scrollbar flex-1 overflow-y-auto p-4">
                    {notes.length ? (
                      <div className="space-y-4">
                        {notes.map((note) => (
                          <NoteCard
                            key={note.id}
                            note={note}
                            onHighlight={() => note.spanId && handleNoteClick(note.spanId)}
                            onTextChange={updateNoteText}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="flex h-full min-h-[280px] flex-col items-center justify-center gap-4 text-center">
                        <MessageSquareText className="h-10 w-10 text-[#40485d]" />
                        <p className="max-w-[220px] text-sm leading-6 text-[#6d758c]">
                          Selecione no editor ao lado para criar anotacoes conectadas.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-1 items-center justify-center bg-[#0f1930]">
                    <div className="flex flex-col items-center gap-3 px-3 text-center">
                      <MessageSquareText className="h-5 w-5 text-[#6d758c]" />
                      <span className="font-['Manrope'] text-[10px] uppercase tracking-[0.22em] text-[#6d758c] [writing-mode:vertical-rl] [text-orientation:mixed]">
                        Anotacoes
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  BookMarked,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MessageSquareText,
  Save,
  Wand2,
} from "lucide-react";

import GoogleMark from "../shared/GoogleMark";
import { getAvatarFallback, getAvatarUrl } from "../../utils/authUi";
import DynamicEditor from "./DynamicEditor";

import FlagManagerModal from "../home/FlagManagerModal";

function shouldSendDebugTelemetry() {
  const hostname = typeof window !== "undefined" ? window.location.hostname : "";
  const isLoopbackHost = hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]";
  return import.meta.env.DEV && isLoopbackHost && import.meta.env.VITE_ENABLE_DEBUG_TELEMETRY === "true";
}

function sendDebugTelemetry(url, payload, runId) {
  if (!shouldSendDebugTelemetry()) return;
  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": payload.sessionId || "local" },
    body: JSON.stringify({
      ...payload,
      runId: payload.runId || runId,
      timestamp: Date.now(),
    }),
  }).catch(() => {});
}

function autoResizeTextareaNode(element) {
  if (!element) return;
  // Colapsa antes de medir: com min-height antigo, scrollHeight acompanhava a caixa e só "acordava" depois de várias linhas.
  element.style.height = "0px";
  const h = element.scrollHeight;
  element.style.height = `${h}px`;
}

function NoteCard({ note, onHighlight, onTextChange }) {
  const hasSpan = Boolean(note.spanId);
  const snippetText = note.codeSnippet?.trim();
  const textareaRef = useRef(null);

  useLayoutEffect(() => {
    autoResizeTextareaNode(textareaRef.current);
  }, [note.content]);

  return (
    <article className="py-1.5">
      <div className="flex flex-col gap-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 text-xs leading-5 text-[#a3aac4]">
            {snippetText ? (
              <span className={`${note.led?.text || "text-[#dee5ff]"} whitespace-pre-wrap font-mono`}>
                {snippetText}
              </span>
            ) : null}
            <span className="mx-1 text-[#6d758c]">-</span>
            <span className="font-sans text-[10px] uppercase tracking-[0.16em] text-[#6d758c]">{note.time}</span>
          </div>

          {hasSpan && snippetText ? (
            <button
              type="button"
              onClick={onHighlight}
              className="shrink-0 font-sans text-[10px] font-bold uppercase tracking-[0.16em] text-[#69daff] transition-colors hover:text-white"
            >
              Ver no codigo
            </button>
          ) : null}
        </div>

        <textarea
          ref={textareaRef}
          rows={1}
          value={note.content}
          onChange={(event) => {
            onTextChange(note.id, event.target.value);
          }}
          placeholder="Suas conclusoes sobre esse trecho..."
          className="min-h-[1.5rem] w-full resize-none overflow-hidden border-0 bg-transparent p-0 text-sm leading-6 text-[#dee5ff] placeholder:text-[#6d758c] focus:outline-none"
        />
      </div>
    </article>
  );
}

export default function StudyRoom({
  activeTechnology,
  activeLesson,
  authUser,
  flags,
  onBack,
  onOpenAccount,
  onOpenDevBrief,
  onSignInWithGoogle,
  onUpdateContent,
  onSyncStructure,
  supabaseConfigured,
}) {
  const [debugRunId] = useState(() => `run-${Date.now()}`);
  const [localTitle, setLocalTitle] = useState(activeLesson?.title || "");
  const [localSummary, setLocalSummary] = useState(activeLesson?.summary || "");
  const [currentCode, setCurrentCode] = useState(activeLesson?.fullCode || "");
  const [notes, setNotes] = useState(activeLesson?.studyNotes || []);
  const [lessonFlags, setLessonFlags] = useState(activeLesson?.flags || []);
  const [activeSpanId, setActiveSpanId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState("");
  const [notesCollapsed, setNotesCollapsed] = useState(false);
  const [showFlagManager, setShowFlagManager] = useState(false);
  const [infoCollapsed, setInfoCollapsed] = useState(false); // For title/summary section

  const isLogged = Boolean(authUser);
  const avatarUrl = getAvatarUrl(authUser);

  // Sincroniza com a lição aberta apenas quando a identidade da lição muda.
  // `activeLesson` ganha nova referência com frequência (ex.: applyTechList no App)
  // mesmo com o mesmo id; resetar título/código nesse caso sobrescrevia edições
  // locais com fullCode desatualizado da lista e reescrevia o contentEditable.
  useEffect(() => {
    sendDebugTelemetry(
      "http://127.0.0.1:7503/ingest/e9208422-b9d4-4023-8ce8-d968ff184ec2",
      {
        sessionId: "47a2b5",
        hypothesisId: "H4",
        location: "StudyRoom.jsx:activeLesson-id-effect",
        message: "StudyRoom sync from activeLesson id",
        data: {
          lessonId: activeLesson?.id ?? null,
          lessonTitleLen: (activeLesson?.title || "").length,
          fullCodeLen: (activeLesson?.fullCode || "").length,
        },
      },
      debugRunId,
    );

    sendDebugTelemetry(
      "http://127.0.0.1:7248/ingest/ebf8239d-0d53-473f-89d0-8079f8a65d8e",
      {
        sessionId: "836bc4",
        runId: "post-fix",
        hypothesisId: "A",
        location: "StudyRoom.jsx:activeLesson-effect",
        message: "lessonId effect: reset local state from lesson",
        data: {
          lessonId: activeLesson?.id ?? null,
          fullCodeLen: (activeLesson?.fullCode || "").length,
        },
      },
      debugRunId,
    );
    if (!activeLesson?.id) {
      setLocalTitle("");
      setLocalSummary("");
      setCurrentCode("");
      setNotes([]);
      setLessonFlags([]);
      setActiveSpanId(null);
      setSaveFeedback("");
      return;
    }

    const lesson = activeLesson;
    setLocalTitle(lesson.title || "");
    setLocalSummary(lesson.summary || "");
    setCurrentCode(lesson.fullCode || "");
    setNotes(lesson.studyNotes || []);
    setLessonFlags(lesson.flags || []);
    setActiveSpanId(null);
    setSaveFeedback("");
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intencional: só ao mudar id da lição
  }, [activeLesson?.id]);

  useEffect(() => {
    return () => {
      sendDebugTelemetry(
        "http://127.0.0.1:7503/ingest/e9208422-b9d4-4023-8ce8-d968ff184ec2",
        {
          sessionId: "47a2b5",
          hypothesisId: "H5",
          location: "StudyRoom.jsx:unmount-cleanup",
          message: "StudyRoom unmounted",
          data: {
            lessonIdAtUnmount: activeLesson?.id ?? null,
            titleLenAtUnmount: (localTitle || "").length,
            summaryLenAtUnmount: (localSummary || "").length,
            codeLenAtUnmount: (currentCode || "").length,
          },
        },
        debugRunId,
      );
    };
  }, [activeLesson?.id, currentCode, debugRunId, localSummary, localTitle]);

  useEffect(() => {
    const handleGlobalKeyDown = (event) => {
      const interestingKey = event.key === "Backspace" || event.key === "BrowserBack";
      if (!interestingKey && !(event.altKey && event.key === "ArrowLeft")) return;

      sendDebugTelemetry(
        "http://127.0.0.1:7503/ingest/e9208422-b9d4-4023-8ce8-d968ff184ec2",
        {
          sessionId: "47a2b5",
          hypothesisId: "H2",
          location: "StudyRoom.jsx:window-keydown",
          message: "global keydown while in StudyRoom",
          data: {
            key: event.key,
            altKey: event.altKey,
            ctrlKey: event.ctrlKey,
            shiftKey: event.shiftKey,
            metaKey: event.metaKey,
            targetTag: event.target?.tagName ?? null,
            targetEditable: Boolean(event.target?.isContentEditable),
          },
        },
        debugRunId,
      );
    };

    window.addEventListener("keydown", handleGlobalKeyDown, true);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown, true);
  }, [debugRunId]);

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
        flags: lessonFlags,
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

  const toggleFlag = (flagId) => {
    setLessonFlags(current => 
      current.includes(flagId) 
        ? current.filter(id => id !== flagId) 
        : [...current, flagId]
    );
  };

  return (
    <div className="dashboard-ui-root relative min-h-screen bg-dashboard-bg text-dashboard-text">
      <div className="fixed inset-0 bg-dashboard-bg" />

      <header
        data-reveal="view-nav"
        className="fixed top-0 z-50 flex h-16 w-full items-center justify-between bg-dashboard-bg/85 px-4 backdrop-blur-md sm:px-6 lg:px-8"
      >
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="app-btn app-btn-ghost app-btn-icon dashboard-focusring h-10 w-10 border-dashboard-border/20 bg-dashboard-elevated text-dashboard-muted hover:text-dashboard-text"
            aria-label="Voltar"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <div className="hidden h-10 w-px bg-dashboard-border/20 sm:block" />

          <BookMarked className="hidden h-5 w-5 text-dashboard-accent sm:block" />

          <div className="min-w-0">
            <p className="truncate font-sans text-lg font-bold text-dashboard-text">
              {localTitle || "Sem titulo"}
            </p>
            <p className="mt-1 font-sans text-[10px] uppercase tracking-[0.24em] text-dashboard-muted">
              Biblioteca {activeTechnology?.name || "Tecnologia"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-x-3 sm:gap-x-4">
          {saveFeedback ? (
            <p className="hidden max-w-[220px] truncate text-xs text-dashboard-muted xl:block">
              {saveFeedback}
            </p>
          ) : null}

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="app-btn dashboard-focusring border-emerald-400/30 bg-emerald-500/10 px-4 py-2 font-sans text-sm font-bold text-emerald-300 hover:bg-emerald-500/20"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isSaving ? "Salvando..." : "Salvar"}
          </button>

          <button
            type="button"
            onClick={() => onOpenDevBrief(currentCode)}
            className="app-btn dashboard-focusring hidden rounded-full border-dashboard-accent/30 bg-dashboard-accent/10 px-4 py-2 font-sans text-sm font-bold text-dashboard-accent hover:bg-dashboard-accent/20 sm:inline-flex"
          >
            <Wand2 className="h-4 w-4" />
            Analise Assistida
          </button>

          {isLogged ? (
            <button
              type="button"
              onClick={onOpenAccount}
              className="dashboard-focusring h-8 w-8 overflow-hidden rounded-full border border-dashboard-border/30"
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
                <span className="flex h-full w-full items-center justify-center bg-dashboard-elevated text-xs font-semibold text-dashboard-text">
                  {getAvatarFallback(authUser)}
                </span>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={onSignInWithGoogle}
              disabled={!supabaseConfigured}
              className="app-btn app-btn-ghost dashboard-focusring border-dashboard-border/30 bg-dashboard-elevated px-3 py-2 font-sans text-xs font-bold text-dashboard-text hover:border-dashboard-accent/40 hover:text-dashboard-accent"
            >
              <GoogleMark className="h-4 w-4" />
              Entrar com Google
            </button>
          )}
        </div>
      </header>

      <main
        data-reveal="view-main"
        className="relative z-10 min-h-screen bg-dashboard-bg px-4 pb-10 pt-20 sm:px-6 lg:px-8"
      >
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start">
          <div className="min-w-0 flex-1 space-y-4">
            <section className="surface-lift rounded-xl border border-[#40485d]/10 bg-[#0f1930] hover:border-[#69daff]/15">
              <div className="flex items-center justify-between border-b border-[#40485d]/10 bg-[#091328] px-4 py-3">
                <div className="flex items-center gap-2">
                  <BookMarked className="h-4 w-4 text-[#a3aac4]" />
                  <span className="font-sans text-[11px] text-[#a3aac4]">Informações do conteúdo</span>
                </div>
                <button
                  type="button"
                  onClick={() => setInfoCollapsed((current) => !current)}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg border border-[#40485d]/20 bg-[#141f38] text-[#a3aac4] transition-colors hover:text-white`}
                  aria-label={infoCollapsed ? "Expandir informações" : "Recolher informações"}
                >
                  {infoCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </button>
              </div>

              {!infoCollapsed && (
                <div className="space-y-5 px-6 py-[11px]">
                  <div>
                    <div className="mb-2 flex items-center justify-between gap-4">
                      <label className="font-sans text-[10px] font-bold uppercase tracking-[0.24em] text-[#6d758c]">
                        Titulo do conteudo
                      </label>
                    </div>
                    <input
                      type="text"
                      value={localTitle}
                      onChange={(event) => setLocalTitle(event.target.value)}
                      className="w-full rounded-lg border border-[#40485d]/20 bg-black/20 px-4 py-3 text-sm text-[#dee5ff] placeholder:text-[#6d758c] focus:border-[#69daff]/40 focus:outline-none"
                    />
                  </div>

                  <div>
                    <div className="mb-2">
                      <label className="font-sans text-[10px] font-bold uppercase tracking-[0.24em] text-[#6d758c]">
                        Resumo
                      </label>
                    </div>

                    <textarea
                      value={localSummary}
                      onChange={(event) => setLocalSummary(event.target.value)}
                      rows={3}
                      className="w-full rounded-lg border border-[#40485d]/20 bg-black/20 px-4 py-3 text-sm leading-7 text-[#dee5ff] placeholder:text-[#6d758c] focus:border-[#69daff]/40 focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </section>

            <section className="surface-lift overflow-hidden rounded-xl border border-[#40485d]/10 bg-[#0f1930] hover:border-[#69daff]/15">
              <div className="h-[calc(100vh-23rem)] min-h-[420px]">
                <DynamicEditor
                  initialContent={currentCode}
                  onAddSelection={handleAddAnnotation}
                  onChange={setCurrentCode}
                  highlightSpanId={activeSpanId}
                  flagsList={flags || []}
                  lessonFlags={lessonFlags}
                  onToggleFlag={toggleFlag}
                  onManageFlags={() => setShowFlagManager(true)}
                />
              </div>
            </section>
          </div>

          <aside className={`order-last shrink-0 xl:sticky xl:top-20 xl:h-[calc(100vh-6.5rem)] ${notesCollapsed ? "xl:w-20" : "xl:w-[320px]"}`}>
            <section className="surface-lift flex h-full overflow-hidden rounded-xl border border-[#40485d]/10 bg-[#0f1930] hover:border-[#69daff]/15">
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-center gap-2 border-b border-[#40485d]/10 bg-[#091328] px-4 py-3">
                  <MessageSquareText className="h-4 w-4 text-[#a3aac4]" />
                  {!notesCollapsed ? (
                    <h3 className="font-sans text-base font-bold text-[#dee5ff]">
                      Anotacoes conectadas
                    </h3>
                  ) : null}
                  {notes.length ? (
                    <span className={`${notesCollapsed ? "" : "ml-auto"} rounded bg-black/20 px-2 py-1 font-sans text-[10px] font-bold uppercase tracking-[0.16em] text-[#a3aac4]`}>
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
                  <div className="custom-scrollbar flex-1 overflow-y-auto p-3">
                    {notes.length ? (
                      <div className="space-y-0">
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
                      <span className="font-sans text-[10px] uppercase tracking-[0.22em] text-[#6d758c] [writing-mode:vertical-rl] [text-orientation:mixed]">
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

      <FlagManagerModal 
        isOpen={showFlagManager}
        onClose={() => setShowFlagManager(false)}
        flags={flags || []}
        technologies={[]}
        onSyncStructure={onSyncStructure}
      />
    </div>
  );
}

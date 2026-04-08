import { useEffect, useMemo, useRef, useState } from "react";
import { ImagePlus, Link2, LoaderCircle, Move, Upload, X, ZoomIn } from "lucide-react";

import { getTechnologyImageMetrics, getTechnologyImageStyles } from "./TechnologyImageUtils";

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getEmptyImageDraft() {
  return {
    src: "",
    aspectRatio: 1,
    zoom: 1,
    offsetX: 0,
    offsetY: 0,
  };
}

function isUploadSource(src) {
  return String(src || "").startsWith("data:");
}

function loadImageMetadata(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      const aspectRatio = image.naturalWidth && image.naturalHeight
        ? image.naturalWidth / image.naturalHeight
        : 1;

      resolve({
        aspectRatio: Number.isFinite(aspectRatio) && aspectRatio > 0 ? aspectRatio : 1,
      });
    };

    image.onerror = () => {
      reject(new Error("Nao foi possivel carregar a imagem selecionada."));
    };

    image.decoding = "async";
    image.referrerPolicy = "no-referrer";
    image.src = src;
  });
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Nao foi possivel ler o arquivo local."));
    reader.readAsDataURL(file);
  });
}

function getInitialState(technology) {
  const image = technology?.image?.src
    ? {
      ...getEmptyImageDraft(),
      ...technology.image,
    }
    : null;

  return {
    name: technology?.name || "",
    image,
    urlInput: !image || isUploadSource(image.src) ? "" : image.src,
    sourceMode: image?.src ? (isUploadSource(image.src) ? "upload" : "url") : "url",
  };
}

export default function TechnologyModal({
  isOpen,
  mode,
  technology,
  onClose,
  onSave,
}) {
  const fileInputRef = useRef(null);
  const cropAreaRef = useRef(null);
  const dragStateRef = useRef(null);

  const [name, setName] = useState("");
  const [imageDraft, setImageDraft] = useState(null);
  const [urlInput, setUrlInput] = useState("");
  const [sourceMode, setSourceMode] = useState("url");
  const [error, setError] = useState("");
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const title = mode === "edit" ? "Editar tecnologia" : "Adicionar tecnologia";
  const actionLabel = mode === "edit" ? "Salvar alteracoes" : "Criar tecnologia";

  useEffect(() => {
    if (!isOpen) return undefined;

    const nextState = getInitialState(technology);
    setName(nextState.name);
    setImageDraft(nextState.image);
    setUrlInput(nextState.urlInput);
    setSourceMode(nextState.sourceMode);
    setError("");
    setIsSaving(false);
    setIsLoadingImage(false);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, technology, onClose]);

  const previewMetrics = useMemo(
    () => (imageDraft ? getTechnologyImageMetrics(imageDraft) : null),
    [imageDraft],
  );

  if (!isOpen) {
    return null;
  }

  const applyLoadedImage = async (src) => {
    setIsLoadingImage(true);
    setError("");

    try {
      const metadata = await loadImageMetadata(src);
      setImageDraft({
        src,
        aspectRatio: metadata.aspectRatio,
        zoom: 1,
        offsetX: 0,
        offsetY: 0,
      });
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setIsLoadingImage(false);
    }
  };

  const handleLoadUrl = async () => {
    const nextUrl = urlInput.trim();

    if (!nextUrl) {
      setError("Cole uma URL valida para carregar a imagem.");
      return;
    }

    await applyLoadedImage(nextUrl);
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    try {
      const dataUrl = await readFileAsDataUrl(file);
      await applyLoadedImage(dataUrl);
    } catch (fileError) {
      setError(fileError.message);
      setIsLoadingImage(false);
    }
  };

  const handlePointerDown = (event) => {
    if (!imageDraft) return;

    dragStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startOffsetX: imageDraft.offsetX || 0,
      startOffsetY: imageDraft.offsetY || 0,
    };

    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event) => {
    if (!dragStateRef.current || !cropAreaRef.current || !previewMetrics) return;

    const rect = cropAreaRef.current.getBoundingClientRect();
    const maxPanXPixels = (rect.width * previewMetrics.maxOffsetX) / 100;
    const maxPanYPixels = (rect.height * previewMetrics.maxOffsetY) / 100;
    const deltaX = event.clientX - dragStateRef.current.startX;
    const deltaY = event.clientY - dragStateRef.current.startY;

    setImageDraft((current) => {
      if (!current) return current;

      return {
        ...current,
        offsetX: maxPanXPixels
          ? clamp(dragStateRef.current.startOffsetX + (deltaX / maxPanXPixels), -1, 1)
          : 0,
        offsetY: maxPanYPixels
          ? clamp(dragStateRef.current.startOffsetY + (deltaY / maxPanYPixels), -1, 1)
          : 0,
      };
    });
  };

  const handlePointerUp = (event) => {
    if (dragStateRef.current?.pointerId === event.pointerId) {
      dragStateRef.current = null;
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleZoomChange = (event) => {
    const nextZoom = clamp(Number(event.target.value) || 1, 1, 3);

    setImageDraft((current) => {
      if (!current) return current;

      const nextImage = { ...current, zoom: nextZoom };
      const nextMetrics = getTechnologyImageMetrics(nextImage);

      return {
        ...nextImage,
        offsetX: nextMetrics.maxOffsetX ? clamp(nextImage.offsetX || 0, -1, 1) : 0,
        offsetY: nextMetrics.maxOffsetY ? clamp(nextImage.offsetY || 0, -1, 1) : 0,
      };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!name.trim()) {
      setError("Informe um nome para a tecnologia.");
      return;
    }

    if (!imageDraft?.src) {
      setError("Escolha uma imagem por URL ou upload local antes de salvar.");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const result = await onSave({
        id: technology?.id,
        name: name.trim(),
        image: imageDraft,
      });

      if (!result?.ok) {
        setError(result?.error || "Nao foi possivel salvar a tecnologia.");
        setIsSaving(false);
        return;
      }

      onClose();
    } catch (saveError) {
      setError(saveError.message || "Nao foi possivel salvar a tecnologia.");
      setIsSaving(false);
      return;
    }

    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-[#07111d] shadow-[0_35px_120px_rgba(0,0,0,0.55)]">
        <div className="flex items-center justify-between border-b border-white/8 px-6 py-5 sm:px-8">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-sky-200/65">
              Biblioteca de tecnologias
            </p>
            <h2 className="mt-1 text-2xl font-bold text-white">{title}</h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition-colors hover:border-white/20 hover:bg-white/10 hover:text-white"
            aria-label="Fechar modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form className="grid flex-1 gap-0 overflow-y-auto lg:grid-cols-[0.9fr_1.1fr]" onSubmit={handleSubmit}>
          <section className="border-b border-white/8 px-6 py-6 lg:border-b-0 lg:border-r lg:px-8">
            <div className="space-y-6">
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Nome da tecnologia
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Ex.: Docker, TypeScript, Node.js..."
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-sky-400/40 focus:outline-none"
                />
              </label>

              <div>
                <span className="mb-3 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Fonte da imagem
                </span>

                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setSourceMode("url")}
                    className={`rounded-2xl border px-4 py-4 text-left transition-all ${
                      sourceMode === "url"
                        ? "border-sky-400/40 bg-sky-500/10 text-white"
                        : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20 hover:bg-white/[0.05]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5">
                        <Link2 className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">Usar URL</p>
                        <p className="mt-1 text-xs text-slate-400">Cole a imagem hospedada na web.</p>
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSourceMode("upload")}
                    className={`rounded-2xl border px-4 py-4 text-left transition-all ${
                      sourceMode === "upload"
                        ? "border-sky-400/40 bg-sky-500/10 text-white"
                        : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20 hover:bg-white/[0.05]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5">
                        <Upload className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">Upload local</p>
                        <p className="mt-1 text-xs text-slate-400">Envie uma imagem do computador.</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {sourceMode === "url" ? (
                <div className="rounded-[1.6rem] border border-white/8 bg-white/[0.03] p-4">
                  <label className="block">
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                      URL da imagem
                    </span>
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <input
                        type="url"
                        value={urlInput}
                        onChange={(event) => setUrlInput(event.target.value)}
                        placeholder="https://..."
                        className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-[#04101c] px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-sky-400/40 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleLoadUrl}
                        disabled={isLoadingImage}
                        className="inline-flex min-h-[3.1rem] items-center justify-center gap-2 rounded-2xl border border-sky-400/25 bg-sky-500/10 px-4 text-sm font-semibold text-sky-200 transition-colors hover:bg-sky-500/15 disabled:cursor-wait disabled:opacity-70"
                      >
                        {isLoadingImage ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                        Carregar imagem
                      </button>
                    </div>
                  </label>
                </div>
              ) : (
                <div className="rounded-[1.6rem] border border-dashed border-white/12 bg-white/[0.03] p-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoadingImage}
                    className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-[#04101c] px-4 py-4 text-sm font-semibold text-white transition-colors hover:border-white/20 hover:bg-[#081423] disabled:cursor-wait disabled:opacity-70"
                  >
                    {isLoadingImage ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    Escolher arquivo
                  </button>

                  <p className="mt-3 text-xs leading-relaxed text-slate-400">
                    Depois do upload voce pode arrastar e ajustar o zoom para enquadrar a capa do card.
                  </p>
                </div>
              )}

              <div className="rounded-[1.6rem] border border-white/8 bg-[#04101c]/85 p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-sky-500/12 text-sky-200">
                    <Move className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Recorte quadrado estilo WhatsApp</p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-400">
                      Arraste a imagem para reposicionar e use o zoom para preencher o enquadramento do card.
                    </p>
                  </div>
                </div>
              </div>

              {error ? (
                <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                  {error}
                </div>
              ) : null}
            </div>
          </section>

          <section className="px-6 py-6 lg:px-8">
            <div className="flex h-full flex-col gap-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Preview da capa
                </p>
                <h3 className="mt-2 text-lg font-semibold text-white">Enquadre a imagem antes de salvar</h3>
              </div>

              <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_220px]">
                <div className="rounded-[1.8rem] border border-white/10 bg-[#04101c] p-4">
                  <div
                    ref={cropAreaRef}
                    className="relative aspect-square overflow-hidden rounded-[1.6rem] border border-white/8 bg-[#07192b] touch-none"
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                  >
                    {imageDraft?.src ? (
                      <>
                        <img
                          src={imageDraft.src}
                          alt={name || "Preview da tecnologia"}
                          className="absolute select-none object-cover"
                          draggable="false"
                          style={getTechnologyImageStyles(imageDraft)}
                        />
                        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:33.333%_33.333%] opacity-25" />
                        <div className="absolute inset-0 border border-white/12" />
                      </>
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center text-slate-400">
                        <ImagePlus className="h-8 w-8 text-slate-500" />
                        <p className="text-sm font-medium text-white/90">Carregue uma imagem para começar</p>
                        <p className="text-xs leading-relaxed text-slate-500">
                          A capa final sera exibida em formato quadrado nos cards da dashboard.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-5">
                    <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                      <span>Zoom</span>
                      <span>{imageDraft ? `${Math.round((imageDraft.zoom || 1) * 100)}%` : "100%"}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <ZoomIn className="h-4 w-4 text-slate-500" />
                      <input
                        type="range"
                        min="1"
                        max="3"
                        step="0.01"
                        value={imageDraft?.zoom || 1}
                        onChange={handleZoomChange}
                        disabled={!imageDraft?.src}
                        className="technology-zoom-slider h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                    Resultado no card
                  </p>

                  <div className="mt-4 rounded-[1.6rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.03)),rgba(255,255,255,0.02)] p-4">
                    <div className="flex items-start gap-4">
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[1.4rem] border border-white/10 bg-[#081423]">
                        {imageDraft?.src ? (
                          <img
                            src={imageDraft.src}
                            alt={name || "Resultado da capa"}
                            className="absolute select-none object-cover"
                            draggable="false"
                            style={getTechnologyImageStyles(imageDraft)}
                          />
                        ) : null}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-lg font-semibold text-white">
                          {name.trim() || "Sua tecnologia"}
                        </p>
                        <p className="mt-1 text-sm text-slate-400">
                          {technology?.contents?.length || 0} conteudos
                        </p>
                        <p className="mt-4 text-xs uppercase tracking-[0.22em] text-sky-200/70">
                          Abrir biblioteca
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl border border-white/8 bg-[#04101c]/75 px-4 py-3 text-xs leading-relaxed text-slate-400">
                    {previewMetrics?.maxOffsetX || previewMetrics?.maxOffsetY
                      ? "Arraste dentro do quadro para encontrar o melhor corte."
                      : "A imagem ja esta encaixada no formato quadrado."}
                  </div>
                </div>
              </div>

              <div className="mt-auto flex flex-col-reverse gap-3 border-t border-white/8 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex min-h-[3.25rem] items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-5 text-sm font-semibold text-slate-200 transition-colors hover:border-white/20 hover:bg-white/[0.08]"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex min-h-[3.25rem] items-center justify-center gap-2 rounded-2xl border border-sky-400/25 bg-sky-500/12 px-5 text-sm font-semibold text-sky-100 transition-colors hover:bg-sky-500/18 disabled:cursor-wait disabled:opacity-70"
                >
                  {isSaving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                  {actionLabel}
                </button>
              </div>
            </div>
          </section>
        </form>
      </div>
    </div>
  );
}

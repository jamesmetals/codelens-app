import { useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  Crop,
  ImagePlus,
  Link2,
  LoaderCircle,
  Pencil,
  Plus,
  Trash2,
  Upload,
  X,
  ZoomIn,
} from "lucide-react";

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
      reject(new Error("Nao foi possivel carregar a imagem."));
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
    reader.onerror = () => reject(new Error("Nao foi possivel ler o arquivo."));
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
  };
}

function ImageCropModal({ imageDraft, isOpen, onApply, onClose }) {
  const cropAreaRef = useRef(null);
  const dragStateRef = useRef(null);
  const [draft, setDraft] = useState(() => (imageDraft ? { ...imageDraft } : null));

  const previewMetrics = useMemo(
    () => (draft ? getTechnologyImageMetrics(draft) : null),
    [draft],
  );

  if (!isOpen || !draft?.src) {
    return null;
  }

  const handlePointerDown = (event) => {
    dragStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startOffsetX: draft.offsetX || 0,
      startOffsetY: draft.offsetY || 0,
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

    setDraft((current) => {
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

    setDraft((current) => {
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

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />

      <div className="relative z-10 flex w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-white/10 bg-[#0f1930] shadow-[0_32px_80px_rgba(0,0,0,0.5)]">
        <header className="flex items-center justify-between bg-[#141f38] px-6 py-4">
          <div className="flex items-center gap-3">
            <Crop className="h-5 w-5 text-sky-300" />
            <h2 className="font-['Space_Grotesk'] text-lg font-semibold text-white">Editar imagem</h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
            aria-label="Fechar edicao da imagem"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="space-y-4 p-6">
          <div
            ref={cropAreaRef}
            className="relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-xl bg-[#091328] touch-none"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            <img
              src={draft.src}
              alt="Imagem da tecnologia"
              className="absolute select-none object-cover"
              draggable="false"
              style={getTechnologyImageStyles(draft)}
            />
            <div className="absolute inset-0 border border-white/10" />
          </div>

          <div className="mx-auto flex w-full max-w-md items-center gap-3">
            <ZoomIn className="h-4 w-4 text-slate-500" />
            <input
              type="range"
              min="1"
              max="3"
              step="0.01"
              value={draft.zoom || 1}
              onChange={handleZoomChange}
              className="technology-zoom-slider h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10"
            />
          </div>
        </div>

        <footer className="flex items-center justify-end gap-3 bg-[#091328] px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-5 py-2.5 text-sm font-semibold text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={() => onApply(draft)}
            className="inline-flex items-center gap-2 rounded-lg border border-sky-400/25 bg-gradient-to-br from-sky-300 to-cyan-400 px-5 py-2.5 text-sm font-bold text-[#083445] shadow-[0_12px_32px_rgba(73,211,255,0.18)] transition-transform hover:scale-[1.01]"
          >
            <Check className="h-4 w-4" />
            Aplicar
          </button>
        </footer>
      </div>
    </div>
  );
}

export default function TechnologyModal({
  isOpen,
  mode,
  technology,
  onClose,
  onDelete,
  onSave,
}) {
  const fileInputRef = useRef(null);

  const [name, setName] = useState("");
  const [imageDraft, setImageDraft] = useState(null);
  const [urlInput, setUrlInput] = useState("");
  const [error, setError] = useState("");
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCropOpen, setIsCropOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const title = mode === "edit" ? "Editar tecnologia" : "Adicionar tecnologia";
  const actionLabel = mode === "edit" ? "Salvar alteracoes" : "Criar tecnologia";

  useEffect(() => {
    if (!isOpen) return undefined;

    const nextState = getInitialState(technology);
    setName(nextState.name);
    setImageDraft(nextState.image);
    setUrlInput(nextState.urlInput);
    setError("");
    setIsSaving(false);
    setIsDeleting(false);
    setIsLoadingImage(false);
    setIsCropOpen(false);
    setIsDeleteConfirmOpen(false);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, technology]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key !== "Escape") return;

      if (isCropOpen) {
        setIsCropOpen(false);
        return;
      }

       if (isDeleteConfirmOpen) {
        setIsDeleteConfirmOpen(false);
        return;
      }

      onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isCropOpen, isDeleteConfirmOpen, onClose]);

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
      setError("Cole uma URL valida.");
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

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!name.trim()) {
      setError("Informe um nome para a tecnologia.");
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
        setError(result?.error || "Nao foi possivel salvar.");
        setIsSaving(false);
        return;
      }

      onClose();
    } catch (saveError) {
      setError(saveError.message || "Nao foi possivel salvar.");
      setIsSaving(false);
      return;
    }

    setIsSaving(false);
  };

  const handleDelete = async () => {
    if (!technology?.id || typeof onDelete !== "function") return;

    setIsDeleting(true);
    setError("");

    try {
      const result = await onDelete(technology);

      if (!result?.ok) {
        setError(result?.error || "Nao foi possivel excluir.");
        setIsDeleting(false);
        return;
      }

      setIsDeleteConfirmOpen(false);
      onClose();
    } catch (deleteError) {
      setError(deleteError.message || "Nao foi possivel excluir.");
      setIsDeleting(false);
      return;
    }

    setIsDeleting(false);
  };

  return (
    <>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />

        <div className="relative z-10 flex w-full max-w-xl flex-col overflow-hidden rounded-xl border border-white/10 bg-[#0f1930] shadow-[0_32px_90px_rgba(0,0,0,0.55)]">
          <header className="flex items-center justify-between bg-[#141f38] px-6 py-5">
            <div className="flex items-center gap-3">
              <Pencil className="h-5 w-5 text-sky-300" />
              <h1 className="font-['Space_Grotesk'] text-xl font-bold tracking-tight text-white">
                {title}
              </h1>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1.5 text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
              aria-label="Fechar modal"
            >
              <X className="h-4 w-4" />
            </button>
          </header>

          <form onSubmit={handleSubmit}>
            <main className="space-y-5 p-6">
              <label className="block">
                <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Nome da tecnologia
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-sky-400/40 focus:outline-none"
                />
              </label>

              <div className="space-y-3">
                <span className="block text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Imagem da tecnologia
                </span>

                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-500">
                    <Link2 className="h-4 w-4" />
                  </div>
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(event) => setUrlInput(event.target.value)}
                    placeholder="https://exemplo.com/imagem.png"
                    className="w-full rounded-xl border border-white/10 bg-black py-3 pl-11 pr-28 text-sm text-white placeholder:text-slate-600 focus:border-sky-400/40 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleLoadUrl}
                    disabled={isLoadingImage}
                    className="absolute right-2 top-1/2 inline-flex h-9 -translate-y-1/2 items-center justify-center rounded-lg border border-sky-400/20 bg-sky-500/10 px-3 text-xs font-semibold text-sky-100 transition-colors hover:bg-sky-500/15 disabled:cursor-wait disabled:opacity-70"
                  >
                    {isLoadingImage ? <LoaderCircle className="h-4 w-4 animate-spin" /> : "Carregar"}
                  </button>
                </div>

                <div className="relative overflow-hidden rounded-xl border-2 border-dashed border-white/10 bg-[#091328] transition-colors hover:border-sky-400/25">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 cursor-pointer opacity-0"
                    onChange={handleFileChange}
                  />

                  <div className="flex flex-col items-center justify-center gap-3 px-6 py-7 text-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#141f38] text-sky-300">
                      {isLoadingImage ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Upload de arquivo</p>
                      <p className="mt-1 text-xs text-slate-500">Clique para selecionar</p>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500">PNG, JPG ou SVG</p>
              </div>

              {imageDraft?.src ? (
                <div className="flex items-center justify-between rounded-xl border border-white/8 bg-[#091328] p-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-[#141f38]">
                      <img
                        src={imageDraft.src}
                        alt={name || "Imagem da tecnologia"}
                        className="absolute select-none object-cover"
                        draggable="false"
                        style={getTechnologyImageStyles(imageDraft)}
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white">{name || "Imagem carregada"}</p>
                      <p className="text-xs text-slate-500">Capa pronta</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsCropOpen(true)}
                      className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-white/8 bg-white/[0.03] px-3 text-slate-300 transition-colors hover:border-sky-300/25 hover:text-sky-100"
                      aria-label="Editar imagem"
                      title="Editar imagem"
                    >
                      <Crop className="h-4 w-4" />
                      <span className="text-xs font-semibold">Editar</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setImageDraft(null);
                        setUrlInput("");
                        setIsCropOpen(false);
                      }}
                      className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-white/8 bg-white/[0.03] px-3 text-slate-400 transition-colors hover:border-rose-300/25 hover:text-rose-200"
                      aria-label="Excluir imagem"
                      title="Excluir imagem"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="text-xs font-semibold">Excluir</span>
                    </button>
                  </div>
                </div>
              ) : null}

              {error ? (
                <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                  {error}
                </div>
              ) : null}
            </main>

            <footer className="flex items-center justify-between gap-3 bg-[#091328] px-6 py-5">
              <div>
                {mode === "edit" ? (
                  <button
                    type="button"
                    onClick={() => setIsDeleteConfirmOpen(true)}
                    disabled={isSaving || isDeleting}
                    className="inline-flex items-center gap-2 rounded-lg border border-rose-400/20 bg-rose-500/10 px-4 py-2.5 text-sm font-semibold text-rose-200 transition-colors hover:bg-rose-500/15 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Trash2 className="h-4 w-4" />
                    Excluir tecnologia
                  </button>
                ) : null}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg px-5 py-2.5 text-sm font-semibold text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isSaving || isDeleting}
                  className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-br from-sky-300 to-cyan-400 px-6 py-2.5 text-sm font-bold text-[#083445] shadow-[0_12px_32px_rgba(73,211,255,0.18)] transition-transform hover:scale-[1.01] disabled:cursor-wait disabled:opacity-70"
                >
                  {isSaving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                  {actionLabel}
                </button>
              </div>
            </footer>
          </form>
        </div>
      </div>

      {isCropOpen && imageDraft?.src ? (
        <ImageCropModal
          imageDraft={imageDraft}
          isOpen={isCropOpen}
          onClose={() => setIsCropOpen(false)}
          onApply={(nextImage) => {
            setImageDraft(nextImage);
            setIsCropOpen(false);
          }}
        />
      ) : null}

      {isDeleteConfirmOpen && mode === "edit" ? (
        <div className="fixed inset-0 z-[145] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => !isDeleting && setIsDeleteConfirmOpen(false)}
          />

          <div className="relative z-10 w-full max-w-md overflow-hidden rounded-xl border border-white/10 bg-[#0f1930] shadow-[0_32px_90px_rgba(0,0,0,0.55)]">
            <header className="flex items-center gap-3 border-b border-white/8 bg-[#141f38] px-6 py-4">
              <Trash2 className="h-5 w-5 text-rose-300" />
              <h2 className="font-['Space_Grotesk'] text-lg font-semibold text-white">
                Confirmar exclusao
              </h2>
            </header>

            <div className="space-y-3 px-6 py-5 text-sm text-slate-300">
              <p>
                Deseja realmente excluir a tecnologia
                {" "}
                <span className="font-semibold text-white">{technology?.name || name || "selecionada"}</span>
                ?
              </p>
              <p className="text-slate-500">
                Os conteudos vinculados a ela tambem serao removidos.
              </p>
            </div>

            <footer className="flex items-center justify-end gap-3 bg-[#091328] px-6 py-4">
              <button
                type="button"
                onClick={() => setIsDeleteConfirmOpen(false)}
                disabled={isDeleting}
                className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-400 transition-colors hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 rounded-lg border border-rose-400/20 bg-rose-500/15 px-4 py-2.5 text-sm font-bold text-rose-100 transition-colors hover:bg-rose-500/20 disabled:cursor-wait disabled:opacity-70"
              >
                {isDeleting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Excluir
              </button>
            </footer>
          </div>
        </div>
      ) : null}
    </>
  );
}

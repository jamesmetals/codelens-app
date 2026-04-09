import { technologies } from "./utils/mockData";

const GUEST_STORAGE_KEY = "codenlens_techs_guest";
const LEGACY_GUEST_STORAGE_KEY = "codenlens_techs";

function cloneValue(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizeArray(value) {
  return Array.isArray(value) ? cloneValue(value) : [];
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function slugify(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

function normalizeTechnologyImage(image) {
  if (!image?.src) return null;

  const aspectRatio = Number(image.aspectRatio);
  const zoom = Number(image.zoom);
  const offsetX = Number(image.offsetX);
  const offsetY = Number(image.offsetY);

  return {
    src: String(image.src),
    aspectRatio: Number.isFinite(aspectRatio) && aspectRatio > 0 ? aspectRatio : 1,
    zoom: Number.isFinite(zoom) ? clamp(zoom, 1, 3) : 1,
    offsetX: Number.isFinite(offsetX) ? clamp(offsetX, -1, 1) : 0,
    offsetY: Number.isFinite(offsetY) ? clamp(offsetY, -1, 1) : 0,
  };
}

function normalizeTechnology(technology, index = 0) {
  const name = String(technology?.name || "").trim() || `Tecnologia ${index + 1}`;
  const contents = normalizeArray(technology?.contents);
  const normalizedLessons = Number(technology?.lessons);
  const category = String(technology?.category || "").trim() || "Minhas tecnologias";
  const categoryAccent = String(technology?.categoryAccent || "").trim() || "Conteúdos organizados";

  return {
    ...cloneValue(technology || {}),
    id: String(technology?.id || slugify(name) || `tecnologia-${index + 1}`),
    name,
    category,
    categoryAccent,
    image: normalizeTechnologyImage(technology?.image),
    lessons: Number.isFinite(normalizedLessons) ? normalizedLessons : contents.length,
    contents,
  };
}

function normalizeTechnologies(list) {
  return normalizeArray(list).map((technology, index) => normalizeTechnology(technology, index));
}

function lessonSnapshot(lesson) {
  return JSON.stringify({
    title: lesson?.title ?? "",
    summary: lesson?.summary ?? "",
    fullCode: lesson?.fullCode ?? "",
    studyNotes: normalizeArray(lesson?.studyNotes),
    highlights: normalizeArray(lesson?.highlights),
  });
}

export function cloneTechnologies() {
  return normalizeTechnologies(technologies);
}

export function getStorageKey(userId) {
  return userId ? `codenlens_techs_${userId}` : GUEST_STORAGE_KEY;
}

export function createTechnologyId(name) {
  const base = slugify(name) || "tecnologia";
  const suffix = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID().slice(0, 8)
    : Math.random().toString(36).slice(2, 10);

  return `${base}-${suffix}`;
}

export function getDisplayName(authUser) {
  const fullName = String(authUser?.user_metadata?.full_name || authUser?.user_metadata?.name || "").trim();
  if (fullName) return fullName;

  const email = String(authUser?.email || "").trim();
  return email ? email.split("@")[0] : "Visitante";
}

export function readStoredTechs(storageKey) {
  const fallback = cloneTechnologies();
  if (typeof window === "undefined") return fallback;

  try {
    const raw = localStorage.getItem(storageKey)
      || (storageKey === GUEST_STORAGE_KEY ? localStorage.getItem(LEGACY_GUEST_STORAGE_KEY) : "");

    if (!raw) return fallback;

    const parsed = JSON.parse(raw);
    const normalized = normalizeTechnologies(parsed);
    return normalized.length ? normalized : fallback;
  } catch {
    return fallback;
  }
}

export function writeStoredTechs(storageKey, techList) {
  if (typeof window === "undefined") return;

  const raw = JSON.stringify(normalizeTechnologies(techList));
  localStorage.setItem(storageKey, raw);

  if (storageKey === GUEST_STORAGE_KEY) {
    localStorage.setItem(LEGACY_GUEST_STORAGE_KEY, raw);
  }
}

export function mergeStudyEntries(entries, cachedTechs = []) {
  const nextTechs = normalizeTechnologies(cachedTechs).length ? normalizeTechnologies(cachedTechs) : cloneTechnologies();
  const techMap = new Map(nextTechs.map((tech) => [tech.name, tech]));

  for (const entry of entries || []) {
    const technologyName = String(entry?.technology_name || "").trim();
    const lessonId = Number(entry?.lesson_id);

    if (!technologyName || !lessonId) continue;

    let tech = techMap.get(technologyName);
    if (!tech) {
      tech = normalizeTechnology({
        name: technologyName,
        category: "Minhas tecnologias",
        categoryAccent: "Conteúdos organizados",
        image: null,
        progress: 0,
        lessons: 0,
        aiSessions: 0,
        currentLesson: "Conteudo sincronizado",
        nextFocus: "Revisar suas anotacoes remotas",
        note: "Esta tecnologia foi criada a partir dos seus dados salvos na nuvem.",
        contents: [],
      }, nextTechs.length);
      nextTechs.push(tech);
      techMap.set(technologyName, tech);
    }

    const lessonIndex = tech.contents.findIndex((item) => Number(item.id) === lessonId);
    const currentLesson = lessonIndex >= 0 ? tech.contents[lessonIndex] : null;
    const hasRemoteHighlights = Object.prototype.hasOwnProperty.call(entry || {}, "highlights");

    const mergedLesson = {
      id: lessonId,
      title: entry?.title ?? currentLesson?.title ?? "Sem titulo",
      summary: entry?.summary ?? currentLesson?.summary ?? "",
      tags: currentLesson?.tags || [],
      status: currentLesson?.status || "em-andamento",
      highlights: hasRemoteHighlights
        ? normalizeArray(entry?.highlights)
        : normalizeArray(currentLesson?.highlights),
      createdAt: currentLesson?.createdAt || entry?.created_at || new Date().toISOString().slice(0, 10),
      fullCode: entry?.full_code ?? currentLesson?.fullCode ?? "",
      studyNotes: normalizeArray(entry?.study_notes),
      updatedAt: entry?.updated_at || currentLesson?.updatedAt || null,
    };

    if (lessonIndex >= 0) {
      tech.contents[lessonIndex] = {
        ...currentLesson,
        ...mergedLesson,
      };
    } else {
      tech.contents.unshift(mergedLesson);
    }

    tech.lessons = tech.contents.length;
  }

  return normalizeTechnologies(nextTechs);
}

export function createStudyEntryPayload(userId, technologyName, lesson) {
  return {
    user_id: userId,
    technology_name: technologyName,
    lesson_id: Number(lesson?.id),
    title: lesson?.title ?? "Sem titulo",
    summary: lesson?.summary ?? "",
    full_code: lesson?.fullCode ?? "",
    study_notes: normalizeArray(lesson?.studyNotes),
    highlights: normalizeArray(lesson?.highlights),
    updated_at: new Date().toISOString(),
  };
}

export function extractModifiedLessons(techList) {
  const baselineIndex = new Map();

  for (const tech of technologies) {
    for (const lesson of tech.contents || []) {
      baselineIndex.set(`${tech.id || tech.name}:${lesson.id}`, lessonSnapshot(lesson));
    }
  }

  const modified = [];

  for (const tech of techList || []) {
    for (const lesson of tech.contents || []) {
      const key = `${tech.id || tech.name}:${lesson.id}`;
      const baseline = baselineIndex.get(key);
      const current = lessonSnapshot(lesson);

      if (!baseline || current !== baseline) {
        modified.push({
          technologyName: tech.name,
          lesson,
        });
      }
    }
  }

  return modified;
}

export function formatLastSyncedAt(value) {
  if (!value) return "Ainda nao sincronizado";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "Ainda nao sincronizado";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(parsed);
}

export function getFriendlySyncError(error) {
  const message = String(error?.message || "").trim();

  if (!message) {
    return "Falha ao sincronizar seus dados.";
  }

  if (/study_entries/i.test(message) || /schema cache/i.test(message)) {
    return "A tabela study_entries ainda nao existe no Supabase. Rode o SQL de configuracao.";
  }

  if (/provider is not enabled|unsupported provider|oauth/i.test(message)) {
    return "O login Google ainda nao esta configurado no Supabase.";
  }

  if (/Failed to fetch|network|fetch/i.test(message)) {
    return "Nao foi possivel falar com o Supabase agora. Seus dados continuam no cache local.";
  }

  return message;
}

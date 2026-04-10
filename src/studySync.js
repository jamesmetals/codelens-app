import { technologies } from "./utils/mockData";

const GUEST_STORAGE_KEY = "codenlens_techs_guest";
const LEGACY_GUEST_STORAGE_KEY = "codenlens_techs";
const GUEST_DIRTY_FLAG = "codenlens_guest_dirty";
const TECHNOLOGY_META_LESSON_ID = 0;
const TECHNOLOGY_META_TITLE = "__technology_meta__";

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

function getMetadataStorageKey(storageKey) {
  return `${storageKey}__meta`;
}

function isGuestStorageKey(storageKey) {
  return !storageKey || storageKey === GUEST_STORAGE_KEY || storageKey === LEGACY_GUEST_STORAGE_KEY;
}

function getTechnologyTemplate(technology) {
  const technologyId = String(technology?.id || "").trim().toLowerCase();
  const technologyName = String(technology?.name || "").trim().toLowerCase();

  return technologies.find((item) => (
    String(item?.id || "").trim().toLowerCase() === technologyId
    || String(item?.name || "").trim().toLowerCase() === technologyName
  )) || null;
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

function normalizeTechnologyMetaMap(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};

  return Object.entries(value).reduce((accumulator, [key, meta]) => {
    const id = String(key || "").trim();
    if (!id) return accumulator;

    accumulator[id] = {
      name: String(meta?.name || "").trim() || undefined,
      category: String(meta?.category || "").trim() || undefined,
      categoryAccent: String(meta?.categoryAccent || "").trim() || undefined,
      image: normalizeTechnologyImage(meta?.image),
    };

    return accumulator;
  }, {});
}

function readMetaFromKey(storageKey) {
  if (typeof window === "undefined") return {};

  try {
    const raw = localStorage.getItem(getMetadataStorageKey(storageKey));
    return raw ? normalizeTechnologyMetaMap(JSON.parse(raw)) : {};
  } catch {
    return {};
  }
}

function readTechnologyMeta(storageKey) {
  if (isGuestStorageKey(storageKey)) {
    return {
      ...readMetaFromKey(LEGACY_GUEST_STORAGE_KEY),
      ...readMetaFromKey(GUEST_STORAGE_KEY),
    };
  }

  return readMetaFromKey(storageKey);
}

function applyTechnologyMeta(techList, metaMap) {
  const normalizedMeta = normalizeTechnologyMetaMap(metaMap);

  return normalizeTechnologies(techList).map((technology) => {
    const metadata = normalizedMeta[technology.id];
    if (!metadata) return technology;

    return {
      ...technology,
      name: metadata.name || technology.name,
      category: metadata.category || technology.category,
      categoryAccent: metadata.categoryAccent || technology.categoryAccent,
      image: metadata.image || technology.image,
    };
  });
}

function buildTechnologyMeta(techList) {
  return normalizeTechnologies(techList).reduce((accumulator, technology) => {
    accumulator[technology.id] = {
      name: technology.name,
      category: technology.category,
      categoryAccent: technology.categoryAccent,
      image: normalizeTechnologyImage(technology.image),
    };

    return accumulator;
  }, {});
}

function normalizeRemoteTechnologyRecord(record) {
  const id = String(record?.technology_id || record?.id || "").trim();
  if (!id) return null;

  return {
    id,
    name: String(record?.name || "").trim(),
    category: String(record?.category || "").trim(),
    categoryAccent: String(record?.category_accent || record?.categoryAccent || "").trim(),
    image: normalizeTechnologyImage(record?.image),
    position: Number(record?.position),
    createdAt: record?.created_at || null,
    updatedAt: record?.updated_at || null,
  };
}

function isTechnologyMetaEntry(entry) {
  return Number(entry?.lesson_id) === TECHNOLOGY_META_LESSON_ID
    && String(entry?.title || "").trim() === TECHNOLOGY_META_TITLE;
}

function parseTechnologyMetaEntry(entry) {
  if (!isTechnologyMetaEntry(entry)) return null;

  try {
    const parsed = JSON.parse(String(entry?.full_code || "{}"));
    return normalizeRemoteTechnologyRecord({
      id: parsed?.id,
      name: parsed?.name || entry?.technology_name,
      category: parsed?.category,
      categoryAccent: parsed?.categoryAccent,
      image: parsed?.image,
      position: parsed?.position,
      created_at: entry?.created_at,
      updated_at: entry?.updated_at,
    });
  } catch {
    return normalizeRemoteTechnologyRecord({
      id: slugify(entry?.technology_name) || entry?.technology_name,
      name: entry?.technology_name,
      created_at: entry?.created_at,
      updated_at: entry?.updated_at,
    });
  }
}

function normalizeTechnology(technology, index = 0) {
  const template = getTechnologyTemplate(technology);
  const rawName = String(technology?.name || template?.name || "").trim();
  const name = rawName || `Tecnologia ${index + 1}`;
  const rawContents = Array.isArray(technology?.contents) ? technology.contents : template?.contents;
  const contents = normalizeArray(rawContents);
  const normalizedLessons = Number(technology?.lessons);
  const rawCategory = String(technology?.category || "").trim();
  const rawCategoryAccent = String(technology?.categoryAccent || "").trim();
  const rawCardLabel = String(technology?.cardLabel || "").trim();
  const rawCardTone = String(technology?.cardTone || "").trim();
  const rawCardBarClass = String(technology?.cardBarClass || "").trim();
  const genericCategory = rawCategory === "Minhas tecnologias";
  const genericAccent = rawCategoryAccent === "Conteudos organizados" || rawCategoryAccent === "Conteúdos organizados" || rawCategoryAccent === "ConteÃºdos organizados";

  return {
    ...cloneValue(template || {}),
    ...cloneValue(technology || {}),
    id: String(technology?.id || template?.id || slugify(name) || `tecnologia-${index + 1}`),
    name,
    category: template && (!rawCategory || genericCategory)
      ? template.category
      : (rawCategory || template?.category || "Minhas tecnologias"),
    categoryAccent: template && (!rawCategoryAccent || genericAccent)
      ? template.categoryAccent
      : (rawCategoryAccent || template?.categoryAccent || "Conteudos organizados"),
    image: normalizeTechnologyImage(technology?.image) || normalizeTechnologyImage(template?.image),
    cardLabel: rawCardLabel || template?.cardLabel,
    cardTone: rawCardTone || template?.cardTone,
    cardBarClass: rawCardBarClass || template?.cardBarClass,
    progress: Number.isFinite(Number(technology?.progress)) ? Number(technology.progress) : template?.progress,
    lessons: Number.isFinite(normalizedLessons) ? normalizedLessons : contents.length,
    aiSessions: Number.isFinite(Number(technology?.aiSessions)) ? Number(technology.aiSessions) : template?.aiSessions,
    currentLesson: String(technology?.currentLesson || "").trim() || template?.currentLesson || "",
    nextFocus: String(technology?.nextFocus || "").trim() || template?.nextFocus || "",
    note: String(technology?.note || "").trim() || template?.note || "",
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

export function mergeRemoteTechnologies(records, cachedTechs = []) {
  const baseTechs = normalizeTechnologies(cachedTechs).length
    ? normalizeTechnologies(cachedTechs)
    : cloneTechnologies();

  const result = [...baseTechs];
  const byId = new Map(result.map((technology, index) => [technology.id, index]));

  const normalizedRecords = normalizeArray(records)
    .map((record) => normalizeRemoteTechnologyRecord(record))
    .filter(Boolean)
    .sort((left, right) => {
      const leftPosition = Number.isFinite(left.position) ? left.position : Number.MAX_SAFE_INTEGER;
      const rightPosition = Number.isFinite(right.position) ? right.position : Number.MAX_SAFE_INTEGER;
      if (leftPosition !== rightPosition) return leftPosition - rightPosition;
      return String(left.name || left.id).localeCompare(String(right.name || right.id));
    });

  for (const record of normalizedRecords) {
    const currentIndex = byId.get(record.id);
    const currentTechnology = currentIndex >= 0 ? result[currentIndex] : null;

    const nextTechnology = normalizeTechnology({
      ...currentTechnology,
      id: record.id,
      name: record.name || currentTechnology?.name,
      category: record.category || currentTechnology?.category,
      categoryAccent: record.categoryAccent || currentTechnology?.categoryAccent,
      image: record.image || currentTechnology?.image,
      contents: currentTechnology?.contents || [],
    }, currentIndex >= 0 ? currentIndex : result.length);

    if (currentIndex >= 0) {
      result[currentIndex] = nextTechnology;
    } else {
      byId.set(record.id, result.length);
      result.push(nextTechnology);
    }
  }

  return normalizeTechnologies(result);
}

export function extractTechnologyMetadataEntries(entries) {
  return normalizeArray(entries)
    .map((entry) => parseTechnologyMetaEntry(entry))
    .filter(Boolean);
}

export function getStorageKey(userId) {
  return userId ? `codenlens_techs_${userId}` : GUEST_STORAGE_KEY;
}

export function createTechnologyMetadataPayload(userId, technology, position = 0) {
  const normalizedTechnology = normalizeTechnology(technology, position);

  return {
    user_id: userId,
    technology_name: normalizedTechnology.name,
    lesson_id: TECHNOLOGY_META_LESSON_ID,
    title: TECHNOLOGY_META_TITLE,
    summary: normalizedTechnology.category || "Minhas tecnologias",
    full_code: JSON.stringify({
      id: normalizedTechnology.id,
      name: normalizedTechnology.name,
      category: normalizedTechnology.category || "Minhas tecnologias",
      categoryAccent: normalizedTechnology.categoryAccent || "Conteudos organizados",
      image: normalizeTechnologyImage(normalizedTechnology.image),
      position,
    }),
    study_notes: [],
    highlights: [],
    updated_at: new Date().toISOString(),
  };
}

export function createTechnologyId(name) {
  const base = slugify(name) || "tecnologia";
  const suffix = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID().slice(0, 8)
    : Math.random().toString(36).slice(2, 10);

  return `${base}-${suffix}`;
}

function hasTechnologyMetadataChanges(technology, index = 0) {
  const normalizedTechnology = normalizeTechnology(technology, index);
  const template = getTechnologyTemplate(normalizedTechnology);
  if (!template) return true;

  const normalizedTemplate = normalizeTechnology(template, index);

  return normalizedTechnology.name !== normalizedTemplate.name
    || normalizedTechnology.category !== normalizedTemplate.category
    || normalizedTechnology.categoryAccent !== normalizedTemplate.categoryAccent
    || JSON.stringify(normalizeTechnologyImage(normalizedTechnology.image))
      !== JSON.stringify(normalizeTechnologyImage(normalizedTemplate.image));
}

export function getDisplayName(authUser) {
  const fullName = String(authUser?.user_metadata?.full_name || authUser?.user_metadata?.name || "").trim();
  if (fullName) return fullName;

  const email = String(authUser?.email || "").trim();
  return email ? email.split("@")[0] : "Visitante";
}

export function readStoredTechs(storageKey) {
  const fallback = applyTechnologyMeta(cloneTechnologies(), readTechnologyMeta(storageKey));
  if (typeof window === "undefined") return fallback;

  try {
    const raw = localStorage.getItem(storageKey)
      || (storageKey === GUEST_STORAGE_KEY ? localStorage.getItem(LEGACY_GUEST_STORAGE_KEY) : "");

    if (!raw) return fallback;

    const parsed = JSON.parse(raw);
    const normalized = applyTechnologyMeta(normalizeTechnologies(parsed), readTechnologyMeta(storageKey));
    return normalized.length ? normalized : fallback;
  } catch {
    return fallback;
  }
}

export function hasGuestDraftData() {
  if (typeof window === "undefined") return false;
  if (localStorage.getItem(GUEST_DIRTY_FLAG) !== "1") return false;

  const guestTechs = readStoredTechs(GUEST_STORAGE_KEY);
  if (extractModifiedLessons(guestTechs).length > 0) return true;

  const defaultTechs = cloneTechnologies();
  if (guestTechs.length !== defaultTechs.length) return true;

  return guestTechs.some((technology, index) => hasTechnologyMetadataChanges(technology, index));
}

export function writeStoredTechs(storageKey, techList) {
  if (typeof window === "undefined") return;

  const normalized = normalizeTechnologies(techList);
  const raw = JSON.stringify(normalized);
  const metadataRaw = JSON.stringify(buildTechnologyMeta(normalized));

  localStorage.setItem(storageKey, raw);
  localStorage.setItem(getMetadataStorageKey(storageKey), metadataRaw);

  if (isGuestStorageKey(storageKey)) {
    localStorage.setItem(GUEST_DIRTY_FLAG, "1");
    localStorage.setItem(getMetadataStorageKey(GUEST_STORAGE_KEY), metadataRaw);
    localStorage.setItem(LEGACY_GUEST_STORAGE_KEY, raw);
    localStorage.setItem(getMetadataStorageKey(LEGACY_GUEST_STORAGE_KEY), metadataRaw);
  }
}

export function clearStoredTechs(storageKey) {
  if (typeof window === "undefined") return;

  localStorage.removeItem(storageKey);
  localStorage.removeItem(getMetadataStorageKey(storageKey));

  if (isGuestStorageKey(storageKey)) {
    localStorage.removeItem(GUEST_STORAGE_KEY);
    localStorage.removeItem(LEGACY_GUEST_STORAGE_KEY);
    localStorage.removeItem(getMetadataStorageKey(GUEST_STORAGE_KEY));
    localStorage.removeItem(getMetadataStorageKey(LEGACY_GUEST_STORAGE_KEY));
    localStorage.removeItem(GUEST_DIRTY_FLAG);
  }
}

export function mergeStudyEntries(entries, cachedTechs = []) {
  const nextTechs = normalizeTechnologies(cachedTechs).length ? normalizeTechnologies(cachedTechs) : cloneTechnologies();
  const techMap = new Map(nextTechs.map((tech) => [tech.name, tech]));

  for (const entry of entries || []) {
    if (isTechnologyMetaEntry(entry)) continue;

    const technologyName = String(entry?.technology_name || "").trim();
    const lessonId = Number(entry?.lesson_id);

    if (!technologyName || !lessonId) continue;

    let tech = techMap.get(technologyName);
    if (!tech) {
      tech = normalizeTechnology({
        name: technologyName,
        category: "Minhas tecnologias",
        categoryAccent: "Conteudos organizados",
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

  if (/Failed to fetch|network|fetch|abort|timed out|timeout/i.test(message)) {
    return "Nao foi possivel falar com o Supabase agora. Seus dados continuam no cache local.";
  }

  return message;
}

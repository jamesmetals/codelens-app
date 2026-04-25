import { useEffect, useRef, useState } from "react";
import anime from "animejs";

import { technologies } from "./utils/mockData";
import {
  getAuthRedirectUrl,
  supabase,
  supabaseConfigured,
  supabaseStudyEntriesTable,
} from "./supabase";
import {
  DEFAULT_CATEGORIES,
  getCategoriesStorageKey,
  getFlagsStorageKey,
  readStoredCategories,
  readStoredFlags,
  writeStoredCategories,
  writeStoredFlags,
  createCategoryRegistryPayload,
  parseCategoryRegistryEntry,
  clearStoredTechs,
  createTechnologyMetadataPayload,
  createTechnologyId,
  createStudyEntryPayload,
  extractTechnologyMetadataEntries,
  extractModifiedLessons,
  getFriendlySyncError,
  getStorageKey,
  hasGuestDraftData,
  mergeTechnologyLists,
  mergeRemoteTechnologies,
  mergeStudyEntries,
  readStoredTechs,
  writeStoredTechs,
} from "./studySync";
import {
  createDraftLesson,
  resolveActiveLessonAfterTechListUpdate,
} from "./utils/studyNavigation";
import DashboardHome from "./components/home/DashboardHome";
import TechnologyModal from "./components/home/TechnologyModal";
import CategoryManagerModal from "./components/home/CategoryManagerModal";
import DevBriefPanel from "./components/devbrief/DevBriefPanel";
import StudyRoom from "./components/study/StudyRoom";
import TechnologyContentsList from "./components/home/TechnologyContentsList";
import AccountPanel from "./components/auth/AccountPanel";

const VIEW_HOME = "home";
const VIEW_TECH_LIST = "tech-list";
const VIEW_STUDY = "study";

function shouldSendDebugTelemetry() {
  const hostname = typeof window !== "undefined" ? window.location.hostname : "";
  const isLoopbackHost = hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]";
  return import.meta.env.DEV && isLoopbackHost && import.meta.env.VITE_ENABLE_DEBUG_TELEMETRY === "true";
}

function sendDebugTelemetry(url, payload) {
  if (!shouldSendDebugTelemetry()) return;
  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": payload.sessionId || "local" },
    body: JSON.stringify({
      ...payload,
      timestamp: Date.now(),
    }),
  }).catch(() => {});
}

function isKnownView(view) {
  return view === VIEW_HOME || view === VIEW_TECH_LIST || view === VIEW_STUDY;
}

function createNavigationState(view, technology, lesson) {
  return {
    __codelensNavigation: true,
    view,
    technologyId: technology?.id ?? null,
    lessonId: lesson?.id ?? null,
    lessonSnapshot: view === VIEW_STUDY && lesson ? lesson : null,
  };
}

function resolveNavigationState(state, techs) {
  const safeTechs = Array.isArray(techs) ? techs : [];
  const fallbackTechnology = safeTechs[0] || technologies[0] || null;
  const requestedView = isKnownView(state?.view) ? state.view : VIEW_HOME;
  const requestedTechnologyId = state?.technologyId;

  const nextTechnology = requestedTechnologyId != null
    ? safeTechs.find((tech) => String(tech.id) === String(requestedTechnologyId)) || fallbackTechnology
    : fallbackTechnology;

  if (requestedView === VIEW_HOME) {
    return {
      view: VIEW_HOME,
      technology: nextTechnology,
      lesson: null,
    };
  }

  if (!nextTechnology) {
    return {
      view: VIEW_HOME,
      technology: null,
      lesson: null,
    };
  }

  if (requestedView === VIEW_TECH_LIST) {
    return {
      view: VIEW_TECH_LIST,
      technology: nextTechnology,
      lesson: null,
    };
  }

  const nextLesson = (nextTechnology.contents || []).find(
    (lesson) => String(lesson.id) === String(state?.lessonId),
  ) || state?.lessonSnapshot || null;

  if (!nextLesson) {
    return {
      view: VIEW_TECH_LIST,
      technology: nextTechnology,
      lesson: null,
    };
  }

  return {
    view: VIEW_STUDY,
    technology: nextTechnology,
    lesson: nextLesson,
  };
}

function App() {
  const REMOTE_SYNC_TIMEOUT_MS = 12000;
  const [authUser, setAuthUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(!supabaseConfigured);
  const [, setAuthError] = useState("");
  const [syncNotice, setSyncNotice] = useState("");
  const [lastSyncedAt, setLastSyncedAt] = useState("");
  const [showAccountPanel, setShowAccountPanel] = useState(false);

  const storageKey = getStorageKey(authUser?.id);
  const categoriesKey = getCategoriesStorageKey(authUser?.id);

  const [categoryList, setCategoryList] = useState(() => readStoredCategories(getCategoriesStorageKey()));
  const [flagList, setFlagList] = useState(() => readStoredFlags(getFlagsStorageKey()));
  const [techList, setTechList] = useState(() => readStoredTechs(getStorageKey()));
  const initialNavigationRef = useRef(null);
  if (!initialNavigationRef.current) {
    initialNavigationRef.current = resolveNavigationState(
      typeof window !== "undefined" ? window.history.state : null,
      techList,
    );
  }
  const [activeTechnology, setActiveTechnology] = useState(() => initialNavigationRef.current.technology);
  const [activeLesson, setActiveLesson] = useState(() => initialNavigationRef.current.lesson);
  const [isDevBriefOpen, setIsDevBriefOpen] = useState(false);
  const [contextCode, setContextCode] = useState("");
  const [devBriefSeed, setDevBriefSeed] = useState(0);
  const [currentView, setCurrentView] = useState(() => initialNavigationRef.current.view);
  const [technologyModal, setTechnologyModal] = useState({
    open: false,
    mode: "create",
    technology: null,
  });
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const techListRef = useRef(techList);
  const debugRunIdRef = useRef(`run-${Date.now()}`);
  const activeTechnologyRef = useRef(activeTechnology);
  const currentViewRef = useRef(currentView);

  const navigateTo = (view, options = {}) => {
    const {
      historyMode = "push",
      lesson = null,
      technology = activeTechnology ?? techListRef.current[0] ?? technologies[0] ?? null,
    } = options;

    sendDebugTelemetry("http://127.0.0.1:7503/ingest/e9208422-b9d4-4023-8ce8-d968ff184ec2", {
      sessionId: "47a2b5",
      runId: debugRunIdRef.current,
      hypothesisId: "H3",
      location: "App.jsx:navigateTo",
      message: "navigateTo called",
      data: {
        targetView: view,
        historyMode,
        lessonId: lesson?.id ?? null,
        technologyId: technology?.id ?? null,
        fromView: currentView,
        fromLessonId: activeLesson?.id ?? null,
      },
    });

    const nextLesson = view === VIEW_STUDY ? lesson : null;
    activeTechnologyRef.current = technology;
    currentViewRef.current = view;

    setActiveTechnology(technology);
    setActiveLesson(nextLesson);
    setCurrentView(view);

    if (typeof window !== "undefined" && historyMode !== "none") {
      const method = historyMode === "replace" ? "replaceState" : "pushState";
      window.history[method](createNavigationState(view, technology, nextLesson), "");
    }
  };

  const applyTechList = (nextTechs) => {
    setTechList(nextTechs);
    setActiveTechnology((current) => nextTechs.find((tech) => tech.id === current?.id) || nextTechs[0] || technologies[0]);
    setActiveLesson((current) => {
      if (!current) return null;

      const nextLesson = resolveActiveLessonAfterTechListUpdate(current, nextTechs, {
        technologyId: activeTechnologyRef.current?.id ?? null,
        view: currentViewRef.current,
      });
      if (nextLesson) return nextLesson;

      sendDebugTelemetry("http://127.0.0.1:7503/ingest/e9208422-b9d4-4023-8ce8-d968ff184ec2", {
        sessionId: "47a2b5",
        runId: debugRunIdRef.current,
        hypothesisId: "H1",
        location: "App.jsx:applyTechList:setActiveLesson",
        message: "activeLesson not found in nextTechs; resetting to null",
        data: {
          currentLessonId: current?.id ?? null,
          currentLessonTitle: current?.title ?? null,
          nextTechsCount: Array.isArray(nextTechs) ? nextTechs.length : 0,
        },
      });

      return null;
    });
  };

  const loadLocalTechList = (userId = null) => {
    const nextTechs = readStoredTechs(getStorageKey(userId));
    applyTechList(nextTechs);
    return nextTechs;
  };

  const persistTechListNow = (nextTechs, userId = authUser?.id || null) => {
    const result = writeStoredTechs(getStorageKey(userId), nextTechs);

    if (result?.ok === false) {
      setSyncNotice("A imagem ficou grande demais para o armazenamento local. Tente um arquivo menor.");
    }

    return result;
  };

  const handleStructuralSync = async (nextTechs, nextCategories, nextFlags) => {
    if (nextTechs) {
      applyTechList(nextTechs);
      persistTechListNow(nextTechs);
    }
    if (nextCategories) {
      setCategoryList(nextCategories);
      writeStoredCategories(getCategoriesStorageKey(authUser?.id), nextCategories);
    }
    if (nextFlags) {
      setFlagList(nextFlags);
      writeStoredFlags(getFlagsStorageKey(authUser?.id), nextFlags);
    }

    const syncTechs = nextTechs || techList;
    const syncCats = nextCategories || categoryList;

    if (supabaseConfigured && supabase && authUser?.id) {
      try {
        await syncRemoteTechnologies(authUser.id, syncTechs, syncCats);
      } catch (error) {
        console.warn("Falha na sincronização estrutural (categorias/tecnologias):", error);
      }
    }
  };

  const openCreateTechnologyModal = () => {
    setTechnologyModal({
      open: true,
      mode: "create",
      technology: null,
    });
  };

  const openEditTechnologyModal = (technology) => {
    setTechnologyModal({
      open: true,
      mode: "edit",
      technology,
    });
  };

  const closeTechnologyModal = () => {
    setTechnologyModal((current) => ({ ...current, open: false }));
  };

  const withRemoteTimeout = (builder) => {
    if (!builder || typeof builder.abortSignal !== "function") return builder;
    if (typeof AbortSignal === "undefined" || typeof AbortSignal.timeout !== "function") return builder;
    return builder.abortSignal(AbortSignal.timeout(REMOTE_SYNC_TIMEOUT_MS));
  };

  const runRemoteQuery = async (builder) => {
    const query = Promise.resolve(withRemoteTimeout(builder));
    let timerId;

    const timeout = new Promise((_, reject) => {
      timerId = window.setTimeout(() => {
        reject(new Error("Supabase request timeout"));
      }, REMOTE_SYNC_TIMEOUT_MS);
    });

    try {
      return await Promise.race([query, timeout]);
    } finally {
      window.clearTimeout(timerId);
    }
  };

  const syncRemoteTechnologies = async (userId, nextTechs, nextCategories) => {
    if (!supabaseConfigured || !supabase || !userId) return;

    const payload = nextTechs.map((technology, index) => createTechnologyMetadataPayload(userId, technology, index));
    
    if (nextCategories) {
      payload.push(createCategoryRegistryPayload(userId, nextCategories));
    }

    const { error } = await runRemoteQuery(supabase
      .from(supabaseStudyEntriesTable)
      .upsert(payload, { onConflict: "user_id,technology_name,lesson_id" }));

    if (error) throw error;
  };

  const migrateGuestStudyToCloud = async (user) => {
    if (!user?.id || typeof window === "undefined") return false;
    if (!hasGuestDraftData()) return false;

    const guestTechs = readStoredTechs(getStorageKey());
    const guestCategories = readStoredCategories(getCategoriesStorageKey());
    const modifiedLessons = extractModifiedLessons(guestTechs);

    await syncRemoteTechnologies(user.id, guestTechs, guestCategories);

    if (modifiedLessons.length) {
      const payload = modifiedLessons.map(({ technologyName, lesson }) =>
        createStudyEntryPayload(user.id, technologyName, lesson),
      );

      const { error } = await runRemoteQuery(supabase
        .from(supabaseStudyEntriesTable)
        .upsert(payload, { onConflict: "user_id,technology_name,lesson_id" }));

      if (error) throw error;
    }

    clearStoredTechs(getStorageKey());
    return true;
  };

  const syncRemoteStudy = async (user, options = {}) => {
    if (!supabaseConfigured || !supabase || !user?.id) {
      loadLocalTechList();
      return;
    }

    const { migrateGuest = false } = options;
    const guestDraftTechs = migrateGuest && hasGuestDraftData()
      ? readStoredTechs(getStorageKey())
      : [];
    setSyncNotice("Carregando seus blocos salvos...");

    try {
      const cachedUserTechs = guestDraftTechs.length
        ? mergeTechnologyLists(readStoredTechs(getStorageKey(user.id)), guestDraftTechs)
        : readStoredTechs(getStorageKey(user.id));
      const cachedCategories = readStoredCategories(getCategoriesStorageKey(user.id));
      
      // Update the UI immediately with whatever is in the local cache before waiting for the network
      applyTechList(cachedUserTechs);
      setCategoryList(cachedCategories);

      let remoteEntries = [];
      let { data, error } = await runRemoteQuery(supabase
        .from(supabaseStudyEntriesTable)
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false }));

      if (error) throw error;
      remoteEntries = data || [];

      if (guestDraftTechs.length) {
        setSyncNotice("Migrando seus dados locais para a conta Google...");
        const migrated = await migrateGuestStudyToCloud(user);

        if (migrated) {
          ({ data, error } = await runRemoteQuery(supabase
            .from(supabaseStudyEntriesTable)
            .select("*")
            .eq("user_id", user.id)
            .order("updated_at", { ascending: false })));

          if (error) throw error;
          remoteEntries = data || [];
        }
      }

      const remoteCategoriesEntry = remoteEntries.find(entry => parseCategoryRegistryEntry(entry) !== null);
      if (remoteCategoriesEntry) {
        setCategoryList(parseCategoryRegistryEntry(remoteCategoriesEntry));
        writeStoredCategories(getCategoriesStorageKey(user.id), parseCategoryRegistryEntry(remoteCategoriesEntry));
      }

      const mergedBase = mergeRemoteTechnologies(
        extractTechnologyMetadataEntries(remoteEntries || []),
        cachedUserTechs,
      );
      const merged = mergeStudyEntries(remoteEntries || [], mergedBase);
      applyTechList(merged);
      writeStoredTechs(getStorageKey(user.id), merged);
      setSyncNotice("Conteudo sincronizado com sua conta Google.");
      setLastSyncedAt(new Date().toISOString());
      setAuthError("");
    } catch (error) {
      if (guestDraftTechs.length) {
        const fallbackTechs = mergeTechnologyLists(readStoredTechs(getStorageKey(user.id)), guestDraftTechs);
        applyTechList(fallbackTechs);
        writeStoredTechs(getStorageKey(user.id), fallbackTechs);
      } else {
        loadLocalTechList(user.id);
      }
      setAuthError(getFriendlySyncError(error));
      setSyncNotice("Falha na nuvem. Usando o cache local deste dispositivo.");
    }
  };

  useEffect(() => {
    techListRef.current = techList;
  }, [techList]);

  useEffect(() => {
    activeTechnologyRef.current = activeTechnology;
  }, [activeTechnology]);

  useEffect(() => {
    currentViewRef.current = currentView;
  }, [currentView]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const handlePopState = (event) => {
      sendDebugTelemetry("http://127.0.0.1:7503/ingest/e9208422-b9d4-4023-8ce8-d968ff184ec2", {
        sessionId: "47a2b5",
        runId: debugRunIdRef.current,
        hypothesisId: "H2",
        location: "App.jsx:handlePopState",
        message: "popstate fired",
        data: {
          stateView: event?.state?.view ?? null,
          stateLessonId: event?.state?.lessonId ?? null,
          stateTechnologyId: event?.state?.technologyId ?? null,
        },
      });

      const nextNavigation = resolveNavigationState(event.state, techListRef.current);
      activeTechnologyRef.current = nextNavigation.technology;
      currentViewRef.current = nextNavigation.view;
      setActiveTechnology(nextNavigation.technology);
      setActiveLesson(nextNavigation.lesson);
      setCurrentView(nextNavigation.view);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.history.replaceState(createNavigationState(currentView, activeTechnology, activeLesson), "");
  }, [activeLesson, activeTechnology, currentView]);

  useEffect(() => {
    if (!authChecked) return;
    const storageResult = writeStoredTechs(storageKey, techList);

    if (storageResult?.ok === false) {
      setSyncNotice("A imagem ficou grande demais para o armazenamento local. Tente um arquivo menor.");
    }
  }, [authChecked, storageKey, techList]);

  useEffect(() => {
    writeStoredCategories(categoriesKey, categoryList);
  }, [categoryList, categoriesKey]);

  useEffect(() => {
    if (activeTechnology) {
      const updated = techList.find((tech) => tech.id === activeTechnology.id);
      if (updated) setActiveTechnology(updated);
    }
  }, [techList, activeTechnology]);

  const resolvedActiveTechnology = activeTechnology ?? techList[0] ?? technologies[0] ?? null;
  const resolvedView = !isKnownView(currentView)
    ? VIEW_HOME
    : currentView === VIEW_STUDY && !activeLesson
      ? (resolvedActiveTechnology ? VIEW_TECH_LIST : VIEW_HOME)
      : currentView;

  useEffect(() => {
    sendDebugTelemetry("http://127.0.0.1:7503/ingest/e9208422-b9d4-4023-8ce8-d968ff184ec2", {
      sessionId: "47a2b5",
      runId: debugRunIdRef.current,
      hypothesisId: "H1",
      location: "App.jsx:view-resolution-effect",
      message: "view resolution snapshot",
      data: {
        currentView,
        resolvedView,
        activeLessonId: activeLesson?.id ?? null,
        activeTechnologyId: activeTechnology?.id ?? null,
        resolvedActiveTechnologyId: resolvedActiveTechnology?.id ?? null,
        techCount: Array.isArray(techList) ? techList.length : 0,
      },
    });
  }, [activeLesson?.id, activeTechnology?.id, currentView, resolvedActiveTechnology?.id, resolvedView, techList]);

  const handleSaveTechnology = async (technologyDraft) => {
    const nextName = String(technologyDraft?.name || "").trim();

    if (!nextName) {
      return { ok: false, error: "Informe um nome para a tecnologia." };
    }

    const hasDuplicate = techList.some((tech) => (
      tech.name.toLowerCase() === nextName.toLowerCase()
      && tech.id !== technologyDraft?.id
    ));

    if (hasDuplicate) {
      return { ok: false, error: "Ja existe uma tecnologia com esse nome." };
    }

    const sanitizedImage = technologyDraft?.image?.src
      ? {
        src: technologyDraft.image.src,
        aspectRatio: technologyDraft.image.aspectRatio,
        zoom: technologyDraft.image.zoom,
        offsetX: technologyDraft.image.offsetX,
        offsetY: technologyDraft.image.offsetY,
      }
      : null;

    const isEditing = Boolean(technologyDraft?.id);

    if (isEditing) {
      const previousTechnology = techList.find((tech) => tech.id === technologyDraft.id);

      if (!previousTechnology) {
        return { ok: false, error: "Tecnologia nao encontrada para edicao." };
      }

      if (
        previousTechnology.name !== nextName
        && supabaseConfigured
        && supabase
        && authUser?.id
      ) {
        try {
          setSyncNotice("Atualizando o nome da tecnologia na nuvem...");
          const { error } = await runRemoteQuery(supabase
            .from(supabaseStudyEntriesTable)
            .update({ technology_name: nextName })
            .eq("user_id", authUser.id)
            .eq("technology_name", previousTechnology.name));

          if (error) throw error;

          setLastSyncedAt(new Date().toISOString());
          setAuthError("");
        } catch (error) {
          return { ok: false, error: getFriendlySyncError(error) };
        }
      }

      const nextTechList = techList.map((tech) => (
        tech.id === technologyDraft.id
          ? {
            ...tech,
            name: nextName,
            image: sanitizedImage,
            category: technologyDraft.category || tech.category || "Minhas tecnologias",
            categoryAccent: tech.categoryAccent || "Conteúdos organizados",
          }
          : tech
      ));

      applyTechList(nextTechList);
      persistTechListNow(nextTechList);

      if (supabaseConfigured && supabase && authUser?.id) {
        try {
          await syncRemoteTechnologies(authUser.id, nextTechList);
          setLastSyncedAt(new Date().toISOString());
          setAuthError("");
          setSyncNotice("Tecnologia atualizada e alinhada com sua conta Google.");
        } catch (error) {
          setAuthError(getFriendlySyncError(error));
          setSyncNotice("Tecnologia atualizada neste dispositivo. A nuvem nao respondeu agora.");
          return { ok: true };
        }
      } else {
        setSyncNotice("Tecnologia atualizada neste dispositivo.");
      }

      return { ok: true, createdTechnology: null };
    }

    const nextTechnology = {
      id: createTechnologyId(nextName),
      name: nextName,
      image: sanitizedImage,
      category: technologyDraft?.category || "Minhas tecnologias",
      categoryAccent: "Conteúdos organizados",
      progress: 0,
      lessons: 0,
      aiSessions: 0,
      currentLesson: "",
      nextFocus: "",
      note: "",
      contents: [],
    };

    const nextTechList = [nextTechnology, ...techList];
    applyTechList(nextTechList);
    persistTechListNow(nextTechList);
    navigateTo(VIEW_TECH_LIST, {
      historyMode: "push",
      technology: nextTechnology,
    });

    if (supabaseConfigured && supabase && authUser?.id) {
      try {
        await syncRemoteTechnologies(authUser.id, nextTechList);
        setLastSyncedAt(new Date().toISOString());
        setAuthError("");
        setSyncNotice("Tecnologia adicionada e sincronizada com sua conta Google.");
      } catch (error) {
        setAuthError(getFriendlySyncError(error));
        setSyncNotice("Tecnologia adicionada neste dispositivo. A nuvem nao respondeu agora.");
        return { ok: true };
      }
    } else {
      setSyncNotice("Tecnologia adicionada neste dispositivo.");
    }
    return { ok: true, createdTechnology: nextTechnology };
  };

  const handleDeleteTechnology = async (technologyToDelete) => {
    const targetTechnology = techList.find((tech) => tech.id === technologyToDelete?.id);

    if (!targetTechnology) {
      return { ok: false, error: "Tecnologia nao encontrada para exclusao." };
    }

    if (supabaseConfigured && supabase && authUser?.id) {
      try {
        setSyncNotice("Excluindo tecnologia na nuvem...");
        const { error } = await runRemoteQuery(supabase
          .from(supabaseStudyEntriesTable)
          .delete()
          .eq("user_id", authUser.id)
          .eq("technology_name", targetTechnology.name));

        if (error) throw error;
        setLastSyncedAt(new Date().toISOString());
        setAuthError("");
      } catch (error) {
        return { ok: false, error: getFriendlySyncError(error) };
      }
    }

    const nextTechList = techList.filter((tech) => tech.id !== targetTechnology.id);
    applyTechList(nextTechList);

    if (activeTechnology?.id === targetTechnology.id) {
      navigateTo(VIEW_HOME, { historyMode: "replace" });
    }

    setSyncNotice(
      authUser
        ? "Tecnologia excluida da sua conta Google."
        : "Tecnologia excluida deste dispositivo.",
    );

    return { ok: true };
  };

  const handleDeleteContent = async (technologyId, lessonId) => {
    const targetTechnology = techList.find((tech) => tech.id === technologyId);
    const targetLesson = targetTechnology?.contents.find((lesson) => lesson.id === lessonId);

    if (!targetTechnology || !targetLesson) {
      return { ok: false, error: "Conteudo nao encontrado para exclusao." };
    }

    if (supabaseConfigured && supabase && authUser?.id) {
      try {
        setSyncNotice("Excluindo conteudo na nuvem...");
        const { error } = await runRemoteQuery(supabase
          .from(supabaseStudyEntriesTable)
          .delete()
          .eq("user_id", authUser.id)
          .eq("technology_name", targetTechnology.name)
          .eq("lesson_id", lessonId));

        if (error) throw error;

        setLastSyncedAt(new Date().toISOString());
        setAuthError("");
      } catch (error) {
        return { ok: false, error: getFriendlySyncError(error) };
      }
    }

    const nextTechList = techList.map((tech) => {
      if (tech.id !== technologyId) return tech;

      const nextContents = tech.contents.filter((lesson) => lesson.id !== lessonId);
      return {
        ...tech,
        contents: nextContents,
        lessons: nextContents.length,
      };
    });

    applyTechList(nextTechList);
    setActiveLesson((current) => (current?.id === lessonId ? null : current));
    setSyncNotice(
      authUser
        ? "Conteudo excluido e sincronizado com sua conta Google."
        : "Conteudo excluido deste dispositivo.",
    );

    return { ok: true };
  };

  /* eslint-disable react-hooks/exhaustive-deps -- auth bootstrap is intentionally mounted once. */
  useEffect(() => {
    if (!supabaseConfigured || !supabase) {
      loadLocalTechList();
      setSyncNotice("Login Google e salvamento remoto estao desligados neste ambiente.");
      return undefined;
    }

    let active = true;

    const bootstrapAuth = async () => {
      setAuthChecked(false);

      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (!active) return;

      if (error) {
        setAuthError(getFriendlySyncError(error));
      }

      const nextUser = session?.user || null;
      setAuthUser(nextUser);

      if (nextUser) {
        await syncRemoteStudy(nextUser, { migrateGuest: true });
      } else {
        loadLocalTechList();
        setSyncNotice("Suas anotacoes ficam salvas apenas neste navegador ate voce entrar com Google.");
        setLastSyncedAt("");
      }

      if (active) setAuthChecked(true);
    };

    bootstrapAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!active) return;

      if (_event === "TOKEN_REFRESHED" || _event === "USER_UPDATED") {
        setAuthUser(session?.user || null);
        return;
      }

      setAuthChecked(false);
      const nextUser = session?.user || null;
      setAuthUser(nextUser);
      setShowAccountPanel(false);

      if (_event === "SIGNED_OUT") {
        navigateTo(VIEW_HOME, { historyMode: "replace" });
      }

      if (nextUser) {
        await syncRemoteStudy(nextUser, { migrateGuest: true });
      } else {
        loadLocalTechList();
        setSyncNotice("Sua sessao foi encerrada. O app continua usando o cache local deste navegador.");
        setLastSyncedAt("");
      }

      setAuthChecked(true);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);
  /* eslint-enable react-hooks/exhaustive-deps */

  const handleUpdateContent = async (techId, updatedContent) => {
    const targetTechnology = techList.find((tech) => tech.id === techId);
    const technologyName = targetTechnology?.name || activeTechnology?.name;
    const normalizedContent = {
      ...updatedContent,
      isDraft: false,
    };

    const nextTechList = techList.map((tech) => {
      if (tech.id === techId) {
        const contentIdx = tech.contents.findIndex((content) => content.id === normalizedContent.id);
        const newContents = contentIdx === -1
          ? [normalizedContent, ...tech.contents]
          : tech.contents.map((content) => (content.id === normalizedContent.id ? normalizedContent : content));

        return { ...tech, contents: newContents, lessons: newContents.length };
      }

      return tech;
    });

    applyTechList(nextTechList);

    if (!supabaseConfigured || !supabase || !authUser?.id) {
      setSyncNotice("Salvo localmente neste dispositivo.");
      return { location: "local" };
    }

    try {
      setSyncNotice("Salvando seu estudo na nuvem...");
      const payload = createStudyEntryPayload(authUser.id, technologyName, normalizedContent);
      const { error } = await runRemoteQuery(supabase
        .from(supabaseStudyEntriesTable)
        .upsert(payload, { onConflict: "user_id,technology_name,lesson_id" }));

      if (error) throw error;

      setSyncNotice("Salvo e sincronizado com sua conta Google.");
      setLastSyncedAt(new Date().toISOString());
      setAuthError("");
      return { location: "cloud" };
    } catch (error) {
      setAuthError(getFriendlySyncError(error));
      setSyncNotice("Salvo localmente. A nuvem nao respondeu agora.");
      return { location: "local" };
    }
  };

  const handleCreateContentForTechnology = (technology) => {
    if (!technology?.id) return;
    navigateTo(VIEW_STUDY, {
      technology,
      lesson: createDraftLesson(),
    });
  };

  const handleSignInWithGoogle = async () => {
    if (!supabaseConfigured || !supabase) {
      setAuthError("Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY para ativar o login Google.");
      return;
    }

    try {
      setAuthError("");
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: getAuthRedirectUrl(),
        },
      });

      if (error) throw error;
    } catch (error) {
      setAuthError(getFriendlySyncError(error));
    }
  };

  const handleSignOut = async () => {
    setShowAccountPanel(false);

    try {
      if (supabaseConfigured && supabase) {
        const { error } = await supabase.auth.signOut({ scope: "local" });
        if (error) throw error;
      }
      setAuthError("");
    } catch (error) {
      setAuthError(getFriendlySyncError(error));
    } finally {
      setAuthUser(null);
      navigateTo(VIEW_HOME, { historyMode: "replace" });
      loadLocalTechList();
      setLastSyncedAt("");
      setSyncNotice("Sessao encerrada. O app segue funcionando com cache local neste navegador.");
      setAuthChecked(true);
    }
  };

  useEffect(() => {
    if (resolvedView !== VIEW_HOME) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      return undefined;
    }

    const timeline = anime.timeline({
      easing: "easeOutExpo",
      duration: 900,
    });

    timeline
      .add({
        targets: '[data-reveal="nav"]',
        opacity: [0, 1],
        translateY: [-24, 0],
        duration: 650,
      })
      .add(
        {
          targets: '[data-reveal="hero"]',
          opacity: [0, 1],
          translateY: [42, 0],
          delay: anime.stagger(130),
          duration: 920,
        },
        "-=200",
      )
      .add(
        {
          targets: '[data-reveal="panel"]',
          opacity: [0, 1],
          translateY: [38, 0],
          delay: anime.stagger(110),
          duration: 850,
        },
        "-=480",
      );

    anime({
      targets: ".hero-orb",
      translateX: (_, index) => (index % 2 === 0 ? [0, 22] : [0, -18]),
      translateY: (_, index) => (index === 0 ? [0, -18] : [0, 18]),
      scale: [{ value: 1.04 }, { value: 0.98 }],
      duration: 4200,
      easing: "easeInOutSine",
      direction: "alternate",
      loop: true,
    });

    return () => {
      anime.remove(".hero-orb");
      anime.remove('[data-reveal="nav"]');
      anime.remove('[data-reveal="hero"]');
      anime.remove('[data-reveal="panel"]');
    };
  }, [resolvedView]);

  useEffect(() => {
    if (resolvedView !== VIEW_TECH_LIST && resolvedView !== VIEW_STUDY) {
      return undefined;
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      return undefined;
    }

    const timeline = anime.timeline({
      easing: "easeOutExpo",
      duration: 750,
    });

    timeline
      .add({
        targets: '[data-reveal="view-nav"]',
        opacity: [0, 1],
        translateY: [-14, 0],
        duration: 520,
      })
      .add(
        {
          targets: '[data-reveal="view-main"]',
          opacity: [0, 1],
          translateY: [22, 0],
          duration: 680,
        },
        "-=300",
      );

    return () => {
      anime.remove('[data-reveal="view-nav"]');
      anime.remove('[data-reveal="view-main"]');
    };
  }, [resolvedView]);

  return (
    <div className="app-shell">
      {resolvedView === VIEW_HOME ? (
        <DashboardHome
          authUser={authUser}
          onCreateTechnology={openCreateTechnologyModal}
          onEditTechnology={openEditTechnologyModal}
          onOpenAccount={() => setShowAccountPanel(true)}
          onManageCategories={() => setIsCategoryManagerOpen(true)}
          onSelectTechnology={(technology) => {
            navigateTo(VIEW_TECH_LIST, { technology });
          }}
          onSignInWithGoogle={handleSignInWithGoogle}
          onCreateContentForTechnology={handleCreateContentForTechnology}
          setActiveTechnology={setActiveTechnology}
          supabaseConfigured={supabaseConfigured}
          technologies={techList}
          categories={categoryList}
          flags={flagList}
          onSyncStructure={handleStructuralSync}
        />
      ) : null}

      {resolvedView === VIEW_TECH_LIST && (
        <TechnologyContentsList 
           key={resolvedActiveTechnology?.id || "tech-list"}
           activeTechnology={resolvedActiveTechnology}
           authUser={authUser}
           flags={flagList}
           onBack={() => navigateTo(VIEW_HOME)}
           onCreateContent={() => handleCreateContentForTechnology(resolvedActiveTechnology)}
           onDeleteContent={handleDeleteContent}
           onEditTechnology={openEditTechnologyModal}
           onOpenAccount={() => setShowAccountPanel(true)}
           onOpenStudyRoom={(lesson) => {
             navigateTo(VIEW_STUDY, {
               lesson,
               technology: resolvedActiveTechnology,
             });
           }}
           onSignInWithGoogle={handleSignInWithGoogle}
           supabaseConfigured={supabaseConfigured}
        />
      )}

      {resolvedView === VIEW_STUDY && (
        <StudyRoom 
          key={activeLesson?.id || "study-room"}
          activeTechnology={activeTechnology}
          activeLesson={activeLesson}
          authUser={authUser}
          flags={flagList}
          onSyncStructure={handleStructuralSync}
          onBack={() => navigateTo(VIEW_TECH_LIST, { technology: resolvedActiveTechnology })}
          onOpenAccount={() => setShowAccountPanel(true)}
          onOpenDevBrief={(code) => {
            setContextCode(code);
            setDevBriefSeed((current) => current + 1);
            setIsDevBriefOpen(true);
          }}
          onSignInWithGoogle={handleSignInWithGoogle}
          onUpdateContent={(updated) => handleUpdateContent(resolvedActiveTechnology.id, updated)}
          supabaseConfigured={supabaseConfigured}
        />
      )}

      {/* Camada do DevBrief AI */}
      <DevBriefPanel 
        key={devBriefSeed}
        isOpen={isDevBriefOpen} 
        onClose={() => setIsDevBriefOpen(false)} 
        initialCode={contextCode}
      />

      <TechnologyModal
        isOpen={technologyModal.open}
        mode={technologyModal.mode}
        technology={technologyModal.technology}
        onClose={closeTechnologyModal}
        onDelete={handleDeleteTechnology}
        onSave={handleSaveTechnology}
        categoryList={categoryList}
        onProceedToEditor={(createdTech) => {
          closeTechnologyModal();
          handleCreateContentForTechnology(createdTech);
        }}
      />

      {isCategoryManagerOpen && (
        <CategoryManagerModal
          isOpen={isCategoryManagerOpen}
          onClose={() => setIsCategoryManagerOpen(false)}
          categoryList={categoryList}
          techList={techList}
          onSyncStructure={handleStructuralSync}
        />
      )}

      {showAccountPanel && authUser ? (
        <AccountPanel
          authUser={authUser}
          lastSyncedAt={lastSyncedAt}
          onClose={() => setShowAccountPanel(false)}
          onSignOut={handleSignOut}
          syncNotice={syncNotice}
        />
      ) : null}
    </div>
  );
}

export default App;

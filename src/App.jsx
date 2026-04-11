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
  clearStoredTechs,
  createTechnologyMetadataPayload,
  createTechnologyId,
  createStudyEntryPayload,
  extractTechnologyMetadataEntries,
  extractModifiedLessons,
  getFriendlySyncError,
  getStorageKey,
  hasGuestDraftData,
  mergeRemoteTechnologies,
  mergeStudyEntries,
  readStoredTechs,
  writeStoredTechs,
} from "./studySync";
import DashboardHome from "./components/home/DashboardHome";
import TechnologyModal from "./components/home/TechnologyModal";
import DevBriefPanel from "./components/devbrief/DevBriefPanel";
import StudyRoom from "./components/study/StudyRoom";
import TechnologyContentsList from "./components/home/TechnologyContentsList";
import AccountPanel from "./components/auth/AccountPanel";

const VIEW_HOME = "home";
const VIEW_TECH_LIST = "tech-list";
const VIEW_STUDY = "study";

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

  const [techList, setTechList] = useState(() => readStoredTechs(getStorageKey()));
  const [activeTechnology, setActiveTechnology] = useState(() => readStoredTechs(getStorageKey())[0] || technologies[0]);
  const [activeLesson, setActiveLesson] = useState(null);
  const [isDevBriefOpen, setIsDevBriefOpen] = useState(false);
  const [contextCode, setContextCode] = useState("");
  const [devBriefSeed, setDevBriefSeed] = useState(0);
  const [currentView, setCurrentView] = useState(VIEW_HOME);
  const [technologyModal, setTechnologyModal] = useState({
    open: false,
    mode: "create",
    technology: null,
  });
  const techListRef = useRef(techList);

  const navigateTo = (view, options = {}) => {
    const {
      historyMode = "push",
      lesson = null,
      technology = activeTechnology ?? techListRef.current[0] ?? technologies[0] ?? null,
    } = options;

    const nextLesson = view === VIEW_STUDY ? lesson : null;

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

      for (const tech of nextTechs) {
        const nextLesson = tech.contents.find((lesson) => lesson.id === current.id);
        if (nextLesson) return nextLesson;
      }

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

  const syncRemoteTechnologies = async (userId, nextTechs) => {
    if (!supabaseConfigured || !supabase || !userId) return;

    const payload = nextTechs.map((technology, index) => createTechnologyMetadataPayload(userId, technology, index));
    const { error } = await runRemoteQuery(supabase
      .from(supabaseStudyEntriesTable)
      .upsert(payload, { onConflict: "user_id,technology_name,lesson_id" }));

    if (error) throw error;
  };

  const migrateGuestStudyToCloud = async (user) => {
    if (!user?.id || typeof window === "undefined") return false;
    if (!hasGuestDraftData()) return false;

    const guestTechs = readStoredTechs(getStorageKey());
    const modifiedLessons = extractModifiedLessons(guestTechs);

    await syncRemoteTechnologies(user.id, guestTechs);

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
    setSyncNotice("Carregando seus blocos salvos...");

    try {
      const cachedUserTechs = readStoredTechs(getStorageKey(user.id));
      let remoteEntries = [];
      let { data, error } = await runRemoteQuery(supabase
        .from(supabaseStudyEntriesTable)
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false }));

      if (error) throw error;
      remoteEntries = data || [];

      if (migrateGuest && remoteEntries.length === 0 && hasGuestDraftData()) {
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
      loadLocalTechList(user.id);
      setAuthError(getFriendlySyncError(error));
      setSyncNotice("Falha na nuvem. Usando o cache local deste dispositivo.");
    }
  };

  useEffect(() => {
    techListRef.current = techList;
  }, [techList]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const initialNavigation = resolveNavigationState(window.history.state, techListRef.current);
    setActiveTechnology(initialNavigation.technology);
    setActiveLesson(initialNavigation.lesson);
    setCurrentView(initialNavigation.view);
    window.history.replaceState(
      createNavigationState(
        initialNavigation.view,
        initialNavigation.technology,
        initialNavigation.lesson,
      ),
      "",
    );

    const handlePopState = (event) => {
      const nextNavigation = resolveNavigationState(event.state, techListRef.current);
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
    if (activeTechnology) {
      const updated = techList.find((tech) => tech.id === activeTechnology.id);
      if (updated) setActiveTechnology(updated);
    }
  }, [techList, activeTechnology]);

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
            category: tech.category || "Minhas tecnologias",
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

      return { ok: true };
    }

    const nextTechnology = {
      id: createTechnologyId(nextName),
      name: nextName,
      image: sanitizedImage,
      category: "Minhas tecnologias",
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
    setActiveTechnology(nextTechnology);

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
    return { ok: true };
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
        loadLocalTechList(nextUser.id);
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
        loadLocalTechList(nextUser.id);
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

    const nextTechList = techList.map((tech) => {
      if (tech.id === techId) {
        const contentIdx = tech.contents.findIndex((content) => content.id === updatedContent.id);
        const newContents = contentIdx === -1
          ? [updatedContent, ...tech.contents]
          : tech.contents.map((content) => (content.id === updatedContent.id ? updatedContent : content));

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
      const payload = createStudyEntryPayload(authUser.id, technologyName, updatedContent);
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
    if (currentView !== VIEW_HOME) return;

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
  }, [currentView]);

  return (
    <div className="app-shell">
      {currentView === VIEW_HOME ? (
        <DashboardHome
          authUser={authUser}
          onCreateTechnology={openCreateTechnologyModal}
          onEditTechnology={openEditTechnologyModal}
          onOpenAccount={() => setShowAccountPanel(true)}
          onSelectTechnology={(technology) => {
            navigateTo(VIEW_TECH_LIST, { technology });
          }}
          onSignInWithGoogle={handleSignInWithGoogle}
          setActiveTechnology={setActiveTechnology}
          supabaseConfigured={supabaseConfigured}
          technologies={techList}
        />
      ) : null}

      {currentView === VIEW_TECH_LIST && (
        <TechnologyContentsList 
           key={activeTechnology?.id || "tech-list"}
           activeTechnology={activeTechnology}
           authUser={authUser}
            onBack={() => navigateTo(VIEW_HOME)}
           onEditTechnology={openEditTechnologyModal}
           onOpenAccount={() => setShowAccountPanel(true)}
           onOpenStudyRoom={(lesson) => {
             navigateTo(VIEW_STUDY, {
               lesson,
               technology: activeTechnology,
             });
           }}
           onSignInWithGoogle={handleSignInWithGoogle}
           supabaseConfigured={supabaseConfigured}
        />
      )}

      {currentView === VIEW_STUDY && (
        <StudyRoom 
          key={activeLesson?.id || "study-room"}
          activeTechnology={activeTechnology}
          activeLesson={activeLesson}
          authUser={authUser}
          onBack={() => navigateTo(VIEW_TECH_LIST, { technology: activeTechnology })}
          onOpenAccount={() => setShowAccountPanel(true)}
          onOpenDevBrief={(code) => {
            setContextCode(code);
            setDevBriefSeed((current) => current + 1);
            setIsDevBriefOpen(true);
          }}
          onSignInWithGoogle={handleSignInWithGoogle}
          onUpdateContent={(updated) => handleUpdateContent(activeTechnology.id, updated)}
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
      />

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

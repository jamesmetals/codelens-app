import { useEffect, useState } from "react";
import anime from "animejs";

import { technologies } from "./utils/mockData";
import { getAuthRedirectUrl, supabase, supabaseConfigured, supabaseStudyEntriesTable } from "./supabase";
import {
  createTechnologyId,
  createStudyEntryPayload,
  extractModifiedLessons,
  getFriendlySyncError,
  getStorageKey,
  mergeStudyEntries,
  readStoredTechs,
  writeStoredTechs,
} from "./studySync";
import Header from "./components/home/Header";
import HeroSection from "./components/home/HeroSection";
import { TechnologySpotlight } from "./components/home/HomeWidgets";
import TechnologyModal from "./components/home/TechnologyModal";
import DevBriefPanel from "./components/devbrief/DevBriefPanel";
import StudyRoom from "./components/study/StudyRoom";
import TechnologyContentsList from "./components/home/TechnologyContentsList";
import AccountPanel from "./components/auth/AccountPanel";

function App() {
  const [authUser, setAuthUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(!supabaseConfigured);
  const [authError, setAuthError] = useState("");
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
  const [currentView, setCurrentView] = useState("home"); // "home", "tech-list", "study"
  const [technologyModal, setTechnologyModal] = useState({
    open: false,
    mode: "create",
    technology: null,
  });

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

  const migrateGuestStudyToCloud = async (user) => {
    if (!user?.id || typeof window === "undefined") return;

    const migrationKey = `codenlens_guest_migrated_${user.id}`;
    if (localStorage.getItem(migrationKey) === "done") return;

    const guestTechs = readStoredTechs(getStorageKey());
    const modifiedLessons = extractModifiedLessons(guestTechs);

    if (!modifiedLessons.length) {
      localStorage.setItem(migrationKey, "done");
      return;
    }

    const payload = modifiedLessons.map(({ technologyName, lesson }) =>
      createStudyEntryPayload(user.id, technologyName, lesson),
    );

    const { error } = await supabase
      .from(supabaseStudyEntriesTable)
      .upsert(payload, { onConflict: "user_id,technology_name,lesson_id" });

    if (error) throw error;

    localStorage.setItem(migrationKey, "done");
  };

  const syncRemoteStudy = async (user, options = {}) => {
    if (!supabaseConfigured || !supabase || !user?.id) {
      loadLocalTechList();
      return;
    }

    const { migrateGuest = false } = options;
    setSyncNotice("Carregando seus blocos salvos...");

    try {
      if (migrateGuest) {
        await migrateGuestStudyToCloud(user);
      }

      const { data, error } = await supabase
        .from(supabaseStudyEntriesTable)
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (error) throw error;

      const merged = mergeStudyEntries(data || [], readStoredTechs(getStorageKey(user.id)));
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
    writeStoredTechs(storageKey, techList);
  }, [storageKey, techList]);

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
          const { error } = await supabase
            .from(supabaseStudyEntriesTable)
            .update({ technology_name: nextName })
            .eq("user_id", authUser.id)
            .eq("technology_name", previousTechnology.name);

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
          }
          : tech
      ));

      applyTechList(nextTechList);
      setSyncNotice(
        previousTechnology.name !== nextName && authUser
          ? "Tecnologia atualizada e alinhada com sua conta Google."
          : "Tecnologia atualizada neste dispositivo.",
      );

      return { ok: true };
    }

    const nextTechnology = {
      id: createTechnologyId(nextName),
      name: nextName,
      image: sanitizedImage,
      progress: 0,
      lessons: 0,
      aiSessions: 0,
      currentLesson: "",
      nextFocus: "",
      note: "",
      contents: [],
    };

    applyTechList([nextTechnology, ...techList]);
    setActiveTechnology(nextTechnology);
    setSyncNotice("Tecnologia adicionada neste dispositivo.");
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

      const nextUser = session?.user || null;
      setAuthUser(nextUser);
      setShowAccountPanel(false);

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

    setTechList(nextTechList);

    if (!supabaseConfigured || !supabase || !authUser?.id) {
      setSyncNotice("Salvo localmente neste dispositivo.");
      return { location: "local" };
    }

    try {
      setSyncNotice("Salvando seu estudo na nuvem...");
      const payload = createStudyEntryPayload(authUser.id, technologyName, updatedContent);
      const { error } = await supabase
        .from(supabaseStudyEntriesTable)
        .upsert(payload, { onConflict: "user_id,technology_name,lesson_id" });

      if (error) throw error;

      setSyncNotice("Salvo e sincronizado com sua conta Google.");
      setLastSyncedAt(new Date().toISOString());
      setAuthError("");
      return { location: "cloud" };
    } catch (error) {
      setAuthError(getFriendlySyncError(error));
      setSyncNotice("Salvo localmente. A sincronizacao remota vai depender da configuracao do Supabase.");
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
      loadLocalTechList();
      setLastSyncedAt("");
      setSyncNotice("Sessao encerrada. O app segue funcionando com cache local neste navegador.");
      setAuthChecked(true);
    }
  };

  useEffect(() => {
    if (currentView !== "home") return;

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
      {/* Background Elements */}
      <div className="hero-orb orb-left" />
      <div className="hero-orb orb-right" />
      <div className="noise-layer" />

      <Header
        authUser={authUser}
        onOpenAccount={() => setShowAccountPanel(true)}
        onSignInWithGoogle={handleSignInWithGoogle}
        supabaseConfigured={supabaseConfigured}
        syncNotice={syncNotice}
      />

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 pb-14 sm:px-6 lg:px-8">
        {!supabaseConfigured ? (
          <section className="soft-panel mt-5 flex items-start gap-3 border border-amber-500/10 bg-amber-500/5 p-4 text-sm text-amber-100">
            <div className="mt-0.5 h-2 w-2 rounded-full bg-amber-400" />
            <div>
              <p className="font-semibold">Login Google e nuvem ainda desligados neste ambiente</p>
              <p className="mt-1 text-amber-100/80">
                Defina `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` e `VITE_AUTH_REDIRECT_URL` para liberar o sync entre dispositivos.
              </p>
            </div>
          </section>
        ) : null}

        {authChecked && authError ? (
          <section className="soft-panel mt-5 flex items-start gap-3 border border-rose-500/10 bg-rose-500/5 p-4 text-sm text-rose-100">
            <div className="mt-0.5 h-2 w-2 rounded-full bg-rose-400" />
            <div>
              <p className="font-semibold">Camada de login/sync com alerta</p>
              <p className="mt-1 text-rose-100/80">{authError}</p>
            </div>
          </section>
        ) : null}

        {authChecked && syncNotice ? (
          <section className="soft-panel mt-5 flex items-start gap-3 border border-sky-500/10 bg-sky-500/5 p-4 text-sm text-sky-100">
            <div className="mt-0.5 h-2 w-2 rounded-full bg-sky-400" />
            <div>
              <p className="font-semibold">{authUser ? "Conta Google conectada" : "Modo local"}</p>
              <p className="mt-1 text-sky-100/80">{syncNotice}</p>
            </div>
          </section>
        ) : null}

        {currentView === "home" && (
          <>
            <HeroSection />

            <section className="grid gap-6">
              <TechnologySpotlight
                technologies={techList}
                activeTechnology={activeTechnology}
                setActiveTechnology={setActiveTechnology}
                onCreateTechnology={openCreateTechnologyModal}
                onEditTechnology={openEditTechnologyModal}
                onSelectTechnology={(technology) => {
                  setActiveTechnology(technology);
                  setCurrentView("tech-list");
                }}
              />
            </section>
          </>
        )}
      </main>

      {currentView === "tech-list" && (
        <TechnologyContentsList 
           activeTechnology={activeTechnology}
           onBack={() => setCurrentView("home")}
           onOpenStudyRoom={(lesson) => {
             setActiveLesson(lesson);
             setCurrentView("study");
           }}
        />
      )}

      {currentView === "study" && (
        <StudyRoom 
          activeTechnology={activeTechnology}
          activeLesson={activeLesson}
          onBack={() => setCurrentView("tech-list")}
          onOpenDevBrief={(code) => {
            setContextCode(code);
            setDevBriefSeed((current) => current + 1);
            setIsDevBriefOpen(true);
          }}
          onUpdateContent={(updated) => handleUpdateContent(activeTechnology.id, updated)}
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

import { useEffect, useState } from "react";
import anime from "animejs";

import { technologies } from "./utils/mockData";
import Header from "./components/home/Header";
import HeroSection from "./components/home/HeroSection";
import { TechnologySpotlight, ContentPreviewAsider } from "./components/home/HomeWidgets";
import DevBriefPanel from "./components/devbrief/DevBriefPanel";
import StudyRoom from "./components/study/StudyRoom";
import TechnologyContentsList from "./components/home/TechnologyContentsList";

function App() {
  const [activeTechnology, setActiveTechnology] = useState(technologies[0]);
  const [activeLesson, setActiveLesson] = useState(null);
  const [isDevBriefOpen, setIsDevBriefOpen] = useState(false);
  
  // view manager
  const [currentView, setCurrentView] = useState("home"); // "home", "tech-list", "study"

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

      {currentView === "home" && (
        <>
          <Header />
          <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 pb-14 sm:px-6 lg:px-8">
            <HeroSection activeTechnology={activeTechnology} />

            <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <div className="grid gap-6">
                <TechnologySpotlight 
                  technologies={technologies} 
                  activeTechnology={activeTechnology} 
                  setActiveTechnology={setActiveTechnology}
                  onSelectTechnology={() => setCurrentView("tech-list")} 
                />
              </div>

              <ContentPreviewAsider 
                 activeTechnology={activeTechnology} 
              />
            </section>
          </main>
        </>
      )}

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
          onOpenDevBrief={() => setIsDevBriefOpen(true)}
        />
      )}

      {/* Camada do DevBrief AI */}
      <DevBriefPanel 
        isOpen={isDevBriefOpen} 
        onClose={() => setIsDevBriefOpen(false)} 
      />
    </div>
  );
}

export default App;

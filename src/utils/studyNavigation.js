export const VIEW_STUDY = "study";

export function createDraftLesson() {
  return {
    id: Date.now(),
    title: "Novo conteudo",
    summary: "",
    fullCode: "",
    tags: [],
    status: "em-andamento",
    highlights: [],
    studyNotes: [],
    createdAt: new Date().toISOString().slice(0, 10),
    isDraft: true,
  };
}

export function findLessonInTechnologies(lessonId, techs) {
  for (const tech of Array.isArray(techs) ? techs : []) {
    const nextLesson = (tech.contents || []).find((lesson) => String(lesson.id) === String(lessonId));
    if (nextLesson) return nextLesson;
  }

  return null;
}

export function resolveActiveLessonAfterTechListUpdate(currentLesson, nextTechs, options = {}) {
  if (!currentLesson) return null;

  const matchedLesson = findLessonInTechnologies(currentLesson.id, nextTechs);
  if (matchedLesson) return matchedLesson;

  if (!currentLesson.isDraft || options.view !== VIEW_STUDY) {
    return null;
  }

  if (options.technologyId == null) {
    return currentLesson;
  }

  const technologyStillExists = (Array.isArray(nextTechs) ? nextTechs : []).some(
    (tech) => String(tech.id) === String(options.technologyId),
  );

  return technologyStillExists ? currentLesson : null;
}

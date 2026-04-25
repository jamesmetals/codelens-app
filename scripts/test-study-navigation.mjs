import assert from "node:assert/strict";

import {
  VIEW_STUDY,
  createDraftLesson,
  resolveActiveLessonAfterTechListUpdate,
} from "../src/utils/studyNavigation.js";

function createTechnology(id, contents = []) {
  return {
    id,
    name: `Tech ${id}`,
    contents,
  };
}

const persistedLesson = { id: 7, title: "Persistido", fullCode: "const x = 1;" };
const refreshedLesson = { id: 7, title: "Persistido atualizado", fullCode: "const x = 2;" };
const draftLesson = {
  ...createDraftLesson(),
  id: 101,
  title: "Novo conteudo",
};

assert.equal(createDraftLesson().isDraft, true, "rascunhos novos precisam ser marcados como draft");

assert.equal(
  resolveActiveLessonAfterTechListUpdate(
    persistedLesson,
    [createTechnology("react", [refreshedLesson])],
    { technologyId: "react", view: VIEW_STUDY },
  ),
  refreshedLesson,
  "conteudos persistidos devem ser reconciliados com a lista atualizada",
);

assert.equal(
  resolveActiveLessonAfterTechListUpdate(
    draftLesson,
    [createTechnology("react", [])],
    { technologyId: "react", view: VIEW_STUDY },
  ),
  draftLesson,
  "rascunhos nao salvos devem continuar abertos durante refresh da lista",
);

assert.equal(
  resolveActiveLessonAfterTechListUpdate(
    { id: 404, title: "Sem draft" },
    [createTechnology("react", [])],
    { technologyId: "react", view: VIEW_STUDY },
  ),
  null,
  "conteudos persistidos ausentes devem ser descartados",
);

assert.equal(
  resolveActiveLessonAfterTechListUpdate(
    draftLesson,
    [createTechnology("vue", [])],
    { technologyId: "react", view: VIEW_STUDY },
  ),
  null,
  "o rascunho nao deve sobreviver quando a tecnologia ativa deixou de existir",
);

console.log("study-navigation: ok");

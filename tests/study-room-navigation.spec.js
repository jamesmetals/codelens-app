import { expect, test } from "@playwright/test";

test("keeps a new draft open in StudyRoom after reload", async ({ page }) => {
  await page.goto("http://127.0.0.1:4173");

  await page.getByRole("button", { name: "Adicionar conteudo" }).first().click();
  await expect(page.getByRole("button", { name: "Salvar" })).toBeVisible();

  await page.reload();

  await expect(page.getByRole("button", { name: "Salvar" })).toBeVisible();
  await expect(page.getByText("Titulo do conteudo")).toBeVisible();
});

test("opens StudyRoom when adding content right after creating a technology", async ({ page }) => {
  await page.goto("http://127.0.0.1:4173");

  await page.getByRole("button", { name: "Adicionar tecnologia" }).first().click();
  await page.getByLabel("Nome da tecnologia").fill(`Tecnologia teste ${Date.now()}`);
  await page.getByRole("button", { name: "Criar tecnologia" }).click();
  await page.getByRole("button", { name: "+ Adicionar conteudo" }).click();

  await expect(page.getByRole("button", { name: "Salvar" })).toBeVisible();
  await expect(page.getByText("Titulo do conteudo")).toBeVisible();
});

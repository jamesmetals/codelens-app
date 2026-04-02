# PLAN: Integração DevBrief AI e Melhorias de UI/UX

## O que Aconteceu com o Código Anterior
Você sugeriu voltar o último commit para desfazer o que o Codex implementou, julgando ser mais rápido e econômico ("gastar tokens").
Entretanto, analisando o commit funcional indicado (`v0.1.0-funcional`), **a pasta `src/` com o código-fonte original nunca foi salva no Git**. Isso é confirmado no próprio documento de *Redesign Premium* sob a seção "Current Blocker", que já dizia que a pasta `src` estava ausente.

A "coisa bizarra" que o Codex fez foi criar recentemente um grande protótipo *mockado* inteiro num único arquivo `App.jsx`, porque ele percebeu que precisava gerar a interface visual planejada e não possuía a base anterior de código disponível para injetar.

## Objetivo Atual
1. **Limpar a bagunça do Codex**: Dividir o `App.jsx` atual (`src/`) em componentes sustentáveis em pastas.
2. **Avaliar e Implementar DevBrief AI (`devbrief-ai-spec.md`)**: Como o seu plano dizia que a função não deveria ser um produto separado, vamos criar a função **"Análise Assistida"** (*CodeInput*, *ModeSelector*, *AnalysisResult*, *CodeComparison*) no ambiente atual.
3. **Elevar a UI/UX (Design)*: Ajustar o design do protótipo que o Codex gerou, aproximando o *look-and-feel* à paleta de Dark Mode super sofisticada especificada (Cinematográfica, ChatFunnel-like).

---

## Proposta de Execução (Fase 2 da Orquestração)

Assim que o plano for aprovado, rodarei 3 Agentes (`project-planner` já rodou, entraremos com os demais) baseados no `/orchestrate`:

### Agente 1: `frontend-specialist` (Design Premium)
- Vai refatorar `App.jsx` quebrando as seções (Hero, Constellation, Review Rail) em componentes (ex. `src/components/HomeHero.jsx`).
- Vai refinar o `index.css` de fundo, garantindo que os *Design Tokens* (`#06111F`, `#0B1D35`) e os *Glows/Shadows* estejam fieis às suas expectativas, removendo as esquisitices do Codex.
- Redesenho do CSS de animações com *animejs* onde necessário.

### Agente 2: `backend-specialist / frontend-specialist colaborativo` (DevBrief AI Spec)
- Implementar a verdadeira funcionalidade em uma aba interativa (ou Drawer lateral) na interface da Aula.
- Criar a estrutura proposta pela spec gerando:
  - `CodeInput.jsx` (Área de digitação de trechos de código com contador/validação)
  - `ModeSelector.jsx` (UI para escolher entre Revisar, Bugs, Refatorar, Comparar)
  - `AnalysisResult.jsx` (A presentação visual em abas/blocos dos resultados das avaliações)

### Agente 3: `test-engineer`
- Rodar todas as validações de CSS, UX e Linter usando o seu arsenal de scripts contidos em `.agent/scripts` (ex: checklist UX) para garantir que cumprimos o esperado sem estourar regras.

---

## 🛑 User Review Required (Approval Gate)

> [!WARNING]
> **Você aprova este plano? (Responda Y/N)**
> Note que precisarei reestruturar o `App.jsx` mock que o Codex deixou na tela inicial e construir a UI do "DevBrief AI" no topo dele, já que os arquivos base originais de roteamento do Tauri e páginas não estavam armazenados no seu Git!
> 
> Gostaria que eu construa já uma simulação do DevBrief AI enviando prompt ao "Anthropic" num serviço mockado, para demonstrar o visual ao vivo do comparador, correto?

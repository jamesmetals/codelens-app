# Análise do Projeto Codelens App (James Studio DEV)

## Ideia do projeto

O **Codelens App** é um aplicativo para **organizar blocos de estudo por tecnologia**: você cria **tecnologias** (ex.: React, SQL, IA) e dentro delas **conteúdos/aulas** com título, resumo, detalhes, status, tags e uma área de código editável. O diferencial são as **anotações laterais** vinculadas a trechos de código selecionados. Os dados ficam no **localStorage** com opção de backup/sincronização no **Supabase** e export para **Markdown/PDF**.

---

# 1. Otimizações de interface (UI/UX)

## 1.1 Navegação e layout

- **Sidebar colapsável**  
  Em telas médias/pequenas, a QuickNav ocupa espaço fixo. Oferecer um botão para recolher/expandir a sidebar (ícone de menu/hambúrguer) e liberar mais área para a lista de tecnologias ou para o editor.

- **Breadcrumb**  
  Na view de uma tecnologia ou dentro do editor de conteúdo, mostrar um breadcrumb (ex.: `Home > React > Hooks`) para o usuário saber onde está e voltar em um clique.

- **Indicador de “não salvo”**  
  Quando houver alterações não persistidas (localStorage/Supabase), mostrar um indicador discreto (ex.: ponto ou “*” no título) e opcionalmente avisar ao sair (beforeunload).

- **Empty states**  
  Quando não houver tecnologias, conteúdos ou resultados de busca, exibir ilustrações ou mensagens claras (“Crie sua primeira tecnologia”, “Nenhum conteúdo encontrado”) com CTA para a ação principal.

## 1.2 Editor de conteúdo

- **Placeholder e instruções**  
  O `contenteditable` já tem placeholder; adicionar uma dica curta abaixo: “Selecione um trecho e clique em + para criar uma anotação”.

- **Barra de ferramentas mínima**  
  Para o bloco de código, considerar botões: “Limpar”, “Formatar” (indentação básica) e “Copiar” para melhorar a experiência sem virar um editor completo.

- **Preview de Markdown (opcional)**  
  Se no futuro o conteúdo suportar Markdown no resumo/detalhes, um toggle “Visualizar / Editar” melhora a leitura.

- **Anotações**  
  Na lista lateral, mostrar um preview truncado da nota e do trecho; ao passar o mouse, tooltip com texto completo. Cores das anotações com contraste acessível (evitar amarelo claro em fundo branco).

## 1.3 Modais e overlays

- **Foco e acessibilidade**  
  Ao abrir o modal de conteúdo (LessonEditor) e o Command Palette (Ctrl+K): focar o primeiro elemento interativo (input), prender o foco dentro do modal (focus trap) e restaurar o foco ao fechar. Garantir que Escape feche o modal.

- **Overlay do Command Palette**  
  Clicar no backdrop já fecha; manter consistência em todos os modais (ex.: confirmação de exclusão) e adicionar `aria-modal="true"` e `role="dialog"` onde faltar.

- **Toasts**  
  Posição fixa (ex.: canto inferior direito) evita sobrepor conteúdo importante. Considerar toasts empilháveis e auto-dismiss com timer (ex.: 4s).

## 1.4 Tema e responsividade

- **Tema**  
  Já existe claro/escuro. Sugestão: respeitar `prefers-color-scheme` na primeira visita (se o usuário nunca escolheu) e guardar a preferência no localStorage.

- **Mobile**  
  O editor em tela cheia no celular pode ficar apertado. Considerar:  
  - Aba “Código” e aba “Anotações” em vez de sempre lado a lado.  
  - Botões de ação (Voltar, PDF, Duplicar) em um menu “⋮” para ganhar espaço.

- **Impressão/PDF**  
  A classe `.print-area` e as regras `@media print` já ajudam. Melhorar: margens, quebra de página antes de cada “Conteúdo” e cabeçalho/rodapé com nome do conteúdo e data.

---

# 2. Funcionalidades existentes – melhorias

## 2.1 CRUD e dados

- **Confirmação ao excluir conteúdo**  
  Assim como existe para “Excluir tecnologia”, pedir confirmação antes de excluir um conteúdo (aula), com opção “Excluir” e “Cancelar”.

- **Undo/redo no conteúdo**  
  Hoje há undo apenas para “remover anotação”. Estender para alterações no `contentHtml` (ex.: um único nível de undo por campo) ou documentar que é “apenas anotação” para não gerar expectativa errada.

- **Validação de nomes**  
  Manter e reforçar: tecnologia e conteúdo não podem ser apenas espaços; trim e mensagem clara (“Nome da tecnologia invalido”).

## 2.2 Busca e comandos (Ctrl+K)

- **Limite de 12 resultados**  
  Está bom para performance. Opção: “Ver mais” ou scroll infinito na lista de comandos para quem tem muitas tecnologias/conteúdos.

- **Atalhos no Command Palette**  
  Exibir ao lado de cada item uma tecla (ex.: “Enter abrir”, “Ctrl+N nova tecnologia”) para usuários avançados.

- **Busca por tag**  
  Na home, a busca já considera tecnologias e conteúdos; garantir que a busca na view da tecnologia (por tag/texto) use o mesmo critério de relevância e destaque o termo no resultado.

## 2.3 Backup e Supabase

- **Único snapshot**  
  Hoje um único `VITE_SUPABASE_SNAPSHOT_ID`. Para multi-dispositivo ou multi-usuário, seria necessário múltiplos snapshots ou tabela por usuário. Documentar isso no README e, se possível, na UI (“Este backup está vinculado a um único ID”).

- **Conflitos**  
  Resolução por `updatedAt` (último vence) é simples. Na UI, ao restaurar do Supabase, mostrar uma linha do tipo “Backup remoto mais recente aplicado” ou “Dados locais mais recentes mantidos” para transparência.

- **Export/import**  
  Manter opção de “Importar e mesclar” (adicionar tecnologias ao que já existe) além de “Importar e substituir”, para não perder dados atuais por engano.

## 2.4 PDF e impressão

- **“PDF” = window.print()**  
  Está claro no código que é impressão do navegador. Melhorar:  
  - Botão “Imprimir / Salvar como PDF” e tooltip: “Use a opção do navegador para salvar como PDF”.  
  - Se no futuro quiser PDF real: usar algo como jsPDF ou react-pdf para gerar um PDF com layout dedicado (código + anotações).

---

# 3. Novas funcionalidades sugeridas

## 3.1 Prioridade alta

*(Aba “Praticar” foi removida do projeto; foco apenas no estudo.)*

- **Roteamento (URLs)**  
  Usar React Router (ou similar) com rotas como `/`, `/tecnologia/:id`, `/tecnologia/:id/conteudo/:lessonId`. Permite:  
  - Compartilhar link direto para um conteúdo.  
  - Voltar/avançar do navegador.  
  - Abrir em nova aba.

- **README do projeto**  
  Substituir o README genérico do Vite por um que descreva:  
  - O que é o app (blocos de estudo por tecnologia + anotações em código).  
  - Como rodar (npm run dev, npm run tauri).  
  - Variáveis de ambiente (Supabase).  
  - Estrutura básica das pastas (por exemplo após refatorar).

## 3.2 Prioridade média

- **Filtros avançados na view da tecnologia**  
  Além de “por tag”, filtros por status (Em andamento, Concluída, Revisar) e ordenação (data de criação, título, status).

- **Templates customizáveis**  
  Permitir criar/editar templates de conteúdo (nome, título padrão, resumo, tags iniciais, `contentHtml` inicial) além dos quatro fixos (Padrão, Teoria, Prática, Revisão).

- **Sincronização automática**  
  Já existe sync após idle; adicionar um intervalo opcional (ex.: a cada 5 min) quando Supabase estiver configurado, com indicador “Última sincronização: há X min”.

- **Atalhos de teclado**  
  Documentar e exibir em um modal “Atalhos” (Ctrl+K comandos, Ctrl+S salvar, Escape voltar, etc.).

## 3.3 Prioridade baixa

- **Modo “apresentação”**  
  Ver o conteúdo (código + anotações) em tela cheia, estilo slides, para revisão rápida.

- **Estatísticas simples**  
  Painel opcional: total de tecnologias, conteúdos, conteúdos por status, tags mais usadas.

- **Temas de cor por tecnologia**  
  Já existe gradiente/ícone por tecnologia; permitir que o usuário escolha entre alguns temas pré-definidos para essa tecnologia.

- **Backup agendado (Tauri)**  
  No build desktop, usar agendamento do SO ou um timer para exportar backup JSON para uma pasta configurável (ex.: uma vez por dia).

---

# 4. Outras otimizações (código, performance, qualidade)

## 4.1 Arquitetura e manutenção

- **Quebrar `App.jsx`**  
  O arquivo tem ~3.450 linhas. Sugestão de estrutura:  
  - `src/context/` – contexto global (subjects, lastAccessed, view, etc.) e providers.  
  - `src/hooks/` – useSubjects, useLesson, useSupabaseSync, useCommandPalette, useToast.  
  - `src/components/` – QuickNav, SubjectRow, LessonCard, LessonEditor, AnnotationCard, CommandPalette, modais (ConfirmDelete, etc.).  
  - `src/pages/` ou `src/views/` – Home, SubjectView.  
  - `src/utils/` ou `src/lib/` – sanitizeHtml, markdown export/import, normalização de subjects, createId, getTagColor, etc.  
  - `src/constants/` – LESSON_STATUSES, LESSON_TEMPLATES, SUBJECT_ICONS, COLOR_POOL, etc.  
  Assim fica mais fácil testar, reusar e dar manutenção.

- **TypeScript (opcional)**  
  Migrar para TS aos poucos (começar por tipos de Subject, Lesson, Annotation e payloads de backup/Supabase) reduz bugs e facilita refactors.

- **Testes**  
  Não há testes hoje. Prioridade:  
  - Testes unitários para funções puras: `normalizeSubjects`, `parseMarkdownSubjects`, `subjectsToMarkdown`, `sanitizeHtml`, `getTagColor`, `createLessonSku`.  
  - Depois: testes de integração para fluxos críticos (criar tecnologia → criar conteúdo → adicionar anotação → exportar backup).

## 4.2 Performance

- **Virtualização**  
  Se a lista de conteúdos ou de tecnologias ficar muito grande (centenas de itens), considerar react-window ou react-virtualized para renderizar só o visível.

- **Debounce em buscas**  
  Em campos de busca (home, view tecnologia, Command Palette), aplicar debounce (ex.: 150–200 ms) para não disparar filtros a cada tecla.

- **Memoização**  
  Já há `useMemo`/`useCallback` em vários pontos; após extrair componentes, garantir que listas (SubjectRow, LessonCard) recebam props estáveis e usar `memo` onde o re-render for pesado.

## 4.3 Segurança e robustez

- **Sanitização**  
  Manter e revisar `sanitizeHtml` (allowlist de tags/atributos) sempre que aceitar HTML de novas fontes (import Markdown, backup de terceiros).

- **Versão e migração**  
  `STORAGE_KEY = "codelens-studio-v2.1"`: ao mudar versão do app, planejar migração (ler chave antiga uma vez, gravar na nova, opcionalmente limpar a antiga) para não “perder” dados antigos.

## 4.4 Acessibilidade

- **ARIA e semântica**  
  Botões de ícone com `aria-label`; modais com `role="dialog"`, `aria-modal="true"` e `aria-labelledby`/`aria-describedby` quando fizer sentido.

- **Foco**  
  Focus trap nos modais; ao fechar, devolver foco ao elemento que abriu (ex.: botão “Abrir conteúdo”).

- **Contraste**  
  Revisar cores de status (Em andamento, Concluída, Revisar) e tags no tema claro para atender WCAG AA onde for texto legível.

## 4.5 DevOps e documentação

- **Variáveis de ambiente**  
  Documentar no README: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_SUPABASE_SNAPSHOT_ID` (opcional; default “default”).

- **Script de build**  
  Garantir que `npm run build` e `npm run tauri build` funcionem e documentar requisitos (Rust, etc.) para Tauri.

- **Changelog**  
  Manter um CHANGELOG.md (ou seção no README) com versões e mudanças principais (ex.: 2.1 – anotações, Supabase, export Markdown).

---

# 5. Resumo prioritizado

| Prioridade | Área            | Ação resumida |
|-----------|------------------|----------------|
| Alta      | Código           | Refatorar `App.jsx` em componentes, hooks, context e utils. |
| Alta      | Funcionalidade   | Implementar “Praticar” (quiz ou modo foco). |
| Alta      | Navegação        | Adicionar roteamento (URLs por tecnologia/conteúdo). |
| Alta      | Documentação     | README descrevendo o app, como rodar e env vars. |
| Média     | UI               | Sidebar colapsável, breadcrumb, empty states, foco em modais. |
| Média     | UX               | Confirmação ao excluir conteúdo; toasts com posição e auto-dismiss. |
| Média     | Backup           | Deixar claro “um snapshot Supabase”; opção “importar e mesclar”. |
| Média     | Qualidade        | Testes para funções puras e fluxos críticos. |
| Baixa     | Extras           | Filtros por status, templates customizáveis, atalhos documentados, tema por preferência do sistema. |

Se quiser, posso detalhar um plano de implementação (por exemplo: refatorar em uma semana, depois roteamento + “Praticar”, depois README e testes) ou focar em um tópico específico (só UI, só “Praticar”, só refatoração).

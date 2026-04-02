# CodenLens Premium Redesign + AI Study Layer

## Goal
Remodelar toda a interface do CodenLens como uma plataforma de estudos premium, com linguagem visual inspirada em `chatfunnel.com.br`, identidade em azul-escuro e motion design com `animejs`, incorporando de forma harmoniosa as funcoes de analise de codigo sugeridas em `Arquivos complementares/devbrief-ai-spec.md` sem transformar o projeto em outro produto.

## Strategic Direction
- Produto continua sendo um ambiente de estudo.
- A referencia do ChatFunnel entra como linguagem visual e percepcao de valor, nao como estrutura de landing page.
- O material de `devbrief-ai-spec.md` entra como fonte de funcionalidades e UX patterns, nao como base tecnica ou como novo app separado.
- O projeto deve parecer mais premium, mais cinematografico e mais impactante, mas continuar legivel, util e coerente com o fluxo de estudo.

## Design Commitment
- Topological Choice: study workspace cinematografico com shell profundo, paineis sobrepostos, camadas de foco e contraste alto entre navegacao, editor, biblioteca e assistencia IA.
- Risk Factor: primeira dobra e app shell mais dramaticos que um dashboard comum, com composicao mais autoral, depth lighting e transicoes mais ricas.
- Readability Conflict: o impacto visual fica no shell, heros internos, paineis-resumo, onboarding, cards de tecnologia e modulos IA; a leitura da aula e do codigo continua priorizando clareza.
- Cliche Liquidation: evitar grid SaaS previsivel, evitar hero split generico, evitar glow violeta, evitar copiar literalmente o site de referencia, evitar refazer o CodenLens como "DevBrief AI".

## Reference Inputs

### From ChatFunnel
- Tipografia forte em titulos, corpo limpo e contraste premium.
- Fundo escuro com superficies elevadas, brilho localizado e bordas discretas.
- CTAs com alto contraste, profundidade e acabamento de produto caro.
- Motion de reveal, float, pulse, borda viva e sensacao de sistema vivo.

### From DevBrief Spec
- Selector de linguagem
- Selector de modo de analise
- Resultado estruturado por secoes
- Comparacao entre original e refatorado
- Historico local de interacoes
- Loading state com mensagens progressivas
- Error state claro e util

### Explicit Exclusions From DevBrief Spec
- Nao adotar nome, escopo ou branding de `DevBrief AI`
- Nao reestruturar o projeto para virar analisador de codigo isolado
- Nao assumir Anthropic/Claude como stack final so porque aparece no documento
- Nao copiar estrutura de pastas, services e hooks sem validar contra o CodenLens real

## Product Integration Hypothesis
- A nova funcionalidade entra como uma camada de estudo assistido dentro do CodenLens.
- O editor de codigo passa a ter um "Painel de Analise" contextual visivel em vez de uma app separada.
- Cada aula com codigo pode abrir modos como:
  - Revisar codigo
  - Explicar como iniciante
  - Encontrar bugs
  - Refatorar
  - Comparar versoes
- O historico dessas analises fica ligado ao contexto de estudo, nao a um produto paralelo.
- O resultado da IA deve conversar com anotacoes laterais, resumo da aula e processo de revisao.

## Experience Model

### Core Identity
- Study-first
- Premium product
- Impactante e cinematografico
- Tecnico sem parecer frio
- IA como mentor de estudo, nao como gimmick

### First Fold
- Deve parecer produto premium.
- Deve continuar comunicando que o usuario esta entrando em um workspace de estudo.
- Nao sera landing page classica; sera uma entrada de workspace com forte narrativa visual.

### AI Feature Placement
- Home/dashboard:
  - destaque principal para continuar estudos
  - cards de tecnologias
  - area de "Analise Assistida" como capacidade premium secundaria do produto
- Tela de conteudo:
  - CTA contextual para analisar trecho de codigo
  - painel lateral ou drawer para modos de analise
- Tela de editor:
  - comparacao lado a lado
  - insights por severidade
  - sugestoes ligadas a anotacoes e revisao
  - painel de analise sempre visivel na composicao da tela

## Visual Direction
- Base cromatica:
  - `#06111F` fundo principal
  - `#0B1D35` fundo secundario
  - `#102846` paineis base
  - `#163E68` paineis elevados
  - `#5DA9FF` acento principal
  - `#9ED0FF` acento de brilho
  - `#EAF4FF` texto principal
  - `#93A9BF` texto secundario
  - `#F59E0B` aviso
  - `#EF4444` erro
  - `#22C55E` estados positivos pontuais
- Geometria:
  - superficies principais com `16px` a `24px`
  - elementos tecnicos com raio menor
  - mistura de superficies amplas e recortes mais precisos
- Tipografia:
  - titulos com `Space Grotesk` ou equivalente expressiva
  - corpo com `Inter` ou equivalente limpa
  - codigo com mono dedicada, sem perder contraste
- Motion:
  - `animejs` para reveals escalonados, transicoes de paineis, microinteracoes de cards, entrada de historico, feedback de copia, comparacao entre versoes e estados de carregamento
  - `prefers-reduced-motion` obrigatorio

## Scope
- Redesign do app shell completo
- Home/dashboard do workspace de estudo
- Biblioteca de tecnologias e conteudos
- Tela de aula e leitura
- Tela de editor com notas laterais
- Nova camada de analise assistida integrada ao editor/aula
- Componentes utilitarios premium: botoes, filtros, badges, tabs, drawers, toasts, cards, estados vazios

## Functional Additions To Incorporate
- Selecao de linguagem para trechos analisados
- Seletores de modo de analise
- Resultado estruturado por secoes
- Comparacao entre original e refatorado
- Historico de analises por tecnologia
- Estados de loading e erro mais sofisticados
- Acao de copiar resultado e reutilizar na aula/anotacao

## Technical Positioning
- As sugestoes tecnicas de `devbrief-ai-spec.md` sao inspiracao, nao contrato.
- O plano de implementacao deve respeitar o que o CodenLens ja usa ou vier a recuperar dos fontes reais.
- Toda decisao de API, armazenamento, hooks e estrutura de pastas sera revalidada quando os arquivos fonte reais estiverem disponiveis.

## Tasks
- [ ] Task 1: Fixar a direcao visual e de produto com base nas decisoes ja aprovadas -> Verify: plano revisado e aprovado
- [ ] Task 2: Mapear a estrutura real das telas e componentes existentes do CodenLens -> Verify: arquivos fonte localizados e superficies listadas
- [ ] Task 3: Traduzir a referencia do ChatFunnel em design tokens proprios do CodenLens -> Verify: tokens de cor, sombra, tipografia e profundidade definidos
- [ ] Task 4: Definir a arquitetura de motion com `animejs` para shell, cards, editor e paineis IA -> Verify: matriz de animacoes por componente e estado
- [ ] Task 5: Desenhar a integracao das funcoes do `devbrief-ai-spec.md` dentro do fluxo de estudo -> Verify: mapa de onde cada funcao entra no produto
- [ ] Task 6: Remodelar primeiro o app shell e a home do workspace com percepcao premium -> Verify: narrativa visual e layout-base aprovados
- [ ] Task 7: Remodelar a tela de aula e editor com painel de analise assistida -> Verify: leitura, codigo, comparacao e anotacoes convivem sem conflito
- [ ] Task 8: Planejar historico, loading, erro e feedbacks como parte da experiencia premium -> Verify: estados de suporte especificados
- [ ] Task 9: Auditar responsividade, contraste, densidade informacional e reducao de movimento -> Verify: checklist de UX e acessibilidade executado

## Harmonious Integration Rules
- A IA deve parecer extensao do estudo, nao ferramenta separada.
- O historico de analise deve conversar com o historico de aprendizagem em nivel de tecnologia.
- A comparacao de versoes deve reforcar entendimento didatico, nao so diff tecnico.
- O painel de resultados deve poder virar anotacao, resumo ou material de revisao.
- A UI da analise deve obedecer a mesma linguagem premium do restante do produto.
- O painel de analise deve permanecer visivel sem competir com a leitura principal.

## Approved Interaction Decisions
- Painel de analise assistida: sempre visivel no editor
- Historico de analises: organizado por tecnologia
- Acao principal da home: continuar estudando

## Next Planning Focus
- Definir a composicao exata do editor com painel visivel sem esmagar a area de codigo
- Definir a navegacao do historico por tecnologia e como isso cruza com aulas e revisoes
- Definir a home premium com CTA principal de retomada de estudo e CTA secundario de analise assistida

## Current Blocker
- O `index.html` aponta para `src/main.jsx`, mas a pasta `src/` nao esta presente no workspace atual. O planejamento pode continuar, mas a implementacao depende de restaurar os arquivos fonte corretos do CodenLens.

## Done When
- [ ] Direcao visual aprovada
- [ ] Integracao funcional aprovada
- [ ] Plano de redesign e incorporacao aprovado
- [ ] Estrutura fonte disponivel para implementacao
- [ ] Ordem de execucao definida por tela e por capacidade

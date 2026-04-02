# CodenLens Home Dashboard Premium

## Goal
Definir a home/dashboard do CodenLens como a porta de entrada premium do workspace de estudo, com foco principal em retomada de aprendizagem, presença visual cinematografica e capacidade secundaria de analise assistida.

## Screen Intent
- Primeira impressao: produto premium e memoravel
- Leitura imediata: "voce vai continuar estudando daqui"
- Acao principal: retomar estudo atual
- Acao secundaria: usar recursos de IA no contexto certo

## Home Narrative
- A home nao sera landing page tradicional.
- A home funciona como "hall de comando" do estudante.
- Ela precisa equilibrar:
  - continuidade de estudo
  - visao de progresso
  - biblioteca por tecnologia
  - descoberta da camada premium de analise assistida

## Layout Concept
- Estrutura base em 4 zonas:
  - faixa superior com identidade, progresso e CTA principal
  - area central com retomada de estudos e tecnologias
  - trilha lateral ou faixa auxiliar com agenda, revisoes e atividade recente
  - faixa de capacidades premium mostrando analise assistida e comparacao de codigo
- Evitar grade simetrica comum.
- Preferencia por composicao assimetrica com paineis largos e um eixo vertical forte.

## Composition Proposal

### Zone 1: Premium Entry Band
- Fundo escuro profundo com glow azul controlado
- Headline curta e forte
- Subtexto orientado a continuidade e dominio tecnico
- CTA principal:
  - `Continuar estudando`
- CTA secundario:
  - `Abrir analise assistida`
- Resumo rapido:
  - tecnologia atual
  - ultima aula
  - streak ou consistencia
  - status da proxima revisao

### Zone 2: Continue Learning Spotlight
- Card dominante, mais largo que os demais
- Deve mostrar:
  - nome da tecnologia
  - titulo da aula atual
  - ultimo ponto estudado
  - progresso percentual ou por etapas
  - preview de anotacoes ou conceitos-chave
- Funcao:
  - reduzir atrito
  - retomar exatamente de onde o usuario parou

### Zone 3: Technology Constellation
- Cards de tecnologias em composicao menos previsivel
- Cada card mostra:
  - nome
  - nivel de progresso
  - quantidade de conteudos
  - ultima atividade
  - indicador de analises IA naquela tecnologia
- O objetivo nao e listar secoes friamente; e criar sensacao de biblioteca viva

### Zone 4: Review + Momentum Rail
- Painel mais estreito com:
  - itens para revisar
  - sessoes recentes
  - lembretes de estudo
  - analises recentes dentro da tecnologia atual
- Esse trilho nao deve roubar o foco do CTA principal

### Zone 5: Premium AI Capability Showcase
- Nao como hero de marketing
- Sim como bloco operacional premium dentro da home
- Deve mostrar:
  - modos de analise disponiveis
  - exemplo de resultado estruturado
  - comparacao entre codigo original e melhorado
  - copy curta explicando valor didatico
- Objetivo:
  - reforcar percepcao de produto premium
  - educar sem desviar do fluxo principal de estudo

## Information Priority
1. Retomar estudo atual
2. Ver progresso e contexto imediato
3. Navegar por tecnologias
4. Revisar pendencias
5. Descobrir ou reusar analise assistida

## Visual Language

### Color Distribution
- 60%:
  - fundo escuro e superficies principais
- 30%:
  - paineis secundarios, blocos de progresso, trilhos
- 10%:
  - azul de destaque, indicadores vivos, CTA e focos de IA

### Typography Logic
- Headline principal com escala dramatica e tracking levemente fechado
- Titulos de cards com peso alto, mas menos espetaculosos que o hero
- Meta informacional compacta e clara
- Numeros de progresso com destaque visual e respiro

### Geometry
- Card principal de retomada com raio mais generoso
- Cards tecnicos menores com raio mais controlado
- Botoes fortes, densos, com presenca de produto premium

## Motion Plan With animejs

### Initial Load
- Reveal em cascata:
  - faixa superior
  - card de retomada
  - constelacao de tecnologias
  - trilho lateral
- Duracao percebida premium, sem ficar lenta

### Continuous Motion
- Glow muito sutil em indicadores ativos
- Barras de progresso com preenchimento animado
- Hover lift em cards de tecnologia
- CTA principal com tensao visual leve, nao pulsacao agressiva

### Contextual Motion
- Ao passar o mouse em uma tecnologia:
  - destacar progresso
  - mostrar ultima atividade
  - sugerir entrada
- Ao focar no bloco de analise assistida:
  - microtransicao nos chips de modos
  - preview de comparacao de codigo

### Accessibility
- `prefers-reduced-motion` reduz reveals para fades simples
- Nada de animar layout pesado ou propriedades caras por padrao

## Home Components To Design
- Header premium do workspace
- Hero interno de retomada
- Card principal de estudo atual
- Cards de tecnologia
- Rail de revisao e atividade
- Bloco de analise assistida
- Badges de progresso, status e historico IA
- CTA principal e secundarios
- Estados vazios elegantes

## Suggested Copy Direction
- Evitar copy de landing page de marketing
- Usar linguagem de dominio e continuidade:
  - "Volte para onde sua linha de raciocinio parou"
  - "Sua trilha de estudo continua daqui"
  - "Analise, entenda e refine sem sair da aula"

## Risks To Control
- Excesso de dramatizacao pode atrapalhar foco do estudo
- A home nao pode parecer vitrine e esconder a funcionalidade principal
- O bloco de IA nao pode competir com o CTA de continuar estudando
- Composicao cinematografica nao pode comprometer responsividade

## Tasks
- [ ] Task 1: Definir wireframe narrativo da home em zonas -> Verify: zonas aprovadas
- [ ] Task 2: Definir conteudo de cada bloco com prioridade study-first -> Verify: hierarquia validada
- [ ] Task 3: Definir design tokens especificos da home -> Verify: fundo, paineis, CTA e destaque mapeados
- [ ] Task 4: Definir motion map com `animejs` -> Verify: reveals, hovers e progress animations especificados
- [ ] Task 5: Validar relacao entre CTA principal e bloco IA -> Verify: home continua orientada a retomada

## Done When
- [ ] Estrutura da home aprovada
- [ ] Hierarquia de conteudo aprovada
- [ ] Linguagem visual aprovada
- [ ] Motion da home aprovado

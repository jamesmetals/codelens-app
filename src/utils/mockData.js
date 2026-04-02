import { History, Clock3, SearchCheck, GraduationCap, Bug, Wand2, Code2 } from "lucide-react";

export const technologies = [
  {
    name: "React",
    progress: 68,
    lessons: 14,
    aiSessions: 12,
    currentLesson: "Arquitetura de hooks e efeitos",
    nextFocus: "Refinar side effects e fluxo de estado",
    note: "As ultimas anotacoes mostram que voce travou em sincronizacao e previsibilidade do estado.",
    contents: [
      {
        id: 101,
        title: "useEffect e o ciclo de sincronização",
        summary: "O useEffect não é um lifecycle hook — é uma ferramenta de sincronização com o mundo externo. Entender essa distinção muda tudo.",
        tags: ["hooks", "efeitos colaterais"],
        status: "em-andamento",
        highlights: [
          "Nunca use useEffect para derivar estado de outro estado.",
          "Cleanup function é essencial para subscriptions e timers."
        ],
        createdAt: "2026-03-28"
      },
      {
        id: 102,
        title: "Context API — quando usar e quando não usar",
        summary: "Context não é gerenciamento de estado global. É transmissão de dados. Saber a diferença evita re-renders desnecessários.",
        tags: ["context", "estado global", "performance"],
        status: "concluido",
        highlights: [
          "Context causa re-render em todos os consumers quando muda.",
          "Prefira Zustand/Jotai se precisar de estado reativo complexo."
        ],
        createdAt: "2026-03-25"
      },
      {
        id: 103,
        title: "Padrão de composição com children",
        summary: "",
        tags: ["componentização"],
        status: "em-andamento",
        highlights: [],
        createdAt: "2026-03-30"
      }
    ]
  },
  {
    name: "SQL",
    progress: 54,
    lessons: 9,
    aiSessions: 7,
    currentLesson: "Joins, filtros e consultas compostas",
    nextFocus: "Treinar leitura de consultas e otimizacao",
    note: "A IA identificou padroes de erro recorrentes em joins e condicoes com alias.",
    contents: [
      {
        id: 201,
        title: "INNER JOIN vs LEFT JOIN — a diferença real",
        summary: "INNER retorna só a interseção. LEFT mantém todos da esquerda mesmo sem correspondência. Simples assim — mas erra-se muito.",
        tags: ["joins", "fundamentos"],
        status: "concluido",
        highlights: [
          "LEFT JOIN: linhas sem match aparecem com NULL na coluna da direita.",
          "Nunca confundir WHERE com ON dentro de um JOIN."
        ],
        createdAt: "2026-03-20"
      },
      {
        id: 202,
        title: "GROUP BY e armadilhas de alias",
        summary: "Aliases definidos no SELECT não podem ser usados no WHERE — mas podem no HAVING. Esse é um dos erros mais comuns.",
        tags: ["agregação", "alias"],
        status: "em-andamento",
        highlights: [],
        createdAt: "2026-03-29"
      }
    ]
  },
  {
    name: "IA",
    progress: 71,
    lessons: 11,
    aiSessions: 16,
    currentLesson: "Prompts, avaliacao e iteracao",
    nextFocus: "Comparar respostas e consolidar criterios",
    note: "Suas melhores sessoes vieram quando voce transformou a resposta da IA em anotacao revisavel.",
    contents: [
      {
        id: 301,
        title: "Estrutura de um bom prompt técnico",
        summary: "Role + Contexto + Instrução + Formato de saída. Esse template resolve 80% dos casos de prompts fracos.",
        tags: ["prompt engineering", "LLMs"],
        status: "em-andamento",
        highlights: [
          "Sempre especifique o formato esperado da resposta.",
          "Few-shot examples melhoram drasticamente a precisão."
        ],
        createdAt: "2026-03-31"
      }
    ]
  },
  {
    name: "Rust",
    progress: 33,
    lessons: 6,
    aiSessions: 4,
    currentLesson: "Ownership, borrowing e mutabilidade",
    nextFocus: "Fixar o modelo mental antes de avancar",
    note: "O bloco de estudo precisa ficar mais visual e didatico para reduzir friccao cognitiva.",
    contents: [
      {
        id: 401,
        title: "Ownership — o modelo mental correto",
        summary: "Cada valor tem um dono. Quando o dono sai de escopo, o valor é dropado. Não há GC. Isso não é bug — é o design.",
        tags: ["ownership", "memória"],
        status: "em-andamento",
        highlights: [
          "Move semantics: após mover, a variável original não é mais válida.",
          "Clone explícito = intenção clara de duplicação."
        ],
        createdAt: "2026-04-01"
      }
    ]
  },
];

export const reviewRail = [
  {
    title: "Revisar anotacoes de React",
    detail: "3 conceitos pendentes",
    icon: History,
  },
  {
    title: "Voltar ao exercicio de SQL",
    detail: "ult. atividade ha 2 dias",
    icon: Clock3,
  },
  {
    title: "Comparar codigo refatorado",
    detail: "modo didatico habilitado",
    icon: SearchCheck,
  },
];

export const aiModes = [
  { label: "Revisar", icon: SearchCheck },
  { label: "Explicar", icon: GraduationCap },
  { label: "Bugs", icon: Bug },
  { label: "Refatorar", icon: Wand2 },
  { label: "Comparar", icon: Code2 },
];

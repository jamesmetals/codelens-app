# 📋 DevBrief AI — Especificação Completa do Projeto

> Analisador inteligente de código com IA para portfólio de desenvolvedor júnior.
> Desenvolvido 100% com auxílio de IA usando OpenCode + skills do Claude.

---

## 🎯 Visão Geral

**Nome do app:** DevBrief AI  
**Objetivo:** O usuário cola um trecho de código e recebe uma análise completa com explicação, problemas encontrados, sugestões de melhoria e versão refatorada.  
**Stack sugerida:** React + Vite + TailwindCSS + API da Anthropic (Claude)  
**Hospedagem:** Vercel ou Netlify (gratuito)

---

## 🗂️ Estrutura de Pastas

```
devbrief-ai/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── CodeInput.jsx
│   │   ├── LanguageSelector.jsx
│   │   ├── ModeSelector.jsx
│   │   ├── AnalysisResult.jsx
│   │   ├── CodeComparison.jsx
│   │   ├── HistoryPanel.jsx
│   │   ├── LoadingState.jsx
│   │   └── ErrorMessage.jsx
│   ├── hooks/
│   │   ├── useAnalysis.js
│   │   └── useHistory.js
│   ├── services/
│   │   └── anthropic.js
│   ├── utils/
│   │   ├── prompts.js
│   │   └── parseResponse.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env.example
├── .gitignore
├── vite.config.js
├── tailwind.config.js
└── README.md
```

---

## 🖥️ Telas e Componentes

### 1. `Header.jsx`
- Logo com ícone de código (ex: `</>`)
- Nome "DevBrief AI" com tagline: *"Análise de código com inteligência artificial"*
- Botão de toggle Dark/Light mode
- Botão para abrir painel de histórico

---

### 2. `CodeInput.jsx`
**Funcionalidade:** Área onde o usuário digita ou cola o código.

**Elementos:**
- Textarea com fonte monospace (`font-mono`)
- Syntax highlight básico via biblioteca `highlight.js` ou `prism-react-renderer`
- Contador de linhas e caracteres no rodapé
- Botão "Limpar" para apagar o conteúdo
- Botão "Colar do clipboard" (`navigator.clipboard.readText()`)
- Placeholder com texto de exemplo para guiar o usuário

**Validações:**
- Mínimo de 5 caracteres para habilitar o botão de análise
- Máximo de 8.000 caracteres (exibir barra de progresso visual)

---

### 3. `LanguageSelector.jsx`
**Funcionalidade:** Dropdown para selecionar a linguagem do código.

**Opções disponíveis:**
- JavaScript / TypeScript
- Python
- Java
- C / C++
- Go
- Rust
- PHP
- Ruby
- SQL
- HTML/CSS
- Outro (campo livre)

**Comportamento:** A seleção influencia o prompt enviado à API para análise mais precisa.

---

### 4. `ModeSelector.jsx`
**Funcionalidade:** O usuário escolhe o tipo de análise desejada.

**Modos:**
| Modo | Ícone | Descrição |
|---|---|---|
| Revisão de Código | 🔍 | Análise completa com pontos positivos e negativos |
| Explicar para Iniciante | 🎓 | Explica o que o código faz em linguagem simples |
| Encontrar Bugs | 🐛 | Foca em identificar erros, falhas lógicas e vulnerabilidades |
| Refatorar | ✨ | Reescreve o código com boas práticas |
| Comparar Versões | ⚖️ | Mostra original vs. refatorado lado a lado |

**UI:** Botões tipo "chip/pill" com ícone e texto, visualmente selecionável.

---

### 5. `AnalysisResult.jsx`
**Funcionalidade:** Exibe o resultado da análise da IA em seções organizadas.

**Seções do resultado (parseadas do retorno da API):**

```
## 📝 Resumo
Breve descrição do que o código faz.

## ✅ Pontos Positivos
- Lista de boas práticas encontradas

## ⚠️ Problemas Encontrados
- Lista de problemas com nível de severidade (Crítico / Médio / Leve)

## 💡 Sugestões de Melhoria
- Lista de melhorias recomendadas

## 🔄 Código Refatorado
[bloco de código melhorado com botão copiar]
```

**Extras:**
- Botão "Copiar análise completa" (copia texto formatado)
- Botão "Salvar no histórico"
- Badge de linguagem detectada
- Tempo de análise exibido (ex: "Analisado em 3.2s")

---

### 6. `CodeComparison.jsx`
**Funcionalidade:** Modo de comparação lado a lado.

**Layout:**
- Coluna esquerda: código original com fundo vermelho claro nas linhas problemáticas
- Coluna direita: código refatorado com fundo verde claro nas linhas melhoradas
- Linha separadora central com drag para redimensionar (opcional)
- Labels "Antes" e "Depois" no topo de cada coluna

---

### 7. `HistoryPanel.jsx`
**Funcionalidade:** Painel lateral com histórico das análises da sessão.

**Armazenamento:** `localStorage` — persiste entre recarregamentos da página.

**Cada item do histórico exibe:**
- Linguagem usada (badge colorido)
- Modo de análise usado
- Primeiros 60 caracteres do código
- Data e hora da análise
- Botão para reabrir a análise
- Botão para deletar do histórico

**Limite:** 20 análises salvas (remove a mais antiga automaticamente).

---

### 8. `LoadingState.jsx`
**Funcionalidade:** Estado visual enquanto a API processa.

**Elementos:**
- Spinner ou skeleton loader
- Mensagens rotativas enquanto carrega:
  - *"Lendo seu código..."*
  - *"Identificando padrões..."*
  - *"Gerando sugestões..."*
  - *"Quase pronto..."*
- Tempo decorrido em segundos

---

### 9. `ErrorMessage.jsx`
**Funcionalidade:** Exibe erros de forma clara e amigável.

**Tipos de erro tratados:**
- API key inválida → "Chave de API não configurada corretamente."
- Timeout → "A análise demorou muito. Tente com um código menor."
- Código vazio → "Por favor, insira um código para analisar."
- Erro de rede → "Sem conexão. Verifique sua internet."
- Rate limit → "Muitas requisições. Aguarde alguns segundos."

---

## ⚙️ Services e Utilitários

### `services/anthropic.js`
Responsável pela comunicação com a API.

```javascript
// Função principal de análise
export async function analyzeCode({ code, language, mode }) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-3-haiku-20240307", // modelo mais barato/rápido
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: buildPrompt({ code, language, mode })
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  const data = await response.json();
  return data.content[0].text;
}
```

---

### `utils/prompts.js`
Constrói o prompt certo para cada modo de análise.

```javascript
export function buildPrompt({ code, language, mode }) {
  const base = `Você é um especialista em ${language}. Analise o código abaixo.\n\nCódigo:\n\`\`\`${language}\n${code}\n\`\`\`\n\n`;

  const modos = {
    review: base + `Faça uma revisão completa. Responda em português com seções:
## 📝 Resumo
## ✅ Pontos Positivos
## ⚠️ Problemas Encontrados (indique severidade: Crítico/Médio/Leve)
## 💡 Sugestões de Melhoria
## 🔄 Código Refatorado`,

    explain: base + `Explique o que esse código faz em linguagem simples para um iniciante. Use analogias do dia a dia. Responda em português.`,

    bugs: base + `Encontre todos os bugs, erros lógicos e vulnerabilidades de segurança. Para cada um: descreva o problema, o impacto e a correção. Responda em português.`,

    refactor: base + `Refatore esse código aplicando boas práticas, princípios SOLID, e padrões modernos de ${language}. Explique cada mudança feita. Responda em português.`,

    compare: base + `Refatore o código e retorne APENAS dois blocos de código: o original e o refatorado, seguidos de uma lista de diferenças. Responda em português.`
  };

  return modos[mode] || modos.review;
}
```

---

### `utils/parseResponse.js`
Faz o parse do texto da IA em seções para renderizar na UI.

```javascript
export function parseAnalysis(text) {
  const sections = {
    summary: extractSection(text, "Resumo"),
    positives: extractSection(text, "Pontos Positivos"),
    problems: extractSection(text, "Problemas Encontrados"),
    suggestions: extractSection(text, "Sugestões de Melhoria"),
    refactored: extractCodeBlock(text)
  };
  return sections;
}

function extractSection(text, title) {
  const regex = new RegExp(`##[^#]*${title}([\\s\\S]*?)(?=##|$)`, "i");
  const match = text.match(regex);
  return match ? match[1].trim() : null;
}

function extractCodeBlock(text) {
  const regex = /```[\w]*\n([\s\S]*?)```/g;
  const matches = [...text.matchAll(regex)];
  return matches.length > 0 ? matches[matches.length - 1][1] : null;
}
```

---

### `hooks/useAnalysis.js`
Hook customizado para gerenciar estado da análise.

```javascript
export function useAnalysis() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [mode, setMode] = useState("review");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  const analyze = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    const start = Date.now();

    try {
      const text = await analyzeCode({ code, language, mode });
      const parsed = parseAnalysis(text);
      setResult(parsed);
      setElapsedTime(((Date.now() - start) / 1000).toFixed(1));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { code, setCode, language, setLanguage, mode, setMode,
           result, loading, error, elapsedTime, analyze };
}
```

---

### `hooks/useHistory.js`
Hook para gerenciar o histórico no `localStorage`.

```javascript
const MAX_HISTORY = 20;

export function useHistory() {
  const [history, setHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("devbrief_history")) || [];
    } catch {
      return [];
    }
  });

  const addEntry = (entry) => {
    const newHistory = [
      { ...entry, id: Date.now(), timestamp: new Date().toISOString() },
      ...history
    ].slice(0, MAX_HISTORY);

    setHistory(newHistory);
    localStorage.setItem("devbrief_history", JSON.stringify(newHistory));
  };

  const removeEntry = (id) => {
    const updated = history.filter(h => h.id !== id);
    setHistory(updated);
    localStorage.setItem("devbrief_history", JSON.stringify(updated));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("devbrief_history");
  };

  return { history, addEntry, removeEntry, clearHistory };
}
```

---

## 🎨 Design e UX

### Paleta de Cores (Dark Mode padrão)
```css
:root {
  --bg-primary: #0d1117;
  --bg-secondary: #161b22;
  --bg-card: #21262d;
  --accent: #58a6ff;
  --accent-green: #3fb950;
  --accent-red: #f85149;
  --accent-yellow: #d29922;
  --text-primary: #e6edf3;
  --text-secondary: #8b949e;
  --border: #30363d;
}
```

### Tipografia
- Display/Logo: `JetBrains Mono` (monospace com personalidade)
- Body/UI: `Inter` ou `DM Sans`
- Código: `Fira Code` com ligatures habilitadas

### Animações obrigatórias
- Fade-in suave nos resultados (0.3s ease)
- Loading shimmer no skeleton
- Hover lift nos botões (translateY -2px)
- Toast de confirmação ao copiar
- Slide-in do painel de histórico

---

## 🔐 Variáveis de Ambiente

Arquivo `.env` (nunca commitado no Git):
```
VITE_ANTHROPIC_API_KEY=sua_chave_aqui
```

Arquivo `.env.example` (commitado como referência):
```
VITE_ANTHROPIC_API_KEY=your_api_key_here
```

**Adicionar ao `.gitignore`:**
```
.env
node_modules/
dist/
```

---

## 📦 Dependências

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "highlight.js": "^11.9.0",
    "react-syntax-highlighter": "^15.5.0",
    "lucide-react": "^0.383.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.3",
    "vite": "^5.2.0"
  }
}
```

---

## 🚀 Etapas de Desenvolvimento (ordem sugerida)

### Fase 1 — Setup
- [ ] Criar projeto com `npm create vite@latest devbrief-ai -- --template react`
- [ ] Instalar e configurar TailwindCSS
- [ ] Criar estrutura de pastas
- [ ] Criar arquivo `.env` com a chave da API
- [ ] Testar conexão com a API (chamada simples no console)

### Fase 2 — Lógica Core
- [ ] Implementar `services/anthropic.js`
- [ ] Implementar `utils/prompts.js` com todos os modos
- [ ] Implementar `utils/parseResponse.js`
- [ ] Implementar `hooks/useAnalysis.js`
- [ ] Testar análise completa no console/DevTools

### Fase 3 — Componentes Base
- [ ] `CodeInput.jsx` com textarea e validações
- [ ] `LanguageSelector.jsx` com dropdown
- [ ] `ModeSelector.jsx` com botões chip
- [ ] `LoadingState.jsx` com mensagens rotativas
- [ ] `ErrorMessage.jsx` com tipos de erro

### Fase 4 — Resultado e Histórico
- [ ] `AnalysisResult.jsx` com seções parseadas
- [ ] Botão copiar com feedback visual (toast)
- [ ] `hooks/useHistory.js` com localStorage
- [ ] `HistoryPanel.jsx` com lista e ações

### Fase 5 — Feature Extra
- [ ] `CodeComparison.jsx` modo lado a lado
- [ ] Dark/Light mode toggle

### Fase 6 — Polimento
- [ ] Responsividade mobile completa
- [ ] Animações e micro-interações
- [ ] Testar todos os casos de erro
- [ ] README completo com prints do app

### Fase 7 — Deploy
- [ ] Push para GitHub (repositório público)
- [ ] Deploy na Vercel com variável de ambiente configurada
- [ ] Testar em produção

---

## 📝 README.md do Projeto (template)

```markdown
# DevBrief AI 🔍

Analisador inteligente de código com IA. Cole seu código e receba análise
completa, identificação de bugs, sugestões e refatoração automática.

## ✨ Funcionalidades
- 5 modos de análise (Revisão, Explicação, Bugs, Refatoração, Comparação)
- Suporte a 10+ linguagens de programação
- Histórico de análises com localStorage
- Dark/Light mode
- Totalmente responsivo

## 🛠️ Tech Stack
- React + Vite
- TailwindCSS
- Anthropic Claude API
- LocalStorage para persistência

## 🚀 Como rodar localmente
```bash
git clone https://github.com/seu-usuario/devbrief-ai
cd devbrief-ai
npm install
cp .env.example .env
# Adicione sua API key no .env
npm run dev
```

## 🌐 Deploy
[Ver aplicação ao vivo](https://devbrief-ai.vercel.app)
```

---

## 🧠 Skills do Claude recomendadas para usar no OpenCode

### ✅ Essencial — `frontend-design`
**Use em:** Toda vez que pedir para criar ou estilizar um componente.

**Como usar no prompt:**
> *"Usando a skill frontend-design, crie o componente `AnalysisResult.jsx` com design profissional, dark mode, animações suaves e tipografia distinta. O componente recebe `{ summary, positives, problems, suggestions, refactored }` como props."*

**Por que usar:** Essa skill instrui a IA a evitar designs genéricos e criar interfaces memoráveis com boa tipografia, animações e hierarquia visual.

---

### ✅ Recomendada — `skill-creator` (se disponível)
**Use em:** Criar uma skill customizada para o seu projeto específico.

**Como usar:**
> *"Crie uma skill chamada `devbrief-context` que ensine a IA a sempre considerar a estrutura de pastas e padrões de código deste projeto ao gerar novos componentes."*

**Por que usar:** Garante consistência ao longo do desenvolvimento — a IA não vai "esquecer" o padrão que você estabeleceu.

---

### 📌 Dica de Workflow no OpenCode

Para cada componente novo, estruture seu prompt assim:

```
[Skill: frontend-design]

Contexto do projeto: App React com Vite + TailwindCSS chamado DevBrief AI.
Tema: Dark mode com paleta #0d1117 / #58a6ff / #3fb950.
Fonte de código: JetBrains Mono.

Tarefa: Crie o componente [NOME].jsx.

Requisitos:
- [lista o que o componente deve fazer]
- [quais props recebe]
- [qual comportamento tem]

Não use bibliotecas externas além de lucide-react para ícones.
O resultado deve ser um único arquivo .jsx completo e funcional.
```

---

## ✅ Checklist Final antes de mostrar ao gestor

- [ ] App funciona 100% em produção (Vercel)
- [ ] Sem erros no console do navegador
- [ ] Funciona bem no celular
- [ ] README com print do app e link do deploy
- [ ] Código organizado e legível no GitHub
- [ ] `.env` não está commitado
- [ ] Tratamento de erro funcionando (testar sem API key)
- [ ] Pelo menos 3 análises de exemplo prontas para demonstrar ao vivo

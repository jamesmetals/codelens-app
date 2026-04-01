# James Studio DEV (Codelens App)

Aplicativo para organizar **blocos de estudo por tecnologia**: crie tecnologias (ex.: React, SQL, IA), adicione conteúdos/aulas com código editável e **anotações laterais** vinculadas a trechos do código. Ideal para estudo e revisão com backup local em **SQLite** (navegador) e export em Markdown ou impressão (PDF).

## Ultima versao funcional

- Versao registrada: `0.1.0`
- Data do snapshot: `2026-04-01`
- Referencia detalhada: `VERSAO_FUNCIONAL.md`

## O que o app faz

- **Tecnologias** – Organize por assunto (frontend, backend, banco de dados, etc.).
- **Conteúdos** – Aulas com título, resumo, detalhes, status (Em andamento, Concluída, Revisar) e tags.
- **Editor** – Área de código editável; selecione um trecho e adicione anotações laterais (explicações, notas).
- **Backup** – Exporte/importe JSON ou Markdown; **SQLite local** (sql.js + IndexedDB) guarda um snapshot no navegador, sem conta nem configuração.
- **Atalhos** – `Ctrl+K` abre a paleta de comandos (buscar tecnologia, conteúdo ou criar novo).

## Como rodar

### Web (Vite)

```bash
npm install
npm run dev
```

Abre em `http://localhost:5173` (ou a porta indicada no terminal).

### Atalho na área de trabalho

Na pasta do projeto há o arquivo **`Iniciar-Codelens.bat`**. Ele inicia o servidor e abre o site no navegador.

Para ter um ícone na área de trabalho:

1. Clique com o botão direito em `Iniciar-Codelens.bat`
2. **Enviar para** → **Área de trabalho (criar atalho)**
3. (Opcional) Renomeie o atalho (ex.: "Codelens") e, no atalho, botão direito → **Propriedades** → **Alterar ícone** para escolher outro ícone

Ao dar dois cliques no atalho, uma janela do terminal abre com o servidor e o navegador abre sozinho em `http://localhost:5173`. Para encerrar, feche a janela do terminal.

### Build para produção

```bash
npm run build
npm run preview   # preview do build
```

### Desktop (Tauri) – app instalável

Requisitos: [Rust](https://rustup.rs/) instalado e, no Windows, [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) (carga de trabalho “Desenvolvimento para Desktop com C++”).

**Rodar em modo desenvolvimento (janela desktop):**
```bash
npm install
npm run tauri:dev
```

**Gerar instalador para Windows:**
```bash
npm run tauri:build
```

O instalador (`.msi` ou `.exe`) fica em `src-tauri/target/release/bundle/` (pastas `msi/` ou `nsis/`). Execute o arquivo para instalar o **James Studio DEV** como aplicativo de desktop.

**Trocar o ícone do app:** coloque uma imagem quadrada (PNG ou SVG, ex.: 1024×1024) como `app-icon.png` na raiz do projeto e rode `npm run tauri:icon`.

## Variáveis de ambiente

Nenhuma variável é obrigatória. O app usa **localStorage** e **SQLite no navegador** (IndexedDB). Veja `.env.example` na raiz.

## Estrutura básica

- `src/App.jsx` – Interface principal (estado, componentes, fluxos).
- `src/index.css` – Tailwind e variáveis de tema (claro/escuro).
- `src/lib/sqlite.js` – SQLite local (sql.js + IndexedDB).
- `src-tauri/` – Configuração do app desktop (Tauri 2).

## Tecnologias

- React 19, Vite 8, Tailwind CSS, Lucide React.
- **sql.js** (SQLite no navegador) + IndexedDB para backup local.
- Tauri 2 para versão desktop.

## Licença

Projeto privado.

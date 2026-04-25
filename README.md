# Codelens App

Aplicacao web para organizar estudos por tecnologia, editar conteudos em um workspace unico e sincronizar os blocos na nuvem quando houver login com Google.

## O que o app entrega

- Organizacao de tecnologias e conteudos de estudo.
- Editor com anotacoes vinculadas a trechos selecionados.
- Persistencia local no navegador sem depender de conta.
- Sincronizacao opcional com Supabase.
- Geracao de resumo por IA via rota serverless.

## Stack

- React 19
- Vite
- Tailwind CSS
- Supabase Auth + Database
- Vercel Functions

## Como rodar

```bash
npm install
npm run dev
```

O app abre em `http://localhost:5173` por padrao.

## Build de producao

```bash
npm run build
npm run preview
```

## Variaveis de ambiente

O app funciona sem variaveis para uso local basico. Para ativar login, sincronizacao e IA, use um `.env` local baseado no arquivo `.env.example`.

### Frontend

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_AUTH_REDIRECT_URL=
VITE_SUPABASE_STUDY_TABLE=study_entries
```

### Backend

```env
GROQ_API_KEY=
ALLOWED_ORIGIN=
SUPABASE_URL=
SUPABASE_ANON_KEY=
```

Notas:

- `GROQ_API_KEY` deve ficar apenas no servidor.
- `ALLOWED_ORIGIN` pode conter 1 ou mais origens separadas por virgula.
- `SUPABASE_URL` e `SUPABASE_ANON_KEY` sao usados para validar o token JWT no backend.
- `VITE_ENABLE_DEBUG_TELEMETRY=true` habilita telemetria local de debug apenas em localhost.

## Setup do Supabase

Para habilitar a sincronizacao remota:

1. Crie um projeto no Supabase.
2. Configure o provider Google no painel Auth.
3. Rode o SQL de [supabase-study-entries.sql](./supabase-study-entries.sql) no editor SQL.
4. Configure as variaveis `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` e `VITE_AUTH_REDIRECT_URL`.

## Estrutura principal

- `src/App.jsx`: fluxo principal da aplicacao, auth e sync.
- `src/components/home/`: dashboard e navegacao por tecnologias.
- `src/components/study/`: editor e sala de estudo.
- `src/studySync.js`: persistencia local e merge com dados remotos.
- `src/supabase.js`: bootstrap do cliente Supabase.
- `api/generate-summary.js`: endpoint serverless para resumo com IA.

## Seguranca

- Credenciais de servidor nao devem ser commitadas.
- O editor sanitiza o conteudo antes de reinjetar no DOM.
- A rota `/api/generate-summary` exige token valido do Supabase, aplica validacao estrita de payload, validacao de origem, limite de taxa e limite de payload.
- O acesso ao Supabase depende de RLS aplicado na tabela `study_entries`.

## Deploy

O projeto esta preparado para deploy na Vercel com build de Vite e uma function em `api/`.

Antes do deploy:

1. Configure as variaveis de ambiente no projeto da Vercel.
2. Defina `ALLOWED_ORIGIN` com o dominio final.
3. Valide o login Google e o redirect URL no Supabase.

## Estado do repositorio

Esta é a **última versão FUNCIONAL** da plataforma (com a correção do bug de cursor no editor e o flow de sync funcionando estável).

Este repositório foi limpo para manter apenas o que faz parte do produto e do setup real. Artefatos locais, logs, arquivos de sistema e material interno de planejamento foram removidos do versionamento.

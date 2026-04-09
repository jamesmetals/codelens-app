# Ultima Versao Funcional

## Baseline

- ID da baseline: `2026-04-09-user-cloud-sync`
- Status esperado: funcional para login Google, separacao de dados por usuario e sincronizacao remota das tecnologias
- Ambiente alvo: producao em `codenlens.jamesb.com.br`

## O que esta validado nesta versao

- Login Google continua ativo pelo Supabase Auth.
- Cada usuario passa a ter cache local separado por chave propria.
- Tecnologias, capas e metadados deixam de vazar entre contas no mesmo navegador.
- A sincronizacao remota usa a tabela `study_entries` como fonte de verdade por `user_id`.
- O rascunho anonimo so e migrado automaticamente quando a conta ainda nao tem dados na nuvem.

## Persistencia de dados

- Tabela remota usada: `public.study_entries`
- Chave logica: `user_id + technology_name + lesson_id`
- Linhas de metadado de tecnologia usam `lesson_id = 0` e `title = "__technology_meta__"`
- RLS depende de `auth.uid() = user_id`

## Como pedir rollback depois

- Peça para voltar para a baseline `2026-04-09-user-cloud-sync`
- O commit publicado dessa baseline deve ser usado como referencia definitiva de retorno

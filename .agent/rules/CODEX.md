---
trigger: always_on
---

# CODEX.md - Antigravity Kit Compatibility for Codex

This file adapts the `.agent` toolkit to the Codex runtime used in this workspace.

## Purpose

- Treat `.agent/` as the project-specific operating system for planning, routing, and verification.
- Preserve the original Antigravity/Claude-oriented files without forcing Codex to pretend unsupported runtime features exist.

## Rule Priority

When instructions conflict, use this order:

1. User request
2. Codex runtime constraints and higher-priority system/developer instructions
3. `.agent/rules/CODEX.md`
4. Selected agent instructions in `.agent/agents/*.md`
5. Selected skill instructions in `.agent/skills/*/SKILL.md`
6. Workflow files in `.agent/workflows/*.md`

## Runtime Mapping

### Agents

- Files in `.agent/agents/` are role and process definitions, not automatically executable runtimes.
- Codex should read the relevant agent file and apply its principles directly.
- If the user explicitly asks for delegation, sub-agents, or parallel agent work, Codex may map this to its actual sub-agent tooling.
- If the user does not explicitly ask for delegation, orchestration is handled in the main thread by synthesizing multiple agent perspectives.

### Skills

- Skills are loaded progressively.
- Read the selected agent frontmatter first.
- Then read only the relevant `SKILL.md` files and the minimum supporting references/scripts needed for the current task.
- Do not bulk-load every skill folder.

### Workflows

- Files in `.agent/workflows/` represent intent templates, not literal slash commands in Codex.
- Map them by meaning:
  - `plan` -> planning flow
  - `orchestrate` -> structured multi-domain execution
  - `debug` -> debugging flow
  - `test` -> verification flow
  - `deploy` -> deployment flow

## Plan Artifact Policy

The original toolkit is inconsistent about plan naming. In Codex, use this normalized rule:

- A valid plan artifact is any repo-local markdown file matching one of these patterns:
  - `./PLAN-*.md` in project root
  - `./docs/PLAN-*.md`
  - an existing user-authored plan file explicitly referenced in the task
- Do not require the exact filename `PLAN.md`.
- Preferred default for new plans: `./PLAN-{task-slug}.md`

### When a Plan Is Required

- Required for multi-file, structural, or ambiguous implementation tasks.
- Optional for clearly scoped single-file or low-risk changes.
- If a valid plan already exists, update or follow it instead of creating a duplicate.

## Agent Routing Policy

- Web UI work -> `frontend-specialist`
- Backend/API/server work -> `backend-specialist`
- Database/schema/migration work -> `database-architect`
- Mobile work -> `mobile-developer`
- Debugging/root-cause tasks -> `debugger`
- Security/auth review -> `security-auditor`
- Tests -> `test-engineer`
- Documentation-only work -> `documentation-writer`
- Multi-domain work -> `orchestrator` logic applied locally unless explicit delegation is requested

### Boundary Rule

- Treat file ownership in `.agent` as a strong convention.
- In particular:
  - test files belong to `test-engineer`
  - UI/component files belong to `frontend-specialist`
  - API/server files belong to `backend-specialist`
  - schema/migration files belong to `database-architect`

## Verification Policy

- Never report a check as passed unless it was actually executed.
- Prefer project-native verification first, such as:
  - `npm run lint`
  - `npm run build`
  - targeted test commands
- Use `.agent` verification scripts when the task scope justifies them and the dependencies exist, especially:
  - `.agent/scripts/checklist.py`
  - `.agent/scripts/verify_all.py`
  - skill-level validators under `.agent/skills/*/scripts/`
- If verification was skipped or blocked, state that explicitly in the final report.

## Windows Execution Policy

- This workspace currently runs on Windows/PowerShell.
- Prefer PowerShell-native commands and Windows-safe paths.
- Avoid assuming bash-only separators or shell semantics.

## Codex Operating Convention For This Repo

For future tasks in this repository, Codex should:

1. Identify the dominant domain and read the relevant `.agent/agents/*.md` file.
2. Load only the relevant `.agent/skills/*/SKILL.md` files.
3. Use `.agent/workflows/*.md` as process templates, not literal commands.
4. Create or follow a normalized `PLAN-{slug}.md` artifact for substantial tasks.
5. Run appropriate verification commands before closing the task when feasible.

## Practical Note

In this runtime, "using `.agent`" means following its operating model as project context. It does not mean pretending the original Claude-native agent runtime or slash-command system exists when it does not.

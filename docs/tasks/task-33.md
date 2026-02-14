# Task-33: Reorganize Claude Code configuration for best practices

**Phase:** PHASE 8 - Developer Experience
**Status:** Complete
**Dependencies:** None

---

## Objective

Reorganize the project's Claude Code configuration (`.claude/`, `CLAUDE.md`, `settings`) to follow current best practices from the official Claude Code documentation. This improves context efficiency, reduces noise, and makes project conventions more discoverable.

---

## Definition of Done

- [ ] `.claude/settings.local.json` cleaned of one-off commit approvals, only reusable patterns remain
- [ ] `.claude/settings.json` (committed) created with standard shared permissions
- [ ] `.claude/rules/` directory created with modular rule files
- [ ] `CLAUDE.md` trimmed to remove content duplicated in the skill or moved to rules
- [ ] Existing skill updated with `allowed-tools` and `argument-hint` frontmatter
- [ ] No broken references between files
- [ ] `npm run test:run && npm run lint && npm run build` still pass

---

## Implementation Details

### Step 1: Clean up `.claude/settings.local.json`

Remove all one-off commit message approvals (lines containing full `git commit -m` messages with heredocs). Keep only reusable glob patterns like `Bash(npm run test:run:*)`, `Bash(git push)`, etc.

### Step 2: Create `.claude/settings.json` (committed, team-shared)

Extract the common, reusable permission patterns from `settings.local.json` into a new committed `settings.json`. This provides a baseline for any developer (or Claude session) working on the project.

Include permissions for: test, lint, build, deploy, git operations, systemctl, npm scripts, db operations.

### Step 3: Create `.claude/rules/` directory with modular rules

Create focused rule files that are auto-loaded every session:

**`.claude/rules/code-style.md`** — TypeScript strict mode, no `any`, `ApiResponse<T>` pattern, existing code conventions.

**`.claude/rules/testing.md`** — TDD approach, Vitest conventions, test behavior not implementation, deterministic tests.

**`.claude/rules/api-design.md`** — Zod schema approach, two-layer design (DB flat vs API nested), endpoint documentation requirements. Captures the key decisions from `docs/api-specification-decision.md` so Claude always has this context.

### Step 4: Trim `CLAUDE.md`

Remove sections that are now covered by:
- The `homelab-task-execution` skill (commit convention, task workflow, Definition of Done)
- The new rules files (code style, testing, API patterns)

Keep: project overview, project structure, database quick reference, key commands, tech stack table, external integrations, documentation table, important file locations.

### Step 5: Update skill frontmatter

Add to `.claude/skills/homelab-task-execution/SKILL.md` frontmatter:
- `argument-hint: "[task-number]"` for better autocomplete
- `allowed-tools` for validation commands the skill needs without prompting

### Step 6: Validate

- Verify all files parse correctly
- Run `npm run test:run && npm run lint && npm run build`
- Confirm no broken cross-references

---

## Files Created/Modified

- `.claude/settings.local.json` — Cleaned of one-off approvals
- `.claude/settings.json` — **New** — Committed shared permissions
- `.claude/rules/code-style.md` — **New** — TypeScript and code conventions
- `.claude/rules/testing.md` — **New** — Testing standards
- `.claude/rules/api-design.md` — **New** — API and schema conventions
- `.claude/skills/homelab-task-execution/SKILL.md` — Updated frontmatter
- `CLAUDE.md` — Trimmed, references rules/skill for details

---

## Validation Steps

1. Run `npm run test:run` — tests pass
2. Run `npm run lint` — no errors
3. Run `npm run build` — builds successfully
4. Verify `.claude/rules/*.md` files exist and contain expected content
5. Verify `.claude/settings.json` is valid JSON
6. Verify `CLAUDE.md` still contains essential project context
7. Verify skill YAML frontmatter is valid

---

## Notes

- This is a config/docs-only change — no application code is modified
- The `docs/initial-prompt.md` is kept as-is (historical record, not loaded by Claude automatically)
- The `docs/resources/` skills guide PDF+MD is kept as-is (reference material, loaded on demand)
- `settings.local.json` one-off commits were accumulated during the first 32 tasks and are no longer needed

---

## Commit Message

```
[claude] Task-33: Reorganize Claude Code config for best practices

- Clean settings.local.json of one-off commit approvals
- Create shared settings.json with reusable permissions
- Add .claude/rules/ for code-style, testing, and api-design
- Trim CLAUDE.md to remove content covered by skill and rules
- Update skill frontmatter with allowed-tools and argument-hint
```

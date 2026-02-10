---
name: homelab-task-execution
description: This skill should be used when the user asks to "execute a task", "work on task", "implement task", "start task-NN", "create a task", "add a task", "new task", "commit changes", "deploy to production", "run validation", or references the project task workflow. Provides the standard development workflow, commit conventions, TDD approach, task creation template, and definition of done for the homelab-observability project.
version: 1.0.0
---

# Homelab Task Execution Workflow

This skill defines the complete workflow for executing tasks in the homelab-observability project. Follow these procedures exactly when working on any project task.

## Development Philosophy

This project follows **Spec-Driven Development (SDD)** combined with **Test-Driven Development (TDD)**:

1. **Document behavior first** — Specifications exist in `docs/tasks/task-NN.md` before implementation begins
2. **Write tests for the spec** — Tests validate the specified behavior, not implementation details
3. **Implement to pass** — Write code that makes tests pass
4. **Validate continuously** — Run tests after every meaningful change

Write failing tests before implementation code. Keep tests focused, minimal, and deterministic. Refactor with confidence once tests pass.

## Task Execution Workflow

This is the standard 15-step workflow. Follow it for every task.

### Phase 1: Preparation
1. **Read the task file** — Read `docs/tasks/task-NN.md` thoroughly
2. **Verify dependencies** — Confirm prerequisite tasks are complete
3. **Understand Definition of Done** — Know what "complete" means for this task
4. **Plan complex tasks** — If the task affects >5 files, >100 lines, has multiple logical steps, or is marked CRITICAL, create a sub-plan in the task file (see [references/validation-checklists.md](references/validation-checklists.md))

### Phase 2: Implementation (TDD)
5. **Write tests** for the expected behavior
6. **Implement the feature** following the task specification
7. **Run automated validation:**
   ```bash
   npm run test:run && npm run lint && npm run build
   ```

### Phase 3: Dev Server Validation
8. **Run dev server validation:**
   - Run `npm run dev`
   - Open http://localhost:3000 in a browser
   - Check for terminal errors and fix any that occur

### Phase 4: Documentation & Commit
9. **Update task status** in `docs/tasks/task-NN.md`
10. **Update task status** in `docs/project-plans/initial-build.md`
11. **Review and update documentation** — Update if the task introduces relevant changes:
    - `README.md` — New features, commands, API changes, environment variables
    - `CLAUDE.md` — Structure changes, new patterns, schema changes, API changes
    - `WALKTHROUGH.md` — Architecture changes, new components, data flow changes (update "Last Updated" timestamp)
12. **Create commit** with proper message format (see Commit Convention below)
13. **Push to remote:** `git push`

### Phase 5: Production
14. **Deploy to production** (see [references/production-deployment.md](references/production-deployment.md))
15. **Validate production** (see [references/production-deployment.md](references/production-deployment.md))

### For Critical Tasks
Add these extra steps:
- Create a sub-plan if not already present (after step 1)
- Execute step-by-step with checkpoints
- Extra validation: manual testing of all scenarios
- Run the full test suite (not just related tests)

## Commit Convention

### Format
```
[claude] Task-NN: Brief description
```

**Example:** `[claude] Task-01: Initialize Next.js project with TypeScript`

### Rules
- **One task = one commit** — Squash intermediate work
- Squash when: multiple experimental attempts, incremental saves, commits with errors or incomplete work
- Keep history clean: one logical change = one commit

### Commit Workflow
1. Complete all work for the task
2. Update task status in task file and project plan
3. Stage all changed files: `git add .`
4. Create commit with standardized message
5. Verify commit includes all expected changes
6. Push to remote: `git push`

## Definition of Done

A task is only complete when **ALL** of these are met:

### Required
- All files created/modified as specified in the task file
- All verification steps documented in the task have passed
- No TypeScript errors (`npm run type-check` passes)
- No linting errors or warnings
- All tests pass (`npm test`)
- Task status updated in plan doc

### Task-Specific
- **Code changes:** Tests pass
- **New files:** Files are in correct locations with proper naming
- **Dependency changes:** `npm install` completes successfully
- **Build-affecting changes:** `npm run build` succeeds
- **API endpoints:** Endpoints are documented and tested

### Documentation
- Deviations from the plan are documented in the task file
- Rationale for alternative approaches is explained
- Breaking changes or risks are highlighted
- Project documentation updated if task changes affect them

## Documentation Maintenance

After each task, check whether these files need updates:

| File | When to Update |
|------|----------------|
| `README.md` | New features, API changes, commands, environment variables |
| `CLAUDE.md` | Structure changes, new patterns, schema changes, API changes |
| `WALKTHROUGH.md` | Architecture changes, new components, data flow changes |
| `docs/project-plans/initial-build.md` | Always (task status) |

## Quality Standards

### Code
- Follow existing code style in the project
- Use TypeScript strict mode (no `any` unless absolutely necessary)
- Write clear, self-documenting code
- Add comments only for non-obvious logic

### Tests
- Tests should be readable and maintainable
- Test behavior, not implementation details
- Use meaningful test descriptions
- Ensure tests are deterministic (no flaky tests)

### API
- Use consistent `ApiResponse<T>` format
- Return appropriate HTTP status codes
- Include meaningful error messages
- Document all endpoints

## Creating New Tasks

When creating a new task, use the template at `docs/tasks/task-template.md`.

### Steps
1. Determine the next task number (check `docs/project-plans/initial-build.md` for existing tasks)
2. Copy the template: `docs/tasks/task-template.md` → `docs/tasks/task-NN.md`
3. Fill in all sections:
   - **Header**: Set the task number, title, phase, status (`Pending`), and dependencies
   - **Objective**: One or two sentences on what and why
   - **Definition of Done**: Specific, checkable criteria (use `- [ ]` checkboxes)
   - **Implementation Details**: Numbered steps with code examples where helpful
   - **Files Created/Modified**: List every file that will be touched
   - **Validation Steps**: How to verify the task is complete (automated + manual)
   - **Commit Message**: Pre-written commit message following the `[claude] Task-NN:` format
4. Add the task to `docs/project-plans/initial-build.md` under the appropriate phase
5. Optionally add a **Notes** section for assumptions, risks, or alternative approaches

### Template Location
`docs/tasks/task-template.md`

### Key Principles
- Tasks should be **self-contained** — another developer (or Claude) should be able to execute it from the file alone
- Keep the scope **small enough for one commit** — split larger work into multiple tasks
- Definition of Done items must be **objectively verifiable** (not "code is clean" but "lint passes")
- Implementation steps should follow the order they'd actually be executed

## Additional Resources

- **Validation checklists by task type:** [references/validation-checklists.md](references/validation-checklists.md)
- **Production deployment procedures:** [references/production-deployment.md](references/production-deployment.md)
- **Main project plan:** `docs/project-plans/initial-build.md`
- **Individual task specs:** `docs/tasks/` directory

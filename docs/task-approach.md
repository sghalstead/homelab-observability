# Task Execution Approach

This document defines the standards and best practices for executing tasks in the Homelab Observability project.

## Development Philosophy

### Spec-Driven Development (SDD)
1. **Document behavior first**: Write specifications before implementation
2. **Test the spec**: Write tests that validate the specified behavior
3. **Implement to pass**: Write code that makes tests pass
4. **Validate continuously**: Run tests after every change

### Test-Driven Development (TDD)
- Write failing tests before writing implementation code
- Keep tests focused and minimal
- Refactor with confidence once tests pass

## Commit Strategy

### Commit Format
- Each task should result in **one commit** with the `[claude]` prefix
- Intermediate commits during task execution can be squashed before finalizing
- **Commit message format:** `[claude] Task-NN: Brief description`
  - Example: `[claude] Task-01: Initialize Next.js project with TypeScript`

### Commit Workflow
1. Complete all work for the task
2. Update task status to complete in the task file (`docs/tasks/task-NN.md`)
3. Update task status to complete in the main plan tracker (`docs/project-plan.md`)
4. Stage all changed files: `git add .`
5. Create commit with standardized message
6. Verify commit includes all expected changes
7. Push committed changes to remote: `git push`

### When to Squash
- Multiple experimental attempts during implementation
- Incremental saves while working on complex tasks
- Commits that contain errors or incomplete work
- Keep history clean: one logical change = one commit

## Definition of Done

A task is only complete when **ALL** of the following are met:

### Required Criteria
- [ ] All files created/modified as specified in task file
- [ ] All verification steps documented in task have passed
- [ ] No TypeScript errors (`npm run type-check` passes)
- [ ] No linting errors or warnings
- [ ] All tests pass (`npm test`)
- [ ] Task status updated in plan doc

### Task-Specific Criteria
- [ ] **If task involves code changes:** Tests pass
- [ ] **If task creates new files:** Files are in correct locations with proper naming
- [ ] **If task modifies dependencies:** `npm install` completes successfully
- [ ] **If task affects build:** `npm run build` succeeds
- [ ] **If task adds API endpoints:** Endpoints are documented and tested

### Documentation
- [ ] Any deviations from the plan are documented in task file
- [ ] Rationale for alternative approaches is explained
- [ ] Breaking changes or risks are highlighted

## Validation Requirements

### Automated Validation
Run these commands to verify task completion:

```bash
# Type checking
npm run type-check

# Unit and integration tests
npm test

# Linting
npm run lint

# Production build
npm run build

# Development server (manual verification)
npm run dev
```

### Manual Validation

**Development Server Verification:**
1. Run `npm run dev` to start the development server
2. Open http://localhost:3000 in a browser
3. Check for errors in the terminal output
4. Fix any errors that occur before proceeding

**Browser Verification:**
- **Browser check:** Application loads without errors
- **Console check:** No errors or warnings in browser console
- **Network tab:** API calls working correctly
- **Functionality testing:** Features work as specified

### Validation Checklist per Task Type

**For component development:**
- Component renders without errors
- Props are correctly typed
- State management works correctly
- Event handlers function properly
- Tests cover key behaviors

**For API development:**
- Endpoints respond with correct status codes
- Response data matches expected schema
- Error handling works correctly
- Tests cover success and failure cases

**For configuration tasks:**
- Configuration files are syntactically correct
- Tools recognize and use the configuration
- No conflicts with existing configuration

**For integration tasks:**
- External services connect successfully
- Data flows correctly between systems
- Error states are handled gracefully

## When to Ask Clarifying Questions

### Always Ask When:
1. **Task requirements are ambiguous**
   - "Should I use approach A or approach B?"
   - "The plan says X, but the code suggests Y. Which is correct?"

2. **Dependencies are unclear**
   - "Task-N requires output from Task-M, but Task-M isn't complete."
   - "This task depends on external factors. How should I handle this?"

3. **Multiple valid approaches exist**
   - "There are three ways to implement this. Which aligns with project goals?"
   - "The plan suggests X, but best practice is Y. Should I deviate?"

4. **Implementation differs significantly from plan**
   - "During implementation, I discovered issue Z. Should I adjust the approach?"
   - "The original plan didn't account for constraint C. How should I proceed?"

### Don't Ask When:
- Minor syntax or formatting choices
- Standard best practices (use them)
- Obvious bugs or typos in plan (fix them and document)
- Implementation details not specified in plan (use judgment)

## Complex Task Planning

### When to Create a Sub-Plan
Create a detailed sub-plan within the task file when:
- Task affects **> 5 files**
- Task involves **> 100 lines of code** changes
- Task has **multiple logical steps** that could be done independently
- Task is marked as **CRITICAL** in the main plan

### Sub-Plan Structure
```markdown
### Implementation Sub-Plan

#### Step 1: [First logical unit]
- Action items
- Expected outcome
- Verification

#### Step 2: [Second logical unit]
- Action items
- Expected outcome
- Verification

#### Checkpoint: Intermediate Verification
- [ ] Step 1 complete
- [ ] Step 2 complete
- [ ] Integration working
```

## Task Execution Workflow

### Standard Workflow
1. **Read task file** thoroughly
2. **Verify dependencies** are complete
3. **Understand Definition of Done** for this task
4. **Write tests** for the expected behavior
5. **Execute implementation** following task details
6. **Run automated validation** (`npm test`, `npm run lint`, `npm run build`)
7. **Run dev server validation:**
   - Run `npm run dev`
   - Open http://localhost:3000 in browser
   - Fix any errors that occur
8. **Update task status** in task file (`docs/tasks/task-NN.md`)
9. **Update task status** in main plan (`docs/project-plan.md`)
10. **Create commit** with proper message
11. **Push to remote:** `git push`
12. **Move to next task** (if dependencies allow)

### For Critical Tasks
1. Read task file thoroughly
2. **Create sub-plan** if not already present
3. Verify all prerequisites
4. **Execute step-by-step** with checkpoints
5. **Extra validation:** Manual testing of all scenarios
6. Run full test suite
7. Update status in task file and main plan
8. Create commit and push to remote

## Risk Management

### Before Starting a Task
- Review task dependencies
- Identify potential blockers
- Ensure required tools are available
- Backup current state (git ensures this)

### During Task Execution
- Test incrementally (don't wait until the end)
- Verify each file modification before moving to next
- Keep original implementation in mind (for rollback context)
- Document unexpected findings

### If Problems Arise
1. **Minor issues:** Fix and document in task notes
2. **Major issues:** Stop and ask for clarification
3. **Blockers:** Document clearly and move to independent tasks
4. **Bugs in plan:** Note them, fix them, document the correction

## Quality Standards

### Code Quality
- Follow existing code style in the project
- Use TypeScript strict mode (no `any` unless absolutely necessary)
- Write clear, self-documenting code
- Add comments only for non-obvious logic

### Test Quality
- Tests should be readable and maintainable
- Test behavior, not implementation details
- Use meaningful test descriptions
- Ensure tests are deterministic (no flaky tests)

### API Quality
- Use consistent response formats
- Return appropriate HTTP status codes
- Include meaningful error messages
- Document all endpoints

### Documentation Quality
- Keep README up to date
- Document breaking changes
- Explain non-obvious decisions
- Use clear, concise language

## Success Metrics

A successful task execution:
- Meets all Definition of Done criteria
- Passes all validation steps
- Maintains or improves code quality
- Preserves existing functionality
- Is properly documented
- Can be understood by future developers

## Tech Stack Reference

### Core Technologies
- **Runtime:** Node.js 20+
- **Language:** TypeScript (strict mode)
- **Framework:** Next.js 14+ (App Router)
- **Testing:** Vitest + React Testing Library + Playwright
- **Linting:** ESLint + Prettier

### Data & State
- **Database:** SQLite (via Drizzle ORM) for metrics storage
- **API:** Next.js API routes (REST)
- **State:** React Query for server state

### Monitoring Targets
- **System:** CPU, memory, temperature, disk
- **Docker:** Container stats via Docker API
- **Systemd:** Service status via D-Bus
- **AI Workloads:** Ollama API integration

### Future AI Integration (Mastra)
- Natural language queries about metrics
- Anomaly detection and alerts
- Intelligent insights and recommendations

## References

- **Main Plan:** [project-plan.md](project-plan.md)
- **Task Files:** [tasks/](tasks/) directory
- **Project Prompt:** [../homelab-obs-project-promt.md](../homelab-obs-project-promt.md)

---

*Last updated: 2026-01-02*

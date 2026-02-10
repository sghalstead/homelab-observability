# Validation Checklists

Detailed validation procedures for the homelab-observability project, organized by task type.

## Automated Validation Commands

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

## Manual Validation

### Development Server Verification
1. Run `npm run dev` to start the development server
2. Open http://localhost:3000 in a browser
3. Check for errors in the terminal output
4. Fix any errors that occur before proceeding

### Browser Verification
- **Browser check:** Application loads without errors
- **Console check:** No errors or warnings in browser console
- **Network tab:** API calls working correctly
- **Functionality testing:** Features work as specified

## Validation Checklist per Task Type

### Component Development
- Component renders without errors
- Props are correctly typed
- State management works correctly
- Event handlers function properly
- Tests cover key behaviors

### API Development
- Endpoints respond with correct status codes
- Response data matches expected schema
- Error handling works correctly
- Tests cover success and failure cases

### Configuration Tasks
- Configuration files are syntactically correct
- Tools recognize and use the configuration
- No conflicts with existing configuration

### Integration Tasks
- External services connect successfully
- Data flows correctly between systems
- Error states are handled gracefully

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

## When to Ask Clarifying Questions

### Always Ask When:
1. **Task requirements are ambiguous** — "Should I use approach A or approach B?"
2. **Dependencies are unclear** — "Task-N requires output from Task-M, but Task-M isn't complete."
3. **Multiple valid approaches exist** — "There are three ways to implement this. Which aligns with project goals?"
4. **Implementation differs significantly from plan** — "During implementation, I discovered issue Z. Should I adjust?"

### Don't Ask When:
- Minor syntax or formatting choices
- Standard best practices (use them)
- Obvious bugs or typos in plan (fix them and document)
- Implementation details not specified in plan (use judgment)

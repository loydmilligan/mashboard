# AGENTS.md - Multi-Agent Workflow

> Defines the workflow for AI agents collaborating on this project.

## Agent Roles

### Implementer Agent
**Purpose:** Execute tasks from TASKS.md

**Responsibilities:**
- Read and understand task requirements
- Implement code changes
- Write/update tests if applicable
- Self-review against acceptance criteria
- Prepare changes for review

**Constraints:**
- Only work on one task at a time
- Do not merge without reviewer approval
- Ask for clarification rather than assume

---

### Reviewer Agent
**Purpose:** Quality assurance and integration checking

**Responsibilities:**
- Verify implementation matches task requirements
- Check code fits with existing project structure
- Verify acceptance criteria are met
- Check for regressions or conflicts
- Approve or request changes

**Review Checklist:**
- [ ] Code matches task description
- [ ] Acceptance criteria satisfied
- [ ] No obvious bugs or errors
- [ ] Consistent with project code style
- [ ] No conflicts with existing code
- [ ] Error handling present where needed
- [ ] Loading states handled (if UI)

**Feedback Format:**
```
## Review: [TASK-ID]

### Status: [APPROVED / CHANGES REQUESTED]

### Summary
[Brief assessment]

### Issues (if any)
1. [Issue]: [Suggested fix]

### Suggestions (optional, non-blocking)
- [Improvement idea]
```

---

## Workflow Sequence

```
┌─────────────────────────────────────────────────────────────┐
│  1. PICK TASK                                               │
│     Implementer selects next task from TASKS.md             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  2. IMPLEMENT                                               │
│     Implementer writes code, tests                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  3. SELF-REVIEW                                             │
│     Implementer checks own work against acceptance criteria │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  4. REQUEST REVIEW                                          │
│     Implementer calls Reviewer agent                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  5. REVIEW                                                  │
│     Reviewer evaluates changes                              │
│     → If CHANGES REQUESTED: Return to step 2                │
│     → If APPROVED: Continue                                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  6. COMMIT                                                  │
│     Implementer commits with conventional message           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  7. DEPLOY                                                  │
│     Push to dev environment                                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  8. TEST                                                    │
│     Automated tests + basic smoke test                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  9. REPORT                                                  │
│     Notify human for manual acceptance                      │
│     Wait for approval before next task                      │
└─────────────────────────────────────────────────────────────┘
```

---

## Integration Checkpoints

At the end of each phase (see PLAN.md), perform full integration check:

1. **All phase tasks completed** and individually approved
2. **Run full test suite** (when available)
3. **Manual smoke test** of affected features
4. **Check for regressions** in previously completed features
5. **Update documentation** if needed
6. **Human sign-off** before proceeding to next phase

---

## Communication Protocols

### Implementer → Reviewer
```
## Review Request: [TASK-ID]

### Task
[Copy task description]

### Changes Made
- [File]: [What changed]

### Self-Review
- [x] Acceptance criteria 1
- [x] Acceptance criteria 2

### Notes
[Any context for reviewer]
```

### Reviewer → Implementer
[Use Review Feedback Format above]

### Agent → Human
```
## Status Update: [TASK-ID]

### Status: [COMPLETED / BLOCKED / NEEDS INPUT]

### Summary
[What was done]

### Ready for Manual Test
- [ ] [Feature/behavior to verify]

### Questions (if any)
- [Question]
```

---

## Error Handling

### If Task is Unclear
1. Check FEATURES.md and UI_UX.md for context
2. Check ARCHITECTURE.md for technical constraints
3. If still unclear: **STOP and ask human** before implementing

### If Implementation Hits Blocker
1. Document the blocker clearly
2. Propose potential solutions if possible
3. Report to human with `BLOCKED` status
4. Do not proceed with workarounds without approval

### If Review Fails Multiple Times
1. After 2 review cycles, escalate to human
2. May indicate task needs clarification or splitting

# Implementation Plan: Support for Overdue Todo Items

**Branch**: `001-overdue-todos` | **Date**: 2026-03-23 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-overdue-todos/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Enable users to easily identify and distinguish overdue tasks in their todo list through visual indicators (red text + warning icon), overdue duration display, and optional filtering/sorting capabilities. Backend will calculate overdue status on each API request using date-only comparison; frontend will display computed overdue information with accessible multi-modal indicators.

## Technical Context

**Language/Version**: Node.js (backend via Express), JavaScript/React 18.2.0 (frontend)  
**Primary Dependencies**: Express.js 4.18.2, React 18.2.0, better-sqlite3 11.10.0, axios 1.6.2, cors 2.8.5  
**Storage**: SQLite (better-sqlite3) - currently in-memory database  
**Testing**: Jest 29.7.0 (both packages), @testing-library/react 14.0.0 (frontend), supertest 6.3.3 (backend)  
**Target Platform**: Web application - modern browsers + Node.js server  
**Project Type**: Web application (monorepo with separate frontend and backend packages)  
**Performance Goals**: <200ms API response time, 60fps UI interactions, instant visual feedback  
**Constraints**: REST API communication, browser compatibility (modern browsers), date-only comparison (no time zones)  
**Scale/Scope**: Single-user todo application, lightweight feature addition to existing app

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle Compliance

✅ **I. Code Quality & Consistency**
- Will apply DRY, KISS, SOLID principles
- Follow established naming conventions (camelCase, PascalCase)
- Organize imports properly
- Pass ESLint checks

✅ **II. Test-Driven Development**
- Will maintain 80%+ code coverage
- Will add tests for overdue calculation logic (backend)
- Will add tests for visual indicator rendering (frontend)
- Tests will mock time/date dependencies

✅ **III. Simplicity First**
- All features explicitly requested in spec.md (FR-001 through FR-012)
- No speculative features added
- Simple date comparison logic (date-only, no complex time zone handling)

✅ **IV. Design Consistency**
- Will use design system color palette for red text (from theme.css)
- Will follow 8px grid system for spacing
- Will ensure accessibility with multi-modal indicators (color + icon)
- Will support both light and dark themes

✅ **V. Modular Architecture**
- Backend: Add overdue calculation to existing todoService.js
- Frontend: Update existing TodoCard component for visual indicators
- REST API: Extend existing GET /api/todos response with computed fields
- No new packages or architectural changes required

### Quality Gates

✅ **Pre-Commit**: ESLint checks, code formatting, no unused imports
✅ **Pre-PR**: Maintain 80%+ coverage, all tests pass, tests for new functionality
✅ **Code Review**: Constitution compliance, code quality (DRY/KISS/SOLID), test quality, design system adherence

### Violations & Justifications

*No violations detected. Feature aligns with all constitutional principles.*

## Project Structure

### Documentation (this feature)

```text
specs/001-overdue-todos/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── api-contract.md  # REST API changes for overdue feature
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
packages/
├── backend/
│   ├── src/
│   │   ├── app.js                    # Express routes (extend GET endpoints)
│   │   ├── index.js                  # Server entry point
│   │   └── services/
│   │       └── todoService.js        # ADD: overdue calculation logic
│   └── __tests__/
│       ├── app.test.js               # UPDATE: test overdue fields in API responses
│       └── services/
│           └── todoService.test.js   # ADD: tests for overdue calculations
│
└── frontend/
    ├── src/
    │   ├── App.js                    # Main app component
    │   ├── components/
    │   │   ├── TodoCard.js           # UPDATE: render overdue indicators
    │   │   ├── TodoList.js           # UPDATE: potentially add filter/sort
    │   │   └── __tests__/
    │   │       ├── TodoCard.test.js  # UPDATE: test overdue rendering
    │   │       └── TodoList.test.js  # UPDATE: test filter/sort if added
    │   ├── services/
    │   │   └── todoService.js        # No changes (API unchanged)
    │   └── styles/
    │       └── theme.css             # UPDATE: add overdue-specific styles
    └── __tests__/
        └── App.test.js               # UPDATE: integration tests
```

**Structure Decision**: Web application monorepo (Option 2). Feature extends existing backend service and frontend components. No new files for P1 implementation (visual indicators only); potential new components for P3 (filter/sort UI).

## Complexity Tracking

*No violations detected. This section is not applicable for this feature.*

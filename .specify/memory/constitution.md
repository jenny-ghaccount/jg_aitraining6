<!--
SYNC IMPACT REPORT - Constitution Update
═══════════════════════════════════════════════════════════════════════════
Version Change: INITIAL → 1.0.0 (MINOR - first ratification)

Modified Principles:
  - ALL principles created from existing project guidelines

Added Sections:
  ✅ I. Code Quality & Consistency (from coding-guidelines.md)
  ✅ II. Test-Driven Development (from testing-guidelines.md)
  ✅ III. Simplicity First (from functional-requirements.md)
  ✅ IV. Design Consistency (from ui-guidelines.md)
  ✅ V. Modular Architecture (from project-overview.md)
  ✅ Development Standards (composite from all guidelines)
  ✅ Quality Gates (from testing and coding guidelines)

Removed Sections:
  - None (initial creation)

Templates Requiring Updates:
  ✅ plan-template.md - Constitution Check section already generic
  ✅ spec-template.md - No principle-specific constraints
  ✅ tasks-template.md - No principle-specific task types

Follow-up TODOs:
  - None - all placeholders filled from existing documentation
═══════════════════════════════════════════════════════════════════════════
-->

# Todo App Constitution

## Core Principles

### I. Code Quality & Consistency

**MUST** follow established coding standards to ensure maintainability and collaboration:
- Apply DRY (Don't Repeat Yourself): Extract common code into shared functions/utilities
- Apply KISS (Keep It Simple): Prefer simple, readable solutions over complex implementations
- Apply SOLID principles: Single responsibility, clear interfaces, dependency injection
- Use consistent naming: `camelCase` for variables/functions, `PascalCase` for components/classes, `UPPER_SNAKE_CASE` for constants
- Organize imports: external libraries, internal modules, styles (with blank lines between groups)
- **MUST** pass ESLint checks before committing: no unused variables, no undefined variables, proper error handling

**Rationale**: Consistent code quality reduces cognitive load, prevents bugs, and enables team velocity. Linting catches common errors before they reach production.

### II. Test-Driven Development

**MUST** write and maintain comprehensive tests as part of the development process:
- Target 80%+ code coverage across all packages
- Write tests that describe behavior, not implementation details
- Maintain test isolation: each test sets up and cleans up its own data
- Mock external dependencies (API calls, timers, databases)
- Organize tests in `__tests__/` directories colocated with source files
- Use Jest for unit tests and `@testing-library/react` for component testing
- Coverage tracked via Jest's built-in coverage reports

**Rationale**: Tests document expected behavior, catch regressions, and enable confident refactoring. High coverage ensures reliability and maintainability.

### III. Simplicity First

**MUST** prioritize core functionality over feature bloat:
- Implement only features explicitly requested in specifications
- Apply YAGNI (You Aren't Gonna Need It): no premature optimization or speculative features
- Favor simple, minimal interfaces focused on essential user tasks
- **MUST NOT** add: filtering, search, bulk operations, categories, tags, or other advanced features unless explicitly specified
- Start with the simplest solution; add complexity only when requirements demand it

**Rationale**: Simple systems are easier to understand, maintain, and extend. Feature creep increases complexity without delivering proportional value.

### IV. Design Consistency

**MUST** adhere to the established design system for visual and interaction consistency:
- Follow the Material Design-inspired component library
- Use the 8px grid system for all spacing (`xs`=8px, `sm`=16px, `md`=24px, `lg`=32px, `xl`=48px)
- Apply the defined color palette for light and dark themes (see ui-guidelines.md)
- Use system font stack for typography with defined sizes (Heading=28px, Body=16px, Caption=12px)
- Implement theme toggle to support both light and dark modes
- Keep max content width at 600px with generous margins (16px mobile, 32px desktop)
- Use 8px border radius for cards, 4px for inputs/buttons

**Rationale**: Consistent design improves user experience, reduces decision-making overhead, and ensures accessibility across themes.

### V. Modular Architecture

**MUST** maintain clear separation of concerns in the monorepo structure:
- Separate frontend (`packages/frontend/`) and backend (`packages/backend/`) packages
- Use npm workspaces for dependency management and cross-package workflows
- Frontend communicates with backend exclusively via REST API (no direct database access)
- Backend handles all persistence and business logic
- Each package maintains independent test suites
- Run `npm install` at root to manage all dependencies
- Use workspace scripts: `npm run start` (both services), `npm test` (all packages)

**Rationale**: Modular architecture enables independent development, testing, and deployment. Clear boundaries prevent tight coupling and improve maintainability.

## Development Standards

### Error Handling
- **MUST** use try-catch blocks around operations that can fail
- **MUST** provide meaningful error messages to users
- **MUST** log errors for debugging (console.error with context)
- **MUST** show user-friendly error states in the UI

### Performance
- Keep bundle sizes reasonable through code splitting where appropriate
- Use React hooks (`useMemo`, `useCallback`) only when measurably beneficial
- Avoid premature optimization; profile before optimizing

### Documentation
- Comment "why" not "what" (code should be self-documenting)
- Keep comments updated; remove outdated comments
- Use JSDoc for public functions and exported components
- Maintain up-to-date README files for setup and development

## Quality Gates

### Pre-Commit Requirements
- **MUST** pass ESLint checks (no errors or warnings)
- **MUST** format code consistently (2-space indentation, LF line endings, no trailing whitespace)
- **MUST** remove unused imports and variables

### Pre-PR Requirements
- **MUST** maintain or improve test coverage (minimum 80%)
- **MUST** pass all existing tests
- **MUST** include tests for new functionality
- **MUST** follow file naming conventions (`*.test.js` for tests)

### Code Review Requirements
- Verify adherence to all constitution principles
- Check for code quality violations (DRY, KISS, SOLID)
- Validate test coverage and quality
- Confirm design system compliance for UI changes

## Governance

This constitution represents the non-negotiable development standards for the Todo App project. All code contributions, design decisions, and architectural changes **MUST** align with these principles.

### Amendment Process
- Constitution amendments require documentation of rationale and impact
- Version increments follow semantic versioning:
  - **MAJOR**: Principle removal or backward-incompatible governance changes
  - **MINOR**: New principle additions or material expansions
  - **PATCH**: Clarifications, wording improvements, non-semantic refinements
- Amendments must include consistency updates to all dependent templates and documentation
- Last amended date updated on any content change

### Compliance
- All pull requests **MUST** be reviewed for constitution compliance
- Violations should be identified and corrected before merge
- Complexity additions **MUST** be justified against the "Simplicity First" principle
- For day-to-day development guidance, refer to the detailed documentation in `docs/` directory

**Version**: 1.0.0 | **Ratified**: 2026-03-23 | **Last Amended**: 2026-03-23

# Research: Overdue Todo Items Feature

**Date**: 2026-03-23  
**Feature**: Support for Overdue Todo Items

## Overview

This document captures research findings and technical decisions for implementing overdue todo detection and display. All "NEEDS CLARIFICATION" items from Technical Context have been resolved through codebase analysis.

## Research Areas

### 1. Date Handling in JavaScript

**Decision**: Use JavaScript's built-in `Date` object with date-only comparison (ignoring time)

**Rationale**:
- Native Date object is sufficient for date-only comparison
- No external date library needed (avoids dependency bloat per KISS principle)
- SQLite stores dates as TEXT in ISO format (YYYY-MM-DD), which is directly comparable
- Date-only comparison eliminates time zone complexity per FR-003

**Implementation Approach**:
```javascript
// Backend: Compare date strings directly
function isOverdue(dueDate, completed) {
  if (!dueDate || completed) return false;
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  return dueDate < today;
}

// Calculate days overdue
function calculateDaysOverdue(dueDate) {
  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = today - due;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}
```

**Alternatives Considered**:
- Luxon/date-fns libraries → Rejected: Overkill for simple date-only comparison
- Moment.js → Rejected: Large bundle size, deprecated
- Unix timestamps → Rejected: Less readable, requires conversion from ISO dates

### 2. Accessibility for Visual Indicators

**Decision**: Multi-modal approach using color AND icon (red text + warning icon)

**Rationale**:
- Color alone fails WCAG accessibility guidelines (colorblind users)
- Icon alone may not be immediately understood across cultures/languages
- Combined approach provides redundancy and clarity
- Spec explicitly requires this approach (FR-002)

**Implementation Approach**:
- Red text from theme.css `--danger-color` variable (supports light/dark themes)
- Warning icon (⚠️ or similar) positioned before task title
- ARIA label for screen readers: `aria-label="Overdue: {title}"`
- CSS class `.overdue` for consistent styling

**Alternatives Considered**:
- Color only → Rejected: Accessibility failure
- Icon only → Rejected: May not be universally understood
- Background color change → Rejected: Too aggressive, reduces readability

### 3. API Design for Computed Fields

**Decision**: Backend calculates overdue status per request; include as computed fields in response

**Rationale**:
- Overdue status is time-dependent (changes daily without user action)
- Storing as field would require daily batch job to update
- Per-request calculation is lightweight (simple date comparison)
- Aligns with FR-012 requirement for backend computation

**API Response Schema**:
```json
{
  "id": 1,
  "title": "Task name",
  "dueDate": "2026-03-20",
  "completed": false,
  "createdAt": "2026-03-15T10:30:00Z",
  "isOverdue": true,          // Computed field
  "daysOverdue": 3,            // Computed field (only if overdue)
  "completedAt": null,         // For future late completion tracking
  "daysLate": null             // Computed if completed after due date
}
```

**Alternatives Considered**:
- Store overdue as database field → Rejected: Requires daily update job, data staleness risk
- Client-side only calculation → Rejected: Violates FR-012, inconsistent across clients
- Separate endpoint for overdue check → Rejected: Extra API call, poor performance

### 4. React Component Design for Conditional Styling

**Decision**: Enhance existing TodoCard component with conditional rendering based on isOverdue field

**Rationale**:
- DRY principle: Reuse existing component structure
- Single Responsibility: TodoCard already handles todo display
- Props-based styling: Component receives isOverdue from API, applies classes conditionally
- Maintains existing component hierarchy

**Implementation Approach**:
```jsx
function TodoCard({ todo }) {
  const cardClass = todo.isOverdue ? 'todo-card overdue' : 'todo-card';
  
  return (
    <div className={cardClass} aria-label={todo.isOverdue ? `Overdue: ${todo.title}` : todo.title}>
      {todo.isOverdue && <span className="overdue-icon" aria-hidden="true">⚠️</span>}
      <h3 className={todo.isOverdue ? 'title overdue-text' : 'title'}>
        {todo.title}
      </h3>
      {todo.isOverdue && (
        <span className="overdue-info">{todo.daysOverdue} day{todo.daysOverdue !== 1 ? 's' : ''} overdue</span>
      )}
      {/* existing fields: due date, completed status, etc. */}
    </div>
  );
}
```

**Alternatives Considered**:
- New OverdueTodoCard component → Rejected: Code duplication, violates DRY
- HOC wrapper → Rejected: Unnecessary abstraction for simple conditional rendering
- CSS-only detection (::before pseudo-element) → Rejected: Can't access data attributes reliably

### 5. Testing Strategy for Time-Dependent Logic

**Decision**: Mock Date object in tests to control "current date" for predictable assertions

**Rationale**:
- Time-dependent tests are brittle if they rely on real clock
- Mocking Date allows testing edge cases (midnight crossover, leap years, etc.)
- Jest provides built-in support via `jest.useFakeTimers()` and `jest.setSystemTime()`
- Enables deterministic test results regardless of when tests run

**Implementation Approach**:
```javascript
// Backend test example
describe('isOverdue', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-03-23')); // Fix "today" to 2026-03-23
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('returns true for past due date', () => {
    const result = isOverdue('2026-03-20', false);
    expect(result).toBe(true);
  });

  test('returns false for today due date', () => {
    const result = isOverdue('2026-03-23', false);
    expect(result).toBe(false);
  });
});
```

**Alternatives Considered**:
- No mocking, accept flaky tests → Rejected: Tests fail unpredictably
- Pass "current date" as parameter → Accepted as alternative for pure functions, adds verbosity
- Test only with relative dates → Rejected: Can't test specific date boundaries

## Summary of Decisions

| Decision Point | Choice | Key Reason |
|----------------|--------|------------|
| Date library | Native JavaScript Date | Sufficient for date-only comparison, no extra dependency |
| Visual indicator | Red text + warning icon | Accessibility (WCAG compliant, multi-modal) |
| Overdue calculation location | Backend per-request | Time-dependent data, single source of truth |
| API response design | Computed fields in todo object | Efficient, no extra endpoints needed |
| Component design | Enhance existing TodoCard | DRY principle, single responsibility |
| Test time handling | Mock Date object | Deterministic, enables edge case testing |

## Open Questions

*None. All technical decisions resolved.*

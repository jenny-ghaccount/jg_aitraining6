# Data Model: Overdue Todo Items Feature

**Date**: 2026-03-23  
**Feature**: Support for Overdue Todo Items

## Overview

This document defines the data structures and relationships for the overdue todo items feature. The feature enhances the existing Todo entity with computed fields for overdue status without modifying the database schema.

## Entities

### Todo Item (Enhanced)

**Description**: Represents a task with completion tracking and optional due date. Enhanced with computed overdue information.

**Storage**: SQLite database (existing `todos` table)

**Existing Fields** (no schema changes):
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique identifier |
| title | TEXT | NOT NULL, max 255 chars | Task description |
| dueDate | TEXT | NULLABLE, ISO 8601 date (YYYY-MM-DD) | Optional due date |
| completed | BOOLEAN | DEFAULT 0 (false) | Completion status |
| createdAt | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| completedAt | TIMESTAMP | NULLABLE | Future: completion timestamp (for late tracking) |

**Computed Fields** (calculated at API response time, not stored):
| Field | Type | Calculation | Description |
|-------|------|-------------|-------------|
| isOverdue | Boolean | `dueDate < today AND completed = false` | Whether task is overdue |
| daysOverdue | Integer | `Math.ceil((today - dueDate) / 86400000)` | Days past due (only present if isOverdue = true) |
| daysLate | Integer | `Math.ceil((completedAt - dueDate) / 86400000)` | Days late at completion (only if completed after due date) |

**Validation Rules**:
- `title`: Required, non-empty string after trim, max 255 characters
- `dueDate`: Optional, must be valid ISO 8601 date format (YYYY-MM-DD) if provided
- `completed`: Boolean (0 or 1 in SQLite)
- `completedAt`: Must be >= createdAt if set (for future implementation)

**State Transitions**:
```
[Created] --set completed=true--> [Completed]
[Created] --today > dueDate--> [Overdue] (computed state)
[Overdue] --set completed=true--> [Completed Late] (computed state with daysLate)
[Completed] --no changes--> [Completed] (final state)
```

**Business Rules**:
1. A todo is overdue if and only if: `dueDate` is set, `dueDate < current date`, and `completed = false`
2. Todos without a due date can never be overdue
3. Completed todos are never considered overdue (even if completed after due date)
4. Late completion is tracked separately via `daysLate` field (FR-011, for future P2 implementation)
5. Overdue status is calculated on every API request (not stored or cached)

## Relationships

No new relationships. The Todo entity remains independent (no foreign keys, no related entities for this feature).

## Data Flow

### Overdue Calculation Flow

```
API Request (GET /api/todos)
    ↓
Backend retrieves todos from database
    ↓
For each todo:
    ↓
    ├─ completed = true? → isOverdue = false, skip calculation
    ├─ dueDate = null? → isOverdue = false, skip calculation
    └─ dueDate < today? → isOverdue = true, calculate daysOverdue
    ↓
Append computed fields to todo object
    ↓
Return JSON response with computed fields
    ↓
Frontend receives todos with isOverdue/daysOverdue
    ↓
TodoCard component renders with conditional styling
```

### Date Comparison Logic

**Current Date Determination**:
```javascript
const today = new Date().toISOString().split('T')[0]; // "2026-03-23"
```

**Overdue Check**:
```javascript
// String comparison works because ISO 8601 format is lexicographically ordered
isOverdue = dueDate < today && !completed
```

**Days Overdue Calculation**:
```javascript
const todayDate = new Date();
const dueDateTime = new Date(dueDate);
const diffMs = todayDate - dueDateTime;
const daysOverdue = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
```

## API Response Examples

### Example 1: Overdue Todo
```json
{
  "id": 1,
  "title": "Submit project report",
  "dueDate": "2026-03-20",
  "completed": false,
  "createdAt": "2026-03-15T10:30:00Z",
  "isOverdue": true,
  "daysOverdue": 3
}
```

### Example 2: Non-Overdue Todo (Future Due Date)
```json
{
  "id": 2,
  "title": "Team meeting preparation",
  "dueDate": "2026-03-25",
  "completed": false,
  "createdAt": "2026-03-20T14:00:00Z",
  "isOverdue": false
}
```

### Example 3: Completed Todo (Not Overdue Regardless of Due Date)
```json
{
  "id": 3,
  "title": "Code review",
  "dueDate": "2026-03-15",
  "completed": true,
  "createdAt": "2026-03-10T09:00:00Z",
  "completedAt": "2026-03-14T16:45:00Z",
  "isOverdue": false
}
```

### Example 4: Todo Without Due Date
```json
{
  "id": 4,
  "title": "Brainstorm ideas",
  "dueDate": null,
  "completed": false,
  "createdAt": "2026-03-22T11:00:00Z",
  "isOverdue": false
}
```

### Example 5: Completed Late (Future P2 Feature)
```json
{
  "id": 5,
  "title": "Monthly report",
  "dueDate": "2026-03-15",
  "completed": true,
  "createdAt": "2026-03-01T08:00:00Z",
  "completedAt": "2026-03-20T17:30:00Z",
  "isOverdue": false,
  "daysLate": 5
}
```

## Database Schema Changes

**None required**. The existing `todos` table structure supports all requirements. Computed fields are calculated at runtime and never persisted.

**Future Schema Addition (P2 - Late Completion Tracking)**:
```sql
-- Only if P2 late completion feature is implemented
ALTER TABLE todos ADD COLUMN completedAt TIMESTAMP;
```

## Performance Considerations

**Computation Cost**:
- Date comparison: O(1) per todo (string comparison or Date object subtraction)
- Days calculation: O(1) per todo (simple arithmetic)
- Total cost per request: O(n) where n = number of todos
- Expected overhead: <1ms for typical todo lists (<100 items)

**Optimization Opportunities** (if needed in future):
- Cache "today" date once per request (avoid repeated `new Date()` calls)
- Filter database query if only fetching overdue todos (add WHERE clause)
- Index on `dueDate` column for efficient filtering (currently not needed)

**Scalability**:
- Current approach scales to ~10,000 todos before noticeable latency
- For larger scales, consider pre-computed materialized view or background job
- Current scope (single-user app) does not require optimization

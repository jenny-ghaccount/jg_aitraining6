# API Contract: Overdue Todo Items Feature

**Date**: 2026-03-23  
**Feature**: Support for Overdue Todo Items  
**API Version**: 1.1.0 (backward compatible extension)

## Overview

This document defines the REST API contract changes for the overdue todo items feature. The feature extends existing endpoints with computed fields without breaking existing clients.

## Endpoints

### GET /api/todos

**Description**: Retrieve all todos with computed overdue information

**Request**:
```http
GET /api/todos HTTP/1.1
Host: localhost:3030
```

**Response** (200 OK):
```json
[
  {
    "id": 1,
    "title": "Submit quarterly report",
    "dueDate": "2026-03-20",
    "completed": false,
    "createdAt": "2026-03-15T10:30:00Z",
    "isOverdue": true,
    "daysOverdue": 3
  },
  {
    "id": 2,
    "title": "Team standup",
    "dueDate": "2026-03-25",
    "completed": false,
    "createdAt": "2026-03-23T08:00:00Z",
    "isOverdue": false
  },
  {
    "id": 3,
    "title": "Update documentation",
    "dueDate": null,
    "completed": false,
    "createdAt": "2026-03-22T14:30:00Z",
    "isOverdue": false
  }
]
```

**Changes from Previous Version**:
- **Added fields** (computed, always present):
  - `isOverdue` (boolean): true if todo is overdue, false otherwise
  - `daysOverdue` (integer, optional): present only when `isOverdue = true`, indicates days past due date
- **Backward compatibility**: All existing fields unchanged, new fields are additive

**Error Responses**:
```json
// 500 Internal Server Error
{
  "error": "Failed to fetch todos"
}
```

---

### GET /api/todos/:id

**Description**: Retrieve a single todo by ID with computed overdue information

**Request**:
```http
GET /api/todos/1 HTTP/1.1
Host: localhost:3030
```

**Response** (200 OK):
```json
{
  "id": 1,
  "title": "Submit quarterly report",
  "dueDate": "2026-03-20",
  "completed": false,
  "createdAt": "2026-03-15T10:30:00Z",
  "isOverdue": true,
  "daysOverdue": 3
}
```

**Response** (404 Not Found):
```json
{
  "error": "Todo not found"
}
```

**Response** (400 Bad Request):
```json
{
  "error": "Valid todo ID is required"
}
```

**Changes from Previous Version**:
- **Added fields** (computed):
  - `isOverdue` (boolean)
  - `daysOverdue` (integer, optional)
- **Backward compatibility**: Maintained

---

### POST /api/todos

**Description**: Create a new todo (no changes to request/response structure for this feature)

**Request**:
```http
POST /api/todos HTTP/1.1
Host: localhost:3030
Content-Type: application/json

{
  "title": "New task",
  "dueDate": "2026-03-25"
}
```

**Response** (201 Created):
```json
{
  "id": 4,
  "title": "New task",
  "dueDate": "2026-03-25",
  "completed": false,
  "createdAt": "2026-03-23T12:00:00Z",
  "isOverdue": false
}
```

**Changes from Previous Version**:
- **Added fields in response** (computed):
  - `isOverdue` (boolean): will always be false for newly created todos (assuming due date is not in the past)
- **Request unchanged**: `title` (required), `dueDate` (optional)

**Validation**:
- `title`: Required, non-empty string, max 255 characters
- `dueDate`: Optional, must be valid ISO 8601 date (YYYY-MM-DD)

**Error Responses**:
```json
// 400 Bad Request - Missing title
{
  "error": "Todo title is required"
}

// 400 Bad Request - Title too long
{
  "error": "Todo title must not exceed 255 characters"
}

// 500 Internal Server Error
{
  "error": "Failed to create todo"
}
```

---

### PUT /api/todos/:id

**Description**: Update a todo (no endpoint changes for this feature; existing implementation)

**Note**: This endpoint is not modified as part of this feature. The overdue status is automatically recalculated on the next GET request.

---

### DELETE /api/todos/:id

**Description**: Delete a todo (no endpoint changes for this feature; existing implementation)

**Note**: This endpoint is not modified as part of this feature.

---

## Data Types

### Todo Object (Enhanced)

```typescript
interface Todo {
  // Existing fields
  id: number;                    // Auto-incrementing ID
  title: string;                 // Task description (max 255 chars)
  dueDate: string | null;        // ISO 8601 date (YYYY-MM-DD) or null
  completed: boolean;            // Completion status (true/false)
  createdAt: string;             // ISO 8601 timestamp

  // New computed fields (v1.1.0)
  isOverdue: boolean;            // True if overdue, always present
  daysOverdue?: number;          // Days past due date (only if isOverdue = true)

  // Future fields (not yet implemented)
  completedAt?: string;          // ISO 8601 timestamp (for P2 late tracking)
  daysLate?: number;             // Days late at completion (for P2)
}
```

### Overdue Calculation Rules

**isOverdue** is `true` if and only if:
1. `dueDate` is not null, AND
2. `dueDate < current date` (date-only comparison, ignore time), AND
3. `completed` is `false`

**daysOverdue** is calculated as:
```javascript
Math.ceil((currentDate - dueDate) / (1000 * 60 * 60 * 24))
```

**Date Comparison**:
- Uses server's local date (no time zone conversion)
- Date-only comparison (ignores time component)
- Current date obtained fresh on each request

## Backward Compatibility

### Guaranteed Compatibility
- All existing fields remain unchanged in structure and semantics
- Existing API clients will continue to work without modification
- New fields (`isOverdue`, `daysOverdue`) are additive, not breaking

### Client Migration Path
Clients can adopt new fields incrementally:

**Phase 1**: Ignore new fields (existing behavior maintained)
```javascript
// Old client code continues to work
const todos = await fetch('/api/todos').then(r => r.json());
todos.forEach(todo => {
  console.log(todo.title, todo.dueDate); // Works as before
});
```

**Phase 2**: Read new fields when present
```javascript
// Enhanced client code
const todos = await fetch('/api/todos').then(r => r.json());
todos.forEach(todo => {
  if (todo.isOverdue) {
    console.log(`⚠️ ${todo.title} is ${todo.daysOverdue} days overdue`);
  }
});
```

## Future Extensions (P2/P3 Features)

### P2: Late Completion Tracking
Additional computed fields when this is implemented:
```json
{
  "completedAt": "2026-03-20T16:45:00Z",
  "daysLate": 5
}
```

### P3: Filtering and Sorting
Potential query parameters (not part of current implementation):
```http
GET /api/todos?overdue=true
GET /api/todos?sort=daysOverdue&order=desc
```

## Testing Contract

### Test Cases for Overdue Calculation

**Test 1**: Todo with past due date and incomplete
- Input: `dueDate = "2026-03-20"`, `completed = false`, `today = "2026-03-23"`
- Expected: `isOverdue = true`, `daysOverdue = 3`

**Test 2**: Todo with future due date
- Input: `dueDate = "2026-03-25"`, `completed = false`, `today = "2026-03-23"`
- Expected: `isOverdue = false`, `daysOverdue` not present

**Test 3**: Todo with past due date but completed
- Input: `dueDate = "2026-03-20"`, `completed = true`, `today = "2026-03-23"`
- Expected: `isOverdue = false`, `daysOverdue` not present

**Test 4**: Todo with no due date
- Input: `dueDate = null`, `completed = false`, `today = "2026-03-23"`
- Expected: `isOverdue = false`, `daysOverdue` not present

**Test 5**: Todo due today
- Input: `dueDate = "2026-03-23"`, `completed = false`, `today = "2026-03-23"`
- Expected: `isOverdue = false`, `daysOverdue` not present

**Test 6**: Todo became overdue today (midnight crossover)
- Input: `dueDate = "2026-03-22"`, `completed = false`, `today = "2026-03-23"`
- Expected: `isOverdue = true`, `daysOverdue = 1`

## Implementation Notes

### Performance
- Overdue calculation adds negligible overhead (<1ms per request)
- No database schema changes required
- No additional database queries needed

### Caching Strategy
- Computed fields are always recalculated on each request
- No caching implemented (overdue status can change daily)
- Future optimization: cache with TTL = end of current day

### Error Handling
- If date calculation fails, fallback to `isOverdue = false`
- Invalid date formats in database logged as warnings
- API continues to function even if overdue calculation fails for specific todos

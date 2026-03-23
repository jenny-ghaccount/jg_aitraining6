# Quick Start: Overdue Todo Items Feature

**Date**: 2026-03-23  
**Feature**: Support for Overdue Todo Items  
**Branch**: `001-overdue-todos`

## Overview

This feature adds visual indicators and computed overdue status for todo items that have passed their due date. Backend calculates overdue status on each request; frontend displays red text + warning icon for overdue items.

## Prerequisites

- Node.js installed
- Project dependencies installed (`npm install` at root)
- Familiarity with Express.js (backend) and React (frontend)
- Understanding of Jest for testing

## 5-Minute Context

### What's Being Added
1. **Backend**: Compute `isOverdue` and `daysOverdue` fields for each todo in API responses
2. **Frontend**: Render overdue todos with red text + warning icon
3. **Tests**: Time-mocked tests for date calculations and visual rendering

### What's NOT Changing
- Database schema (no migrations needed)
- API endpoints (existing routes enhanced, not modified)
- Existing todo functionality (create, update, delete)

### Key Design Decisions
- **Date-only comparison**: Ignore time zones, compare calendar dates only
- **Per-request calculation**: Overdue status computed fresh on each API call (not stored)
- **Multi-modal accessibility**: Color (red) + icon (⚠️) for colorblind users
- **Backward compatible**: New API fields are additive, existing clients work unchanged

## File Structure

```
specs/001-overdue-todos/
├── spec.md              # Feature requirements (read first)
├── plan.md              # This implementation plan
├── research.md          # Technical decisions and rationale
├── data-model.md        # Data structures and validation rules
├── contracts/
│   └── api-contract.md  # REST API changes
└── quickstart.md        # This file

packages/backend/src/
├── services/
│   └── todoService.js   # ADD: overdue calculation logic
└── app.js               # UPDATE: inject computed fields in responses

packages/frontend/src/
├── components/
│   └── TodoCard.js      # UPDATE: render overdue indicators
└── styles/
    └── theme.css        # UPDATE: overdue-specific styles
```

## Development Workflow

### Step 1: Set Up Environment

```bash
# Ensure you're on the correct branch
git checkout 001-overdue-todos

# Install dependencies (if not already done)
npm install

# Start both frontend and backend
npm start
```

Backend runs on: `http://localhost:3030`  
Frontend runs on: `http://localhost:3000`

### Step 2: Backend Implementation (Priority 1)

**File**: `packages/backend/src/services/todoService.js` (new file)

Create service with overdue calculation logic:

```javascript
// todoService.js
function getTodayDate() {
  return new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"
}

function isOverdue(todo) {
  if (!todo.dueDate || todo.completed) {
    return false;
  }
  return todo.dueDate < getTodayDate();
}

function calculateDaysOverdue(dueDate) {
  const today = new Date();
  const due = new Date(dueDate);
  const diffMs = today - due;
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

function enrichTodoWithOverdueStatus(todo) {
  const overdue = isOverdue(todo);
  return {
    ...todo,
    isOverdue: overdue,
    ...(overdue && { daysOverdue: calculateDaysOverdue(todo.dueDate) })
  };
}

module.exports = {
  enrichTodoWithOverdueStatus,
  isOverdue,
  calculateDaysOverdue,
  getTodayDate
};
```

**File**: `packages/backend/src/app.js` (modify existing routes)

Update GET endpoints to enrich todos:

```javascript
const { enrichTodoWithOverdueStatus } = require('./services/todoService');

// Update GET /api/todos
app.get('/api/todos', (req, res) => {
  try {
    const todos = db.prepare('SELECT * FROM todos ORDER BY createdAt DESC').all();
    const enrichedTodos = todos.map(enrichTodoWithOverdueStatus);
    res.json(enrichedTodos);
  } catch (error) {
    console.error('Error fetching todos:', error);
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
});

// Update GET /api/todos/:id
app.get('/api/todos/:id', (req, res) => {
  try {
    const { id } = req.params;
    // ... validation code ...
    const todo = db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    res.json(enrichTodoWithOverdueStatus(todo));
  } catch (error) {
    // ... error handling ...
  }
});
```

### Step 3: Backend Testing

**File**: `packages/backend/__tests__/services/todoService.test.js` (new file)

```javascript
const { isOverdue, calculateDaysOverdue, enrichTodoWithOverdueStatus } = require('../../src/services/todoService');

describe('todoService - overdue logic', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-03-23')); // Fix "today"
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('isOverdue returns true for past due date', () => {
    const todo = { dueDate: '2026-03-20', completed: false };
    expect(isOverdue(todo)).toBe(true);
  });

  test('isOverdue returns false for completed todo', () => {
    const todo = { dueDate: '2026-03-20', completed: true };
    expect(isOverdue(todo)).toBe(false);
  });

  test('calculateDaysOverdue returns correct value', () => {
    expect(calculateDaysOverdue('2026-03-20')).toBe(3);
  });

  test('enrichTodoWithOverdueStatus adds computed fields', () => {
    const todo = { id: 1, title: 'Test', dueDate: '2026-03-20', completed: false };
    const enriched = enrichTodoWithOverdueStatus(todo);
    expect(enriched.isOverdue).toBe(true);
    expect(enriched.daysOverdue).toBe(3);
  });
});
```

Run backend tests:
```bash
npm run test:backend
```

### Step 4: Frontend Implementation (Priority 2)

**File**: `packages/frontend/src/components/TodoCard.js` (modify)

Add conditional rendering for overdue:

```jsx
function TodoCard({ todo, onToggle, onDelete }) {
  const cardClass = todo.isOverdue ? 'todo-card overdue' : 'todo-card';

  return (
    <div className={cardClass}>
      <div className="todo-header">
        {todo.isOverdue && (
          <span className="overdue-icon" aria-hidden="true">⚠️</span>
        )}
        <h3 className={todo.isOverdue ? 'todo-title overdue-text' : 'todo-title'}>
          {todo.title}
        </h3>
      </div>
      
      {todo.isOverdue && (
        <p className="overdue-info">
          {todo.daysOverdue} day{todo.daysOverdue !== 1 ? 's' : ''} overdue
        </p>
      )}

      {todo.dueDate && (
        <p className="due-date">Due: {todo.dueDate}</p>
      )}

      {/* Existing buttons: toggle complete, delete */}
    </div>
  );
}
```

**File**: `packages/frontend/src/styles/theme.css` (add styles)

```css
/* Overdue styles */
.overdue-text {
  color: var(--danger-color);
}

.overdue-icon {
  font-size: 1.2rem;
  margin-right: 8px;
}

.overdue-info {
  font-size: 0.875rem;
  color: var(--danger-color);
  font-weight: 500;
  margin-top: 4px;
}

/* Ensure accessibility in both themes */
:root {
  --danger-color: #d32f2f; /* Light theme red */
}

[data-theme="dark"] {
  --danger-color: #f44336; /* Dark theme red (higher contrast) */
}
```

### Step 5: Frontend Testing

**File**: `packages/frontend/src/components/__tests__/TodoCard.test.js` (modify)

```jsx
import { render, screen } from '@testing-library/react';
import TodoCard from '../TodoCard';

describe('TodoCard - overdue display', () => {
  test('renders overdue indicator for overdue todo', () => {
    const overdueTodo = {
      id: 1,
      title: 'Overdue task',
      dueDate: '2026-03-20',
      completed: false,
      isOverdue: true,
      daysOverdue: 3
    };

    render(<TodoCard todo={overdueTodo} />);
    
    expect(screen.getByText('⚠️')).toBeInTheDocument();
    expect(screen.getByText('3 days overdue')).toBeInTheDocument();
    expect(screen.getByText('Overdue task')).toHaveClass('overdue-text');
  });

  test('does not render overdue indicator for non-overdue todo', () => {
    const normalTodo = {
      id: 2,
      title: 'Normal task',
      dueDate: '2026-03-25',
      completed: false,
      isOverdue: false
    };

    render(<TodoCard todo={normalTodo} />);
    
    expect(screen.queryByText('⚠️')).not.toBeInTheDocument();
    expect(screen.queryByText(/overdue/)).not.toBeInTheDocument();
  });
});
```

Run frontend tests:
```bash
npm run test:frontend
```

## Testing the Feature

### Manual Testing Checklist

1. **Start the application**: `npm start`
2. **Check existing todos**: Should see overdue indicators on past-due incomplete todos
3. **Create new todo with past date**: Create todo with `dueDate: "2026-03-01"` → Should show as overdue
4. **Complete overdue todo**: Toggle completion → Overdue indicator should disappear
5. **Test theme toggle**: Switch to dark mode → Red color should adjust for contrast
6. **Test accessibility**: Use screen reader to verify aria-labels

### Database Test Data

Manually add test todos via API:
```bash
# Overdue todo
curl -X POST http://localhost:3030/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title": "Overdue task", "dueDate": "2026-03-01"}'

# Future todo
curl -X POST http://localhost:3030/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title": "Future task", "dueDate": "2026-12-31"}'

# No due date
curl -X POST http://localhost:3030/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title": "Anytime task"}'
```

## Common Issues & Solutions

### Issue: Tests fail with "Date is not defined"
**Solution**: Ensure `jest.useFakeTimers()` is called in `beforeEach()` and `jest.useRealTimers()` in `afterEach()`

### Issue: Overdue indicator not showing in UI
**Solution**: Check browser console for API errors; ensure backend is running and returning `isOverdue` field

### Issue: Colors not visible in dark mode
**Solution**: Verify `--danger-color` is defined for both `:root` and `[data-theme="dark"]` in theme.css

### Issue: Coverage drops below 80%
**Solution**: Ensure all new functions have tests; check coverage report: `npm run test:frontend -- --coverage`

## Next Steps (After P1 Complete)

### P2: Late Completion Display
- Add `completedAt` timestamp to todos
- Display "Completed X days late" for todos completed after due date

### P3: Filtering and Sorting
- Add filter UI: "Show only overdue"
- Add sort option: "Most overdue first"
- Implement in TodoList component

## Resources

- **Spec**: [spec.md](spec.md) - Full feature requirements
- **Research**: [research.md](research.md) - Technical decisions and alternatives
- **Data Model**: [data-model.md](data-model.md) - Entity definitions and validation
- **API Contract**: [contracts/api-contract.md](contracts/api-contract.md) - REST API documentation
- **Constitution**: [../../.specify/memory/constitution.md](../../.specify/memory/constitution.md) - Project principles

## Questions?

Refer to the detailed documentation files above or check:
- Testing guidelines: `/docs/testing-guidelines.md`
- Coding guidelines: `/docs/coding-guidelines.md`
- UI guidelines: `/docs/ui-guidelines.md`

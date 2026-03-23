const {
  getTodayDate,
  isOverdue,
  calculateDaysOverdue,
  enrichTodoWithOverdueStatus
} = require('../../src/services/todoService');

describe('todoService - overdue logic', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-03-23T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // T010: Unit tests for getTodayDate()
  describe('getTodayDate', () => {
    test('returns today\'s date in YYYY-MM-DD format', () => {
      const result = getTodayDate();
      expect(result).toBe('2026-03-23');
    });

    test('returns date without time component', () => {
      const result = getTodayDate();
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(result).not.toContain('T');
    });
  });

  // T011: Unit tests for isOverdue() covering all edge cases
  describe('isOverdue', () => {
    test('returns true for past due date and incomplete todo', () => {
      const todo = { dueDate: '2026-03-20', completed: false };
      expect(isOverdue(todo)).toBe(true);
    });

    test('returns false for future due date', () => {
      const todo = { dueDate: '2026-03-25', completed: false };
      expect(isOverdue(todo)).toBe(false);
    });

    test('returns false for today due date (not yet overdue)', () => {
      const todo = { dueDate: '2026-03-23', completed: false };
      expect(isOverdue(todo)).toBe(false);
    });

    test('returns false for completed todo with past due date', () => {
      const todo = { dueDate: '2026-03-20', completed: true };
      expect(isOverdue(todo)).toBe(false);
    });

    test('returns false for todo with no due date', () => {
      const todo = { dueDate: null, completed: false };
      expect(isOverdue(todo)).toBe(false);
    });

    test('returns false for completed todo with no due date', () => {
      const todo = { dueDate: null, completed: true };
      expect(isOverdue(todo)).toBe(false);
    });

    test('returns true for todo due yesterday (1 day overdue)', () => {
      const todo = { dueDate: '2026-03-22', completed: false };
      expect(isOverdue(todo)).toBe(true);
    });

    test('returns false when completed is 1 (SQLite boolean true)', () => {
      const todo = { dueDate: '2026-03-20', completed: 1 };
      expect(isOverdue(todo)).toBe(false);
    });

    test('returns true when completed is 0 (SQLite boolean false) and overdue', () => {
      const todo = { dueDate: '2026-03-20', completed: 0 };
      expect(isOverdue(todo)).toBe(true);
    });
  });

  // T012: Unit tests for calculateDaysOverdue()
  describe('calculateDaysOverdue', () => {
    test('returns correct days for 3 days overdue', () => {
      const result = calculateDaysOverdue('2026-03-20');
      expect(result).toBe(3);
    });

    test('returns 1 for todo due yesterday', () => {
      const result = calculateDaysOverdue('2026-03-22');
      expect(result).toBe(1);
    });

    test('returns correct days for 10 days overdue', () => {
      const result = calculateDaysOverdue('2026-03-13');
      expect(result).toBe(10);
    });

    test('returns correct days for 30+ days overdue', () => {
      const result = calculateDaysOverdue('2026-02-15');
      expect(result).toBe(36);
    });

    test('returns positive integer (uses Math.ceil)', () => {
      const result = calculateDaysOverdue('2026-03-20');
      expect(Number.isInteger(result)).toBe(true);
      expect(result).toBeGreaterThan(0);
    });
  });

  // T013: Unit tests for enrichTodoWithOverdueStatus()
  describe('enrichTodoWithOverdueStatus', () => {
    test('adds isOverdue=true and daysOverdue for overdue todo', () => {
      const todo = {
        id: 1,
        title: 'Test task',
        dueDate: '2026-03-20',
        completed: false,
        createdAt: '2026-03-15T10:00:00Z'
      };

      const enriched = enrichTodoWithOverdueStatus(todo);

      expect(enriched).toEqual({
        id: 1,
        title: 'Test task',
        dueDate: '2026-03-20',
        completed: false,
        createdAt: '2026-03-15T10:00:00Z',
        isOverdue: true,
        daysOverdue: 3
      });
    });

    test('adds isOverdue=false for future due date, no daysOverdue field', () => {
      const todo = {
        id: 2,
        title: 'Future task',
        dueDate: '2026-03-25',
        completed: false,
        createdAt: '2026-03-20T10:00:00Z'
      };

      const enriched = enrichTodoWithOverdueStatus(todo);

      expect(enriched).toEqual({
        id: 2,
        title: 'Future task',
        dueDate: '2026-03-25',
        completed: false,
        createdAt: '2026-03-20T10:00:00Z',
        isOverdue: false
      });
      expect(enriched.daysOverdue).toBeUndefined();
    });

    test('adds isOverdue=false for completed todo, no daysOverdue field', () => {
      const todo = {
        id: 3,
        title: 'Completed task',
        dueDate: '2026-03-20',
        completed: true,
        createdAt: '2026-03-15T10:00:00Z'
      };

      const enriched = enrichTodoWithOverdueStatus(todo);

      expect(enriched.isOverdue).toBe(false);
      expect(enriched.daysOverdue).toBeUndefined();
    });

    test('adds isOverdue=false for todo with no due date', () => {
      const todo = {
        id: 4,
        title: 'No deadline',
        dueDate: null,
        completed: false,
        createdAt: '2026-03-22T10:00:00Z'
      };

      const enriched = enrichTodoWithOverdueStatus(todo);

      expect(enriched.isOverdue).toBe(false);
      expect(enriched.daysOverdue).toBeUndefined();
    });

    test('preserves all original todo fields', () => {
      const todo = {
        id: 5,
        title: 'Test task',
        dueDate: '2026-03-20',
        completed: false,
        createdAt: '2026-03-15T10:00:00Z',
        customField: 'custom value'
      };

      const enriched = enrichTodoWithOverdueStatus(todo);

      expect(enriched.id).toBe(5);
      expect(enriched.title).toBe('Test task');
      expect(enriched.customField).toBe('custom value');
    });
  });
});

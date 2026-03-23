import React, { useState, useMemo } from 'react';
import TodoCard from './TodoCard';

function TodoList({ todos, onToggle, onEdit, onDelete, isLoading }) {
  // T044: Filter state management
  const [filter, setFilter] = useState('all');
  
  // T045: Sort state management
  const [sort, setSort] = useState('default');

  // T042: Filter logic - show only overdue todos when "overdue" selected
  // T043: Sort logic - order todos by daysOverdue descending when "most-overdue" selected
  const processedTodos = useMemo(() => {
    let result = [...todos];

    // Apply filter
    if (filter === 'overdue') {
      result = result.filter(todo => todo.isOverdue === true);
    }

    // Apply sort
    if (sort === 'most-overdue') {
      result.sort((a, b) => {
        // Sort by daysOverdue descending (most overdue first)
        const aDays = a.daysOverdue || 0;
        const bDays = b.daysOverdue || 0;
        return bDays - aDays;
      });
    }

    return result;
  }, [todos, filter, sort]);

  if (todos.length === 0) {
    return (
      <div className="todo-list empty-state">
        <p className="empty-state-message">
          No todos yet. Add one to get started! 👻
        </p>
      </div>
    );
  }

  return (
    <div className="todo-list-container">
      {/* T040: Filter dropdown UI */}
      {/* T041: Sort dropdown UI */}
      <div className="todo-controls">
        <div className="control-group">
          <label htmlFor="filter-select">Filter:</label>
          <select
            id="filter-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="control-select"
            aria-label="Filter todos"
          >
            <option value="all">All</option>
            <option value="overdue">Overdue Only</option>
          </select>
        </div>

        <div className="control-group">
          <label htmlFor="sort-select">Sort:</label>
          <select
            id="sort-select"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="control-select"
            aria-label="Sort todos"
          >
            <option value="default">Default</option>
            <option value="most-overdue">Most Overdue First</option>
          </select>
        </div>
      </div>

      {processedTodos.length === 0 && filter === 'overdue' ? (
        <div className="todo-list empty-state">
          <p className="empty-state-message">
            No overdue todos! 🎉
          </p>
        </div>
      ) : (
        <div className="todo-list">
          {processedTodos.map((todo) => (
            <TodoCard
              key={todo.id}
              todo={todo}
              onToggle={onToggle}
              onEdit={onEdit}
              onDelete={onDelete}
              isLoading={isLoading}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default TodoList;

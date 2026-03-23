import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TodoList from '../TodoList';

describe('TodoList Component', () => {
  const mockHandlers = {
    onToggle: jest.fn(),
    onEdit: jest.fn(),
    onDelete: jest.fn()
  };

  const mockTodos = [
    {
      id: 1,
      title: 'Todo 1',
      dueDate: '2025-12-25',
      completed: 0,
      createdAt: '2025-11-01T00:00:00Z',
      isOverdue: false
    },
    {
      id: 2,
      title: 'Todo 2',
      dueDate: null,
      completed: 1,
      createdAt: '2025-11-02T00:00:00Z',
      isOverdue: false
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render empty state when todos array is empty', () => {
    render(<TodoList todos={[]} {...mockHandlers} isLoading={false} />);
    
    expect(screen.getByText(/No todos yet. Add one to get started!/)).toBeInTheDocument();
  });

  it('should render all todos when provided', () => {
    render(<TodoList todos={mockTodos} {...mockHandlers} isLoading={false} />);
    
    expect(screen.getByText('Todo 1')).toBeInTheDocument();
    expect(screen.getByText('Todo 2')).toBeInTheDocument();
  });

  it('should render correct number of todo cards', () => {
    const { container } = render(
      <TodoList todos={mockTodos} {...mockHandlers} isLoading={false} />
    );
    
    const cards = container.querySelectorAll('.todo-card');
    expect(cards).toHaveLength(2);
  });

  it('should pass handlers to TodoCard components', () => {
    render(<TodoList todos={mockTodos} {...mockHandlers} isLoading={false} />);
    
    // Verify that edit buttons exist for each todo
    expect(screen.getAllByLabelText(/Edit/)).toHaveLength(2);
    expect(screen.getAllByLabelText(/Delete/)).toHaveLength(2);
  });

  // T046: Test for filter shows only overdue todos
  describe('Filter Functionality', () => {
    const mixedTodos = [
      {
        id: 1,
        title: 'Overdue Todo 1',
        dueDate: '2025-01-01',
        completed: 0,
        isOverdue: true,
        daysOverdue: 10
      },
      {
        id: 2,
        title: 'Normal Todo',
        dueDate: '2026-12-31',
        completed: 0,
        isOverdue: false
      },
      {
        id: 3,
        title: 'Overdue Todo 2',
        dueDate: '2025-02-01',
        completed: 0,
        isOverdue: true,
        daysOverdue: 5
      }
    ];

    it('should show all todos when filter is set to "all"', () => {
      render(<TodoList todos={mixedTodos} {...mockHandlers} isLoading={false} />);
      
      expect(screen.getByText('Overdue Todo 1')).toBeInTheDocument();
      expect(screen.getByText('Normal Todo')).toBeInTheDocument();
      expect(screen.getByText('Overdue Todo 2')).toBeInTheDocument();
    });

    it('should show only overdue todos when filter is set to "overdue"', () => {
      render(<TodoList todos={mixedTodos} {...mockHandlers} isLoading={false} />);
      
      const filterSelect = screen.getByLabelText('Filter todos');
      fireEvent.change(filterSelect, { target: { value: 'overdue' } });
      
      expect(screen.getByText('Overdue Todo 1')).toBeInTheDocument();
      expect(screen.queryByText('Normal Todo')).not.toBeInTheDocument();
      expect(screen.getByText('Overdue Todo 2')).toBeInTheDocument();
    });

    it('should show empty state when filtering overdue but no overdue todos exist', () => {
      const nonOverdueTodos = [
        {
          id: 1,
          title: 'Normal Todo',
          dueDate: '2026-12-31',
          completed: 0,
          isOverdue: false
        }
      ];

      render(<TodoList todos={nonOverdueTodos} {...mockHandlers} isLoading={false} />);
      
      const filterSelect = screen.getByLabelText('Filter todos');
      fireEvent.change(filterSelect, { target: { value: 'overdue' } });
      
      expect(screen.getByText(/No overdue todos!/)).toBeInTheDocument();
    });
  });

  // T047: Test for sort orders by most overdue first
  describe('Sort Functionality', () => {
    const unsortedTodos = [
      {
        id: 1,
        title: 'Overdue 5 days',
        dueDate: '2025-02-01',
        completed: 0,
        isOverdue: true,
        daysOverdue: 5
      },
      {
        id: 2,
        title: 'Overdue 10 days',
        dueDate: '2025-01-01',
        completed: 0,
        isOverdue: true,
        daysOverdue: 10
      },
      {
        id: 3,
        title: 'Overdue 2 days',
        dueDate: '2025-03-01',
        completed: 0,
        isOverdue: true,
        daysOverdue: 2
      }
    ];

    it('should maintain default order when sort is "default"', () => {
      const { container } = render(
        <TodoList todos={unsortedTodos} {...mockHandlers} isLoading={false} />
      );
      
      const cards = container.querySelectorAll('.todo-card');
      expect(cards[0]).toHaveTextContent('Overdue 5 days');
      expect(cards[1]).toHaveTextContent('Overdue 10 days');
      expect(cards[2]).toHaveTextContent('Overdue 2 days');
    });

    it('should sort by most overdue first when sort is "most-overdue"', () => {
      const { container } = render(
        <TodoList todos={unsortedTodos} {...mockHandlers} isLoading={false} />
      );
      
      const sortSelect = screen.getByLabelText('Sort todos');
      fireEvent.change(sortSelect, { target: { value: 'most-overdue' } });
      
      const cards = container.querySelectorAll('.todo-card');
      expect(cards[0]).toHaveTextContent('Overdue 10 days');
      expect(cards[1]).toHaveTextContent('Overdue 5 days');
      expect(cards[2]).toHaveTextContent('Overdue 2 days');
    });
  });

  // T048: Test for filter and sort work together correctly
  describe('Filter and Sort Together', () => {
    const complexTodos = [
      {
        id: 1,
        title: 'Overdue 5 days',
        dueDate: '2025-02-01',
        completed: 0,
        isOverdue: true,
        daysOverdue: 5
      },
      {
        id: 2,
        title: 'Normal Todo',
        dueDate: '2026-12-31',
        completed: 0,
        isOverdue: false
      },
      {
        id: 3,
        title: 'Overdue 10 days',
        dueDate: '2025-01-01',
        completed: 0,
        isOverdue: true,
        daysOverdue: 10
      },
      {
        id: 4,
        title: 'Another Normal Todo',
        dueDate: '2027-01-01',
        completed: 0,
        isOverdue: false
      }
    ];

    it('should filter to overdue only AND sort by most overdue first', () => {
      const { container } = render(
        <TodoList todos={complexTodos} {...mockHandlers} isLoading={false} />
      );
      
      // Apply filter
      const filterSelect = screen.getByLabelText('Filter todos');
      fireEvent.change(filterSelect, { target: { value: 'overdue' } });
      
      // Apply sort
      const sortSelect = screen.getByLabelText('Sort todos');
      fireEvent.change(sortSelect, { target: { value: 'most-overdue' } });
      
      // Should only show 2 overdue todos
      const cards = container.querySelectorAll('.todo-card');
      expect(cards).toHaveLength(2);
      
      // Should be sorted by most overdue first
      expect(cards[0]).toHaveTextContent('Overdue 10 days');
      expect(cards[1]).toHaveTextContent('Overdue 5 days');
      
      // Normal todos should not be present
      expect(screen.queryByText('Normal Todo')).not.toBeInTheDocument();
      expect(screen.queryByText('Another Normal Todo')).not.toBeInTheDocument();
    });
  });
});

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TodoCard from '../TodoCard';

describe('TodoCard Component', () => {
  const mockTodo = {
    id: 1,
    title: 'Test Todo',
    dueDate: '2025-12-25',
    completed: 0,
    createdAt: '2025-11-01T00:00:00Z'
  };

  const mockHandlers = {
    onToggle: jest.fn(),
    onEdit: jest.fn(),
    onDelete: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render todo title and due date', () => {
    render(<TodoCard todo={mockTodo} {...mockHandlers} isLoading={false} />);
    
    expect(screen.getByText('Test Todo')).toBeInTheDocument();
    expect(screen.getByText(/December 25, 2025/)).toBeInTheDocument();
  });

  it('should render unchecked checkbox when todo is incomplete', () => {
    render(<TodoCard todo={mockTodo} {...mockHandlers} isLoading={false} />);
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
  });

  it('should render checked checkbox when todo is complete', () => {
    const completedTodo = { ...mockTodo, completed: 1 };
    render(<TodoCard todo={completedTodo} {...mockHandlers} isLoading={false} />);
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  it('should call onToggle when checkbox is clicked', () => {
    render(<TodoCard todo={mockTodo} {...mockHandlers} isLoading={false} />);
    
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    
    expect(mockHandlers.onToggle).toHaveBeenCalledWith(mockTodo.id);
  });

  it('should show edit button', () => {
    render(<TodoCard todo={mockTodo} {...mockHandlers} isLoading={false} />);
    
    const editButton = screen.getByLabelText(/Edit/);
    expect(editButton).toBeInTheDocument();
  });

  it('should show delete button', () => {
    render(<TodoCard todo={mockTodo} {...mockHandlers} isLoading={false} />);
    
    const deleteButton = screen.getByLabelText(/Delete/);
    expect(deleteButton).toBeInTheDocument();
  });

  it('should call onDelete when delete button is clicked and confirmed', () => {
    window.confirm = jest.fn(() => true);
    render(<TodoCard todo={mockTodo} {...mockHandlers} isLoading={false} />);
    
    const deleteButton = screen.getByLabelText(/Delete/);
    fireEvent.click(deleteButton);
    
    expect(mockHandlers.onDelete).toHaveBeenCalledWith(mockTodo.id);
  });

  it('should enter edit mode when edit button is clicked', () => {
    render(<TodoCard todo={mockTodo} {...mockHandlers} isLoading={false} />);
    
    const editButton = screen.getByLabelText(/Edit/);
    fireEvent.click(editButton);
    
    expect(screen.getByDisplayValue('Test Todo')).toBeInTheDocument();
  });

  it('should apply completed class when todo is completed', () => {
    const completedTodo = { ...mockTodo, completed: 1 };
    const { container } = render(<TodoCard todo={completedTodo} {...mockHandlers} isLoading={false} />);
    
    const card = container.querySelector('.todo-card');
    expect(card).toHaveClass('completed');
  });

  it('should not render due date when dueDate is null', () => {
    const todoNoDate = { ...mockTodo, dueDate: null };
    render(<TodoCard todo={todoNoDate} {...mockHandlers} isLoading={false} />);
    
    expect(screen.queryByText(/Due:/)).not.toBeInTheDocument();
  });

  // T030: Test for overdue todo rendering with icon and red text
  describe('Overdue Display', () => {
    it('should render overdue indicator with warning icon and red text when todo is overdue', () => {
      const overdueTodo = {
        ...mockTodo,
        isOverdue: true,
        daysOverdue: 3
      };
      
      const { container } = render(<TodoCard todo={overdueTodo} {...mockHandlers} isLoading={false} />);
      
      // Check for warning icon
      expect(screen.getByText('⚠️')).toBeInTheDocument();
      
      // Check for days overdue message
      expect(screen.getByText(/3 days overdue/)).toBeInTheDocument();
      
      // Check for overdue CSS classes
      const card = container.querySelector('.todo-card');
      expect(card).toHaveClass('overdue');
      
      const title = container.querySelector('.todo-title');
      expect(title).toHaveClass('overdue-text');
    });

    it('should display singular "day" for 1 day overdue', () => {
      const overdueTodo = {
        ...mockTodo,
        isOverdue: true,
        daysOverdue: 1
      };
      
      render(<TodoCard todo={overdueTodo} {...mockHandlers} isLoading={false} />);
      
      expect(screen.getByText(/1 day overdue/)).toBeInTheDocument();
      expect(screen.queryByText(/1 days overdue/)).not.toBeInTheDocument();
    });

    // T031: Test for non-overdue todo does not show indicators
    it('should not render overdue indicator for non-overdue todo', () => {
      const normalTodo = {
        ...mockTodo,
        isOverdue: false
      };
      
      const { container } = render(<TodoCard todo={normalTodo} {...mockHandlers} isLoading={false} />);
      
      // Check warning icon is not present
      expect(screen.queryByText('⚠️')).not.toBeInTheDocument();
      
      // Check overdue message is not present
      expect(screen.queryByText(/overdue/)).not.toBeInTheDocument();
      
      // Check overdue class is not applied
      const card = container.querySelector('.todo-card');
      expect(card).not.toHaveClass('overdue');
    });

    // T032: Test for completed overdue todo does not show indicators
    it('should not render overdue indicator for completed todo even if it was overdue', () => {
      const completedOverdueTodo = {
        ...mockTodo,
        completed: 1,
        isOverdue: false,
        daysOverdue: undefined
      };
      
      const { container } = render(<TodoCard todo={completedOverdueTodo} {...mockHandlers} isLoading={false} />);
      
      // Check warning icon is not present
      expect(screen.queryByText('⚠️')).not.toBeInTheDocument();
      
      // Check overdue message is not present
      expect(screen.queryByText(/overdue/)).not.toBeInTheDocument();
      
      // Check overdue class is not applied (but completed class should be)
      const card = container.querySelector('.todo-card');
      expect(card).toHaveClass('completed');
      expect(card).not.toHaveClass('overdue');
    });

    it('should show correct overdue message for multiple days', () => {
      const overdueTodo = {
        ...mockTodo,
        isOverdue: true,
        daysOverdue: 10
      };
      
      render(<TodoCard todo={overdueTodo} {...mockHandlers} isLoading={false} />);
      
      expect(screen.getByText(/10 days overdue/)).toBeInTheDocument();
    });
  });
});

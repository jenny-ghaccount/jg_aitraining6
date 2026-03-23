# Feature Specification: Support for Overdue Todo Items

**Feature Branch**: `001-overdue-todos`  
**Created**: March 23, 2026  
**Status**: Draft  
**Input**: User description: "Support for Overdue Todo Items - As a todo application user, I want to easily identify and distinguish overdue tasks in my todo list so that I can prioritize my work and quickly see which tasks are past their due date"

## Clarifications

### Session 2026-03-23

- Q: Visual indicator design for overdue tasks? → A: Red text color + warning icon (multi-modal approach for accessibility)
- Q: Time zone handling for due date comparison? → A: Use date-only comparison (ignore time zones)
- Q: Completed-after-due-date handling? → A: Show completion was late (display "Completed X days late" on completed tasks)
- Q: Real-time updates vs page refresh? → A: Automatic on navigation (updates when user navigates away and returns to list)
- Q: Calculation location (frontend vs backend)? → A: Backend calculates per request (API returns calculated overdue status on each fetch)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visual Identification of Overdue Tasks (Priority: P1)

Users need to quickly scan their todo list and immediately identify which tasks have passed their due date without manual calculation or date comparison. When viewing the todo list, overdue tasks should be visually distinct from other tasks through clear visual indicators.

**Why this priority**: This is the minimum viable functionality that delivers the core value proposition. Without visual distinction, users must manually check each task's due date, defeating the purpose of the feature.

**Independent Test**: Can be fully tested by creating tasks with past due dates and verifying they display with distinct visual styling. Delivers immediate value by allowing users to identify overdue items at a glance.

**Acceptance Scenarios**:

1. **Given** I have a todo with a due date in the past and status "incomplete", **When** I view my todo list, **Then** the overdue todo displays with a distinct visual indicator (such as different text color, background, or icon)
2. **Given** I have a todo with a due date in the past and status "completed", **When** I view my todo list, **Then** the completed todo does NOT display as overdue
3. **Given** I have a todo with a due date of today, **When** I view my todo list, **Then** the todo does NOT display as overdue
4. **Given** I have a todo with a due date in the future, **When** I view my todo list, **Then** the todo does NOT display as overdue
5. **Given** I have a todo with no due date, **When** I view my todo list, **Then** the todo does NOT display as overdue

---

### User Story 2 - Overdue Duration Information (Priority: P2)

Users want to understand not just that a task is overdue, but how overdue it is. This helps them assess urgency - a task that's 1 day overdue may be less critical than one that's 30 days overdue.

**Why this priority**: Enhances the P1 functionality by adding context but isn't required for basic overdue identification. Users can still identify overdue tasks without this information.

**Independent Test**: Can be tested by creating tasks with various past due dates and verifying the system displays how many days overdue each task is.

**Acceptance Scenarios**:

1. **Given** I have a todo that is 1 day overdue, **When** I view the todo list, **Then** the system displays "1 day overdue" or similar message
2. **Given** I have a todo that is 7 days overdue, **When** I view the todo list, **Then** the system displays "7 days overdue" or similar message
3. **Given** I have a todo that became overdue earlier today, **When** I view the todo list, **Then** the system displays appropriate timing (e.g., "Due today" or "Overdue today")

---

### User Story 3 - Organize by Overdue Status (Priority: P3)

Users managing many tasks want to focus specifically on overdue items or exclude them from view. Having the ability to sort or filter by overdue status helps users organize their workflow and focus on the most urgent items.

**Why this priority**: This is a convenience feature that enhances task management but isn't essential for identifying overdue tasks. Users can identify and act on overdue items without filtering.

**Independent Test**: Can be tested by creating a mixed list of overdue and non-overdue tasks, applying filters/sorts, and verifying the correct subset is displayed or ordered appropriately.

**Acceptance Scenarios**:

1. **Given** I have a mix of overdue and non-overdue todos, **When** I apply a filter to show only overdue items, **Then** only incomplete tasks with past due dates are displayed
2. **Given** I have multiple overdue todos, **When** I sort by overdue status, **Then** overdue tasks are grouped together, ordered by how overdue they are (most overdue first)

---

### Edge Cases

- **Date-only due dates**: System treats all due dates as date-only (no time component) per FR-003, eliminating time-based ambiguity
- **Midnight transitions**: Overdue status is calculated on each API request based on current server date; tasks become overdue at the start of the day after their due date
- **Incorrect system clock**: System relies on server clock; if server time is incorrect, overdue calculations will be incorrect until clock is corrected (monitoring/alerting on clock skew recommended but outside feature scope)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST identify a todo as overdue when its due date is before the current date AND the todo status is not "completed"
- **FR-002**: System MUST apply distinct visual styling to overdue todos using red text color and a warning icon to differentiate them from non-overdue todos (multi-modal accessibility approach)
- **FR-003**: System MUST calculate overdue status based on calendar dates using date-only comparison (ignoring time and time zone information)
- **FR-004**: System MUST NOT mark todos as overdue if they have no due date assigned
- **FR-005**: System MUST NOT mark todos as overdue if they are already completed, but MUST display late completion information (e.g., "Completed 3 days late") if the task was completed after its due date
- **FR-006**: System MUST recalculate overdue status when the todo list is loaded or refreshed (automatic update on navigation, no manual refresh required)
- **FR-007**: System MUST display the number of days a task is overdue for P2 implementation
- **FR-008**: System MUST support filtering todo lists to show only overdue items for P3 implementation
- **FR-009**: System MUST support sorting todos by overdue status for P3 implementation
- **FR-010**: System MUST use the user's local calendar date for determining what constitutes "today" and "past" (date-only, no time zone conversion)
- **FR-011**: System MUST calculate and display how many days late a task was completed (completion date minus due date) when applicable
- **FR-012**: Backend API MUST calculate overdue status and overdue duration on each request and include this computed information in the response (overdue status is computed, not stored)

### Key Entities

- **Todo Item**: Represents a task with properties including title, status (completed/incomplete), due date (optional), and display state. The overdue state is computed by the backend on each API request by comparing the due date with the current date and checking the completion status. The API response includes computed fields: `isOverdue` (boolean) and `daysOverdue` (integer, for incomplete overdue tasks) or `daysLate` (integer, for tasks completed after due date).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can identify overdue tasks within 3 seconds of viewing their todo list without needing to read individual due dates
- **SC-002**: Visual distinction of overdue tasks is immediately noticeable and does not require user configuration
- **SC-003**: Overdue status accurately reflects the current date 100% of the time when the list is displayed
- **SC-004**: Users can distinguish between tasks that are 1 day overdue vs 10 days overdue (P2 feature)
- **SC-005**: Users can isolate all overdue tasks with a single interaction (filter or sort) (P3 feature)

## Assumptions

- The todo application already supports due dates on todo items
- The todo application has a concept of completed vs incomplete tasks
- The system has access to the current date and time
- Visual styling changes are supported in the application's user interface
- Date comparison logic can be implemented without requiring external date libraries (or appropriate libraries are already available in the project)

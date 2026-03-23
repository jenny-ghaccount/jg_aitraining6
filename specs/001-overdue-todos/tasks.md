# Tasks: Support for Overdue Todo Items

**Input**: Design documents from `/workspaces/jg_aitraining6/specs/001-overdue-todos/`
**Prerequisites**: plan.md, spec.md, data-model.md, research.md, contracts/api-contract.md, quickstart.md

**Feature**: Enable users to easily identify and distinguish overdue tasks through visual indicators (red text + warning icon), overdue duration display, and optional filtering/sorting capabilities.

**Tests**: Included per constitution requirement for 80%+ code coverage and TDD approach.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and verification

- [ ] T001 Verify project dependencies installed (Express 4.18.2, React 18.2.0, better-sqlite3 11.10.0, Jest 29.7.0)
- [ ] T002 [P] Verify backend runs on http://localhost:3030
- [ ] T003 [P] Verify frontend runs on http://localhost:3000
- [ ] T004 [P] Confirm existing todo CRUD operations work (create, read, update, delete)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core backend service layer for overdue calculations - MUST complete before ANY user story

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T005 Create backend service structure in packages/backend/src/services/todoService.js with getTodayDate() helper function
- [X] T006 Implement isOverdue() function in packages/backend/src/services/todoService.js (date-only comparison logic)
- [X] T007 Implement calculateDaysOverdue() function in packages/backend/src/services/todoService.js (date difference calculation)
- [X] T008 Implement enrichTodoWithOverdueStatus() function in packages/backend/src/services/todoService.js (add computed fields)
- [X] T009 Create test file packages/backend/__tests__/services/todoService.test.js with Jest fake timers setup
- [X] T010 [P] Add unit tests for getTodayDate() in packages/backend/__tests__/services/todoService.test.js
- [X] T011 [P] Add unit tests for isOverdue() covering all edge cases in packages/backend/__tests__/services/todoService.test.js
- [X] T012 [P] Add unit tests for calculateDaysOverdue() in packages/backend/__tests__/services/todoService.test.js
- [X] T013 [P] Add unit tests for enrichTodoWithOverdueStatus() in packages/backend/__tests__/services/todoService.test.js
- [X] T014 Run backend tests to verify all service functions pass (npm run test:backend)

**Checkpoint**: Foundation ready - backend can compute overdue status correctly

---

## Phase 3: User Story 1 - Visual Identification of Overdue Tasks (Priority: P1) 🎯 MVP

**Goal**: Users can quickly scan their todo list and immediately identify which tasks have passed their due date through red text color and warning icon indicators.

**Independent Test**: Create todos with past due dates and incomplete status, verify they display with red text and warning icon. Create todos with future dates or completed status, verify they do NOT show overdue indicators.

### Backend API Integration for User Story 1

- [X] T015 [US1] Update GET /api/todos route in packages/backend/src/app.js to import enrichTodoWithOverdueStatus from todoService
- [X] T016 [US1] Modify GET /api/todos route to map all todos through enrichTodoWithOverdueStatus before returning response in packages/backend/src/app.js
- [X] T017 [US1] Update GET /api/todos/:id route to apply enrichTodoWithOverdueStatus to single todo in packages/backend/src/app.js
- [X] T018 [US1] Update POST /api/todos route to apply enrichTodoWithOverdueStatus to newly created todo in response in packages/backend/src/app.js
- [X] T019 [US1] Add integration tests for GET /api/todos with overdue todos in packages/backend/__tests__/app.test.js
- [X] T020 [P] [US1] Add integration tests for GET /api/todos/:id with overdue todo in packages/backend/__tests__/app.test.js
- [X] T021 [P] [US1] Add integration tests for POST /api/todos response includes isOverdue field in packages/backend/__tests__/app.test.js
- [X] T022 [US1] Run backend tests to verify API returns computed overdue fields (npm run test:backend)

### Frontend Visual Indicators for User Story 1

- [X] T023 [P] [US1] Add CSS variables for overdue colors in packages/frontend/src/styles/theme.css (--danger-color for light and dark themes)
- [X] T024 [P] [US1] Add .overdue-text class styling with red color in packages/frontend/src/styles/theme.css
- [X] T025 [P] [US1] Add .overdue-icon class styling with font size and margin in packages/frontend/src/styles/theme.css
- [X] T026 [US1] Update TodoCard component to conditionally apply overdue class based on todo.isOverdue in packages/frontend/src/components/TodoCard.js
- [X] T027 [US1] Add warning icon (⚠️) conditional rendering before title when todo.isOverdue is true in packages/frontend/src/components/TodoCard.js
- [X] T028 [US1] Apply overdue-text class to todo title when todo.isOverdue is true in packages/frontend/src/components/TodoCard.js
- [X] T029 [US1] Add ARIA label for accessibility when todo is overdue in packages/frontend/src/components/TodoCard.js
- [X] T030 [US1] Add test for overdue todo rendering with icon and red text in packages/frontend/src/components/__tests__/TodoCard.test.js
- [X] T031 [P] [US1] Add test for non-overdue todo does not show indicators in packages/frontend/src/components/__tests__/TodoCard.test.js
- [X] T032 [P] [US1] Add test for completed overdue todo does not show indicators in packages/frontend/src/components/__tests__/TodoCard.test.js
- [X] T033 [US1] Run frontend tests to verify TodoCard visual indicators (npm run test:frontend)

**Checkpoint**: User Story 1 complete - Users can visually identify overdue tasks with red text and warning icon

---

## Phase 4: User Story 2 - Overdue Duration Information (Priority: P2)

**Goal**: Users can understand not just that a task is overdue, but how overdue it is (e.g., "3 days overdue") to assess urgency.

**Independent Test**: Create todos with various past due dates (1 day, 7 days, 30 days overdue), verify system displays correct "X days overdue" message for each.

### Frontend Duration Display for User Story 2

- [X] T034 [P] [US2] Add .overdue-info class styling in packages/frontend/src/styles/theme.css (font size, color, margin)
- [X] T035 [US2] Add conditional rendering of overdue duration message in packages/frontend/src/components/TodoCard.js (displays "X day(s) overdue")
- [X] T036 [US2] Implement proper singular/plural handling for days count in overdue message in packages/frontend/src/components/TodoCard.js
- [X] T037 [US2] Add test for 1 day overdue displays "1 day overdue" in packages/frontend/src/components/__tests__/TodoCard.test.js
- [X] T038 [P] [US2] Add test for multiple days overdue displays "X days overdue" in packages/frontend/src/components/__tests__/TodoCard.test.js
- [X] T039 [US2] Run frontend tests to verify overdue duration display (npm run test:frontend)

**Checkpoint**: User Story 2 complete - Users can see how many days tasks are overdue

---

## Phase 5: User Story 3 - Organize by Overdue Status (Priority: P3)

**Goal**: Users managing many tasks can filter to show only overdue items or sort by overdue status to focus on urgent tasks.

**Independent Test**: Create a mixed list of overdue and non-overdue tasks, apply filter to show only overdue, verify correct subset displayed. Sort by overdue status, verify most overdue tasks appear first.

### Frontend Filter/Sort Implementation for User Story 3

- [X] T040 [P] [US3] Add filter dropdown UI component in packages/frontend/src/components/TodoList.js (options: All, Overdue Only)
- [X] T041 [P] [US3] Add sort dropdown UI component in packages/frontend/src/components/TodoList.js (options: Default, Most Overdue First)
- [X] T042 [US3] Implement filter logic to show only overdue todos when "Overdue Only" selected in packages/frontend/src/components/TodoList.js
- [X] T043 [US3] Implement sort logic to order todos by daysOverdue descending when "Most Overdue First" selected in packages/frontend/src/components/TodoList.js
- [X] T044 [US3] Add filter state management with useState in packages/frontend/src/components/TodoList.js
- [X] T045 [US3] Add sort state management with useState in packages/frontend/src/components/TodoList.js
- [X] T046 [US3] Add test for filter shows only overdue todos in packages/frontend/src/components/__tests__/TodoList.test.js
- [X] T047 [P] [US3] Add test for sort orders by most overdue first in packages/frontend/src/components/__tests__/TodoList.test.js
- [X] T048 [P] [US3] Add test for filter and sort work together correctly in packages/frontend/src/components/__tests__/TodoList.test.js
- [X] T049 [US3] Run frontend tests to verify filter and sort functionality (npm run test:frontend)

**Checkpoint**: User Story 3 complete - Users can filter and sort by overdue status

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and quality improvements

- [X] T050 [P] Run all backend tests to ensure no regressions (npm run test:backend)
- [X] T051 [P] Run all frontend tests to ensure no regressions (npm run test:frontend)
- [X] T052 [P] Verify code coverage meets 80%+ requirement for backend
- [X] T053 [P] Verify code coverage meets 80%+ requirement for frontend
- [X] T054 [P] Run ESLint checks on backend code (npm run lint:backend)
- [X] T055 [P] Run ESLint checks on frontend code (npm run lint:frontend)
- [X] T056 Manual testing: Create todo with past due date, verify red text and warning icon appear
- [X] T057 Manual testing: Mark overdue todo as complete, verify indicators disappear
- [X] T058 Manual testing: Create todo with future due date, verify no indicators appear
- [X] T059 Manual testing: Verify overdue todo shows correct days overdue (compare with calendar)
- [X] T060 Manual testing: Test filter "Overdue Only" shows correct subset
- [X] T061 Manual testing: Test sort "Most Overdue First" orders correctly
- [X] T062 Manual testing: Verify light and dark theme colors for overdue text are visible
- [X] T063 Validate quickstart.md test scenarios all pass
- [X] T064 Review code for DRY, KISS, SOLID principles compliance
- [X] T065 Review code for design system consistency (8px grid, theme colors)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational (Phase 2) - MVP delivery point
- **User Story 2 (Phase 4)**: Depends on Foundational (Phase 2) - Can run parallel with US1 if staffed
- **User Story 3 (Phase 5)**: Depends on Foundational (Phase 2) - Can run parallel with US1/US2 if staffed
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1 - MVP)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Extends US1 but independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Enhances US1 but independently testable

### Within Each User Story

**User Story 1 (Visual Indicators)**:
1. Backend API Integration tasks (T015-T022) must complete before Frontend tasks (T023-T033)
2. Within Backend: Service import (T015) before route modifications (T016-T018) before tests (T019-T022)
3. Within Frontend: CSS (T023-T025) can run parallel with component updates (T026-T029), then tests (T030-T033)

**User Story 2 (Duration Display)**:
1. CSS (T034) can run parallel with component logic (T035-T036)
2. Tests (T037-T039) run after component implementation

**User Story 3 (Filter/Sort)**:
1. UI components (T040-T041) can run parallel
2. Logic (T042-T045) depends on UI components
3. Tests (T046-T049) run after logic implementation

### Parallel Opportunities

**Setup Phase (Phase 1)**:
- T002, T003, T004 can all run in parallel (different verification tasks)

**Foundational Phase (Phase 2)**:
- T010, T011, T012, T013 can run in parallel (test different functions in same file)

**User Story 1 - Backend**:
- T020, T021 can run in parallel (test different endpoints)

**User Story 1 - Frontend Styles**:
- T023, T024, T025 can run in parallel (different CSS rules in same file, can be added together)

**User Story 1 - Frontend Tests**:
- T031, T032 can run in parallel (test different scenarios)

**User Story 2 - Frontend**:
- T034, T035 can run in parallel (CSS and component logic in different files)
- T037, T038 can run in parallel (test different scenarios)

**User Story 3 - Frontend**:
- T040, T041 can run in parallel (UI components for filter and sort)
- T047, T048 can run in parallel (test different scenarios)

**Polish Phase (Phase 6)**:
- T050-T055 can all run in parallel (different linting and testing commands)
- T056-T062 manual tests can be done in any order

---

## Parallel Example: User Story 1 Backend Tests

```bash
# Launch all API integration tests in parallel:
Task: "Add integration tests for GET /api/todos with overdue todos in packages/backend/__tests__/app.test.js"
Task: "Add integration tests for GET /api/todos/:id with overdue todo in packages/backend/__tests__/app.test.js"
Task: "Add integration tests for POST /api/todos response includes isOverdue field in packages/backend/__tests__/app.test.js"
```

---

## Parallel Example: User Story 1 Frontend Styles

```bash
# Launch all CSS style definitions together:
Task: "Add CSS variables for overdue colors in packages/frontend/src/styles/theme.css"
Task: "Add .overdue-text class styling with red color in packages/frontend/src/styles/theme.css"
Task: "Add .overdue-icon class styling with font size and margin in packages/frontend/src/styles/theme.css"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. ✅ Complete Phase 1: Setup (T001-T004)
2. ✅ Complete Phase 2: Foundational (T005-T014) - **CRITICAL CHECKPOINT**
3. ✅ Complete Phase 3: User Story 1 (T015-T033)
4. **STOP and VALIDATE**: Test US1 independently with manual scenarios
5. Deploy/demo MVP (users can visually identify overdue tasks)

**MVP Delivers**: Red text + warning icon for overdue tasks (core value proposition)

### Incremental Delivery

1. **Foundation** (Phase 1-2) → Backend service ready
2. **MVP** (Phase 3) → Visual overdue indicators → **Deploy/Demo**
3. **Enhanced** (Phase 4) → Add duration display → **Deploy/Demo**
4. **Full Feature** (Phase 5) → Add filter/sort → **Deploy/Demo**
5. **Polished** (Phase 6) → Quality verification → **Final Release**

Each phase adds value without breaking previous functionality.

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup (Phase 1) + Foundational (Phase 2) together
2. Once Foundational completes:
   - **Developer A**: User Story 1 (T015-T033) - Visual indicators
   - **Developer B**: User Story 2 (T034-T039) - Duration display (waits for backend service from Phase 2)
   - **Developer C**: User Story 3 (T040-T049) - Filter/Sort (waits for backend service from Phase 2)
3. Each developer delivers independently testable story increment

**Note**: User Story 2 and 3 both depend on the enriched API from User Story 1's backend work (T015-T018), so coordinate completion if parallelizing.

---

## Task Summary

- **Total Tasks**: 65
- **Setup Phase**: 4 tasks
- **Foundational Phase**: 10 tasks (BLOCKING)
- **User Story 1 (P1 - MVP)**: 18 tasks (8 backend, 10 frontend)
- **User Story 2 (P2)**: 6 tasks (frontend only)
- **User Story 3 (P3)**: 10 tasks (frontend only)
- **Polish Phase**: 16 tasks
- **Parallel Opportunities**: 22 tasks marked [P]
- **Suggested MVP Scope**: Phase 1-3 (T001-T033) = 32 tasks

---

## Notes

- **[P] tasks**: Different files or different test scenarios, no dependencies within their phase
- **[Story] labels**: US1 (Visual Indicators), US2 (Duration Display), US3 (Filter/Sort)
- **Format validation**: All tasks follow `- [ ] [ID] [P?] [Story?] Description with path` format
- **Independent testing**: Each user story has clear acceptance criteria and can be validated separately
- **No database changes**: All computed fields calculated at runtime
- **Backward compatible**: Existing API clients continue to work (additive changes only)
- **TDD approach**: Tests written alongside implementation per constitution
- **Accessibility**: Multi-modal indicators (color + icon + ARIA labels)
- **Theme support**: Works in both light and dark themes

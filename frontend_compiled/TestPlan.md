# Test Plan – AI Adaptive MCQ Frontend

## Objective

Ensure the frontend UI behaves as expected, supports adaptive learning logic, and properly interacts with backend APIs.

## Scope

- Component-level unit tests (Navbar, Login, Dashboard, Profile)
- Manual integration testing via browser
- All protected routes, state transitions, and API interactions

## Tools

- Jest
- @testing-library/react
- Manual browser testing

## Unit Test Scope

| Component | Tested |
|-----------|--------|
| Navbar | ✅ |
| LoginPage | ✅ |
| Dashboard | ✅ |
| ProfilePage | ✅ |

## Acceptance Criteria

1. Login + Logout work
2. Pages are protected by auth
3. Questions adapt based

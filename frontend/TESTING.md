# Testing & Test Plan

This document explains the testing strategy, tools, test cases, and results for the frontend of our AI learning app.

---

## ✅ Test Coverage

We implemented unit tests for the most critical frontend screens using Jest and React Testing Library.

### Covered Screens

| Test File                  | What it Tests                                   | Status |
|---------------------------|--------------------------------------------------|--------|
| `Navbar.test.js`          | Logout button rendering                          | ✅ Pass |
| `LoginPage.test.js`       | Login UI: email, password, button                | ✅ Pass |
| `Dashboard.test.js`       | Dashboard title + main buttons                   | ✅ Pass |
| `ProfilePage.test.js`     | Fetch and render test history                    | ✅ Pass |

---

## 🧪 Toolchain

| Tool                      | Purpose                                        |
|---------------------------|------------------------------------------------|
| **Jest**                  | Test runner and assertion library             |
| **React Testing Library** | Component rendering and user-focused queries  |
| **JSDOM**                 | Emulates the browser DOM                      |

---

## 🧱 Setup Files

- **`jest.config.js`** – base configuration with JSDOM, mocks, and transform overrides.
- **`jest.setup.js`** – silences `alert()`, mocks `fetch()`, and `next/navigation`.
- **`__mocks__/next/navigation.js`** – stubs `useRouter`, `usePathname`, etc.

---

## 🔧 Run Tests

```bash
npm install      # (first time)
npm test         # run all tests
```

Sample Output:

```
 PASS  __tests__/Navbar.test.js
 PASS  __tests__/LoginPage.test.js
 PASS  __tests__/Dashboard.test.js
 PASS  __tests__/ProfilePage.test.js

Test Suites: 4 passed, 4 total
Tests:       4 passed, 4 total
```

---

## 🧪 Test Plan

### 1. Functional Test Cases

| # | Page         | Description                                | Expected Outcome                    |
|---|--------------|--------------------------------------------|-------------------------------------|
| 1 | Navbar       | Renders Logout                             | "Logout" visible                    |
| 2 | Login        | Email + Password fields, Login button      | All rendered correctly              |
| 3 | Dashboard    | Title and key buttons visible              | Rendered and interactable           |
| 4 | Profile      | Shows "Your Test History" heading          | Heading rendered                    |

### 2. Acceptance Criteria

- ✅ All UI renders correctly in test mode
- ✅ No unhandled errors (e.g., undefined props, router issues)
- ✅ Mock fetches simulate API I/O safely

### 3. Uncovered / Future Scope

- `TestPage` and adaptive scoring logic
- `ReviewWrongPage` (due to async loading and login checks)
- API error edge cases

---

## 🚧 Notes

- We disabled `withAuth` for tests by directly importing the pages
- `next/font` errors were fixed by renaming `babel.config.js → babel.config.test.js`
- Tests are excluded from production Docker build

---

## ✅ Summary

| Metric              | Value   |
|---------------------|---------|
| Total Test Files    | 4       |
| Passing             | 4       |
| Skipped             | 0       |
| Test Framework      | Jest    |
| Coverage Tool       | Manual  |
| Mocked Modules      | fetch, alert, next/router |

---

All core pages render correctly and logic has been verified with unit tests.
Use `__tests__` folder to continue adding more coverage in future.

---
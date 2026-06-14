# Admin Analytics and Reports Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add real, role-protected monthly analytics to the existing admin reports API and deliver responsive Admin/Super Admin analytics and reports pages using the approved Doctor Hub visual direction.

**Architecture:** Keep `GET /admin/reports` backward-compatible and add pure aggregation helpers around 12-month UTC buckets. Query users, appointments, and verified payments with appointment/doctor consultation fees concurrently, then normalize the response on the frontend and use isolated fallback data only after request failure. Render the result through small reusable React card components and Recharts.

**Tech Stack:** Node.js, Express, Supabase JS, Node test runner, React 19, React Router, Recharts, Vitest, Testing Library, CSS.

---

## File Structure

- Create `backend/src/utils/analytics.js`: pure month bucketing, summary, and percentage helpers.
- Create `backend/src/utils/analytics.test.js`: Node tests for aggregation helpers.
- Create `backend/src/routes/adminRoutes.test.js`: authorization tests for the reports route middleware stack.
- Modify `backend/src/controllers/adminController.js`: concurrent analytics queries and backward-compatible response.
- Modify `backend/package.json` and `backend/package-lock.json`: backend test script and test dependency metadata if route integration needs it.
- Create `src/data/analyticsFallbackData.js`: the only fallback/mock analytics data.
- Create `src/utils/analyticsData.js` and `src/utils/analyticsData.test.js`: normalize API and legacy response shapes.
- Create `src/components/analytics/ChartCard.jsx`, `ReportCard.jsx`, and `StatItem.jsx`: reusable presentation components.
- Create `src/pages/admin/Analytics.jsx` and `src/pages/admin/Analytics.test.jsx`: analytics page and chart-card tests.
- Modify `src/pages/admin/Reports.jsx` and create `src/pages/admin/Reports.test.jsx`: redesigned reports page and tests.
- Create `src/components/common/ProtectedRoute.test.jsx`: allowed and denied role behavior.
- Modify `src/App.jsx`, `src/pages/admin/AdminDashboard.jsx`, `src/pages/admin/ManageUsers.jsx`, `src/pages/admin/AddDoctor.jsx`, and `src/pages/superadmin/SuperAdminDashboard.jsx`: protected routes and scoped sidebar links.
- Modify `src/App.css`: analytics/report card and responsive grid styles only.
- Modify `package.json` and `package-lock.json`: Recharts dependency.
- Update `docs/superpowers/specs/2026-06-14-admin-analytics-reports-design.md`: record consultation fee as the revenue source.

### Task 1: Backend Analytics Helpers

- [ ] Write failing `node:test` cases for a fixed 12-month range, zero-filled monthly users and appointments, verified consultation-fee revenue, role distribution, appointment summary, and payment analytics.
- [ ] Run `node --test src/utils/analytics.test.js` from `backend`; expect failures because `analytics.js` does not exist.
- [ ] Implement UTC month keys/labels, range generation, series aggregation, summaries, and revenue comparison in `backend/src/utils/analytics.js`.
- [ ] Re-run the focused backend helper test; expect all tests to pass.

### Task 2: Reports API and Authorization

- [ ] Write failing tests that exercise the reports route with signed tokens for `admin`, `super_admin`, `patient`, `doctor`, and `assistant`, plus no token.
- [ ] Run the route test and confirm the expected red state before changing production code.
- [ ] Update `getReports` to query existing aggregate RPCs/counts plus raw `users.created_at`, `appointments.created_at/status`, and `payments.created_at/status` joined through appointment to doctor `consultation_fee`.
- [ ] Preserve all six legacy response fields and append the six new analytics fields.
- [ ] Make Supabase query errors produce a controlled 500 response instead of silently returning misleading partial analytics.
- [ ] Keep `authenticate` and `authorize('admin','super_admin')` on the route.
- [ ] Run all backend tests; expect zero failures.

### Task 3: Frontend Data Contract

- [ ] Write failing Vitest cases for API normalization, legacy summary derivation, legitimate all-zero API responses, and failure-only fallback selection.
- [ ] Run `npm test -- src/utils/analyticsData.test.js`; expect import/behavior failures.
- [ ] Create the isolated fallback contract in `src/data/analyticsFallbackData.js`.
- [ ] Implement numeric coercion, legacy mappings, role label data, and `loadAnalyticsData()` in `src/utils/analyticsData.js`.
- [ ] Re-run the focused normalization tests; expect all to pass.

### Task 4: Role-Protected Routes

- [ ] Write failing `ProtectedRoute` tests proving Admin/Super Admin access and Patient/Doctor/Assistant redirects.
- [ ] Run the focused tests and confirm failures for missing analytics routes/navigation expectations.
- [ ] Add lazy analytics import and `/admin/analytics` plus `/superadmin/analytics` routes with the exact role guards from the spec.
- [ ] Add Analytics links only to Admin/Super Admin sidebar arrays.
- [ ] Re-run route and guard tests; expect all to pass.

### Task 5: Analytics Dashboard UI

- [ ] Write a failing page test that mocks the reports API and asserts four chart card headings and real response values.
- [ ] Add a second failing test asserting a fallback notice and fallback values only after API rejection.
- [ ] Run the focused analytics page tests and confirm the red state.
- [ ] Install Recharts and create `ChartCard`, `ReportCard`, and `StatItem` presentation components.
- [ ] Implement `Analytics.jsx` with responsive area, bar, donut, and area charts using the normalized API contract.
- [ ] Add analytics-specific balanced professional styles without changing global background variables.
- [ ] Re-run analytics tests; expect all to pass.

### Task 6: Reports Page UI

- [ ] Write failing tests for the four required report cards and key API-derived totals.
- [ ] Run the focused reports test and confirm the red state.
- [ ] Refactor `Reports.jsx` to use the shared loader/components, preserve report download, and render Monthly Revenue, User Growth, Appointment Summary, and Payment Analytics cards.
- [ ] Ensure fallback notice behavior matches the analytics page.
- [ ] Re-run reports tests; expect all to pass.

### Task 7: Full Verification

- [ ] Run `npm test` in `backend`; expect zero failures.
- [ ] Run `npm test` at repository root; expect zero failures.
- [ ] Run `npm run lint`; expect zero errors.
- [ ] Run `npm run build`; expect exit code 0.
- [ ] Start the frontend and inspect analytics/reports at desktop and mobile widths in the browser, checking four charts/cards, two-to-one-column behavior, and unchanged background.
- [ ] Review `git status` and `git diff`; confirm homepage, public/patient/doctor/assistant pages, header, logo, prescription PDF, user assets, and `.superpowers` mockups are not staged.

### Task 8: Commit and Push

- [ ] Stage only the files listed in this plan plus dependency lockfiles and the approved docs.
- [ ] Commit with `feat: add admin analytics and reports`.
- [ ] Push the current `main` branch to `origin`.
- [ ] Report the commit SHA, verification commands, and changed-file summary.

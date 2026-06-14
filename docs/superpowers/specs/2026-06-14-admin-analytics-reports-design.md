# Admin Analytics and Reports Design

## Goal

Build professional analytics and reports experiences for Doctor Hub administrators, backed by real monthly platform data while preserving the existing site theme and existing report API consumers.

## Scope

The change is limited to Admin and Super Admin analytics/report routes, shared analytics/report UI components, the existing admin reports API, analytics/report tests, and the chart dependency. Homepage, public pages, patient pages, doctor pages, assistant pages, header, logo, and prescription PDF behavior remain unchanged.

## Access Control

- `GET /api/admin/reports` remains protected by authentication and `authorize('admin', 'super_admin')`.
- Admin and Super Admin frontend analytics/report routes use `ProtectedRoute` with `roles={['admin', 'super_admin']}` where shared access is intended.
- Super Admin aliases remain restricted to `super_admin` where they currently are.
- Patient, Doctor, Assistant, and unauthenticated users cannot access the API or pages.
- Access tests verify both allowed roles and all denied roles.

## Backend Contract

The existing `GET /admin/reports` endpoint remains backward-compatible. These current fields stay available with the same meaning:

- `total_doctors`
- `total_patients`
- `total_clinics`
- `users_by_role`
- `appointments_by_status`
- `payments_by_status`

The endpoint adds:

```json
{
  "monthly_user_growth": [
    { "month": "2026-01", "label": "Jan", "users": 12 }
  ],
  "monthly_revenue": [
    { "month": "2026-01", "label": "Jan", "revenue": 12500 }
  ],
  "monthly_appointments": [
    { "month": "2026-01", "label": "Jan", "appointments": 84 }
  ],
  "user_distribution": {
    "patient": 0,
    "doctor": 0,
    "assistant": 0,
    "admin": 0,
    "super_admin": 0
  },
  "appointment_summary": {
    "total": 0,
    "pending": 0,
    "confirmed": 0,
    "completed": 0,
    "cancelled": 0
  },
  "payment_analytics": {
    "total": 0,
    "verified": 0,
    "pending": 0,
    "rejected": 0,
    "total_revenue": 0,
    "current_month_revenue": 0,
    "previous_month_revenue": 0,
    "monthly_change_percent": 0
  }
}
```

Monthly data covers the latest 12 calendar months, ordered oldest to newest. Months without rows are zero-filled. User growth is the number of newly created users in each month. Appointment trend is the number of appointments created in each month. Because the current payments table stores proof and verification state but no amount, revenue is the sum of each verified payment's appointment doctor consultation fee. Invalid or absent numeric values count as zero.

If the existing schema uses the payment amount or timestamp column names already defined by the Payment model/schema, the controller uses those exact names. The API aggregation helpers remain pure functions where possible so month bucketing and summaries can be unit tested without Supabase.

All independent Supabase reads run concurrently. A query failure is handled by the existing Express error pipeline or a controlled error response; the frontend then selects isolated fallback data.

## Frontend Architecture

### Routes and Navigation

- Add `/admin/analytics` for Admin and Super Admin.
- Add `/superadmin/analytics` for Super Admin.
- Keep `/admin/reports` and `/superadmin/reports` working.
- Add Analytics links to the Admin and Super Admin sidebars without changing unrelated navigation.

### Pages

`Analytics.jsx` renders a page heading and a responsive two-column grid containing:

1. User Growth: blue area line chart.
2. Revenue: green bar chart with currency formatting.
3. User Distribution: donut chart with counts for patients, doctors, assistants, admins, and super admins.
4. Appointments Trend: teal area line chart.

`Reports.jsx` retains report generation and is redesigned into four report cards:

1. Monthly Revenue Report.
2. User Growth Report.
3. Appointment Summary.
4. Payment Analytics.

The page derives report values from the new API fields while still tolerating the legacy aggregate fields. Existing text report generation remains available and includes the richer summaries.

### Reusable Components

- `ChartCard`: title, optional subtitle/value, and responsive chart content.
- `ReportCard`: icon, title, summary value, and a list of stat items.
- `StatItem`: label, value, optional status/accent styling.

Components remain presentation-focused and receive normalized data through props.

### Data Normalization and Fallback

`analyticsFallbackData.js` is the only file containing mock/fallback analytics values. The data is clearly labeled as fallback and mirrors the API contract.

`analyticsData.js` normalizes API values, maps legacy aggregate arrays into summaries when needed, and selects fallback data only when the API request fails. A successful API response containing legitimate zeros does not trigger fallback data. The UI shows a subtle notice when fallback data is active so administrators are not misled.

## Visual Design

Use the approved Balanced Professional direction:

- Preserve the global `#f5f7fb` background and existing sidebar/theme variables.
- White or soft-surface cards with subtle borders and shadows.
- Rounded corners consistent with existing Doctor Hub cards.
- Clear card headings, summary values, and restrained muted text.
- Two columns on desktop and one column at the existing mobile breakpoint.
- Responsive Recharts containers with accessible chart labels/tooltips.
- Blue user growth, green revenue, role-specific donut colors, and teal appointment trend.
- No global theme or unrelated component restyling.

## Testing Strategy

Backend tests are written first and observed failing before implementation. They cover:

- Month range creation and zero filling.
- Monthly user, verified revenue, and appointment aggregation.
- Role distribution, appointment summary, and payment analytics.
- Backward-compatible response fields.
- Admin and Super Admin authorization success.
- Patient, Doctor, Assistant, and unauthenticated authorization rejection.

Frontend tests are written first and observed failing before implementation. They cover:

- Protected analytics/report route access for Admin and Super Admin.
- Redirect behavior for Patient, Doctor, and Assistant.
- Four analytics chart cards rendering from API data.
- Four report cards rendering from API data.
- Fallback activation only after API failure.
- The responsive grid CSS breakpoint is present; final layout is also verified in the browser at desktop and mobile widths.

## Verification and Delivery

Run backend tests, frontend tests, lint, and the production build. Start the local app and verify desktop/mobile analytics and reports in the browser. Review `git diff` to ensure unrelated user changes, including current homepage/assets work, are excluded. Commit only analytics/report-related files with a clear message, then push the current branch to its configured upstream.

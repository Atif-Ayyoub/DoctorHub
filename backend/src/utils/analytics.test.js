const test = require('node:test');
const assert = require('node:assert/strict');

const {
  buildAnalytics,
  createMonthRange,
} = require('./analytics');

const now = new Date('2026-06-14T12:00:00.000Z');

test('creates the latest 12 UTC calendar months oldest first', () => {
  assert.deepEqual(createMonthRange(now), [
    { month: '2025-07', label: 'Jul' },
    { month: '2025-08', label: 'Aug' },
    { month: '2025-09', label: 'Sep' },
    { month: '2025-10', label: 'Oct' },
    { month: '2025-11', label: 'Nov' },
    { month: '2025-12', label: 'Dec' },
    { month: '2026-01', label: 'Jan' },
    { month: '2026-02', label: 'Feb' },
    { month: '2026-03', label: 'Mar' },
    { month: '2026-04', label: 'Apr' },
    { month: '2026-05', label: 'May' },
    { month: '2026-06', label: 'Jun' },
  ]);
});

test('builds zero-filled monthly series and platform summaries', () => {
  const result = buildAnalytics({
    now,
    users: [
      { role: 'patient', created_at: '2026-05-01T10:00:00Z' },
      { role: 'patient', created_at: '2026-06-01T10:00:00Z' },
      { role: 'doctor', created_at: '2026-06-02T10:00:00Z' },
      { role: 'assistant', created_at: 'not-a-date' },
      { role: 'admin', created_at: '2024-01-01T10:00:00Z' },
      { role: 'super_admin', created_at: '2024-01-02T10:00:00Z' },
    ],
    appointments: [
      { status: 'pending_payment', created_at: '2026-05-04T10:00:00Z' },
      { status: 'confirmed', created_at: '2026-06-04T10:00:00Z' },
      { status: 'completed', created_at: '2026-06-05T10:00:00Z' },
      { status: 'cancelled', created_at: '2024-01-01T10:00:00Z' },
    ],
    payments: [
      { status: 'verified', created_at: '2026-05-10T10:00:00Z', consultation_fee: 100 },
      { status: 'verified', created_at: '2026-06-10T10:00:00Z', consultation_fee: '150.50' },
      { status: 'verified', created_at: '2026-06-11T10:00:00Z', consultation_fee: null },
      { status: 'pending_verification', created_at: '2026-06-12T10:00:00Z', consultation_fee: 250 },
      { status: 'rejected', created_at: '2026-06-13T10:00:00Z', consultation_fee: 300 },
      { status: 'verified', created_at: '2024-01-13T10:00:00Z', consultation_fee: 50 },
    ],
  });

  assert.equal(result.monthly_user_growth.length, 12);
  assert.deepEqual(result.monthly_user_growth.at(-2), { month: '2026-05', label: 'May', users: 1 });
  assert.deepEqual(result.monthly_user_growth.at(-1), { month: '2026-06', label: 'Jun', users: 2 });
  assert.deepEqual(result.monthly_appointments.at(-2), { month: '2026-05', label: 'May', appointments: 1 });
  assert.deepEqual(result.monthly_appointments.at(-1), { month: '2026-06', label: 'Jun', appointments: 2 });
  assert.deepEqual(result.monthly_revenue.at(-2), { month: '2026-05', label: 'May', revenue: 100 });
  assert.deepEqual(result.monthly_revenue.at(-1), { month: '2026-06', label: 'Jun', revenue: 150.5 });

  assert.deepEqual(result.user_distribution, {
    patient: 2,
    doctor: 1,
    assistant: 1,
    admin: 1,
    super_admin: 1,
  });
  assert.deepEqual(result.appointment_summary, {
    total: 4,
    pending: 1,
    confirmed: 1,
    completed: 1,
    cancelled: 1,
  });
  assert.deepEqual(result.payment_analytics, {
    total: 6,
    verified: 4,
    pending: 1,
    rejected: 1,
    total_revenue: 300.5,
    current_month_revenue: 150.5,
    previous_month_revenue: 100,
    monthly_change_percent: 50.5,
  });
});

test('returns a zero revenue comparison when no previous-month revenue exists', () => {
  const result = buildAnalytics({
    now,
    users: [],
    appointments: [],
    payments: [
      { status: 'verified', created_at: '2026-06-10T10:00:00Z', consultation_fee: 75 },
    ],
  });

  assert.equal(result.payment_analytics.previous_month_revenue, 0);
  assert.equal(result.payment_analytics.monthly_change_percent, 0);
});

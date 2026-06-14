const test = require('node:test');
const assert = require('node:assert/strict');

process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'https://example.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'test-service-role-key';

const { getReportData } = require('./adminController');

const result = (data, count = null) => ({ data, count, error: null });

const createQuery = (response) => {
  const query = {
    select: () => query,
    eq: () => query,
    gte: () => query,
    then: (resolve, reject) => Promise.resolve(response).then(resolve, reject),
  };
  return query;
};

test('keeps legacy report fields and appends real analytics data', async () => {
  const rpcResponses = [
    result([
      { role: 'patient', count: 2 },
      { role: 'doctor', count: 1 },
    ]),
    result([
      { status: 'pending_payment', count: 1 },
      { status: 'confirmed', count: 1 },
    ]),
    result([
      { status: 'verified', count: 1 },
      { status: 'pending_verification', count: 1 },
    ]),
  ];
  const tableResponses = {
    doctors: [result(null, 1)],
    patients: [result(null, 2)],
    clinics: [result(null, 3)],
    users: [result([
      { role: 'patient', created_at: '2026-06-01T10:00:00Z' },
      { role: 'doctor', created_at: '2026-06-02T10:00:00Z' },
    ])],
    appointments: [result([
      { status: 'pending_payment', created_at: '2026-05-01T10:00:00Z' },
      { status: 'confirmed', created_at: '2026-06-01T10:00:00Z' },
    ])],
    payments: [result([
      {
        status: 'verified',
        created_at: '2026-06-03T10:00:00Z',
        appointments: { doctors: { consultation_fee: 125 } },
      },
      {
        status: 'pending_verification',
        created_at: '2026-06-04T10:00:00Z',
        appointments: { doctors: { consultation_fee: 250 } },
      },
    ])],
  };

  const client = {
    rpc: () => createQuery(rpcResponses.shift()),
    from: (table) => createQuery(tableResponses[table].shift()),
  };

  const data = await getReportData(client, new Date('2026-06-14T12:00:00Z'));

  assert.equal(data.total_doctors, 1);
  assert.equal(data.total_patients, 2);
  assert.equal(data.total_clinics, 3);
  assert.deepEqual(data.users_by_role, [
    { role: 'patient', count: 2 },
    { role: 'doctor', count: 1 },
  ]);
  assert.deepEqual(data.appointments_by_status, [
    { status: 'pending_payment', count: 1 },
    { status: 'confirmed', count: 1 },
  ]);
  assert.deepEqual(data.payments_by_status, [
    { status: 'verified', count: 1 },
    { status: 'pending_verification', count: 1 },
  ]);
  assert.equal(data.monthly_user_growth.at(-1).users, 2);
  assert.equal(data.monthly_appointments.at(-1).appointments, 1);
  assert.equal(data.monthly_revenue.at(-1).revenue, 125);
  assert.equal(data.user_distribution.patient, 2);
  assert.equal(data.appointment_summary.total, 2);
  assert.equal(data.payment_analytics.total, 2);
  assert.equal(data.payment_analytics.total_revenue, 125);
});

test('keeps aggregate dashboard stats when an optional analytics query fails', async () => {
  const failed = { data: null, count: null, error: new Error('monthly payments query failed') };
  const rpcResponses = [
    result([{ role: 'patient', count: 2 }, { role: 'doctor', count: 1 }]),
    result([{ status: 'confirmed', count: 3 }]),
    result([{ status: 'verified', count: 2 }]),
  ];
  const tableResponses = {
    doctors: [result(null, 1)],
    patients: [result(null, 2)],
    clinics: [result(null, 4)],
    users: [result([{ role: 'patient', created_at: '2026-06-01T10:00:00Z' }])],
    appointments: [result([{ status: 'confirmed', created_at: '2026-06-02T10:00:00Z' }])],
    payments: [failed],
  };
  const client = {
    rpc: () => createQuery(rpcResponses.shift()),
    from: (table) => createQuery(tableResponses[table].shift()),
  };

  const data = await getReportData(client, new Date('2026-06-14T12:00:00Z'));

  assert.equal(data.total_doctors, 1);
  assert.equal(data.total_patients, 2);
  assert.equal(data.total_clinics, 4);
  assert.deepEqual(data.users_by_role, [
    { role: 'patient', count: 2 },
    { role: 'doctor', count: 1 },
  ]);
  assert.equal(data.appointment_summary.total, 3);
  assert.equal(data.payment_analytics.total, 2);
  assert.equal(data.payment_analytics.total_revenue, 0);
});

test('uses raw analytics summaries when aggregate RPC queries fail', async () => {
  const failedRpc = { data: null, count: null, error: new Error('aggregate RPC unavailable') };
  const tableResponses = {
    doctors: [result(null, 1)],
    patients: [result(null, 2)],
    clinics: [result(null, 1)],
    users: [result([
      { role: 'patient', created_at: '2026-06-01T10:00:00Z' },
      { role: 'patient', created_at: '2026-06-02T10:00:00Z' },
      { role: 'doctor', created_at: '2026-06-03T10:00:00Z' },
    ])],
    appointments: [result([
      { status: 'confirmed', created_at: '2026-06-04T10:00:00Z' },
      { status: 'completed', created_at: '2026-06-05T10:00:00Z' },
    ])],
    payments: [result([
      {
        status: 'verified',
        created_at: '2026-06-06T10:00:00Z',
        appointments: { doctors: { consultation_fee: 500 } },
      },
    ])],
  };
  const client = {
    rpc: () => createQuery(failedRpc),
    from: (table) => createQuery(tableResponses[table].shift()),
  };

  const data = await getReportData(client, new Date('2026-06-14T12:00:00Z'));

  assert.deepEqual(data.user_distribution, {
    patient: 2,
    doctor: 1,
    assistant: 0,
    admin: 0,
    super_admin: 0,
  });
  assert.deepEqual(data.appointment_summary, {
    total: 2,
    pending: 0,
    confirmed: 1,
    completed: 1,
    cancelled: 0,
  });
  assert.equal(data.payment_analytics.total, 1);
  assert.equal(data.payment_analytics.verified, 1);
  assert.equal(data.payment_analytics.total_revenue, 500);
});

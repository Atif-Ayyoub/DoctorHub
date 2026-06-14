const ROLE_KEYS = ['patient', 'doctor', 'assistant', 'admin', 'super_admin'];

const toMonthKey = (value) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
};

const createMonthRange = (now = new Date()) => {
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  return Array.from({ length: 12 }, (_, index) => {
    const date = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth() - 11 + index, 1));
    return {
      month: toMonthKey(date),
      label: date.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' }),
    };
  });
};

const countBy = (rows, key, initial) => rows.reduce((counts, row) => {
  if (Object.hasOwn(counts, row[key])) counts[row[key]] += 1;
  return counts;
}, { ...initial });

const buildMonthlySeries = (months, rows, valueKey, getValue = () => 1, predicate = () => true) => {
  const totals = new Map(months.map(({ month }) => [month, 0]));
  rows.forEach((row) => {
    if (!predicate(row)) return;
    const month = toMonthKey(row.created_at);
    if (!totals.has(month)) return;
    const value = Number(getValue(row));
    totals.set(month, totals.get(month) + (Number.isFinite(value) ? value : 0));
  });

  return months.map(({ month, label }) => ({
    month,
    label,
    [valueKey]: Number(totals.get(month).toFixed(2)),
  }));
};

const buildAnalytics = ({ users = [], appointments = [], payments = [], now = new Date() }) => {
  const months = createMonthRange(now);
  const monthlyUserGrowth = buildMonthlySeries(months, users, 'users');
  const monthlyAppointments = buildMonthlySeries(months, appointments, 'appointments');
  const monthlyRevenue = buildMonthlySeries(
    months,
    payments,
    'revenue',
    (payment) => payment.consultation_fee,
    (payment) => payment.status === 'verified',
  );

  const userDistribution = countBy(
    users,
    'role',
    Object.fromEntries(ROLE_KEYS.map((role) => [role, 0])),
  );
  const appointmentCounts = countBy(appointments, 'status', {
    pending_payment: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
  });
  const paymentCounts = countBy(payments, 'status', {
    verified: 0,
    pending_verification: 0,
    rejected: 0,
  });

  const currentMonthRevenue = monthlyRevenue.at(-1)?.revenue || 0;
  const previousMonthRevenue = monthlyRevenue.at(-2)?.revenue || 0;
  const totalRevenue = Number(payments.reduce((sum, payment) => {
    if (payment.status !== 'verified') return sum;
    const fee = Number(payment.consultation_fee);
    return sum + (Number.isFinite(fee) ? fee : 0);
  }, 0).toFixed(2));
  const monthlyChangePercent = previousMonthRevenue > 0
    ? Number((((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100).toFixed(1))
    : 0;

  return {
    monthly_user_growth: monthlyUserGrowth,
    monthly_revenue: monthlyRevenue,
    monthly_appointments: monthlyAppointments,
    user_distribution: userDistribution,
    appointment_summary: {
      total: appointments.length,
      pending: appointmentCounts.pending_payment,
      confirmed: appointmentCounts.confirmed,
      completed: appointmentCounts.completed,
      cancelled: appointmentCounts.cancelled,
    },
    payment_analytics: {
      total: payments.length,
      verified: paymentCounts.verified,
      pending: paymentCounts.pending_verification,
      rejected: paymentCounts.rejected,
      total_revenue: totalRevenue,
      current_month_revenue: currentMonthRevenue,
      previous_month_revenue: previousMonthRevenue,
      monthly_change_percent: monthlyChangePercent,
    },
  };
};

module.exports = {
  buildAnalytics,
  createMonthRange,
};

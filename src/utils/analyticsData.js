import API from '../api/axios';
import { analyticsFallbackData } from '../data/analyticsFallbackData';

const numberValue = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const rowsToCounts = (rows = [], key, aliases = {}) => rows.reduce((counts, row) => {
  const outputKey = aliases[row[key]] || row[key];
  if (outputKey) counts[outputKey] = numberValue(counts[outputKey]) + numberValue(row.count);
  return counts;
}, {});

const normalizeSeries = (rows, valueKey) => (Array.isArray(rows) ? rows : []).map((row) => ({
  month: row.month || '',
  label: row.label || row.month || '',
  [valueKey]: numberValue(row[valueKey]),
}));

export const normalizeAnalyticsData = (source = {}) => {
  const legacyUsers = rowsToCounts(source.users_by_role, 'role');
  const legacyAppointments = rowsToCounts(source.appointments_by_status, 'status', { pending_payment: 'pending' });
  const legacyPayments = rowsToCounts(source.payments_by_status, 'status', { pending_verification: 'pending' });

  const userDistribution = source.user_distribution || legacyUsers;
  const appointmentSummary = source.appointment_summary || {
    ...legacyAppointments,
    total: Object.values(legacyAppointments).reduce((sum, value) => sum + numberValue(value), 0),
  };
  const paymentAnalytics = source.payment_analytics || {
    ...legacyPayments,
    total: Object.values(legacyPayments).reduce((sum, value) => sum + numberValue(value), 0),
  };

  return {
    ...source,
    monthly_user_growth: normalizeSeries(source.monthly_user_growth, 'users'),
    monthly_revenue: normalizeSeries(source.monthly_revenue, 'revenue'),
    monthly_appointments: normalizeSeries(source.monthly_appointments, 'appointments'),
    user_distribution: {
      patient: numberValue(userDistribution.patient),
      doctor: numberValue(userDistribution.doctor),
      assistant: numberValue(userDistribution.assistant),
      admin: numberValue(userDistribution.admin),
      super_admin: numberValue(userDistribution.super_admin),
    },
    appointment_summary: {
      total: numberValue(appointmentSummary.total),
      pending: numberValue(appointmentSummary.pending),
      confirmed: numberValue(appointmentSummary.confirmed),
      completed: numberValue(appointmentSummary.completed),
      cancelled: numberValue(appointmentSummary.cancelled),
    },
    payment_analytics: {
      total: numberValue(paymentAnalytics.total),
      verified: numberValue(paymentAnalytics.verified),
      pending: numberValue(paymentAnalytics.pending),
      rejected: numberValue(paymentAnalytics.rejected),
      total_revenue: numberValue(paymentAnalytics.total_revenue),
      current_month_revenue: numberValue(paymentAnalytics.current_month_revenue),
      previous_month_revenue: numberValue(paymentAnalytics.previous_month_revenue),
      monthly_change_percent: numberValue(paymentAnalytics.monthly_change_percent),
    },
    total_doctors: numberValue(source.total_doctors),
    total_patients: numberValue(source.total_patients),
    total_clinics: numberValue(source.total_clinics),
  };
};

export const loadAnalyticsData = async (request = () => API.get('/admin/reports')) => {
  try {
    const response = await request();
    return { data: normalizeAnalyticsData(response.data?.data || {}), isFallback: false };
  } catch {
    return { data: analyticsFallbackData, isFallback: true };
  }
};

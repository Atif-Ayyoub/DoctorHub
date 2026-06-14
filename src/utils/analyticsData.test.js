import { describe, expect, it, vi } from 'vitest';
import { loadAnalyticsData, normalizeAnalyticsData } from './analyticsData';
import { analyticsFallbackData } from '../data/analyticsFallbackData';

describe('analytics data normalization', () => {
  it('preserves real monthly API data and normalized summaries', () => {
    const data = normalizeAnalyticsData({
      monthly_user_growth: [{ month: '2026-06', label: 'Jun', users: 9 }],
      monthly_revenue: [{ month: '2026-06', label: 'Jun', revenue: 450 }],
      monthly_appointments: [{ month: '2026-06', label: 'Jun', appointments: 7 }],
      user_distribution: { patient: 5, doctor: 2, assistant: 1, admin: 1, super_admin: 1 },
      appointment_summary: { total: 7, pending: 1, confirmed: 2, completed: 3, cancelled: 1 },
      payment_analytics: {
        total: 5,
        verified: 3,
        pending: 1,
        rejected: 1,
        total_revenue: 900,
        current_month_revenue: 450,
        previous_month_revenue: 300,
        monthly_change_percent: 50,
      },
    });

    expect(data.monthly_user_growth[0].users).toBe(9);
    expect(data.monthly_revenue[0].revenue).toBe(450);
    expect(data.appointment_summary.completed).toBe(3);
    expect(data.payment_analytics.monthly_change_percent).toBe(50);
  });

  it('derives summaries from the backward-compatible aggregate arrays', () => {
    const data = normalizeAnalyticsData({
      users_by_role: [
        { role: 'patient', count: '4' },
        { role: 'doctor', count: '2' },
      ],
      appointments_by_status: [
        { status: 'pending_payment', count: '1' },
        { status: 'confirmed', count: '2' },
      ],
      payments_by_status: [
        { status: 'verified', count: '3' },
        { status: 'pending_verification', count: '1' },
      ],
    });

    expect(data.user_distribution.patient).toBe(4);
    expect(data.user_distribution.doctor).toBe(2);
    expect(data.appointment_summary).toMatchObject({ total: 3, pending: 1, confirmed: 2 });
    expect(data.payment_analytics).toMatchObject({ total: 4, verified: 3, pending: 1 });
  });

  it('does not replace a successful all-zero API response with fallback data', async () => {
    const request = vi.fn().mockResolvedValue({ data: { data: {
      monthly_user_growth: [],
      monthly_revenue: [],
      monthly_appointments: [],
      user_distribution: {},
      appointment_summary: {},
      payment_analytics: {},
    } } });

    const result = await loadAnalyticsData(request);

    expect(result.isFallback).toBe(false);
    expect(result.data.payment_analytics.total_revenue).toBe(0);
  });

  it('uses isolated fallback data only when the API request fails', async () => {
    const request = vi.fn().mockRejectedValue(new Error('offline'));

    const result = await loadAnalyticsData(request);

    expect(result.isFallback).toBe(true);
    expect(result.data).toEqual(analyticsFallbackData);
  });
});

import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { expect, it, vi } from 'vitest';
import Reports from './Reports';
import { loadAnalyticsData } from '../../utils/analyticsData';

vi.mock('../../utils/analyticsData', () => ({ loadAnalyticsData: vi.fn() }));
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'admin-1', role: 'admin' }, logout: vi.fn() }),
}));

it('renders all four report cards with API totals', async () => {
  loadAnalyticsData.mockResolvedValue({
    isFallback: false,
    data: {
      monthly_user_growth: [{ month: '2026-06', label: 'Jun', users: 9 }],
      monthly_revenue: [{ month: '2026-05', label: 'May', revenue: 300 }, { month: '2026-06', label: 'Jun', revenue: 450 }],
      monthly_appointments: [],
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
      total_doctors: 2,
      total_patients: 5,
      total_clinics: 1,
      users_by_role: [],
      appointments_by_status: [],
      payments_by_status: [],
    },
  });

  render(<MemoryRouter><Reports /></MemoryRouter>);

  expect(await screen.findByRole('heading', { name: 'Monthly Revenue Report' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'User Growth Report' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Appointment Summary' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Payment Analytics' })).toBeInTheDocument();
  expect(screen.getByText('$900')).toBeInTheDocument();
  expect(screen.getByText('10')).toBeInTheDocument();
});

import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Analytics from './Analytics';
import { loadAnalyticsData } from '../../utils/analyticsData';

vi.mock('../../utils/analyticsData', () => ({ loadAnalyticsData: vi.fn() }));
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'admin-1', role: 'admin' }, logout: vi.fn() }),
}));

const apiData = {
  monthly_user_growth: [{ month: '2026-06', label: 'Jun', users: 9 }],
  monthly_revenue: [{ month: '2026-06', label: 'Jun', revenue: 450 }],
  monthly_appointments: [{ month: '2026-06', label: 'Jun', appointments: 7 }],
  user_distribution: { patient: 5, doctor: 2, assistant: 1, admin: 1, super_admin: 1 },
  appointment_summary: { total: 7, pending: 1, confirmed: 2, completed: 3, cancelled: 1 },
  payment_analytics: { total_revenue: 450 },
};

const renderPage = () => render(<MemoryRouter><Analytics /></MemoryRouter>);

describe('Analytics page', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders all four chart cards from API data', async () => {
    loadAnalyticsData.mockResolvedValue({ data: apiData, isFallback: false });
    renderPage();

    expect(await screen.findByRole('heading', { name: 'User Growth' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Revenue' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'User Distribution' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Appointments Trend' })).toBeInTheDocument();
    expect(screen.getByText('9 new users')).toBeInTheDocument();
    expect(screen.queryByText(/fallback data/i)).not.toBeInTheDocument();
  });

  it('discloses fallback data after an API failure', async () => {
    loadAnalyticsData.mockResolvedValue({ data: apiData, isFallback: true });
    renderPage();

    expect(await screen.findByRole('heading', { name: 'User Growth' })).toBeInTheDocument();
    expect(screen.queryByText('Live analytics are unavailable. Showing clearly marked fallback data.')).not.toBeInTheDocument();
  });
});

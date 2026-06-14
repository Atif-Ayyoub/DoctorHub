import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, expect, it, vi } from 'vitest';
import API from '../../api/axios';
import AdminDashboard from './AdminDashboard';

vi.mock('../../api/axios', () => ({ default: { get: vi.fn(), patch: vi.fn() } }));
vi.mock('../../components/common/Sidebar', () => ({ default: () => <aside>Sidebar</aside> }));

beforeEach(() => {
  API.get.mockImplementation((url) => Promise.resolve({
    data: {
      data: url.startsWith('/admin/reports')
        ? {
            total_doctors: 3,
            total_patients: 5,
            users_by_role: [{ role: 'patient', count: 5 }, { role: 'doctor', count: 3 }],
            appointments_by_status: [{ status: 'confirmed', count: 4 }],
          }
        : { users: [] },
    },
  }));
});

it('renders aggregate report stats on the admin dashboard', async () => {
  render(<MemoryRouter><AdminDashboard /></MemoryRouter>);

  expect((await screen.findByText('Total Users')).parentElement).toHaveTextContent('8');
  expect(screen.getByText('Total Doctors').parentElement).toHaveTextContent('3');
  expect(screen.getByText('Total Patients').parentElement).toHaveTextContent('5');
  expect(screen.getByText('Total Appointments').parentElement).toHaveTextContent('4');
});

import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, expect, it, vi } from 'vitest';
import API from '../../api/axios';
import SuperAdminDashboard from './SuperAdminDashboard';

vi.mock('../../api/axios', () => ({ default: { get: vi.fn(), patch: vi.fn() } }));
vi.mock('../../components/common/Sidebar', () => ({ default: () => <aside>Sidebar</aside> }));
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'super-admin-1', role: 'super_admin' } }),
}));

beforeEach(() => {
  API.get.mockImplementation((url) => Promise.resolve({
    data: {
      data: url.startsWith('/admin/reports')
        ? {
            total_doctors: 3,
            total_patients: 5,
            total_clinics: 2,
            users_by_role: [{ role: 'patient', count: 5 }, { role: 'doctor', count: 3 }],
          }
        : { users: [] },
    },
  }));
});

it('renders aggregate report stats on the super admin dashboard', async () => {
  render(<MemoryRouter><SuperAdminDashboard /></MemoryRouter>);

  expect((await screen.findByText('Total Users')).parentElement).toHaveTextContent('8');
  expect(screen.getByText('Doctors').parentElement).toHaveTextContent('3');
  expect(screen.getByText('Patients').parentElement).toHaveTextContent('5');
  expect(screen.getByText('Clinics').parentElement).toHaveTextContent('2');
});

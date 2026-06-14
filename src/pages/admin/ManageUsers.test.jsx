import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ManageUsers from './ManageUsers';
import API from '../../api/axios';

vi.mock('../../api/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'admin-1', role: 'admin' },
    logout: vi.fn(),
  }),
}));

describe('ManageUsers', () => {
  beforeEach(() => vi.clearAllMocks());

  it('removes the loading spinner and renders users after the request succeeds', async () => {
    API.get.mockResolvedValue({
      data: {
        data: {
          total: 1,
          users: [{
            id: 'patient-1',
            full_name: 'Sara Patient',
            email: 'sara@example.com',
            phone: '+12125550123',
            role: 'patient',
            status: 'active',
            created_at: '2026-06-14T09:30:00.000Z',
          }],
        },
      },
    });

    const { container } = render(<MemoryRouter><ManageUsers /></MemoryRouter>);

    expect(await screen.findByText('Sara Patient')).toBeInTheDocument();
    expect(screen.getByText('1 total users')).toBeInTheDocument();
    expect(container.querySelector('.spinner')).not.toBeInTheDocument();
  });

  it('removes the loading spinner when the request fails', async () => {
    API.get.mockRejectedValue(new Error('network error'));

    const { container } = render(<MemoryRouter><ManageUsers /></MemoryRouter>);

    expect(await screen.findByRole('table')).toBeInTheDocument();
    expect(container.querySelector('.spinner')).not.toBeInTheDocument();
  });
});

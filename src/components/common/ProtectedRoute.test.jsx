import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ProtectedRoute from './ProtectedRoute';

let currentUser;

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ user: currentUser, loading: false }),
}));

afterEach(cleanup);

const renderProtected = (role) => {
  currentUser = role ? { id: 'user-1', role } : null;
  return render(
    <MemoryRouter initialEntries={['/analytics']}>
      <Routes>
        <Route path="/" element={<div>Home</div>} />
        <Route path="/login" element={<div>Login</div>} />
        <Route
          path="/analytics"
          element={<ProtectedRoute roles={['admin', 'super_admin']}><div>Analytics</div></ProtectedRoute>}
        />
      </Routes>
    </MemoryRouter>,
  );
};

describe('ProtectedRoute analytics access', () => {
  it.each(['admin', 'super_admin'])('allows %s', (role) => {
    renderProtected(role);
    expect(screen.getByText('Analytics')).toBeInTheDocument();
  });

  it.each(['patient', 'doctor', 'assistant'])('redirects %s', (role) => {
    renderProtected(role);
    expect(screen.getByText('Home')).toBeInTheDocument();
  });

  it('redirects unauthenticated users to login', () => {
    renderProtected(null);
    expect(screen.getByText('Login')).toBeInTheDocument();
  });
});

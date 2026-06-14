import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Prescriptions from './Prescriptions';
import { downloadPrescriptionPdf } from '../../utils/prescriptionPdf';

const apiGetMock = vi.fn();

vi.mock('../../api/axios', () => ({
  default: {
    get: (...args) => apiGetMock(...args),
  },
}));

vi.mock('../../components/common/Sidebar', () => ({
  default: () => <aside>Sidebar</aside>,
}));

vi.mock('../../utils/prescriptionPdf', () => ({
  downloadPrescriptionPdf: vi.fn(),
}));

describe('Patient Prescriptions page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.print = vi.fn();
  });

  it('shows prescription download and print actions and triggers their handlers', async () => {
    const prescription = {
      id: 'rx-1',
      doctor_name: 'Dr. Ahmed Khan',
      created_at: '2026-06-14T09:30:00.000Z',
      diagnosis_notes: 'Flu',
      medications: 'Paracetamol 500mg twice daily for 3 days',
      dosage_instructions: 'Take after meals.',
    };

    apiGetMock.mockResolvedValueOnce({
      data: {
        data: [prescription],
      },
    });

    render(<Prescriptions />);

    expect(await screen.findByText('Prescription')).toBeInTheDocument();
    expect(screen.getByText('Dr. Dr. Ahmed Khan')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /download pdf/i }));
    await waitFor(() => {
      expect(downloadPrescriptionPdf).toHaveBeenCalledWith(prescription);
    });

    fireEvent.click(screen.getByRole('button', { name: /print/i }));
    expect(window.print).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(apiGetMock).toHaveBeenCalledWith('/prescriptions/my');
    });
  });
});

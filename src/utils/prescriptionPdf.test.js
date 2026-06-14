import { beforeEach, describe, expect, it, vi } from 'vitest';
import { downloadPrescriptionPdf } from './prescriptionPdf';

const mocks = vi.hoisted(() => ({
  save: vi.fn(),
  text: vi.fn(),
  setFont: vi.fn(),
  setFontSize: vi.fn(),
  setTextColor: vi.fn(),
  line: vi.fn(),
  autoTable: vi.fn((doc) => {
    doc.lastAutoTable = { finalY: 160 };
  }),
}));

vi.mock('jspdf', () => ({
  default: vi.fn(function JsPDFMock() {
    return {
      save: mocks.save,
      text: mocks.text,
      setFont: mocks.setFont,
      setFontSize: mocks.setFontSize,
      setTextColor: mocks.setTextColor,
      line: mocks.line,
      internal: {
        pageSize: {
          getHeight: () => 297,
        },
      },
    };
  }),
}));

vi.mock('jspdf-autotable', () => ({
  default: mocks.autoTable,
}));

describe('downloadPrescriptionPdf', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('generates and saves a prescription PDF from valid prescription data', () => {
    const prescription = {
      id: 'rx-1',
      patient_name: 'Sara Patient',
      patient_email: 'sara@example.com',
      doctor_name: 'Dr. Ali Hamza',
      doctor_specialisation: 'Heart Specialist',
      created_at: '2026-06-14T09:30:00.000Z',
      diagnosis_notes: 'Seasonal fever',
      symptoms: 'Fever, body ache',
      medications: [
        { name: 'Paracetamol', dosage: '500mg', frequency: 'Twice daily', duration: '3 days' },
      ],
      additional_notes: 'Take after meals.',
    };

    expect(() => downloadPrescriptionPdf(prescription)).not.toThrow();

    expect(mocks.text).toHaveBeenCalledWith('Doctor Hub', 14, 18);
    expect(mocks.text).toHaveBeenCalledWith('Prescription', 14, 28);
    expect(mocks.autoTable).toHaveBeenCalledWith(expect.any(Object), expect.objectContaining({
      head: [['Medicine Name', 'Dosage', 'Frequency', 'Duration']],
      body: [['Paracetamol', '500mg', 'Twice daily', '3 days']],
    }));
    expect(mocks.save).toHaveBeenCalledWith(expect.stringMatching(/^prescription-dr-ali-hamza-2026-06-14\.pdf$/));
  });
});

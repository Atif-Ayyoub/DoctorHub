import { beforeEach, describe, expect, it, vi } from 'vitest';
import { downloadAnalyticsReportPdf } from './reportPdf';

const mocks = vi.hoisted(() => ({
  save: vi.fn(),
  text: vi.fn(),
  setFont: vi.fn(),
  setFontSize: vi.fn(),
  setTextColor: vi.fn(),
  line: vi.fn(),
  autoTable: vi.fn((doc) => {
    doc.lastAutoTable = { finalY: 180 };
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
      internal: { pageSize: { getHeight: () => 297 } },
    };
  }),
}));

vi.mock('jspdf-autotable', () => ({ default: mocks.autoTable }));

describe('downloadAnalyticsReportPdf', () => {
  beforeEach(() => vi.clearAllMocks());

  it('generates and saves a branded Doctor Hub analytics PDF', () => {
    downloadAnalyticsReportPdf({
      monthly_user_growth: [{ label: 'Jun', users: 9 }],
      monthly_revenue: [{ label: 'Jun', revenue: 450 }],
      monthly_appointments: [{ label: 'Jun', appointments: 7 }],
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
    }, new Date('2026-06-14T09:30:00.000Z'));

    expect(mocks.text).toHaveBeenCalledWith('Doctor Hub', 14, 18);
    expect(mocks.text).toHaveBeenCalledWith('Analytics and Reports', 14, 28);
    expect(mocks.autoTable).toHaveBeenCalledWith(expect.any(Object), expect.objectContaining({
      head: [['Metric', 'Value']],
      body: expect.arrayContaining([
        ['Total Revenue', '$900'],
        ['Total Users', '10'],
        ['Total Appointments', '7'],
      ]),
    }));
    expect(mocks.autoTable).toHaveBeenCalledWith(expect.any(Object), expect.objectContaining({
      head: [['Month', 'New Users', 'Revenue', 'Appointments']],
      body: [['Jun', '9', '$450', '7']],
    }));
    expect(mocks.save).toHaveBeenCalledWith('doctor-hub-analytics-report-2026-06-14.pdf');
  });
});

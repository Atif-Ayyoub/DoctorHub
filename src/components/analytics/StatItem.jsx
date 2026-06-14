export default function StatItem({ label, value, tone = 'neutral' }) {
  return (
    <div className={`report-stat report-stat-${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

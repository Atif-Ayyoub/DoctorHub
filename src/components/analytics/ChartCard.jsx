export default function ChartCard({ title, subtitle, children }) {
  return (
    <section className="analytics-card chart-card">
      <div className="analytics-card-header">
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
      </div>
      <div className="chart-card-body">{children}</div>
    </section>
  );
}

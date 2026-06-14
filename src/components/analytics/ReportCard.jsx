export default function ReportCard({ title, icon: Icon, value, caption, children, tone = 'blue' }) {
  return (
    <section className={`analytics-card report-summary-card report-summary-${tone}`}>
      <div className="report-summary-heading">
        <span className="report-summary-icon">{Icon && <Icon size={22} />}</span>
        <div>
          <h2>{title}</h2>
          {caption && <p>{caption}</p>}
        </div>
      </div>
      <strong className="report-summary-value">{value}</strong>
      <div className="report-stat-list">{children}</div>
    </section>
  );
}

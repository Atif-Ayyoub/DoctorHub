export default function StatCard({ title, value, icon: Icon, color = 'blue', sub }) {
  return (
    <div className={`stat-card stat-${color}`}>
      <div className="stat-icon">{Icon && <Icon size={28} />}</div>
      <div className="stat-info">
        <h3>{value ?? '—'}</h3>
        <p>{title}</p>
        {sub && <span className="stat-sub">{sub}</span>}
      </div>
    </div>
  );
}

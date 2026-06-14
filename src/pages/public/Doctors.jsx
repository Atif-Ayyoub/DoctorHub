import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import API from '../../api/axios';
import { Search, Star, Clock, DollarSign } from 'lucide-react';

export default function Doctors() {
  const [searchParams] = useSearchParams();
  const [doctors, setDoctors] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    treatment_type: searchParams.get('treatment_type') || '',
    disease: '',
    page: 1,
  });

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.treatment_type) params.append('treatment_type', filters.treatment_type);
      if (filters.disease) params.append('disease', filters.disease);
      params.append('page', filters.page);
      params.append('page_size', 12);
      const res = await API.get(`/doctors?${params}`);
      setDoctors(res.data.data.doctors || []);
      setTotal(res.data.data.total || 0);
    } catch {
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDoctors(); }, [filters]);

  const treatmentColors = { Allopathic: 'blue', Homeopathic: 'green', Herbal: 'orange' };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Find Your Doctor</h1>
        <p>Search from our network of verified doctors</p>
      </div>

      {/* Filters */}
      <div className="search-bar-row">
        <div className="search-input-wrap">
          <Search size={18} />
          <input type="text" placeholder="Search by disease or condition..."
            value={filters.disease}
            onChange={e => setFilters({ ...filters, disease: e.target.value, page: 1 })} />
        </div>
        <select value={filters.treatment_type}
          onChange={e => setFilters({ ...filters, treatment_type: e.target.value, page: 1 })}>
          <option value="">All Treatment Types</option>
          <option value="Allopathic">Allopathic</option>
          <option value="Homeopathic">Homeopathic</option>
          <option value="Herbal">Herbal</option>
        </select>
      </div>

      <p className="results-count">{total} doctor{total !== 1 ? 's' : ''} found</p>
      <h2 className="sr-only">Verified doctors matching your search</h2>

      {loading ? (
        <div className="loading-grid">
          {[...Array(6)].map((_, i) => <div key={i} className="doctor-card skeleton" />)}
        </div>
      ) : (
        <div className="doctors-grid">
          {doctors.length === 0 ? (
            <div className="empty-state">
              <span>🔍</span>
              <h3>No doctors found</h3>
              <p>Try adjusting your search filters</p>
            </div>
          ) : doctors.map(doc => (
            <div key={doc.id} className="doctor-card">
              <div className="doctor-card-header">
                <div className="doctor-avatar">{doc.full_name?.charAt(0)}</div>
                <div>
                  <h3>{doc.full_name}</h3>
                  <span className={`badge badge-${treatmentColors[doc.treatment_type] || 'gray'}`}>
                    {doc.treatment_type || 'General'}
                  </span>
                </div>
              </div>
              <div className="doctor-card-body">
                {doc.specialisation && (
                  <p className="doctor-spec"><Star size={14} /> {doc.specialisation}</p>
                )}
                {doc.experience_years > 0 && (
                  <p className="doctor-exp"><Clock size={14} /> {doc.experience_years} years experience</p>
                )}
                {doc.consultation_fee > 0 && (
                  <p className="doctor-fee"><DollarSign size={14} /> PKR {doc.consultation_fee} per consultation</p>
                )}
                {doc.bio && <p className="doctor-bio">{doc.bio.slice(0, 100)}{doc.bio.length > 100 ? '...' : ''}</p>}
              </div>
              <div className="doctor-card-footer">
                <Link to={`/doctors/${doc.id}`} className="btn-primary btn-sm">View profile</Link>
                <Link to={`/doctors/${doc.id}/book`} className="btn-outline btn-sm">Book appointment</Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {total > 12 && (
        <div className="pagination">
          <button disabled={filters.page === 1} onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}>
            ← Prev
          </button>
          <span>Page {filters.page}</span>
          <button disabled={filters.page * 12 >= total} onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}>
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

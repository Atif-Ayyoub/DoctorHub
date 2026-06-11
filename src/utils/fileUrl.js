const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || (import.meta.env.PROD ? '' : 'http://localhost:5000');

export function fileUrl(filePath) {
  if (!filePath) return '#';

  const normalized = filePath.replace(/\\/g, '/');
  if (/^https?:\/\//i.test(normalized)) return normalized;

  const uploadsIndex = normalized.toLowerCase().lastIndexOf('/uploads/');
  const publicPath = uploadsIndex >= 0 ? normalized.slice(uploadsIndex) : normalized;

  return `${API_ORIGIN}/${publicPath.replace(/^\/+/, '')}`;
}

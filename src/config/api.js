const RAW_API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  process.env.REACT_APP_API_BASE_URL ||
  'http://localhost:4000';

const API_BASE_URL = String(RAW_API_BASE_URL).replace(/\/+$/, '');

if (!API_BASE_URL) {
  // eslint-disable-next-line no-console
  console.error(
    'API base URL is not defined. Set REACT_APP_API_URL (or REACT_APP_API_BASE_URL).'
  );
}

export const apiUrl = path => {
  if (!path) return API_BASE_URL;

  // Allow passing absolute URLs (e.g., S3 presigned URLs)
  if (/^https?:\/\//i.test(path)) return path;

  const cleanPath = String(path).replace(/^\/+/, '');
  return `${API_BASE_URL}/${cleanPath}`;
};

export default API_BASE_URL;

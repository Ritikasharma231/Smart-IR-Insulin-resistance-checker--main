/**
 * HTTP client for SQLite data API (/api → port 3001).
 */

const TOKEN_KEY = 'authToken';

export const getAuthToken = () => localStorage.getItem(TOKEN_KEY);
export const setAuthToken = (token) => {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
};

async function parseResponse(res) {
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { error: text || res.statusText };
  }
  if (!res.ok) {
    const err = new Error(data?.error || res.statusText || 'Request failed');
    err.status = res.status;
    throw err;
  }
  return data;
}

export async function apiRequest(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...options.headers,
  };
  const token = getAuthToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(path.startsWith('/api') ? path : `/api${path}`, {
    ...options,
    headers,
    body: options.body != null ? JSON.stringify(options.body) : undefined,
  });
  return parseResponse(res);
}

export async function checkDataApiHealth() {
  try {
    const data = await apiRequest('/health');
    return data?.status === 'healthy';
  } catch {
    return false;
  }
}

const dataApi = {
  register: (body) => apiRequest('/auth/register', { method: 'POST', body }),
  login: (body) => apiRequest('/auth/login', { method: 'POST', body }),
  me: () => apiRequest('/auth/me'),
  getAssessments: (userId) =>
    apiRequest(userId ? `/assessments?userId=${userId}` : '/assessments'),
  saveAssessment: (assessment) => apiRequest('/assessments', { method: 'POST', body: assessment }),
  deleteAssessment: (id) => apiRequest(`/assessments/${id}`, { method: 'DELETE' }),
  getAdminPatients: () => apiRequest('/admin/patients'),
  getAdminStats: () => apiRequest('/admin/stats'),
  deletePatient: (userId) => apiRequest(`/admin/patients/${userId}`, { method: 'DELETE' }),
  exportAll: () => apiRequest('/admin/export'),
};

export default dataApi;

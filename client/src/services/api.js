const API_BASE = '/api';

// Returns active portal scope for this browser tab ('student' | 'faculty' | 'admin')
export const getActivePortal = () => {
  try {
    const params = new URLSearchParams(window.location.search);
    const portalParam = params.get('portal');
    if (portalParam && ['student', 'faculty', 'admin'].includes(portalParam)) {
      return portalParam;
    }
    const sessionPortal = sessionStorage.getItem('rbac_portal');
    if (sessionPortal && ['student', 'faculty', 'admin'].includes(sessionPortal)) {
      return sessionPortal;
    }
  } catch (e) {}
  return null;
};

export const setActivePortal = (portal) => {
  try {
    if (portal && ['student', 'faculty', 'admin'].includes(portal)) {
      sessionStorage.setItem('rbac_portal', portal);
      const url = new URL(window.location);
      if (url.searchParams.get('portal') !== portal) {
        url.searchParams.set('portal', portal);
        window.history.replaceState({}, '', url);
      }
    }
  } catch (e) {}
};

// Tab-isolated token retrieval:
// Priority 1: sessionStorage (unique to this tab, allowing simultaneous multi-role sessions)
// Priority 2: role-scoped token from localStorage matching this tab's portal
export const getToken = () => {
  try {
    const tabToken = sessionStorage.getItem('rbac_token');
    if (tabToken) return tabToken;

    const portal = getActivePortal();
    if (portal) {
      const roleToken = localStorage.getItem(`rbac_token_${portal}`);
      if (roleToken) {
        sessionStorage.setItem('rbac_token', roleToken);
        return roleToken;
      }
    }
  } catch (e) {}
  return null;
};

export const setToken = (token, role) => {
  try {
    if (!token) return;
    sessionStorage.setItem('rbac_token', token);
    const targetRole = role || getActivePortal();
    if (targetRole) {
      sessionStorage.setItem('rbac_portal', targetRole);
      localStorage.setItem(`rbac_token_${targetRole}`, token);
    }
  } catch (e) {}
};

export const removeToken = (role) => {
  try {
    sessionStorage.removeItem('rbac_token');
    const targetRole = role || getActivePortal();
    if (targetRole) {
      sessionStorage.removeItem('rbac_portal');
      localStorage.removeItem(`rbac_token_${targetRole}`);
    }
  } catch (e) {}
};

export async function apiRequest(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token && !options.skipAuth) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await res.json().catch(() => ({ message: 'Non-JSON response' }));

    if (res.status === 401 && data.code === 'TOKEN_EXPIRED') {
      window.dispatchEvent(new CustomEvent('rbac:session_expired', { detail: data }));
    }

    return {
      ok: res.ok,
      status: res.status,
      data
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      data: { success: false, message: error.message || 'Network communication error' }
    };
  }
}

// Authentication Service
export const authService = {
  login: (email, password) => apiRequest('/auth/login', { method: 'POST', body: { email, password }, skipAuth: true }),
  getMe: () => apiRequest('/auth/me'),
  logout: () => apiRequest('/auth/logout', { method: 'POST' }),
  getExpiredTestToken: (email) => apiRequest(`/auth/expired-test-token?email=${encodeURIComponent(email || '')}`)
};

// Student Service
export const studentService = {
  getProfile: (studentId) => apiRequest(`/students/${studentId}/profile`),
  getMarks: (studentId) => apiRequest(`/students/${studentId}/marks`),
  getAttendance: (studentId) => apiRequest(`/students/${studentId}/attendance`),
  getSummary: (studentId) => apiRequest(`/students/${studentId}/summary`)
};

// Faculty Service
export const facultyService = {
  getStudents: () => apiRequest('/faculty/students'),
  getAcademicDetails: (regNo) => apiRequest(`/faculty/students/${regNo}/academic`),
  updateMarks: (markId, internalMark, semesterMark) => 
    apiRequest(`/faculty/marks/${markId}`, { method: 'PUT', body: { internalMark, semesterMark } }),
  updateAttendance: (attendanceId, totalHours, attendedHours) => 
    apiRequest(`/faculty/attendance/${attendanceId}`, { method: 'PUT', body: { totalHours, attendedHours } })
};

// Admin Service
export const adminService = {
  getUsers: () => apiRequest('/admin/users'),
  createUser: (userData) => apiRequest('/admin/users', { method: 'POST', body: userData }),
  toggleUserStatus: (userId) => apiRequest(`/admin/users/${userId}/status`, { method: 'PATCH' }),
  updateUserRole: (userId, newRole) => apiRequest(`/admin/users/${userId}/role`, { method: 'PATCH', body: { newRole } }),
  getStats: () => apiRequest('/admin/stats')
};

// Audit & Diagnostics Service
export const auditService = {
  getLogs: (params) => {
    let query = '';
    if (typeof params === 'string') {
      query = params ? (params.startsWith('?') ? params : `?${params}`) : '';
    } else if (params && typeof params === 'object') {
      const q = new URLSearchParams(params).toString();
      query = q ? `?${q}` : '';
    }
    return apiRequest(`/audit/logs${query}`);
  },
  getSummary: () => apiRequest('/audit/summary'),
  clearLogs: (timeframe) => apiRequest('/audit/clear', { method: 'POST', body: { timeframe } }),
  getMatrix: () => apiRequest('/rbac/matrix', { skipAuth: true }),
  getHealth: () => apiRequest('/health', { skipAuth: true })
};

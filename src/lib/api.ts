import type { PortfolioItem, Message, SiteSettings, ContactFormData, LoginCredentials } from '@/types';

let API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Fool-proof the URL just in case the user forgot to add /api to the end in their dashboard
if (API_BASE_URL && !API_BASE_URL.endsWith('/api') && !API_BASE_URL.includes('/api/')) {
  API_BASE_URL = `${API_BASE_URL.replace(/\/$/, '')}/api`;
}

export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

export const getAssetUrl = (assetPath: string) => {
  if (!assetPath) return '';
  if (/^https?:\/\//.test(assetPath)) return assetPath;
  return `${API_ORIGIN}${assetPath.startsWith('/') ? assetPath : `/${assetPath}`}`;
};

// Helper function for API calls
async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // Ensure endpoint starts with a slash
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const isFormDataBody = options.body instanceof FormData;
  
  const config: RequestInit = {
    headers: isFormDataBody
      ? { ...options.headers }
      : {
          'Content-Type': 'application/json',
          ...options.headers,
        },
    ...options,
  };
  
  // Add auth token if available
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }
  
  const response = await fetch(url, config);
  
  if (!response.ok) {
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
    } catch (e) {
      if (response.status === 404) errorMessage = "API endpoint not found (404). Check backend URL.";
      else if (response.status >= 500) errorMessage = "Server error (5xx). Backend might be down.";
    }
    throw new Error(errorMessage);
  }
  
  return response.json();
}

// Portfolio API
export const portfolioAPI = {
  getAll: (category?: string) => {
    const query = category && category !== 'all' ? `?category=${category}` : '';
    return fetchAPI<PortfolioItem[]>(`/portfolio${query}`);
  },
  
  getById: (id: string) => fetchAPI<PortfolioItem>(`/portfolio/${id}`),
  
  create: (data: FormData) => fetchAPI<PortfolioItem>('/admin/portfolio', {
    method: 'POST',
    body: data,
  }),
  
  update: (id: string, data: FormData) => fetchAPI<PortfolioItem>(`/admin/portfolio/${id}`, {
    method: 'PUT',
    body: data,
  }),
  
  delete: (id: string) => fetchAPI<{ success: boolean }>(`/admin/portfolio/${id}`, {
    method: 'DELETE',
  }),
  
  deleteImage: (id: string, imagePath: string) => fetchAPI<PortfolioItem>(`/admin/portfolio/${id}/images`, {
    method: 'DELETE',
    body: JSON.stringify({ imagePath }),
  }),
};

// Messages API
export const messagesAPI = {
  getAll: () => fetchAPI<Message[]>('/admin/messages'),
  
  create: (data: ContactFormData) => fetchAPI<{ success: boolean; message: string }>('/contact', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  markAsRead: (id: string) => fetchAPI<Message>(`/admin/messages/${id}/read`, {
    method: 'PATCH',
  }),
  
  delete: (id: string) => fetchAPI<{ success: boolean }>(`/admin/messages/${id}`, {
    method: 'DELETE',
  }),
};

// Settings API
export const settingsAPI = {
  get: () => fetchAPI<SiteSettings>('/settings'),
  
  update: (data: Partial<SiteSettings> | FormData) => fetchAPI<SiteSettings>('/admin/settings', {
    method: 'PUT',
    body: data instanceof FormData ? data : JSON.stringify(data),
  }),
};

// Admin Auth API
export const authAPI = {
  login: (credentials: LoginCredentials) => fetchAPI<{ success: boolean; token: string; user: { username: string; role: string } }>('/admin/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),
  
  verify: () => fetchAPI<{ valid: boolean; user: { username: string; role: string } }>('/admin/verify'),
  
  changePassword: (currentPassword: string, newPassword: string) => fetchAPI<{ success: boolean }>('/admin/change-password', {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword }),
  }),
};

// Health check
export const healthAPI = {
  check: () => fetchAPI<{ status: string; timestamp: string }>('/health'),
};

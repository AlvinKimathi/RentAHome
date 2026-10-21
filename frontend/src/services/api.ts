// frontend/src/services/api.ts
import { House, Booking, User, AdminStats } from '../types';

const API_BASE = (import.meta.env.VITE_API_BASE as string) || '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('geta_auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data;
}

export const api = {
  auth: {
    async register(payload: { full_name: string; email: string; phone: string; password: string; role: string }) {
      return request<{ success: boolean; token: string; user: User; message: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    async login(payload: { email: string; password: string }) {
      return request<{ success: boolean; token: string; user: User; message: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    async me() {
      return request<{ success: boolean; user: User }>('/auth/me');
    },

    async forgotPassword(email: string) {
      return request<{ success: boolean; message: string; code?: string; email: string }>('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    },

    async resetPassword(payload: { email: string; code: string; new_password: string }) {
      return request<{ success: boolean; message: string }>('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    async googleLogin(payload: { email: string; full_name?: string; role?: string }) {
      return request<{ success: boolean; token: string; user: User; message: string }>('/auth/google', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
  },

  houses: {
    async getAll(params: {
      q?: string;
      location?: string;
      house_type?: string;
      min_rent?: number;
      max_rent?: number;
      status?: string;
      sort?: string;
    } = {}) {
      const query = new URLSearchParams();
      if (params.q) query.append('q', params.q);
      if (params.location) query.append('location', params.location);
      if (params.house_type && params.house_type !== 'All') query.append('house_type', params.house_type);
      if (params.min_rent) query.append('min_rent', params.min_rent.toString());
      if (params.max_rent) query.append('max_rent', params.max_rent.toString());
      if (params.status) query.append('status', params.status);
      if (params.sort) query.append('sort', params.sort);

      const qs = query.toString() ? `?${query.toString()}` : '';
      return request<{ success: boolean; count: number; data: House[] }>(`/houses${qs}`);
    },

    async getById(id: number) {
      return request<{ success: boolean; data: House }>(`/houses/${id}`);
    },

    async create(payload: Omit<Partial<House>, 'images'> & { images: string[] }) {
      return request<{ success: boolean; house_id: number; message: string }>('/houses', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    async update(id: number, payload: Omit<Partial<House>, 'images'> & { images?: string[] }) {
      return request<{ success: boolean; message: string }>(`/houses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    },

    async toggleStatus(id: number) {
      return request<{ success: boolean; message: string; status: 'Vacant' | 'Occupied' }>(`/houses/${id}/status`, {
        method: 'PATCH',
      });
    },

    async delete(id: number) {
      return request<{ success: boolean; message: string }>(`/houses/${id}`, {
        method: 'DELETE',
      });
    },

    async getMyListings() {
      return request<{ success: boolean; count: number; data: House[] }>('/houses/my/listings');
    },

    async uploadImage(file: File) {
      const formData = new FormData();
      formData.append('image', file);

      const token = localStorage.getItem('geta_auth_token');
      const res = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Image upload failed.');
      }
      return data as { success: boolean; url: string; path: string };
    },
  },

  bookings: {
    async create(payload: { house_id: number; booking_date: string; booking_time?: string; message?: string }) {
      return request<{ success: boolean; booking_id: number; message: string }>('/bookings', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    async getMyBookings() {
      return request<{ success: boolean; count: number; data: Booking[] }>('/bookings/my');
    },

    async getLandlordBookings() {
      return request<{ success: boolean; count: number; data: Booking[] }>('/bookings/landlord');
    },

    async updateStatus(bookingId: number, status: 'pending' | 'confirmed' | 'declined' | 'completed') {
      return request<{ success: boolean; message: string; status: string }>(`/bookings/${bookingId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    },
  },

  admin: {
    async getStats() {
      return request<{ success: boolean; data: AdminStats }>('/admin/stats');
    },

    async getListings() {
      return request<{ success: boolean; count: number; data: House[] }>('/admin/listings');
    },

    async moderateListing(id: number, approval_status: 'approved' | 'pending' | 'rejected') {
      return request<{ success: boolean; message: string }>(`/admin/listings/${id}/moderate`, {
        method: 'PATCH',
        body: JSON.stringify({ approval_status }),
      });
    },

    async getUsers() {
      return request<{ success: boolean; count: number; data: User[] }>('/admin/users');
    },

    async toggleUser(id: number) {
      return request<{ success: boolean; message: string; is_active: number }>(`/admin/users/${id}/toggle`, {
        method: 'PATCH',
      });
    },

    async getReports() {
      return request<{ success: boolean; data: { by_type: any[]; by_location: any[] } }>('/admin/reports');
    },
  },
};

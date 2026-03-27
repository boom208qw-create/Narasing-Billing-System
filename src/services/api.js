/**
 * API Service Layer – with JWT token injected into every request
 */
import axios from 'axios';

const API_BASE = import.meta.env.PROD 
    ? 'https://narasing-billing-backend.onrender.com/api' 
    : 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE,
    headers: { 'Content-Type': 'application/json' }
});

// Attach token automatically to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
});

// On 401 – clear auth and reload to show login screen
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('authUser');
            window.location.reload();
        }
        return Promise.reject(error);
    }
);

// Helper: unwrap axios response and throw readable error
async function request(method, url, data) {
    try {
        const res = await api({ method, url, data });
        return res.data;
    } catch (err) {
        throw new Error(err.response?.data?.error || 'เกิดข้อผิดพลาด');
    }
}

// ========== ROOM API ==========

export const roomAPI = {
    getAll: async () => {
        const data = await request('get', '/rooms');
        return data.sort((a, b) => a.roomNumber.localeCompare(b.roomNumber, undefined, { numeric: true, sensitivity: 'base' }));
    },

    getByNumber: (roomNumber) => request('get', `/rooms/${roomNumber}`),

    create: (roomData) => request('post', '/rooms', roomData),

    update: (roomNumber, updates) => request('put', `/rooms/${roomNumber}`, updates),

    delete: (roomNumber) => request('delete', `/rooms/${roomNumber}`),

    updateMeters: (roomNumber, waterMeter, electricMeter) =>
        request('put', `/rooms/${roomNumber}/meters`, { waterMeter, electricMeter })
};

// ========== BILL API ==========

export const billAPI = {
    getAll: (roomNumber) => {
        const query = roomNumber ? `?room=${roomNumber}` : '';
        return request('get', `/bills${query}`);
    },

    getById: (id) => request('get', `/bills/${id}`),

    create: (billData) => request('post', '/bills', billData),

    update: (id, updates) => request('put', `/bills/${id}`, updates),

    delete: (id) => request('delete', `/bills/${id}`),

    deleteMultiple: (ids) => request('delete', '/bills/bulk', { ids }),

    getDashboardStats: () => request('get', '/bills/stats/dashboard')
};

// ========== SETTINGS API ==========

export const settingsAPI = {
    get: () => request('get', '/settings'),

    update: (settings) => request('put', '/settings', settings),

    getRates: () => request('get', '/settings/rates'),

    updateRates: (rates) => request('put', '/settings/rates', rates),

    applyRatesToAllRooms: (rates) => request('put', '/settings/rates/apply-all', rates)
};

// ========== USER API (Admin Only) ==========

export const userAPI = {
    getAll: () => request('get', '/users'),
    
    create: (userData) => request('post', '/users', userData),
    
    updateRoleStatus: (id, updates) => request('put', `/users/${id}/role-status`, updates),
    
    changePassword: (id, newPassword) => request('put', `/users/${id}/password`, { newPassword }),
    
    delete: (id) => request('delete', `/users/${id}`)
};

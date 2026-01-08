import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const api = axios.create({ baseURL: 'http://localhost:5000/api' });

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            const decodedToken = jwtDecode(token);
            if (decodedToken.exp * 1000 < Date.now()) {
                // Token expired. Lakukan logout paksa.
                localStorage.removeItem('token');
                delete api.defaults.headers.common['Authorization'];

                // Redirect ke halaman login. 
                // Menggunakan window.location.href adalah cara paling pasti di luar komponen React.
                if (window.location.pathname !== '/login') {
                    alert('Sesi Anda telah berakhir. Silakan login kembali.');
                    window.location.href = '/login';
                }

                // Batalkan request yang sedang berjalan
                return Promise.reject(new Error('Sesi telah berakhir.'));
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const registerUser = (userData) => {
    return api.post('/auth/register', userData);
}

export const registerBarbershop = (formData) => {
    return api.post('/barbershops', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};

export const forgotPassword = (email) => {
    return api.post('/auth/forgot-password', { email });
};

export const resetPassword = (token, newPassword) => {
    return api.post('/auth/reset-password', { token, newPassword });
};

export default api;
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const SANCTUM_URL = API_BASE_URL.replace(/\/api$/, '');

// Création d'une instance axios avec des paramètres par défaut
const instance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json'
    }
});

// Intercepteur pour gérer les erreurs CSRF
instance.interceptors.request.use(config => {
    // Ne pas ajouter le header XSRF-TOKEN pour les requêtes vers Sanctum
    if (!config.url?.includes('sanctum/csrf-cookie')) {
        const token = document.cookie
            .split('; ')
            .find(row => row.startsWith('XSRF-TOKEN='))
            ?.split('=')[1];
        
        if (token) {
            config.headers['X-XSRF-TOKEN'] = decodeURIComponent(token);
        }
    }
    return config;
}, error => {
    return Promise.reject(error);
});

export default instance;

export const getCsrfToken = async (): Promise<void> => {
    await axios.get(`${SANCTUM_URL}/sanctum/csrf-cookie`, {
        withCredentials: true
    });
};

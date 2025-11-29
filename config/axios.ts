import axios from 'axios';

// Configuration de base d'axios
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Intercepteur pour ajouter le token d'authentification
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Gestion des erreurs globales
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Gestion des erreurs HTTP
      switch (error.response.status) {
        case 401:
          // Rediriger vers la page de connexion si non authentifié
          localStorage.removeItem('token');
          window.location.href = '/login';
          break;
        case 403:
          // Accès refusé
          console.error('Accès refusé :', error.response.data);
          break;
        case 404:
          // Ressource non trouvée
          console.error('Ressource non trouvée :', error.response.data);
          break;
        case 422:
          // Erreur de validation
          console.error('Erreur de validation :', error.response.data);
          break;
        case 500:
          // Erreur serveur
          console.error('Erreur serveur :', error.response.data);
          break;
        default:
          console.error('Erreur inattendue :', error.response.data);
      }
    } else if (error.request) {
      // La requête a été faite mais aucune réponse n'a été reçue
      console.error('Pas de réponse du serveur :', error.request);
    } else {
      // Une erreur s'est produite lors de la configuration de la requête
      console.error('Erreur de configuration de la requête :', error.message);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;

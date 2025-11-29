// Configuration de l'URL de base de l'API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Configuration des en-têtes par défaut
const defaultHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'X-Requested-With': 'XMLHttpRequest'
};

// Interface pour la réponse de connexion
export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    access_token: string;
    token_type: string;
  };
}

// Interface pour la réponse utilisateur
export interface UserResponse {
  user: User;
  access_token: string;
  token_type: string;
}

// Interface pour l'utilisateur
export interface User {
  id: string | number;
  username: string;
  fullName?: string;
  contact?: string;
  email?: string;
  role?: string;
  permissions?: string[];
}

// Fonction utilitaire pour récupérer un cookie
function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

// Fonction utilitaire pour effectuer des requêtes fetch avec gestion d'erreur
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 10000): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  // Ajouter le token d'authentification si disponible
  const token = localStorage.getItem('token');
  const authHeader = token ? { 'Authorization': `Bearer ${token}` } : {};

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      credentials: 'include',
      headers: {
        ...defaultHeaders,
        ...authHeader,
        ...(options.headers || {})
      }
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

// Fonction pour obtenir le token CSRF
async function getCsrfToken(): Promise<void> {
  try {
    // Construire l'URL CSRF en fonction de l'environnement
    const baseUrl = API_BASE_URL.replace('/api', '');
    const csrfUrl = `${baseUrl}/sanctum/csrf-cookie`;

    console.log('Tentative de récupération du token CSRF depuis:', csrfUrl);

    const response = await fetchWithTimeout(csrfUrl, {
      method: 'GET',
      credentials: 'include'
    }, 5000); // Timeout réduit à 5 secondes

    if (!response.ok) {
      console.warn(`Avertissement: Impossible de récupérer le token CSRF (${response.status})`);
      // Ne pas lancer d'erreur, continuer sans CSRF pour les APIs qui ne le supportent pas
      return;
    }

    // Vérifier que le cookie XSRF-TOKEN est bien défini
    const xsrfToken = getCookie('XSRF-TOKEN');
    if (!xsrfToken) {
      console.warn('Le token CSRF n\'a pas pu être récupéré via cookie');
      // Ne pas lancer d'erreur, continuer sans CSRF
      return;
    }

    console.log('Token CSRF récupéré avec succès');
  } catch (error: any) {
    console.warn('Erreur lors de la récupération du token CSRF:', error.message);

    // Ne pas bloquer la connexion si le CSRF n'est pas disponible
    // Certaines APIs n'utilisent pas Sanctum/CSRF
    if (error.name === 'AbortError') {
      console.warn('Timeout lors de la récupération du CSRF - l\'API ne supporte peut-être pas Sanctum');
    }

    if (!navigator.onLine) {
      throw new Error('Vous semblez être hors ligne. Veuillez vérifier votre connexion internet.');
    }

    // Ne pas lancer d'erreur fatale, juste un avertissement
    console.warn('Continuation sans token CSRF');
  }
}

// Fonction utilitaire pour gérer les erreurs de l'API
export function handleApiError(error: any, setError?: (message: string) => void): never {
  console.error('Erreur API:', error);

  let errorMessage = 'Une erreur inattendue est survenue. Veuillez réessayer.';

  if (error.response) {
    const { status, data } = error.response;

    if (status === 401 || status === 403) {
      errorMessage = 'Votre session a expiré. Veuillez vous reconnecter.';
    } else if (status === 422 && data.errors) {
      const firstError = Object.values(data.errors)[0];
      errorMessage = Array.isArray(firstError) && firstError.length > 0
        ? String(firstError[0])
        : 'Erreur de validation des données.';
    } else if (data.message) {
      errorMessage = data.message;
    }
  } else if (error.code === 'ECONNABORTED') {
    errorMessage = 'La requête a expiré. Vérifiez votre connexion internet.';
  } else if (error.message) {
    errorMessage = error.message;
  }

  if (setError) {
    setError(errorMessage);
  }

  throw new Error(errorMessage);
}

// Fonction pour vérifier si l'utilisateur est authentifié
function isAuthenticated(): boolean {
  const token = localStorage.getItem('token');
  return !!token;
}

// Fonction pour obtenir l'utilisateur actuel
function getCurrentUser(): User | null {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;

  try {
    return JSON.parse(userStr) as User;
  } catch (e) {
    console.error('Erreur lors de la lecture des données utilisateur:', e);
    return null;
  }
}

// Fonction pour obtenir l'en-tête d'authentification
function getAuthHeader(): { [key: string]: string } {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

// Fonction pour se déconnecter
async function logout(): Promise<void> {
  try {
    const token = localStorage.getItem('token');
    if (token) {
      await fetchWithTimeout(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
          ...defaultHeaders
        }
      });
    }
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
  } finally {
    // Supprimer le token du stockage local dans tous les cas
    localStorage.removeItem('token');
    // Supprimer également les données utilisateur
    localStorage.removeItem('user');
  }
}

// Service d'authentification exporté
export const authService = {
  /**
   * Tente de connecter un utilisateur avec ses identifiants
   * @param login Identifiant de l'utilisateur
   * @param password Mot de passe de l'utilisateur
   * @returns Une promesse résolue avec les données de l'utilisateur connecté
   * @throws Une erreur en cas d'échec de la connexion
   */
  async login(login: string, password: string): Promise<LoginResponse> {
    try {
      // 1. Nettoyage des anciennes données de session
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // 2. Récupération du token CSRF (optionnel)
      await getCsrfToken();
      const xsrfToken = getCookie('XSRF-TOKEN');

      // 3. Préparation de la requête de connexion
      const requestData = {
        LoginUser: login,
        PwdUser: password
      };

      // 4. Préparation des en-têtes
      const headers: Record<string, string> = {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };

      // Ajouter le token CSRF seulement s'il est disponible
      if (xsrfToken) {
        headers['X-XSRF-TOKEN'] = decodeURIComponent(xsrfToken);
        console.log('Utilisation du token CSRF pour la connexion');
      } else {
        console.log('Connexion sans token CSRF');
      }

      // 5. Envoi de la requête de connexion
      console.log('Envoi de la requête de connexion à:', `${API_BASE_URL}/auth/login`);
      console.log('Données de la requête:', requestData);

      const response = await fetchWithTimeout(
        `${API_BASE_URL}/auth/login`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify(requestData),
          credentials: 'include' // Important pour les cookies de session
        },
        15000 // 15 secondes de timeout
      );

      // 5. Traitement de la réponse
      let responseData;
      try {
        responseData = await response.json();
        console.log('Réponse du serveur:', responseData);
      } catch (parseError) {
        console.error('Erreur lors de l\'analyse de la réponse JSON:', parseError);
        const textResponse = await response.text();
        console.error('Réponse brute du serveur:', textResponse);
        throw new Error('Format de réponse inattendu du serveur');
      }

      if (!response.ok) {
        // Gestion des erreurs HTTP
        console.error('Erreur HTTP:', response.status, response.statusText);

        if (response.status === 401 || response.status === 403) {
          throw new Error(responseData.message || 'Identifiants incorrects. Veuillez réessayer.');
        }

        if (response.status === 422 && responseData.errors) {
          const firstError = Object.values(responseData.errors)[0];
          if (Array.isArray(firstError) && firstError.length > 0) {
            throw new Error(String(firstError[0]));
          }
        }

        throw new Error(
          responseData.message ||
          `Erreur lors de la connexion (${response.status} ${response.statusText})`
        );
      }

      // 6. Vérification des données reçues
      console.log('Données de la réponse:', responseData);

      // Vérifier si la réponse contient directement un token ou si elle est imbriquée dans data
      const token = responseData.access_token || responseData.data?.access_token;
      if (!token) {
        console.error('Token non trouvé dans la réponse:', responseData);
        throw new Error('Réponse du serveur invalide: token manquant');
      }

      // 7. Stockage des informations de l'utilisateur
      const userData = responseData.user || responseData.data?.user || {};
      const user: User = {
        id: userData.id || userData.IdUser || '',
        username: userData.username || userData.LoginUser || login, // Utiliser le login comme fallback
        fullName: userData.fullName || userData.NomPrenUser || '',
        contact: userData.contact || userData.ContactUser || '',
        email: userData.email || userData.emailUser || '',
        role: userData.role || userData.RoleUser || '',
        permissions: userData.permissions || []
      };

      // 8. Stockage du token et des données utilisateur
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      console.log('Utilisateur connecté avec succès:', user);

      return {
        success: true,
        message: 'Connexion réussie',
        data: {
          user,
          access_token: token,
          token_type: responseData.token_type || responseData.data?.token_type || 'Bearer'
        }
      };

    } catch (error: any) {
      // Nettoyage en cas d'erreur
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Propagation de l'erreur avec un message adapté
      if (error.name === 'AbortError') {
        throw new Error('La connexion a pris trop de temps. Vérifiez votre connexion internet.');
      }

      if (error.message) {
        // Messages d'erreur courants
        const errorMessages: Record<string, string> = {
          'CSRF token mismatch.': 'La session a expiré. Veuillez rafraîchir la page.',
          'Unauthenticated.': 'Session expirée. Veuillez vous reconnecter.',
          'The given data was invalid.': 'Les données fournies sont invalides.'
        };

        throw new Error(errorMessages[error.message] || error.message);
      }

      throw new Error('Une erreur est survenue lors de la connexion. Veuillez réessayer.');
    }
  },

  // Fonction pour vérifier si l'utilisateur est authentifié
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  },

  // Fonction pour obtenir l'utilisateur actuel
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Fonction pour se déconnecter
  async logout(): Promise<void> {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await fetchWithTimeout(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Requested-With': 'XMLHttpRequest'
          }
        });
      }
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      document.cookie = 'XSRF-TOKEN=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      document.cookie = `${import.meta.env.VITE_SESSION_NAME || 'laravel_session'}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
    }
  },

  // Fonction pour obtenir l'en-tête d'authentification
  getAuthHeader(): { [key: string]: string } {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }
};

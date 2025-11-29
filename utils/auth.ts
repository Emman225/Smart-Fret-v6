/**
 * Récupère l'en-tête d'authentification avec le token JWT
 */
export const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };
};

/**
 * Vérifie si l'utilisateur est authentifié
 */
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('token');
};

/**
 * Déconnecte l'utilisateur
 */
export const logout = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  // Rediriger vers la page de connexion
  window.location.href = '/login';
};

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

type User = {
  id: string | number;
  username: string;
  fullName?: string;
  contact?: string;
  email?: string;
  role?: string;
  permissions?: string[];
};

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Vérifier l'authentification au chargement
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (import.meta.env.DEV) {}
        
        // Vérifier si l'utilisateur est authentifié via le service
        if (!authService.isAuthenticated()) {
          setUser(null);
          setLoading(false);
          return;
        }
        
        // Récupérer l'utilisateur actuel
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        } else {
          await authService.logout();
          setUser(null);
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'authentification:', error);
        // En cas d'erreur, on déconnecte l'utilisateur pour éviter des problèmes d'état
        authService.logout();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await authService.login(username, password);
      
      if (response.success && response.data?.user) {
        setUser(response.data.user);
        return true;
      }
      
      if (import.meta.env.DEV) {}
      return false;
      
    } catch (error) {
      console.error('Erreur détaillée dans AuthContext.login:', error);
      setUser(null);
      authService.logout(); // Nettoyer en cas d'erreur
      throw error;
      
    } finally {
      setLoading(false);
    }
  };

  const logout = useCallback(async () => {
    try {
      setLoading(true);
      await authService.logout();
      setUser(null);
      
      if (import.meta.env.DEV) {}
      
      // Utiliser navigate pour la redirection
      navigate('/login');
      
      // Forcer un rechargement complet après un court délai pour s'assurer que tout est nettoyé
      setTimeout(() => {
        window.location.reload();
      }, 100);
      
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      // En cas d'erreur, forcer quand même la redirection
      window.location.href = '/login';
    }
  }, []);

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
};

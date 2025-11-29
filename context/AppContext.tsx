
import React, { createContext, useState, useContext, useEffect, useCallback, useMemo, ReactNode } from 'react';

// Déclaration de type pour import.meta.env
declare global {
  interface ImportMeta {
    readonly env: {
      readonly VITE_API_BASE_URL: string;
      [key: string]: string | undefined;
    };
  }
}
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Dossier, User, Armateur, TypeDossier, Navire, CategorieProduit, Produit } from '../types';
import { handleApiError } from '../services/authService';
import { Origine } from '../types/index';
import { getOrigines, getOrigineById as getOrigineByIdService, createOrigine, updateOrigine as updateOrigineService, deleteOrigine as deleteOrigineService } from '../services/origineService';
import { mockDossiers, mockUsers, mockArmateurs, mockOrigines, mockTypeDossiers, mockNavires, mockCategorieProduits, mockProduits } from '../data/mockData';

// Configuration d'axios pour envoyer les cookies avec chaque requête
axios.defaults.withCredentials = true;
axios.defaults.withXSRFToken = true;

// Configuration de l'URL de base de l'API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001/api';

// Fonction pour obtenir les en-têtes d'authentification
const getAuthHeader = (): Record<string, string> => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

// Interface pour les réponses API standardisées
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
  pagination?: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
    from: number;
    to: number;
  };
}

// --- AUTH CONTEXT ---
interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (username: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: async () => { },
  logout: async () => { },
  error: null,
  clearError: () => { }
});

// --- DOSSIER CONTEXT ---
interface DossierContextType {
  dossiers: Dossier[];
  getDossierById: (id: string) => Dossier | undefined;
  addDossier: (dossier: Omit<Dossier, 'id'>) => void;
  updateDossier: (dossier: Dossier) => void;
  deleteDossier: (id: string) => void;
}

const DossierContext = createContext<DossierContextType | undefined>(undefined);

// --- USER CONTEXT ---
interface UserContextType {
  users: User[];
  loading: boolean;
  error: string | null;
  total: number;
  currentPage: number;
  itemsPerPage: number;
  searchTerm: string;
  sortConfig: { key: string; direction: 'asc' | 'desc' } | null;
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (count: number) => void;
  setSearchTerm: (term: string) => void;
  setSortConfig: (config: { key: string; direction: 'asc' | 'desc' } | null) => void;
  fetchUsers: (params?: {
    page?: number;
    perPage?: number;
    search?: string;
    sortField?: string;
    sortOrder?: 'asc' | 'desc';
  }) => Promise<void>;
  getUserById: (id: string) => Promise<User>;
  addUser: (user: Omit<User, 'id' | 'password'> & { password: string }) => Promise<User>;
  updateUser: (user: User & { password?: string }) => Promise<User>;
  deleteUser: (id: string) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// --- ARMATEUR CONTEXT ---
interface ArmateurContextType {
  armateurs: Armateur[];
  getArmateurById: (id: string) => Armateur | undefined;
  addArmateur: (armateur: Omit<Armateur, 'id'>) => void;
  updateArmateur: (armateur: Armateur) => void;
  deleteArmateur: (id: string) => void;
}

const ArmateurContext = createContext<ArmateurContextType | undefined>(undefined);

// --- ORIGINE CONTEXT ---
interface OrigineContextType {
  origines: Origine[];
  loadingOrigines: boolean;
  errorOrigines: string | null;
  getOrigineById: (id: string) => Origine | undefined;
  addOrigine: (origine: Omit<Origine, 'idOrigine'>) => Promise<Origine>;
  updateOrigine: (origine: Origine) => Promise<Origine>;
  deleteOrigine: (id: string) => Promise<void>;
  fetchOrigines: () => Promise<void>;
}

const OrigineContext = createContext<OrigineContextType | undefined>(undefined);

// --- TYPE DOSSIER CONTEXT ---
interface TypeDossierContextType {
  typeDossiers: TypeDossier[];
  getTypeDossierById: (id: string) => TypeDossier | undefined;
  addTypeDossier: (typeDossier: Omit<TypeDossier, 'id'>) => Promise<void>;
  updateTypeDossier: (typeDossier: TypeDossier) => Promise<void>;
  deleteTypeDossier: (id: string) => Promise<void>;
  fetchTypeDossiers: () => Promise<void>;
}

const TypeDossierContext = createContext<TypeDossierContextType | undefined>(undefined);

// --- NAVIRE CONTEXT ---
interface NavireContextType {
  navires: Navire[];
  getNavireById: (id: string) => Navire | undefined;
  addNavire: (navire: Omit<Navire, 'id'>) => Promise<void>;
  updateNavire: (navire: Navire) => Promise<void>;
  deleteNavire: (id: string) => Promise<void>;
  fetchNavires: () => Promise<void>;
}
const NavireContext = createContext<NavireContextType | undefined>(undefined);

// --- CATEGORIE PRODUIT CONTEXT ---
interface CategorieProduitContextType {
  categorieProduits: CategorieProduit[];
  getCategorieProduitById: (id: string) => CategorieProduit | undefined;
  addCategorieProduit: (categorieProduit: Omit<CategorieProduit, 'id'>) => Promise<void>;
  updateCategorieProduit: (categorieProduit: CategorieProduit) => Promise<void>;
  deleteCategorieProduit: (id: string) => Promise<void>;
  fetchCategorieProduits: () => Promise<void>;
}
const CategorieProduitContext = createContext<CategorieProduitContextType | undefined>(undefined);

// --- PRODUIT CONTEXT ---
interface ProduitContextType {
  produits: Produit[];
  getProduitById: (id: string) => Produit | undefined;
  addProduit: (produit: Omit<Produit, 'id'>) => Promise<void>;
  updateProduit: (produit: Produit) => Promise<void>;
  deleteProduit: (id: string) => Promise<void>;
  fetchProduits: () => Promise<void>;
}
const ProduitContext = createContext<ProduitContextType | undefined>(undefined);

// --- COMBINED PROVIDER ---
const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // État de l'authentification
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const navigate = useNavigate();

  // --- USER STATE & OPERATIONS ---
  const [users, setUsers] = useState<User[]>([]);
  const [userLoading, setUserLoading] = useState<boolean>(false);
  const [userError, setUserError] = useState<string | null>(null);
  const [total, setTotal] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(15);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const fetchUsers = useCallback(async (params: {
    page?: number;
    perPage?: number;
    search?: string;
    sortField?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<void> => {
    setUserLoading(true);
    setUserError(null);

    const pageToLoad = params.page ?? currentPage;
    const perPageToLoad = params.perPage ?? itemsPerPage;
    const searchValue = params.search ?? searchTerm;
    const sortFieldValue = params.sortField ?? sortConfig?.key;
    const sortOrderValue = params.sortOrder ?? sortConfig?.direction;

    try {
      const queryParams = new URLSearchParams();
      queryParams.append('page', pageToLoad.toString());
      queryParams.append('per_page', perPageToLoad.toString());
      if (searchValue) queryParams.append('search', searchValue);
      if (sortFieldValue) queryParams.append('sortField', sortFieldValue);
      if (sortOrderValue) queryParams.append('sortOrder', sortOrderValue);

      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/users?${queryParams.toString()}`, {
        headers: getAuthHeader(),
        withCredentials: true,
        validateStatus: () => true
      });

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Erreur lors du chargement des utilisateurs');
      }

      const apiUsers = Array.isArray(response.data.data) ? response.data.data : [];
      const normalizedUsers: User[] = apiUsers.map((item: any) => ({
        id: item?.IdUser?.toString() ?? item?.id?.toString() ?? '',
        username: item?.LoginUser ?? item?.username ?? '',
        fullName: item?.NomPrenUser ?? item?.fullName ?? '',
        contact: item?.ContactUser ?? item?.contact ?? '',
        email: item?.emailUser ?? item?.email ?? '',
        role: item?.role ?? 'user',
        createdAt: item?.created_at ?? item?.createdAt ?? new Date().toISOString(),
        updatedAt: item?.updated_at ?? item?.updatedAt ?? new Date().toISOString()
      }));

      setUsers(normalizedUsers);
      setTotal(response.data.pagination?.total ?? normalizedUsers.length);

      // Ne mettre à jour currentPage et itemsPerPage que si les valeurs sont différentes
      // pour éviter les boucles infinies
      if (response.data.pagination) {
        const newPage = response.data.pagination.current_page ?? pageToLoad;
        const newPerPage = response.data.pagination.per_page ?? perPageToLoad;
        if (newPage !== currentPage) {
          setCurrentPage(newPage);
        }
        if (newPerPage !== itemsPerPage) {
          setItemsPerPage(newPerPage);
        }
      } else {
        if (pageToLoad !== currentPage) {
          setCurrentPage(pageToLoad);
        }
        if (perPageToLoad !== itemsPerPage) {
          setItemsPerPage(perPageToLoad);
        }
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Erreur lors du chargement des utilisateurs';
      setUserError(errorMessage);
      setUsers([]);
      throw new Error(errorMessage);
    } finally {
      setUserLoading(false);
    }
  }, [currentPage, itemsPerPage, searchTerm, sortConfig]);

  const getUserById = async (id: string): Promise<User> => {
    try {
      console.log(`[getUserById] Début - ID: ${id}`);
      console.log(`[getUserById] URL: ${import.meta.env.VITE_API_BASE_URL}/users/${id}`);

      const headers = getAuthHeader();
      console.log('[getUserById] En-têtes de la requête:', headers);

      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/users/${id}`, {
        headers: headers,
        withCredentials: true,
        validateStatus: () => true // Pour gérer manuellement les erreurs
      });

      console.log('[getUserById] Réponse complète:', {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: response.data
      });

      if (!response.data.success) {
        const errorMsg = response.data.message || 'Utilisateur non trouvé';
        console.error('[getUserById] Erreur dans la réponse:', errorMsg);
        throw new Error(errorMsg);
      }

      if (!response.data.data) {
        console.error('[getUserById] Données utilisateur manquantes dans la réponse:', response.data);
        throw new Error('Données utilisateur manquantes dans la réponse du serveur');
      }

      const userData = response.data.data;
      console.log('[getUserById] Données brutes de l\'utilisateur:', userData);

      // Création de l'objet utilisateur avec les champs attendus par l'interface User
      const user: User = {
        id: userData.IdUser ? userData.IdUser.toString() : id,
        username: userData.LoginUser || '',
        fullName: userData.NomPrenUser || '',
        contact: userData.ContactUser || '',
        email: userData.emailUser || '',
        role: userData.role || 'user',
        // Fournir des valeurs par défaut pour les champs optionnels
        createdAt: userData.created_at || new Date().toISOString(),
        updatedAt: userData.updated_at || new Date().toISOString()
      };

      console.log('[getUserById] Utilisateur formaté:', user);
      return user;

    } catch (error: any) {
      let errorMessage = 'Erreur lors de la récupération de l\'utilisateur';

      if (error.response) {
        console.error('Erreur de réponse du serveur (getUserById):', error.response.data);
        errorMessage = error.response.data?.message ||
          (error.response.data?.errors ? JSON.stringify(error.response.data.errors) :
            error.response.statusText || 'Erreur inconnue du serveur');
      } else if (error.request) {
        console.error('Aucune réponse du serveur (getUserById):', error.request);
        errorMessage = 'Aucune réponse du serveur. Vérifiez votre connexion internet.';
      } else {
        console.error('Erreur lors de la configuration de la requête (getUserById):', error.message);
        errorMessage = error.message || 'Erreur inconnue';
      }

      console.error('Erreur complète (getUserById):', error);
      setUserError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const addUser = async (userData: Omit<User, 'id' | 'password'> & { password: string }): Promise<User> => {
    setUserLoading(true);
    setUserError(null);

    try {
      console.log('Envoi des données utilisateur à l\'API:', {
        NomPrenUser: userData.fullName,
        emailUser: userData.email,
        LoginUser: userData.username,
        PwdUser: userData.password,
        ContactUser: userData.contact,
        role: userData.role || 'user'
      });

      console.log('En-têtes de la requête:', getAuthHeader());

      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/users`, {
        NomPrenUser: userData.fullName,
        emailUser: userData.email,
        LoginUser: userData.username,
        PwdUser: userData.password,
        ContactUser: userData.contact,
        role: userData.role || 'user'
      }, {
        headers: getAuthHeader(),
        withCredentials: true // Important pour les cookies de session
      });

      console.log('Réponse de l\'API:', response.data);

      if (!response.data.success) {
        const errorMessage = response.data.message || 'Erreur lors de la création de l\'utilisateur';
        console.error('Erreur API:', errorMessage);
        throw new Error(errorMessage);
      }

      if (!response.data.data) {
        console.error('Données utilisateur manquantes dans la réponse:', response.data);
        throw new Error('Données utilisateur manquantes dans la réponse du serveur');
      }

      const newUser: User = {
        id: response.data.data.IdUser?.toString() || '',
        username: response.data.data.LoginUser || userData.username,
        fullName: response.data.data.NomPrenUser || userData.fullName,
        contact: response.data.data.ContactUser || userData.contact,
        email: response.data.data.emailUser || userData.email,
        role: response.data.data.role || userData.role || 'user',
        createdAt: response.data.data.created_at || new Date().toISOString(),
        updatedAt: response.data.data.updated_at || new Date().toISOString()
      };

      console.log('Nouvel utilisateur créé:', newUser);

      // Rafraîchir la liste des utilisateurs
      try {
        await fetchUsers({
          page: 1,
          perPage: itemsPerPage,
          search: searchTerm,
          sortField: sortConfig?.key as string,
          sortOrder: sortConfig?.direction === 'asc' ? 'asc' : 'desc'
        });
      } catch (fetchError) {
        console.error('Erreur lors du rafraîchissement de la liste des utilisateurs:', fetchError);
        // Ne pas bloquer le processus même si le rafraîchissement échoue
      }

      return newUser;
    } catch (error: any) {
      let errorMessage = 'Erreur lors de la création de l\'utilisateur';

      if (error.response) {
        // La requête a été faite et le serveur a répondu avec un code d'erreur
        console.error('Erreur de réponse du serveur:', error.response.data);
        console.error('Status:', error.response.status);
        console.error('Headers:', error.response.headers);

        // Afficher les erreurs de validation détaillées
        if (error.response.data?.errors) {
          console.error('Erreurs de validation détaillées:', error.response.data.errors);
          // Formater les erreurs de validation pour un affichage lisible
          const validationErrors = Object.entries(error.response.data.errors)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('\n');
          errorMessage = `Erreurs de validation:\n${validationErrors}`;
        } else {
          errorMessage = error.response.data?.message ||
            error.response.statusText ||
            'Erreur inconnue du serveur';
        }
      } else if (error.request) {
        // La requête a été faite mais aucune réponse n'a été reçue
        console.error('Aucune réponse du serveur:', error.request);
        errorMessage = 'Aucune réponse du serveur. Vérifiez votre connexion internet.';
      } else {
        // Une erreur s'est produite lors de la configuration de la requête
        console.error('Erreur lors de la configuration de la requête:', error.message);
        errorMessage = error.message || 'Erreur inconnue';
      }

      console.error('Erreur complète:', error);
      setUserError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setUserLoading(false);
    }
  };

  const updateUser = async (userData: User & { password?: string }): Promise<User> => {
    try {
      console.log(`Mise à jour de l'utilisateur avec l'ID: ${userData.id}`, {
        NomPrenUser: userData.fullName,
        emailUser: userData.email,
        LoginUser: userData.username,
        ContactUser: userData.contact,
        role: userData.role || 'user',
        password: userData.password ? '***' : 'non fourni'
      });

      const updateData: any = {
        NomPrenUser: userData.fullName,
        emailUser: userData.email,
        LoginUser: userData.username,
        ContactUser: userData.contact,
        role: userData.role || 'user',
        _method: 'PUT' // Nécessaire pour Laravel avec les formulaires
      };

      // Ne mettre à jour le mot de passe que s'il est fourni
      if (userData.password) {
        updateData.PwdUser = userData.password;
      }

      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/users/${userData.id}`,
        updateData,
        {
          headers: {
            ...getAuthHeader(),
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          withCredentials: true,
          validateStatus: () => true // Pour gérer manuellement les erreurs
        }
      );

      console.log('Réponse de la mise à jour:', response.data);

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Erreur lors de la mise à jour de l\'utilisateur');
      }

      if (!response.data.data) {
        console.error('Données utilisateur manquantes dans la réponse de mise à jour:', response.data);
        throw new Error('Données utilisateur manquantes dans la réponse du serveur');
      }

      const updatedUser: User = {
        id: response.data.data.IdUser?.toString() || userData.id,
        username: response.data.data.LoginUser || userData.username,
        fullName: response.data.data.NomPrenUser || userData.fullName,
        contact: response.data.data.ContactUser || userData.contact,
        email: response.data.data.emailUser || userData.email,
        role: response.data.data.role || userData.role || 'user',
        createdAt: response.data.data.created_at || userData.createdAt || new Date().toISOString(),
        updatedAt: response.data.data.updated_at || new Date().toISOString()
      };

      console.log('Utilisateur mis à jour avec succès:', updatedUser);

      // Rafraîchir la liste des utilisateurs
      try {
        await fetchUsers({
          page: currentPage,
          perPage: itemsPerPage,
          search: searchTerm,
          sortField: sortConfig?.key as string,
          sortOrder: sortConfig?.direction === 'asc' ? 'asc' : 'desc'
        });
      } catch (fetchError) {
        console.error('Erreur lors du rafraîchissement de la liste des utilisateurs:', fetchError);
        // Ne pas bloquer le processus même si le rafraîchissement échoue
      }

      return updatedUser;
    } catch (error: any) {
      let errorMessage = 'Erreur lors de la mise à jour de l\'utilisateur';

      if (error.response) {
        console.error('Erreur de réponse du serveur (updateUser):', error.response.data);
        errorMessage = error.response.data?.message ||
          (error.response.data?.errors ? JSON.stringify(error.response.data.errors) :
            error.response.statusText || 'Erreur inconnue du serveur');
      } else if (error.request) {
        console.error('Aucune réponse du serveur (updateUser):', error.request);
        errorMessage = 'Aucune réponse du serveur. Vérifiez votre connexion internet.';
      } else {
        console.error('Erreur lors de la configuration de la requête (updateUser):', error.message);
        errorMessage = error.message || 'Erreur inconnue';
      }

      console.error('Erreur complète (updateUser):', error);
      setUserError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteUser = async (id: string): Promise<void> => {
    setUserLoading(true);
    setUserError(null);

    try {
      const response = await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/users/${id}`, {
        headers: getAuthHeader(),
        validateStatus: () => true // Pour gérer manuellement les erreurs
      });

      if (response.status === 403) {
        throw new Error('Vous ne pouvez pas supprimer votre propre compte');
      }

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Erreur lors de la suppression de l\'utilisateur');
      }

      // Rafraîchir la liste des utilisateurs
      await fetchUsers({
        page: currentPage,
        perPage: itemsPerPage,
        search: searchTerm,
        sortField: sortConfig?.key as string,
        sortOrder: sortConfig?.direction === 'asc' ? 'asc' : 'desc'
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message ||
        error.message ||
        'Erreur lors de la suppression de l\'utilisateur';
      setUserError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setUserLoading(false);
    }
  };

  const login = async (username: string) => {
    try {
      setAuthError(null);
      const response = await axios.post<ApiResponse<{ user: User; token: string }>>(
        `${API_BASE_URL}/login`,
        { username }
      );

      if (response.data.success && response.data.data) {
        const { user, token } = response.data.data;
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', token);
        setAuthUser(user);
        navigate('/dashboard');
      } else {
        const errorMsg = response.data.message || 'Échec de la connexion';
        setAuthError(errorMsg);
        throw new Error(errorMsg);
      }
    } catch (error) {
      handleApiError(error);
      // The error will be thrown by handleApiError, so we don't need to throw again
      throw error;
    }
  };

  const logout = useCallback(async () => {
    try {
      await axios.post(`${API_BASE_URL}/logout`, {}, {
        headers: getAuthHeader()
      });
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      // On continue même en cas d'erreur pour déconnecter l'utilisateur côté client
    } finally {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      setAuthUser(null);
      setAuthError(null);
      navigate('/login');
    }
  }, [navigate]);

  // Dossier State
  const [dossiers, setDossiers] = useState<Dossier[]>(() => {
    const savedDossiers = localStorage.getItem('dossiers');
    return savedDossiers ? JSON.parse(savedDossiers) : mockDossiers;
  });

  useEffect(() => {
    localStorage.setItem('dossiers', JSON.stringify(dossiers));
  }, [dossiers]);

  const getDossierById = (id: string) => dossiers.find(d => d.id === id);

  const addDossier = (dossierData: Omit<Dossier, 'id'>) => {
    const newDossier: Dossier = {
      ...dossierData,
      id: `dossier_${Date.now()}`,
    };
    setDossiers(prev => [newDossier, ...prev]);
  };

  const updateDossier = (updatedDossier: Dossier) => {
    setDossiers(prev => prev.map(d => d.id === updatedDossier.id ? updatedDossier : d));
  };

  const deleteDossier = (id: string) => {
    setDossiers(prev => prev.filter(d => d.id !== id));
  };

  // Armateur State
  const [armateurs, setArmateurs] = useState<Armateur[]>(() => {
    const savedArmateurs = localStorage.getItem('armateurs');
    return savedArmateurs ? JSON.parse(savedArmateurs) : mockArmateurs;
  });

  useEffect(() => {
    localStorage.setItem('armateurs', JSON.stringify(armateurs));
  }, [armateurs]);

  const getArmateurById = (id: string) => armateurs.find(a => a.id === id);

  const addArmateur = (armateurData: Omit<Armateur, 'id'>) => {
    const newArmateur: Armateur = {
      ...armateurData,
      id: `arm_${Date.now()}`,
    };
    setArmateurs(prev => [newArmateur, ...prev]);
  };

  const updateArmateur = (updatedArmateur: Armateur) => {
    setArmateurs(prev => prev.map(a => a.id === updatedArmateur.id ? updatedArmateur : a));
  };

  const deleteArmateur = (id: string) => {
    setArmateurs(prev => prev.filter(a => a.id !== id));
  };

  // Origine State
  const [origines, setOrigines] = useState<Origine[]>([]);
  const [loadingOrigines, setLoadingOrigines] = useState<boolean>(false);
  const [errorOrigines, setErrorOrigines] = useState<string | null>(null);

  // Charger les origines depuis l'API
  const fetchOrigines = useCallback(async () => {
    try {
      setLoadingOrigines(true);
      setErrorOrigines(null);

      const response = await getOrigines();

      if (response && response.success) {
        // Gérer à la fois les tableaux simples et les réponses paginées
        const data = Array.isArray(response.data) ? response.data : [];

        // Filtrer puis normaliser les données pour correspondre à l'interface Origine
        const normalizedOrigins: Origine[] = data
          .filter((item: any) => {
            const id = item?.idOrigine ?? item?.IdOrigine;
            const name = item?.nomPays ?? item?.NomPays;
            return typeof id === 'number' && typeof name === 'string';
          })
          .map((item: any) => ({
            idOrigine: item?.idOrigine ?? item?.IdOrigine,
            nomPays: item?.nomPays ?? item?.NomPays,
          }));

        setOrigines(normalizedOrigins);

        // Mettre à jour la pagination si disponible
        if (response.pagination) {
          setCurrentPage(response.pagination.current_page || 1);
          setItemsPerPage(response.pagination.per_page || 15);
        }
      } else {
        throw new Error('Format de réponse inattendu de l\'API');
      }
    } catch (error: any) {
      console.error('Erreur lors du chargement des origines:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Erreur lors du chargement des origines';
      setErrorOrigines(errorMessage);
      setOrigines([]);
    } finally {
      setLoadingOrigines(false);
    }
  }, []);

  // Charger les origines au montage du composant
  useEffect(() => {
    fetchOrigines();
  }, [fetchOrigines]);

  const getOrigineById = (id: string): Origine | undefined => {
    const idNumber = parseInt(id, 10);
    return isNaN(idNumber) ? undefined : origines.find(o => o.idOrigine === idNumber);
  };

  const addOrigine = async (origineData: Omit<Origine, 'idOrigine'>): Promise<Origine> => {
    setLoadingOrigines(true);
    setErrorOrigines(null);

    try {
      // Validation des données
      if (!origineData.nomPays?.trim()) {
        throw new Error('Le nom du pays est requis');
      }

      if (typeof origineData.nomPays !== 'string') {
        throw new Error('Le nom du pays doit être une chaîne de caractères');
      }

      console.log('Envoi des données au serveur:', { nomPays: origineData.nomPays });

      const response = await createOrigine({
        nomPays: origineData.nomPays.trim()
      });

      console.log('Réponse brute du serveur:', response);

      // La réponse d'Axios contient les données dans response.data
      const responseData = response.data;
      console.log('Données de la réponse:', responseData);

      if (responseData && responseData.success) {
        // Créer un ID temporaire pour la réactivité
        const tempId = Date.now();

        // Créer la nouvelle origine avec l'ID temporaire
        const newOrigine: Origine = {
          idOrigine: tempId, // ID temporaire
          nomPays: responseData.data?.nomPays || origineData.nomPays.trim()
        };

        console.log('Nouvelle origine créée avec ID temporaire:', newOrigine);

        // Mettre à jour l'état local immédiatement pour une meilleure réactivité
        setOrigines(prev => [newOrigine, ...prev]);

        // Recharger les origines pour obtenir les données complètes du serveur
        await fetchOrigines();

        // Retourner la nouvelle origine avec l'ID temporaire
        // L'ID sera mis à jour après le rechargement
        return newOrigine;
      } else {
        // Si on arrive ici, c'est qu'il y a eu une erreur inattendue
        console.error('Réponse inattendue du serveur:', response);
        throw new Error('Erreur lors de la création de l\'origine');
      }
    } catch (error: any) {
      console.error('Erreur lors de l\'ajout de l\'origine:', error);

      let errorMessage = 'Erreur lors de l\'ajout de l\'origine';

      if (error.response) {
        // Erreur de réponse du serveur
        console.error('Détails de l\'erreur:', error.response.data);
        const responseData = error.response.data;

        // Vérifier si c'est une erreur de doublon
        const errorData = typeof responseData === 'string' ? responseData :
          responseData.message ||
          (responseData.errors ? Object.values(responseData.errors).flat().join(' ') : '');

        const lowerCaseError = String(errorData).toLowerCase();

        if (lowerCaseError.includes('already been taken') ||
          lowerCaseError.includes('le nom du pays existe déjà') ||
          lowerCaseError.includes('nom pays a déjà été pris') ||
          lowerCaseError.includes('nom du pays existe déjà')) {
          errorMessage = 'Ce nom de pays existe déjà. Veuillez en choisir un autre.';
        } else {
          errorMessage = error.response.data?.message ||
            (error.response.data?.errors ?
              Object.values(error.response.data.errors).flat().join('. ') :
              'Erreur de validation des données');
        }
      } else if (error.request) {
        // La requête a été faite mais aucune réponse n'a été reçue
        console.error('Aucune réponse du serveur:', error.request);
        errorMessage = 'Le serveur ne répond pas. Vérifiez votre connexion.';
      } else {
        // Erreur lors de la configuration de la requête
        errorMessage = error.message || 'Erreur inconnue';
      }

      setErrorOrigines(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoadingOrigines(false);
    }
  };

  const updateOrigine = async (updatedOrigine: Origine): Promise<Origine> => {
    try {
      setLoadingOrigines(true);
      setErrorOrigines(null);

      if (typeof updatedOrigine.idOrigine !== 'number') {
        throw new Error('ID d\'origine invalide');
      }

      if (!updatedOrigine.nomPays || typeof updatedOrigine.nomPays !== 'string') {
        throw new Error('Le nom du pays est requis et doit être une chaîne de caractères');
      }

      const response = await updateOrigineService(updatedOrigine.idOrigine, {
        nomPays: updatedOrigine.nomPays
      });
      const updated = response;
      setOrigines(prev =>
        prev.map(o => o.idOrigine === updatedOrigine.idOrigine ? updated : o)
      );
      return updated;
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour de l\'origine:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de la mise à jour de l\'origine';
      setErrorOrigines(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoadingOrigines(false);
    }
  };

  const deleteOrigine = async (id: string): Promise<void> => {
    try {
      setLoadingOrigines(true);
      setErrorOrigines(null);

      const idNumber = parseInt(id, 10);
      if (isNaN(idNumber)) {
        throw new Error('ID d\'origine invalide');
      }

      await deleteOrigineService(idNumber);
      setOrigines(prev => prev.filter(o => o.idOrigine !== idNumber));
    } catch (error: any) {
      console.error('Erreur lors de la suppression de l\'origine:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de la suppression de l\'origine';
      setErrorOrigines(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoadingOrigines(false);
    }
  };

  // TypeDossier State
  const [typeDossiers, setTypeDossiers] = useState<TypeDossier[]>(() => {
    const savedTypeDossiers = localStorage.getItem('typeDossiers');
    return savedTypeDossiers ? JSON.parse(savedTypeDossiers) : mockTypeDossiers;
  });

  const fetchTypeDossiers = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/type-dossiers`, {
        headers: getAuthHeader()
      });
      if (!response.data || !response.data.success || !Array.isArray(response.data.data)) {
        throw new Error('Format de réponse inattendu de l\'API des types de dossiers');
      }

      const apiItems = response.data.data as any[];
      const mapped: TypeDossier[] = apiItems
        .map((item) => ({
          id: String(item.IdTypeDos ?? item.id ?? ''),
          typeDossier: String(item.LibTypDos ?? item.libType ?? '')
        }))
        .filter((t) => t.id && t.typeDossier);

      setTypeDossiers(mapped);
      localStorage.setItem('typeDossiers', JSON.stringify(mapped));
    } catch (error: any) {
      console.error('Erreur lors de la récupération des types de dossiers:', error);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('typeDossiers', JSON.stringify(typeDossiers));
  }, [typeDossiers]);

  useEffect(() => {
    fetchTypeDossiers();
  }, [fetchTypeDossiers]);

  const getTypeDossierById = (id: string) => typeDossiers.find(t => t.id === id);

  const addTypeDossier = async (typeDossierData: Omit<TypeDossier, 'id'>) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/type-dossiers`, {
        LibType: typeDossierData.typeDossier
      }, { headers: getAuthHeader() });

      if (!response.data || !response.data.success) {
        throw new Error('Format de réponse inattendu de l\'API lors de la création du type de dossier');
      }

      // Recharger la liste après création pour obtenir les données complètes
      await fetchTypeDossiers();
    } catch (error) {
      console.error('Erreur lors de la création du type de dossier:', error);
      throw error;
    }
  };

  const updateTypeDossier = async (updatedTypeDossier: TypeDossier) => {
    try {
      const idNum = parseInt(updatedTypeDossier.id, 10);
      const response = await axios.put(`${API_BASE_URL}/type-dossiers/${idNum}`, {
        LibType: updatedTypeDossier.typeDossier
      }, { headers: getAuthHeader() });

      if (!response.data || !response.data.success) {
        throw new Error('Format de réponse inattendu de l\'API lors de la mise à jour du type de dossier');
      }

      // Recharger la liste après mise à jour pour obtenir les données complètes
      await fetchTypeDossiers();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du type de dossier:', error);
      throw error;
    }
  };

  const deleteTypeDossier = async (id: string) => {
    try {
      const idNum = parseInt(id, 10);
      await axios.delete(`${API_BASE_URL}/type-dossiers/${idNum}`, { headers: getAuthHeader() });
      setTypeDossiers(prev => {
        const next = prev.filter(t => t.id !== id);
        localStorage.setItem('typeDossiers', JSON.stringify(next));
        return next;
      });
    } catch (error) {
      console.error('Erreur lors de la suppression du type de dossier:', error);
      throw error;
    }
  };

  // Navire State
  const [navires, setNavires] = useState<Navire[]>(() => {
    const savedNavires = localStorage.getItem('navires');
    return savedNavires ? JSON.parse(savedNavires) : mockNavires;
  });

  useEffect(() => {
    localStorage.setItem('navires', JSON.stringify(navires));
  }, [navires]);

  const getNavireById = (id: string) => navires.find(n => n.id === id);

  const addNavire = async (navireData: Omit<Navire, 'id'>) => {
    try {
      const payload = {
        NomNavir: navireData.nomNavire,
        IdArmat: parseInt(String(navireData.armateurId), 10)
      };
      const response = await axios.post(`${API_BASE_URL}/navires`, payload, { headers: getAuthHeader() });
      const data = response.data?.data || {};
      const created: Navire = {
        id: String(data.IdNavire ?? data.id ?? Date.now()),
        nomNavire: String(data.NomNavir ?? data.nomNavire ?? navireData.nomNavire),
        armateurId: String(data.IdArmat ?? data.armateurId ?? navireData.armateurId)
      } as Navire;
      setNavires(prev => {
        const next = [created, ...prev];
        localStorage.setItem('navires', JSON.stringify(next));
        return next;
      });
      await fetchNavires();
    } catch (error) {
      console.error('Erreur lors de la création du navire:', error);
      throw error;
    }
  };

  const updateNavire = async (updatedNavire: Navire) => {
    try {
      const idNum = parseInt(updatedNavire.id, 10);
      const payload = {
        NomNavir: updatedNavire.nomNavire,
        IdArmat: parseInt(String(updatedNavire.armateurId), 10)
      };
      const response = await axios.put(`${API_BASE_URL}/navires/${idNum}`, payload, { headers: getAuthHeader() });
      const data = response.data?.data || {};
      const mapped: Navire = {
        id: String(data.IdNavire ?? updatedNavire.id),
        nomNavire: String(data.NomNavir ?? updatedNavire.nomNavire),
        armateurId: String(data.IdArmat ?? updatedNavire.armateurId)
      } as Navire;
      setNavires(prev => {
        const next = prev.map(n => n.id === updatedNavire.id ? mapped : n);
        localStorage.setItem('navires', JSON.stringify(next));
        return next;
      });
      await fetchNavires();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du navire:', error);
      throw error;
    }
  };

  const deleteNavire = async (id: string) => {
    try {
      const idNum = parseInt(id, 10);
      await axios.delete(`${API_BASE_URL}/navires/${idNum}`, { headers: getAuthHeader() });
      setNavires(prev => {
        const next = prev.filter(n => n.id !== id);
        localStorage.setItem('navires', JSON.stringify(next));
        return next;
      });
      await fetchNavires();
    } catch (error) {
      console.error('Erreur lors de la suppression du navire:', error);
      throw error;
    }
  };

  const fetchNavires = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/navires`, { headers: getAuthHeader() });
      if (!response.data || !response.data.success || !Array.isArray(response.data.data)) {
        throw new Error('Format de réponse inattendu de l\'API des navires');
      }
      const apiItems = response.data.data as any[];
      const mapped = apiItems
        .map((item) => ({
          id: String(item.IdNavire ?? item.id ?? ''),
          nomNavire: String(item.NomNavir ?? item.NomNavire ?? item.nomNavire ?? ''),
          armateurId: String(item.IdArmat ?? item.armateur?.IdArmat ?? item.armateurId ?? ''),
          armateurName: String(item.armateur?.NomArmat ?? '')
        }))
        .filter(n => n.id && n.nomNavire);
      setNavires(mapped as unknown as Navire[]);
      localStorage.setItem('navires', JSON.stringify(mapped));
    } catch (error) {
      console.error('Erreur lors de la récupération des navires:', error);
    }
  }, []);

  // CategorieProduit State
  const [categorieProduits, setCategorieProduits] = useState<CategorieProduit[]>(() => {
    const savedCategorieProduits = localStorage.getItem('categorieProduits');
    return savedCategorieProduits ? JSON.parse(savedCategorieProduits) : mockCategorieProduits;
  });

  useEffect(() => {
    localStorage.setItem('categorieProduits', JSON.stringify(categorieProduits));
  }, [categorieProduits]);

  const getCategorieProduitById = (id: string) => categorieProduits.find(c => c.id === id);

  const addCategorieProduit = async (categorieProduitData: Omit<CategorieProduit, 'id'>) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/categories-produits`, {
        LibCatProd: categorieProduitData.nomCategorie
      }, { headers: getAuthHeader() });
      const data = response.data?.data || {};
      const created: CategorieProduit = {
        id: String(data.IdCatProd ?? data.id ?? Date.now()),
        nomCategorie: String(data.LibCatProd ?? data.nomCategorie ?? categorieProduitData.nomCategorie)
      };
      setCategorieProduits(prev => {
        const next = [created, ...prev];
        localStorage.setItem('categorieProduits', JSON.stringify(next));
        return next;
      });
    } catch (error) {
      console.error('Erreur lors de la création de la catégorie de produit:', error);
      throw error;
    }
  };

  const updateCategorieProduit = async (updatedCategorieProduit: CategorieProduit) => {
    try {
      const idNum = parseInt(updatedCategorieProduit.id, 10);
      const response = await axios.put(`${API_BASE_URL}/categories-produits/${idNum}`, {
        LibCatProd: updatedCategorieProduit.nomCategorie
      }, { headers: getAuthHeader() });
      const data = response.data?.data || {};
      const mapped: CategorieProduit = {
        id: String(data.IdCatProd ?? updatedCategorieProduit.id),
        nomCategorie: String(data.LibCatProd ?? updatedCategorieProduit.nomCategorie)
      };
      setCategorieProduits(prev => {
        const next = prev.map(c => c.id === updatedCategorieProduit.id ? mapped : c);
        localStorage.setItem('categorieProduits', JSON.stringify(next));
        return next;
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la catégorie de produit:', error);
      throw error;
    }
  };

  const deleteCategorieProduit = async (id: string) => {
    try {
      const idNum = parseInt(id, 10);
      await axios.delete(`${API_BASE_URL}/categories-produits/${idNum}`, { headers: getAuthHeader() });
      setCategorieProduits(prev => {
        const next = prev.filter(c => c.id !== id);
        localStorage.setItem('categorieProduits', JSON.stringify(next));
        return next;
      });
    } catch (error) {
      console.error('Erreur lors de la suppression de la catégorie de produit:', error);
      throw error;
    }
  };

  const fetchCategorieProduits = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/categories-produits`, { headers: getAuthHeader() });
      if (!response.data || !response.data.success || !Array.isArray(response.data.data)) {
        throw new Error('Format de réponse inattendu de l\'API des catégories de produits');
      }
      const apiItems = response.data.data as any[];
      const mapped: CategorieProduit[] = apiItems
        .map((item) => ({
          id: String(item.IdCatProd ?? item.id ?? ''),
          nomCategorie: String(item.LibCatProd ?? item.nomCategorie ?? '')
        }))
        .filter(c => c.id && c.nomCategorie);
      setCategorieProduits(mapped);
      localStorage.setItem('categorieProduits', JSON.stringify(mapped));
    } catch (error) {
      console.error('Erreur lors de la récupération des catégories de produits:', error);
    }
  }, []);

  // Produit State
  const [produits, setProduits] = useState<Produit[]>(() => {
    const savedProduits = localStorage.getItem('produits');
    return savedProduits ? JSON.parse(savedProduits) : mockProduits;
  });

  useEffect(() => {
    localStorage.setItem('produits', JSON.stringify(produits));
  }, [produits]);

  const getProduitById = (id: string) => produits.find(p => p.id === id);

  const addProduit = async (produitData: Omit<Produit, 'id'>) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/produits`, {
        LibProd: produitData.nomProduit
      }, { headers: getAuthHeader() });
      const data = response.data?.data || {};
      const created: Produit = {
        id: String(data.IdProd ?? data.id ?? Date.now()),
        nomProduit: String(data.LibProd ?? data.nomProduit ?? produitData.nomProduit)
      };
      setProduits(prev => {
        const next = [created, ...prev];
        localStorage.setItem('produits', JSON.stringify(next));
        return next;
      });
    } catch (error) {
      console.error('Erreur lors de la création du produit:', error);
      throw error;
    }
  };

  const updateProduit = async (updatedProduit: Produit) => {
    try {
      const idNum = parseInt(updatedProduit.id, 10);
      const response = await axios.put(`${API_BASE_URL}/produits/${idNum}`, {
        LibProd: updatedProduit.nomProduit
      }, { headers: getAuthHeader() });
      const data = response.data?.data || {};
      const mapped: Produit = {
        id: String(data.IdProd ?? updatedProduit.id),
        nomProduit: String(data.LibProd ?? updatedProduit.nomProduit)
      };
      setProduits(prev => {
        const next = prev.map(p => p.id === updatedProduit.id ? mapped : p);
        localStorage.setItem('produits', JSON.stringify(next));
        return next;
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du produit:', error);
      throw error;
    }
  };

  const deleteProduit = async (id: string) => {
    try {
      const idNum = parseInt(id, 10);
      await axios.delete(`${API_BASE_URL}/produits/${idNum}`, { headers: getAuthHeader() });
      setProduits(prev => {
        const next = prev.filter(p => p.id !== id);
        localStorage.setItem('produits', JSON.stringify(next));
        return next;
      });
    } catch (error) {
      console.error('Erreur lors de la suppression du produit:', error);
      throw error;
    }
  };

  const fetchProduits = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/produits`, { headers: getAuthHeader() });
      if (!response.data || !response.data.success || !Array.isArray(response.data.data)) {
        throw new Error('Format de réponse inattendu de l\'API des produits');
      }
      const apiItems = response.data.data as any[];
      const mapped: Produit[] = apiItems
        .map((item) => ({
          id: String(item.IdProd ?? item.id ?? ''),
          nomProduit: String(item.LibProd ?? item.nomProduit ?? '')
        }))
        .filter(p => p.id && p.nomProduit);
      setProduits(mapped);
      localStorage.setItem('produits', JSON.stringify(mapped));
    } catch (error) {
      console.error('Erreur lors de la récupération des produits:', error);
    }
  }, []);

  // Valeurs du contexte d'authentification
  const authContextValue = useMemo(() => ({
    isAuthenticated: !!authUser,
    user: authUser,
    login: async (username: string) => {
      try {
        setAuthError(null);
        const response = await axios.post<ApiResponse<{ user: User; token: string }>>(
          `${API_BASE_URL}/login`,
          { username }
        );

        if (response.data.success && response.data.data) {
          const { user, token } = response.data.data;
          localStorage.setItem('user', JSON.stringify(user));
          localStorage.setItem('token', token);
          setAuthUser(user);
          navigate('/dashboard');
        } else {
          const errorMsg = response.data.message || 'Échec de la connexion';
          setAuthError(errorMsg);
          throw new Error(errorMsg);
        }
      } catch (error) {
        const errorMessage = handleApiError(error, setAuthError);
        throw new Error(errorMessage);
      }
    },
    logout: async () => {
      try {
        await axios.post(`${API_BASE_URL}/logout`, {}, { headers: getAuthHeader() });
      } catch (error) {
        console.error('Erreur lors de la déconnexion:', error);
      } finally {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setAuthUser(null);
        setAuthError(null);
        navigate('/login');
      }
    },
    error: authError,
    clearError: () => setAuthError(null)
  }), [authUser, authError, navigate]);

  // Charger l'utilisateur au montage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setAuthUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Erreur lors du parsing de l\'utilisateur stocké', error);
      }
    }
  }, []);

  const userContextValue = useMemo<UserContextType>(() => ({
    users,
    loading: userLoading,
    error: userError,
    total,
    currentPage,
    itemsPerPage,
    searchTerm,
    sortConfig,
    setCurrentPage,
    setItemsPerPage,
    setSearchTerm,
    setSortConfig,
    fetchUsers,
    getUserById,
    addUser,
    updateUser,
    deleteUser
  }), [
    users,
    userLoading,
    userError,
    total,
    currentPage,
    itemsPerPage,
    searchTerm,
    sortConfig,
    fetchUsers,
    getUserById,
    addUser,
    updateUser,
    deleteUser
  ]);

  // Valeurs du contexte des origines
  const origineContextValue = useMemo(() => {
    const addOrigine = async (origineData: Omit<Origine, 'idOrigine'>): Promise<Origine> => {
      setLoadingOrigines(true);
      setErrorOrigines(null);

      try {
        // Normalisation des données d'entrée (gestion des clés NomPays vs nomPays)
        const normalizedData = {
          nomPays: origineData.nomPays || (origineData as any).NomPays || ''
        };

        // Validation des données
        if (!normalizedData.nomPays?.trim()) {
          throw new Error('Le nom du pays est requis');
        }

        if (typeof normalizedData.nomPays !== 'string') {
          throw new Error('Le nom du pays doit être une chaîne de caractères');
        }

        console.log('Envoi des données au serveur:', { nomPays: normalizedData.nomPays });

        const response = await createOrigine({
          nomPays: normalizedData.nomPays.trim()
        });

        console.log('Réponse du serveur:', response);

        if (response?.data && response.data.success) {
          const rawData = response.data.data as any;

          // Normalisation des données pour correspondre à l'interface Origine
          const newOrigine: Origine = {
            idOrigine: rawData.IdOrigine || rawData.idOrigine,
            nomPays: rawData.NomPays || rawData.nomPays
          };

          // Vérification du format de la réponse
          if (typeof newOrigine.idOrigine !== 'number' || typeof newOrigine.nomPays !== 'string') {
            console.error('Format de réponse inattendu:', newOrigine);
            throw new Error('Format de réponse inattendu du serveur');
          }

          setOrigines(prev => [newOrigine, ...prev]);
          return newOrigine;
        }

        throw new Error(response?.data?.message || 'Erreur lors de la création de l\'origine');
      } catch (error: any) {
        console.error('Erreur lors de l\'ajout de l\'origine:', error);
        const errorMessage = handleApiError(error, setErrorOrigines);
        throw new Error(errorMessage);
      } finally {
        setLoadingOrigines(false);
      }
    };

    const updateOrigine = async (updatedOrigine: Origine): Promise<Origine> => {
      try {
        setLoadingOrigines(true);
        setErrorOrigines(null);

        if (typeof updatedOrigine.idOrigine !== 'number') {
          throw new Error('ID d\'origine invalide');
        }

        if (!updatedOrigine.nomPays || typeof updatedOrigine.nomPays !== 'string') {
          throw new Error('Le nom du pays est requis et doit être une chaîne de caractères');
        }

        const response = await updateOrigineService(updatedOrigine.idOrigine, {
          nomPays: updatedOrigine.nomPays.trim()
        });
        const updated = response;
        setOrigines(prev =>
          prev.map(o => o.idOrigine === updatedOrigine.idOrigine ? updated : o)
        );
        return updated;
      } catch (error: any) {
        console.error('Erreur lors de la mise à jour de l\'origine:', error);
        const errorMessage = handleApiError(error, setErrorOrigines);
        throw new Error(errorMessage);
      } finally {
        setLoadingOrigines(false);
      }
    };

    const deleteOrigine = async (id: string): Promise<void> => {
      try {
        setLoadingOrigines(true);
        setErrorOrigines(null);

        const idNumber = parseInt(id, 10);
        if (isNaN(idNumber)) {
          throw new Error('ID d\'origine invalide');
        }

        await deleteOrigineService(idNumber);
        setOrigines(prev => prev.filter(o => o.idOrigine !== idNumber));
      } catch (error: any) {
        console.error('Erreur lors de la suppression de l\'origine:', error);
        const errorMessage = handleApiError(error, setErrorOrigines);
        throw new Error(errorMessage);
      } finally {
        setLoadingOrigines(false);
      }
    };

    const fetchOrigines = async () => {
      try {
        setLoadingOrigines(true);
        const response = await getOrigines();

        if (response && response.success) {
          // Gérer à la fois les tableaux simples et les réponses paginées
          const data = Array.isArray(response.data) ? response.data : [];

          // Filtrer les données pour s'assurer qu'elles correspondent à l'interface Origine
          const validOrigins = data.map((item: any) => ({
            idOrigine: item.idOrigine || item.IdOrigine, // Gérer les deux cas de figure
            nomPays: item.nomPays || item.NomPays
          })).filter((item: any): item is Origine =>
            item && typeof item.idOrigine === 'number' && typeof item.nomPays === 'string'
          );

          setOrigines(validOrigins);
          setErrorOrigines(null);

          // Mettre à jour la pagination si disponible
          if (response.pagination) {
            setCurrentPage(response.pagination.current_page || 1);
            setItemsPerPage(response.pagination.per_page || 15);
          }
        } else {
          throw new Error('Format de réponse inattendu de l\'API');
        }
      } catch (error) {
        const errorMessage = handleApiError(error, setErrorOrigines);
        setOrigines([]);
        throw new Error(errorMessage);
      } finally {
        setLoadingOrigines(false);
      }
    };

    return {
      origines,
      loadingOrigines,
      errorOrigines,
      getOrigineById: (id: string) => origines.find(o => o.idOrigine === Number(id)),
      addOrigine,
      updateOrigine,
      deleteOrigine,
      fetchOrigines
    };
  }, [origines, loadingOrigines, errorOrigines]);

  // Valeurs des autres contextes (simplifiées pour l'exemple)
  const dossierContextValue = useMemo(() => ({
    dossiers: [],
    getDossierById: (id: string) => undefined,
    addDossier: () => { },
    updateDossier: () => { },
    deleteDossier: () => { }
  }), []);

  const armateurContextValue = useMemo(() => ({
    armateurs: [],
    getArmateurById: (id: string) => undefined,
    addArmateur: () => { },
    updateArmateur: () => { },
    deleteArmateur: () => { }
  }), []);

  const typeDossierContextValue = useMemo<TypeDossierContextType>(() => ({
    typeDossiers,
    getTypeDossierById,
    addTypeDossier,
    updateTypeDossier,
    deleteTypeDossier,
    fetchTypeDossiers
  }), [typeDossiers, getTypeDossierById, addTypeDossier, updateTypeDossier, deleteTypeDossier, fetchTypeDossiers]);

  const navireContextValue = useMemo<NavireContextType>(() => ({
    navires,
    getNavireById,
    addNavire,
    updateNavire,
    deleteNavire,
    fetchNavires
  }), [navires, getNavireById, addNavire, updateNavire, deleteNavire, fetchNavires]);

  const categorieProduitContextValue = useMemo<CategorieProduitContextType>(() => ({
    categorieProduits,
    getCategorieProduitById,
    addCategorieProduit,
    updateCategorieProduit,
    deleteCategorieProduit,
    fetchCategorieProduits
  }), [categorieProduits, getCategorieProduitById, addCategorieProduit, updateCategorieProduit, deleteCategorieProduit, fetchCategorieProduits]);

  const produitContextValue = useMemo<ProduitContextType>(() => ({
    produits,
    getProduitById,
    addProduit,
    updateProduit,
    deleteProduit,
    fetchProduits
  }), [produits, getProduitById, addProduit, updateProduit, deleteProduit, fetchProduits]);

  return (
    <AuthContext.Provider value={authContextValue}>
      <UserContext.Provider value={userContextValue}>
        <DossierContext.Provider value={dossierContextValue}>
          <ArmateurContext.Provider value={armateurContextValue}>
            <OrigineContext.Provider value={origineContextValue}>
              <TypeDossierContext.Provider value={typeDossierContextValue}>
                <NavireContext.Provider value={navireContextValue}>
                  <CategorieProduitContext.Provider value={categorieProduitContextValue}>
                    <ProduitContext.Provider value={produitContextValue}>
                      {children}
                    </ProduitContext.Provider>
                  </CategorieProduitContext.Provider>
                </NavireContext.Provider>
              </TypeDossierContext.Provider>
            </OrigineContext.Provider>
          </ArmateurContext.Provider>
        </DossierContext.Provider>
      </UserContext.Provider>
    </AuthContext.Provider>
  );
};

export { AppProvider };
export default AppProvider;

// --- HOOKS ---
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useDossiers = (): DossierContextType => {
  const context = useContext(DossierContext);
  if (context === undefined) {
    throw new Error('useDossiers must be used within an AppProvider');
  }
  return context;
};

export const useUsers = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUsers must be used within an AppProvider');
  }
  return context;
};

export const useArmateurs = () => {
  const context = useContext(ArmateurContext);
  if (context === undefined) {
    throw new Error('useArmateurs must be used within an AppProvider');
  }
  return context;
};

export const useOrigines = () => {
  const context = useContext(OrigineContext);
  if (context === undefined) {
    throw new Error('useOrigines must be used within an AppProvider');
  }
  return context;
};

export const useTypeDossiers = () => {
  const context = useContext(TypeDossierContext);
  if (context === undefined) {
    throw new Error('useTypeDossiers must be used within an AppProvider');
  }
  return context;
};

export const useNavires = () => {
  const context = useContext(NavireContext);
  if (context === undefined) {
    throw new Error('useNavires must be used within an AppProvider');
  }
  if (import.meta.env.DEV) {
    // Réduire le bruit: ne pas journaliser systématiquement toutes les rendus
    // Les journaux détaillés peuvent être activés ponctuellement au besoin
  }
  return context;
};

export const useCategorieProduits = () => {
  const context = useContext(CategorieProduitContext);
  if (context === undefined) {
    throw new Error('useCategorieProduits must be used within an AppProvider');
  }
  return context;
};

export const useProduits = () => {
  const context = useContext(ProduitContext);
  if (context === undefined) {
    throw new Error('useProduits must be used within an AppProvider');
  }
  return context;
};

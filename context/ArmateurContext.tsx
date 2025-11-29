import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Armateur,
  PaginatedResponse,
  getArmateurs as fetchArmateurs,
  getArmateurById,
  createArmateur as createArmateurApi,
  updateArmateur as updateArmateurApi,
  deleteArmateur as deleteArmateurApi,
  getArmateursStats,
  ArmateurStats,
} from '../services/armateurService';

interface ArmateurContextType {
  armateurs: Armateur[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  searchTerm: string;
  sortConfig: { key: keyof Armateur; direction: 'asc' | 'desc' } | null;
  fetchArmateurs: (params?: {
    page?: number;
    per_page?: number;
    search?: string;
    sort_by?: keyof Armateur;
    sort_order?: 'asc' | 'desc';
  }) => Promise<void>;
  getArmateur: (id: number) => Promise<Armateur>;
  createArmateur: (data: Omit<Armateur, 'IdArmat'>) => Promise<Armateur>;
  updateArmateur: (id: number, data: Partial<Omit<Armateur, 'IdArmat'>>) => Promise<Armateur>;
  deleteArmateur: (id: number) => Promise<void>;
  getStats: () => Promise<ArmateurStats[]>;
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (count: number) => void;
  setSearchTerm: (term: string) => void;
  setSortConfig: (config: { key: keyof Armateur; direction: 'asc' | 'desc' } | null) => void;
}

const ArmateurContext = createContext<ArmateurContextType | undefined>(undefined);

export const ArmateurProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [armateurs, setArmateurs] = useState<Armateur[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(15);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Armateur; direction: 'asc' | 'desc' } | null>(null);

  // Fonction pour charger les armateurs avec pagination, recherche et tri
  const fetchArmateursList = useCallback(async (params: {
    page?: number;
    per_page?: number;
    search?: string;
    sort_by?: keyof Armateur;
    sort_order?: 'asc' | 'desc';
  } = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Paramètres de la requête:', {
        page: params.page || currentPage,
        per_page: params.per_page || itemsPerPage,
        search: params.search !== undefined ? params.search : searchTerm,
        sort_by: params.sort_by,
        sort_order: params.sort_order,
      });
      
      const apiResponse = await fetchArmateurs({
        page: params.page || currentPage,
        per_page: params.per_page || itemsPerPage,
        search: params.search !== undefined ? params.search : searchTerm,
        sort_by: params.sort_by,
        sort_order: params.sort_order,
      });
      
      console.log('Réponse complète de l\'API:', JSON.stringify(apiResponse, null, 2));
      
      // Vérifier si la réponse est déjà un tableau (format non paginé)
      if (Array.isArray(apiResponse)) {
        console.log('Réponse reçue sous forme de tableau, conversion en format paginé');
        const armateurs = apiResponse as Armateur[];
        setArmateurs(armateurs);
        setTotalItems(armateurs.length);
      }
      
      // Vérifier si la réponse est au format paginé
      const paginatedResponse = apiResponse as PaginatedResponse<Armateur>;
      
      if (!paginatedResponse || !Array.isArray(paginatedResponse.data)) {
        console.error('Format de réponse inattendu:', paginatedResponse);
        throw new Error('Format de réponse inattendu de l\'API');
      }
      
      // Si pas de pagination, en créer une par défaut
      if (!paginatedResponse.pagination) {
        console.warn('Avertissement: pas de données de pagination dans la réponse, utilisation des valeurs par défaut');
        paginatedResponse.pagination = {
          total: paginatedResponse.data.length,
          per_page: itemsPerPage,
          current_page: 1,
          last_page: Math.ceil(paginatedResponse.data.length / itemsPerPage),
          from: 1,
          to: Math.min(paginatedResponse.data.length, itemsPerPage)
        };
      }
      
      setArmateurs(paginatedResponse.data);
      setTotalItems(paginatedResponse.pagination.total);
      
      // Mettre à jour les paramètres de pagination si fournis
      if (params.page !== undefined) setCurrentPage(params.page);
      if (params.per_page !== undefined) setItemsPerPage(params.per_page);
      if (params.search !== undefined) setSearchTerm(params.search);
      
      // Pas de valeur de retour (Promise<void>)
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erreur lors du chargement des armateurs';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, searchTerm]);

  // Effet de chargement initial (protégé contre les doubles appels en StrictMode)
  const didInitRef = React.useRef(false);
  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;
    const timer = setTimeout(() => {
      fetchArmateursList();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchArmateursList]);

  // Récupérer un armateur par son ID
  const getArmateur = async (id: number): Promise<Armateur> => {
    try {
      setLoading(true);
      const armateur = await getArmateurById(id);
      return armateur;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || `Erreur lors de la récupération de l'armateur ${id}`;
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Créer un nouvel armateur
  const createArmateur = async (data: Omit<Armateur, 'IdArmat'>): Promise<Armateur> => {
    try {
      setLoading(true);
      const newArmateur = await createArmateurApi(data);
      // Recharger la liste des armateurs après création
      await fetchArmateursList();
      return newArmateur;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Erreur lors de la création de l'armateur";
      setError(errorMessage);
      throw err; // Propage l'erreur pour la gestion dans le composant
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour un armateur
  const updateArmateur = async (id: number, data: Partial<Omit<Armateur, 'IdArmat'>>): Promise<Armateur> => {
    try {
      setLoading(true);
      const updatedArmateur = await updateArmateurApi(id, data);
      // Mettre à jour la liste des armateurs après modification
      await fetchArmateursList();
      return updatedArmateur;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || `Erreur lors de la mise à jour de l'armateur ${id}`;
      setError(errorMessage);
      throw err; // Propage l'erreur pour la gestion dans le composant
    } finally {
      setLoading(false);
    }
  };

  // Supprimer un armateur
  const deleteArmateur = async (id: number): Promise<void> => {
    try {
      setLoading(true);
      await deleteArmateurApi(id);
      // Recharger la liste des armateurs après suppression
      await fetchArmateursList();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || `Erreur lors de la suppression de l'armateur ${id}`;
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Récupérer les statistiques des armateurs
  const getStats = async (): Promise<ArmateurStats[]> => {
    try {
      setLoading(true);
      const stats = await getArmateursStats();
      return stats;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erreur lors de la récupération des statistiques';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    armateurs,
    loading,
    error,
    currentPage,
    itemsPerPage,
    totalItems,
    searchTerm,
    sortConfig,
    fetchArmateurs: fetchArmateursList,
    getArmateur,
    createArmateur,
    updateArmateur,
    deleteArmateur,
    getStats,
    setCurrentPage,
    setItemsPerPage,
    setSearchTerm,
    setSortConfig,
  };

  return (
    <ArmateurContext.Provider value={value}>
      {children}
    </ArmateurContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte des armateurs
export const useArmateurs = (): ArmateurContextType => {
  const context = useContext(ArmateurContext);
  if (context === undefined) {
    throw new Error('useArmateurs doit être utilisé à l\'intérieur d\'un ArmateurProvider');
  }
  return context;
};

export default ArmateurContext;

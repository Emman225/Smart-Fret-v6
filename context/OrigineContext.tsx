import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Origine } from '../types/index';
import { getOrigines, getOrigineById, createOrigine as createOrigineApi, updateOrigine as updateOrigineApi, deleteOrigine as deleteOrigineApi } from '../services/origineService';

interface OrigineContextType {
  origines: Origine[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  searchTerm: string;
  fetchOrigines: (params?: {
    page?: number;
    per_page?: number;
    search?: string;
    sort_by?: keyof Origine;
    sort_order?: 'asc' | 'desc';
  }) => Promise<void>;
  getOrigine: (id: number) => Promise<Origine>;
  createOrigine: (data: Omit<Origine, 'idOrigine'>) => Promise<Origine>;
  updateOrigine: (id: number, data: Partial<Omit<Origine, 'idOrigine'>>) => Promise<Origine>;
  deleteOrigine: (id: number) => Promise<void>;
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (count: number) => void;
  setSearchTerm: (term: string) => void;
}

const OrigineContext = createContext<OrigineContextType | undefined>(undefined);

export const OrigineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [origines, setOrigines] = useState<Origine[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(15);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const fetchOriginesList = useCallback(async (params: {
    page?: number;
    per_page?: number;
    search?: string;
    sort_by?: keyof Origine;
    sort_order?: 'asc' | 'desc';
  } = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getOrigines({
        page: params.page || currentPage,
        per_page: params.per_page || itemsPerPage,
        search: params.search !== undefined ? params.search : searchTerm,
        sort_by: params.sort_by,
        sort_order: params.sort_order,
      });
      
      setOrigines(response.data);
      setTotalItems(response.pagination?.total || response.data.length);
      
      if (params.page !== undefined) setCurrentPage(params.page);
      if (params.per_page !== undefined) setItemsPerPage(params.per_page);
      if (params.search !== undefined) setSearchTerm(params.search);
      
      // Pas de valeur de retour (signature Promise<void>)
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erreur lors du chargement des origines';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, searchTerm]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOriginesList();
    }, 300);
    
    return () => clearTimeout(timer);
  }, [fetchOriginesList]);

  const getOrigine = async (id: number): Promise<Origine> => {
    try {
      setLoading(true);
      const response = await getOrigineById(id);
      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || `Erreur lors de la récupération de l'origine ${id}`;
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const createOrigine = async (data: Omit<Origine, 'idOrigine'>): Promise<Origine> => {
    try {
      setLoading(true);
      const response = await createOrigineApi(data);
      await fetchOriginesList();
      return response.data.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Erreur lors de la création de l'origine";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateOrigine = async (id: number, data: Partial<Omit<Origine, 'idOrigine'>>): Promise<Origine> => {
    try {
      setLoading(true);
      const response = await updateOrigineApi(id, data);
      await fetchOriginesList();
      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || `Erreur lors de la mise à jour de l'origine ${id}`;
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteOrigine = async (id: number): Promise<void> => {
    try {
      setLoading(true);
      await deleteOrigineApi(id);
      await fetchOriginesList();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || `Erreur lors de la suppression de l'origine ${id}`;
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <OrigineContext.Provider
      value={{
        origines,
        loading,
        error,
        currentPage,
        itemsPerPage,
        totalItems,
        searchTerm,
        fetchOrigines: fetchOriginesList,
        getOrigine,
        createOrigine,
        updateOrigine,
        deleteOrigine,
        setCurrentPage,
        setItemsPerPage,
        setSearchTerm,
      }}
    >
      {children}
    </OrigineContext.Provider>
  );
};

export const useOrigines = (): OrigineContextType => {
  const context = useContext(OrigineContext);
  if (context === undefined) {
    throw new Error("useOrigines doit être utilisé à l'intérieur d'un OrigineProvider");
  }
  return context;
};

export default OrigineContext;

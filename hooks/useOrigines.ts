import { useCallback } from 'react';
import { useOrigines as useOriginesContext } from '../context/OrigineContext';
import { Origine } from '../types/index';

/**
 * Hook personnalisé pour gérer les opérations liées aux origines
 */
const useOrigines = () => {
  const context = useOriginesContext();

  /**
   * Crée une nouvelle origine avec gestion d'erreur
   */
  const createOrigine = useCallback(async (data: Omit<Origine, 'idOrigine'>) => {
    try {
      const newOrigine = await context.createOrigine(data);
      return { success: true, data: newOrigine };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Une erreur est survenue lors de la création de l\'origine',
        errors: error.response?.data?.errors
      };
    }
  }, [context]);

  /**
   * Met à jour une origine existante avec gestion d'erreur
   */
  const updateOrigine = useCallback(async (id: number, data: Partial<Omit<Origine, 'idOrigine'>>) => {
    try {
      const updatedOrigine = await context.updateOrigine(id, data);
      return { success: true, data: updatedOrigine };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || `Une erreur est survenue lors de la mise à jour de l'origine ${id}`,
        errors: error.response?.data?.errors
      };
    }
  }, [context]);

  /**
   * Supprime une origine avec gestion d'erreur
   */
  const removeOrigine = useCallback(async (id: number) => {
    try {
      await context.deleteOrigine(id);
      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || `Une erreur est survenue lors de la suppression de l'origine ${id}`
      };
    }
  }, [context]);

  return {
    // État
    origines: context.origines,
    loading: context.loading,
    error: context.error,
    pagination: {
      currentPage: context.currentPage,
      itemsPerPage: context.itemsPerPage,
      totalItems: context.totalItems,
      searchTerm: context.searchTerm,
    },
    
    // Actions
    fetchOrigines: context.fetchOrigines,
    getOrigine: context.getOrigine,
    createOrigine,
    updateOrigine,
    deleteOrigine: removeOrigine,
    
    // Setters
    setCurrentPage: context.setCurrentPage,
    setItemsPerPage: context.setItemsPerPage,
    setSearchTerm: context.setSearchTerm,
  };
};

export default useOrigines;

import { useCallback } from 'react';
import { useArmateurs as useArmateursContext } from '../context/ArmateurContext';
import { Armateur } from '../services/armateurService';

/**
 * Hook personnalisé pour gérer les opérations liées aux armateurs
 */
const useArmateurs = () => {
  const context = useArmateursContext();

  /**
   * Crée un nouvel armateur avec gestion d'erreur
   */
  const createArmateur = useCallback(async (data: Omit<Armateur, 'IdArmat'>) => {
    try {
      const newArmateur = await context.createArmateur(data);
      return { success: true, data: newArmateur };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Une erreur est survenue lors de la création de l\'armateur',
        errors: error.response?.data?.errors
      };
    }
  }, [context]);

  /**
   * Met à jour un armateur existant avec gestion d'erreur
   */
  const updateArmateur = useCallback(async (id: number, data: Partial<Omit<Armateur, 'IdArmat'>>) => {
    try {
      const updatedArmateur = await context.updateArmateur(id, data);
      return { success: true, data: updatedArmateur };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || `Une erreur est survenue lors de la mise à jour de l'armateur ${id}`,
        errors: error.response?.data?.errors
      };
    }
  }, [context]);

  /**
   * Supprime un armateur avec gestion d'erreur
   */
  const removeArmateur = useCallback(async (id: number) => {
    try {
      await context.deleteArmateur(id);
      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || `Une erreur est survenue lors de la suppression de l'armateur ${id}`
      };
    }
  }, [context]);

  return {
    // État
    armateurs: context.armateurs,
    loading: context.loading,
    error: context.error,
    pagination: {
      currentPage: context.currentPage,
      itemsPerPage: context.itemsPerPage,
      totalItems: context.totalItems,
      searchTerm: context.searchTerm,
      sortConfig: context.sortConfig,
    },
    
    // Actions
    fetchArmateurs: context.fetchArmateurs,
    getArmateur: context.getArmateur,
    createArmateur,
    updateArmateur,
    deleteArmateur: removeArmateur,
    getStats: context.getStats,
    
    // Setters
    setCurrentPage: context.setCurrentPage,
    setItemsPerPage: context.setItemsPerPage,
    setSearchTerm: context.setSearchTerm,
    setSortConfig: context.setSortConfig,
  };
};

export default useArmateurs;

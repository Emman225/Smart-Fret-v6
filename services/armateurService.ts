import axios from '../lib/axios';
import { getAuthHeader } from '../utils/auth';

export interface Armateur {
  IdArmat: number;
  NomArmat: string;
  ContactArmat: string;
  EmailArmat: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
    from: number;
    to: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  errors?: Record<string, string[]>;
}

export interface ArmateurStats {
  id: number;
  raison_sociale: string;
  nombre_dossiers: number;
}

const API_BASE_URL = '/armateurs';

/**
 * Récupère la liste paginée des armateurs
 */
export const getArmateurs = async (params?: {
  search?: string;
  page?: number;
  per_page?: number;
  sort_by?: keyof Armateur;
  sort_order?: 'asc' | 'desc';
}): Promise<PaginatedResponse<Armateur>> => {
  try {
    console.log('Envoi de la requête à:', API_BASE_URL);
    console.log('Avec les paramètres:', params);
    
    const response = await axios.get(API_BASE_URL, {
      params,
      headers: getAuthHeader(),
    });
    
    console.log('Réponse reçue:', response);
    
    if (!response.data) {
      throw new Error('Aucune donnée reçue de l\'API');
    }
    
    return response.data;
  } catch (error: any) {
    console.error('Erreur détaillée lors de la récupération des armateurs:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      url: error.config?.url,
      params: error.config?.params,
    });
    
    let errorMessage = 'Erreur lors de la récupération des armateurs';
    
    if (error.response) {
      // Erreur avec réponse du serveur
      if (error.response.status === 404) {
        errorMessage = 'La ressource demandée est introuvable';
      } else if (error.response.status === 401) {
        errorMessage = 'Non autorisé. Veuillez vous reconnecter.';
      } else if (error.response.data?.message) {
        errorMessage = error.response.data.message;
      }
    } else if (error.request) {
      // La requête a été faite mais aucune réponse n'a été reçue
      errorMessage = 'Pas de réponse du serveur. Vérifiez votre connexion internet.';
    }
    
    const errorWithMessage = new Error(errorMessage);
    (errorWithMessage as any).response = error.response;
    throw errorWithMessage;
  }
};

/**
 * Récupère un armateur par son ID
 */
export const getArmateurById = async (id: number): Promise<Armateur> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${id}`, {
      headers: getAuthHeader(),
    });
    return response.data.data;
  } catch (error) {
    console.error(`Erreur lors de la récupération de l'armateur ${id}:`, error);
    throw error;
  }
};

/**
 * Crée un nouvel armateur
 */
export const createArmateur = async (
  data: Omit<Armateur, 'IdArmat'>,
): Promise<Armateur> => {
  try {
    const response = await axios.post(API_BASE_URL, data, {
      headers: getAuthHeader(),
    });
    return response.data.data;
  } catch (error) {
    console.error("Erreur lors de la création de l'armateur:", error);
    throw error;
  }
};

/**
 * Met à jour un armateur existant
 */
export const updateArmateur = async (
  id: number,
  data: Partial<Omit<Armateur, 'IdArmat'>>,
): Promise<Armateur> => {
  try {
    const response = await axios.put(`${API_BASE_URL}/${id}`, data, {
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json',
      },
    });
    return response.data.data;
  } catch (error) {
    console.error(`Erreur lors de la mise à jour de l'armateur ${id}:`, error);
    throw error;
  }
};

/**
 * Supprime un armateur
 */
export const deleteArmateur = async (id: number): Promise<void> => {
  try {
    await axios.delete(`${API_BASE_URL}/${id}`, {
      headers: getAuthHeader(),
    });
  } catch (error) {
    console.error(`Erreur lors de la suppression de l'armateur ${id}:`, error);
    throw error;
  }
};

/**
 * Récupère les statistiques des armateurs
 */
export const getArmateursStats = async (): Promise<ArmateurStats[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/statistiques`, {
      headers: getAuthHeader(),
    });
    return response.data.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    throw error;
  }
};

export default {
  getArmateurs,
  getArmateurById,
  createArmateur,
  updateArmateur,
  deleteArmateur,
  getArmateursStats,
};

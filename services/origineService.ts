import { Origine, ApiResponse, AxiosApiResponse } from '../types/index';
import axios from '../lib/axios';
import { getAuthHeader } from '../utils/auth';

const API_BASE_URL = '/origines';

const normalizeOrigine = (item: any): Origine => {
  const rawId = item?.idOrigine ?? item?.IdOrigine ?? item?.id ?? item?.Id;
  const parsedId = rawId !== undefined && rawId !== null ? Number(rawId) : undefined;

  return {
    idOrigine: typeof parsedId === 'number' && !isNaN(parsedId) ? parsedId : 0,
    nomPays: item?.nomPays ?? item?.NomPays ?? item?.name ?? '',
  };
};

interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export const getOrigines = async (params?: {
  search?: string;
  page?: number;
  per_page?: number;
  sort_by?: keyof Origine;
  sort_order?: 'asc' | 'desc';
  with?: string;
}) => {
  try {
    const response = await axios.get(API_BASE_URL, {
      params,
      headers: getAuthHeader(),
    });
    
    // Si la réponse est un tableau, on le transforme en format paginé
    if (Array.isArray(response.data)) {
      const normalizedData = response.data
        .map(normalizeOrigine)
        .filter((item: Origine) => Boolean(item.nomPays));
      return {
        success: true,
        data: normalizedData,
        pagination: {
          total: response.data.length,
          per_page: params?.per_page || response.data.length,
          current_page: params?.page || 1,
          last_page: 1
        }
      };
    }
    
    // Si la réponse contient déjà des données paginées, on la retourne telle quelle
    if (response.data.data && Array.isArray(response.data.data)) {
      const normalizedData = response.data.data
        .map(normalizeOrigine)
        .filter((item: Origine) => Boolean(item.nomPays));
      return {
        success: true,
        data: normalizedData,
        pagination: response.data.pagination || {
          total: response.data.data.length,
          per_page: params?.per_page || response.data.data.length,
          current_page: params?.page || 1,
          last_page: 1
        }
      };
    }
    
    // Format par défaut si la réponse ne correspond à aucun format attendu
    return {
      success: true,
      data: [],
      pagination: {
        total: 0,
        per_page: params?.per_page || 10,
        current_page: params?.page || 1,
        last_page: 1
      }
    };
  } catch (error: any) {
    console.error('Erreur lors de la récupération des origines:', error);
    throw error;
  }
};

export const getOrigineById = async (id: number): Promise<Origine> => {
  try {
    const response = await axios.get<ApiResponse<Origine>>(`${API_BASE_URL}/${id}`, {
      headers: getAuthHeader(),
    });
    
    if (!response.data.data) {
      throw new Error('Format de réponse inattendu du serveur');
    }
    
    return response.data.data;
  } catch (error) {
    console.error(`Erreur lors de la récupération de l'origine ${id}:`, error);
    throw error;
  }
};

export const createOrigine = async (data: Omit<Origine, 'idOrigine'>): Promise<AxiosApiResponse<Origine>> => {
  try {
    // Normalisation des données pour l'API (utilise NomPays au lieu de nomPays)
    const apiData = {
      NomPays: data.nomPays
    };
    console.log('Envoi de la requête de création d\'origine:', apiData);
    const response = await axios.post<ApiResponse<Origine>>(API_BASE_URL, apiData, {
      headers: getAuthHeader(),
    });
    
    console.log('Réponse brute de l\'API (createOrigine):', response);
    
    // Retourner la réponse complète pour un meilleur débogage
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      config: response.config,
      request: response.request
    };
  } catch (error: any) {
    console.error('Erreur lors de la création de l\'origine:', error);
    if (error.response) {
      console.error('Détails de l\'erreur:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
    }
    throw error;
  }
};

export const updateOrigine = async (id: number, data: Partial<Omit<Origine, 'idOrigine'>>): Promise<Origine> => {
  try {
    // Normalisation des données pour l'API (utilise NomPays au lieu de nomPays)
    const apiData = {
      NomPays: data.nomPays
    };
    const response = await axios.put(`${API_BASE_URL}/${id}`, apiData, {
      headers: getAuthHeader(),
    });
    const rawData = response.data.data;
    return {
      idOrigine: rawData.IdOrigine || rawData.idOrigine,
      nomPays: rawData.NomPays || rawData.nomPays
    };
  } catch (error) {
    console.error(`Erreur lors de la mise à jour de l'origine ${id}:`, error);
    throw error;
  }
};

export const deleteOrigine = async (id: number) => {
  try {
    await axios.delete(`${API_BASE_URL}/${id}`, {
      headers: getAuthHeader(),
    });
  } catch (error) {
    console.error(`Erreur lors de la suppression de l'origine ${id}:`, error);
    throw error;
  }
};

export default {
  getOrigines,
  getOrigineById,
  createOrigine,
  updateOrigine,
  deleteOrigine,
};

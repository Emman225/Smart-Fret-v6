export interface Origine {
  idOrigine: number;
  nomPays: string;
}

export interface PaginationData {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  from: number;
  to: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: PaginationData;
  errors?: Record<string, string[]>;
}

// Interface pour la réponse complète d'Axios
export interface AxiosApiResponse<T = any> {
  data: ApiResponse<T>;
  status: number;
  statusText: string;
  headers: any;
  config: any;
  request?: any;
}

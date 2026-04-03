import api from './ApiClient';

export interface Burial {
  id: number;
  cemetery_id: number | null;
  galsc?: string;
  burial_number?: string;
  deceased_name: string;
  date_of_birth?: string;
  date_of_death?: string;
  burial_date: string;
  quadra?: string;
  plot_number?: string;
  sector?: string;
  burial_type: 'INUMAÇÃO' | 'TUMULAÇÃO(GAVETA)' | 'EXUMAÇÃO' | 'TRANSLADAÇÃO' | 'CREMAÇÃO' | 'REINUMAÇÃO' | 'OSSÁRIO';
  current_status: 'Sepultado' | 'Exumado' | 'Transladado' | 'Cremado';
  responsible_name?: string;
  responsible_phone?: string;
  notes?: string;
  regularization_period_years?: number;
  next_regularization_date?: string;
  last_regularization_date?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface PendingResponse {
  message: string;
  pending: object;
  status: 'pendente';
}

export type CreateBurialDTO = Omit<Burial, 'id' | 'created_at' | 'updated_at'>;
export type UpdateBurialDTO = Partial<CreateBurialDTO>;

export const getBurials = async (params?: {
  cemetery_id?: number;
  deceased_name?: string;
  burial_type?: string;
  current_status?: string;
  per_page?: number;
  page?: number;
}): Promise<PaginatedResponse<Burial>> => {
  const res = await api.get('/api/burials', { params });
  return res.data;
};

export const getBurialById = async (id: number): Promise<Burial> => {
  const res = await api.get(`/api/burials/${id}`);
  return res.data;
};

export const createBurial = async (data: CreateBurialDTO): Promise<Burial | PendingResponse> => {
  const res = await api.post('/api/burials', data);
  return res.data;
};

export const updateBurial = async (id: number, data: UpdateBurialDTO): Promise<Burial | PendingResponse> => {
  const res = await api.put(`/api/burials/${id}`, data);
  return res.data;
};

export const deleteBurial = async (id: number): Promise<void | PendingResponse> => {
  const res = await api.delete(`/api/burials/${id}`);
  return res.data;
};

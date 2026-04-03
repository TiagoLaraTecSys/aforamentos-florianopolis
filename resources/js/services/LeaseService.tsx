import api from './ApiClient';
import { PaginatedResponse, PendingResponse } from './BurialService';

export interface Lease {
  id: number;
  cemetery_id: number | null;
  leaseholder_name: string;
  quadra?: string;
  plot_number?: string;
  sector?: string;
  lease_type: 'Perpétuo' | 'Temporário';
  start_date: string;
  expiry_date?: string;
  status: 'Ativo' | 'Vencido' | 'Renovado';
  amount: number;
  responsible_name?: string;
  responsible_phone?: string;
  notes?: string;
  regularization_period_years?: number;
  next_regularization_date?: string;
  last_regularization_date?: string;
  created_at?: string;
  updated_at?: string;
}

export type CreateLeaseDTO = Omit<Lease, 'id' | 'created_at' | 'updated_at'>;
export type UpdateLeaseDTO = Partial<CreateLeaseDTO>;

export const getLeases = async (params?: {
  cemetery_id?: number;
  leaseholder_name?: string;
  lease_type?: string;
  status?: string;
  per_page?: number;
  page?: number;
}): Promise<PaginatedResponse<Lease>> => {
  const res = await api.get('/api/leases', { params });
  return res.data;
};

export const getLeaseById = async (id: number): Promise<Lease> => {
  const res = await api.get(`/api/leases/${id}`);
  return res.data;
};

export const createLease = async (data: CreateLeaseDTO): Promise<Lease | PendingResponse> => {
  const res = await api.post('/api/leases', data);
  return res.data;
};

export const updateLease = async (id: number, data: UpdateLeaseDTO): Promise<Lease | PendingResponse> => {
  const res = await api.put(`/api/leases/${id}`, data);
  return res.data;
};

export const deleteLease = async (id: number): Promise<void | PendingResponse> => {
  const res = await api.delete(`/api/leases/${id}`);
  return res.data;
};

import api from './ApiClient';
import { PaginatedResponse } from './BurialService';

export interface PendingOperation {
  id: number;
  entity_type: string;
  entity_id: number | null;
  operation_type: 'create' | 'update' | 'delete';
  payload: Record<string, unknown>;
  status: 'pendente' | 'aprovado' | 'rejeitado';
  requested_by: number;
  reviewed_by: number | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  requester?: { id: number; name: string; email: string };
  reviewer?: { id: number; name: string; email: string } | null;
  created_at: string;
  updated_at: string;
}

export const getPendingOperations = async (params?: {
  status?: string;
  entity_type?: string;
  per_page?: number;
  page?: number;
}): Promise<PaginatedResponse<PendingOperation>> => {
  const res = await api.get('/api/pending-operations', { params });
  return res.data;
};

export const approvePendingOperation = async (
  id: number
): Promise<{ message: string; result: unknown; operation: PendingOperation }> => {
  const res = await api.post(`/api/pending-operations/${id}/approve`);
  return res.data;
};

export const rejectPendingOperation = async (
  id: number,
  rejectionReason?: string
): Promise<{ message: string; operation: PendingOperation }> => {
  const res = await api.post(`/api/pending-operations/${id}/reject`, {
    rejection_reason: rejectionReason,
  });
  return res.data;
};

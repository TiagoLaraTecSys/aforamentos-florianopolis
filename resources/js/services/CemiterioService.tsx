import api from './ApiClient';

// 🔹 Tipagem alinhada com backend
export interface Cemiterio {
  id: number;
  name: string;
  location: string;
  address: string;
  totalPlots: number;
  occupiedPlots: number;
  totalQuadras: number;
  plotsPerQuadra: number;
  cemeteryType: string;
  yearEstablished: number;
  areaSize: number;
  hasOssuary: boolean;
  hasColumbarium: boolean;
  responsibleName: string;
  responsiblePhone: string;
  email: string;
  openingHours: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

// 🔹 DTOs (boa prática)
export type CreateCemiterioDTO = Omit<Cemiterio, 'id' | 'created_at' | 'updated_at'>;
export type UpdateCemiterioDTO = Partial<CreateCemiterioDTO>;


// =========================
// 📌 GET ALL
// =========================
export const getCemiterios = async (): Promise<Cemiterio[]> => {
  const res = await api.get('/api/cemiterios');
  return res.data;
};


// =========================
// 📌 GET BY ID
// =========================
export const getCemiterioById = async (id: number): Promise<Cemiterio> => {
  const res = await api.get(`/api/cemiterios/${id}`);
  return res.data;
};


// =========================
// 📌 CREATE
// =========================
export const createCemiterio = async (data: CreateCemiterioDTO): Promise<Cemiterio> => {
  const res = await api.post('/api/cemiterios', data);
  return res.data;
};


// =========================
// 📌 UPDATE
// =========================
export const updateCemiterio = async (
  id: number,
  data: UpdateCemiterioDTO
): Promise<Cemiterio> => {
  const res = await api.put(`/api/cemiterios/${id}`, data);
  return res.data;
};


// =========================
// 📌 DELETE
// =========================
export const deleteCemiterio = async (id: number): Promise<void> => {
  await api.delete(`/api/cemiterios/${id}`);
};

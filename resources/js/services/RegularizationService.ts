import axios from 'axios';

export interface RegularizationItem {
  id: string;
  type: 'burial' | 'lease';
  itemId: number;
  title: string;
  description: string;
  urgency: 'high' | 'medium' | 'low';
  daysUntilNext: number;
  nextRegularizationDate: string;
  yearsElapsed: number;
  cemeteryName: string;
  location: string;
  responsibleName: string;
  responsiblePhone: string;
  item: Record<string, unknown>;
}

interface ApiItem {
  id: string;
  type: 'burial' | 'lease';
  item_id: number;
  title: string;
  description: string;
  urgency: 'high' | 'medium' | 'low';
  days_until_next: number;
  next_regularization_date: string;
  years_elapsed: number;
  cemetery_name: string;
  location: string;
  responsible_name: string;
  responsible_phone: string;
  item: Record<string, unknown>;
}

export async function getRegularizationsCount(cemeteryId?: number): Promise<number> {
  const params: Record<string, unknown> = {};
  if (cemeteryId) params.cemetery_id = cemeteryId;
  const { data } = await axios.get<{ count: number }>('/api/regularizations/count', { params });
  return data.count;
}

export async function getRegularizations(cemeteryId?: number): Promise<RegularizationItem[]> {
  const params: Record<string, unknown> = {};
  if (cemeteryId) params.cemetery_id = cemeteryId;
  const { data } = await axios.get<{ data: ApiItem[] }>('/api/regularizations', { params });
  return data.data.map((r) => ({
    id: r.id,
    type: r.type,
    itemId: r.item_id,
    title: r.title,
    description: r.description,
    urgency: r.urgency,
    daysUntilNext: r.days_until_next,
    nextRegularizationDate: r.next_regularization_date,
    yearsElapsed: r.years_elapsed,
    cemeteryName: r.cemetery_name,
    location: r.location,
    responsibleName: r.responsible_name,
    responsiblePhone: r.responsible_phone,
    item: r.item,
  }));
}

import api from './ApiClient';

export const getCemiterios = async () => {
  const res = await api.get('/api/cemiterios');
  return res.data;
};

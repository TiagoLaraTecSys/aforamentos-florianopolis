import axios from 'axios';

const API = 'http://localhost:8000';

axios.defaults.withCredentials = true;

export const loginRequest = async (email: string, password: string) => {
  // 🔐 pega CSRF automaticamente
  await axios.get(`/sanctum/csrf-cookie`);

  // 🔥 login
  const res = await axios.post(`/login`, {
    email,
    password
  });

  return res.data;
};

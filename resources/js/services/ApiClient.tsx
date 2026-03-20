import axios from 'axios';

export const api = axios.create({
    withCredentials: true,
    headers: {
        'X-Requested-With' : 'XMLHttpRequest'
    }
});

export default api;

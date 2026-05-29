import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://monitoring.joclass.com/api/v1';
const API_URL = BASE_URL.replace(/\/$/, '');

const login = (email, password) => {
  const params = new URLSearchParams();
  params.append('username', email);
  params.append('password', password);

  return axios.post(`${API_URL}/token`, params, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
};

const authService = {
  login,
};

export default authService;

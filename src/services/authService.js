import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

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

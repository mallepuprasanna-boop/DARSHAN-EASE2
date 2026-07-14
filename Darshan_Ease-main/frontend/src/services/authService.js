import API from './api';

export const login = async (email, password) => {
  const { data } = await API.post('/auth/login', { email, password });
  return data;
};

export const register = async (userData) => {
  const { data } = await API.post('/auth/register', userData);
  return data;
};

export const logout = () => {
  localStorage.removeItem('userInfo');
};

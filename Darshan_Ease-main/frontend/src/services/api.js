import axios from 'axios';

const API = axios.create({
  baseURL: 'http://127.0.0.1:5000/api',
});

// Add a request interceptor to include the auth token
API.interceptors.request.use((req) => {
  const userInfo = localStorage.getItem('userInfo');
  if (userInfo) {
    req.headers.Authorization = `Bearer ${JSON.parse(userInfo).token}`;
  }
  return req;
});

export default API;

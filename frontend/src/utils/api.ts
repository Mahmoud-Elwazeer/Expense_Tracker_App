import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';

const API_BASE_URL = 'https://api.elwazeer.tech/api/v1';

// const API_BASE_URL = 'http://localhost:8000/api/v1';


const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor to attach the auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('authToken');
    console.log('Token:', token);
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = 
      error.response?.data?.detail || 
      error.response?.data?.message || 
      error.response?.data?.non_field_errors?.[0] ||
      'An unexpected error occurred';
    
    toast.error(message);
    
    // Handle authentication errors
    if (error.response?.status === 401) {
      Cookies.remove('authToken');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;
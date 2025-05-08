import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';

// const API_BASE_URL = 'https://api.elwazeer.tech/api/v1';
const API_BASE_URL = 'http://localhost:8000/api/v1';

// For debugging authentication issues
const DEBUG_AUTH = true;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 second timeout
});

// Request interceptor to attach the auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('authToken');
    
    if (token) {
      // Verify token format expected by your backend (Token vs Bearer)
      config.headers.Authorization = `Bearer ${token}`;
      
      if (DEBUG_AUTH) {
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
        console.log('Token present: Yes (first 10 chars):', token.substring(0, 10) + '...');
      }
    } else {
      if (DEBUG_AUTH) {
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
        console.log('Token present: No');
      }
    }
    return config;
  },
  (error) => {
    console.error('Request configuration error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    // Log successful responses for debugging authentication
    if (DEBUG_AUTH && (
      response.config.url?.includes('/auth/login') ||
      response.config.url?.includes('/auth/register')
    )) {
      console.log('Auth API Success:', response.status, response.config.url);
    }
    return response;
  },
  (error) => {
    // Enhanced error handling with detailed logging
    let message = 'An unexpected error occurred';
    
    if (error.response) {
      if (DEBUG_AUTH) {
        console.error('API Error Response:', {
          status: error.response.status,
          url: error.config?.url,
          data: error.response.data
        });
      }
      
      // Extract error message
      message = 
        error.response?.data?.detail || 
        error.response?.data?.message || 
        error.response?.data?.non_field_errors?.[0] ||
        `Error ${error.response.status}: ${error.response.statusText}`;
        
      // Handle authentication errors
      if (error.response.status === 401) {
        // Only show auth errors when not on auth pages
        const isAuthRoute = window.location.pathname.includes('/login') || 
                           window.location.pathname.includes('/register');
        
        if (!isAuthRoute) {
          toast.error('Your session has expired. Please login again.');
        }
        
        console.log('401 Unauthorized - clearing token');
        Cookies.remove('authToken');
        
        // Avoid redirect loops by checking if we're not already on the login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      } else {
        // For non-auth errors, show toast
        toast.error(message);
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('No response received:', error.request);
      message = 'No response from server. Please check your connection.';
      toast.error(message);
    } else {
      // Error in setting up the request
      console.error('Request setup error:', error.message);
      toast.error('Error setting up request');
    }
    
    return Promise.reject(error);
  }
);

export default api;
import axios from 'axios';

declare module 'axios' {
  export interface AxiosRequestConfig {
    skipAuth?: boolean;
  }
  export interface InternalAxiosRequestConfig {
    skipAuth?: boolean;
  }
}

const api = axios.create({
  baseURL: 'http://localhost:3030'
});

api.interceptors.request.use(
  (config) => {
    if (config.skipAuth) {
      return config;
    }

    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
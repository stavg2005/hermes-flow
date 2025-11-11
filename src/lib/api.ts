import type { AxiosError, AxiosResponse } from 'axios';
import axios from 'axios';

export interface ApiErrorResponse {
  message: string;
  status: string;
  error?: string;
  details?: unknown;
}

const api = axios.create({
  baseURL: 'http://localhost:5000',
  timeout: 10000,
});

api.interceptors.request.use(
  config => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log('API Response:', response.status, response.data);
    return response;
  },
  (error: AxiosError) => {
    return Promise.reject({
      message: error.message,
      status: error.response?.status || 500,
      error: error.response?.data || {},
    });
  }
);
export default api;

import axios from 'axios';
import { config } from '../config';

export const api = axios.create({
  baseURL: config.apiUrl,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Error en la llamada a la API:', error);
    return Promise.reject(error);
  }
); 
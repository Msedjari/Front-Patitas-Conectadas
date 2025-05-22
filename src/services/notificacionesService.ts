import axios from 'axios';
import { config } from '../config';

export interface Notificacion {
  id: number;
  fecha: string;
}

export const notificacionesService = {
  obtenerTodas: async (): Promise<Notificacion[]> => {
    const res = await axios.get(`${config.apiUrl}/notificaciones`);
    return res.data;
  },
  obtenerPorId: async (id: number): Promise<Notificacion> => {
    const res = await axios.get(`${config.apiUrl}/notificaciones/${id}`);
    return res.data;
  },
  crear: async (fecha: string): Promise<Notificacion> => {
    const res = await axios.post(`${config.apiUrl}/notificaciones`, { fecha });
    return res.data;
  },
  actualizar: async (id: number, fecha: string): Promise<Notificacion> => {
    const res = await axios.put(`${config.apiUrl}/notificaciones/${id}`, { fecha });
    return res.data;
  },
  eliminar: async (id: number): Promise<{ mensaje: string }> => {
    const res = await axios.delete(`${config.apiUrl}/notificaciones/${id}`);
    return res.data;
  }
}; 
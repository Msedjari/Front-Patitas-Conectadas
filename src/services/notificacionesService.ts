import axios from 'axios';
import { config } from '../config';

export interface Notificacion {
  id: number;
  tipo: 'mensaje' | 'evento' | 'seguidor';
  mensaje: string;
  fecha: string;
  leida: boolean;
  datos?: {
    emisorId?: number;
    emisorNombre?: string;
    contenido?: string;
    eventoId?: number;
    seguidorId?: number;
  };
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
  },
  marcarComoLeida: async (id: number): Promise<Notificacion> => {
    const res = await axios.put(`${config.apiUrl}/notificaciones/${id}/leer`);
    return res.data;
  },
  marcarTodasComoLeidas: async (): Promise<{ mensaje: string }> => {
    const res = await axios.put(`${config.apiUrl}/notificaciones/leer-todas`);
    return res.data;
  },
  obtenerNoLeidas: async (): Promise<number> => {
    const res = await axios.get(`${config.apiUrl}/notificaciones/no-leidas`);
    return res.data.count;
  }
}; 
import { api } from './api';

export interface Mensaje {
  id: number;
  emisorId: number;
  receptorId: number;
  visto: boolean;
  contenido: string;
  fechaHora: string;
  createdAt: string;
  updatedAt: string;
}

export const chatService = {
  enviarMensaje: async (emisorId: number, receptorId: number, contenido: string): Promise<Mensaje> => {
    const response = await api.post('/chat/enviar', {
      emisorId,
      receptorId,
      contenido
    });
    return response.data;
  },

  obtenerConversacion: async (usuario1Id: number, usuario2Id: number): Promise<Mensaje[]> => {
    const response = await api.get(`/chat/conversacion/${usuario1Id}/${usuario2Id}`);
    return response.data;
  },

  marcarVistos: async (usuarioId: number, otroUsuarioId: number): Promise<{ message: string }> => {
    const response = await api.put(`/chat/marcar-vistos/${usuarioId}/${otroUsuarioId}`);
    return response.data;
  },

  obtenerNoVistos: async (usuarioId: number): Promise<Mensaje[]> => {
    const response = await api.get(`/chat/no-vistos/${usuarioId}`);
    return response.data;
  },

  obtenerEnviados: async (usuarioId: number): Promise<Mensaje[]> => {
    const response = await api.get(`/chat/enviados/${usuarioId}`);
    return response.data;
  },

  obtenerRecibidos: async (usuarioId: number): Promise<Mensaje[]> => {
    const response = await api.get(`/chat/recibidos/${usuarioId}`);
    return response.data;
  },

  eliminarConversacion: async (usuario1Id: number, usuario2Id: number): Promise<{ message: string }> => {
    const response = await api.delete(`/chat/eliminar/${usuario1Id}/${usuario2Id}`);
    return response.data;
  }
}; 
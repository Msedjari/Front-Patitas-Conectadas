import { config } from '../config';
import { Evento } from './eventosService';

export interface UsuarioEvento {
  id: number;
  usuarioId: number;
  eventoId: number;
  rol: 'CREADOR' | 'ASISTENTE';
  nombreUsuario?: string;
  apellidoUsuario?: string;
  nombre?: string;
  descripcion?: string;
  ubicacion?: string;
  fecha?: string;
}

export const usuarioEventoService = {
  // Obtener todos los eventos de un usuario
  getEventosByUsuario: async (usuarioId: number): Promise<Evento[]> => {
    try {
      const token = localStorage.getItem(config.session.tokenKey);
      if (!token) throw new Error('No hay token de autenticación');

      const response = await fetch(`${config.apiUrl}/usuario-evento/usuario/${usuarioId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Error al obtener eventos del usuario: ${response.statusText}`);
      }

      const eventos = await response.json();
      return eventos.map((evento: UsuarioEvento) => ({
        id: evento.eventoId,
        nombre: evento.nombre || '',
        descripcion: evento.descripcion || '',
        ubicacion: evento.ubicacion || '',
        fecha: evento.fecha || '',
        creadorId: evento.rol === 'CREADOR' ? evento.usuarioId : undefined,
        rol: evento.rol,
        nombreUsuario: evento.nombreUsuario,
        apellidoUsuario: evento.apellidoUsuario
      }));
    } catch (error) {
      console.error('Error en getEventosByUsuario:', error);
      throw error;
    }
  },

  // Unirse a un evento como asistente
  unirseAEvento: async (usuarioId: number, eventoId: number): Promise<UsuarioEvento> => {
    try {
      const token = localStorage.getItem(config.session.tokenKey);
      if (!token) throw new Error('No hay token de autenticación');

      const response = await fetch(`${config.apiUrl}/usuario-evento`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          usuarioId,
          eventoId,
          rol: 'ASISTENTE'
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error al unirse al evento: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error en unirseAEvento:', error);
      throw error;
    }
  },

  // Abandonar un evento
  abandonarEvento: async (usuarioId: number, eventoId: number): Promise<void> => {
    try {
      const token = localStorage.getItem(config.session.tokenKey);
      if (!token) throw new Error('No hay token de autenticación');

      const response = await fetch(`${config.apiUrl}/usuario-evento/usuario/${usuarioId}/evento/${eventoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Error al abandonar el evento: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error en abandonarEvento:', error);
      throw error;
    }
  },

  // Obtener participantes de un evento
  getParticipantesEvento: async (eventoId: number): Promise<UsuarioEvento[]> => {
    try {
      const token = localStorage.getItem(config.session.tokenKey);
      if (!token) throw new Error('No hay token de autenticación');

      const response = await fetch(`${config.apiUrl}/usuario-evento/evento/${eventoId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Error al obtener participantes del evento: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error en getParticipantesEvento:', error);
      throw error;
    }
  },

  // Obtener todas las relaciones usuario-evento
  getAllUsuarioEventos: async (): Promise<UsuarioEvento[]> => {
    try {
      const token = localStorage.getItem(config.session.tokenKey);
      if (!token) throw new Error('No hay token de autenticación');

      const response = await fetch(`${config.apiUrl}/usuario-evento`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Error al obtener relaciones usuario-evento: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error en getAllUsuarioEventos:', error);
      throw error;
    }
  },

  // Asistir a un evento
  asistirAEvento: async (usuarioId: number, eventoId: number): Promise<UsuarioEvento> => {
    try {
      const token = localStorage.getItem(config.session.tokenKey);
      if (!token) throw new Error('No hay token de autenticación');

      const response = await fetch(`${config.apiUrl}/usuario-evento`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          usuarioId,
          eventoId,
          rol: 'ASISTENTE'
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error al asistir al evento: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error en asistirAEvento:', error);
      throw error;
    }
  },

  // No asistir a un evento
  noAsistirAEvento: async (usuarioId: number, eventoId: number): Promise<void> => {
    try {
      const token = localStorage.getItem(config.session.tokenKey);
      if (!token) throw new Error('No hay token de autenticación');

      const response = await fetch(`${config.apiUrl}/usuario-evento/usuario/${usuarioId}/evento/${eventoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Error al cancelar asistencia al evento: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error en noAsistirAEvento:', error);
      throw error;
    }
  }
}; 
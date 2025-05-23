import { config } from '../config';

export interface Valoracion {
  id: number;
  autorId: number;
  nombreAutor: string;
  apellidoAutor: string;
  receptorId: number;
  nombreReceptor: string;
  apellidoReceptor: string;
  puntuacion: number;
  contenido: string;
  fecha: string;
  createdAt: string;
  updatedAt: string;
}

export const valoracionesService = {
  // Obtener valoraciones recibidas por un usuario
  getValoracionesRecibidas: async (usuarioId: number): Promise<Valoracion[]> => {
    try {
      const token = localStorage.getItem(config.session.tokenKey);
      if (!token) throw new Error('No hay token de autenticación');

      const response = await fetch(`${config.apiUrl}/valoraciones/usuarios/${usuarioId}/recibidas`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Error al obtener valoraciones recibidas: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error en getValoracionesRecibidas:', error);
      throw error;
    }
  },

  // Obtener valoraciones enviadas por un usuario
  getValoracionesEnviadas: async (usuarioId: number): Promise<Valoracion[]> => {
    try {
      const token = localStorage.getItem(config.session.tokenKey);
      if (!token) throw new Error('No hay token de autenticación');

      const response = await fetch(`${config.apiUrl}/valoraciones/usuarios/${usuarioId}/enviadas`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Error al obtener valoraciones enviadas: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error en getValoracionesEnviadas:', error);
      throw error;
    }
  },

  // Crear una valoración
  crearValoracion: async (autorId: number, receptorId: number, puntuacion: number, contenido: string): Promise<Valoracion> => {
    try {
      const token = localStorage.getItem(config.session.tokenKey);
      if (!token) throw new Error('No hay token de autenticación');

      const response = await fetch(`${config.apiUrl}/valoraciones/usuarios/${autorId}/receptor/${receptorId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          puntuacion,
          contenido
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error al crear valoración: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error en crearValoracion:', error);
      throw error;
    }
  },

  // Eliminar una valoración
  eliminarValoracion: async (id: number): Promise<void> => {
    try {
      const token = localStorage.getItem(config.session.tokenKey);
      if (!token) throw new Error('No hay token de autenticación');

      const response = await fetch(`${config.apiUrl}/valoraciones/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Error al eliminar valoración: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error en eliminarValoracion:', error);
      throw error;
    }
  }
}; 
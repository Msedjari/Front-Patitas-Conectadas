import { config } from '../config';
import { User } from './userService'; // Necesitamos la interfaz User

// Interfaz para la relación de seguimiento
export interface Seguido {
  id: number; // ID de la relación de seguimiento en el backend
  usuarioQueSigueId: number;
  usuarioQueEsSeguidoId: number;
}

export const seguidosService = {
  /**
   * Obtiene la lista de IDs de usuarios que sigue un usuario específico.
   * @param usuarioId - ID del usuario del que queremos saber a quién sigue.
   * @returns Promesa que resuelve a un array de objetos Seguido.
   * Se asume que la API devuelve la lista de relaciones.
   */
  obtenerSeguidosIds: async (usuarioId: number): Promise<Seguido[]> => {
    try {
      const token = localStorage.getItem(config.session.tokenKey);
      if (!token) throw new Error('No hay token de autenticación.');

      const response = await fetch(`${config.apiUrl}/usuarios/${usuarioId}/seguidos`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
         const errorText = await response.text();
         throw new Error(`Error al obtener seguidos: ${response.status} - ${errorText || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error en obtenerSeguidosIds:', error);
      throw error;
    }
  },

  /**
   * Crea una relación de seguimiento. Un usuario empieza a seguir a otro.
   * @param usuarioQueSigueId - ID del usuario que inicia el seguimiento.
   * @param usuarioASeguirId - ID del usuario a ser seguido.
   * @returns Promesa que resuelve a la nueva relación Seguido creada.
   */
  seguirUsuario: async (usuarioQueSigueId: number, usuarioASeguirId: number): Promise<Seguido> => {
    try {
      const token = localStorage.getItem(config.session.tokenKey);
      if (!token) throw new Error('No hay token de autenticación.');

      // Usamos el endpoint con DTO en el body, enviando solo usuarioASeguirId
      // El backend usará el ID de la ruta (usuarioQueSigueId) y el del body
      const response = await fetch(`${config.apiUrl}/usuarios/${usuarioQueSigueId}/seguidos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ usuarioQueEsSeguidoId: usuarioASeguirId }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        // Intentar parsear el error si es JSON, si no usar el texto
        let errorMessage = `Error al seguir usuario: ${response.status} - ${errorText || response.statusText}`;
         try {
             const errorJson = JSON.parse(errorText);
             if(errorJson.message) errorMessage = `Error: ${errorJson.message}`;
         } catch {}
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      console.error('Error en seguirUsuario:', error);
      throw error;
    }
  },

  /**
   * Elimina una relación de seguimiento. Un usuario deja de seguir a otro.
   * @param usuarioQueSigueId - ID del usuario que deja de seguir.
   * @param usuarioASeguirId - ID del usuario que deja de ser seguido.
   * @returns Promesa que resuelve cuando la eliminación es exitosa.
   */
  dejarDeSeguirUsuario: async (usuarioQueSigueId: number, usuarioASeguirId: number): Promise<{ mensaje: string }> => {
     try {
      const token = localStorage.getItem(config.session.tokenKey);
      if (!token) throw new Error('No hay token de autenticación.');

      const response = await fetch(`${config.apiUrl}/usuarios/${usuarioQueSigueId}/seguidos/${usuarioASeguirId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      // Si la respuesta es exitosa (200 o 204) o si es 404 (la relación ya no existe)
      if (response.ok || response.status === 404) {
        return { mensaje: `Has dejado de seguir al usuario con ID: ${usuarioASeguirId}` };
      }

      // Si no es exitosa ni 404, manejamos el error
      const errorText = await response.text();
      let errorMessage = `Error al dejar de seguir usuario: ${response.status} - ${errorText || response.statusText}`;
      try {
        const errorJson = JSON.parse(errorText);
        if(errorJson.message) errorMessage = `Error: ${errorJson.message}`;
      } catch {}

      throw new Error(errorMessage);

    } catch (error) {
      console.error('Error en dejarDeSeguirUsuario:', error);
      throw error;
    }
  },
}; 
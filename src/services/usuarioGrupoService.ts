import { config } from '../config';

export interface UsuarioGrupo {
  id: number;
  grupoId: number;
  nombreGrupo: string;
  usuarioId: number;
  nombreUsuario: string;
  apellidoUsuario: string;
  rol: 'ADMINISTRADOR' | 'MIEMBRO';
}

export const usuarioGrupoService = {
  // Obtener todos los grupos de un usuario
  getGruposByUsuario: async (usuarioId: number): Promise<UsuarioGrupo[]> => {
    try {
      const token = localStorage.getItem(config.session.tokenKey);
      if (!token) throw new Error('No hay token de autenticación');

      const response = await fetch(`${config.apiUrl}/usuario-grupo/usuario/${usuarioId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Error al obtener grupos del usuario: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error en getGruposByUsuario:', error);
      throw error;
    }
  },

  // Unirse a un grupo como miembro
  unirseAGrupo: async (usuarioId: number, grupoId: number): Promise<UsuarioGrupo> => {
    try {
      const token = localStorage.getItem(config.session.tokenKey);
      if (!token) throw new Error('No hay token de autenticación');

      const response = await fetch(`${config.apiUrl}/usuario-grupo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          usuarioId,
          grupoId,
          rol: 'MIEMBRO'
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error al unirse al grupo: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error en unirseAGrupo:', error);
      throw error;
    }
  },

  // Abandonar un grupo
  abandonarGrupo: async (id: number): Promise<void> => {
    try {
      const token = localStorage.getItem(config.session.tokenKey);
      if (!token) throw new Error('No hay token de autenticación');

      const response = await fetch(`${config.apiUrl}/usuario-grupo/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Error al abandonar el grupo: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error en abandonarGrupo:', error);
      throw error;
    }
  },

  // Obtener miembros de un grupo
  getMiembrosGrupo: async (grupoId: number): Promise<UsuarioGrupo[]> => {
    try {
      const token = localStorage.getItem(config.session.tokenKey);
      if (!token) throw new Error('No hay token de autenticación');

      const response = await fetch(`${config.apiUrl}/usuario-grupo/grupo/${grupoId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Error al obtener miembros del grupo: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error en getMiembrosGrupo:', error);
      throw error;
    }
  }
}; 
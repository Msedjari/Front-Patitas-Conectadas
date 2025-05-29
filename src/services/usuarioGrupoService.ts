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

class UsuarioGrupoService {
  private getHeaders() {
    const token = localStorage.getItem(config.session.tokenKey);
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  async getUsuarioGrupo(id: number): Promise<UsuarioGrupo> {
    const response = await fetch(`${config.apiUrl}/usuario-grupo/${id}`, {
      headers: this.getHeaders()
    });
    if (!response.ok) throw new Error('Error al obtener la relación usuario-grupo');
    return response.json();
  }

  async getUsuarioGrupos(): Promise<UsuarioGrupo[]> {
    const response = await fetch(`${config.apiUrl}/usuario-grupo`, {
      headers: this.getHeaders()
    });
    if (!response.ok) throw new Error('Error al obtener las relaciones usuario-grupo');
    return response.json();
  }

  async getUsuarioGruposByUsuario(usuarioId: number): Promise<UsuarioGrupo[]> {
    const response = await fetch(`${config.apiUrl}/usuario-grupo/usuario/${usuarioId}`, {
      headers: this.getHeaders()
    });
    if (!response.ok) throw new Error('Error al obtener las relaciones del usuario');
    return response.json();
  }

  async getUsuarioGruposByGrupo(grupoId: number): Promise<UsuarioGrupo[]> {
    const response = await fetch(`${config.apiUrl}/usuario-grupo/grupo/${grupoId}`, {
      headers: this.getHeaders()
    });
    if (!response.ok) throw new Error('Error al obtener las relaciones del grupo');
    return response.json();
  }

  async createUsuarioGrupo(data: { usuarioId: number; grupoId: number; rol: 'ADMINISTRADOR' | 'MIEMBRO' }): Promise<UsuarioGrupo> {
    const response = await fetch(`${config.apiUrl}/usuario-grupo`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Error al crear la relación usuario-grupo');
    return response.json();
  }

  async updateUsuarioGrupo(id: number, data: { usuarioId: number; grupoId: number; rol: 'ADMINISTRADOR' | 'MIEMBRO' }): Promise<UsuarioGrupo> {
    const response = await fetch(`${config.apiUrl}/usuario-grupo/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Error al actualizar la relación usuario-grupo');
    return response.json();
  }

  async deleteUsuarioGrupo(id: number): Promise<void> {
    const response = await fetch(`${config.apiUrl}/usuario-grupo/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    if (!response.ok) throw new Error('Error al eliminar la relación usuario-grupo');
  }

  async getRelacion(usuarioId: number, grupoId: number): Promise<UsuarioGrupo> {
    const response = await fetch(`${config.apiUrl}/usuario-grupo/relacion/${usuarioId}/${grupoId}`, {
      headers: this.getHeaders()
    });
    if (!response.ok) throw new Error('Error al obtener la relación');
    return response.json();
  }
}

export const usuarioGrupoService = new UsuarioGrupoService(); 
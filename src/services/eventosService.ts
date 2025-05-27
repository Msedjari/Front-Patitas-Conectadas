import { config } from '../config';

export interface Evento {
  id: number;
  nombre: string;
  descripcion: string;
  ubicacion: string;
  fecha: string;
  creadorId?: number;
  rol?: 'CREADOR' | 'ASISTENTE';
  nombreUsuario?: string;
  apellidoUsuario?: string;
}

export const fetchEventos = async (): Promise<Evento[]> => {
  const token = localStorage.getItem(config.session.tokenKey);
  const res = await fetch(`${config.apiUrl}/eventos`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Error al obtener eventos');
  return await res.json();
};

export const fetchEventoById = async (id: number): Promise<Evento> => {
  const token = localStorage.getItem(config.session.tokenKey);
  const res = await fetch(`${config.apiUrl}/eventos/${id}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Error al obtener evento');
  return await res.json();
};

export const createEvento = async (evento: Omit<Evento, 'id' | 'creadorId'>, usuarioId: number): Promise<Evento> => {
  const token = localStorage.getItem(config.session.tokenKey);
  const res = await fetch(`${config.apiUrl}/eventos?usuarioId=${usuarioId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      ...evento,
      rol: 'CREADOR'
    })
  });
  if (!res.ok) throw new Error('Error al crear evento');
  return await res.json();
};

export const updateEvento = async (id: number, evento: Omit<Evento, 'id' | 'creadorId'>): Promise<Evento> => {
  const token = localStorage.getItem(config.session.tokenKey);
  const res = await fetch(`${config.apiUrl}/eventos/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(evento)
  });
  if (!res.ok) throw new Error('Error al actualizar evento');
  return await res.json();
};

export const deleteEvento = async (id: number): Promise<void> => {
  const token = localStorage.getItem(config.session.tokenKey);
  const res = await fetch(`${config.apiUrl}/eventos/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Error al eliminar evento');
}; 
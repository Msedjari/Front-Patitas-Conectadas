import { config } from '../config';

export const fetchAmigos = async (userId: number) => {
  const token = localStorage.getItem(config.session.tokenKey);
  const res = await fetch(`${config.apiUrl}/usuarios/${userId}/seguidos`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Error al obtener seguidos');
  return await res.json();
};

export const seguirUsuario = async (userId: number, usuarioASeguirId: number) => {
  const token = localStorage.getItem(config.session.tokenKey);
  const res = await fetch(`${config.apiUrl}/usuarios/${userId}/seguidos/${usuarioASeguirId}`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Error al seguir usuario');
  return await res.json();
};

export const dejarDeSeguirUsuario = async (userId: number, usuarioASeguirId: number) => {
  const token = localStorage.getItem(config.session.tokenKey);
  const res = await fetch(`${config.apiUrl}/usuarios/${userId}/seguidos/${usuarioASeguirId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Error al dejar de seguir usuario');
  return await res.json();
}; 
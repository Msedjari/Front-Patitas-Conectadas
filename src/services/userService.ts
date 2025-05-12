import { config } from '../config';

export interface User {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  img?: string;
}

export const searchUsers = async (query: string): Promise<User[]> => {
  try {
    const token = localStorage.getItem(config.session.tokenKey);
    if (!token) throw new Error('No hay token de autenticación');

    // Dividir la consulta en palabras para buscar por nombre y apellido
    const searchTerms = query.trim().split(' ');
    const searchParams = new URLSearchParams();
    
    // Si solo hay una palabra, buscamos por nombre
    if (searchTerms.length === 1) {
      searchParams.append('nombre', searchTerms[0]);
    } 
    // Si hay más de una palabra, la primera es nombre y el resto apellido
    else if (searchTerms.length > 1) {
      searchParams.append('nombre', searchTerms[0]);
      searchParams.append('apellido', searchTerms.slice(1).join(' '));
    }

    const response = await fetch(`${config.apiUrl}/usuarios/buscar?${searchParams.toString()}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al buscar usuarios');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en searchUsers:', error);
    throw error;
  }
}; 
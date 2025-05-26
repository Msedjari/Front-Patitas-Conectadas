import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { seguidosService } from '../../services/seguidosService';

interface User {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
}

interface Perfil {
  id: number;
  usuario_id: number;
  descripcion: string;
  img: string;
  fecha_nacimiento: string;
}

interface Seguido {
  id: number;
  usuarioQueSigueId: number;
  usuarioQueEsSeguidoId: number;
}

/**
 * Componente para la barra lateral derecha
 * Muestra usuarios que no seguimos (máximo 5)
 */
const RightSidebar: React.FC = () => {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [perfiles, setPerfiles] = useState<{ [key: number]: Perfil }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para mezclar aleatoriamente un array
  const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
    return newArray;
  };

  const fetchPerfil = async (userId: number) => {
    try {
      const response = await fetch(`http://localhost:4000/usuarios/${userId}/perfiles`);
      if (response.ok) {
        const perfil: Perfil = await response.json();
        setPerfiles(prev => ({ ...prev, [userId]: perfil }));
      }
    } catch (error) {
      console.error(`Error al obtener perfil del usuario ${userId}:`, error);
    }
  };

  const fetchNonFollowedUsers = async () => {
    try {
      if (!user?.id) return;

      // Primero obtenemos los usuarios que seguimos
      const seguidosResponse = await fetch(`http://localhost:4000/usuarios/${user.id}/seguidos`);

      if (!seguidosResponse.ok) {
        throw new Error(`Error al obtener usuarios seguidos: ${seguidosResponse.status}`);
      }

      const seguidos: Seguido[] = await seguidosResponse.json();
      const seguidosIds = seguidos.map(s => s.usuarioQueEsSeguidoId);

      // Luego obtenemos todos los usuarios
      const allUsersResponse = await fetch('http://localhost:4000/usuarios');

      if (!allUsersResponse.ok) {
        throw new Error(`Error al obtener usuarios: ${allUsersResponse.status}`);
      }

      const allUsers: User[] = await allUsersResponse.json();
      console.log('Usuarios obtenidos:', allUsers); // Debug log
      
      // Filtramos los usuarios que no seguimos y no somos nosotros mismos
      const nonFollowedUsers = allUsers
        .filter(u => !seguidosIds.includes(u.id) && u.id !== Number(user.id));

      // Mezclamos aleatoriamente los usuarios y tomamos los primeros 5
      const randomUsers = shuffleArray(nonFollowedUsers).slice(0, 5);

      console.log('Usuarios no seguidos (aleatorios):', randomUsers); // Debug log
      setSuggestions(randomUsers);

      // Obtenemos los perfiles de los usuarios sugeridos
      randomUsers.forEach(user => {
        fetchPerfil(user.id);
      });

      setError(null);
      } catch (error) {
      console.error('Error al cargar usuarios no seguidos:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
      } finally {
      setLoading(false);
      }
    };

  useEffect(() => {
    if (user) {
      fetchNonFollowedUsers();
    }
  }, [user]);

  const handleFollow = async (userId: number) => {
    try {
      if (!user?.id) return;

      // Usar el servicio de seguidos
      await seguidosService.seguirUsuario(Number(user.id), userId);

      // Actualizar la lista de sugerencias eliminando al usuario seguido
      setSuggestions(prev => prev.filter(u => u.id !== userId));
      
      // Disparar un evento personalizado para notificar a otros componentes
      window.dispatchEvent(new CustomEvent('usuarioSeguido', { detail: { userId } }));
      
      // Si quedan menos de 5 usuarios, intentamos cargar más
      if (suggestions.length <= 5) {
        fetchNonFollowedUsers();
      }
    } catch (error) {
      console.error('Error al seguir usuario:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
    }
  };

  if (loading) {
    return (
      <div className="h-full pt-4 pb-4 overflow-y-auto p-3">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6cda84]"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full pt-4 pb-4 overflow-y-auto p-3">
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full pt-4 pb-4 overflow-y-auto p-3">      
      {/* Usuarios no seguidos */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <h3 className="text-[#3d7b6f] font-medium text-sm mb-3">Usuarios que podrías seguir</h3>
          <div className="space-y-3">
          {suggestions.length > 0 ? (
          suggestions.map(user => (
              <div key={user.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {perfiles[user.id]?.img ? (
                    <img 
                      src={`http://localhost:4000/uploads/${perfiles[user.id].img}`}
                      alt={`${user.nombre} ${user.apellido}`}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500 text-sm">
                        {user.nombre.charAt(0)}{user.apellido.charAt(0)}
                      </span>
                    </div>
                  )}
                <div>
                    <p className="text-sm font-medium text-gray-900">{`${user.nombre} ${user.apellido}`}</p>
                </div>
              </div>
              <button 
                onClick={() => handleFollow(user.id)}
                  className="text-xs px-3 py-1 bg-[#6cda84] text-white rounded-full hover:bg-[#5bc073] transition-colors"
              >
                  Seguir
              </button>
            </div>
          ))
        ) : (
            <p className="text-sm text-gray-500 text-center">No hay más usuarios para seguir</p>
        )}
        </div>
      </div>
    </div>
  );
};

export default RightSidebar; 
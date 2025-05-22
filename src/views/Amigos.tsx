import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { config } from '../config';
import AmigosList from '../components/amigos/AmigosList';
import AmigoBuscador from '../components/amigos/AmigoBuscador';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import { userService, User } from '../services/userService';
import { seguidosService, Seguido } from '../services/seguidosService';
import SeguidosList from '../components/amigos/SeguidosList';
import { Link } from 'react-router-dom';
import { getUserImage } from '../components/home/HomeUtils';

interface Amigo {
  id: number;
  nombre: string;
  apellido?: string;
  img?: string;
  email?: string;
}

const Amigos: React.FC = () => {
  const { user } = useAuth();
  const [amigos, setAmigos] = useState<Amigo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [seguidosIds, setSeguidosIds] = useState<number[]>([]);
  const [seguidosDetails, setSeguidosDetails] = useState<User[]>([]);
  const [loadingSeguidos, setLoadingSeguidos] = useState(true);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const searchTimeoutRef = useRef<number | null>(null);

  const fetchAmigos = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem(config.session.tokenKey);
      
      const response = await fetch(`${config.apiUrl}/amigos`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }
      
      const data = await response.json();
      setAmigos(data);
      setError(null);
    } catch (err) {
      console.error('Error al cargar amigos:', err);
      setError('No se pudieron cargar los amigos. Intenta de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchAmigos();
  }, []);

  const handleAddAmigo = async (nuevoAmigo: Amigo) => {
    try {
      setLoading(true);
      const token = localStorage.getItem(config.session.tokenKey);
      
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setAmigos(prevAmigos => [...prevAmigos, nuevoAmigo]);
      setError(null);
    } catch (err) {
      console.error('Error al agregar amigo:', err);
      setError('No se pudo agregar el amigo. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleRemoveAmigo = async (amigo: Amigo) => {
    if (!confirm(`¿Estás seguro de eliminar a ${amigo.nombre} de tus amigos?`)) {
      return;
    }
    
    try {
      setLoading(true);
      const token = localStorage.getItem(config.session.tokenKey);
      
      const response = await fetch(`${config.apiUrl}/amigos/${amigo.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }
      
      setAmigos(amigos.filter(a => a.id !== amigo.id));
      setError(null);
    } catch (err) {
      console.error('Error al eliminar amigo:', err);
      setError('No se pudo eliminar el amigo. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };
  
  const filteredAmigos = amigos.filter(amigo => 
    `${amigo.nombre} ${amigo.apellido || ''}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchSeguidos = async () => {
    if (!user?.id) return;
    setLoadingSeguidos(true);
    try {
      const relaciones = await seguidosService.obtenerSeguidosIds(user.id);
      const ids = relaciones.map(rel => rel.usuarioQueEsSeguidoId);
      setSeguidosIds(ids);

      const detailsPromises = ids.map(id => userService.getUserById(id).catch(e => {
           console.error(`Error al obtener detalles del usuario ${id}:`, e);
           return null;
        })
      );
      const details = (await Promise.all(detailsPromises)).filter(detail => detail !== null) as User[];
      setSeguidosDetails(details);

    } catch (error) {
      console.error('Error al cargar seguidos:', error);
    } finally {
      setLoadingSeguidos(false);
    }
  };

  useEffect(() => {
    fetchSeguidos();
  }, [user?.id]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchTerm(query);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (query.trim() === '') {
      setSearchResults([]);
      setSearchError(null);
      return;
    }

    searchTimeoutRef.current = window.setTimeout(async () => {
      setLoadingSearch(true);
      setSearchError(null);
      try {
        const results = await userService.searchUsers(query);
        setSearchResults(results.filter(result => result.id !== user?.id));
      } catch (error) {
        console.error('Error en la búsqueda:', error);
        setSearchError('Error al buscar usuarios.');
        setSearchResults([]);
      } finally {
        setLoadingSearch(false);
      }
    }, 500);
  };

  const handleDejarDeSeguir = async (usuarioASeguirId: number) => {
     if (!user?.id) return;
     setLoadingSeguidos(true);
     try {
       await seguidosService.dejarDeSeguirUsuario(user.id, usuarioASeguirId);
       setSeguidosIds(prevIds => prevIds.filter(id => id !== usuarioASeguirId));
       setSeguidosDetails(prevDetails => prevDetails.filter(u => u.id !== usuarioASeguirId));
       alert('Has dejado de seguir al usuario.');
     } catch (error: any) {
       console.error('Error al dejar de seguir:', error);
       alert(error.message || 'No se pudo dejar de seguir al usuario.');
     } finally {
       setLoadingSeguidos(false);
     }
  };

  if (loading && amigos.length === 0) {
    return (
      <div className="container mx-auto py-8 max-w-4xl px-4">
        <LoadingSpinner />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 max-w-6xl px-4">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h1 className="text-2xl font-semibold text-[#3d7b6f] mb-6">Amigos y Seguidos</h1>
        
        <ErrorMessage 
          message={error} 
          onClose={() => setError(null)}
          onRetry={fetchAmigos}
        />
        
        <AmigoBuscador onAddAmigo={handleAddAmigo} />
        
        <div className="mb-8">
          <h2 className="text-xl font-medium text-[#3d7b6f] mb-4">Buscar nuevos amigos</h2>
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full px-4 py-2 border rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-[#6cda84]"
          />
          {loadingSearch && <p>Buscando...</p>}
          {searchError && <p className="text-red-500">{searchError}</p>}

          {searchTerm.trim() !== '' && searchResults.length > 0 && (
            <div className="border rounded-md mt-2 max-h-60 overflow-y-auto">
              <ul className="divide-y divide-gray-200">
                {searchResults.map(result => (
                  <li key={result.id}>
                    <Link
                       to={`/perfil/${result.id}`}
                       className="flex items-center p-3 hover:bg-gray-100 transition-colors"
                       onClick={() => {
                           setSearchTerm('');
                           setSearchResults([]);
                       }}
                    >
                       <img
                         src={getUserImage({}, result.id)}
                         alt={result.nombre || 'Usuario'}
                         className="w-8 h-8 rounded-full object-cover mr-3"
                         onError={(e) => { (e.target as HTMLImageElement).src = '/default-avatar.svg'; }}
                        />
                       <span className="font-medium text-[#2a2827]">{result.nombre} {result.apellido}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {searchTerm.trim() !== '' && !loadingSearch && !searchError && searchResults.length === 0 && (
             <p>No se encontraron usuarios.</p>
           )}
        </div>
        
        {filteredAmigos.length === 0 && searchTerm ? (
          <div className="text-center py-10 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No se encontraron amigos que coincidan con tu búsqueda.</p>
          </div>
        ) : (
          <AmigosList
            amigos={filteredAmigos}
            onRemoveAmigo={handleRemoveAmigo}
          />
        )}

        <div className="mt-8">
          <h2 className="text-xl font-medium text-[#3d7b6f] mb-4">Usuarios que sigues ({seguidosDetails.length})</h2>
          <SeguidosList seguidos={seguidosDetails} onDejarDeSeguir={handleDejarDeSeguir} />
        </div>
      </div>
    </div>
  );
};

export default Amigos; 
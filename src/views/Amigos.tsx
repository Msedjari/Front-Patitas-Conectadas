import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { config } from '../config';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import { userService, User, searchUsers } from '../services/userService';
import { seguidosService } from '../services/seguidosService';
import { Link, useNavigate } from 'react-router-dom';
import { getUserImage } from '../components/home/HomeUtils';
import BotonSeguir from '../components/common/BotonSeguir';

const Amigos: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [seguidosDetails, setSeguidosDetails] = useState<User[]>([]);
  const [loadingSeguidos, setLoadingSeguidos] = useState(false);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [userImagesCache, setUserImagesCache] = useState<Record<number, string>>({});
  const [updateTrigger, setUpdateTrigger] = useState(0);
  const searchTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const loadUserImagesCache = () => {
      const cachedImages = localStorage.getItem('userImagesCache');
      if (cachedImages) {
        setUserImagesCache(JSON.parse(cachedImages));
      }
    };
    loadUserImagesCache();
  }, []);

  const updateUserImagesCache = (userId: number, imagePath: string) => {
    const newCache = { ...userImagesCache, [userId]: imagePath };
    setUserImagesCache(newCache);
    localStorage.setItem('userImagesCache', JSON.stringify(newCache));
  };

  const actualizarListaSeguidos = async () => {
    if (!user?.id) return;
    setLoadingSeguidos(true);
    try {
      const relaciones = await seguidosService.obtenerSeguidosIds(Number(user.id));
      const ids = relaciones.map(rel => Number(rel.usuarioQueEsSeguidoId));

      const detailsPromises = ids.map(id => userService.getUserById(id).catch(e => {
        console.error(`Error al obtener detalles del usuario ${id}:`, e);
        return null;
      }));
      const details = (await Promise.all(detailsPromises)).filter(detail => detail !== null) as User[];
      
      // Actualizar el caché de imágenes para cada usuario
      details.forEach(detail => {
        if (detail.img) {
          updateUserImagesCache(Number(detail.id), detail.img);
        }
      });
      
      setSeguidosDetails(details);
    } catch (error) {
      console.error('Error al cargar seguidos:', error);
      setError('Error al cargar la lista de seguidos');
    } finally {
      setLoadingSeguidos(false);
    }
  };

  const handleSeguirUsuario = async (usuarioId: number) => {
    if (!user?.id) return;
    try {
      await seguidosService.seguirUsuario(Number(user.id), Number(usuarioId));
      await actualizarListaSeguidos();
      setSearchResults(prevResults => 
        prevResults.map(result => 
          Number(result.id) === Number(usuarioId)
            ? { ...result, siguiendo: true }
            : result
        )
      );
    } catch (error) {
      console.error('Error al seguir usuario:', error);
      setError('Error al seguir usuario');
    }
  };

  const handleDejarDeSeguir = async (usuarioId: number) => {
    if (!user?.id) return;
    try {
      setLoadingSeguidos(true);
      await seguidosService.dejarDeSeguirUsuario(Number(user.id), Number(usuarioId));
      
      // La actualización se manejará a través del evento usuarioSeguido
      
    } catch (error) {
      console.error('Error al dejar de seguir usuario:', error);
      setError('Error al dejar de seguir usuario');
    } finally {
      setLoadingSeguidos(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
    if (user?.id) {
        try {
          setLoadingSeguidos(true);
          const relaciones = await seguidosService.obtenerSeguidosIds(Number(user.id));
          const ids = relaciones.map(rel => Number(rel.usuarioQueEsSeguidoId));

          const detailsPromises = ids.map(id => userService.getUserById(id).catch(e => {
            console.error(`Error al obtener detalles del usuario ${id}:`, e);
            return null;
          }));
          const details = (await Promise.all(detailsPromises)).filter(detail => detail !== null) as User[];
          
          setSeguidosDetails(details);
        } catch (error) {
          console.error('Error al cargar seguidos:', error);
          setError('Error al cargar la lista de seguidos');
        } finally {
          setLoadingSeguidos(false);
        }
      }
    };

    // Escuchar el evento de seguimiento/dejar de seguir
    const handleUsuarioSeguido = (event: CustomEvent) => {
      console.log('Evento usuarioSeguido recibido:', event.detail);
      loadData();
    };

    window.addEventListener('usuarioSeguido', handleUsuarioSeguido as EventListener);
    loadData();

    return () => {
      window.removeEventListener('usuarioSeguido', handleUsuarioSeguido as EventListener);
    };
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
        const results = await searchUsers(query);
        const filteredResults = results.filter((result: User) => result.id !== (user?.id || 0));
        
        // Actualizar el caché de imágenes para los resultados de búsqueda
        filteredResults.forEach(result => {
          if (result.img) {
            updateUserImagesCache(Number(result.id), result.img);
          }
        });
        
        setSearchResults(filteredResults);
      } catch (error) {
        console.error('Error en la búsqueda:', error);
        setSearchError('Error al buscar usuarios.');
        setSearchResults([]);
      } finally {
        setLoadingSearch(false);
      }
    }, 500);
  };

  const handleFollow = async (userId: number) => {
    if (!user?.id) return;
    try {
      await seguidosService.seguirUsuario(Number(user.id), Number(userId));
      await actualizarListaSeguidos();
    } catch (error) {
      console.error('Error al seguir usuario:', error);
    }
  };

  if (loadingSeguidos && seguidosDetails.length === 0) {
    return (
      <div className="container mx-auto py-8 max-w-4xl px-4">
        <LoadingSpinner />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 max-w-6xl px-4">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-semibold text-[#3d7b6f] mb-6">Amigos</h1>
        
        <ErrorMessage 
          message={error} 
          onClose={() => setError(null)}
          onRetry={actualizarListaSeguidos}
        />
        
        <div className="mb-8">
          <input
            type="text"
            placeholder="Buscar usuarios..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full px-4 py-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-[#6cda84] text-lg"
          />
          {loadingSearch && <p className="text-gray-500">Buscando...</p>}
          {searchError && <p className="text-red-500">{searchError}</p>}

          {searchTerm.trim() !== '' && searchResults.length > 0 && (
            <div className="border rounded-lg mt-2 max-h-96 overflow-y-auto">
              <ul className="divide-y divide-gray-200">
                {searchResults.map((result: User) => (
                  <li key={result.id}>
                    <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center flex-grow">
                        <img
                          src={getUserImage(userImagesCache, Number(result.id))}
                          alt={result.nombre || 'Usuario'}
                          className="w-12 h-12 rounded-full object-cover mr-4"
                          onError={(e) => { (e.target as HTMLImageElement).src = '/default-avatar.svg'; }}
                        />
                        <div>
                          <h3 className="font-medium text-lg text-[#2a2827]">{result.nombre} {result.apellido}</h3>
                          <p className="text-sm text-gray-500">{result.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <BotonSeguir 
                          usuarioId={Number(result.id)}
                          onSeguir={() => handleSeguirUsuario(Number(result.id))}
                          onDejarDeSeguir={() => handleDejarDeSeguir(Number(result.id))}
                          nombreUsuario={`${result.nombre} ${result.apellido}`}
                        />
                        <Link
                          to={`/perfil/${result.id}`}
                          className="px-4 py-2 bg-[#3d7b6f] text-white rounded hover:bg-[#2c5a52] transition-colors"
                        >
                          Ver Perfil
                        </Link>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {searchTerm.trim() !== '' && !loadingSearch && !searchError && searchResults.length === 0 && (
            <p className="text-gray-500 text-center py-4">No se encontraron usuarios.</p>
          )}
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-medium text-[#3d7b6f] mb-4">Usuarios que sigues</h2>
          {loadingSeguidos ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {seguidosDetails.map((seguido) => (
                <div key={seguido.id} className="bg-white rounded-lg shadow p-4 flex items-center justify-between hover:shadow-md transition-shadow">
                  <div className="flex items-center flex-grow">
                    <img
                      src={getUserImage(userImagesCache, Number(seguido.id))}
                      alt={seguido.nombre || 'Usuario'}
                      className="w-12 h-12 rounded-full object-cover mr-4"
                      onError={(e) => { (e.target as HTMLImageElement).src = '/default-avatar.svg'; }}
                    />
                    <div>
                      <h3 className="font-medium text-lg text-[#2a2827]">{seguido.nombre} {seguido.apellido}</h3>
                      <p className="text-sm text-gray-500">{seguido.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <BotonSeguir 
                      usuarioId={Number(seguido.id)}
                      onDejarDeSeguir={() => handleDejarDeSeguir(Number(seguido.id))}
                      nombreUsuario={`${seguido.nombre} ${seguido.apellido}`}
                      siguiendoInicial={true}
                    />
                    <Link
                      to={`/perfil/${seguido.id}`}
                      className="px-4 py-2 bg-[#3d7b6f] text-white rounded hover:bg-[#2c5a52] transition-colors"
                    >
                      Ver Perfil
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
          {!loadingSeguidos && seguidosDetails.length === 0 && (
            <div className="text-center py-10 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No sigues a ningún usuario aún.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Amigos; 
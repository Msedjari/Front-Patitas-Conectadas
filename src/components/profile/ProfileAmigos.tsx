import React, { useState, useEffect } from 'react';
import ActionButton from '../common/ActionButton';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import EmptyState from '../common/EmptyState';
import { Link, useNavigate } from 'react-router-dom';
import { fetchFriendsByUserId, User } from '../../services/userService';
import { getUserImage } from '../home/HomeUtils';

interface ProfileAmigosProps {
  userId: number;
  isOwnProfile: boolean;
}

/**
 * Componente que muestra la sección de amigos en el perfil del usuario
 */
const ProfileAmigos: React.FC<ProfileAmigosProps> = ({ userId, isOwnProfile }) => {
  const [amigos, setAmigos] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userImagesCache, setUserImagesCache] = useState<Record<number, string>>({});
  const navigate = useNavigate();
  
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
  
  useEffect(() => {
    const loadAmigos = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Obtener amigos del usuario usando el servicio
        const data = await fetchFriendsByUserId(userId);
        setAmigos(data);
        
        // Actualizar el caché de imágenes para cada amigo
        data.forEach(amigo => {
          if (amigo.img) {
            updateUserImagesCache(Number(amigo.id), amigo.img);
          }
        });
      } catch (err) {
        console.error('Error al cargar amigos:', err);
        setError('No se pudieron cargar los amigos. Intenta de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };
    
    if (userId) {
      loadAmigos();
    }
  }, [userId]);
  
  const handleBuscarAmigos = () => {
    // Navegar a la página de búsqueda de amigos
    navigate('/amigos');
  };
  
  const renderContent = () => {
    if (loading) {
      return <LoadingSpinner className="my-4" />;
    }
    
    if (error) {
      return (
        <ErrorMessage
          message={error}
          onClose={() => setError(null)}
        />
      );
    }
    
    if (amigos.length === 0) {
      return (
        <EmptyState
          message={isOwnProfile ? "Aún no tienes amigos agregados." : "Este usuario no tiene amigos agregados."}
          actionText={isOwnProfile ? "Buscar amigos" : undefined}
          onAction={isOwnProfile ? handleBuscarAmigos : undefined}
        />
      );
    }
    
    // Mostrar lista de amigos
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-4">
        {amigos.map(amigo => (
          <Link 
            to={`/perfil/${amigo.id}`} 
            key={amigo.id}
            className="flex items-center p-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="w-12 h-12 rounded-full overflow-hidden mr-3">
              <img 
                src={getUserImage(userImagesCache, Number(amigo.id))}
                alt={`${amigo.nombre} ${amigo.apellido}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/default-avatar.svg';
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {amigo.nombre} {amigo.apellido}
              </p>
              {amigo.ciudad && (
                <p className="text-xs text-gray-500 truncate">
                  {amigo.ciudad}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    );
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-[#3d7b6f]">
          Amigos
        </h2>
        
        {isOwnProfile && (
          <ActionButton
            variant="primary"
            size="sm"
            onClick={handleBuscarAmigos}
          >
            Buscar amigos
          </ActionButton>
        )}
      </div>
      
      {renderContent()}
    </div>
  );
};

export default ProfileAmigos; 
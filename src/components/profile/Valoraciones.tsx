import React, { useState, useEffect } from 'react';
import { config } from '../../config';

interface Valoracion {
  id: number;
  autor_id: number;
  receptor_id: number;
  puntuacion: number;
  contenido: string;
  fecha: string;
  autor?: {
    nombre: string;
    apellido: string;
    img?: string;
  };
}

interface Perfil {
  img?: string;
}

interface ValoracionesProps {
  userId: number;
}

const Valoraciones: React.FC<ValoracionesProps> = ({ userId }) => {
  const [valoraciones, setValoraciones] = useState<Valoracion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userImagesCache, setUserImagesCache] = useState<Record<number, string>>({});

  useEffect(() => {
    // Cargar el caché de imágenes al montar el componente
    const loadUserImagesCache = () => {
      const cachedImages = localStorage.getItem('userImagesCache');
      if (cachedImages) {
        setUserImagesCache(JSON.parse(cachedImages));
      }
    };
    loadUserImagesCache();

    // Suscribirse a cambios en el caché
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'userImagesCache' && e.newValue) {
        setUserImagesCache(JSON.parse(e.newValue));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userImageUpdated', ((e: CustomEvent) => {
      if (e.detail && e.detail.userId && e.detail.imagePath) {
        setUserImagesCache(prev => ({
          ...prev,
          [e.detail.userId]: e.detail.imagePath
        }));
      }
    }) as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userImageUpdated', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    const fetchValoraciones = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem(config.session.tokenKey);
        const response = await fetch(`${config.apiUrl}/valoraciones/usuarios/${userId}/recibidas`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Error al cargar las valoraciones');
        }

        const data = await response.json();
        
        // Enriquecer las valoraciones con las imágenes del caché
        const valoracionesConImagenes = data.map((valoracion: Valoracion) => ({
          ...valoracion,
          autor: {
            ...valoracion.autor,
            img: userImagesCache[valoracion.autor_id]
          }
        }));

        setValoraciones(valoracionesConImagenes);
      } catch (error) {
        console.error('Error:', error);
        setError('No se pudieron cargar las valoraciones');
      } finally {
        setLoading(false);
      }
    };

    fetchValoraciones();
  }, [userId, userImagesCache]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#6cda84] border-solid"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
        <p>{error}</p>
      </div>
    );
  }

  if (valoraciones.length === 0) {
    return (
      <div className="text-center py-4 text-[#575350]">
        <p>No hay valoraciones disponibles</p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h3 className="text-[#3d7b6f] font-medium mb-4">Valoraciones recibidas</h3>
      <div className="space-y-4">
        {valoraciones.map((valoracion) => (
          <div key={valoracion.id} className="bg-[#f8ffe5] p-4 rounded-lg border border-[#9fe0b7]">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                  {valoracion.autor?.img ? (
                    <img
                      src={`${config.apiUrl}/uploads/${valoracion.autor.img}`}
                      alt={`${valoracion.autor.nombre} ${valoracion.autor.apellido}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = 'https://via.placeholder.com/150?text=Error';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#e0e0e0]">
                      <span className="text-[#a0a0a0] text-lg">
                        {valoracion.autor?.nombre?.[0] || '?'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-grow">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-[#3d7b6f]">
                      {valoracion.autor?.nombre} {valoracion.autor?.apellido}
                    </h4>
                    <div className="flex items-center mt-1">
                      {[...Array(5)].map((_, index) => (
                        <svg
                          key={index}
                          className={`w-4 h-4 ${
                            index < valoracion.puntuacion ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  <span className="text-sm text-[#575350]">
                    {new Date(valoracion.fecha).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <p className="mt-2 text-[#2a2827]">{valoracion.contenido}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Valoraciones; 
import React, { useState, useEffect } from 'react';
import { config } from '../../config';
import { valoracionesService } from '../../services/valoracionesService';

interface Valoracion {
  id: number;
  autorId: number;
  nombreAutor: string;
  apellidoAutor: string;
  receptorId: number;
  nombreReceptor: string;
  apellidoReceptor: string;
  puntuacion: number;
  contenido: string;
  fecha: string;
  createdAt: string;
  updatedAt: string;
}

interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
}

interface Perfil {
  id: number;
  usuario_id: number;
  descripcion: string;
  fecha_nacimiento: string;
  img?: string;
  usuario?: Usuario;
}

interface ValoracionesProps {
  userId: number;
  key?: string;
  isOwnProfile?: boolean;
}

const Valoraciones: React.FC<ValoracionesProps> = ({ userId, isOwnProfile }) => {
  const [valoraciones, setValoraciones] = useState<Valoracion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [perfilesAutores, setPerfilesAutores] = useState<Record<number, Perfil>>({});
  const [valoracionAEliminar, setValoracionAEliminar] = useState<number | null>(null);

  const formatearFecha = (fecha: string) => {
    const ahora = new Date();
    const fechaValoracion = new Date(fecha);
    const diffDias = Math.floor((ahora.getTime() - fechaValoracion.getTime()) / (1000 * 60 * 60 * 24));
    
    // Si es de hoy, mostrar solo la hora
    if (diffDias === 0) {
      return fechaValoracion.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
    
    // Si es de ayer
    if (diffDias === 1) {
      return 'Ayer';
    }
    
    // Si es de esta semana
    if (diffDias < 7) {
      return fechaValoracion.toLocaleDateString('es-ES', { weekday: 'long' });
    }
    
    // Si es de este año
    if (fechaValoracion.getFullYear() === ahora.getFullYear()) {
      const dia = fechaValoracion.getDate().toString().padStart(2, '0');
      const mes = (fechaValoracion.getMonth() + 1).toString().padStart(2, '0');
      return `${dia}/${mes}`;
    }
    
    // Si es de otro año
    const dia = fechaValoracion.getDate().toString().padStart(2, '0');
    const mes = (fechaValoracion.getMonth() + 1).toString().padStart(2, '0');
    const año = fechaValoracion.getFullYear();
    return `${dia}/${mes}/${año}`;
  };

  useEffect(() => {
    const fetchValoraciones = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem(config.session.tokenKey);
        
        // 1. Obtener las valoraciones
        const response = await fetch(`${config.apiUrl}/valoraciones/usuarios/${userId}/recibidas`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Error al cargar las valoraciones');
        }

        const data = await response.json();
        setValoraciones(data);

        // 2. Obtener IDs únicos de autores
        const autoresIds = [...new Set(data.map((valoracion: Valoracion) => valoracion.autorId))].filter(id => id !== undefined) as number[];
        
        // 3. Obtener perfiles de autores
        const perfilesPromises = autoresIds.map(async (autorId: number): Promise<Record<number, Perfil> | null> => {
          if (!autorId) return null;
          
          try {
            // Obtener perfil
            const perfilResponse = await fetch(`${config.apiUrl}/usuarios/${autorId}/perfiles`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (perfilResponse.ok) {
              const perfil = await perfilResponse.json() as Perfil;
              return { [autorId]: perfil };
            }
            return null;
          } catch (error) {
            console.error(`Error al cargar perfil del autor ${autorId}:`, error);
            return null;
          }
        });

        // 4. Esperar todas las peticiones y combinar resultados
        const perfilesResultados = await Promise.all(perfilesPromises);
        const perfilesMap = perfilesResultados.reduce<Record<number, Perfil>>((acc, curr) => {
          if (curr) {
            return { ...acc, ...curr };
          }
          return acc;
        }, {});

        setPerfilesAutores(perfilesMap);
      } catch (error) {
        console.error('Error:', error);
        setError('No se pudieron cargar las valoraciones');
      } finally {
        setLoading(false);
      }
    };

    fetchValoraciones();
  }, [userId]);

  const handleEliminarValoracion = async (valoracionId: number) => {
    try {
      await valoracionesService.eliminarValoracion(valoracionId);
      setValoraciones(prev => prev.filter(v => v.id !== valoracionId));
      setValoracionAEliminar(null);
    } catch (error) {
      console.error('Error al eliminar valoración:', error);
      setError('No se pudo eliminar la valoración');
    }
  };

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
                  {perfilesAutores[valoracion.autorId]?.img ? (
                    <img
                      src={`${config.apiUrl}/uploads/${perfilesAutores[valoracion.autorId].img}`}
                      alt={`${valoracion.nombreAutor} ${valoracion.apellidoAutor}`}
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
                        {valoracion.nombreAutor?.[0] || '?'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-grow">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-[#3d7b6f]">
                      {valoracion.nombreAutor} {valoracion.apellidoAutor}
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
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-[#575350]">
                      {formatearFecha(valoracion.fecha)}
                    </span>
                    {!isOwnProfile && (
                      <button
                        onClick={() => setValoracionAEliminar(valoracion.id)}
                        className="text-red-500 hover:text-red-700"
                        title="Eliminar valoración"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
                <p className="mt-2 text-[#2a2827]">{valoracion.contenido}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de confirmación de eliminación */}
      {valoracionAEliminar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-[#2a2827] mb-4">Confirmar eliminación</h3>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que deseas eliminar esta valoración? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                onClick={() => setValoracionAEliminar(null)}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                onClick={() => handleEliminarValoracion(valoracionAEliminar)}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Valoraciones;
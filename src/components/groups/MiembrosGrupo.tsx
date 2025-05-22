import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchUsuariosByGrupoId, UsuarioGrupo, deleteUsuarioGrupo, updateUsuarioGrupo } from '../../services/groupService';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';

interface MiembrosGrupoProps {
  grupoId: number;
}

const MiembrosGrupo: React.FC<MiembrosGrupoProps> = ({ grupoId }) => {
  const { user } = useAuth();
  const [miembros, setMiembros] = useState<UsuarioGrupo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    fetchMiembros();
  }, [grupoId]);

  // Verificar si el usuario actual es administrador del grupo
  useEffect(() => {
    if (miembros.length > 0 && user?.id) {
      const userId = typeof user.id === 'string' ? parseInt(user.id) : user.id;
      const userMembership = miembros.find(m => m.usuarioId === userId);
      setIsAdmin(userMembership?.rol === 'ADMINISTRADOR');
    }
  }, [miembros, user]);

  const fetchMiembros = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await fetchUsuariosByGrupoId(grupoId);
      setMiembros(data);
    } catch (err) {
      console.error('Error al cargar miembros del grupo:', err);
      setError('No se pudieron cargar los miembros del grupo. Intenta de nuevo más tarde.');
      
      // Datos de prueba para desarrollo
      if (import.meta.env.DEV) {
        setMiembros([
          {
            id: 1,
            grupoId: grupoId,
            nombreGrupo: "Amantes de los Perros",
            usuarioId: 1,
            nombreUsuario: "Juan",
            apellidoUsuario: "Pérez",
            rol: "ADMINISTRADOR"
          },
          {
            id: 2,
            grupoId: grupoId,
            nombreGrupo: "Amantes de los Perros",
            usuarioId: 2,
            nombreUsuario: "María",
            apellidoUsuario: "García",
            rol: "MIEMBRO"
          },
          {
            id: 3,
            grupoId: grupoId,
            nombreGrupo: "Amantes de los Perros",
            usuarioId: 3,
            nombreUsuario: "Carlos",
            apellidoUsuario: "López",
            rol: "MIEMBRO"
          }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Formatear fecha para mostrar
  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Fecha no disponible';
    
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    };
    
    try {
      return new Date(dateString).toLocaleDateString('es-ES', options);
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return 'Fecha inválida';
    }
  };

  // Eliminar miembro del grupo
  const handleRemoveMember = async (miembroId: number) => {
    if (!miembroId) return;
    
    try {
      setLoading(true);
      await deleteUsuarioGrupo(miembroId);
      setMiembros(miembros.filter(m => m.id !== miembroId));
      setError(null);
    } catch (err) {
      console.error('Error al eliminar miembro:', err);
      setError('No se pudo eliminar al miembro del grupo. Intenta de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  };

  // Cambiar rol de miembro
  const handleChangeRole = async (miembro: UsuarioGrupo, newRole: 'ADMINISTRADOR' | 'MIEMBRO') => {
    if (!miembro.id) return;
    
    try {
      setLoading(true);
      
      const updatedMiembro = await updateUsuarioGrupo(miembro.id, {
        ...miembro,
        rol: newRole
      });
      
      setMiembros(miembros.map(m => 
        m.id === miembro.id ? updatedMiembro : m
      ));
      
      setError(null);
    } catch (err) {
      console.error('Error al cambiar rol del miembro:', err);
      setError('No se pudo cambiar el rol del miembro. Intenta de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar miembros según término de búsqueda
  const filteredMiembros = miembros.filter(miembro => {
    const fullName = `${miembro.nombreUsuario} ${miembro.apellidoUsuario}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  if (loading && miembros.length === 0) {
    return <LoadingSpinner className="my-5" />;
  }

  if (error) {
    return (
      <ErrorMessage 
        message={error} 
        onClose={() => setError(null)}
        onRetry={fetchMiembros}
      />
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-gray-600">{miembros.length} miembros</p>
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar miembros"
            className="border rounded-full px-4 py-2 pl-10 w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="material-icons absolute left-3 top-2 text-gray-500">search</span>
        </div>
      </div>
      
      {loading && <div className="text-center py-2"><LoadingSpinner size="small" /></div>}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMiembros.map((miembro) => (
          <div key={miembro.id} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
            <div className="w-12 h-12 rounded-full bg-gray-300 flex-shrink-0 flex items-center justify-center text-gray-600">
              {miembro.nombreUsuario?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-grow">
              <p className="font-medium">{miembro.nombreUsuario} {miembro.apellidoUsuario}</p>
              <p className="text-sm text-gray-500">
                {miembro.rol}
              </p>
            </div>
            
            {/* Opciones para administradores */}
            {isAdmin && miembro.usuarioId !== user?.id && (
              <div className="relative group">
                <button className="text-gray-500 hover:text-[#3d7b6f]">
                  <span className="material-icons">more_horiz</span>
                </button>
                
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg hidden group-hover:block z-10">
                  <div className="py-1">
                    {miembro.rol === 'MIEMBRO' ? (
                      <button 
                        onClick={() => handleChangeRole(miembro, 'ADMINISTRADOR')}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        Hacer administrador
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleChangeRole(miembro, 'MIEMBRO')}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        Quitar rol de administrador
                      </button>
                    )}
                    <button 
                      onClick={() => handleRemoveMember(miembro.id!)}
                      className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                    >
                      Eliminar del grupo
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {filteredMiembros.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No se encontraron miembros{searchTerm ? ' que coincidan con la búsqueda' : ''}.
        </div>
      )}
    </div>
  );
};

export default MiembrosGrupo; 
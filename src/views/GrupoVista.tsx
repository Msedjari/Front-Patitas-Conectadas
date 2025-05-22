import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchGroupById, Group as Grupo, fetchUsuariosByGrupoId, UsuarioGrupo } from '../services/groupService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import MiembrosGrupo from '../components/groups/MiembrosGrupo';
import GrupoDetalle from '../components/groups/GrupoDetalle';
import ActionButton from '../components/common/ActionButton';
import BotonUnirseGrupo from '../components/groups/BotonUnirseGrupo';

/**
 * Componente para mostrar la vista detallada de un grupo
 * Similar a la vista de grupos en redes sociales como Facebook
 */
const GrupoVista: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [grupo, setGrupo] = useState<Grupo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'publicaciones' | 'miembros' | 'informacion'>('publicaciones');
  const [miembros, setMiembros] = useState<UsuarioGrupo[]>([]);
  const [isUserMember, setIsUserMember] = useState<boolean>(false);

  // Cargar datos del grupo
  useEffect(() => {
    const fetchGrupoData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        const grupoId = parseInt(id);
        const data = await fetchGroupById(grupoId);
        setGrupo(data);
      } catch (err) {
        console.error('Error al cargar el grupo:', err);
        setError('No se pudo cargar la información del grupo. Intenta de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchGrupoData();
  }, [id]);

  // Cargar miembros del grupo
  useEffect(() => {
    const fetchMiembros = async () => {
      if (!id) return;
      
      try {
        const grupoId = parseInt(id);
        const data = await fetchUsuariosByGrupoId(grupoId);
        setMiembros(data);
        
        // Verificar si el usuario actual es miembro
        if (user?.id) {
          const userId = typeof user.id === 'string' ? parseInt(user.id) : user.id;
          const userIsMember = data.some(m => m.usuarioId === userId);
          setIsUserMember(userIsMember);
        }
      } catch (err) {
        console.error('Error al cargar miembros del grupo:', err);
      }
    };

    fetchMiembros();
  }, [id, user]);

  // Manejar cambio en la membresía
  const handleMembershipChange = () => {
    // Recargar miembros y datos del grupo
    if (id) {
      const grupoId = parseInt(id);
      fetchGroupById(grupoId).then(data => setGrupo(data));
      fetchUsuariosByGrupoId(grupoId).then(data => {
        setMiembros(data);
        
        // Actualizar estado de membresía del usuario
        if (user?.id) {
          const userId = typeof user.id === 'string' ? parseInt(user.id) : user.id;
          const userIsMember = data.some(m => m.usuarioId === userId);
          setIsUserMember(userIsMember);
        }
      });
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

  if (loading) {
    return <LoadingSpinner className="my-5" />;
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 max-w-6xl px-4">
        <ErrorMessage 
          message={error} 
          onClose={() => setError(null)}
          onRetry={() => navigate(0)} // Recargar la página
        />
      </div>
    );
  }

  if (!grupo) {
    return (
      <div className="container mx-auto py-8 max-w-6xl px-4">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4">
          <p>No se encontró información del grupo.</p>
          <button 
            className="text-blue-600 hover:underline mt-2"
            onClick={() => navigate('/grupos')}
          >
            Volver a la lista de grupos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4 max-w-6xl px-4">
      {/* Cabecera del grupo con foto de portada */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
        <div className="h-48 bg-gray-200 relative">
          {grupo.img ? (
            <img 
              src={grupo.img} 
              alt={`Portada de ${grupo.nombre}`} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              Foto
            </div>
          )}
        </div>
        
        <div className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-3xl font-bold text-[#3d7b6f]">{grupo.nombre}</h1>
              <p className="text-gray-600">{miembros.length} seguidores</p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-2">
              <BotonUnirseGrupo 
                grupoId={parseInt(id!)} 
                onMembershipChange={handleMembershipChange}
              />
              <ActionButton onClick={() => console.log('Acción de compartir')}>
                Compartir
              </ActionButton>
            </div>
          </div>
        </div>
        
        {/* Navegación por pestañas */}
        <div className="border-t border-gray-200">
          <nav className="flex">
            <button 
              className={`px-6 py-3 font-medium ${activeTab === 'publicaciones' ? 'text-[#3d7b6f] border-b-2 border-[#3d7b6f]' : 'text-gray-600'}`}
              onClick={() => setActiveTab('publicaciones')}
            >
              Publicaciones
            </button>
            <button 
              className={`px-6 py-3 font-medium ${activeTab === 'miembros' ? 'text-[#3d7b6f] border-b-2 border-[#3d7b6f]' : 'text-gray-600'}`}
              onClick={() => setActiveTab('miembros')}
            >
              Miembros
            </button>
            <button 
              className={`px-6 py-3 font-medium ${activeTab === 'informacion' ? 'text-[#3d7b6f] border-b-2 border-[#3d7b6f]' : 'text-gray-600'}`}
              onClick={() => setActiveTab('informacion')}
            >
              Información
            </button>
          </nav>
        </div>
      </div>
      
      {/* Contenido principal */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Columna izquierda - Contenido principal */}
        <div className="md:col-span-2">
          {activeTab === 'publicaciones' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              {/* Formulario para crear publicación - solo visible para miembros */}
              {isUserMember ? (
                <div className="mb-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gray-300">
                      {user?.nombre && (
                        <div className="w-full h-full flex items-center justify-center text-gray-600 font-medium">
                          {user.nombre.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-grow">
                      <div className="border rounded-full px-4 py-2 bg-gray-100 text-gray-500 cursor-pointer hover:bg-gray-200">
                        ¿Qué estás pensando?
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between border-t pt-3">
                    <button className="flex items-center text-gray-600 hover:bg-gray-100 px-3 py-1 rounded">
                      <span className="material-icons text-lg mr-1">photo</span>
                      Foto
                    </button>
                    <button className="flex items-center text-gray-600 hover:bg-gray-100 px-3 py-1 rounded">
                      <span className="material-icons text-lg mr-1">videocam</span>
                      Video
                    </button>
                    <button className="flex items-center text-gray-600 hover:bg-gray-100 px-3 py-1 rounded">
                      <span className="material-icons text-lg mr-1">event</span>
                      Evento
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 mb-6">
                  <p className="text-yellow-700">
                    Únete al grupo para poder publicar y participar en las conversaciones.
                  </p>
                </div>
              )}
              
              {/* Publicaciones */}
              <div>
                {/* Publicación de ejemplo 1 */}
                <div className="border-t pt-4 pb-6">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gray-300"></div>
                    <div>
                      <p className="font-medium">Nombre del Usuario</p>
                      <p className="text-xs text-gray-500">{formatDate(new Date().toISOString())}</p>
                    </div>
                  </div>
                  <p className="mb-4">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed vitae justo vel magna sagittis imperdiet sit amet eget sapien. Fusce et magna quis mi tristique consectetur.</p>
                  <div className="h-48 bg-gray-200 mb-4 rounded">
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      Imagen de la publicación
                    </div>
                  </div>
                  <div className="flex justify-between text-gray-500 text-sm">
                    <button className="hover:text-[#3d7b6f]">Me gusta</button>
                    <button className="hover:text-[#3d7b6f]">Comentar</button>
                    <button className="hover:text-[#3d7b6f]">Compartir</button>
                  </div>
                </div>
                
                {/* Publicación de ejemplo 2 */}
                <div className="border-t pt-4 pb-6">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gray-300"></div>
                    <div>
                      <p className="font-medium">Otro Usuario</p>
                      <p className="text-xs text-gray-500">{formatDate(new Date(Date.now() - 86400000).toISOString())}</p>
                    </div>
                  </div>
                  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed vitae justo vel magna sagittis imperdiet sit amet eget sapien.</p>
                  <div className="flex justify-between text-gray-500 text-sm mt-4">
                    <button className="hover:text-[#3d7b6f]">Me gusta</button>
                    <button className="hover:text-[#3d7b6f]">Comentar</button>
                    <button className="hover:text-[#3d7b6f]">Compartir</button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'miembros' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Miembros del grupo</h2>
              <MiembrosGrupo grupoId={parseInt(id!)} />
            </div>
          )}
          
          {activeTab === 'informacion' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Información del grupo</h2>
              <GrupoDetalle grupo={grupo} />
            </div>
          )}
        </div>
        
        {/* Columna derecha - Detalles e información */}
        <div>
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Detalles</h2>
            <div className="space-y-3">
              <div className="flex">
                <span className="material-icons text-gray-500 mr-3">description</span>
                <p>{grupo.descripcion}</p>
              </div>
              <div className="flex">
                <span className="material-icons text-gray-500 mr-3">people</span>
                <p>{miembros.length} miembros</p>
              </div>
              <div className="flex">
                <span className="material-icons text-gray-500 mr-3">calendar_today</span>
                <p>Creado el {formatDate(grupo.fecha_creacion)}</p>
              </div>
              
              {/* Administradores del grupo */}
              <div className="pt-3 border-t mt-3">
                <h3 className="font-medium mb-2">Administradores</h3>
                {miembros
                  .filter(m => m.rol === 'ADMINISTRADOR')
                  .map(admin => (
                    <div key={admin.id} className="flex items-center space-x-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
                        {admin.nombreUsuario?.charAt(0).toUpperCase()}
                      </div>
                      <span>{admin.nombreUsuario} {admin.apellidoUsuario}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Contacto</h2>
            <div className="space-y-3">
              <div className="flex">
                <span className="material-icons text-gray-500 mr-3">email</span>
                <p>info@patitasconectadas.com</p>
              </div>
              <div className="flex">
                <span className="material-icons text-gray-500 mr-3">phone</span>
                <p>+34 91 123 45 67</p>
              </div>
              <div className="flex">
                <span className="material-icons text-gray-500 mr-3">language</span>
                <p>www.patitasconectadas.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GrupoVista; 
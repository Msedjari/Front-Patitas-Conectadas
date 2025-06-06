import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ActionButton from '../components/common/ActionButton';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import GrupoForm from '../components/groups/GrupoForm';
import GruposList from '../components/groups/GruposList';
import DeleteGrupoDialog from '../components/groups/DeleteGrupoDialog';
import { config } from '../config';
import { 
  Group as Grupo, 
  fetchGroups, 
  fetchGroupById, 
  createGroup, 
  updateGroup, 
  deleteGroup,
  joinGroup,
  verifyAuthToken,
  fetchGruposByUsuarioId
} from '../services/groupService';

/**
 * Componente principal para la gestión de grupos
 * Permite ver, crear, editar, eliminar y unirse a grupos
 */
const Grupos: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [misGrupos, setMisGrupos] = useState<Grupo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingGrupo, setEditingGrupo] = useState<Grupo | null>(null);
  const [tokenError, setTokenError] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'todos' | 'misGrupos'>('todos');
  // Estado para el diálogo de confirmación de eliminación
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [grupoToDelete, setGrupoToDelete] = useState<Grupo | null>(null);
  
  // Cargar grupos al montar el componente
  useEffect(() => {
    fetchGruposData();
  }, []);
  
  // Cargar grupos del usuario
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchMisGrupos();
    }
  }, [isAuthenticated, user]);
  
  // Verificar token
  useEffect(() => {
    const checkToken = async () => {
      const tokenExists = localStorage.getItem(config.session.tokenKey);
      if (!tokenExists && isAuthenticated) {
        console.error('No se encontró token de autenticación aunque el usuario está autenticado');
        setTokenError(true);
        return;
      }
      
      // Verificar si el token es válido
      if (tokenExists) {
        const isValid = await verifyAuthToken();
        if (!isValid) {
          console.error('El token de autenticación no es válido');
          setTokenError(true);
        } else {
          setTokenError(false);
        }
      }
    };
    
    checkToken();
  }, [isAuthenticated]);
  
  // Función para cargar los grupos desde la API
  const fetchGruposData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await fetchGroups();
      setGrupos(data);
    } catch (err) {
      console.error('Error al cargar grupos:', err);
      setError('No se pudieron cargar los grupos. Intenta de nuevo más tarde.');
      
      // Para desarrollo, cargamos datos de prueba
      if (import.meta.env.DEV) {
        console.log('Cargando datos de prueba para desarrollo');
        setGrupos([
          {
            id: 1,
            nombre: 'Amantes de los perros',
            descripcion: 'Grupo para compartir experiencias con nuestros amigos caninos',
            num_miembros: 45,
            fecha_creacion: '2023-01-15T00:00:00.000Z'
          },
          {
            id: 2,
            nombre: 'Gatos del mundo',
            descripcion: 'Todo sobre felinos domésticos',
            num_miembros: 32,
            fecha_creacion: '2023-02-20T00:00:00.000Z'
          }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Función para cargar los grupos del usuario
  const fetchMisGrupos = async () => {
    try {
      if (!user?.id) return;
      
      const userId = typeof user.id === 'string' ? parseInt(user.id) : user.id;
      const userGroups = await fetchGruposByUsuarioId(userId);
      
      // Extraer los grupos completos
      const gruposIds = userGroups.map(ug => ug.grupoId);
      
      // Filtrar los grupos que ya tenemos cargados
      const misGruposData = grupos.filter(g => gruposIds.includes(g.id!));
      
      setMisGrupos(misGruposData);
    } catch (err) {
      console.error('Error al cargar grupos del usuario:', err);
    }
  };
  
  // Manejar envío del formulario (crear o editar grupo)
  const handleSubmitGrupo = async (formData: Grupo) => {
    try {
      // Verificar si hay token de autenticación
      const token = localStorage.getItem(config.session.tokenKey);
      if (!token) {
        throw new Error('No hay token de autenticación. Por favor, inicia sesión nuevamente.');
      }
      
      setLoading(true);
      
      // Preparar los datos del grupo
      const grupoData = {
        nombre: formData.nombre,
        descripcion: formData.descripcion
      };
      
      let updatedGrupo: Grupo;
      
      if (editingGrupo?.id) {
        // Actualizar grupo existente
        console.log(`Actualizando grupo ${editingGrupo.id} con datos:`, grupoData);
        updatedGrupo = await updateGroup(editingGrupo.id, grupoData);
        
        // Actualizar el estado con el grupo actualizado
        setGrupos(grupos.map(g => 
          g.id === editingGrupo.id ? updatedGrupo : g
        ));
      } else {
        // Crear nuevo grupo
        if (user?.id) {
          // Asegurarnos de que el ID del usuario sea un número
          const userId = typeof user.id === 'string' ? parseInt(user.id) : user.id;
          
          // Para creación, añadimos el id del creador según la API. 
          // Este será enviado como parámetro de consulta en la URL.
          const newGrupoData = {
            ...grupoData,
            creador_id: userId
          };
          
          console.log('Enviando datos para crear grupo:', newGrupoData);
          console.log('ID de usuario (type):', typeof userId, userId);
          
          updatedGrupo = await createGroup(newGrupoData);
          
          console.log('Grupo creado con éxito:', updatedGrupo);
          
          // Agregar el nuevo grupo al estado
          setGrupos([...grupos, updatedGrupo]);
        } else {
          throw new Error('No se pudo obtener el ID del usuario para crear el grupo');
        }
      }
      
      // Después de crear o actualizar, refrescar mis grupos
      if (isAuthenticated && user?.id) {
        fetchMisGrupos();
      }
      
      // Resetear formulario y ocultarlo
      resetForm();
      setShowForm(false);
      setError(null);
    } catch (err) {
      console.error('Error al guardar grupo:', err);
      
      // Obtener un mensaje de error más específico
      let errorMessage = 'No se pudo guardar el grupo. Por favor, intenta de nuevo.';
      
      if (err instanceof Error) {
        console.error('Detalles del error:', err.message);
        errorMessage = err.message || errorMessage;
      }
      
      // Mostrar el error al usuario
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  // Preparar edición de grupo
  const handleEdit = (grupo: Grupo) => {
    setEditingGrupo(grupo);
    setShowForm(true);
  };
  
  // Mostrar diálogo de confirmación de eliminación
  const handleShowDeleteDialog = (grupo: Grupo) => {
    setGrupoToDelete(grupo);
    setDeleteDialogOpen(true);
  };
  
  // Cerrar diálogo de eliminación
  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setGrupoToDelete(null);
  };
  
  // Eliminar grupo después de confirmar
  const handleConfirmDelete = async (grupo: Grupo) => {
    if (!grupo.id) return;
    
    try {
      setLoading(true);
      
      // Usar el servicio para eliminar el grupo
      await deleteGroup(grupo.id);
      
      // Eliminar del estado
      setGrupos(grupos.filter(g => g.id !== grupo.id));
      setError(null);
      
      // Cerrar el diálogo
      setDeleteDialogOpen(false);
      setGrupoToDelete(null);
    } catch (err) {
      console.error('Error al eliminar grupo:', err);
      setError('No se pudo eliminar el grupo. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };
  
  // Unirse a un grupo
  const handleJoinGroup = async (grupo: Grupo) => {
    if (!grupo.id || !user?.id) return;
    
    try {
      setLoading(true);
      
      // Asegurarnos de que el ID del usuario sea un número
      const userId = typeof user.id === 'string' ? parseInt(user.id) : user.id;
      
      // Usar el servicio para unirse al grupo
      console.log(`Intentando unir usuario ${userId} al grupo ${grupo.id}`);
      await joinGroup(grupo.id, userId);
      
      // Actualizar el número de miembros en el estado
      setGrupos(grupos.map(g => {
        if (g.id === grupo.id) {
          return {
            ...g,
            num_miembros: (g.num_miembros || 0) + 1
          };
        }
        return g;
      }));
      
      setError(null);
    } catch (err) {
      console.error('Error al unirse al grupo:', err);
      
      // Obtener un mensaje de error más específico
      let errorMessage = 'No se pudo unir al grupo. Por favor, intenta de nuevo.';
      
      if (err instanceof Error) {
        console.error('Detalles del error:', err.message);
        errorMessage = err.message || errorMessage;
      }
      
      // Mostrar el error al usuario
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  // Limpiar el formulario
  const resetForm = () => {
    setEditingGrupo(null);
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
  
  if (loading && grupos.length === 0) {
    return <LoadingSpinner className="my-5" />;
  }
  
  return (
    <div className="container mx-auto py-8 max-w-6xl px-4">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-[#3d7b6f]">Grupos</h1>
          <ActionButton 
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}
          >
            {showForm ? 'Cancelar' : 'Crear Grupo'}
          </ActionButton>
        </div>
        
        {/* Mensaje de error de token */}
        {tokenError && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
            <p className="font-bold">Error de autenticación</p>
            <p>
              No se encontró un token de autenticación válido. Por favor, 
              <a href="/login" className="underline ml-1">inicia sesión nuevamente</a>.
            </p>
          </div>
        )}
        
        {/* Mensaje de error */}
        <ErrorMessage 
          message={error} 
          onClose={() => setError(null)}
          onRetry={fetchGruposData}
        />
        
        {/* Formulario para crear/editar grupo */}
        {showForm && (
          <GrupoForm 
            initialData={editingGrupo || undefined}
            onSubmit={handleSubmitGrupo}
            onCancel={() => {
              resetForm();
              setShowForm(false);
            }}
            isLoading={loading}
          />
        )}
        
        {/* Pestañas para alternar entre todos los grupos y mis grupos */}
        {isAuthenticated && (
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex -mb-px">
              <button
                className={`py-2 px-4 border-b-2 font-medium text-sm ${
                  activeTab === 'todos' 
                    ? 'border-[#3d7b6f] text-[#3d7b6f]' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('todos')}
              >
                Todos los grupos
              </button>
              <button
                className={`py-2 px-4 border-b-2 font-medium text-sm ${
                  activeTab === 'misGrupos' 
                    ? 'border-[#3d7b6f] text-[#3d7b6f]' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('misGrupos')}
              >
                Mis grupos
              </button>
            </nav>
          </div>
        )}
        
        {/* Lista de grupos */}
        {activeTab === 'todos' ? (
          <GruposList 
            grupos={grupos}
            onEdit={handleEdit}
            onDelete={handleShowDeleteDialog}
            formatDate={formatDate}
            onCreateNew={() => setShowForm(true)}
            userId={user?.id}
          />
        ) : (
          <GruposList 
            grupos={misGrupos}
            onEdit={handleEdit}
            onDelete={handleShowDeleteDialog}
            formatDate={formatDate}
            onCreateNew={() => setShowForm(true)}
            userId={user?.id}
            emptyMessage="No perteneces a ningún grupo todavía. ¡Únete a alguno o crea el tuyo propio!"
          />
        )}
        
        {/* Diálogo de confirmación para eliminar grupo */}
        <DeleteGrupoDialog
          isOpen={deleteDialogOpen}
          grupo={grupoToDelete}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          isLoading={loading}
        />
      </div>
    </div>
  );
};

export default Grupos; 
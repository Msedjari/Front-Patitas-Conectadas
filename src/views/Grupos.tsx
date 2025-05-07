import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ActionButton from '../components/common/ActionButton';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import GrupoForm from '../components/grupos/GrupoForm';
import GruposList from '../components/grupos/GruposList';
import { config } from '../config';
import { 
  Group as Grupo, 
  fetchGroups, 
  fetchGroupById, 
  createGroup, 
  updateGroup, 
  deleteGroup,
  joinGroup
} from '../services/groupService';

/**
 * Componente principal para la gestión de grupos
 * Permite ver, crear, editar, eliminar y unirse a grupos
 */
const Grupos: React.FC = () => {
  const { user } = useAuth();
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingGrupo, setEditingGrupo] = useState<Grupo | null>(null);
  
  // Cargar grupos al montar el componente
  useEffect(() => {
    fetchGruposData();
  }, []);
  
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
  
  // Manejar envío del formulario (crear o editar grupo)
  const handleSubmitGrupo = async (formData: Grupo) => {
    try {
      setLoading(true);
      
      // Preparar los datos del grupo
      const grupoData = {
        nombre: formData.nombre,
        descripcion: formData.descripcion
      };
      
      let updatedGrupo: Grupo;
      
      if (editingGrupo?.id) {
        // Actualizar grupo existente
        updatedGrupo = await updateGroup(editingGrupo.id, grupoData);
        
        // Actualizar el estado con el grupo actualizado
        setGrupos(grupos.map(g => 
          g.id === editingGrupo.id ? updatedGrupo : g
        ));
      } else {
        // Crear nuevo grupo
        if (user?.id) {
          // Añadimos el creador_id si estamos creando
          const newGrupoData = {
            ...grupoData,
            creador_id: parseInt(user.id)
          };
          
          updatedGrupo = await createGroup(newGrupoData);
          
          // Agregar el nuevo grupo al estado
          setGrupos([...grupos, updatedGrupo]);
        }
      }
      
      // Resetear formulario y ocultarlo
      resetForm();
      setShowForm(false);
      setError(null);
    } catch (err) {
      console.error('Error al guardar grupo:', err);
      setError('No se pudo guardar el grupo. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };
  
  // Preparar edición de grupo
  const handleEdit = (grupo: Grupo) => {
    setEditingGrupo(grupo);
    setShowForm(true);
  };
  
  // Eliminar grupo
  const handleDelete = async (grupo: Grupo) => {
    if (!grupo.id) return;
    
    if (!confirm(`¿Estás seguro de eliminar el grupo "${grupo.nombre}"?`)) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Usar el servicio para eliminar el grupo
      await deleteGroup(grupo.id);
      
      // Eliminar del estado
      setGrupos(grupos.filter(g => g.id !== grupo.id));
      setError(null);
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
      
      // Usar el servicio para unirse al grupo
      await joinGroup(grupo.id, parseInt(user.id));
      
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
      setError('No se pudo unir al grupo. Por favor, intenta de nuevo.');
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
        
        {/* Lista de grupos */}
        <GruposList 
          grupos={grupos}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onJoin={handleJoinGroup}
          formatDate={formatDate}
          onCreateNew={() => setShowForm(true)}
        />
      </div>
    </div>
  );
};

export default Grupos; 
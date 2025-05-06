import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { config } from '../config';

/**
 * Interfaz para el modelo de Grupo
 * Define la estructura de datos para los grupos en la aplicación
 */
interface Grupo {
  id?: number;
  nombre: string;
  descripcion: string;
  num_miembros?: number;
  fecha_creacion?: string;
  creador_id?: number;
}

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
  
  // Estado para el formulario
  const [formData, setFormData] = useState({
    creador_id: user?.id ? parseInt(user.id) : undefined,
    nombre: '',
    descripcion: ''
  });
  
  // Cargar grupos al montar el componente
  useEffect(() => {
    const fetchGrupos = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem(config.session.tokenKey);
        
        // URL de la API según documentación
        const url = `${config.apiUrl}/grupos`;
        console.log('Obteniendo grupos desde:', url);
        
        // Incluir token de autenticación en la cabecera según documentación
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          console.error('Error en la respuesta:', response.status, response.statusText);
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Grupos obtenidos:', data);
        setGrupos(data);
        setError(null);
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
    
    fetchGrupos();
  }, []);
  
  // Manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  // Limpiar el formulario
  const resetForm = () => {
    setFormData({
      creador_id: user?.id ? parseInt(user.id) : undefined,
      nombre: '',
      descripcion: ''
    });
    setEditingGrupo(null);
  };
  
  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const token = localStorage.getItem(config.session.tokenKey);
      
      if (!token) {
        throw new Error('No hay token de autenticación disponible');
      }
      
      // Datos a enviar según documentación
      const grupoData = {
        nombre: formData.nombre,
        descripcion: formData.descripcion
      };
      
      console.log('Enviando datos de grupo:', grupoData);
      
      if (editingGrupo) {
        // Actualizar grupo existente
        // PUT /grupos/{id} según documentación
        const url = `${config.apiUrl}/grupos/${editingGrupo.id}`;
        console.log('URL para actualizar grupo:', url);
        
        const response = await fetch(url, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(grupoData)
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error en la respuesta:', response.status, errorText);
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }
        
        const updated = await response.json();
        console.log('Grupo actualizado:', updated);
        
        // Actualizar el estado con el grupo actualizado
        setGrupos(grupos.map(g => 
          g.id === editingGrupo.id ? updated : g
        ));
      } else {
        // Crear nuevo grupo
        // POST /grupos?usuarioId={usuarioId} según documentación
        const url = `${config.apiUrl}/grupos${user?.id ? `?usuarioId=${user.id}` : ''}`;
        console.log('URL para crear grupo:', url);
        
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(grupoData)
        });
        
        console.log('Respuesta status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error en la respuesta:', response.status, errorText);
          throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
        }
        
        const newGrupo = await response.json();
        console.log('Nuevo grupo creado:', newGrupo);
        
        // Agregar el nuevo grupo al estado
        setGrupos([...grupos, newGrupo]);
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
    setFormData({
      creador_id: grupo.creador_id,
      nombre: grupo.nombre,
      descripcion: grupo.descripcion
    });
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
      const token = localStorage.getItem(config.session.tokenKey);
      
      // DELETE /grupos/{id} según documentación
      const response = await fetch(`${config.apiUrl}/grupos/${grupo.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error en la respuesta:', response.status, errorText);
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }
      
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
      const token = localStorage.getItem(config.session.tokenKey);
      
      // Usando la ruta correcta para unirse a un grupo: /usuario-grupo/${id}
      const response = await fetch(`${config.apiUrl}/usuario-grupo/${grupo.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          usuario_id: parseInt(user.id)
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error en la respuesta:', response.status, errorText);
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }
      
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
    return (
      <div className="flex justify-center my-5">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#6cda84]"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 max-w-6xl px-4">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-[#3d7b6f]">Grupos</h1>
          <button 
            className="bg-[#6cda84] text-white px-4 py-2 rounded-md hover:bg-[#38cd58]"
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}
          >
            {showForm ? 'Cancelar' : 'Crear Grupo'}
          </button>
        </div>
        
        {/* Mensaje de error */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
            <p>{error}</p>
            <button 
              className="mt-2 text-sm underline"
              onClick={() => {
                setError(null);
              }}
            >
              Cerrar
            </button>
          </div>
        )}
        
        {/* Formulario para crear/editar grupo */}
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-[#f8ffe5] p-6 rounded-lg mb-6 border border-[#9fe0b7]">
            <h3 className="text-[#3d7b6f] font-medium mb-4 text-xl">
              {editingGrupo ? `Editar grupo: ${editingGrupo.nombre}` : 'Crear nuevo grupo'}
            </h3>
            
            <div className="mb-4">
              <label htmlFor="nombre" className="block text-sm font-medium text-[#2a2827] mb-1">
                Nombre del grupo
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                required
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9fe0b7]"
                placeholder="Nombre del grupo"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="descripcion" className="block text-sm font-medium text-[#2a2827] mb-1">
                Descripción
              </label>
              <textarea
                id="descripcion"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9fe0b7]"
                placeholder="Describe el propósito del grupo"
              ></textarea>
            </div>
            
            <div className="flex justify-end">
              <button 
                type="button" 
                className="mr-2 px-4 py-2 text-[#3d7b6f] border border-[#3d7b6f] rounded-md hover:bg-[#f0fff0]"
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
              >
                Cancelar
              </button>
              <button 
                type="submit"
                className="px-4 py-2 bg-[#6cda84] text-white rounded-md hover:bg-[#38cd58]"
                disabled={loading}
              >
                {loading ? 'Guardando...' : (editingGrupo ? 'Actualizar' : 'Crear')}
              </button>
            </div>
          </form>
        )}
        
        {/* Lista de grupos */}
        {grupos.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-lg">
            <p className="text-gray-500 mb-2">No hay grupos disponibles.</p>
            {!showForm && (
              <button 
                className="text-[#3d7b6f] underline"
                onClick={() => setShowForm(true)}
              >
                Crea el primer grupo
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {grupos.map(grupo => (
              <div 
                key={grupo.id} 
                className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col"
              >
                <div className="p-4 flex-grow">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold text-[#3d7b6f] mb-2">{grupo.nombre}</h3>
                    
                    <div className="flex space-x-2">
                      <button 
                        className="text-[#2e82dc] hover:text-[#1f68b5]"
                        onClick={() => handleEdit(grupo)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      <button 
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleDelete(grupo)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-[#575350] text-sm mb-3 line-clamp-3">{grupo.descripcion}</p>
                  
                  <div className="flex items-center text-[#3d7b6f] text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    <span>{grupo.num_miembros || 0} miembros</span>
                  </div>
                  
                  <div className="text-xs text-[#575350] mt-2">
                    Creado el {formatDate(grupo.fecha_creacion)}
                  </div>
                </div>
                
                <div className="p-4 border-t border-gray-100">
                  <button 
                    className="w-full bg-[#6cda84] text-white py-2 rounded-md hover:bg-[#38cd58]"
                    onClick={() => handleJoinGroup(grupo)}
                  >
                    Unirse al grupo
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Grupos; 
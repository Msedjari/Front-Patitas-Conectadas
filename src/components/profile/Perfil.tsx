/**
 * Componente de Perfil de Usuario
 * 
 * Este componente permite visualizar y editar la información del perfil de usuario.
 * Muestra datos personales, estadísticas, y enlaces a otras secciones relacionadas.
 * Integra funcionalidades de carga, edición y actualización de perfiles mediante la API.
 */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchCurrentUserProfile, updateProfile, Profile } from '../../services/profileService';
import { config } from '../../config';
import { Link } from 'react-router-dom';

/**
 * Componente de Perfil de usuario
 * Muestra los datos del perfil y permite editarlos
 */
const Perfil: React.FC = () => {
  // Acceso al contexto de autenticación para obtener datos del usuario loggeado
  const { user, refreshUserData } = useAuth();
  
  // Estados principales para manejar el perfil y la interfaz
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  
  // Estados para los campos editables del perfil
  const [descripcion, setDescripcion] = useState('');
  const [intereses, setIntereses] = useState<string[]>([]);
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [newInterest, setNewInterest] = useState('');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>('');
  
  // Estado para las estadísticas del usuario
  const [estadisticas, setEstadisticas] = useState<{
    publicaciones: number;
    amigos: number;
    mascotas: number;
    comentarios: number;
  }>({ publicaciones: 0, amigos: 0, mascotas: 0, comentarios: 0 });
  
  /**
   * Obtiene los headers de autenticación necesarios para las peticiones a la API
   * @param includeContentType - Si se debe incluir el header Content-Type (por defecto true)
   * @returns Objeto con los headers necesarios
   */
  const getAuthHeaders = (includeContentType = true): Record<string, string> => {
    const token = localStorage.getItem(config.session.tokenKey);
    const headers: Record<string, string> = {};
    
    // Agregar token de autenticación si existe
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Agregar Content-Type si se solicita (para peticiones JSON)
    if (includeContentType) {
      headers['Content-Type'] = 'application/json';
    }
    
    console.log('Headers generados:', headers);
    return headers;
  };
  
  /**
   * Efecto para cargar los datos del perfil cuando el componente se monta
   * o cuando cambia el usuario autenticado.
   * 
   * Este efecto realiza las siguientes operaciones:
   * 1. Obtiene todos los perfiles del sistema
   * 2. Filtra el perfil correspondiente al usuario actual
   * 3. Si no existe, crea un nuevo perfil en blanco
   * 4. Carga las estadísticas del usuario
   */
  useEffect(() => {
    const loadProfile = async () => {
      // Verificar si hay un usuario autenticado
      if (!user) {
        console.log('No hay usuario autenticado, no se puede cargar el perfil');
        setLoading(false);
        setError('No hay usuario autenticado. Por favor, inicia sesión.');
        return;
      }
      
      try {
        // Iniciar el estado de carga
        setLoading(true);
        console.log('Intentando cargar perfil para usuario:', user.id);
        
        // Primero, intentamos obtener el perfil directamente si existiera un endpoint para ello
        try {
          // Intentar obtener el perfil directamente por usuario_id si existe un endpoint específico
          const userProfileResponse = await fetch(`${config.apiUrl}/perfiles/usuario/${user.id}`, {
            headers: getAuthHeaders(false)
          });
          
          if (userProfileResponse.ok) {
            // Si la respuesta es exitosa, podemos usar el perfil directamente
            const userProfile = await userProfileResponse.json();
            console.log('Perfil obtenido directamente:', userProfile);
            
            setProfile(userProfile);
            setDescripcion(userProfile.descripcion || '');
            setIntereses(userProfile.intereses || []);
            setFechaNacimiento(userProfile.fecha_nacimiento || '');
            
            // Obtenemos estadísticas y terminamos
            await loadStatistics(user.id);
            setLoading(false);
            return;
          }
          
          // Si llegamos aquí, el endpoint específico no existe o falló
          console.log('Endpoint específico no disponible, intentando método alternativo');
        } catch (directFetchError) {
          console.log('Error al buscar perfil directo, usando método alternativo:', directFetchError);
        }
        
        // Método alternativo: obtener todos los perfiles y filtrar
        console.log('Obteniendo todos los perfiles para filtrar');
        const response = await fetch(`${config.apiUrl}/perfiles`, {
          headers: getAuthHeaders(false)
        });
        
        if (!response.ok) {
          throw new Error(`Error al obtener perfiles: ${response.status}`);
        }
        
        const perfiles = await response.json();
        console.log('Perfiles recibidos:', perfiles);
        
        // Buscar el perfil por usuario_id
        const userProfile = perfiles.find((p: Profile) => p.usuario_id === parseInt(user.id));
        console.log('Perfil encontrado para usuario:', userProfile);
        
        if (userProfile) {
          // Si encontramos el perfil, actualizamos el estado con los datos
          setProfile(userProfile);
          
          // Inicializar los estados individuales con los datos del perfil
          // Si algún valor no existe, usamos valores por defecto
          setDescripcion(userProfile.descripcion || '');
          setIntereses(userProfile.intereses || []);
          setFechaNacimiento(userProfile.fecha_nacimiento || '');
        } else {
          // Si no existe un perfil para este usuario, creamos uno nuevo
          console.log('No se encontró perfil, creando uno nuevo');
          
          // Preparar datos básicos para el nuevo perfil
          const newProfileData = {
            usuario_id: parseInt(user.id), // Asociar al usuario actual
            descripcion: '',               // Descripción vacía inicialmente
            fecha_nacimiento: '',          // Sin fecha de nacimiento inicial
            intereses: []                  // Sin intereses iniciales
          };
          
          // Petición POST para crear el nuevo perfil
          const createResponse = await fetch(`${config.apiUrl}/perfiles`, {
            method: 'POST',
            headers: {
              ...getAuthHeaders(false), // Incluir token para autenticación
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(newProfileData)
          });
          
          // Verificar si la creación fue exitosa
          if (!createResponse.ok) {
            throw new Error(`Error al crear perfil: ${createResponse.status}`);
          }
          
          // Procesar la respuesta que contiene el perfil recién creado
          const createdProfile = await createResponse.json();
          console.log('Perfil creado:', createdProfile);
          
          // Actualizar estados con el perfil creado (básicamente vacío)
          setProfile(createdProfile);
          setDescripcion('');
          setIntereses([]);
          setFechaNacimiento('');
        }
        
        // Cargar estadísticas del usuario
        await loadStatistics(user.id);
        
      } catch (err) {
        // Manejar errores generales en la carga del perfil
        console.error('Error al cargar el perfil:', err);
        setError('No se pudo cargar el perfil. Por favor, intenta de nuevo más tarde.');
      } finally {
        // Siempre terminamos el estado de carga
        setLoading(false);
      }
    };
    
    // Función auxiliar para cargar estadísticas del usuario
    const loadStatistics = async (userId: string) => {
      try {
        console.log('Obteniendo estadísticas para usuario:', userId);
        const statsResponse = await fetch(`${config.apiUrl}/usuarios/${userId}/estadisticas`, {
          headers: getAuthHeaders(false)
        });
        
        if (statsResponse.ok) {
          // Si obtenemos estadísticas correctamente, actualizamos el estado
          const estadisticasData = await statsResponse.json();
          console.log('Estadísticas obtenidas:', estadisticasData);
          setEstadisticas(estadisticasData);
        } else {
          // Si hay error al obtener estadísticas, usamos valores por defecto
          console.error('Error al obtener estadísticas:', statsResponse.status);
          setEstadisticas({
            publicaciones: 0,
            amigos: 0,
            mascotas: 0,
            comentarios: 0
          });
        }
      } catch (estadisticasError) {
        // Capturamos errores específicos de la carga de estadísticas
        // pero no interrumpimos el flujo principal
        console.error('Error al cargar estadísticas:', estadisticasError);
      }
    };
    
    // Ejecutar la función de carga
    loadProfile();
    
    // Este efecto se ejecuta cuando cambia el usuario (al login/logout)
  }, [user]);
  
  /**
   * Maneja el envío del formulario de edición del perfil
   * Procesa la actualización de la información y la subida de imágenes
   * @param e - Evento del formulario
   */
  const handleSubmit = async (e: React.FormEvent) => {
    // Prevenir el comportamiento predeterminado del formulario
    e.preventDefault();
    
    // Verificar que tenemos usuario y perfil antes de continuar
    if (!user || !profile) return;
    
    try {
      // Activar estado de carga
      setLoading(true);
      
      // Preparar datos para actualizar con tipo explícito para incluir img opcional
      const updatedData: {
        descripcion: string;
        intereses: string[];
        fecha_nacimiento: string;
        img?: string;
      } = {
        descripcion,
        intereses,
        fecha_nacimiento: fechaNacimiento
      };
      
      console.log('Datos para actualizar:', updatedData);
      
      // Verificar si hay una nueva imagen para subir
      if (profileImage) {
        // Crear FormData para subir la imagen
        const formData = new FormData();
        formData.append('imagen', profileImage);
        
        // Endpoint para subir imágenes de perfil
        const uploadResponse = await fetch(`${config.apiUrl}/upload/profile-image`, {
          method: 'POST',
          headers: getAuthHeaders(false), // No incluir Content-Type para FormData
          body: formData
        });
        
        if (!uploadResponse.ok) {
          throw new Error(`Error al subir imagen: ${uploadResponse.statusText}`);
        }
        
        // Extraer URL de la imagen subida
        const { imageUrl } = await uploadResponse.json();
        
        // Agregar URL de imagen a los datos de actualización
        updatedData.img = imageUrl;
      }
      
      // Actualizar el perfil con los nuevos datos
      // Nota: Según la API proporcionada, usamos POST para actualizaciones
      const response = await fetch(`${config.apiUrl}/perfiles/${profile.id}`, {
        method: 'POST',  // Usando POST en lugar de PUT según la documentación API
        headers: {
          ...getAuthHeaders(true),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedData)
      });
      
      if (!response.ok) {
        throw new Error(`Error al actualizar perfil: ${response.statusText}`);
      }
      
      // Procesar la respuesta con el perfil actualizado
      const updatedProfile = await response.json();
      
      // Actualizar el estado con el perfil actualizado
      setProfile(updatedProfile);
      
      // Mostrar mensaje de éxito temporal
      setSuccessMessage('¡Perfil actualizado correctamente!');
      setTimeout(() => setSuccessMessage(''), 3000);
      
    } catch (error) {
      // Manejar errores de actualización
      console.error('Error al actualizar perfil:', error);
      setError('Error al actualizar el perfil. Por favor, intenta de nuevo.');
      setTimeout(() => setError(''), 5000);
    } finally {
      // Desactivar estado de carga
      setLoading(false);
      // Limpiar el archivo de imagen temporal
      setProfileImage(null);
    }
  };
  
  /**
   * Maneja el cambio de imagen de perfil
   * Actualiza el estado con el archivo seleccionado y genera una vista previa
   * @param e - Evento del input de tipo file
   */
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Verificar que se seleccionó al menos un archivo
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]; // Obtener el primer archivo seleccionado
      setProfileImage(file); // Guardar el archivo en el estado
      
      // Crear una URL temporal para previsualizar la imagen
      setImagePreview(URL.createObjectURL(file));
    }
  };
  
  /**
   * Añade un nuevo interés a la lista
   * Verifica que el interés no esté vacío y no exista ya en la lista
   */
  const handleAddInterest = () => {
    // Verificar que el interés no esté vacío después de eliminar espacios
    // y que no exista ya en la lista actual (para evitar duplicados)
    if (newInterest.trim() && !intereses.includes(newInterest.trim())) {
      // Añadir el nuevo interés al array actual
      setIntereses([...intereses, newInterest.trim()]);
      // Limpiar el campo para facilitar la adición de más intereses
      setNewInterest('');
    }
  };
  
  /**
   * Elimina un interés de la lista
   * @param interest - Texto del interés a eliminar
   */
  const handleRemoveInterest = (interest: string) => {
    // Filtrar la lista de intereses para excluir el que queremos eliminar
    setIntereses(intereses.filter(i => i !== interest));
  };
  
  /**
   * Formatea una fecha ISO a un formato legible
   * @param dateString - Fecha en formato ISO o compatible con Date
   * @returns Fecha formateada en formato local (ejemplo: "15 de Junio de 2023")
   */
  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'No disponible';
    
    try {
      const date = new Date(dateString);
      
      // Verificar si la fecha es válida
      if (isNaN(date.getTime())) {
        return 'Fecha inválida';
      }
      
      // Formatear la fecha usando Intl.DateTimeFormat para localización
      return new Intl.DateTimeFormat('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date);
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return 'Error en formato de fecha';
    }
  };
  
  /**
   * Función para verificar la conectividad con la API y mostrar información de diagnóstico
   * Esta función ayuda a identificar problemas de conexión o de backend
   */
  const checkApiConnectivity = async () => {
    setLoading(true);
    
    try {
      // Mostrar información relevante para debugging
      console.log('URL Base API:', config.apiUrl);
      console.log('Headers de autenticación:', getAuthHeaders());
      
      // Verificar si el usuario está autenticado
      console.log('Datos de usuario:', user);
      
      // Intentar una petición simple para verificar conectividad
      const response = await fetch(`${config.apiUrl}/health-check`, {
        headers: getAuthHeaders()
      });
      
      console.log('Estado del servidor (health check):', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Respuesta del health check:', data);
        alert('Conexión exitosa con el servidor. Ver consola para más detalles.');
      } else {
        // Si el health-check no existe, intentar con otro endpoint conocido
        const profilesResponse = await fetch(`${config.apiUrl}/perfiles`, {
          headers: getAuthHeaders()
        });
        
        if (profilesResponse.ok) {
          alert(`API accesible pero health-check no disponible. Estado: ${profilesResponse.status}`);
        } else {
          alert(`Error de conexión. Código: ${response.status}. Detalles en consola.`);
        }
      }
    } catch (error) {
      console.error('Error al verificar conectividad:', error);
      alert(`Error de conexión: ${error instanceof Error ? error.message : 'Desconocido'}`);
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Render condicional si no hay perfil disponible y no está cargando
   * Muestra un mensaje de error amigable con opción para reintentar
   */
  if (!profile && !loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 text-center">
        <p className="text-[#3d7b6f] font-medium mb-3">Perfil no disponible</p>
        <p className="text-[#575350] mb-4">
          {error || "No se pudo cargar la información de tu perfil. Asegúrate de estar conectado."}
        </p>
        <button 
          onClick={() => window.location.reload()} // Recargar la página para reintentar
          className="px-4 py-2 bg-[#6cda84] text-white rounded-md hover:bg-[#38cd58]"
        >
          Intentar de nuevo
        </button>
      </div>
    );
  }
  
  /**
   * Render condicional si hay un error específico durante la carga
   */
  if (error && !loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 text-center">
        <p className="text-red-500 font-medium mb-3">Error al cargar el perfil</p>
        <p className="text-[#575350] mb-4">{error}</p>
        <button 
          onClick={() => {
            setError('');
            window.location.reload();
          }}
          className="px-4 py-2 bg-[#6cda84] text-white rounded-md hover:bg-[#38cd58]"
        >
          Intentar de nuevo
        </button>
      </div>
    );
  }
  
  /**
   * Render condicional durante la carga
   * Muestra un spinner o indicador de actividad
   */
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#6cda84] border-solid"></div>
      </div>
    );
  }
  
  /**
   * Render principal del perfil
   * Este es el layout que se muestra cuando el perfil está disponible
   */
  return (
    <div className="container mx-auto py-8 max-w-6xl px-4">
      {/* Mensaje de éxito */}
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 flex justify-between items-center">
          <span>{successMessage}</span>
          <button onClick={() => setSuccessMessage('')} className="text-green-700">
            <span className="text-xl">&times;</span>
          </button>
        </div>
      )}
      
      {/* Encabezado del perfil */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
        {/* Sección superior con imagen de fondo */}
        <div className="relative">
          <div className="h-40 bg-[#9fe0b7]"></div>
          <div className="absolute -bottom-16 left-6">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-gray-200">
                {profile?.img ? (
                  <img 
                    src={profile.img} 
                    alt="Foto de perfil" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-[#e0e0e0] text-[#a0a0a0]">
                    <span className="text-4xl">?</span>
                  </div>
                )}
              </div>
              {editMode && (
                <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Cambiar</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              )}
            </div>
          </div>
        </div>

        {/* Sección de información general */}
        <div className="pt-20 px-6 pb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-semibold text-[#3d7b6f]">
                {user?.nombre || "Usuario"} {user?.apellidos || ""}
              </h1>
              <p className="text-[#575350]">{user?.email || ""}</p>
            </div>
            <button
              onClick={() => setEditMode(!editMode)}
              className="px-4 py-2 bg-[#6cda84] text-white rounded-md hover:bg-[#38cd58]"
            >
              {editMode ? "Cancelar" : "Editar perfil"}
            </button>
          </div>

          {/* Estadísticas */}
          <div className="flex mb-6 space-x-4">
            <div className="text-center px-4">
              <div className="font-bold text-[#3d7b6f]">{estadisticas.publicaciones || 0}</div>
              <div className="text-sm text-[#575350]">Publicaciones</div>
            </div>
            <div className="text-center px-4">
              <div className="font-bold text-[#3d7b6f]">{estadisticas.amigos || 0}</div>
              <div className="text-sm text-[#575350]">Amigos</div>
            </div>
            <div className="text-center px-4">
              <div className="font-bold text-[#3d7b6f]">{estadisticas.mascotas || 0}</div>
              <div className="text-sm text-[#575350]">Mascotas</div>
            </div>
            <div className="text-center px-4">
              <div className="font-bold text-[#3d7b6f]">{estadisticas.comentarios || 0}</div>
              <div className="text-sm text-[#575350]">Comentarios</div>
            </div>
          </div>

          {/* Descripción e intereses */}
          {editMode ? (
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-[#3d7b6f] font-medium mb-2">
                  Descripción:
                </label>
                <textarea
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9fe0b7]"
                  rows={4}
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Describe quién eres..."
                ></textarea>
              </div>

              <div className="mb-4">
                <label className="block text-[#3d7b6f] font-medium mb-2">
                  Fecha de nacimiento:
                </label>
                <input
                  type="date"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9fe0b7]"
                  value={fechaNacimiento}
                  onChange={(e) => setFechaNacimiento(e.target.value)}
                />
              </div>

              <div className="mb-4">
                <label className="block text-[#3d7b6f] font-medium mb-2">
                  Intereses:
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {intereses.map((interes, index) => (
                    <span
                      key={index}
                      className="bg-[#9fe0b7] text-[#3d7b6f] px-3 py-1 rounded-full text-sm flex items-center"
                    >
                      {interes}
                      <button
                        type="button"
                        className="ml-2 text-[#3d7b6f] hover:text-red-600"
                        onClick={() => handleRemoveInterest(interes)}
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex">
                  <input 
                    type="text" 
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    className="flex-1 border border-gray-200 rounded-l-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#6cda84]"
                    placeholder="Añadir interés"
                  />
                  <button 
                    type="button"
                    className="bg-[#6cda84] text-white rounded-r-lg px-4 hover:bg-[#38cd58] transition-colors"
                    onClick={handleAddInterest}
                  >
                    Añadir
                  </button>
                </div>
              </div>
              
              <div className="flex justify-end mt-6">
                <button 
                  type="button"
                  className="px-4 py-2 border border-[#6cda84] text-[#6cda84] rounded-lg mr-2 hover:bg-[#f8ffe5] transition-colors"
                  onClick={() => setEditMode(false)}
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-[#6cda84] text-white rounded-lg hover:bg-[#38cd58] transition-colors"
                  disabled={loading}
                >
                  {loading ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </form>
          ) : (
            <div>
              <div className="mb-6">
                <h3 className="text-[#3d7b6f] font-medium mb-2">Descripción</h3>
                <p className="text-[#2a2827]">
                  {profile?.descripcion || "Aún no has añadido una descripción."}
                </p>
              </div>
              
              {profile?.fecha_nacimiento && (
                <div className="mb-6">
                  <h3 className="text-[#3d7b6f] font-medium mb-2">Fecha de nacimiento</h3>
                  <p className="text-[#2a2827]">{formatDate(profile.fecha_nacimiento)}</p>
                </div>
              )}
              
              <div className="mb-6">
                <h3 className="text-[#3d7b6f] font-medium mb-2">Intereses</h3>
                {profile?.intereses && profile.intereses.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.intereses.map(interes => (
                      <span key={interes} className="bg-[#f8ffe5] text-[#3d7b6f] rounded-full px-3 py-1 text-sm">
                        {interes}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-[#575350]">Aún no has añadido intereses.</p>
                )}
              </div>
              
              <div className="mb-6">
                <h3 className="text-[#3d7b6f] font-medium mb-2">Miembro desde</h3>
                <p className="text-[#2a2827]">
                  {profile?.fecha_creacion ? formatDate(profile.fecha_creacion) : "Fecha no disponible"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Perfil; 
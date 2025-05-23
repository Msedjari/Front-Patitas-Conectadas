/**
 * Componente de Perfil de Usuario
 * 
 * Este componente permite visualizar y editar la información del perfil de usuario.
 * Muestra datos personales como descripción, fecha de nacimiento, intereses y
 * foto de perfil, permitiendo su edición directa.
 * 
 * Características:
 * - Vista detallada del perfil de usuario
 * - Edición de información personal
 * - Actualización de imagen de perfil mediante URL
 * - Gestión de intereses/tags mediante interfaz intuitiva
 * - Validación y formateo de datos
 * 
 * El componente se comunica con la API para obtener y actualizar la información
 * del perfil, utilizando los endpoints correspondientes.
 */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchCurrentUserProfile, updateUserProfile, createUserProfile, Profile } from '../../services/profileService';
import { fetchPostsByUser } from '../../services/postService';
import { config } from '../../config';
import { Link, useParams } from 'react-router-dom';
import FileUploader from '../common/FileUploader';
import { UserImagesCache, Post } from '../home/types';
import PostList from '../home/PostList';

/**
 * Componente de Perfil de usuario
 * Muestra los datos del perfil y permite editarlos
 */
const Perfil: React.FC = () => {
  // Acceso al contexto de autenticación para obtener datos del usuario loggeado
  const { user, refreshUserData } = useAuth();
  const { id } = useParams<{ id: string }>();
  const isOwnProfile = !id || id === user?.id;
  
  // Estados principales para manejar el perfil y la interfaz
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  
  // Estados para los campos editables del perfil
  const [descripcion, setDescripcion] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [userImagesCache, setUserImagesCache] = useState<UserImagesCache>({});
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [postsError, setPostsError] = useState<string | null>(null);
  const [profileUser, setProfileUser] = useState<any>(null);
  
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
   * Carga los datos del usuario del perfil
   */
  const loadProfileUser = async (userId: string | undefined) => {
    if (!userId) return;
    
    try {
      const response = await fetch(`${config.apiUrl}/usuarios/${userId}`, {
        headers: getAuthHeaders(false)
      });
      
      if (!response.ok) {
        throw new Error('Error al cargar los datos del usuario');
      }
      
      const userData = await response.json();
      setProfileUser(userData);
    } catch (error) {
      console.error('Error al cargar datos del usuario:', error);
      setError('Error al cargar los datos del usuario');
    }
  };
  
  /**
   * Efecto para cargar los datos del perfil cuando el componente se monta
   * o cuando cambia el usuario autenticado o el ID del perfil.
   */
  useEffect(() => {
    const loadProfile = async () => {
      if (!user && !id) {
        console.log('No hay usuario autenticado ni ID de perfil');
        setLoading(false);
        setError('No hay usuario autenticado. Por favor, inicia sesión.');
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        setSuccessMessage('');
        
        const targetUserId = id || user?.id;
        if (!targetUserId) {
          setError('No se pudo determinar el ID del usuario');
          setLoading(false);
          return;
        }
        
        console.log('Cargando perfil para usuario:', targetUserId);
        
        // Cargar datos del usuario
        const userResponse = await fetch(`${config.apiUrl}/usuarios/${targetUserId}`, {
          headers: getAuthHeaders(false)
        });
        
        if (!userResponse.ok) {
          throw new Error('Error al cargar los datos del usuario');
        }
        
        const userData = await userResponse.json();
        setProfileUser(userData);
        
        // Cargar perfil del usuario
        const profileResponse = await fetch(`${config.apiUrl}/usuarios/${targetUserId}/perfiles`, {
          headers: getAuthHeaders(false)
        });
        
        if (!profileResponse.ok) {
          // Si no hay perfil, crear uno vacío
          const emptyProfile = {
            usuario_id: parseInt(targetUserId),
            descripcion: '',
            fecha_nacimiento: '',
            img: ''
          };
          setProfile(emptyProfile);
          setDescripcion('');
          setFechaNacimiento('');
          setImagePreview(null);
          setProfileImageUrl('');
        } else {
          const profileData = await profileResponse.json();
          console.log('Perfil cargado:', profileData);
          
          const normalizedProfile = {
            ...profileData,
            usuario_id: parseInt(targetUserId),
            descripcion: profileData.descripcion || '',
            fecha_nacimiento: profileData.fecha_nacimiento || ''
          };
          
          setProfile(normalizedProfile);
          setDescripcion(normalizedProfile.descripcion);
          setFechaNacimiento(normalizedProfile.fecha_nacimiento);
          
          if (normalizedProfile.img) {
            const imageUrl = `${config.apiUrl}/uploads/${normalizedProfile.img}`;
            console.log('URL de imagen construida:', imageUrl);
            setImagePreview(imageUrl);
            setProfileImageUrl(normalizedProfile.img);
          }
        }
        
      } catch (error) {
        console.error('Error al cargar perfil:', error);
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('Error al cargar el perfil. Por favor, intenta de nuevo.');
        }
      } finally {
        setLoading(false);
      }
    };
    
    loadProfile();
  }, [user, id]);
  
  // Efecto para cargar el caché de imágenes al montar el componente
  useEffect(() => {
    const loadUserImagesCache = () => {
      const cachedImages = localStorage.getItem('userImagesCache');
      if (cachedImages) {
        setUserImagesCache(JSON.parse(cachedImages));
      }
    };
    loadUserImagesCache();
  }, []);

  // Función para actualizar el caché de imágenes
  const updateUserImagesCache = (userId: number, imagePath: string) => {
    const newCache = { ...userImagesCache, [userId]: imagePath };
    setUserImagesCache(newCache);
    localStorage.setItem('userImagesCache', JSON.stringify(newCache));
  };
  
  // Efecto para cargar los posts del usuario
  useEffect(() => {
    const loadUserPosts = async () => {
      if (!user && !id) return;
      
      try {
        setLoadingPosts(true);
        setPostsError(null);
        
        const targetUserId = id || user?.id;
        if (!targetUserId) return;
        
        const posts = await fetchPostsByUser(parseInt(targetUserId));
        // Asegurarnos de que todos los posts tengan un ID válido
        const validPosts = posts.filter(post => post.id !== undefined) as Post[];
        setUserPosts(validPosts);
      } catch (error) {
        console.error('Error al cargar posts:', error);
        setPostsError('Error al cargar las publicaciones');
      } finally {
        setLoadingPosts(false);
      }
    };
    
    loadUserPosts();
  }, [user, id]);
  
  /**
   * Maneja el envío del formulario de edición del perfil
   * Procesa la actualización de la información y la subida de imágenes
   * @param e - Evento del formulario
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !profile) return;
    
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage('');
      
      // Crear FormData para enviar los datos
      const formData = new FormData();
      formData.append('descripcion', descripcion || '');
      formData.append('fechaNacimiento', fechaNacimiento || '');
      
      // Si hay una imagen, agregarla al FormData
      if (profileImageUrl) {
        const relativePath = profileImageUrl.includes(config.apiUrl) 
          ? profileImageUrl.replace(`${config.apiUrl}/uploads/`, '')
          : profileImageUrl;
        formData.append('img', relativePath);
      }
      
      console.log('Enviando datos de actualización:', Object.fromEntries(formData));
      
      const response = await fetch(`${config.apiUrl}/usuarios/${user.id}/perfiles`, {
        method: 'PUT',
        headers: {
          'Authorization': getAuthHeaders(false)['Authorization']
        },
        body: formData
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.error || 'Error al actualizar el perfil');
      }
      
      console.log('Respuesta del servidor:', responseData);
      
      // Actualizar el estado con los datos del servidor
      const updatedProfile = {
        ...responseData,
        usuario_id: parseInt(user.id)
      };
      
      // Primero actualizamos el estado local
      setProfile(updatedProfile);
      setDescripcion(updatedProfile.descripcion || '');
      setFechaNacimiento(updatedProfile.fecha_nacimiento || '');
      
      if (updatedProfile.img) {
        const imageUrl = `${config.apiUrl}/uploads/${updatedProfile.img}`;
        setImagePreview(imageUrl);
        setProfileImageUrl(updatedProfile.img);
        
        // Actualizar el caché de imágenes
        updateUserImagesCache(parseInt(user.id), updatedProfile.img);
        
        // Disparar un evento personalizado para notificar el cambio de imagen
        const event = new CustomEvent('userImageUpdated', {
          detail: {
            userId: parseInt(user.id),
            imagePath: updatedProfile.img
          }
        });
        window.dispatchEvent(event);

        // Forzar la actualización del localStorage
        const currentCache = JSON.parse(localStorage.getItem('userImagesCache') || '{}');
        const newCache = {
          ...currentCache,
          [user.id]: updatedProfile.img
        };
        localStorage.setItem('userImagesCache', JSON.stringify(newCache));

        // Disparar un evento de storage para asegurar que otros componentes lo detecten
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'userImagesCache',
          newValue: JSON.stringify(newCache),
          oldValue: JSON.stringify(currentCache),
          storageArea: localStorage
        }));
      }
      
      // Desactivamos el modo de edición y mostramos el mensaje de éxito
      setEditMode(false);
      setSuccessMessage('¡Perfil actualizado correctamente!');
      
      // Actualizar los datos del usuario en el contexto
      await refreshUserData();
      
    } catch (error) {
      console.error('Error en handleSubmit:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
      setError('Error al actualizar el perfil. Por favor, intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Maneja el cambio de imagen de perfil
   * Actualiza el estado con el archivo seleccionado y genera una vista previa
   * @param e - Evento del input de tipo file
   */
  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setProfileImageUrl(url);
    
    // Si la URL es válida, mostrar vista previa
    if (url.trim()) {
      setImagePreview(url);
    } else {
      // Si la URL está vacía, usar la imagen actual del perfil o ninguna
      setImagePreview(profile?.img || null);
    }
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
  if (error && !loading && !successMessage) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 text-center">
        <p className="text-red-500 font-medium mb-3">Error al cargar el perfil</p>
        <p className="text-[#575350] mb-4">{error}</p>
        <button 
          onClick={() => {
            setError(null);
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
    <div className="min-h-screen w-full bg-gray-50">
      <div className="w-full px-0 sm:px-0 lg:px-0 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
          {/* Columna izquierda - Perfil */}
          <div className="lg:col-span-1 w-full">
            <div className="bg-white rounded-lg shadow p-6 w-full">
      {/* Mensaje de éxito */}
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 flex justify-between items-center">
          <span>{successMessage}</span>
          <button onClick={() => setSuccessMessage('')} className="text-green-700">
            <span className="text-xl">&times;</span>
          </button>
        </div>
      )}
      
        <div className="relative">
          <div className="h-40 bg-[#9fe0b7]"></div>
          <div className="absolute -bottom-16 left-6">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-gray-200">
                {imagePreview ? (
                  <img 
                    src={imagePreview} 
                    alt="Foto de perfil" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                                console.error('Error al cargar la imagen:', imagePreview);
                      const target = e.target as HTMLImageElement;
                                target.onerror = null;
                      target.src = 'https://via.placeholder.com/150?text=Error';
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-[#e0e0e0] text-[#a0a0a0]">
                    <span className="text-4xl">?</span>
                  </div>
                )}
              </div>
              
              {editMode && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs font-medium">Editar foto</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sección de información general */}
        <div className="pt-20 px-6 pb-6">
                {/* Sección de imagen de perfil en modo edición */}
          {editMode && (
            <div className="bg-[#f8ffe5] p-4 rounded-lg mb-6 border border-[#9fe0b7]">
                    <h3 className="text-[#3d7b6f] font-medium mb-2">Imagen de perfil</h3>
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-[#9fe0b7]">
                    {imagePreview ? (
                                <img src={imagePreview} alt="Vista previa" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#e0e0e0]">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#a0a0a0]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex-grow">
                        {user && (
                          <FileUploader
                            endpoint={`/usuarios/${user.id}/perfiles`}
                            method="PUT"
                            additionalData={{
                              descripcion: descripcion || '',
                              fechaNacimiento: fechaNacimiento || ''
                            }}
                            onUploaded={async (url) => {
                              console.log('Imagen subida exitosamente, URL recibida:', url);
                              try {
                                setError(null);
                                setSuccessMessage('');
                                
                                // Actualizar la vista previa inmediatamente
                                setImagePreview(url);
                                
                                // La URL ya viene completa del FileUploader
                                setProfileImageUrl(url.replace(`${config.apiUrl}/uploads/`, ''));
                                
                                if (profile) {
                                  // Crear FormData para la actualización
                                  const formData = new FormData();
                                  formData.append('descripcion', descripcion || '');
                                  formData.append('fechaNacimiento', fechaNacimiento || '');
                                  formData.append('img', url.replace(`${config.apiUrl}/uploads/`, ''));
                                  
                                  console.log('Actualizando perfil con nueva imagen:', Object.fromEntries(formData));
                                  
                                  const response = await fetch(`${config.apiUrl}/usuarios/${user.id}/perfiles`, {
                                    method: 'PUT',
                                    headers: {
                                      'Authorization': getAuthHeaders(false)['Authorization']
                                    },
                                    body: formData
                                  });
                                  
                                  const responseData = await response.json();
                                  
                                  if (!response.ok) {
                                    throw new Error(responseData.error || 'Error al actualizar el perfil');
                                  }
                                  
                                  console.log('Perfil actualizado con nueva imagen:', responseData);
                                  
                                  // Actualizar el estado con la respuesta del servidor
                                  setProfile({
                                    ...responseData,
                                    usuario_id: parseInt(user.id)
                                  });
                                  
                                  setSuccessMessage('Imagen actualizada correctamente');
                                  
                                  // Actualizar el caché de imágenes
                                  updateUserImagesCache(parseInt(user.id), responseData.img);
                                }
                              } catch (error) {
                                console.error('Error al actualizar perfil con nueva imagen:', error);
                                // No establecer el error aquí para evitar mensajes confusos
                                // ya que la imagen se subió correctamente
                                console.warn('La imagen se subió pero hubo un problema al actualizar el perfil');
                              }
                            }}
                            onError={(err) => {
                              console.error('Error en FileUploader:', err);
                              setError(err);
                              // Intentar recargar el perfil después de un error
                              setTimeout(async () => {
                                if (user) {
                                  try {
                                    console.log('Intentando recargar el perfil después del error');
                                    const response = await fetch(`${config.apiUrl}/usuarios/${user.id}/perfiles`, {
                                      headers: getAuthHeaders(false)
                                    });
                                    
                                    if (response.ok) {
                                      const updatedProfile = await response.json();
                                      setProfile(updatedProfile);
                                      setDescripcion(updatedProfile.descripcion || '');
                                      setFechaNacimiento(updatedProfile.fecha_nacimiento || '');
                                      if (updatedProfile.img) {
                                        const imageUrl = `${config.apiUrl}/uploads/${updatedProfile.img}`;
                                        setImagePreview(imageUrl);
                                        setProfileImageUrl(updatedProfile.img);
                                        
                                        // Actualizar el caché de imágenes
                                        updateUserImagesCache(parseInt(user.id), updatedProfile.img);
                                      }
                                      setError(null); // Limpiar el error si la recarga fue exitosa
                                    } else {
                                      throw new Error('Error al recargar el perfil');
                                    }
                                  } catch (error) {
                                    console.error('Error al recargar el perfil:', error);
                                    // No establecer un nuevo error aquí para evitar mensajes confusos
                                  }
                                }
                              }, 1000);
                            }}
                            returnFullUrl={true}
                          />
                        )}
                        <p className="text-xs text-[#575350] mt-1">Sube una foto desde tu ordenador.</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-semibold text-[#3d7b6f]">
                {profileUser?.nombre || "Usuario"} {profileUser?.apellido || ""}
              </h1>
              <p className="text-[#575350]">{profileUser?.email || ""}</p>
            </div>
            {isOwnProfile && (
            <button
              onClick={() => setEditMode(!editMode)}
              className="px-4 py-2 bg-[#6cda84] text-white rounded-md hover:bg-[#38cd58]"
            >
              {editMode ? "Cancelar" : "Editar perfil"}
            </button>
            )}
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

          {/* Columna derecha - Posts */}
          <div className="lg:col-span-2 w-full">
            <div className="bg-white rounded-lg shadow p-6 w-full">
              <h2 className="text-2xl font-semibold text-[#3d7b6f] mb-6">Mis Publicaciones</h2>
              
              {postsError && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
                  <p>{postsError}</p>
                  <button 
                    className="mt-2 text-sm underline"
                    onClick={() => {
                      setPostsError(null);
                      if (user) {
                        fetchPostsByUser(parseInt(user.id));
                      }
                    }}
                  >
                    Intentar de nuevo
                  </button>
                </div>
              )}
              
              <PostList 
                posts={userPosts}
                userImagesCache={userImagesCache}
                userId={user?.id || 1}
                loading={loadingPosts}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Perfil; 
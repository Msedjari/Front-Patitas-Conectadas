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
  const [profileImageUrl, setProfileImageUrl] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>('');
  
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
        
        // Usar la ruta correcta según la documentación API
        const response = await fetch(`${config.apiUrl}/usuarios/${user.id}/perfiles`, {
          headers: getAuthHeaders(false)
        });
        
        console.log('Respuesta de perfil status:', response.status);
        
        if (response.ok) {
          // Si la respuesta es exitosa, procesamos el perfil
          const userProfile = await response.json();
          console.log('Perfil obtenido:', userProfile);
          
          // Asegurarse de que el perfil tenga todos los campos necesarios
          const normalizedProfile: Profile = {
            ...userProfile,
            usuario_id: parseInt(user.id), // Asegurar que usuario_id sea un número
            intereses: userProfile.intereses || [], // Garantizar que intereses sea un array
            descripcion: userProfile.descripcion || '', // Garantizar que descripción tenga un valor
            fecha_nacimiento: userProfile.fecha_nacimiento || '' // Garantizar que fecha_nacimiento tenga un valor
          };
          
          setProfile(normalizedProfile);
          setDescripcion(normalizedProfile.descripcion);
          setIntereses(normalizedProfile.intereses);
          setFechaNacimiento(normalizedProfile.fecha_nacimiento);
          
          if (normalizedProfile.img) {
            setImagePreview(normalizedProfile.img);
            setProfileImageUrl(normalizedProfile.img);
          }
        } else if (response.status === 404) {
          // Si el perfil no existe, crear uno nuevo
          console.log('Perfil no encontrado, creando uno nuevo');
          
          // Preparar datos básicos para el nuevo perfil
          const newProfileData = {
            usuario_id: parseInt(user.id),
            descripcion: '',
            fecha_nacimiento: '',
            intereses: []
          };
          
          // Crear un nuevo perfil para este usuario
          const createResponse = await fetch(`${config.apiUrl}/perfiles`, {
            method: 'POST',
            headers: getAuthHeaders(true),
            body: JSON.stringify(newProfileData)
          });
          
          if (createResponse.ok) {
            // Procesar el perfil recién creado
            const createdProfile = await createResponse.json();
            console.log('Perfil creado:', createdProfile);
            
            // Actualizar estado con el nuevo perfil
            setProfile(createdProfile);
            setDescripcion('');
            setIntereses([]);
            setFechaNacimiento('');
          } else {
            throw new Error(`Error al crear perfil: ${createResponse.statusText}`);
          }
        } else {
          throw new Error(`Error al obtener perfil: ${response.statusText}`);
        }
      } catch (err) {
        // Manejar errores generales en la carga del perfil
        console.error('Error al cargar el perfil:', err);
        setError('No se pudo cargar el perfil. Por favor, intenta de nuevo más tarde.');
      } finally {
        // Siempre terminamos el estado de carga
        setLoading(false);
      }
    };
    
    // Ejecutar la función de carga
    loadProfile();
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
      
      // Preparar datos para actualizar
      const updatedData: {
        usuario_id: number;
        descripcion: string;
        intereses: string[];
        fecha_nacimiento: string;
        img?: string;
      } = {
        usuario_id: parseInt(user.id), // Asegurar que usuario_id sea un número
        descripcion,
        intereses,
        fecha_nacimiento: fechaNacimiento
      };
      
      console.log('Datos para actualizar:', updatedData);
      
      // Usar la URL de imagen proporcionada
      if (profileImageUrl.trim()) {
        updatedData.img = profileImageUrl.trim();
      } else if (profile.img) {
        // Mantener la imagen existente si no se está cambiando
        updatedData.img = profile.img;
      }
      
      // Actualizar el perfil con los nuevos datos usando PUT
      const response = await fetch(`${config.apiUrl}/usuarios/${user.id}/perfiles`, {
        method: 'PUT',
        headers: getAuthHeaders(true),
        body: JSON.stringify(updatedData)
      });
      
      if (!response.ok) {
        throw new Error(`Error al actualizar perfil: ${response.statusText}`);
      }
      
      // Procesar la respuesta con el perfil actualizado
      const updatedProfile = await response.json();
      
      // Actualizar el estado con el perfil actualizado
      setProfile(updatedProfile);
      setDescripcion(updatedProfile.descripcion || '');
      setIntereses(updatedProfile.intereses || []);
      setFechaNacimiento(updatedProfile.fecha_nacimiento || '');
      
      if (updatedProfile.img) {
        setImagePreview(updatedProfile.img);
        setProfileImageUrl(updatedProfile.img);
      }
      
      // Salir del modo de edición
      setEditMode(false);
      
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
                {imagePreview ? (
                  <img 
                    src={imagePreview} 
                    alt="Foto de perfil" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Si hay error al cargar la imagen, mostrar placeholder
                      const target = e.target as HTMLImageElement;
                      target.onerror = null; // Prevenir bucle infinito
                      target.src = 'https://via.placeholder.com/150?text=Error';
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-[#e0e0e0] text-[#a0a0a0]">
                    <span className="text-4xl">?</span>
                  </div>
                )}
              </div>
              
              {/* Indicador de cambio de imagen en modo edición */}
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
          {/* URL de imagen en modo edición - ahora mejor integrado */}
          {editMode && (
            <div className="bg-[#f8ffe5] p-4 rounded-lg mb-6 border border-[#9fe0b7]">
              <h3 className="text-[#3d7b6f] font-medium mb-2">
                Imagen de perfil
              </h3>
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-[#9fe0b7]">
                    {imagePreview ? (
                      <img 
                        src={imagePreview} 
                        alt="Vista previa" 
                        className="w-full h-full object-cover"
                      />
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
                  <input
                    type="url"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9fe0b7]"
                    value={profileImageUrl}
                    onChange={handleImageUrlChange}
                    placeholder="https://ejemplo.com/mi-imagen.jpg"
                  />
                  <p className="text-xs text-[#575350] mt-1">
                    Introduce la URL de una imagen para tu perfil
                  </p>
                </div>
              </div>
            </div>
          )}

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
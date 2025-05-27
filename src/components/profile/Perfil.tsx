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
import { fetchPostsByUser, deletePost } from '../../services/postService';
import { config } from '../../config';
import { Link, useParams } from 'react-router-dom';
import { UserImagesCache, Post, CommentData } from '../home/types';
import PostList from '../home/PostList';
import Valoraciones from './Valoraciones';
import AddValoracion from './AddValoracion';
import { createComment } from '../../services/commentService';
import { obtenerMascotasPorUsuario, Mascota, createMascota, fetchMascotasByUserId, updateMascota, deleteMascota } from '../../services/mascotasService';
import MascotaCard from './MascotaCard';
import { BsPlusLg } from 'react-icons/bs';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaEdit, FaSave, FaTimes, FaPaw } from 'react-icons/fa';
import BotonSeguir from '../common/BotonSeguir';
import { seguidosService } from '../../services/seguidosService';
import { userService, User } from '../../services/userService';
import { getUserImage } from '../home/HomeUtils';

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
  
  // Resetear el modo de edición cuando cambia el ID del perfil
  useEffect(() => {
    setEditMode(false);
  }, [id]);
  
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
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [email, setEmail] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordMatchError, setPasswordMatchError] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [refreshValoraciones, setRefreshValoraciones] = useState(false);
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [loadingMascotas, setLoadingMascotas] = useState(false);
  const [errorMascotas, setErrorMascotas] = useState<string | null>(null);
  const [showMascotaForm, setShowMascotaForm] = useState(false);
  const [mascotaFormData, setMascotaFormData] = useState<Partial<Mascota>>({
    nombre: '',
    genero: '',
    especie: '',
    fechaNacimiento: ''
  });
  const [mascotaError, setMascotaError] = useState<string | null>(null);
  const [mascotaSuccess, setMascotaSuccess] = useState<string | null>(null);
  const [editingMascota, setEditingMascota] = useState<Mascota | null>(null);
  const [mascotaImagePreview, setMascotaImagePreview] = useState<string | null>(null);
  const [selectedMascotaImage, setSelectedMascotaImage] = useState<File | null>(null);
  const [seguidosDetails, setSeguidosDetails] = useState<User[]>([]);
  const [loadingSeguidos, setLoadingSeguidos] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteEmail, setDeleteEmail] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  
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
      setEmail(userData.email || '');
      setNombre(userData.nombre || '');
      setApellido(userData.apellido || '');
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
        console.log('Headers de autenticación:', getAuthHeaders(false));
        
        // Cargar datos del usuario
        const userResponse = await fetch(`${config.apiUrl}/usuarios/${targetUserId}`, {
          headers: getAuthHeaders(false)
        });
        
        console.log('Respuesta del usuario:', userResponse.status);
        
        if (!userResponse.ok) {
          throw new Error('Error al cargar los datos del usuario');
        }
        
        const userData = await userResponse.json();
        console.log('Datos del usuario cargados:', userData);
        setProfileUser(userData);
        setEmail(userData.email || '');
        setNombre(userData.nombre || '');
        setApellido(userData.apellido || '');
        
        // Intentar primero con el endpoint de perfiles
        let profileResponse = await fetch(`${config.apiUrl}/perfiles/${targetUserId}`, {
          headers: getAuthHeaders(false)
        });
        
        console.log('Respuesta del perfil (primer intento):', profileResponse.status);
        
        // Si el primer endpoint falla, intentar con el endpoint alternativo
        if (!profileResponse.ok) {
          console.log('Intentando con endpoint alternativo...');
          profileResponse = await fetch(`${config.apiUrl}/usuarios/${targetUserId}/perfiles`, {
            headers: getAuthHeaders(false)
          });
          console.log('Respuesta del perfil (segundo intento):', profileResponse.status);
        }
        
        if (!profileResponse.ok) {
          if (profileResponse.status === 404) {
            // Si no hay perfil, mostrar el formulario de creación
            console.log('No se encontró perfil, mostrando formulario de creación');
            setEditMode(true);
            setProfile({
              usuario_id: parseInt(targetUserId),
              descripcion: '',
              fecha_nacimiento: '',
              img: ''
            });
            setDescripcion('');
            setFechaNacimiento('');
            setImagePreview(null);
            setProfileImageUrl('');
          } else {
            const errorText = await profileResponse.text();
            console.error('Error al cargar perfil:', errorText);
            throw new Error(`Error al cargar el perfil: ${errorText}`);
        }
        } else {
        const profileData = await profileResponse.json();
        console.log('Perfil cargado:', profileData);
        
        const normalizedProfile = {
          ...profileData,
          usuario_id: parseInt(targetUserId),
          descripcion: profileData.descripcion || '',
          fecha_nacimiento: profileData.fecha_nacimiento || ''
          };
          
          console.log('Perfil normalizado:', normalizedProfile);
          
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
  
  // Cargar mascotas del usuario
  useEffect(() => {
    const loadMascotas = async () => {
      const targetUserId = id || user?.id;
      if (!targetUserId) return;
      
      setLoadingMascotas(true);
      setErrorMascotas(null);
      
      try {
        const mascotasData = await fetchMascotasByUserId(parseInt(targetUserId));
        setMascotas(mascotasData);
      } catch (error) {
        console.error('Error al cargar mascotas:', error);
        setErrorMascotas('Error al cargar las mascotas del usuario');
      } finally {
        setLoadingMascotas(false);
      }
    };

    loadMascotas();
  }, [id, user?.id]);
  
  // Efecto para cargar los amigos del usuario
  useEffect(() => {
    const loadSeguidos = async () => {
      const targetUserId = id || user?.id;
      if (!targetUserId) return;

      setLoadingSeguidos(true);
      try {
        const relaciones = await seguidosService.obtenerSeguidosIds(Number(targetUserId));
        const ids = relaciones.map(rel => Number(rel.usuarioQueEsSeguidoId));

        const detailsPromises = ids.map(id => userService.getUserById(id).catch(e => {
          console.error(`Error al obtener detalles del usuario ${id}:`, e);
          return null;
        }));
        const details = (await Promise.all(detailsPromises)).filter(detail => detail !== null) as User[];
        
        setSeguidosDetails(details);
      } catch (error) {
        console.error('Error al cargar seguidos:', error);
      } finally {
        setLoadingSeguidos(false);
      }
    };

    loadSeguidos();
  }, [id, user?.id]);
  
  /**
   * Maneja el envío del formulario de edición del perfil
   * Procesa la actualización de la información y la subida de imágenes
   * @param e - Evento del formulario
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage('');
      
      // Actualizar datos básicos del usuario si han cambiado
      const userUpdates: any = {};
      if (nombre !== profileUser?.nombre) userUpdates.nombre = nombre;
      if (apellido !== profileUser?.apellido) userUpdates.apellido = apellido;
      if (email !== profileUser?.email) userUpdates.email = email;

      if (Object.keys(userUpdates).length > 0) {
        try {
          const userResponse = await fetch(`${config.apiUrl}/usuarios/${user.id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': getAuthHeaders(false)['Authorization']
            },
            body: JSON.stringify(userUpdates)
          });

          if (!userResponse.ok) {
            const errorData = await userResponse.json();
            throw new Error(errorData.error || 'Error al actualizar los datos del usuario');
          }

          // Actualizar el estado local del usuario
          setProfileUser((prev: any) => ({ ...prev, ...userUpdates }));
        } catch (error) {
          console.error('Error al actualizar los datos del usuario:', error);
          throw new Error('Error al actualizar los datos del usuario. Por favor, intenta de nuevo.');
        }
      }
      
      // Crear FormData para enviar los datos del perfil
      const formData = new FormData();
      
      // Asegurarnos de que los campos coincidan exactamente con lo que espera el backend
      formData.append('descripcion', descripcion || '');
      
      // Asegurarnos de que la fecha esté en formato correcto
      const fechaFormateada = fechaNacimiento ? new Date(fechaNacimiento).toISOString().split('T')[0] : '';
      formData.append('fechaNacimiento', fechaFormateada);
      
      // Asegurarnos de que el usuarioId sea un número
      formData.append('usuarioId', user.id.toString());

      // Añadir la imagen si se ha seleccionado una nueva
      if (selectedImage) {
        formData.append('imagen', selectedImage);
      }
      
      let response;
      let responseData;

      if (!profile?.id) {
        // Si no hay perfil, crear uno nuevo
        console.log('Creando nuevo perfil con datos:', {
          descripcion: descripcion,
          fechaNacimiento: fechaFormateada,
          usuarioId: user.id
        });
        
        // Para crear un nuevo perfil
        response = await fetch(`${config.apiUrl}/perfiles`, {
          method: 'POST',
          headers: {
            'Authorization': getAuthHeaders(false)['Authorization']
          },
          body: formData
        });
      } else {
        // Si ya existe, actualizarlo
        response = await fetch(`${config.apiUrl}/usuarios/${user.id}/perfiles`, {
        method: 'PUT',
        headers: {
          'Authorization': getAuthHeaders(false)['Authorization']
        },
        body: formData
      });
      }
      
      // Intentar parsear la respuesta como JSON
      try {
        responseData = await response.json();
      } catch (e) {
        console.error('Error al parsear la respuesta:', e);
        throw new Error('Error al procesar la respuesta del servidor');
      }
      
      if (!response.ok) {
        throw new Error(responseData.error || 'Error al guardar el perfil');
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
      }
      
      // Desactivamos el modo de edición y mostramos el mensaje de éxito
      setEditMode(false);
      setSuccessMessage(profile?.id ? '¡Perfil actualizado correctamente!' : '¡Perfil creado correctamente!');
      
      // Actualizar los datos del usuario en el contexto
      await refreshUserData();
      
    } catch (error) {
      console.error('Error en handleSubmit:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Error al guardar el perfil. Por favor, intenta de nuevo.');
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
  
  const validatePassword = (password: string): string | null => {
    if (password.length < 1) {
      return 'La contraseña no puede estar vacía';
    }
    return null;
  };

  // Función para validar coincidencia de contraseñas en tiempo real
  const validatePasswordMatch = (newPass: string, confirmPass: string) => {
    if (newPass && confirmPass && newPass !== confirmPass) {
      setPasswordMatchError('Las contraseñas no coinciden');
    } else {
      setPasswordMatchError(null);
    }
  };

  // Actualizar la validación cuando cambie cualquiera de las contraseñas
  useEffect(() => {
    validatePasswordMatch(newPassword, confirmPassword);
  }, [newPassword, confirmPassword]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    // Validar que la contraseña actual no esté vacía
    if (!currentPassword) {
      setPasswordError('Debes ingresar tu contraseña actual');
      return;
    }

    // Validar que la nueva contraseña no esté vacía
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setPasswordError(passwordError);
      return;
    }

    // Validar que las contraseñas coincidan
    if (newPassword !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden');
      return;
    }

    try {
      console.log('Enviando solicitud de cambio de contraseña...');
      const response = await fetch(`${config.apiUrl}/usuarios/${user?.id}/password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem(config.session.tokenKey)}`
        },
        body: JSON.stringify({
          currentPassword: currentPassword,
          newPassword: newPassword
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al cambiar la contraseña');
      }

      setPasswordSuccess('Contraseña actualizada correctamente');
      // Limpiar todos los campos de contraseña
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordMatchError(null);
    } catch (error) {
      console.error('Error al cambiar la contraseña:', error);
      setPasswordError(error instanceof Error ? error.message : 'Error al cambiar la contraseña');
      // Limpiar solo la contraseña actual en caso de error
      setCurrentPassword('');
    }
  };
  
  const handleValoracionAdded = () => {
    setRefreshValoraciones(prev => !prev);
  };
  
  // --- FUNCIÓN PARA ENVIAR COMENTARIOS EN POSTS DEL PERFIL ---
  const handleCommentSubmit = async (commentData: CommentData) => {
    try {
      if (!user?.id) {
        setPostsError('No se pudo enviar el comentario: Error al obtener tu identificación de usuario');
        return;
      }
      commentData.creadorId = Number(user.id);
      await createComment(commentData);
      // No es necesario actualizar el estado aquí, PostItem recarga los comentarios
    } catch (err) {
      setPostsError(err instanceof Error ? err.message : 'No se pudo enviar el comentario. Por favor, intenta de nuevo.');
    }
  };
  
  // --- FUNCIÓN PARA ELIMINAR POSTS DEL PERFIL ---
  const handleDeletePost = async (postId: number) => {
    try {
      await deletePost(postId);
      setUserPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
    } catch (err) {
      setPostsError('No se pudo eliminar la publicación. Por favor, intenta de nuevo.');
    }
  };
  
  // Manejar cambios en el formulario de mascota
  const handleMascotaInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setMascotaFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMascotaImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar el tipo de archivo
      if (!file.type.startsWith('image/')) {
        setMascotaError('Por favor, selecciona un archivo de imagen válido');
        return;
      }

      // Validar el tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMascotaError('La imagen no puede ser mayor a 5MB');
        return;
      }

      setSelectedMascotaImage(file);
      setMascotaError(null);

      // Crear URL para la vista previa
      const reader = new FileReader();
      reader.onloadend = () => {
        setMascotaImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveMascotaImage = () => {
    setSelectedMascotaImage(null);
    setMascotaImagePreview(null);
  };

  const handleEditMascota = (mascota: Mascota) => {
    setEditingMascota(mascota);
    setMascotaFormData({
      nombre: mascota.nombre,
      genero: mascota.genero,
      especie: mascota.especie,
      fechaNacimiento: mascota.fechaNacimiento || '',
      foto: mascota.foto || ''
    });
    setShowMascotaForm(true);
  };

  const handleDeleteMascota = async (mascota: Mascota) => {
    if (!user?.id || !mascota.id) return;
    
    if (!window.confirm(`¿Estás seguro de que deseas eliminar a ${mascota.nombre}?`)) {
      return;
    }
    
    try {
      setMascotaError(null);
      await deleteMascota(parseInt(user.id), mascota.id);
      setMascotas(prev => prev.filter(m => m.id !== mascota.id));
      setMascotaSuccess('Mascota eliminada exitosamente');
    } catch (error) {
      console.error('Error al eliminar mascota:', error);
      setMascotaError('Error al eliminar la mascota');
    }
  };

  const handleMascotaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMascotaError(null);
    setMascotaSuccess(null);

    if (!user?.id) {
      setMascotaError('No se pudo identificar al usuario');
      return;
    }

    try {
      // Crear FormData para enviar la mascota con la imagen
      const formData = new FormData();
      formData.append('nombre', mascotaFormData.nombre || '');
      formData.append('genero', mascotaFormData.genero || '');
      formData.append('especie', mascotaFormData.especie || '');
      
      // Asegurarnos de que la fecha esté en formato correcto
      if (mascotaFormData.fechaNacimiento) {
        formData.append('fechaNacimiento', mascotaFormData.fechaNacimiento);
      }
      
      if (selectedMascotaImage) {
        formData.append('imagen', selectedMascotaImage);
      }

      if (editingMascota?.id) {
        // Actualizar mascota existente
        const response = await fetch(`${config.apiUrl}/usuarios/${user.id}/mascotas/${editingMascota.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': getAuthHeaders(false)['Authorization']
          },
          body: formData
        });

        if (!response.ok) {
          throw new Error('Error al actualizar la mascota');
        }

        const mascotaActualizada = await response.json();
        setMascotas(prev => prev.map(m => 
          m.id === editingMascota.id ? mascotaActualizada : m
        ));
        setMascotaSuccess('Mascota actualizada exitosamente');
      } else {
        // Crear nueva mascota
        const response = await fetch(`${config.apiUrl}/usuarios/${user.id}/mascotas`, {
          method: 'POST',
          headers: {
            'Authorization': getAuthHeaders(false)['Authorization']
          },
          body: formData
        });

        if (!response.ok) {
          throw new Error('Error al crear la mascota');
        }

        const nuevaMascota = await response.json();
        setMascotas(prev => [...prev, nuevaMascota]);
        setMascotaSuccess('Mascota registrada exitosamente');
      }

      setShowMascotaForm(false);
      setEditingMascota(null);
      setMascotaFormData({
        nombre: '',
        genero: '',
        especie: '',
        fechaNacimiento: ''
      });
      setSelectedMascotaImage(null);
      setMascotaImagePreview(null);
    } catch (error) {
      console.error('Error al guardar mascota:', error);
      setMascotaError('Error al guardar la mascota');
    }
  };
  
  /**
   * Maneja la eliminación de la cuenta del usuario
   */
  const handleDeleteAccount = async () => {
    if (!user) return;
    
    if (deleteEmail !== user.email) {
      setDeleteError('El email no coincide con tu cuenta');
      return;
    }
    
    try {
      setLoading(true);
      setDeleteError(null);
      
      const response = await fetch(`${config.apiUrl}/usuarios/${user.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error('Error al eliminar la cuenta');
      }
      
      // Limpiar datos de sesión
      localStorage.removeItem(config.session.tokenKey);
      localStorage.removeItem(config.session.userKey);
      
      // Redirigir al login
      window.location.href = '/login';
    } catch (error) {
      console.error('Error al eliminar cuenta:', error);
      setDeleteError('Error al eliminar la cuenta. Por favor, intenta de nuevo.');
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
      {/* Cabecera del perfil con imagen de portada y foto de perfil */}
      <div className="relative w-full h-64 bg-[#9fe0b7]">
        <div className="absolute -bottom-16 left-8">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-gray-200 shadow-lg">
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

      {/* Contenido principal */}
      <div className="container mx-auto px-4 pt-20 pb-8">
        {/* Sección de información del perfil */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          {/* Mensaje de éxito */}
          {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 flex justify-between items-center">
              <span>{successMessage}</span>
              <button onClick={() => setSuccessMessage('')} className="text-green-700">
                <span className="text-xl">&times;</span>
              </button>
            </div>
          )}

          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-[#3d7b6f]">
                {profileUser?.nombre || "Usuario"} {profileUser?.apellido || ""}
              </h1>
              {!editMode && <p className="text-[#575350]">{profileUser?.email || ""}</p>}
            </div>
            <div className="flex items-center gap-4">
              {!isOwnProfile && user && (
                <div className="mt-4">
                  <BotonSeguir 
                    usuarioId={Number(id)} 
                    nombreUsuario={`${profileUser?.nombre || ''} ${profileUser?.apellido || ''}`}
                  />
                </div>
              )}
              {isOwnProfile && (
                <>
                <button
                  onClick={() => setEditMode(!editMode)}
                  className="px-4 py-2 bg-[#6cda84] text-white rounded-md hover:bg-[#38cd58] transition-colors"
                >
                  {editMode ? "Cancelar" : "Editar perfil"}
                </button>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    Eliminar cuenta
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Contenido del perfil (edición o visualización) */}
          {editMode ? (
            <>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-[#3d7b6f] font-medium mb-2">
                    Nombre:
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9fe0b7]"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Tu nombre"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-[#3d7b6f] font-medium mb-2">
                    Apellido:
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9fe0b7]"
                    value={apellido}
                    onChange={(e) => setApellido(e.target.value)}
                    placeholder="Tu apellido"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-[#3d7b6f] font-medium mb-2">
                    Email:
                  </label>
                  <input
                    type="email"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9fe0b7]"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-[#3d7b6f] font-medium mb-2">
                    Foto de perfil:
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100">
                      <img 
                        src={imagePreview || '/default-avatar.svg'} 
                        alt="Foto de perfil" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/default-avatar.svg';
                        }}
                      />
                    </div>
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setSelectedImage(file);
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setImagePreview(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="hidden"
                        id="profile-image-input"
                      />
                      <label
                        htmlFor="profile-image-input"
                        className="px-4 py-2 bg-[#6cda84] text-white rounded-md hover:bg-[#38cd58] cursor-pointer inline-block"
                      >
                        Cambiar foto
                      </label>
                    </div>
                  </div>
                </div>

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

              {/* Formulario de cambio de contraseña separado */}
              <div className="mt-8 border-t pt-6">
                <h3 className="text-[#3d7b6f] font-medium mb-4">Cambiar Contraseña</h3>
                
                {passwordError && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {passwordError}
                  </div>
                )}
                
                {passwordSuccess && (
                  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                    {passwordSuccess}
                  </div>
                )}
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-[#3d7b6f] font-medium mb-2">
                      Contraseña Actual:
                    </label>
                    <input
                      type="password"
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9fe0b7]"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[#3d7b6f] font-medium mb-2">
                      Nueva Contraseña:
                    </label>
                    <input
                      type="password"
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9fe0b7]"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[#3d7b6f] font-medium mb-2">
                      Confirmar Nueva Contraseña:
                    </label>
                    <input
                      type="password"
                      className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#9fe0b7] ${
                        passwordMatchError ? 'border-red-500' : 'border-gray-300'
                      }`}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                    />
                    {passwordMatchError && (
                      <p className="text-red-500 text-sm mt-1">{passwordMatchError}</p>
                    )}
                  </div>
                  
                  <button
                    type="button"
                    onClick={handlePasswordChange}
                    className="w-full px-4 py-2 bg-[#6cda84] text-white rounded-md hover:bg-[#38cd58]"
                    disabled={!!passwordMatchError}
                  >
                    Cambiar Contraseña
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="text-[#3d7b6f] font-medium mb-2">Descripción</h3>
                <p className="text-[#2a2827]">
                  {profile?.descripcion || "Aún no has añadido una descripción."}
                </p>
              </div>
              
              {profile?.fecha_nacimiento && (
                <div>
                  <h3 className="text-[#3d7b6f] font-medium mb-2">Fecha de nacimiento</h3>
                  <p className="text-[#2a2827]">{formatDate(profile.fecha_nacimiento)}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sección de Valoraciones y Mascotas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Valoraciones */}
          <div className="bg-white rounded-lg shadow-md p-6">
            {!editMode && (
              <>
                <h2 className="text-xl font-bold text-[#3d7b6f] mb-4">Valoraciones</h2>
                <Valoraciones 
                  userId={parseInt(id || user?.id || '0')} 
                  key={refreshValoraciones ? 'refresh' : 'normal'}
                  isOwnProfile={isOwnProfile}
                />
                {!isOwnProfile && user && (
                  <div className="mt-6">
                    <AddValoracion 
                      autorId={parseInt(user.id)}
                      receptorId={parseInt(id || '0')}
                      onValoracionAdded={handleValoracionAdded}
                    />
                  </div>
                )}
              </>
            )}
          </div>

          {/* Mascotas */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#3d7b6f] flex items-center">
                <FaPaw className="mr-2" />
                Mascotas
              </h2>
              
              {isOwnProfile && !showMascotaForm && (
                <button
                  onClick={() => {
                    setEditingMascota(null);
                    setMascotaFormData({
                      nombre: '',
                      genero: '',
                      especie: '',
                      fechaNacimiento: ''
                    });
                    setShowMascotaForm(true);
                  }}
                  className="flex items-center px-3 py-1.5 bg-[#6cda84] text-white rounded-md hover:bg-[#38cd58] text-sm"
                >
                  <BsPlusLg className="mr-1" />
                  Añadir mascota
                </button>
              )}
            </div>

            {loadingMascotas ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-2 text-gray-600">Cargando mascotas...</p>
              </div>
            ) : errorMascotas ? (
              <div className="text-center py-4">
                <p className="text-red-500">{errorMascotas}</p>
              </div>
            ) : mascotas.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-500">
                  {isOwnProfile ? "Aún no tienes mascotas registradas." : "Este usuario no tiene mascotas registradas."}
                </p>
                {isOwnProfile && !showMascotaForm && (
                  <button
                    onClick={() => setShowMascotaForm(true)}
                    className="mt-2 text-[#3d7b6f] underline"
                  >
                    Agrega tu primera mascota
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {mascotas.map((mascota) => (
                  <MascotaCard
                    key={mascota.id}
                    mascota={mascota}
                    isOwnProfile={isOwnProfile}
                    onEdit={isOwnProfile ? handleEditMascota : undefined}
                    onDelete={isOwnProfile ? handleDeleteMascota : undefined}
                  />
                ))}
              </div>
            )}

            {/* Formulario de mascota */}
            {showMascotaForm && isOwnProfile && (
              <div className="bg-[#f8ffe5] p-4 rounded-lg mt-4 border border-[#9fe0b7]">
                <h3 className="text-[#3d7b6f] font-medium mb-3">
                  {editingMascota ? `Editar a ${editingMascota.nombre}` : 'Registrar nueva mascota'}
                </h3>
                
                {mascotaError && (
                  <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
                    <p>{mascotaError}</p>
                  </div>
                )}
                
                {mascotaSuccess && (
                  <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 rounded">
                    <p>{mascotaSuccess}</p>
                  </div>
                )}

                <form onSubmit={handleMascotaSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#2a2827] mb-1">
                        Nombre*
                      </label>
                      <input
                        type="text"
                        name="nombre"
                        value={mascotaFormData.nombre}
                        onChange={handleMascotaInputChange}
                        required
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9fe0b7]"
                        placeholder="Nombre de tu mascota"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#2a2827] mb-1">
                        Género*
                      </label>
                      <select
                        name="genero"
                        value={mascotaFormData.genero}
                        onChange={handleMascotaInputChange}
                        required
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9fe0b7]"
                      >
                        <option value="">Selecciona un género</option>
                        <option value="Macho">Macho</option>
                        <option value="Hembra">Hembra</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#2a2827] mb-1">
                        Especie*
                      </label>
                      <input
                        type="text"
                        name="especie"
                        value={mascotaFormData.especie}
                        onChange={handleMascotaInputChange}
                        required
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9fe0b7]"
                        placeholder="Especie de tu mascota"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#2a2827] mb-1">
                        Fecha de Nacimiento
                      </label>
                      <input
                        type="date"
                        name="fechaNacimiento"
                        value={mascotaFormData.fechaNacimiento || ''}
                        onChange={handleMascotaInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9fe0b7]"
                      />
                    </div>

                    {/* Sección de subida de foto */}
                    <div>
                      <label className="block text-sm font-medium text-[#2a2827] mb-1">
                        Foto de la mascota
                      </label>
                      <div className="flex items-center space-x-4">
                        <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100">
                          <img 
                            src={mascotaImagePreview || ''} 
                            alt="Foto de mascota" 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                              const parent = (e.target as HTMLImageElement).parentElement;
                              if (parent) {
                                const iconContainer = document.createElement('div');
                                iconContainer.className = 'w-full h-full flex items-center justify-center bg-gray-200';
                                const icon = document.createElement('div');
                                icon.innerHTML = '<svg class="text-gray-400 text-4xl" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>';
                                iconContainer.appendChild(icon);
                                parent.appendChild(iconContainer);
                              }
                            }}
                          />
                        </div>
                        <div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleMascotaImageChange}
                            className="hidden"
                            id="mascota-image-input"
                          />
                          <label
                            htmlFor="mascota-image-input"
                            className="px-4 py-2 bg-[#6cda84] text-white rounded-md hover:bg-[#38cd58] cursor-pointer inline-block"
                          >
                            Subir foto
                          </label>
                          {mascotaImagePreview && (
                            <button
                              type="button"
                              onClick={handleRemoveMascotaImage}
                              className="ml-2 px-4 py-2 text-red-600 border border-red-600 rounded-md hover:bg-red-50"
                            >
                              Eliminar
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <button
                        type="button"
                        onClick={() => setShowMascotaForm(false)}
                        className="px-4 py-2 text-[#3d7b6f] border border-[#3d7b6f] rounded-md hover:bg-[#f0fff0]"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#6cda84] text-white rounded-md hover:bg-[#38cd58]"
                      >
                        Guardar mascota
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Sección de Amigos */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold text-[#3d7b6f] mb-6">Amigos</h2>
          
          {loadingSeguidos ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6cda84]"></div>
            </div>
          ) : seguidosDetails.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-lg">
              <p className="text-gray-500">
                {isOwnProfile ? "Aún no sigues a ningún usuario." : "Este usuario no sigue a nadie."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {seguidosDetails.map((seguido) => (
                <div key={seguido.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                      <img
                        src={getUserImage(userImagesCache, Number(seguido.id))}
                        alt={seguido.nombre || 'Usuario'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/default-avatar.svg';
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-[#2a2827]">{seguido.nombre} {seguido.apellido}</h3>
                      <p className="text-sm text-gray-500">{seguido.email}</p>
                    </div>
                    <Link
                      to={Number(seguido.id) === Number(user?.id) ? '/mi-perfil' : `/perfil/${seguido.id}`}
                      className="px-3 py-1.5 bg-[#6cda84] text-white rounded-md hover:bg-[#38cd58] text-sm"
                    >
                      Ver Perfil
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sección de Posts */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-[#3d7b6f] mb-6">Publicaciones</h2>
          
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
            onCommentSubmit={handleCommentSubmit}
            onDeletePost={handleDeletePost}
          />
        </div>
      </div>

      {/* Modal de Eliminación de Cuenta */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-red-600 mb-4">Eliminar Cuenta</h3>
            <p className="text-gray-700 mb-4">
              Esta acción es irreversible. Para confirmar, por favor ingresa tu email: <strong>{user?.email}</strong>
            </p>
            
            <input
              type="email"
              value={deleteEmail}
              onChange={(e) => setDeleteEmail(e.target.value)}
              placeholder="Ingresa tu email"
              className="w-full px-3 py-2 border rounded-md mb-4"
            />
            
            {deleteError && (
              <p className="text-red-500 mb-4">{deleteError}</p>
            )}
            
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteEmail('');
                  setDeleteError(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? 'Eliminando...' : 'Eliminar Cuenta'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Perfil; 
import React, { useState, useEffect, useRef, useCallback, useContext } from 'react';
import { useAuth } from '../../context/AuthContext';
import { config } from '../../config';
import { Post, PostData, UserImagesCache, CommentData } from './types';
import PostForm from './PostForm';
import PostList from './PostList';
import '../../responsive.css';
import { createComment } from '../../services/commentService';
import { deletePost } from '../../services/postService';

/**
 * Componente de Página de Inicio (Feed)
 * 
 * Este componente muestra el feed principal de la aplicación, permitiendo
 * visualizar y crear publicaciones. Implementa una interfaz similar a redes
 * sociales donde los usuarios pueden compartir contenido con texto e imágenes.
 * 
 * Características principales:
 * - Formulario para crear nuevas publicaciones con texto e imágenes
 * - Selector de emojis integrado para enriquecer el contenido
 * - Visualización del feed de publicaciones de la comunidad
 * - Sistema de caché para imágenes de usuarios por IDs
 * - Carga optimizada de datos desde el backend
 */
const Home: React.FC = () => {
  // Estado para almacenar las publicaciones
  const [posts, setPosts] = useState<Post[]>([]);
  // Estado para indicar carga
  const [loading, setLoading] = useState(true);
  // Estado para manejar errores
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Caché para almacenar las imágenes de usuario y evitar peticiones repetidas
  const [userImagesCache, setUserImagesCache] = useState<UserImagesCache>({});
  
  // Flag para controlar si ya se ha hecho la carga inicial
  const hasLoadedRef = useRef(false);
  
  // Referencia para cerrar el selector de emojis cuando se hace clic fuera
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const commentEmojiPickerRef = useRef<HTMLDivElement>(null);
  
  const { user } = useAuth();

  // Efecto para manejar clics fuera del selector de emojis
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Esta lógica ahora está en los componentes individuales
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Efecto para escuchar cambios en el caché de imágenes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'userImagesCache') {
        try {
          const newCache = JSON.parse(e.newValue || '{}');
          setUserImagesCache(newCache);
        } catch (error) {
          console.error('Error al actualizar caché de imágenes:', error);
        }
      }
    };

    const handleUserImageUpdate = (e: CustomEvent) => {
      const { userId, imagePath } = e.detail;
      setUserImagesCache(prevCache => ({
        ...prevCache,
        [userId]: imagePath
      }));
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userImageUpdated', handleUserImageUpdate as EventListener);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userImageUpdated', handleUserImageUpdate as EventListener);
    };
  }, []);

  /**
   * Función para cargar las publicaciones
   * Convertida a useCallback para evitar recreación innecesaria
   */
  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem(config.session.tokenKey);
      if (!token) {
        throw new Error('No hay token de autenticación');
      }
      
      const response = await fetch(`${config.apiUrl}/posts`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Error al cargar los posts');
      }
      
      const data = await response.json();
      
      // Ordenar los posts por fecha de creación (más recientes primero)
      const sortedPosts: Post[] = (data as Post[]).sort((a, b) => {
        const dateA = new Date(a.createdAt || a.fecha || '');
        const dateB = new Date(b.createdAt || b.fecha || '');
        return dateB.getTime() - dateA.getTime();
      });
      
      console.log('Posts ordenados:', sortedPosts.map((post: Post) => ({
        id: post.id,
        fecha: post.createdAt || post.fecha
      })));
      
      setPosts(sortedPosts);
      
      // Obtener IDs únicos de usuarios para cargar sus imágenes
      const userIds: number[] = Array.from(new Set(sortedPosts.map((post: Post) => post.creadorId || post.creador?.id).filter((id): id is number => typeof id === 'number')));
      console.log('IDs de usuarios a cargar:', userIds);
      await fetchUserImages(userIds);
      
    } catch (error) {
      console.error('Error al cargar posts:', error);
      setError('Error al cargar los posts. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };
  
  // Efecto para cargar los posts al montar el componente
  // Con la referencia hasLoadedRef para evitar doble carga
  useEffect(() => {
    if (!hasLoadedRef.current) {
      console.log('Cargando publicaciones por primera vez');
      hasLoadedRef.current = true;
      fetchPosts();
    }
  }, [fetchPosts]);
  
  /**
   * Función para obtener las imágenes de perfil de los usuarios por ID
   */
  const fetchUserImages = async (userIds: number[]) => {
    try {
      // Filtrar los IDs que ya tenemos en caché
      const idsToFetch = userIds.filter(id => !userImagesCache[id]);
      
      if (idsToFetch.length === 0) return;
      
      console.log('Obteniendo imágenes para usuarios:', idsToFetch);
      
      // Para cada ID, obtener la imagen del usuario
      const newCache = {...userImagesCache};
      const token = localStorage.getItem(config.session.tokenKey);
      
      if (!token) {
        console.warn('No hay token disponible, no se pueden cargar imágenes de usuarios');
        return;
      }
      
      for (const userId of idsToFetch) {
        try {
          // Intentamos obtener los datos básicos del usuario primero
          const userResponse = await fetch(`${config.apiUrl}/usuarios/${userId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            }
          });
          
          if (userResponse.ok) {
            const userData = await userResponse.json();
            console.log(`Datos básicos para usuario ${userId}:`, userData);
            
            // Verificar si el usuario tiene una imagen en los datos básicos
            if (userData && userData.img) {
              // Almacenar solo la ruta relativa en el caché
              const relativePath = userData.img.includes(config.apiUrl) 
                ? userData.img.replace(`${config.apiUrl}/uploads/`, '')
                : userData.img;
              newCache[userId] = relativePath;
              console.log(`Imagen obtenida para usuario ${userId}:`, relativePath);
            } else {
              // Si no hay imagen en los datos básicos, intentamos buscar en el perfil
              console.log(`Buscando perfil para usuario ${userId}`);
              
              const profileResponse = await fetch(`${config.apiUrl}/usuarios/${userId}/perfiles`, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                }
              });
              
              if (profileResponse.ok) {
                const profileData = await profileResponse.json();
                console.log(`Datos de perfil para usuario ${userId}:`, profileData);
                
                if (profileData && profileData.img) {
                  // Almacenar solo la ruta relativa en el caché
                  const relativePath = profileData.img.includes(config.apiUrl)
                    ? profileData.img.replace(`${config.apiUrl}/uploads/`, '')
                    : profileData.img;
                  newCache[userId] = relativePath;
                  console.log(`Imagen de perfil obtenida para usuario ${userId}:`, relativePath);
                } else {
                  console.log(`No se encontró imagen para usuario ${userId}, usando imagen por defecto`);
                  newCache[userId] = '/default-avatar.svg';
                }
              } else {
                console.log(`No se pudo obtener perfil para usuario ${userId}, usando imagen por defecto`);
                newCache[userId] = '/default-avatar.svg';
              }
            }
          } else {
            console.log(`No se pudo obtener datos para usuario ${userId}, usando imagen por defecto`);
            newCache[userId] = '/default-avatar.svg';
          }
        } catch (error) {
          console.error(`Error al obtener imagen para usuario ${userId}:`, error);
          newCache[userId] = '/default-avatar.svg';
        }
      }
      
      // Actualizar el caché
      console.log('Cache de imágenes actualizado:', newCache);
      setUserImagesCache(newCache);
    } catch (error) {
      console.error('Error al obtener imágenes de usuarios:', error);
    }
  };

  /**
   * Maneja el envío del formulario para crear un nuevo post
   */
  const handlePostSubmit = async (postData: FormData) => {
    try {
      setIsSubmitting(true);
      
      console.log('Enviando publicación con FormData');
      const token = localStorage.getItem(config.session.tokenKey);
      
      if (!token) {
        console.warn('No hay token disponible, no se puede crear la publicación');
        setError('No se pudo crear la publicación: No estás autenticado');
        setIsSubmitting(false);
        return;
      }
      
      // Realizar la petición fetch con FormData
      const response = await fetch(`${config.apiUrl}/posts`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: postData
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.error || 'Error desconocido al crear la publicación';
        throw new Error(`Error: ${response.status} - ${errorMessage}`);
      }
      
      const newPost = await response.json();
      console.log('Post creado exitosamente:', newPost);
      
      // Adaptar el post creado a la estructura esperada por los componentes
      const validatedNewPost: Post = {
        ...newPost,
        creador: {
          id: newPost.creadorId || user?.id,
          nombre: newPost.nombreCreador || user?.name || user?.nombre || 'Usuario',
          apellido: newPost.apellidoCreador || user?.apellidos || ''
        }
      };
      
      console.log('Post validado para agregar al feed:', validatedNewPost);
      
      // Actualizar la lista de posts
      setPosts(prevPosts => [validatedNewPost, ...prevPosts]);
      
      // Si el post tiene un creador con ID válido, actualizar el caché de imágenes si es necesario
      const postCreadorId = validatedNewPost.creadorId || validatedNewPost.creador?.id;
      if (postCreadorId && typeof postCreadorId === 'number' && !(postCreadorId in userImagesCache)) {
        console.log(`Actualizando imágenes para el nuevo creador ${postCreadorId}`);
        fetchUserImages([postCreadorId]);
      }
      
    } catch (err) {
      console.error('Error al crear el post:', err);
      const errorMessage = err instanceof Error 
        ? err.message
        : 'No se pudo crear la publicación. Por favor, intenta de nuevo.';
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Maneja el envío de un comentario
   */
  const handleCommentSubmit = async (commentData: CommentData) => {
    try {
      console.log('Enviando comentario:', commentData);
      
      if (!user?.id) {
        console.error('No se pudo obtener el ID del usuario autenticado');
        setError('No se pudo enviar el comentario: Error al obtener tu identificación de usuario');
        return;
      }
      
      // Asegurar que el creadorId sea correcto
      commentData.creadorId = Number(user.id);
      
      // Usar el servicio para crear el comentario
      const newComment = await createComment(commentData);
      console.log('Comentario creado exitosamente:', newComment);
      
      // No necesitamos actualizar el estado aquí, ya que el componente PostItem
      // se encargará de volver a cargar los comentarios después de enviar uno nuevo
      
    } catch (err) {
      console.error('Error al enviar comentario:', err);
      // Mostrar mensaje de error más amigable para el usuario
      const errorMessage = err instanceof Error 
        ? err.message
        : 'No se pudo enviar el comentario. Por favor, intenta de nuevo.';
      
      setError(errorMessage);
    }
  };

  /**
   * Carga más publicaciones
   */
  const handleLoadMore = () => {
    console.log('Cargar más publicaciones');
    // Aquí iría la lógica para cargar más publicaciones
  };

  /**
   * Maneja la eliminación de un post
   */
  const handleDeletePost = async (postId: number) => {
    try {
      await deletePost(postId);
      setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
    } catch (err) {
      setError('No se pudo eliminar la publicación. Por favor, intenta de nuevo.');
    }
  };

  return (
    <div>
      {/* Mensaje de error si existe */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
          <p>{error}</p>
          <button 
            className="mt-2 text-sm underline"
            onClick={() => {
              setError(null);
              fetchPosts();
            }}
          >
            Intentar de nuevo
          </button>
        </div>
      )}
      
      {/* Formulario para crear post */}
      <PostForm 
        userName={user?.name || user?.nombre}
        userImagesCache={userImagesCache}
        onPostSubmit={handlePostSubmit}
      />
      
      {/* Feed de publicaciones */}
      <PostList 
        posts={posts}
        userImagesCache={userImagesCache}
        userId={user?.id || 1}
        loading={loading}
        onLoadMore={handleLoadMore}
        onCommentSubmit={handleCommentSubmit}
        onDeletePost={handleDeletePost}
      />
    </div>
  );
};

export default Home; 
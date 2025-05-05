import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { config } from '../../config';
import { Post, PostData, UserImagesCache } from './types';
import PostForm from './PostForm';
import PostList from './PostList';
import '../../responsive.css';

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

  // Efecto para cargar los posts al montar el componente
  useEffect(() => {
    fetchPosts();
  }, []);
  
  /**
   * Función para cargar las publicaciones
   */
  const fetchPosts = async () => {
    try {
      setLoading(true);
      
      // Realizar la llamada al backend con la ruta correcta
      const response = await fetch(`${config.apiUrl}/posts`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPosts(data);
        
        // Obtener IDs únicos de creadores para buscar sus imágenes
        const uniqueCreatorIds = [...new Set(data.map((post: any) => post.creador.id))];
        fetchUserImages(uniqueCreatorIds as number[]);
      } else {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }
    } catch (err) {
      console.error('Error al cargar publicaciones:', err);
      setError('No se pudieron cargar las publicaciones. Por favor, intenta de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Función para obtener las imágenes de perfil de los usuarios por ID
   */
  const fetchUserImages = async (userIds: number[]) => {
    try {
      // Filtrar los IDs que ya tenemos en caché
      const idsToFetch = userIds.filter(id => !userImagesCache[id]);
      
      if (idsToFetch.length === 0) return;
      
      // Para cada ID, obtener la imagen del usuario
      const newCache = {...userImagesCache};
      
      for (const userId of idsToFetch) {
        try {
          const response = await fetch(`${config.apiUrl}/usuarios/${userId}/perfiles`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            }
          });
          
          if (response.ok) {
            const userData = await response.json();
            // Guardar la imagen en el caché
            if (userData.img) {
              newCache[userId] = userData.img;
            } else {
              // Si no tiene imagen, usar una por defecto
              newCache[userId] = '/default-avatar.svg';
            }
          } else {
            newCache[userId] = '/default-avatar.svg';
          }
        } catch (error) {
          console.error(`Error al obtener imagen para usuario ${userId}:`, error);
          newCache[userId] = '/default-avatar.svg';
        }
      }
      
      // Actualizar el caché
      setUserImagesCache(newCache);
    } catch (error) {
      console.error('Error al obtener imágenes de usuarios:', error);
    }
  };

  /**
   * Maneja el envío del formulario para crear un nuevo post
   */
  const handlePostSubmit = async (postData: PostData) => {
    try {
      setIsSubmitting(true);
      
      console.log('Enviando publicación:', postData);
      
      // Realizar la petición fetch con JSON
      const response = await fetch(`${config.apiUrl}/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "*/*",
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(postData),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error: ${response.status} - ${errorText || response.statusText}`);
      }
      
      const newPost = await response.json();
      console.log('Post creado exitosamente:', newPost);
      
      // Actualizar la lista de posts
      setPosts(prevPosts => [newPost, ...prevPosts]);
      
    } catch (err) {
      console.error('Error al crear el post:', err);
      setError('No se pudo crear la publicación. Por favor, intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Maneja el envío de un comentario
   */
  const handleCommentSubmit = (postId: number, text: string) => {
    console.log('Comentario enviado:', { postId, text });
    // Aquí iría la lógica para enviar el comentario al backend
  };

  /**
   * Carga más publicaciones
   */
  const handleLoadMore = () => {
    console.log('Cargar más publicaciones');
    // Aquí iría la lógica para cargar más publicaciones
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
        userId={typeof user?.id === 'number' ? user.id : 1}
        userName={user?.name}
        userImagesCache={userImagesCache}
        onPostSubmit={handlePostSubmit}
        isSubmitting={isSubmitting}
      />
      
      {/* Feed de publicaciones */}
      <PostList 
        posts={posts}
        userImagesCache={userImagesCache}
        userId={typeof user?.id === 'number' ? user.id : 1}
        loading={loading}
        onLoadMore={handleLoadMore}
        onCommentSubmit={handleCommentSubmit}
      />
    </div>
  );
};

export default Home; 
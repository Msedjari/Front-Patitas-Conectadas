import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { config } from '../../config';
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';

/**
 * Interfaz para el modelo de Post
 * Actualizamos la interfaz para que coincida con la estructura real de los datos
 */
interface Post {
  id: number;
  contenido: string;
  fecha: string;
  img?: string;
  createdAt?: string;
  updatedAt?: string;
  creador: {
    id: number;
    nombre: string;
    apellido?: string;
    email?: string;
  };
  grupo?: any;
  estadisticas?: {
    likes: number;
    comentarios: number;
  };
}

/**
 * Interfaz para almacenar imágenes de usuarios en caché
 */
interface UserImagesCache {
  [userId: number]: string;
}

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
 * 
 * El componente gestiona la obtención de imágenes de perfil de los creadores
 * de publicaciones mediante un sistema de caché para evitar peticiones redundantes.
 * 
 * Nota: La funcionalidad de likes, comentarios y estadísticas está actualmente
 * desactivada en la interfaz.
 */
const Home: React.FC = () => {
  // Estado para el texto del nuevo post
  const [postText, setPostText] = useState('');
  // Estado para la imagen del nuevo post (ahora es URL en lugar de File)
  const [postImageUrl, setPostImageUrl] = useState<string>('');
  // Estado para almacenar las publicaciones
  const [posts, setPosts] = useState<Post[]>([]);
  // Estado para indicar carga
  const [loading, setLoading] = useState(true);
  // Estado para manejar errores
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Caché para almacenar las imágenes de usuario y evitar peticiones repetidas
  const [userImagesCache, setUserImagesCache] = useState<UserImagesCache>({});
  
  // Nuevos estados para el selector de emojis
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showCommentEmojiPicker, setShowCommentEmojiPicker] = useState<number | null>(null);
  const [commentText, setCommentText] = useState<Record<number, string>>({});
  
  // Referencias para cerrar el selector de emojis cuando se hace clic fuera
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const commentEmojiPickerRef = useRef<HTMLDivElement>(null);
  
  const { user } = useAuth();

  // Efecto para manejar clics fuera del selector de emojis
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Cerrar selector de emojis principal
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
      
      // Cerrar selector de emojis de comentarios
      if (commentEmojiPickerRef.current && !commentEmojiPickerRef.current.contains(event.target as Node)) {
        setShowCommentEmojiPicker(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Efecto para cargar los posts al montar el componente
  useEffect(() => {
    // Función para cargar los posts desde el backend
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
          const uniqueCreatorIds = [...new Set(data.map(post => post.creador.id))];
          fetchUserImages(uniqueCreatorIds);
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
    
    fetchPosts();
  }, []);
  
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
   * Función para obtener la imagen de un usuario desde el caché
   */
  const getUserImage = (userId: number): string => {
    return userImagesCache[userId] || '/default-avatar.svg';
  };

  /**
   * Maneja el envío del formulario para crear un nuevo post
   * @param e - Evento del formulario
   */
  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Comprobar que hay al menos texto o imagen
    if (!postText.trim() && !postImageUrl) return;
    
    try {
      setIsSubmitting(true);
      
      // Crear el objeto JSON para la solicitud
      interface PostData {
        contenido: string;
        creador: {
          id: number | string;
        };
        img?: string;
      }

      const postData: PostData = {
        contenido: postText,
        creador: {
          id: user?.id || 1 // Usar el ID del usuario si está disponible, o 1 como fallback
        }
      };
      if (postImageUrl) {
        postData.img = postImageUrl;
      }
      
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
      
      // Limpiar el formulario
      setPostText('');
      setPostImageUrl('');
      
    } catch (err) {
      console.error('Error al crear el post:', err);
      setError('No se pudo crear la publicación. Por favor, intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Maneja la entrada de una URL de imagen para el post
   */
  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPostImageUrl(e.target.value);
  };

  // Formatear fecha relativa (ej: "hace 5 minutos")
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Hace un momento';
    if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} minutos`;
    if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} horas`;
    return `Hace ${Math.floor(diffInSeconds / 86400)} días`;
  };

  /**
   * Manejador para cuando se selecciona un emoji en el creador de posts
   */
  const onEmojiClick = (emojiData: EmojiClickData) => {
    setPostText(prevText => prevText + emojiData.emoji);
    setShowEmojiPicker(false);
  };
  
  /**
   * Manejador para cuando se selecciona un emoji en un comentario
   */
  const onCommentEmojiClick = (postId: number, emojiData: EmojiClickData) => {
    setCommentText(prev => ({
      ...prev,
      [postId]: (prev[postId] || '') + emojiData.emoji
    }));
    setShowCommentEmojiPicker(null);
  };
  
  /**
   * Manejador para cambios en el texto de comentario
   */
  const handleCommentChange = (postId: number, text: string) => {
    setCommentText(prev => ({
      ...prev,
      [postId]: text
    }));
  };

  // Obtener historias del backend - ahora comentado
  /*
  useEffect(() => {
    const fetchStories = async () => {
      if (!user) return;
      
      try {
        setLoadingStories(true);
        // Esta es la URL que debería obtener las historias, ajustar según el backend
        const response = await fetch(`${config.apiUrl}/historias`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setStories(data);
        } else {
          console.error('Error al obtener historias:', response.status);
        }
      } catch (error) {
        console.error('Error al cargar historias:', error);
      } finally {
        setLoadingStories(false);
      }
    };
    
    fetchStories();
  }, [user]);
  */

  return (
    <div>
      {/* Sección de historias - ahora comentada */}
      {/*
      <div className="mb-4 overflow-x-auto no-scrollbar">
        <div className="flex space-x-2 pb-2">
          <!-- Historia para crear -->
          <div className="relative flex-shrink-0 w-[115px] h-[200px] rounded-lg overflow-hidden bg-white shadow-sm cursor-pointer border border-gray-200">
            <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
              <div className="w-10 h-10 rounded-full bg-[#f8ffe5] flex items-center justify-center mb-2 border border-[#6cda84]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#6cda84]" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-[#2a2827] text-sm font-medium">Crear historia</p>
            </div>
          </div>
          
          <!-- Historias de usuarios -->
          {loadingStories ? (
            <div className="flex-shrink-0 w-[115px] h-[200px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#6cda84]"></div>
            </div>
          ) : (
            stories.map(story => (
              <div key={story.id} className="relative flex-shrink-0 w-[115px] h-[200px] rounded-lg overflow-hidden shadow-sm cursor-pointer border border-gray-200">
                <!-- Overlay para oscurecer un poco la imagen -->
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black opacity-60"></div>
                
                <!-- Avatar del usuario -->
                <div className="absolute top-3 left-3 w-9 h-9 rounded-full border-4 border-[#6cda84] bg-white overflow-hidden z-10">
                  <div className="w-full h-full flex items-center justify-center bg-[#a7e9b5] text-[#3d7b6f] text-xs font-bold">
                    {story.usuario?.nombre?.charAt(0) || '?'}
                  </div>
                </div>
                
                <!-- Nombre del usuario -->
                <div className="absolute bottom-3 left-3 right-3 z-10">
                  <p className="text-white text-xs font-medium">{story.usuario?.nombre || "Usuario"}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      */}
      
      {/* Mensaje de error si existe */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
          <p>{error}</p>
          <button 
            className="mt-2 text-sm underline"
            onClick={() => {
              setError(null);
              // Aquí se llamaría de nuevo a la función para cargar posts
            }}
          >
            Intentar de nuevo
          </button>
        </div>
      )}
      
      {/* Formulario para crear post con emoji picker */}
      <form onSubmit={handlePostSubmit} className="bg-white rounded-lg shadow-sm mb-4 p-4 border border-gray-200">
        <div className="flex items-center space-x-3 mb-3 pb-3 border-b border-gray-200">
          <div className="h-10 w-10 rounded-full bg-gray-300 overflow-hidden">
            <img 
              src={getUserImage(user?.id || 1)} 
              alt="Avatar" 
              className="h-full w-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/default-avatar.svg';
              }}
            />
          </div>
          <div className="flex-1 relative">
            <textarea
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              className="w-full bg-[#f8ffe5] text-[#575350] rounded-lg px-4 py-2.5 min-h-[40px] resize-none focus:outline-none focus:ring-1 focus:ring-[#6cda84]"
              placeholder={`¿Qué estás pensando, ${user?.name?.split(' ')[0] || 'Usuario'}?`}
            />
            <button 
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="absolute right-3 bottom-3 text-[#3d7b6f] hover:text-[#6cda84]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z" clipRule="evenodd" />
              </svg>
            </button>
            
            {/* Emoji Picker para el post */}
            {showEmojiPicker && (
              <div className="absolute right-0 z-10 mt-1" ref={emojiPickerRef}>
                <EmojiPicker
                  onEmojiClick={onEmojiClick}
                  theme={Theme.LIGHT}
                  searchDisabled={false}
                  skinTonesDisabled
                  width={300}
                  height={350}
                />
              </div>
            )}
          </div>
        </div>
        
        {/* Campo para URL de imagen */}
        <div className="flex items-center space-x-4 mt-3">
          <label className="flex items-center space-x-2 cursor-pointer text-[#3d7b6f] hover:text-[#2d5c53] p-2 rounded-md transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
            <span>Imagen URL</span>
          </label>
          <input 
            type="text" 
            value={postImageUrl}
            onChange={handleImageUrlChange}
            placeholder="https://ejemplo.com/imagen.jpg"
            className="flex-1 bg-[#f8ffe5] text-[#575350] rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#6cda84]"
          />
        </div>
        
        {/* Previsualización de imagen */}
        {postImageUrl && (
          <div className="relative mt-3">
            <img 
              src={postImageUrl} 
              alt="Vista previa" 
              className="h-24 object-cover rounded-md"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/sample-post-image.svg';
                setError('No se pudo cargar la imagen. Verifica la URL.');
              }}
            />
            <button 
              type="button"
              onClick={() => setPostImageUrl('')}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        
        {/* Botón de envío */}
        <button 
          type="submit"
          disabled={(!postText.trim() && !postImageUrl) || isSubmitting}
          className="w-full py-2 px-4 mt-4 bg-[#3d7b6f] text-white rounded-md hover:bg-[#2d5c53] transition-colors disabled:opacity-50"
        >
          {isSubmitting ? 'Publicando...' : 'Publicar'}
        </button>
      </form>
      
      {/* Indicador de carga */}
      {loading && (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#6cda84]"></div>
        </div>
      )}
      
      {/* Mensaje cuando no hay posts */}
      {!loading && posts.length === 0 && (
        <div className="text-center py-8 bg-white rounded-lg shadow-sm border border-gray-200">
          <p className="text-[#575350]">No hay publicaciones disponibles.</p>
          <p className="text-[#3d7b6f] mt-2">¡Sé el primero en compartir algo con la comunidad!</p>
        </div>
      )}
      
      {/* Feed de publicaciones */}
      <div className="space-y-4">
        {posts.map(post => (
          <div key={post.id} className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
            {/* Cabecera del post */}
            <div className="p-4 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-gray-300 overflow-hidden">
                  <img 
                    src={getUserImage(post.creador.id)} 
                    alt={post.creador.nombre || "Usuario"} 
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/default-avatar.svg';
                    }}
                  />
                </div>
                <div>
                  <p className="font-medium text-sm text-[#2a2827]">
                    {post.creador.nombre} {post.creador.apellido || ""}
                  </p>
                  <p className="text-[#575350] text-xs">{formatRelativeTime(post.fecha || post.createdAt || '')}</p>
                </div>
              </div>
              <button className="text-[#575350] hover:text-[#2a2827] rounded-full w-8 h-8 flex items-center justify-center hover:bg-[#f8ffe5]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                </svg>
              </button>
            </div>
            
            {/* Contenido del post */}
            <div className="px-4 pb-3">
              <p className="text-[#2a2827] text-sm mb-4">{post.contenido}</p>
            </div>
            
            {/* Imagen del post si existe */}
            {post.img && (
              <div className="border-t border-b border-gray-100">
                <img 
                  src={post.img} 
                  alt="Contenido de la publicación" 
                  className="w-full h-auto"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/sample-post-image.svg';
                  }}
                />
              </div>
            )}
            
            {/* Formulario de comentarios con emoji picker */}
            <div className="px-4 py-3 border-t border-gray-100">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-gray-300 overflow-hidden flex-shrink-0">
                  <img 
                    src={getUserImage(user?.id || 1)} 
                    alt="Avatar" 
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/default-avatar.svg';
                    }}
                  />
                </div>
                <div className="flex-1 flex items-center bg-[#f8ffe5] rounded-full overflow-hidden relative">
                  <input 
                    type="text" 
                    placeholder="Escribe un comentario..." 
                    className="w-full px-4 py-1.5 text-sm focus:outline-none bg-transparent"
                    value={commentText[post.id] || ''}
                    onChange={(e) => handleCommentChange(post.id, e.target.value)}
                  />
                  <div className="flex items-center pr-2 space-x-1">
                    <button 
                      type="button"
                      className="text-[#3d7b6f] p-1 hover:text-[#6cda84]"
                      onClick={() => setShowCommentEmojiPicker(post.id === showCommentEmojiPicker ? null : post.id)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <button className="text-[#3d7b6f] p-1 hover:text-[#6cda84]">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  
                  {/* Emoji Picker para comentarios */}
                  {showCommentEmojiPicker === post.id && (
                    <div className="absolute right-0 bottom-10 z-10" ref={commentEmojiPickerRef}>
                      <EmojiPicker
                        onEmojiClick={(emojiData) => onCommentEmojiClick(post.id, emojiData)}
                        theme={Theme.LIGHT}
                        searchDisabled={false}
                        skinTonesDisabled
                        width={300}
                        height={350}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Botón para cargar más posts */}
      {posts.length > 0 && (
        <button 
          className="mt-4 w-full py-2 bg-white text-[#3d7b6f] rounded-lg hover:bg-[#f8ffe5] border border-gray-200 transition-colors"
          onClick={() => {
            // Aquí iría la llamada al backend para cargar más posts
          }}
        >
          Ver más publicaciones
        </button>
      )}
    </div>
  );
};

export default Home;
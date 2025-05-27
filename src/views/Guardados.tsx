import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { config } from '../config';
import { Post, CommentData } from '../components/home/types';
import PostItem from '../components/home/PostItem';
import { createComment } from '../services/commentService';
import { getUserImage } from '../components/home/HomeUtils';

const Guardados: React.FC = () => {
  const { user } = useAuth();
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userImagesCache, setUserImagesCache] = useState<{[key: number]: string}>({});

  // Función para actualizar el caché de imágenes
  const updateUserImagesCache = (userId: number, imagePath: string) => {
    setUserImagesCache(prev => ({
      ...prev,
      [userId]: imagePath
    }));
  };

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

  // Efecto para escuchar cambios en el caché de imágenes
  useEffect(() => {
    const handleUserImageUpdate = (e: CustomEvent) => {
      const { userId, imagePath } = e.detail;
      setUserImagesCache(prev => ({
        ...prev,
        [userId]: imagePath
      }));
    };

    window.addEventListener('userImageUpdated', handleUserImageUpdate as EventListener);
    return () => window.removeEventListener('userImageUpdated', handleUserImageUpdate as EventListener);
  }, []);
  
  // Función para manejar el envío de comentarios
  const handleCommentSubmit = async (commentData: CommentData) => {
    try {
      if (!user?.id) {
        throw new Error('No se pudo obtener el ID del usuario autenticado');
      }
      
      // Asegurar que el creadorId sea correcto
      commentData.creadorId = Number(user.id);
      
      // Usar el servicio para crear el comentario
      await createComment(commentData);
      
    } catch (err) {
      console.error('Error al enviar comentario:', err);
      setError('No se pudo enviar el comentario. Por favor, intenta de nuevo.');
    }
  };
  
  // Cargar posts guardados al montar el componente
  useEffect(() => {
    const fetchSavedPosts = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem(config.session.tokenKey);
        if (!token) throw new Error('No hay token de autenticación');
        
        // Primero obtenemos las relaciones usuario-post
        const response = await fetch(`${config.apiUrl}/usuario-post/usuario/${user?.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }
        
        const relaciones = await response.json();
        
        // Luego obtenemos los detalles de cada post
        const postsPromises = relaciones.map(async (relacion: any) => {
          const postResponse = await fetch(`${config.apiUrl}/posts/${relacion.postId}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (!postResponse.ok) {
            throw new Error(`Error al obtener el post ${relacion.postId}`);
          }
          const post = await postResponse.json();

          // Cargar la imagen del autor del post
          try {
            const userResponse = await fetch(`${config.apiUrl}/usuarios/${post.creadorId}/perfiles`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            if (userResponse.ok) {
              const userData = await userResponse.json();
              if (userData && userData.img) {
                updateUserImagesCache(Number(post.creadorId), userData.img);
              }
            }
          } catch (error) {
            console.error('Error al cargar imagen del usuario:', error);
          }

          return post;
        });
        
        const posts = await Promise.all(postsPromises);
        setSavedPosts(posts);
        setError(null);
      } catch (err) {
        console.error('Error al cargar posts guardados:', err);
        setError('No se pudieron cargar los posts guardados. Intenta de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };
    
    if (user?.id) {
      fetchSavedPosts();
    }
  }, [user?.id]);
  
  if (loading && savedPosts.length === 0) {
    return (
      <div className="flex justify-center my-5">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#6cda84]"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 max-w-4xl px-4">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h1 className="text-2xl font-semibold text-[#3d7b6f] mb-6">Posts guardados</h1>
        
        {/* Mensaje de error */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
            <p>{error}</p>
          </div>
        )}
        
        {/* Lista de posts guardados */}
        {savedPosts.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No tienes posts guardados.</p>
            <p className="mt-2 text-[#3d7b6f]">¡Comienza a guardar posts que te interesen!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {savedPosts.map(post => (
              <PostItem 
                key={post.id} 
                post={post} 
                userImagesCache={userImagesCache}
                userId={user?.id || 1}
                onCommentSubmit={handleCommentSubmit}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Guardados; 
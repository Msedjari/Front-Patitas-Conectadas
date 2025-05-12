import React, { useEffect, useState } from 'react';
import { Post, UserImagesCache, CommentData, Comment } from './types';
import CommentForm from './CommentForm';
import { fetchCommentsByPost, fetchCommentCountByPost } from '../../services/commentService';
import PostHeader from './PostHeader';
import PostContent from './PostContent';
import CommentsButton from './CommentsButton';
import CommentsSection from './CommentsSection';
import { config } from '../../config';

interface PostItemProps {
  post: Post;
  userImagesCache: UserImagesCache;
  userId: number | string;
  onCommentSubmit?: (commentData: CommentData) => void;
}

/**
 * Componente para mostrar una publicación individual
 */
const PostItem: React.FC<PostItemProps> = ({ 
  post, 
  userImagesCache, 
  userId,
  onCommentSubmit 
}) => {
  // Estado local para controlar los comentarios
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentCount, setCommentCount] = useState<number>(post.estadisticas?.comentarios || 0);
  const [loadingComments, setLoadingComments] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentsError, setCommentsError] = useState<string | null>(null);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentJustSubmitted, setCommentJustSubmitted] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Información del creador (puede venir directamente en el post o en el objeto creador)
  const creadorId = post.creadorId || post.creador?.id;
  const creadorNombre = post.nombreCreador || post.creador?.nombre || "Usuario";
  const creadorApellido = post.apellidoCreador || post.creador?.apellido || "";
  const fecha = post.fecha || post.createdAt || '';
  
  // Efecto para cargar el conteo de comentarios al montar el componente
  useEffect(() => {
    const loadCommentCount = async () => {
      try {
        const count = await fetchCommentCountByPost(post.id);
        setCommentCount(count);
      } catch (error) {
        console.error(`Error al cargar conteo de comentarios para el post ${post.id}:`, error);
      }
    };
    
    loadCommentCount();
  }, [post.id]);
  
  // Función para cargar los comentarios de un post
  const loadComments = async () => {
    try {
      setLoadingComments(true);
      setCommentsError(null);
      
      console.log(`Cargando comentarios para el post ${post.id}...`);
      
      // Usar el servicio para cargar comentarios
      const data = await fetchCommentsByPost(post.id);
      console.log(`Comentarios cargados para post ${post.id}:`, data);
      
      setComments(data);
      setCommentCount(data.length);
    } catch (error) {
      console.error(`Error al cargar comentarios para el post ${post.id}:`, error);
      setCommentsError('No se pudieron cargar los comentarios. Intenta de nuevo más tarde.');
    } finally {
      setLoadingComments(false);
    }
  };
  
  // Efecto para cargar comentarios en distintos casos
  useEffect(() => {
    // Cargar comentarios cuando se muestra la sección de comentarios
    if (showComments && !loadingComments) {
      loadComments();
    }
  }, [showComments]);
  
  // Efecto para manejar la carga después de enviar un comentario
  useEffect(() => {
    if (commentJustSubmitted) {
      // Si se acaba de enviar un comentario, asegurar que los comentarios se muestren
      if (!showComments) {
        setShowComments(true);
      } else {
        // Si ya están visibles, solo recargar los comentarios
        loadComments();
      }
      setCommentJustSubmitted(false);
    }
  }, [commentJustSubmitted]);
  
  // Manejador para alternar la visualización de comentarios
  const toggleComments = () => {
    setShowComments(prev => !prev);
  };
  
  // Manejador para enviar un nuevo comentario
  const handleCommentSubmit = async (commentData: CommentData) => {
    if (!onCommentSubmit) return;
    
    try {
      setSubmittingComment(true);
      
      // Enviar el comentario a través del callback proporcionado por el padre
      await onCommentSubmit(commentData);
      
      // Marcar que se acaba de enviar un comentario para activar la recarga
      setCommentJustSubmitted(true);
      
      // Incrementar el contador de comentarios inmediatamente para mejor UX
      setCommentCount(prev => prev + 1);
    } catch (error) {
      console.error(`Error al enviar comentario para el post ${post.id}:`, error);
    } finally {
      setSubmittingComment(false);
    }
  };

  // Función para eliminar el post
  const handleDeletePost = async () => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este post? Esta acción no se puede deshacer.')) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      const token = localStorage.getItem(config.session.tokenKey);
      const response = await fetch(`${config.apiUrl}/posts/${post.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || 'No se pudo eliminar el post');
      }
      // Opcional: recargar la página o quitar el post del estado global
      window.location.reload();
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'Error desconocido al eliminar el post');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
      {/* Cabecera del post - Información del autor */}
      <PostHeader 
        creadorId={creadorId}
        creadorNombre={creadorNombre}
        creadorApellido={creadorApellido}
        fecha={fecha}
        userImagesCache={userImagesCache}
        postId={post.id}
      />
      
      {/* Botón eliminar solo si el post es del usuario actual */}
      {Number(userId) === Number(creadorId) && (
        <div className="flex justify-end px-4 pt-2">
          <button
            className="text-red-600 hover:text-white border border-red-600 hover:bg-red-600 font-semibold py-1 px-3 rounded transition disabled:opacity-50"
            onClick={handleDeletePost}
            disabled={deleting}
          >
            {deleting ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      )}
      {deleteError && (
        <div className="text-red-600 text-sm px-4 pb-2">{deleteError}</div>
      )}
      
      {/* Contenido del post - Texto e imagen */}
      <PostContent 
        contenido={post.contenido}
        imagen={post.img}
        postId={post.id}
      />
      
      {/* Botones de interacción */}
      <div className="px-4 py-2 border-t border-gray-100 flex">
        <CommentsButton
          count={commentCount}
          onClick={toggleComments}
          isActive={showComments}
        />
      </div>
      
      {/* Sección de comentarios */}
      {showComments && (
        <div>
          <CommentsSection 
            comments={comments}
            userImagesCache={userImagesCache}
            loading={loadingComments}
            error={commentsError}
            onRetry={loadComments}
          />
        </div>
      )}
      
      {/* Formulario de comentarios */}
      <CommentForm 
        postId={post.id} 
        userId={userId} 
        userImagesCache={userImagesCache}
        onCommentSubmit={handleCommentSubmit}
        isSubmitting={submittingComment}
      />
    </div>
  );
};

export default PostItem; 
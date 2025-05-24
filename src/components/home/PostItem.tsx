import React, { useEffect, useState } from 'react';
import { Post, UserImagesCache, CommentData, Comment } from './types';
import CommentForm from './CommentForm';
import { fetchCommentsByPost, fetchCommentCountByPost } from '../../services/commentService';
import PostHeader from './PostHeader';
import PostContent from './PostContent';
import CommentsButton from './CommentsButton';
import CommentsSection from './CommentsSection';
import { config } from '../../config';
import PostOptions from './PostOptions';
import { guardarPost, quitarPostGuardado, estaPostGuardado } from '../../services/usuarioPostService';

interface PostItemProps {
  post: Post;
  userImagesCache: UserImagesCache;
  userId: number | string;
  onCommentSubmit?: (commentData: CommentData) => void;
  onDeletePost?: (postId: number) => void;
}

/**
 * Componente para mostrar una publicación individual
 */
const PostItem: React.FC<PostItemProps> = ({ 
  post, 
  userImagesCache, 
  userId,
  onCommentSubmit,
  onDeletePost
}) => {
  // Estado local para controlar los comentarios
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentCount, setCommentCount] = useState<number>(post.estadisticas?.comentarios || 0);
  const [loadingComments, setLoadingComments] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentsError, setCommentsError] = useState<string | null>(null);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentJustSubmitted, setCommentJustSubmitted] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [guardando, setGuardando] = useState(false);

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
  
  // Efecto para verificar si el post está guardado al montar el componente
  useEffect(() => {
    const verificarGuardado = async () => {
      try {
        const estaGuardado = await estaPostGuardado(Number(userId), post.id);
        setGuardado(estaGuardado);
      } catch (error) {
        console.error('Error al verificar si el post está guardado:', error);
      }
    };

    if (userId && post.id) {
      verificarGuardado();
    }
  }, [userId, post.id]);
  
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

  // Función para manejar guardar/quitar de guardados
  const handleGuardarClick = async () => {
    if (!userId || guardando) return;

    try {
      setGuardando(true);
      if (guardado) {
        await quitarPostGuardado(Number(userId), post.id);
        setGuardado(false);
      } else {
        await guardarPost(Number(userId), post.id);
        setGuardado(true);
      }
    } catch (error) {
      console.error('Error al guardar/quitar post:', error);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
      {/* Cabecera del post - Información del autor y menú de opciones */}
      <div className="flex justify-between items-center p-4 pb-0">
        <div className="flex-1">
          <PostHeader 
            creadorId={creadorId}
            creadorNombre={creadorNombre}
            creadorApellido={creadorApellido}
            fecha={fecha}
            userImagesCache={userImagesCache}
            postId={post.id}
          />
        </div>
        {/* Menú de opciones: solo eliminar si es el creador, solo guardar si NO es el creador */}
        <div className="ml-2">
          <PostOptions
            esCreador={Number(userId) === Number(creadorId)}
            postId={post.id}
            onEliminar={() => onDeletePost && onDeletePost(post.id)}
            onGuardar={handleGuardarClick}
            guardado={guardado}
          />
        </div>
      </div>
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
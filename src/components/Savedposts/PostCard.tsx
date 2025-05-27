import React, { useState } from 'react';
import { Post } from '../../types/Post';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { config } from '../../config';
import { feedService } from '../../services/feedService';
import { ComentariosLista } from './ComentariosLista';

interface PostCardProps {
  post: Post;
  onUpdate?: () => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onUpdate }) => {
  const [mostrarComentarios, setMostrarComentarios] = useState(false);
  const [likes, setLikes] = useState(post.likes);
  const [meGusta, setMeGusta] = useState(post.meGusta);
  const [procesando, setProcesando] = useState(false);
  const [comentarios, setComentarios] = useState<any[]>([]);
  const [cargandoComentarios, setCargandoComentarios] = useState(false);

  const fecha = format(new Date(post.fecha), "d 'de' MMMM 'a las' HH:mm", { locale: es });

  const handleLike = async () => {
    if (procesando) return;
    
    try {
      setProcesando(true);
      if (meGusta) {
        await feedService.quitarLike(post.id);
        setLikes(prev => prev - 1);
      } else {
        await feedService.darLike(post.id);
        setLikes(prev => prev + 1);
      }
      setMeGusta(!meGusta);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error al manejar like:', error);
    } finally {
      setProcesando(false);
    }
  };

  const cargarComentarios = async () => {
    if (cargandoComentarios) return;
    
    try {
      setCargandoComentarios(true);
      const token = localStorage.getItem(config.session.tokenKey);
      if (!token) throw new Error('No hay token de autenticación');

      const response = await fetch(`${config.apiUrl}/posts/${post.id}/comentarios`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al cargar comentarios');
      }

      const data = await response.json();
      setComentarios(data);
    } catch (error) {
      console.error('Error al cargar comentarios:', error);
    } finally {
      setCargandoComentarios(false);
    }
  };

  const toggleComentarios = () => {
    if (!mostrarComentarios) {
      cargarComentarios();
    }
    setMostrarComentarios(!mostrarComentarios);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Cabecera del post */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <Link to={`/perfil/${post.usuarioId}`} className="flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-gray-300 overflow-hidden">
              <img
                src={post.usuarioImg ? 
                  (post.usuarioImg.startsWith('http') ? 
                    post.usuarioImg : 
                    `${config.apiUrl}/uploads/${post.usuarioImg}`) 
                  : '/default-avatar.svg'}
                alt={`${post.usuarioNombre} ${post.usuarioApellido}`}
                className="h-full w-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/default-avatar.svg';
                }}
              />
            </div>
          </Link>
          <div className="flex-1 min-w-0">
            <Link to={`/perfil/${post.usuarioId}`} className="text-sm font-medium text-[#2a2827] hover:text-[#6cda84]">
              {post.usuarioNombre} {post.usuarioApellido}
            </Link>
            <p className="text-xs text-[#575350]">{fecha}</p>
          </div>
        </div>
      </div>

      {/* Contenido del post */}
      <div className="p-4">
        <p className="text-[#2a2827] whitespace-pre-wrap">{post.contenido}</p>
        
        {/* Imágenes del post */}
        {post.imagenes && post.imagenes.length > 0 && (
          <div className="mt-4 grid grid-cols-1 gap-2">
            {post.imagenes.map((imagen, index) => (
              <img
                key={index}
                src={imagen.startsWith('http') ? 
                  imagen : 
                  `${config.apiUrl}/uploads/${imagen}`}
                alt={`Imagen ${index + 1} del post`}
                className="w-full h-auto rounded-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/default-avatar.svg';
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Acciones del post */}
      <div className="px-4 py-3 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleLike}
              disabled={procesando}
              className={`flex items-center space-x-1 ${
                meGusta ? 'text-[#6cda84]' : 'text-[#575350] hover:text-[#6cda84]'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
              <span>{likes}</span>
            </button>
            <button 
              onClick={toggleComentarios}
              className="flex items-center space-x-1 text-[#575350] hover:text-[#6cda84]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
              </svg>
              <span>{post.comentarios}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sección de comentarios */}
      {mostrarComentarios && (
        <ComentariosLista
          postId={post.id}
          comentarios={comentarios}
          onNuevoComentario={() => {
            cargarComentarios();
            if (onUpdate) onUpdate();
          }}
        />
      )}
    </div>
  );
}; 
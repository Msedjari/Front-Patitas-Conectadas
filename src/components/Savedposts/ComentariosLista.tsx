import React, { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { config } from '../../config';

interface Comentario {
  id: number;
  contenido: string;
  fecha: string;
  usuarioId: number;
  usuarioNombre: string;
  usuarioApellido: string;
  usuarioImg?: string;
}

interface ComentariosListaProps {
  postId: number;
  comentarios: Comentario[];
  onNuevoComentario: () => void;
}

export const ComentariosLista: React.FC<ComentariosListaProps> = ({ postId, comentarios, onNuevoComentario }) => {
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoComentario.trim() || enviando) return;

    try {
      setEnviando(true);
      const token = localStorage.getItem(config.session.tokenKey);
      if (!token) throw new Error('No hay token de autenticación');

      const response = await fetch(`${config.apiUrl}/posts/${postId}/comentarios`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ contenido: nuevoComentario })
      });

      if (!response.ok) {
        throw new Error('Error al enviar el comentario');
      }

      setNuevoComentario('');
      onNuevoComentario();
    } catch (error) {
      console.error('Error al enviar comentario:', error);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="mt-4 border-t border-gray-200 pt-4">
      {/* Formulario de nuevo comentario */}
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex items-start space-x-2">
          <textarea
            value={nuevoComentario}
            onChange={(e) => setNuevoComentario(e.target.value)}
            placeholder="Escribe un comentario..."
            className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6cda84] resize-none"
            rows={2}
          />
          <button
            type="submit"
            disabled={!nuevoComentario.trim() || enviando}
            className={`px-4 py-2 rounded-lg ${
              !nuevoComentario.trim() || enviando
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-[#6cda84] hover:bg-[#38cd58] text-white'
            }`}
          >
            {enviando ? 'Enviando...' : 'Comentar'}
          </button>
        </div>
      </form>

      {/* Lista de comentarios */}
      <div className="space-y-4">
        {comentarios.map((comentario) => (
          <div key={comentario.id} className="flex space-x-3">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-gray-300 overflow-hidden">
                <img
                  src={comentario.usuarioImg ? 
                    (comentario.usuarioImg.startsWith('http') ? 
                      comentario.usuarioImg : 
                      `${config.apiUrl}/uploads/${comentario.usuarioImg}`) 
                    : '/default-avatar.svg'}
                  alt={`${comentario.usuarioNombre} ${comentario.usuarioApellido}`}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/default-avatar.svg';
                  }}
                />
              </div>
            </div>
            <div className="flex-1">
              <div className="bg-gray-100 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-[#2a2827]">
                    {comentario.usuarioNombre} {comentario.usuarioApellido}
                  </span>
                  <span className="text-xs text-[#575350]">
                    {format(new Date(comentario.fecha), "d 'de' MMMM 'a las' HH:mm", { locale: es })}
                  </span>
                </div>
                <p className="mt-1 text-[#2a2827]">{comentario.contenido}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 
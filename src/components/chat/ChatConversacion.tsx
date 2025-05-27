import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { chatService, Mensaje } from '../../services/chatService';
import { getUserImage } from '../home/HomeUtils';
import LoadingSpinner from '../common/LoadingSpinner';
import ConfirmDialog from '../common/ConfirmDialog';
import EmojiPickerComponent from '../common/EmojiPicker';
import { config } from '../../config';

interface ChatConversacionProps {
  otroUsuarioId: number;
  otroUsuarioNombre: string;
  onMensajeEnviado?: (mensaje: Mensaje) => void;
  onConversacionBorrada?: () => void;
  onBack?: () => void;
}

const ChatConversacion: React.FC<ChatConversacionProps> = ({ 
  otroUsuarioId, 
  otroUsuarioNombre,
  onMensajeEnviado,
  onConversacionBorrada,
  onBack
}) => {
  const { user } = useAuth();
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [mostrarConfirmacionBorrar, setMostrarConfirmacionBorrar] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [userImagesCache, setUserImagesCache] = useState<Record<number, string>>({});
  const mensajesEndRef = useRef<HTMLDivElement>(null);
  const ultimoMensajeIdRef = useRef<number | null>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  // Efecto para cargar la imagen del usuario
  useEffect(() => {
    const fetchUserImage = async () => {
      try {
        const token = localStorage.getItem(config.session.tokenKey);
        if (!token) return;

        // Intentar obtener la imagen del perfil
        const response = await fetch(`${config.apiUrl}/usuarios/${otroUsuarioId}/perfiles`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });

        if (response.ok) {
          const profileData = await response.json();
          if (profileData && profileData.img) {
            // Actualizar el caché local
            setUserImagesCache(prev => ({
              ...prev,
              [otroUsuarioId]: profileData.img
            }));
            
            // Actualizar el caché en localStorage
            const cachedImages = localStorage.getItem('userImagesCache');
            const currentCache = cachedImages ? JSON.parse(cachedImages) : {};
            const newCache = { ...currentCache, [otroUsuarioId]: profileData.img };
            localStorage.setItem('userImagesCache', JSON.stringify(newCache));
          }
        }
      } catch (error) {
        console.error('Error al cargar imagen de usuario:', error);
      }
    };

    fetchUserImage();
  }, [otroUsuarioId]);

  const scrollToBottom = () => {
    mensajesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const cargarMensajes = useCallback(async () => {
    if (!user) return;
    try {
      const conversacion = await chatService.obtenerConversacion(Number(user.id), otroUsuarioId);
      
      // Solo actualizar si hay nuevos mensajes
      if (conversacion.length > 0) {
        const ultimoMensaje = conversacion[conversacion.length - 1];
        if (ultimoMensajeIdRef.current !== ultimoMensaje.id) {
          setMensajes(conversacion);
          ultimoMensajeIdRef.current = ultimoMensaje.id;
          await chatService.marcarVistos(Number(user.id), otroUsuarioId);
        }
      }
    } catch (error) {
      console.error('Error al cargar mensajes:', error);
    } finally {
      setCargando(false);
    }
  }, [user, otroUsuarioId]);

  const enviarMensaje = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !nuevoMensaje.trim() || enviando) return;

    try {
      setEnviando(true);
      const mensajeEnviado = await chatService.enviarMensaje(
        Number(user.id),
        otroUsuarioId,
        nuevoMensaje.trim()
      );
      setMensajes(prev => [...prev, mensajeEnviado]);
      setNuevoMensaje('');
      scrollToBottom();
      onMensajeEnviado?.(mensajeEnviado);
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
    } finally {
      setEnviando(false);
    }
  };

  const handleBorrarConversacion = async () => {
    if (!user) return;
    try {
      await chatService.eliminarConversacion(Number(user.id), otroUsuarioId);
      setMensajes([]);
      onConversacionBorrada?.();
    } catch (error) {
      console.error('Error al borrar la conversación:', error);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setNuevoMensaje(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  useEffect(() => {
    cargarMensajes();
    // Actualizar cada 10 segundos en lugar de 3
    const intervalo = setInterval(cargarMensajes, 10000);
    return () => clearInterval(intervalo);
  }, [cargarMensajes]);

  useEffect(() => {
    scrollToBottom();
  }, [mensajes]);

  if (cargando && mensajes.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header de la conversación */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-3">
          <button 
            onClick={onBack}
            className="md:hidden p-2 hover:bg-gray-100 rounded-full"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#3d7b6f]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="w-10 h-10 rounded-full overflow-hidden">
            <img 
              src={getUserImage(userImagesCache, Number(otroUsuarioId))}
              alt={otroUsuarioNombre}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/default-avatar.svg';
              }}
            />
          </div>
          <div>
            <h2 className="font-semibold text-[#2a2827]">{otroUsuarioNombre}</h2>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={handleBorrarConversacion}
            className="p-2 hover:bg-gray-100 rounded-full text-[#3d7b6f]"
            title="Borrar conversación"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Área de mensajes */}
      <div 
        ref={mensajesEndRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
      >
        {cargando ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6cda84]"></div>
          </div>
        ) : mensajes.length === 0 ? (
          <div className="text-center text-gray-500">
            <p>No hay mensajes en esta conversación</p>
          </div>
        ) : (
          mensajes.map((mensaje) => (
            <div
              key={mensaje.id}
              className={`flex ${Number(mensaje.emisorId) === Number(user?.id) ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] md:max-w-[60%] rounded-lg p-3 ${
                  Number(mensaje.emisorId) === Number(user?.id)
                    ? 'bg-[#6cda84] text-white'
                    : 'bg-white text-[#2a2827]'
                }`}
              >
                <p className="text-sm">{mensaje.contenido}</p>
                <p className={`text-xs mt-1 ${
                  Number(mensaje.emisorId) === Number(user?.id)
                    ? 'text-white/80'
                    : 'text-gray-500'
                }`}>
                  {new Date(mensaje.fechaHora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Área de entrada de mensaje */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <form onSubmit={enviarMensaje} className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <div className="flex items-center bg-[#f8ffe5] rounded-full overflow-hidden">
              <input
                type="text"
                value={nuevoMensaje}
                onChange={(e) => setNuevoMensaje(e.target.value)}
                placeholder="Escribe un mensaje..."
                className="flex-1 px-4 py-2 bg-transparent border-none focus:outline-none focus:ring-0"
                disabled={enviando}
                maxLength={255}
              />
              
              <div className="flex items-center pr-2 space-x-1">
                {/* Botón de emojis */}
                <button
                  type="button"
                  className="text-[#3d7b6f] p-1 hover:text-[#6cda84]"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  disabled={enviando}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {/* Botón de enviar */}
                <button
                  type="submit"
                  disabled={!nuevoMensaje.trim() || enviando}
                  className={`p-2 rounded-full ${
                    nuevoMensaje.trim() && !enviando
                      ? 'text-[#3d7b6f] hover:text-[#6cda84]'
                      : 'text-gray-400 cursor-not-allowed'
                  } transition-colors`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div ref={emojiPickerRef}>
              <EmojiPickerComponent
                onEmojiSelect={handleEmojiSelect}
                showEmojiPicker={showEmojiPicker}
                onClose={() => setShowEmojiPicker(false)}
              />
            </div>
            
            {/* Indicador de carga */}
            {enviando && (
              <div className="mt-1 text-xs text-[#3d7b6f]">
                Enviando mensaje...
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatConversacion; 
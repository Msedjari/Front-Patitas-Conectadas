import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { seguidosService } from '../services/seguidosService';
import { chatService, Mensaje } from '../services/chatService';
import { websocketService } from '../services/websocketService';
import { getUserImage } from '../components/home/HomeUtils';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ChatConversacion from '../components/chat/ChatConversacion';
import { userService } from '../services/userService';

interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  ultimoMensaje?: string;
  noLeidos: number;
  ciudad?: string;
  online?: boolean;
}

const Chat: React.FC = () => {
  const { user } = useAuth();
  const [amigos, setAmigos] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState(true);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null);
  const [userImagesCache, setUserImagesCache] = useState<Record<number, string>>({});
  const [showConversacion, setShowConversacion] = useState(false);
  const [conversacionActiva, setConversacionActiva] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);

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

  const cargarAmigosYConversaciones = useCallback(async () => {
    if (!user) return;
    try {
      setCargando(true);
      // Obtener IDs de usuarios seguidos
      const seguidosIds = await seguidosService.obtenerSeguidosIds(Number(user.id));
      
      // Obtener detalles de cada usuario
      const detallesUsuarios = await Promise.all(
        seguidosIds.map(async (seguido) => {
          const detalles = await userService.getUserById(seguido.usuarioQueEsSeguidoId);
          // Actualizar el caché de imágenes si el usuario tiene una imagen
          if (detalles.img) {
            updateUserImagesCache(detalles.id, detalles.img);
          }
          return {
            id: detalles.id,
            nombre: detalles.nombre,
            apellido: detalles.apellido,
            ultimoMensaje: '',
            noLeidos: 0,
            ciudad: detalles.ciudad,
            online: detalles.online
          };
        })
      );

      // Obtener conversaciones para cada usuario
      const usuariosConMensajes = await Promise.all(
        detallesUsuarios.map(async (usuario) => {
          try {
            const mensajes = await chatService.obtenerConversacion(Number(user.id), usuario.id);
            const ultimoMensaje = mensajes[mensajes.length - 1]?.contenido || '';
            const noLeidos = mensajes.filter(m => !m.visto && m.emisorId === usuario.id).length;
            
            return {
              ...usuario,
              ultimoMensaje,
              noLeidos
            };
          } catch (error) {
            console.error(`Error al cargar mensajes con ${usuario.nombre}:`, error);
            return usuario;
          }
        })
      );

      setAmigos(usuariosConMensajes);
    } catch (error) {
      console.error('Error al cargar amigos:', error);
      setError('Error al cargar amigos. Por favor, inténtelo más tarde.');
    } finally {
      setCargando(false);
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    cargarAmigosYConversaciones();
    // Actualizar cada 30 segundos en lugar de 5
    const intervalo = setInterval(cargarAmigosYConversaciones, 30000);
    return () => clearInterval(intervalo);
  }, [cargarAmigosYConversaciones]);

  useEffect(() => {
    // Conectar WebSocket cuando el componente se monta
    websocketService.connect();

    // Suscribirse a mensajes nuevos
    const unsubscribeMessage = websocketService.onMessage((data) => {
      if (data.emisorId === usuarioSeleccionado?.id) {
        // Actualizar la conversación actual si el mensaje es del usuario seleccionado
        setMensajes(prev => [...prev, data]);
      }
      // Actualizar la lista de amigos para mostrar el último mensaje
      setAmigos(prev => prev.map(amigo => 
        amigo.id === data.emisorId 
          ? { ...amigo, ultimoMensaje: data.contenido, noLeidos: amigo.noLeidos + 1 }
          : amigo
      ));
    });

    // Suscribirse a notificaciones
    const unsubscribeNotification = websocketService.onNotification((data) => {
      if (data.type === 'new_message') {
        // Mostrar notificación del sistema
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Nuevo mensaje', {
            body: `${data.emisorNombre}: ${data.contenido}`,
            icon: '/logo192.png'
          });
        }
      }
    });

    // Solicitar permiso para notificaciones
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      // Limpiar suscripciones cuando el componente se desmonta
      unsubscribeMessage();
      unsubscribeNotification();
      websocketService.disconnect();
    };
  }, [usuarioSeleccionado]);

  const handleSeleccionarUsuario = (usuario: Usuario) => {
    setUsuarioSeleccionado(usuario);
  };

  const handleAmigoClick = (amigo: Usuario) => {
    setConversacionActiva(amigo);
    setShowConversacion(true);
  };

  if (cargando && amigos.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] mt-14 md:mt-0">
      {/* Lista de amigos y conversaciones */}
      <div className={`w-full md:w-1/3 lg:w-1/4 border-r border-gray-200 bg-white ${showConversacion ? 'hidden md:block' : 'block'}`}>
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-[#3d7b6f]">Mensajes</h2>
        </div>
        
        <div className="overflow-y-auto h-[calc(100vh-8rem)]">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6cda84]"></div>
            </div>
          ) : error ? (
            <div className="p-4 text-center text-red-500">
              <p>{error}</p>
            </div>
          ) : amigos.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <p>No tienes amigos agregados</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {amigos.map(amigo => (
                <div
                  key={amigo.id}
                  onClick={() => handleAmigoClick(amigo)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    conversacionActiva?.id === amigo.id ? 'bg-[#f8ffe5]' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full overflow-hidden">
                        <img 
                          src={getUserImage(userImagesCache, Number(amigo.id))}
                          alt={amigo.nombre}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/default-avatar.svg';
                          }}
                        />
                      </div>
                      {amigo.online && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[#2a2827] truncate">
                        {amigo.nombre} {amigo.apellido}
                      </p>
                      <p className="text-sm text-[#575350] truncate">
                        {amigo.ciudad || 'Sin ubicación'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Área de conversación */}
      <div className={`flex-1 ${showConversacion ? 'block' : 'hidden md:block'}`}>
        {conversacionActiva ? (
          <ChatConversacion
            otroUsuarioId={conversacionActiva.id}
            otroUsuarioNombre={`${conversacionActiva.nombre} ${conversacionActiva.apellido}`}
            onBack={() => setShowConversacion(false)}
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-4 text-center">
            <div className="w-16 h-16 mb-4 text-[#3d7b6f]">
              <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-[#2a2827] mb-2">
              Selecciona una conversación
            </h3>
            <p className="text-[#575350]">
              Elige un amigo de la lista para comenzar a chatear
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
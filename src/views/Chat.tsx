import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { chatService, Mensaje } from '../services/chatService';
import ChatConversacion from '../components/chat/ChatConversacion';

interface Usuario {
  id: number;
  nombre: string;
  ultimoMensaje?: string;
  noVistos: number;
}

const Chat: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);
  const { user } = useAuth();

  const cargarConversaciones = async () => {
    try {
      if (user) {
        const [enviados, recibidos] = await Promise.all([
          chatService.obtenerEnviados(user.id),
          chatService.obtenerRecibidos(user.id)
        ]);

        const usuariosMap = new Map<number, Usuario>();

        // Procesar mensajes enviados
        enviados.forEach((mensaje) => {
          if (!usuariosMap.has(mensaje.receptorId)) {
            usuariosMap.set(mensaje.receptorId, {
              id: mensaje.receptorId,
              nombre: `Usuario ${mensaje.receptorId}`, // Aquí deberías obtener el nombre real del usuario
              ultimoMensaje: mensaje.contenido,
              noVistos: 0
            });
          }
        });

        // Procesar mensajes recibidos
        recibidos.forEach((mensaje) => {
          if (!usuariosMap.has(mensaje.emisorId)) {
            usuariosMap.set(mensaje.emisorId, {
              id: mensaje.emisorId,
              nombre: `Usuario ${mensaje.emisorId}`, // Aquí deberías obtener el nombre real del usuario
              ultimoMensaje: mensaje.contenido,
              noVistos: mensaje.visto ? 0 : 1
            });
          } else {
            const usuario = usuariosMap.get(mensaje.emisorId)!;
            usuario.ultimoMensaje = mensaje.contenido;
            if (!mensaje.visto) {
              usuario.noVistos += 1;
            }
          }
        });

        setUsuarios(Array.from(usuariosMap.values()));
      }
    } catch (error) {
      console.error('Error al cargar conversaciones:', error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarConversaciones();
    const intervalo = setInterval(cargarConversaciones, 5000);
    return () => clearInterval(intervalo);
  }, []);

  if (cargando) {
    return <div className="chat-cargando">Cargando conversaciones...</div>;
  }

  return (
    <div className="chat-container">
      <div className="chat-sidebar">
        <h2>Conversaciones</h2>
        <div className="chat-lista">
          {usuarios.map((usuario) => (
            <div
              key={usuario.id}
              className={`chat-usuario ${usuarioSeleccionado?.id === usuario.id ? 'seleccionado' : ''}`}
              onClick={() => setUsuarioSeleccionado(usuario)}
            >
              <div className="chat-usuario-info">
                <h4>{usuario.nombre}</h4>
                <p className="ultimo-mensaje">{usuario.ultimoMensaje}</p>
              </div>
              {usuario.noVistos > 0 && (
                <span className="no-vistos">{usuario.noVistos}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="chat-main">
        {usuarioSeleccionado ? (
          <ChatConversacion
            otroUsuarioId={usuarioSeleccionado.id}
            otroUsuarioNombre={usuarioSeleccionado.nombre}
          />
        ) : (
          <div className="chat-seleccionar">
            <p>Selecciona una conversación para comenzar a chatear</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat; 
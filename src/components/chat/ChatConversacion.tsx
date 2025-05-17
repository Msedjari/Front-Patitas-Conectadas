import React, { useState, useEffect, useRef } from 'react';
import { Mensaje, chatService } from '../../services/chatService';
import MensajeItem from './MensajeItem';
import { useAuth } from '../../context/AuthContext';

interface ChatConversacionProps {
  otroUsuarioId: number;
  otroUsuarioNombre: string;
}

const ChatConversacion: React.FC<ChatConversacionProps> = ({ otroUsuarioId, otroUsuarioNombre }) => {
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [cargando, setCargando] = useState(true);
  const mensajesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const cargarMensajes = async () => {
    try {
      if (user) {
        const conversacion = await chatService.obtenerConversacion(user.id, otroUsuarioId);
        setMensajes(conversacion);
        await chatService.marcarVistos(user.id, otroUsuarioId);
      }
    } catch (error) {
      console.error('Error al cargar mensajes:', error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarMensajes();
    const intervalo = setInterval(cargarMensajes, 5000);
    return () => clearInterval(intervalo);
  }, [otroUsuarioId]);

  useEffect(() => {
    mensajesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  const enviarMensaje = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoMensaje.trim() || !user) return;

    try {
      const mensajeEnviado = await chatService.enviarMensaje(
        user.id,
        otroUsuarioId,
        nuevoMensaje
      );
      setMensajes([...mensajes, mensajeEnviado]);
      setNuevoMensaje('');
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
    }
  };

  if (cargando) {
    return <div className="chat-cargando">Cargando conversación...</div>;
  }

  return (
    <div className="chat-conversacion">
      <div className="chat-header">
        <h3>{otroUsuarioNombre}</h3>
      </div>
      
      <div className="chat-mensajes">
        {mensajes.map((mensaje) => (
          <MensajeItem
            key={mensaje.id}
            mensaje={mensaje}
            esPropio={mensaje.emisorId === user?.id}
          />
        ))}
        <div ref={mensajesEndRef} />
      </div>

      <form onSubmit={enviarMensaje} className="chat-form">
        <input
          type="text"
          value={nuevoMensaje}
          onChange={(e) => setNuevoMensaje(e.target.value)}
          placeholder="Escribe un mensaje..."
          maxLength={255}
        />
        <button type="submit" disabled={!nuevoMensaje.trim()}>
          Enviar
        </button>
      </form>
    </div>
  );
};

export default ChatConversacion; 
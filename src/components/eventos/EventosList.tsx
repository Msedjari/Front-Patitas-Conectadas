import React, { useState, useEffect } from 'react';
import { Evento } from '../../services/eventosService';
import { usuarioEventoService } from '../../services/usuarioEventoService';
import { useAuth } from '../../context/AuthContext';
import ActionButton from '../common/ActionButton';
import { config } from '../../config';

interface Props {
  eventos: Evento[];
  onEdit: (evento: Evento) => void;
  onDelete: (evento: Evento) => void;
  formatDate: (date: string) => string;
  canEditEvento: (evento: Evento) => boolean;
  getEventoRol: (eventoId: number) => string;
  onEventoUpdate?: () => void;
}

const EventosList: React.FC<Props> = ({ eventos, onEdit, onDelete, formatDate, canEditEvento, getEventoRol, onEventoUpdate }) => {
  const { user } = useAuth();
  const [joinedEvents, setJoinedEvents] = useState<{[key: string]: boolean}>({});
  const [loading, setLoading] = useState<{[key: number]: boolean}>({});

  // Verificar eventos a los que el usuario ya se ha unido
  useEffect(() => {
    const checkJoinedEvents = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      const joinedEventsState: {[key: string]: boolean} = {};
      for (const event of eventos) {
        try {
          // Obtener el evento específico para verificar si el usuario está participando
          const response = await fetch(`${config.apiUrl}/eventos/${event.id}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          if (response.ok) {
            const eventData = await response.json();
            // Verificar si el usuario actual es participante
            const isParticipant = eventData.participantes?.some((p: any) => p.id === parseInt(localStorage.getItem('userId') || '0'));
            joinedEventsState[event.id!] = isParticipant;
          }
        } catch (error) {
          console.error(`Error al verificar participación en evento ${event.id}:`, error);
        }
      }
      setJoinedEvents(joinedEventsState);
    };

    checkJoinedEvents();
  }, [eventos]);

  // Función para unirse/salir de un evento
  const handleJoinEvent = async (eventId: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const isCurrentlyJoined = joinedEvents[eventId];
      const method = isCurrentlyJoined ? 'DELETE' : 'POST';

      // Endpoint para unirse/salir del evento
      const response = await fetch(`${config.apiUrl}/eventos/${eventId}/participante`, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Actualizar el estado local
        setJoinedEvents(prev => ({
          ...prev,
          [eventId]: !isCurrentlyJoined
        }));

        // Actualizar la lista de eventos
        const updatedEventResponse = await fetch(`${config.apiUrl}/eventos/${eventId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (updatedEventResponse.ok) {
          const updatedEvent = await updatedEventResponse.json();
          // Aquí podrías actualizar el evento en la lista si es necesario
        }
      } else {
        console.error('Error al actualizar participación:', response.status);
      }
    } catch (error) {
      console.error('Error al actualizar participación:', error);
    }
  };

  const handleAsistir = async (eventoId: number) => {
    if (!user?.id) return;
    
    setLoading(prev => ({ ...prev, [eventoId]: true }));
    try {
      await usuarioEventoService.asistirAEvento(user.id, eventoId);
      if (onEventoUpdate) onEventoUpdate();
    } catch (error) {
      console.error('Error al asistir al evento:', error);
      alert('Error al asistir al evento');
    } finally {
      setLoading(prev => ({ ...prev, [eventoId]: false }));
    }
  };

  const handleNoAsistir = async (eventoId: number) => {
    if (!user?.id) return;
    
    setLoading(prev => ({ ...prev, [eventoId]: true }));
    try {
      await usuarioEventoService.noAsistirAEvento(user.id, eventoId);
      if (onEventoUpdate) onEventoUpdate();
    } catch (error) {
      console.error('Error al cancelar asistencia:', error);
      alert('Error al cancelar asistencia');
    } finally {
      setLoading(prev => ({ ...prev, [eventoId]: false }));
    }
  };

  const renderAsistenciaButton = (evento: Evento) => {
    const rol = getEventoRol(evento.id);
    const isLoading = loading[evento.id];

    if (rol === 'CREADOR') {
      return null; // No mostrar botón para creadores
    }

    if (isLoading) {
      return (
        <button
          disabled
          className="px-4 py-2 text-sm font-medium text-gray-500 bg-gray-100 rounded-md cursor-not-allowed"
        >
          Cargando...
        </button>
      );
    }

    if (rol === 'ASISTENTE') {
      return (
        <button
          onClick={() => handleNoAsistir(evento.id)}
          className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
        >
          No asistir
        </button>
      );
    }

    return (
      <button
        onClick={() => handleAsistir(evento.id)}
        className="px-4 py-2 text-sm font-medium text-green-600 bg-green-50 hover:bg-green-100 rounded-md transition-colors"
      >
        Asistir
      </button>
    );
  };

  return (
    <div className="space-y-4">
      {eventos.map((evento) => (
        <div key={evento.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{evento.nombre}</h3>
              <p className="text-sm text-gray-600 mt-1">{evento.descripcion}</p>
              <div className="mt-2 space-y-1">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Ubicación:</span> {evento.ubicacion}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Fecha:</span> {formatDate(evento.fecha)}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Tu rol:</span> {getEventoRol(evento.id)}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end space-y-2">
              {renderAsistenciaButton(evento)}
              {canEditEvento(evento) && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => onEdit(evento)}
                    className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => onDelete(evento)}
                    className="px-3 py-1 text-sm text-red-600 hover:text-red-800"
                  >
                    Eliminar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EventosList; 
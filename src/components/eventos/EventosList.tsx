import React, { useState, useEffect } from 'react';
import { Evento } from '../../services/eventosService';
import ActionButton from '../common/ActionButton';
import { config } from '../../config';

interface Props {
  eventos: Evento[];
  onEdit: (evento: Evento) => void;
  onDelete: (evento: Evento) => void;
  formatDate: (date: string) => string;
}

const EventosList: React.FC<Props> = ({ eventos, onEdit, onDelete, formatDate }) => {
  const [joinedEvents, setJoinedEvents] = useState<{[key: string]: boolean}>({});

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

  return (
    <div className="space-y-4">
      {eventos.map(ev => (
        <div key={ev.id} className="bg-white rounded-lg shadow-sm p-6 border border-[#9fe0b7] hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-semibold text-[#3d7b6f]">{ev.nombre}</h3>
            <div className="flex space-x-2">
              <ActionButton
                onClick={() => onEdit(ev)}
                variant="outline"
                size="sm"
              >
                Editar
              </ActionButton>
              <ActionButton
                onClick={() => onDelete(ev)}
                variant="danger"
                size="sm"
              >
                Eliminar
              </ActionButton>
            </div>
          </div>
          
          <p className="text-[#2a2827] mb-4">{ev.descripcion}</p>
          
          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
            <div className="flex items-center text-[#575350]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#3d7b6f]" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              {ev.ubicacion}
            </div>
            <div className="flex items-center text-[#575350]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#3d7b6f]" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              {formatDate(ev.fecha)}
            </div>
          </div>

          <button
            onClick={() => handleJoinEvent(ev.id!)}
            className={`w-full text-sm font-medium px-4 py-2 rounded-full ${
              joinedEvents[ev.id!]
                ? 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                : 'bg-[#3d7b6f] text-white hover:bg-[#2e5d54]'
            }`}
          >
            {joinedEvents[ev.id!] ? 'Salir del evento' : 'Unirse al evento'}
          </button>
        </div>
      ))}
    </div>
  );
};

export default EventosList; 
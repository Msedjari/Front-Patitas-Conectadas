import React, { useState, useEffect } from 'react';
import { config } from '../../config';

/**
 * Componente de barra lateral derecha con estilo de Facebook
 * Muestra los tres próximos eventos y sugerencias de usuarios no seguidos
 */
const RightSidebar: React.FC = () => {
  // Estados para datos desde el backend
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState({
    events: false,
    suggestions: false
  });
  const [following, setFollowing] = useState<{[key: string]: boolean}>({});
  const [joinedEvents, setJoinedEvents] = useState<{[key: string]: boolean}>({});

  // Obtener próximos eventos
  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      try {
        setLoading(prev => ({ ...prev, events: true }));
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch(`${config.apiUrl}/eventos/proximos`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          // Filtrar eventos futuros y ordenar por fecha
          const now = new Date();
          const futureEvents = data.filter((event: any) => new Date(event.fecha) > now);
          const sortedEvents = futureEvents.sort((a: any, b: any) => 
            new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
          ).slice(0, 3);
          setUpcomingEvents(sortedEvents);

          // Verificar eventos a los que el usuario ya se ha unido
          const joinedEventsState: {[key: string]: boolean} = {};
          for (const event of sortedEvents) {
            try {
              const eventResponse = await fetch(`${config.apiUrl}/eventos/${event.id}`, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              });
              if (eventResponse.ok) {
                const eventData = await eventResponse.json();
                // Verificar si el usuario actual es participante
                const isParticipant = eventData.participantes?.some((p: any) => p.id === parseInt(localStorage.getItem('userId') || '0'));
                joinedEventsState[event.id] = isParticipant;
              }
            } catch (error) {
              console.error(`Error al verificar participación en evento ${event.id}:`, error);
            }
          }
          setJoinedEvents(joinedEventsState);
        } else {
          console.error('Error al obtener próximos eventos:', response.status);
        }
      } catch (error) {
        console.error('Error al cargar próximos eventos:', error);
      } finally {
        setLoading(prev => ({ ...prev, events: false }));
      }
    };

    fetchUpcomingEvents();
  }, []);

  // Función para unirse/salir de un evento
  const handleJoinEvent = async (eventId: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const isCurrentlyJoined = joinedEvents[eventId];
      const method = isCurrentlyJoined ? 'DELETE' : 'POST';

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

        // Actualizar la información del evento
        const updatedEventResponse = await fetch(`${config.apiUrl}/eventos/${eventId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (updatedEventResponse.ok) {
          const updatedEvent = await updatedEventResponse.json();
          // Actualizar el evento en la lista de próximos eventos
          setUpcomingEvents(prev => 
            prev.map(event => 
              event.id === eventId ? { ...event, ...updatedEvent } : event
            )
          );
        }
      } else {
        console.error('Error al actualizar participación:', response.status);
      }
    } catch (error) {
      console.error('Error al actualizar participación:', error);
    }
  };

  // Obtener sugerencias de usuarios no seguidos
  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        setLoading(prev => ({ ...prev, suggestions: true }));
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch(`${config.apiUrl}/usuarios/sugerencias`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setSuggestions(data);
          // Inicializar el estado de seguimiento para cada usuario
          const followingState: {[key: string]: boolean} = {};
          data.forEach((user: any) => {
            followingState[user.id] = false;
          });
          setFollowing(followingState);
        } else {
          console.error('Error al obtener sugerencias:', response.status);
        }
      } catch (error) {
        console.error('Error al cargar sugerencias:', error);
      } finally {
        setLoading(prev => ({ ...prev, suggestions: false }));
      }
    };

    fetchSuggestions();
  }, []);

  // Función para seguir a un usuario
  const handleFollow = async (userId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${config.apiUrl}/usuarios/seguir/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Actualizar el estado local
        setFollowing(prev => ({
          ...prev,
          [userId]: true
        }));
        // Remover el usuario de las sugerencias
        setSuggestions(prev => prev.filter(user => user.id !== userId));
      } else {
        console.error('Error al seguir usuario:', response.status);
      }
    } catch (error) {
      console.error('Error al seguir usuario:', error);
    }
  };

  // Formatear fecha para mostrar
  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  return (
    <div className="h-full pt-4 pb-4 overflow-y-auto p-3">      
      {/* Próximos eventos */}
      <section className="mb-6">
        <h3 className="text-[#3d7b6f] font-medium text-sm mb-3">Próximos eventos</h3>
        
        {loading.events ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#6cda84]"></div>
          </div>
        ) : upcomingEvents.length > 0 ? (
          <div className="space-y-3">
            {upcomingEvents.map(event => (
              <div key={event.id} className="bg-white rounded-lg p-3 border border-[#9fe0b7] hover:shadow-md transition-shadow">
                <h4 className="font-medium text-[#2a2827] mb-1">{event.nombre}</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center text-[#575350]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-[#3d7b6f]" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    {event.ubicacion}
                  </div>
                  <div className="flex items-center text-[#575350]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-[#3d7b6f]" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    {formatDate(event.fecha)}
                  </div>
                </div>
                <button
                  onClick={() => handleJoinEvent(event.id!)}
                  className={`mt-2 w-full text-sm font-medium px-3 py-1 rounded-full ${
                    joinedEvents[event.id!]
                      ? 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      : 'bg-[#3d7b6f] text-white hover:bg-[#2e5d54]'
                  }`}
                >
                  {joinedEvents[event.id!] ? 'Salir del evento' : 'Unirse al evento'}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#575350] text-center py-2">No hay eventos próximos.</p>
        )}
        
        <a 
          href="/eventos" 
          className="text-[#2e82dc] text-sm font-medium hover:underline block mt-2"
        >
          Ver todos los eventos
        </a>
      </section>
      
      {/* Divisor */}
      <div className="border-t border-[#a7e9b5] mb-4"></div>
      
      {/* Lista de sugerencias */}
      <section>
        <h3 className="text-[#3d7b6f] font-medium text-sm mb-3">Personas que podrías conocer</h3>
        
        {loading.suggestions ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#6cda84]"></div>
          </div>
        ) : suggestions.length > 0 ? (
          suggestions.map(user => (
            <div key={user.id} className="flex items-center justify-between mb-3 p-2 rounded-lg hover:bg-white">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden mr-3">
                  {user.foto ? (
                    <img 
                      src={user.foto} 
                      alt={user.nombre} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      {user.nombre.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm text-[#2a2827] font-medium">{user.nombre}</p>
                  <p className="text-xs text-[#575350]">{user.mutuales} amigos en común</p>
                </div>
              </div>
              <button 
                onClick={() => handleFollow(user.id)}
                disabled={following[user.id]}
                className={`text-sm font-medium px-3 py-1 rounded-full ${
                  following[user.id] 
                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                    : 'bg-[#3d7b6f] text-white hover:bg-[#2e5d54]'
                }`}
              >
                {following[user.id] ? 'Siguiendo' : 'Seguir'}
              </button>
            </div>
          ))
        ) : (
          <p className="text-sm text-[#575350] text-center py-2">No hay sugerencias disponibles.</p>
        )}
      </section>
    </div>
  );
};

export default RightSidebar; 
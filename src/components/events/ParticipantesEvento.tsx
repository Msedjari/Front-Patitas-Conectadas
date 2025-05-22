import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usuarioEventoService, UsuarioEvento } from '../../services/usuarioEventoService';
import { userService } from '../../services/userService';
import { getUserImage } from '../home/HomeUtils';

interface ParticipantesEventoProps {
  eventoId: number;
  refreshTrigger?: number; // Para forzar recargar cuando cambia la participación
}

interface ParticipanteExtendido extends UsuarioEvento {
  nombre?: string;
  apellido?: string;
  img?: string;
}

const ParticipantesEvento: React.FC<ParticipantesEventoProps> = ({ eventoId, refreshTrigger }) => {
  const [participantes, setParticipantes] = useState<ParticipanteExtendido[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarParticipantes = async () => {
      try {
        setLoading(true);
        const participantesData = await usuarioEventoService.getParticipantesEvento(eventoId);
        
        // Obtener detalles de cada participante
        const participantesExtendidos = await Promise.all(
          participantesData.map(async (p) => {
            try {
              const usuario = await userService.getUserById(p.usuarioId);
              return {
                ...p,
                nombre: usuario.nombre,
                apellido: usuario.apellido,
                img: usuario.img
              };
            } catch (error) {
              console.error(`Error al obtener detalles del usuario ${p.usuarioId}:`, error);
              return p;
            }
          })
        );
        
        setParticipantes(participantesExtendidos);
      } catch (error) {
        console.error('Error al cargar participantes:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarParticipantes();
  }, [eventoId, refreshTrigger]);

  if (loading) {
    return <div className="p-4">Cargando participantes...</div>;
  }

  if (participantes.length === 0) {
    return <div className="p-4 text-gray-500">Aún no hay participantes en este evento.</div>;
  }

  // Separar creadores y asistentes
  const creadores = participantes.filter(p => p.rol === 'CREADOR');
  const asistentes = participantes.filter(p => p.rol === 'ASISTENTE');

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold text-[#3d7b6f] mb-3">Participantes ({participantes.length})</h3>
      
      {creadores.length > 0 && (
        <div className="mb-4">
          <h4 className="font-medium mb-2">Organizadores:</h4>
          <div className="space-y-2">
            {creadores.map(creador => (
              <Link 
                to={`/perfil/${creador.usuarioId}`} 
                key={creador.id}
                className="flex items-center p-2 hover:bg-gray-50 rounded-md transition-colors"
              >
                <img 
                  src={getUserImage({}, creador.usuarioId)} 
                  alt={creador.nombre || `Usuario ${creador.usuarioId}`}
                  className="w-10 h-10 rounded-full object-cover mr-3"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/default-avatar.svg'; }}
                />
                <span className="font-medium">
                  {creador.nombre && creador.apellido 
                    ? `${creador.nombre} ${creador.apellido}`
                    : `Usuario ${creador.usuarioId}`}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
      
      {asistentes.length > 0 && (
        <div>
          <h4 className="font-medium mb-2">Asistentes:</h4>
          <div className="space-y-2">
            {asistentes.map(asistente => (
              <Link 
                to={`/perfil/${asistente.usuarioId}`} 
                key={asistente.id}
                className="flex items-center p-2 hover:bg-gray-50 rounded-md transition-colors"
              >
                <img 
                  src={getUserImage({}, asistente.usuarioId)} 
                  alt={asistente.nombre || `Usuario ${asistente.usuarioId}`}
                  className="w-10 h-10 rounded-full object-cover mr-3"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/default-avatar.svg'; }}
                />
                <span>
                  {asistente.nombre && asistente.apellido 
                    ? `${asistente.nombre} ${asistente.apellido}`
                    : `Usuario ${asistente.usuarioId}`}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ParticipantesEvento; 
import React from 'react';
import EventoCard from './EventoCard';
import EmptyState from '../common/EmptyState';

interface EventosListProps {
  eventos: Array<{
    id?: number;
    nombre: string;
    descripcion: string;
    fecha: string;
    ubicacion: string;
  }>;
  onEdit: (evento: any) => void;
  onDelete: (evento: any) => void;
  formatDate: (dateString: string) => string;
  onCreateNew?: () => void;
}

/**
 * Componente para mostrar la lista de eventos
 */
const EventosList: React.FC<EventosListProps> = ({
  eventos,
  onEdit,
  onDelete,
  formatDate,
  onCreateNew
}) => {
  if (eventos.length === 0) {
    return (
      <EmptyState 
        message="No hay eventos programados."
        actionText={onCreateNew ? "Crea el primer evento" : undefined}
        onAction={onCreateNew}
      />
    );
  }
  
  return (
    <div className="space-y-4">
      {eventos.map(evento => (
        <EventoCard
          key={evento.id}
          evento={evento}
          onEdit={onEdit}
          onDelete={onDelete}
          formatDate={formatDate}
        />
      ))}
    </div>
  );
};

export default EventosList; 
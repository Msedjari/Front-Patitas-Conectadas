import React, { useState } from 'react';
import { Evento } from '../../services/eventosService';

interface Props {
  initialData?: Evento;
  onSubmit: (data: Omit<Evento, 'id' | 'creadorId'>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const EventoForm: React.FC<Props> = ({ initialData, onSubmit, onCancel, isLoading }) => {
  const [nombre, setNombre] = useState(initialData?.nombre || '');
  const [descripcion, setDescripcion] = useState(initialData?.descripcion || '');
  const [ubicacion, setUbicacion] = useState(initialData?.ubicacion || '');
  const [fecha, setFecha] = useState(initialData?.fecha || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ nombre, descripcion, ubicacion, fecha });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre" required />
      <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Descripción" required />
      <input value={ubicacion} onChange={e => setUbicacion(e.target.value)} placeholder="Ubicación" required />
      <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} required />
      <div className="flex gap-2">
        <button type="submit" disabled={isLoading}>Guardar</button>
        <button type="button" onClick={onCancel}>Cancelar</button>
      </div>
    </form>
  );
};

export default EventoForm; 
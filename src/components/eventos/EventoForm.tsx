import React, { useState } from 'react';
import { Evento } from '../../services/eventosService';
import ActionButton from '../common/ActionButton';

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
    <form onSubmit={handleSubmit} className="bg-[#f8ffe5] p-6 rounded-lg mb-6 border border-[#9fe0b7]">
      <h3 className="text-[#3d7b6f] font-medium mb-4 text-xl">
        {initialData ? 'Editar evento' : 'Crear nuevo evento'}
      </h3>

      <div className="space-y-4">
        <div>
          <label htmlFor="nombre" className="block text-sm font-medium text-[#2a2827] mb-1">
            Nombre del evento
          </label>
          <input
            id="nombre"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            placeholder="Nombre del evento"
            required
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9fe0b7]"
          />
        </div>

        <div>
          <label htmlFor="descripcion" className="block text-sm font-medium text-[#2a2827] mb-1">
            Descripción
          </label>
          <textarea
            id="descripcion"
            value={descripcion}
            onChange={e => setDescripcion(e.target.value)}
            placeholder="Describe el evento"
            required
            rows={4}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9fe0b7]"
          />
        </div>

        <div>
          <label htmlFor="ubicacion" className="block text-sm font-medium text-[#2a2827] mb-1">
            Ubicación
          </label>
          <input
            id="ubicacion"
            value={ubicacion}
            onChange={e => setUbicacion(e.target.value)}
            placeholder="Ubicación del evento"
            required
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9fe0b7]"
          />
        </div>

        <div>
          <label htmlFor="fecha" className="block text-sm font-medium text-[#2a2827] mb-1">
            Fecha y hora
          </label>
          <input
            id="fecha"
            type="datetime-local"
            value={fecha}
            onChange={e => setFecha(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9fe0b7]"
          />
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <ActionButton
            type="button"
            onClick={onCancel}
            variant="outline"
          >
            Cancelar
          </ActionButton>
          <ActionButton
            type="submit"
            variant="primary"
            isLoading={isLoading}
          >
            {initialData ? 'Actualizar' : 'Crear evento'}
          </ActionButton>
        </div>
      </div>
    </form>
  );
};

export default EventoForm; 
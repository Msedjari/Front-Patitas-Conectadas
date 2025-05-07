import React, { useState, useEffect } from 'react';
import ActionButton from '../common/ActionButton';

interface EventoFormProps {
  initialData?: {
    id?: number;
    nombre: string;
    descripcion: string;
    fecha: string;
    ubicacion: string;
  };
  onSubmit: (formData: any) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  titulo?: string;
}

/**
 * Componente de formulario para crear o editar eventos
 */
const EventoForm: React.FC<EventoFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
  titulo
}) => {
  // Estado para los datos del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    fecha: '',
    ubicacion: ''
  });
  
  // Inicializar formulario con datos si se está editando
  useEffect(() => {
    if (initialData) {
      setFormData({
        nombre: initialData.nombre || '',
        descripcion: initialData.descripcion || '',
        fecha: initialData.fecha ? new Date(initialData.fecha).toISOString().slice(0, 16) : '', // Formato YYYY-MM-DDTHH:MM
        ubicacion: initialData.ubicacion || ''
      });
    }
  }, [initialData]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };
  
  const isEditing = Boolean(initialData?.id);
  
  return (
    <form onSubmit={handleSubmit} className="bg-[#f8ffe5] p-6 rounded-lg mb-6 border border-[#9fe0b7]">
      <h3 className="text-[#3d7b6f] font-medium mb-4 text-xl">
        {titulo || (isEditing ? `Editar evento: ${initialData?.nombre}` : 'Crear nuevo evento')}
      </h3>
      
      <div className="mb-4">
        <label htmlFor="nombre" className="block text-sm font-medium text-[#2a2827] mb-1">
          Nombre del evento
        </label>
        <input
          type="text"
          id="nombre"
          name="nombre"
          value={formData.nombre}
          onChange={handleInputChange}
          required
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9fe0b7]"
          placeholder="Nombre del evento"
        />
      </div>
      
      <div className="mb-4">
        <label htmlFor="descripcion" className="block text-sm font-medium text-[#2a2827] mb-1">
          Descripción
        </label>
        <textarea
          id="descripcion"
          name="descripcion"
          value={formData.descripcion}
          onChange={handleInputChange}
          required
          rows={4}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9fe0b7]"
          placeholder="Describe el evento"
        ></textarea>
      </div>
      
      <div className="mb-4">
        <label htmlFor="fecha" className="block text-sm font-medium text-[#2a2827] mb-1">
          Fecha y hora
        </label>
        <input
          type="datetime-local"
          id="fecha"
          name="fecha"
          value={formData.fecha}
          onChange={handleInputChange}
          required
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9fe0b7]"
        />
      </div>
      
      <div className="mb-4">
        <label htmlFor="ubicacion" className="block text-sm font-medium text-[#2a2827] mb-1">
          Ubicación
        </label>
        <input
          type="text"
          id="ubicacion"
          name="ubicacion"
          value={formData.ubicacion}
          onChange={handleInputChange}
          required
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9fe0b7]"
          placeholder="Ubicación del evento"
        />
      </div>
      
      <div className="flex justify-end">
        <ActionButton 
          variant="outline" 
          onClick={onCancel}
          className="mr-2"
        >
          Cancelar
        </ActionButton>
        
        <ActionButton 
          type="submit"
          variant="primary"
          isLoading={isLoading}
        >
          {isEditing ? 'Actualizar' : 'Crear'}
        </ActionButton>
      </div>
    </form>
  );
};

export default EventoForm; 
import React, { useState, useEffect } from 'react';
import ActionButton from '../common/ActionButton';

interface GrupoFormProps {
  initialData?: {
    id?: number;
    nombre: string;
    descripcion: string;
    creador_id?: number;
  };
  onSubmit: (formData: any) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  titulo?: string;
}

/**
 * Componente de formulario para crear o editar grupos
 */
const GrupoForm: React.FC<GrupoFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
  titulo
}) => {
  // Estado para los datos del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: ''
  });
  
  // Estado para errores de validación
  const [validationErrors, setValidationErrors] = useState({
    nombre: '',
    descripcion: ''
  });
  
  // Inicializar formulario con datos si se está editando
  useEffect(() => {
    if (initialData) {
      setFormData({
        nombre: initialData.nombre || '',
        descripcion: initialData.descripcion || ''
      });
    }
  }, [initialData]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar los campos antes de enviar
    const errors = {
      nombre: formData.nombre.trim() === '' ? 'El nombre del grupo es obligatorio' : '',
      descripcion: formData.descripcion.trim() === '' ? 'La descripción es obligatoria' : ''
    };
    
    setValidationErrors(errors);
    
    // Si hay errores, no enviar el formulario
    if (errors.nombre || errors.descripcion) {
      console.log('Errores de validación:', errors);
      return;
    }
    
    // Limpiar espacios en blanco
    const cleanedData = {
      nombre: formData.nombre.trim(),
      descripcion: formData.descripcion.trim()
    };
    
    console.log('Enviando datos de grupo:', cleanedData);
    await onSubmit(cleanedData);
  };
  
  const isEditing = Boolean(initialData?.id);
  
  return (
    <form onSubmit={handleSubmit} className="bg-[#f8ffe5] p-6 rounded-lg mb-6 border border-[#9fe0b7]">
      <h3 className="text-[#3d7b6f] font-medium mb-4 text-xl">
        {titulo || (isEditing ? `Editar grupo: ${initialData?.nombre}` : 'Crear nuevo grupo')}
      </h3>
      
      <div className="mb-4">
        <label htmlFor="nombre" className="block text-sm font-medium text-[#2a2827] mb-1">
          Nombre del grupo
        </label>
        <input
          type="text"
          id="nombre"
          name="nombre"
          value={formData.nombre}
          onChange={handleInputChange}
          required
          className={`w-full p-2 border ${validationErrors.nombre ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-[#9fe0b7]`}
          placeholder="Nombre del grupo"
        />
        {validationErrors.nombre && (
          <p className="text-red-500 text-sm mt-1">{validationErrors.nombre}</p>
        )}
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
          className={`w-full p-2 border ${validationErrors.descripcion ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-[#9fe0b7]`}
          placeholder="Describe el propósito del grupo"
        ></textarea>
        {validationErrors.descripcion && (
          <p className="text-red-500 text-sm mt-1">{validationErrors.descripcion}</p>
        )}
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

export default GrupoForm; 
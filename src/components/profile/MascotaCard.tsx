import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BsPencil, BsTrash } from 'react-icons/bs';
import { FaPaw } from 'react-icons/fa';
import { Mascota } from '../../services/mascotasService';
import { config } from '../../config';
import DeleteMascotaDialog from './DeleteMascotaDialog';

interface MascotaCardProps {
  mascota: Mascota;
  isOwnProfile: boolean;
  onEdit?: (mascota: Mascota) => void;
  onDelete?: (mascota: Mascota) => void;
}

/**
 * Componente para mostrar una tarjeta de mascota en el perfil
 */
const MascotaCard: React.FC<MascotaCardProps> = ({
  mascota,
  isOwnProfile,
  onEdit,
  onDelete
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'No disponible';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Fecha inválida';
      }
      
      return new Intl.DateTimeFormat('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date);
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return 'Error en formato de fecha';
    }
  };

  // Construir la URL completa de la imagen
  const getImageUrl = (foto?: string): string | null => {
    if (!foto) return null;
    // Asegurarnos de que la URL comienza con /uploads
    const cleanPath = foto.startsWith('/uploads') ? foto : `/uploads${foto.startsWith('/') ? foto : `/${foto}`}`;
    return `${config.apiUrl}${cleanPath}`;
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    if (onDelete) {
      onDelete(mascota);
    }
    setShowDeleteDialog(false);
  };
  
  return (
    <>
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        {/* Imagen de la mascota */}
        <div className="relative h-48 bg-gray-100">
          {mascota.foto ? (
            <a 
              href={getImageUrl(mascota.foto) || '#'} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block w-full h-full"
            >
              <img
                src={getImageUrl(mascota.foto) || ''}
                alt={mascota.nombre}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  const parent = (e.target as HTMLImageElement).parentElement;
                  if (parent) {
                    const iconContainer = document.createElement('div');
                    iconContainer.className = 'w-full h-full flex items-center justify-center bg-gray-200';
                    const icon = document.createElement('div');
                    icon.innerHTML = '<svg class="text-gray-400 text-4xl" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>';
                    iconContainer.appendChild(icon);
                    parent.appendChild(iconContainer);
                  }
                }}
              />
            </a>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <FaPaw className="text-gray-400 text-4xl" />
            </div>
          )}
          
          {/* Botones de acción (solo para perfil propio) */}
          {isOwnProfile && (
            <div className="absolute top-2 right-2 flex space-x-1">
              {onEdit && (
                <button 
                  onClick={() => onEdit(mascota)}
                  className="bg-white rounded-full p-1.5 shadow-sm hover:bg-gray-100"
                  title="Editar mascota"
                >
                  <BsPencil className="text-gray-600 text-sm" />
                </button>
              )}
              
              {onDelete && (
                <button 
                  onClick={handleDeleteClick}
                  className="bg-white rounded-full p-1.5 shadow-sm hover:bg-red-50 transition-colors duration-200"
                  title="Eliminar mascota"
                >
                  <BsTrash className="text-red-500 text-sm hover:text-red-600" />
                </button>
              )}
            </div>
          )}
        </div>
        
        {/* Información de la mascota */}
        <div className="p-4">
          <Link to={`/mascotas/${mascota.id}`}>
            <h3 className="font-medium text-lg text-[#3d7b6f] hover:underline">
              {mascota.nombre}
            </h3>
          </Link>
          
          <div className="mt-2 space-y-1 text-sm">
            <p className="text-gray-700">
              <span className="font-medium">Especie:</span> {mascota.especie}
            </p>
            
            <p className="text-gray-700">
              <span className="font-medium">Género:</span> {mascota.genero}
            </p>
            
            <p className="text-gray-700">
              <span className="font-medium">Fecha de Nacimiento:</span> {formatDate(mascota.fechaNacimiento)}
            </p>
          </div>
          
          {mascota.descripcion && (
            <p className="mt-3 text-sm text-gray-600 line-clamp-2">
              {mascota.descripcion}
            </p>
          )}
        </div>
      </div>

      {/* Diálogo de confirmación de eliminación */}
      <DeleteMascotaDialog
        isOpen={showDeleteDialog}
        mascota={mascota}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
};

export default MascotaCard; 
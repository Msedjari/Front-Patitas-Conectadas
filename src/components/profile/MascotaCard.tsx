import React from 'react';
import { Link } from 'react-router-dom';
import { BsPencil, BsTrash } from 'react-icons/bs';
import { FaPaw } from 'react-icons/fa';
import { Mascota } from '../../services/mascotasService';

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
  // Obtener la edad en formato legible
  const getEdadTexto = (edad?: number) => {
    if (!edad) return 'Edad desconocida';
    return edad === 1 ? '1 año' : `${edad} años`;
  };
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Imagen de la mascota */}
      <div className="relative h-48 bg-gray-100">
        {mascota.foto ? (
          <img
            src={mascota.foto}
            alt={mascota.nombre}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/default-pet.svg';
            }}
          />
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
                onClick={() => onDelete(mascota)}
                className="bg-white rounded-full p-1.5 shadow-sm hover:bg-gray-100"
                title="Eliminar mascota"
              >
                <BsTrash className="text-red-500 text-sm" />
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
          
          {mascota.raza && (
            <p className="text-gray-700">
              <span className="font-medium">Raza:</span> {mascota.raza}
            </p>
          )}
          
          <p className="text-gray-700">
            <span className="font-medium">Edad:</span> {getEdadTexto(mascota.edad)}
          </p>
          
          {mascota.genero && (
            <p className="text-gray-700">
              <span className="font-medium">Género:</span> {mascota.genero}
            </p>
          )}
        </div>
        
        {mascota.descripcion && (
          <p className="mt-3 text-sm text-gray-600 line-clamp-2">
            {mascota.descripcion}
          </p>
        )}
      </div>
    </div>
  );
};

export default MascotaCard; 
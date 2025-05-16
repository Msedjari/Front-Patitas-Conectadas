import React, { useState } from 'react';
import { UserProfile, updateProfilePhoto } from '../../services/userService';
import ActionButton from '../common/ActionButton';
import { BsPencil, BsCamera } from 'react-icons/bs';
import { config } from '../../config';

interface ProfileHeaderProps {
  profile: UserProfile;
  isOwnProfile: boolean;
}

/**
 * Componente que muestra la cabecera del perfil, incluyendo foto, nombre y acciones principales
 */
const ProfileHeader: React.FC<ProfileHeaderProps> = ({ profile, isOwnProfile }) => {
  const [isEditingPhoto, setIsEditingPhoto] = useState<boolean>(false);
  const [photoUrl, setPhotoUrl] = useState<string>(profile.foto || '');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Usar el tamaño máximo de archivo de la configuración
    if (file.size > config.images.maxFileSize) {
      setError('La imagen es demasiado grande. Tamaño máximo: 5MB');
      return;
    }
    
    try {
      setIsUploading(true);
      setError(null);
      
      // Actualizar la foto del perfil usando el servicio
      const updatedPhotoUrl = await updateProfilePhoto(profile.id, file);
      setPhotoUrl(updatedPhotoUrl);
      
      // Actualizar también el usuario en localStorage para mantener la coherencia
      const userJson = localStorage.getItem(config.session.userKey);
      if (userJson) {
        const user = JSON.parse(userJson);
        user.foto = updatedPhotoUrl;
        localStorage.setItem(config.session.userKey, JSON.stringify(user));
      }
      
      // Salir del modo de edición
      setIsEditingPhoto(false);
    } catch (err) {
      console.error('Error al actualizar la foto de perfil:', err);
      setError('No se pudo actualizar la foto. Intenta de nuevo más tarde.');
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Banner superior */}
      <div className="h-40 bg-gradient-to-r from-[#3d7b6f] to-[#65c0ba]">
        {/* Se puede agregar un banner personalizado en el futuro */}
      </div>
      
      <div className="px-6 pb-6 relative">
        {/* Foto de perfil */}
        <div className="relative -mt-16 mb-4">
          <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-100 overflow-hidden">
            <img 
              src={photoUrl || config.images.defaultUserAvatar}
              alt={`${profile.nombre} ${profile.apellido}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = config.images.defaultUserAvatar;
              }}
            />
          </div>
          
          {/* Botón para cambiar la foto (solo para perfil propio) */}
          {isOwnProfile && (
            <div className="absolute bottom-0 right-0">
              <button 
                className="bg-white rounded-full p-2 shadow-md hover:bg-gray-50 transition-colors"
                onClick={() => setIsEditingPhoto(!isEditingPhoto)}
                title="Cambiar foto de perfil"
              >
                <BsCamera className="text-[#3d7b6f] text-lg" />
              </button>
            </div>
          )}
          
          {/* Modal para cambiar la foto */}
          {isEditingPhoto && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg p-4 z-10">
              <h4 className="font-medium mb-3">Cambiar foto de perfil</h4>
              <input 
                type="file" 
                accept="image/*"
                onChange={handlePhotoChange}
                className="w-full text-sm"
              />
              {error && (
                <p className="text-red-500 text-xs mt-2">{error}</p>
              )}
              {isUploading && (
                <p className="text-sm mt-2">Subiendo imagen...</p>
              )}
              <div className="flex justify-end mt-3">
                <button 
                  className="text-sm text-gray-500 hover:text-gray-700 mr-3"
                  onClick={() => setIsEditingPhoto(false)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Información básica */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="text-2xl font-bold">
              {profile.nombre} {profile.apellido}
            </h1>
            {profile.ciudad && (
              <p className="text-gray-600">
                {profile.ciudad}
              </p>
            )}
          </div>
          
          {/* Botones de acción */}
          <div className="mt-3 sm:mt-0">
            {isOwnProfile ? (
              <ActionButton
                variant="secondary"
                onClick={() => document.getElementById('profile-details-edit-button')?.click()}
                icon={<BsPencil />}
              >
                Editar perfil
              </ActionButton>
            ) : (
              <div className="flex gap-2">
                <ActionButton
                  variant="primary"
                  onClick={() => console.log('Enviar solicitud de amistad')}
                >
                  Agregar amigo
                </ActionButton>
                <ActionButton
                  variant="secondary"
                  onClick={() => console.log('Enviar mensaje')}
                >
                  Mensaje
                </ActionButton>
              </div>
            )}
          </div>
        </div>
        
        {/* Descripción del usuario */}
        {profile.descripcion && (
          <div className="mt-4">
            <p className="text-gray-700 whitespace-pre-line">
              {profile.descripcion}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileHeader; 
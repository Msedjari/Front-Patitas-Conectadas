import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { config } from '../../config';
import { UserImagesCache } from './types';
import { getUserImage } from './HomeUtils';

interface PostFormProps {
  onPostSubmit: (formData: FormData) => Promise<void>;
  userImagesCache: UserImagesCache;
  userName?: string;
}

const PostForm: React.FC<PostFormProps> = ({ onPostSubmit, userImagesCache, userName }) => {
  const { user } = useAuth();
  const [postText, setPostText] = useState('');
  const [postImage, setPostImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const userId = user?.id;

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar que el contenido del texto no esté vacío, ya que el servidor lo requiere
    if (!postText.trim()) {
      setValidationError("El contenido del post no puede estar vacío");
      return;
    }
    
    try {
      // Limpiar los errores
      setValidationError(null);
      setUploadError(null);
      
      // Crear FormData para enviar el post con la imagen
      const formData = new FormData();
      formData.append('contenido', postText);
      formData.append('creadorId', userId.toString());
      
      if (postImage) {
        formData.append('imagen', postImage);
      }
      
      // Llamar a onPostSubmit con el FormData
      await onPostSubmit(formData);
      
      // Limpiar el formulario
      setPostText('');
      setPostImage(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error al crear el post desde el componente:', error);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar el tipo de archivo
      if (!file.type.startsWith('image/')) {
        setUploadError('Por favor, selecciona un archivo de imagen válido');
        return;
      }

      // Validar el tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setUploadError('La imagen no puede ser mayor a 5MB');
        return;
      }

      setPostImage(file);
      setUploadError(null);

      // Crear URL para la vista previa
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setPostImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <form onSubmit={handlePostSubmit} className="bg-white rounded-lg shadow-sm mb-4 p-4 border border-gray-200">
      <div className="flex items-center space-x-3 mb-3 pb-3 border-b border-gray-200">
        <div className="h-10 w-10 rounded-full bg-gray-300 overflow-hidden">
          <img 
            src={getUserImage(userImagesCache, userId)} 
            alt="Avatar" 
            className="h-full w-full object-cover"
            onError={(e) => {
              console.log('Error cargando imagen de usuario en PostForm:', userId);
              const target = e.target as HTMLImageElement;
              target.src = '/default-avatar.svg';
            }}
          />
        </div>
        <div className="flex-1">
          <textarea
            value={postText}
            onChange={(e) => {
              setPostText(e.target.value);
              if (validationError) setValidationError(null);
            }}
            className={`w-full bg-[#f8ffe5] text-[#575350] rounded-lg px-4 py-2.5 min-h-[40px] resize-none focus:outline-none focus:ring-1 ${validationError ? 'ring-red-500 border-red-500' : 'focus:ring-[#6cda84]'}`}
            placeholder={`¿Qué estás pensando, ${userName?.split(' ')[0] || 'Usuario'}?`}
          />
        </div>
      </div>
      
      {/* Mostrar mensajes de validación si existen */}
      {validationError && (
        <div className="mt-1 text-red-600 text-sm font-medium">
          {validationError}
        </div>
      )}
      
      {/* Mostrar mensajes de error de subida si existen */}
      {uploadError && (
        <div className="mt-1 text-red-600 text-sm font-medium">
          {uploadError}
        </div>
      )}
      
      {/* Botón para subir imagen */}
      <div className="flex items-center space-x-4 mt-3">
        <div className="flex-1">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
            id="post-image"
          />
          <label
            htmlFor="post-image"
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
              !postText.trim() 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-[#6cda84] hover:bg-[#38cd58] cursor-pointer'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
            Subir foto
          </label>
          {!postText.trim() && (
            <span className="ml-2 text-sm text-gray-500">
              Escribe algo antes de subir una imagen
            </span>
          )}
        </div>
      </div>
      
      {/* Previsualización de imagen */}
      {imagePreview && (
        <div className="relative mt-3">
          <img 
            src={imagePreview} 
            alt="Vista previa" 
            className="h-24 object-cover rounded-md"
          />
          <button
            type="button"
            onClick={handleRemoveImage}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
      
      {/* Botón de envío */}
      <button
        type="submit"
        disabled={!postText.trim() || isUploading}
        className="w-full py-2 px-4 mt-4 bg-[#3d7b6f] text-white rounded-md hover:bg-[#2d5c53] transition-colors disabled:opacity-50"
      >
        {isUploading ? 'Publicando...' : 'Publicar'}
      </button>
    </form>
  );
};

export default PostForm; 
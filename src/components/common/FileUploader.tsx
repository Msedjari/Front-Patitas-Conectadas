import React, { useRef, useState } from 'react';
import { config } from '../../config';

interface FileUploaderProps {
  endpoint: string;
  method: string;
  additionalData?: Record<string, string>;
  onUploaded: (url: string) => void;
  onError: (error: string) => void;
  disabled?: boolean;
  disabledMessage?: string;
  onUploadStart?: () => void;
  returnFullUrl?: boolean;
  sendAdditionalData?: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  endpoint,
  method,
  additionalData = {},
  onUploaded,
  onError,
  disabled = false,
  disabledMessage = 'No se puede subir archivos en este momento',
  onUploadStart,
  returnFullUrl = false,
  sendAdditionalData = true
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getAuthHeaders = (): Record<string, string> => {
    const token = localStorage.getItem(config.session.tokenKey);
    const headers: Record<string, string> = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      onError('Solo se permiten archivos de imagen');
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      onError('La imagen no puede ser mayor a 5MB');
      return;
    }

    setIsUploading(true);
    onUploadStart?.();
    const formData = new FormData();

    // Agregar el archivo al FormData
    formData.append('imagen', file);

    // Agregar datos adicionales al FormData solo si sendAdditionalData es true
    if (sendAdditionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    try {
      console.log('Enviando archivo a:', `${config.apiUrl}${endpoint}`);
      console.log('Método:', method);
      console.log('Datos adicionales:', additionalData);

      const response = await fetch(`${config.apiUrl}${endpoint}`, {
        method: method,
        headers: getAuthHeaders(),
        body: formData
      });

      console.log('Respuesta del servidor:', response.status);
      const responseText = await response.text();
      console.log('Contenido de la respuesta:', responseText);

      if (!response.ok) {
        throw new Error(`Error al subir la imagen: ${response.statusText}`);
      }

      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        console.error('Error al parsear la respuesta:', e);
        throw new Error('Error al procesar la respuesta del servidor');
      }

      if (!responseData.img) {
        throw new Error('No se recibió la ruta de la imagen en la respuesta');
      }

      // Construir la URL según la configuración
      const imageUrl = returnFullUrl 
        ? `${config.apiUrl}/uploads/${responseData.img}`
        : responseData.img;
      
      console.log('URL de la imagen construida:', imageUrl);

      onUploaded(imageUrl);
      
      // Limpiar el input para permitir subir el mismo archivo nuevamente
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error en handleFileChange:', error);
      onError(error instanceof Error ? error.message : 'Error al subir la imagen');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="relative">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        style={{ display: 'none' }}
        disabled={disabled || isUploading}
      />
      <button
        onClick={() => !disabled && fileInputRef.current?.click()}
        disabled={disabled || isUploading}
        className="px-4 py-2 bg-[#6cda84] text-white rounded-md hover:bg-[#38cd58] disabled:opacity-50 disabled:cursor-not-allowed relative group"
      >
        {isUploading ? 'Subiendo...' : 'Subir foto'}
      </button>
      
      {/* Tooltip para mostrar el mensaje cuando está deshabilitado */}
      {disabled && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-800 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          {disabledMessage}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
        </div>
      )}
    </div>
  );
};

export default FileUploader; <main class="max-w-[680px] mx-auto"></main>
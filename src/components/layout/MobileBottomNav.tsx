import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getUserImage } from '../home/HomeUtils';
import { config } from '../../config';


/**
 * Componente de navegación inferior para dispositivos móviles
 * Estilo similar a Instagram con iconos y funcionalidad de navegación
 */
const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [userImagesCache, setUserImagesCache] = useState<Record<number, string>>({});

  // Efecto para cargar la imagen del usuario
  useEffect(() => {
    if (user?.id) {
      const fetchUserImage = async () => {
        try {
          const token = localStorage.getItem(config.session.tokenKey);
          if (!token) return;

          // Intentar obtener la imagen del perfil
          const response = await fetch(`${config.apiUrl}/usuarios/${user.id}/perfiles`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            }
          });

          if (response.ok) {
            const profileData = await response.json();
            if (profileData && profileData.img) {
              setUserImagesCache(prev => ({
                ...prev,
                [user.id]: profileData.img
              }));
            }
          }
        } catch (error) {
          console.error('Error al cargar imagen de usuario:', error);
        }
      };

      fetchUserImage();
    }
  }, [user?.id]);

  // Efecto para escuchar cambios en el caché de imágenes
  useEffect(() => {
    const handleUserImageUpdate = (e: CustomEvent) => {
      const { userId, imagePath } = e.detail;
      setUserImagesCache(prev => ({
        ...prev,
        [userId]: imagePath
      }));
    };

    window.addEventListener('userImageUpdated', handleUserImageUpdate as EventListener);
    return () => window.removeEventListener('userImageUpdated', handleUserImageUpdate as EventListener);
  }, []);

  // Comprobar la ruta actual para determinar qué ícono está activo
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden">
      <div className="flex justify-around items-center h-16 px-2">
        {/* Inicio */}
        <Link to="/" className={`mobile-nav-item ${isActive('/') ? 'active' : ''}`}>
          {isActive('/') ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="mobile-nav-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="mobile-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h2a1 1 0 001-1v-7m-6 0a1 1 0 001-1v-3a1 1 0 011-1h2a1 1 0 011 1v3a1 1 0 001 1" />
            </svg>
          )}
        </Link>

        {/* Protectoras */}
        <Link to="/protectoras" className={`mobile-nav-item ${isActive('/protectoras') ? 'active' : ''}`}>
          {isActive('/protectoras') ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="mobile-nav-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8zm4-9h-3V8a1 1 0 10-2 0v4a1 1 0 001 1h4a1 1 0 100-2z"/>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="mobile-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </Link>
        
        {/* Grupos  */}
        <Link to="/grupos" className={`mobile-nav-item ${isActive('/grupos') ? 'active' : ''}`}>
          {isActive('/grupos') ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="mobile-nav-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12.75c1.63 0 3.07.39 4.24.9 1.08.48 1.76 1.56 1.76 2.73V18H6v-1.61c0-1.18.68-2.26 1.76-2.73 1.17-.52 2.61-.91 4.24-.91zM4 13c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm1.13 1.1c-.37-.06-.74-.1-1.13-.1-.99 0-1.93.21-2.78.58A2.01 2.01 0 000 16.43V18h4.5v-1.61c0-.83.23-1.61.63-2.29zM20 13c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm1.13 1.1c.37-.06.74-.1 1.13-.1.99 0 1.93.21 2.78.58.86.37 1.96 1.27 1.96 2.82V18h-4.5v-1.61c0-.83-.23-1.61-.63-2.29zM12 6c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3z"/>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="mobile-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          )}
        </Link>
        
        {/* Eventos  */}
        <Link to="/eventos" className={`mobile-nav-item ${isActive('/eventos') ? 'active' : ''}`}>
          {isActive('/eventos') ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="mobile-nav-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 10v8l7-4zm12-4h-7.58l3.29-3.29L16 2l-4 4h-.03l-4-4-.69.71L10.56 6H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 14H3V8h18v12z"/>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="mobile-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          )}
        </Link>

        {/* Chat */}
        <Link to="/chat" className={`mobile-nav-item ${isActive('/chat') ? 'active' : ''}`}>
          {isActive('/chat') ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="mobile-nav-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="mobile-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          )}
        </Link>
        
        {/* Perfil */}
        <Link to="/perfil" className={`mobile-nav-item ${isActive('/perfil') ? 'active' : ''}`}>
          <div className="relative">
            {isActive('/perfil') ? (
              <div className="w-7 h-7 rounded-full border-2 border-[var(--primary-color)] overflow-hidden">
                <img 
                  src={getUserImage(userImagesCache, user?.id)} 
                  alt={user?.nombre || user?.name || "Usuario"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/default-avatar.svg';
                  }}
                />
              </div>
            ) : (
              <div className="w-7 h-7 rounded-full overflow-hidden">
                <img 
                  src={getUserImage(userImagesCache, user?.id)} 
                  alt={user?.nombre || user?.name || "Usuario"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/default-avatar.svg';
                  }}
                />
              </div>
            )}
          </div>
        </Link>
      </div>
    </div>
  );
};

export default MobileBottomNav; 
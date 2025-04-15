import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';


/**
 * Componente de navegación inferior para dispositivos móviles
 * Estilo similar a Instagram con iconos y funcionalidad de navegación
 */
const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  
  // Comprobar la ruta actual para determinar qué ícono está activo
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="mobile-bottom-nav">
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
      
      {/* Perfil */}
      <Link to="/perfil" className={`mobile-nav-item ${isActive('/perfil') ? 'active' : ''}`}>
        <div className="relative">
          {isActive('/perfil') ? (
            <div className="w-7 h-7 rounded-full border-2 border-[var(--primary-color)] overflow-hidden">
              <img 
                src={user?.img || user?.profileImage || "/default-avatar.svg"} 
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
                src={user?.img || user?.profileImage || "/default-avatar.svg"} 
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
  );
};

export default MobileBottomNav; 
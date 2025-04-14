import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Componente de barra lateral izquierda
 * Muestra la información del usuario y los enlaces de navegación principales
 */
const Sidebar: React.FC = () => {
  // En una aplicación real, usaríamos el contexto de autenticación
  const { user } = useAuth();
  
  // Elementos de la barra lateral con sus iconos y rutas
  const sidebarItems = [
    { name: 'Amigos', icon: 'users', path: '/amigos' },
    { name: 'Guardados', icon: 'bookmark', path: '/guardados' },
    { name: 'Grupos', icon: 'users-group', path: '/grupos' },
    { name: 'Eventos', icon: 'calendar', path: '/eventos' },
    { name: 'Fotos', icon: 'photos', path: '/fotos' },
  ];

  // Accesos directos a grupos
  const shortcuts = [
    { name: 'Grupo Adopción Perros', icon: 'group', path: '/grupos/perros' },
    { name: 'Asociación Protectoras', icon: 'group', path: '/grupos/protectoras' },
    { name: 'Veterinarios Unidos', icon: 'group', path: '/grupos/veterinarios' },
  ];

  /**
   * Función para renderizar el icono adecuado según el tipo
   * @param icon - Identificador del icono a renderizar
   */
  const renderIcon = (icon: string) => {
    switch (icon) {
      case 'users':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#2e82dc]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        );
      case 'bookmark':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#6cda84]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        );
      case 'users-group':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#2e82dc]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      case 'calendar':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#6cda84]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'marketplace':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#2e82dc]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        );
      case 'photos':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#6cda84]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'memories':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#2e82dc]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'group':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#3d7b6f]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col p-3 overflow-y-auto">
      {/* Perfil de usuario */}
      {user && (
        <Link to="/perfil" className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white mb-2">
          <div className="h-9 w-9 rounded-full bg-gray-300 overflow-hidden">
            <img 
              src={user.profileImage || "/default-avatar.svg"} 
              alt={user.name || "Usuario"} 
              className="h-full w-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/default-avatar.svg';
              }}
            />
          </div>
          <span className="font-medium text-[#2a2827]">{user.name || "Usuario"}</span>
        </Link>
      )}
      
      {/* Navegación principal */}
      <nav className="flex-1">
        <ul className="space-y-1">
          {sidebarItems.map((item, index) => (
            <li key={index}>
              <Link
                to={item.path}
                className="flex items-center px-2 py-3 rounded-lg hover:bg-white transition-colors"
              >
                <span className="inline-flex items-center justify-center h-8 w-8 mr-3">
                  {renderIcon(item.icon)}
                </span>
                <span className="text-[#2a2827] font-medium">{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* Separador */}
      <div className="my-4 border-t border-gray-200"></div>
      
      {/* Título de accesos directos */}
      <h3 className="px-2 text-[#3d7b6f] font-medium mb-2">Tus accesos directos</h3>
      
      {/* Lista de accesos directos */}
      <nav>
        <ul className="space-y-1">
          {shortcuts.map((item, index) => (
            <li key={index}>
              <Link
                to={item.path}
                className="flex items-center px-2 py-2 rounded-lg hover:bg-white transition-colors"
              >
                <span className="inline-flex items-center justify-center h-8 w-8 mr-3 bg-gray-200 rounded-md overflow-hidden">
                  {renderIcon(item.icon)}
                </span>
                <span className="text-[#2a2827] text-sm">{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* Pie de página */}
      <div className="mt-4 px-2 text-xs text-[#575350]">
        <p>Privacidad · Términos · Publicidad · Cookies · Más · Patitas Conectadas © 2025</p>
      </div>
    </div>
  );
};

export default Sidebar; 
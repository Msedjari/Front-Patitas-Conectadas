import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Componente que protege las rutas que requieren autenticación
 * Redirige al usuario a la página de login si no está autenticado
 * Solo permite acceso sin autenticación a las rutas de autenticación (/login, /register)
 * para reflejar la configuración del backend donde solo /auth/** está permitido sin autenticar
 * 
 * @param children - Componentes hijos a renderizar si el usuario está autenticado
 * @returns Los componentes hijos o redirige a la página de login
 */
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  
  // Si el usuario no está autenticado, redirigir a la página de login
  if (!isAuthenticated) {
    // Guardamos la ubicación actual para redirigir después del login
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  
  // Si está autenticado, renderizar los componentes hijos
  return <>{children}</>;
};

export default ProtectedRoute; 
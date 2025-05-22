import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Vistas principales
import Home from '../views/Home';
import Login from '../views/Login';
import Register from '../views/Register';
import Profile from '../views/Profile';
import NotFound from '../views/NotFound';

// Vistas de grupos
import Grupos from '../views/Grupos';
import GrupoVista from '../views/GrupoVista';

// Componente para proteger rutas que requieren autenticación
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  // Mientras verifica la autenticación, muestra un indicador de carga
  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Cargando...</div>;
  }
  
  // Si no está autenticado, redirige al login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Si está autenticado, muestra el contenido protegido
  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Rutas protegidas que requieren autenticación */}
      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />
      
      {/* Rutas de grupos */}
      <Route path="/grupos" element={
        <ProtectedRoute>
          <Grupos />
        </ProtectedRoute>
      } />
      
      <Route path="/grupos/:id" element={
        <ProtectedRoute>
          <GrupoVista />
        </ProtectedRoute>
      } />
      
      {/* Ruta para manejar URLs no encontradas */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes; 
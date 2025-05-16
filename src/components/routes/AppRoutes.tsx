import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Login from '../auth/Login';
import Register from '../auth/Register';
import MainLayout from '../layout/MainLayout';
import LoadingScreen from '../LoadingScreen';

// Importación de vistas
import Home from '../../views/home/Home';
import Perfil from '../profile/Perfil';
import Profile from '../../views/Profile';
import Eventos from '../../views/Eventos';
import Grupos from '../../views/Grupos';
import Amigos from '../../views/Amigos';
import Guardados from '../../views/Guardados';
import NotFound from '../../views/NotFound';
import Protectoras from '../../views/Protectoras';
import MascotaForm from '../../views/MascotaForm';

// Componente para rutas protegidas
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

/**
 * Componente interno que renderiza las rutas una vez que la autenticación está lista
 */
const AppRoutes: React.FC = () => {
  const { isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  return (
    <Routes>
      {/* Rutas públicas - accesibles sin autenticación */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* 
        Rutas protegidas que requieren autenticación
        (Protección temporalmente desactivada para desarrollo)
      */}
      <Route
        path="/"
        element={
          // Temporarily using MainLayout directly without protection for development
          // TODO: Re-implement ProtectedRoute when authentication is ready
          <MainLayout />
        }
      > 
        {/* Rutas anidadas dentro del layout principal */}
        <Route index element={<Home />} /> {/* Ruta principal/feed */}
        <Route path="perfil" element={<Profile />} />
        <Route path="perfil/:id" element={<Profile />} />
        <Route path="mi-perfil" element={<Perfil />} />
        <Route path="grupos" element={<Grupos />} />
        <Route path="eventos" element={<Eventos />} />
        <Route path="patitas" element={<div>Patitas conectadas (En desarrollo)</div>} />
        <Route path="amigos" element={<Amigos />} />
        <Route path="guardados" element={<Guardados />} />
        <Route path="protectoras" element={<Protectoras />} />
        <Route path="mascotas/nueva" element={<MascotaForm />} />
        <Route path="mascotas/:id/editar" element={<MascotaForm />} />
      </Route>
      
      {/* Ruta para página no encontrada */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes; 
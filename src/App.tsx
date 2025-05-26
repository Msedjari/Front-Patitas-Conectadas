/**
 * Componente principal de la aplicación Patitas Conectadas
 * 
 * Este componente configura:
 * 1. El sistema de autenticación a través del AuthProvider
 * 2. La estructura de rutas de la aplicación con React Router
 * 3. Las rutas protegidas y públicas
 * 4. El layout principal que comparten las páginas autenticadas
 * 
 * La aplicación tiene una estructura de rutas anidadas donde las rutas autenticadas
 * comparten un layout común que incluye navegación, barras laterales y otros
 * elementos de UI persistentes.
 */
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import RecuperarContrasena from './views/RecuperarContrasena';
import Configuracion from './views/Configuracion';
import Ayuda from './views/Ayuda';
import GuiaUsuario from './views/GuiaUsuario';
import PoliticaPrivacidad from './views/PoliticaPrivacidad';
import ProtectedRoute from './components/auth/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import Home from './views/home/Home';
import Perfil from './components/profile/Perfil';
import Eventos from './views/Eventos';
import Grupos from './views/Grupos';
import Amigos from './views/Amigos';
import Guardados from './views/Guardados';
import Chat from './views/Chat';
import { UserProvider } from './context/UserContext';

/**
 * Componente Error Boundary para capturar errores en la aplicación
 * Evita que toda la aplicación falle por un error en un componente
 */
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Actualiza el estado para que el siguiente renderizado muestre la UI alternativa
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // También puedes registrar el error en un servicio de reporte de errores
    console.error('Error capturado por ErrorBoundary:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-[rgb(252, 255, 243)]">
          <div className="max-w-md p-6 bg-white rounded-lg shadow-md border border-red-200">
            <h2 className="text-xl font-semibold text-red-600 mb-4">Algo salió mal</h2>
            <p className="text-gray-700 mb-4">
              Lo sentimos, ha ocurrido un error en la aplicación. Intenta recargar la página.
            </p>
            {this.state.error && (
              <div className="p-3 bg-red-50 rounded mb-4 text-sm text-red-800 overflow-auto">
                {this.state.error.toString()}
              </div>
            )}
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#6cda84] text-white rounded hover:bg-[#5bc073] transition-colors"
            >
              Recargar página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Componente de carga que se muestra mientras la aplicación se inicializa
 */
const LoadingScreen = () => (
  <div className="flex items-center justify-center min-h-screen bg-[rgb(252, 255, 243)]">
    <div className="flex flex-col items-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#6cda84]"></div>
      <p className="mt-4 text-lg text-[#3d7b6f]">Cargando Patitas Conectadas...</p>
    </div>
  </div>
);

/**
 * Componente interno que renderiza las rutas una vez que la autenticación está lista
 */
const AppRoutes = () => {
  const { isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  return (
    <Routes>
      {/* Rutas públicas - accesibles sin autenticación */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/recuperar-contrasena" element={<RecuperarContrasena />} />
      
      {/* Rutas protegidas que requieren autenticación */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            {/* MainLayout proporciona la estructura común para todas las páginas autenticadas */}
            <MainLayout />
          </ProtectedRoute>
        }
      >
        {/* Rutas anidadas dentro del layout principal */}
        <Route index element={<Home />} /> {/* Ruta principal/feed */}
        <Route path="perfil/:id" element={<Perfil />} /> {/* Ruta para perfiles específicos */}
        <Route path="mi-perfil" element={<Perfil />} /> {/* Si tienes una ruta específica para tu perfil */}
        <Route path="grupos" element={<Grupos />} />
        <Route path="eventos" element={<Eventos />} />
        <Route path="patitas" element={<div>Patitas conectadas (En desarrollo)</div>} />
        <Route path="amigos" element={<Amigos />} />
        <Route path="guardados" element={<Guardados />} />
        <Route path="chat" element={<Chat />} />
        <Route path="configuracion" element={<Configuracion />} />
        <Route path="ayuda" element={<Ayuda />} />
        <Route path="guia-usuario" element={<GuiaUsuario />} />
        <Route path="politica-privacidad" element={<PoliticaPrivacidad />} />
      </Route>
      
      {/* Redirección para rutas no encontradas */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

/**
 * Componente principal de la aplicación
 * Configura el router y las rutas de la aplicación
 * 
 * Estructura de rutas:
 * - Rutas públicas: login, registro
 * - Rutas protegidas (requieren autenticación):
 *   - Inicio (feed)
 *   - Perfil de usuario
 *   - Protectoras de animales
 *   - Grupos
 *   - Eventos
 *   - Patitas conectadas
 *   - Amigos
 *   - Guardados
 */
function App() {
  return (
    // Envolvemos toda la aplicación en un ErrorBoundary para capturar errores
    <ErrorBoundary>
      {/* Provee el contexto de autenticación a toda la aplicación */}
      <AuthProvider>
        {/* Proporciona el contexto de usuario para acceso a datos de usuarios */}
        <UserProvider>
          {/* Configura el enrutador para toda la aplicación */}
          <Router>
            <AppRoutes />
          </Router>
        </UserProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;

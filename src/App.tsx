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
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import MainLayout from './components/layout/MainLayout';
import Home from './views/Home';
import Perfil from './components/profile/Perfil';

/**
 * Componente que protege las rutas que requieren autenticación
 * DESACTIVADO TEMPORALMENTE: Ahora permite acceder a todas las rutas sin autenticación
 * para facilitar el desarrollo
 * 
 * @param children - Componentes hijos a renderizar si el usuario está autenticado
 * @returns Los componentes hijos o redirige a la página de login
 */
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  // const { isAuthenticated } = useAuth();
  // return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
  
  // Comentado temporalmente para desarrollo - permite acceso sin autenticación
  return <>{children}</>;
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
    // Provee el contexto de autenticación a toda la aplicación
    <AuthProvider>
      {/* Configura el enrutador para toda la aplicación */}
      <Router>
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
              <ProtectedRoute>
                {/* MainLayout proporciona la estructura común para todas las páginas autenticadas */}
                <MainLayout />
              </ProtectedRoute>
            }
          >
            {/* Rutas anidadas dentro del layout principal */}
            <Route index element={<Home />} /> {/* Ruta principal/feed */}
            <Route path="perfil" element={<Perfil />} /> {/* Perfil del usuario */}
            <Route path="protectoras" element={<div>Protectoras (En desarrollo)</div>} />
            <Route path="grupos" element={<div>Grupos (En desarrollo)</div>} />
            <Route path="eventos" element={<div>Eventos (En desarrollo)</div>} />
            <Route path="patitas" element={<div>Patitas conectadas (En desarrollo)</div>} />
            <Route path="amigos" element={<div>Amigos (En desarrollo)</div>} />
            <Route path="guardados" element={<div>Guardados (En desarrollo)</div>} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { config } from '../config';

/**
 * Interfaz para definir la estructura de un usuario
 */
interface User {
  id: string;
  nombre?: string; // Cambiado de name a nombre para coincidir con la API
  name?: string; // Compatible con ambos formatos
  email: string;
  apellidos?: string;
  img?: string; // URL de la imagen de perfil
  profileImage?: string; // Compatible con ambos formatos
}

/**
 * Interfaz para definir el tipo de contexto de autenticación
 */
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  refreshUserData: () => Promise<void>;
}

// Crear el contexto con valores por defecto
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: async () => false,
  register: async () => false,
  logout: () => {},
  refreshUserData: async () => {},
});

/**
 * Hook personalizado para acceder al contexto de autenticación
 */
export const useAuth = () => useContext(AuthContext);

/**
 * Proveedor de autenticación que envuelve la aplicación
 * Gestiona el estado de autenticación y proporciona métodos para login, registro y logout
 */
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Estado para almacenar el usuario actual
  const [user, setUser] = useState<User | null>(null);

  /**
   * Función para obtener los datos actualizados del usuario desde la API
   */
  const refreshUserData = async (): Promise<void> => {
    // Usar la clave del token desde la configuración
    const token = localStorage.getItem(config.session.tokenKey);
    if (!token) {
      console.log('No hay token disponible, no se puede actualizar el usuario');
      return;
    }

    try {
      console.log('Intentando obtener datos del usuario...');
      
      // Intentar obtener los datos del usuario con el token
      const response = await fetch(`${config.apiUrl}/usuarios/perfil`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Respuesta obtenida:', response.status);

      if (response.ok) {
        const userData = await response.json();
        console.log('Datos del usuario obtenidos:', userData);
        
        setUser(userData);
        
        // Actualizar el localStorage con los datos más recientes
        localStorage.setItem(config.session.userKey, JSON.stringify(userData));
      } else if (response.status === 401) {
        // Token inválido o expirado
        console.warn('Token inválido o expirado, cerrando sesión');
        logout();
      } else {
        console.error('Error al obtener datos del usuario:', response.statusText);
        
        // Si el endpoint no existe, intentamos mantener los datos en localStorage
        // En un entorno de desarrollo esto permite trabajar sin backend
        if (import.meta.env.DEV) {
          console.log('En modo desarrollo, manteniendo datos guardados');
          const savedUser = localStorage.getItem(config.session.userKey);
          if (savedUser) {
            try {
              const parsedUser = JSON.parse(savedUser);
              setUser(parsedUser);
            } catch (error) {
              console.error('Error al parsear usuario guardado:', error);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error al obtener datos del usuario:', error);
    }
  };
  
  /**
   * Función para iniciar sesión
   */
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('Intentando iniciar sesión:', email);
      
      // En desarrollo, permitir login simulado
      if (import.meta.env.DEV && email === 'dev@example.com' && password === 'dev') {
        console.log('Modo desarrollo: Login simulado');
        const mockUser = {
          id: '1',
          nombre: 'Usuario Desarrollo',
          email: 'dev@example.com',
          apellidos: 'Test',
        };
        
        setUser(mockUser);
        localStorage.setItem(config.session.userKey, JSON.stringify(mockUser));
        localStorage.setItem(config.session.tokenKey, 'dev-token-123');
        return true;
      }
      
      const response = await fetch(`${config.apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        console.error('Error de login:', response.status, response.statusText);
        return false;
      }

      const data = await response.json();
      
      // Guardar token usando la clave de configuración
      localStorage.setItem(config.session.tokenKey, data.token);
      
      // Obtener datos completos del usuario
      await refreshUserData();
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };
  
  /**
   * Función para registrar un nuevo usuario
   */
  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${config.apiUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password })
      });

      if (!response.ok) {
        console.error('Error de registro:', response.status, response.statusText);
        return false;
      }

      const data = await response.json();
      
      // Guardar token usando la clave de configuración
      localStorage.setItem(config.session.tokenKey, data.token);
      
      // Obtener datos completos del usuario
      await refreshUserData();
      
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };
  
  /**
   * Función para cerrar sesión
   * Elimina el usuario del estado y del localStorage
   */
  const logout = () => {
    setUser(null);
    localStorage.removeItem(config.session.userKey);
    localStorage.removeItem(config.session.tokenKey);
  };
  
  // Verificar si hay un usuario guardado al cargar la página
  useEffect(() => {
    console.log('Verificando usuario guardado en localStorage');
    
    const savedUser = localStorage.getItem(config.session.userKey);
    const token = localStorage.getItem(config.session.tokenKey);
    
    if (savedUser && token) {
      try {
        const parsedUser = JSON.parse(savedUser);
        console.log('Usuario encontrado en localStorage:', parsedUser);
        
        setUser(parsedUser);
        
        // Intentar actualizar datos del usuario desde el servidor
        refreshUserData();
      } catch (error) {
        console.error('Error al parsear usuario guardado:', error);
        localStorage.removeItem(config.session.userKey);
        localStorage.removeItem(config.session.tokenKey);
      }
    } else {
      console.log('No se encontró usuario o token en localStorage');
      
      // En modo desarrollo, crear un usuario simulado para facilitar las pruebas
      if (import.meta.env.DEV) {
        const createDevUser = () => {
          console.log('Creando usuario de desarrollo para pruebas');
          const mockUser = {
            id: '1',
            nombre: 'Usuario Desarrollo',
            email: 'dev@example.com',
            apellidos: 'Test',
          };
          
          setUser(mockUser);
          localStorage.setItem(config.session.userKey, JSON.stringify(mockUser));
          localStorage.setItem(config.session.tokenKey, 'dev-token-123');
        };
        
        // En desarrollo, permitir habilitar el usuario de desarrollo con una variable
        if (import.meta.env.VITE_USE_DEV_USER === 'true') {
          createDevUser();
        }
      }
    }
  }, []);
  
  // Valor del contexto que se proporciona a los componentes hijos
  const value = {
    user,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshUserData
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext; 
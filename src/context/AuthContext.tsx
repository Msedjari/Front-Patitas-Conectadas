import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
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
  register: (nombre: string, correo: string, contrasena: string, apellido?: string) => Promise<boolean>;
  logout: () => void;
  refreshUserData: () => Promise<void>;
  isLoading: boolean;
}

// Crear el contexto con valores por defecto
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: async () => false,
  register: async () => false,
  logout: () => {},
  refreshUserData: async () => {},
  isLoading: true
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
  // Estado para controlar si está cargando la autenticación
  const [isLoading, setIsLoading] = useState(true);
  // Referencia para evitar múltiples llamadas
  const isRefreshingRef = useRef(false);

  /**
   * Función para obtener los datos actualizados del usuario desde la API
   */
  const refreshUserData = async (): Promise<void> => {
    // Evitar múltiples llamadas simultáneas
    if (isRefreshingRef.current) {
      console.log('Ya hay una actualización de usuario en curso, saltando');
      return;
    }
    
    isRefreshingRef.current = true;
    
    // Usar la clave del token desde la configuración
    const token = localStorage.getItem(config.session.tokenKey);
    if (!token) {
      console.log('No hay token disponible, no se puede actualizar el usuario');
      isRefreshingRef.current = false;
      setIsLoading(false);
      return;
    }

    try {
      console.log('Intentando obtener datos del usuario...');
      
      // Intentar obtener los datos del usuario con el token
      const response = await fetch(`${config.apiUrl}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Respuesta obtenida:', response.status);

      if (response.ok) {
        const userData = await response.json();
        console.log('Datos del usuario obtenidos:', userData);
        
        // Ahora intentamos obtener datos adicionales del perfil, si es necesario
        if (userData && userData.id && (!userData.img || !userData.profileImage)) {
          try {
            // Primero intentamos obtener el perfil
            const profileResponse = await fetch(`${config.apiUrl}/usuarios/${userData.id}/perfiles`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (profileResponse.ok) {
              const profileData = await profileResponse.json();
              console.log('Datos de perfil obtenidos:', profileData);
              
              // Combinamos los datos
              if (profileData && profileData.img) {
                userData.img = profileData.img;
                userData.profileImage = profileData.img; // Para compatibilidad
              }
            } else {
              console.log('No se pudo obtener el perfil del usuario:', profileResponse.status);
              
              // Intentamos obtener datos básicos
              const userDetailsResponse = await fetch(`${config.apiUrl}/usuarios/${userData.id}`, {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              });
              
              if (userDetailsResponse.ok) {
                const userDetails = await userDetailsResponse.json();
                console.log('Datos básicos del usuario obtenidos:', userDetails);
                
                // Agregamos cualquier dato adicional
                if (userDetails && userDetails.img) {
                  userData.img = userDetails.img;
                  userData.profileImage = userDetails.img; // Para compatibilidad
                }
              }
            }
          } catch (profileError) {
            console.error('Error al obtener datos adicionales del usuario:', profileError);
          }
        }
        
        console.log('Datos finales del usuario:', userData);
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
        const savedUser = localStorage.getItem(config.session.userKey);
        if (savedUser) {
          try {
            const parsedUser = JSON.parse(savedUser);
            setUser(parsedUser);
            console.log('Usando datos de usuario guardados en localStorage');
          } catch (error) {
            console.error('Error al parsear usuario guardado:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error al obtener datos del usuario:', error);
      // Intentar mantener la sesión con datos guardados si están disponibles
      const savedUser = localStorage.getItem(config.session.userKey);
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
          console.log('Usando datos de usuario guardados en localStorage debido a error');
        } catch (parseError) {
          console.error('Error al parsear usuario guardado:', parseError);
        }
      }
    } finally {
      isRefreshingRef.current = false;
      setIsLoading(false);
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
      
      // Aquí actualizamos el endpoint según la documentación de la API
      const response = await fetch(`${config.apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          email: email,  // Mantenemos email como lo espera el backend
          password: password  // Mantenemos password como lo espera el backend
        })
      });

      if (!response.ok) {
        console.error('Error de login:', response.status, response.statusText);
        // Intentar obtener el mensaje de error del servidor
        let errorMessage = 'Error al iniciar sesión. Por favor, verifique sus credenciales.';
        try {
          const errorData = await response.json();
          if (errorData.error) {  // Cambiamos a error que es lo que devuelve el backend
            errorMessage = errorData.error;
          }
        } catch (e) {
          // Si no se puede parsear el JSON, usamos el mensaje por defecto
          console.error('No se pudo parsear el mensaje de error:', e);
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      // Guardar token usando la clave de configuración
      localStorage.setItem(config.session.tokenKey, data.token);
      
      // Obtener datos completos del usuario
      await refreshUserData();
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      // Propagar el error en lugar de solo devolver false
      throw error;
    }
  };
  
  /**
   * Función para registrar un nuevo usuario
   */
  const register = async (nombre: string, correo: string, contrasena: string, apellido: string = ''): Promise<boolean> => {
    try {
      console.log('Intentando registrar usuario con correo:', correo);
      
      // Construir el cuerpo de la solicitud
      const requestBody = {
        nombre: nombre,
        email: correo,
        password: contrasena,
        apellido: apellido // Usar el apellido proporcionado o cadena vacía por defecto
      };
      
      console.log('Cuerpo de la solicitud de registro:', JSON.stringify(requestBody));
      
      // Adaptamos al formato de la API según documentación
      const response = await fetch(`${config.apiUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      console.log('Respuesta del servidor de registro:', response.status, response.statusText);

      if (!response.ok) {
        console.error('Error de registro:', response.status, response.statusText);
        // Intentar obtener el mensaje de error del servidor
        let errorMessage = 'Error al registrar usuario. Por favor, intente nuevamente.';
        try {
          const responseText = await response.text();
          console.error('Respuesta completa del servidor:', responseText);
          
          // Intentar parsear como JSON si es posible
          if (responseText) {
            try {
              const errorData = JSON.parse(responseText);
              console.error('Detalles del error de registro:', errorData);
              if (errorData.message) {
                errorMessage = errorData.message;
              }
            } catch (jsonError) {
              console.error('La respuesta no es un JSON válido');
            }
          }
        } catch (e) {
          // Si no se puede obtener el texto de la respuesta
          console.error('No se pudo obtener el texto de la respuesta:', e);
        }
        throw new Error(errorMessage);
      }

      // Capturar la respuesta como texto primero para depuración
      const responseText = await response.text();
      console.log('Respuesta exitosa (texto):', responseText);
      
      // Parsear la respuesta como JSON si hay contenido
      let data;
      try {
        data = responseText ? JSON.parse(responseText) : {};
        console.log('Registro exitoso, datos recibidos:', data);
      } catch (e) {
        console.error('Error al parsear la respuesta JSON:', e);
        throw new Error('Error al procesar la respuesta del servidor');
      }
      
      // Guardar token usando la clave de configuración
      if (data && data.token) {
        localStorage.setItem(config.session.tokenKey, data.token);
        
        // Obtener datos completos del usuario
        await refreshUserData();
        
        return true;
      } else {
        console.error('No se recibió un token en la respuesta');
        throw new Error('No se recibió un token válido del servidor');
      }
    } catch (error) {
      console.error('Registration error:', error);
      // Propagar el error en lugar de solo devolver false
      throw error;
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
    setIsLoading(true);
    
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
        setIsLoading(false);
      }
    } else {
      console.log('No se encontró usuario o token en localStorage');
      setIsLoading(false);
    }
  }, []);
  
  // Valor del contexto que se proporciona a los componentes hijos
  const value = {
    user,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshUserData,
    isLoading
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 
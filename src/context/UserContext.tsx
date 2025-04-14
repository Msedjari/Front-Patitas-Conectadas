import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { config } from '../config';

// Interfaz para datos de usuario
interface UserData {
  id: string;
  nombre?: string;
  apellidos?: string;
  img?: string;
}

// Interfaz para el contexto
interface UserContextType {
  getUserById: (userId: string) => Promise<UserData | null>;
  cachedUsers: Record<string, UserData>;
}

// Crear el contexto con valores por defecto
const UserContext = createContext<UserContextType>({
  getUserById: async () => null,
  cachedUsers: {}
});

// Hook personalizado para acceder al contexto
export const useUserContext = () => useContext(UserContext);

/**
 * Contexto de Usuario
 * 
 * Proporciona funcionalidades para acceder a información de usuarios a través
 * de la aplicación, implementando un sistema de caché para optimizar las
 * peticiones al servidor.
 * 
 * Funcionalidades:
 * - Obtención de datos de usuario por ID con caché
 * - Acceso centralizado a información de usuarios
 * - Reducción de peticiones al servidor mediante caché
 * 
 * Este contexto está diseñado para ser utilizado junto con AuthContext,
 * que maneja la autenticación, mientras que UserContext se centra en la
 * obtención y almacenamiento de información de usuarios.
 */

// Proveedor del contexto
export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Estado para la caché de usuarios
  const [cachedUsers, setCachedUsers] = useState<Record<string, UserData>>({});
  
  // Función para obtener un usuario por su ID
  const getUserById = async (userId: string): Promise<UserData | null> => {
    // Verificar si el usuario ya está en caché
    if (cachedUsers[userId]) {
      return cachedUsers[userId];
    }
    
    try {
      // Obtener token de autenticación
      const token = localStorage.getItem(config.session.tokenKey);
      const headers: Record<string, string> = {};
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      // Realizar la petición para obtener datos del usuario
      const response = await fetch(`${config.apiUrl}/usuarios/${userId}`, {
        headers
      });
      
      if (!response.ok) {
        throw new Error(`Error al obtener usuario: ${response.statusText}`);
      }
      
      // Procesar los datos y actualizar la caché
      const userData = await response.json();
      
      // Actualizar la caché
      setCachedUsers(prev => ({
        ...prev,
        [userId]: userData
      }));
      
      return userData;
    } catch (error) {
      console.error(`Error al obtener usuario ${userId}:`, error);
      return null;
    }
  };
  
  // Proporcionar el contexto a los componentes hijos
  return (
    <UserContext.Provider value={{ getUserById, cachedUsers }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext; 
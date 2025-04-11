/**
 * Punto de entrada principal de la aplicación React de Patitas Conectadas
 * 
 * Este archivo es el punto de inicio de la aplicación React. Configura el renderizado
 * del componente raíz (App) dentro de un contenedor StrictMode para detectar problemas
 * potenciales durante el desarrollo.
 * 
 * StrictMode realiza comprobaciones adicionales y advertencias en desarrollo para:
 * - Identificar componentes con ciclos de vida inseguros
 * - Advertir sobre API obsoletas
 * - Detectar efectos secundarios inesperados
 * - Detectar uso de API heredadas de contexto
 * - Advertir sobre usos obsoletos de findDOMNode
 * - Detectar datos mutables inesperados
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './App.css' // Importación de estilos globales
import App from './App.tsx' // Componente principal de la aplicación

// Obtener el elemento DOM raíz y crear un root de React con él
// El operador '!' indica a TypeScript que el elemento siempre existirá
createRoot(document.getElementById('root')!).render(
  // StrictMode activa verificaciones adicionales en desarrollo
  <StrictMode>
    <App />
  </StrictMode>,
)

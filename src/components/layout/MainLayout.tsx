import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import RightSidebar from './RightSidebar';
import MobileBottomNav from './MobileBottomNav';
import { Link } from 'react-router-dom';
import logoImage from '../../assets/logo.png';
/**
 * Componente principal de layout que estructura la interfaz de usuario para las páginas autenticadas
 * Contiene la barra lateral izquierda, la barra de navegación superior y la barra lateral derecha
 * En dispositivos móviles muestra una navegación inferior y un menú lateral desplegable
 */
const MainLayout: React.FC = () => {
  // Estado para controlar la visibilidad del menú lateral en móvil
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Función para abrir el menú lateral
  const openSidebar = () => {
    setSidebarOpen(true);
    document.body.style.overflow = 'hidden'; // Evitar scroll del body cuando el menú está abierto
  };

  // Función para cerrar el menú lateral
  const closeSidebar = () => {
    setSidebarOpen(false);
    document.body.style.overflow = ''; // Restaurar scroll del body
  };

  return (
    <div className="min-h-screen bg-[rgb(252, 255, 243)]">
      {/* Barra de navegación superior fija - solo visible en desktop */}
      <div className="hidden md:block">
        <Navbar />
      </div>
      
      {/* Barra de navegación móvil superior - solo visible en móvil */}
      <div className="fixed top-0 left-0 right-0 h-14 bg-white z-50 md:hidden flex items-center justify-between px-4 border-b border-gray-200">
        <button onClick={openSidebar} className="text-[#3d7b6f] p-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        <div className="text-center">
          <img src={logoImage} alt="Patitas Conectadas" className="h-8" />
        </div>
        
        {/* Notificaciones - nuevo botón en la esquina superior derecha */}
        <Link to="/notificaciones" className="text-[#3d7b6f] p-2 relative">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {/* Badge de notificaciones - opcional, puedes agregar lógica para mostrar el número de notificaciones */}
          <span className="notification-badge">2</span>
        </Link>
      </div>
      
      {/* Contenedor principal con margen superior para dejar espacio a la navbar */}
      <div className="flex pt-14 md:pt-14">
        {/* Barra lateral izquierda fija para desktop */}
        <div className="w-[300px] fixed left-0 top-14 h-[calc(100vh-3.5rem)] overflow-y-auto hidden md:block">
          <Sidebar />
        </div>
        
        {/* Menú lateral móvil (estilo hamburguesa) */}
        <div className={`fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity md:hidden ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          onClick={closeSidebar}>
          <div 
            className={`absolute top-0 left-0 h-full w-[85%] max-w-[320px] bg-white transition-transform transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
            onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#3d7b6f]">Menú</h2>
              <button onClick={closeSidebar} className="text-[#3d7b6f] p-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="h-[calc(100%-64px)] overflow-y-auto">
              <Sidebar />
            </div>
          </div>
        </div>
        
        {/* Contenido principal centrado */}
        <div className="flex-1 md:ml-[300px] md:mr-[300px] py-6 px-4 pb-16 md:pb-6">
          <main className="max-w-[680px] mx-auto">
            <Outlet />
          </main>
        </div>
        
        {/* Barra lateral derecha fija */}
        <div className="w-[300px] fixed right-0 top-14 h-[calc(100vh-3.5rem)] overflow-y-auto hidden lg:block">
          <RightSidebar />
        </div>
      </div>
      
      {/* Navegación inferior móvil (estilo Instagram) */}
      <div className="md:hidden">
        <MobileBottomNav />
      </div>
    </div>
  );
};

export default MainLayout; 
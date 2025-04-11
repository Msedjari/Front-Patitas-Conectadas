import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import RightSidebar from './RightSidebar';

/**
 * Componente principal de layout que estructura la interfaz de usuario para las páginas autenticadas
 * Contiene la barra lateral izquierda, la barra de navegación superior y la barra lateral derecha
 */
const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[rgb(252, 255, 243)]">
      {/* Barra de navegación superior fija */}
      <Navbar />
      
      {/* Contenedor principal con margen superior para dejar espacio a la navbar */}
      <div className="flex pt-14">
        {/* Barra lateral izquierda fija */}
        <div className="w-[300px] fixed left-0 top-14 h-[calc(100vh-3.5rem)] overflow-y-auto hidden md:block">
          <Sidebar />
        </div>
        
        {/* Contenido principal centrado */}
        <div className="flex-1 md:ml-[300px] md:mr-[300px] py-6 px-4">
          <main className="max-w-[680px] mx-auto">
            <Outlet />
          </main>
        </div>
        
        {/* Barra lateral derecha fija */}
        <div className="w-[300px] fixed right-0 top-14 h-[calc(100vh-3.5rem)] overflow-y-auto hidden lg:block">
          <RightSidebar />
        </div>
      </div>
    </div>
  );
};

export default MainLayout; 
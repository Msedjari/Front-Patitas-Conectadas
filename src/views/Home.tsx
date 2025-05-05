import React from 'react';
import { Home as HomeComponent } from '../components/home';

/**
 * Componente de vista de inicio
 * Este componente ahora utiliza el componente modular Home de la carpeta components/home
 */
const Home: React.FC = () => {
  return <HomeComponent />;
};

export default Home;
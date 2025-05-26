import React from 'react';
import { Link } from 'react-router-dom';

const GuiaUsuario: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-[#2a2827] mb-6">Guía del Usuario</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="space-y-8">
          {/* Introducción */}
          <section>
            <h2 className="text-xl font-semibold text-[#2a2827] mb-4">Bienvenido a Patitas Conectadas</h2>
            <p className="text-gray-600 mb-4">
              Esta guía te ayudará a aprovechar al máximo todas las funciones de nuestra plataforma.
            </p>
          </section>

          {/* Funcionalidades Principales */}
          <section>
            <h2 className="text-xl font-semibold text-[#2a2827] mb-4">Funcionalidades Principales</h2>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-[#2a2827] mb-2">Perfil de Usuario</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Tu perfil es tu espacio personal en Patitas Conectadas. Aquí puedes:
                </p>
                <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                  <li>Actualizar tu información personal</li>
                  <li>Cambiar tu foto de perfil</li>
                  <li>Gestionar tu configuración de privacidad</li>
                  <li>Ver tu actividad reciente</li>
                </ul>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-[#2a2827] mb-2">Grupos</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Los grupos te permiten conectar con personas que comparten tus intereses:
                </p>
                <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                  <li>Crear y unirte a grupos</li>
                  <li>Participar en discusiones</li>
                  <li>Compartir contenido relevante</li>
                  <li>Organizar eventos</li>
                </ul>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-[#2a2827] mb-2">Eventos</h3>
                <p className="text-sm text-gray-600 mb-2">
                  La sección de eventos te permite:
                </p>
                <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                  <li>Crear y gestionar eventos</li>
                  <li>Inscribirte a eventos existentes</li>
                  <li>Recibir recordatorios</li>
                  <li>Compartir eventos con amigos</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Consejos y Trucos */}
          <section>
            <h2 className="text-xl font-semibold text-[#2a2827] mb-4">Consejos y Trucos</h2>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-[#2a2827] mb-2">Optimiza tu Perfil</h3>
                <p className="text-sm text-gray-600">
                  Un perfil completo y actualizado te ayuda a conectar mejor con otros usuarios. 
                  Asegúrate de incluir una foto de perfil y una breve descripción sobre ti.
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-[#2a2827] mb-2">Mantente Activo</h3>
                <p className="text-sm text-gray-600">
                  La participación regular en grupos y eventos aumenta tu visibilidad y te ayuda 
                  a construir una red más sólida en la comunidad.
                </p>
              </div>
            </div>
          </section>

          {/* Enlaces Útiles */}
          <section>
            <h2 className="text-xl font-semibold text-[#2a2827] mb-4">Enlaces Útiles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link to="/ayuda" className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <h3 className="font-medium text-[#2a2827] mb-2">Centro de Ayuda</h3>
                <p className="text-sm text-gray-600">
                  Encuentra respuestas a preguntas frecuentes
                </p>
              </Link>

              <Link to="/politica-privacidad" className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <h3 className="font-medium text-[#2a2827] mb-2">Política de Privacidad</h3>
                <p className="text-sm text-gray-600">
                  Información sobre cómo protegemos tus datos
                </p>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default GuiaUsuario; 
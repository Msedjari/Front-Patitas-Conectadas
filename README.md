# Patitas Conectadas 🐾

## Descripción
Patitas Conectadas es una plataforma web integral que conecta refugios de animales, organizaciones de rescate, adoptantes y amantes de los animales en un ecosistema unificado. Nuestra misión es agilizar el proceso de adopción de mascotas y crear una comunidad solidaria para el bienestar animal.

## Características Principales
- **🔒 Sistema de Autenticación Avanzado**: Cuentas de usuario seguras con experiencias personalizadas
- **🏠 Gestión de Refugios**: Perfiles completos e inventario de animales para organizaciones de rescate
- **👥 Red Comunitaria**: Conecta con grupos que comparten intereses comunes en el bienestar animal
- **📅 Planificación de Eventos**: Organiza y descubre eventos de adopción, recaudaciones y oportunidades de voluntariado
- **🔔 Notificaciones en Tiempo Real**: Mantente actualizado sobre solicitudes de adopción y actividades comunitarias
- **💬 Sistema de Mensajería Integrado**: Comunicación fluida entre refugios y potenciales adoptantes

## Stack Tecnológico
- **Frontend**: React 19 con TypeScript para código tipo-seguro
- **Build Tool**: Vite 6 para desarrollo rápido y builds optimizados
- **Styling**: Tailwind CSS con configuración de tema personalizada
- **State Management**: React Context API con hooks personalizados
- **Routing**: React Router v6 con rutas protegidas
- **Animations**: Framer Motion para transiciones fluidas de UI
- **Forms**: React Hook Form con validación Zod
- **Emojis**: Emoji Picker React para selección de emojis
- **Dates**: date-fns para manejo de fechas
- **HTTP Client**: Axios para peticiones HTTP
- **Icons**: React Icons para iconografía

## Dependencias Principales
```json
{
  "dependencies": {
    "axios": "^1.6.7",
    "date-fns": "^3.3.1",
    "emoji-picker-react": "^4.12.2",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-icons": "^5.5.0",
    "react-router-dom": "^6.22.2"
  }
}
```

## Dependencias de Desarrollo
```json
{
  "devDependencies": {
    "@eslint/js": "^9.21.0",
    "@types/react": "^19.0.10",
    "@types/react-dom": "^19.0.4",
    "@vitejs/plugin-react": "^4.3.4",
    "eslint": "^9.21.0",
    "eslint-plugin-react-hooks": "^5.1.0",
    "eslint-plugin-react-refresh": "^0.4.19",
    "globals": "^15.15.0",
    "typescript": "~5.7.2",
    "typescript-eslint": "^8.24.1",
    "vite": "^6.2.0"
  }
}
```

## Instalación

### Requisitos Previos
- Node.js (v16.0.0 o superior)
- npm o yarn

### Pasos de Instalación
1. Clonar el repositorio
   ```bash
   git clone https://github.com/Msedjari/patitas-conectadas.git
   cd patitas-conectadas
   ```

2. Instalar dependencias
   ```bash
   npm install
   # o
   yarn install
   ```

3. Configurar variables de entorno
   Crear un archivo `.env` en la raíz del proyecto:
   ```
   VITE_API_URL=tu_endpoint_api
   VITE_STORAGE_KEY=clave_almacenamiento_local
   ```

4. Iniciar el servidor de desarrollo
   ```bash
   npm run dev
   # o
   yarn dev
   ```
   La aplicación estará disponible en `http://localhost:5173/`

5. Construir para producción
   ```bash
   npm run build
   # o
   yarn build
   ```

## Estructura del Proyecto
```bash
├── public/ # Archivos estáticos
├── src/
│   ├── assets/ # Imágenes, fuentes y otros recursos
│   ├── components/ # Componentes UI reutilizables
│   │   ├── common/ # Componentes compartidos (botones, inputs, etc.)
│   │   ├── layout/ # Componentes de layout (Navbar, Footer, etc.)
│   │   └── features/ # Componentes específicos de funcionalidades
│   ├── context/ # Proveedores de contexto React
│   ├── hooks/ # Hooks personalizados de React
│   ├── pages/ # Páginas/rutas de la aplicación
│   ├── services/ # Integraciones con API
│   ├── styles/ # Estilos globales y configuración de Tailwind
│   ├── types/ # Definiciones de tipos TypeScript
│   ├── utils/ # Funciones de utilidad
│   ├── App.tsx # Componente principal de la aplicación
│   ├── main.tsx # Punto de entrada de la aplicación
│   └── vite-env.d.ts # Declaraciones de tipos de Vite
├── .eslintrc.json # Configuración de ESLint
├── .gitignore # Reglas de Git ignore
├── index.html # Punto de entrada HTML
├── package.json # Dependencias y scripts del proyecto
├── postcss.config.js # Configuración de PostCSS
├── tailwind.config.js # Configuración de Tailwind CSS
├── tsconfig.json # Configuración de TypeScript
└── vite.config.ts # Configuración de Vite
```

## Optimizaciones de Rendimiento
- Code-splitting para tiempos de carga inicial más rápidos
- Carga perezosa de componentes y rutas
- Estrategias optimizadas de carga y caché de assets
- Soporte para renderizado del lado del servidor (opcional)

## Mejores Prácticas
- Cobertura completa de pruebas con Vitest y React Testing Library
- Configuración estricta de TypeScript para verificación robusta de tipos
- Implementación de diseño responsive para todos los tamaños de pantalla
- Componentes UI accesibles siguiendo las directrices WCAG
- Soporte para internacionalización en múltiples idiomas

## Contribuir
¡Bienvenidas las contribuciones de la comunidad! Para contribuir:

1. Haz fork del repositorio
2. Crea tu rama de feature (`git checkout -b feature/amazing-feature`)
3. Haz commit de tus cambios (`git commit -m 'Add some amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

## Licencia
Este proyecto está licenciado bajo la Licencia MIT - ver el archivo LICENSE para más detalles.

## Contacto y Soporte
- **Desarrollador**: Msedjari
- **Repositorio del Proyecto**: [github.com/Msedjari/patitas-conectadas](https://github.com/Msedjari/Front-Patitas-Conectadas)

---

<p align="center">Made with ❤️ for animals everywhere</p>



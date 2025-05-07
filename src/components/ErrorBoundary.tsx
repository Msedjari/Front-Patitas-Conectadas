import React, { Component, ErrorInfo, ReactNode } from 'react';

/**
 * Componente Error Boundary para capturar errores en la aplicación
 * Evita que toda la aplicación falle por un error en un componente
 */
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Actualiza el estado para que el siguiente renderizado muestre la UI alternativa
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // También puedes registrar el error en un servicio de reporte de errores
    console.error('Error capturado por ErrorBoundary:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-[rgb(252, 255, 243)]">
          <div className="max-w-md p-6 bg-white rounded-lg shadow-md border border-red-200">
            <h2 className="text-xl font-semibold text-red-600 mb-4">Algo salió mal</h2>
            <p className="text-gray-700 mb-4">
              Lo sentimos, ha ocurrido un error en la aplicación. Intenta recargar la página.
            </p>
            {this.state.error && (
              <div className="p-3 bg-red-50 rounded mb-4 text-sm text-red-800 overflow-auto">
                {this.state.error.toString()}
              </div>
            )}
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#6cda84] text-white rounded hover:bg-[#5bc073] transition-colors"
            >
              Recargar página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 
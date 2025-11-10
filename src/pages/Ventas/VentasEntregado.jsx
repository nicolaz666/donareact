import { useState } from 'react';
import VentasService from '../../services/VentasService';

const BotonEntregado = ({ rowdata, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const actualizarEstado = async () => {
    setLoading(true);
    setError(null);

    try {
      // Usar el nuevo método de actualización parcial
      const response = await VentasService.actualizarEstadoVenta(
        rowdata.id,
        'entregado',
        new Date().toISOString()
      );

      console.log('Venta actualizada:', response);

      // Callback para actualizar la tabla o componente padre
      if (onUpdate) {
        onUpdate(response);
      }

      // Mostrar mensaje de éxito
      alert('Estado actualizado a "Entregado" exitosamente');

    } catch (err) {
      console.error('Error al actualizar el estado de la venta:', err);

      let errorMessage = 'No se pudo actualizar el estado';

      if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data.error) {
          errorMessage = err.response.data.error;
        } else {
          errorMessage = JSON.stringify(err.response.data);
        }
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = () => {
    if (window.confirm('¿Estás seguro de marcar esta venta como entregada?')) {
      actualizarEstado();
    }
  };

  // No mostrar el botón si ya está entregado
  if (rowdata.estado === 'entregado') {
    return (
      <div className="flex items-center justify-center my-2">
        <span className="px-8 py-4 bg-gray-500 text-white font-semibold text-lg rounded-lg">
          Ya Entregado
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center my-2">
      <button
        onClick={handleClick}
        className="px-8 py-4 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-semibold text-lg rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200 ease-in-out focus:outline-none focus:ring-4 focus:ring-green-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        disabled={loading}
      >
        {loading ? 'Actualizando...' : 'Marcar Entregado'}
      </button>

      {error && (
        <div className="text-red-500 mt-2 text-sm text-center max-w-xs">
          <strong>Error:</strong> {error}
        </div>
      )}
    </div>
  );
};

export default BotonEntregado;
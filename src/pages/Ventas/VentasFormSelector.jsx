import { useState, useEffect } from 'react';
import UnidadProductoService from '../../services/UnidadProductoService';

function VentasFormSelector({ productos = [], onAddProduct,refreshTrigger }) {
  const [tipoSeleccion, setTipoSeleccion] = useState('plantilla');
  const [unidadesDisponibles, setUnidadesDisponibles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedValue, setSelectedValue] = useState('');

  useEffect(() => {
    if (tipoSeleccion === 'unidad') {
      cargarUnidadesDisponibles();
    }
  }, [tipoSeleccion, refreshTrigger]);

  const cargarUnidadesDisponibles = async () => {
    setLoading(true);
    try {
      const todasLasUnidades = await UnidadProductoService.getAllUnidadProductos();
      const disponibles = todasLasUnidades.filter(u => u.estado === 'disponible');
      setUnidadesDisponibles(disponibles);
      console.log('✅ Unidades disponibles cargadas:', disponibles);
    } catch (error) {
      console.error('❌ Error cargando unidades:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSeleccion = (valor) => {
    if (!valor) return;

    if (tipoSeleccion === 'plantilla') {
      const productoSeleccionado = productos.find(p => p.id === Number(valor));
      console.log('📦 Plantilla seleccionada:', productoSeleccionado);
      onAddProduct(Number(valor), 'plantilla', productoSeleccionado);
    } else {
      const unidadSeleccionada = unidadesDisponibles.find(u => u.id === Number(valor));
      console.log('🔧 Unidad seleccionada:', unidadSeleccionada);
      onAddProduct(Number(valor), 'unidad', unidadSeleccionada);
    }

    // Resetear el select
    setSelectedValue('');
  };

  return (
    <div className="space-y-4 p-6 bg-gray-50 rounded-lg">
      <label className="block text-sm font-medium text-gray-700">
        Agregar Nuevo Producto
      </label>

      {/* Selector de tipo */}
      <div className="flex gap-2 mb-3">
        <button
          type="button"
          onClick={() => {
            setTipoSeleccion('plantilla');
            setSelectedValue('');
          }}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            tipoSeleccion === 'plantilla'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          📋 Plantilla de Producto
        </button>
        <button
          type="button"
          onClick={() => {
            setTipoSeleccion('unidad');
            setSelectedValue('');
          }}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            tipoSeleccion === 'unidad'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          🔧 Unidad Específica
        </button>
      </div>

      {/* Selector según el tipo */}
      <div className="flex gap-2">
        {tipoSeleccion === 'plantilla' ? (
          <select
            value={selectedValue}
            onChange={(e) => {
              setSelectedValue(e.target.value);
              handleSeleccion(e.target.value);
            }}
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2"
          >
            <option value="">
              Seleccionar una plantilla de Apero
            </option>
            {productos.map((product) => (
              <option key={product.id} value={product.id}>
                {`${product.tipo} - ${product.modelo} - $${Number(product.precio).toFixed(2)}`}
              </option>
            ))}
          </select>
        ) : (
          <select
            value={selectedValue}
            onChange={(e) => {
              setSelectedValue(e.target.value);
              handleSeleccion(e.target.value);
            }}
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2"
            disabled={loading}
          >
            <option value="">
              {loading ? 'Cargando unidades...' : 'Seleccionar una unidad disponible'}
            </option>
            {unidadesDisponibles.map((unidad) => (
              <option key={unidad.id} value={unidad.id}>
                {`${unidad.numeroSerie} - ${unidad.producto.tipo} - ${unidad.producto.modelo} - $${Number(unidad.producto.precio).toFixed(2)}`}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Información adicional */}
      {tipoSeleccion === 'unidad' && (
        <div className="flex items-center justify-between text-xs text-gray-600 bg-white p-3 rounded-md">
          <span>
            {unidadesDisponibles.length} unidad(es) disponible(s)
          </span>
          {loading && (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Cargando...
            </span>
          )}
        </div>
      )}

      {/* Demo: Mostrar productos disponibles */}
      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <h4 className="text-sm font-semibold text-blue-800 mb-2">📊 Estado actual:</h4>
        <div className="text-xs text-blue-700 space-y-1">
          <p>Tipo seleccionado: <strong>{tipoSeleccion === 'plantilla' ? 'Plantilla' : 'Unidad Específica'}</strong></p>
          <p>Plantillas disponibles: <strong>{productos.length}</strong></p>
          <p>Unidades disponibles: <strong>{unidadesDisponibles.length}</strong></p>
        </div>
      </div>
    </div>
  );
}

export default VentasFormSelector;
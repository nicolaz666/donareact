import { useState, useEffect } from 'react';
import VentasFormSelector from './VentasFormSelector';
import VentasFormList from './VentasFormList';
import VentasFormSummary from './VentasFormSummary';
import ProductoService from '../../services/ProductoService';
import ClienteService from '../../services/ClienteService';
import VentasService from '../../services/VentasService';
import AbonoService from '../../services/AbonoService';
import detalleVentasService from '../../services/detallleVentasService';


function VentasForm() {
  // Estados para datos estáticos y carga inicial
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Estados para datos del formulario
  const [ventaCliente, setVentaCliente] = useState('');
  const [fechaEntregaEstimada, setFechaEntregaEstimada] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [abono, setAbono] = useState(0);
  const [total, setTotal] = useState(0);
  const [comentarios, setComentarios] = useState('');

  // Estados para validaciones y mensajes
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  /**
   * Carga clientes y productos desde los servicios al montar el componente.
   */
  useEffect(() => {
    async function cargarDatos() {
      setLoading(true);
      setErrorMessage('');
      try {
        const [clientesData, productosData] = await Promise.all([
          ClienteService.getAllClientes(),
          ProductoService.getAllProductos(),
        ]);
        setClientes(clientesData);
        setProductos(productosData);
      } catch (error) {
        console.error('Error cargando datos:', error);
        setErrorMessage('Error al cargar los datos. Por favor, recarga la página.');
      } finally {
        setLoading(false);
      }
    }

    cargarDatos();
  }, []);

  /**
   * Actualiza el total de la venta cada vez que cambian los productos seleccionados.
   */
  useEffect(() => {
    const newTotal = selectedProducts.reduce(
      (acc, product) => acc + product.precio * product.quantity,
      0
    );
    setTotal(newTotal);

  }, [selectedProducts]);


  /**
   * Valida todos los campos del formulario
   */
  const validateForm = () => {
    const newErrors = {};

    // Validar cliente
    if (!ventaCliente.trim()) {
      newErrors.ventaCliente = 'Debe seleccionar un cliente';
    }

    // Validar fecha de entrega
    if (!fechaEntregaEstimada) {
      newErrors.fechaEntregaEstimada = 'Debe seleccionar una fecha de entrega';
    } else {
      const today = new Date();
      const selectedDate = new Date(fechaEntregaEstimada);
      today.setHours(0, 0, 0, 0);
      selectedDate.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        newErrors.fechaEntregaEstimada = 'La fecha de entrega no puede ser anterior a hoy';
      }
    }

    // Validar productos seleccionados
    if (selectedProducts.length === 0) {
      newErrors.selectedProducts = 'Debe agregar al menos un producto';
    }

    // Validar que todas las cantidades sean válidas
    const invalidQuantities = selectedProducts.filter(p => p.quantity <= 0);
    if (invalidQuantities.length > 0) {
      newErrors.quantities = 'Todas las cantidades deben ser mayores a 0';
    }

    // Validar abono
    if (abono < 0) {
      newErrors.abono = 'El abono no puede ser negativo';
    }
    if (abono > total) {
      newErrors.abono = 'El abono no puede ser mayor al total';
    }

    // Validar comentarios (opcional, pero con límite de caracteres)
    if (comentarios.length > 500) {
      newErrors.comentarios = 'Los comentarios no pueden exceder 500 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Limpia los mensajes de error y éxito
   */
  const clearMessages = () => {
    setErrorMessage('');
    setSuccessMessage('');
    setErrors({});
  };

  /**
   * Resetea el formulario a su estado inicial
   */
  const resetForm = () => {
    setVentaCliente('');
    setFechaEntregaEstimada('');
    setSelectedProducts([]);
    setAbono(0);
    setComentarios('');
    clearMessages();
  };

  // Muestra un mensaje mientras se cargan los datos
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Cargando datos...</p>
        </div>
      </div>
    );
  }

  // Muestra error si no se pudieron cargar los datos
  if (errorMessage && clientes.length === 0 && productos.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error al cargar datos</h3>
          <p className="text-red-700 mb-4">{errorMessage}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
          >
            Recargar página
          </button>
        </div>
      </div>
    );
  }

  /**
   * Agrega un producto a la lista de productos seleccionados.
   * Evita duplicados.
   */
  const handleAddProduct = (productId) => {
    const product = productos.find((p) => p.id === productId);
    if (product && !selectedProducts.find((p) => p.id === productId)) {
      setSelectedProducts((prev) => [...prev, { ...product, quantity: 1 }]);
      // Limpiar error de productos si existe
      if (errors.selectedProducts) {
        setErrors(prev => ({ ...prev, selectedProducts: '' }));
      }
    }
  };

  /**
   * Actualiza la cantidad de un producto seleccionado, asegurando mínimo 1.
   */
  const handleQuantityChange = (id, quantity) => {
    const numQuantity = Math.max(1, parseInt(quantity) || 1);
    setSelectedProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, quantity: numQuantity } : p
      )
    );
    // Limpiar error de cantidades si existe
    if (errors.quantities) {
      setErrors(prev => ({ ...prev, quantities: '' }));
    }
  };

  /**
   * Elimina un producto de la lista de seleccionados por su id.
   */
  const handleRemoveProduct = (id) => {
    setSelectedProducts((prev) => prev.filter((p) => p.id !== id));
  };

  /**
   * Maneja el cambio en el campo de abono con validación en tiempo real
   */
  const handleAbonoChange = (e) => {
    const value = parseFloat(e.target.value) || 0;
    setAbono(value);

    // Validación en tiempo real para el abono
    if (value < 0) {
      setErrors(prev => ({ ...prev, abono: 'El abono no puede ser negativo' }));
    } else if (value > total) {
      setErrors(prev => ({ ...prev, abono: 'El abono no puede ser mayor al total' }));
    } else {
      setErrors(prev => ({ ...prev, abono: '' }));
    }
  };

  /**
   * Maneja el envío del formulario: crea la venta y el abono asociados.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    clearMessages();

    // Validar formulario antes de enviar
    if (!validateForm()) {
      setErrorMessage('Por favor, corrige los errores antes de continuar.');
      return;
    }

    setSubmitting(true);

    try {
      // Buscar cliente por nombre para obtener su id
      const clienteSeleccionado = clientes.find(
        (cliente) => cliente.nombre === ventaCliente
      );
      const cliente_id = clienteSeleccionado?.id;

      if (!cliente_id) {
        throw new Error('Cliente no válido');
      }

      // Crear la venta
      const responseVenta = await VentasService.crearVenta({
        total,
        fecha_entrega_estimada: fechaEntregaEstimada,
        comentarios: comentarios.trim(),
        cliente_id,
        productos: selectedProducts.map(p => ({
          producto_id: p.id,
          cantidad: p.quantity,
          precio_unitario: p.precio
        }))
      });



      // Crear el abono asociado a la venta creada (solo si hay abono)
      if (abono > 0) {
        await AbonoService.crearAbono({
          monto_abonado: abono,
          venta: responseVenta.id,
        });
      }

      setSuccessMessage('¡Venta creada exitosamente!');
      const productos= selectedProducts.map(p => ({
          venta: responseVenta.id,
          producto_id: p.id,
          cantidad: p.quantity,
        }))


      productos.forEach(async (e)=>{

          await detalleVentasService.crearDetalleVenta(e)
      })

      resetForm();

      // Scroll al top para mostrar el mensaje de éxito
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (error) {
      console.error('Error creando la venta o abono:', error);
      setErrorMessage(
        error.message === 'Cliente no válido'
          ? 'Error: Cliente no válido'
          : 'Error al crear la venta. Por favor, inténtalo de nuevo.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Nueva Venta</h1>
          <p className="text-gray-600">Completa los datos para registrar una nueva venta</p>
        </div>

        {/* Mensajes de éxito y error */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
            <div className="text-green-600 mr-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-green-800 font-medium">{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
            <div className="text-red-600 mr-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <span className="text-red-800 font-medium">{errorMessage}</span>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-8 bg-white p-8 rounded-xl shadow-xl border border-gray-100"
        >
          {/* Información del Cliente y Fecha */}
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Información del Cliente
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="cliente"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Cliente *
                </label>
                <select
                  id="cliente"
                  value={ventaCliente}
                  onChange={(e) => {
                    setVentaCliente(e.target.value);
                    if (errors.ventaCliente) {
                      setErrors(prev => ({ ...prev, ventaCliente: '' }));
                    }
                  }}
                  className={`w-full rounded-lg border ${
                    errors.ventaCliente ? 'border-red-300' : 'border-gray-300'
                  } bg-white px-4 py-3 shadow-sm placeholder-gray-400
                           focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400 focus:outline-none transition-all`}
                >
                  <option value="" disabled>
                    Selecciona un cliente
                  </option>
                  {clientes.map((cliente) => (
                    <option key={cliente.id} value={cliente.nombre}>
                      {cliente.nombre}
                    </option>
                  ))}
                </select>
                {errors.ventaCliente && (
                  <p className="mt-1 text-sm text-red-600">{errors.ventaCliente}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="fecha_entrega"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Fecha de Entrega Estimada *
                </label>
                <input
                  id="fecha_entrega"
                  type="date"
                  value={fechaEntregaEstimada}
                  onChange={(e) => {
                    setFechaEntregaEstimada(e.target.value);
                    if (errors.fechaEntregaEstimada) {
                      setErrors(prev => ({ ...prev, fechaEntregaEstimada: '' }));
                    }
                  }}
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full rounded-lg border ${
                    errors.fechaEntregaEstimada ? 'border-red-300' : 'border-gray-300'
                  } bg-white px-4 py-3 shadow-sm
                           focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400 focus:outline-none transition-all`}
                />
                {errors.fechaEntregaEstimada && (
                  <p className="mt-1 text-sm text-red-600">{errors.fechaEntregaEstimada}</p>
                )}
              </div>
            </div>
          </div>

          {/* Selector de productos */}
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              Selección de Productos
            </h2>
            <VentasFormSelector productos={productos} onAddProduct={handleAddProduct} />
            {errors.selectedProducts && (
              <p className="mt-2 text-sm text-red-600">{errors.selectedProducts}</p>
            )}
          </div>

          {/* Lista de productos seleccionados */}
          {selectedProducts.length > 0 && (
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 4h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Productos Seleccionados ({selectedProducts.length})
              </h2>
              <VentasFormList
                products={selectedProducts}
                onQuantityChange={handleQuantityChange}
                onRemove={handleRemoveProduct}
              />
              {errors.quantities && (
                <p className="mt-2 text-sm text-red-600">{errors.quantities}</p>
              )}
            </div>
          )}

          {/* Abono y comentarios */}
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Detalles Adicionales
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="abono"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Abono (Opcional)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-500">$</span>
                  <input
                    id="abono"
                    type="number"
                    min="0"
                    max={total}
                    step="0.01"
                    value={abono}
                    onChange={handleAbonoChange}
                    className={`w-full pl-8 rounded-lg border ${
                      errors.abono ? 'border-red-300' : 'border-gray-300'
                    } bg-white px-4 py-3 shadow-sm
                             focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400 focus:outline-none transition-all`}
                    placeholder="0.00"
                  />
                </div>
                {errors.abono && (
                  <p className="mt-1 text-sm text-red-600">{errors.abono}</p>
                )}
                {total > 0 && (
                  <p className="mt-1 text-xs text-gray-500">
                    Máximo: ${total.toFixed(2)}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="comentarios"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Comentarios (Opcional)
                </label>
                <textarea
                  id="comentarios"
                  rows={3}
                  value={comentarios}
                  onChange={(e) => {
                    setComentarios(e.target.value);
                    if (errors.comentarios) {
                      setErrors(prev => ({ ...prev, comentarios: '' }));
                    }
                  }}
                  maxLength={500}
                  className={`w-full rounded-lg border ${
                    errors.comentarios ? 'border-red-300' : 'border-gray-300'
                  } bg-white px-4 py-3 shadow-sm resize-y
                           focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400 focus:outline-none transition-all`}
                  placeholder="Comentarios adicionales sobre la venta..."
                />
                <div className="flex justify-between mt-1">
                  {errors.comentarios && (
                    <p className="text-sm text-red-600">{errors.comentarios}</p>
                  )}
                  <p className="text-xs text-gray-500 ml-auto">
                    {comentarios.length}/500 caracteres
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Resumen de la venta */}
          {selectedProducts.length > 0 && (
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-lg border border-indigo-200">
              <VentasFormSummary products={selectedProducts} total={total} abono={abono} />
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-4 justify-end pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={resetForm}
              disabled={submitting}
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-300
                       text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:outline-none
                       focus:ring-2 focus:ring-gray-500 transition-all disabled:opacity-50
                       disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Limpiar Formulario
            </button>

            <button
              type="submit"
              disabled={submitting || selectedProducts.length === 0}
              className="inline-flex items-center justify-center bg-gradient-to-r from-indigo-600 to-blue-600
                       text-white font-semibold px-8 py-3 rounded-lg hover:from-indigo-700 hover:to-blue-700
                       focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200
                       disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl
                       transform hover:-translate-y-0.5"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creando Venta...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Crear Venta
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default VentasForm;
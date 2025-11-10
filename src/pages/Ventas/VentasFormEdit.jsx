import { useState } from 'react';
import AbonoService from '../../services/AbonoService';

function VentasFormEdit({ rowData, mostrarModal, cargarVentas }) {
  const [formData, setFormData] = useState({
    monto_abonado: '',
    metodo_pago: '',
    comentario: '',
    fecha_abono: new Date().toISOString().split('T')[0], // Fecha actual por defecto
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Preparar datos para enviar a la API
    const datosAbono = {
      monto_abonado: parseFloat(formData.monto_abonado),
      metodo_pago: formData.metodo_pago || null,
      comentario: formData.comentario || null,
      fecha_abono: new Date(formData.fecha_abono).toISOString(),
      venta: rowData.id
    };

    try {
      const response = await AbonoService.crearAbono(datosAbono);
      console.log('Abono creado exitosamente:', response);

      // Cerrar modal y recargar datos
      if (mostrarModal) mostrarModal(false);
      if (cargarVentas) cargarVentas();

      // Limpiar formulario
      setFormData({
        monto_abonado: '',
        metodo_pago: '',
        comentario: '',
        fecha_abono: new Date().toISOString().split('T')[0],
      });

    } catch (error) {
      console.error('Error al procesar el abono:', error);
      // Aquí podrías mostrar un mensaje de error al usuario
    } finally {
      setLoading(false);
    }
  };

  // Calcular el máximo abono posible (no puede ser mayor al saldo pendiente)
  const maxAbono = rowData?.debe || 0;

  return (
    <div className="max-w-md mx-auto mt-10 bg-white rounded-lg shadow-lg overflow-hidden">
      <header className="bg-gradient-to-r from-blue-500 to-purple-500 p-6 text-center">
        <h2 className="text-white text-xl font-semibold">REGISTRAR ABONO</h2>
        <p className="text-blue-100 text-sm mt-1">
          Venta #{rowData?.id} - Cliente: {rowData?.cliente?.nombre}
        </p>
        <p className="text-blue-100 text-xs mt-1">
          Saldo pendiente: ${new Intl.NumberFormat('es-CO').format(maxAbono)}
        </p>
      </header>

      <form className="p-6 space-y-6" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="monto_abonado" className="block text-gray-700 font-semibold mb-1">
            Monto del Abono *
          </label>
          <input
            id="monto_abonado"
            name="monto_abonado"
            type="number"
            step="0.01"
            min="0.01"
            max={maxAbono}
            placeholder="Ingrese monto de abono"
            value={formData.monto_abonado}
            onChange={handleChange}
            required
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-gray-400 text-xs mt-1">
            Máximo: ${new Intl.NumberFormat('es-CO').format(maxAbono)}
          </p>
        </div>

        <div>
          <label htmlFor="metodo_pago" className="block text-gray-700 font-semibold mb-1">
            Método de Pago
          </label>
          <select
            id="metodo_pago"
            name="metodo_pago"
            value={formData.metodo_pago}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Seleccione método de pago</option>
            <option value="Efectivo">Efectivo</option>
            <option value="Transferencia">Transferencia</option>
            <option value="Tarjeta de Crédito">Tarjeta de Crédito</option>
            <option value="Tarjeta de Débito">Tarjeta de Débito</option>
            <option value="Cheque">Cheque</option>
            <option value="PSE">PSE</option>
            <option value="Nequi">Nequi</option>
            <option value="Daviplata">Daviplata</option>
          </select>
          <p className="text-gray-400 text-xs mt-1">Opcional - Método utilizado para el pago</p>
        </div>

        <div>
          <label htmlFor="fecha_abono" className="block text-gray-700 font-semibold mb-1">
            Fecha del Abono *
          </label>
          <input
            id="fecha_abono"
            name="fecha_abono"
            type="date"
            value={formData.fecha_abono}
            onChange={handleChange}
            required
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-gray-400 text-xs mt-1">Fecha en que se realizó el abono</p>
        </div>

        <div>
          <label htmlFor="comentario" className="block text-gray-700 font-semibold mb-1">
            Comentario
          </label>
          <textarea
            id="comentario"
            name="comentario"
            rows="3"
            placeholder="Observaciones adicionales sobre el abono..."
            value={formData.comentario}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          ></textarea>
          <p className="text-gray-400 text-xs mt-1">Opcional - Notas adicionales</p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => mostrarModal && mostrarModal(false)}
            className="flex-1 py-2 bg-gray-500 text-white font-semibold rounded-md hover:bg-gray-600 transition"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex-1 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-md hover:opacity-90 transition disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Procesando...' : 'Registrar Abono'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default VentasFormEdit;
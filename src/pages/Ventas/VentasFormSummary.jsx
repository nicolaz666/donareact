function VentasFormSummary({ products, total, abono }) {
  // Calcular totales
  const subtotal = products.reduce((sum, product) => {
    const precio = Number(product.precio) || 0;
    const cantidad = Number(product.quantity) || 0;
    return sum + (precio * cantidad);
  }, 0);

  const abonoValor = Number(abono) || 0;
  const saldo = subtotal - abonoValor;

  // Calcular estadísticas adicionales
  const totalUnidades = products.reduce((sum, product) => {
    return sum + (Number(product.quantity) || 0);
  }, 0);

  const unidadesEspecificas = products.filter(p => p.tipo === 'unidad').length;
  const plantillas = products.filter(p => p.tipo === 'plantilla').length;

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm space-y-3">
      {/* Resumen de productos */}
      <div className="pb-3 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Resumen de Productos</h3>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="text-center p-2 bg-gray-50 rounded">
            <p className="text-gray-500">Total Items</p>
            <p className="text-lg font-bold text-gray-800">{products.length}</p>
          </div>
          <div className="text-center p-2 bg-indigo-50 rounded">
            <p className="text-gray-500">Plantillas</p>
            <p className="text-lg font-bold text-indigo-600">{plantillas}</p>
          </div>
          <div className="text-center p-2 bg-green-50 rounded">
            <p className="text-gray-500">Unidades</p>
            <p className="text-lg font-bold text-green-600">{unidadesEspecificas}</p>
          </div>
        </div>
        <div className="mt-2 text-center">
          <p className="text-xs text-gray-500">
            Total de unidades: <span className="font-semibold">{totalUnidades}</span>
          </p>
        </div>
      </div>

      {/* Cálculos financieros */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal:</span>
          <span className="font-medium">${subtotal.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Abono:</span>
          <span className="text-indigo-600 font-medium">-${abonoValor.toFixed(2)}</span>
        </div>

        {/* Saldo pendiente */}
        <div className={`flex justify-between font-semibold pt-2 border-t-2 ${
          saldo > 0 ? 'border-orange-200' : 'border-green-200'
        }`}>
          <span className="text-gray-700">Saldo Pendiente:</span>
          <span className={`text-lg ${
            saldo > 0 ? 'text-orange-600' : 'text-green-600'
          }`}>
            ${saldo.toFixed(2)}
          </span>
        </div>

        {/* Indicador de estado de pago */}
        {saldo <= 0 && abonoValor > 0 && (
          <div className="flex items-center justify-center gap-2 mt-2 p-2 bg-green-50 rounded-md">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 text-green-600" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path 
                fillRule="evenodd" 
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                clipRule="evenodd" 
              />
            </svg>
            <span className="text-sm font-medium text-green-700">Pago completo</span>
          </div>
        )}

        {saldo > 0 && (
          <div className="mt-2 p-2 bg-orange-50 rounded-md">
            <p className="text-xs text-orange-700 text-center">
              Pendiente de pago: <span className="font-semibold">{((saldo / subtotal) * 100).toFixed(1)}%</span>
            </p>
            <div className="mt-1 w-full bg-orange-200 rounded-full h-2">
              <div 
                className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((subtotal - saldo) / subtotal) * 100}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VentasFormSummary;
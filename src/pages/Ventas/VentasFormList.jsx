function VentasFormList({ products, onQuantityChange, onRemove }) {
  if (products.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        No Hay Productos Agregados
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {products.map((product) => {
        const esUnidad = product.tipo === 'unidad';

        return (
          <div
            key={product.id}
            className="flex items-center gap-3 bg-white p-3 rounded-xl shadow-sm border-l-4"
            style={{ borderLeftColor: esUnidad ? '#10b981' : '#6366f1' }}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                  esUnidad ? 'bg-green-100 text-green-700' : 'bg-indigo-100 text-indigo-700'
                }`}>
                  {esUnidad ? 'Unidad' : 'Plantilla'}
                </span>
                {esUnidad && product.numeroSerie && (
                  <span className="text-xs font-mono text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                    {product.numeroSerie}
                  </span>
                )}
              </div>
              <p className="text-sm font-semibold text-gray-900 truncate">
                {product.productoInfo?.tipo || product.nombre}
                {product.productoInfo?.modelo ? ` — ${product.productoInfo.modelo}` : ''}
              </p>
              {product.productoInfo?.colorPrincipal && (
                <p className="text-xs text-gray-400 truncate">
                  {product.productoInfo.colorPrincipal}
                  {product.productoInfo.colorTejido && product.productoInfo.colorTejido !== 'Sin color secundario'
                    ? ` / ${product.productoInfo.colorTejido}` : ''}
                </p>
              )}
              <p className="text-xs font-bold text-indigo-700 mt-1">
                ${((product.precio || 0) * product.quantity).toFixed(2)}
                <span className="text-gray-400 font-normal ml-1">(${Number(product.precio || 0).toFixed(2)} c/u)</span>
              </p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="flex flex-col items-center">
                <input
                  type="number"
                  min="1"
                  value={product.quantity}
                  onChange={(e) => onQuantityChange(product.id, parseInt(e.target.value) || 1)}
                  className={`w-16 px-2 py-1.5 border rounded-lg text-center text-sm font-medium ${
                    esUnidad ? 'bg-gray-100 cursor-not-allowed text-gray-400 border-gray-200' : 'bg-white border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:outline-none'
                  }`}
                  disabled={esUnidad}
                />
                {esUnidad && <span className="text-xs text-gray-400 mt-0.5">Fijo</span>}
              </div>

              <button
                onClick={() => onRemove(product.id)}
                className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                title="Eliminar"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default VentasFormList;
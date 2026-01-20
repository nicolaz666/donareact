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
        // Determinar si es una unidad específica o plantilla
        const esUnidad = product.tipo === 'unidad';
        const esPlantilla = product.tipo === 'plantilla';

        return (
          <div
            key={product.id}
            className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm border-l-4"
            style={{
              borderLeftColor: esUnidad ? '#10b981' : '#6366f1'
            }}
          >
            <div className="flex-1">
              {/* Badge indicador */}
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    esUnidad
                      ? 'bg-green-100 text-green-700'
                      : 'bg-indigo-100 text-indigo-700'
                  }`}
                >
                  {esUnidad ? 'Unidad Específica' : 'Plantilla'}
                </span>
              </div>

              {/* Información del producto */}
              <h4 className="font-medium">
                {product.productoInfo?.tipo || product.nombre} - {product.productoInfo?.modelo || ''}
              </h4>

              {/* Mostrar número de serie si es unidad */}
              {esUnidad && product.numeroSerie && (
                <p className="text-sm text-gray-600 font-mono">
                  Serie: {product.numeroSerie}
                </p>
              )}

              {/* Color principal */}
              {product.productoInfo?.colorPrincipal && (
                <p className="text-sm text-gray-500">
                  Color: {product.productoInfo.colorPrincipal}
                  {product.productoInfo.colorTejido && product.productoInfo.colorTejido !== 'Sin color secundario' && 
                    ` / ${product.productoInfo.colorTejido}`
                  }
                </p>
              )}

              {/* Subtotal */}
              <p className="text-sm text-gray-700 font-semibold mt-1">
                Subtotal: ${((product.precio || 0) * product.quantity).toFixed(2)}
              </p>
            </div>

            {/* Controles */}
            <div className="flex items-center space-x-4">
              {/* Input de cantidad - deshabilitado si es unidad específica */}
              <div className="flex flex-col items-center">
                <input
                  type="number"
                  min="1"
                  value={product.quantity}
                  onChange={(e) => onQuantityChange(product.id, parseInt(e.target.value) || 1)}
                  className={`w-20 px-2 py-1 border rounded-md text-center ${
                    esUnidad 
                      ? 'bg-gray-100 cursor-not-allowed' 
                      : 'bg-white'
                  }`}
                  disabled={esUnidad}
                />
                {esUnidad && (
                  <span className="text-xs text-gray-500 mt-1">Fijo</span>
                )}
              </div>

              {/* Precio unitario */}
              <div className="text-right min-w-[80px]">
                <p className="text-xs text-gray-500">Precio Unit.</p>
                <p className="text-sm font-medium">${Number(product.precio || 0).toFixed(2)}</p>
              </div>

              {/* Botón eliminar */}
              <button
                onClick={() => onRemove(product.id)}
                className="text-red-500 hover:text-red-600 hover:bg-red-50 p-2 rounded-md transition-colors"
                title="Eliminar producto"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" 
                    clipRule="evenodd" 
                  />
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
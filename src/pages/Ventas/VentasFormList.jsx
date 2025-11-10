// React import not required with the new JSX transform


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
      {products.map((product) => (
        <div
          key={product.id}
          className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm"
        >
          <div className="flex-1">
            <h4 className="font-medium">{product.tipo}</h4>
            <p className="text-sm text-gray-500">
              Subtotal: ${(product.precio* product.quantity).toFixed(2)}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <input
              type="number"
              min="1"
              value={product.quantity}
              onChange={(e) => onQuantityChange(product.id, parseInt(e.target.value) || 1)}
              className="w-20 px-2 py-1 border rounded-md"
            />
            <button
              onClick={() => onRemove(product.id)}
              className="text-red-500 hover:text-red-600"
            >
              eliminar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default VentasFormList
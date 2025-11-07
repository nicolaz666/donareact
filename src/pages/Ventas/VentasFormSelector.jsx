import React from 'react'

function VentasFormSelector({ productos, onAddProduct }){

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Agregar Producto</label>
      <div className="flex gap-2">
        <select
          onChange={(e) => {
            console.log(e.target.value);        // Aquí imprimes el valor seleccionado
            onAddProduct(Number(e.target.value)); // Y luego llamas a la función con el valor convertido a número
          }}
          className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          defaultValue=""
        >
          <option value="" disabled>Seleccionar un Producto</option>
          {productos.map((product) => (
            <option key={product.id} value={product.id}>

                {`${product.tipo} - $${Number(product.precio).toFixed(2)}`}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default VentasFormSelector
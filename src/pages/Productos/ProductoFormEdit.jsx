import {React, useState} from 'react'
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import ProductoService from '../../services/ProductoService';

function ProductoFormEdit({rowData, setRowDataEditar, cargarProductos, mostrarModal}) {

  const tipos = [
    { label: 'Producto', value: 'producto' },
    { label: 'Material', value: 'material' },
    { label: 'Ambos', value: 'ambos' },
  ];

  console.log(rowData)

  const handleSubmit = async(e) => {
    e.preventDefault();
    // Procesar el formulario
    try {

      const response = await ProductoService.actualizarProducto(rowData.id, rowData)
      console.log(response)
      const ProductosActualizadas = await ProductoService.getAllProductos()
      cargarProductos(ProductosActualizadas)

      mostrarModal(false)

    } catch (error) {
      console.log(error)
    }
  };


  return (
    <div>
        <div >
          <form onSubmit={handleSubmit}>
            <label htmlFor="precio" className="w-1/2 block text-900 font-medium mb-2">precio</label>
            <InputText id="precio" type="text" value={rowData.precio} onChange={(e) => setRowDataEditar({...rowData, precio: e.target.value})} className="w-full mb-3" />

            <div>
              <label htmlFor="Tipo" className="block text-900 font-medium mb-2">Tipo</label>
              <Dropdown
                id="Tipo"
                options={tipos}
                value={rowData.tipo}
                onChange={(e) => setRowDataEditar({...rowData, tipo: e.value})}
                placeholder="Seleccione un tipo"
                className="w-full mb-3"
              />
            </div>

            <Button type="submit" label="Registrar" className="mt-4" />
          </form>
        </div>
     </div>
  )
}

export default ProductoFormEdit
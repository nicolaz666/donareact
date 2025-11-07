import {React, useState} from 'react'
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import CategoriaService from '../../services/CategoriaService';

function CategoriaFormEdit({rowData, setRowDataEditar, cargarCategorias, mostrarModal}) {

  const tipos = [
    { label: 'Producto', value: 'producto' },
    { label: 'Material', value: 'material' },
    { label: 'Ambos', value: 'ambos' },
  ];

  const handleSubmit = async(e) => {
    e.preventDefault();
    // Procesar el formulario
    try {

      const response = await CategoriaService.actualizarCategoria(rowData.id, rowData)
      const categoriasActualizadas = await CategoriaService.getAllCategorias()
      cargarCategorias(categoriasActualizadas)
      console.log(response)
      mostrarModal(false)

    } catch (error) {
      console.log(error)
    }
  };


  return (
    <div>
        <div >
          <form onSubmit={handleSubmit}>
            <label htmlFor="Nombre" className="w-1/2 block text-900 font-medium mb-2">Nombre</label>
            <InputText id="Nombre" type="text" value={rowData.nombre} onChange={(e) => setRowDataEditar({...rowData, nombre: e.target.value})} className="w-full mb-3" />

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

export default CategoriaFormEdit
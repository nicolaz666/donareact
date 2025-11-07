import {React, useState} from 'react'
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import CategoriaService from '../../services/CategoriaService';

const CategoriaForm = ({mostrarModal, cargarCategorias}) => {

  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState(null);

  const tipos = [
    { label: 'Producto', value: 'producto' },
    { label: 'Material', value: 'material' },
    { label: 'Ambos', value: 'ambos' },
  ];

  const handleSubmit = async(e) => {
    e.preventDefault();
    // Procesar el formulario
    try {

      const categoria = {nombre, tipo}
      await CategoriaService.crearCategoria(categoria)
      const categoriasActualizadas = await CategoriaService.getAllCategorias()
      cargarCategorias(categoriasActualizadas)
      setNombre('');
      setTipo(null);
      console.log("Formulario enviado")
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
            <InputText id="Nombre" type="text" placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-full mb-3" />

            <div>
              <label htmlFor="Tipo" className="block text-900 font-medium mb-2">Tipo</label>
              <Dropdown
                id="Tipo"
                options={tipos}
                value={tipo}
                onChange={(e) => setTipo(e.value)}
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

export default CategoriaForm
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import ProductoService from '../../services/ProductoService';

const TIPOS = ['Tejido', 'Rejo', 'Plano', 'Sencillo'].map(t => ({ label: t, value: t }));

function ProductoFormEdit({ rowData, setRowDataEditar, cargarProductos, mostrarModal }) {

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        tipo:            rowData.tipo,
        modelo:          rowData.modelo,
        precio:          Number(rowData.precio),
        colorPrincipal:  rowData.colorPrincipal,
        colorTejido:     rowData.colorTejido,
        colorCordon1:    rowData.colorCordon1 || null,
        colorCordon2:    rowData.colorCordon2 || null,
        colorSogaRienda: rowData.colorSogaRienda,
        colorManzanos:   rowData.colorManzanos,
        colorCoronas:    rowData.colorCoronas,
        observaciones:   rowData.observaciones || 'No hay Observaciones',
        categoria_id:    rowData.categoria?.id ?? rowData.categoria_id,
      };

      await ProductoService.actualizarProducto(rowData.id, payload);
      const actualizados = await ProductoService.getAllProductos();
      cargarProductos(actualizados);
      mostrarModal(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label htmlFor="precio" className="w-1/2 block text-900 font-medium mb-2">Precio</label>
        <InputText
          id="precio" type="text" value={rowData.precio}
          onChange={(e) => setRowDataEditar({ ...rowData, precio: e.target.value })}
          className="w-full mb-3"
        />

        <div>
          <label htmlFor="Tipo" className="block text-900 font-medium mb-2">Tipo</label>
          <Dropdown
            id="Tipo"
            options={TIPOS}
            value={rowData.tipo}
            onChange={(e) => setRowDataEditar({ ...rowData, tipo: e.value })}
            placeholder="Seleccione un tipo"
            className="w-full mb-3"
          />
        </div>

        <Button type="submit" label="Guardar cambios" className="mt-4" />
      </form>
    </div>
  );
}

export default ProductoFormEdit;

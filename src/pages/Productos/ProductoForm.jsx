
import { useState, useEffect } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import ProductoService from '../../services/ProductoService';
import CategoriaService from '../../services/CategoriaService'

const ProductoForm = ({ mostrarModal, cargarProductos }) => {

  const [tipo, setTipo] = useState(null);
  const [modelo, setModelo] = useState(null);
  const [precio, setPrecio] = useState(0);
  const [colorPrincipal, setColorPrincipal] = useState(null);
  const [colorTejido, setColorTejido] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [categoria_id, setCategoria] = useState({});

  const [categoriaApi, setCategoriaApi] = useState([]);

  const tipos = [
    { label: 'Tejido', value: 'Tejido' },
    { label: 'Rejo', value: 'Rejo' },
    { label: 'Plano', value: 'Plano' },
    { label: 'Sencillo', value: 'Sencillo' },
  ];

  const modelos = [
    { label: '4 Tonillos', value: '4 Tonillos' },
    { label: 'Clasico', value: 'Clasico' },
    { label: 'Charol', value: 'Charol' },
    { label: '6 Tornillos', value: '6 Tornillos' },
  ];

  const coloresPrincipales = [
    { label: 'Negro', value: 'Negro' },
    { label: 'Roble', value: 'Roble' },
    { label: 'Crudo', value: 'Crudo' },
    { label: 'Chocolate', value: 'Chocolate' },
    { label: 'Envejecido', value: 'Envejecido' },
  ];

  const coloresSecundarios = [
    { label: 'Negro', value: 'Negro' },
    { label: 'Crudo Blanco', value: 'Crudo Blanco' },
    { label: 'Crudo Crema', value: 'Crudo Crema' },
    { label: 'Rojo', value: 'Rojo' },
    { label: 'Azul Rey', value: 'Azul Rey' },
    { label: 'Amarillo', value: 'Negro' },
    { label: 'Verde Manzana', value: 'Verde Manzana' },
    { label: 'Azul Celeste', value: 'Azul Celeste' },
    { label: 'Azul Claro', value: 'Azul Claro' },
    { label: 'Naranja', value: 'Naranja' },
    { label: 'Mandarina', value: 'Mandarina' },
    { label: 'Verde Militar', value: 'Verde Militar' },
  ];


  const cargarCategorias = async () => {
    try {
      const response = await CategoriaService.getAllCategorias();
        const categoriasTransformadas = response.map(categoria => ({
            label: categoria.nombre, // Ajusta según tu API
            value: categoria.id,    // Ajusta según tu API
        }));
        setCategoriaApi(categoriasTransformadas);
    } catch (error) {
      console.error("Error al cargar categorías:", error);
    }

  };

  useEffect(() => {
    cargarCategorias();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {

      // Variable intermedia para garantizar el valor correcto
        const observacionesFinal =
        observaciones === null || observaciones === ""
        ? "No hay Observaciones"
        : observaciones;

      const producto = {
        tipo,
        modelo,
        precio: Number(precio),
        colorPrincipal,
        colorTejido,
        observaciones: observacionesFinal, // Usamos la variable garantizada
        categoria_id,
      };


      await ProductoService.crearProducto(producto);
      const productosActualizadas = await ProductoService.getAllProductos();
      cargarProductos(productosActualizadas);
      setTipo(null);
      setModelo(null);
      setPrecio(0);
      setColorPrincipal(null);
      setColorTejido('');
      setObservaciones('');
      setCategoria(null);
      console.log('Formulario enviado');
      mostrarModal(false);
    } catch (error) {
      console.log(error);
    }
  };



  return (
    <div>
      <div>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="Categoria" className="block text-900 font-medium mb-2">
              Categoría
            </label>
            <Dropdown
              id="Categoria"
              options={categoriaApi}
              value={categoria_id}
              onChange={(e) => setCategoria(e.value)}
              placeholder="Seleccione una categoría"
              className="w-full mb-3"
            />
          </div>
          <div>
            <label htmlFor="Tipo" className="block text-900 font-medium mb-2">
              Tipo
            </label>
            <Dropdown
              id="Tipo"
              options={tipos}
              value={tipo}
              onChange={(e) => setTipo(e.value)}
              placeholder="Seleccione un tipo"
              className="w-full mb-3"
            />
          </div>

          <div>
            <label htmlFor="Modelo" className="block text-900 font-medium mb-2">
              Modelo
            </label>
            <Dropdown
              id="Modelo"
              options={modelos}
              value={modelo}
              onChange={(e) => setModelo(e.value)}
              placeholder="Seleccione un modelo"
              className="w-full mb-3"
            />
          </div>

          <div>
            <label htmlFor="Precio" className="block text-900 font-medium mb-2">
              Precio
            </label>
            <InputText
              id="Precio"
              type="number"
              placeholder="Precio"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              className="w-full mb-3"
            />
          </div>

          <div>
            <label htmlFor="ColorPrincipal" className="block text-900 font-medium mb-2">
              Color Principal
            </label>
            <Dropdown
              id="ColorPrincipal"
              options={coloresPrincipales}
              value={colorPrincipal}
              onChange={(e) => setColorPrincipal(e.value)}
              placeholder="Seleccione un color principal"
              className="w-full mb-3"
            />
          </div>

          <div>
            <label htmlFor="ColorTejido" className="block text-900 font-medium mb-2">
              Color Tejido
            </label>
            <Dropdown
              id="ColorTejido"
              options={coloresSecundarios}
              placeholder="Color Tejido"
              value={colorTejido}
              onChange={(e) => setColorTejido(e.target.value)}
              className="w-full mb-3"
            />
          </div>

          <div>
            <label htmlFor="Observaciones" className="block text-900 font-medium mb-2">
              Observaciones
            </label>
            <InputText
              id="Observaciones"
              type="text"
              placeholder="Observaciones"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              className="w-full mb-3"
            />
          </div>
          <Button type="submit" label="Registrar" className="mt-4" />
        </form>
      </div>
    </div>
  );
};

export default ProductoForm;
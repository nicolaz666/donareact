import { useState, useEffect } from "react";
import ProductoService from "../../services/ProductoService";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import Acciones from "../../components/uiButtons/Acciones"
import HeaderTable from "../../components/uiButtons/HeaderTable";
import { Dialog } from 'primereact/dialog';
import ProductoForm from "./ProductoForm";
import ProductoFormEdit from "./ProductoFormEdit"
import { Button } from 'primereact/button';
import UnidadProducto from '../UnidadProducto/UnidadProducto';
import CrearUnidadProducto from "../UnidadProducto/CrearUnidadProducto";

const ProductoTable = ()=>{

  const [Productos, setProductos] = useState([]);
  const [rowDataEditar, setRowDataEditar] = useState(null);
  const [productoCrearUnidad, setProductoCrearUnidad] = useState(null);

  const [mostrarModal, setMostrarModal] = useState(false)
  const [mostrarModalEditar, setMostrarModalEditar] = useState(false)
  const [mostrarModalUnidades, setMostrarModalUnidades] = useState(false)
  const [mostrarModalCrearUnidad, setMostrarModalCrearUnidad] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)

  const cargarProductos = async () =>{
    const response = await ProductoService.getAllProductos();
    setProductos(response)
  }

  useEffect(() => {
    cargarProductos()
  }, [])

  const eliminarProducto =  async(id)=>{
      const response = await ProductoService.eliminarProducto(id);
      cargarProductos()
      console.log(response)
  }


  return (
    <div className="card">

      
      <DataTable  value={Productos} paginator rows={5}  header={<HeaderTable nombre="Producto" mostrarModal={setMostrarModal}   />} resizableColumns showGridlines tableStyle={{ minWidth: '50rem' }}>
        <Column field="id" header="ID" />
        <Column field="categoria.nombre" header="categoria" />
        <Column field="tipo" header="Tipo" />
        <Column field="modelo" header="modelo" />
        <Column field="precio" header="precio" />
        <Column field="colorPrincipal" header="Color Principal" />
        <Column field="colorTejido" header="Color Tejido" />
        <Column
          header="Crear Unidad"
          body={(rowData) => (
            <Button
              label="Crear Unidad"
              size="small"
              severity="success"
              onClick={() => {
                setProductoCrearUnidad(rowData);
                setMostrarModalCrearUnidad(true);
              }}
            />
          )}
        />
        <Column header="Unidades" body={(rowData) => (
          <Button
            label="Ver Unidades"
            size="small"
            severity="info"
            onClick={() => { setSelectedProduct(rowData); setMostrarModalUnidades(true); }}
          />
        )} />
        <Column header="Acciones"   body={(rowData) => <Acciones rowData={rowData} setRowData={setRowDataEditar} mostrarModal={setMostrarModalEditar} eliminar={eliminarProducto} />} />
      </DataTable>

      

      <Dialog
        header="Agregar Producto"
        visible={mostrarModal}
        onHide={() => setMostrarModal(false)}
        breakpoints={{'960px': '75vw','640px': '90vw'}}
        style={{width: '50vw'}}
        contentStyle={{ maxHeight: '70vh', overflowY: 'auto' }}
      >
        {<ProductoForm mostrarModal={setMostrarModal} cargarProductos={cargarProductos} />}
      </Dialog>

      <Dialog
        header="EditarProducto"
        visible={mostrarModalEditar}
        onHide={() => setMostrarModalEditar(false)}
        breakpoints={{'960px': '75vw','640px': '90vw'}}
        style={{width: '50vw'}}
        contentStyle={{ maxHeight: '70vh', overflowY: 'auto' }}
      >
        {<ProductoFormEdit rowData={rowDataEditar} setRowDataEditar={setRowDataEditar} cargarProductos={cargarProductos} mostrarModal={setMostrarModalEditar}/>}
      </Dialog>

      <UnidadProducto
        visible={mostrarModalUnidades}
        onHide={() => { setMostrarModalUnidades(false); setSelectedProduct(null); }}
        producto={selectedProduct}
      />

     <Dialog
      header="Crear Unidad de Producto"
      visible={mostrarModalCrearUnidad}
      onHide={() => {
        setMostrarModalCrearUnidad(false);
        setProductoCrearUnidad(null);
      }}
      breakpoints={{ '960px': '75vw', '640px': '90vw' }}
      style={{ width: '40vw' }}
    >
      {productoCrearUnidad && (
        <CrearUnidadProducto
          producto={productoCrearUnidad}
          onSuccess={() => {
            setMostrarModalCrearUnidad(false);
            setProductoCrearUnidad(null);
          }}
        />
      )}
    </Dialog>

    </div>
  )

}

export default ProductoTable;
import { React, useState, useEffect } from "react";
import CategoriaService from "../../services/CategoriaService";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import Acciones from "../../components/uiButtons/Acciones";
import HeaderTable from "../../components/uiButtons/HeaderTable";
import { Dialog } from 'primereact/dialog';
import CategoriaForm from "./CategoriaForm";
import CategoriaFormEdit from "./CategoriaFormEdit";

const CategoriaTable = () => {

  const [categorias, setCategorias] = useState([]);
  const [rowDataEditar, setRowDataEditar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarModalEditar, setMostrarModalEditar] = useState(false);

  const cargarCategorias = async () => {
    try {
      setLoading(true);
      const response = await CategoriaService.getAllCategorias();
      setCategorias(response);
    } catch (error) {
      console.error("Error al cargar categorías:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarCategorias();
  }, []);

  const eliminar = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar esta categoría?")) {
      try {
        const response = await CategoriaService.eliminarCategoria(id);
        cargarCategorias();
        console.log(response);
      } catch (error) {
        console.error("Error al eliminar la categoría:", error);
      }
    }
  };

  return (
    <div className="card">
      <DataTable
        value={categorias}
        paginator
        rows={5}
        header={<HeaderTable nombre="Categoria" mostrarModal={setMostrarModal} />}
        resizableColumns
        showGridlines
        tableStyle={{ minWidth: '50rem' }}
        loading={loading}
        rowClassName={(data, index) => `row-${index}`}
        sortMode="single"
        scrollable
      >
        <Column field="id" header="ID" sortable />
        <Column field="nombre" header="Nombre" sortable />
        <Column header="Acciones" body={(rowData) => <Acciones rowData={rowData} setRowData={setRowDataEditar} mostrarModal={setMostrarModalEditar} eliminar={eliminar} />} />
      </DataTable>

      <Dialog
        header="Agregar Categoria"
        visible={mostrarModal}
        onHide={() => setMostrarModal(false)}
        breakpoints={{ '960px': '75vw', '640px': '90vw' }}
        style={{ width: '50vw' }}
        contentStyle={{ maxHeight: '70vh', overflowY: 'auto' }}
      >
        {<CategoriaForm mostrarModal={setMostrarModal} cargarCategorias={cargarCategorias} />}
      </Dialog>

      <Dialog
        header="Editar Categoria"
        visible={mostrarModalEditar}
        onHide={() => setMostrarModalEditar(false)}
        breakpoints={{ '960px': '75vw', '640px': '90vw' }}
        style={{ width: '50vw' }}
        contentStyle={{ maxHeight: '70vh', overflowY: 'auto' }}
      >
        {<CategoriaFormEdit rowData={rowDataEditar} setRowDataEditar={setRowDataEditar} cargarCategorias={cargarCategorias} mostrarModal={setMostrarModalEditar} />}
      </Dialog>
    </div>
  );
};

export default CategoriaTable;
import { useState, useEffect } from "react";
import CategoriaService from "../../services/CategoriaService";
import { Dialog } from 'primereact/dialog';
import CategoriaForm from "./CategoriaForm";
import CategoriaFormEdit from "./CategoriaFormEdit";
import { ResponsiveTableWrapper, ActionButtons, CardItem } from "../../components/ui/table";

const ROWS_PER_PAGE = 8;

const CategoriaTable = () => {
  const [categorias, setCategorias] = useState([]);
  const [rowDataEditar, setRowDataEditar] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarModalEditar, setMostrarModalEditar] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const cargarCategorias = async () => {
    try {
      const response = await CategoriaService.getAllCategorias();
      setCategorias(response);
    } catch (error) {
      console.error("Error al cargar categorías:", error);
    }
  };

  useEffect(() => { cargarCategorias(); }, []);

  const eliminar = async (id) => {
    try {
      await CategoriaService.eliminarCategoria(id);
      setDeleteConfirmId(null);
      cargarCategorias();
    } catch (error) {
      console.error("Error al eliminar la categoría:", error);
    }
  };

  const filtered = categorias.filter(c =>
    c.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(c.id).includes(searchTerm)
  );

  const totalPages = Math.ceil(filtered.length / ROWS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ROWS_PER_PAGE, currentPage * ROWS_PER_PAGE);

  const handleSearch = (val) => { setSearchTerm(val); setCurrentPage(1); };

  const columns = [
    {
      key: "id", header: "ID",
      render: r => <span style={{ fontSize: "12px", color: "#94a3b8", fontVariantNumeric: "tabular-nums" }}>#{r.id}</span>,
    },
    {
      key: "nombre", header: "Nombre",
      render: r => <span style={{ fontWeight: 600, fontSize: "13.5px", color: "#0f172a" }}>{r.nombre}</span>,
    },
    {
      key: "acciones", header: "Acciones",
      render: r => (
        <ActionButtons
          rowId={r.id}
          confirmId={deleteConfirmId}
          onConfirm={(id) => eliminar(id)}
          onCancelConfirm={() => setDeleteConfirmId(null)}
          actions={[
            { type: "edit", onClick: () => { setRowDataEditar(r); setMostrarModalEditar(true); } },
            { type: "delete", onClick: () => setDeleteConfirmId(r.id) },
          ]}
        />
      ),
    },
  ];

  const renderCard = (row) => (
    <CardItem
      title={row.nombre}
      metaLabel={`#${row.id}`}
      isHighlighted={deleteConfirmId === row.id}
      actions={
        <ActionButtons
          variant="full"
          rowId={row.id}
          confirmId={deleteConfirmId}
          onConfirm={(id) => eliminar(id)}
          onCancelConfirm={() => setDeleteConfirmId(null)}
          actions={[
            { type: "edit", onClick: () => { setRowDataEditar(row); setMostrarModalEditar(true); } },
            { type: "delete", onClick: () => setDeleteConfirmId(row.id) },
          ]}
        />
      }
    />
  );

  return (
    <div>
      <ResponsiveTableWrapper
        title="Categorías"
        addLabel="Nueva Categoría"
        onAdd={() => setMostrarModal(true)}
        countLabel="categorías registradas"
        searchValue={searchTerm}
        onSearchChange={handleSearch}
        searchPlaceholder="Buscar por nombre o ID..."
        rows={paginated}
        allRows={filtered}
        keyField="id"
        columns={columns}
        renderCard={renderCard}
        emptyMessage="No se encontraron categorías"
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        highlightRow={r => deleteConfirmId === r.id}
      />

      <Dialog
        header="Agregar Categoria"
        visible={mostrarModal}
        onHide={() => setMostrarModal(false)}
        breakpoints={{ '960px': '75vw', '640px': '90vw' }}
        style={{ width: '50vw' }}
        contentStyle={{ maxHeight: '70vh', overflowY: 'auto' }}
      >
        <CategoriaForm mostrarModal={setMostrarModal} cargarCategorias={cargarCategorias} />
      </Dialog>

      <Dialog
        header="Editar Categoria"
        visible={mostrarModalEditar}
        onHide={() => setMostrarModalEditar(false)}
        breakpoints={{ '960px': '75vw', '640px': '90vw' }}
        style={{ width: '50vw' }}
        contentStyle={{ maxHeight: '70vh', overflowY: 'auto' }}
      >
        <CategoriaFormEdit
          rowData={rowDataEditar}
          setRowDataEditar={setRowDataEditar}
          cargarCategorias={cargarCategorias}
          mostrarModal={setMostrarModalEditar}
        />
      </Dialog>
    </div>
  );
};

export default CategoriaTable;

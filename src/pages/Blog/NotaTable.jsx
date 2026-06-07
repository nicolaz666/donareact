import { useState, useEffect } from "react";
import { Dialog } from 'primereact/dialog';
import { Images } from 'lucide-react';
import NotaService from "../../services/NotaService";
import NotaForm from "./NotaForm";
import NotaFormEdit from "./NotaFormEdit";
import NotaImagenesModal from "./NotaImagenesModal";
import { ResponsiveTableWrapper, ActionButtons, CardItem, StatusBadge } from "../../components/ui/table";

const ROWS_PER_PAGE = 8;

const getImageUrl = (imagen) => {
  if (!imagen) return null;
  if (/^https?:\/\//i.test(imagen)) return imagen;
  return null;
};

const Miniatura = ({ nota }) => {
  const principal = nota.imagenes?.find((i) => i.es_principal) ?? nota.imagenes?.[0];
  if (principal) {
    return (
      <img
        src={getImageUrl(principal.imagen)}
        alt={nota.titulo}
        style={{ width: "54px", height: "54px", borderRadius: "10px", objectFit: "cover", flexShrink: 0 }}
      />
    );
  }
  return (
    <div style={{
      width: "54px", height: "54px", borderRadius: "10px",
      background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
    }}>
      <Images size={18} color="#94a3b8" />
    </div>
  );
};

const NotaTable = () => {
  const [notas, setNotas] = useState([]);
  const [rowDataEditar, setRowDataEditar] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarModalEditar, setMostrarModalEditar] = useState(false);
  const [modalImagenes, setModalImagenes] = useState({ visible: false, nota: null });
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const cargarNotas = async () => {
    try {
      const response = await NotaService.getAllNotas();
      setNotas(response);
    } catch (error) {
      console.error("Error al cargar las notas:", error);
    }
  };

  useEffect(() => { cargarNotas(); }, []);

  const eliminar = async (id) => {
    try {
      await NotaService.eliminarNota(id);
      setDeleteConfirmId(null);
      cargarNotas();
    } catch (error) {
      console.error("Error al eliminar la nota:", error);
    }
  };

  const filtered = notas.filter(n =>
    n.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(n.id).includes(searchTerm)
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
      key: "miniatura", header: "",
      render: r => <Miniatura nota={r} />,
    },
    {
      key: "titulo", header: "Título",
      render: r => (
        <div>
          <div style={{ fontWeight: 600, fontSize: "13.5px", color: "#0f172a" }}>{r.titulo}</div>
          {r.descripcion && (
            <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px", maxWidth: "320px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {r.descripcion}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "imagenes", header: "Imágenes",
      render: r => <span style={{ fontSize: "12px", color: "#64748b" }}>{r.imagenes?.length ?? 0}/3</span>,
    },
    {
      key: "estado", header: "Estado",
      render: r => <StatusBadge value={r.publicado ? 'publicado' : 'borrador'} />,
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
            { type: "view", label: "Imágenes", onClick: () => setModalImagenes({ visible: true, nota: r }) },
            { type: "edit", onClick: () => { setRowDataEditar(r); setMostrarModalEditar(true); } },
            { type: "delete", onClick: () => setDeleteConfirmId(r.id) },
          ]}
        />
      ),
    },
  ];

  const renderCard = (row) => (
    <CardItem
      image={<Miniatura nota={row} />}
      title={row.titulo}
      subtitle={row.descripcion}
      metaLabel={`#${row.id}`}
      isHighlighted={deleteConfirmId === row.id}
      badges={[
        <StatusBadge key="estado" value={row.publicado ? 'publicado' : 'borrador'} />,
        <span key="imgs" style={{ fontSize: "11px", color: "#94a3b8" }}>{row.imagenes?.length ?? 0}/3 imágenes</span>,
      ]}
      actions={
        <ActionButtons
          variant="full"
          rowId={row.id}
          confirmId={deleteConfirmId}
          onConfirm={(id) => eliminar(id)}
          onCancelConfirm={() => setDeleteConfirmId(null)}
          actions={[
            { type: "view", label: "Imágenes", onClick: () => setModalImagenes({ visible: true, nota: row }) },
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
        title="Blog"
        addLabel="Nuevo Post"
        onAdd={() => setMostrarModal(true)}
        countLabel="posts registrados"
        searchValue={searchTerm}
        onSearchChange={handleSearch}
        searchPlaceholder="Buscar por título o ID..."
        rows={paginated}
        allRows={filtered}
        keyField="id"
        columns={columns}
        renderCard={renderCard}
        emptyMessage="No se encontraron posts"
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        highlightRow={r => deleteConfirmId === r.id}
      />

      <Dialog
        header="Nuevo Post"
        visible={mostrarModal}
        onHide={() => setMostrarModal(false)}
        breakpoints={{ '960px': '75vw', '640px': '90vw' }}
        style={{ width: '50vw' }}
        contentStyle={{ maxHeight: '70vh', overflowY: 'auto' }}
      >
        <NotaForm mostrarModal={setMostrarModal} cargarNotas={cargarNotas} />
      </Dialog>

      <Dialog
        header="Editar Post"
        visible={mostrarModalEditar}
        onHide={() => setMostrarModalEditar(false)}
        breakpoints={{ '960px': '75vw', '640px': '90vw' }}
        style={{ width: '50vw' }}
        contentStyle={{ maxHeight: '70vh', overflowY: 'auto' }}
      >
        {rowDataEditar && (
          <NotaFormEdit
            rowData={rowDataEditar}
            setRowDataEditar={setRowDataEditar}
            cargarNotas={cargarNotas}
            mostrarModal={setMostrarModalEditar}
          />
        )}
      </Dialog>

      <NotaImagenesModal
        visible={modalImagenes.visible}
        onHide={() => setModalImagenes({ visible: false, nota: null })}
        nota={modalImagenes.nota}
        onImagenesActualizadas={cargarNotas}
      />
    </div>
  );
};

export default NotaTable;

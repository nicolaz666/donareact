import { useState, useEffect, useCallback, useMemo } from "react";
import CategoriaService from "../../services/CategoriaService";
import { Dialog } from "primereact/dialog";
import CategoriaForm from "./CategoriaForm";
import CategoriaFormEdit from "./CategoriaFormEdit";

import {
  ResponsiveTableWrapper,
  CardItem,
  ActionButtons,
  StatusBadge,
  tokens,
} from "../../components/ui/table";

const ROWS_PER_PAGE = 8;

export default function CategoriaTable() {
  const [categorias, setCategorias]         = useState([]);
  const [loading, setLoading]               = useState(true);
  const [search, setSearch]                 = useState("");
  const [page, setPage]                     = useState(1);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const [modalCrear, setModalCrear]         = useState(false);
  const [modalEditar, setModalEditar]       = useState(false);
  const [rowEditar, setRowEditar]           = useState(null);

  const cargarCategorias = useCallback(async () => {
    try {
      setLoading(true);
      const data = await CategoriaService.getAllCategorias();
      setCategorias(Array.isArray(data) ? data : []);
    } catch (e) { console.error("Error al cargar categorías:", e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { cargarCategorias(); }, [cargarCategorias]);

  const eliminar = useCallback(async (id) => {
    try {
      await CategoriaService.eliminarCategoria(id);
      setDeleteConfirmId(null);
      cargarCategorias();
    } catch (e) { console.error(e); }
  }, [cargarCategorias]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return categorias.filter(c =>
      String(c.id).includes(q) ||
      c.nombre?.toLowerCase().includes(q) ||
      c.tipo?.toLowerCase().includes(q)
    );
  }, [categorias, search]);

  const totalPages = Math.ceil(filtered.length / ROWS_PER_PAGE);
  const rows       = filtered.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);

  // ── Desktop columns ─────────────────────────────────────────────────────────

  const columns = [
    {
      key: "id", header: "ID", width: "60px",
      render: r => <span style={{ fontSize: "12px", color: tokens.text.muted }}>#{r.id}</span>,
    },
    {
      key: "nombre", header: "Nombre",
      render: r => (
        <span style={{ fontWeight: 600, fontSize: "13px", color: tokens.text.primary }}>
          {r.nombre}
        </span>
      ),
    },
    {
      key: "tipo", header: "Tipo",
      render: r => <StatusBadge value={r.tipo} />,
    },
    {
      key: "actions", header: "Acciones",
      render: r => (
        <ActionButtons
          rowId={r.id}
          confirmId={deleteConfirmId}
          onConfirm={eliminar}
          onCancelConfirm={() => setDeleteConfirmId(null)}
          actions={[
            { type: "edit",   onClick: () => { setRowEditar(r); setModalEditar(true); } },
            { type: "delete", onClick: () => setDeleteConfirmId(r.id) },
          ]}
        />
      ),
    },
  ];

  // ── Mobile card renderer ────────────────────────────────────────────────────

  const renderCard = (row) => (
    <CardItem
      key={row.id}
      isHighlighted={deleteConfirmId === row.id}
      title={row.nombre}
      metaLabel={`#${row.id}`}
      badges={[<StatusBadge key="tipo" value={row.tipo} />]}
      actions={
        <ActionButtons
          variant="full"
          rowId={row.id}
          confirmId={deleteConfirmId}
          onConfirm={eliminar}
          onCancelConfirm={() => setDeleteConfirmId(null)}
          actions={[
            { type: "edit",   onClick: () => { setRowEditar(row); setModalEditar(true); } },
            { type: "delete", onClick: () => setDeleteConfirmId(row.id) },
          ]}
        />
      }
    />
  );

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "3rem" }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600 mx-auto mb-3" />
        <p style={{ color: "#64748b" }}>Cargando categorías…</p>
      </div>
    );
  }

  return (
    <>
      <ResponsiveTableWrapper
        title="Categorías"
        addLabel="Nueva Categoría"
        onAdd={() => setModalCrear(true)}
        countLabel="categorías registradas"
        searchValue={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        searchPlaceholder="Buscar por nombre o tipo…"
        rows={rows}
        allRows={filtered}
        keyField="id"
        columns={columns}
        renderCard={renderCard}
        emptyMessage="No se encontraron categorías"
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
        highlightRow={r => deleteConfirmId === r.id}
      />

      <Dialog
        header="Agregar Categoría"
        visible={modalCrear}
        onHide={() => setModalCrear(false)}
        breakpoints={{ "960px": "75vw", "640px": "90vw" }}
        style={{ width: "50vw" }}
        contentStyle={{ maxHeight: "70vh", overflowY: "auto" }}
      >
        <CategoriaForm mostrarModal={setModalCrear} cargarCategorias={cargarCategorias} />
      </Dialog>

      <Dialog
        header="Editar Categoría"
        visible={modalEditar}
        onHide={() => setModalEditar(false)}
        breakpoints={{ "960px": "75vw", "640px": "90vw" }}
        style={{ width: "50vw" }}
        contentStyle={{ maxHeight: "70vh", overflowY: "auto" }}
      >
        <CategoriaFormEdit
          rowData={rowEditar}
          setRowDataEditar={setRowEditar}
          cargarCategorias={cargarCategorias}
          mostrarModal={setModalEditar}
        />
      </Dialog>
    </>
  );
}

import { useState, useEffect, useRef } from "react";
import VentasService from "../../services/VentasService";
import AbonoService from "../../services/AbonoService";
import detalleVentasService from "../../services/detallleVentasService";
import { Dialog } from 'primereact/dialog';
import VentasForm from "./VentasForm";
import VentasFormEdit from "./VentasFormEdit";
import BotonEntregado from "./VentasEntregado";
import UnidadProductoService from "../../services/UnidadProductoService";
import VentasDescripcionModal from "./VentasDescripcionModal";
import VentasUnidadesModal from "./VentasUnidadesModal";
import { ResponsiveTableWrapper, ActionButtons, StatusBadge, CardItem } from "../../components/ui/table";
import { formatearFecha, formatearNumero } from "../../utils/formatters";

const ROWS_PER_PAGE = 8;

const VentasTable = () => {
  const [ventas, setVentas] = useState([]);
  const [rowDataEditar, setRowDataEditar] = useState(null);
  const [rowDataDescripcion, setRowDataDescripcion] = useState(null);
  const [abonosVenta, setAbonosVenta] = useState([]);
  const [detallesVenta, setDetallesVenta] = useState([]);
  const [loadingDescripcion, setLoadingDescripcion] = useState(false);
  const [mostrarModalUnidades, setMostrarModalUnidades] = useState(false);
  const [unidadesProducto, setUnidadesProducto] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [loadingUnidades, setLoadingUnidades] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarModalEditar, setMostrarModalEditar] = useState(false);
  const [mostrarModalDescripcion, setMostrarModalDescripcion] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const descripcionRequestIdRef = useRef(0);
  const unidadesRequestIdRef = useRef(0);

  const normalizeData = (res) => {
    if (res === undefined || res === null) return [];
    return res.data ?? res ?? [];
  };

  const cargarVentas = async () => {
    try {
      const response = await VentasService.getAllVentas();
      setVentas(normalizeData(response));
    } catch (error) {
      console.error("Error al cargar ventas:", error);
    }
  };

  useEffect(() => { cargarVentas(); }, []);

  const eliminarVentas = async (id) => {
    try {
      await VentasService.eliminarVenta(id);
      setDeleteConfirmId(null);
      cargarVentas();
    } catch (error) {
      console.error("Error al eliminar venta:", error);
    }
  };

  const cargarDatosDescripcion = async (ventaId) => {
    descripcionRequestIdRef.current += 1;
    const requestId = descripcionRequestIdRef.current;
    setLoadingDescripcion(true);
    try {
      const abonosFiltrados = normalizeData(await AbonoService.getAllAbonos())
        .filter(a => Number(a.venta) === Number(ventaId));
      if (descripcionRequestIdRef.current !== requestId) return;
      setAbonosVenta(abonosFiltrados);

      const detallesFiltrados = normalizeData(await detalleVentasService.getAllDetalleVentas())
        .filter(d => Number(d.venta) === Number(ventaId));
      if (descripcionRequestIdRef.current !== requestId) return;
      setDetallesVenta(detallesFiltrados);
    } catch (error) {
      console.error('Error al cargar datos de descripción:', error);
      if (descripcionRequestIdRef.current === requestId) {
        setAbonosVenta([]);
        setDetallesVenta([]);
      }
    } finally {
      if (descripcionRequestIdRef.current === requestId) setLoadingDescripcion(false);
    }
  };

  const cargarUnidadesProducto = async (productoId, productoInfo) => {
    unidadesRequestIdRef.current += 1;
    const requestId = unidadesRequestIdRef.current;
    setLoadingUnidades(true);
    setProductoSeleccionado(productoInfo);
    try {
      const todas = normalizeData(await UnidadProductoService.getAllUnidadProductos());
      let filtradas = [];
      if (todas.length > 0) {
        const primera = todas[0];
        if (typeof primera.producto === 'object' && primera.producto?.id) {
          filtradas = todas.filter(u => Number(u.producto.id) === Number(productoId) && u.estado === 'vendido');
        } else {
          filtradas = todas.filter(u => Number(u.producto) === Number(productoId) && u.estado === 'vendido');
        }
      }
      if (unidadesRequestIdRef.current !== requestId) return;
      setUnidadesProducto(filtradas);
      setMostrarModalUnidades(true);
    } catch (error) {
      console.error("Error al cargar unidades del producto:", error);
      if (unidadesRequestIdRef.current === requestId) setUnidadesProducto([]);
    } finally {
      if (unidadesRequestIdRef.current === requestId) setLoadingUnidades(false);
    }
  };

  const abrirDescripcion = async (row) => {
    setRowDataDescripcion(row);
    setMostrarModalDescripcion(true);
    await cargarDatosDescripcion(row.id);
  };

  // ── Table config ─────────────────────────────────────────────────

  const filtered = ventas.filter(v => {
    const q = searchTerm.toLowerCase();
    return (
      String(v.id).includes(q) ||
      v.cliente?.nombre?.toLowerCase().includes(q) ||
      v.estado?.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filtered.length / ROWS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ROWS_PER_PAGE, currentPage * ROWS_PER_PAGE);

  const handleSearch = (val) => { setSearchTerm(val); setCurrentPage(1); };

  const columns = [
    {
      key: "id", header: "ID",
      render: r => <span style={{ fontSize: "12px", color: "#94a3b8", fontVariantNumeric: "tabular-nums" }}>#{r.id}</span>,
    },
    {
      key: "cliente", header: "Cliente",
      render: r => <span style={{ fontWeight: 600, fontSize: "13.5px", color: "#0f172a" }}>{r.cliente?.nombre || "—"}</span>,
    },
    {
      key: "total", header: "Total",
      render: r => (
        <span style={{ fontWeight: 700, color: "#047857", fontFamily: "'DM Mono', 'Fira Code', monospace", fontVariantNumeric: "tabular-nums" }}>
          ${formatearNumero(r.total)}
        </span>
      ),
    },
    {
      key: "fecha_venta", header: "Fecha Venta",
      render: r => <span style={{ fontSize: "12.5px", color: "#475569" }}>{formatearFecha(r.fecha_venta)}</span>,
    },
    {
      key: "estado", header: "Estado",
      render: r => <StatusBadge value={r.estado} dot />,
    },
    {
      key: "descripcion", header: "Descripción",
      render: r => (
        <button
          onClick={() => abrirDescripcion(r)}
          style={{ padding: "5px 12px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "#f8fafc", color: "#475569", cursor: "pointer", fontSize: "11.5px", fontWeight: 600, transition: "background 0.15s" }}
          onMouseEnter={e => (e.currentTarget.style.background = "#f1f5f9")}
          onMouseLeave={e => (e.currentTarget.style.background = "#f8fafc")}
        >
          Ver detalle
        </button>
      ),
    },
    {
      key: "fecha_entrega_estimada", header: "Fecha Entrega",
      render: r => <span style={{ fontSize: "12.5px", color: "#475569" }}>{formatearFecha(r.fecha_entrega_estimada)}</span>,
    },
    {
      key: "debe", header: "Saldo Pendiente",
      render: r => (
        <span style={{ fontWeight: 700, fontFamily: "'DM Mono', 'Fira Code', monospace", color: r.debe > 0 ? "#dc2626" : "#15803d" }}>
          ${formatearNumero(r.debe)}
        </span>
      ),
    },
    {
      key: "acciones", header: "Acciones",
      render: r => (
        <ActionButtons
          rowId={r.id}
          confirmId={deleteConfirmId}
          onConfirm={(id) => eliminarVentas(id)}
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
      title={`${row.cliente?.nombre || "—"}${row.cliente?.apellido ? " " + row.cliente.apellido : ""}`}
      subtitle={formatearFecha(row.fecha_venta)}
      meta={`$${formatearNumero(row.total)}`}
      metaLabel={`#${row.id}`}
      badges={<StatusBadge value={row.estado} dot />}
      isHighlighted={deleteConfirmId === row.id}
      actions={
        <ActionButtons
          variant="full"
          rowId={row.id}
          confirmId={deleteConfirmId}
          onConfirm={(id) => eliminarVentas(id)}
          onCancelConfirm={() => setDeleteConfirmId(null)}
          actions={[
            { type: "view", label: "Ver detalle", onClick: () => abrirDescripcion(row) },
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
        title="Ventas"
        addLabel="Nueva Venta"
        onAdd={() => setMostrarModal(true)}
        countLabel="ventas registradas"
        searchValue={searchTerm}
        onSearchChange={handleSearch}
        searchPlaceholder="Buscar por cliente, estado o ID..."
        rows={paginated}
        allRows={filtered}
        keyField="id"
        columns={columns}
        renderCard={renderCard}
        emptyMessage="No se encontraron ventas"
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        highlightRow={r => deleteConfirmId === r.id}
      />

      <Dialog
        header="Agregar Ventas"
        visible={mostrarModal}
        onHide={() => setMostrarModal(false)}
        breakpoints={{ '960px': '75vw', '640px': '90vw' }}
        style={{ width: '50vw' }}
        contentStyle={{ maxHeight: '70vh', overflowY: 'auto' }}
      >
        <VentasForm mostrarModal={setMostrarModal} cargarVentas={cargarVentas} />
      </Dialog>

      <Dialog
        header="Editar Ventas"
        visible={mostrarModalEditar}
        onHide={() => setMostrarModalEditar(false)}
        breakpoints={{ '960px': '75vw', '640px': '90vw' }}
        style={{ width: '50vw' }}
        contentStyle={{ maxHeight: '70vh', overflowY: 'auto' }}
      >
        <BotonEntregado rowdata={rowDataEditar} />
        <VentasFormEdit
          rowData={rowDataEditar}
          setRowDataEditar={setRowDataEditar}
          cargarVentas={cargarVentas}
          mostrarModal={setMostrarModalEditar}
        />
      </Dialog>

      <Dialog
        header={`Detalle Completo de la Venta #${rowDataDescripcion?.id || ''}`}
        visible={mostrarModalDescripcion}
        onHide={() => {
          setMostrarModalDescripcion(false);
          setAbonosVenta([]);
          setDetallesVenta([]);
          setRowDataDescripcion(null);
        }}
        breakpoints={{ '960px': '90vw', '640px': '95vw' }}
        style={{ width: '80vw' }}
        contentStyle={{ maxHeight: '85vh', overflowY: 'auto' }}
      >
        <VentasDescripcionModal
          rowData={rowDataDescripcion}
          abonosVenta={abonosVenta}
          detallesVenta={detallesVenta}
          loading={loadingDescripcion}
          onVerUnidades={cargarUnidadesProducto}
        />
      </Dialog>

      <Dialog
        header={`Unidades del Producto ${productoSeleccionado ? `#${productoSeleccionado.id}` : ''}`}
        visible={mostrarModalUnidades}
        onHide={() => {
          setMostrarModalUnidades(false);
          setUnidadesProducto([]);
          setProductoSeleccionado(null);
        }}
        breakpoints={{ '960px': '85vw', '640px': '95vw' }}
        style={{ width: '70vw' }}
        contentStyle={{ maxHeight: '80vh', overflowY: 'auto' }}
      >
        <VentasUnidadesModal
          productoSeleccionado={productoSeleccionado}
          unidadesProducto={unidadesProducto}
          loading={loadingUnidades}
        />
      </Dialog>
    </div>
  );
};

export default VentasTable;

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import VentasService from "../../services/VentasService";
import AbonoService from "../../services/AbonoService";
import detalleVentasService from "../../services/detallleVentasService";
import UnidadProductoService from "../../services/UnidadProductoService";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import VentasForm from "./VentasForm";
import VentasFormEdit from "./VentasFormEdit";
import BotonEntregado from "./VentasEntregado";

import {
  ResponsiveTableWrapper,
  CardItem,
  ActionButtons,
  StatusBadge,
  tokens,
} from "../../components/ui/table";

// ─── helpers ────────────────────────────────────────────────────────────────

const fmt = (n) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency", currency: "COP", minimumFractionDigits: 0,
  }).format(n ?? 0);

const fmtDate = (iso) => {
  if (!iso) return "N/A";
  try {
    return new Intl.DateTimeFormat("es-ES", {
      year: "numeric", month: "short", day: "numeric",
    }).format(new Date(iso));
  } catch { return "Fecha inválida"; }
};

const fmtNum = (n) =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(n ?? 0);

const ROWS_PER_PAGE = 8;

// ─── Descripción modal content ───────────────────────────────────────────────

function DescripcionContent({ venta, abonos, detalles, loading, onVerUnidades }) {
  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "3rem" }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600 mx-auto mb-3" />
        <p style={{ color: "#64748b" }}>Cargando información…</p>
      </div>
    );
  }
  if (!venta) return null;

  const totalAbonado = abonos.reduce((s, a) => s + parseFloat(a.monto_abonado ?? 0), 0);

  const SectionTitle = ({ children }) => (
    <h3 style={{
      marginTop: 0, marginBottom: "1rem", color: "#0f172a",
      borderBottom: "2px solid #6366f1", paddingBottom: "0.5rem",
      fontSize: "1rem", fontWeight: 700,
    }}>
      {children}
    </h3>
  );

  const Row = ({ label, value, color }) => (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
      <span style={{ color: "#64748b", fontSize: "13px" }}>{label}</span>
      <span style={{ fontWeight: 600, fontSize: "13px", color: color ?? "#0f172a" }}>{value}</span>
    </div>
  );

  return (
    <div style={{ display: "grid", gap: "20px", padding: "4px" }}>
      {/* General */}
      <div style={{ background: "#f8fafc", borderRadius: "10px", padding: "16px", border: "1px solid #e2e8f0" }}>
        <SectionTitle>Información general</SectionTitle>
        <Row label="ID Venta" value={`#${venta.id}`} />
        <Row label="Estado" value={<StatusBadge value={venta.estado} />} />
        <Row label="Fecha venta" value={fmtDate(venta.fecha_venta)} />
        <Row label="Fecha entrega estimada" value={fmtDate(venta.fecha_entrega_estimada)} />
      </div>

      {/* Cliente */}
      <div style={{ background: "#f8fafc", borderRadius: "10px", padding: "16px", border: "1px solid #e2e8f0" }}>
        <SectionTitle>Cliente</SectionTitle>
        <Row label="Nombre" value={`${venta.cliente?.nombre ?? "—"} ${venta.cliente?.apellido ?? ""}`} />
        <Row label="Identificación" value={venta.cliente?.identificacion ?? "—"} />
      </div>

      {/* Detalles */}
      <div style={{ background: "#f8fafc", borderRadius: "10px", padding: "16px", border: "1px solid #e2e8f0" }}>
        <SectionTitle>Productos ({detalles.length} ítems)</SectionTitle>
        {detalles.length === 0 ? (
          <p style={{ color: "#94a3b8", fontStyle: "italic", margin: 0, fontSize: "13px" }}>Sin detalles registrados</p>
        ) : (
          <div style={{ display: "grid", gap: "10px" }}>
            {detalles.map((d, i) => (
              <div key={d.id ?? i} style={{
                background: "#fff", borderRadius: "8px", padding: "12px",
                border: "1px solid #e2e8f0",
              }}>
                {d.producto ? (
                  <>
                    <div style={{ fontWeight: 700, fontSize: "13px", color: "#0f172a" }}>
                      {d.producto.tipo} — {d.producto.modelo}
                    </div>
                    <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                      {d.producto.categoria?.nombre} · Color: {d.producto.colorPrincipal}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px", alignItems: "center" }}>
                      <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                        Cantidad: <strong style={{ color: "#059669" }}>{d.cantidad}</strong>
                      </span>
                      <Button
                        label="Ver unidades"
                        icon="pi pi-box"
                        size="small"
                        severity="info"
                        outlined
                        onClick={() => onVerUnidades(d.producto.id, d.producto, d.id, d.venta)}
                        style={{ fontSize: "11px" }}
                      />
                    </div>
                  </>
                ) : (
                  <p style={{ margin: 0, color: "#94a3b8", fontSize: "12px", fontStyle: "italic" }}>
                    Producto no disponible
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Abonos */}
      <div style={{ background: "#f8fafc", borderRadius: "10px", padding: "16px", border: "1px solid #e2e8f0" }}>
        <SectionTitle>Abonos ({abonos.length})</SectionTitle>
        {abonos.length === 0 ? (
          <p style={{ color: "#94a3b8", fontStyle: "italic", margin: 0, fontSize: "13px" }}>Sin abonos registrados</p>
        ) : (
          <div style={{ display: "grid", gap: "8px" }}>
            {abonos.map((a, i) => (
              <div key={a.id ?? i} style={{
                background: "#fff", borderRadius: "8px", padding: "10px 12px",
                border: "1px solid #e2e8f0",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <div>
                  <div style={{ fontSize: "12px", color: "#64748b" }}>{fmtDate(a.fecha_abono)}</div>
                  <div style={{ fontSize: "11px", color: "#94a3b8" }}>{a.metodo_pago ?? "Método no especificado"}</div>
                </div>
                <span style={{ fontWeight: 700, color: "#16a34a", fontSize: "14px" }}>
                  +{fmtNum(a.monto_abonado)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resumen financiero */}
      <div style={{
        background: "#f8fafc", borderRadius: "10px", padding: "16px",
        border: "2px solid #6366f1",
      }}>
        <SectionTitle>Resumen financiero</SectionTitle>
        <Row label="Total venta"   value={fmtNum(venta.total)}  color="#1e40af" />
        <Row label="Total abonado" value={fmtNum(totalAbonado)} color="#16a34a" />
        <div style={{ borderTop: "2px solid #6366f1", marginTop: "8px", paddingTop: "8px" }}>
          <Row
            label="Saldo pendiente"
            value={fmtNum(venta.debe)}
            color={venta.debe > 0 ? "#dc2626" : "#16a34a"}
          />
        </div>
      </div>

      {venta.comentarios?.trim() && (
        <div style={{ background: "#fffbeb", borderRadius: "10px", padding: "16px", border: "1px solid #fbbf24" }}>
          <SectionTitle>Comentarios</SectionTitle>
          <p style={{ margin: 0, whiteSpace: "pre-wrap", color: "#64748b", fontSize: "13px" }}>
            {venta.comentarios}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── UnidadesContent ─────────────────────────────────────────────────────────

function UnidadesContent({ unidades, producto, loading }) {
  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "3rem" }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600 mx-auto mb-3" />
        <p style={{ color: "#64748b" }}>Cargando unidades…</p>
      </div>
    );
  }

  return (
    <div>
      {producto && (
        <div style={{
          marginBottom: "16px", padding: "12px 14px",
          background: "#eff6ff", borderRadius: "10px", border: "2px solid #3b82f6",
        }}>
          <div style={{ fontWeight: 700, color: "#1e40af", fontSize: "13px" }}>
            {producto.tipo} — {producto.modelo}
          </div>
          <div style={{ fontSize: "12px", color: "#3b82f6", marginTop: "2px" }}>
            #{producto.id} · Color: {producto.colorPrincipal}
          </div>
        </div>
      )}

      {unidades.length === 0 ? (
        <div style={{ textAlign: "center", padding: "2rem", color: "#94a3b8", fontSize: "13px" }}>
          No hay unidades registradas
        </div>
      ) : (
        <div style={{ display: "grid", gap: "8px" }}>
          {unidades.map((u, i) => (
            <div key={u.id ?? i} style={{
              background: "#fff", border: "1px solid #e2e8f0",
              borderRadius: "10px", padding: "12px 14px",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <div>
                <div style={{ fontWeight: 700, color: "#0f172a", fontSize: "13px" }}>
                  #{u.id}
                </div>
                <div style={{ fontFamily: "monospace", fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                  {u.numeroSerie ?? "Sin número de serie"}
                </div>
                <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>
                  {fmtDate(u.fechaCreacion)}
                </div>
              </div>
              <StatusBadge value={u.estado} dot />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function VentasTable() {
  const [ventas, setVentas]               = useState([]);
  const [search, setSearch]               = useState("");
  const [page, setPage]                   = useState(1);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const [modalCrear, setModalCrear]       = useState(false);
  const [modalEditar, setModalEditar]     = useState(false);
  const [modalDesc, setModalDesc]         = useState(false);
  const [modalUnidades, setModalUnidades] = useState(false);

  const [rowEditar, setRowEditar]         = useState(null);
  const [rowDesc, setRowDesc]             = useState(null);
  const [abonos, setAbonos]               = useState([]);
  const [detalles, setDetalles]           = useState([]);
  const [loadingDesc, setLoadingDesc]     = useState(false);
  const [unidades, setUnidades]           = useState([]);
  const [productoUnidades, setProductoUnidades] = useState(null);
  const [loadingUnidades, setLoadingUnidades]   = useState(false);

  const descReqRef = useRef(0);
  const unidReqRef = useRef(0);

  const cargarVentas = useCallback(async () => {
    try {
      const data = await VentasService.getAllVentas();
      setVentas(Array.isArray(data) ? data : data?.data ?? []);
    } catch (e) { console.error("Error al cargar ventas:", e); }
  }, []);

  useEffect(() => { cargarVentas(); }, [cargarVentas]);

  const eliminar = useCallback(async (id) => {
    await VentasService.eliminarVenta(id);
    setDeleteConfirmId(null);
    cargarVentas();
  }, [cargarVentas]);

  const abrirDesc = useCallback(async (row) => {
    setRowDesc(row);
    setModalDesc(true);
    setLoadingDesc(true);
    descReqRef.current += 1;
    const reqId = descReqRef.current;
    try {
      const [abonosRes, detallesRes] = await Promise.all([
        AbonoService.getAllAbonos(),
        detalleVentasService.getAllDetalleVentas(),
      ]);
      if (descReqRef.current !== reqId) return;
      const ab = (abonosRes?.data ?? abonosRes ?? []).filter(a => Number(a.venta) === Number(row.id));
      const dt = (Array.isArray(detallesRes) ? detallesRes : detallesRes?.data ?? [])
        .filter(d => Number(d.venta) === Number(row.id));
      setAbonos(ab);
      setDetalles(dt);
    } catch (e) { console.error(e); }
    finally { if (descReqRef.current === reqId) setLoadingDesc(false); }
  }, []);

  const abrirUnidades = useCallback(async (productoId, productoInfo) => {
    setProductoUnidades(productoInfo);
    setLoadingUnidades(true);
    setModalUnidades(true);
    unidReqRef.current += 1;
    const reqId = unidReqRef.current;
    try {
      const all = await UnidadProductoService.getAllUnidadProductos();
      if (unidReqRef.current !== reqId) return;
      const arr = Array.isArray(all) ? all : all?.data ?? [];
      const filtered = arr.filter(u => {
        const pid = typeof u.producto === "object" ? u.producto?.id : u.producto;
        return Number(pid) === Number(productoId) && u.estado === "vendido";
      });
      setUnidades(filtered);
    } catch (e) { console.error(e); }
    finally { if (unidReqRef.current === reqId) setLoadingUnidades(false); }
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return ventas.filter(v =>
      String(v.id).includes(q) ||
      v.cliente?.nombre?.toLowerCase().includes(q) ||
      v.cliente?.apellido?.toLowerCase().includes(q) ||
      v.estado?.toLowerCase().includes(q)
    );
  }, [ventas, search]);

  const totalPages = Math.ceil(filtered.length / ROWS_PER_PAGE);
  const rows       = filtered.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);

  // ── Desktop columns ─────────────────────────────────────────────────────────

  const columns = [
    {
      key: "id", header: "ID", width: "60px",
      render: r => <span style={{ fontSize: "12px", color: tokens.text.muted }}>#{r.id}</span>,
    },
    {
      key: "cliente", header: "Cliente",
      render: r => (
        <div>
          <div style={{ fontWeight: 700, fontSize: "13px", color: tokens.text.primary }}>
            {r.cliente?.nombre} {r.cliente?.apellido}
          </div>
          <div style={{ fontSize: "11px", color: tokens.text.muted }}>{r.cliente?.identificacion}</div>
        </div>
      ),
    },
    {
      key: "total", header: "Total", align: "right",
      render: r => (
        <span style={{ fontWeight: 700, color: tokens.text.price, fontSize: "13px", fontFamily: "'DM Mono', monospace" }}>
          {fmt(r.total)}
        </span>
      ),
    },
    {
      key: "fecha_venta", header: "Fecha",
      render: r => <span style={{ fontSize: "12px", color: tokens.text.secondary }}>{fmtDate(r.fecha_venta)}</span>,
    },
    {
      key: "estado", header: "Estado",
      render: r => <StatusBadge value={r.estado} dot />,
    },
    {
      key: "debe", header: "Saldo", align: "right",
      render: r => (
        <span style={{
          fontWeight: 700, fontSize: "13px",
          color: r.debe > 0 ? "#dc2626" : "#16a34a",
          fontFamily: "'DM Mono', monospace",
        }}>
          {fmt(r.debe)}
        </span>
      ),
    },
    {
      key: "fecha_entrega_estimada", header: "Entrega",
      render: r => <span style={{ fontSize: "12px", color: tokens.text.secondary }}>{fmtDate(r.fecha_entrega_estimada)}</span>,
    },
    {
      key: "actions", header: "Acciones",
      render: r => (
        <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
          <button
            onClick={() => abrirDesc(r)}
            style={{
              padding: "5px 10px", borderRadius: "7px",
              border: "1px solid #dbeafe", background: "#eff6ff",
              color: "#1d4ed8", cursor: "pointer",
              fontSize: "11px", fontWeight: 600,
            }}
          >
            Ver
          </button>
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
        </div>
      ),
    },
  ];

  // ── Mobile card renderer ────────────────────────────────────────────────────

  const renderCard = (row) => (
    <CardItem
      key={row.id}
      isHighlighted={deleteConfirmId === row.id}
      title={`${row.cliente?.nombre ?? "—"} ${row.cliente?.apellido ?? ""}`}
      subtitle={`${fmtDate(row.fecha_venta)} · Entrega: ${fmtDate(row.fecha_entrega_estimada)}`}
      meta={fmt(row.total)}
      metaLabel={`#${row.id}`}
      badges={[
        <StatusBadge key="estado" value={row.estado} dot />,
        row.debe > 0 && (
          <span key="debe" style={{
            fontSize: "11px", fontWeight: 700, color: "#dc2626",
            background: "#fff1f2", border: "1px solid #fecdd3",
            padding: "2px 8px", borderRadius: "999px",
          }}>
            Saldo: {fmt(row.debe)}
          </span>
        ),
      ].filter(Boolean)}
      actions={
        <ActionButtons
          variant="full"
          rowId={row.id}
          confirmId={deleteConfirmId}
          onConfirm={eliminar}
          onCancelConfirm={() => setDeleteConfirmId(null)}
          actions={[
            { type: "view",   label: "Descripción", onClick: () => abrirDesc(row) },
            { type: "edit",   label: "Abono",       onClick: () => { setRowEditar(row); setModalEditar(true); } },
            { type: "delete",                        onClick: () => setDeleteConfirmId(row.id) },
          ]}
        />
      }
    />
  );

  return (
    <div style={{ fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}>
      <ResponsiveTableWrapper
        title="Ventas"
        addLabel="Nueva Venta"
        onAdd={() => setModalCrear(true)}
        countLabel="ventas registradas"
        searchValue={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        searchPlaceholder="Buscar por cliente, estado o ID…"
        rows={rows}
        allRows={filtered}
        keyField="id"
        columns={columns}
        renderCard={renderCard}
        emptyMessage="No se encontraron ventas"
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
        highlightRow={r => deleteConfirmId === r.id}
      />

      <Dialog
        header="Nueva Venta"
        visible={modalCrear}
        onHide={() => setModalCrear(false)}
        breakpoints={{ "960px": "75vw", "640px": "95vw" }}
        style={{ width: "50vw" }}
        contentStyle={{ maxHeight: "70vh", overflowY: "auto" }}
      >
        <VentasForm mostrarModal={setModalCrear} cargarVentas={cargarVentas} />
      </Dialog>

      <Dialog
        header="Editar Venta"
        visible={modalEditar}
        onHide={() => setModalEditar(false)}
        breakpoints={{ "960px": "75vw", "640px": "95vw" }}
        style={{ width: "50vw" }}
        contentStyle={{ maxHeight: "70vh", overflowY: "auto" }}
      >
        <BotonEntregado rowdata={rowEditar} />
        <VentasFormEdit rowData={rowEditar} cargarVentas={cargarVentas} mostrarModal={setModalEditar} />
      </Dialog>

      <Dialog
        header={`Detalle — Venta #${rowDesc?.id ?? ""}`}
        visible={modalDesc}
        onHide={() => { setModalDesc(false); setAbonos([]); setDetalles([]); setRowDesc(null); }}
        breakpoints={{ "960px": "90vw", "640px": "95vw" }}
        style={{ width: "680px" }}
        contentStyle={{ maxHeight: "85vh", overflowY: "auto" }}
      >
        <DescripcionContent
          venta={rowDesc}
          abonos={abonos}
          detalles={detalles}
          loading={loadingDesc}
          onVerUnidades={abrirUnidades}
        />
      </Dialog>

      <Dialog
        header={`Unidades — Producto #${productoUnidades?.id ?? ""}`}
        visible={modalUnidades}
        onHide={() => { setModalUnidades(false); setUnidades([]); setProductoUnidades(null); }}
        breakpoints={{ "960px": "85vw", "640px": "95vw" }}
        style={{ width: "560px" }}
        contentStyle={{ maxHeight: "80vh", overflowY: "auto" }}
      >
        <UnidadesContent
          unidades={unidades}
          producto={productoUnidades}
          loading={loadingUnidades}
        />
      </Dialog>
    </div>
  );
}

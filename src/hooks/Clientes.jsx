import { useState, useEffect, useCallback, useMemo } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import ClienteService from "../services/ClienteService";
import DireccionService from "../services/DireccionService";

import {
  ResponsiveTableWrapper,
  CardItem,
  ActionButtons,
  tokens,
} from "../components/ui/table";

const ROWS_PER_PAGE = 8;

// ─── AddressCard ─────────────────────────────────────────────────────────────

function AddressCard({ dir }) {
  return (
    <div style={{
      background: "#fff", border: "1px solid #e2e8f0",
      borderRadius: "10px", padding: "12px 14px",
    }}>
      <div style={{ fontWeight: 700, fontSize: "13px", color: "#0f172a" }}>
        {dir.destinatario}
      </div>
      <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px", display: "grid", gap: "2px" }}>
        <span>{dir.pais} · {dir.departamento} · {dir.ciudad}</span>
        <span>{dir.nomenclatura}</span>
        <span>{dir.celular}</span>
      </div>
    </div>
  );
}

// ─── DireccionForm ────────────────────────────────────────────────────────────

function DireccionForm({ onSubmit }) {
  const [form, setForm] = useState({
    destinatario: "", celular: "", pais: "",
    departamento: "", ciudad: "", nomenclatura: "",
  });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const fields = [
    { key: "destinatario", label: "Destinatario" },
    { key: "celular",      label: "Celular"       },
    { key: "pais",         label: "País"          },
    { key: "departamento", label: "Departamento"  },
    { key: "ciudad",       label: "Ciudad"        },
    { key: "nomenclatura", label: "Nomenclatura"  },
  ];

  return (
    <div style={{ display: "grid", gap: "12px" }}>
      {fields.map(({ key, label }) => (
        <div key={key}>
          <label style={{ fontSize: "12px", fontWeight: 600, color: tokens.text.secondary, display: "block", marginBottom: "4px" }}>
            {label}
          </label>
          <InputText
            value={form[key]}
            onChange={e => set(key, e.target.value)}
            className="w-full"
            placeholder={label}
          />
        </div>
      ))}
      <Button label="Registrar dirección" onClick={() => onSubmit(form)} className="mt-2" />
    </div>
  );
}

// ─── ClienteForm ─────────────────────────────────────────────────────────────

function ClienteForm({ initial = {}, onSubmit, submitLabel = "Registrar" }) {
  const [form, setForm] = useState({
    nombre: initial.nombre ?? "",
    apellido: initial.apellido ?? "",
    identificacion: initial.identificacion ?? "",
  });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div style={{ display: "grid", gap: "12px" }}>
      {[
        ["nombre", "Nombre"],
        ["apellido", "Apellido"],
        ["identificacion", "Identificación"],
      ].map(([key, label]) => (
        <div key={key}>
          <label style={{ fontSize: "12px", fontWeight: 600, color: tokens.text.secondary, display: "block", marginBottom: "4px" }}>
            {label}
          </label>
          <InputText
            value={form[key]}
            onChange={e => set(key, e.target.value)}
            className="w-full"
            placeholder={label}
          />
        </div>
      ))}
      <Button label={submitLabel} onClick={() => onSubmit(form)} className="mt-2" />
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function Clientes() {
  const [clientes, setClientes]               = useState([]);
  const [search, setSearch]                   = useState("");
  const [page, setPage]                       = useState(1);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const [modalCrear, setModalCrear]           = useState(false);
  const [modalEditar, setModalEditar]         = useState(false);
  const [modalDirecciones, setModalDirecciones] = useState(false);
  const [modalAgregarDir, setModalAgregarDir] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);

  const cargarClientes = useCallback(async () => {
    const data = await ClienteService.getAllClientes();
    setClientes(Array.isArray(data) ? data : []);
  }, []);

  useEffect(() => { cargarClientes(); }, [cargarClientes]);

  const eliminar = useCallback(async (id) => {
    await ClienteService.eliminarCliente(id);
    setDeleteConfirmId(null);
    cargarClientes();
  }, [cargarClientes]);

  const crearCliente = useCallback(async (form) => {
    await ClienteService.crearCliente(form);
    cargarClientes();
    setModalCrear(false);
  }, [cargarClientes]);

  const editarCliente = useCallback(async (form) => {
    await ClienteService.actualizarCliente(clienteSeleccionado.id, form);
    cargarClientes();
    setModalEditar(false);
  }, [clienteSeleccionado, cargarClientes]);

  const agregarDireccion = useCallback(async (form) => {
    await DireccionService.agregarDireccion(clienteSeleccionado.id, form);
    cargarClientes();
    setModalAgregarDir(false);
  }, [clienteSeleccionado, cargarClientes]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return clientes.filter(c =>
      String(c.id).includes(q) ||
      c.nombre?.toLowerCase().includes(q) ||
      c.apellido?.toLowerCase().includes(q) ||
      c.identificacion?.toLowerCase().includes(q)
    );
  }, [clientes, search]);

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
        <div>
          <div style={{ fontWeight: 700, fontSize: "13px", color: tokens.text.primary }}>
            {r.nombre} {r.apellido}
          </div>
          <div style={{ fontSize: "11px", color: tokens.text.muted }}>{r.identificacion}</div>
        </div>
      ),
    },
    {
      key: "total_ventas", header: "Ventas",
      render: r => (
        <span style={{
          fontSize: "13px", fontWeight: 700, color: tokens.text.price,
          fontFamily: "'DM Mono', monospace",
        }}>
          {r.total_ventas ?? 0}
        </span>
      ),
    },
    {
      key: "direcciones", header: "Direcciones",
      render: r => (
        <div style={{ display: "flex", gap: "6px" }}>
          {r.direcciones?.length > 0 ? (
            <button
              onClick={() => { setClienteSeleccionado(r); setModalDirecciones(true); }}
              style={{
                padding: "5px 10px", borderRadius: "7px",
                border: "1px solid #dbeafe", background: "#eff6ff",
                color: "#1d4ed8", cursor: "pointer", fontSize: "11px", fontWeight: 600,
              }}
            >
              Ver ({r.direcciones.length})
            </button>
          ) : (
            <span style={{ fontSize: "11px", color: tokens.text.muted }}>Sin direcciones</span>
          )}
          <button
            onClick={() => { setClienteSeleccionado(r); setModalAgregarDir(true); }}
            style={{
              width: "26px", height: "26px", borderRadius: "50%",
              border: "1px solid #d1fae5", background: "#f0fdf4",
              color: "#15803d", cursor: "pointer", fontSize: "16px",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            +
          </button>
        </div>
      ),
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
            {
              type: "edit",
              onClick: () => { setClienteSeleccionado(r); setModalEditar(true); },
            },
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
      title={`${row.nombre} ${row.apellido}`}
      subtitle={row.identificacion}
      meta={`${row.total_ventas ?? 0} ventas`}
      metaLabel={`#${row.id}`}
      badges={row.direcciones?.length > 0 ? [
        <span key="dir" style={{
          fontSize: "11px", fontWeight: 600,
          background: "#eff6ff", color: "#1d4ed8",
          border: "1px solid #dbeafe",
          padding: "2px 8px", borderRadius: "999px",
        }}>
          {row.direcciones.length} dirección{row.direcciones.length !== 1 ? "es" : ""}
        </span>,
      ] : []}
      actions={
        <ActionButtons
          variant="full"
          rowId={row.id}
          confirmId={deleteConfirmId}
          onConfirm={eliminar}
          onCancelConfirm={() => setDeleteConfirmId(null)}
          actions={[
            row.direcciones?.length > 0
              ? { type: "view",   label: "Direcciones", onClick: () => { setClienteSeleccionado(row); setModalDirecciones(true); } }
              : null,
            { type: "create", label: "Add dirección", onClick: () => { setClienteSeleccionado(row); setModalAgregarDir(true); } },
            { type: "edit",                            onClick: () => { setClienteSeleccionado(row); setModalEditar(true); } },
            { type: "delete",                          onClick: () => setDeleteConfirmId(row.id) },
          ].filter(Boolean)}
        />
      }
    />
  );

  return (
    <>
      <ResponsiveTableWrapper
        title="Clientes"
        addLabel="Nuevo Cliente"
        onAdd={() => setModalCrear(true)}
        countLabel="clientes registrados"
        searchValue={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        searchPlaceholder="Buscar por nombre, apellido o identificación…"
        rows={rows}
        allRows={filtered}
        keyField="id"
        columns={columns}
        renderCard={renderCard}
        emptyMessage="No se encontraron clientes"
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
        highlightRow={r => deleteConfirmId === r.id}
      />

      {/* Crear */}
      <Dialog
        header="Agregar Cliente"
        visible={modalCrear}
        onHide={() => setModalCrear(false)}
        breakpoints={{ "960px": "75vw", "640px": "90vw" }}
        style={{ width: "50vw" }}
        contentStyle={{ maxHeight: "70vh", overflowY: "auto" }}
      >
        <ClienteForm onSubmit={crearCliente} submitLabel="Registrar cliente" />
      </Dialog>

      {/* Editar */}
      <Dialog
        header="Editar Cliente"
        visible={modalEditar}
        onHide={() => setModalEditar(false)}
        breakpoints={{ "960px": "75vw", "640px": "90vw" }}
        style={{ width: "50vw" }}
        contentStyle={{ maxHeight: "70vh", overflowY: "auto" }}
      >
        {clienteSeleccionado && (
          <ClienteForm
            initial={clienteSeleccionado}
            onSubmit={editarCliente}
            submitLabel="Guardar cambios"
          />
        )}
      </Dialog>

      {/* Ver direcciones */}
      <Dialog
        header={`Direcciones — ${clienteSeleccionado?.nombre ?? ""}`}
        visible={modalDirecciones}
        onHide={() => setModalDirecciones(false)}
        breakpoints={{ "960px": "75vw", "640px": "95vw" }}
        style={{ width: "560px" }}
        contentStyle={{ maxHeight: "70vh", overflowY: "auto" }}
      >
        <div style={{ display: "grid", gap: "10px" }}>
          {clienteSeleccionado?.direcciones?.map((d, i) => (
            <AddressCard key={i} dir={d} />
          ))}
        </div>
      </Dialog>

      {/* Agregar dirección */}
      <Dialog
        header="Agregar Dirección"
        visible={modalAgregarDir}
        onHide={() => setModalAgregarDir(false)}
        breakpoints={{ "960px": "75vw", "640px": "90vw" }}
        style={{ width: "50vw" }}
        contentStyle={{ maxHeight: "70vh", overflowY: "auto" }}
      >
        <DireccionForm onSubmit={agregarDireccion} />
      </Dialog>
    </>
  );
}

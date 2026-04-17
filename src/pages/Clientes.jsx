import { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import ClienteService from '../services/ClienteService';
import ClienteForm from './ClienteForm';
import ClienteFormEdit from './ClienteFormEdit';
import DireccionForm from './DireccionForm';
import { ResponsiveTableWrapper, ActionButtons, CardItem } from '../components/ui/table';

const ROWS_PER_PAGE = 8;

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [displayModal, setDisplayModal] = useState(false);
  const [displayModalClientes, setDisplayModalClientes] = useState(false);
  const [displayModalEditarClientes, setDisplayModalEditarClientes] = useState(false);
  const [displayModalDirecciones, setDisplayModalDirecciones] = useState(false);
  const [direccionesSeleccionadas, setDireccionesSeleccionadas] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const cargarClientes = async () => {
    const response = await ClienteService.getAllClientes();
    setClientes(response);
  };

  useEffect(() => { cargarClientes(); }, []);

  const eliminarCliente = async (id) => {
    try {
      await ClienteService.eliminarCliente(id);
      await cargarClientes();
    } catch (error) {
      console.error(error);
    }
  };

  const abrirModalDirecciones = (rowData) => {
    setDireccionesSeleccionadas(rowData.direcciones);
    setDisplayModal(true);
  };

  const contenidoModalDirecciones = () =>
    direccionesSeleccionadas.map((dir, index) => (
      <div key={index} className="flex justify-center items-center">
        <div className='border-solid p-4 w-64 border-2 border-indigo-700 m-2 rounded'>
          <h4><strong>Destinatario:&nbsp;&nbsp;</strong>{dir.destinatario}</h4>
          <h4><strong>Celular:&nbsp;&nbsp;</strong>{dir.celular}</h4>
          <h4><strong>País:&nbsp;&nbsp;</strong>{dir.pais}</h4>
          <h4><strong>Departamento:&nbsp;&nbsp;</strong>{dir.departamento}</h4>
          <h4><strong>Ciudad:&nbsp;&nbsp;</strong>{dir.ciudad}</h4>
          <h4><strong>Nomenclatura:&nbsp;&nbsp;</strong>{dir.nomenclatura}</h4>
        </div>
      </div>
    ));

  // ── Table config ─────────────────────────────────────────────────

  const filtered = clientes.filter(c => {
    const q = searchTerm.toLowerCase();
    return (
      c.nombre?.toLowerCase().includes(q) ||
      c.apellido?.toLowerCase().includes(q) ||
      c.identificacion?.toLowerCase().includes(q) ||
      String(c.id).includes(q)
    );
  });

  const totalPages = Math.ceil(filtered.length / ROWS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ROWS_PER_PAGE, currentPage * ROWS_PER_PAGE);

  const handleSearch = (val) => { setSearchTerm(val); setCurrentPage(1); };

  const DireccionButtons = ({ rowData, variant = "icon" }) => {
    const tieneDir = rowData.direcciones?.length > 0;
    if (variant === "full") {
      return (
        <div style={{ display: "grid", gridTemplateColumns: tieneDir ? "1fr 1fr" : "1fr", gap: "8px" }}>
          {tieneDir && (
            <button
              onClick={() => abrirModalDirecciones(rowData)}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "9px 12px", borderRadius: "9px", border: "1px solid #fde68a", background: "#fffbeb", color: "#d97706", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}
            >
              Ver
            </button>
          )}
          <button
            onClick={() => { setClienteSeleccionado(rowData); setDisplayModalDirecciones(true); }}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "9px 12px", borderRadius: "9px", border: "1px solid #d1fae5", background: "#f0fdf4", color: "#15803d", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}
          >
            + Agregar
          </button>
        </div>
      );
    }
    return (
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
        {tieneDir ? (
          <button
            onClick={() => abrirModalDirecciones(rowData)}
            style={{ padding: "5px 10px", borderRadius: "8px", border: "1px solid #fde68a", background: "#fffbeb", color: "#d97706", cursor: "pointer", fontSize: "11.5px", fontWeight: 600 }}
          >
            Ver direcciones
          </button>
        ) : (
          <span style={{ fontSize: "11.5px", color: "#94a3b8" }}>Sin direcciones</span>
        )}
        <button
          onClick={() => { setClienteSeleccionado(rowData); setDisplayModalDirecciones(true); }}
          style={{ padding: "5px 10px", borderRadius: "8px", border: "1px solid #d1fae5", background: "#f0fdf4", color: "#15803d", cursor: "pointer", fontSize: "11.5px", fontWeight: 600 }}
        >
          + Agregar
        </button>
      </div>
    );
  };

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
      key: "apellido", header: "Apellido",
      render: r => <span style={{ fontSize: "13px", color: "#475569" }}>{r.apellido}</span>,
    },
    {
      key: "total_ventas", header: "Total Ventas",
      render: r => <span style={{ fontWeight: 600, color: "#047857", fontVariantNumeric: "tabular-nums" }}>{r.total_ventas}</span>,
    },
    {
      key: "direcciones", header: "Direcciones",
      render: r => <DireccionButtons rowData={r} />,
    },
    {
      key: "acciones", header: "Acciones",
      render: r => (
        <ActionButtons
          rowId={r.id}
          actions={[
            { type: "edit", onClick: () => { setClienteSeleccionado(r); setDisplayModalEditarClientes(true); } },
            { type: "delete", onClick: () => eliminarCliente(r.id) },
          ]}
        />
      ),
    },
  ];

  const renderCard = (row) => (
    <CardItem
      title={`${row.nombre} ${row.apellido}`}
      metaLabel={`#${row.id}`}
      meta={row.total_ventas > 0 ? `${row.total_ventas} ventas` : undefined}
      badges={<DireccionButtons rowData={row} />}
      actions={
        <ActionButtons
          variant="full"
          rowId={row.id}
          actions={[
            { type: "edit", onClick: () => { setClienteSeleccionado(row); setDisplayModalEditarClientes(true); } },
            { type: "delete", onClick: () => eliminarCliente(row.id) },
          ]}
        />
      }
    />
  );

  return (
    <div>
      <ResponsiveTableWrapper
        title="Clientes"
        addLabel="Agregar Cliente"
        onAdd={() => setDisplayModalClientes(true)}
        countLabel="clientes registrados"
        searchValue={searchTerm}
        onSearchChange={handleSearch}
        searchPlaceholder="Buscar por nombre, apellido o identificación..."
        rows={paginated}
        allRows={filtered}
        keyField="id"
        columns={columns}
        renderCard={renderCard}
        emptyMessage="No se encontraron clientes"
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      <Dialog
        header="Direcciones"
        visible={displayModal}
        onHide={() => setDisplayModal(false)}
        breakpoints={{ '960px': '75vw', '640px': '90vw' }}
        style={{ width: '30vw' }}
      >
        {contenidoModalDirecciones()}
      </Dialog>

      <Dialog
        header="Agregar Cliente"
        visible={displayModalClientes}
        onHide={() => setDisplayModalClientes(false)}
        breakpoints={{ '960px': '75vw', '640px': '90vw' }}
        style={{ width: '50vw' }}
        contentStyle={{ maxHeight: '70vh', overflowY: 'auto' }}
      >
        <ClienteForm mostrarModal={setDisplayModalClientes} cargarClientes={cargarClientes} />
      </Dialog>

      <Dialog
        header="Editar Cliente"
        visible={displayModalEditarClientes}
        onHide={() => setDisplayModalEditarClientes(false)}
        breakpoints={{ '960px': '75vw', '640px': '90vw' }}
        style={{ width: '50vw' }}
        contentStyle={{ maxHeight: '70vh', overflowY: 'auto' }}
      >
        <ClienteFormEdit
          rowData={clienteSeleccionado}
          mostrarModal={setDisplayModalEditarClientes}
          cargarClientes={cargarClientes}
        />
      </Dialog>

      <Dialog
        header="Agregar Direccion"
        visible={displayModalDirecciones}
        onHide={() => setDisplayModalDirecciones(false)}
        breakpoints={{ '960px': '75vw', '640px': '90vw' }}
        style={{ width: '50vw' }}
        contentStyle={{ maxHeight: '70vh', overflowY: 'auto' }}
      >
        <DireccionForm
          clienteId={clienteSeleccionado?.id}
          mostrarModal={setDisplayModalDirecciones}
          cargarClientes={cargarClientes}
        />
      </Dialog>
    </div>
  );
};

export default Clientes;

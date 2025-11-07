import React, { useState, useEffect } from "react";
import VentasService from "../../services/VentasService";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import Acciones from "../../components/uiButtons/Acciones"
import HeaderTable from "../../components/uiButtons/HeaderTable";
import { Dialog } from 'primereact/dialog';
import VentasForm from "./VentasForm";
import VentasFormEdit from "./VentasFormEdit"
import BotonEntregado from "./VentasEntregado";

const VentasTable = ()=>{

  const [Ventas, setVentas] = useState([]);
  const [rowDataEditar, setRowDataEditar] = useState(null);
  // NUEVO: Estado para el modal de descripción
  const [rowDataDescripcion, setRowDataDescripcion] = useState(null);

  const [mostrarModal, setMostrarModal] = useState(false)
  const [mostrarModalEditar, setMostrarModalEditar] = useState(false)
  // NUEVO: Estado para mostrar/ocultar el modal de descripción
  const [mostrarModalDescripcion, setMostrarModalDescripcion] = useState(false)

  const cargarVentas = async () =>{
    const response = await VentasService.getAllVentas();
    setVentas(response)
    console.log(response)
  }

  useEffect(() => {
    cargarVentas()
  }, [])

  const eliminarVentas =  async(id)=>{
      const response = await VentasService.eliminarVenta(id);
      cargarVentas()
  }

  const formatearFecha = (fechaISO) => {
    if (!fechaISO) return '';
    const fecha = new Date(fechaISO);
    const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Intl.DateTimeFormat('es-ES', opciones).format(fecha);
  };

  const formatearNumero = (num) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };

  const renderEstadoBoton = (rowData) => {
    const estado = rowData.estado?.toLowerCase() || '';

    let severity = 'info';
    let icon = '';

    switch (estado) {
      case 'pendiente':
        severity = 'info';
        icon = 'pi pi-clock';
        break;
      case 'cancelado':
        severity = 'warning';
        icon = 'pi pi-times';
        break;
      case 'entregado':
        severity = 'success';
        icon = 'pi pi-check';
        break;
      default:
        severity = 'secondary';
        icon = 'pi pi-question';
    }

    return (
      <Button
        label={rowData.estado}
        severity={severity}
        icon={icon}
        size="small"
        rounded
        style={{
          minWidth: '100px',
          textTransform: 'capitalize'
        }}
      />
    );
  };

  // MODIFICADO: Función para renderizar el botón de descripción
  const renderDescripcionBoton = (rowData) => {
    const handleVerDescripcion = () => {
      setRowDataDescripcion(rowData);
      setMostrarModalDescripcion(true);
    };

    return (
      <Button
        label="Descripción"
        icon="pi pi-file-text"
        size="small"
        severity="secondary"
        outlined
        onClick={handleVerDescripcion}
        style={{
          minWidth: '120px'
        }}
      />
    );
  };

  return (
    <div className="card">
      <DataTable value={Ventas} paginator rows={5} header={<HeaderTable nombre="Ventas" mostrarModal={setMostrarModal} />} resizableColumns showGridlines tableStyle={{ minWidth: '50rem' }}>
        <Column field="id" header="ID" />
        <Column field="cliente.nombre" header="Cliente" />
        <Column
          field="total"
          header="Total"
          body={(rowData) => formatearNumero(rowData.total)}
        />
        <Column
          field="fecha_venta"
          header="Fecha Venta"
          body={(rowData) => formatearFecha(rowData.fecha_venta)}
        />
        <Column
          field="estado"
          header="Estado"
          body={renderEstadoBoton}
        />
        <Column
          header="Descripción"
          body={renderDescripcionBoton}
        />
        <Column
          field="fecha_entrega_estimada"
          header="Fecha de Entrega"
          body={(rowData) => formatearFecha(rowData.fecha_entrega_estimada)}
        />
        <Column
          field="debe"
          header="Saldo Pendiente"
          body={(rowData) => formatearNumero(rowData.debe)}
        />
        <Column header="Acciones" body={(rowData) => <Acciones rowData={rowData} setRowData={setRowDataEditar} mostrarModal={setMostrarModalEditar} eliminar={eliminarVentas} />} />
      </DataTable>

      <Dialog
        header="Agregar Ventas"
        visible={mostrarModal}
        onHide={() => setMostrarModal(false)}
        breakpoints={{'960px': '75vw','640px': '90vw'}}
        style={{width: '50vw'}}
        contentStyle={{ maxHeight: '70vh', overflowY: 'auto' }}
      >
        {<VentasForm mostrarModal={setMostrarModal} cargarVentas={cargarVentas} />}
      </Dialog>

      <Dialog
        header="Editar Ventas"
        visible={mostrarModalEditar}
        onHide={() => setMostrarModalEditar(false)}
        breakpoints={{'960px': '75vw','640px': '90vw'}}
        style={{width: '50vw'}}
        contentStyle={{ maxHeight: '70vh', overflowY: 'auto' }}
      >
        <BotonEntregado rowdata={rowDataEditar}/>
        {<VentasFormEdit rowData={rowDataEditar} setRowDataEditar={setRowDataEditar} cargarVentas={cargarVentas} mostrarModal={setMostrarModalEditar}/>}
      </Dialog>

      {/* NUEVO: Dialog para mostrar la descripción y detalles */}
      <Dialog
        header="Detalle de la Venta"
        visible={mostrarModalDescripcion}
        onHide={() => setMostrarModalDescripcion(false)}
        breakpoints={{'960px': '75vw','640px': '90vw'}}
        style={{width: '50vw'}}
      >
        {rowDataDescripcion && (
          <div style={{ padding: '1rem' }}>
            <div style={{ marginBottom: '1rem' }}>
              <strong>ID:</strong> {rowDataDescripcion.id}
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Cliente:</strong> {rowDataDescripcion.cliente?.nombre || 'N/A'}
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Total:</strong> ${formatearNumero(rowDataDescripcion.total)}
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Fecha de Venta:</strong> {formatearFecha(rowDataDescripcion.fecha_venta)}
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Estado:</strong> {rowDataDescripcion.estado}
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Fecha de Entrega:</strong> {formatearFecha(rowDataDescripcion.fecha_entrega_estimada)}
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Saldo Pendiente:</strong> ${formatearNumero(rowDataDescripcion.debe)}
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Descripción:</strong>
              <p style={{ marginTop: '0.5rem', whiteSpace: 'pre-wrap' }}>
                {rowDataDescripcion.descripcion || 'Sin descripción'}
              </p>
            </div>
          </div>
        )}
      </Dialog>

    </div>
  )

}

export default VentasTable;
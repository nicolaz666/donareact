import React, { useState, useEffect, useRef } from "react";
import VentasService from "../../services/VentasService";
import AbonoService from "../../services/AbonoService";
import detalleVentasService from "../../services/detallleVentasService";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import Acciones from "../../components/uiButtons/Acciones"
import HeaderTable from "../../components/uiButtons/HeaderTable";
import { Dialog } from 'primereact/dialog';
import VentasForm from "./VentasForm";
import VentasFormEdit from "./VentasFormEdit"
import BotonEntregado from "./VentasEntregado";
import UnidadProductoService from "../../services/UnidadProductoService";

const VentasTable = ()=>{

  const [Ventas, setVentas] = useState([]);
  const [rowDataEditar, setRowDataEditar] = useState(null);
  const [rowDataDescripcion, setRowDataDescripcion] = useState(null);
  
  // Estados para datos adicionales del modal de descripción
  const [abonosVenta, setAbonosVenta] = useState([]);
  const [detallesVenta, setDetallesVenta] = useState([]);
  const [loadingDescripcion, setLoadingDescripcion] = useState(false);

  // Estados para el modal de unidades de producto
  const [mostrarModalUnidades, setMostrarModalUnidades] = useState(false);
  const [unidadesProducto, setUnidadesProducto] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [loadingUnidades, setLoadingUnidades] = useState(false);

  const [mostrarModal, setMostrarModal] = useState(false)
  const [mostrarModalEditar, setMostrarModalEditar] = useState(false)
  const [mostrarModalDescripcion, setMostrarModalDescripcion] = useState(false)

  // Refs para evitar condiciones de carrera en cargas asíncronas
  const descripcionRequestIdRef = useRef(0);
  const unidadesRequestIdRef = useRef(0);

  // Helper para normalizar la forma de respuesta de los servicios
  const normalizeData = (res) => {
    if (res === undefined || res === null) return [];
    return res.data ?? res ?? [];
  };

  const cargarVentas = async () =>{
    try {
      const response = await VentasService.getAllVentas();
      const data = normalizeData(response);
      setVentas(data);
    } catch (error) {
      console.error("Error al cargar ventas:", error);
    }
  }

  useEffect(() => {
    cargarVentas()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const eliminarVentas = async(id)=>{
    try {
      await VentasService.eliminarVenta(id);
      cargarVentas();
    } catch (error) {
      console.error("Error al eliminar venta:", error);
    }
  }

  const formatearFecha = (fechaISO) => {
    if (!fechaISO) return 'N/A';
    try {
      const fecha = new Date(fechaISO);
      const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Intl.DateTimeFormat('es-ES', opciones).format(fecha);
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  const formatearNumero = (num) => {
    if (num === null || num === undefined) return '0.00';
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

  // Función para cargar todos los datos relacionados con la venta
  const cargarDatosDescripcion = async (ventaId) => {
    // Evita actualizaciones si hay otra solicitud más reciente
    descripcionRequestIdRef.current += 1;
    const requestId = descripcionRequestIdRef.current;
    setLoadingDescripcion(true);

    try {
      // 1. Cargar abonos
      const responseAbonos = await AbonoService.getAllAbonos();
      const abonosData = normalizeData(responseAbonos);
      const abonosFiltrados = abonosData.filter(abono => Number(abono.venta) === Number(ventaId));
      if (descripcionRequestIdRef.current !== requestId) return; // obsoleta
      setAbonosVenta(abonosFiltrados);

      // 2. Cargar detalles de ventas
      const detallesResponse = await detalleVentasService.getAllDetalleVentas();
      const detallesData = normalizeData(detallesResponse);
      const detallesFiltrados = detallesData.filter(detalle => Number(detalle.venta) === Number(ventaId));
      if (descripcionRequestIdRef.current !== requestId) return; // obsoleta
      setDetallesVenta(detallesFiltrados);

    } catch (error) {
      console.error('Error al cargar datos de descripción:', error);
      if (descripcionRequestIdRef.current === requestId) {
        setAbonosVenta([]);
        setDetallesVenta([]);
      }
    } finally {
      if (descripcionRequestIdRef.current === requestId) {
        setLoadingDescripcion(false);
      }
    }
  };

  const renderDescripcionBoton = (rowData) => {
    const handleVerDescripcion = async () => {
      console.log("Abriendo modal para venta:", rowData);
      setRowDataDescripcion(rowData);
      setMostrarModalDescripcion(true);
      await cargarDatosDescripcion(rowData.id);
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

  // Función para cargar unidades de un producto
  const cargarUnidadesProducto = async (productoId, productoInfo, detalleVentaId, ventaId) => {
    unidadesRequestIdRef.current += 1;
    const requestId = unidadesRequestIdRef.current;
    setLoadingUnidades(true);
    setProductoSeleccionado(productoInfo);

    try {
      const todasUnidades = normalizeData(await UnidadProductoService.getAllUnidadProductos());
      const unidadesFiltradas = todasUnidades.filter(unidad => (
        Number(unidad.producto) === Number(productoId) && Number(unidad.venta) === Number(ventaId)
      ));
      if (unidadesRequestIdRef.current !== requestId) return; // obsoleta
      setUnidadesProducto(unidadesFiltradas);
      setMostrarModalUnidades(true);
    } catch (error) {
      console.error("Error al cargar unidades del producto:", error);
      if (unidadesRequestIdRef.current === requestId) setUnidadesProducto([]);
    } finally {
      if (unidadesRequestIdRef.current === requestId) setLoadingUnidades(false);
    }
  };

  // Renderizar modal de unidades de producto
  const renderModalUnidades = () => {
    if (loadingUnidades) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem' }}>
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mb-4"></div>
          <p style={{ color: '#666', fontSize: '1.1em' }}>Cargando unidades del producto...</p>
        </div>
      );
    }

    return (
      <div style={{ padding: '1rem' }}>
        {/* Información del producto */}
        {productoSeleccionado && (
          <div style={{ 
            marginBottom: '1.5rem', 
            padding: '1rem', 
            backgroundColor: '#f0f9ff', 
            borderRadius: '8px',
            border: '2px solid #3b82f6'
          }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#1e40af' }}>
              🏷️ Producto: {productoSeleccionado.tipo} - {productoSeleccionado.modelo}
            </h4>
            <p style={{ margin: '0.25rem 0', fontSize: '0.9em', color: '#64748b' }}>
              <strong>ID:</strong> #{productoSeleccionado.id} | 
              <strong> Color:</strong> {productoSeleccionado.colorPrincipal}
            </p>
          </div>
        )}

        {/* Tabla de unidades */}
        {unidadesProducto.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse',
              backgroundColor: 'white',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <thead>
                <tr style={{ backgroundColor: '#4f46e5', color: 'white' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #ddd', width: '15%' }}>ID</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #ddd', width: '35%' }}>Número de Serie</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', border: '1px solid #ddd', width: '20%' }}>Estado</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #ddd', width: '30%' }}>Fecha Creación</th>
                </tr>
              </thead>
              <tbody>
                {unidadesProducto.map((unidad, index) => (
                  <tr key={unidad.id ?? unidad.numeroSerie ?? index} style={{ 
                    backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white'
                  }}>
                    <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>
                      <strong style={{ color: '#4f46e5' }}>#{unidad.id || 'N/A'}</strong>
                    </td>
                    <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>
                      <code style={{
                        padding: '4px 8px',
                        backgroundColor: '#f1f5f9',
                        borderRadius: '4px',
                        fontSize: '0.95em',
                        fontFamily: 'monospace',
                        fontWeight: '600',
                        color: '#1e293b'
                      }}>
                        {unidad.numeroSerie || 'N/A'}
                      </code>
                    </td>
                    <td style={{ padding: '0.75rem', border: '1px solid #ddd', textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '6px 14px',
                        borderRadius: '6px',
                        fontSize: '0.85em',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        backgroundColor: unidad.estado === 'disponible' ? '#d1fae5' : 
                                       unidad.estado === 'vendido' ? '#fee2e2' : 
                                       unidad.estado === 'reservado' ? '#fef3c7' : '#f1f5f9',
                        color: unidad.estado === 'disponible' ? '#065f46' : 
                               unidad.estado === 'vendido' ? '#991b1b' : 
                               unidad.estado === 'reservado' ? '#92400e' : '#475569'
                      }}>
                        {unidad.estado || 'N/A'}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>
                      {formatearFecha(unidad.fechaCreacion)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div style={{ 
              marginTop: '1rem',
              padding: '1rem',
              backgroundColor: '#e0f2fe',
              borderRadius: '6px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              border: '2px solid #3b82f6'
            }}>
              <span style={{ fontWeight: 'bold', fontSize: '1.1em' }}>
                Total de Unidades:
              </span>
              <span style={{ 
                fontWeight: 'bold', 
                fontSize: '1.3em',
                color: '#1e40af'
              }}>
                {unidadesProducto.length}
              </span>
            </div>
          </div>
        ) : (
          <div style={{ 
            padding: '3rem', 
            textAlign: 'center', 
            backgroundColor: 'white',
            borderRadius: '8px',
            border: '2px dashed #cbd5e1'
          }}>
            <div style={{ fontSize: '3em', marginBottom: '1rem' }}>📭</div>
            <p style={{ 
              color: '#64748b', 
              fontStyle: 'italic', 
              margin: 0, 
              fontSize: '1.1em',
              fontWeight: '500'
            }}>
              No hay unidades registradas para este producto en esta venta
            </p>
          </div>
        )}
      </div>
    );
  };

  // Renderizar el contenido del modal de descripción
  const renderModalDescripcion = () => {
    if (!rowDataDescripcion) {
      return <p>No hay datos para mostrar</p>;
    }

    if (loadingDescripcion) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem' }}>
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mb-4"></div>
          <p style={{ color: '#666', fontSize: '1.1em' }}>Cargando información detallada...</p>
        </div>
      );
    }

    const totalAbonado = abonosVenta.reduce((sum, abono) => sum + parseFloat(abono.monto_abonado || 0), 0);

    return (
      <div style={{ padding: '1rem' }}>
        {/* Debug Info */}
        <div style={{ 
          marginBottom: '2rem', 
          padding: '1rem', 
          backgroundColor: '#fff3cd', 
          borderRadius: '8px',
          border: '1px solid #ffc107'
        }}>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#856404' }}>📊 Debug - Datos Cargados:</h4>
          <div style={{ fontSize: '0.9em', color: '#856404' }}>
            <p style={{ margin: '0.25rem 0' }}><strong>Total Abonos Cargados:</strong> {abonosVenta.length}</p>
            <p style={{ margin: '0.25rem 0' }}><strong>Total Detalles Cargados:</strong> {detallesVenta.length}</p>
            <p style={{ margin: '0.25rem 0' }}><strong>ID Venta Actual:</strong> {rowDataDescripcion.id}</p>
          </div>
          {abonosVenta.length > 0 && (
            <div style={{ marginTop: '0.5rem', fontSize: '0.85em', color: '#856404' }}>
              <strong>IDs de Abonos:</strong> {abonosVenta.map(a => `#${a.id} (Venta: ${a.venta})`).join(', ')}
            </div>
          )}
          {detallesVenta.length > 0 && (
            <div style={{ marginTop: '0.5rem', fontSize: '0.85em', color: '#856404' }}>
              <strong>IDs de Detalles:</strong> {detallesVenta.map(d => `#${d.id} (Venta: ${d.venta})`).join(', ')}
            </div>
          )}
        </div>

        {/* Información General de la Venta */}
        <div style={{ 
          marginBottom: '2rem', 
          padding: '1.5rem', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '8px',
          border: '1px solid #e0e0e0'
        }}>
          <h3 style={{ 
            marginTop: 0, 
            marginBottom: '1rem', 
            color: '#333',
            borderBottom: '2px solid #4f46e5',
            paddingBottom: '0.5rem',
            fontSize: '1.2em'
          }}>
            📋 Información General
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div><strong>ID Venta:</strong> #{rowDataDescripcion.id}</div>
            <div>
              <strong>Estado:</strong> 
              <span style={{ 
                marginLeft: '8px',
                padding: '4px 12px', 
                borderRadius: '4px', 
                backgroundColor: rowDataDescripcion.estado === 'entregado' ? '#d4edda' : 
                               rowDataDescripcion.estado === 'cancelado' ? '#fff3cd' : '#d1ecf1',
                color: rowDataDescripcion.estado === 'entregado' ? '#155724' : 
                       rowDataDescripcion.estado === 'cancelado' ? '#856404' : '#0c5460'
              }}>
                {rowDataDescripcion.estado}
              </span>
            </div>
            <div><strong>Fecha Venta:</strong> {formatearFecha(rowDataDescripcion.fecha_venta)}</div>
            <div><strong>Fecha Entrega:</strong> {formatearFecha(rowDataDescripcion.fecha_entrega_estimada)}</div>
          </div>
        </div>

        {/* Información del Cliente */}
        <div style={{ 
          marginBottom: '2rem', 
          padding: '1.5rem', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '8px',
          border: '1px solid #e0e0e0'
        }}>
          <h3 style={{ 
            marginTop: 0, 
            marginBottom: '1rem', 
            color: '#333',
            borderBottom: '2px solid #4f46e5',
            paddingBottom: '0.5rem',
            fontSize: '1.2em'
          }}>
            👤 Información del Cliente
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div><strong>Nombre:</strong> {rowDataDescripcion.cliente?.nombre || 'N/A'}</div>
            <div><strong>Apellido:</strong> {rowDataDescripcion.cliente?.apellido || 'N/A'}</div>
            <div><strong>Identificación:</strong> {rowDataDescripcion.cliente?.identificacion || 'N/A'}</div>
            <div><strong>Total Ventas Cliente:</strong> {rowDataDescripcion.cliente?.total_ventas || 0}</div>
          </div>
        </div>

        {/* Detalles de Ventas */}
        <div style={{ 
          marginBottom: '2rem', 
          padding: '1.5rem', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '8px',
          border: '1px solid #e0e0e0'
        }}>
          <h3 style={{ 
            marginTop: 0, 
            marginBottom: '1rem', 
            color: '#333',
            borderBottom: '2px solid #4f46e5',
            paddingBottom: '0.5rem',
            fontSize: '1.2em'
          }}>
            📦 Detalles de Venta ({detallesVenta.length} items)
          </h3>
          
          {detallesVenta.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse',
                backgroundColor: 'white',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#4f46e5', color: 'white' }}>
                    <th style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #ddd', fontSize: '0.9em', width: '10%' }}>ID Venta</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #ddd', fontSize: '0.9em', width: '60%' }}>Productos</th>
                    <th style={{ padding: '0.75rem', textAlign: 'center', border: '1px solid #ddd', fontSize: '0.9em', width: '15%' }}>Cantidad</th>
                  </tr>
                </thead>
                <tbody>
                  {detallesVenta.map((detalle, index) => {
                    return (
                      <tr key={detalle.id ?? detalle.producto?.id ?? index} style={{ 
                        backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white'
                      }}>
                        <td style={{ padding: '0.75rem', border: '1px solid #ddd', verticalAlign: 'top' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '4px 10px',
                            borderRadius: '4px',
                            backgroundColor: '#dbeafe',
                            fontSize: '0.9em',
                            fontWeight: '500',
                            color: '#1e40af'
                          }}>
                            #{detalle.venta || 'N/A'}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>
                          <div style={{ 
                            backgroundColor: '#f9fafb',
                            padding: '0.75rem',
                            borderRadius: '6px',
                            border: '1px solid #e5e7eb'
                          }}>
                            {detalle.producto ? (
                              <div style={{ fontSize: '0.9em', lineHeight: '1.6' }}>
                                <p style={{ margin: '0.25rem 0' }}>
                                  <strong style={{ color: '#4f46e5' }}>Producto ID:</strong> #{detalle.producto.id}
                                </p>
                                <p style={{ margin: '0.25rem 0' }}>
                                  <strong style={{ color: '#4f46e5' }}>Categoría:</strong> {detalle.producto.categoria?.nombre || 'N/A'}
                                </p>
                                <p style={{ margin: '0.25rem 0' }}>
                                  <strong style={{ color: '#4f46e5' }}>Tipo:</strong> {detalle.producto.tipo || 'N/A'}
                                </p>
                                <p style={{ margin: '0.25rem 0' }}>
                                  <strong style={{ color: '#4f46e5' }}>Modelo:</strong> {detalle.producto.modelo || 'N/A'}
                                </p>
                                <p style={{ margin: '0.25rem 0' }}>
                                  <strong style={{ color: '#4f46e5' }}>Color Principal:</strong> 
                                  <span style={{
                                    marginLeft: '0.5rem',
                                    padding: '2px 8px',
                                    borderRadius: '4px',
                                    backgroundColor: '#e5e7eb',
                                    fontSize: '0.85em'
                                  }}>
                                    {detalle.producto.colorPrincipal || 'N/A'}
                                  </span>
                                </p>
                                <p style={{ margin: '0.25rem 0' }}>
                                  <strong style={{ color: '#4f46e5' }}>Color Tejido:</strong> 
                                  <span style={{
                                    marginLeft: '0.5rem',
                                    padding: '2px 8px',
                                    borderRadius: '4px',
                                    backgroundColor: '#e5e7eb',
                                    fontSize: '0.85em'
                                  }}>
                                    {detalle.producto.colorTejido || 'N/A'}
                                  </span>
                                </p>
                                <p style={{ margin: '0.25rem 0' }}>
                                  <strong style={{ color: '#4f46e5' }}>Precio:</strong> ${formatearNumero(detalle.producto.precio || 0)}
                                </p>
                                {detalle.producto.observaciones && detalle.producto.observaciones !== 'No hay Observaciones' && (
                                  <p style={{ 
                                    margin: '0.5rem 0 0.25rem 0',
                                    paddingTop: '0.5rem',
                                    borderTop: '1px dashed #d1d5db',
                                    fontStyle: 'italic',
                                    color: '#6b7280'
                                  }}>
                                    <strong style={{ color: '#4f46e5' }}>Observaciones:</strong> {detalle.producto.observaciones}
                                  </p>
                                )}
                                
                                {/* Botón para ver unidades */}
                                <div style={{ 
                                  marginTop: '0.75rem',
                                  paddingTop: '0.75rem',
                                  borderTop: '1px solid #e5e7eb'
                                }}>
                                  <Button
                                    label="Ver Unidades"
                                    icon="pi pi-box"
                                    size="small"
                                    severity="info"
                                    outlined
                                    onClick={() => cargarUnidadesProducto(
                                      detalle.producto.id, 
                                      detalle.producto, 
                                      detalle.id,
                                      detalle.venta
                                    )}
                                    style={{
                                      width: '100%',
                                      justifyContent: 'center'
                                    }}
                                  />
                                </div>
                              </div>
                            ) : (
                              <div style={{ 
                                padding: '1rem',
                                textAlign: 'center',
                                color: '#9ca3af',
                                fontStyle: 'italic'
                              }}>
                                <p style={{ margin: 0 }}>Información del producto no disponible</p>
                                <p style={{ margin: '0.25rem 0', fontSize: '0.85em' }}>
                                  ID Producto: #{detalle.producto_id || 'N/A'}
                                </p>
                              </div>
                            )}
                          </div>
                        </td>
                        <td style={{ 
                          padding: '0.75rem', 
                          textAlign: 'center', 
                          border: '1px solid #ddd',
                          fontWeight: 'bold',
                          fontSize: '1.1em',
                          color: '#059669',
                          verticalAlign: 'middle'
                        }}>
                          <div style={{
                            display: 'inline-block',
                            padding: '0.5rem 1rem',
                            backgroundColor: '#d1fae5',
                            borderRadius: '8px',
                            border: '2px solid #10b981'
                          }}>
                            {detalle.cantidad || 0}
                          </div>
                          <div style={{ 
                            fontSize: '0.75em', 
                            color: '#6b7280',
                            marginTop: '0.25rem'
                          }}>
                            unidades
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  <tr style={{ 
                    backgroundColor: '#e0f2fe',
                    fontWeight: 'bold',
                    fontSize: '1.05em'
                  }}>
                    <td colSpan="2" style={{ 
                      padding: '1rem', 
                      textAlign: 'right', 
                      border: '1px solid #ddd'
                    }}>
                      Total de Unidades:
                    </td>
                    <td style={{ 
                      padding: '1rem', 
                      textAlign: 'center', 
                      border: '1px solid #ddd',
                      fontSize: '1.2em',
                      color: '#059669',
                      fontWeight: 'bold'
                    }}>
                      <div style={{
                        display: 'inline-block',
                        padding: '0.5rem 1rem',
                        backgroundColor: '#d1fae5',
                        borderRadius: '8px',
                        border: '2px solid #10b981'
                      }}>
                        {detallesVenta.reduce((sum, detalle) => sum + (detalle.cantidad || 0), 0)}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ 
              padding: '2rem', 
              textAlign: 'center', 
              backgroundColor: 'white',
              borderRadius: '4px',
              border: '1px dashed #ccc'
            }}>
              <p style={{ color: '#666', fontStyle: 'italic', margin: 0 }}>
                No hay detalles de venta registrados
              </p>
            </div>
          )}
        </div>

        {/* Información de Abonos */}
        <div style={{ 
          marginBottom: '2rem', 
          padding: '1.5rem', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '8px',
          border: '1px solid #e0e0e0'
        }}>
          <h3 style={{ 
            marginTop: 0, 
            marginBottom: '1rem', 
            color: '#333',
            borderBottom: '2px solid #4f46e5',
            paddingBottom: '0.5rem',
            fontSize: '1.2em'
          }}>
            💰 Historial de Abonos ({abonosVenta.length})
          </h3>
          {abonosVenta.length > 0 ? (
            <>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ 
                  width: '100%', 
                  borderCollapse: 'collapse',
                  backgroundColor: 'white',
                  marginBottom: '1rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                  <thead>
                    <tr style={{ backgroundColor: '#4f46e5', color: 'white' }}>
                      <th style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #ddd' }}>ID Abono</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #ddd' }}>ID Venta</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #ddd' }}>Fecha</th>
                      <th style={{ padding: '0.75rem', textAlign: 'right', border: '1px solid #ddd' }}>Monto</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #ddd' }}>Método</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #ddd' }}>Comentario</th>
                    </tr>
                  </thead>
                  <tbody>
                    {abonosVenta.map((abono, index) => (
                      <tr key={index} style={{ 
                        backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white'
                      }}>
                        <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>
                          <strong>#{abono.id || 'N/A'}</strong>
                        </td>
                        <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '4px 10px',
                            borderRadius: '4px',
                            backgroundColor: '#dbeafe',
                            fontSize: '0.9em',
                            fontWeight: '500',
                            color: '#1e40af'
                          }}>
                            Venta #{abono.venta || 'N/A'}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>
                          {formatearFecha(abono.fecha_abono)}
                        </td>
                        <td style={{ 
                          padding: '0.75rem', 
                          textAlign: 'right', 
                          border: '1px solid #ddd',
                          color: '#16a34a',
                          fontWeight: 'bold'
                        }}>
                          ${formatearNumero(abono.monto_abonado)}
                        </td>
                        <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>
                          {abono.metodo_pago || 'No especificado'}
                        </td>
                        <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>
                          {abono.comentario || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ 
                padding: '1rem', 
                backgroundColor: '#d1fae5', 
                borderRadius: '6px',
                textAlign: 'right',
                fontWeight: 'bold',
                fontSize: '1.1em',
                border: '2px solid #10b981'
              }}>
                Total Abonado: ${formatearNumero(totalAbonado)}
              </div>
            </>
          ) : (
            <div style={{ 
              padding: '2rem', 
              textAlign: 'center', 
              backgroundColor: 'white',
              borderRadius: '4px',
              border: '1px dashed #ccc'
            }}>
              <p style={{ color: '#666', fontStyle: 'italic', margin: 0 }}>
                No hay abonos registrados para esta venta
              </p>
            </div>
          )}
        </div>

        {/* Resumen Financiero */}
        <div style={{ 
          padding: '1.5rem', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '8px',
          border: '2px solid #4f46e5',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ 
            marginTop: 0, 
            marginBottom: '1rem', 
            color: '#333',
            borderBottom: '2px solid #4f46e5',
            paddingBottom: '0.5rem',
            fontSize: '1.2em'
          }}>
            💵 Resumen Financiero
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '1.1em' }}>
            <div><strong>Total de la Venta:</strong></div>
            <div style={{ textAlign: 'right', color: '#1e40af', fontWeight: 'bold' }}>
              ${formatearNumero(rowDataDescripcion.total)}
            </div>
            
            <div><strong>Total Abonado:</strong></div>
            <div style={{ textAlign: 'right', color: '#16a34a', fontWeight: 'bold' }}>
              ${formatearNumero(totalAbonado)}
            </div>
            
            <div style={{ 
              paddingTop: '0.75rem', 
              borderTop: '2px solid #4f46e5',
              fontWeight: 'bold',
              fontSize: '1.3em'
            }}>
              Saldo Pendiente:
            </div>
            <div style={{ 
              textAlign: 'right', 
              paddingTop: '0.75rem', 
              borderTop: '2px solid #4f46e5',
              fontWeight: 'bold',
              fontSize: '1.3em',
              color: rowDataDescripcion.debe > 0 ? '#dc2626' : '#16a34a'
            }}>
              ${formatearNumero(rowDataDescripcion.debe)}
            </div>
          </div>
        </div>

        {/* Comentarios */}
        {rowDataDescripcion.comentarios && rowDataDescripcion.comentarios.trim() !== '' && (
          <div style={{ 
            marginTop: '2rem',
            padding: '1.5rem', 
            backgroundColor: '#fffbeb', 
            borderRadius: '8px',
            border: '1px solid #fbbf24'
          }}>
            <h3 style={{ 
              marginTop: 0, 
              marginBottom: '0.75rem', 
              color: '#333',
              fontSize: '1.1em'
            }}>
              📝 Comentarios
            </h3>
            <p style={{ 
              margin: 0, 
              whiteSpace: 'pre-wrap',
              color: '#666',
              lineHeight: '1.6'
            }}>
              {rowDataDescripcion.comentarios}
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="card">
      <DataTable 
        value={Ventas} 
        paginator 
        rows={5} 
        header={<HeaderTable nombre="Ventas" mostrarModal={setMostrarModal} />} 
        resizableColumns 
        showGridlines 
        tableStyle={{ minWidth: '50rem' }}
      >
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
        <VentasForm mostrarModal={setMostrarModal} cargarVentas={cargarVentas} />
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
        <VentasFormEdit rowData={rowDataEditar} setRowDataEditar={setRowDataEditar} cargarVentas={cargarVentas} mostrarModal={setMostrarModalEditar}/>
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
        breakpoints={{'960px': '90vw','640px': '95vw'}}
        style={{width: '80vw'}}
        contentStyle={{ maxHeight: '85vh', overflowY: 'auto' }}
      >
        {renderModalDescripcion()}
      </Dialog>

      <Dialog
        header={`Unidades del Producto ${productoSeleccionado ? `#${productoSeleccionado.id}` : ''}`}
        visible={mostrarModalUnidades}
        onHide={() => {
          setMostrarModalUnidades(false);
          setUnidadesProducto([]);
          setProductoSeleccionado(null);
        }}
        breakpoints={{'960px': '85vw','640px': '95vw'}}
        style={{width: '70vw'}}
        contentStyle={{ maxHeight: '80vh', overflowY: 'auto' }}
      >
        {renderModalUnidades()}
      </Dialog>

    </div>
  )

}

export default VentasTable;
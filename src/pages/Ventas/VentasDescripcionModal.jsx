import { Button } from 'primereact/button';
import { StatusBadge } from "../../components/ui/table";
import { formatearFecha, formatearNumero } from "../../utils/formatters";

const VentasDescripcionModal = ({ rowData, abonosVenta, detallesVenta, loading, onVerUnidades }) => {
  if (!rowData) return <p>No hay datos para mostrar</p>;

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem' }}>
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mb-4"></div>
        <p style={{ color: '#666', fontSize: '1.1em' }}>Cargando información detallada...</p>
      </div>
    );
  }

  const totalAbonado = abonosVenta.reduce((sum, a) => sum + parseFloat(a.monto_abonado || 0), 0);

  return (
    <div style={{ padding: '1rem' }}>

      {/* Información General */}
      <div style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
        <h3 style={{ marginTop: 0, marginBottom: '1rem', color: '#333', borderBottom: '2px solid #4f46e5', paddingBottom: '0.5rem', fontSize: '1.2em' }}>
          Información General
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div><strong>ID Venta:</strong> #{rowData.id}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <strong>Estado:</strong> <StatusBadge value={rowData.estado} />
          </div>
          <div><strong>Fecha Venta:</strong> {formatearFecha(rowData.fecha_venta)}</div>
          <div><strong>Fecha Entrega:</strong> {formatearFecha(rowData.fecha_entrega_estimada)}</div>
        </div>
      </div>

      {/* Información del Cliente */}
      <div style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
        <h3 style={{ marginTop: 0, marginBottom: '1rem', color: '#333', borderBottom: '2px solid #4f46e5', paddingBottom: '0.5rem', fontSize: '1.2em' }}>
          Información del Cliente
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div><strong>Nombre:</strong> {rowData.cliente?.nombre || 'N/A'}</div>
          <div><strong>Apellido:</strong> {rowData.cliente?.apellido || 'N/A'}</div>
          <div><strong>Identificación:</strong> {rowData.cliente?.identificacion || 'N/A'}</div>
          <div><strong>Total Ventas:</strong> {rowData.cliente?.total_ventas || 0}</div>
        </div>
      </div>

      {/* Detalles de Venta */}
      <div style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
        <h3 style={{ marginTop: 0, marginBottom: '1rem', color: '#333', borderBottom: '2px solid #4f46e5', paddingBottom: '0.5rem', fontSize: '1.2em' }}>
          Detalles de Venta ({detallesVenta.length} items)
        </h3>
        {detallesVenta.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <thead>
                <tr style={{ backgroundColor: '#4f46e5', color: 'white' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #ddd', fontSize: '0.9em', width: '10%' }}>ID Venta</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #ddd', fontSize: '0.9em', width: '60%' }}>Productos</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', border: '1px solid #ddd', fontSize: '0.9em', width: '15%' }}>Cantidad</th>
                </tr>
              </thead>
              <tbody>
                {detallesVenta.map((detalle, index) => (
                  <tr key={detalle.id ?? detalle.producto?.id ?? index} style={{ backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white' }}>
                    <td style={{ padding: '0.75rem', border: '1px solid #ddd', verticalAlign: 'top' }}>
                      <span style={{ display: 'inline-block', padding: '4px 10px', borderRadius: '4px', backgroundColor: '#dbeafe', fontSize: '0.9em', fontWeight: '500', color: '#1e40af' }}>
                        #{detalle.venta || 'N/A'}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>
                      <div style={{ backgroundColor: '#f9fafb', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                        {detalle.producto ? (
                          <div style={{ fontSize: '0.9em', lineHeight: '1.6' }}>
                            <p style={{ margin: '0.25rem 0' }}><strong style={{ color: '#4f46e5' }}>Producto ID:</strong> #{detalle.producto.id}</p>
                            <p style={{ margin: '0.25rem 0' }}><strong style={{ color: '#4f46e5' }}>Categoría:</strong> {detalle.producto.categoria?.nombre || 'N/A'}</p>
                            <p style={{ margin: '0.25rem 0' }}><strong style={{ color: '#4f46e5' }}>Tipo:</strong> {detalle.producto.tipo || 'N/A'}</p>
                            <p style={{ margin: '0.25rem 0' }}><strong style={{ color: '#4f46e5' }}>Modelo:</strong> {detalle.producto.modelo || 'N/A'}</p>
                            <p style={{ margin: '0.25rem 0' }}>
                              <strong style={{ color: '#4f46e5' }}>Color Principal:</strong>
                              <span style={{ marginLeft: '0.5rem', padding: '2px 8px', borderRadius: '4px', backgroundColor: '#e5e7eb', fontSize: '0.85em' }}>
                                {detalle.producto.colorPrincipal || 'N/A'}
                              </span>
                            </p>
                            <p style={{ margin: '0.25rem 0' }}>
                              <strong style={{ color: '#4f46e5' }}>Color Tejido:</strong>
                              <span style={{ marginLeft: '0.5rem', padding: '2px 8px', borderRadius: '4px', backgroundColor: '#e5e7eb', fontSize: '0.85em' }}>
                                {detalle.producto.colorTejido || 'N/A'}
                              </span>
                            </p>
                            <p style={{ margin: '0.25rem 0' }}><strong style={{ color: '#4f46e5' }}>Precio:</strong> ${formatearNumero(detalle.producto.precio || 0)}</p>
                            {detalle.producto.observaciones && detalle.producto.observaciones !== 'No hay Observaciones' && (
                              <p style={{ margin: '0.5rem 0 0.25rem 0', paddingTop: '0.5rem', borderTop: '1px dashed #d1d5db', fontStyle: 'italic', color: '#6b7280' }}>
                                <strong style={{ color: '#4f46e5' }}>Observaciones:</strong> {detalle.producto.observaciones}
                              </p>
                            )}
                            <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #e5e7eb' }}>
                              <Button
                                label="Ver Unidades"
                                icon="pi pi-box"
                                size="small"
                                severity="info"
                                outlined
                                onClick={() => onVerUnidades(detalle.producto.id, detalle.producto, detalle.id, detalle.venta)}
                                style={{ width: '100%', justifyContent: 'center' }}
                              />
                            </div>
                          </div>
                        ) : (
                          <div style={{ padding: '1rem', textAlign: 'center', color: '#9ca3af', fontStyle: 'italic' }}>
                            <p style={{ margin: 0 }}>Información del producto no disponible</p>
                            <p style={{ margin: '0.25rem 0', fontSize: '0.85em' }}>ID Producto: #{detalle.producto_id || 'N/A'}</p>
                          </div>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'center', border: '1px solid #ddd', fontWeight: 'bold', fontSize: '1.1em', color: '#059669', verticalAlign: 'middle' }}>
                      <div style={{ display: 'inline-block', padding: '0.5rem 1rem', backgroundColor: '#d1fae5', borderRadius: '8px', border: '2px solid #10b981' }}>
                        {detalle.cantidad || 0}
                      </div>
                      <div style={{ fontSize: '0.75em', color: '#6b7280', marginTop: '0.25rem' }}>unidades</div>
                    </td>
                  </tr>
                ))}
                <tr style={{ backgroundColor: '#e0f2fe', fontWeight: 'bold', fontSize: '1.05em' }}>
                  <td colSpan="2" style={{ padding: '1rem', textAlign: 'right', border: '1px solid #ddd' }}>Total de Unidades:</td>
                  <td style={{ padding: '1rem', textAlign: 'center', border: '1px solid #ddd', fontSize: '1.2em', color: '#059669', fontWeight: 'bold' }}>
                    <div style={{ display: 'inline-block', padding: '0.5rem 1rem', backgroundColor: '#d1fae5', borderRadius: '8px', border: '2px solid #10b981' }}>
                      {detallesVenta.reduce((sum, d) => sum + (d.cantidad || 0), 0)}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: 'white', borderRadius: '4px', border: '1px dashed #ccc' }}>
            <p style={{ color: '#666', fontStyle: 'italic', margin: 0 }}>No hay detalles de venta registrados</p>
          </div>
        )}
      </div>

      {/* Historial de Abonos */}
      <div style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
        <h3 style={{ marginTop: 0, marginBottom: '1rem', color: '#333', borderBottom: '2px solid #4f46e5', paddingBottom: '0.5rem', fontSize: '1.2em' }}>
          Historial de Abonos ({abonosVenta.length})
        </h3>
        {abonosVenta.length > 0 ? (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', marginBottom: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
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
                    <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white' }}>
                      <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}><strong>#{abono.id || 'N/A'}</strong></td>
                      <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>
                        <span style={{ display: 'inline-block', padding: '4px 10px', borderRadius: '4px', backgroundColor: '#dbeafe', fontSize: '0.9em', fontWeight: '500', color: '#1e40af' }}>
                          Venta #{abono.venta || 'N/A'}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>{formatearFecha(abono.fecha_abono)}</td>
                      <td style={{ padding: '0.75rem', textAlign: 'right', border: '1px solid #ddd', color: '#16a34a', fontWeight: 'bold' }}>${formatearNumero(abono.monto_abonado)}</td>
                      <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>{abono.metodo_pago || 'No especificado'}</td>
                      <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>{abono.comentario || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ padding: '1rem', backgroundColor: '#d1fae5', borderRadius: '6px', textAlign: 'right', fontWeight: 'bold', fontSize: '1.1em', border: '2px solid #10b981' }}>
              Total Abonado: ${formatearNumero(totalAbonado)}
            </div>
          </>
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: 'white', borderRadius: '4px', border: '1px dashed #ccc' }}>
            <p style={{ color: '#666', fontStyle: 'italic', margin: 0 }}>No hay abonos registrados para esta venta</p>
          </div>
        )}
      </div>

      {/* Resumen Financiero */}
      <div style={{ padding: '1.5rem', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '2px solid #4f46e5', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <h3 style={{ marginTop: 0, marginBottom: '1rem', color: '#333', borderBottom: '2px solid #4f46e5', paddingBottom: '0.5rem', fontSize: '1.2em' }}>
          Resumen Financiero
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '1.1em' }}>
          <div><strong>Total de la Venta:</strong></div>
          <div style={{ textAlign: 'right', color: '#1e40af', fontWeight: 'bold' }}>${formatearNumero(rowData.total)}</div>
          <div><strong>Total Abonado:</strong></div>
          <div style={{ textAlign: 'right', color: '#16a34a', fontWeight: 'bold' }}>${formatearNumero(totalAbonado)}</div>
          <div style={{ paddingTop: '0.75rem', borderTop: '2px solid #4f46e5', fontWeight: 'bold', fontSize: '1.3em' }}>Saldo Pendiente:</div>
          <div style={{ textAlign: 'right', paddingTop: '0.75rem', borderTop: '2px solid #4f46e5', fontWeight: 'bold', fontSize: '1.3em', color: rowData.debe > 0 ? '#dc2626' : '#16a34a' }}>
            ${formatearNumero(rowData.debe)}
          </div>
        </div>
      </div>

      {/* Comentarios */}
      {rowData.comentarios?.trim() && (
        <div style={{ marginTop: '2rem', padding: '1.5rem', backgroundColor: '#fffbeb', borderRadius: '8px', border: '1px solid #fbbf24' }}>
          <h3 style={{ marginTop: 0, marginBottom: '0.75rem', color: '#333', fontSize: '1.1em' }}>Comentarios</h3>
          <p style={{ margin: 0, whiteSpace: 'pre-wrap', color: '#666', lineHeight: '1.6' }}>{rowData.comentarios}</p>
        </div>
      )}
    </div>
  );
};

export default VentasDescripcionModal;

import { StatusBadge } from "../../components/ui/table";
import { formatearFecha } from "../../utils/formatters";

const VentasUnidadesModal = ({ productoSeleccionado, unidadesProducto, loading }) => {
  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem' }}>
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mb-4"></div>
        <p style={{ color: '#666', fontSize: '1.1em' }}>Cargando unidades del producto...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '1rem' }}>
      {productoSeleccionado && (
        <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f0f9ff', borderRadius: '8px', border: '2px solid #3b82f6' }}>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#1e40af' }}>
            Producto: {productoSeleccionado.tipo} - {productoSeleccionado.modelo}
          </h4>
          <p style={{ margin: '0.25rem 0', fontSize: '0.9em', color: '#64748b' }}>
            <strong>ID:</strong> #{productoSeleccionado.id} | <strong>Color:</strong> {productoSeleccionado.colorPrincipal}
          </p>
        </div>
      )}

      {unidadesProducto.length > 0 ? (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
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
                <tr key={unidad.id ?? unidad.numeroSerie ?? index} style={{ backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white' }}>
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>
                    <strong style={{ color: '#4f46e5' }}>#{unidad.id || 'N/A'}</strong>
                  </td>
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>
                    <code style={{ padding: '4px 8px', backgroundColor: '#f1f5f9', borderRadius: '4px', fontSize: '0.95em', fontFamily: 'monospace', fontWeight: '600', color: '#1e293b' }}>
                      {unidad.numeroSerie || 'N/A'}
                    </code>
                  </td>
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd', textAlign: 'center' }}>
                    <StatusBadge value={unidad.estado} />
                  </td>
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>
                    {formatearFecha(unidad.fechaCreacion)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#e0f2fe', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '2px solid #3b82f6' }}>
            <span style={{ fontWeight: 'bold', fontSize: '1.1em' }}>Total de Unidades:</span>
            <span style={{ fontWeight: 'bold', fontSize: '1.3em', color: '#1e40af' }}>{unidadesProducto.length}</span>
          </div>
        </div>
      ) : (
        <div style={{ padding: '3rem', textAlign: 'center', backgroundColor: 'white', borderRadius: '8px', border: '2px dashed #cbd5e1' }}>
          <p style={{ color: '#64748b', fontStyle: 'italic', margin: 0, fontSize: '1.1em', fontWeight: '500' }}>
            No hay unidades registradas para este producto en esta venta
          </p>
        </div>
      )}
    </div>
  );
};

export default VentasUnidadesModal;

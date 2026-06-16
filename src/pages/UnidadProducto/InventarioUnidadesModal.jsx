import { useEffect, useMemo, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import UnidadProductoService from '../../services/UnidadProductoService';

const ESTADOS = {
  disponible: { color: '#10b981', bg: '#d1fae5', label: 'Disponible' },
  vendido: { color: '#ef4444', bg: '#fee2e2', label: 'Vendido' },
  reservado: { color: '#f59e0b', bg: '#fef3c7', label: 'Reservado' },
  mantenimiento: { color: '#6366f1', bg: '#e0e7ff', label: 'Mantenimiento' },
};

const EstadoBadge = ({ estado }) => {
  const config = ESTADOS[estado?.toLowerCase()] || {
    color: '#6b7280',
    bg: '#f3f4f6',
    label: estado || 'Desconocido',
  };

  return (
    <span
      style={{
        backgroundColor: config.bg,
        color: config.color,
        padding: '0.25rem 0.75rem',
        borderRadius: '9999px',
        fontSize: '0.8rem',
        fontWeight: '600',
        display: 'inline-block',
      }}
    >
      {config.label}
    </span>
  );
};

const InventarioUnidadesModal = ({ visible, onHide, productos = [] }) => {
  const [unidades, setUnidades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');

  useEffect(() => {
    if (!visible) return;

    const cargar = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await UnidadProductoService.getAllUnidadProductos();
        const vendida = (data || []).find(u => u.estado === 'vendido');
        console.log('🔍 Unidad vendida (raw):', JSON.stringify(vendida, null, 2));
        setUnidades(data || []);
      } catch (err) {
        setError(err.message || 'Error al cargar unidades');
        setUnidades([]);
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, [visible]);

  const filas = useMemo(() => {
    return unidades.map(u => {
      const productoRef = u.producto;
      const producto = productoRef && typeof productoRef === 'object'
        ? productoRef
        : productos.find(p => Number(p.id) === Number(productoRef));

      // El backend puede exponer el cliente directamente en la unidad
      // o anidado dentro del objeto venta
      let clienteNombre = null;
      if (u.cliente && typeof u.cliente === 'object') {
        clienteNombre = `${u.cliente.nombre || ''} ${u.cliente.apellido || ''}`.trim() || null;
      } else if (u.venta && typeof u.venta === 'object' && u.venta.cliente) {
        const c = u.venta.cliente;
        if (typeof c === 'object') {
          clienteNombre = `${c.nombre || ''} ${c.apellido || ''}`.trim() || null;
        } else {
          clienteNombre = String(c);
        }
      }

      return {
        id: u.id,
        numeroSerie: u.numeroSerie,
        estado: u.estado,
        fechaCreacion: u.fechaCreacion,
        nombreProducto: producto ? `${producto.tipo} - ${producto.modelo}` : `Producto #${productoRef}`,
        cliente: clienteNombre,
      };
    });
  }, [unidades, productos]);

  const totales = useMemo(() => {
    const conteo = { total: filas.length, disponible: 0, vendido: 0, reservado: 0, mantenimiento: 0 };
    filas.forEach(f => {
      const estado = f.estado?.toLowerCase();
      if (conteo[estado] !== undefined) conteo[estado] += 1;
    });
    return conteo;
  }, [filas]);

  const filtradas = filas.filter(f => {
    const q = busqueda.toLowerCase();
    const coincideBusqueda = !q
      || f.nombreProducto.toLowerCase().includes(q)
      || f.numeroSerie?.toLowerCase().includes(q)
      || f.cliente?.toLowerCase().includes(q)
      || String(f.id).includes(q);
    const coincideEstado = filtroEstado === 'todos' || f.estado?.toLowerCase() === filtroEstado;
    return coincideBusqueda && coincideEstado;
  });

  const filtros = [
    { key: 'todos', label: 'Todas', count: totales.total, color: '#475569', bg: '#f1f5f9' },
    { key: 'disponible', label: 'Disponibles', count: totales.disponible, color: '#10b981', bg: '#d1fae5' },
    { key: 'vendido', label: 'Vendidas', count: totales.vendido, color: '#ef4444', bg: '#fee2e2' },
    { key: 'reservado', label: 'Reservadas', count: totales.reservado, color: '#f59e0b', bg: '#fef3c7' },
    { key: 'mantenimiento', label: 'Mantenimiento', count: totales.mantenimiento, color: '#6366f1', bg: '#e0e7ff' },
  ];

  return (
    <Dialog
      header={
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <i className="pi pi-box" style={{ color: '#4f46e5' }}></i>
          <span>Inventario de Unidades</span>
        </div>
      }
      visible={visible}
      onHide={onHide}
      breakpoints={{ '960px': '85vw', '640px': '95vw' }}
      style={{ width: '70vw' }}
      contentStyle={{ maxHeight: '80vh', overflowY: 'auto' }}
    >
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center' }}>
          <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem', color: '#4f46e5' }}></i>
          <p style={{ marginTop: '1rem', color: '#6b7280' }}>Cargando unidades...</p>
        </div>
      ) : error ? (
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          backgroundColor: '#fee2e2',
          borderRadius: '0.5rem',
          color: '#dc2626',
        }}>
          <i className="pi pi-exclamation-triangle" style={{ fontSize: '2rem', marginBottom: '1rem' }}></i>
          <p><strong>Error:</strong> {error}</p>
        </div>
      ) : (
        <>
          {/* Filtros por estado */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            {filtros.map(f => (
              <button
                key={f.key}
                onClick={() => setFiltroEstado(f.key)}
                style={{
                  border: filtroEstado === f.key ? `2px solid ${f.color}` : '1px solid #e5e7eb',
                  backgroundColor: f.bg,
                  color: f.color,
                  borderRadius: '9999px',
                  padding: '0.4rem 0.9rem',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {f.label} ({f.count})
              </button>
            ))}
          </div>

          {/* Búsqueda */}
          <input
            type="text"
            placeholder="Buscar por producto, número de serie o ID..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            style={{
              width: '100%',
              padding: '0.6rem 1rem',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
              marginBottom: '1rem',
              fontSize: '0.9rem',
              outline: 'none',
            }}
          />

          {filtradas.length === 0 ? (
            <div style={{
              padding: '3rem',
              textAlign: 'center',
              backgroundColor: '#f9fafb',
              borderRadius: '0.5rem',
            }}>
              <i className="pi pi-inbox" style={{ fontSize: '3rem', color: '#d1d5db', marginBottom: '1rem' }}></i>
              <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>No se encontraron unidades</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white' }}>
                <thead>
                  <tr style={{ backgroundColor: '#4f46e5', color: 'white' }}>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>ID</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Producto</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Número de Serie</th>
                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600' }}>Estado</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Cliente</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Fecha Creación</th>
                  </tr>
                </thead>
                <tbody>
                  {filtradas.map((u, index) => (
                    <tr
                      key={u.id}
                      style={{
                        backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9fafb',
                        transition: 'background-color 0.2s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#ffffff' : '#f9fafb'}
                    >
                      <td style={{ padding: '1rem', border: '1px solid #e5e7eb', fontWeight: '500', color: '#4f46e5' }}>
                        #{u.id}
                      </td>
                      <td style={{ padding: '1rem', border: '1px solid #e5e7eb', fontWeight: '500', color: '#0f172a' }}>
                        {u.nombreProducto}
                      </td>
                      <td style={{ padding: '1rem', border: '1px solid #e5e7eb', fontFamily: 'monospace', fontSize: '0.95rem' }}>
                        {u.numeroSerie || <span style={{ color: '#9ca3af' }}>Sin número de serie</span>}
                      </td>
                      <td style={{ padding: '1rem', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                        <EstadoBadge estado={u.estado} />
                      </td>
                      <td style={{ padding: '1rem', border: '1px solid #e5e7eb', color: '#0f172a', fontWeight: u.cliente ? 500 : 400 }}>
                        {u.cliente || <span style={{ color: '#9ca3af' }}>—</span>}
                      </td>
                      <td style={{ padding: '1rem', border: '1px solid #e5e7eb', color: '#6b7280' }}>
                        {u.fechaCreacion ? new Date(u.fechaCreacion).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        }) : <span style={{ color: '#9ca3af' }}>No disponible</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        marginTop: '1.5rem',
        paddingTop: '1rem',
        borderTop: '1px solid #e5e7eb',
      }}>
        <Button
          label="Cerrar"
          icon="pi pi-times"
          onClick={onHide}
          severity="secondary"
        />
      </div>
    </Dialog>
  );
};

export default InventarioUnidadesModal;

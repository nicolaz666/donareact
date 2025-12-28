import { useEffect, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import UnidadProductoService from '../../services/UnidadProductoService';

const UnidadProducto = ({ visible, onHide, producto }) => {
  const [unidades, setUnidades] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!visible) return;
    const cargar = async () => {
      setLoading(true);
      try {
        const data = await UnidadProductoService.getAllUnidadProductos();
        // Filtrar por producto si se pasó
        const filtradas = producto ? data.filter(u => Number(u.producto) === Number(producto.id)) : data;
        setUnidades(filtradas);
      } catch (err) {
        console.error('Error cargando unidades:', err);
        setUnidades([]);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [visible, producto]);

  return (
    <Dialog
      header={producto ? `Unidades del Producto #${producto.id}` : 'Unidades del Producto'}
      visible={visible}
      onHide={onHide}
      breakpoints={{'960px': '85vw','640px': '95vw'}}
      style={{ width: '70vw' }}
      contentStyle={{ maxHeight: '80vh', overflowY: 'auto' }}
    >
      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando unidades...</div>
      ) : unidades.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center' }}>No hay unidades registradas para este producto</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#4f46e5', color: 'white' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>ID</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Número de Serie</th>
                <th style={{ padding: '0.75rem', textAlign: 'center' }}>Estado</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Fecha Creación</th>
              </tr>
            </thead>
            <tbody>
              {unidades.map((u) => (
                <tr key={u.id} style={{ backgroundColor: '#fff' }}>
                  <td style={{ padding: '0.75rem', border: '1px solid #eee' }}>#{u.id}</td>
                  <td style={{ padding: '0.75rem', border: '1px solid #eee' }}>{u.numeroSerie || 'N/A'}</td>
                  <td style={{ padding: '0.75rem', border: '1px solid #eee', textAlign: 'center' }}>{u.estado || 'N/A'}</td>
                  <td style={{ padding: '0.75rem', border: '1px solid #eee' }}>{u.fechaCreacion || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
        <Button label="Cerrar" onClick={onHide} />
      </div>
    </Dialog>
  );
};

export default UnidadProducto;

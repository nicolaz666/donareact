import { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import NotaService from '../../services/NotaService';

function NotaFormEdit({ rowData, setRowDataEditar, cargarNotas, mostrarModal }) {
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setEnviando(true);
      const response = await NotaService.actualizarNota(rowData.id, rowData);
      await cargarNotas();
      console.log(response);
      mostrarModal(false);
    } catch (error) {
      console.log(error);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label htmlFor="titulo" className="block text-900 font-medium mb-2">Título</label>
        <InputText id="titulo" type="text" value={rowData.titulo} onChange={(e) => setRowDataEditar({ ...rowData, titulo: e.target.value })} className="w-full mb-3" />

        <label htmlFor="descripcion" className="block text-900 font-medium mb-2">Resumen (opcional)</label>
        <InputText id="descripcion" type="text" value={rowData.descripcion ?? ''} onChange={(e) => setRowDataEditar({ ...rowData, descripcion: e.target.value })} className="w-full mb-3" />

        <label htmlFor="contenido" className="block text-900 font-medium mb-2">Contenido</label>
        <InputTextarea id="contenido" value={rowData.contenido} onChange={(e) => setRowDataEditar({ ...rowData, contenido: e.target.value })} rows={6} autoResize className="w-full mb-3" />

        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', cursor: 'pointer' }}>
          <input type="checkbox" checked={rowData.publicado} onChange={(e) => setRowDataEditar({ ...rowData, publicado: e.target.checked })} />
          <span style={{ fontSize: '13px', color: '#0f172a', fontWeight: 600 }}>
            Publicado (visible en el sitio)
          </span>
        </label>

        <Button type="submit" label="Guardar cambios" loading={enviando} className="mt-2" />
      </form>
    </div>
  );
}

export default NotaFormEdit;

import { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import NotaService from '../../services/NotaService';

const NotaForm = ({ mostrarModal, cargarNotas }) => {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [contenido, setContenido] = useState('');
  const [publicado, setPublicado] = useState(true);
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setEnviando(true);
      const nota = { titulo, descripcion, contenido, publicado };
      await NotaService.crearNota(nota);
      await cargarNotas();
      setTitulo('');
      setDescripcion('');
      setContenido('');
      setPublicado(true);
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
        <InputText id="titulo" type="text" placeholder="Título del post" value={titulo} onChange={(e) => setTitulo(e.target.value)} className="w-full mb-3" />

        <label htmlFor="descripcion" className="block text-900 font-medium mb-2">Resumen (opcional)</label>
        <InputText id="descripcion" type="text" placeholder="Breve resumen para la vista previa del blog" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} className="w-full mb-3" />

        <label htmlFor="contenido" className="block text-900 font-medium mb-2">Contenido</label>
        <InputTextarea id="contenido" placeholder="Contenido del post" value={contenido} onChange={(e) => setContenido(e.target.value)} rows={6} autoResize className="w-full mb-3" />

        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', cursor: 'pointer' }}>
          <input type="checkbox" checked={publicado} onChange={(e) => setPublicado(e.target.checked)} />
          <span style={{ fontSize: '13px', color: '#0f172a', fontWeight: 600 }}>
            Publicar inmediatamente (visible en el sitio)
          </span>
        </label>

        <Button type="submit" label="Crear post" loading={enviando} className="mt-2" />
      </form>
    </div>
  );
};

export default NotaForm;

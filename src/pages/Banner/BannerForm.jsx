import { useState, useRef } from 'react';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { Video, Image as ImageIcon, Upload } from 'lucide-react';
import BannerService from '../../services/BannerService';

const TIPOS = [
  { label: 'Video', value: 'video' },
  { label: 'Imágenes (carrusel)', value: 'imagenes' },
];

const BannerForm = ({ mostrarModal, cargarBanners }) => {
  const toast = useRef(null);
  const [tipo, setTipo] = useState(null);
  const [video, setVideo] = useState(null);
  const [activo, setActivo] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!tipo) return;
    if (tipo === 'video' && !video) {
      toast.current.show({
        severity: 'warn',
        summary: 'Falta el video',
        detail: 'Selecciona un archivo de video para este banner.',
        life: 3000,
      });
      return;
    }

    setEnviando(true);
    try {
      await BannerService.crearBanner({ tipo, video: tipo === 'video' ? video : null, activo });
      await cargarBanners();
      setTipo(null);
      setVideo(null);
      setActivo(false);
      mostrarModal(false);
    } catch (error) {
      console.error(error);
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo crear el banner.',
        life: 3000,
      });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div>
      <Toast ref={toast} />
      <form onSubmit={handleSubmit}>
        <label htmlFor="tipo" className="block text-900 font-medium mb-2">Tipo de banner</label>
        <Dropdown
          id="tipo"
          options={TIPOS}
          value={tipo}
          onChange={(e) => { setTipo(e.value); setVideo(null); }}
          placeholder="Selecciona el tipo"
          className="w-full mb-3"
        />

        {tipo === 'video' && (
          <div style={{ marginBottom: '14px' }}>
            <label className="block text-900 font-medium mb-2">Archivo de video</label>
            <p style={{ fontSize: '11.5px', color: '#94a3b8', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Video size={12} /> Solo se permite un video por banner. Cloudinary lo comprime y optimiza automáticamente.
            </p>
            <label
              htmlFor="video-input"
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 14px', borderRadius: '9px',
                border: '1px dashed #6366f1', background: '#eef2ff',
                color: '#6366f1', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
              }}
            >
              <Upload size={15} />
              {video ? video.name : 'Selecciona un video'}
            </label>
            <input
              id="video-input"
              type="file"
              accept="video/*"
              style={{ display: 'none' }}
              onChange={(e) => setVideo(e.target.files?.[0] ?? null)}
            />
          </div>
        )}

        {tipo === 'imagenes' && (
          <div style={{
            marginBottom: '14px', padding: '12px 14px', borderRadius: '10px',
            background: '#f8fafc', border: '1px solid #e2e8f0',
            fontSize: '12.5px', color: '#64748b', display: 'flex', gap: '8px', alignItems: 'flex-start',
          }}>
            <ImageIcon size={15} style={{ flexShrink: 0, marginTop: '1px' }} color="#6366f1" />
            <span>
              Primero crea el banner y luego usa la opción <strong>&ldquo;Imágenes&rdquo;</strong> en la tabla
              para subir hasta 3 imágenes. Si subes 3, el sitio las mostrará como carrusel automático.
            </span>
          </div>
        )}

        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', cursor: 'pointer' }}>
          <input type="checkbox" checked={activo} onChange={(e) => setActivo(e.target.checked)} />
          <span style={{ fontSize: '13px', color: '#0f172a', fontWeight: 600 }}>
            Marcar como banner activo (se mostrará en el sitio)
          </span>
        </label>

        <Button type="submit" label="Crear banner" loading={enviando} disabled={!tipo} className="mt-2" />
      </form>
    </div>
  );
};

export default BannerForm;

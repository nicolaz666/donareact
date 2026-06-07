import { useState, useEffect, useRef } from "react";
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { Video, Images, Star } from 'lucide-react';
import BannerService from "../../services/BannerService";
import BannerForm from "./BannerForm";
import BannerImagenesModal from "./BannerImagenesModal";
import { ResponsiveTableWrapper, ActionButtons, CardItem, StatusBadge } from "../../components/ui/table";

const ROWS_PER_PAGE = 8;

const getImageUrl = (imagen) => {
  if (!imagen) return null;
  if (/^https?:\/\//i.test(imagen)) return imagen;
  return null;
};

const Preview = ({ banner }) => {
  if (banner.tipo === 'video') {
    return (
      <div style={{
        width: "70px", height: "44px", borderRadius: "8px",
        background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <Video size={16} color="#fff" />
      </div>
    );
  }
  const primera = banner.imagenes?.[0];
  if (primera) {
    return (
      <img
        src={getImageUrl(primera.imagen)}
        alt="banner"
        style={{ width: "70px", height: "44px", borderRadius: "8px", objectFit: "cover", flexShrink: 0 }}
      />
    );
  }
  return (
    <div style={{
      width: "70px", height: "44px", borderRadius: "8px",
      background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
    }}>
      <Images size={16} color="#94a3b8" />
    </div>
  );
};

const BannerTable = () => {
  const toast = useRef(null);
  const [banners, setBanners] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modalImagenes, setModalImagenes] = useState({ visible: false, banner: null });
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const cargarBanners = async () => {
    try {
      const response = await BannerService.getAllBanners();
      setBanners(response);
    } catch (error) {
      console.error("Error al cargar banners:", error);
    }
  };

  useEffect(() => { cargarBanners(); }, []);

  const eliminar = async (id) => {
    try {
      await BannerService.eliminarBanner(id);
      setDeleteConfirmId(null);
      cargarBanners();
    } catch (error) {
      console.error("Error al eliminar el banner:", error);
    }
  };

  const activar = async (banner) => {
    try {
      await BannerService.actualizarBanner(banner.id, { ...banner, activo: true });
      await cargarBanners();
      toast.current?.show({
        severity: 'success',
        summary: 'Banner activado',
        detail: `El banner #${banner.id} ahora se muestra en el sitio.`,
        life: 2500,
      });
    } catch (error) {
      console.error("Error al activar el banner:", error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo activar el banner.',
        life: 3000,
      });
    }
  };

  const filtered = banners.filter(b =>
    b.tipo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(b.id).includes(searchTerm)
  );

  const totalPages = Math.ceil(filtered.length / ROWS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ROWS_PER_PAGE, currentPage * ROWS_PER_PAGE);

  const handleSearch = (val) => { setSearchTerm(val); setCurrentPage(1); };

  const columns = [
    {
      key: "id", header: "ID",
      render: r => <span style={{ fontSize: "12px", color: "#94a3b8", fontVariantNumeric: "tabular-nums" }}>#{r.id}</span>,
    },
    {
      key: "preview", header: "Vista previa",
      render: r => <Preview banner={r} />,
    },
    {
      key: "tipo", header: "Tipo",
      render: r => <StatusBadge value={r.tipo} />,
    },
    {
      key: "contenido", header: "Contenido",
      render: r => (
        <span style={{ fontSize: "12px", color: "#64748b" }}>
          {r.tipo === 'video' ? 'Video único' : `${r.imagenes?.length ?? 0}/3 imágenes`}
        </span>
      ),
    },
    {
      key: "estado", header: "Estado",
      render: r => <StatusBadge value={r.activo ? 'activo' : 'inactivo'} />,
    },
    {
      key: "acciones", header: "Acciones",
      render: r => (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {!r.activo && (
            <button
              title="Marcar como activo"
              onClick={() => activar(r)}
              style={{
                display: "flex", alignItems: "center", gap: "5px",
                padding: "5px 10px", borderRadius: "8px",
                border: "1px solid #d1fae5", background: "#f0fdf4",
                color: "#15803d", cursor: "pointer", fontSize: "11px", fontWeight: 600,
              }}
            >
              <Star size={12} /> Activar
            </button>
          )}
          <ActionButtons
            rowId={r.id}
            confirmId={deleteConfirmId}
            onConfirm={(id) => eliminar(id)}
            onCancelConfirm={() => setDeleteConfirmId(null)}
            actions={[
              ...(r.tipo === 'imagenes' ? [{
                type: "view",
                label: "Imágenes",
                onClick: () => setModalImagenes({ visible: true, banner: r }),
              }] : []),
              { type: "delete", onClick: () => setDeleteConfirmId(r.id) },
            ]}
          />
        </div>
      ),
    },
  ];

  const renderCard = (row) => (
    <CardItem
      image={<Preview banner={row} />}
      title={`Banner #${row.id}`}
      subtitle={row.tipo === 'video' ? 'Video único' : `${row.imagenes?.length ?? 0}/3 imágenes`}
      isHighlighted={deleteConfirmId === row.id}
      badges={[
        <StatusBadge key="tipo" value={row.tipo} />,
        <StatusBadge key="estado" value={row.activo ? 'activo' : 'inactivo'} />,
      ]}
      actions={
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {!row.activo && (
            <button
              onClick={() => activar(row)}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                padding: "9px 12px", borderRadius: "9px",
                border: "1px solid #d1fae5", background: "#f0fdf4",
                color: "#15803d", cursor: "pointer", fontSize: "12px", fontWeight: 600,
              }}
            >
              <Star size={14} /> Marcar como activo
            </button>
          )}
          <ActionButtons
            variant="full"
            rowId={row.id}
            confirmId={deleteConfirmId}
            onConfirm={(id) => eliminar(id)}
            onCancelConfirm={() => setDeleteConfirmId(null)}
            actions={[
              ...(row.tipo === 'imagenes' ? [{
                type: "view",
                label: "Imágenes",
                onClick: () => setModalImagenes({ visible: true, banner: row }),
              }] : []),
              { type: "delete", onClick: () => setDeleteConfirmId(row.id) },
            ]}
          />
        </div>
      }
    />
  );

  return (
    <div>
      <Toast ref={toast} />
      <ResponsiveTableWrapper
        title="Banner principal"
        addLabel="Nuevo Banner"
        onAdd={() => setMostrarModal(true)}
        countLabel="banners guardados"
        searchValue={searchTerm}
        onSearchChange={handleSearch}
        searchPlaceholder="Buscar por tipo o ID..."
        rows={paginated}
        allRows={filtered}
        keyField="id"
        columns={columns}
        renderCard={renderCard}
        emptyMessage="No se encontraron banners"
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        highlightRow={r => deleteConfirmId === r.id}
      />

      <Dialog
        header="Nuevo Banner"
        visible={mostrarModal}
        onHide={() => setMostrarModal(false)}
        breakpoints={{ '960px': '75vw', '640px': '90vw' }}
        style={{ width: '50vw' }}
        contentStyle={{ maxHeight: '70vh', overflowY: 'auto' }}
      >
        <BannerForm mostrarModal={setMostrarModal} cargarBanners={cargarBanners} />
      </Dialog>

      <BannerImagenesModal
        visible={modalImagenes.visible}
        onHide={() => setModalImagenes({ visible: false, banner: null })}
        banner={modalImagenes.banner}
        onImagenesActualizadas={cargarBanners}
      />
    </div>
  );
};

export default BannerTable;

import { useState, useRef, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";
import { Trash2, Plus, ImageOff, Upload, CheckCircle, GripVertical } from "lucide-react";
import BannerImagenService from "../../services/BannerImagenService";

const LIMITE_IMAGENES = 3;

const getImageUrl = (imagen) => {
  if (!imagen) return null;
  if (/^https?:\/\//i.test(imagen)) return imagen;
  return null;
};

const BannerImagenesModal = ({ visible, onHide, banner, onImagenesActualizadas }) => {
  const toast = useRef(null);
  const fileInputRef = useRef(null);

  const [imagenesGuardadas, setImagenesGuardadas] = useState([]);
  const [imagenesNuevas, setImagenesNuevas] = useState([]);
  const [paraEliminar, setParaEliminar] = useState([]);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (visible && banner) {
      const imgs = banner.imagenes || [];
      setImagenesGuardadas(imgs);
      setImagenesNuevas([]);
      setParaEliminar([]);
    }
  }, [visible, banner]);

  useEffect(() => {
    return () => {
      imagenesNuevas.forEach((i) => URL.revokeObjectURL(i.preview));
    };
  }, [imagenesNuevas]);

  const imagenesActivasGuardadas = imagenesGuardadas.filter(
    (i) => !paraEliminar.includes(i.id)
  );
  const totalActivas = imagenesActivasGuardadas.length + imagenesNuevas.length;
  const puedeAgregar = totalActivas < LIMITE_IMAGENES;

  const handleAgregarArchivos = (e) => {
    const archivos = Array.from(e.target.files);
    const disponibles = LIMITE_IMAGENES - totalActivas;

    if (disponibles <= 0) {
      toast.current.show({
        severity: "warn",
        summary: "Límite alcanzado",
        detail: `Máximo ${LIMITE_IMAGENES} imágenes por banner.`,
        life: 3000,
      });
      return;
    }

    const validos = archivos
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, disponibles);

    const nuevas = validos.map((file, idx) => ({
      tempId: `new-${Date.now()}-${idx}`,
      file,
      preview: URL.createObjectURL(file),
    }));

    setImagenesNuevas((prev) => [...prev, ...nuevas]);
    e.target.value = "";
  };

  const handleMarcarEliminar = (id) => {
    setParaEliminar((prev) => [...prev, id]);
  };

  const handleDesmarcarEliminar = (id) => {
    setParaEliminar((prev) => prev.filter((x) => x !== id));
  };

  const handleEliminarNueva = (tempId) => {
    setImagenesNuevas((prev) => {
      const eliminada = prev.find((i) => i.tempId === tempId);
      if (eliminada) URL.revokeObjectURL(eliminada.preview);
      return prev.filter((i) => i.tempId !== tempId);
    });
  };

  const handleGuardar = async () => {
    setGuardando(true);
    try {
      await Promise.all(
        paraEliminar.map((id) => BannerImagenService.eliminarImagen(id))
      );

      const ordenInicial = imagenesActivasGuardadas.length;
      await Promise.all(
        imagenesNuevas.map((img, idx) =>
          BannerImagenService.subirImagen(banner.id, img.file, ordenInicial + idx)
        )
      );

      toast.current.show({
        severity: "success",
        summary: "Guardado",
        detail: "Imágenes del banner actualizadas correctamente.",
        life: 2500,
      });

      if (onImagenesActualizadas) onImagenesActualizadas();
      setTimeout(() => onHide(), 1000);
    } catch (err) {
      console.error(err);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Ocurrió un error al guardar los cambios.",
        life: 3000,
      });
    } finally {
      setGuardando(false);
    }
  };

  const CardGuardada = ({ img, posicion }) => {
    const marcada = paraEliminar.includes(img.id);
    return (
      <div style={{
        position: "relative", width: "150px", borderRadius: "12px",
        border: marcada ? "2px solid #fca5a5" : "2px solid #e2e8f0",
        overflow: "hidden", opacity: marcada ? 0.5 : 1,
        transition: "all 0.2s", background: "#f8fafc", flexShrink: 0,
      }}>
        <div style={{
          position: "absolute", top: "6px", left: "6px", zIndex: 2,
          background: "#0f172a99", color: "#fff",
          fontSize: "10px", fontWeight: 700,
          padding: "2px 7px", borderRadius: "999px",
          display: "flex", alignItems: "center", gap: "3px"
        }}>
          <GripVertical size={10} /> #{posicion}
        </div>

        <img
          src={getImageUrl(img.imagen)}
          alt="banner"
          style={{
            width: "150px", height: "84px", objectFit: "cover", display: "block",
            filter: marcada ? "grayscale(80%)" : "none",
          }}
        />

        <div style={{
          display: "flex", justifyContent: "flex-end", alignItems: "center",
          padding: "6px 8px", background: "#fff", borderTop: "1px solid #f1f5f9"
        }}>
          {marcada ? (
            <button
              title="Deshacer eliminación"
              onClick={() => handleDesmarcarEliminar(img.id)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: "#f59e0b", display: "flex", alignItems: "center",
                fontSize: "10px", fontWeight: 600, gap: "3px"
              }}
            >
              Deshacer
            </button>
          ) : (
            <button
              title="Eliminar imagen"
              onClick={() => handleMarcarEliminar(img.id)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: "#94a3b8", display: "flex", alignItems: "center", padding: "3px",
                borderRadius: "6px", transition: "color 0.15s"
              }}
              onMouseEnter={e => e.currentTarget.style.color = "#ef4444"}
              onMouseLeave={e => e.currentTarget.style.color = "#94a3b8"}
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </div>
    );
  };

  const CardNueva = ({ img, posicion }) => (
    <div style={{
      position: "relative", width: "150px", borderRadius: "12px",
      border: "2px dashed #a5b4fc", overflow: "hidden", flexShrink: 0,
      background: "#f8fafc",
    }}>
      <div style={{
        position: "absolute", top: "6px", left: "6px", zIndex: 2,
        background: "#0f172a99", color: "#fff",
        fontSize: "10px", fontWeight: 700,
        padding: "2px 7px", borderRadius: "999px",
        display: "flex", alignItems: "center", gap: "3px"
      }}>
        <GripVertical size={10} /> #{posicion}
      </div>
      <div style={{
        position: "absolute", top: "6px", right: "6px", zIndex: 2,
        background: "#10b981", color: "#fff",
        fontSize: "9px", fontWeight: 700,
        padding: "2px 6px", borderRadius: "999px",
      }}>
        NUEVA
      </div>

      <img src={img.preview} alt="nueva" style={{ width: "150px", height: "84px", objectFit: "cover", display: "block" }} />

      <div style={{
        display: "flex", justifyContent: "flex-end", alignItems: "center",
        padding: "6px 8px", background: "#fff", borderTop: "1px solid #f1f5f9"
      }}>
        <button
          title="Quitar imagen"
          onClick={() => handleEliminarNueva(img.tempId)}
          style={{
            background: "none", border: "none", cursor: "pointer",
            color: "#94a3b8", display: "flex", alignItems: "center", padding: "3px",
            borderRadius: "6px", transition: "color 0.15s"
          }}
          onMouseEnter={e => e.currentTarget.style.color = "#ef4444"}
          onMouseLeave={e => e.currentTarget.style.color = "#94a3b8"}
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );

  const headerContent = (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <div style={{
        width: "32px", height: "32px", borderRadius: "8px",
        background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center"
      }}>
        <ImageOff size={16} color="#6366f1" />
      </div>
      <div>
        <div style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>
          Imágenes del banner
        </div>
        <div style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 400 }}>
          Banner #{banner?.id} · hasta {LIMITE_IMAGENES} imágenes
        </div>
      </div>
    </div>
  );

  let contador = 0;

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        header={headerContent}
        visible={visible}
        onHide={onHide}
        style={{ width: "620px" }}
        breakpoints={{ "960px": "85vw", "640px": "95vw" }}
        contentStyle={{ padding: "0" }}
        draggable={false}
      >
        <div style={{ padding: "20px 24px 0" }}>
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            marginBottom: "16px"
          }}>
            <span style={{ fontSize: "12px", color: "#64748b" }}>
              <span style={{ fontWeight: 700, color: "#0f172a" }}>{totalActivas}</span>
              /{LIMITE_IMAGENES} imágenes
              {paraEliminar.length > 0 && (
                <span style={{ color: "#ef4444", marginLeft: "8px" }}>
                  · {paraEliminar.length} por eliminar
                </span>
              )}
              {imagenesNuevas.length > 0 && (
                <span style={{ color: "#10b981", marginLeft: "8px" }}>
                  · {imagenesNuevas.length} nueva{imagenesNuevas.length > 1 ? "s" : ""}
                </span>
              )}
            </span>

            {puedeAgregar && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  style={{ display: "none" }}
                  onChange={handleAgregarArchivos}
                />
                <button
                  onClick={() => fileInputRef.current.click()}
                  style={{
                    display: "flex", alignItems: "center", gap: "6px",
                    padding: "7px 14px", borderRadius: "8px",
                    border: "1px dashed #6366f1", background: "#eef2ff",
                    color: "#6366f1", cursor: "pointer",
                    fontSize: "12px", fontWeight: 600,
                  }}
                >
                  <Plus size={14} /> Agregar imagen
                </button>
              </>
            )}
          </div>

          {totalActivas === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "#94a3b8", fontSize: "13px" }}>
              <Upload size={32} style={{ display: "block", margin: "0 auto 10px", opacity: 0.4 }} />
              Sin imágenes. Agrega al menos 2 para activar el carrusel automático.
            </div>
          ) : (
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", minHeight: "120px" }}>
              {imagenesActivasGuardadas.map((img) => {
                contador += 1;
                return <CardGuardada key={img.id} img={img} posicion={contador} />;
              })}
              {imagenesGuardadas.filter(i => paraEliminar.includes(i.id)).map((img) => (
                <CardGuardada key={img.id} img={img} posicion="–" />
              ))}
              {imagenesNuevas.map((img) => {
                contador += 1;
                return <CardNueva key={img.tempId} img={img} posicion={contador} />;
              })}
            </div>
          )}

          <p style={{ fontSize: "11.5px", color: "#94a3b8", marginTop: "14px" }}>
            Si guardas exactamente 3 imágenes, el sitio público las mostrará en carrusel automático.
            Con 1 o 2, se muestran de forma estática.
          </p>
        </div>

        <div style={{
          display: "flex", justifyContent: "flex-end", gap: "10px",
          padding: "16px 24px", borderTop: "1px solid #f1f5f9",
          marginTop: "16px", background: "#fafafa"
        }}>
          <button
            onClick={onHide}
            disabled={guardando}
            style={{
              padding: "9px 20px", borderRadius: "9px",
              border: "1px solid #e2e8f0", background: "#fff",
              color: "#64748b", cursor: "pointer", fontSize: "13px", fontWeight: 600,
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            disabled={guardando}
            style={{
              padding: "9px 22px", borderRadius: "9px", border: "none",
              background: guardando ? "#a5b4fc" : "#6366f1",
              color: "#fff", cursor: guardando ? "not-allowed" : "pointer",
              fontSize: "13px", fontWeight: 600,
              display: "flex", alignItems: "center", gap: "7px",
              boxShadow: "0 2px 8px rgba(99,102,241,0.25)"
            }}
          >
            {guardando ? (
              <>
                <span style={{
                  width: "13px", height: "13px", border: "2px solid #fff",
                  borderTopColor: "transparent", borderRadius: "50%",
                  display: "inline-block", animation: "spin 0.7s linear infinite"
                }} />
                Guardando...
              </>
            ) : (
              <>
                <CheckCircle size={14} /> Guardar cambios
              </>
            )}
          </button>
        </div>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </Dialog>
    </>
  );
};

export default BannerImagenesModal;

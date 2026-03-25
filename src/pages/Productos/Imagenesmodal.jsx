import { useState, useRef, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";
import { Star, Trash2, Plus, X, ImageOff, Upload, CheckCircle } from "lucide-react";
import GrupoImagenesService from "../../services/GrupoImagenesService";

const LIMITE_IMAGENES = 3;

// ── Helpers ───────────────────────────────────────────────────────
const BASE_URL = "http://localhost:8000";

const getImageUrl = (imagen) => {
  if (!imagen) return null;
  if (imagen.startsWith("http")) return imagen;
  return `${BASE_URL}${imagen}`;
};

// ── ImagenesModal ─────────────────────────────────────────────────
const ImagenesModal = ({ visible, onHide, producto, onImagenesActualizadas }) => {
  const toast = useRef(null);
  const fileInputRef = useRef(null);

  // Imágenes ya guardadas en BD
  const [imagenesGuardadas, setImagenesGuardadas] = useState([]);
  // Imágenes nuevas pendientes de subir
  const [imagenesNuevas, setImagenesNuevas] = useState([]);
  // IDs de imágenes marcadas para eliminar
  const [paraEliminar, setParaEliminar] = useState([]);
  // ID de la imagen principal (puede ser id numérico de guardada o "new-X" de nueva)
  const [principalId, setPrincipalId] = useState(null);
  const [guardando, setGuardando] = useState(false);

  // ── Cargar imágenes al abrir ──────────────────────────────────
  useEffect(() => {
    if (visible && producto) {
      const imgs = producto.imagenes || [];
      setImagenesGuardadas(imgs);
      setImagenesNuevas([]);
      setParaEliminar([]);
      const principal = imgs.find((i) => i.es_principal);
      setPrincipalId(principal ? principal.id : imgs[0]?.id ?? null);
    }
  }, [visible, producto]);

  // Limpiar object URLs al desmontar
  useEffect(() => {
    return () => {
      imagenesNuevas.forEach((i) => URL.revokeObjectURL(i.preview));
    };
  }, [imagenesNuevas]);

  // ── Conteo total de imágenes activas ─────────────────────────
  const imagenesActivasGuardadas = imagenesGuardadas.filter(
    (i) => !paraEliminar.includes(i.id)
  );
  const totalActivas = imagenesActivasGuardadas.length + imagenesNuevas.length;
  const puedeAgregar = totalActivas < LIMITE_IMAGENES;

  // ── Agregar nuevas imágenes ───────────────────────────────────
  const handleAgregarArchivos = (e) => {
    const archivos = Array.from(e.target.files);
    const disponibles = LIMITE_IMAGENES - totalActivas;

    if (disponibles <= 0) {
      toast.current.show({
        severity: "warn",
        summary: "Límite alcanzado",
        detail: `Máximo ${LIMITE_IMAGENES} imágenes por producto.`,
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

    setImagenesNuevas((prev) => {
      const updated = [...prev, ...nuevas];
      // Si no hay principal aún, asignar la primera nueva
      if (!principalId && updated.length > 0) {
        setPrincipalId(updated[0].tempId);
      }
      return updated;
    });

    e.target.value = "";
  };

  // ── Eliminar imagen guardada (marcar) ─────────────────────────
  const handleMarcarEliminar = (id) => {
    setParaEliminar((prev) => [...prev, id]);
    // Si era la principal, reasignar
    if (principalId === id) {
      const siguienteGuardada = imagenesActivasGuardadas.find((i) => i.id !== id);
      const siguienteNueva = imagenesNuevas[0];
      setPrincipalId(
        siguienteGuardada?.id ?? siguienteNueva?.tempId ?? null
      );
    }
  };

  const handleDesmarcarEliminar = (id) => {
    setParaEliminar((prev) => prev.filter((x) => x !== id));
  };

  // ── Eliminar imagen nueva (pendiente) ─────────────────────────
  const handleEliminarNueva = (tempId) => {
    setImagenesNuevas((prev) => {
      const eliminada = prev.find((i) => i.tempId === tempId);
      if (eliminada) URL.revokeObjectURL(eliminada.preview);
      const updated = prev.filter((i) => i.tempId !== tempId);
      if (principalId === tempId) {
        const siguienteNueva = updated[0];
        const siguienteGuardada = imagenesActivasGuardadas[0];
        setPrincipalId(
          siguienteNueva?.tempId ?? siguienteGuardada?.id ?? null
        );
      }
      return updated;
    });
  };

  // ── Guardar cambios ───────────────────────────────────────────
  const handleGuardar = async () => {
    setGuardando(true);
    try {
      // 1. Eliminar las marcadas
      await Promise.all(
        paraEliminar.map((id) => GrupoImagenesService.eliminarImagen(id))
      );

      // 2. Subir las nuevas
      const subidas = await Promise.all(
        imagenesNuevas.map((img) =>
          GrupoImagenesService.subirImagen(
            producto.id,
            img.file,
            principalId === img.tempId,
          )
        )
      );

      // 3. Actualizar principal en las guardadas (si cambió)
      const principalEsGuardada = imagenesGuardadas.find(
        (i) => i.id === principalId && !paraEliminar.includes(i.id)
      );
      if (principalEsGuardada && !principalEsGuardada.es_principal) {
        await GrupoImagenesService.marcarPrincipal(principalEsGuardada.id);
      }

      // 4. Si la principal es una nueva recién subida, marcarla
      const idxNuevaPrincipal = imagenesNuevas.findIndex(
        (i) => i.tempId === principalId
      );
      if (idxNuevaPrincipal !== -1 && subidas[idxNuevaPrincipal]) {
        await GrupoImagenesService.marcarPrincipal(subidas[idxNuevaPrincipal].id);
      }

      toast.current.show({
        severity: "success",
        summary: "Guardado",
        detail: "Imágenes actualizadas correctamente.",
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

  // ── Render de cada tarjeta ────────────────────────────────────
  const CardGuardada = ({ img }) => {
    const marcada = paraEliminar.includes(img.id);
    const esPrincipal = principalId === img.id;

    return (
      <div style={{
        position: "relative",
        width: "130px",
        borderRadius: "12px",
        border: esPrincipal
          ? "2px solid #6366f1"
          : marcada
          ? "2px solid #fca5a5"
          : "2px solid #e2e8f0",
        overflow: "hidden",
        opacity: marcada ? 0.5 : 1,
        transition: "all 0.2s",
        background: "#f8fafc",
        flexShrink: 0,
      }}>
        {/* Badge principal */}
        {esPrincipal && !marcada && (
          <div style={{
            position: "absolute", top: "6px", left: "6px", zIndex: 2,
            background: "#6366f1", color: "#fff",
            fontSize: "10px", fontWeight: 700,
            padding: "2px 7px", borderRadius: "999px",
            display: "flex", alignItems: "center", gap: "3px"
          }}>
            <Star size={9} fill="#fff" /> Principal
          </div>
        )}

        {/* Imagen */}
        <img
          src={getImageUrl(img.imagen)}
          alt="producto"
          style={{
            width: "130px", height: "110px",
            objectFit: "cover", display: "block",
            filter: marcada ? "grayscale(80%)" : "none",
          }}
        />

        {/* Acciones */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "6px 8px", background: "#fff",
          borderTop: "1px solid #f1f5f9"
        }}>
          {/* Marcar principal */}
          <button
            title={esPrincipal ? "Ya es principal" : "Marcar como principal"}
            disabled={esPrincipal || marcada}
            onClick={() => setPrincipalId(img.id)}
            style={{
              background: "none", border: "none", cursor: esPrincipal || marcada ? "default" : "pointer",
              color: esPrincipal ? "#6366f1" : "#94a3b8",
              display: "flex", alignItems: "center", padding: "3px",
              borderRadius: "6px",
              transition: "color 0.15s"
            }}
            onMouseEnter={e => { if (!esPrincipal && !marcada) e.currentTarget.style.color = "#6366f1"; }}
            onMouseLeave={e => { if (!esPrincipal) e.currentTarget.style.color = "#94a3b8"; }}
          >
            <Star size={15} fill={esPrincipal ? "#6366f1" : "none"} />
          </button>

          {/* Eliminar / Deshacer */}
          {marcada ? (
            <button
              title="Deshacer eliminación"
              onClick={() => handleDesmarcarEliminar(img.id)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: "#f59e0b", display: "flex", alignItems: "center", padding: "3px",
                fontSize: "10px", fontWeight: 600, gap: "3px"
              }}
            >
              <X size={13} /> Deshacer
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

  const CardNueva = ({ img }) => {
    const esPrincipal = principalId === img.tempId;
    return (
      <div style={{
        position: "relative", width: "130px", borderRadius: "12px",
        border: esPrincipal ? "2px solid #6366f1" : "2px dashed #a5b4fc",
        overflow: "hidden", flexShrink: 0,
        background: "#f8fafc",
        boxShadow: esPrincipal ? "0 0 0 3px #e0e7ff" : "none",
        transition: "all 0.2s"
      }}>
        {/* Badge nueva */}
        <div style={{
          position: "absolute", top: "6px", right: "6px", zIndex: 2,
          background: "#10b981", color: "#fff",
          fontSize: "9px", fontWeight: 700,
          padding: "2px 6px", borderRadius: "999px",
        }}>
          NUEVA
        </div>

        {esPrincipal && (
          <div style={{
            position: "absolute", top: "6px", left: "6px", zIndex: 2,
            background: "#6366f1", color: "#fff",
            fontSize: "10px", fontWeight: 700,
            padding: "2px 7px", borderRadius: "999px",
            display: "flex", alignItems: "center", gap: "3px"
          }}>
            <Star size={9} fill="#fff" /> Principal
          </div>
        )}

        <img
          src={img.preview}
          alt="nueva"
          style={{ width: "130px", height: "110px", objectFit: "cover", display: "block" }}
        />

        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "6px 8px", background: "#fff", borderTop: "1px solid #f1f5f9"
        }}>
          <button
            title={esPrincipal ? "Ya es principal" : "Marcar como principal"}
            disabled={esPrincipal}
            onClick={() => setPrincipalId(img.tempId)}
            style={{
              background: "none", border: "none", cursor: esPrincipal ? "default" : "pointer",
              color: esPrincipal ? "#6366f1" : "#94a3b8",
              display: "flex", alignItems: "center", padding: "3px", borderRadius: "6px",
              transition: "color 0.15s"
            }}
            onMouseEnter={e => { if (!esPrincipal) e.currentTarget.style.color = "#6366f1"; }}
            onMouseLeave={e => { if (!esPrincipal) e.currentTarget.style.color = "#94a3b8"; }}
          >
            <Star size={15} fill={esPrincipal ? "#6366f1" : "none"} />
          </button>
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
  };

  // ── Header del Dialog ─────────────────────────────────────────
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
          Imágenes del producto
        </div>
        <div style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 400 }}>
          {producto?.modelo} · {producto?.tipo}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        header={headerContent}
        visible={visible}
        onHide={onHide}
        style={{ width: "560px" }}
        breakpoints={{ "960px": "80vw", "640px": "95vw" }}
        contentStyle={{ padding: "0" }}
        draggable={false}
      >
        <div style={{ padding: "20px 24px 0" }}>
          {/* Contador */}
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

            {/* Botón agregar */}
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
                    transition: "all 0.15s"
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = "#e0e7ff";
                    e.currentTarget.style.borderColor = "#4f46e5";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = "#eef2ff";
                    e.currentTarget.style.borderColor = "#6366f1";
                  }}
                >
                  <Plus size={14} /> Agregar imagen
                </button>
              </>
            )}
          </div>

          {/* Grid de imágenes */}
          {totalActivas === 0 && paraEliminar.length === imagenesGuardadas.length ? (
            <div style={{
              textAlign: "center", padding: "40px 20px",
              color: "#94a3b8", fontSize: "13px"
            }}>
              <Upload size={32} style={{ display: "block", margin: "0 auto 10px", opacity: 0.4 }} />
              Sin imágenes. Agrega al menos una.
            </div>
          ) : (
            <div style={{
              display: "flex", gap: "12px", flexWrap: "wrap",
              minHeight: "140px"
            }}>
              {/* Imágenes guardadas */}
              {imagenesGuardadas.map((img) => (
                <CardGuardada key={img.id} img={img} />
              ))}
              {/* Imágenes nuevas pendientes */}
              {imagenesNuevas.map((img) => (
                <CardNueva key={img.tempId} img={img} />
              ))}
            </div>
          )}

          {/* Ayuda */}
          <p style={{
            fontSize: "11.5px", color: "#94a3b8", marginTop: "14px",
            display: "flex", alignItems: "center", gap: "5px"
          }}>
            <Star size={11} color="#6366f1" fill="#6366f1" />
            Toca la estrella para cambiar la imagen principal.
          </p>
        </div>

        {/* Footer */}
        <div style={{
          display: "flex", justifyContent: "flex-end", gap: "10px",
          padding: "16px 24px",
          borderTop: "1px solid #f1f5f9",
          marginTop: "16px",
          background: "#fafafa"
        }}>
          <button
            onClick={onHide}
            disabled={guardando}
            style={{
              padding: "9px 20px", borderRadius: "9px",
              border: "1px solid #e2e8f0", background: "#fff",
              color: "#64748b", cursor: "pointer",
              fontSize: "13px", fontWeight: 600,
              transition: "background 0.15s"
            }}
            onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
            onMouseLeave={e => e.currentTarget.style.background = "#fff"}
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            disabled={guardando}
            style={{
              padding: "9px 22px", borderRadius: "9px",
              border: "none",
              background: guardando ? "#a5b4fc" : "#6366f1",
              color: "#fff", cursor: guardando ? "not-allowed" : "pointer",
              fontSize: "13px", fontWeight: 600,
              display: "flex", alignItems: "center", gap: "7px",
              transition: "background 0.15s",
              boxShadow: "0 2px 8px rgba(99,102,241,0.25)"
            }}
            onMouseEnter={e => { if (!guardando) e.currentTarget.style.background = "#4f46e5"; }}
            onMouseLeave={e => { if (!guardando) e.currentTarget.style.background = "#6366f1"; }}
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

export default ImagenesModal;
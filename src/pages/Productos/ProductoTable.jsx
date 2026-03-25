import { useState, useEffect } from "react";
import ProductoService from "../../services/ProductoService";
import { Dialog } from "primereact/dialog";
import ProductoForm from "./ProductoForm";
import ProductoFormEdit from "./ProductoFormEdit";
import UnidadProducto from "../UnidadProducto/UnidadProducto";
import CrearUnidadProducto from "../UnidadProducto/CrearUnidadProducto";
import { Edit2, Trash2, Package, PlusCircle, ChevronLeft, ChevronRight, Search, Plus } from "lucide-react";
import ImagenesModal from "./Imagenesmodal";

// ── Color badge config ────────────────────────────────────────────
const COLOR_PALETTE = {
  Negro:          { bg: "#1e1e2e", text: "#e2e8f0" },
  Roble:          { bg: "#d4a96a22", text: "#92632a" },
  Crudo:          { bg: "#fef9ec", text: "#a0845c" },
  Chocolate:      { bg: "#3d1c0822", text: "#7c3a1e" },
  Envejecido:     { bg: "#e8e0d522", text: "#7a6a56" },
  "Crudo Blanco": { bg: "#f8f6f2", text: "#9a8c7e" },
  "Crudo Crema":  { bg: "#fdf3dc", text: "#a07840" },
  Rojo:           { bg: "#fee2e2", text: "#b91c1c" },
  "Azul Rey":     { bg: "#dbeafe", text: "#1d4ed8" },
  Amarillo:       { bg: "#fef9c3", text: "#a16207" },
  "Verde Manzana":{ bg: "#dcfce7", text: "#15803d" },
  "Azul Celeste": { bg: "#e0f2fe", text: "#0369a1" },
  "Azul Claro":   { bg: "#eff6ff", text: "#3b82f6" },
  Naranja:        { bg: "#ffedd5", text: "#c2410c" },
  Mandarina:      { bg: "#fef3c7", text: "#d97706" },
  "Verde Militar":{ bg: "#d1fae5", text: "#065f46" },
  "Sin color secundario": { bg: "#f1f5f9", text: "#94a3b8" },
};

const ColorBadge = ({ color }) => {
  if (!color || color === "Sin color secundario") {
    return (
      <span style={{
        display: "inline-flex", alignItems: "center", gap: "5px",
        padding: "3px 9px", borderRadius: "999px",
        fontSize: "11px", fontWeight: 500, letterSpacing: "0.02em",
        background: "#f1f5f9", color: "#94a3b8",
        border: "1px solid #e2e8f0"
      }}>
        —
      </span>
    );
  }
  const palette = COLOR_PALETTE[color] || { bg: "#f1f5f9", text: "#64748b" };
  const dotColor = color === "Negro" ? "#94a3b8" : palette.text;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "5px",
      padding: "3px 9px", borderRadius: "999px",
      fontSize: "11px", fontWeight: 600, letterSpacing: "0.02em",
      background: palette.bg, color: palette.text,
      border: `1px solid ${palette.text}22`,
      whiteSpace: "nowrap"
    }}>
      <span style={{
        width: "7px", height: "7px", borderRadius: "50%",
        background: dotColor, flexShrink: 0,
        border: color === "Negro" ? "1px solid #4b5563" : "none"
      }} />
      {color}
    </span>
  );
};

// ── Product Image ─────────────────────────────────────────────────
const ProductImage = ({ imagenes }) => {
  const principal = imagenes?.find(i => i.es_principal) || imagenes?.[0];
  return (
    <div style={{
      width: "48px", height: "48px", borderRadius: "10px",
      overflow: "hidden", flexShrink: 0,
      border: "1px solid #e2e8f0",
      background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
      transition: "transform 0.2s ease, box-shadow 0.2s ease",
      cursor: "default",
    }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "scale(1.08)";
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.12)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {principal ? (
        <img
          src={principal.imagen}
          alt="producto"
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      ) : (
        <div style={{
          width: "100%", height: "100%", display: "flex",
          alignItems: "center", justifyContent: "center", color: "#cbd5e1"
        }}>
          <Package size={20} />
        </div>
      )}
    </div>
  );
};

// ── Tipo badge ────────────────────────────────────────────────────
const TIPO_COLORS = {
  Tejido:   { bg: "#ede9fe", text: "#6d28d9" },
  Rejo:     { bg: "#fce7f3", text: "#be185d" },
  Plano:    { bg: "#e0f2fe", text: "#0369a1" },
  Sencillo: { bg: "#dcfce7", text: "#15803d" },
};

// ── Main Component ────────────────────────────────────────────────
const ProductoTable = () => {
  const [productos, setProductos] = useState([]);
  const [rowDataEditar, setRowDataEditar] = useState(null);
  const [productoCrearUnidad, setProductoCrearUnidad] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarModalEditar, setMostrarModalEditar] = useState(false);
  const [mostrarModalUnidades, setMostrarModalUnidades] = useState(false);
  const [mostrarModalCrearUnidad, setMostrarModalCrearUnidad] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [modalImagenes, setModalImagenes] = useState({ visible: false, producto: null });
  const rowsPerPage = 8;

  const cargarProductos = async () => {
    const response = await ProductoService.getAllProductos();
    setProductos(response);
  };

  useEffect(() => { cargarProductos(); }, []);

  const eliminarProducto = async (id) => {
    await ProductoService.eliminarProducto(id);
    setDeleteConfirmId(null);
    cargarProductos();
  };

  const filtered = productos.filter(p => {
    const q = searchTerm.toLowerCase();
    return (
      p.modelo?.toLowerCase().includes(q) ||
      p.tipo?.toLowerCase().includes(q) ||
      p.categoria?.nombre?.toLowerCase().includes(q) ||
      String(p.id).includes(q)
    );
  });

  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const paginated = filtered.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const formatPrice = (price) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(price);

  return (
    <div style={{
      fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
      background: "#f8fafc",
      minHeight: "100vh",
      padding: "24px",
    }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: "24px",
      }}>
        <div>
          <h1 style={{
            fontSize: "22px", fontWeight: 700, color: "#0f172a",
            margin: 0, letterSpacing: "-0.4px"
          }}>
            Catálogo de Productos
          </h1>
          <p style={{ margin: "2px 0 0", fontSize: "13px", color: "#94a3b8" }}>
            {filtered.length} productos registrados
          </p>
        </div>
        <button
          onClick={() => setMostrarModal(true)}
          style={{
            display: "flex", alignItems: "center", gap: "8px",
            padding: "10px 18px", borderRadius: "10px",
            background: "#0f172a", color: "#fff",
            border: "none", cursor: "pointer",
            fontSize: "13px", fontWeight: 600, letterSpacing: "0.01em",
            transition: "background 0.2s, transform 0.15s",
            boxShadow: "0 2px 8px rgba(15,23,42,0.18)"
          }}
          onMouseEnter={e => e.currentTarget.style.background = "#1e293b"}
          onMouseLeave={e => e.currentTarget.style.background = "#0f172a"}
        >
          <Plus size={16} />
          Nuevo Producto
        </button>
      </div>

      {/* Search */}
      <div style={{
        background: "#fff", borderRadius: "12px",
        border: "1px solid #e2e8f0",
        padding: "16px 20px",
        marginBottom: "16px",
        display: "flex", alignItems: "center", gap: "12px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
      }}>
        <Search size={16} style={{ color: "#94a3b8", flexShrink: 0 }} />
        <input
          placeholder="Buscar por modelo, tipo, categoría o ID..."
          value={searchTerm}
          onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          style={{
            border: "none", outline: "none", width: "100%",
            fontSize: "13.5px", color: "#334155", background: "transparent",
          }}
        />
        {searchTerm && (
          <button onClick={() => setSearchTerm("")} style={{
            border: "none", background: "#f1f5f9", color: "#64748b",
            borderRadius: "6px", padding: "2px 8px", cursor: "pointer",
            fontSize: "12px"
          }}>
            Limpiar
          </button>
        )}
      </div>

      {/* Table */}
      <div style={{
        background: "#fff", borderRadius: "14px",
        border: "1px solid #e2e8f0",
        overflow: "hidden",
        boxShadow: "0 1px 4px rgba(0,0,0,0.05)"
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
              {["ID", "Imagen", "Detalles", "Precio", "Color Principal", "Color Tejido", "Unidades", "Acciones"].map(h => (
                <th key={h} style={{
                  padding: "12px 16px", textAlign: "left",
                  fontSize: "11px", fontWeight: 700,
                  color: "#64748b", textTransform: "uppercase",
                  letterSpacing: "0.06em", whiteSpace: "nowrap"
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={8} style={{
                  textAlign: "center", padding: "48px",
                  color: "#94a3b8", fontSize: "14px"
                }}>
                  <Package size={32} style={{ display: "block", margin: "0 auto 10px", opacity: 0.4 }} />
                  No se encontraron productos
                </td>
              </tr>
            ) : paginated.map((rowData, idx) => {
              const tipoStyle = TIPO_COLORS[rowData.tipo] || { bg: "#f1f5f9", text: "#64748b" };
              return (
                <tr
                  key={rowData.id}
                  style={{
                    borderBottom: idx < paginated.length - 1 ? "1px solid #f1f5f9" : "none",
                    transition: "background 0.15s",
                    background: deleteConfirmId === rowData.id ? "#fff1f2" : "transparent",
                  }}
                  onMouseEnter={e => {
                    if (deleteConfirmId !== rowData.id)
                      e.currentTarget.style.background = "#f8fafc";
                  }}
                  onMouseLeave={e => {
                    if (deleteConfirmId !== rowData.id)
                      e.currentTarget.style.background = "transparent";
                  }}
                >
                  {/* ID */}
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{
                      fontSize: "12px", color: "#94a3b8",
                      fontVariantNumeric: "tabular-nums"
                    }}>
                      #{rowData.id}
                    </span>
                  </td>

                  {/* Image - clickable */}
                  <td style={{ padding: "14px 16px" }}>
                    <div
                      onClick={() => setModalImagenes({ visible: true, producto: rowData })}
                      title="Editar imágenes"
                      style={{ cursor: "pointer", display: "inline-block" }}
                    >
                      <ProductImage imagenes={rowData.imagenes} />
                    </div>
                  </td>

                  {/* Detalles agrupados */}
                  <td style={{ padding: "14px 16px", maxWidth: "200px" }}>
                    <div style={{ fontWeight: 700, fontSize: "13.5px", color: "#0f172a" }}>
                      {rowData.modelo}
                    </div>
                    <div style={{
                      marginTop: "3px", display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap"
                    }}>
                      <span style={{
                        fontSize: "11px", color: "#64748b",
                      }}>
                        {rowData.categoria?.nombre}
                      </span>
                      <span style={{ color: "#cbd5e1", fontSize: "11px" }}>·</span>
                      <span style={{
                        display: "inline-block",
                        padding: "1px 7px", borderRadius: "999px",
                        fontSize: "10.5px", fontWeight: 600,
                        background: tipoStyle.bg, color: tipoStyle.text,
                      }}>
                        {rowData.tipo}
                      </span>
                    </div>
                  </td>

                  {/* Precio */}
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{
                      fontSize: "14px", fontWeight: 700,
                      color: "#047857",
                      fontVariantNumeric: "tabular-nums",
                      fontFamily: "'DM Mono', 'Fira Code', monospace",
                      letterSpacing: "-0.3px"
                    }}>
                      {formatPrice(rowData.precio)}
                    </span>
                  </td>

                  {/* Color Principal */}
                  <td style={{ padding: "14px 16px" }}>
                    <ColorBadge color={rowData.colorPrincipal} />
                  </td>

                  {/* Color Tejido */}
                  <td style={{ padding: "14px 16px" }}>
                    <ColorBadge color={rowData.colorTejido !== "Sin color secundario" ? rowData.colorTejido : null} />
                  </td>

                  {/* Unidades */}
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                      <button
                        onClick={() => { setProductoCrearUnidad(rowData); setMostrarModalCrearUnidad(true); }}
                        title="Crear Unidad"
                        style={{
                          display: "flex", alignItems: "center", gap: "5px",
                          padding: "6px 10px", borderRadius: "8px",
                          border: "1px solid #d1fae5", background: "#f0fdf4",
                          color: "#15803d", cursor: "pointer", fontSize: "11.5px",
                          fontWeight: 600, transition: "all 0.15s",
                          whiteSpace: "nowrap"
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = "#dcfce7";
                          e.currentTarget.style.borderColor = "#86efac";
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = "#f0fdf4";
                          e.currentTarget.style.borderColor = "#d1fae5";
                        }}
                      >
                        <PlusCircle size={13} />
                        Crear
                      </button>
                      <button
                        onClick={() => { setSelectedProduct(rowData); setMostrarModalUnidades(true); }}
                        title="Ver Unidades"
                        style={{
                          display: "flex", alignItems: "center", gap: "5px",
                          padding: "6px 10px", borderRadius: "8px",
                          border: "1px solid #dbeafe", background: "#eff6ff",
                          color: "#1d4ed8", cursor: "pointer", fontSize: "11.5px",
                          fontWeight: 600, transition: "all 0.15s",
                          whiteSpace: "nowrap"
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = "#dbeafe";
                          e.currentTarget.style.borderColor = "#93c5fd";
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = "#eff6ff";
                          e.currentTarget.style.borderColor = "#dbeafe";
                        }}
                      >
                        <Package size={13} />
                        Ver
                      </button>
                    </div>
                  </td>

                  {/* Acciones */}
                  <td style={{ padding: "14px 16px" }}>
                    {deleteConfirmId === rowData.id ? (
                      <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                        <span style={{ fontSize: "11px", color: "#ef4444", fontWeight: 600 }}>
                          ¿Eliminar?
                        </span>
                        <button
                          onClick={() => eliminarProducto(rowData.id)}
                          style={{
                            padding: "4px 10px", borderRadius: "6px",
                            background: "#ef4444", color: "#fff",
                            border: "none", cursor: "pointer",
                            fontSize: "11px", fontWeight: 600
                          }}
                        >
                          Sí
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          style={{
                            padding: "4px 10px", borderRadius: "6px",
                            background: "#f1f5f9", color: "#64748b",
                            border: "none", cursor: "pointer",
                            fontSize: "11px", fontWeight: 600
                          }}
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <div style={{
                        display: "inline-flex", gap: "4px",
                        background: "#f1f5f9", borderRadius: "9px",
                        padding: "4px",
                      }}>
                        <button
                          title="Editar"
                          onClick={() => { setRowDataEditar(rowData); setMostrarModalEditar(true); }}
                          style={{
                            width: "30px", height: "30px", borderRadius: "6px",
                            border: "none", background: "transparent",
                            color: "#475569", cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            transition: "background 0.15s, color 0.15s"
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = "#fff";
                            e.currentTarget.style.color = "#0f172a";
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.color = "#475569";
                          }}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          title="Eliminar"
                          onClick={() => setDeleteConfirmId(rowData.id)}
                          style={{
                            width: "30px", height: "30px", borderRadius: "6px",
                            border: "none", background: "transparent",
                            color: "#475569", cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            transition: "background 0.15s, color 0.15s"
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = "#fee2e2";
                            e.currentTarget.style.color = "#ef4444";
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.color = "#475569";
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "14px 20px",
            borderTop: "1px solid #f1f5f9",
            background: "#fafafa"
          }}>
            <span style={{ fontSize: "12px", color: "#94a3b8" }}>
              Página {currentPage} de {totalPages} · {filtered.length} resultados
            </span>
            <div style={{ display: "flex", gap: "6px" }}>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{
                  width: "32px", height: "32px", borderRadius: "8px",
                  border: "1px solid #e2e8f0", background: "#fff",
                  color: currentPage === 1 ? "#cbd5e1" : "#475569",
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}
              >
                <ChevronLeft size={15} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  style={{
                    width: "32px", height: "32px", borderRadius: "8px",
                    border: p === currentPage ? "none" : "1px solid #e2e8f0",
                    background: p === currentPage ? "#0f172a" : "#fff",
                    color: p === currentPage ? "#fff" : "#475569",
                    cursor: "pointer", fontSize: "12px", fontWeight: p === currentPage ? 700 : 400,
                  }}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                style={{
                  width: "32px", height: "32px", borderRadius: "8px",
                  border: "1px solid #e2e8f0", background: "#fff",
                  color: currentPage === totalPages ? "#cbd5e1" : "#475569",
                  cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Dialogs */}
      <Dialog
        header="Agregar Producto"
        visible={mostrarModal}
        onHide={() => setMostrarModal(false)}
        breakpoints={{ "960px": "75vw", "640px": "90vw" }}
        style={{ width: "50vw" }}
        contentStyle={{ maxHeight: "70vh", overflowY: "auto" }}
      >
        <ProductoForm mostrarModal={setMostrarModal} cargarProductos={cargarProductos} />
      </Dialog>

      <Dialog
        header="Editar Producto"
        visible={mostrarModalEditar}
        onHide={() => setMostrarModalEditar(false)}
        breakpoints={{ "960px": "75vw", "640px": "90vw" }}
        style={{ width: "50vw" }}
        contentStyle={{ maxHeight: "70vh", overflowY: "auto" }}
      >
        <ProductoFormEdit
          rowData={rowDataEditar}
          setRowDataEditar={setRowDataEditar}
          cargarProductos={cargarProductos}
          mostrarModal={setMostrarModalEditar}
        />
      </Dialog>

      <UnidadProducto
        visible={mostrarModalUnidades}
        onHide={() => { setMostrarModalUnidades(false); setSelectedProduct(null); }}
        producto={selectedProduct}
      />

      <Dialog
        header="Crear Unidad de Producto"
        visible={mostrarModalCrearUnidad}
        onHide={() => { setMostrarModalCrearUnidad(false); setProductoCrearUnidad(null); }}
        breakpoints={{ "960px": "75vw", "640px": "90vw" }}
        style={{ width: "40vw" }}
      >
        {productoCrearUnidad && (
          <CrearUnidadProducto
            producto={productoCrearUnidad}
            onSuccess={() => { setMostrarModalCrearUnidad(false); setProductoCrearUnidad(null); }}
          />
        )}
      </Dialog>

      {/* Modal edición de imágenes */}
      <ImagenesModal
        visible={modalImagenes.visible}
        onHide={() => setModalImagenes({ visible: false, producto: null })}
        producto={modalImagenes.producto}
        onImagenesActualizadas={cargarProductos}
      />
    </div>
  );
};

export default ProductoTable;
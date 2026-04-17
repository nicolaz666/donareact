import { ChevronLeft, ChevronRight } from "lucide-react";
import { tokens } from "./tokens";

/**
 * Pagination — shared page controls used by all tables/lists.
 *
 * Props:
 *   currentPage: number
 *   totalPages: number
 *   totalItems: number
 *   onChange: (page: number) => void
 */
export default function Pagination({ currentPage, totalPages, totalItems, onChange }) {
  if (totalPages <= 1) return null;

  const t = tokens.pagination;

  const btnStyle = (active) => ({
    width: t.btnSize, height: t.btnSize,
    borderRadius: t.btnRadius,
    border: active ? "none" : t.border,
    background: active ? t.activeBg : t.inactiveBg,
    color: active ? t.activeColor : t.inactiveColor,
    cursor: "pointer", fontSize: "12px",
    fontWeight: active ? 700 : 400,
    display: "flex", alignItems: "center", justifyContent: "center",
    transition: "opacity 0.15s",
  });

  const arrowStyle = (disabled) => ({
    ...btnStyle(false),
    color: disabled ? "#cbd5e1" : t.inactiveColor,
    cursor: disabled ? "not-allowed" : "pointer",
  });

  // Show at most 5 page buttons
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const visible = totalPages <= 5
    ? pages
    : currentPage <= 3
      ? pages.slice(0, 5)
      : currentPage >= totalPages - 2
        ? pages.slice(-5)
        : pages.slice(currentPage - 3, currentPage + 2);

  return (
    <div style={{
      display: "flex", alignItems: "center",
      justifyContent: "space-between",
      padding: "14px 20px",
      borderTop: "1px solid #f1f5f9",
      background: "#fafafa",
      flexWrap: "wrap", gap: "10px",
    }}>
      <span style={{ fontSize: "12px", color: "#94a3b8" }}>
        Página {currentPage} de {totalPages} · {totalItems} resultados
      </span>
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
        <button
          onClick={() => onChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          style={arrowStyle(currentPage === 1)}
        >
          <ChevronLeft size={15} />
        </button>

        {visible[0] > 1 && (
          <>
            <button onClick={() => onChange(1)} style={btnStyle(false)}>1</button>
            {visible[0] > 2 && (
              <span style={{ display: "flex", alignItems: "center", color: "#94a3b8", fontSize: "12px" }}>…</span>
            )}
          </>
        )}

        {visible.map(p => (
          <button key={p} onClick={() => onChange(p)} style={btnStyle(p === currentPage)}>
            {p}
          </button>
        ))}

        {visible[visible.length - 1] < totalPages && (
          <>
            {visible[visible.length - 1] < totalPages - 1 && (
              <span style={{ display: "flex", alignItems: "center", color: "#94a3b8", fontSize: "12px" }}>…</span>
            )}
            <button onClick={() => onChange(totalPages)} style={btnStyle(false)}>{totalPages}</button>
          </>
        )}

        <button
          onClick={() => onChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          style={arrowStyle(currentPage === totalPages)}
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}

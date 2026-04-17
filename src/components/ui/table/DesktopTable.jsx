import { Package } from "lucide-react";
import { tokens } from "./tokens";
import Pagination from "./Pagination";

/**
 * DesktopTable — a styled <table> for desktop view.
 *
 * Props:
 *   columns: Array<{ key, header, render?, width?, align? }>
 *   rows: any[]
 *   keyField: string  — unique key for rows (default "id")
 *   emptyMessage: string
 *   currentPage, totalPages, totalItems, onPageChange — pagination
 *   highlightRow: (row) => bool  — optional row highlight fn
 */
export default function DesktopTable({
  columns = [],
  rows = [],
  keyField = "id",
  emptyMessage = "No se encontraron resultados",
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  highlightRow,
}) {
  return (
    <div style={{
      background: tokens.table.background ?? "#fff",
      borderRadius: tokens.table.borderRadius,
      border: tokens.table.border,
      overflowX: "auto",
      boxShadow: tokens.table.shadow,
    }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{
            background: tokens.table.headerBg,
            borderBottom: tokens.table.border,
          }}>
            {columns.map(col => (
              <th
                key={col.key}
                style={{
                  padding: tokens.table.cellPadding,
                  textAlign: col.align ?? "left",
                  fontSize: "11px",
                  fontWeight: 700,
                  color: tokens.table.headerText,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  whiteSpace: "nowrap",
                  width: col.width,
                }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{
                textAlign: "center", padding: "48px",
                color: tokens.text.muted, fontSize: "14px",
              }}>
                <Package size={32} style={{ display: "block", margin: "0 auto 10px", opacity: 0.4 }} />
                {emptyMessage}
              </td>
            </tr>
          ) : rows.map((row, idx) => {
            const highlighted = highlightRow?.(row) ?? false;
            return (
              <tr
                key={row[keyField] ?? idx}
                style={{
                  borderBottom: idx < rows.length - 1 ? "1px solid #f1f5f9" : "none",
                  background: highlighted ? "#fff1f2" : "transparent",
                  transition: "background 0.15s",
                }}
                onMouseEnter={e => {
                  if (!highlighted) e.currentTarget.style.background = tokens.table.rowHover;
                }}
                onMouseLeave={e => {
                  if (!highlighted) e.currentTarget.style.background = "transparent";
                }}
              >
                {columns.map(col => (
                  <td
                    key={col.key}
                    style={{
                      padding: tokens.table.cellPadding,
                      textAlign: col.align ?? "left",
                      verticalAlign: "middle",
                    }}
                  >
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>

      {onPageChange && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          onChange={onPageChange}
        />
      )}
    </div>
  );
}

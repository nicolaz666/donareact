import { Plus } from "lucide-react";
import { tokens } from "./tokens";

/**
 * ListHeader — page heading with item count and optional CTA button.
 *
 * Props:
 *   title: string
 *   count: number
 *   countLabel: string  — e.g. "productos registrados"
 *   onAdd: () => void
 *   addLabel: string
 */
export default function ListHeader({ title, count, countLabel, onAdd, addLabel = "Nuevo" }) {
  return (
    <div style={{
      display: "flex", alignItems: "center",
      justifyContent: "space-between",
      marginBottom: "24px",
      gap: "12px",
      flexWrap: "wrap",
    }}>
      <div>
        <h1 style={{
          fontSize: "22px", fontWeight: 700,
          color: tokens.text.primary,
          margin: 0, letterSpacing: "-0.4px",
        }}>
          {title}
        </h1>
        {(count !== undefined || countLabel) && (
          <p style={{ margin: "2px 0 0", fontSize: "13px", color: tokens.text.muted }}>
            {count !== undefined ? `${count} ` : ""}{countLabel}
          </p>
        )}
      </div>

      {onAdd && (
        <button
          onClick={onAdd}
          style={{
            display: "inline-flex", alignItems: "center", gap: "7px",
            padding: "10px 16px", borderRadius: "11px",
            background: "#0f172a", color: "#fff",
            border: "none", cursor: "pointer",
            fontSize: "13px", fontWeight: 600,
            boxShadow: "0 2px 8px rgba(15,23,42,0.18)",
            transition: "opacity 0.15s",
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
          onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
        >
          <Plus size={15} />
          {addLabel}
        </button>
      )}
    </div>
  );
}

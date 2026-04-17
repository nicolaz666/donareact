import { Search } from "lucide-react";
import { tokens } from "./tokens";

/**
 * SearchBar — unified search input used above all tables/lists.
 *
 * Props:
 *   value: string
 *   onChange: (val: string) => void
 *   placeholder: string
 */
export default function SearchBar({ value, onChange, placeholder = "Buscar..." }) {
  return (
    <div style={{
      background: tokens.search.background,
      borderRadius: tokens.search.borderRadius,
      border: tokens.search.border,
      padding: tokens.search.padding,
      marginBottom: "16px",
      display: "flex", alignItems: "center", gap: "12px",
      boxShadow: tokens.search.shadow,
    }}>
      <Search size={16} style={{ color: "#94a3b8", flexShrink: 0 }} />
      <input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          border: "none", outline: "none", width: "100%",
          fontSize: "13.5px", color: "#334155", background: "transparent",
        }}
      />
      {value && (
        <button
          onClick={() => onChange("")}
          style={{
            padding: "4px 10px", borderRadius: "8px",
            background: "#f1f5f9", border: "none",
            color: "#64748b", cursor: "pointer",
            fontSize: "11px", fontWeight: 600,
            flexShrink: 0,
          }}
        >
          Limpiar
        </button>
      )}
    </div>
  );
}

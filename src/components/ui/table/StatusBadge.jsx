import { tokens } from "./tokens";

const PRESETS = {
  pendiente:     { ...tokens.severity.info,    label: "Pendiente"    },
  en_proceso:    { ...tokens.severity.warning, label: "En proceso"   },
  entregado:     { ...tokens.severity.success, label: "Entregado"    },
  cancelado:     { ...tokens.severity.danger,  label: "Cancelado"    },
  disponible:    { ...tokens.severity.success, label: "Disponible"   },
  vendido:       { ...tokens.severity.danger,  label: "Vendido"      },
  reservado:     { ...tokens.severity.warning, label: "Reservado"    },
  mantenimiento: { ...tokens.severity.primary, label: "Mantenimiento"},
  producto:      { ...tokens.severity.info,    label: "Producto"     },
  material:      { ...tokens.severity.primary, label: "Material"     },
  ambos:         { ...tokens.severity.success, label: "Ambos"        },
};

/**
 * StatusBadge — renders a rounded pill badge.
 *
 * Props:
 *   value: string  — used to look up presets (lowercase key) or shown as-is
 *   bg, text, border — override colors manually
 *   dot: bool — show a leading dot
 */
export default function StatusBadge({ value, bg, text, border, dot = false, className = "" }) {
  const key = (value ?? "").toString().toLowerCase().replace(/\s+/g, "_");
  const preset = PRESETS[key] ?? null;

  const resolvedBg     = bg     ?? preset?.bg     ?? tokens.severity.ghost.bg;
  const resolvedText   = text   ?? preset?.text   ?? tokens.severity.ghost.text;
  const resolvedBorder = border ?? preset?.border ?? tokens.severity.ghost.border;
  const resolvedLabel  = preset?.label ?? value ?? "—";

  return (
    <span
      className={className}
      style={{
        display: "inline-flex", alignItems: "center", gap: "5px",
        padding: tokens.badge.padding,
        borderRadius: tokens.badge.borderRadius,
        fontSize: tokens.badge.fontSize,
        fontWeight: tokens.badge.fontWeight,
        background: resolvedBg,
        color: resolvedText,
        border: `1px solid ${resolvedBorder}`,
        whiteSpace: "nowrap",
        letterSpacing: "0.02em",
      }}
    >
      {dot && (
        <span style={{
          width: "6px", height: "6px", borderRadius: "50%",
          background: resolvedText, flexShrink: 0,
        }} />
      )}
      {resolvedLabel}
    </span>
  );
}

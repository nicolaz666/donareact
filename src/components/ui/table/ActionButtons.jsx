import { Edit2, Trash2, Eye, PlusCircle, Package } from "lucide-react";
import { tokens } from "./tokens";

const ICON_MAP = {
  edit:   { Icon: Edit2,      label: "Editar",   severity: "ghost"   },
  delete: { Icon: Trash2,     label: "Eliminar", severity: "danger"  },
  view:   { Icon: Eye,        label: "Ver",      severity: "info"    },
  create: { Icon: PlusCircle, label: "Crear",    severity: "success" },
  units:  { Icon: Package,    label: "Unidades", severity: "info"    },
};

/**
 * ActionButtons — renders an icon-button group or full-width mobile buttons.
 *
 * Props:
 *   actions: Array<{ type: "edit"|"delete"|"view"|"create"|"units", onClick, label?, hidden? }>
 *   variant: "icon" (default, compact) | "full" (labeled, stacked for mobile)
 *   confirmId / onConfirm / onCancelConfirm — inline delete confirmation
 */
export default function ActionButtons({
  actions = [],
  variant = "icon",
  confirmId = null,
  rowId,
  onConfirm,
  onCancelConfirm,
}) {
  const isConfirming = confirmId === rowId;

  if (isConfirming) {
    return (
      <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
        <span style={{ fontSize: "11px", color: "#ef4444", fontWeight: 700 }}>
          ¿Eliminar?
        </span>
        <button
          onClick={() => onConfirm(rowId)}
          style={{
            padding: "4px 10px", borderRadius: "6px",
            background: "#ef4444", color: "#fff",
            border: "none", cursor: "pointer",
            fontSize: "11px", fontWeight: 600,
          }}
        >
          Sí
        </button>
        <button
          onClick={onCancelConfirm}
          style={{
            padding: "4px 10px", borderRadius: "6px",
            background: "#f1f5f9", color: "#64748b",
            border: "none", cursor: "pointer",
            fontSize: "11px", fontWeight: 600,
          }}
        >
          No
        </button>
      </div>
    );
  }

  if (variant === "full") {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
        {actions.filter(a => !a.hidden).map(({ type, onClick, label }) => {
          const def = ICON_MAP[type] ?? ICON_MAP.view;
          const Icon = def.Icon;
          const sev = tokens.severity[def.severity] ?? tokens.severity.ghost;
          const isWide = type === "delete";
          return (
            <button
              key={type}
              onClick={onClick}
              aria-label={label ?? def.label}
              style={{
                gridColumn: isWide ? "1 / -1" : undefined,
                display: "flex", alignItems: "center", justifyContent: "center",
                gap: "6px", padding: "9px 12px", borderRadius: "9px",
                border: `1px solid ${sev.border}`,
                background: sev.bg, color: sev.text,
                cursor: "pointer", fontSize: "12px", fontWeight: 600,
                transition: "opacity 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = "0.8")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
            >
              <Icon size={14} />
              {label ?? def.label}
            </button>
          );
        })}
      </div>
    );
  }

  // variant === "icon"
  return (
    <div style={{
      display: "inline-flex", gap: "4px",
      background: tokens.action.groupBg,
      borderRadius: tokens.action.groupRadius,
      padding: tokens.action.groupPadding,
    }}>
      {actions.filter(a => !a.hidden).map(({ type, onClick, label }) => {
        const def = ICON_MAP[type] ?? ICON_MAP.view;
        const Icon = def.Icon;
        const hoverColor = type === "delete" ? "#ef4444" : "#0f172a";
        const hoverBg    = type === "delete" ? "#fee2e2" : "#fff";
        return (
          <button
            key={type}
            title={label ?? def.label}
            onClick={onClick}
            style={{
              width: tokens.action.btnSize,
              height: tokens.action.btnSize,
              borderRadius: tokens.action.btnRadius,
              border: "none", background: "transparent",
              color: "#475569", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "background 0.15s, color 0.15s",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = hoverBg;
              e.currentTarget.style.color = hoverColor;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#475569";
            }}
          >
            <Icon size={14} />
          </button>
        );
      })}
    </div>
  );
}

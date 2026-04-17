/**
 * Design tokens shared by all table/card components.
 * Edit here to change the look across the entire app.
 */

export const tokens = {
  card: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    shadow: "0 1px 4px rgba(0,0,0,0.05)",
    padding: "16px",
    gap: "12px",
  },
  table: {
    headerBg: "#f8fafc",
    headerText: "#64748b",
    rowHover: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    shadow: "0 1px 4px rgba(0,0,0,0.05)",
    cellPadding: "14px 16px",
  },
  text: {
    primary: "#0f172a",
    secondary: "#64748b",
    muted: "#94a3b8",
    price: "#047857",
  },
  badge: {
    borderRadius: "999px",
    padding: "3px 9px",
    fontSize: "11px",
    fontWeight: 600,
  },
  action: {
    groupBg: "#f1f5f9",
    groupRadius: "9px",
    groupPadding: "4px",
    btnSize: "30px",
    btnRadius: "6px",
  },
  search: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "16px 20px",
    shadow: "0 1px 3px rgba(0,0,0,0.04)",
  },
  pagination: {
    btnSize: "32px",
    btnRadius: "8px",
    activeBg: "#0f172a",
    activeColor: "#ffffff",
    inactiveBg: "#ffffff",
    inactiveColor: "#475569",
    border: "1px solid #e2e8f0",
  },
  severity: {
    success: { bg: "#f0fdf4", text: "#15803d", border: "#d1fae5" },
    danger:  { bg: "#fff1f2", text: "#ef4444", border: "#fecdd3" },
    warning: { bg: "#fffbeb", text: "#d97706", border: "#fde68a" },
    info:    { bg: "#eff6ff", text: "#1d4ed8", border: "#dbeafe" },
    ghost:   { bg: "#f8fafc", text: "#475569", border: "#e2e8f0" },
    primary: { bg: "#f5f3ff", text: "#6d28d9", border: "#e0e7ff" },
  },
};

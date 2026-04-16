import Badge from "./Badge"

const COLOR_PALETTE = {
  Negro: { bg: "#1e1e2e", text: "#e2e8f0" },
  Roble: { bg: "#d4a96a22", text: "#92632a" },
  Crudo: { bg: "#fef9ec", text: "#a0845c" },
  Chocolate: { bg: "#3d1c0822", text: "#7c3a1e" },
  Envejecido: { bg: "#e8e0d522", text: "#7a6a56" },
  "Crudo Blanco": { bg: "#f8f6f2", text: "#9a8c7e" },
  "Crudo Crema": { bg: "#fdf3dc", text: "#a07840" },
  Rojo: { bg: "#fee2e2", text: "#b91c1c" },
  "Azul Rey": { bg: "#dbeafe", text: "#1d4ed8" },
  Amarillo: { bg: "#fef9c3", text: "#a16207" },
  "Verde Manzana": { bg: "#dcfce7", text: "#15803d" },
  "Azul Celeste": { bg: "#e0f2fe", text: "#0369a1" },
  "Azul Claro": { bg: "#eff6ff", text: "#3b82f6" },
  Naranja: { bg: "#ffedd5", text: "#c2410c" },
  Mandarina: { bg: "#fef3c7", text: "#d97706" },
  "Verde Militar": { bg: "#d1fae5", text: "#065f46" },
  "Sin color secundario": { bg: "#f1f5f9", text: "#94a3b8" },
}

export function ProductColorBadge({ color }) {
  const normalized = color && String(color).trim()
  const isSecondaryBlank =
    !normalized || normalized === "Sin color secundario"

  if (isSecondaryBlank) {
    return (
      <Badge tone={{ bg: "#f1f5f9", text: "#64748b", border: "#e2e8f0" }}>
        —
      </Badge>
    )
  }

  const palette = COLOR_PALETTE[normalized] || {
    bg: "#f1f5f9",
    text: "#64748b",
  }

  const dotColor = normalized === "Negro" ? "#94a3b8" : palette.text
  const showDot = normalized !== "Sin color secundario"

  return (
    <Badge
      showDot={showDot}
      dotColor={dotColor}
      tone={{
        bg: palette.bg,
        text: palette.text,
      }}
    >
      {normalized}
    </Badge>
  )
}

const TIPO_COLORS = {
  Tejido: { bg: "#ede9fe", text: "#6d28d9" },
  Rejo: { bg: "#fce7f3", text: "#be185d" },
  Plano: { bg: "#e0f2fe", text: "#0369a1" },
  Sencillo: { bg: "#dcfce7", text: "#15803d" },
}

export function ProductTypeBadge({ tipo }) {
  const normalized = tipo && String(tipo).trim()
  const palette = (normalized && TIPO_COLORS[normalized]) || null
  if (!palette) {
    return (
      <Badge tone={{ bg: "#f1f5f9", text: "#64748b", border: "#e2e8f0" }}>
        {normalized || "—"}
      </Badge>
    )
  }

  return (
    <Badge tone={{ bg: palette.bg, text: palette.text }}>
      {normalized}
    </Badge>
  )
}


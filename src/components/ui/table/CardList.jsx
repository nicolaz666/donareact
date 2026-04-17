import { Package } from "lucide-react";
import { tokens } from "./tokens";

/**
 * CardList — renders a vertical stack of cards with an empty state.
 *
 * Props:
 *   items: any[]
 *   renderItem: (item) => ReactNode
 *   emptyMessage: string
 */
export default function CardList({ items = [], renderItem, emptyMessage = "No se encontraron resultados" }) {
  if (items.length === 0) {
    return (
      <div style={{
        background: tokens.card.background,
        border: tokens.card.border,
        borderRadius: tokens.card.borderRadius,
        padding: "40px 20px",
        textAlign: "center",
        boxShadow: tokens.card.shadow,
      }}>
        <Package size={32} style={{ display: "block", margin: "0 auto 10px", opacity: 0.3, color: tokens.text.muted }} />
        <p style={{ margin: 0, color: tokens.text.muted, fontSize: "14px" }}>
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: "10px" }}>
      {items.map((item, i) => renderItem(item, i))}
    </div>
  );
}

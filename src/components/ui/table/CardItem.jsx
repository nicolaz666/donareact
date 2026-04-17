import { tokens } from "./tokens";

/**
 * CardItem — a single mobile card row.
 *
 * Props:
 *   image: ReactNode — optional leading image/icon slot
 *   title: string | ReactNode
 *   subtitle: string | ReactNode
 *   meta: string | ReactNode  — small right-aligned meta (price, id…)
 *   metaLabel: string         — muted label under meta
 *   badges: ReactNode[]       — row of badges shown below subtitle
 *   actions: ReactNode        — ActionButtons rendered at bottom
 *   isHighlighted: bool       — danger background (delete confirm)
 */
export default function CardItem({
  image,
  title,
  subtitle,
  meta,
  metaLabel,
  badges,
  actions,
  isHighlighted = false,
}) {
  return (
    <div style={{
      background: isHighlighted ? "#fff1f2" : tokens.card.background,
      border: tokens.card.border,
      borderRadius: tokens.card.borderRadius,
      boxShadow: tokens.card.shadow,
      padding: tokens.card.padding,
      transition: "border-color 0.15s, background 0.15s",
    }}>
      <div style={{ display: "flex", gap: tokens.card.gap }}>
        {/* Optional image slot */}
        {image && (
          <div style={{ flexShrink: 0 }}>
            {image}
          </div>
        )}

        {/* Content */}
        <div style={{ minWidth: 0, flex: 1 }}>
          {/* Top row: title + meta */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "10px",
            alignItems: "flex-start",
          }}>
            <div style={{ minWidth: 0 }}>
              <div style={{
                fontWeight: 800,
                fontSize: "14px",
                color: tokens.text.primary,
                lineHeight: 1.25,
                wordBreak: "break-word",
              }}>
                {title}
              </div>
              {subtitle && (
                <div style={{ marginTop: "3px", fontSize: "12px", color: tokens.text.secondary }}>
                  {subtitle}
                </div>
              )}
            </div>

            {(meta || metaLabel) && (
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                {meta && (
                  <div style={{
                    fontSize: "13px", fontWeight: 800,
                    color: tokens.text.price,
                    fontVariantNumeric: "tabular-nums",
                    fontFamily: "'DM Mono', 'Fira Code', monospace",
                    letterSpacing: "-0.3px",
                    whiteSpace: "nowrap",
                  }}>
                    {meta}
                  </div>
                )}
                {metaLabel && (
                  <div style={{ marginTop: "2px", fontSize: "11px", color: tokens.text.muted }}>
                    {metaLabel}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Badges row */}
          {badges && (
            <div style={{
              marginTop: "10px",
              display: "flex",
              flexWrap: "wrap",
              gap: "6px",
              alignItems: "center",
            }}>
              {badges}
            </div>
          )}

          {/* Actions */}
          {actions && (
            <div style={{ marginTop: "12px" }}>
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

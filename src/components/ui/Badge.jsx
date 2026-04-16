export default function Badge({
  className = "",
  tone,
  children,
  showDot = false,
  dotColor,
}) {
  const style = tone
    ? {
        backgroundColor: tone.bg,
        color: tone.text,
        border: tone.border
          ? `1px solid ${tone.border}`
          : `1px solid ${tone.text}33`,
        whiteSpace: "nowrap",
      }
    : { backgroundColor: "#f1f5f9", color: "#64748b" }

  return (
    <span
      className={[
        "inline-flex items-center gap-2 rounded-full px-3 py-1",
        "text-[11px] font-semibold tracking-wide",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
    >
      {showDot && (
        <span
          aria-hidden="true"
          className="inline-block h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: dotColor || style?.color }}
        />
      )}
      {children}
      {/** keep spacing consistent even when no dot */}
    </span>
  )
}


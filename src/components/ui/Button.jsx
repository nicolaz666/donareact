const base =
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-400/60 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"

const sizes = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-sm",
}

const variants = {
  primary:
    "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500/60",
  secondary:
    "bg-slate-100 text-slate-700 hover:bg-slate-200 focus:ring-slate-300/60",
  danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500/60",
  ghost:
    "bg-transparent text-slate-600 hover:bg-slate-100 focus:ring-slate-200/60",
  success:
    "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500/60",
  outlined:
    "bg-transparent text-slate-700 hover:bg-slate-50 border border-slate-200 focus:ring-indigo-500/60",
}

export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  children,
  ...props
}) {
  return (
    <button
      type={type}
      className={[base, sizes[size] || sizes.md, variants[variant], className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </button>
  )
}


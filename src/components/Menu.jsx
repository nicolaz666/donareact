import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Tag,
  Package,
  ShoppingCart,
  LogOut,
  ChevronRight,
  Zap,
} from "lucide-react";

const LINKS_SIDEBAR = [
  { id: 1, path: "/", name: "Dashboard", icon: LayoutDashboard },
  { id: 2, path: "/Clientes", name: "Clientes", icon: Users },
  { id: 3, path: "/Categorias", name: "Categorías", icon: Tag },
  { id: 4, path: "/Producto", name: "Productos", icon: Package },
  { id: 5, path: "/MostrarVentas", name: "Ventas", icon: ShoppingCart },
];

const NavItem = ({ link, isActive }) => {
  const Icon = link.icon;

  return (
    <li>
      <Link
        to={link.path}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "11px 14px",
          borderRadius: "10px",
          position: "relative",
          textDecoration: "none",
          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          backgroundColor: isActive ? "rgba(139, 92, 246, 0.15)" : "transparent",
          color: isActive ? "#a78bfa" : "#94a3b8",
          fontWeight: isActive ? "500" : "400",
          overflow: "hidden",
          marginBottom: "2px",
        }}
        onMouseEnter={(e) => {
          if (!isActive) {
            e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.06)";
            e.currentTarget.style.color = "#e2e8f0";
            e.currentTarget.style.paddingLeft = "18px";
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "#94a3b8";
            e.currentTarget.style.paddingLeft = "14px";
          }
        }}
      >
        {/* Active bar indicator */}
        <span
          style={{
            position: "absolute",
            left: 0,
            top: "50%",
            transform: "translateY(-50%)",
            width: "3px",
            height: isActive ? "60%" : "0%",
            backgroundColor: "#8b5cf6",
            borderRadius: "0 3px 3px 0",
            transition: "height 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />

        {/* Icon */}
        <span
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "20px",
            height: "20px",
            flexShrink: 0,
            transition: "transform 0.2s ease",
          }}
        >
          <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
        </span>

        {/* Label */}
        <span
          style={{
            fontSize: "14px",
            letterSpacing: "0.01em",
            transition: "color 0.2s ease",
            flex: 1,
          }}
        >
          {link.name}
        </span>

        {/* Chevron on active */}
        {isActive && (
          <ChevronRight
            size={14}
            style={{ opacity: 0.5, flexShrink: 0 }}
          />
        )}
      </Link>
    </li>
  );
};

const Menu = () => {
  const location = useLocation();

  return (
    <aside
      style={{
        width: "240px",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(180deg, #1a2236 0%, #131c2e 60%, #0f1724 100%)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        padding: "0",
        position: "relative",
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      }}
    >
      {/* Subtle top glow */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "180px",
          background: "radial-gradient(ellipse at 50% 0%, rgba(139,92,246,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* ── LOGO AREA ── */}
      <div
        style={{
          padding: "24px 20px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "8px",
            background: "linear-gradient(135deg, #8b5cf6, #6366f1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            boxShadow: "0 4px 12px rgba(139,92,246,0.35)",
          }}
        >
          <Zap size={16} color="#fff" strokeWidth={2.5} />
        </div>
        <div>
          <div
            style={{
              fontSize: "15px",
              fontWeight: "700",
              color: "#f1f5f9",
              lineHeight: 1.1,
              letterSpacing: "-0.01em",
            }}
          >
            DONACIANO
          </div>
          <div
            style={{
              fontSize: "10px",
              color: "#64748b",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              fontWeight: "500",
            }}
          >
            Panel de gestión
          </div>
        </div>
      </div>

      {/* ── NAV LINKS ── */}
      <nav style={{ flex: 1, padding: "16px 12px" }}>
        <p
          style={{
            fontSize: "10px",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#475569",
            fontWeight: "600",
            padding: "0 6px",
            marginBottom: "10px",
          }}
        >
          Menú principal
        </p>
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {LINKS_SIDEBAR.map((link) => (
            <NavItem
              key={link.id}
              link={link}
              isActive={location.pathname === link.path}
            />
          ))}
        </ul>
      </nav>

      
      
    </aside>
  );
};

export default Menu;
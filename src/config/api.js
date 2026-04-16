const DEFAULT_API_URL = "https://donacianocore.onrender.com/api/";

/**
 * Base de API (siempre termina con `/`).
 * Puedes sobreescribirla con `VITE_API_URL` en runtime.
 */
export const BASE_API_URL = (() => {
  const raw = import.meta.env.VITE_API_URL || DEFAULT_API_URL;
  return raw.endsWith("/") ? raw : `${raw}/`;
})();

/**
 * Construye una URL absoluta hacia el backend evitando duplicaciones tipo `/api/api`.
 * - Si `path` ya es una URL absoluta (http/https), se retorna tal cual.
 * - Si `path` empieza con `/`, se normaliza.
 * - Si `path` empieza con `api/`, se elimina ese prefijo (porque BASE_API_URL ya incluye `/api/`).
 */
export function buildApiUrl(path = "") {
  if (!path) return BASE_API_URL;
  if (/^https?:\/\//i.test(path)) return path;

  let normalized = String(path).trim();
  normalized = normalized.replace(/^\/+/, "");
  normalized = normalized.replace(/^api\/+/i, "");

  return new URL(normalized, BASE_API_URL).toString();
}

/**
 * URL base sin `/api` (útil para servir imágenes/media que vienen como paths absolutos).
 */
export const BASE_BACKEND_URL = (() => {
  try {
    const u = new URL(BASE_API_URL);
    return `${u.protocol}//${u.host}`;
  } catch {
    return "https://donacianocore.onrender.com";
  }
})();


export const formatCLP = (num) => {
  if (!num) return "$0";
  return "$" + Math.round(num).toLocaleString("es-CL");
};

// Normaliza un RUT chileno a formato 00.000.000-0
// Acepta entrada con o sin puntos y guion, con dígito verificador K/k.
export const formatRut = (raw) => {
  if (!raw) return "";
  const clean = String(raw).replace(/[^0-9kK]/g, "").toUpperCase();
  if (clean.length < 2) return clean;
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  const withDots = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${withDots}-${dv}`;
};

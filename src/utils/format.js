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

// Calcula dígito verificador esperado (mod-11) para un cuerpo de RUT.
const computeRutDv = (body) => {
  let sum = 0;
  let multiplier = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += Number(body[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  const remainder = 11 - (sum % 11);
  if (remainder === 11) return "0";
  if (remainder === 10) return "K";
  return String(remainder);
};

// Valida un RUT chileno completo (cuerpo + dígito verificador).
export const isValidRut = (raw) => {
  if (!raw) return false;
  const clean = String(raw).replace(/[^0-9kK]/g, "").toUpperCase();
  if (clean.length < 2) return false;
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  if (!/^\d+$/.test(body)) return false;
  return computeRutDv(body) === dv;
};

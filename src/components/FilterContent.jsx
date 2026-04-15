import React, { useState } from "react";
import { DollarSign } from "lucide-react";
import { BRAND_COLOR, VEHICLE_TYPES, ACCESS_TYPES, SECURITY_FEATURES } from "../constants";
import { Pill, Btn, Input } from "./ui";

const FilterContent = ({ filters, onApply }) => {
  const [priceRange, setPriceRange] = useState(filters.priceRange || [0, 100000]);
  const [vehicle, setVehicle] = useState(filters.vehicleType || "");
  const [accessType, setAccessType] = useState(filters.access || "");
  const [secFeatures, setSecFeatures] = useState(filters.security || []);
  const [evOnly, setEvOnly] = useState(filters.ev || false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Price */}
      <div>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Rango de precio</h3>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Input icon={DollarSign} type="number" placeholder="Mín" value={priceRange[0]} onChange={e => setPriceRange([+e.target.value, priceRange[1]])} style={{ width: 100 }} />
          <span style={{ color: "#555" }}>—</span>
          <Input icon={DollarSign} type="number" placeholder="Máx" value={priceRange[1]} onChange={e => setPriceRange([priceRange[0], +e.target.value])} style={{ width: 100 }} />
        </div>
      </div>

      {/* Vehicle */}
      <div>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Tipo de vehículo</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {VEHICLE_TYPES.map(v => <Pill key={v} active={vehicle === v} onClick={() => setVehicle(vehicle === v ? "" : v)}>{v}</Pill>)}
        </div>
      </div>

      {/* Access */}
      <div>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Tipo de acceso</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {ACCESS_TYPES.map(a => <Pill key={a} active={accessType === a} onClick={() => setAccessType(accessType === a ? "" : a)}>{a}</Pill>)}
        </div>
      </div>

      {/* Security */}
      <div>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Seguridad</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {SECURITY_FEATURES.map(s => <Pill key={s} active={secFeatures.includes(s)} onClick={() => setSecFeatures(secFeatures.includes(s) ? secFeatures.filter(x => x !== s) : [...secFeatures, s])}>{s}</Pill>)}
        </div>
      </div>

      {/* EV */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0", borderTop: "1px solid #eee" }}>
        <div>
          <div style={{ fontWeight: 600 }}>Solo con carga eléctrica</div>
          <div style={{ fontSize: 13, color: "#555" }}>Mostrar solo espacios con cargador EV</div>
        </div>
        <div onClick={() => setEvOnly(!evOnly)} style={{ width: 48, height: 28, borderRadius: 14, background: evOnly ? BRAND_COLOR : "#ccc", cursor: "pointer", transition: "background .2s", position: "relative" }}>
          <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#fff", position: "absolute", top: 2, left: evOnly ? 22 : 2, transition: "left .2s", boxShadow: "0 1px 3px rgba(0,0,0,.2)" }} />
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #eee", paddingTop: 20 }}>
        <button onClick={() => { setVehicle(""); setAccessType(""); setSecFeatures([]); setEvOnly(false); setPriceRange([0, 100000]); }} style={{ background: "none", border: "none", textDecoration: "underline", fontWeight: 600, cursor: "pointer", fontSize: 15, fontFamily: "inherit" }}>Limpiar todo</button>
        <Btn primary onClick={() => onApply({ priceRange, vehicleType: vehicle, access: accessType, security: secFeatures, ev: evOnly })}>Mostrar resultados</Btn>
      </div>
    </div>
  );
};

export default FilterContent;

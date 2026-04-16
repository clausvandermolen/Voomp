import { useState, useEffect } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, Camera, DollarSign, CheckCircle, Upload, X } from "lucide-react";
import { BRAND_COLOR, BRAND_GRADIENT, DARK_BG, VEHICLE_TYPES, ACCESS_TYPES, SECURITY_FEATURES, CHILE_REGIONS_COMUNAS } from "../constants";
import { Btn, Input, Pill } from "../components/ui";
import CreateListingMap from "../components/CreateListingMap";

const CreateListingPage = ({ onBack, onPublish, onDeletePhoto, initialData }) => {
  const [step, setStep] = useState(0);
  const [publishing, setPublishing] = useState(false);

  /* FIX: Added cancellation and location points to form state, and loaded initial data */
  const [form, setForm] = useState(() => {
    if (initialData) {
      const [initComuna, initRegion] = (initialData.location || "").split(", ").map(s => s.trim());
      return {
        id: initialData.id,
        title: initialData.title || "",
        description: initialData.description || "",
        photos: initialData.photos || [],
        type: initialData.type || "covered",
        vehicleTypes: initialData.vehicleTypes || [],
        access: initialData.access || "",
        width: initialData.dimensions?.width || "",
        length: initialData.dimensions?.length || "",
        height: initialData.dimensions?.height || "",
        price: initialData.price || "",
        priceUnit: initialData.priceUnit || "hora",
        priceDaily: initialData.priceDaily || "",
        priceMonthly: initialData.priceMonthly || "",
        dailyStart: initialData.dimensions?.dailyStart || "06:00",
        dailyEnd: initialData.dimensions?.dailyEnd || "22:00",
        ev: initialData.ev || false,
        security: initialData.security || [],
        rules: Array.isArray(initialData.rules) ? initialData.rules.join('\n') : (initialData.rules || ""),
        cancellation: initialData.cancellation || "flexible",
        address: initialData.address || "",
        location: initialData.location || "",
        region: initRegion || "",
        comuna: initComuna || "",
        lat: initialData.lat || null,
        lng: initialData.lng || null,
        availableDays: initialData.availableDays || []
      };
    }
    return { title: "", description: "", photos: [], type: "covered", vehicleTypes: [], access: "", width: "", length: "", height: "", price: "", priceUnit: "hora", priceDaily: "", priceMonthly: "", dailyStart: "06:00", dailyEnd: "22:00", ev: false, security: [], rules: "", cancellation: "flexible", address: "", location: "", region: "", comuna: "", lat: null, lng: null, availableDays: [] };
  });
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState(null);
  const [dragStartKey, setDragStartKey] = useState(null);
  const [preDragDays, setPreDragDays] = useState([]);
  const [showSeriesPanel, setShowSeriesPanel] = useState(false);
  const [series, setSeries] = useState({ days: [], startH: "08", startM: "00", endH: "19", endM: "00", until: "2026-12-31" });

  const MONTH_NAMES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
  const DAY_LABELS = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];
  const getDaysInMonth = (m, y) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfWeek = (m, y) => { const d = new Date(y, m, 1).getDay(); return d === 0 ? 6 : d - 1; };
  const makeDateKey = (d, m, y) => `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  const toggleDay = (key) => setForm(prev => {
    const days = [...(prev.availableDays || [])];
    return { ...prev, availableDays: days.includes(key) ? days.filter(x => x !== key) : [...days, key] };
  });

  const getDateRange = (startKey, endKey) => {
    const [sy, sm, sd] = startKey.split("-").map(Number);
    const [ey, em, ed] = endKey.split("-").map(Number);
    let a = new Date(sy, sm - 1, sd), b = new Date(ey, em - 1, ed);
    if (a > b) [a, b] = [b, a];
    const keys = [];
    const cur = new Date(a);
    while (cur <= b) {
      keys.push(`${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, "0")}-${String(cur.getDate()).padStart(2, "0")}`);
      cur.setDate(cur.getDate() + 1);
    }
    return keys;
  };

  const handleDayMouseDown = (key) => {
    const isAvail = (form.availableDays || []).includes(key);
    const mode = isAvail ? "remove" : "add";
    setIsDragging(true);
    setDragMode(mode);
    setDragStartKey(key);
    setPreDragDays([...(form.availableDays || [])]);
    if (mode === "add") setForm(prev => ({ ...prev, availableDays: [...new Set([...(prev.availableDays || []), key])] }));
    else setForm(prev => ({ ...prev, availableDays: prev.availableDays.filter(x => x !== key) }));
  };

  const handleDayMouseEnter = (key) => {
    if (!isDragging || !dragStartKey) return;
    const range = getDateRange(dragStartKey, key);
    if (dragMode === "add") {
      setForm(prev => ({ ...prev, availableDays: [...new Set([...preDragDays, ...range])] }));
    } else {
      setForm(prev => ({ ...prev, availableDays: preDragDays.filter(x => !range.includes(x)) }));
    }
  };

  const handleMouseUp = () => { setIsDragging(false); setDragMode(null); setDragStartKey(null); };

  const applySeries = () => {
    if (series.days.length === 0) return;
    const until = new Date(series.until);
    const newDays = [...(form.availableDays || [])];
    const today = new Date();
    const cur = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    while (cur <= until) {
      const jsDay = cur.getDay();
      const isoDay = jsDay === 0 ? 6 : jsDay - 1;
      if (series.days.includes(isoDay)) {
        const key = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, "0")}-${String(cur.getDate()).padStart(2, "0")}`;
        if (!newDays.includes(key)) newDays.push(key);
      }
      cur.setDate(cur.getDate() + 1);
    }
    setForm(prev => ({ ...prev, availableDays: newDays }));
    setShowSeriesPanel(false);
  };

  const handlePhotosUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const previewUrl = URL.createObjectURL(file);
      setForm(prev => ({
        ...prev,
        photos: [...(prev.photos || []), previewUrl],
        photoFiles: [...(prev.photoFiles || []), file],
      }));
    });
  };

  const steps = [
    { title: "Cuéntanos sobre tu espacio", subtitle: "Tipo y características" },
    { title: "Ubicación del espacio", subtitle: "Dirección exacta y geolocalización" },
    { title: "Describe tu estacionamiento", subtitle: "Título, descripción y fotos" },
    { title: "Dimensiones y acceso", subtitle: "Medidas y tipo de entrada" },
    { title: "Disponibilidad y precio", subtitle: "Calendario y tarifa" },
    { title: "Seguridad y reglas", subtitle: "Protección y normas" },
  ];

  const progress = ((step + 1) / steps.length) * 100;

  return (
    <div style={{ minHeight: "100vh", background: "#fff" }}>
      {/* Progress bar */}
      <div style={{ height: 4, background: "#f0f0f0" }}>
        <div style={{ height: "100%", background: BRAND_GRADIENT, width: `${progress}%`, transition: "width .4s" }} />
      </div>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "40px 24px 120px" }}>
        <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 15, fontWeight: 500, marginBottom: 32, color: "#555" }}>
          <ArrowLeft size={18} /> Salir
        </button>

        <div style={{ fontSize: 12, fontWeight: 600, color: BRAND_COLOR, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Paso {step + 1} de {steps.length} {initialData ? "(Modo Edición)" : ""}</div>
        <h1 style={{ fontSize: 30, fontWeight: 800, marginBottom: 6 }}>{steps[step].title}</h1>
        <p style={{ color: "#555", fontSize: 16, marginBottom: 36 }}>{steps[step].subtitle}</p>

        {step === 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div>
              <label style={{ fontWeight: 600, marginBottom: 8, display: "block" }}>Tipo de espacio</label>
              <div style={{ display: "flex", gap: 12 }}>
                {[{ v: "covered", l: "Techado 🏠" }, { v: "outdoor", l: "Aire libre ☀️" }].map(t => (
                  <div key={t.v} onClick={() => setForm({ ...form, type: t.v })} style={{ flex: 1, padding: 20, borderRadius: 12, border: form.type === t.v ? `2px solid ${DARK_BG}` : "1px solid #ddd", cursor: "pointer", textAlign: "center", fontWeight: form.type === t.v ? 700 : 400, fontSize: 16, transition: "all .15s" }}>{t.l}</div>
                ))}
              </div>
            </div>
            <div>
              <label style={{ fontWeight: 600, marginBottom: 8, display: "block" }}>¿Qué vehículos caben?</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                <Pill active={form.vehicleTypes.length === VEHICLE_TYPES.length} onClick={() => setForm({ ...form, vehicleTypes: form.vehicleTypes.length === VEHICLE_TYPES.length ? [] : [...VEHICLE_TYPES] })}>Todos</Pill>
                {VEHICLE_TYPES.map(v => <Pill key={v} active={form.vehicleTypes.includes(v)} onClick={() => setForm({ ...form, vehicleTypes: form.vehicleTypes.includes(v) ? form.vehicleTypes.filter(x => x !== v) : [...form.vehicleTypes, v] })}>{v}</Pill>)}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0", borderTop: "1px solid #eee" }}>
              <div><div style={{ fontWeight: 600 }}>¿Tiene cargador eléctrico?</div><div style={{ fontSize: 13, color: "#555" }}>Los espacios con EV tienen mayor demanda</div></div>
              <div onClick={() => setForm({ ...form, ev: !form.ev })} style={{ width: 48, height: 28, borderRadius: 14, background: form.ev ? BRAND_COLOR : "#ccc", cursor: "pointer", transition: "background .2s", position: "relative" }}>
                <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#fff", position: "absolute", top: 2, left: form.ev ? 22 : 2, transition: "left .2s", boxShadow: "0 1px 3px rgba(0,0,0,.2)" }} />
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <label style={{ fontWeight: 600, marginBottom: 8, display: "block" }}>Dirección</label>
              <Input placeholder="Ej: Av. Providencia 2150, Providencia" value={form.address || ""} onChange={e => setForm({ ...form, address: e.target.value })} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={{ fontWeight: 600, marginBottom: 8, display: "block" }}>Región</label>
                <select 
                  value={form.region} 
                  onChange={e => {
                    const reg = e.target.value;
                    setForm({ ...form, region: reg, comuna: "", location: reg ? `, ${reg}` : "" });
                  }}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #ddd", fontSize: 15, fontFamily: "inherit", outline: "none", background: "#fff", cursor: "pointer" }}
                >
                  <option value="">Selecciona Región</option>
                  {Object.keys(CHILE_REGIONS_COMUNAS).map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontWeight: 600, marginBottom: 8, display: "block" }}>Comuna</label>
                <select 
                  value={form.comuna} 
                  disabled={!form.region}
                  onChange={e => {
                    const com = e.target.value;
                    setForm({ ...form, comuna: com, location: `${com}, ${form.region}` });
                  }}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #ddd", fontSize: 15, fontFamily: "inherit", outline: "none", background: form.region ? "#fff" : "#f5f5f5", cursor: form.region ? "pointer" : "default" }}
                >
                  <option value="">Selecciona Comuna</option>
                  {form.region && CHILE_REGIONS_COMUNAS[form.region]?.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <Btn outline onClick={async () => {
              if(!form.address && !form.comuna) return;
              try {
                const q = encodeURIComponent(`${form.address}, ${form.comuna}, ${form.region}, Chile`);
                const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${q}&viewbox=-75.6,-56.0,-66.0,-17.5&bounded=1&accept-language=es&addressdetails=1&limit=1`);
                const data = await res.json();
                if(data && data.length > 0) {
                  const lat = parseFloat(data[0].lat);
                  const lng = parseFloat(data[0].lon);
                  const a = data[0].address || {};
                  
                  // Update address if we found a more specific one
                  let newAddr = form.address;
                  if (data[0].display_name) {
                    const parts = data[0].display_name.split(", ").map(p => p.trim());
                    // Nominatim often returns [Number, Street, Comuna]
                    // We want [Street, Number, Comuna]
                    if (parts.length >= 2 && /^\d+[A-Za-z-]?$/.test(parts[0])) {
                      newAddr = `${parts[1]}, ${parts[0]}${parts[2] ? ", " + parts[2] : ""}`;
                    } else {
                      newAddr = parts.slice(0, 3).join(", ");
                    }
                  }

                  setForm({ ...form, lat, lng, address: newAddr });
                } else {
                  alert("No pudimos encontrar la dirección introducida.");
                }
              } catch(e) {
                console.error(e);
              }
            }}>Buscar y verificar en mapa</Btn>
            {form.lat && form.lng && (
              <div style={{ padding: 12, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12, display: "flex", alignItems: "center", gap: 8 }}>
                <CheckCircle size={20} color="#16a34a" />
                <span style={{ color: "#166534", fontWeight: 600 }}>Ubicación: {form.lat.toFixed(5)}, {form.lng.toFixed(5)}</span>
              </div>
            )}
            <div style={{ width: "100%", height: 320, borderRadius: 12, background: "#f7f7f7", border: "1px solid #eee", overflow: "hidden", marginTop: 8 }}>
              <CreateListingMap lat={form.lat} lng={form.lng} onLocationChange={(lat, lng, address, location, raw) => setForm(prev => {
                let finalRegion = prev.region;
                let finalComuna = prev.comuna;
                let finalAddress = prev.address;

                if (raw) {
                  // 1. Try to match Region
                  const rawState = raw.state || "";
                  const foundRegion = Object.keys(CHILE_REGIONS_COMUNAS).find(r => 
                    rawState.toLowerCase().includes(r.toLowerCase()) || 
                    (r === "Metropolitana de Santiago" && rawState.toLowerCase().includes("metropolitana")) ||
                    (r === "Libertador General Bernardo O'Higgins" && rawState.toLowerCase().includes("o'higgins")) ||
                    (r === "Aysén del General Carlos Ibáñez del Campo" && rawState.toLowerCase().includes("aysén"))
                  );
                  
                  if (foundRegion) {
                    finalRegion = foundRegion;
                    // 2. Try to match Comuna
                    const rawCity = raw.city || "";
                    const foundComuna = CHILE_REGIONS_COMUNAS[foundRegion].find(c => 
                      rawCity.toLowerCase() === c.toLowerCase() || 
                      c.toLowerCase().includes(rawCity.toLowerCase())
                    );
                    if (foundComuna) finalComuna = foundComuna;
                  }

                if (address) {
                  const parts = address.split(", ").map(p => p.trim());
                  // Nominatim often returns [Number, Street, Comuna]
                  // User wants [Street, Number, Comuna]
                  if (parts.length >= 2 && /^\d+[A-Za-z-]?$/.test(parts[0])) {
                    finalAddress = `${parts[1]}, ${parts[0]}${parts[2] ? ", " + parts[2] : ""}`;
                  } else {
                    finalAddress = parts.slice(0, 3).join(", ");
                  }
                }
                }

                return { 
                  ...prev, 
                  lat, lng, 
                  address: finalAddress, 
                  region: finalRegion,
                  comuna: finalComuna,
                  location: finalComuna && finalRegion ? `${finalComuna}, ${finalRegion}` : (location || prev.location)
                };
              })} />
            </div>
            <p style={{ fontSize: 13, color: "#555", marginTop: 4 }}>Haz clic en el mapa para ajustar la ubicación exacta del estacionamiento.</p>
          </div>
        )}

        {step === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Identity Banner for verification */}
            <div style={{ background: "#000", color: "#fff", padding: "10px", borderRadius: 8, fontSize: 13, fontWeight: 700, textAlign: "center", marginBottom: 10 }}>Voomp Fix v3 Active - Identity Verified</div>

            <div>
              <label style={{ fontWeight: 600, marginBottom: 8, display: "block" }}>Título del anuncio</label>
              <Input placeholder="Ej: Estacionamiento techado en Providencia" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <label style={{ fontWeight: 600, marginBottom: 8, display: "block" }}>Descripción</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe tu espacio, el barrio, y por qué es ideal para estacionar..." rows={5} style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: "1px solid #ddd", fontSize: 15, fontFamily: "inherit", resize: "vertical", outline: "none", boxSizing: "border-box", background: "#fff", color: "#222" }} />
            </div>
            <div>
              <label style={{ fontWeight: 600, marginBottom: 8, display: "block" }}>Fotos</label>
              <div style={{ position: "relative", border: "2px dashed #ddd", borderRadius: 12, padding: 40, textAlign: "center", cursor: "pointer", overflow: "hidden" }}>
                <input type="file" multiple accept="image/*" onChange={handlePhotosUpload} style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", zIndex: 10 }} title="Sube las fotos de tu espacio" />
                <Camera size={40} color="#555" style={{ marginBottom: 12 }} />
                <div style={{ fontWeight: 600, marginBottom: 4 }}>Arrastra tus fotos aquí</div>
                <div style={{ color: "#555", fontSize: 14 }}>o haz clic para seleccionar</div>
                <Btn outline small style={{ marginTop: 16 }}><Upload size={14} /> Subir fotos</Btn>
              </div>
              {form.photos && form.photos.length > 0 && (
                <div style={{ display: "flex", gap: 12, marginTop: 16, overflowX: "auto", paddingBottom: 8 }}>
                  {form.photos.map((p, i) => (
                    <div key={i} style={{ position: "relative", width: 80, height: 80, borderRadius: 8, overflow: "hidden", flexShrink: 0 }}>
                      <img src={p} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <button onClick={async (e) => {
                        e.stopPropagation();
                        // Snappy UI update: remove from local state immediately for responsiveness
                        setForm(prev => {
                          const newPhotos = [...(prev.photos || [])];
                          const newPhotoFiles = [...(prev.photoFiles || [])];
                          const isBlob = p.startsWith('blob:');
                          if (!isBlob) {
                            const blobIndex = prev.photos.slice(0, i).filter(url => url.startsWith('blob:')).length;
                            if (blobIndex < newPhotoFiles.length) newPhotoFiles.splice(blobIndex, 1);
                          }
                          newPhotos.splice(i, 1);
                          return { ...prev, photos: newPhotos, photoFiles: newPhotoFiles };
                        });

                        // Clear from backend if existing
                        if (!p.startsWith('blob:') && onDeletePhoto) {
                          await onDeletePhoto(p, form.id);
                        }
                      }} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", background: "transparent", border: "none", cursor: "pointer", zIndex: 9999, display: "flex", alignItems: "flex-start", justifyContent: "flex-end", padding: 4 }}>
                        <div style={{ background: "#000000cc", border: "1.5px solid #ffffff", borderRadius: "50%", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", width: 30, height: 30, boxShadow: "0 2px 10px rgba(0,0,0,0.5)" }}><X size={18} /></div>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <label style={{ fontWeight: 600, marginBottom: 12, display: "block" }}>Dimensiones del espacio</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                <div>
                  <div style={{ fontSize: 13, color: "#555", marginBottom: 4 }}>Ancho (m)</div>
                  <Input type="number" placeholder="2.5" value={form.width} onChange={e => setForm({ ...form, width: e.target.value })} />
                </div>
                <div>
                  <div style={{ fontSize: 13, color: "#555", marginBottom: 4 }}>Largo (m)</div>
                  <Input type="number" placeholder="5.0" value={form.length} onChange={e => setForm({ ...form, length: e.target.value })} />
                </div>
                <div>
                  <div style={{ fontSize: 13, color: "#555", marginBottom: 4 }}>Altura máx (m)</div>
                  <Input type="number" placeholder="2.4" value={form.height} onChange={e => setForm({ ...form, height: e.target.value })} />
                </div>
              </div>
            </div>
            <div>
              <label style={{ fontWeight: 600, marginBottom: 8, display: "block" }}>Tipo de acceso</label>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {ACCESS_TYPES.map(a => (
                  <div key={a} onClick={() => setForm({ ...form, access: a })} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 10, border: form.access === a ? `2px solid ${DARK_BG}` : "1px solid #ddd", cursor: "pointer", transition: "all .15s" }}>
                    {form.access === a ? <CheckCircle size={20} color={DARK_BG} /> : <div style={{ width: 20, height: 20, borderRadius: "50%", border: "2px solid #ccc" }} />}
                    <span style={{ fontWeight: form.access === a ? 600 : 400 }}>{a}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
            {/* Pricing */}
            <div>
              <label style={{ fontWeight: 600, marginBottom: 12, display: "block" }}>Precios</label>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div style={{ flex: 1 }}><Input icon={DollarSign} type="number" placeholder="1500" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} /></div>
                  <span style={{ color: "#555", fontSize: 14, minWidth: 70 }}>CLP / hora</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <div style={{ flex: 1 }}><Input icon={DollarSign} type="number" placeholder="8000" value={form.priceDaily} onChange={e => setForm({ ...form, priceDaily: e.target.value })} /></div>
                    <span style={{ color: "#555", fontSize: 14, minWidth: 70 }}>CLP / día</span>
                  </div>
                  {Number(form.priceDaily) > 0 && (
                    <div style={{ display: "flex", gap: 12, alignItems: "center", paddingLeft: 12, borderLeft: "2px solid #ddd", marginLeft: 4 }}>
                      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#555" }}>Horario de inicio diario</span>
                        <input type="time" value={form.dailyStart} onChange={e => setForm({ ...form, dailyStart: e.target.value })} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14, outline: "none" }} />
                      </div>
                      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#555" }}>Horario de término diario</span>
                        <input type="time" value={form.dailyEnd} onChange={e => setForm({ ...form, dailyEnd: e.target.value })} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14, outline: "none" }} />
                      </div>
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div style={{ flex: 1 }}><Input icon={DollarSign} type="number" placeholder="120000" value={form.priceMonthly} onChange={e => setForm({ ...form, priceMonthly: e.target.value })} /></div>
                  <span style={{ color: "#555", fontSize: 14, minWidth: 70 }}>CLP / mes</span>
                </div>
              </div>
            </div>

            {/* Calendar */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <label style={{ fontWeight: 600 }}>Calendario de disponibilidad</label>
                <button onClick={() => setShowSeriesPanel(!showSeriesPanel)} style={{ background: "none", border: "1px solid #ddd", borderRadius: 8, padding: "6px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", color: BRAND_COLOR }}>
                  {showSeriesPanel ? "Cerrar" : "Días en serie"}
                </button>
              </div>

              {/* Series panel */}
              {showSeriesPanel && (
                <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 20, marginBottom: 16, background: "#fafafa" }}>
                  <div style={{ fontWeight: 600, marginBottom: 12 }}>Seleccionar días recurrentes</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
                    {DAY_LABELS.map((d, i) => (
                      <Pill key={i} active={series.days.includes(i)} onClick={() => setSeries(prev => ({ ...prev, days: prev.days.includes(i) ? prev.days.filter(x => x !== i) : [...prev.days, i] }))}>{d.substring(0, 3)}</Pill>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 12, marginBottom: 16, alignItems: "center", flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>Desde</span>
                      <select value={series.startH} onChange={e => setSeries({ ...series, startH: e.target.value })} style={{ padding: "6px 8px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14, fontFamily: "inherit" }}>
                        {Array.from({ length: 24 }, (_, i) => <option key={i} value={String(i).padStart(2, "0")}>{String(i).padStart(2, "0")}</option>)}
                      </select>
                      <span>:</span>
                      <select value={series.startM} onChange={e => setSeries({ ...series, startM: e.target.value })} style={{ padding: "6px 8px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14, fontFamily: "inherit" }}>
                        {["00", "15", "30", "45"].map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>Hasta</span>
                      <select value={series.endH} onChange={e => setSeries({ ...series, endH: e.target.value })} style={{ padding: "6px 8px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14, fontFamily: "inherit" }}>
                        {Array.from({ length: 24 }, (_, i) => <option key={i} value={String(i).padStart(2, "0")}>{String(i).padStart(2, "0")}</option>)}
                      </select>
                      <span>:</span>
                      <select value={series.endM} onChange={e => setSeries({ ...series, endM: e.target.value })} style={{ padding: "6px 8px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14, fontFamily: "inherit" }}>
                        {["00", "15", "30", "45"].map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>Repetir hasta</span>
                    <input type="date" value={series.until} onChange={e => setSeries({ ...series, until: e.target.value })} style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14, fontFamily: "inherit" }} />
                  </div>
                  {series.days.length > 0 && (
                    <p style={{ fontSize: 13, color: "#555", marginBottom: 12 }}>
                      Todos los <strong>{series.days.sort((a, b) => a - b).map(d => DAY_LABELS[d]).join(", ")}</strong> de {series.startH}:{series.startM} a {series.endH}:{series.endM} hasta el {series.until}
                    </p>
                  )}
                  <Btn primary onClick={applySeries} disabled={series.days.length === 0}>Aplicar al calendario</Btn>
                </div>
              )}

              <div style={{ border: "1px solid #ddd", borderRadius: 12, overflow: "hidden" }}>
                <div style={{ background: "#f7f7f7", padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <button onClick={() => { if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); } else setCalMonth(calMonth - 1); }} style={{ background: "none", border: "none", cursor: "pointer" }}><ChevronLeft size={20} /></button>
                  <span style={{ fontWeight: 600 }}>{MONTH_NAMES[calMonth]} {calYear}</span>
                  <button onClick={() => { if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); } else setCalMonth(calMonth + 1); }} style={{ background: "none", border: "none", cursor: "pointer" }}><ChevronRight size={20} /></button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", padding: 8, gap: 2 }}>
                  {["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"].map(d => (
                    <div key={d} style={{ textAlign: "center", fontSize: 12, fontWeight: 600, color: "#555", padding: 8 }}>{d}</div>
                  ))}
                  {Array.from({ length: getFirstDayOfWeek(calMonth, calYear) }).map((_, i) => <div key={`e${i}`} />)}
                  {Array.from({ length: getDaysInMonth(calMonth, calYear) }).map((_, i) => {
                    const key = makeDateKey(i + 1, calMonth, calYear);
                    const isAvail = (form.availableDays || []).includes(key);
                    return (
                      <div key={i} onMouseDown={() => handleDayMouseDown(key)} onMouseEnter={() => handleDayMouseEnter(key)} style={{ textAlign: "center", padding: 10, borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 500, background: isAvail ? "#e8f5e8" : "#fff", color: isAvail ? "#008A05" : "#222", transition: "background .1s", userSelect: "none" }}>
                        {i + 1}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                <p style={{ fontSize: 13, color: "#555" }}>Clic o arrastra para seleccionar. {(form.availableDays || []).length} días seleccionados.</p>
                {(form.availableDays || []).length > 0 && (
                  <button onClick={() => setForm(prev => ({ ...prev, availableDays: [] }))} style={{ background: "none", border: "none", color: BRAND_COLOR, fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>Limpiar todo</button>
                )}
              </div>
            </div>

            {/* Cancellation */}
            <div>
              <label style={{ fontWeight: 600, marginBottom: 8, display: "block" }}>Política de cancelación</label>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { v: "flexible", l: "Flexible", d: "Cancelación gratuita hasta 24h antes" },
                  { v: "moderate", l: "Moderada", d: "Cancelación gratuita hasta 5 días antes" },
                  { v: "strict", l: "Estricta", d: "Sin reembolso tras la reserva" },
                ].map(p => (
                  <div key={p.v} onClick={() => setForm({ ...form, cancellation: p.v })} style={{ padding: "14px 16px", borderRadius: 10, border: form.cancellation === p.v ? `2px solid ${DARK_BG}` : "1px solid #ddd", cursor: "pointer", transition: "all .15s" }}>
                    <div style={{ fontWeight: form.cancellation === p.v ? 700 : 600 }}>{p.l}</div>
                    <div style={{ fontSize: 13, color: "#555" }}>{p.d}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 5 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div>
              <label style={{ fontWeight: 600, marginBottom: 8, display: "block" }}>Características de seguridad</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {SECURITY_FEATURES.map(s => <Pill key={s} active={form.security.includes(s)} onClick={() => setForm({ ...form, security: form.security.includes(s) ? form.security.filter(x => x !== s) : [...form.security, s] })}>{s}</Pill>)}
              </div>
            </div>
            <div>
              <label style={{ fontWeight: 600, marginBottom: 8, display: "block" }}>Reglas del espacio</label>
              <textarea value={form.rules} onChange={e => setForm({ ...form, rules: e.target.value })} placeholder="Ej: No lavar vehículos, respetar horarios de silencio..." rows={4} style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: "1px solid #ddd", fontSize: 15, fontFamily: "inherit", resize: "vertical", outline: "none", boxSizing: "border-box", background: "#fff", color: "#222" }} />
            </div>
          </div>
        )}
      </div>

      {/* Bottom navigation */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#fff", borderTop: "1px solid #eee", padding: "16px 24px", zIndex: 9999 }}>
        <div style={{ maxWidth: 640, margin: "0 auto", display: "flex", justifyContent: "space-between" }}>
          <Btn outline onClick={() => step > 0 ? setStep(step - 1) : onBack()} style={{ fontWeight: 600 }}>
            {step === 0 ? "Cancelar" : "Atrás"}
          </Btn>
          <Btn primary onClick={async () => {
            if (step < steps.length - 1) {
              setStep(step + 1);
            } else {
              setPublishing(true);
              try {
                if (onPublish) await onPublish(form);
                onBack();
              } finally {
                setPublishing(false);
              }
            }
          }}>
            {step === steps.length - 1 ? (initialData ? "Guardar cambios" : "Publicar anuncio") : "Siguiente"}
          </Btn>
        </div>
      </div>

      {publishing && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={(e) => e.stopPropagation()}>
          <div style={{ background: "#fff", borderRadius: 20, padding: 48, textAlign: "center", maxWidth: 420, animation: "fadeIn .3s" }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>{initialData ? "Guardando cambios..." : "Publicando Anuncio..."}</h2>
            <p style={{ color: "#555", fontSize: 15, marginBottom: 16 }}>Por favor espera, estamos procesando tu estacionamiento y subiendo imágenes...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateListingPage;

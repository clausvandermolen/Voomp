import { useRef, useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { DARK_BG } from "../constants";
import { formatCLP } from "../utils/format";

const MapView = ({ listings, onSelect, initialCenter, initialZoom, onViewChange }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markersRef = useRef([]);
  const onSelectRef = useRef(onSelect);
  const onViewChangeRef = useRef(onViewChange);

  // Keep refs up to date without triggering effects
  useEffect(() => { onSelectRef.current = onSelect; }, [onSelect]);
  useEffect(() => { onViewChangeRef.current = onViewChange; }, [onViewChange]);

  useEffect(() => {
    if (map.current) return;
    const center = initialCenter ? [initialCenter[1], initialCenter[0]] : [-33.4372, -70.6483];
    map.current = L.map(mapContainer.current, {
      center,
      zoom: initialZoom ?? 12,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 20,
    }).addTo(map.current);

    map.current.on("moveend", () => {
      if (!map.current) return;
      const c = map.current.getCenter();
      onViewChangeRef.current?.({ center: [c.lng, c.lat], zoom: map.current.getZoom() });
    });

    // Ensure tiles render correctly after container is ready
    setTimeout(() => { map.current?.invalidateSize(); }, 200);

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update markers only when listings change (compare by id list)
  const listingIds = listings.map(l => l.id).join(",");

  useEffect(() => {
    if (!map.current) return;

    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    listings.forEach(l => {
      if (!l.lat || !l.lng) return;

      const priceHtml = `<div style="background:#fff;border-radius:20px;padding:6px 12px;font-weight:700;font-size:13px;box-shadow:0 2px 8px rgba(0,0,0,.18);border:1px solid rgba(0,0,0,.04);white-space:nowrap;cursor:pointer;font-family:'Nunito Sans',sans-serif;transition:all .15s;">${formatCLP(l.price)}</div>`;

      const icon = L.divIcon({
        html: priceHtml,
        className: "",
        iconSize: null,
        iconAnchor: [30, 15],
      });

      const marker = L.marker([l.lat, l.lng], { icon }).addTo(map.current);

      marker.on("click", () => {
        if (map.current) {
          const c = map.current.getCenter();
          onViewChangeRef.current?.({ center: [c.lng, c.lat], zoom: map.current.getZoom() });
        }
        onSelectRef.current?.(l);
      });

      marker.on("mouseover", () => {
        const el = marker.getElement()?.querySelector("div");
        if (el) { el.style.background = DARK_BG; el.style.color = "#fff"; el.style.transform = "scale(1.08)"; }
      });
      marker.on("mouseout", () => {
        const el = marker.getElement()?.querySelector("div");
        if (el) { el.style.background = "#fff"; el.style.color = "#222"; el.style.transform = "scale(1)"; }
      });

      markersRef.current.push(marker);
    });
  }, [listingIds]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 12, overflow: "hidden" }}>
      <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};

export default MapView;

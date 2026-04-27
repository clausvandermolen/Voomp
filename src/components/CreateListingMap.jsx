import { useRef, useEffect } from "react";
import { BRAND_PRIMARY } from "../constants";

// Leaflet is loaded globally from index.html
const L = window.L;

const CreateListingMap = ({ lat, lng, onLocationChange }) => {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const onLocationChangeRef = useRef(onLocationChange);
  // Track last coords set internally to avoid flyTo loops
  const internalCoordsRef = useRef(null);

  useEffect(() => { onLocationChangeRef.current = onLocationChange; }, [onLocationChange]);

  const placeMarker = (map, mLat, mLng) => {
    if (markerRef.current) {
      markerRef.current.setLatLng([mLat, mLng]);
    } else {
      const icon = L.divIcon({
        html: `<div style="width:24px;height:24px;border-radius:50%;background:${BRAND_PRIMARY};border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.3);"></div>`,
        className: "",
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });
      markerRef.current = L.marker([mLat, mLng], { icon }).addTo(map);
    }
  };

  // Initialize map once
  useEffect(() => {
    if (mapRef.current) return;

    const center = lat && lng ? [lat, lng] : [-33.4372, -70.6483];
    const zoom = lat && lng ? 16 : 12;

    mapRef.current = L.map(containerRef.current, { center, zoom });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(mapRef.current);

    if (lat && lng) {
      placeMarker(mapRef.current, lat, lng);
      internalCoordsRef.current = `${lat},${lng}`;
    }

    mapRef.current.on("click", async (e) => {
      const { lat: newLat, lng: newLng } = e.latlng;
      placeMarker(mapRef.current, newLat, newLng);
      internalCoordsRef.current = `${newLat},${newLng}`;
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${newLat}&lon=${newLng}&accept-language=es&addressdetails=1`);
        const data = await res.json();
        if (data && data.address) {
          const a = data.address;
          const address = data.display_name || "";
          const locality = a.city || a.town || a.village || a.suburb || "";
          const region = a.state || "";
          const location = [locality, region].filter(Boolean).join(", ");
          
          let houseNum = a.house_number || a.building || a.amenity || "";
          let road = a.road || a.pedestrian || a.cycleway || a.footway || "";

          // Advanced fallback if house number or road is missing
          if (address && (!houseNum || !road)) {
            const parts = address.split(",").map(p => p.trim());
            // Most Chilean addresses in OSM start with [Number, Road] or [Road, Number]
            if (!houseNum) {
              // Look specifically for a numeric part in the first 3 components
              const found = parts.slice(0, 3).find(p => /^\d+[A-Za-z-]?$/.test(p));
              if (found) houseNum = found;
            }
            if (!road) {
              // Take the first part that is NOT the house number and NOT the Comuna/Region/Country
              const found = parts.slice(0, 3).find(p => p !== houseNum && p !== locality && p !== region && p !== "Chile");
              if (found) road = found;
            }
          }

          onLocationChangeRef.current(newLat, newLng, address, location, {
            road: road,
            houseNumber: houseNum,
            city: locality,
            state: region
          });
        } else {
          onLocationChangeRef.current(newLat, newLng, "", "", null);
        }
      } catch (err) {
        console.error(err);
        onLocationChangeRef.current(newLat, newLng, "", "");
      }
    });

    setTimeout(() => { mapRef.current?.invalidateSize(); }, 200);

    return () => {
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; markerRef.current = null; }
    };
  }, []);

  // Only flyTo when coords change externally (e.g. address search), not from map clicks
  useEffect(() => {
    if (!mapRef.current || !lat || !lng) return;
    const coordKey = `${lat},${lng}`;
    if (internalCoordsRef.current === coordKey) return; // Skip if we set these ourselves
    internalCoordsRef.current = coordKey;
    mapRef.current.flyTo([lat, lng], 16);
    placeMarker(mapRef.current, lat, lng);
  }, [lat, lng]);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
};

export default CreateListingMap;

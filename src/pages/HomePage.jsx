import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import ListingCard from "../components/ListingCard";
import MapView from "../components/MapView";

const HomePage = ({ listings, onSelect, onFav, showMap, mapViewState, onMapViewChange }) => {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" && window.innerWidth < 768
  );
  useEffect(() => {
    const r = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", r);
    return () => window.removeEventListener("resize", r);
  }, []);

  return (
  <div>
    <div style={{ maxWidth: 1760, margin: "0 auto", padding: isMobile ? "0 12px" : "0 24px" }}>
      {showMap ? (
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 16 : 24, height: isMobile ? "auto" : "calc(100vh - 200px)" }}>
          {isMobile ? (
            <>
              <div style={{ height: "50vh" }}>
                <MapView listings={listings} onSelect={onSelect} initialCenter={mapViewState?.center} initialZoom={mapViewState?.zoom} onViewChange={onMapViewChange} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16, padding: "16px 0 24px" }}>
                {listings.map(l => <ListingCard key={l.id} listing={l} onClick={onSelect} onFav={onFav} />)}
              </div>
            </>
          ) : (
            <>
              <div style={{ overflow: "auto", display: "grid", gridTemplateColumns: "1fr", gap: 24, alignContent: "start", paddingRight: 8 }}>
                {listings.map(l => <ListingCard key={l.id} listing={l} onClick={onSelect} onFav={onFav} />)}
              </div>
              <div style={{ position: "sticky", top: 140 }}>
                <MapView listings={listings} onSelect={onSelect} initialCenter={mapViewState?.center} initialZoom={mapViewState?.zoom} onViewChange={onMapViewChange} />
              </div>
            </>
          )}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(280px, 1fr))", gap: isMobile ? 16 : 24, padding: isMobile ? "16px 0 24px" : "20px 0 40px" }}>
          {listings.map(l => <ListingCard key={l.id} listing={l} onClick={onSelect} onFav={onFav} />)}
        </div>
      )}

      {listings.length === 0 && (
        <div style={{ textAlign: "center", padding: "80px 0" }}>
          <MapPin size={48} color="#555" style={{ marginBottom: 16 }} />
          <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>No se encontraron resultados</h3>
          <p style={{ color: "#555" }}>Intenta ajustar los filtros o buscar en otra zona.</p>
        </div>
      )}
    </div>
  </div>
  );
};

export default HomePage;

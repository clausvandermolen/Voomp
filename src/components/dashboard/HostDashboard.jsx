import React, { useState, useCallback } from 'react';
import { SPACING, FONT_SIZE, FONT_WEIGHT, COLORS, RADIUS } from '../../constants/styles';

const HostDashboard = ({ listings, onBlockDate, onPriceUpdate }) => {
  const [activeTab, setActiveTab] = useState(1);
  const [selectedDates, setSelectedDates] = useState([]);
  const [weekendMultiplier, setWeekendMultiplier] = useState(1.0);
  const [weekdayMultiplier, setWeekdayMultiplier] = useState(1.0);

  const handleDateChange = useCallback((dates) => {
    setSelectedDates(Array.isArray(dates) ? dates : [dates]);
  }, []);

  const handleBlockDates = useCallback(() => {
    if (selectedDates.length > 0 && onBlockDate) {
      onBlockDate(selectedDates);
      setSelectedDates([]);
    }
  }, [selectedDates, onBlockDate]);

  const handleWeekendChange = useCallback((e) => {
    const value = parseFloat(e.target.value);
    setWeekendMultiplier(value);
    if (onPriceUpdate) {
      onPriceUpdate({ weekend: value, weekday: weekdayMultiplier });
    }
  }, [weekdayMultiplier, onPriceUpdate]);

  const handleWeekdayChange = useCallback((e) => {
    const value = parseFloat(e.target.value);
    setWeekdayMultiplier(value);
    if (onPriceUpdate) {
      onPriceUpdate({ weekend: weekendMultiplier, weekday: value });
    }
  }, [weekendMultiplier, onPriceUpdate]);

  const basePrice = listings?.[0]?.price || 0;

  return (
    <div style={{ fontFamily: "inherit", maxWidth: 800, margin: "0 auto", padding: SPACING.xl }}>
      {/* Tabs */}
      <div role="tablist" style={{ display: "flex", gap: 0, marginBottom: SPACING.lg, borderBottom: "2px solid #ddd" }}>
        <button
          role="tab"
          aria-selected={activeTab === 1}
          aria-controls="tab-panel-1"
          id="tab-1"
          style={{
            padding: `${SPACING.md}px ${SPACING.lg}px`,
            border: "none",
            background: "none",
            cursor: "pointer",
            fontSize: FONT_SIZE.md,
            color: activeTab === 1 ? "#0ea5e9" : "#666",
            fontWeight: activeTab === 1 ? FONT_WEIGHT.bold : FONT_WEIGHT.normal,
            borderBottom: activeTab === 1 ? "2px solid #0ea5e9" : "transparent",
            marginBottom: "-2px",
            transition: "all 0.2s"
          }}
          onClick={() => setActiveTab(1)}
        >
          Bloquear fechas
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 2}
          aria-controls="tab-panel-2"
          id="tab-2"
          style={{
            padding: `${SPACING.md}px ${SPACING.lg}px`,
            border: "none",
            background: "none",
            cursor: "pointer",
            fontSize: FONT_SIZE.md,
            color: activeTab === 2 ? "#0ea5e9" : "#666",
            fontWeight: activeTab === 2 ? FONT_WEIGHT.bold : FONT_WEIGHT.normal,
            borderBottom: activeTab === 2 ? "2px solid #0ea5e9" : "transparent",
            marginBottom: "-2px",
            transition: "all 0.2s"
          }}
          onClick={() => setActiveTab(2)}
        >
          Precios dinámicos
        </button>
      </div>

      {/* Tab 1: Date Blocking */}
      <div
        role="tabpanel"
        id="tab-panel-1"
        aria-labelledby="tab-1"
        hidden={activeTab !== 1}
        style={{ padding: `${SPACING.lg}px 0` }}
      >
        <h2 style={{ fontSize: FONT_SIZE.lg, fontWeight: FONT_WEIGHT.bold, marginBottom: SPACING.md }}>
          Selecciona fechas para bloquear
        </h2>
        <div style={{
          background: "#f7f7f7",
          padding: SPACING.lg,
          borderRadius: RADIUS.lg,
          marginBottom: SPACING.lg
        }}>
          <input
            type="date"
            multiple
            onChange={(e) => handleDateChange(e.target.value)}
            style={{
              width: "100%",
              padding: SPACING.md,
              borderRadius: RADIUS.md,
              border: "1px solid #ddd",
              fontSize: FONT_SIZE.md,
              marginBottom: SPACING.md
            }}
            aria-label="Selecciona fechas para bloquear"
          />
          <p style={{ fontSize: FONT_SIZE.sm, color: "#666", marginBottom: SPACING.md }}>
            Fechas seleccionadas: {selectedDates.length}
          </p>
          <button
            onClick={handleBlockDates}
            disabled={selectedDates.length === 0}
            style={{
              minHeight: "44px",
              padding: `${SPACING.sm}px ${SPACING.lg}px`,
              background: selectedDates.length > 0 ? "#0ea5e9" : "#ccc",
              color: "white",
              border: "none",
              borderRadius: RADIUS.md,
              cursor: selectedDates.length > 0 ? "pointer" : "not-allowed",
              fontSize: FONT_SIZE.md,
              fontWeight: FONT_WEIGHT.bold,
              width: "100%"
            }}
            aria-label={`Bloquear ${selectedDates.length} fechas seleccionadas`}
          >
            Bloquear fechas ({selectedDates.length})
          </button>
        </div>
      </div>

      {/* Tab 2: Dynamic Pricing */}
      <div
        role="tabpanel"
        id="tab-panel-2"
        aria-labelledby="tab-2"
        hidden={activeTab !== 2}
        style={{ padding: `${SPACING.lg}px 0` }}
      >
        <h2 style={{ fontSize: FONT_SIZE.lg, fontWeight: FONT_WEIGHT.bold, marginBottom: SPACING.md }}>
          Configuración de precios dinámicos
        </h2>

        <div style={{ marginBottom: SPACING.lg }}>
          <label htmlFor="weekend-slider" style={{ display: "block", marginBottom: SPACING.sm, fontWeight: FONT_WEIGHT.bold }}>
            Multiplicador fin de semana: <span style={{ color: "#0ea5e9" }}>{weekendMultiplier.toFixed(1)}x</span>
          </label>
          <input
            id="weekend-slider"
            type="range"
            min="0.8"
            max="1.5"
            step="0.1"
            value={weekendMultiplier}
            onChange={handleWeekendChange}
            style={{ width: "100%", marginBottom: SPACING.md }}
            aria-label="Multiplicador para fin de semana"
          />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: FONT_SIZE.sm, color: "#666" }}>
            <span>0.8x (descuento)</span>
            <span>1.5x (premium)</span>
          </div>
        </div>

        <div style={{ marginBottom: SPACING.lg }}>
          <label htmlFor="weekday-slider" style={{ display: "block", marginBottom: SPACING.sm, fontWeight: FONT_WEIGHT.bold }}>
            Multiplicador entre semana: <span style={{ color: "#0ea5e9" }}>{weekdayMultiplier.toFixed(1)}x</span>
          </label>
          <input
            id="weekday-slider"
            type="range"
            min="0.8"
            max="1.5"
            step="0.1"
            value={weekdayMultiplier}
            onChange={handleWeekdayChange}
            style={{ width: "100%", marginBottom: SPACING.md }}
            aria-label="Multiplicador para entre semana"
          />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: FONT_SIZE.sm, color: "#666" }}>
            <span>0.8x (descuento)</span>
            <span>1.5x (premium)</span>
          </div>
        </div>

        <div style={{
          background: "#dbeafe",
          border: "1px solid #93c5fd",
          borderRadius: RADIUS.lg,
          padding: SPACING.lg
        }}>
          <h3 style={{ fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold, marginBottom: SPACING.md }}>
            Resumen de precios
          </h3>
          <p style={{ marginBottom: SPACING.sm }}>
            Tarifa base: ${basePrice.toLocaleString()} CLP/noche
          </p>
          <p style={{ marginBottom: SPACING.sm }}>
            Fin de semana: {weekendMultiplier.toFixed(1)}x → ${(basePrice * weekendMultiplier).toLocaleString()} CLP
          </p>
          <p>
            Entre semana: {weekdayMultiplier.toFixed(1)}x → ${(basePrice * weekdayMultiplier).toLocaleString()} CLP
          </p>
        </div>
      </div>
    </div>
  );
};

export default HostDashboard;

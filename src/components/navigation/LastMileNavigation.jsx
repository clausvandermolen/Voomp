import React from 'react';
import { SPACING, FONT_SIZE, FONT_WEIGHT, COLORS, RADIUS } from '../../constants/styles';

const LastMileNavigation = ({ latitude, longitude, address }) => {
  const hasCoordinates = latitude != null && longitude != null &&
    !isNaN(Number(latitude)) && !isNaN(Number(longitude));

  const wazeUrl = hasCoordinates
    ? `waze://navigate?to=${latitude},${longitude}`
    : null;

  const googleMapsUrl = hasCoordinates
    ? `https://maps.google.com/?q=${latitude},${longitude}`
    : null;

  const handleOpenWaze = () => {
    if (wazeUrl) {
      window.open(wazeUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleOpenGoogleMaps = () => {
    if (googleMapsUrl) {
      window.open(googleMapsUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const buttonStyle = {
    minWidth: '44px',
    minHeight: '44px',
    padding: `${SPACING.sm}px ${SPACING.md}px`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    border: 'none',
    borderRadius: RADIUS.md,
    cursor: 'pointer',
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    transition: 'all 0.2s',
    WebkitTapHighlightColor: 'transparent',
    touchAction: 'manipulation',
  };

  return (
    <div style={{ display: 'flex', gap: SPACING.md, flexWrap: 'wrap' }}>
      {hasCoordinates ? (
        <>
          <button
            onClick={handleOpenWaze}
            aria-label="Abrir en Waze"
            title="Abrir en Waze para navegación"
            style={{
              ...buttonStyle,
              backgroundColor: '#33CCFF',
              color: '#FFFFFF',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2BB8E6'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#33CCFF'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <circle cx="12" cy="12" r="10" fill="currentColor" />
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="white" />
            </svg>
            <span>Waze</span>
          </button>

          <button
            onClick={handleOpenGoogleMaps}
            aria-label="Abrir en Google Maps"
            title="Abrir en Google Maps para navegación"
            style={{
              ...buttonStyle,
              backgroundColor: '#4285F4',
              color: '#FFFFFF',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3367D6'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4285F4'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor" />
            </svg>
            <span>Google Maps</span>
          </button>
        </>
      ) : (
        <div
          role="alert"
          style={{
            padding: `${SPACING.md}px ${SPACING.lg}px`,
            backgroundColor: '#FFF3CD',
            border: `1px solid #FFEAA7`,
            borderRadius: RADIUS.md,
            color: '#856404',
            fontSize: FONT_SIZE.sm,
            flex: '1 1 100%',
          }}
        >
          {address ? (
            <span>📍 {address} — Coordenadas no disponibles</span>
          ) : (
            <span>Coordenadas no disponibles para navegación</span>
          )}
        </div>
      )}
    </div>
  );
};

export default LastMileNavigation;

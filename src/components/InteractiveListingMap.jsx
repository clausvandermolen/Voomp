import React, { useEffect, useRef, useCallback, useMemo } from 'react';

const InteractiveListingMap = ({
  listings = [],
  onPinClick,
  selectedListingId,
  mapCenter = { lat: -33.4489, lng: -70.6693 }, // Santiago default
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const searchCircleRef = useRef(null);
  const infoWindowRef = useRef(null);

  const getPinColor = useCallback((price) => {
    if (price < 100000) return '#4CAF50'; // green
    if (price <= 200000) return '#FFC107'; // yellow
    return '#F44336'; // red
  }, []);

  const initMap = useCallback(async () => {
    // Check if Google Maps is loaded
    if (!window.google) {
      console.warn('Google Maps not loaded');
      return null;
    }

    const mapOptions = {
      center: mapCenter,
      zoom: 14,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      zoomControl: true,
      zoomControlOptions: {
        position: window.google.maps.ControlPosition.RIGHT_CENTER,
      },
    };

    const map = new window.google.maps.Map(mapRef.current, mapOptions);
    mapInstanceRef.current = map;

    // Create search radius circle
    searchCircleRef.current = new window.google.maps.Circle({
      strokeColor: '#4285F4',
      strokeOpacity: 0.3,
      strokeWeight: 2,
      fillColor: '#4285F4',
      fillOpacity: 0.1,
      map,
      center: mapCenter,
      radius: 1000, // 1km radius
    });

    // Create info window
    infoWindowRef.current = new window.google.maps.InfoWindow();

    return map;
  }, [mapCenter]);

  const addMarkers = useCallback((map) => {
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    listings.forEach((listing) => {
      const pinColor = getPinColor(listing.price);
      const marker = new window.google.maps.Marker({
        position: { lat: listing.lat, lng: listing.lng },
        map,
        title: `Listing ${listing.id} - $${listing.price.toLocaleString()} CLP`,
      });

      // Change icon color
      marker.setIcon({
        path: window.google.maps.SymbolPath.CIRCLE,
        fillColor: pinColor,
        fillOpacity: 1,
        strokeColor: '#FFFFFF',
        strokeWeight: 2,
        scale: 10,
      });

      // Add click handler
      marker.addListener('click', () => {
        if (onPinClick) {
          onPinClick(listing.id);
        }

        // Show info window
        infoWindowRef.current.setContent(`
          <div style="padding: 8px; font-family: Arial, sans-serif; color: #222;">
            <strong>Espacio #${listing.id}</strong><br/>
            Precio: $${listing.price.toLocaleString()} CLP
          </div>
        `);
        infoWindowRef.current.open(map, marker);
      });

      markersRef.current.push(marker);
    });
  }, [listings, getPinColor, onPinClick]);

  const updateSelectedMarker = useCallback(() => {
    markersRef.current.forEach((marker, index) => {
      const listing = listings[index];
      const isSelected = listing.id === selectedListingId;

      if (isSelected && window.google) {
        marker.setAnimation(window.google.maps.Animation.BOUNCE);
        setTimeout(() => {
          marker.setAnimation(null);
        }, 2000);
      }
    });
  }, [selectedListingId, listings]);

  // Initialize map on mount
  useEffect(() => {
    const initialize = async () => {
      const map = await initMap();
      if (map) {
        addMarkers(map);
      }
    };

    initialize();

    return () => {
      // Cleanup
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
      if (searchCircleRef.current) {
        searchCircleRef.current.setMap(null);
      }
      if (infoWindowRef.current) {
        infoWindowRef.current.close();
      }
    };
  }, [initMap, addMarkers]);

  // Update markers when listings change
  useEffect(() => {
    if (mapInstanceRef.current) {
      addMarkers(mapInstanceRef.current);
    }
  }, [listings, addMarkers]);

  // Update selected marker
  useEffect(() => {
    if (markersRef.current.length > 0) {
      updateSelectedMarker();
    }
  }, [selectedListingId, updateSelectedMarker]);

  // Update map center when prop changes
  useEffect(() => {
    if (mapInstanceRef.current && mapCenter) {
      mapInstanceRef.current.panTo(mapCenter);
      if (searchCircleRef.current) {
        searchCircleRef.current.setCenter(mapCenter);
      }
    }
  }, [mapCenter]);

  return (
    <div
      ref={mapRef}
      role="application"
      aria-label="Mapa interactivo de estacionamientos"
      style={{
        width: '100%',
        height: '100%',
        minHeight: '400px',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}
    />
  );
};

export default InteractiveListingMap;

import React from 'react';
import { SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT, COLORS } from '../../constants/styles';
import { formatCLP } from '../../utils/format';

const ListingInfo = ({ listing, loading, error }) => {
  if (loading) {
    return <div style={styles.loading}>Cargando información...</div>;
  }

  if (error) {
    return <div style={styles.error}>Error al cargar la información: {error.message}</div>;
  }

  if (!listing) {
    return <div style={styles.error}>No se encontró la propiedad.</div>;
  }

  const {
    title,
    description,
    pricePerNight,
    maxGuests,
    bedrooms,
    beds,
    bathrooms,
    location,
    amenities,
  } = listing;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>{title}</h1>
      <p style={styles.location}>{location}</p>

      <div style={styles.priceRow}>
        <span style={styles.price}>{formatCLP(pricePerNight)}</span>
        <span style={styles.perNight}> / noche</span>
      </div>

      <div style={styles.details}>
        <span>{maxGuests} huéspedes</span>
        <span>·</span>
        <span>{bedrooms} habitaciones</span>
        <span>·</span>
        <span>{beds} camas</span>
        <span>·</span>
        <span>{bathrooms} baños</span>
      </div>

      <p style={styles.description}>{description}</p>

      {amenities && amenities.length > 0 && (
        <div style={styles.amenities}>
          <h3 style={styles.sectionTitle}>Servicios</h3>
          <ul style={styles.amenitiesList}>
            {amenities.map((amenity, idx) => (
              <li key={idx} style={styles.amenity}>{amenity}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: SPACING.md,
    backgroundColor: '#fff',
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZE['2xl'],
    fontWeight: FONT_WEIGHT.bold,
    color: '#111827',
    margin: '0 0 4px 0',
  },
  location: {
    color: '#4b5563',
    fontSize: FONT_SIZE.sm,
    marginBottom: SPACING.sm,
  },
  priceRow: {
    marginBottom: SPACING.sm,
  },
  price: {
    fontSize: FONT_SIZE['2xl'],
    fontWeight: FONT_WEIGHT.bold,
    color: '#0066cc',
  },
  perNight: {
    fontSize: FONT_SIZE.sm,
    color: '#4b5563',
  },
  details: {
    display: 'flex',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
    color: '#374151',
    fontSize: FONT_SIZE.sm,
  },
  description: {
    fontSize: FONT_SIZE.md,
    lineHeight: 1.6,
    color: '#1f2937',
    marginBottom: SPACING.md,
    whiteSpace: 'pre-line',
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.semibold,
    marginBottom: SPACING.xs,
  },
  amenitiesList: {
    listStyle: 'none',
    padding: 0,
    display: 'flex',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  amenity: {
    backgroundColor: '#f3f4f6',
    padding: '4px 10px',
    borderRadius: RADIUS.full,
    fontSize: FONT_SIZE.xs,
  },
  loading: {
    padding: SPACING.md,
    color: '#9ca3af',
  },
  error: {
    padding: SPACING.md,
    color: '#dc2626',
    backgroundColor: '#fee2e2',
    borderRadius: RADIUS.md,
  },
};

export default ListingInfo;

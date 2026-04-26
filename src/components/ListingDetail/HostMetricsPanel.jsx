import React from 'react';
import { SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT, COLORS } from '../../constants/styles';

const metricIcons = {
  responseRate: '📞',
  responseTime: '⏱️',
  reviewsTotal: '⭐',
  guestsTotal: '👥',
  listingCount: '🏠',
};

const HostMetricsPanel = ({ host, loading, error }) => {
  if (loading) {
    return <div style={styles.loading}>Cargando datos del anfitrión...</div>;
  }

  if (error) {
    return <div style={styles.error}>Error al cargar perfil del anfitrión: {error.message}</div>;
  }

  if (!host) {
    return <div style={styles.error}>No se encontró información del anfitrión.</div>;
  }

  const metrics = [
    { key: 'responseRate', label: 'Tasa de respuesta', value: host.responseRate || '—' },
    { key: 'responseTime', label: 'Tiempo de respuesta', value: host.responseTime || '—' },
    { key: 'reviewsTotal', label: 'Reseñas recibidas', value: host.reviewsTotal || 0 },
    { key: 'guestsTotal', label: 'Huéspedes totales', value: host.guestsTotal || 0 },
    { key: 'listingCount', label: 'Propiedades', value: host.listingCount || 0 },
  ];

  return (
    <div style={styles.container}>
      <h3 style={styles.heading}>
        <span style={styles.hostIcon}>👤</span> Anfitrión: {host.name || 'Anónimo'}
      </h3>
      <div style={styles.metricsGrid}>
        {metrics.map(({ key, label, value }) => (
          <div key={key} style={styles.metricCard}>
            <span style={styles.metricIcon}>{metricIcons[key] || '📊'}</span>
            <div>
              <p style={styles.metricLabel}>{label}</p>
              <p style={styles.metricValue}>{value}</p>
            </div>
          </div>
        ))}
      </div>
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
  heading: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.semibold,
    marginBottom: SPACING.sm,
    display: 'flex',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  hostIcon: {
    fontSize: FONT_SIZE['2xl'],
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
    gap: SPACING.sm,
  },
  metricCard: {
    display: 'flex',
    alignItems: 'center',
    gap: SPACING.xs,
    padding: SPACING.xs,
    backgroundColor: '#f9fafb',
    borderRadius: RADIUS.sm,
  },
  metricIcon: {
    fontSize: FONT_SIZE['2xl'],
  },
  metricLabel: {
    fontSize: FONT_SIZE.xs,
    color: '#6b7280',
    margin: 0,
  },
  metricValue: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    margin: 0,
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

export default HostMetricsPanel;

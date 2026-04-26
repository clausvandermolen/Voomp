import React from 'react';
import { SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT, COLORS } from '../../constants/styles';

const ReviewCard = ({ review }) => (
  <div style={styles.reviewCard}>
    <div style={styles.reviewHeader}>
      <span style={styles.reviewerName}>{review.reviewerName}</span>
      <span style={styles.reviewDate}>
        {new Date(review.createdAt).toLocaleDateString('es-CL', {
          year: 'numeric',
          month: 'long',
        })}
      </span>
    </div>
    <div style={styles.rating}>
      {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
    </div>
    <p style={styles.reviewText}>{review.text}</p>
  </div>
);

const ReviewsSection = ({ reviews, averageRating, totalCount, loading, error }) => {
  if (loading) {
    return <div style={styles.loading}>Cargando reseñas...</div>;
  }

  if (error) {
    return <div style={styles.error}>Error al cargar reseñas: {error.message}</div>;
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div style={styles.container}>
        <h3 style={styles.heading}>Reseñas</h3>
        <p style={styles.empty}>Aún no hay reseñas para esta propiedad.</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h3 style={styles.heading}>
        Reseñas
        {averageRating && (
          <span style={styles.avgRating}>
            {'★'.repeat(Math.round(averageRating))} {averageRating.toFixed(1)}
          </span>
        )}
        <span style={styles.total}>({totalCount || reviews.length})</span>
      </h3>
      <div style={styles.reviewsList}>
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
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
    gap: SPACING.sm,
  },
  avgRating: {
    color: '#f59e0b',
    fontSize: FONT_SIZE.md,
  },
  total: {
    color: '#6b7280',
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.normal,
  },
  reviewsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: SPACING.md,
  },
  reviewCard: {
    borderBottom: '1px solid #e5e7eb',
    paddingBottom: SPACING.sm,
  },
  reviewHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  reviewerName: {
    fontWeight: FONT_WEIGHT.semibold,
    color: '#1f2937',
  },
  reviewDate: {
    fontSize: FONT_SIZE.xs,
    color: '#6b7280',
  },
  rating: {
    color: '#f59e0b',
    fontSize: FONT_SIZE.sm,
    marginBottom: SPACING.xs,
  },
  reviewText: {
    fontSize: FONT_SIZE.sm,
    color: '#374151',
    lineHeight: 1.5,
  },
  empty: {
    color: '#6b7280',
    fontSize: FONT_SIZE.sm,
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

export default ReviewsSection;

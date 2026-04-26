import React from 'react';
import { SPACING, RADIUS, FONT_SIZE, COLORS } from '../../constants/styles';

const PhotoHeader = ({ images, title, onImageClick }) => {
  if (!images || images.length === 0) {
    return (
      <div style={styles.placeholder}>
        <span style={styles.placeholderText}>Sin fotos disponibles</span>
      </div>
    );
  }

  const mainImage = images[0];
  const extraCount = images.length - 1;

  return (
    <div style={styles.container}>
      <img
        src={mainImage}
        alt={title}
        style={styles.mainImage}
        onClick={() => onImageClick?.(0)}
      />
      {extraCount > 0 && (
        <div style={styles.overlay}>
          <span style={styles.overlayText} onClick={() => onImageClick?.(0)}>
            +{extraCount} fotos
          </span>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    position: 'relative',
    width: '100%',
    height: '300px',
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  mainImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    cursor: 'pointer',
  },
  overlay: {
    position: 'absolute',
    bottom: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: 'rgba(0,0,0,0.6)',
    color: '#fff',
    padding: `${SPACING.xs} ${SPACING.sm}`,
    borderRadius: RADIUS.sm,
    cursor: 'pointer',
    fontSize: FONT_SIZE.sm,
  },
  overlayText: {
    fontWeight: 600,
  },
  placeholder: {
    width: '100%',
    height: '300px',
    backgroundColor: '#e5e7eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
  },
  placeholderText: {
    color: '#4b5563',
    fontSize: FONT_SIZE.md,
  },
};

export default PhotoHeader;

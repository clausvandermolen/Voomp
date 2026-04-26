import React from 'react';
import { SPACING, FONT_SIZE, FONT_WEIGHT, COLORS, RADIUS } from '../constants/styles';

const MobileOptimizedButton = ({
  label,
  onClick,
  variant = 'primary',
  icon,
  ariaLabel,
  fullWidth = false,
}) => {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    minHeight: '44px',
    minWidth: '44px',
    padding: `${SPACING.sm}px ${SPACING.md}px`,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    borderRadius: RADIUS.md,
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    width: fullWidth ? '100%' : 'auto',
    fontFamily: 'inherit',
    lineHeight: 1,
    WebkitTapHighlightColor: 'transparent',
    touchAction: 'manipulation',
  };

  const variantStyles = {
    primary: {
      backgroundColor: '#0ea5e9',
      color: '#fff',
      '&:hover': {
        backgroundColor: '#0284c7',
      },
    },
    secondary: {
      backgroundColor: '#e5e7eb',
      color: '#0ea5e9',
      border: `2px solid #0ea5e9`,
    },
    ghost: {
      backgroundColor: 'transparent',
      color: '#0ea5e9',
    },
  };

  const currentVariant = variantStyles[variant] || variantStyles.primary;

  const combinedStyles = { ...baseStyles, ...currentVariant };

  return (
    <button
      style={combinedStyles}
      onClick={onClick}
      aria-label={ariaLabel || label}
      role="button"
      tabIndex={0}
    >
      {icon && <span aria-hidden="true">{icon}</span>}
      {label && <span>{label}</span>}
    </button>
  );
};

export default MobileOptimizedButton;

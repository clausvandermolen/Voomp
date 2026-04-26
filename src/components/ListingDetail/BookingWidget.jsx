import React, { useState, useCallback } from 'react';
import { SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT, COLORS } from '../../constants/styles';
import useBusyIntervals from '../../hooks/useBusyIntervals';
import { formatCLP } from '../../utils/format';

const BookingWidget = ({
  listing,
  busyIntervals: rawBusyIntervals,
  onBook,
  loading,
  error,
  user,
}) => {
  const { busyIntervals, isBusyOnDate } = useBusyIntervals(rawBusyIntervals);

  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [localError, setLocalError] = useState('');

  const handleCheckInChange = (e) => {
    setCheckIn(e.target.value);
    setLocalError('');
  };

  const handleCheckOutChange = (e) => {
    setCheckOut(e.target.value);
    setLocalError('');
  };

  const handleGuestsChange = (e) => {
    setGuests(Number(e.target.value));
  };

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (!checkIn || !checkOut) {
        setLocalError('Por favor selecciona fechas de entrada y salida.');
        return;
      }
      if (new Date(checkIn) >= new Date(checkOut)) {
        setLocalError('La fecha de salida debe ser posterior a la de entrada.');
        return;
      }
      
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      let current = new Date(start);
      while (current < end) {
        if (isBusyOnDate(current.toISOString().split('T')[0])) {
          setLocalError('El rango seleccionado incluye fechas bloqueadas. Por favor elige otras fechas.');
          return;
        }
        current.setDate(current.getDate() + 1);
      }

      onBook({ checkIn, checkOut, guests });
    },
    [checkIn, checkOut, guests, isBusyOnDate, onBook]
  );

  if (loading) {
    return <div style={styles.loading}>Cargando widget de reservas...</div>;
  }

  if (error) {
    return <div style={styles.error}>Error al cargar disponibilidad: {error.message}</div>;
  }

  const nights = checkIn && checkOut
    ? Math.max(0, Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)))
    : 0;
  const total = nights * (listing?.pricePerNight || 0);

  return (
    <div style={styles.container}>
      <h3 style={styles.heading}>Reserva tu estadía</h3>
      <p style={styles.priceLabel}>
        {formatCLP(listing?.pricePerNight)} / noche
      </p>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.dateGroup}>
          <label style={styles.label}>
            Entrada
            <input
              type="date"
              value={checkIn}
              onChange={handleCheckInChange}
              min={new Date().toISOString().split('T')[0]}
              style={styles.dateInput}
            />
          </label>
          <label style={styles.label}>
            Salida
            <input
              type="date"
              value={checkOut}
              onChange={handleCheckOutChange}
              min={checkIn || new Date().toISOString().split('T')[0]}
              style={styles.dateInput}
            />
          </label>
        </div>
        <label style={styles.label}>
          Huéspedes
          <input
            type="number"
            value={guests}
            onChange={handleGuestsChange}
            min={1}
            max={listing?.maxGuests || 10}
            style={styles.input}
          />
        </label>

        {localError && <p style={styles.errorMsg}>{localError}</p>}

        {nights > 0 && (
          <div style={styles.totalBox}>
            <span>{nights} noches</span>
            <span>{formatCLP(total)}</span>
          </div>
        )}

        <button type="submit" style={styles.bookButton} disabled={!user}>
          {user ? 'Reservar ahora' : 'Inicia sesión para reservar'}
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    padding: SPACING.md,
    backgroundColor: '#fff',
    borderRadius: RADIUS.md,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    marginBottom: SPACING.md,
  },
  heading: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.semibold,
    marginBottom: SPACING.sm,
  },
  priceLabel: {
    color: '#0066cc',
    fontWeight: FONT_WEIGHT.bold,
    marginBottom: SPACING.sm,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: SPACING.sm,
  },
  dateGroup: {
    display: 'flex',
    gap: SPACING.sm,
  },
  label: {
    display: 'flex',
    flexDirection: 'column',
    fontSize: FONT_SIZE.sm,
    color: '#374151',
    flex: 1,
  },
  dateInput: {
    padding: SPACING.xs,
    border: '1px solid #d1d5db',
    borderRadius: RADIUS.sm,
    marginTop: 4,
    fontSize: FONT_SIZE.sm,
  },
  input: {
    padding: SPACING.xs,
    border: '1px solid #d1d5db',
    borderRadius: RADIUS.sm,
    marginTop: 4,
    fontSize: FONT_SIZE.sm,
    width: '100%',
  },
  errorMsg: {
    color: '#dc2626',
    fontSize: FONT_SIZE.xs,
    margin: 0,
  },
  totalBox: {
    display: 'flex',
    justifyContent: 'space-between',
    fontWeight: FONT_WEIGHT.semibold,
    borderTop: '1px solid #e5e7eb',
    paddingTop: SPACING.xs,
  },
  bookButton: {
    padding: SPACING.sm,
    backgroundColor: '#0066cc',
    color: '#fff',
    border: 'none',
    borderRadius: RADIUS.sm,
    fontWeight: FONT_WEIGHT.semibold,
    cursor: 'pointer',
    transition: 'background-color 0.2s',
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

export default BookingWidget;

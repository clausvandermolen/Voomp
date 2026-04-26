import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PhotoHeader from '../components/ListingDetail/PhotoHeader';
import ListingInfo from '../components/ListingDetail/ListingInfo';
import BookingWidget from '../components/ListingDetail/BookingWidget';
import HostMetricsPanel from '../components/ListingDetail/HostMetricsPanel';
import ReviewsSection from '../components/ListingDetail/ReviewsSection';
import { SPACING, RADIUS, FONT_SIZE, COLORS } from '../constants/styles';
import { supabase } from '../lib/supabase';
import { useNotifications } from '../contexts/NotificationsContext';
import { useListings } from '../contexts/ListingsContext';
import BookingConfirmation from '../components/BookingConfirmation';

const ListingDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotifications();
  const { bookings, user } = useListings();

  const [listing, setListing] = useState(null);
  const [host, setHost] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBookingConfirm, setShowBookingConfirm] = useState(false);
  const [selectedDates, setSelectedDates] = useState(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!id) {
      setError(new Error('ID de propiedad no válido'));
      setLoading(false);
      return;
    }

    const fetchListingDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch listing
        const { data: listingData, error: listingError } = await supabase
          .from('listings')
          .select('*')
          .eq('id', id)
          .single();

        if (listingError) throw listingError;

        if (isMountedRef.current) {
          setListing(listingData);
        }

        // Fetch host info
        if (listingData?.hostId) {
          const { data: hostData, error: hostError } = await supabase
            .from('users')
            .select('*')
            .eq('id', listingData.hostId)
            .single();

          if (!hostError && isMountedRef.current) {
            setHost(hostData);
          }
        }

        // Fetch reviews
        const { data: reviewsData, error: reviewsError } = await supabase
          .from('reviews')
          .select('*')
          .eq('listingId', id)
          .order('createdAt', { ascending: false });

        if (!reviewsError && isMountedRef.current) {
          setReviews(reviewsData || []);
        }
      } catch (err) {
        if (isMountedRef.current) {
          setError(err);
          showNotification('Error al cargar la propiedad', 'error');
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    };

    fetchListingDetails();
  }, [id, showNotification]);

  const handleImageClick = (index) => {
    // Navigate to photo gallery modal or fullscreen view
    // Implementation depends on your PhotoGallery component
  };

  const handleBooking = (bookingData) => {
    if (!user) {
      showNotification('Por favor inicia sesión para reservar', 'error');
      return;
    }

    setSelectedDates(bookingData);
    setShowBookingConfirm(true);
  };

  if (loading) {
    return (
      <div style={styles.pageContainer}>
        <div style={styles.loadingMessage}>Cargando detalles de la propiedad...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.pageContainer}>
        <div style={styles.errorMessage}>
          Error al cargar la propiedad: {error.message}
        </div>
        <button style={styles.backButton} onClick={() => navigate('/')}>
          Volver
        </button>
      </div>
    );
  }

  if (!listing) {
    return (
      <div style={styles.pageContainer}>
        <div style={styles.errorMessage}>No se encontró la propiedad solicitada.</div>
        <button style={styles.backButton} onClick={() => navigate('/')}>
          Volver
        </button>
      </div>
    );
  }

  return (
    <div style={styles.pageContainer}>
      <PhotoHeader
        images={listing.images}
        title={listing.title}
        onImageClick={handleImageClick}
      />

      <div style={styles.mainLayout}>
        <div style={styles.leftColumn}>
          <ListingInfo listing={listing} loading={false} error={null} />
          <HostMetricsPanel host={host} loading={false} error={null} />
          <ReviewsSection
            reviews={reviews}
            averageRating={listing.averageRating}
            totalCount={reviews.length}
            loading={false}
            error={null}
          />
        </div>

        <div style={styles.rightColumn}>
          <BookingWidget
            listing={listing}
            busyIntervals={bookings || []}
            onBook={handleBooking}
            loading={false}
            error={null}
            user={user}
          />
        </div>
      </div>

      {showBookingConfirm && selectedDates && (
        <BookingConfirmation
          listing={listing}
          bookingData={selectedDates}
          onClose={() => {
            setShowBookingConfirm(false);
            setSelectedDates(null);
          }}
          onConfirm={() => {
            showNotification('Reserva confirmada', 'success');
            setShowBookingConfirm(false);
          }}
        />
      )}
    </div>
  );
};

const styles = {
  pageContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: SPACING.md,
    backgroundColor: '#f3f4f6',
    minHeight: '100vh',
  },
  mainLayout: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  leftColumn: {
    flex: '2',
    minWidth: '300px',
  },
  rightColumn: {
    flex: '1',
    minWidth: '280px',
    position: 'sticky',
    top: SPACING.md,
    alignSelf: 'flex-start',
  },
  loadingMessage: {
    textAlign: 'center',
    color: '#6b7280',
    padding: SPACING.xl,
    fontSize: FONT_SIZE.md,
  },
  errorMessage: {
    color: '#dc2626',
    backgroundColor: '#fee2e2',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
    fontSize: FONT_SIZE.md,
  },
  backButton: {
    padding: `${SPACING.sm} ${SPACING.md}`,
    backgroundColor: '#0066cc',
    color: '#fff',
    border: 'none',
    borderRadius: RADIUS.sm,
    cursor: 'pointer',
    fontSize: FONT_SIZE.sm,
  },
};

export default ListingDetailPage;

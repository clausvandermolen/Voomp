import React, { Component } from 'react';
import { SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT, COLORS } from '../constants/styles';

const containerStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: SPACING.lg,
  backgroundColor: '#fff3e0',
  border: '1px solid #ffb74d',
  borderRadius: RADIUS.md,
  boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
  color: '#bf360c',
  maxWidth: 480,
  margin: 'auto',
  marginTop: SPACING.lg,
};

const titleStyle = {
  fontSize: FONT_SIZE.lg,
  fontWeight: FONT_WEIGHT.bold,
  marginBottom: SPACING.md,
};

const messageStyle = {
  fontSize: FONT_SIZE.sm,
  marginBottom: SPACING.md,
  textAlign: 'center',
  lineHeight: 1.5,
};

const buttonStyle = {
  padding: `${SPACING.sm} ${SPACING.md}`,
  fontSize: FONT_SIZE.sm,
  backgroundColor: '#ff6b00',
  color: '#fff',
  border: 'none',
  borderRadius: RADIUS.sm,
  cursor: 'pointer',
  fontWeight: FONT_WEIGHT.semibold,
  transition: 'opacity 0.2s',
};

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Se capturó un error:', error);
    console.error('[ErrorBoundary] Información del componente:', errorInfo.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleReset);
      }

      return (
        <div role="alert" style={containerStyle}>
          <h2 style={titleStyle}>¡Algo salió mal!</h2>
          <p style={messageStyle}>
            {this.state.error.message || 'Ocurrió un error inesperado.'}
          </p>
          <button onClick={this.handleReset} style={buttonStyle}>
            Reintentar
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

import React from "react";
import { AlertCircle } from "lucide-react";
import Btn from "./Btn";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          height: "100vh", 
          display: "flex", 
          flexDirection: "column", 
          alignItems: "center", 
          justifyContent: "center", 
          padding: 24, 
          textAlign: "center",
          fontFamily: "'Nunito Sans', sans-serif" 
        }}>
          <div style={{ 
            width: 64, 
            height: 64, 
            borderRadius: "50%", 
            background: "#fee2e2", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            marginBottom: 20 
          }}>
            <AlertCircle size={32} color="#b91c1c" />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12, color: "#111" }}>Oops, algo salió mal</h1>
          <p style={{ color: "#555", fontSize: 16, marginBottom: 24, maxWidth: 400 }}>
            Hubo un error inesperado al cargar esta sección. Por favor, intenta recargar la página.
          </p>
          <Btn primary onClick={() => window.location.reload()}>
            Recargar página
          </Btn>
          {process.env.NODE_ENV === "development" && (
            <pre style={{ 
              marginTop: 32, 
              padding: 16, 
              background: "#f7f7f7", 
              borderRadius: 8, 
              fontSize: 12, 
              textAlign: "left", 
              maxWidth: "100%", 
              overflowX: "auto",
              color: "#b91c1c"
            }}>
              {this.state.error?.toString()}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

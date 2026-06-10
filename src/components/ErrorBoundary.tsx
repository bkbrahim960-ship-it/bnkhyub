import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background p-8 text-center">
          <div className="p-4 rounded-full bg-destructive/10 mb-6">
            <AlertTriangle className="w-12 h-12 text-destructive" />
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground mb-3">
            Une erreur est survenue
          </h1>
          <p className="text-muted-foreground max-w-md mb-8">
            Quelque chose s'est mal passé. Veuillez rafraîchir la page ou réessayer.
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-accent text-accent-foreground font-bold hover:opacity-90 transition-opacity"
            >
              <RefreshCw className="w-4 h-4" />
              Rafraîchir
            </button>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.href = "/";
              }}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-surface-card border border-border text-foreground font-bold hover:bg-white/5 transition-colors"
            >
              <Home className="w-4 h-4" />
              Accueil
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

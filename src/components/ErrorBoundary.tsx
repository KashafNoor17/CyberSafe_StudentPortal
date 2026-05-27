import { Component, ErrorInfo, ReactNode } from "react";
import * as Sentry from "@sentry/react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { T } from "@/components/T";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  eventId: string | null;
}

/**
 * Global error boundary to catch render errors gracefully.
 * Captures exceptions to Sentry and provides a recovery mechanism.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, eventId: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, eventId: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const eventId = Sentry.captureException(error, {
      contexts: { react: { componentStack: errorInfo.componentStack } },
    });
    this.setState({ eventId });

    if (import.meta.env.DEV) {
      console.error("[ErrorBoundary]", error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, eventId: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="text-center max-w-md space-y-4">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
            <h2 className="text-xl font-semibold text-foreground"><T>Something went wrong</T></h2>
            <p className="text-muted-foreground text-sm">
              <T>An unexpected error occurred. Try refreshing or going back.</T>
            </p>
            {this.state.eventId && (
              <p className="text-xs text-muted-foreground font-mono">
                Error ID: {this.state.eventId}
              </p>
            )}
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => window.location.href = "/"}><T>Go Home</T></Button>
              <Button onClick={this.handleReset}><T>Try Again</T></Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
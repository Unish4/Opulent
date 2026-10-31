import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  failed: boolean;
}

export default class AppErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error(error, info.componentStack);
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center">
          <h1 className="font-display text-2xl font-bold">
            Something went wrong
          </h1>
          <p className="text-secondary">
            Please reload the page. If it keeps happening, message us on
            WhatsApp.
          </p>
          <button
            type="button"
            onClick={() => window.location.assign("/")}
            className="mt-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            Back to home
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

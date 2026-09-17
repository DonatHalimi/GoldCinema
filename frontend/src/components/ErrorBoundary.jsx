import { Component } from 'react';
import { logClientError } from '../utils/clientLogger';

export default class ErrorBoundary extends Component {
    state = { hasError: false };

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, info) {
        logClientError(error, { type: 'react_render', componentStack: info.componentStack });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex min-h-screen items-center justify-center bg-marquee-bg px-6 text-center">
                    <div>
                        <h1 className="font-display text-3xl text-marquee-goldBright">Something went wrong</h1>
                        <p className="mt-2 text-sm text-marquee-muted">
                            Please refresh the page. If this keeps happening, contact support.
                        </p>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}
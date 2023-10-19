import {Component} from 'react'

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    override state: ErrorBoundaryState = {hasError: false}

    static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
        return {hasError: true, error}
    }

    override componentDidCatch(error: unknown, errorInfo: unknown) {
        this.props.onError?.(error, errorInfo)
    }

    override render() {
        const {children, fallback} = this.props

        if (this.state.hasError) {
            return fallback?.(this.state.error)
        }

        return children
    }
}

// Types ///////////////////////////////////////////////////////////////////////

export interface ErrorBoundaryProps {
    fallback?: undefined | ((error: unknown) => React.ReactNode)
    children: undefined | React.ReactNode
    onError?: undefined | ErrorBoundaryHandler
}

export interface ErrorBoundaryState {
    error?: undefined | unknown
    hasError: boolean
}

export interface ErrorBoundaryHandler {
    (error: unknown, errorInfo: unknown): void
}

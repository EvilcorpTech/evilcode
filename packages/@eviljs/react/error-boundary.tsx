import {Component} from 'react'
import {Box, type BoxProps} from './box.js'
import {classes} from './classes.js'

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    override state: ErrorBoundaryState = {hasError: false}

    static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
        return {hasError: true, error}
    }

    override componentDidCatch(error: unknown, errorInfo: unknown) {
        this.props.onError?.(error, errorInfo)
    }

    override render() {
        const {children, className, fallback, onError, ...otherProps} = this.props

        if (! this.state.hasError) {
            return children
        }

        return (
            <Box
                {...otherProps}
                className={classes('ErrorBoundary-9d1f', className)}
                children={fallback?.(this.state.error)}
            />
        )
    }
}

// Types ///////////////////////////////////////////////////////////////////////

export interface ErrorBoundaryProps extends Omit<BoxProps, 'onError'> {
    fallback?: undefined | ((error: unknown) => React.ReactNode)
    onError?: undefined | ErrorBoundaryHandler
}

export interface ErrorBoundaryState {
    error?: undefined | unknown
    hasError: boolean
}

export interface ErrorBoundaryHandler {
    (error: unknown, errorInfo: unknown): void
}

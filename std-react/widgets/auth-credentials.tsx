import {Button} from './button.js'
import {classes} from '../react.js'
import {DotsSpinner as Spinner} from './spinner.js'
import {Input} from './input.js'
import {useAuth} from '../auth.js'
import React from 'react'
const {useCallback, useMemo, useState} = React

export function useAuthCredentials() {
    const [credentials, setCredentials] = useState({identifier: '', secret: ''})
    const {authenticate, pending} = useAuth()
    const [error, setError] = useState('')

    const onIdentifierChange = useCallback((identifier: string) => {
        setError('')
        setCredentials(state => ({...state, identifier}))
    }, [])

    const onSecretChange = useCallback((secret: string) => {
        setError('')
        setCredentials(state => ({...state, secret}))
    }, [])

    const validCredentials = useMemo(() =>
        Object
            .values(credentials)
            .map(it => Boolean(it.trim()))
            .every(Boolean)
    , [credentials])

    const onFormSubmitPrevented = useCallback((event: FormEvent) => {
        event.preventDefault()
    }, [])

    const onFormSubmit = useCallback(async () => {
        try {
            await authenticate(credentials)
        }
        catch (error) {
            setError(error)
        }
    }, [credentials])

    return {
        credentials,
        error,
        onFormSubmit,
        onFormSubmitPrevented,
        onIdentifierChange,
        onSecretChange,
        pending,
        validCredentials,
    }
}

export function AuthCredentials(props: AuthCredentialsProps) {
    const {messages, formatError} = props
    const {
        credentials,
        error,
        onFormSubmit,
        onFormSubmitPrevented,
        onIdentifierChange,
        onSecretChange,
        pending,
        validCredentials,
    } = useAuthCredentials()

    return (
        <form
            className={classes('form-a67156', props.className)}
            onSubmit={onFormSubmitPrevented}
        >
            <Input
                className="input-f84958"
                type="text"
                label={messages?.identifier ?? 'Identifier'}
                value={credentials.identifier}
                autoFocus={true}
                autoComplete="user username email"
                tabIndex={0}
                onChange={onIdentifierChange}
            />
            <Input
                className="input-f84958"
                type="password"
                label={messages?.secret ?? 'Password'}
                autoComplete="password"
                tabIndex={0}
                value={credentials.secret}
                onChange={onSecretChange}
            />

            <Button
                className={classes('button-fcb265',
                    {busy: pending, 'std-shadow z8': validCredentials},
                )}
                type="primary"
                action="submit"
                disabled={pending || ! validCredentials}
                onClick={onFormSubmit}
            >
                <span className="message-d94663">
                    {messages?.signin ?? 'Signin'}
                </span>

                <Spinner className="spinner-a1165c" active={pending}/>
            </Button>

            <div className="error-a13171">
                {error && (formatError?.(error) ?? error)}
            </div>
        </form>
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export interface AuthCredentialsProps {
    className?: string
    messages?: {
        identifier?: string
        secret?: string
        signin?: string
    }
    formatError?(error: string): string
}

type FormEvent = React.FormEvent<HTMLFormElement>

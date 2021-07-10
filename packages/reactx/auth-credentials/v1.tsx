import {useAuth} from '@eviljs/react/auth.js'
import {classes} from '@eviljs/react/react.js'
import {useCallback, useMemo, useState} from 'react'
import {Button} from '../button/v1.js'
import {Spinner} from '../spinner/v1.js'
import {Input} from '../input/v1.js'

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
    const {className, messages, formatError} = props
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
            className={classes('AuthCredentials-a671', className)}
            onSubmit={onFormSubmitPrevented}
        >
            <Input
                className="input-f849"
                type="text"
                label={messages?.identifier ?? 'Identifier'}
                value={credentials.identifier}
                autoFocus={true}
                autoComplete="user username email"
                tabIndex={0}
                onChange={onIdentifierChange}
            />
            <Input
                className="input-f849"
                type="password"
                label={messages?.secret ?? 'Password'}
                autoComplete="password"
                tabIndex={0}
                value={credentials.secret}
                onChange={onSecretChange}
            />

            <Button
                className={classes('button-fcb2 dye', {
                    busy: pending,
                    'std-shadow z8': validCredentials,
                })}
                type="submit"
                disabled={pending || ! validCredentials}
                onClick={onFormSubmit}
            >
                <span className="message-d946">
                    {messages?.signin ?? 'Signin'}
                </span>

                <Spinner className="spinner-a116" active={pending}/>
            </Button>

            <div className="error-a131">
                {error && (formatError?.(error) ?? error)}
            </div>
        </form>
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export interface AuthCredentialsProps extends React.FormHTMLAttributes<HTMLFormElement> {
    messages?: {
        identifier?: string
        secret?: string
        signin?: string
    }
    formatError?(error: string): string
}

type FormEvent = React.FormEvent<HTMLFormElement>

import {isDefined} from '@eviljs/std/type.js'
import {useCallback, useContext, useRef, useState} from 'react'
import {defineContext} from './ctx.js'

export {asBaseUrl, joinPath} from '@eviljs/web/url.js'

export const RequestContext = defineContext('RequestContext')

/*
* EXAMPLE
*
* const adapter = createQuery(createFetch({baseUrl: '/api'}))
* const Main = WithRequest(MyMain, adapter)
*
* render(<Main/>, document.body)
*/
export function WithRequest<P extends {}>(Child: React.ComponentType<P>, context: unknown) {
    function RequestProviderProxy(props: P) {
        return withRequest(<Child {...props}/>, context)
    }

    return RequestProviderProxy
}

/*
* EXAMPLE
*
* const adapter = createRequest(createFetch({baseUrl: '/api'}))
*
* export function MyMain(props) {
*     return withRequest(<Children/>, adapter)
* }
*/
export function withRequest(children: React.ReactNode, context: unknown) {
    return (
        <RequestContext.Provider value={context}>
            {children}
        </RequestContext.Provider>
    )
}

/*
* EXAMPLE
*
* const adapter = createRequest(createFetch({baseUrl: '/api'}))
*
* export function MyMain(props) {
*     return (
*         <RequestProvider value={adapter}>
*             <MyApp/>
*         </RequestProvider>
*     )
* }
*/
export function RequestProvider(props: RequestProviderProps) {
    return withRequest(props.children, props.value)
}

export function useRequest<C, A extends Array<unknown>, R>(runner: RequestRunner<C, A, R>): RequestManager<A, R> {
    interface UseRequestState {
        pending: boolean
        response: undefined | R
        error: undefined | unknown
    }
    const [state, setState] = useState<UseRequestState>({
        pending: false,
        response: undefined,
        error: undefined,
    })
    const taskRef = useRef<null | RequestTask<R>>(null)
    const context = useContext<C>(RequestContext as React.Context<C>)

    const send = useCallback(async (...args: A) => {
        if (taskRef.current) {
            // We automatically cancel previous task.
            taskRef.current.cancelled = true
        }

        // We must retain current response and error states.
        // Whether the developer wants to clear them, he uses the reset() API
        // before issuing a send() request.
        setState(state => ({
            ...state,
            pending: true,
        }))

        taskRef.current = {
            promise: runner(context, ...args),
            cancelled: false,
        }

        const task = taskRef.current

        try {
            const response = await task.promise

            if (task.cancelled) {
                return
            }

            setState(state => ({
                ...state,
                pending: false, // We settle.
                response, // With a response.
                error: undefined, // Without any error.
            }))

            return response
        }
        catch (error) {
            if (task.cancelled) {
                return
            }

            setState(state => ({
                ...state,
                pending: false, // We settle.
                response: undefined, // Without a response.
                error, // With an error.
            }))

            return // Makes TypeScript happy.
        }
    }, [runner])

    const cancel = useCallback(() => {
        if (taskRef.current) {
            taskRef.current.cancelled = true
        }

        setState(state => ({...state, pending: false}))
    }, [])

    const resetResponse = useCallback(() => {
        setState(state => ({...state, response: undefined}))
    }, [])

    const resetError = useCallback(() => {
        setState(state => ({...state, error: undefined}))
    }, [])

    const reset = useCallback(() => {
        setState(state => ({
            ...state,
            response: undefined,
            error: undefined,
        }))
    }, [])

    return {
        send,
        pending: state.pending,
        response: state.response,
        error: state.error,
        reset,
        resetError,
        resetResponse,
        cancel,
    }
}

export function useRequestsStatus(requests: Record<string, {pending: boolean, error: unknown}>) {
    const pending = Object.values(requests).some(it => it.pending)
    const errors = Object.values(requests).map(it => it.error).filter(isDefined)
    const error = errors[0]
    const hasError = isDefined(error)

    return {error, errors, hasError, pending}
}

// Types ///////////////////////////////////////////////////////////////////////

export interface RequestProviderProps {
    children: React.ReactNode
    value: unknown
}

export interface RequestRunner<C, A extends Array<unknown>, R> {
    (context: C, ...args: A): Promise<R>
}

export interface RequestTask<T> {
    promise: Promise<T>
    cancelled: boolean
}

export interface RequestManager<A extends Array<unknown>, R> {
    pending: boolean
    response: undefined | R
    error: unknown
    send: (...args: A) => Promise<undefined | R>
    reset: () => void
    resetError: () => void
    resetResponse: () => void
    cancel: () => void
}

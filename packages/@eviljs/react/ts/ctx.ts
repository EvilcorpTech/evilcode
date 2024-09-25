import {createContext} from 'react'

export function defineContext<T>(name: string, initialValue?: undefined): React.Context<undefined | T>
export function defineContext<T>(name: string, initialValue: T): React.Context<T>
export function defineContext<T>(name: string, initialValue?: undefined | T): React.Context<undefined | T> {
    const context = createContext(initialValue)
    context.displayName = name // Used by DevTools to give a name to the Context, in both dev and pro mode.
    return context
}

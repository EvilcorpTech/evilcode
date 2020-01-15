import { AuthProvider } from './auth'
import { Container, ContainerFactories } from '@eviljs/std-lib/container'
import { ContainerProvider } from './container'
import { Cookie } from '@eviljs/std-web/cookie'
import { createElement } from 'react'
import { Fetch } from '@eviljs/std-web/fetch'
import { FetchProvider } from './fetch'
import { I18n } from '@eviljs/std-lib/i18n'
import { I18nProvider } from './i18n'
import { Logger } from '@eviljs/std-lib/logger'
import { LoggerProvider } from './logger'
import { Query } from '@eviljs/std-web/query'
import { QueryProvider } from './query'
import { render } from 'react-dom'
import { RouterProvider } from './router'
import { StoreProvider, StoreSpec } from './store'

export function createApp<F extends ContainerFactories>(spec: AppSpec<F>) {
    const container = spec.createContainer?.()

    const deps = {
        container,
        cookie: spec.createCookie?.(container),
        fetch: spec.createFetch?.(container),
        i18n: spec.createI18n?.(container),
        logger: spec.createLogger?.(container),
        query: spec.createQuery?.(container),
        storeSpec: spec.createStoreSpec?.(container),
    }

    type El = JSX.Element
    const App = [
        [spec.useAuth, (it: El) => plugAuth(it, deps.fetch, deps.cookie)] as const,
        [spec.useContainer, (it: El) => plugContainer(it, deps.container)] as const,
        [spec.useFetch, (it: El) => plugFetch(it, deps.fetch)] as const,
        [spec.useI18n, (it: El) => plugI18n(it, deps.i18n)] as const,
        [spec.useLogger, (it: El) => plugLogger(it, deps.logger)] as const,
        [spec.useQuery, (it: El) => plugQuery(it, deps.query)] as const,
        [spec.useRouter, (it: El) => plugRouter(it)] as const,
        [spec.useStore, (it: El) => plugStore(it, deps.storeSpec)] as const,
    ]
    .filter(it => it[0])
    .map(it => it[1])
    .reduce((app, plug) => plug(app), <spec.app/>)

    render(App, spec.mountPoint ?? document.body)
}

export function plugAuth(child: JSX.Element, fetch: Fetch | undefined, cookie: Cookie | undefined) {
    if (fetch && cookie) {
        return (
            <AuthProvider container={{Fetch: fetch, Cookie: cookie}}>
                {child}
            </AuthProvider>
        )
    }
    warnForMissingPlugDep('plugAuth(child, ~~fetch~~, ~~cookie~~)', 'Auth', 'fetch or cookie')
    return child
}

export function plugContainer(child: JSX.Element, container: Container | undefined) {
    if (container) {
        return (
            <ContainerProvider container={container}>
                {child}
            </ContainerProvider>
        )
    }
    warnForMissingPlugDep('plugContainer(child, ~~container~~)', 'Container', 'container')
    return child
}

export function plugFetch(child: JSX.Element, fetch: Fetch | undefined) {
    if (fetch) {
        return (
            <FetchProvider fetch={fetch}>
                {child}
            </FetchProvider>
        )
    }
    warnForMissingPlugDep('plugFetch(child, ~~fetch~~)', 'Fetch', 'container')
    return child
}

export function plugI18n(child: JSX.Element, i18n: I18n | undefined) {
    if (i18n) {
        return (
            <I18nProvider i18n={i18n}>
                {child}
            </I18nProvider>
        )
    }
    warnForMissingPlugDep('plugI18n(child, ~~i18n~~)', 'I18n', 'i18n')
    return child
}

export function plugLogger(child: JSX.Element, logger: Logger | undefined) {
    if (logger) {
        return (
            <LoggerProvider logger={logger}>
                {child}
            </LoggerProvider>
        )
    }
    warnForMissingPlugDep('plugLogger(child, ~~logger~~)', 'Logger', 'logger')
    return child
}

export function plugQuery(child: JSX.Element, query: Query | undefined) {
    if (query) {
        return (
            <QueryProvider query={query}>
                {child}
            </QueryProvider>
        )
    }
    warnForMissingPlugDep('plugQuery(child, ~~query~~)', 'Query', 'query')
    return child
}

export function plugRouter(child: JSX.Element) {
    if (true) {
        return (
            <RouterProvider>
                {child}
            </RouterProvider>
        )
    }
    warnForMissingPlugDep('plugRouter(child, ~~router~~)', 'Router', 'router')
    return child
}

export function plugStore(child: JSX.Element, storeSpec: StoreSpec | undefined) {
    if (storeSpec) {
        return (
            <StoreProvider spec={storeSpec}>
                {child}
            </StoreProvider>
        )
    }
    warnForMissingPlugDep('plugStore(child, ~~storeSpec~~)', 'Store', 'storeSpec')
    return child
}

export function warnForMissingPlugDep(plug: string, context: string, missingDep: string) {
    console.warn(
        `@eviljs/std-react/app.${plug}:\n`
        + `${context} Context has been requested but ${missingDep} has not been provided.`
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export interface AppSpec<F extends ContainerFactories> {
    app: Component
    createContainer?: () => Container<F>
    createCookie?: (container?: Container<F>) => Cookie
    createFetch?: (container?: Container<F>) => Fetch
    createI18n?: (container?: Container<F>) => I18n
    createLogger?: (container?: Container<F>) => Logger
    createQuery?: (container?: Container<F>) => Query
    createStoreSpec?: (container?: Container<F>) => StoreSpec
    mountPoint?: HTMLElement | null
    useAuth?: boolean
    useContainer?: boolean
    useCookie?: boolean
    useFetch?: boolean
    useI18n?: boolean
    useLogger?: boolean
    useQuery?: boolean
    useRouter?: boolean
    useStore?: boolean
}

export type Component = React.ComponentType
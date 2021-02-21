import {encodeParams, defaultEncodeParamValue} from '@eviljs/std-lib/query.js'
import {isString} from '@eviljs/std-lib/type.js'
import {asBaseUrl} from './fetch.js'

export function createRouter<S>(observer: RouterObserver, options?: RouterOptions): Router<S> {
    const type = options?.type ?? 'hash'

    switch (type) {
        case 'hash':
            return createHashRouter(observer, options)
        case 'path':
            return createPathRouter(observer, options)
        case 'memory':
            return createMemoryRouter(observer, options)
        break
    }
}

export function createHashRouter<S>(observer: RouterObserver, options?: RouterOptions): Router<S> {
    const self = {
        start() {
            window.addEventListener('hashchange', onRouteChange)
        },
        stop() {
            window.removeEventListener('hashchange', onRouteChange)
        },
        get route() {
            const {hash} = window.location
            const [dirtyPath, dirtyParams] = hash
                .substring(1) // Without the initial '#'.
                .split('?')
            const path = dirtyPath || '/' // The empty string is casted to the root path.
            const params = deserializeRouteParamsFromString(dirtyParams)
            const {state} = history

            return {path, params, state}
        },
        routeTo(path: string, params?: RouterParams, state?: S) {
            const serializedRoute = self.link(path, params)

            // Algorithm 1:
            history.pushState(state, '', serializedRoute)
            // Algorithm 2 (legacy):
            // self.stop()
            // window.location.hash = serializedRoute
            // self.start()
        },
        replaceRoute(path: string, params?: RouterParams, state?: S) {
            const serializedRoute = self.link(path, params)

            history.replaceState(state, '', serializedRoute)
        },
        link(path: string, params?: RouterParams) {
            return '#' + serializeRouteToString(path, params)
        },
    }

    function onRouteChange() {
        const {path, params, state} = self.route

        observer(path, params, state)
    }

    return self
}

export function createPathRouter<S>(observer: RouterObserver, options?: RouterOptions): Router<S> {
    const basePath = asBaseUrl(options?.basePath)

    const self = {
        start() {
            window.addEventListener('popstate', onRouteChange)
        },
        stop() {
            window.removeEventListener('popstate', onRouteChange)
        },
        get route() {
            const {pathname, search} = window.location
            const path = pathname.replace(basePath, '')
            const params = deserializeRouteParamsFromString(
                search.substring(1) // Without the initial '?'.
            )
            const {state} = history

            return {path, params, state}
        },
        routeTo(path: string, params?: RouterParams, state?: S) {
            const serializedRoute = self.link(path, params)

            history.pushState(state, '', serializedRoute)
        },
        replaceRoute(path: string, params?: RouterParams, state?: S) {
            const serializedRoute = self.link(path, params)

            history.replaceState(state, '', serializedRoute)
        },
        link(path: string, params?: RouterParams) {
            return serializeRouteToString(basePath + path, params)
        },
    }

    function onRouteChange() {
        const {path, params, state} = self.route

        observer(path, params, state)
    }

    return self
}

export function createMemoryRouter<S>(observer: RouterObserver, options?: RouterOptions): Router<S> {
    let routePath = options?.initMemory ?? '/'
    let routeSearch = ''
    let routeState: S | null | undefined = null

    const self = {
        start() {},
        stop() {},
        get route() {
            const path = routePath
            const params = deserializeRouteParamsFromString(routeSearch)
            const state = routeState

            return {path, params, state}
        },
        routeTo(path: string, params?: RouterParams, state?: S) {
            routePath = path
            routeSearch = encodeParams(params)
            routeState = state
        },
        replaceRoute(path: string, params?: RouterParams, state?: S) {
            self.routeTo(path, params, state)
        },
        link(path: string, params?: RouterParams) {
            return serializeRouteToString(path, params)
        },
    }

    return self
}

export function serializeRouteToString(path: string, params?: RouterParams) {
    const encodedParams = encodeParams(params, {encodeValue: defaultRouteEncodeParamValue})
    const serializedParams = encodedParams
        ? '?' + encodedParams
        : ''
    const serializedRoute = path + serializedParams

    return serializedRoute
}

export function deserializeRouteParamsFromString(paramsString: string | undefined) {
    const params: Record<string, string | null> = {}

    if (! paramsString) {
        return params
    }

    const parts = paramsString.split('&')

    for (const part of parts) {
        const [encodedKey, encodedValue] = part.split('=')
        // We need to decode because the
        // The key can be any string and the value can be an Array or an Object
        // serialized as JSON and encoded as URI component.
        // We need to decode them, and the developer will take care of parsing
        // the JSON of the value in that case.
        const key = decodeURIComponent(encodedKey!)
        const value = encodedValue
            ? decodeURIComponent(encodedValue)
            // An undefined value is casted to null to indicate its presence but without a value.
            : null

        params[key] = value
    }

    return params
}

export function defaultRouteEncodeParamValue(value: unknown) {
    if (isString(value)) {
        // We don't encode params values of type string, so the Browser url bar shows
        // `#?redirect=/some/path`
        // instead of
        // `#?redirect=%2Fsome%2Fpath`.
        return value
    }
    return defaultEncodeParamValue(value)
}

// Types ///////////////////////////////////////////////////////////////////////

export interface Router<S = any> {
    route: {path: string, params: RouterRouteParams, state: S | null | undefined}
    start(): void
    stop(): void
    routeTo(path: string, params?: RouterParams, state?: S): void
    replaceRoute(path: string, params?: RouterParams, state?: S): void
    link(path: string, params?: RouterParams): string
}

export interface RouterObserver<S = any> {
    (route: string, params: RouterRouteParams, state: S): void
}

export interface RouterOptions {
    type?: 'hash' | 'path' | 'memory'
    basePath?: string
    initMemory?: string
}

export type RouterParams =
    | string
    | RouterParamsDict
    | Array<string | RouterParamsDict>

export interface RouterParamsDict extends Record<string | number, undefined | null | boolean | number | string> {
}

export interface RouterRouteParams extends Record<string | number, null | string> {
}

import {isString, type Nil} from '@eviljs/std/type.js'
import {encodeQueryParamValue, encodeQueryParams} from './query.js'
import {asBaseUrl} from './url.js'

export function createHashRouter<S>(observer: RouterObserver, options?: undefined | RouterOptions): Router<S> {
    const self: Router<S> = {
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
        routeTo(path: string, params?: undefined | RouterParams, state?: undefined | S) {
            const serializedRoute = self.link(path, params)

            // Algorithm 1:
            history.pushState(state, '', serializedRoute)
            // Algorithm 2 (legacy):
            // self.stop()
            // window.location.hash = serializedRoute
            // self.start()
        },
        replaceRoute(path: string, params?: undefined | RouterParams, state?: undefined | S) {
            const serializedRoute = self.link(path, params)

            history.replaceState(state, '', serializedRoute)
        },
        link(path: string, params?: undefined | RouterParams) {
            return '#' + serializeRouteToString(path, params)
        },
    }

    function onRouteChange() {
        const {path, params, state} = self.route

        observer(path, params, state)
    }

    return self
}

export function createPathRouter<S>(observer: RouterObserver, options?: undefined | RouterOptions): Router<S> {
    const basePath = asBaseUrl(options?.basePath)

    const self: Router<S> = {
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
        routeTo(path: string, params?: undefined | RouterParams, state?: undefined | S) {
            const serializedRoute = self.link(path, params)

            history.pushState(state, '', serializedRoute)
        },
        replaceRoute(path: string, params?: undefined | RouterParams, state?: undefined | S) {
            const serializedRoute = self.link(path, params)

            history.replaceState(state, '', serializedRoute)
        },
        link(path: string, params?: undefined | RouterParams) {
            return serializeRouteToString(basePath + path, params)
        },
    }

    function onRouteChange() {
        const {path, params, state} = self.route

        observer(path, params, state)
    }

    return self
}

export function createMemoryRouter<S>(observer: RouterObserver, options?: undefined | RouterMemoryOptions): Router<S> {
    let routePath = options?.initMemory ?? '/'
    let routeSearch = ''
    let routeState: undefined | S = undefined

    const self: Router<S> = {
        start() {},
        stop() {},
        get route() {
            const path = routePath
            const params = deserializeRouteParamsFromString(routeSearch)
            const state = routeState

            return {path, params, state}
        },
        routeTo(path: string, params?: undefined | RouterParams, state?: undefined | S) {
            routePath = path
            routeSearch = encodeQueryParams(params)
            routeState = state
        },
        replaceRoute(path: string, params?: undefined | RouterParams, state?: undefined | S) {
            self.routeTo(path, params, state)
        },
        link(path: string, params?: undefined | RouterParams) {
            return serializeRouteToString(path, params)
        },
    }

    return self
}

export function serializeRouteToString(path: string, params?: undefined | RouterParams) {
    const encodedParams = encodeQueryParams(params, {encodeValue: defaultRouteEncodeParamValue})
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
    return encodeQueryParamValue(value)
}

// Types ///////////////////////////////////////////////////////////////////////

export interface Router<S = any> {
    route: {
        path: string,
        params: RouterRouteParams,
        state: undefined | S,
    }
    start(): void
    stop(): void
    routeTo(path: string, params?: undefined | RouterParams, state?: undefined | S): void
    replaceRoute(path: string, params?: undefined | RouterParams, state?: undefined | S): void
    link(path: string, params?: undefined | RouterParams): string
}

export interface RouterObserver<S = any> {
    (route: string, params: RouterRouteParams, state: S): void
}

export interface RouterOptions {
    basePath?: undefined | string
}

export interface RouterMemoryOptions extends RouterOptions {
    initMemory?: undefined | string
}

export type RouterRouteParams = Record<string | number, null | string>

export type RouterParams =
    | string
    | RouterParamsDict
    | Array<string | RouterParamsDict>

export interface RouterParamsDict extends
    Record<string | number,
        | Nil
        | boolean
        | number
        | string
    >
{}

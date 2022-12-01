import {isString} from '@eviljs/std/type.js'
import type {QueryParams, QueryParamsDict, QueryParamsList} from './query.js'
import {encodeQueryParamKey, encodeQueryParams, encodeQueryParamValue} from './query.js'
import {asBaseUrl} from './url.js'

const RouterRouteParamsEmpty: RouterRouteParams = {}

export function createPathRouter<S = unknown>(observer: RouterObserver, options?: undefined | RouterOptions): Router<S> {
    const basePath = asBaseUrl(options?.basePath)

    function onRouteChange() {
        self.route = decodePathRoute(basePath)

        observer(self.route)
    }

    const self: Router<S> = {
        route: decodePathRoute(basePath),

        start() {
            self.route = decodePathRoute(basePath)

            window.addEventListener('popstate', onRouteChange)
        },
        stop() {
            window.removeEventListener('popstate', onRouteChange)
        },
        changeRoute(routeChange) {
            self.route = mergeRouteChange(self.route, routeChange)

            const routeString = self.createLink(
                routeChange.path ?? self.route.path,
                routeChange.params,
            )

            // The History mutation does not trigger the PopState event.
            if (routeChange.replace) {
                history.replaceState(routeChange.state, '', routeString)
            }
            else {
                history.pushState(routeChange.state, '', routeString)
            }
        },
        createLink(path: string, params?: undefined | RouterRouteChangeParams) {
            return encodeRoute(basePath + path, params)
        },
    }

    return self
}

export function createHashRouter<S = unknown>(observer: RouterObserver, options?: undefined | RouterOptions): Router<S> {
    function onRouteChange() {
        self.route = decodeHashRoute()

        observer(self.route)
    }

    const self: Router<S> = {
        route: decodeHashRoute(),

        start() {
            self.route = decodeHashRoute()

            window.addEventListener('hashchange', onRouteChange)
        },
        stop() {
            window.removeEventListener('hashchange', onRouteChange)
        },
        changeRoute(routeChange) {
            self.route = mergeRouteChange(self.route, routeChange)

            const routeString = self.createLink(
                routeChange.path ?? self.route.path,
                routeChange.params,
            )

            // The History mutation does not trigger the HashChange event.
            if (routeChange.replace) {
                history.replaceState(routeChange.state, '', routeString)
            }
            else {
                // Algorithm 1:
                // BEGIN
                history.pushState(routeChange.state, '', routeString)
                // END

                // // Algorithm 2 (legacy):
                // // BEGIN
                // self.stop()
                // window.location.hash = routeString
                // self.start()
                // // END
            }
        },
        createLink(path: string, params?: undefined | RouterRouteChangeParams) {
            return '#' + encodeRoute(path, params)
        },
    }

    return self
}

export function createMemoryRouter<S = unknown>(observer: RouterObserver, options?: undefined | RouterMemoryOptions<S>): Router<S> {
    const self: Router<S> = {
        route: {
            path: options?.initialPath ?? '/',
            params: options?.initialParams ?? RouterRouteParamsEmpty,
            state: options?.initialState ?? undefined,
        },
        start() {},
        stop() {},
        changeRoute(routeChange) {
            self.route = mergeRouteChange(self.route, routeChange)
        },
        createLink(path: string, params?: undefined | RouterRouteChangeParams) {
            return encodeRoute(path, params)
        },
    }

    return self
}

export function mergeRouteChange<S>(route: RouterRoute<S>, routeChange: RouterRouteChange<S>): RouterRoute<S> {
    return {
        path: routeChange.path ?? route.path,
        params: flattenRouteParams(routeChange.params) ?? RouterRouteParamsEmpty,
        state: routeChange.state,
        // Params and State, if not provided, must be initialized.
    }
}

export function decodePathRoute<S>(basePath: string): RouterRoute<S> {
    const {pathname, search} = window.location
    const path = pathname.replace(basePath, '')
    const params = decodeRouteParams(
        search.substring(1) // Without the initial '?'.
    )
    const {state} = history

    return {path, params, state}
}

export function decodeHashRoute<S>(): RouterRoute<S> {
    const {hash} = window.location
    const [pathOptional, paramsString] = hash
        .substring(1) // Without the initial '#'.
        .split('?')
    const path = pathOptional || '/' // The empty string is casted to the root path.
    const params = decodeRouteParams(paramsString)
    const {state} = history

    return {path, params, state}
}

export function decodeRouteParams(paramsString: string | undefined): RouterRouteParams {
    if (! paramsString) {
        return RouterRouteParamsEmpty
    }

    const params: RouterRouteParams = {}
    const parts = paramsString.split('&')

    for (const part of parts) {
        const [keyEncoded, valueEncoded] = part.split('=')
        // We need to decode because:
        // - the key can be ANY string
        // - the value can be ANY string (even an Array/Object serialized as string).
        const key = keyEncoded ? decodeURIComponent(keyEncoded) : keyEncoded
        const value = valueEncoded ? decodeURIComponent(valueEncoded) : valueEncoded

        params[key!] = value ?? ''
    }

    return params
}

/**
* @throws InvalidArgument
**/
export function encodeRoute(path: string, params?: undefined | RouterRouteChangeParams): string {
    const paramsString = encodeQueryParams(params, {
        encodeKey: encodeRouteParamKey,
        encodeValue: encodeRouteParamValue,
    })
    const separator = paramsString ? '?' : ''
    const routeString = path + separator + paramsString

    return routeString
}

/**
* @throws InvalidArgument
**/
export function encodeRouteParamKey(key: unknown): string {
    if (isString(key)) {
        // We don't encode route params keys of type string.
        // Encoding is an opt-in feature of the developer.
        // In this way the Browser url bar shows
        // `?book:id`
        // instead of
        // `?book%3Aid`.
        return key
    }
    return encodeQueryParamKey(key)
}

/**
* @throws InvalidArgument
**/
export function encodeRouteParamValue(value: unknown): string {
    if (isString(value)) {
        // We don't encode route params values of type string.
        // Encoding is an opt-in feature of the developer.
        // In this way the Browser url bar shows
        // `?redirect=/some/path`
        // instead of
        // `?redirect=%2Fsome%2Fpath`.
        return value
    }
    return encodeQueryParamValue(value)
}

/**
* @throws InvalidArgument
**/
export function flattenRouteParams(routeParams: RouterRouteChangeParams): RouterRouteParams
export function flattenRouteParams(routeParams: undefined | RouterRouteChangeParams): undefined | RouterRouteParams
export function flattenRouteParams(routeParams: undefined | RouterRouteChangeParams): undefined | RouterRouteParams {
    return routeParams
        ? decodeRouteParams(encodeQueryParams(routeParams))
        : undefined
}

// Types ///////////////////////////////////////////////////////////////////////

export interface Router<S = unknown> {
    route: RouterRoute<S>
    start(): void
    stop(): void
    /**
    * @throws InvalidArgument
    **/
    changeRoute(change: RouterRouteChange<S>): void
    /**
    * @throws InvalidArgument
    **/
    createLink(path: string, params?: undefined | RouterRouteChangeParams): string
}

export interface RouterRoute<S = unknown> {
    readonly path: string
    readonly params: RouterRouteParams
    readonly state: undefined | S
}

export interface RouterObserver<S = unknown> {
    (route: RouterRoute<S>): void
}

export interface RouterOptions {
    basePath?: undefined | string
}

export interface RouterMemoryOptions<S = unknown> extends RouterOptions {
    initialPath?: undefined | string
    initialParams?: undefined | RouterRouteParams
    initialState?: undefined | S
}

export type RouterRouteParams = Record<string | number, string>

export interface RouterRouteChange<S = unknown> {
    path?: undefined | string
    params?: undefined | RouterRouteChangeParams
    state?: undefined | undefined | S
    replace?: undefined | boolean
}

export type RouterRouteChangeParams = QueryParams
export type RouterRouteChangeParamsDict = QueryParamsDict
export type RouterRouteChangeParamsList = QueryParamsList

// export type RouterRouteChangeParams =
//     | string
//     | RouterRouteChangeParamsDict
//     | RouterRouteChangeParamsList
//
// export type RouterRouteChangeParamsDict = Record<string | number,
//     | Nil
//     | boolean
//     | number
//     | string
// >
// export type RouterRouteChangeParamsList = Array<string | RouterRouteChangeParamsDict>

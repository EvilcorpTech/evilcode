import { isRegExp } from '@eviljs/std-lib/type'

export const RegexpCache: Record<string, RegExp> = {}

export const EXACT = '$'
export const WHOLE = '(.*)'
export const SUB = '(/.*)?'

// An opening round bracket,
// not followed by an opening or closing round bracket,
// followed by a closing round bracket.
export const CapturingGroupRegexp = /\([^()]+\)/
export const RepeatingSlashRegexp = /\/\/+/g
export const TrailingSlashRegexp = /\/$/

export function createRouter(routeHandler: RouteHandler) {
    const self: Router = {
        start() {
            window.addEventListener('hashchange', onHashChange)
        },
        stop() {
            window.removeEventListener('hashchange', onHashChange)
        },
    }

    function onHashChange() {
        const route = readHashRoute()

        routeHandler(route)
    }

    return self
}

export function readHashRoute() {
    return window.location.hash.substring(1)
}

export function routeTo(path: string) {
    window.location.hash = path
}

export function link(path: string) {
    return '#' + path
}

export function patternFromPath(path: string | RegExp) {
    if (isRegExp(path)) {
        return path
    }

    if (! RegexpCache[path]) {
        const normalizedPattern = normalizePath(path)
        RegexpCache[path] = new RegExp(`^${normalizedPattern}(?:/|$)`, 'i')
    }

    return RegexpCache[path]
}

/*
* Creates a function implementing the Route Protocol.
* Route Protocol is defined as:
* - a function,
* - accepting a variable number of arguments,
* - returning a string,
* - exposing a 'pattern' property of type String
*   valid for the RegExp() constructor.
*
* EXAMPLE
* const moviesRoute = route('/movies')
* const bookRoute = route('/book/(\\w+)')
*
* moviesRoute() # '/movies'
* moviesRoute.pattern # '/movies'
*
* bookRoute(123) # '/book/123'
* bookRoute.pattern # '/book/(\\w+)'
*/
export function defineRoute
    <T extends Array<unknown>>
    (pattern: string, resolver?: (...args: T) => string)
    : RouteProtocol<T>
{
    function defaultResolver(...args: Array<any>) {
            let path = pattern

            for (const arg of args) {
                    path = path.replace(CapturingGroupRegexp, arg)
            }

            return path
    }

    function routeResolver(...args: T) {
        const route = resolver
            ? resolver(...args)
            : defaultResolver(...args)

        return route
    }
    routeResolver.pattern = pattern

    return routeResolver
}

export function normalizePath(pattern: string) {
    return pattern
            .replace(RepeatingSlashRegexp, '/')
            .replace(TrailingSlashRegexp, '')
}

// Types ///////////////////////////////////////////////////////////////////////

export interface Router {
    start(): void
    stop(): void
}

export interface RouteHandler {
    (route: string): void
}

export interface RouteProtocol<T extends Array<unknown>> {
    (...args: T): string
    pattern: string
}

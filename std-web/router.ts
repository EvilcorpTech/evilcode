export const RegexpCache: Record<string, RegExp> = {}

export const EXACT = '$'
export const WHOLE = '(.*)'

// An opening round bracket,
// followed by anything not being a closing round bracket,
// followed by a closing round bracket.
export const CapturingGroupRegexp = /\([^)]+\)/
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

export function isPathRouted(path: string, route: string) {
    if (! RegexpCache[path]) {
        RegexpCache[path] = new RegExp(`^${path}(/|$)`, 'i')
    }

    const re = RegexpCache[path]

    return re.test(route)
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
export function defineRoute(pattern: string) {
    const normalizedPattern = normalizePattern(pattern)

    function routeResolver(...args: Array<any>) {
            let path = normalizedPattern

            for (const arg of args) {
                    path = path.replace(CapturingGroupRegexp, arg)
            }

            return path
    }

    routeResolver.pattern = normalizedPattern

    return routeResolver
}

export function normalizePattern(pattern: string) {
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

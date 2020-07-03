import {isRegExp} from '@eviljs/std-lib/type'

export const START = '^'
export const END = '(?:/)?$'
export const VALUE = '(\\w+)'
export const PART = '(?:/(\\w+))'
export const PART_OPT = PART + '?'
export const ALL = '(.*)'
export const SUB = '(/.*)?'

// An opening round bracket,
// not followed by an opening or closing round bracket,
// followed by a closing round bracket.
export const CapturingGroupRegexp = /\([^()]+\)/
export const EmptiesRegexp = /[\n ]/g
export const RepeatingSlashRegexp = /\/\/+/g
export const TrailingSlashRegexp = /\/$/

export const RegExpCache: RegExpCache = {}

export function createRouter(observer: RouterObserver, options?: RouterOptions): Router {
    const type = options?.type ?? 'hash'

    switch (type) {
        case 'hash':
            return createHashRouter(observer)
        case 'history':
        case 'memory':
            throw new Error('NotImplementedYet')
        break
    }
}

export function createHashRouter(observer: RouterObserver) {
    const self = {
        start() {
            window.addEventListener('hashchange', onHashChange)
        },
        stop() {
            window.removeEventListener('hashchange', onHashChange)
        },
        route() {
            return window.location.hash.substring(1)
        },
        routeTo(path: string) {
            window.location.hash = path
        },
        link(path: string) {
            return '#' + path
        },
    }

    function onHashChange() {
        const route = self.route()

        observer(route)
    }

    return self
}

/*
* Creates a Route. Used for type checking.
*/
export function createRoute<E extends Args, D>(spec: RouteSpec<E, D>): Route<E, D> {
    const {pattern, path, params} = spec

    return {pattern, path, params}
}

/*
* Creates a Route from RegExp capturing groups.
*
* EXAMPLE
* const bookRoute = createSimpleRoute('/book/(\\w+)/(\\w+)')
* bookRoute.path(123, 'Harry-Potter') === '/book/123/Harry-Potter'
* bookRoute.params('/book/123/Harry-Potter') === ['123', 'Harry-Potter']
*/
export function createSimpleRoute(originalPattern: string): Route<Array<string | number>, Array<string>> {
    const patternString = cleanPattern(originalPattern)
    const patternExact = exact(patternString)
    const patternRegexp = regexpFromPattern(patternExact)

    function path(...args: Array<string | number>) {
        return computeRoutePath(patternString, ...args)
    }

    function params(path: string) {
        return computeRouteParams(patternRegexp, path)
    }

    const pattern = patternRegexp

    return {pattern, path, params}
}

/*
* Encodes the route parameters inside the pattern.
*
* EXAMPLE
* computeRoutePath('/book/(\\w+)/(\\w+)', 'abc', 123) === '/book/abc/123'
*/
export function computeRoutePath(patternStr: string, ...args: Array<string | number>) {
    let path = patternStr

    for (const arg of args) {
        path = path.replace(CapturingGroupRegexp, String(arg))
    }

    return path
}

/*
* Decodes the route parameters from a path.
*
* EXAMPLE
* computeRouteParams(new RegExp('/book/(\\w+)/(\\w+)'), '/book/abc/123') === ['abc', '123']
*/
function computeRouteParams(patternRe: RegExp, path: string) {
    const matches = path.match(patternRe)?.slice(1) // Without the whole matching group (first element).

    return matches ?? []
}

export function compilePattern(pattern: string) {
    return regexpFromPattern(cleanPattern(pattern))
}

export function cleanPattern(pattern: string) {
    return pattern
        .replace(EmptiesRegexp, '')
        .replace(RepeatingSlashRegexp, '/')
        .replace(TrailingSlashRegexp, '')
}

export function regexpFromPattern(pattern: string | RegExp) {
    if (isRegExp(pattern)) {
        return pattern
    }

    if (! RegExpCache[pattern]) {
        RegExpCache[pattern] = new RegExp(pattern, 'i')
    }

    return RegExpCache[pattern]
}

export function exact(pattern: string) {
    return `${START}${pattern}${END}`
}

// Types ///////////////////////////////////////////////////////////////////////

export interface Router {
    start(): void
    stop(): void
    route(): string
    routeTo(path: string): void
    link(path: string): string
}

export interface RouterObserver {
    (route: string): void
}

export interface RouterOptions {
    type?: 'hash' | 'history' | 'memory'
}

export interface RouteSpec<E extends Args, D> {
    pattern: RegExp
    path(...args: E): string
    params(path: string): D
}

export interface Route<E extends Args, D> {
    pattern: RegExp
    path(...args: E): string
    params(path: string): D
}

export interface RegExpCache {
    [key: string]: RegExp
}

type Args = Array<unknown>

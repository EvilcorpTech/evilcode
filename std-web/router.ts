import { isRegExp } from '@eviljs/std-lib/type'

export const EXACT = '$'
export const WHOLE = '(.*)'
export const SUB = '(/.*)?'

// An opening round bracket,
// not followed by an opening or closing round bracket,
// followed by a closing round bracket.
export const CapturingGroupRegexp = /\([^()]+\)/
export const EmptiesRegexp = /[\n ]/g
export const RepeatingSlashRegexp = /\/\/+/g
export const TrailingSlashRegexp = /\/$/

export const RegExpCache: RegExpCache = {}

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
type DefaultE = Array<string>
type DefaultD = RegExpMatchArray | null | undefined
export function defineRoute<E extends Args, D>(path: string, options?: {encode?: never, decode?: never, normalize?: boolean}): RouteProtocol<DefaultE, DefaultD>;
export function defineRoute<E extends Args, D>(path: string, options?: {encode: RouteProtocolEncoder<E>, decode?: never, normalize?: boolean}): RouteProtocol<E, DefaultD>;
export function defineRoute<E extends Args, D>(path: string, options?: {encode?: never, decode?: RouteProtocolDecoder<D>, normalize?: boolean}): RouteProtocol<DefaultE, D>;
export function defineRoute<E extends Args, D>(path: string, options?: {encode?: RouteProtocolEncoder<E>, decode?: RouteProtocolDecoder<D>, normalize?: boolean}): RouteProtocol<E, D>;
export function defineRoute<E extends Args, D>(path: string, options?: RouteOptions<E, D>) {
    const pattern = options?.normalize ?? true
        ? normalizePattern(path)
        : path
    const patternRe = regexpFromPattern(pattern)

    const decode = options?.decode
    const encode = options?.encode

    const parser = decode
        ? (path: string) =>
            decode(path)
        : (path: string) =>
            defaultDecoder(patternRe, path)

    const encoder = encode
        ? ((...args: E) =>
            encode(...args)
        ) as (
            | Partial<RouteProtocol<E, DefaultD>>
            | Partial<RouteProtocol<E, D>>
        )
        : ((...args: DefaultE) =>
            defaultEncoder(pattern, ...args)
        ) as (
            | Partial<RouteProtocol<DefaultE, DefaultD>>
            | Partial<RouteProtocol<DefaultE, D>>
        )

    encoder.pattern = pattern
    encoder.patternRe = patternRe
    encoder.parse = parser

    return encoder
}

/*
* Encodes the route parameters inside the pattern.
*
* EXAMPLE
* defaultEncoder('/book/(\\w+)/(\\w+)', 'abc', 123) === '/book/abc/123'
*/
export function defaultEncoder(pattern: string, ...args: Array<string>) {
    let path = pattern

    for (const arg of args) {
        path = path.replace(CapturingGroupRegexp, arg)
    }

    return path
}

/*
* Decodes the route parameters from a path.
*
* EXAMPLE
* defaultDecoder('/book/(\\w+)/(\\w+)', '/book/abc/123') === ['abc', '123']
*/
function defaultDecoder(patternRe: RegExp, path: string) {
    const matches = path.match(patternRe)?.slice(1) // Without the whole matching group (first element).

    return matches
}

export function compilePattern(pattern: string) {
    return regexpFromPattern(normalizePattern(pattern))
}

export function normalizePattern(pattern: string) {
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
        RegExpCache[pattern] = new RegExp(`^${pattern}(?:/|$)`, 'i')
    }

    return RegExpCache[pattern]
}

// Types ///////////////////////////////////////////////////////////////////////

export interface Router {
    start(): void
    stop(): void
}

export interface RouteHandler {
    (route: string): void
}

export interface RouteOptions<E extends Args, D> {
    encode?: RouteProtocolEncoder<E>
    decode?: RouteProtocolDecoder<D>
    normalize?: boolean
}

export interface RouteProtocol<A extends Args, D> {
    (...args: A): string
    pattern: string
    patternRe: RegExp
    parse: RouteProtocolDecoder<D>
}

export interface RouteProtocolEncoder<E extends Args> {
    (...args: E): string
}

export interface RouteProtocolDecoder<D> {
    (path: string): D
}

export interface RegExpCache {
    [key: string]: RegExp
}

type Args = Array<unknown>

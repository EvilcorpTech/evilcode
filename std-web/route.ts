import {isRegExp} from '@eviljs/std-lib/type.js'

export const Start = '^'
export const End = '(?:/)?$'
export const All = '(.*)'
export const Arg = '([^/]+)'
export const Value = '([0-9a-zA-Z]+)'
export const Path = `/${Arg}`
export const PathOpt = `(?:${Path})?`
export const PathGlob = '(/.*)?' + End

export const EmptyRegexp = /^$/
export const EmptiesRegexp = /[\n ]/g
export const RepeatingSlashRegexp = /\/\/+/g
export const TrailingSlashRegexp = /\/$/
export const CapturingGroupRegexp = /\([^()]+\)/    // An opening round bracket,
                                                    // not followed by an opening or closing round bracket,
                                                    // followed by a closing round bracket.

export const RegExpCache: RegExpCache = {}

/*
* Creates a Route. Used mostly for type checking.
*
* EXAMPLE
* const route = createRoute(
*     /^\/book/\/i,
*     (id: string) => `/book/${id}`,
*     (path: string) => path.split('/').slice(2),
* )
*/
export function createRoute<E extends Args, D>(
    patternStr: string | RegExp,
    path: (...args: E) => string,
    params: (path: string) => D,
): Route<E, D>
{
    const pattern = compilePattern(patternStr)

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

export function compilePattern(pattern: string | RegExp) {
    if (isRegExp(pattern)) {
        return pattern
    }

    return regexpFromPattern(cleanPattern(pattern))
}

export function cleanPattern(pattern: string) {
    return pattern
        .replace(EmptiesRegexp, '')
        .replace(RepeatingSlashRegexp, '/')
        .replace(TrailingSlashRegexp, '')
        .replace(EmptyRegexp, '/')
}

export function regexpFromPattern(pattern: string | RegExp) {
    if (isRegExp(pattern)) {
        return pattern
    }

    if (! RegExpCache[pattern]) {
        RegExpCache[pattern] = new RegExp(pattern, 'i')
    }

    return RegExpCache[pattern]!
}

export function exact(pattern: string) {
    return `${Start}${pattern}${End}`
}

// Types ///////////////////////////////////////////////////////////////////////

export interface Route<E extends Args, D> {
    pattern: RegExp
    path(...args: E): string
    params(path: string): D
}

export interface RegExpCache {
    [key: string]: RegExp
}

type Args = Array<unknown>

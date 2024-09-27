import {compileRoutePattern, cleanRoutePattern, buildRouteRegexp, exact} from './route.js'

// An opening round bracket, not followed by an opening or closing round bracket,
// followed by a closing round bracket.
export const CapturingGroupRegexp: RegExp = /\([^()]+\)/

/*
* Creates a Route. Used mostly for type checking.
*
* EXAMPLE
*
* const route = createRoute(
*     /^\/book/\/i,
*     (id: string) => `/book/${id}`,
*     (path: string) => path.split('/').slice(2),
* )
*/
export function createRoute<A extends Args>(
    patternString: string | RegExp,
    path: (...args: A) => string,
    params: (path: string) => Array<string>,
): Route<A, Array<string>> {
    const pattern = compileRoutePattern(patternString)

    return {pattern, path, params}
}

/*
* Creates a Route from RegExp capturing groups.
*
* EXAMPLE
*
* const bookRoute = createSimpleRoute('/book/(\\w+)/(\\w+)')
* bookRoute.path(123, 'Harry-Potter') === '/book/123/Harry-Potter'
* bookRoute.params('/book/123/Harry-Potter') === ['123', 'Harry-Potter']
*/
export function createSimpleRoute<
    A extends Array<string | number> = Array<string | number>
>(patternStringRaw: string): Route<A, Array<string>> {
    const patternString = cleanRoutePattern(patternStringRaw)
    const pattern = buildRouteRegexp(exact(patternString))

    function path(...args: A) {
        return computeRoutePath(patternString, ...args)
    }

    function params(path: string) {
        return computeRouteParams(pattern, path)
    }

    return {pattern, path, params}
}

/*
* Encodes the route parameters inside the pattern.
*
* EXAMPLE
*
* computeRoutePath('/book/(\\w+)/(\\w+)', 'abc', 123) === '/book/abc/123'
*/
export function computeRoutePath(patternStr: string, ...args: Array<string | number>): string {
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
*
* computeRouteParams(new RegExp('/book/(\\w+)/(\\w+)'), '/book/abc/123') === ['abc', '123']
*/
function computeRouteParams(patternRe: RegExp, path: string) {
    const matches = path.match(patternRe)?.slice(1) // Without the whole matching group (first element).

    return matches ?? []
}

// Types ///////////////////////////////////////////////////////////////////////

export interface Route<A extends Args, M extends Args> {
    pattern: RegExp
    path(...args: A): string
    params(path: string): M
}

type Args = Array<unknown>

import type {Io, Task} from '@eviljs/std/fn-type'
import {asArray} from '@eviljs/std/type-as'
import {compileRoutePatternRegexp, type RoutePattern} from './route-pattern.js'

export function testRoutePattern(routePath: string, pattern: RoutePattern): boolean {
    return compileRoutePatternRegexp(pattern).test(routePath)
}

export function matchRoutePattern(routePath: string, pattern: RoutePattern): undefined | RegExpMatchArray {
    return routePath.match(compileRoutePatternRegexp(pattern)) ?? undefined
}

export function matchRoutePatterns(routePath: string, patterns: RoutePatterns): undefined | RegExpMatchArray {
    for (const pattern of asArray(patterns)) {
        const routeMatches = matchRoutePattern(routePath, pattern)

        if (! routeMatches) {
            continue
        }

        return routeMatches
    }

    return // Makes TypeScript happy.
}

export function selectRouteMatch<R>(routePath: string, list: Array<[RoutePatterns, R]>): undefined | [RegExpMatchArray, R] {
    for (const item of list) {
        const [patterns, selectedValue] = item

        const routeMatches = matchRoutePatterns(routePath, patterns)

        if (! routeMatches) {
            continue
        }

        return [routeMatches, selectedValue]
    }

    return // Makes TypeScript happy.
}

export function whenRouteMatch<R>(routePath: string, list: Array<[RoutePatterns, Io<RegExpMatchArray, R>]>): undefined | R {
    const result = selectRouteMatch(routePath, list)

    if (! result) {
        return
    }

    const [matches, callback] = result

    return callback(matches)
}

export function ifRouteMatch<T>(
    routePath: string,
    patterns: RoutePatterns,
    onTrue: Io<RegExpMatchArray, T>,
    onFalse?: undefined,
): undefined | T
export function ifRouteMatch<T, F>(
    routePath: string,
    patterns: RoutePatterns,
    onTrue: Io<RegExpMatchArray, T>,
    onFalse: Task<F>,
): T | F
export function ifRouteMatch<T, F = undefined>(
    routePath: string,
    patterns: RoutePatterns,
    onTrue: Io<RegExpMatchArray, T>,
    onFalse?: undefined | Task<F>,
): undefined | T | F {
    const matches = matchRoutePatterns(routePath, patterns)

    return matches ? onTrue(matches) : onFalse?.()
}

// Types ///////////////////////////////////////////////////////////////////////

export type RoutePatterns = RoutePattern | Array<RoutePattern>

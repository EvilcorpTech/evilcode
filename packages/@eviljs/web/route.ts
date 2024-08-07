import type {Io, Task} from '@eviljs/std/fn-type.js'
import {asArray} from '@eviljs/std/type-as.js'
import {isArray, isRegExp} from '@eviljs/std/type-is.js'
import type {ElementOf} from '@eviljs/std/type.js'

export const MatchStart = '^'
export const MatchEnd = '(?:/)?$'
export const MatchDeep = '(?:/|$)'
export const MatchAny = '(.*)'
export const MatchArg = '([^/]+)'

export const RouteArgPlaceholder = '{arg}'

export const RoutePatternRegexpCache: Record<string, RegExp> = {}
export const RoutePatternEmptyRegexp: RegExp = /^$/
export const RoutePatternEmptiesRegexp: RegExp = /[\n ]/g
export const RoutePatternRepeatingSlashRegexp: RegExp = /\/\/+/g
export const RoutePatternTrailingSlashRegexp: RegExp = /\/$/

export function exact(pattern: string): string
export function exact(strings: TemplateStringsArray, ...substitutions: Array<unknown>): string
export function exact(...args: [string] | [TemplateStringsArray, ...Array<unknown>]): string {
    const [strings, ...substitutions] = args

    return isArray(strings)
        ? exactRouteTemplate(strings as TemplateStringsArray, ...substitutions)
        : exactRouteString(strings as string)
}

export function exactRouteString(pattern: string) {
    return `${MatchStart}${pattern}${MatchEnd}`
}

export function exactRouteTemplate(strings: TemplateStringsArray, ...substitutions: Array<unknown>): string {
    return exactRouteString(String.raw({raw: strings}, ...substitutions))
}

export function compileRoutePattern(pattern: RoutePattern): RegExp {
    if (isRegExp(pattern)) {
        return pattern
    }

    return routeRegexpFromPattern(cleanRoutePattern(pattern))
}

export function cleanRoutePattern(pattern: string): string {
    return pattern
        .replace(RoutePatternEmptiesRegexp, '')
        .replace(RoutePatternRepeatingSlashRegexp, '/')
        .replace(RoutePatternTrailingSlashRegexp, '')
        .replace(RoutePatternEmptyRegexp, '/')
}

export function routeRegexpFromPattern(pattern: RoutePattern): RegExp {
    if (isRegExp(pattern)) {
        return pattern
    }

    const regexp = RoutePatternRegexpCache[pattern] ?? new RegExp(pattern, 'i')

    RoutePatternRegexpCache[pattern] ??= regexp

    return regexp
}

export function encodeRouteArgs(route: string, ...args: RouteArgs): string {
    return replaceRouteArgPlaceholderWithValues(route, RouteArgPlaceholder, args)
}

export function replaceRouteArgPlaceholderWithValues(template: string, argPlaceholder: string, argValues: RouteArgs): string {
    let output = template

    for (const arg of argValues) {
        output = output.replace(argPlaceholder, String(arg))
    }

    return output
}

export function replaceRouteArgPlaceholderWithValue(template: string, argPlaceholder: string, argValue: ElementOf<RouteArgs>): string {
    return template.replaceAll(argPlaceholder, String(argValue))
}

export function testRoutePattern(routePath: string, pattern: RoutePattern): boolean {
    return routeRegexpFromPattern(pattern).test(routePath)
}

export function matchRoutePattern(routePath: string, pattern: RoutePattern): undefined | RegExpMatchArray {
    return routePath.match(routeRegexpFromPattern(pattern)) ?? undefined
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

    return matches
        ? onTrue(matches)
        : onFalse?.()
}

// Types ///////////////////////////////////////////////////////////////////////

export type RouteArgs = Array<number | string>
export type RoutePattern = string | RegExp
export type RoutePatterns = RoutePattern | Array<RoutePattern>

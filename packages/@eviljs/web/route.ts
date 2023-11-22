import type {Io} from '@eviljs/std/fn.js'
import {asArray, isArray, isRegExp} from '@eviljs/std/type.js'

export const MatchStart = '^'
export const MatchEnd = '(?:/)?$'
export const MatchDeep = '(?:/|$)'
export const MatchAny = '(.*)'
export const MatchArg = '([^/]+)'

export const RoutePatternRegexpCache: Record<string, RegExp> = {}
export const RoutePatternEmptyRegexp = /^$/
export const RoutePatternEmptiesRegexp = /[\n ]/g
export const RoutePatternRepeatingSlashRegexp = /\/\/+/g
export const RoutePatternTrailingSlashRegexp = /\/$/

export const RoutePathArgPlaceholder = '{arg}'

export function exact(pattern: string): string
export function exact(strings: TemplateStringsArray, ...substitutions: Array<unknown>): string
export function exact(...args: [string] | [TemplateStringsArray, ...Array<unknown>]): string {
    const [strings, ...substitutions] = args

    return isArray(strings)
        ? exactTemplate(strings as TemplateStringsArray, ...substitutions)
        : exactString(strings as string)
}

export function exactString(pattern: string) {
    return `${MatchStart}${pattern}${MatchEnd}`
}

export function exactTemplate(strings: TemplateStringsArray, ...substitutions: Array<unknown>): string {
    return exactString(String.raw({raw: strings}, ...substitutions))
}

export function compilePattern(pattern: string | RegExp): RegExp {
    if (isRegExp(pattern)) {
        return pattern
    }

    return routeRegexpFromPattern(cleanPattern(pattern))
}

export function cleanPattern(pattern: string): string {
    return pattern
        .replace(RoutePatternEmptiesRegexp, '')
        .replace(RoutePatternRepeatingSlashRegexp, '/')
        .replace(RoutePatternTrailingSlashRegexp, '')
        .replace(RoutePatternEmptyRegexp, '/')
}

export function encodeRoutePathArgs(route: string, ...args: RoutePatternArgs) {
    return replaceRoutePathArgPlaceholdersWithValues(route, RoutePathArgPlaceholder, args)
}

export function replaceRoutePathArgPlaceholdersWithValues(template: string, placeholder: string, args: RoutePatternArgs) {
    let output = template

    for (const arg of args) {
        output = output.replace(placeholder, String(arg))
    }

    return output
}

export function replaceRoutePathArgPlaceholdersWithValue(template: string, placeholder: string, replacement: string) {
    return template.replaceAll(placeholder, String(replacement))
}

export function routeRegexpFromPattern(pattern: string | RegExp): RegExp {
    if (isRegExp(pattern)) {
        return pattern
    }

    if (! RoutePatternRegexpCache[pattern]) {
        RoutePatternRegexpCache[pattern] = new RegExp(pattern, 'i')
    }

    return RoutePatternRegexpCache[pattern]!
}

export function testRoutePattern(routePath: string, pattern: string | RegExp): boolean {
    return routeRegexpFromPattern(pattern).test(routePath)
}

export function matchRoutePattern(routePath: string, pattern: string | RegExp): undefined | RegExpMatchArray {
    return routePath.match(routeRegexpFromPattern(pattern)) ?? undefined
}

export function testRouteMatch(
    routePath: string,
    tests: RoutePathTest,
): undefined | RegExpMatchArray {
    const patterns = asArray(tests)

    for (const pattern of patterns) {
        const routeMatches = matchRoutePattern(routePath, pattern)

        if (! routeMatches) {
            continue
        }

        return routeMatches
    }

    return // Makes TypeScript happy.
}

export function selectRouteMatch<R>(
    routePath: string,
    list: Array<[RoutePathTest, R]>,
): undefined | [RegExpMatchArray, R] {
    for (const item of list) {
        const [tests, selectedValue] = item

        const routeMatches = testRouteMatch(routePath, tests)

        if (! routeMatches) {
            continue
        }

        return [routeMatches, selectedValue]
    }

    return // Makes TypeScript happy.
}

export function whenRouteMatch<R>(
    routePath: string,
    list: Array<[RoutePathTest, Io<RegExpMatchArray, R>]>,
): undefined | R {
    const result = selectRouteMatch(routePath, list)

    if (! result) {
        return
    }

    const [matches, callback] = result

    return callback(matches)
}

// Types ///////////////////////////////////////////////////////////////////////

export type RoutePatternArgs = Array<number | string>

export type RoutePathTest = string | RegExp | Array<string | RegExp>

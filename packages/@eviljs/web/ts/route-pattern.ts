import type {ElementOf} from '@eviljs/std/type'
import {isArray, isRegExp} from '@eviljs/std/type-is'

export const MatchStart = '^'
export const MatchEnd = '(?:/)?$'
export const MatchDeep = '(?:/|$)'
export const MatchAny = '(.*)'
export const MatchArg = '([^/]+)'

export const RoutePatternRegexpCache: Record<string, RegExp> = {}
export const RoutePatternEmptyRegexp: RegExp = /^$/
export const RoutePatternEmptiesRegexp: RegExp = /[\n ]/g
export const RoutePatternRepeatingSlashRegexp: RegExp = /\/\/+/g
export const RoutePatternTrailingSlashRegexp: RegExp = /\/$/

export const RoutePatternKit = {
    clean(pattern: string): string {
        return pattern
            .replace(RoutePatternEmptiesRegexp, '')
            .replace(RoutePatternRepeatingSlashRegexp, '/')
            .replace(RoutePatternTrailingSlashRegexp, '')
            .replace(RoutePatternEmptyRegexp, '/')
    },
    exact(pattern: string): string {
        return `${MatchStart}${RoutePatternKit.clean(pattern)}${MatchEnd}`
    },
    base(pattern: string): string {
        return `${MatchStart}${RoutePatternKit.clean(pattern)}${MatchDeep}`
    },
}

export function exact(pattern: string): string
export function exact(strings: TemplateStringsArray, ...substitutions: Array<unknown>): string
export function exact(...args: [string] | [TemplateStringsArray, ...Array<unknown>]): string {
    const [strings, ...substitutions] = args

    return isArray(strings)
        ? RoutePatternKit.exact(String.raw({raw: strings as TemplateStringsArray}, ...substitutions))
        : RoutePatternKit.exact(strings as string)
}

export function compileRoutePatternRegexp(pattern: RoutePattern): RegExp {
    if (isRegExp(pattern)) {
        return pattern
    }

    const regexp = RoutePatternRegexpCache[pattern] ?? new RegExp(pattern, 'i')

    RoutePatternRegexpCache[pattern] ??= regexp

    return regexp
}

export function replaceRouteArgPlaceholderWithValues(template: string, argPlaceholder: string | RegExp, argValues: RouteArgs): string {
    let output = template

    for (const arg of argValues) {
        output = output.replace(argPlaceholder, String(arg))
    }

    return output
}

export function replaceRouteArgPlaceholderWithValue(template: string, argPlaceholder: string | RegExp, argValue: ElementOf<RouteArgs>): string {
    return template.replaceAll(argPlaceholder, String(argValue))
}

// Types ///////////////////////////////////////////////////////////////////////

export type RouteArgs = Array<number | string>
export type RoutePattern = string | RegExp

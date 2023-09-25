import {isArray, isRegExp} from '@eviljs/std/type.js'

export const Start = '^'
export const End = '(?:/)?$'
export const Deep = '(?:/.*)?$'
export const Any = '(.*)'
export const Arg = '([^/]+)'

export const PatternRegexpCache: Record<string, RegExp> = {}
export const PatternEmptyRegexp = /^$/
export const PatternEmptiesRegexp = /[\n ]/g
export const PatternRepeatingSlashRegexp = /\/\/+/g
export const PatternTrailingSlashRegexp = /\/$/

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
    return `${Start}${pattern}${End}`
}

export function exactTemplate(strings: TemplateStringsArray, ...substitutions: Array<unknown>): string {
    return exactString(String.raw({raw: strings}, ...substitutions))
}

export function compilePattern(pattern: string | RegExp): RegExp {
    if (isRegExp(pattern)) {
        return pattern
    }

    return regexpFromPattern(cleanPattern(pattern))
}

export function cleanPattern(pattern: string): string {
    return pattern
        .replace(PatternEmptiesRegexp, '')
        .replace(PatternRepeatingSlashRegexp, '/')
        .replace(PatternTrailingSlashRegexp, '')
        .replace(PatternEmptyRegexp, '/')
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

export function regexpFromPattern(pattern: string | RegExp): RegExp {
    if (isRegExp(pattern)) {
        return pattern
    }

    if (! PatternRegexpCache[pattern]) {
        PatternRegexpCache[pattern] = new RegExp(pattern, 'i')
    }

    return PatternRegexpCache[pattern]!
}

// Types ///////////////////////////////////////////////////////////////////////

export type RoutePatternArgs = Array<number | string>

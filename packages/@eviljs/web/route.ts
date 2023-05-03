import {isRegExp} from '@eviljs/std/type.js'

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

export const PatternRegExpCache: Record<string, RegExp> = {}

export function exact(pattern: string) {
    return `${Start}${pattern}${End}`
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

export function regexpFromPattern(pattern: string | RegExp): RegExp {
    if (isRegExp(pattern)) {
        return pattern
    }

    if (! PatternRegExpCache[pattern]) {
        PatternRegExpCache[pattern] = new RegExp(pattern, 'i')
    }

    return PatternRegExpCache[pattern]!
}

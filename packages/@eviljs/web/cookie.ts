import {mapSome} from '@eviljs/std/monad.js'
import {escapeRegexp} from '@eviljs/std/regexp.js'
import {isSome} from '@eviljs/std/type.js'

export const KeyRegExpCache: Record<string, RegExp> = {}

export function createCookie(key: string, options?: undefined | CookieOptions) {
    const self: Cookie = {
        key,
        get() {
            return readCookie(self.key)
        },
        set(value: string) {
            return writeCookie(self.key, value, options)
        },
        delete() {
            return deleteCookie(self.key, options)
        },
    }

    return self
}

export function maxAgeInDays(days: number) {
    const oneSecond = 1
    const oneMinute = 60 * oneSecond
    const oneHour = 60 * oneMinute
    const oneDay = 24 * oneHour
    const maxAge = days * oneDay

    return maxAge
}

export function expiresInDays(days: number) {
    const oneSecond = 1 * 1000 // In milliseconds.
    const oneMinute = 60 * oneSecond
    const oneHour = 60 * oneMinute
    const oneDay = 24 * oneHour
    const daysMs = days * oneDay
    const date = new Date()
    date.setTime(date.getTime() + daysMs)
    const expires = date.toUTCString()

    return expires
}

export function readCookie(key: string) {
    if (! document.cookie) {
        return
    }

    const cookie = document.cookie
    const regexp = regexpFromKey(key)
    const matches = cookie.match(regexp)

    if (matches) {
        return matches[1]
    }

    return
}

export function writeCookie(key: string, val: string, options?: undefined | CookieOptions) {
    const path = options?.path
    const maxAge = options?.maxAge
    const expires = options?.expires
    const sameSite = options?.sameSite
    const secure = options?.secure
    const customParts = options?.custom
    const parts = [
        `${key}=${val}`,
        mapSome(path, path => `Path=${path}`),
        mapSome(maxAge, maxAge => `Max-Age=${maxAge}`),
        mapSome(expires, expires => `Expires=${expires}`),
        mapSome(sameSite, sameSite => `SameSite=${sameSite}`),
        secure ? 'Secure' : undefined,
        ...customParts ?? [],
    ].filter(isSome)

    const cookie = parts.join('; ')

    document.cookie = cookie
}

export function deleteCookie(key: string, options?: undefined | CookieOptions) {
    const expires = 'Thu, 01 Jan 1970 00:00:01 GMT'
    const maxAge = 0

    writeCookie(key, '', {...options, maxAge, expires})
}

export function cleanCookies(options?: undefined | CookieOptions) {
    const list = document.cookie.split(';')

    for (const keyVal of list) {
        const [key] = keyVal.trim().split('=')

        deleteCookie(key!, options)
    }
}

export function regexpFromKey(key: string) {
    if (! KeyRegExpCache[key]) {
        KeyRegExpCache[key] = new RegExp(`\\b${escapeRegexp(key)}=([^;]*);?`)
    }

    return KeyRegExpCache[key]!
}

// Types ///////////////////////////////////////////////////////////////////////

export interface Cookie {
    key: string
    get(): string | undefined
    set(value: string): void
    delete(): void
}

export interface CookieOptions {
    path?: undefined | string
    maxAge?: undefined | number
    expires?: undefined | string
    sameSite?: undefined | string
    secure?: undefined | boolean
    custom?: Array<string>
}

export function createCookie(options?: CreateCookieOptions) {
    const self: Cookie = {
        path: options?.path ?? '/',
        key: options?.key ?? 'token',
        maxAge: options?.maxAge ?? defaultMaxAge(),
        expires: options?.expires ?? defaultExpires(),

        get() {
            return getCookie(self.key)
        },
        set(value: string) {
            return setCookie(self.path, self.key, value, {maxAge: self.maxAge, expires: self.expires})
        },
        delete() {
            return deleteCookie(self.path, self.key)
        },
        clean() {
            return cleanCookie(self.path)
        },
    }

    return self
}

export function defaultMaxAge() {
    const oneSecond = 1
    const oneMinute = 60 * oneSecond
    const oneHour = 60 * oneMinute
    const oneDay = 24 * oneHour
    const days = 14
    const maxAge = days * oneDay

    return maxAge
}

export function defaultExpires() {
    const maxAge = defaultMaxAge()
    const date = new Date()
    const time = date.getTime()
    const untilDate = time + maxAge

    date.setTime(untilDate)

    const expires = date.toUTCString()

    return expires
}

export function getCookie(key: string) {
    if (! document.cookie) {
        return
    }

    const cookie = document.cookie
    const regexp = new RegExp(`\\b${key}=([^;]*);?`)
    const matches = cookie.match(regexp)

    if (matches) {
        return matches[1]
    }

    return
}

export function setCookie(path: string, key: string, val: string, options?: SetCookieOptions) {
    const maxAge = options?.maxAge ?? defaultMaxAge()
    const expires = options?.expires ?? defaultExpires()
    const parts = []

    parts.push(`${key}=${val}; path=${path}`)

    if (maxAge) {
        parts.push(`max-age=${maxAge}`)
    }

    if (expires) {
        parts.push(`expires=${expires}`)
    }

    const cookie = parts.join('; ')

    document.cookie = cookie
}

export function deleteCookie(path: string, key: string) {
    const expires = 'Thu, 01 Jan 1970 00:00:01 GMT'
    const maxAge = 0

    setCookie(path, key, '', {maxAge, expires})
}

export function cleanCookie(path: string) {
    const list = document.cookie.split(';')

    for (const keyVal of list) {
        const [ key ] = keyVal.trim().split('=')

        deleteCookie(path, key)
    }
}

// Types ///////////////////////////////////////////////////////////////////////

export interface Cookie {
    path: string
    key: string
    maxAge: number
    expires: string
    get(): string | undefined
    set(value: string): void
    delete(): void
    clean(): void
}

export interface CreateCookieOptions extends SetCookieOptions {
    path?: string
    key?: string
}

export interface SetCookieOptions {
    maxAge?: number
    expires?: string
}
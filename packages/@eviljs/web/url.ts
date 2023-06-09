export const UrlSchemaRegexp = /^([a-zA-Z0-9]+):/ // "http://" "https://" "mailto:" "tel:"

export function isUrlAbsolute(url: string): boolean
export function isUrlAbsolute(url: undefined | string): undefined | boolean
export function isUrlAbsolute(url: undefined | string) {
    if (! url) {
        return
    }
    return false
        || url.startsWith('//')
        || UrlSchemaRegexp.test(url)
}

export function asBaseUrl(url?: undefined | string) {
    if (! url) {
        return ''
    }
    if (! url.trim()) {
        return ''
    }
    if (url.endsWith('/')) {
        // Url, without the trailing slash.
        // It is fine to have a trailing slash but multiple trailing slashes
        // are ignored because are an error and should not be amended.
        return url.slice(0, -1)
    }
    return url
}

export function joinUrlPath(...parts: [string, ...Array<string>]) {
    const [firstPart, ...otherParts] = parts
    let path = firstPart
    for (const it of otherParts) {
        if (! path.endsWith('/')) {
            path += '/'
        }
        path += it.startsWith('/')
            ? it.slice(1)
            : it
    }
    return path
}

export function joinUrlPathAndParams(path: string, params: undefined | string): string {
    if (! params) {
        return path
    }

    const separator = path.includes('?')
        ? '&'
        : '?'

    return path + separator + params
}

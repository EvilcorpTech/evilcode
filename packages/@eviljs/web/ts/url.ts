export * from './url-params.js'
export * from './url-path.js'

export const UrlSchemaRegexp: RegExp = /^([a-zA-Z0-9]+):/ // "http://" "https://" "mailto:" "tel:"

export function isUrlAbsolute(url: string): boolean {
    return false
        || url.startsWith('//')
        || UrlSchemaRegexp.test(url)
}

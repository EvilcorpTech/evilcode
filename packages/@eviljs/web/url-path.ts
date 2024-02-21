export function asBaseUrl(url?: undefined | string): string {
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

export function joinUrlPaths(...parts: [string, ...Array<string>]): string {
    const [firstPart, ...otherParts] = parts
    let path = firstPart
    for (const it of otherParts) {
        if (path.at(-1) !== '/') {
            path += '/'
        }
        path += it[0] === '/'
            ? it.slice(1)
            : it
    }
    return path
}

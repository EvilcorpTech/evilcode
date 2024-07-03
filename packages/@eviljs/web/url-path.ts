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

    let joinedPath = firstPart

    for (const part of otherParts) {
        const pathEndsWithSlash = joinedPath[joinedPath.length - 1] === '/'
        const partStartsWithStash = part[0] === '/'

        joinedPath += ''
            + (pathEndsWithSlash ? '' : '/')
            + (partStartsWithStash ? part.slice(1) : part)
    }

    return joinedPath
}

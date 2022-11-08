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

// const joinPathTests: Array<[string, [string, string, ...Array<string>]]> = [
//     ['/api', ['', 'api']],
//     ['/api', ['', '/api']],
//     ['/api/', ['/', 'api/']],
//     ['/api/', ['/', '/api/']],
//     ['api/v1', ['api', 'v1']],
//     ['/api/v1', ['/api', 'v1']],
//     ['/api/v1', ['/api', '/v1']],
//     ['/api/v1', ['/api/', '/v1']],
//     ['/api/v1/id/', ['/api/', '/v1/', '/id/']],
//     ['https://api.com/api', ['https://api.com', 'api']],
//     ['https://api.com/api', ['https://api.com/', 'api']],
//     ['https://api.com/api', ['https://api.com', '/api']],
//     ['https://api.com/api', ['https://api.com/', '/api']],
//     ['https://api.com/api/v2', ['https://api.com', '/api/', 'v2']],
// ]
// for (const it of joinPathTests) {
//     const [expected, args] = it
//     const actual = joinPath(...args)
//     console.assert(expected === actual, 'expected:', expected, 'given:', actual, args)
// }
export function joinPath(firstPart: string, secondPart: string, ...otherParts: Array<string>) {
    const parts = [secondPart, ...otherParts]

    let path = firstPart
    for (const it of parts) {
        if (! path.endsWith('/')) {
            path += '/'
        }
        path += it.startsWith('/')
            ? it.slice(1)
            : it
    }
    return path
}

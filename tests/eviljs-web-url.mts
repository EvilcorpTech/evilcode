import {joinUrlPaths} from '../packages/@eviljs/web/url.js'

const tests: Array<[string, [string, string, ...Array<string>]]> = [
    ['/api', ['', 'api']],
    ['/api', ['', '/api']],
    ['/api/', ['/', 'api/']],
    ['/api/', ['/', '/api/']],
    ['api/v1', ['api', 'v1']],
    ['/api/v1', ['/api', 'v1']],
    ['/api/v1', ['/api', '/v1']],
    ['/api/v1', ['/api/', '/v1']],
    ['/api/v1/id/', ['/api/', '/v1/', '/id/']],
    ['https://api.com/api', ['https://api.com', 'api']],
    ['https://api.com/api', ['https://api.com/', 'api']],
    ['https://api.com/api', ['https://api.com', '/api']],
    ['https://api.com/api', ['https://api.com/', '/api']],
    ['https://api.com/api/v2', ['https://api.com', '/api/', 'v2']],
]
for (const it of tests) {
    const [expected, args] = it
    const actual = joinUrlPaths(...args)
    console.assert(expected === actual, 'expected:', expected, 'given:', actual, args)
}

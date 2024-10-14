import {joinUrlPaths} from '@eviljs/web/url'
import Assert from 'node:assert'
import {describe, test} from 'node:test'

describe('@eviljs/web/url', (ctx) => {
    test('joinUrlPaths()', async (ctx) => {
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
            Assert.strictEqual(expected, actual)
        }
    })
})

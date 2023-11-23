import type {Container as ContainerDefinition} from '@eviljs/std/container'
import {createConsoleLog, createLogger} from '@eviljs/std/logger'
import {createCookie} from '@eviljs/web/cookie'
import type {Fetch} from '@eviljs/web/fetch'
import {createFetch} from '@eviljs/web/fetch'
import {mockFetchDelayed} from '@eviljs/web/fetch-mock'
import {createQuery} from '@eviljs/web/query'
import {createHashRouter} from '@eviljs/web/router-hash'
import {createPathRouter} from '@eviljs/web/router-path'
import {asBaseUrl} from '@eviljs/web/url'
import {CookieSpec} from '~/cookie/cookie-apis'
import {ApiUrl, BasePath, RouterType} from '~/env/env-apis'
import {FetchMocksSpec} from '~/mock/mock-apis'

export const ContainerSpec = {
    Cookie(container: {}) {
        return createCookie('token', CookieSpec)
    },
    Fetch(container: {}) {
        const fetch = createFetch({baseUrl: ApiUrl})

        // SERVICE WORKER //////////////////////////////////////////////////
        const serviceWorkerPath = [asBaseUrl(BasePath), 'entry-mocks-service-worker.js']
        const serviceWorkerUrl = serviceWorkerPath.filter(Boolean).join('/')
        // navigator.serviceWorker.register(serviceWorkerUrl)
        // return fetch

        // MOCK ////////////////////////////////////////////////////////////
        return mockFetchDelayed(fetch, FetchMocksSpec, {minDelay: 500, maxDelay: 1000})

    },
    Logger(container: {}) {
        return createLogger(createConsoleLog())
    },
    Router(container: {}) {
        return RouterType === 'path'
            ? createPathRouter({basePath: BasePath})
            : createHashRouter({basePath: BasePath})
    },
    Query(container: {Fetch: Fetch}) {
        return createQuery(container.Fetch)
    },
}

// Types ///////////////////////////////////////////////////////////////////////

export type Container = ContainerDefinition<typeof ContainerSpec>

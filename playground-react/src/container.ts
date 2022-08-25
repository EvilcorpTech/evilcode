import type {Container as StdContainer} from '@eviljs/std/container'
import {createI18n} from '@eviljs/std/i18n'
import {createConsoleLog, createLogger} from '@eviljs/std/logger'
import {createCookie} from '@eviljs/web/cookie'
import {createFetch} from '@eviljs/web/fetch'
import {asBaseUrl} from '@eviljs/web/url'
import {mockFetchDelayed} from '@eviljs/web/fetch-mock'
import {createQuery} from '@eviljs/web/query'
import {ApiUrl, BasePath, BundleName} from './context'
import {CookieSpec} from './cookie'
import {I18nSpec} from './i18n'
import {FetchMocksSpec} from './mock'

export const ContainerSpec = {
    services: {
        Cookie(container: {}) {
            return createCookie('token', CookieSpec)
        },
        Fetch(container: {}) {
            const fetch = createQuery(createFetch({baseUrl: ApiUrl}))

            // SERVICE WORKER //////////////////////////////////////////////////
            const serviceWorkerPath = [asBaseUrl(BasePath), BundleName, 'entry-mocks-service-worker.js']
            const serviceWorkerUrl = serviceWorkerPath.filter(Boolean).join('/')
            // navigator.serviceWorker.register(serviceWorkerUrl)
            // return fetch

            // MOCK ////////////////////////////////////////////////////////////
            return mockFetchDelayed(fetch, FetchMocksSpec, {minDelay: 500, maxDelay: 1000})

        },
        I18n(container: {}) {
            return createI18n(I18nSpec)
        },
        Logger(container: {}) {
            return createLogger(createConsoleLog())
        },
    },
}

// Types ///////////////////////////////////////////////////////////////////////

export type Container = StdContainer<typeof ContainerSpec.services>

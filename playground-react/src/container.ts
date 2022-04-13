import {Container as ContainerStd} from '@eviljs/std/container'
import {createI18n} from '@eviljs/std/i18n'
import {createConsoleLog, createLogger} from '@eviljs/std/logger'
import {createCookie, maxAgeInDays} from '@eviljs/web/cookie'
import {createFetch, Fetch} from '@eviljs/web/fetch'
import {asBaseUrl} from '@eviljs/web/url'
import {mockFetchDelayed} from '@eviljs/web/fetch-mock'
import {createQuery} from '@eviljs/web/query'
import {ApiUrl, BasePath, BundleName} from './context'
import {I18nSpec} from './i18n'
import {FetchMocksSpec} from './mock'
import {StoreSpec} from './store'

export const ContainerSpec = {
    services: {
        Cookie(container: {}) {
            return createCookie('token', {maxAge: maxAgeInDays(7)})
        },
        Fetch(container: {}) {
            const fetch = createFetch({baseUrl: ApiUrl})

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
        Query(container: {Fetch: Fetch}) {
            return createQuery(container.Fetch)
        },
        StoreSpec(container: {}) {
            return StoreSpec
        },
    },
}

// Types ///////////////////////////////////////////////////////////////////////

export type Container = ContainerStd<typeof ContainerSpec.services>

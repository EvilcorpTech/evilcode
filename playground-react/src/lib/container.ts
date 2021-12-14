import {Container as ContainerStd} from '@eviljs/std/container'
import {createI18n} from '@eviljs/std/i18n'
import {createLogger} from '@eviljs/std/logger'
import {createCookie, maxAgeInDays} from '@eviljs/web/cookie'
import {asBaseUrl, createFetch, Fetch} from '@eviljs/web/fetch'
import {createQuery} from '@eviljs/web/query'
import {ApiUrl, BasePath, BundleName} from './context'
import {I18nSpec} from './i18n'
import {mockFetch} from './mock'
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

            // PROXY ///////////////////////////////////////////////////////////
            return mockFetch(fetch)

        },
        I18n(container: {}) {
            return createI18n(I18nSpec)
        },
        Logger(container: {}) {
            return createLogger()
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

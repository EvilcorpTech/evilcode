import {Container as StdContainer} from '@eviljs/std-lib/container'
import {createI18n} from '@eviljs/std-lib/i18n'
import {createLogger} from '@eviljs/std-lib/logger'
import {useContainer as useStdContainer} from '@eviljs/std-react/container'
import {createCookie, maxAgeInDays} from '@eviljs/std-web/cookie'
import {asBaseUrl, createFetch, Fetch} from '@eviljs/std-web/fetch'
import {createQuery} from '@eviljs/std-web/query'
import {ApiUrl, BasePath, BundleName} from './context'
import {I18nSpec} from './i18n'
import {StoreSpec} from './store'

export const ContainerSpec = {
    services: {
        Cookie(container: {}) {
            return createCookie('token', {maxAge: maxAgeInDays(7)})
        },
        Fetch(container: {}) {
            const serviceWorkerPath = [asBaseUrl(BasePath), BundleName, 'entry-mocks-service-worker.js']
            const serviceWorkerUrl = serviceWorkerPath.filter(Boolean).join('/')

            navigator.serviceWorker.register(serviceWorkerUrl)

            return createFetch({baseUrl: ApiUrl})
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

export function useContainer() {
    return useStdContainer() as Container
}

// Types ///////////////////////////////////////////////////////////////////////

export type Container = StdContainer<typeof ContainerSpec.services>
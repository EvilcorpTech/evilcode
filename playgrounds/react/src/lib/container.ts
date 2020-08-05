import {Container as StdContainer} from '@eviljs/std-lib/container'
import {createCookie} from '@eviljs/std-web/cookie'
import {createFetch, Fetch} from '@eviljs/std-web/fetch'
import {createI18n} from '@eviljs/std-lib/i18n'
import {createLogger} from '@eviljs/std-lib/logger'
import {createQuery} from '@eviljs/std-web/query'
import {I18nSpec} from './i18n'
import {mockFetch} from './mock'
import {StoreSpec} from './store'
import {useContainer as useStdContainer} from '@eviljs/std-react/container'

export const ContainerSpec = {
    services: {
        Cookie(container: {}) {
            return createCookie()
        },
        Fetch(container: {}) {
            return mockFetch(createFetch({baseUrl: '/api'}))
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

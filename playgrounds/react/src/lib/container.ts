import { Container as StdContainer } from 'std-lib/container'
import { createCookie } from 'std-web/cookie'
import { createFetch, Fetch } from 'std-web/fetch'
import { createI18n } from 'std-lib/i18n'
import { createLogger } from 'std-lib/logger'
import { createQuery } from 'std-web/query'
import { I18nSpec } from 'lib/i18n'
import { mockFetch } from './mock'
import { StoreSpec } from 'lib/store'
import { useContainer as useStdContainer } from 'std-react/container'

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
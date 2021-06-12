import {createFetch} from '@eviljs/web/fetch'
import {createMockServiceWorker} from '@eviljs/web/fetch-mock'
import {ApiUrl} from './lib/context'
import {mockFetch} from './lib/mock'

const fetch = createFetch({baseUrl: ApiUrl})
const mockedFetch = mockFetch(fetch)

createMockServiceWorker(self, mockedFetch)

// Types ///////////////////////////////////////////////////////////////////////

declare const self: ServiceWorkerGlobalScope

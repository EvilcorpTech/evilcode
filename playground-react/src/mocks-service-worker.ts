import {createFetch} from '@eviljs/web/fetch'
import {createFetchServiceWorker, mockFetchDelayed} from '@eviljs/web/fetch-mock'
import {ApiUrl} from './env/env-apis'
import {FetchMocksSpec} from './mock/mock-apis'

const fetch = mockFetchDelayed(
    createFetch({baseUrl: ApiUrl}),
    FetchMocksSpec,
    {minDelay: 500, maxDelay: 1000},
)

createFetchServiceWorker(self, fetch)

// Types ///////////////////////////////////////////////////////////////////////

declare const self: ServiceWorkerGlobalScope

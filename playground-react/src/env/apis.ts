import {asBaseUrl} from '@eviljs/web/url'
import Release from '~/release.json'

export const ApiUrl = import.meta.env.APP_API_URL || '/api'
export const BasePath = asBaseUrl(import.meta.env.BASE_URL) || '/'
export const BundleName = 'bundle'
export const Mode = import.meta.env.MODE
export const RouterType = import.meta.env.APP_ROUTER_TYPE === 'path' ? 'path' : 'hash'
export const Version = Release.version

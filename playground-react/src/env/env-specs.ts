import {asBaseUrl} from '@eviljs/web/url'
import Release from '~/release.json'

export const Env = {
    ApiUrl: import.meta.env.APP_API_URL || '/api',
    BasePath: asBaseUrl(import.meta.env.APP_BASE_PATH || import.meta.env.BASE_URL) || '/',
    Env: import.meta.env.APP_ENV,
    Mode: import.meta.env.APP_MODE || import.meta.env.MODE,
    RouterType: import.meta.env.APP_ROUTER_TYPE === 'path' ? 'path' : 'hash',
    Version: Release.version,
}

// Types ///////////////////////////////////////////////////////////////////////

declare global {
    interface ImportMeta {
        readonly env: ImportMetaEnv
    }

    interface ImportMetaEnv {
        APP_API_URL?: undefined | string
        APP_BASE_PATH?: undefined | string
        APP_ENV?: undefined | 'production' | 'staging'
        APP_MODE?: undefined | 'production' | 'development'
        APP_ROUTER_TYPE?: undefined | string
        // [key: string]: unknown
    }
}

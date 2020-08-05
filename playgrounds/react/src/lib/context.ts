import {version as Version} from '../../package.json'

export {version as Version} from '../../package.json'
export {version as StdLibVersion}  from '@eviljs/std-lib/package.json'
export {version as StdReactVersion} from '@eviljs/std-react/package.json'
export {version as StdThemeVersion} from '@eviljs/std-theme/package.json'
export {version as StdWebVersion} from '@eviljs/std-web/package.json'

export const [VersionMajor, VersionMinor, VersionPatch] = Version.split('.')

export const ENV = process.env.ENV ?? 'dev'
export const NODE_ENV = process.env.NODE_ENV ?? 'development'
export const BASE_URL = process.env.BASE_URL ?? '/'
export const ROUTER_TYPE = process.env.ROUTER_TYPE ?? 'hash'

// Types ///////////////////////////////////////////////////////////////////////

declare const process: {env: {
    ENV?: string
    NODE_ENV?: string
    BASE_URL?: string
    ROUTER_TYPE?: string
}}

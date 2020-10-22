import Package from '../../package.json'
import StdLibPackage from '@eviljs/std-lib/package.json'
import StdReactPackage from '@eviljs/std-react/package.json'
import StdThemePackage from '@eviljs/std-theme/package.json'
import StdWebPackage from '@eviljs/std-web/package.json'

export const {version: Version} = Package
export const {version: StdLibVersion} = StdLibPackage
export const {version: StdReactVersion} = StdReactPackage
export const {version: StdThemeVersion} = StdThemePackage
export const {version: StdWebVersion} = StdWebPackage
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

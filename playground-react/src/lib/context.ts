import Package from '../../package.json'

export const Version = Package.version
export const [VersionMajor, VersionMinor, VersionPatch] = Version.split('.')
export const API_URL = process.env.API_URL ?? '/api'
export const BASE_PATH = process.env.BASE_PATH ?? '/'
export const ENV = process.env.ENV ?? 'dev'
export const NODE_ENV = process.env.NODE_ENV ?? 'development'
export const ROUTER_TYPE = process.env.ROUTER_TYPE ?? 'hash'
export const WITH_PREACT = process.env.WITH_PREACT ?? false

// Types ///////////////////////////////////////////////////////////////////////

declare const process: {env: {
    API_URL?: string
    BASE_PATH?: string
    ENV?: string
    NODE_ENV?: string
    ROUTER_TYPE?: string
    WITH_PREACT?: string
}}

import Package from '../../package.json'

export const Version = Package.version
export const ApiUrl = __API_URL__ || '/api'
export const BasePath = __BASE_PATH__
export const BundleName = __BUNDLE_NAME__
export const Env = __ENV__
export const RouterType = __ROUTER_TYPE__ === 'path' ? 'path' : 'hash'

// Types ///////////////////////////////////////////////////////////////////////

// declare const process: {env: {NODE_ENV?: string}}
declare const __API_URL__: string
declare const __BASE_PATH__: string
declare const __BUNDLE_NAME__: string
declare const __ENV__: string
declare const __ROUTER_TYPE__: string

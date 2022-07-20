import Meta from './meta.json'

export const Version = Meta.version
export const ApiUrl = __API_URL__ || '/api'
export const BasePath = __BASE_PATH__ || '/'
export const BundleName = __BUNDLE_NAME__
export const Mode = __MODE__ || 'development'
export const RouterType = __ROUTER_TYPE__ === 'path' ? 'path' : 'hash'
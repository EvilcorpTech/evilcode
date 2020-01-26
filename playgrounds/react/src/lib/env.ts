import { version as Version } from '../../package.json'

export { version as Version } from '../../package.json'
export { version as StdLibVersion } from 'std-lib/package.json'
export { version as StdReactVersion } from 'std-react/package.json'
export { version as StdThemeVersion } from 'std-theme/package.json'
export { version as StdWebVersion } from 'std-web/package.json'
export const [ VersionMajor, VersionMinor, VersionPatch ] = Version.split('.')

// @ts-ignore
export const ENV = process.env.ENV
// @ts-ignore
export const NODE_ENV = process.env.NODE_ENV
import {Deep, Start} from '@eviljs/web/route'

export function matchBasePath(basePath: string) {
    return `${Start}${basePath}${Deep}`
}

import {MatchDeep, MatchStart} from '@eviljs/web/route'

export function matchBasePath(basePath: string) {
    return `${MatchStart}${basePath}${MatchDeep}`
}

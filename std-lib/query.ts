import { isArray, isNumber, isObject, isString } from './type'
import { throwInvalidArgument } from './error'

export const QueryRulesHeader = 'X-Query'

/*
* Flatten a (recursive) rules structure to a flat list of rules.
*
* EXAMPLE
* const root = 'account'
* flattenQueryRules(root, {user: ['name', 'email']})
* // ['account.user.name', 'account.user.email']
*/
export function flattenQueryRules(parent: string | number | null | undefined, rules: QueryRules | null | undefined) {
    if (! rules) {
        return parent
            ? [String(parent)]
            : []
    }

    if (isString(rules) || isNumber(rules)) {
        return parent
            ? [`${parent}.${rules}`]
            : [String(rules)]
    }

    if (isObject(rules)) {
        const flatRules: Array<string> = []
        for (const child in rules) {
            const otherParent = flattenQueryRules(parent, child)[0]
            const otherFlatQuery = flattenQueryRules(otherParent, rules[child])
            flatRules.push(...otherFlatQuery)
        }
        return flatRules
    }

    if (isArray(rules)) {
        const flatRules: Array<string> = []
        for (const kid of rules) {
            const otherFlatQuery = flattenQueryRules(parent, kid)
            flatRules.push(...otherFlatQuery)
        }
        return flatRules
    }

    return throwInvalidArgument(
        '@eviljs/std-lib-query.flattenQueryRules(parent, ~~rules~~):\n'
        + `rules must be a String | Number | Object | Array, given "${rules}".`
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export type QueryArgs = Record<string | number, QueryRules>

export type QueryRules =
    | undefined
    | null
    | boolean
    | number
    | string
    | {
        [key: string]: QueryRules
        [key: number]: QueryRules
    }
    | Array<QueryRules>
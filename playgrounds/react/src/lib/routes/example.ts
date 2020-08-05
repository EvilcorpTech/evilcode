// import {assertObject} from '@eviljs/std-lib/assert'
// import {isNil, ElementOf, ValueOf} from '@eviljs/std-lib/type'
import {createRoute, Start, End, PathOpt} from '@eviljs/std-web/router'

export function createExampleRoute(root?: string) {
    const parent = root ?? ''

    const self = createRoute(
        Start + parent + '/example' + PathOpt + End,
        (id?: string | number) => {
            let path = `${root ?? ''}/example`

            if (id) {
                path += `/${id}`
            }

            return path
        },
        path => {
            const matches = path.match(self.pattern)?.slice(1) // Without the whole matching.

            return matches?.[1]
        },
    )

    return self
}

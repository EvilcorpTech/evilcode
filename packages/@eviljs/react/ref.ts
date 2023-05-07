import {isFunction, isNil, type Writable} from '@eviljs/std/type.js'

export function mergingRefs<T = any>(...refs: Array<undefined | Ref<T>>) {
    function refProxy(el: T) {
        for (const ref of refs) {
            if (isNil(ref)) {
                continue
            }
            if (isFunction(ref)) {
                ref(el)
                continue
            }
            ;(ref as Writable<typeof ref>).current = el
        }
    }
    return refProxy
}

// Types ///////////////////////////////////////////////////////////////////////

export type Ref<T = any> = React.Ref<T> | React.MutableRefObject<T>

export interface RefProp<V = Element> {
    onRef?: undefined | React.Ref<V>
}

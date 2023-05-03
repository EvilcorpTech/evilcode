import {isFunction} from '@eviljs/std/type.js'

export function mergingRefs<T = any>(...refs: Array<undefined | Ref<T>>) {
    function refProxy(el: T) {
        for (const ref of refs) {
            if (isFunction(ref)) {
                ref(el)
            }
            else {
                ;(ref as React.MutableRefObject<null | T>).current = el
            }
        }
    }
    return refProxy
}

// Types ///////////////////////////////////////////////////////////////////////

export type Ref<T = any> = React.Ref<T> | React.MutableRefObject<T>

export interface RefProp<V = Element> {
    onRef?: undefined | React.Ref<V>
}

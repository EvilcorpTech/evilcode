import {isFunction} from '@eviljs/std/type.js'

export function mergeRefs(...refs: Array<undefined | Ref>) {
    function refProxy(el: unknown) {
        for (const ref of refs) {
            if (isFunction(ref)) {
                ref(el)
            }
            else {
                const mutableRef = (ref as React.MutableRefObject<null | unknown>)
                mutableRef.current = el
            }
        }
    }
    return refProxy
}

// Types ///////////////////////////////////////////////////////////////////////

export type Ref = React.Ref<any> | React.MutableRefObject<any>

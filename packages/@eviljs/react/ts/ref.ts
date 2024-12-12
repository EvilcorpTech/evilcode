import type {None} from '@eviljs/std/type'
import {isFunction, isObject} from '@eviljs/std/type-is'
import {useLayoutEffect, useMemo, useRef} from 'react'

export function useMergeRefs<V>(...refs: Array<void | None | RefHandler<None | V>>): (element: null | V) => void {
    const onRef = useMemo(() => {
        return mergingRefs(...refs)
    }, refs)

    return onRef
}

export function mergingRefs<V>(...refs: Array<void | None | RefHandler<None | V>>): React.RefCallback<null | V> {
    function onRef(element: null | V) {
        for (const ref of refs) {
            if (! ref) {
                continue
            }

            setRef<None | V>(ref, element)
        }
    }
    return onRef
}

export function setRef<V>(ref: RefHandler<V>, value: V): void {
    if (isFunction(ref)) {
        ref(value)
        return
    }
    if (isObject(ref)) {
        ref.current = value
        return
    }
}

export function usePreviousValueRef<T>(value: T): React.RefObject<undefined | T> {
    const oldValueRef = useRef<T>(undefined)

    useLayoutEffect(() => {
        function onClean() {
            oldValueRef.current = value
        }

        return onClean
    }, [value])

    return oldValueRef
}

// Types ///////////////////////////////////////////////////////////////////////

export type RefHandler<V> = React.RefObject<V> | React.RefCallback<V> | React.ForwardedRef<V>

export interface RefProp<V> {
    onRef?: undefined | RefHandler<V>
}

export type RefValueOf<R extends None | React.Ref<any> | React.ForwardedRef<any>> =
    R extends React.RefObject<infer V>
        ? V
    : R extends React.RefCallback<infer V>
        ? V
    : R extends None
        ? never
    : never

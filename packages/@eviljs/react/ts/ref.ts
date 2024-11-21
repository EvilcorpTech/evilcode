import type {None, Writable} from '@eviljs/std/type'
import {isFunction, isObject} from '@eviljs/std/type-is'
import {useLayoutEffect, useMemo, useRef} from 'react'

export function useMergeRefs<V>(...refs: Array<void | None | RefHandler<null | V>>): (element: null | V) => void {
    const onRef = useMemo(() => {
        return mergingRefs(...refs)
    }, refs)

    return onRef
}

export function mergingRefs<V>(...refs: Array<void | None | RefHandler<null | V>>): React.RefCallback<null | V> {
    function onRef(element: null | V) {
        for (const ref of refs) {
            if (! ref) {
                continue
            }

            setRef<null | V>(ref, element)
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
        ;(ref as Writable<typeof ref>).current = value
        return
    }
}

export function usePreviousValueRef<T>(value: T): React.MutableRefObject<undefined | T> {
    const oldValueRef = useRef<undefined | T>(undefined)

    useLayoutEffect(() => {
        function onClean() {
            oldValueRef.current = value
        }

        return onClean
    }, [value])

    return oldValueRef
}

// Types ///////////////////////////////////////////////////////////////////////

export type RefObject<V> = React.RefObject<V> | React.MutableRefObject<V>
export type RefHandler<V> = RefObject<V> | React.RefCallback<V> | React.ForwardedRef<V>

export interface RefProp<V> {
    onRef?: undefined | RefHandler<V>
}

export type RefValueOf<R extends None | React.Ref<any> | React.ForwardedRef<any>> =
    R extends React.MutableRefObject<infer V>
        ? V
    : R extends React.RefObject<infer V>
        ? V
    : R extends React.RefCallback<infer V>
        ? V
    : R extends None
        ? never
    : never

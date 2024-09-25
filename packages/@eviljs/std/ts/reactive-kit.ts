import {createReactiveComputed} from './reactive-compute.js'
import {createReactiveRef} from './reactive-ref.js'
import {createReactiveStore} from './reactive-store.js'
import {createReactive, readReactive, watchReactive, writeReactive} from './reactive.js'

export const ReactiveKit: ReactiveKitInterface = {
    create: createReactive,
    createRef: createReactiveRef,
    createStore: createReactiveStore,
    computed: createReactiveComputed,
    read: readReactive,
    write: writeReactive,
    watch: watchReactive,
}

// Types ///////////////////////////////////////////////////////////////////////

export interface ReactiveKitInterface {
    create: typeof createReactive
    createRef: typeof createReactiveRef
    createStore: typeof createReactiveStore
    computed: typeof createReactiveComputed
    read: typeof readReactive
    write: typeof writeReactive
    watch: typeof watchReactive
}

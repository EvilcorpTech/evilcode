import type {Task} from './fn-type.js'

// Types ///////////////////////////////////////////////////////////////////////


export interface ReactiveInternals<V> {
    __observers__: Set<ReactiveObserver<V>>
}

export interface ReactiveObservable<V> {
    watch(observer: ReactiveObserver<V>, options?: undefined | ReactiveWatchOptions): Task
}

export interface ReactiveOptions<V> {
    equals?: undefined | ReactiveComparator<V>
}

export interface ReactiveWatchOptions {
    immediate?: undefined | boolean
}

export interface ReactiveObserver<V> {
    (newValue: V, oldValue: V): void
}

export interface ReactiveComparator<V> {
    (oldValue: V, newValue: V): boolean
}

export interface ReactiveComputed {
    clean(): void
}

export const MonadTag = '#__kind__$' // We can't use a Symbol or Class, because it must be serializable.

// Types ///////////////////////////////////////////////////////////////////////

export interface Monad<T extends string | number> {
    [MonadTag]: T
}

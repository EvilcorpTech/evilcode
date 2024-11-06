// Types ///////////////////////////////////////////////////////////////////////

export type Props<P extends object> = Omit<P, 'key' | 'ref'>
export type VoidProps<P extends object> = Omit<P, 'children'>
export type ElementProps<T extends keyof React.JSX.IntrinsicElements> = React.JSX.IntrinsicElements[T]

// Types ///////////////////////////////////////////////////////////////////////

export type Props<P extends object> = Omit<P, 'key'>
export type VoidProps<P extends object> = Omit<P, 'children'>
export type ElementProps<T extends keyof React.JSX.IntrinsicElements> = React.JSX.IntrinsicElements[T]
    // & (
    //     React.JSX.IntrinsicElements[T] extends React.HTMLAttributes<infer E>
    //         ? React.RefAttributes<E>
    //         : never
    // )

export type RefElementOf<P extends React.RefAttributes<unknown>> =
    P extends React.RefAttributes<infer E>
        ? E
        : never

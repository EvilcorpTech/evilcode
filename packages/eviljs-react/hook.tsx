/*
* Can be used to provide the hook feature in Class Components or in conditional situations.
*
* EXAMPLE
*
* function MyComponent(props) {
*     if (! something) {
*         return null
*     }
*
*     return (
*         <HookProvider hook={useMyHook}>
*             {hookContext =>
*                 <Input
*                     value={hookContext.value}
*                     onChange={hookContext.onChange}
*                 />
*             }
*         </HookProvider>
*     )
* }
*/
export function HookProvider<V>(props: HookProviderProps<V>) {
    const {children, hook} = props

    const value = hook()

    return <>{children(value)}</>
}

// Types ///////////////////////////////////////////////////////////////////////

export interface HookProviderProps<V> {
    hook: () => V
    children: (value: V) => void | undefined | React.ReactNode
}

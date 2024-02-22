/*
* Can be used to provide the hook feature in Class Components or in conditional situations.
*
* EXAMPLE
*
* function MyComponent(props) {
*     if (! something) {
*         return
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
    const {children, use} = props

    const value = use()

    return children?.(value)
}

// Types ///////////////////////////////////////////////////////////////////////

export interface HookProviderProps<V> {
    children?: undefined | ((value: V) => React.ReactNode)
    use(): V
}

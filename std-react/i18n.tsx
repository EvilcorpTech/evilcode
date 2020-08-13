import {createContext, createElement, useContext, useMemo} from 'react'
import {I18n} from '@eviljs/std-lib/i18n'

export const I18nContext = createContext<I18n>(void undefined as any)

/*
* EXAMPLE
*
* const spec = {locale, fallbackLocale, messages}
* const i18n = createI18n(spec)
* const main = WithI18n(MyMain, i18n)
*
* render(<main/>, document.body)
*/
export function WithI18n(Child: React.ElementType, i18n: I18n) {
    function I18nProviderProxy(props: any) {
        return withI18n(<Child {...props}/>, i18n)
    }

    return I18nProviderProxy
}

/*
* EXAMPLE
*
* export function MyMain(props) {
*     const spec = {locale, fallbackLocale, messages}
*     const i18n = createI18n(spec)
*     const main = withI18n(<MyMain/>, i18n)
*
*     return <main/>
* }
*/
export function withI18n(children: React.ReactNode, i18n: I18n) {
    return (
        <I18nContext.Provider value={i18n}>
            {children}
        </I18nContext.Provider>
    )
}

/*
* EXAMPLE
*
* export function MyMain(props) {
*     const spec = {locale, fallbackLocale, messages}
*     const i18n = createI18n(spec)
*
*     return (
*         <I18nProvider i18n={i18n}>
*             <MyApp/>
*         </I18nProvider>
*     )
* }
*/
export function I18nProvider(props: I18nProviderProps) {
    return withI18n(props.children, props.i18n)
}

export function useI18n() {
    return useContext(I18nContext)
}

export function useI18nMsg<T>(compute: I18nMsgsComputer<T>, deps: Array<unknown> = []) {
    const i18n = useI18n()

    const i18nMsg = useMemo(() => {
        return {
            ...compute(i18n),
            $i18n: i18n,
        }
    }, [i18n, i18n.locale, i18n.fallbackLocale, ...deps])

    return i18nMsg
}

// Types ///////////////////////////////////////////////////////////////////////

export interface I18nProviderProps {
    children: React.ReactNode
    i18n: I18n
}

export interface I18nMsgsComputer<T> {
    (i18n: I18n): T
}

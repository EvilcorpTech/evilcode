import {createContext, createElement, useContext, useMemo} from 'react'
import {I18n} from '@eviljs/std-lib/i18n'

export const I18nContext = createContext<I18n>(void undefined as any)

export function useI18n() {
    return useContext(I18nContext)
}

export function useI18nMsg<T>(compute: I18nMsgsComputer<T>) {
    const i18n = useI18n()

    const i18nMsg = useMemo(() => {
        return {
            ...compute(i18n),
            $i18n: i18n,
        }
    }, [i18n, i18n.locale, i18n.fallbackLocale])

    return i18nMsg
}

export function withI18n(children: React.ReactNode, i18n: I18n) {
    return (
        <I18nContext.Provider value={i18n}>
            {children}
        </I18nContext.Provider>
    )
}

export function I18nProvider(props: I18nProviderProps) {
    return withI18n(props.children, props.i18n)
}

export function WithI18n(Child: React.ElementType, i18n: I18n) {
    function I18nProviderProxy(props: any) {
        return withI18n(<Child {...props}/>, i18n)
    }

    return I18nProviderProxy
}

// Types ///////////////////////////////////////////////////////////////////////

export interface I18nProviderProps {
    children: React.ReactNode
    i18n: I18n
}

export interface I18nMsgsComputer<T> {
    (i18n: I18n): T
}

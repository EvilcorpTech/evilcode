import {Animator, AnimatorTransition} from './site/animation.js'
import {createRouteMatches, exact, SwitchRoute, Arg as __arg__} from './router.js'
import {createI18n, I18n} from '@eviljs/std-lib/i18n.js'
import {ElementOf, ValueOf} from '@eviljs/std-lib/type.js'
import {PropsOf} from './react.js'
import {Router} from './site/router.js'
import {Transition} from './animation.js'
import {useI18n} from './i18n.js'
import React from 'react'
const {useMemo} = React

export {Animator, AnimatorProps} from './site/animation.js'
export {createRouteMatches, exact, SwitchRoute, withRouteMatches} from './router.js'
export {Router, RouterProps} from './site/router.js'

export const SiteRouteKey = 'path'
export const SiteAnimationKey = 'animation'
export const SiteWidgetKey = 'type'
export const SiteNestingKey = 'with'
export const SiteRouterType = 'Router'
export const SiteRoutePlaceholders = {id: __arg__}

export function useSite
    <
        RK extends string,
        AK extends string,
        WK extends string,
        NK extends string,
        RT extends string,
        W extends SiteWidgets
    >
    (
        specOptional:
            SiteSpec<
                NonNullable<RK> | SiteRouteKey,
                NonNullable<AK> | SiteAnimationKey,
                NonNullable<WK> | SiteWidgetKey,
                NonNullable<NK> | SiteNestingKey,
                NonNullable<RT> | SiteRouterType,
                W
            >
        ,
        routesModel?:
            SiteRoutesModel<
                NonNullable<RK> | SiteRouteKey,
                NonNullable<AK> | SiteAnimationKey,
                NonNullable<WK> | SiteWidgetKey,
                NonNullable<NK> | SiteNestingKey,
                W
            > | null
        ,
    )
{
    const i18n = useI18n()

    const site = useMemo(() => {
        if (! routesModel) {
            return []
        }

        const {translate} = i18n
        const spec = {translate, ...specOptional}
        const ctx = createSite(spec)
        const router = ctx.createRouter(routesModel)

        return [ctx, router] as const
    }, [i18n, specOptional, routesModel])

    return site
}

// Used only for TypeScript validation.
export function createSiteSpec
    <
        RK extends string,
        AK extends string,
        WK extends string,
        NK extends string,
        RT extends string,
        W extends SiteWidgets,
        S extends SiteSpec<RK, AK, WK, NK, RT, W>
    >
    (spec: S)
{
    return spec
}

export function createSite
    <
        RK extends string,
        AK extends string,
        WK extends string,
        NK extends string,
        RT extends string,
        W extends SiteWidgets
    >
    (spec: SiteSpec<
        NonNullable<RK> | SiteRouteKey,
        NonNullable<AK> | SiteAnimationKey,
        NonNullable<WK> | SiteWidgetKey,
        NonNullable<NK> | SiteNestingKey,
        NonNullable<RT> | SiteRouterType,
        W
    >)
{
    const routeKey = spec.routeKey ?? SiteRouteKey
    const animationKey = spec.animationKey ?? SiteAnimationKey
    const widgetKey = spec.widgetKey ?? SiteWidgetKey
    const nestingKey = spec.nestingKey ?? SiteNestingKey
    const routerType = spec.routerType ?? SiteRouterType
    const routerDefault = spec.routerDefault
    const routePlaceholders = spec.routePlaceholders ?? SiteRoutePlaceholders
    const defaultWidgets = {
        [routerType]: Router,
    } as unknown as SiteDefaultWidgets<
        NonNullable<RT> | SiteRouterType
    >
    const widgets = {...defaultWidgets, ...spec.widgets}
    const createRouter = spec.createRouter ?? createDefaultRouter
    const createAnimator = spec.createAnimator ?? createDefaultAnimator
    const createWidget = spec.createWidget ?? createDefaultWidget
    const createComponent = spec.createComponent ?? createDefaultComponent
    const translate = spec.translate ?? createDefaultTranslate()
    const self: Site<
        NonNullable<RK> | SiteRouteKey,
        NonNullable<AK> | SiteAnimationKey,
        NonNullable<WK> | SiteWidgetKey,
        NonNullable<NK> | SiteNestingKey,
        NonNullable<RT> | SiteRouterType,
        W
    > = {
        routeKey, // model.path is the route path to match.
        animationKey, // model.animation is the animator configuration.
        widgetKey,  // model.type is the widget id to create.
        nestingKey, // model.with are the children of the widget.
        routerType,
        routerDefault,
        routePlaceholders, // Token-RegExp search-replace for model.path (/book/@{id}).
        widgets,
        createRouter(
            routesModel:
                SiteRoutesModel<
                    NonNullable<RK> | SiteRouteKey,
                    NonNullable<AK> | SiteAnimationKey,
                    NonNullable<WK> | SiteWidgetKey,
                    NonNullable<NK> | SiteNestingKey,
                    W & SiteDefaultWidgets<RT>
            >,
        ) {
            return createRouter(self, routesModel)
        },
        createAnimator(
            animatorModel:
                SiteWidgetModel<
                    NonNullable<WK> | SiteWidgetKey,
                    NonNullable<NK> | SiteNestingKey,
                    W & SiteDefaultWidgets<RT>,
                    SiteAnimatorModel<AK>
                >
            ,
            key?: React.Key,
        ) {
            return createAnimator(self, animatorModel, key)
        },
        createWidget(
            widgetModel:
                SiteWidgetModel<
                    NonNullable<WK> | SiteWidgetKey,
                    NonNullable<NK> | SiteNestingKey,
                    W & SiteDefaultWidgets<RT>
                >
            ,
            key?: React.Key,
        ) {
            return createWidget(self, widgetModel, key)
        },
        createComponent(
            component: SiteComponent,
            widgetModel:
                SiteWidgetModel<
                    NonNullable<WK> | SiteWidgetKey,
                    NonNullable<NK> | SiteNestingKey,
                    W & SiteDefaultWidgets<RT>
                >
            ,
            key?: React.Key,
        ) {
            return createComponent(self, component, widgetModel, key)
        },
        translate,
    } as const

    return self
}

export function createDefaultRouter
    <
        RK extends string,
        AK extends string,
        WK extends string,
        NK extends string,
        RT extends string,
        W extends SiteWidgets
    >
    (ctx: Site<RK, AK, WK, NK, RT, W>, routesModel: SiteRoutesModel<RK, AK, WK, NK, W>)
{
    const {routeKey, translate, routePlaceholders, routerDefault} = ctx

    const routes = routesModel.map((routeModel, idx) => {
        const routePath = routeModel[routeKey]

        if (! routePath) {
            console.warn(
                '@eviljs/std-react/site.createRoutes(ctx, ~~routesModel~~):\n'
                + `routesModel does not have the route key '${routeKey}'.`
            )
            return null
        }

        const translatedPath = translate(routePath, routePlaceholders) // /en/book/@{id} to /it/libro/([^/]+)
        const is = exact(translatedPath)
        const then = createRouteMatches(ctx.createAnimator(routeModel, idx))

        return {is, then}
    })
    const validRoutes = routes.filter(Boolean) as Array<
        NonNullable<ElementOf<typeof routes>>
    >

    return (
        <SwitchRoute default={routerDefault}>
            {validRoutes}
        </SwitchRoute>
    )
}

export function createDefaultAnimator
     <
        RK extends string,
        AK extends string,
        WK extends string,
        NK extends string,
        RT extends string,
        W extends SiteWidgets,
    >
    (
        ctx: Site<RK, AK, WK, NK, RT, W>,
        widgetModel: SiteWidgetModel<WK, NK, W, SiteAnimatorModel<AK>>,
        key?: React.Key,
    )
{
    const {animationKey} = ctx
    const animatorModel = widgetModel[animationKey] as SiteAnimatorModel<AK>[AK]
    const widget = ctx.createWidget(widgetModel)
    const initial = animatorModel?.initial ?? true
    const transition = animatorModel?.transition

    return (
        <Transition initial={initial} enter={1} exit={1} source="animator-d352d9">
            <Animator key={key} className="animator-d352d9" transition={transition}>
                {widget}
            </Animator>
        </Transition>
    )
}

export function createDefaultWidget
    <
        RK extends string,
        AK extends string,
        WK extends string,
        NK extends string,
        RT extends string,
        W extends SiteWidgets
    >
    (
        ctx: Site<RK, AK, WK, NK, RT, W>,
        widgetModel: SiteWidgetModel<WK, NK, W>,
        key?: React.Key,
    )
{
    const {widgetKey} = ctx
    const widgetType = widgetModel[widgetKey]

    if (! widgetType) {
        console.warn(
            '@eviljs/std-react/site.createDefaultWidget(ctx, ~~widgetModel~~, key):\n'
            + `widgetModel does not have the type key '${widgetKey}'.`
        )
        return null
    }

    const Widget = ctx.widgets[widgetType]

    if (! Widget) {
        console.warn(
            '@eviljs/std-react/site.createDefaultWidget(~~ctx~~, ~~widgetModel~~, key):\n'
            + `ctx.widgets does not have a widget with type '${widgetType}'.`
        )
        return null
    }

    return ctx.createComponent(Widget, widgetModel, key)
}

export function createDefaultComponent
    <
        RK extends string,
        AK extends string,
        WK extends string,
        NK extends string,
        RT extends string,
        W extends SiteWidgets
    >
    (
        ctx: Site<RK, AK, WK, NK, RT, W>,
        Component: SiteComponent,
        widgetModel: SiteWidgetModel<WK, NK, W>,
        key?: React.Key,
    )
{
    const {nestingKey} = ctx
    const items = widgetModel[nestingKey] as undefined | Array<SiteWidgetModel<WK, NK, W>>
    const children = items?.map((it, idx) =>
        ctx.createWidget(it, idx)
    )
    const props = widgetProps(ctx, widgetModel)

    return <Component {...props} key={key} children={children}/>
}

export function createDefaultTranslate() {
    const i18n = createI18n({locale: 'en', fallbackLocale: 'en', messages: {}})
    return i18n.translate
}

export function widgetProps
    <
        RK extends string,
        AK extends string,
        WK extends string,
        NK extends string,
        RT extends string,
        W extends SiteWidgets
    >
    (
        ctx: Site<RK, AK, WK, NK, RT, W>,
        widgetModel: SiteWidgetModel<WK, NK, W>,
    )
{
    const props = {...widgetModel} as SiteWidgetModel<WK, NK, W, SiteRouteModel<RK>>
    delete props[ctx.routeKey]
    delete props[ctx.animationKey]
    delete props[ctx.widgetKey]
    delete props[ctx.nestingKey]
    return props
}

// Types ///////////////////////////////////////////////////////////////////////

export type SiteRouteKey = typeof SiteRouteKey
export type SiteWidgetKey = typeof SiteWidgetKey
export type SiteNestingKey = typeof SiteNestingKey
export type SiteAnimationKey = typeof SiteAnimationKey
export type SiteRouterType = typeof SiteRouterType

export interface Site
    <
        RK extends string,
        AK extends string,
        WK extends string,
        NK extends string,
        RT extends string,
        W extends SiteWidgets,
    >
{
    routeKey: RK
    animationKey: AK
    widgetKey: WK
    nestingKey: NK
    routerType: RT
    routePlaceholders: {[key: string]: string}
    routerDefault?: SiteComponent
    createRouter(
        routesModel: SiteRoutesModel<RK, AK, WK, NK, W>,
    ): SiteElement
    createAnimator(
        widgetModel: SiteWidgetModel<WK, NK, W, SiteAnimatorModel<AK>>,
        key?: React.Key,
    ): SiteElement
    createWidget(
        widgetModel: SiteWidgetModel<WK, NK, W>,
        key?: React.Key,
    ): SiteElement
    createComponent(
        Component: SiteComponent,
        widgetModel: SiteWidgetModel<WK, NK, W>,
        key?: React.Key
    ): SiteElement
    translate: I18n['translate']
    widgets: W & SiteDefaultWidgets<RT>
}

export interface SiteSpec
    <
        RK extends string,
        AK extends string,
        WK extends string,
        NK extends string,
        RT extends string,
        W extends SiteWidgets,
    >
    extends Omit<
        Partial<Site<RK, AK, WK, NK, RT, W>>,
        'widgets' | 'createRouter' | 'createAnimator' | 'createWidget' | 'createComponent'
    >
{
    widgets?: W
    createRouter?(
        ctx: Site<RK, AK, WK, NK, RT, W>,
        routesModel: SiteRoutesModel<RK, AK, WK, NK, W>,
    ): SiteElement
    createAnimator?(
        ctx: Site<RK, AK, WK, NK, RT, W>,
        widgetModel: SiteWidgetModel<WK, NK, W, SiteAnimatorModel<AK>>,
        key?: React.Key,
    ): SiteElement
    createWidget?(
        ctx: Site<RK, AK, WK, NK, RT, W>,
        widgetModel: SiteWidgetModel<WK, NK, W>,
        key?: React.Key,
    ): SiteElement
    createComponent?(
        ctx: Site<RK, AK, WK, NK, RT, W>,
        Component: SiteComponent,
        widgetModel: SiteWidgetModel<WK, NK, W>,
        key?: React.Key
    ): SiteElement
}

export type SiteWidgets = Record<string, SiteComponent>

export type SiteDefaultWidgets
    <
        RT extends string,
    >
    = {[key in RT]: typeof Router}

export type SiteRoutesModel
    <
        RK extends string,
        AK extends string,
        WK extends string,
        NK extends string,
        W extends SiteWidgets,
        P extends {} = {},
    >
    = Array<SiteWidgetModel<WK, NK, W, P & SiteRouteModel<RK> & SiteAnimatorModel<AK>>>

export type SiteRouteModel<RK extends string> = {
    [key in RK]: string
}
export type SiteAnimatorModel<AK extends string> = {
    [key in AK]?: {
        initial?: boolean
        transition?: AnimatorTransition
    }
}

export type SiteWidgetModel
    <
        WK extends string,
        NK extends string,
        W extends SiteWidgets,
        P = {},
    > =
    SiteWidgetModelOf<
        WK,
        W,
        P & SiteKeyModel & {[key in NK]?: Array<SiteWidgetModel<WK, NK, W>>} & {[key: string]: any}
    >
    // // Alternative implementation, without widgets' props typing.
    // & P
    // & SiteKeyModel
    // & {[key in WK]: keyof W} // widgetKey (model.type).
    // & {[key in NK]?: Array<SiteWidgetModel<WK, NK, W>>} // nestingKey (model.with).
    // & {[key: string]: any}

export interface SiteKeyModel {key?: React.Key}
export interface SiteWidgetChildrenProps {children?: any}

export type SiteWidgetModelOf
    <
        WK extends string,
        W extends SiteWidgets,
        P = {},
    >
    = ValueOf<{[w in keyof W]:
        & P
        & {[wk in WK]: w}
        & Omit<Partial<PropsOf<W[w]>>, 'children'>
    }>

export type SiteWidgetPropsOf<W extends SiteWidgets> =
    ValueOf<{
        [key in keyof W]: Partial<PropsOf<NonNullable<W[key]>>>
    }>

export type SiteComponent<P = any> = React.FunctionComponent<P> // React.ComponentType
export type SiteElement = JSX.Element | null

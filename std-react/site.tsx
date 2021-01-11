import {createI18n, I18n} from '@eviljs/std-lib/i18n.js'
import {ElementOf, isArray, isObject, ValueOf} from '@eviljs/std-lib/type.js'
import React from 'react'
import {Transition, TransitionMode} from './animation.js'
import {useI18n} from './i18n.js'
import {PropsOf} from './react.js'
import {createRouteMatches, exact, SwitchRoute, Arg} from './router.js'
import {TransitionAnimator, TransitionAnimatorEffect} from './widgets/animator.js'
import {RouteArgs} from './widgets/route-args.js'
const {useMemo} = React

export {createRouteMatches, exact, SwitchRoute, withRouteMatches} from './router.js'
export {TransitionAnimator} from './widgets/animator.js'
export {RouteArgs, RouteArgsProps} from './widgets/route-args.js'

export const SiteRouteKey = 'path'
export const SiteAnimationKey = 'animation'
export const SiteWidgetKey = 'is'
export const SiteNestingKey = 'with'
export const SiteRouterType = 'Router'
export const SiteRoutePlaceholders = {arg: Arg, id: Arg}

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
                W & SiteDefaultWidgets<RT>
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
        [routerType]: RouteArgs,
    } as SiteDefaultWidgets<NonNullable<RT> | SiteRouterType>
    const widgets = {...defaultWidgets, ...spec.widgets} as W & SiteDefaultWidgets<NonNullable<RT> | SiteRouterType>
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
        W & SiteDefaultWidgets<NonNullable<RT> | SiteRouterType>
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
                    W & SiteDefaultWidgets<NonNullable<RT> | SiteRouterType>
            >,
        ) {
            return createRouter(self, routesModel)
        },
        createAnimator(
            animatorModel:
                SiteWidgetModel<
                    NonNullable<WK> | SiteWidgetKey,
                    NonNullable<NK> | SiteNestingKey,
                    W & SiteDefaultWidgets<NonNullable<RT> | SiteRouterType>,
                    SiteAnimatorKeyModel<AK>
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
                    W & SiteDefaultWidgets<NonNullable<RT> | SiteRouterType>
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
                    W & SiteDefaultWidgets<NonNullable<RT> | SiteRouterType>
                >
            ,
            key?: React.Key,
        ) {
            return createComponent(self, component, widgetModel, key)
        },
        translate,
    }

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
                '@eviljs/std-react/site.createDefaultRouter(ctx, ~~routesModel~~):\n'
                + `routesModel does not have the route key '${routeKey}'.`
            )
            return null
        }

        // /en/book/@{id}
        // => /it/libro/@{id}
        // => /it/libro/([^/]+)
        const translatedPath = translate(routePath, routePlaceholders)
        const is = exact(translatedPath)
        const then = createRouteMatches(ctx.createAnimator(routeModel, idx))

        return {is, then}
    })
    const validRoutes = routes.filter(Boolean) as Array<NonNullable<ElementOf<typeof routes>>>

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
        widgetModel: SiteWidgetModel<WK, NK, W, SiteAnimatorKeyModel<AK>>,
        key?: React.Key,
    )
{
    const {animationKey} = ctx
    const animatorModel = widgetModel[animationKey] as undefined | SiteAnimatorKeyModel<AK>[AK]
    const widget = ctx.createWidget(widgetModel)
    const mode = animatorModel?.mode
    const initial = animatorModel?.initial ?? true
    const enter = animatorModel?.enter ?? 1
    const exit = animatorModel?.exit ?? 1
    const transition = animatorModel?.transition

    return (
        <Transition mode={mode} initial={initial} enter={enter} exit={exit} source="animator-d352d9">
            <TransitionAnimator key={key} className="animator-d352d9 layer" effect={transition}>
                {widget}
            </TransitionAnimator>
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

    const Widget = ctx.widgets[widgetType] as undefined | SiteComponent

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
    const items = widgetModel[nestingKey] as undefined | SiteNestingKeyModel<WK, NK, W>
    const children =
        isObject(items)
            ? ctx.createWidget(items)
        : isArray(items)
            ? items.map((it, idx) =>
                ctx.createWidget(it, idx)
            )
        : items
    const props = widgetProps(ctx, widgetModel)

    return (
        <Component
            children={children} // We allow to overwrite children.
            {...props}
            key={key} // But we can't allow to overwrite the key.
        />
    )
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
    const props = {...widgetModel} as SiteWidgetModel<WK, NK, W, SiteRouteKeyModel<RK>>
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
    routerDefault?: JSX.Element
    createRouter(
        routesModel: SiteRoutesModel<RK, AK, WK, NK, W>,
    ): SiteElement
    createAnimator(
        widgetModel: SiteWidgetModel<WK, NK, W, SiteAnimatorKeyModel<AK>>,
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
    widgets: W
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
    extends Omit<Partial<Site<RK, AK, WK, NK, RT, W>>,
        'createRouter' | 'createAnimator' | 'createWidget' | 'createComponent' | 'widgets'
    >
{
    createRouter?(
        ctx: Site<RK, AK, WK, NK, RT, W & SiteDefaultWidgets<RT>>,
        routesModel: SiteRoutesModel<RK, AK, WK, NK, W & SiteDefaultWidgets<RT>>,
    ): SiteElement
    createAnimator?(
        ctx: Site<RK, AK, WK, NK, RT, W & SiteDefaultWidgets<RT>>,
        widgetModel: SiteWidgetModel<WK, NK, W & SiteDefaultWidgets<RT>, SiteAnimatorKeyModel<AK>>,
        key?: React.Key,
    ): SiteElement
    createWidget?(
        ctx: Site<RK, AK, WK, NK, RT, W & SiteDefaultWidgets<RT>>,
        widgetModel: SiteWidgetModel<WK, NK, W & SiteDefaultWidgets<RT>>,
        key?: React.Key,
    ): SiteElement
    createComponent?(
        ctx: Site<RK, AK, WK, NK, RT, W & SiteDefaultWidgets<RT>>,
        Component: SiteComponent,
        widgetModel: SiteWidgetModel<WK, NK, W & SiteDefaultWidgets<RT>>,
        key?: React.Key
    ): SiteElement
    widgets?: W
}

export interface SiteWidgets {
    [key: string]: SiteComponent
}

export type SiteDefaultWidgets
    <
        RT extends string,
    >
    = {[key in RT]: typeof RouteArgs}

export type SiteRoutesModel
    <
        RK extends string,
        AK extends string,
        WK extends string,
        NK extends string,
        W extends SiteWidgets,
        P extends {} = {},
    >
    = Array<SiteRouteModel<RK, AK, WK, NK, W, P>>

export type SiteRouteModel
    <
        RK extends string,
        AK extends string,
        WK extends string,
        NK extends string,
        W extends SiteWidgets,
        P extends {} = {},
    >
    = SiteWidgetModel<WK, NK, W, P & SiteRouteKeyModel<RK> & SiteAnimatorKeyModel<AK>>

export type SiteWidgetModel
    <
        WK extends string,
        NK extends string,
        W extends SiteWidgets,
        P = {},
    >
    =
    // Implementation without widgets' props typing.
    & P
    & SiteKeyKeyModel
    & {[key in WK]: keyof W} // widgetKey (model.type).
    & {[key in NK]?: SiteNestingKeyModel<WK, NK, W>} // nestingKey (model.with).
    & {[key: string]: any}
    // =
    // // Implementation with widgets' props typing.
    // SiteWidgetModelOf<
    //     WK,
    //     W,
    //     & P
    //     & SiteKeyKeyModel
    //     & {[key in NK]?: SiteNestingKeyModel<WK, NK, W>}
    //     & {[key: string]: any}
    // >

export type SiteRouteKeyModel<RK extends string> = {
    [key in RK]: string
}

export type SiteAnimatorKeyModel<AK extends string> = {
    [key in AK]?: {
        mode?: TransitionMode
        initial?: boolean
        enter?: number
        exit?: number
        transition?: TransitionAnimatorEffect
    }
}

export type SiteNestingKeyModel
    <
        WK extends string,
        NK extends string,
        W extends SiteWidgets,
    >
    =
    | string
    | SiteWidgetModel<WK, NK, W>
    | Array<SiteWidgetModel<WK, NK, W>>

export interface SiteKeyKeyModel {key?: React.Key}
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
        & Partial<PropsOf<W[w]>>
    }>

export type SiteWidgetPropsOf<W extends SiteWidgets> =
    ValueOf<{
        [key in keyof W]: Partial<PropsOf<NonNullable<W[key]>>>
    }>

export type SiteComponent<P = any> = React.FunctionComponent<P> // React.ComponentType
export type SiteElement = JSX.Element | null

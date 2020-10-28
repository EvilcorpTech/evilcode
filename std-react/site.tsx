import {Animator} from './site/animation.js'
import {createI18n, I18n} from '@eviljs/std-lib/i18n.js'
import {createRouteMatches, exact, Arg as __arg__} from './router.js'
import {ElementOf, ValueOf} from '@eviljs/std-lib/type.js'
import {PropsOf} from './react.js'
import {Router} from './site/router.js'
import {Transition} from './animation.js'
import {useI18n} from './i18n.js'
import React from 'react'
const {useMemo} = React

export {Animator, AnimatorProps} from './site/animation.js'
export {createRouteMatches, withRouteMatches} from './router.js'
export {Router, RouterProps} from './site/router.js'

export const SiteRouteKey = 'path'
export const SiteWidgetKey = 'type'
export const SiteNestingKey = 'with'
export const SiteAnimatorType = 'Animator'
export const SiteRouterType = 'Router'
export const SiteRoutePlaceholders = {id: __arg__}

export function useSite
    <
        RK extends string,
        WK extends string,
        NK extends string,
        AT extends string,
        RT extends string,
        W extends SiteWidgets
    >
    (specOptional: SiteSpec<
        NonNullable<RK> | SiteRouteKey,
        NonNullable<WK> | SiteWidgetKey,
        NonNullable<NK> | SiteNestingKey,
        NonNullable<AT> | SiteAnimatorType,
        NonNullable<RT> | SiteRouterType,
        W
    >)
{
    const i18n = useI18n()

    const site = useMemo(() => {
        const {translate} = i18n
        const spec = {translate, ...specOptional}

        const ctx = createSite(spec)
        const routes = createRoutes(ctx, ctx.routes)

        function create(
            widgetModel:
                SiteWidgetModel<
                    NonNullable<WK> | SiteWidgetKey,
                    NonNullable<NK> | SiteNestingKey,
                    W & SiteDefaultWidgets<AT, RT>
                >
            ,
            key?: React.Key,
        ) {
            return createWidget(ctx, widgetModel, key)
        }

        return {ctx, create, routes}
    }, [specOptional, i18n])

    return site
}

// Used only for TypeScript validation.
export function createSiteSpec
    <
        RK extends string,
        WK extends string,
        NK extends string,
        AT extends string,
        RT extends string,
        W extends SiteWidgets,
        S extends SiteSpec<RK, WK, NK, AT, RT, W>
    >
    (spec: S)
{
    return spec
}

export function asSwitchRoutes(routes: ReturnType<typeof createRoutes>) {
    const switchRoutes = routes.map((it, idx) => ({
        is: it.path, then: it.children,
    }))

    return switchRoutes
}

export function createSite
    <
        RK extends string,
        WK extends string,
        NK extends string,
        AT extends string,
        RT extends string,
        W extends SiteWidgets
    >
    (spec: SiteSpec<
        NonNullable<RK> | SiteRouteKey,
        NonNullable<WK> | SiteWidgetKey,
        NonNullable<NK> | SiteNestingKey,
        NonNullable<AT> | SiteAnimatorType,
        NonNullable<RT> | SiteRouterType,
        W
    >)
{
    const routeKey = spec.routeKey ?? SiteRouteKey
    const widgetKey = spec.widgetKey ?? SiteWidgetKey
    const nestingKey = spec.nestingKey ?? SiteNestingKey
    const animatorType = spec.animatorType ?? SiteAnimatorType
    const routerType = spec.routerType ?? SiteRouterType
    const routes = (spec.routes ?? []) as SiteRoutesModel<
        NonNullable<RK> | SiteRouteKey,
        NonNullable<WK> | SiteWidgetKey,
        NonNullable<NK> | SiteNestingKey,
        W
    >
    const routePlaceholders = spec.routePlaceholders ?? SiteRoutePlaceholders
    const create = spec.create ?? createWidgetComponent
    const translate = spec.translate ?? createDefaultTranslate()
    const defaultWidgets = {
        [animatorType]: Animator,
        [routerType]: Router,
    } as unknown as SiteDefaultWidgets<
        NonNullable<AT> | SiteAnimatorType,
        NonNullable<RT> | SiteRouterType
    >
    const widgets = {...defaultWidgets, ...spec.widgets}
    const self: Site<
        NonNullable<RK> | SiteRouteKey,
        NonNullable<WK> | SiteWidgetKey,
        NonNullable<NK> | SiteNestingKey,
        NonNullable<AT> | SiteAnimatorType,
        NonNullable<RT> | SiteRouterType,
        W
    > = {
        routeKey, // model.path is the route path to match.
        widgetKey,  // model.type is the widget id to create.
        nestingKey, // model.with are the children of the widget.
        routerType,
        animatorType,
        routePlaceholders, // Token-RegExp search-replace for model.path (/book/@{id}).
        create(
            component: SiteComponent,
            widgetModel:
                SiteWidgetModel<
                    NonNullable<WK> | SiteWidgetKey,
                    NonNullable<NK> | SiteNestingKey,
                    W & SiteDefaultWidgets<AT, RT>
                >
            ,
            key?: React.Key,
        ) {
            return create(self, component, widgetModel, key)
        },
        translate,
        widgets,
        routes,
    } as const

    return self
}

export function createDefaultTranslate() {
    const i18n = createI18n({locale: 'en', fallbackLocale: 'en', messages: {}})
    return i18n.translate
}

export function createRouteRoot(children: React.ReactNode, initial?: boolean) {
    return createRouteMatches(
        <Transition initial={initial ?? false} enter={1} exit={1} source="animator-c385f2">
            {children}
        </Transition>
    )
}

export function createRoutes
    <
        RK extends string,
        WK extends string,
        NK extends string,
        AT extends string,
        RT extends string,
        W extends SiteWidgets
    >
    (ctx: Site<RK, WK, NK, AT, RT, W>, routesModel: SiteRoutesModel<RK, WK, NK, W>)
{
    const {routeKey, translate, routePlaceholders} = ctx

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
        const exactPath = exact(translatedPath)
        const children = createRouteRoot(
            createWidget(ctx, routeModel, idx),
            routeModel.initial,
        )

        return {path: exactPath, children}
    })
    const validRoutes = routes.filter(Boolean) as Array<
        NonNullable<ElementOf<typeof routes>>
    >

    return validRoutes
}

export function createWidget
    <
        RK extends string,
        WK extends string,
        NK extends string,
        AT extends string,
        RT extends string,
        W extends SiteWidgets
    >
    (
        ctx: Site<RK, WK, NK, AT, RT, W>,
        widgetModel: SiteWidgetModel<WK, NK, W>,
        key?: React.Key,
    )
{
    const {widgetKey} = ctx
    const widgetType = widgetModel[widgetKey]

    if (! widgetType) {
        console.warn(
            '@eviljs/std-react/site.createWidget(ctx, ~~widgetModel~~, key):\n'
            + `widgetModel does not have the type key '${widgetKey}'.`
        )
        return null
    }

    const Widget = ctx.widgets[widgetType]

    if (! Widget) {
        console.warn(
            '@eviljs/std-react/site.createWidget(~~ctx~~, ~~widgetModel~~, key):\n'
            + `ctx.widgets does not have a widget with type '${widgetType}'.`
        )
        return null
    }

    return ctx.create(Widget, widgetModel, key)
}

export function createWidgetComponent
    <
        RK extends string,
        WK extends string,
        NK extends string,
        AT extends string,
        RT extends string,
        W extends SiteWidgets
    >
    (
        ctx: Site<RK, WK, NK, AT, RT, W>,
        Component: React.FunctionComponent,
        widgetModel: SiteWidgetModel<WK, NK, W>,
        key?: React.Key,
    )
{
    const {nestingKey} = ctx
    const items = widgetModel[nestingKey] as undefined | Array<SiteWidgetModel<WK, NK, W>>
    const children = items?.map((it, idx) =>
        createWidget(ctx, it, idx)
    )
    const props = widgetProps(ctx, widgetModel)

    return <Component {...{key, ...props}} children={children}/>
}

export function widgetProps
    <
        RK extends string,
        WK extends string,
        NK extends string,
        AT extends string,
        RT extends string,
        W extends SiteWidgets
    >
    (
        ctx: Site<RK, WK, NK, AT, RT, W>,
        widgetModel: SiteWidgetModel<WK, NK, W>,
    )
{
    const props = {...widgetModel} as SiteWidgetModel<WK, NK, W, SiteRouteModel<RK>>
    delete props[ctx.routeKey]
    delete props[ctx.widgetKey]
    delete props[ctx.nestingKey]
    return props
}

// Types ///////////////////////////////////////////////////////////////////////

export type SiteRouteKey = typeof SiteRouteKey
export type SiteWidgetKey = typeof SiteWidgetKey
export type SiteNestingKey = typeof SiteNestingKey
export type SiteAnimatorType = typeof SiteAnimatorType
export type SiteRouterType = typeof SiteRouterType

export interface Site
    <
        RK extends string,
        WK extends string,
        NK extends string,
        AT extends string,
        RT extends string,
        W extends SiteWidgets,
    >
{
    routeKey: RK
    widgetKey: WK
    nestingKey: NK
    animatorType: AT
    routerType: RT
    routePlaceholders: {[key: string]: string}
    create(
        Component: SiteComponent,
        widgetModel: SiteWidgetModel<WK, NK, W>,
        key?: React.Key
    ): SiteElement
    translate: I18n['translate']
    widgets: W & SiteDefaultWidgets<AT, RT>
    routes: SiteRoutesModel<RK, WK, NK, W>
}

export interface SiteSpec
    <
        RK extends string,
        WK extends string,
        NK extends string,
        AT extends string,
        RT extends string,
        W extends SiteWidgets,
    >
    extends Partial<Omit<Site<RK, WK, NK, AT, RT, W>, 'widgets' | 'routes' | 'create'>>
{
    widgets?: W
    routes?: SiteRoutesModel<RK, WK, NK, W & SiteDefaultWidgets<AT, RT>>
    create?(
        ctx: Site<RK, WK, NK, AT, RT, W>,
        Component: SiteComponent,
        widgetModel: SiteWidgetModel<WK, NK, W>,
        key?: React.Key
    ): SiteElement
}

export type SiteWidgets = Record<string, SiteComponent>

export type SiteDefaultWidgets
    <
        AT extends string,
        RT extends string,
    >
=   & {[key in AT]: typeof Animator}
    & {[key in RT]: typeof Router}

export type SiteRoutesModel
    <
        RK extends string,
        WK extends string,
        NK extends string,
        W extends SiteWidgets,
        P extends {} = {},
    >
    = Array<SiteWidgetModel<WK, NK, W, P & SiteRouteModel<RK>>>

export type SiteRouteModel<K extends string> = {[key in K]: string}

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
        [key in keyof W]: Partial<PropsOf<W[key]>>
    }>

export type SiteComponent<P = any> = React.FunctionComponent<P> // React.ComponentType
export type SiteElement = JSX.Element | null

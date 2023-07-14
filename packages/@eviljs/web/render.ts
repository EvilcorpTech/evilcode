import type {Io} from '@eviljs/std/fn.js'
import type {Ref} from '@eviljs/std/ref.js'
import {asArray, isArray, isBoolean, isNil, isNull, isNumber, isString, isUndefined} from '@eviljs/std/type.js'
import {classes, type Classes} from './classes.js'

export {createRef} from '@eviljs/std/ref.js'
export type {Ref} from '@eviljs/std/ref.js'

export function createElement<E extends RenderElement>(
    tag: string,
    props?: undefined | RenderProps<E> | RenderCustomProps,
    setup?: undefined | Io<E, void>
): E {
    const element = document.createElement(tag) as unknown as E
    return updateElement(element, props, setup)
}

export function updateElement<E extends RenderElement>(
    element: E,
    props?: undefined | RenderProps<E> | RenderCustomProps,
    setup?: undefined | Io<E, void>
): E
export function updateElement<E extends RenderElement>(
    element: undefined | E,
    props?: undefined | RenderProps<E> | RenderCustomProps,
    setup?: undefined | Io<E, void>
): undefined | E
export function updateElement<E extends RenderElement>(
    element: undefined | E,
    props?: undefined | RenderProps<E> | RenderCustomProps,
    setup?: undefined | Io<E, void>
): undefined | E {
    if (! element) {
        return
    }

    const {on: events, ...otherProps} = (props ?? {}) as RenderProps<E>

    for (const property in otherProps) {
        type Property = keyof typeof otherProps
        type Strategy = (element: RenderElement, property: string, value: unknown) => void

        const value = otherProps[property as Property] as unknown

        if (value === undefined) {
            continue
        }
        if (value === null) {
            element.removeAttribute(property)
            continue
        }

        const strategyOptional = RenderUpdateProperties[property as Property] as (undefined | Strategy)
        const strategy = (strategyOptional ?? setAttributeString) as Strategy
        strategy(element, property, value)
    }

    if (events) {
        for (const event in events) {
            const handler = events[event]

            if (! handler) {
                continue
            }

            attachEvent(element, event, handler as RenderEventHandler<any>)
        }
    }

    // Custom Builder //////////////////////////////////////////////////////////
    setup?.(element)

    return element
}

export function updateEvent<E extends RenderEventName>(
    element: RenderElement,
    event: E,
    handler: null | RenderEventHandler<HTMLElementEventMap[E]>,
): void
export function updateEvent(
    element: RenderElement,
    event: string,
    handler: null | RenderEventHandler<any>,
): void
export function updateEvent(
    element: RenderElement,
    event: string,
    handler: null | RenderEventHandler<any>,
): void {
    const elementRoot = element as RenderRoot<RenderElement>
    const handlerAttached = elementRoot.__listeners__?.[event]

    if (handlerAttached) {
        const [callback, capturing] = handlerAttached
        elementRoot.removeEventListener(event, callback as EventListener, capturing)
    }

    if (! handler) {
        return
    }

    const [callback, options] = asRenderEventListener(handler)
    elementRoot.addEventListener(event, callback as unknown as EventListener, options)
    elementRoot.__listeners__ ??= {}
    elementRoot.__listeners__[event] = [callback, options?.capture ?? false]
}

export function bubble<E>(args: RenderEventHandler<E>): RenderEventHandlerTuple<E> {
    const [handler, options] = asRenderEventListener(args)
    return [handler, {...options, capture: false}]
}

export function capture<E>(args: RenderEventHandler<E>): RenderEventHandlerTuple<E> {
    const [handler, options] = asRenderEventListener(args)
    return [handler, {...options, capture: true}]
}

export function passive<E>(args: RenderEventHandler<E>): RenderEventHandlerTuple<E> {
    const [handler, options] = asRenderEventListener(args)
    return [handler, {...options, passive: true}]
}

export function asRenderEventListener<E>(args: RenderEventHandler<E>): RenderEventHandlerTuple<E> {
    return asArray(args) as RenderEventHandlerTuple<E>
}

export function setAttributeString(element: RenderElement, property: string, value: number | string) {
    element.setAttribute(property, String(value))
}

export function setDataset(element: RenderElement, dataset: HTMLElement['dataset']) {
    for (const key in dataset) {
        element.dataset[key] = dataset[key]
    }
}

export function setClass(element: RenderElement, value: Classes) {
    setAttributeString(element, 'class', classes(value))
}

export function setChildren(element: RenderElement, children: RenderChildren) {
    if (isUndefined(children)) {
        return
    }
    if (isNull(children)) {
        removeChildren(element)
        return
    }
    if (isString(children) || isNumber(children)) {
        element.appendChild(document.createTextNode(String(children)))
        return
    }
    if (children instanceof Node) {
        element.appendChild(children)
        return
    }
    if (isArray(children)) {
        removeChildren(element)

        children.forEach(child => {
            if (isNil(child) || isBoolean(child)) {
                return
            }
            if (isString(child) || isNumber(child)) {
                element.appendChild(document.createTextNode(String(child)))
                return
            }
            if (child instanceof Node) {
                element.appendChild(child)
                return
            }
        })
    }
}

export function setRef(element: RenderElement, ref: Ref<undefined | RenderElement>) {
    ref.value = element
}

export function toggleAttribute(element: RenderElement, property: string, value?: undefined | boolean) {
    element.toggleAttribute(property, value)
}

export function attachEvent(element: RenderElement, event: string, handler: RenderEventHandler<any>) {
    updateEvent(element, event, handler)
}

export function removeChildren(element: RenderElement) {
    while (element.lastChild) {
        element.lastChild.remove()
    }
}

export const RenderUpdateProperties: {
    [K in keyof (RenderAttributesProps & RenderRefProps<RenderElement>)]: (
        element: RenderElement,
        property: K,
        value: NonNullable<(RenderAttributesProps & RenderRefProps<RenderElement>)[K]>,
    ) => void
} = {
    autofocus: toggleAttribute,
    children: (element, property, value) => setChildren(element, value),
    class: (element, property, value) => setClass(element, value),
    dataset: (element, property, value) => setDataset(element, value),
    hidden: toggleAttribute,
    id: setAttributeString,
    ref: (element, property, value) => setRef(element, value),
    style: setAttributeString,
    tabIndex: setAttributeString,
}

createElement('div', {
    hidden: true,
    prova: 'string',
})

// Types ///////////////////////////////////////////////////////////////////////

export type RenderRoot<E extends RenderElement> = E & {
    __listeners__?: {
        [key in string]?: undefined | [Function, boolean]
    }
}

export type RenderProps<E extends Node> =
    & RenderAttributesProps
    & RenderEventsProps
    & RenderRefProps<E>

export type RenderCustomProps = Partial<Record<string, undefined | null | string>>

export interface RenderAttributesProps {
    autofocus?: undefined | null | HTMLElement['autofocus']
    children?: RenderChildren
    class?: undefined | null | HTMLElement['className'] | Classes
    dataset?: undefined | null | HTMLElement['dataset']
    hidden?: undefined | null | HTMLElement['hidden']
    id?: undefined | null | HTMLElement['id']
    style?: undefined | null | string
    tabIndex?: undefined | null | HTMLElement['tabIndex']
}

export type RenderEventsProps = {
    on?: undefined | (
        & {[key in keyof HTMLElementEventMap]?: undefined | RenderEventHandler<HTMLElementEventMap[key]>}
        & {[key in string]?: undefined | RenderEventHandler<any>}
    )
}

export interface RenderRefProps<E extends Node> {
    ref?: undefined | Ref<undefined | E>
}

export type RenderElement = HTMLElement | SVGElement
export type RenderChild = undefined | null | boolean | number | string | Node
export type RenderChildren = RenderChild | Array<RenderChild>
export type RenderEventName = keyof HTMLElementEventMap

export type RenderEventHandler<E> = RenderEventHandlerFunction<E> | RenderEventHandlerTuple<E>
export type RenderEventHandlerFunction<E> = Io<E, void>
export type RenderEventHandlerTuple<E> =
    | [RenderEventHandlerFunction<E>]
    | [RenderEventHandlerFunction<E>, undefined | AddEventListenerOptions]

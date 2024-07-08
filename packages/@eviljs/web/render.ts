import type {Io} from '@eviljs/std/fn-type.js'
import type {Ref} from '@eviljs/std/ref.js'
import {asArray} from '@eviljs/std/type-as.js'
import {isArray, isBoolean, isNone, isNull, isNumber, isString, isUndefined} from '@eviljs/std/type-is.js'
import type {StringAutocompleted} from '@eviljs/std/type.js'
import {classes, type Classes} from './classes.js'
import {removeChildren} from './dom.js'

export {createRef} from '@eviljs/std/ref.js'
export type {Ref} from '@eviljs/std/ref.js'

export function createElement<E extends RenderElement>(
    tag: string,
    props?: undefined | RenderProps<E>,
    build?: undefined | Io<E, void>
): E {
    const element = document.createElement(tag) as unknown as E
    return updateElement(element, props, build)
}

export function buildElement<E extends RenderElement>(
    tag: string,
    build?: undefined | Io<E, void>,
): E {
    return createElement(tag, undefined, build)
}

export function updateElement<E extends RenderElement>(
    element: E,
    props?: undefined | RenderProps<E>,
    build?: undefined | Io<E, void>
): E
export function updateElement<E extends RenderElement>(
    element: undefined | E,
    props?: undefined | RenderProps<E>,
    setup?: undefined | Io<E, void>
): undefined | E
export function updateElement<E extends RenderElement>(
    element: undefined | E,
    props?: undefined | RenderProps<E>,
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

        if (isUndefined(value)) {
            continue
        }
        if (isNull(value)) {
            element.removeAttribute(property)
            continue
        }

        const strategyOptional = RenderUpdateProperties[property as keyof typeof RenderUpdateProperties] as (undefined | Strategy)
        const strategy = (strategyOptional ?? setAttribute) as Strategy
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

export function setAttribute(element: RenderElement, property: string, value: boolean | number | string): void {
    element.setAttribute(property, String(value))
}

export function setDataset(element: RenderElement, dataset: RenderDatasetAttribute): void {
    for (const key in dataset) {
        const value = dataset[key]

        if (isUndefined(value)) {
            continue
        }
        if (isNull(value)) {
            delete element.dataset[key]
            continue
        }

        element.dataset[key] = String(value)
    }
}

export function setClass(element: RenderElement, value: Classes): void {
    setAttribute(element, 'class', classes(value))
}

export function setChildren(element: RenderElement, children: RenderChildren): void {
    if (isUndefined(children)) {
        return
    }
    if (isNull(children)) {
        removeChildren(element)
        return
    }
    if (isString(children) || isNumber(children)) {
        element.replaceChildren(document.createTextNode(String(children)))
        return
    }
    if (children instanceof Node) {
        element.replaceChildren(children)
        return
    }
    if (isArray(children)) {
        removeChildren(element)

        children.forEach(child => {
            if (isNone(child) || isBoolean(child)) {
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

export function setRef(element: RenderElement, ref: Ref<undefined | RenderElement>): void {
    ref.value = element
}

export function toggleAttribute(element: RenderElement, property: string, value?: undefined | boolean): void {
    element.toggleAttribute(property, value)
}

export function attachEvent(element: RenderElement, event: string, handler: RenderEventHandler<any>): void {
    updateEvent(element, event, handler)
}

export const RenderUpdateProperties = {
    children: (element: RenderElement, property: string, value: RenderChildren): void => setChildren(element, value),
    class: (element: RenderElement, property: string, value: Classes): void => setClass(element, value),
    dataset: (element: RenderElement, property: string, value: RenderDatasetAttribute): void => setDataset(element, value),
    ref: (element: RenderElement, property: string, value: Ref<undefined | RenderElement>): void => setRef(element, value),
}

// Types ///////////////////////////////////////////////////////////////////////

export type RenderRoot<E extends RenderElement> = E & {
    __listeners__?: {
        [key in string]?: undefined | [Function, boolean]
    }
}

export type RenderProps<E extends Node> =
    & RenderExtendedProps
    & RenderRefProps<E>
    & RenderEventsProps
    & AllAriaAttrs
    & AllElementAttrs
    & AllCustomAttrs

export interface RenderExtendedProps {
    children?: undefined | null | RenderChildren
    class?: undefined | null | HTMLElement['className'] | Classes
    dataset?: undefined | null | RenderDatasetAttribute
}

export interface RenderRefProps<E> {
    ref?: undefined | null | Ref<undefined | E>
}

export type AllCustomAttrs = {
    [key in string]?: undefined | null | boolean | number | string | unknown
}

export type RenderEventsProps = {
    on?: undefined | RenderEvents
}

export type RenderElement = HTMLElement | SVGElement
export type RenderChild = undefined | null | boolean | number | string | Node
export type RenderChildren = RenderChild | Array<RenderChild>
export type RenderEventName = keyof HTMLElementEventMap

export type RenderEvents = RenderEventsHtml & RenderEventsCustom
export type RenderEventsHtml = {[key in keyof HTMLElementEventMap]?: undefined | RenderEventHandler<HTMLElementEventMap[key]>}
export type RenderEventsCustom = {[key in string]?: undefined | RenderEventHandler<any>}

export type RenderEventHandler<E> = RenderEventHandlerFunction<E> | RenderEventHandlerTuple<E>
export type RenderEventHandlerFunction<E> = Io<E, void>
export type RenderEventHandlerTuple<E> =
    | [RenderEventHandlerFunction<E>]
    | [RenderEventHandlerFunction<E>, undefined | AddEventListenerOptions]

export type RenderDatasetAttribute = Record<string, undefined | null | boolean | number | string>

export type RenderOptionalPropsOf<E extends object> = {
    [key in keyof E]?: undefined | null | E[key]
}

export type OnlyPropsOf<T extends object> = {
    [key in keyof T]: T[key] extends boolean | number | string
        ? T[key]
        : never
}

export interface AllElementAttrs {
    // Commonly used attributes for HTML/SVG/MathML elements.
    // HTML ////////////////////////////////////////////////////////////////////
    'action'?: undefined | null | string
    'alt'?: undefined | null | string
    'as'?: undefined | null | string
    'async'?: undefined | null | boolean
    'autocapitalize'?: undefined | null | 'off' | 'none' | 'sentences' | 'words' | 'characters'
    'autocomplete'?: undefined | null | string
    'autocorrect'?: undefined | null | 'on' | 'off'
    'autofocus'?: undefined | null | boolean
    'autoplay'?: undefined | null | boolean
    'checked'?: undefined | null | boolean
    'cols'?: undefined | null | number
    'colspan'?: undefined | null | number
    'content'?: undefined | null | string
    'contenteditable'?: undefined | null | boolean | '' | 'true' | 'false' | 'inherit'
    'contextmenu'?: undefined | null | string
    'controls'?: undefined | null | boolean
    'crossorigin'?: undefined | null | '' | 'anonymous' | 'use-credentials'
    'data'?: undefined | null | string
    'datatype'?: undefined | null | string
    'datetime'?: undefined | null | string
    'default'?: undefined | null | boolean
    'defer'?: undefined | null | boolean
    'dir'?: undefined | null | string
    'disabled'?: undefined | null | boolean
    'download'?: undefined | null | string
    'draggable'?: undefined | null | '' | 'true' | 'false'
    'enctype'?: undefined | null | AllElementAttrs['formenctype']
    'for'?: undefined | null | string
    'formaction'?: undefined | null | string
    'formenctype'?: undefined | null | 'application/x-www-form-urlencoded' | 'multipart/form-data' | 'text/plain' | StringAutocompleted
    'formmethod'?: undefined | null | 'POST' | 'GET' | StringAutocompleted
    'formnovalidate'?: undefined | null | boolean
    'formtarget'?: undefined | null | '_blank' | '_self' | '_parent' | '_top' | StringAutocompleted
    'formtype'?: undefined | null | string
    'frameborder'?: undefined | null | number | string
    'hidden'?: undefined | null | boolean
    'high'?: undefined | null | number
    'href'?: undefined | null | string
    'hreflang'?: undefined | null | string
    'http-equiv'?: undefined | null | string
    'id'?: undefined | null | string
    'inputmode'?: undefined | null | 'none' | 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search'
    'integrity'?: undefined | null | string
    'is'?: undefined | null | string
    'itemid'?: undefined | null | string
    'itemprop'?: undefined | null | string
    'itemref'?: undefined | null | string
    'itemscope'?: undefined | null | boolean
    'itemtype'?: undefined | null | string
    'kind'?: undefined | null | string
    'label'?: undefined | null | string
    'lang'?: undefined | null | string
    'list'?: undefined | null | string
    'loop'?: undefined | null | boolean
    'low'?: undefined | null | number
    'manifest'?: undefined | null | string
    'marginheight'?: undefined | null | number
    'marginwidth'?: undefined | null | number
    'max'?: undefined | null | number | string
    'maxlength'?: undefined | null | number
    'media'?: undefined | null | string
    'method'?: undefined | null | AllElementAttrs['formmethod']
    'min'?: undefined | null | number | string
    'minlength'?: undefined | null | number
    'multiple'?: undefined | null | boolean
    'muted'?: undefined | null | boolean
    'name'?: undefined | null | string
    'nonce'?: undefined | null | string
    'novalidate'?: undefined | null | boolean
    'open'?: undefined | null | boolean
    'optimum'?: undefined | null | number
    'pattern'?: undefined | null | string
    'placeholder'?: undefined | null | string
    'playsinline'?: undefined | null | boolean
    'poster'?: undefined | null | string
    'prefix'?: undefined | null | string
    'preload'?: undefined | null | string
    'property'?: undefined | null | string
    'radiogroup'?: undefined | null | string
    'readonly'?: undefined | null | boolean
    'rel'?: undefined | null | string
    'required'?: undefined | null | boolean
    'resource'?: undefined | null | string
    'results'?: undefined | null | number
    'rev'?: undefined | null | string
    'reversed'?: undefined | null | boolean
    'rows'?: undefined | null | number
    'rowspan'?: undefined | null | number
    'sandbox'?: undefined | null | string
    'security'?: undefined | null | string
    'selected'?: undefined | null | boolean
    'size'?: undefined | null | number
    'sizes'?: undefined | null | string
    'slot'?: undefined | null | string
    'span'?: undefined | null | number
    'spellcheck'?: undefined | null | '' | 'true' | 'false'
    'src'?: undefined | null | string
    'srcset'?: undefined | null | string
    'start'?: undefined | null | number
    'step'?: undefined | null | number | string
    'tabindex'?: undefined | null | number
    'target'?: undefined | null | AllElementAttrs['formtarget']
    'title'?: undefined | null | string
    'type'?: undefined | null | string
    'value'?: undefined | null | number | string
    // SVG /////////////////////////////////////////////////////////////////////
    'alignment-baseline'?: undefined | null | 'auto' | 'baseline' | 'before-edge' | 'text-before-edge' | 'middle' | 'central' | 'after-edge' | 'text-after-edge' | 'ideographic' | 'alphabetic' | 'hanging' | 'mathematical' | 'top' | 'center' | 'bottom'
    'clip-path'?: undefined | null | string
    'clipPathUnits'?: undefined | null | 'userSpaceOnUse' | 'objectBoundingBox'
    'cx'?: undefined | null | number | string
    'cy'?: undefined | null | number | string
    'd'?: undefined | null | string
    'dominant-baseline'?: undefined | null | 'auto' | 'text-bottom' | 'alphabetic' | 'ideographic' | 'middle' | 'central' | 'mathematical' | 'hanging' | 'text-top' | StringAutocompleted
    'fill-opacity'?: undefined | null | number | string
    'fill-rule'?: undefined | null | 'evenodd' | 'nonzero'
    'fill'?: undefined | null | string
    'font-size'?: undefined | null | number | string
    'font-weight'?: undefined | null | number | string
    'gradientUnits'?: undefined | null | 'userSpaceOnUse' | 'objectBoundingBox'
    'height'?: undefined | null | number | string
    'mask'?: undefined | null | string
    'maskContentUnits'?: undefined | null | 'userSpaceOnUse' | 'objectBoundingBox'
    'maskUnits'?: undefined | null | 'userSpaceOnUse' | 'objectBoundingBox'
    'patternContentUnits'?: undefined | null | 'userSpaceOnUse' | 'objectBoundingBox'
    'patternUnits'?: undefined | null | 'userSpaceOnUse' | 'objectBoundingBox'
    'points'?: undefined | null | string
    'preserveAspectRatio'?: undefined | null | 'none' | `x${'Min'|'Mid'|'Max'}Y${'Min'|'Mid'|'Max'}${''|' meet'|' slice'}` | StringAutocompleted
    'r'?: undefined | null | number | string
    'rx'?: undefined | null | number | string
    'ry'?: undefined | null | number | string
    'stroke-dasharray'?: undefined | null | string
    'stroke-dashoffset'?: undefined | null | number | string
    'stroke-linecap'?: undefined | null | 'inherit' | 'butt' | 'round' | 'square'
    'stroke-linejoin'?: undefined | null | 'inherit' | 'butt' | 'round' | 'square'
    'stroke-miterlimit'?: undefined | null | number | string
    'stroke-width'?: undefined | null | number | string
    'stroke'?: undefined | null | string
    'text-anchor'?: undefined | null | 'start' | 'middle' | 'end' | StringAutocompleted
    'transform'?: undefined | null | string
    'vector-effect'?: undefined | null | 'non-scaling-stroke' | StringAutocompleted
    'version'?: undefined | null | number | string
    'viewBox'?: undefined | null | string
    'width'?: undefined | null | number | string
    'x'?: undefined | null | number | string
    'x1'?: undefined | null | number | string
    'x2'?: undefined | null | number | string
    'y'?: undefined | null | number | string
    'y1'?: undefined | null | number | string
    'y2'?: undefined | null | number | string
}

export interface AllAriaAttrs {
    'role'?: undefined | null
        | 'alert'
        | 'alertdialog'
        | 'application'
        | 'article'
        | 'banner'
        | 'button'
        | 'cell'
        | 'checkbox'
        | 'columnheader'
        | 'combobox'
        | 'complementary'
        | 'contentinfo'
        | 'definition'
        | 'dialog'
        | 'directory'
        | 'document'
        | 'feed'
        | 'figure'
        | 'form'
        | 'grid'
        | 'gridcell'
        | 'group'
        | 'heading'
        | 'img'
        | 'link'
        | 'list'
        | 'listbox'
        | 'listitem'
        | 'log'
        | 'main'
        | 'marquee'
        | 'math'
        | 'menu'
        | 'menubar'
        | 'menuitem'
        | 'menuitemcheckbox'
        | 'menuitemradio'
        | 'navigation'
        | 'none'
        | 'note'
        | 'option'
        | 'presentation'
        | 'progressbar'
        | 'radio'
        | 'radiogroup'
        | 'region'
        | 'row'
        | 'rowgroup'
        | 'rowheader'
        | 'scrollbar'
        | 'search'
        | 'searchbox'
        | 'separator'
        | 'slider'
        | 'spinbutton'
        | 'status'
        | 'switch'
        | 'tab'
        | 'table'
        | 'tablist'
        | 'tabpanel'
        | 'term'
        | 'textbox'
        | 'timer'
        | 'toolbar'
        | 'tooltip'
        | 'tree'
        | 'treegrid'
        | 'treeitem'
        | StringAutocompleted
    'aria-activedescendant'?: undefined | string
    'aria-atomic'?: undefined | '' | 'true' | 'false'
    'aria-autocomplete'?: undefined | 'none' | 'inline' | 'list' | 'both'
    'aria-braillelabel'?: undefined | string
    'aria-brailleroledescription'?: undefined | string
    'aria-busy'?: undefined | '' | 'true' | 'false'
    'aria-checked'?: undefined | boolean | 'false' | 'mixed' | 'true'
    'aria-colcount'?: undefined | number | string
    'aria-colindex'?: undefined | number | string
    'aria-colindextext'?: undefined | string
    'aria-colspan'?: undefined | number | string
    'aria-controls'?: undefined | string
    'aria-current'?: undefined | boolean | 'false' | 'true' | 'page' | 'step' | 'location' | 'date' | 'time'
    'aria-describedby'?: undefined | string
    'aria-description'?: undefined | string
    'aria-details'?: undefined | string
    'aria-disabled'?: undefined | '' | 'true' | 'false'
    'aria-dropeffect'?: undefined | 'none' | 'copy' | 'execute' | 'link' | 'move' | 'popup'
    'aria-errormessage'?: undefined | string
    'aria-expanded'?: undefined | '' | 'true' | 'false'
    'aria-flowto'?: undefined | string
    'aria-grabbed'?: undefined | '' | 'true' | 'false'
    'aria-haspopup'?: undefined | boolean | 'false' | 'true' | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog'
    'aria-hidden'?: undefined | '' | 'true' | 'false'
    'aria-invalid'?: undefined | boolean | 'false' | 'true' | 'grammar' | 'spelling'
    'aria-keyshortcuts'?: undefined | string
    'aria-label'?: undefined | string
    'aria-labelledby'?: undefined | string
    'aria-level'?: undefined | number | string
    'aria-live'?: undefined | 'off' | 'assertive' | 'polite'
    'aria-modal'?: undefined | '' | 'true' | 'false'
    'aria-multiline'?: undefined | '' | 'true' | 'false'
    'aria-multiselectable'?: undefined | '' | 'true' | 'false'
    'aria-orientation'?: undefined | 'horizontal' | 'vertical'
    'aria-owns'?: undefined | string
    'aria-placeholder'?: undefined | string
    'aria-posinset'?: undefined | number | string
    'aria-pressed'?: undefined | boolean | 'false' | 'mixed' | 'true'
    'aria-readonly'?: undefined | '' | 'true' | 'false'
    'aria-relevant'?: undefined | 'additions' | 'additions removals' | 'additions text' | 'all' | 'removals' | 'removals additions' | 'removals text' | 'text' | 'text additions' | 'text removals'
    'aria-required'?: undefined | '' | 'true' | 'false'
    'aria-roledescription'?: undefined | string
    'aria-rowcount'?: undefined | number | string
    'aria-rowindex'?: undefined | number | string
    'aria-rowindextext'?: undefined | string
    'aria-rowspan'?: undefined | number | string
    'aria-selected'?: undefined | '' | 'true' | 'false'
    'aria-setsize'?: undefined | number | string
    'aria-sort'?: undefined | 'none' | 'ascending' | 'descending' | 'other'
    'aria-valuemax'?: undefined | number | string
    'aria-valuemin'?: undefined | number | string
    'aria-valuenow'?: undefined | number | string
    'aria-valuetext'?: undefined | string
}

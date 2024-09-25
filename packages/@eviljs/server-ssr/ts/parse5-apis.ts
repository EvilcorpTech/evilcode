import type {Io} from '@eviljs/std/fn'
import {isSome} from '@eviljs/std/type-is'
import type {DefaultTreeAdapterMap} from 'parse5'

export * as Parse5 from 'parse5'

export type Parse5ChildNode = DefaultTreeAdapterMap['childNode']
export type Parse5Element = DefaultTreeAdapterMap['element']

export function find<I>(list: Array<I>, test: Io<I, boolean>): undefined | I {
    return list.find(test)
}

export function filter<I>(list: Array<I>, test: Io<I, boolean>): Array<I> {
    return list.filter(test)
}

export function testingNodeName(nodeName: string): (node: Parse5ChildNode) => boolean {
    function testNodeName(node: Parse5ChildNode) {
        return node.nodeName === nodeName
    }
    return testNodeName
}

export function isElement(node: undefined | Parse5ChildNode): node is Parse5Element {
    return isSome(node) && ('childNodes' in node)
}

export function mappingElement<N extends undefined | Parse5ChildNode, V>(
    onElement: (element: Parse5Element) => V,
    onNode?: undefined,
): (node: N) => V | N
export function mappingElement<N extends undefined | Parse5ChildNode, V, F>(
    onElement: (element: Parse5Element) => V,
    onNode: (node: N) => F,
): (node: N) => V | F
export function mappingElement<N extends undefined | Parse5ChildNode, V, F>(
    onElement: (element: Parse5Element) => V,
    onNode?: undefined | ((node: N) => F),
) {
    function mapElement(node: N): N | V | F {
        return isElement(node) ?
            onElement(node)
        : onNode
            ? onNode(node)
        : node
    }

    return mapElement
}

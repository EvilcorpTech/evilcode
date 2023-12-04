import type {Io} from '@eviljs/std/fn.js'
import {isSome} from '@eviljs/std/type.js'
import type {ChildNode, Element} from '../node_modules/parse5/dist/tree-adapters/default.d.ts'

export type {ChildNode, Element} from '../node_modules/parse5/dist/tree-adapters/default.d.ts'

export function find<I>(list: Array<I>, test: Io<I, boolean>): undefined | I {
    return list.find(test)
}

export function filter<I>(list: Array<I>, test: Io<I, boolean>): Array<I> {
    return list.filter(test)
}

export function testingNodeName(nodeName: string) {
    function testNodeName(node: ChildNode) {
        return node.nodeName === nodeName
    }
    return testNodeName
}

export function isElement(node: undefined | ChildNode): node is Element {
    return isSome(node) && ('childNodes' in node)
}

export function mappingElement<N extends undefined | ChildNode, V>(
    onElement: (element: Element) => V,
    onNode?: undefined,
): (node: N) => V | N
export function mappingElement<N extends undefined | ChildNode, V, F>(
    onElement: (element: Element) => V,
    onNode: (node: N) => F,
): (node: N) => V | F
export function mappingElement<N extends undefined | ChildNode, V, F>(
    onElement: (element: Element) => V,
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

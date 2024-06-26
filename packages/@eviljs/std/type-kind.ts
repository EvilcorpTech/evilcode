import type {Io} from './fn-type.js'
import {isArray, isBoolean, isDate, isDefined, isFunction, isInteger, isIterator, isNone, isNull, isNumber, isObject, isPromise, isRegExp, isSome, isString, isUndefined} from './type-is.js'

export const TypeKind = {
    array: isArray as Io<unknown, boolean>,
    boolean: isBoolean as Io<unknown, boolean>,
    date: isDate as Io<unknown, boolean>,
    defined: isDefined as Io<unknown, boolean>,
    function: isFunction as Io<unknown, boolean>,
    integer: isInteger as Io<unknown, boolean>,
    iterator: isIterator as Io<unknown, boolean>,
    none: isNone as Io<unknown, boolean>,
    null: isNull as Io<unknown, boolean>,
    number: isNumber as Io<unknown, boolean>,
    object: isObject as Io<unknown, boolean>,
    promise: isPromise as Io<unknown, boolean>,
    regexp: isRegExp as Io<unknown, boolean>,
    some: isSome as Io<unknown, boolean>,
    string: isString as Io<unknown, boolean>,
    undefined: isUndefined as Io<unknown, boolean>,
}

export function kindOf<T extends keyof typeof TypeKind>(value: unknown, ...testsKinds: Array<T>): undefined | T {
    return testsKinds.find(kind => TypeKind[kind](value))
}

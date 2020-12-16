import {isFunction, isNil, isNumber, isString} from './type.js'

export const ExpType = Symbol('Exp')

export function exp<A extends Array<unknown>, T>(operator: (...args: A) => T, ...args: A) {
    function evaluator() {
        return operator(...args)
    }

    const expEvaluator = evaluator as ExpFn<T>
    expEvaluator.__expType__ = ExpType

    return expEvaluator
}

export function isExp(ex: unknown): ex is ExpFn<unknown> {
    if (isFunction(ex) && (ex as any).__expType__ === ExpType) {
        return true
    }
    return false
}

export function express<T>(ex: Exp<T>) {
    if (! isExp(ex)) {
        return ex
    }
    return ex()
}

export function bool(oneExp: Exp<any>) {
    const one = express(oneExp)

    if (one === false) {
        return false
    }
    if (isNil(one)) {
        return false
    }
    if (isNaN(one)) {
        return false
    }
    // 0 and '' are true.
    return true
}

export function and(...exps: Array<Exp<BoolAtom>>) {
    for (const ex of exps) {
        const one = bool(ex)

        if (one === false) {
            return false
        }
    }
    return true
}

export function or(...exps: Array<Exp<BoolAtom>>) {
    if (exps.length === 0) {
        return true
    }
    for (const ex of exps) {
        const one = bool(ex)

        if (one === true) {
            return true
        }
    }
    return false
}

export function not(oneExp: Exp<BoolAtom>) {
    return ! bool(oneExp)
}

export function is(oneExp: Exp<EqAtom>, twoExp: Exp<EqAtom>) {
    return express(oneExp) === express(twoExp)
}

export function isnt(oneExp: Exp<EqAtom>, twoExp: Exp<EqAtom>) {
    return not(is(oneExp, twoExp))
}

export function less(oneExp: Exp<number>, twoExp: Exp<number>) {
    const one = express(oneExp)
    const two = express(twoExp)
    if (! isNumber(one)) {
        return false
    }
    if (! isNumber(two)) {
        return false
    }
    return one < two
}

export function more(oneExp: Exp<number>, twoExp: Exp<number>) {
    return not(less(oneExp, twoExp))
}

export function match(oneExp: Exp<string>, twoExp: Exp<string>) {
    const one = express(oneExp)
    const two = express(twoExp)
    if (! isString(one)) {
        return false
    }
    if (! isString(two)) {
        return false
    }
    return one.toLowerCase().includes(two.toLowerCase())
}

// Types ///////////////////////////////////////////////////////////////////////

export type EqAtom = string | number | boolean | null | undefined
export type BoolAtom = boolean | null | undefined

export type Exp<T> = T | ExpFn<T>

export interface ExpFn<T> {
    (): T
    __expType__: Symbol
}

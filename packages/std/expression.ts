import {isArray, isFunction, isNil, isNumber, isString} from './type.js'

export const ExpType = Symbol('Exp')

export function exp<A extends Array<unknown>, T>(operator: (...args: A) => T, ...args: A) {
    function evaluator() {
        return operator(...args)
    }

    const expEvaluator = evaluator as ExpFn<T>
    expEvaluator.__expType__ = ExpType

    return expEvaluator
}

export function express<T>(ex: Exp<T>) {
    if (! isExp(ex)) {
        return ex
    }
    return ex()
}

export function isExp(ex: unknown): ex is ExpFn<unknown> {
    if (isFunction(ex) && (ex as ExpFn<unknown>).__expType__ === ExpType) {
        return true
    }
    return false
}

// Operators ///////////////////////////////////////////////////////////////////

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

export function is(oneExp: Exp<Atom>, twoExp: Exp<Atom>) {
    return express(oneExp) === express(twoExp)
}

export function isnt(oneExp: Exp<Atom>, twoExp: Exp<Atom>) {
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
    return and(not(less(oneExp, twoExp)), not(is(oneExp, twoExp)))
}

export function between(oneExp: Exp<number>, twoExp: Exp<number>, threeExp: Exp<number>) {
    return and(less(oneExp, twoExp), less(twoExp, threeExp))
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

export function list(...args: Array<Exp<unknown>>) {
    return args.map(express)
}

export function regex(textExp: Exp<string>, patternExp: Exp<string>, flagsExp?: Exp<string>) {
    const text = express(textExp)
    const pattern = express(patternExp)
    const flags = express(flagsExp)
    const regexp = (() => {
        try {
            return new RegExp(pattern, flags)
        }
        catch (error) {
            return
        }
    })()
    if (! regexp) {
        return
    }
    if (! isString(text)) {
        return
    }
    return regexp.test(text)
}

// Evaluation Tree /////////////////////////////////////////////////////////////

/*
* Evaluates an expression tree.
*
* EXAMPLE
* const expressionTree = ['operator', ...args]
* const result = evaluateExpression(operators, expressionTree)
*/
export function evaluateExpression<O extends Record<PropertyKey, Operator>>(operators: O, expression: Expression) {
    return express(buildExpression(operators, expression))
}

/*
* Builds an evaluable expression from an expression tree.
*
* EXAMPLE
* const expressionTree = ['operator', ...args]
* const expression = buildExpression(operators, expressionTree)
* const result = express(expression)
*/
export function buildExpression<O extends Record<PropertyKey, Operator>>(operators: O, expression: unknown): unknown {
    if (! isArray(expression)) {
        return expression // An Atom.
    }
    const [operatorId, ...operatorArgs] = expression
    if (! operatorId) {
        return // An empty expression.
    }
    const operator = operators[operatorId as string]
    if (! operator) {
        return // An invalid operator.
    }
    const expressionArgs = operatorArgs.map(it => buildExpression(operators, it))
    return exp(() => operator(...expressionArgs))
}

// Types ///////////////////////////////////////////////////////////////////////

export type Atom = string | number | BoolAtom
export type BoolAtom = boolean | NilAtom
export type NilAtom = null | undefined

export type Exp<T> = T | ExpFn<T>

export interface ExpFn<T> {
    (): T
    __expType__: Symbol
}

export type Expression
    <
        O extends PropertyKey = PropertyKey,
        A extends Array<unknown> = Array<any>,
    >
    = [O, ...A]

export type Operator
    <
        A extends Array<unknown> = Array<any>,
        R = unknown,
    >
    = (...args: A) => R

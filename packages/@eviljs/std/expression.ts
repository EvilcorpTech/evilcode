import {
    assertFunctionOptional,
    assertObject,
    ensureArray,
    ensureBoolean,
    ensureFunction,
    ensureInteger,
    ensureNumber,
    ensureString,
    ensureStringOptional,
    throwAssertTypeError,
} from './assert.js'
import {getObjectPath} from './object.js'
import {isArray, isFunction, isNil} from './type.js'

export function evaluateExp<C extends Ctx, R>(ctx: C, exp: Exp<C, R>) {
    if (! isFunction(exp)) {
        return exp
    }
    return exp(ctx)
}

// Operators ///////////////////////////////////////////////////////////////////

export function bool(ctx: Ctx, oneExp: Exp<Ctx, any>): boolean {
    const one = evaluateExp(ctx, oneExp)
    if (one === false) {
        return false
    }
    if (isNil(one)) {
        return false
    }
    if (typeof one === 'number' && isNaN(one)) {
        return false
    }
    // 0 and '' are considered true.
    return true
}

/**
* @throws InvalidArgument
*/
export function and(ctx: Ctx, ...exps: Array<Exp<Ctx, boolean>>): boolean {
    if (exps.length === 0) {
        return throwAssertTypeError('a Non Empty Array', exps)
    }
    return exps.every(itExp => ensureBoolean(evaluateExp(ctx, itExp)))
}

/**
* @throws InvalidArgument
*/
export function or(ctx: Ctx, ...exps: Array<Exp<Ctx, boolean>>): boolean {
    if (exps.length === 0) {
        return throwAssertTypeError('a Non Empty Array', exps)
    }
    return exps.some(itExp => ensureBoolean(evaluateExp(ctx, itExp)))
}

export function not(ctx: Ctx, oneExp: Exp<Ctx, boolean>): boolean {
    return ! ensureBoolean(evaluateExp(ctx, oneExp))
}

export function is(ctx: Ctx, oneExp: Exp<Ctx, ScalarAtom>, twoExp: Exp<Ctx, ScalarAtom>): boolean {
    return evaluateExp(ctx, oneExp) === evaluateExp(ctx, twoExp)
}

export function isnt(ctx: Ctx, oneExp: Exp<Ctx, ScalarAtom>, twoExp: Exp<Ctx, ScalarAtom>): boolean {
    return not(ctx, is(ctx, oneExp, twoExp))
}

export function less(ctx: Ctx, oneExp: Exp<Ctx, number>, twoExp: Exp<Ctx, number>): boolean {
    const one = ensureNumber(evaluateExp(ctx, oneExp))
    const two = ensureNumber(evaluateExp(ctx, twoExp))
    return one < two
}

export function more(ctx: Ctx, oneExp: Exp<Ctx, number>, twoExp: Exp<Ctx, number>): boolean {
    return and(ctx, not(ctx, less(ctx, oneExp, twoExp)), not(ctx, is(ctx, oneExp, twoExp)))
}

export function between(ctx: Ctx, oneExp: Exp<Ctx, number>, twoExp: Exp<Ctx, number>, threeExp: Exp<Ctx, number>): boolean {
    return and(ctx, less(ctx, oneExp, twoExp), less(ctx, twoExp, threeExp))
}

export function match(ctx: Ctx, oneExp: Exp<Ctx, string>, twoExp: Exp<Ctx, string>): boolean {
    const one = ensureString(evaluateExp(ctx, oneExp))
    const two = ensureString(evaluateExp(ctx, twoExp))
    return one.toLowerCase().includes(two.toLowerCase())
}

export function regex(ctx: Ctx, textExp: Exp<Ctx, string>, patternExp: Exp<Ctx, string>, flagsExp?: Exp<Ctx, string>): boolean {
    const text = ensureString(evaluateExp(ctx, textExp))
    const pattern = ensureString(evaluateExp(ctx, patternExp))
    const flags = ensureStringOptional(evaluateExp(ctx, flagsExp))
    const regexp = new RegExp(pattern, flags)
    return regexp.test(text)
}

export function list<I>(ctx: Ctx, ...args: Array<Exp<Ctx, I>>): Array<I> {
    return args.map(it => evaluateExp(ctx, it))
}

export function arg(ctx: CtxWithArgs, idExp: Exp<Ctx, number>, scopeIdxExp?: Exp<Ctx, number>): unknown {
    const idx = ensureInteger(evaluateExp(ctx, idExp))
    const scopeIdx = scopeIdxExp ? ensureInteger(evaluateExp(ctx, scopeIdxExp)) : 0
    return ctx.args[scopeIdx]?.[idx]
}

export function find<I>(ctx: Ctx | CtxWithArgs, listExp: Exp<Ctx, Array<I>>, testExp: Exp<CtxWithArgs, boolean>): undefined | I {
    const list = ensureArray(evaluateExp(ctx, listExp))
    const item = list.find((it, idx) => {
        const ctxArgs = ('args' in ctx) ? ctx.args : []
        const ctxWithArgs = {
            ...ctx,
            args: [[it, idx], ...ctxArgs],
        }
        return ensureBoolean(evaluateExp(ctxWithArgs, testExp))
    })
    return item
}

export function has(ctx: Ctx | CtxWithArgs, listExp: Exp<Ctx, Array<unknown>>, testExp: Exp<CtxWithArgs, boolean>): boolean {
    return bool(ctx, find(ctx, listExp, testExp))
}

/*
* The lookup operator.
* Lookups a path inside a resolver, and if it is not found, lookups the path inside
* an object using the Object Path Syntax.
*
* EXAMPLE
*
* const $ = {info: {title: 'Moby Dick'}}
* const resolvers = {'info.title': (obj) => obj.title.toUpperCase()}
* lookup({$}, 'info.title') => 'Moby Dick'
* lookup({$, resolvers}, 'info.title') => 'MOBY DICK'
*/
export function lookup(ctx: CtxWithResolver, pathExp: Exp<Ctx, string>) {
    const {$, resolvers} = ctx
    assertObject($)
    const path = ensureString(evaluateExp(ctx, pathExp))
    const resolver = resolvers?.[path]
    assertFunctionOptional(resolver)
    if (resolver) {
        // There is a resolver for the path.
        // We use the resolver.
        return resolver($, path)
    }
    // There is not a resolver for the path. We use the getter.
    return getObjectPath($, path)
}

// Evaluation Tree /////////////////////////////////////////////////////////////

/*
* Evaluates a tree.
*
* EXAMPLE
*
* const tree = ['operator', ...args]
* const result = evaluateTree(operators, tree)
*/
export function evaluateTree(operators: Record<PropertyKey, Operator>, tree: Tree, ctx: Ctx) {
    const exp = compileTree(operators, tree)
    const result = evaluateExp(ctx, exp)
    return result
}

/*
* Builds an evaluable expression from a tree of nodes.
*
* EXAMPLE
*
* const tree = ['operator', ...args]
* const exp = compileTree(operators, tree)
* const result = evaluateExp(exp)
*/
export function compileTree(operators: Record<PropertyKey, Operator>, tree: Tree): ExpFn<Ctx, unknown> {
    const [operatorId, ...operatorArgs] = ensureArray(tree)
    const operator = ensureFunction(operators[ensureString(operatorId)])

    const expArgs = operatorArgs.map(it =>
        isArray(it)
            ? compileTree(operators, it)
            : it
    )

    function exp(ctx: Ctx) {
        return operator(ctx, ...expArgs)
    }

    return exp
}

// Types ///////////////////////////////////////////////////////////////////////

export type NilAtom = null | undefined
export type ScalarAtom = boolean | number | string
export type ComplexAtom = {}
export type Atom = NilAtom | ScalarAtom | ComplexAtom

export type Exp<C extends Ctx, R> = R | ExpFn<C, R>
export type ExpFn<C extends Ctx, R> = (ctx: C) => R

export type Tree = Array<any>

export interface Operator {
    (ctx: any, ...args: Array<any>): unknown
}

export interface Ctx {}

export interface CtxWithArgs extends Ctx {
    args: Array<[...Array<unknown>]>
}

export interface CtxWithResolver {
    $: {},
    resolvers?: Record<string, Resolver>
}

export interface Resolver {
    (obj: {}, path: string): unknown
}

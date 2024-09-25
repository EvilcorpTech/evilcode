import type {Task} from '@eviljs/std/fn-type'
import {Future, createFuture} from '@eviljs/std/promise-future'
import {createLinearScale, directionOf, distanceBetween} from '@eviljs/std/scale'

export {wait} from '@eviljs/std/async'
export {playTimeline} from '@eviljs/std/timeline'
export type {TimelineAsync, TimelineParallel, TimelineSequence, TimelineTask} from '@eviljs/std/timeline'

export const SpringPrecision: number = 200
export const SpringSnapping: number = 1 / SpringPrecision

export const SpringDamping: number = .6
export const SpringDistance: number = 10
export const SpringMass: number = .15
export const SpringStiffness: number = 1

export const SpringScaleDamping: number = SpringDamping
export const SpringScaleDistance: number = SpringDistance
export const SpringScaleMass: number = SpringMass
export const SpringScaleStiffness: number = SpringStiffness

export function flushStyles(...elements: [HTMLElement, ...Array<HTMLElement>]): void {
    for (const element of elements) {
        // Forces styles computation.
        // Void prevents Chrome from skipping the evaluation of the expression.
        void element.offsetTop
        void element.offsetLeft
    }
}

export function requestStylesFlush(...elements: [HTMLElement, ...Array<HTMLElement>]): Promise<void> {
    let taskId: undefined | ReturnType<typeof requestAnimationFrame>

    const promise = createFuture<void>((resolve, reject) => {
        taskId = requestAnimationFrame(() => {
            flushStyles(...elements)
            resolve()
        })
    })

    promise.onCancel(() => {
        if (! taskId) {
            return
        }
        cancelAnimationFrame(taskId)
    })

    return promise
}

export function playCssTransition<T extends HTMLElement, S1 = void, S2 = void>(
    target: T,
    hooks: AnimationCssHooks<T, S1, S2>,
): Promise<void> {
    const setupReturn = hooks.setup?.(target)

    if (hooks.setup) {
        flushStyles(target)
    }

    const promise = new Promise<void>((resolve, reject) => {
        function onTransitionEnd(event: TransitionEvent) {
            if (event.target !== target) {
                return
            }

            target.removeEventListener('transitionend', onTransitionEnd)
            hooks.clean?.(target, playReturn)
            resolve()
        }
        target.addEventListener('transitionend', onTransitionEnd)

        const playReturn = hooks.play(target, setupReturn!)
    })

    return promise
}

export function createCssTransition<S1, S2, T extends HTMLElement>(
    target: T,
    hooks: AnimationCssHooks<T, S1, S2>,
): Task<Promise<void>> {
    function play() {
        return playCssTransition(target, hooks)
    }

    return play
}

export function createSpringAnimation(options: SpringAnimationOptions): Task<Promise<void>> {
    let promise: undefined | Future<void>

    function loop(initialTime: number, done: Task, wasSnapped = false) {
        if (! promise) {
            return
        }

        if (promise.canceled) {
            options.onCancel?.()
            options.onFinally?.()
            done()
            return
        }

        const precision = options.precision ?? SpringPrecision
        const time = (Date.now() - initialTime) / precision
        const snapping = options.snapping ?? SpringSnapping
        const position = computeDampedSimpleHarmonicMotion(time, options)
        const shouldSnap = Math.abs(position) <= snapping
        const mustSnap = wasSnapped && shouldSnap
        // If the position is for two times candidate for snapping,
        // motion lost enough momentum and can be snapped.

        if (mustSnap) {
            options.onTick(0, time)
            options.onEnd?.()
            options.onFinally?.()
            done()
            return
        }

        options.onTick(position, time)

        scheduleAnimationTask(() =>
            loop(initialTime, done, shouldSnap)
        )
    }

    function play() {
        promise = createFuture<void>((resolve, reject) => {
            loop(Date.now(), resolve)
        })

        return promise
    }

    // TODO: We should expose a `cancel` callback.
    return play
}

export function createSpringScaleAnimation(
    finalScale: number,
    initialScaleOptional?: undefined | number,
    options?: undefined | Partial<SpringAnimationOptions>,
): (element: HTMLElement, direction: 'forwards' | 'backward') => Promise<void> {
    const initialScale = initialScaleOptional ?? 1
    const animationDistance = options?.distance ?? SpringScaleDistance
    const scaleDistance = distanceBetween(initialScale, finalScale)
    const scaleDirection = directionOf(initialScale, finalScale)
    const overshootScale = finalScale + scaleDirection * scaleDistance
    const mapPositionToScale = createLinearScale([animationDistance, -animationDistance], [initialScale, overshootScale])
    const inverseDistance = distanceBetween(finalScale, -initialScale)
    //  5 |\
    //    | \     —
    //    |  \   / \
    //  2 |   \ /   ——>
    //    |    —
    //  0 |———————————————
    //    |    _
    // -2 |   / \   ——>
    //    |  /   \ /
    //    | /     —
    // -5 |/

    function play(element: HTMLElement, direction: 'forwards' | 'backward') {
        const animate = createSpringAnimation({
            damping: SpringScaleDamping,
            mass: SpringScaleMass,
            stiffness: SpringScaleStiffness,
            ...options,
            distance: animationDistance,
            onTick(position, tick) {
                options?.onTick?.(position, tick)

                const scaleFactor = mapPositionToScale(position)
                const scale = direction === 'forwards'
                    ? scaleFactor
                    : -scaleFactor + inverseDistance // Inverted and translated back.
                const clampedScale = Math.max(scale, 0)

                element.style.zIndex = direction === 'forwards'
                    ? '1'
                    : ''
                element.style.transform = `scale(${clampedScale})`
            },
        })

        return animate()
    }

    return play
}

export function computeDampedSimpleHarmonicMotion(time: number, options: SpringOptions): number {
    const damping = options.damping ?? SpringDamping
    const distance = options.distance ?? SpringDistance
    const mass = options.mass ?? SpringMass
    const stiffness = options.stiffness ?? SpringStiffness

    // Damped Simple Harmonic Motion.
    const position =
        distance
        * Math.pow(Math.E, -(1/2) * (damping/mass) * time)
        * Math.cos(
            Math.sqrt(
                (stiffness/mass)
                - (1/4) * Math.pow(damping/mass, 2)
            )
            * time
        )

    if (isNaN(position)) {
        console.warn(
            '@eviljs/web/animation.computeDampedSimpleHarmonicMotion(time, ~~options~~):\n'
            + 'spring has an invalid configuration because\n'
            + `a stiffness of ${stiffness} is insufficient compared to a damping of ${damping};\n`
            + 'try increasing the stiffness or decreasing the damping\n'
            + 'and pay attention to the mass too.'
        )
        return 0
    }

    return position
}

export function scheduleAnimationTask(task: Function): void {
    requestAnimationFrame(() => task())
}

// Types ///////////////////////////////////////////////////////////////////////

export interface AnimationCssHooks<T extends HTMLElement, S1, S2 = S1> {
    setup?: undefined | ((target: T) => S1)
    play: (target: T, state: S1) => S2
    clean?: undefined | ((target: T, state: S2) => void)
}

export interface SpringOptions {
    damping?: undefined | number
    distance?: undefined | number
    mass?: undefined | number
    precision?: undefined | number
    stiffness?: undefined | number
}

export interface SpringAnimationOptions extends SpringOptions {
    snapping?: undefined | number
    onTick: (position: number, tick: number) => void
    onEnd?: undefined | (() => void)
    onCancel?: undefined | (() => void)
    onFinally?: undefined | (() => void)
}

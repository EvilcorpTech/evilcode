import {Transition} from '@eviljs/react/transition'
import {defineShowcase} from '@eviljs/reactx/showcase-v1/showcase.js'
import {TransitionAnimator, TransitionEffect} from '@eviljs/reactx/transition-animator-v1/transition-animator.js'
import {useEffect, useState} from 'react'

export default defineShowcase('Transition', props => {
    return (
        <div className="std-flex std-flex-align-start std-flex-wrap std-gap5">
            <Starter interval={1_000}>
                {(start, counter) =>
                    <Transition initial mode="out-in">
                        <TransitionAnimator
                            key={String(start)}
                            className="animator-0cbf"
                            effect={TransitionEffect.Fade}
                        >
                            <h6 className="std-uppercase">
                                out-in enter+exit initial
                            </h6>

                            <br/>

                            {start ? 'New' : 'Initial'}

                            <br/>

                            {`key: ${String(start)}`}

                            <br/>

                            {counter}
                        </TransitionAnimator>
                    </Transition>
                }
            </Starter>

            <Starter interval={1_000}>
                {(start, counter) =>
                    <Transition initial mode="in-out">
                        <TransitionAnimator
                            key={String(start)}
                            className="animator-0cbf"
                            effect={TransitionEffect.Fade}
                        >
                            <h6 className="std-uppercase">
                                in-out enter+exit initial
                            </h6>

                            <br/>

                            {start ? 'New' : 'Initial'}

                            <br/>

                            {`key: ${String(start)}`}

                            <br/>

                            {counter}
                        </TransitionAnimator>
                    </Transition>
                }
            </Starter>

            <Starter interval={1_000} style={{width: 400, height: 200}}>
                {(start, counter) =>
                    <Transition initial mode="cross">
                        <TransitionAnimator
                            key={String(start)}
                            className="animator-0cbf std-layer"
                            effect={TransitionEffect.Fade}
                        >
                            <h6 className="std-uppercase">
                                cross enter+exit initial
                            </h6>

                            <br/>

                            {start ? 'New' : 'Initial'}

                            <br/>

                            {`key: ${String(start)}`}

                            <br/>

                            {counter}
                        </TransitionAnimator>
                    </Transition>
                }
            </Starter>
        </div>
    )
})

function Starter(props: {
    children: (state: boolean, counter: number) => React.ReactNode
    interval?: undefined | number
    style?: undefined | React.CSSProperties
}) {
    const {children, style, interval} = props
    const [start, setStart] = useState(false)
    const [counter, setCounter] = useState(0)

    useEffect(() => {
        if (! start) {
            return
        }

        const intervalId = setInterval(() => {
            setCounter(state => state + 1)
        }, interval ?? 100)

        function onClean() {
            clearInterval(intervalId)
        }

        return onClean
    }, [start, interval])

    return (
        <div className="std-flex std-flex-column std-flex-align-center std-gap5">
            <button
                className="std-button flat"
                onClick={() => setStart(! start)}
            >
                {start ? 'Stop' : 'Start'}
            </button>

            <div
                style={{
                    padding: 'var(--std-gutter4)',
                    border: '3px solid ' + (start ? 'blue' : 'currentColor'),
                    borderRadius: 'var(--std-radius1)',
                    ...style,
                }}
            >
                <div className="std-layer-root">
                    {children(start, counter)}
                </div>
            </div>
        </div>
    )
}

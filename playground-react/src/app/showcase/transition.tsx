import {defineShowcase} from '@eviljs/reactx/showcase'
import {Transition} from '@eviljs/reactx/transition'
import {TransitionAnimator} from '@eviljs/reactx/transition-animator'
import {CSSProperties, useEffect, useState} from 'react'

export default defineShowcase('Transition', (props) => {
    return (
        <div className="std-flex align-start wrap gap5">
            <Starter>
                {(start, counter) =>
                    <Transition initial mode="out-in" enter={1} exit={1} target="animator-0cbf">
                        <TransitionAnimator
                            key={String(start)}
                            className="animator-0cbf"
                            effect="fade"
                        >
                            <h6 className="std-uppercase">
                                out-in enter+exit initial
                            </h6>

                            <br/>

                            {String(start)}

                            <br/>

                            {counter}
                        </TransitionAnimator>
                    </Transition>
                }
            </Starter>

            <Starter>
                {(start, counter) =>
                    <Transition initial mode="in-out" enter={1} exit={1} target="animator-0cbf">
                        <TransitionAnimator
                            key={String(start)}
                            className="animator-0cbf"
                            effect="fade"
                        >
                            <h6 className="std-uppercase">
                                in-out enter+exit initial
                            </h6>

                            <br/>

                            {String(start)}

                            <br/>

                            {counter}
                        </TransitionAnimator>
                    </Transition>
                }
            </Starter>

            <Starter style={{width: 400, height: 100}}>
                {(start, counter) =>
                    <Transition initial mode="cross" enter={1} exit={1} target="animator-0cbf">
                        <TransitionAnimator
                            key={String(start)}
                            className="animator-0cbf std-layer"
                            effect="fade"
                        >
                            <h6 className="std-uppercase">
                                cross enter+exit initial
                            </h6>

                            <br/>

                            {String(start)}

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
    style?: CSSProperties
}) {
    const {children, style} = props
    const [start, setStart] = useState(false)
    const [counter, setCounter] = useState(0)

    useEffect(() => {
        if (! start) {
            return
        }

        setCounter(0)

        const intervalId = setInterval(() => {
            setCounter(state => state + 1)
        }, 100)

        function onClean() {
            clearInterval(intervalId)
        }

        return onClean
    }, [start])

    return (
        <div className="std-flex column align-center gap5">
            <button
                className="std-button flat"
                onClick={() => setStart(! start)}
            >
                {start ? 'Stop' : 'Start'}
            </button>

            <div
                className="std-layer-root"
                style={{
                    padding: 'var(--std-gutter4)',
                    color: start ? 'red' : 'blue',
                    border: '3px solid ' + (start ? 'red' : 'blue'),
                    borderRadius: 'var(--std-radius1)',
                    ...style,
                }}
            >
                {children(start, counter)}
            </div>
        </div>
    )
}

import {defineShowcase} from '@eviljs/reactx/showcase'
import {useStoreState, type StoreState} from '~/store/hooks'
import {Theme} from '~/theme/apis'

export default defineShowcase('Store', (props) => {
    const [theme] = useStoreState((state: StoreState) => state.theme)

    return (
        <div className="std-flex gap6">
            <Comp1/>
            <Comp2/>

            {theme}
        </div>
    )
})

function Comp1() {
    const [state, setState] = useStoreState((state: StoreState) => state)

    return (
        <div>
            <button
                onClick={() => {
                    setState({})
                }}
            >
                Reset
            </button>
        </div>
    )
}

function Comp2() {
    const [theme, setTheme] = useStoreState((state: StoreState) => state.theme)

    return (
        <div>
            <input
                type="checkbox"
                onChange={event => {
                    event.currentTarget.checked
                        ? setTheme(Theme.Dark)
                        : setTheme(Theme.Light)
                }}
            />
        </div>
    )
}

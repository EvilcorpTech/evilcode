import {useStore, useStoreDispatch, useStoreState} from '@eviljs/react/store-v4'
import {defineShowcase} from '@eviljs/reactx/showcase'
import {resetState, setState} from '~/store-v4/apis'
import {type StoreState} from '~/store/apis'
import {Theme} from '~/theme/apis'

export default defineShowcase('Store v4', (props) => {
    const [theme, dispatch] = useStore((state: StoreState) => state.theme)

    return (
        <div className="std-flex gap6">
            <Comp1/>
            <Comp2/>

            {theme}
        </div>
    )
})

function Comp1() {
    const dispatch = useStoreDispatch<StoreState>()

    return (
        <div>
            <button
                onClick={() => {
                    dispatch(resetState())
                }}
            >
                Reset
            </button>
        </div>
    )
}

function Comp2() {
    const theme = useStoreState((state: StoreState) => state.theme)
    const dispatch = useStoreDispatch<StoreState>()

    return (
        <div>
            <input
                type="checkbox"
                onChange={event => {
                    event.currentTarget.checked
                        ? dispatch(setState({theme: Theme.Dark}))
                        : dispatch(setState({theme: Theme.Light}))
                }}
            />
        </div>
    )
}

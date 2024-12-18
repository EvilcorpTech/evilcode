import {defineShowcase} from '@eviljs/reactx/showcase-v1/showcase.js'
import {DemoStore, useDemoStore} from '/store/store'
import {Theme} from '/theme/theme-apis'

export default defineShowcase('Store', (props) => {
    const theme = useDemoStore(state => state.theme)

    return (
        <div className="std-flex std-gap6">
            <Comp1/>
            <Comp2/>

            {theme}
        </div>
    )
})

function Comp1() {
    const {dispatch} = useDemoStore()

    return (
        <div>
            <button
                onClick={() => {
                    dispatch(DemoStore.Action.resetState())
                }}
            >
                Reset
            </button>
        </div>
    )
}

function Comp2() {
    const {dispatch} = useDemoStore()
    const theme = useDemoStore(state => state.theme)

    return (
        <div>
            <input
                type="checkbox"
                onChange={event => {
                    event.currentTarget.checked
                        ? dispatch(DemoStore.Action.setState({theme: Theme.Dark}))
                        : dispatch(DemoStore.Action.setState({theme: Theme.Light}))
                }}
            />
        </div>
    )
}

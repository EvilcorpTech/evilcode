import {CaseRoute, exact, MatchArg, SwitchRoute} from '@eviljs/react/router'
import {Showcase} from '@eviljs/reactx/showcase-v1/showcase.js'
import {NotFoundView} from '~/app-404/404-view'
import {HomeView} from '~/app-home/home-view'
import {ShowcaseEntries} from '~/app-showcase/all'
import {Header} from '~/ui-widgets/header'

export function RouterStatic(props: RouterStaticProps) {
    const {} = props

    return (
        <SwitchRoute fallback={<NotFoundView/>}>
            <CaseRoute is={[exact`/`, exact`/en`, exact`/it`]}>
                <HomeView/>
            </CaseRoute>
            <CaseRoute is={[exact`/en/showcase`, exact`/it/showcase`]}>
                <div>
                    <Header/>
                    <Showcase children={ShowcaseEntries}/>
                </div>
            </CaseRoute>
            <CaseRoute is={exact`/example/${MatchArg}`} children={id =>
                <div>
                    <Header/>
                    <h1>Route ID {id}</h1>
                </div>
            }/>
        </SwitchRoute>
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export interface RouterStaticProps {
}

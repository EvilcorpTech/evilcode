import {CaseRoute, SwitchRoute} from '@eviljs/react/router'
import type {VoidProps} from '@eviljs/react/type'
import {Showcase} from '@eviljs/reactx/showcase'
import {NotFoundView} from '~/app-404/404-view'
import {AdminView} from '~/app-admin/admin-view'
import {AuthView} from '~/app-auth/auth-view'
import {HomeView} from '~/app-home/home-view'
import ShowcaseIndex from '~/app-showcase/index'
import {RoutePath} from '~/route/route-paths'
import {AuthBarrier} from '~/ui-widgets/auth-barrier'
import {Header} from '~/ui-widgets/header'

export function RouterStatic(props: RouterStaticProps) {
    const {className, ...otherProps} = props

    return (
        <SwitchRoute fallback={<NotFoundView/>}>
            <CaseRoute is={RoutePath.Home.patterns}>
                <HomeView/>
            </CaseRoute>
            <CaseRoute is={RoutePath.Showcase.patterns}>
                <div>
                    <Header/>
                    <Showcase children={ShowcaseIndex}/>
                </div>
            </CaseRoute>
            <CaseRoute is={RoutePath.Admin.patterns}>
                <AuthBarrier>
                    <AdminView/>
                </AuthBarrier>
            </CaseRoute>
            <CaseRoute is={RoutePath.Auth.patterns}>
                <AuthView/>
            </CaseRoute>
            <CaseRoute is={RoutePath.ExampleWithArg.patterns} children={id =>
                <div>
                    <Header/>
                    <h1>Route ID {id}</h1>
                </div>
            }/>
        </SwitchRoute>
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export interface RouterStaticProps extends VoidProps<React.HTMLAttributes<HTMLElement>> {
}

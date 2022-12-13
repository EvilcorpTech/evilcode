import './portals.css'

import {Portal, Teleport} from '@eviljs/react/portals'
import {defineShowcase} from '@eviljs/reactx/showcase'

export default defineShowcase('Portals', (props) =>
    <div>
        <Portal name="title" tag="h1" className="std-color-primary-accent std-uppercase"/>

        <Teleport to="card">
            Lorem ipsum is simply dummy text of the printing and typesetting industry.
            Loren Ipsum has been the industries standard dummy text ever since the 1500s,
            when an unknown printer took a galley of type and scrambled it to make a type
            specimen book. It has survived not only five centuries, but also the leap into
            electronic typesetting, remaining essentially unchanged. It was popularized
            in the 1960s with the release of Letraset sheets containing Loren Ipsum passages,
            and more recently with desktop publishing software like Aldus PageMaker including
            versions of Loren Ipsum. Lorem Ipsum is simply dummy text of the printing and
            typesetting industry. Loren Ipsum has been the industries standard dummy text
            ever since the 1500s, when an unknown printer took a galley of type and
            scrambled it to make a type specimen book. It has survived not only five
            centuries, but also the leap into electronic typesetting, remaining essentially
            unchanged. It was popularized in the 1960s with the release of Letraset
            sheets containing Lorem Ipsum passages, and more recently with desktop
            publishing software like Aldus PageMaker including versions of Lorem Ipsum.
        </Teleport>

        <main className="main-b3bf">
            <div className="card-8a91 std-background-bg2 std-shadow4">
                <Teleport to="title">
                    Portals Example
                </Teleport>

                <Portal name="card" tag="p"/>
            </div>
        </main>
    </div>
)

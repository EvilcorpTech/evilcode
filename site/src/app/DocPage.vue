<script lang="ts">
    import {defineComponent, inject, ref, watchEffect} from 'vue'
    import {RouteService} from './App'
    import {createDoc} from './model'
    import * as Routes from ':/lib/routes'

    export default defineComponent({
        props: {
            id: {type: String, required: true},
        },

        setup(props, context) {
            const {id} = props
            const docRef = ref<null | Document>(null)
            const route = inject(RouteService)

            watchEffect((onInvalidate) => {
                fetch(`/assets/doc/${id}.xml`, {})
                .then(response => response.text())
                .then(createDoc)
                .then(doc => {
                    docRef.value = doc

                    // @ts-ignore
                    window.Doc = doc
                })
                .catch(() => {})
            })

            return {docRef, route}
        },
    })
</script>

<template>
    <main class="DocPage-2194 std-theme light std-cover-h std-flex std-color-back3">
        <nav class="head-7bd4 std-cover-v">
            <ul class="std-flex column">
                <li
                    v-for="(aPackage, idx) of docRef?.querySelectorAll('package')"
                    :key="idx"
                    class="package-group-7abf"
                >
                    <h2 class="package-name-c9eb std-flex between">
                        {{ aPackage.getAttribute('name') }}

                        <span class="package-id-4746">
                            @eviljs/{{ aPackage.getAttribute('name') }}
                        </span>
                    </h2>

                    <ul class="std-flex column">
                        <li
                            v-for="(aModule, idx) of aPackage.querySelectorAll('module')"
                            :key="idx"
                        >
                            <a :href="route.link('TODO')">
                                <h3 class="module-name-271d">
                                    {{ aModule.getAttribute('name') }}
                                </h3>
                            </a>
                        </li>
                    </ul>
                </li>
            </ul>
        </nav>

        <article class="body-cd02 std-color-back1 std-shadow z4">
            Lorem ipsum is simply dummy text of the printing and typesetting industry. Loren Ipsum has been the industries standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularized in the 1960s with the release of Letraset sheets containing Loren Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Loren Ipsum. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Loren Ipsum has been the industries standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularized in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
        </article>
    </main>
</template>

<style>
    .DocPage-2194 {
        padding: var(--view-gutter);
    }

    .head-7bd4 {
        min-width: 18rem;
        padding-top: var(--view-gutter);
    }

    .body-cd02 {
        flex-grow: 1;
        padding: var(--view-gutter);
    }

    .package-group-7abf {
        margin-bottom: var(--std-gutter-m);
    }

    .package-name-c9eb {
        font-size: var(--std-text-subtitle1-size);
        font-weight: var(--std-weight-bold);
        margin-bottom: var(--std-gutter-xxs);
        text-transform: uppercase;
    }
    .package-id-4746 {
        padding-left: var(--std-gutter-s);
        padding-right: var(--std-gutter-s);
        font-size: var(--std-text-body1-size);
        font-weight: var(--std-weight-regular);
        opacity: .6;
        text-transform: lowercase;
    }

    .module-name-271d {
        font-size: var(--std-text-subtitle1-size);
        margin-bottom: var(--std-gutter-xxs);
        padding-left: 1em;
    }
</style>

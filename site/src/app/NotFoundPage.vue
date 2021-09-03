<script lang="ts">
    import {defineComponent, inject} from 'vue'
    import * as Routes from ':/lib/routes'
    import {RouteService} from './App'

    export default defineComponent({
        setup(props, context) {
            const route = inject(RouteService)

            return {route}
        },
    })
</script>

<template>
    <main class="std-theme light std-cover-h std-flex">
       OPS. Not Found
    </main>
</template>

<style>
</style>

<script lang="ts">
    import {defineComponent, inject} from 'vue'
    import * as Routes from ':/lib/routes'
    import Logo from ':/lib/assets/logo-totem-light.svg'
    import {RouteService} from './App'
    import {Cards} from './model'

    export default defineComponent({
        setup(props, context) {
            const route = inject(RouteService)

            return {cards: Cards, Logo, route, Routes}
        },
    })
</script>

<template>
    <main class="std-theme light std-cover-h std-flex wrap">
        <div class="head-92dd std-flex column center align-center">
            <img
                class="logo-5c65"
                :src="Logo"
            />
            <i class="std-space-v maxi"></i>
            <h1 class="title-2d99">
                Evil<span>JS</span>
            </h1>
            <h3 class="subtitle-9614 std-uppercase">
                The companion <b>micro</b> library
            </h3>
        </div>

        <div class="body-e45c std-flex column center align-center">
            <nav class="std-flex column">
                <a
                    v-for="(it, idx) of cards"
                    :key="idx"
                    :class="['card-6d4b std-shadow z16', {disabled: it.disabled}]"
                    :href="it.disabled
                        ? null
                        : route?.link(Routes.DocRoute.path(it.id))
                    "
                    :style="{
                        backgroundImage: `url(${it.background})`,
                    }"
                >
                    <h2 class="title-b07c">
                        {{ it.title }}
                    </h2>
                    <h6 class="description-3d0b">
                        {{ it.description }}
                    </h6>
                </a>
            </nav>
        </div>
    </main>
</template>

<style>
    .head-92dd {
        flex-grow: 2;
        padding: var(--view-gutter);
    }

    .body-e45c {
        max-width: 60rem;
        flex-grow: 1;
        border-left: 8px solid hsl(50deg 100% 44%);
        padding: var(--view-gutter);
        background-color: hsl(50deg 100% 5%);
    }

    .logo-5c65 {
        width: auto;
        height: 14rem;
    }

    .title-2d99 {
        font-size: var(--std-text-display1-size);
        line-height: 1;
    }
    .title-2d99 span {
        color: var(--std-color-primary-accent);
    }

    .subtitle-9614 {
        font-size: var(--std-text-subtitle2-size);
        font-weight: var(--std-weight-thin);
        letter-spacing: 0.25em;
    }

    .card-6d4b {
        position: relative;
        margin-top: var(--std-gutter-xxs);
        margin-bottom: var(--std-gutter-xxs);
        /* border-radius: var(--std-radius-xs); */
        padding: var(--std-gutter-m);
        font-weight: var(--std-weight-medium);
        background-color: var(--std-color-back1);
        background-repeat: no-repeat;
        background-position: 10rem 130%;
        background-size: 100%;
        overflow: hidden;
    }
    .card-6d4b.disabled {
        border: 1px solid white;
        cursor: default;
        color: white;
        background-color: transparent;
    }
    /*
    .card-6d4b::after {
        z-index: 0;
        content: '';
        position: absolute;
        display: block;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-image: linear-gradient(to bottom, hsla(0deg 0% 100% / 0) 0%, hsla(0deg 0% 100% / 1) 100%);
    }
    .card-6d4b > * {
        position: relative;
        z-index: 1;
    }
    */

    .title-b07c,
    .description-3d0b {
        transition: all var(--std-duration-normal);
    }

    .card-6d4b:hover .title-b07c {
        color: var(--std-color-primary-accent);
    }

    .description-3d0b {
        max-width: 24rem;
        opacity: 0;
        transition: all var(--std-duration-normal);
        transform: translateY(2rem);
    }
    .card-6d4b:hover .description-3d0b {
        opacity: 1;
        transform: translateY(0);
    }

    @media (max-width: 399px) {
        .title-b07c {
            color: var(--std-color-primary-accent);
        }
        .description-3d0b {
            opacity: 1;
            transform: translateY(0);
        }
    }
</style>
